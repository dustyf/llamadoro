import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

// Tracks notification permission status and refreshes when the app returns
// to the foreground (user may have changed it in Settings).
export function useNotificationPermission(): {
  status: NotificationPermissionStatus;
  openSettings: () => void;
} {
  const [status, setStatus] = useState<NotificationPermissionStatus>('undetermined');

  async function refresh() {
    const { status: s } = await Notifications.getPermissionsAsync();
    setStatus(s === 'granted' ? 'granted' : s === 'denied' ? 'denied' : 'undetermined');
  }

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });
    return () => sub.remove();
  }, []);

  function openSettings() {
    Linking.openSettings();
  }

  return { status, openSettings };
}
