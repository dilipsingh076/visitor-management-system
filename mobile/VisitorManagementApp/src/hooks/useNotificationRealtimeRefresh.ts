import { useEffect, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { NOTIFICATION_REALTIME_EVENT } from '../lib/realtimeEvents';

/** Re-runs callback when the notifications WebSocket signals new data (same idea as web React Query invalidation). */
export function useNotificationRealtimeRefresh(onRefresh: () => void): void {
  const ref = useRef(onRefresh);
  ref.current = onRefresh;

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      NOTIFICATION_REALTIME_EVENT,
      () => {
        ref.current();
      },
    );
    return () => sub.remove();
  }, []);
}
