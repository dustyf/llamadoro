import { Audio } from 'expo-av';

import { useSettingsStore } from '@/stores/settings';

let _sound: Audio.Sound | null = null;

export async function preloadSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/session-end.mp3'), {
      shouldPlay: false,
    });
    _sound = sound;
  } catch {
    // asset not yet present - graceful no-op
  }
}

export async function playSessionEndSound(): Promise<void> {
  if (!useSettingsStore.getState().soundEnabled) return;
  if (!_sound) return;
  try {
    await _sound.setPositionAsync(0);
    await _sound.playAsync();
  } catch {
    // ignore playback errors
  }
}
