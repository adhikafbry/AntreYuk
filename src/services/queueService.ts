import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { QueueItem, QueueStatus, QueueStats, CustomerQueueDetail, Store } from '../types/queue';
import { 
  DEFAULT_STORE_ID, 
  getLocalQueues, 
  saveLocalQueues, 
  getLocalStore, 
  computeQueueStats, 
  mockBus 
} from './mockStorage';
import { getStoreDetails } from './storeService';

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

export const getPublicQueueStats = async (storeId: string = DEFAULT_STORE_ID): Promise<QueueStats> => {
  const store = await getStoreDetails(storeId);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.rpc('get_public_store_stats', { p_store_id: storeId });
      if (!error && data) {
        return {
          total_today: data.total_today || 0,
          waiting: data.waiting_count || 0,
          serving: data.current_serving_number ? 1 : 0,
          completed: data.completed_count || 0,
          cancelled: 0,
          skipped: 0,
          current_serving_number: data.current_serving_number || null,
          next_queue_number: null,
          estimated_wait_time: data.estimated_wait_time || 0,
        };
      }
    } catch (err) {
      console.warn('RPC failed, falling back to query or local:', err);
    }
  }

  // Local fallback
  const queues = getLocalQueues(storeId);
  return computeQueueStats(queues, store);
};

export const takeNewQueueNumber = async (
  storeId: string = DEFAULT_STORE_ID,
  customerName: string,
  customerPhone: string
): Promise<{ queue: QueueItem; store: Store }> => {
  const store = await getStoreDetails(storeId);

  // Validasi toko
  if (!store.is_open) {
    throw new Error('Mohon maaf, toko saat ini sedang tutup. Silakan kembali pada jam operasional.');
  }

  if (!store.accepting_queue) {
    throw new Error('Penerimaan nomor antrean sedang ditangguhkan sementara oleh pengelola.');
  }

  const today = getTodayDateStr();

  // Try Supabase first if available
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.rpc('take_queue_number', {
        p_store_id: storeId,
        p_customer_name: customerName.trim(),
        p_customer_phone: customerPhone.trim(),
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.length > 0) {
        const item = data[0];
        const newQueue: QueueItem = {
          id: item.id,
          store_id: storeId,
          queue_number: item.queue_number,
          queue_sequence: item.queue_sequence,
          queue_date: today,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          access_token: item.access_token,
          status: 'waiting',
          created_at: item.created_at,
          updated_at: item.created_at,
        };
        return { queue: newQueue, store };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal mengambil antrean di Supabase';
      console.warn('Supabase take_queue_number RPC error, trying fallback:', errorMsg);
      if (err instanceof Error && err.message.includes('Batas')) {
        throw err;
      }
    }
  }

  // Local Atomic-like Sequential Number Generator
  const currentQueues = getLocalQueues(storeId);
  const todayQueues = currentQueues.filter((q) => q.queue_date === today);

  if (todayQueues.length >= store.daily_queue_limit) {
    throw new Error(`Batas maksimal antrean harian (${store.daily_queue_limit} tiket) telah tercapai.`);
  }

  const maxSeq = todayQueues.reduce((max, q) => Math.max(max, q.queue_sequence || 0), 0);
  const nextSeq = maxSeq + 1;
  const queueNumber = `A-${String(nextSeq).padStart(3, '0')}`;
  const accessToken = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const nowStr = new Date().toISOString();
  const newQueue: QueueItem = {
    id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    store_id: storeId,
    queue_number: queueNumber,
    queue_sequence: nextSeq,
    queue_date: today,
    customer_name: customerName.trim(),
    customer_phone: customerPhone.trim(),
    access_token: accessToken,
    status: 'waiting',
    created_at: nowStr,
    updated_at: nowStr,
  };

  const updatedQueues = [...currentQueues, newQueue];
  saveLocalQueues(storeId, updatedQueues);

  return { queue: newQueue, store };
};

export const getCustomerQueueDetail = async (accessToken: string): Promise<CustomerQueueDetail | null> => {
  let queue: QueueItem | null = null;
  let store: Store | null = null;
  let allQueues: QueueItem[] = [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('access_token', accessToken)
        .single();

      if (!error && data) {
        queue = data as QueueItem;
        store = await getStoreDetails(queue.store_id);

        // Fetch today's queues to calculate position safely
        const { data: todayData } = await supabase
          .from('queues')
          .select('id, queue_number, queue_sequence, status, created_at, queue_date')
          .eq('store_id', queue.store_id)
          .eq('queue_date', queue.queue_date);

        if (todayData) {
          allQueues = todayData as QueueItem[];
        }
      }
    } catch (err) {
      console.warn('Error fetching customer queue from Supabase:', err);
    }
  }

  // Fallback to local
  if (!queue) {
    const localQueues = getLocalQueues();
    queue = localQueues.find((q) => q.access_token === accessToken) || null;
    if (queue) {
      store = await getStoreDetails(queue.store_id);
      allQueues = localQueues.filter((q) => q.store_id === queue?.store_id && q.queue_date === queue?.queue_date);
    }
  }

  if (!queue || !store) {
    return null;
  }

  // Calculate position ahead of this queue
  // Active ahead: queues created before this one on the same day that are still 'waiting'
  const activeWaitingAhead = allQueues.filter((q) => {
    return (
      q.status === 'waiting' &&
      q.id !== queue?.id &&
      new Date(q.created_at).getTime() < new Date(queue!.created_at).getTime()
    );
  }).length;

  const currentServingQueue = allQueues.find((q) => q.status === 'serving') || allQueues.find((q) => q.status === 'called');
  const isCurrentlyServingSomeoneElse = currentServingQueue && currentServingQueue.id !== queue.id;

  // Estimated wait time in minutes
  // If customer is already called or serving, wait time is 0
  let estimatedWaitMinutes = 0;
  if (queue.status === 'waiting') {
    const unitsAhead = activeWaitingAhead + (isCurrentlyServingSomeoneElse ? 1 : 0);
    estimatedWaitMinutes = unitsAhead * (store.average_service_duration || 5);
  }

  const totalWaitingToday = allQueues.filter((q) => q.status === 'waiting').length;

  return {
    queue,
    store,
    position_in_front: queue.status === 'waiting' ? activeWaitingAhead : 0,
    estimated_wait_minutes: estimatedWaitMinutes,
    current_serving_number: currentServingQueue ? currentServingQueue.queue_number : null,
    total_waiting_today: totalWaitingToday,
  };
};

