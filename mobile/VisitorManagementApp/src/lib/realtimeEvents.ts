import { DeviceEventEmitter } from 'react-native';

/** Fired when notification WS connects/reconnects or a `notification` event is received (matches web invalidate). */
export const NOTIFICATION_REALTIME_EVENT = 'vms_notification_realtime';

export function emitNotificationRealtime(): void {
  DeviceEventEmitter.emit(NOTIFICATION_REALTIME_EVENT);
}
