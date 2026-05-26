import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { DEFAULT_CONFIG } from '@/lib/timer';
import { useTimerStore } from '@/stores/timer';

export function useAppStateReconcile() {
  const appStateRef = useRef(AppState.currentState);

  // AppState transitions: handle session end while backgrounded.
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;

      if (next !== 'active') return;
      if (prev === 'active') return;

      const state = useTimerStore.getState();
      // isRunning is in-memory and may not reflect persisted bookmark on some
      // transition paths — check endTimestamp and sessionId (both persisted).
      if (!state.endTimestamp || !state.sessionId) return;

      const now = Date.now();
      if (now >= state.endTimestamp) {
        await state.commitPhaseCompletion({
          sessionId: state.sessionId,
          phaseIndex: state.phaseIndex,
          phase: state.phase,
          config: DEFAULT_CONFIG,
        });
      } else {
        if (!state.isRunning) {
          // Restore running state lost by a partial-kill that preserved the bookmark
          useTimerStore.setState({ isRunning: true });
        }
        state.setDisplayRemainingMs(Math.max(0, state.endTimestamp - now));
      }
    });

    return () => sub.remove();
  }, []);

  // Cold-launch recovery: runs once on mount. isRunning is NOT persisted —
  // the only source of truth for "was there an active session" is the persisted
  // bookmark fields (sessionId + endTimestamp). Do NOT gate on isRunning here.
  useEffect(() => {
    const state = useTimerStore.getState();
    if (!state.endTimestamp || !state.sessionId) return;

    const now = Date.now();
    if (now >= state.endTimestamp) {
      // Session ended while the app was killed — commit and move to next phase.
      state.commitPhaseCompletion({
        sessionId: state.sessionId,
        phaseIndex: state.phaseIndex,
        phase: state.phase,
        config: DEFAULT_CONFIG,
      });
    } else {
      // Session still has time left — restore isRunning and update display.
      useTimerStore.setState({ isRunning: true });
      state.setDisplayRemainingMs(Math.max(0, state.endTimestamp - now));
    }
  }, []);
}
