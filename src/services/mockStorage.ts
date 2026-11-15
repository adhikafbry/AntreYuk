import { Store, QueueItem, QueueStatus, QueueStats } from '../types/queue';

const STORAGE_STORE_KEY = 'antreyuk_store_data';
const STORAGE_QUEUES_KEY = 'antreyuk_queues_data';
const REALTIME_CHANNEL_NAME = 'antreyuk_realtime_bus';

export const DEFAULT_STORE_ID = '00000000-0000-0000-0000-000000000001';

export const initialDefaultStore: Store = {
  id: DEFAULT_STORE_ID,
  name: 'Apotek AntreYuk Sehat',
  description: 'Layanan farmasi dan konsultasi resep obat cepat, higienis, dan terpercaya.',
  address: 'Jl. Kesehatan Raya No. 45, Jakarta Pusat',
  phone: '0812-3456-7890',
  opening_time: '08:00',
  closing_time: '21:00',
  is_open: true,
  average_service_duration: 5,
  daily_queue_limit: 150,
  accepting_queue: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Seed initial queues for a lively, realistic preview
const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const initialDefaultQueues: QueueItem[] = [
  {
    id: 'mock-q-001',
    store_id: DEFAULT_STORE_ID,
    queue_number: 'A-001',
    queue_sequence: 1,
    queue_date: getTodayDateStr(),
    customer_name: 'Budi Santoso',
    customer_phone: '081234567891',
    access_token: 'token-mock-001',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    called_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    serving_at: new Date(Date.now() - 3600000 * 1.7).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 'mock-q-002',
    store_id: DEFAULT_STORE_ID,
    queue_number: 'A-002',
    queue_sequence: 2,
    queue_date: getTodayDateStr(),
    customer_name: 'Siti Rahmawati',
    customer_phone: '081398765432',
    access_token: 'token-mock-002',
    status: 'serving',
    created_at: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    called_at: new Date(Date.now() - 600000).toISOString(),
    serving_at: new Date(Date.now() - 300000).toISOString(),
    completed_at: null,
    updated_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'mock-q-003',
    store_id: DEFAULT_STORE_ID,
    queue_number: 'A-003',
    queue_sequence: 3,
    queue_date: getTodayDateStr(),
    customer_name: 'Ahmad Fauzi',
    customer_phone: '085712349988',
    access_token: 'token-mock-003',
    status: 'waiting',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    called_at: null,
    serving_at: null,
    completed_at: null,
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'mock-q-004',
    store_id: DEFAULT_STORE_ID,
    queue_number: 'A-004',
    queue_sequence: 4,
    queue_date: getTodayDateStr(),
    customer_name: 'Dewi Lestari',
    customer_phone: '081822334455',
    access_token: 'token-mock-004',
    status: 'waiting',
    created_at: new Date(Date.now() - 900000).toISOString(),
    called_at: null,
    serving_at: null,
    completed_at: null,
    updated_at: new Date(Date.now() - 900000).toISOString(),
  }
];

class MockStorageBus {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<(event: { type: string; payload?: unknown }) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(REALTIME_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch {
        // BroadcastChannel fallback to window events
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_QUEUES_KEY || e.key === STORAGE_STORE_KEY) {
          this.notifyListeners({ type: 'SYNC_UPDATE', payload: e.key });
        }
      });
    }
  }

  public subscribe(callback: (event: { type: string; payload?: unknown }) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public broadcast(event: { type: string; payload?: unknown }) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(event);
    }
    this.notifyListeners(event);
  }

  private notifyListeners(event: { type: string; payload?: unknown }) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in listener:', err);
      }
    });
  }
}

export const mockBus = new MockStorageBus();

// Store helpers
export const getLocalStore = (storeId: string = DEFAULT_STORE_ID): Store => {
  if (typeof window === 'undefined') return initialDefaultStore;
  try {
    const raw = localStorage.getItem(`${STORAGE_STORE_KEY}_${storeId}`);
    if (raw) return JSON.parse(raw);
    saveLocalStore(initialDefaultStore);
    return initialDefaultStore;
  } catch {
    return initialDefaultStore;
  }
};

export const saveLocalStore = (store: Store): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_STORE_KEY}_${store.id}`, JSON.stringify(store));
    mockBus.broadcast({ type: 'STORE_UPDATED', payload: store });
  } catch (e) {
    console.error('Error saving store data locally:', e);
  }
};

// Queue helpers
export const getLocalQueues = (storeId: string = DEFAULT_STORE_ID): QueueItem[] => {
  if (typeof window === 'undefined') return initialDefaultQueues;
  try {
    const raw = localStorage.getItem(`${STORAGE_QUEUES_KEY}_${storeId}`);
    if (raw) return JSON.parse(raw);
    saveLocalQueues(storeId, initialDefaultQueues);
    return initialDefaultQueues;
  } catch {
    return initialDefaultQueues;
  }
};

export const saveLocalQueues = (storeId: string = DEFAULT_STORE_ID, queues: QueueItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_QUEUES_KEY}_${storeId}`, JSON.stringify(queues));
    mockBus.broadcast({ type: 'QUEUES_UPDATED', payload: queues });
  } catch (e) {
    console.error('Error saving queues data locally:', e);
  }
};

// Compute aggregate stats
export const computeQueueStats = (queues: QueueItem[], store: Store, dateStr: string = getTodayDateStr()): QueueStats => {
  const todayQueues = queues.filter((q) => q.queue_date === dateStr);

  const waitingQueues = todayQueues.filter((q) => q.status === 'waiting');
  const servingQueue = todayQueues.find((q) => q.status === 'serving') || todayQueues.find((q) => q.status === 'called');
  const completedQueues = todayQueues.filter((q) => q.status === 'completed');
  const cancelledQueues = todayQueues.filter((q) => q.status === 'cancelled');
  const skippedQueues = todayQueues.filter((q) => q.status === 'skipped');

  const nextWaiting = waitingQueues[0];

  return {
    total_today: todayQueues.length,
    waiting: waitingQueues.length,
    serving: todayQueues.filter((q) => q.status === 'serving' || q.status === 'called').length,
    completed: completedQueues.length,
    cancelled: cancelledQueues.length,
    skipped: skippedQueues.length,
    current_serving_number: servingQueue ? servingQueue.queue_number : null,
    next_queue_number: nextWaiting ? nextWaiting.queue_number : null,
    estimated_wait_time: waitingQueues.length * (store.average_service_duration || 5),
  };
};

