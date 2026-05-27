import { useSettingsStore } from '@/stores/settings';

export async function preloadSounds(): Promise<void> {}

export async function playSessionEndSound(): Promise<void> {
  if (!useSettingsStore.getState().soundEnabled) return;
}
