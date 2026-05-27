/**
 * Live Activities + Dynamic Island bridge — Phase 8
 *
 * The native implementation lives in ios/LlamadoroWidget/LiveActivity.swift.
 * These stubs let the JS layer call into it without crashing on devices that
 * don't have the native module (simulators, Android, Phase 1–7 builds).
 *
 * Phase 8 replaces these no-ops with real expo-modules / react-native bridge calls.
 */

import { TimerPhase } from '@/lib/timer';

export interface LiveActivityState {
  phase: TimerPhase;
  endTimestamp: number;
  llamaId: string;
}

/**
 * Starts a Live Activity for the given session. Returns the native activity ID,
 * or null on platforms that don't support Live Activities (Android, iOS < 16.1).
 */
export async function startLiveActivity(_state: LiveActivityState): Promise<string | null> {
  // Phase 8: replace with native bridge call via expo-modules or NativeModules
  return null;
}

/**
 * Updates an existing Live Activity with new state (phase transition only — NOT on every tick).
 * iOS renders the countdown natively via Text(timerInterval:).
 */
export async function updateLiveActivity(
  _activityId: string,
  _state: LiveActivityState,
): Promise<void> {
  // Phase 8: bridge call
}

/**
 * Ends a Live Activity. Call on session complete, pause, or reset.
 */
export async function endLiveActivity(_activityId: string): Promise<void> {
  // Phase 8: bridge call
}

/**
 * Enumerate and end any orphaned Live Activities that don't match an active session.
 * Called on cold launch from _layout.tsx.
 */
export async function cleanupOrphanedLiveActivities(_activeId: string | null): Promise<void> {
  // Phase 8: enumerate Activity<LlamadoroAttributes>.activities via bridge,
  // end any whose ID doesn't match activeId
}
