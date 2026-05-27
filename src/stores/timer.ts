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
import { dedupedImmediateAsyncStorage } from '@/lib/storage';

export interface TimerBookmark {
  sessionId: string | null;
  phaseIndex: number;
  phase: TimerPhase;
  endTimestamp: number | null;
  notificationId: string | null;
  liveActivityId: string | null;
  lastCommittedKey: string | null;
  completedWorkSessions: number;
}

export interface TimerState extends TimerBookmark {
  // In-memory — NOT persisted
  displayRemainingMs: number;
  isRunning: boolean;
  personalityLine: string;
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
  setPersonalityLine: (line: string) => void;
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
      personalityLine: '',

      setDisplayRemainingMs: (ms) => set({ displayRemainingMs: ms }),
      setPersonalityLine: (line) => set({ personalityLine: line }),

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
          personalityLine: '',
        });

        // Fire greeting after state is set — imported lazily to avoid circular deps
        Promise.resolve().then(async () => {
          const { getLlamaById } = await import('@/data/llamas');
          const { pickLine } = await import('@/lib/personality');
          const { useLlamasStore } = await import('@/stores/llamas');
          const llamaId = useLlamasStore.getState().activeLlamaId;
          const llama = getLlamaById(llamaId);
          if (llama) set({ personalityLine: pickLine(llama, 'greeting') });
        });
      },

      pause: async () => {
        const state = get();
        if (!state.isRunning || !state.endTimestamp) return;
        await cancelTimerNotification(state.notificationId);
        const remaining = Math.max(0, state.endTimestamp - Date.now());
        set({ isRunning: false, endTimestamp: null, notificationId: null, displayRemainingMs: remaining });
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
        set({ ...initialBookmark, isRunning: false, displayRemainingMs: DEFAULT_CONFIG.workMs, personalityLine: '' });
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
        set({ displayRemainingMs: Math.max(0, state.endTimestamp - nowMs) });
      },

      commitPhaseCompletion: async ({ sessionId, phaseIndex, phase, config = DEFAULT_CONFIG }) => {
        const state = get();
        const commitKey = `${sessionId}:${phaseIndex}`;
        if (state.lastCommittedKey === commitKey) return;
        // Write idempotency key synchronously before any await
        set({ lastCommittedKey: commitKey });

        await cancelTimerNotification(state.notificationId);

        // Side effects for completed work sessions
        if (phase === 'work') {
          Promise.resolve().then(async () => {
            const { useStatsStore, currentStreak, totalCount } = await import('@/stores/stats');
            const { useLlamasStore } = await import('@/stores/llamas');
            const { detectNewUnlocks } = await import('@/lib/unlocks');
            const { getLlamaById } = await import('@/data/llamas');
            const { pickLine } = await import('@/lib/personality');
            const { hapticSuccess } = await import('@/lib/haptics');
            const { playSessionEndSound } = await import('@/lib/sound');

            // Append session to stats
            useStatsStore.getState().appendSession({
              id: `${sessionId}:${phaseIndex}`,
              completedAt: Date.now(),
              durationMs: config.workMs,
              type: 'work',
            });

            // Milestone detection
            const sessions = useStatsStore.getState().sessions;
            const unlockedIds = useLlamasStore.getState().unlockedIds;
            const newUnlocks = detectNewUnlocks(
              totalCount(sessions),
              currentStreak(sessions),
              unlockedIds,
            );
            for (const id of newUnlocks) {
              useLlamasStore.getState().addUnlock(id);
            }

            // Personality completion line
            const llamaId = useLlamasStore.getState().activeLlamaId;
            const llama = getLlamaById(llamaId);
            if (llama) set({ personalityLine: pickLine(llama, 'completion') });

            await hapticSuccess();
            await playSessionEndSound();
          });
        }

        const newCompletedWork = phase === 'work' ? state.completedWorkSessions + 1 : state.completedWorkSessions;
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
      storage: createJSONStorage(() => dedupedImmediateAsyncStorage),
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
