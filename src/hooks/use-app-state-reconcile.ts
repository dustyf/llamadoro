import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { DEFAULT_CONFIG } from '@/lib/timer';
import { useTimerStore } from '@/stores/timer';

// Mounts in _layout.tsx. On every transition to 'active':
// 1. If a session was running and endTimestamp has passed, commit the phase.
// 2. If the session ended while backgrounded, the notification already fired —
//    this reconciliation is the guard against double-counting with the
//    foreground tick handler (same commitPhaseCompletion idempotency key).
export function useAppStateReconcile() {
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;

      if (next !== 'active') return;
      if (prev === 'active') return; // no-op on initial foreground

      const state = useTimerStore.getState();
      if (!state.isRunning || !state.endTimestamp || !state.sessionId) return;

      const now = Date.now();
      if (now >= state.endTimestamp) {
        await state.commitPhaseCompletion({
          sessionId: state.sessionId,
          phaseIndex: state.phaseIndex,
          phase: state.phase,
          config: DEFAULT_CONFIG,
        });
      } else {
        // Session still running — update display remaining
        state.setDisplayRemainingMs(Math.max(0, state.endTimestamp - now));
      }
    });

    return () => sub.remove();
  }, []);

  // Also run reconciliation on mount (cold launch recovery from persisted bookmark).
  useEffect(() => {
    const state = useTimerStore.getState();
    if (!state.isRunning || !state.endTimestamp || !state.sessionId) return;

    const now = Date.now();
    if (now >= state.endTimestamp) {
      // Session ended while app was killed — commit immediately
      state.commitPhaseCompletion({
        sessionId: state.sessionId,
        phaseIndex: state.phaseIndex,
        phase: state.phase,
        config: DEFAULT_CONFIG,
      });
    } else {
      state.setDisplayRemainingMs(Math.max(0, state.endTimestamp - now));
    }
  }, []);
}
