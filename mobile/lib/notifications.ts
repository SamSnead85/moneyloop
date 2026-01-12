import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Push notification token
let expoPushToken: string | null = null;

// Initialize push notifications
export async function initPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
        console.warn('Push notifications require a physical device');
        return null;
    }

    // Check permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('Push notification permission denied');
        return null;
    }

    // Get push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    const token = await Notifications.getExpoPushTokenAsync({
        projectId,
    });

    expoPushToken = token.data;

    // Configure Android channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#7dd3a8',
        });

        await Notifications.setNotificationChannelAsync('tasks', {
            name: 'Task Updates',
            importance: Notifications.AndroidImportance.HIGH,
            description: 'Notifications about task assignments and updates',
        });
    }

    // Save token to database
    await saveTokenToDatabase(expoPushToken);

    return expoPushToken;
}

// Save push token to user's profile
async function saveTokenToDatabase(token: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from('profiles')
        .update({
            push_token: token,
            push_token_updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
}

// Notification types
export type NotificationType =
    | 'task_assigned'
    | 'task_claimed'
    | 'task_completed'
    | 'task_overdue'
    | 'member_joined'
    | 'bill_due';

export interface NotificationPayload {
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
}

// Listen for incoming notifications
export function addNotificationListener(
    callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
}

// Listen for notification taps
export function addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

// Schedule a local notification
export async function scheduleLocalNotification(
    payload: NotificationPayload,
    trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
    return Notifications.scheduleNotificationAsync({
        content: {
            title: payload.title,
            body: payload.body,
            data: { type: payload.type, ...payload.data },
            sound: true,
        },
        trigger: trigger || null, // null = immediate
    });
}

// Schedule a task due reminder
export async function scheduleTaskReminder(
    taskId: string,
    taskTitle: string,
    dueDate: Date
): Promise<string | null> {
    // Schedule reminder 1 hour before due
    const reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000);

    if (reminderTime <= new Date()) {
        return null; // Already past
    }

    return scheduleLocalNotification(
        {
            type: 'task_overdue',
            title: 'Task Due Soon',
            body: `"${taskTitle}" is due in 1 hour`,
            data: { taskId },
        },
        { date: reminderTime }
    );
}

// Cancel a scheduled notification
export async function cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
}

// Clear badge
export async function clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
}

// Get the current push token
export function getPushToken(): string | null {
    return expoPushToken;
}
