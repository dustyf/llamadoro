import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CHANNEL_ID = 'llamadoro-timer';

// Called once at app startup (in _layout.tsx). Sets the Android notification
// channel and configures foreground notification behavior.
export async function setupNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Timer Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

// Request notification permissions. Called on first session start, not at
// launch. Returns true if granted.
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return status === 'granted';
}

// Returns current permission status without prompting.
export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// Schedule a local notification at a specific timestamp (ms since epoch).
// Returns the notification identifier, or null if scheduling failed.
export async function scheduleTimerNotification(
  endTimestamp: number,
  phase: 'work' | 'shortBreak' | 'longBreak',
): Promise<string | null> {
  const title = phase === 'work' ? 'Session complete!' : 'Break over — back to work!';
  const body =
    phase === 'work'
      ? 'Your llama is proud. Time for a break.'
      : 'Your llama is ready. Time to focus.';

  const triggerDate = new Date(endTimestamp);

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return id;
  } catch {
    return null;
  }
}

// Cancel a scheduled notification by its identifier.
export async function cancelTimerNotification(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}
