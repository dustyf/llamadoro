import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import type { Href } from 'expo-router';
import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useAppStateReconcile } from '@/hooks/use-app-state-reconcile';
import { setupNotifications } from '@/lib/notifications';
import { preloadSounds } from '@/lib/sound';
import { useLlamasStore } from '@/stores/llamas';
import { useSettingsStore } from '@/stores/settings';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pendingUnlockIds = useLlamasStore((state) => state.pendingUnlockIds);
  const pathname = usePathname();

  useAppStateReconcile();

  useEffect(() => {
    setupNotifications();
    preloadSounds();
    if (!useSettingsStore.getState().hasCompletedOnboarding) {
      router.replace('/onboarding' as Href);
    }
  }, []);

  useEffect(() => {
    if (pendingUnlockIds.length > 0 && pathname !== '/unlock') {
      router.push('/unlock');
    }
  }, [pathname, pendingUnlockIds.length]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
