/**
 * Offline storage and sync service for mobile app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { apiClient } from '../config/api';

const OFFLINE_QUEUE_KEY = 'vms_offline_queue';
const CACHED_DATA_KEY = 'vms_cached_data';

interface QueuedAction {
  id: string;
  type: 'create_visit' | 'checkin' | 'checkout' | 'approve';
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  data: unknown;
  timestamp: number;
  retries: number;
}

interface CachedData {
  visits: unknown[];
  dashboard: unknown;
  lastSync: number;
}

let isOnline = true;
let syncInProgress = false;

export function initializeOfflineSupport() {
  NetInfo.addEventListener((state: NetInfoState) => {
    const wasOffline = !isOnline;
    isOnline = state.isConnected ?? false;
    
    if (wasOffline && isOnline) {
      console.log('Back online - syncing queued actions');
      syncQueuedActions();
    }
  });
}

export async function isNetworkAvailable(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

export async function queueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  try {
    const queue = await getQueue();
    const newAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };
    
    queue.push(newAction);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log('Action queued for offline sync:', newAction.type);
  } catch (error) {
    console.error('Error queuing action:', error);
  }
}

async function getQueue(): Promise<QueuedAction[]> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedAction[]): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export async function syncQueuedActions(): Promise<void> {
  if (syncInProgress || !(await isNetworkAvailable())) {
    return;
  }

  syncInProgress = true;
  console.log('Starting offline sync...');

  try {
    const queue = await getQueue();
    const remaining: QueuedAction[] = [];

    for (const action of queue) {
      try {
        let response;
        
        switch (action.method) {
          case 'POST':
            response = await apiClient.post(action.endpoint, action.data);
            break;
          case 'PUT':
            response = await apiClient.put(action.endpoint, action.data);
            break;
          case 'PATCH':
            response = await apiClient.patch(action.endpoint, action.data);
            break;
        }

        if (response.error) {
          throw new Error(response.error);
        }

        console.log('Synced action:', action.type, action.id);
      } catch (error) {
        console.error('Failed to sync action:', action.type, error);
        
        action.retries += 1;
        if (action.retries < 3) {
          remaining.push(action);
        } else {
          console.warn('Action dropped after 3 retries:', action.type);
        }
      }
    }

    await saveQueue(remaining);
    console.log('Offline sync complete. Remaining:', remaining.length);
  } finally {
    syncInProgress = false;
  }
}

export async function cacheData(key: keyof CachedData, data: unknown): Promise<void> {
  try {
    const cached = await getCachedData();
    cached[key] = data as CachedData[keyof CachedData];
    cached.lastSync = Date.now();
    await AsyncStorage.setItem(CACHED_DATA_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

async function getCachedData(): Promise<CachedData> {
  try {
    const data = await AsyncStorage.getItem(CACHED_DATA_KEY);
    return data ? JSON.parse(data) : { visits: [], dashboard: null, lastSync: 0 };
  } catch {
    return { visits: [], dashboard: null, lastSync: 0 };
  }
}

export async function getCached<T>(key: keyof Omit<CachedData, 'lastSync'>): Promise<T | null> {
  try {
    const cached = await getCachedData();
    return (cached[key] as T) || null;
  } catch {
    return null;
  }
}

export async function getLastSyncTime(): Promise<number> {
  const cached = await getCachedData();
  return cached.lastSync;
}

export async function clearOfflineData(): Promise<void> {
  await AsyncStorage.multiRemove([OFFLINE_QUEUE_KEY, CACHED_DATA_KEY]);
}

export async function getQueueCount(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}
