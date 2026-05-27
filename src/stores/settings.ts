import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { debouncedAsyncStorage } from '@/lib/storage';

export type ThemePreference = 'auto' | 'light' | 'dark';

interface SettingsState {
  version: 1;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  keepAwake: boolean;
  reducedMotion: boolean;
  theme: ThemePreference;
  hasCompletedOnboarding: boolean;
  setWorkMinutes: (value: number) => void;
  setShortBreakMinutes: (value: number) => void;
  setLongBreakMinutes: (value: number) => void;
  setLongBreakEvery: (value: number) => void;
  setSoundEnabled: (value: boolean) => void;
  setHapticsEnabled: (value: boolean) => void;
  setKeepAwake: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setTheme: (value: ThemePreference) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      version: 1,
      workMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      longBreakEvery: 4,
      soundEnabled: true,
      hapticsEnabled: true,
      keepAwake: true,
      reducedMotion: false,
      theme: 'auto',
      hasCompletedOnboarding: false,
      setWorkMinutes: (workMinutes) => set({ workMinutes }),
      setShortBreakMinutes: (shortBreakMinutes) => set({ shortBreakMinutes }),
      setLongBreakMinutes: (longBreakMinutes) => set({ longBreakMinutes }),
      setLongBreakEvery: (longBreakEvery) => set({ longBreakEvery }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setKeepAwake: (keepAwake) => set({ keepAwake }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setTheme: (theme) => set({ theme }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
    }),
    {
      name: 'llamadoro-settings',
      storage: createJSONStorage(() => debouncedAsyncStorage),
    },
  ),
);