export const cancelCustomerQueue = async (accessToken: string): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('queues')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('access_token', accessToken);

      if (!error) return true;
    } catch (err) {
      console.warn('Supabase cancel failed, trying local:', err);
    }
  }

  const queues = getLocalQueues();
  const index = queues.findIndex((q) => q.access_token === accessToken);
  if (index !== -1) {
    queues[index].status = 'cancelled';
    queues[index].updated_at = new Date().toISOString();
    saveLocalQueues(queues[index].store_id, queues);
    return true;
  }

  return false;
};

// ==================== ADMIN QUEUE OPERATIONS ====================

export const getAdminQueues = async (
  storeId: string = DEFAULT_STORE_ID,
  selectedDate: string = getTodayDateStr()
): Promise<QueueItem[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('store_id', storeId)
        .eq('queue_date', selectedDate)
        .order('queue_sequence', { ascending: true });

      if (!error && data) {
        return data as QueueItem[];
      }
    } catch (err) {
      console.warn('Error fetching admin queues from Supabase:', err);
    }
  }

  const queues = getLocalQueues(storeId);
  return queues
    .filter((q) => q.queue_date === selectedDate)
    .sort((a, b) => a.queue_sequence - b.queue_sequence);
};

export const callNextWaitingQueue = async (storeId: string = DEFAULT_STORE_ID): Promise<QueueItem | null> => {
  const queues = await getAdminQueues(storeId, getTodayDateStr());
  const nextWaiting = queues.find((q) => q.status === 'waiting');

  if (!nextWaiting) {
    return null;
  }

  return updateQueueStatus(nextWaiting.id, 'called', storeId);
};

export const updateQueueStatus = async (
  queueId: string,
  newStatus: QueueStatus,
  storeId: string = DEFAULT_STORE_ID
): Promise<QueueItem> => {
  const nowStr = new Date().toISOString();
  const updatePayload: Partial<QueueItem> = {
    status: newStatus,
    updated_at: nowStr,
  };

  if (newStatus === 'called') {
    updatePayload.called_at = nowStr;
  } else if (newStatus === 'serving') {
    updatePayload.serving_at = nowStr;
  } else if (newStatus === 'completed') {
    updatePayload.completed_at = nowStr;
  }

  // Rule: Single serving counter protection
  // If moving to 'serving', complete or update any existing queue currently in 'serving'
  if (newStatus === 'serving') {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('queues')
          .update({
            status: 'completed',
            completed_at: nowStr,
            updated_at: nowStr,
          })
          .eq('store_id', storeId)
          .eq('queue_date', getTodayDateStr())
          .eq('status', 'serving')
          .neq('id', queueId);
      } catch (err) {
        console.warn('Error auto-completing previous serving queue in Supabase:', err);
      }
    }
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('queues')
        .update(updatePayload)
        .eq('id', queueId)
        .select()
        .single();

      if (!error && data) {
        // Also update local store
        const local = getLocalQueues(storeId);
        const idx = local.findIndex((q) => q.id === queueId);
        if (idx !== -1) {
          local[idx] = data as QueueItem;
          saveLocalQueues(storeId, local);
        }
        return data as QueueItem;
      }
    } catch (err) {
      console.warn('Supabase update status failed, using local:', err);
    }
  }

  // Local update
  const queues = getLocalQueues(storeId);
  const today = getTodayDateStr();

  // If setting to serving, auto-complete any existing serving queue
  if (newStatus === 'serving') {
    queues.forEach((q) => {
      if (q.queue_date === today && q.status === 'serving' && q.id !== queueId) {
        q.status = 'completed';
        q.completed_at = nowStr;
        q.updated_at = nowStr;
      }
    });
  }

  const targetIdx = queues.findIndex((q) => q.id === queueId);
  if (targetIdx === -1) {
    throw new Error('Antrean tidak ditemukan.');
  }

  const updatedItem: QueueItem = {
    ...queues[targetIdx],
    ...updatePayload,
  };

  queues[targetIdx] = updatedItem;
  saveLocalQueues(storeId, queues);
  return updatedItem;
};

// Realtime subscriptions
export const subscribeToQueueUpdates = (
  storeId: string = DEFAULT_STORE_ID,
  callback: (event: { type: string; payload?: unknown }) => void
): (() => void) => {
  if (isSupabaseConfigured() && supabase) {
    const client = supabase;
    const channel = client
      .channel(`queues_realtime_${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queues',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          callback({ type: 'SUPABASE_REALTIME', payload });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }

  // Local reactive subscription via BroadcastChannel
  return mockBus.subscribe((event) => {
    if (event.type === 'QUEUES_UPDATED' || event.type === 'SYNC_UPDATE') {
      callback(event);
    }
  });
};
