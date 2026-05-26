import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

function subscribe(callback: () => void) {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Server snapshot defaults to light — avoids hydration mismatch.
function getServerSnapshot(): 'light' | 'dark' {
  return 'light';
}

/**
 * Web-specific override that uses useSyncExternalStore for SSR-safe color-scheme detection.
 * The native file uses RN's useColorScheme directly.
 */
export function useColorScheme() {
  const rnScheme = useRNColorScheme();

  const webScheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // On web, prefer the direct matchMedia result; fall back to RN's value.
  return rnScheme ?? webScheme;
}
