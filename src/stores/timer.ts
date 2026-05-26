import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { cancelTimerNotification, scheduleTimerNotification } from '@/lib/notifications';
import {
  DEFAULT_CONFIG,
  PhaseConfig,
  TimerPhase,
  computeEndTimestamp,
  nextPhase,
} from '@/lib/timer';
import { immediateAsyncStorage } from '@/lib/storage';

// Only the bookmark is persisted — tick state lives in memory only.
export interface TimerBookmark {
  sessionId: string | null;
  phaseIndex: number; // increments on every phase transition
  phase: TimerPhase;
  endTimestamp: number | null; // ms since epoch; null = paused or idle
  notificationId: string | null;
  liveActivityId: string | null;
  lastCommittedKey: string | null; // "{sessionId}:{phaseIndex}" — idempotency guard
  completedWorkSessions: number;
}

export interface TimerState extends TimerBookmark {
  // In-memory tick state — NOT persisted
  displayRemainingMs: number;
  isRunning: boolean;
  // Actions
  start: (config?: PhaseConfig) => Promise<void>;
  pause: () => Promise<void>;
  resume: (config?: PhaseConfig) => Promise<void>;
  reset: () => Promise<void>;
  skip: (config?: PhaseConfig) => Promise<void>;
  tick: (nowMs: number) => void;
  commitPhaseCompletion: (params: {
    sessionId: string;
    phaseIndex: number;
    phase: TimerPhase;
    config?: PhaseConfig;
  }) => Promise<void>;
  setDisplayRemainingMs: (ms: number) => void;
}

let sideEffectCallback: ((phase: TimerPhase) => void) | null = null;

// Register a callback to run after each phase completion (for stats, milestones).
export function registerPhaseCompletionCallback(cb: (phase: TimerPhase) => void) {
  sideEffectCallback = cb;
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const initialBookmark: TimerBookmark = {
  sessionId: null,
  phaseIndex: 0,
  phase: 'work',
  endTimestamp: null,
  notificationId: null,
  liveActivityId: null,
  lastCommittedKey: null,
  completedWorkSessions: 0,
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      ...initialBookmark,
      displayRemainingMs: DEFAULT_CONFIG.workMs,
      isRunning: false,

      setDisplayRemainingMs: (ms) => set({ displayRemainingMs: ms }),

      start: async (config = DEFAULT_CONFIG) => {
        const state = get();
        if (state.isRunning) return;

        const sessionId = generateSessionId();
        const phase: TimerPhase = 'work';
        const now = Date.now();
        const endTimestamp = computeEndTimestamp(now, phase, config);
        const notificationId = await scheduleTimerNotification(endTimestamp, phase);

        set({
          sessionId,
          phaseIndex: 0,
          phase,
          endTimestamp,
          notificationId,
          liveActivityId: null,
          lastCommittedKey: null,
          isRunning: true,
          displayRemainingMs: config.workMs,
        });
      },

      pause: async () => {
        const state = get();
        if (!state.isRunning || !state.endTimestamp) return;

        await cancelTimerNotification(state.notificationId);
        const remaining = Math.max(0, state.endTimestamp - Date.now());

        set({
          isRunning: false,
          endTimestamp: null,
          notificationId: null,
          displayRemainingMs: remaining,
        });
      },

      resume: async (config = DEFAULT_CONFIG) => {
        const state = get();
        if (state.isRunning || state.endTimestamp !== null) return;

        const remaining = state.displayRemainingMs;
        if (remaining <= 0) return;

        const endTimestamp = Date.now() + remaining;
        const notificationId = await scheduleTimerNotification(endTimestamp, state.phase);

        set({ isRunning: true, endTimestamp, notificationId });
      },

      reset: async () => {
        const state = get();
        await cancelTimerNotification(state.notificationId);
        set({
          ...initialBookmark,
          isRunning: false,
          displayRemainingMs: DEFAULT_CONFIG.workMs,
        });
      },

      skip: async (config = DEFAULT_CONFIG) => {
        const state = get();
        await cancelTimerNotification(state.notificationId);

        if (state.sessionId && state.isRunning) {
          await get().commitPhaseCompletion({
            sessionId: state.sessionId,
            phaseIndex: state.phaseIndex,
            phase: state.phase,
            config,
          });
        }
      },

      tick: (nowMs: number) => {
        const state = get();
        if (!state.isRunning || !state.endTimestamp) return;
        const remaining = Math.max(0, state.endTimestamp - nowMs);
        // Only update in-memory display — no storage write on tick
        set({ displayRemainingMs: remaining });
      },

      commitPhaseCompletion: async ({ sessionId, phaseIndex, phase, config = DEFAULT_CONFIG }) => {
        const state = get();
        const commitKey = `${sessionId}:${phaseIndex}`;

        // Idempotency guard — write the key synchronously BEFORE any await so
        // concurrent callers (foreground tick + AppState reconciliation racing)
        // both see the committed key and the second call no-ops. If we wrote
        // the key only after the awaits, both calls could read null and both
        // fire side effects.
        if (state.lastCommittedKey === commitKey) return;
        set({ lastCommittedKey: commitKey });

        await cancelTimerNotification(state.notificationId);

        // Side effects for work phases only (stats, milestones)
        if (phase === 'work' && sideEffectCallback) {
          sideEffectCallback(phase);
        }

        const newCompletedWork =
          phase === 'work' ? state.completedWorkSessions + 1 : state.completedWorkSessions;

        const np = nextPhase(phase, newCompletedWork, config);
        const newPhaseIndex = phaseIndex + 1;
        const now = Date.now();
        const endTimestamp = computeEndTimestamp(now, np, config);
        const notificationId = await scheduleTimerNotification(endTimestamp, np);

        set({
          phase: np,
          phaseIndex: newPhaseIndex,
          endTimestamp,
          notificationId,
          liveActivityId: null,
          completedWorkSessions: newCompletedWork,
          isRunning: true,
          displayRemainingMs: endTimestamp - now,
        });
      },
    }),
    {
      name: 'llamadoro-timer-bookmark',
      storage: createJSONStorage(() => immediateAsyncStorage),
      // Persist only the bookmark fields — never tick state or action functions
      partialize: (state): TimerBookmark => ({
        sessionId: state.sessionId,
        phaseIndex: state.phaseIndex,
        phase: state.phase,
        endTimestamp: state.endTimestamp,
        notificationId: state.notificationId,
        liveActivityId: state.liveActivityId,
        lastCommittedKey: state.lastCommittedKey,
        completedWorkSessions: state.completedWorkSessions,
      }),
    },
  ),
);
