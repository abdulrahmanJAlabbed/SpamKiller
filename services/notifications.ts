/**
 * FCM / Push Notification Service
 * Uses expo-notifications with hooks for Firebase Cloud Messaging.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are presented when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions and get the push token.
 * Returns the Expo push token string or null if permissions denied.
 */
export async function registerForPushNotifications(): Promise<string | null> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Push notification permission not granted');
            return null;
        }

        // For Android, set up the notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Shield OS Alerts',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#935af6',
            });
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        console.log('Push token:', tokenData.data);
        return tokenData.data;
    } catch (error) {
        console.error('Failed to register for push notifications:', error);
        return null;
    }
}

/**
 * Set up listeners for incoming notifications (foreground + tap responses).
 * Returns a cleanup function to remove the listeners.
 */
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void,
) {
    const receivedSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
            console.log('Notification received:', notification.request.content.title);
            onNotificationReceived?.(notification);
        },
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            console.log('Notification tapped:', response.notification.request.content.title);
            onNotificationResponse?.(response);
        },
    );

    return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
    };
}

/**
 * TODO: Firebase Cloud Messaging integration
 * When using a native build with @react-native-firebase/messaging:
 *
 * import messaging from '@react-native-firebase/messaging';
 *
 * export async function getFCMToken() {
 *   const token = await messaging().getToken();
 *   return token;
 * }
 *
 * export function onFCMMessage(handler: (message: any) => void) {
 *   return messaging().onMessage(handler);
 * }
 */
