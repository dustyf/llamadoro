import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useAppStateReconcile } from '@/hooks/use-app-state-reconcile';
import { setupNotifications } from '@/lib/notifications';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useAppStateReconcile();

  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
