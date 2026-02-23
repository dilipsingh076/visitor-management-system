/**
 * Push notification service using Firebase Cloud Messaging.
 */
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

const FCM_TOKEN_KEY = 'vms_fcm_token';

export interface NotificationData {
  title?: string;
  body?: string;
  visitId?: string;
  type?: 'visitor_arrived' | 'visit_approved' | 'visit_rejected' | 'checkout_reminder';
}

type NotificationHandler = (notification: NotificationData) => void;
let notificationHandler: NotificationHandler | null = null;

export function setNotificationHandler(handler: NotificationHandler) {
  notificationHandler = handler;
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted');
      await registerForPushNotifications();
    } else {
      console.log('Notification permission denied');
    }

    return enabled;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    await messaging().registerDeviceForRemoteMessages();
    
    const token = await messaging().getToken();
    
    if (token) {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      console.log('FCM Token:', token);
      
      // TODO: Send token to backend
      // await apiClient.post('/notifications/register-device', { token, platform: Platform.OS });
    }

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(FCM_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setupNotificationListeners() {
  messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('Foreground notification:', remoteMessage);
    
    const notification: NotificationData = {
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      visitId: remoteMessage.data?.visitId as string,
      type: remoteMessage.data?.type as NotificationData['type'],
    };
    
    if (notificationHandler) {
      notificationHandler(notification);
    } else {
      Alert.alert(
        notification.title || 'Notification',
        notification.body || '',
        [{ text: 'OK' }]
      );
    }
  });

  messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('App opened from notification:', remoteMessage);
    
    const notification: NotificationData = {
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      visitId: remoteMessage.data?.visitId as string,
      type: remoteMessage.data?.type as NotificationData['type'],
    };
    
    if (notificationHandler) {
      notificationHandler(notification);
    }
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        console.log('App opened from quit state:', remoteMessage);
        
        const notification: NotificationData = {
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          visitId: remoteMessage.data?.visitId as string,
          type: remoteMessage.data?.type as NotificationData['type'],
        };
        
        if (notificationHandler) {
          notificationHandler(notification);
        }
      }
    });

  messaging().onTokenRefresh(async (token: string) => {
    console.log('FCM Token refreshed:', token);
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    // TODO: Update token on backend
  });
}

export async function subscribeToTopic(topic: string): Promise<void> {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Error subscribing to topic ${topic}:`, error);
  }
}

export async function unsubscribeFromTopic(topic: string): Promise<void> {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error(`Error unsubscribing from topic ${topic}:`, error);
  }
}
