/**
 * Widget data publishing — Phase 8.10
 *
 * Writes the active llama ID, today's session count, and current timer phase
 * to App Group shared UserDefaults (iOS) and SharedPreferences (Android) so
 * the home-screen and lock-screen widgets can read them on every refresh.
 *
 * Phase 8 replaces these stubs with real NativeModules / expo-modules bridge calls.
 */

import { TimerPhase } from '@/lib/timer';

export interface WidgetData {
  activeLlamaId: string;
  todayCount: number;
  phase: TimerPhase;
  isRunning: boolean;
}

/**
 * Write widget data to the shared container. Call after any state change
 * that widgets care about: session complete, active llama change.
 */
export async function publishWidgetData(_data: WidgetData): Promise<void> {
  // Phase 8: write to App Group UserDefaults / SharedPreferences via bridge
}
