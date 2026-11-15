import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Store } from '../types/queue';
import { DEFAULT_STORE_ID, getLocalStore, saveLocalStore, mockBus, initialDefaultStore } from './mockStorage';

export const getStoreDetails = async (storeId: string = DEFAULT_STORE_ID): Promise<Store> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (error) {
        console.warn('Supabase store fetch error, falling back to local:', error.message);
        return getLocalStore(storeId);
      }
      return data as Store;
    } catch (err) {
      console.warn('Error fetching store from Supabase, using local:', err);
      return getLocalStore(storeId);
    }
  }

  return getLocalStore(storeId);
};

export const updateStoreSettings = async (
  storeId: string = DEFAULT_STORE_ID,
  updates: Partial<Store>
): Promise<Store> => {
  const current = await getStoreDetails(storeId);
  const updatedStore: Store = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      // Also update local copy
      saveLocalStore(data as Store);
      return data as Store;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memperbarui pengaturan di Supabase';
      console.warn('Supabase store update error:', errorMsg);
      saveLocalStore(updatedStore);
      return updatedStore;
    }
  }

  saveLocalStore(updatedStore);
  return updatedStore;
};

export const subscribeToStoreChanges = (
  storeId: string = DEFAULT_STORE_ID,
  callback: (store: Store) => void
): (() => void) => {
  if (isSupabaseConfigured() && supabase) {
    const client = supabase;
    const channel = client
      .channel(`store_changes_${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stores',
          filter: `id=eq.${storeId}`,
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as Store);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }

  // Local fallback subscription
  const unsubscribe = mockBus.subscribe((event) => {
    if (event.type === 'STORE_UPDATED' || event.type === 'SYNC_UPDATE') {
      callback(getLocalStore(storeId));
    }
  });

  return unsubscribe;
};
