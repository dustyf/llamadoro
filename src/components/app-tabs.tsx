import { Tabs } from 'expo-router';
import { SymbolView, SFSymbol } from 'expo-symbols';
import { Platform } from 'react-native';

const ACCENT = '#7B68C8';
const TEXT = '#2A2040';

const icons: Record<string, SFSymbol> = {
  index: 'timer',
  gallery: 'square.grid.2x2',
  stats: 'chart.bar',
  settings: 'gear',
};

function tabIcon(routeName: string, color: string) {
  if (Platform.OS !== 'ios') return undefined;
  return <SymbolView name={icons[routeName]} tintColor={color} size={24} />;
}

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: TEXT,
        tabBarStyle: { backgroundColor: '#F7F5FC' },
        tabBarIcon: ({ color }) => tabIcon(route.name, String(color)),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Timer' }} />
      <Tabs.Screen name="gallery" options={{ title: 'Gallery' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="unlock" options={{ href: null }} />
      <Tabs.Screen name="paywall" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
