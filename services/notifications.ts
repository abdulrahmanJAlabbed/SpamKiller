/**
 * FCM / Push Notification Service
 * Uses expo-notifications with hooks for Firebase Cloud Messaging.
 * Includes separate channels for security alerts and silenced spam.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are presented when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        const channelId = notification.request.content.data?.channelId as string | undefined;

        // If it's a silenced spam notification, don't show alert or play sound
        if (channelId === 'spam-silenced') {
            return {
                shouldShowAlert: false,
                shouldPlaySound: false,
                shouldSetBadge: true,
                shouldShowBanner: false,
                shouldShowList: true,
            };
        }

        // Default: show everything
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        };
    },
});

/**
 * Request notification permissions and get the push token.
 * Also sets up Android notification channels.
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

        // Android notification channels
        if (Platform.OS === 'android') {
            // Main alerts channel — full sound/vibration
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Shield OS Alerts',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#935af6',
            });

            // Spam silenced channel — NO sound, NO vibration
            await Notifications.setNotificationChannelAsync('spam-silenced', {
                name: 'Silenced Spam',
                description: 'Spam messages that were auto-silenced',
                importance: Notifications.AndroidImportance.LOW,
                vibrationPattern: [0],
                enableVibrate: false,
                sound: undefined, // no sound
                lightColor: '#ef4444',
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
 * Fire a silent notification for a spam message (Android).
 * Shows in the notification shade but no sound/vibration.
 */
export async function notifySpamSilenced(sender: string, preview: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🛡️ Spam Silenced',
            body: `${sender}: ${preview.substring(0, 80)}${preview.length > 80 ? '...' : ''}`,
            data: { channelId: 'spam-silenced', type: 'spam-silenced' },
            sound: false,
            priority: Notifications.AndroidNotificationPriority.LOW,
        },
        trigger: null, // fire immediately
    });
}

/**
 * Fire a regular alert notification.
 */
export async function notifyAlert(title: string, body: string, data?: Record<string, any>): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data: { channelId: 'default', ...data },
            sound: true,
        },
        trigger: null,
    });
}

/**
 * Set up listeners for incoming notifications.
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
