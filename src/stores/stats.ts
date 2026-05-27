import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { immediateAsyncStorage } from '@/lib/storage';
import { TimerPhase } from '@/types/llama';

export interface SessionLog {
  id: string;
  completedAt: number;
  durationMs: number;
  type: TimerPhase;
}

interface StatsState {
  version: 1;
  sessions: SessionLog[];
  appendSession: (session: SessionLog) => void;
  clearAll: () => void;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      version: 1,
      sessions: [],
      appendSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
      clearAll: () => set({ sessions: [] }),
    }),
    {
      name: 'llamadoro-stats',
      storage: createJSONStorage(() => immediateAsyncStorage),
    },
  ),
);

function startOfLocalDay(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function workSessions(sessions: SessionLog[]): SessionLog[] {
  return sessions.filter((session) => session.type === 'work');
}

export function todayCount(sessions: SessionLog[]): number {
  const today = startOfLocalDay(Date.now());
  return workSessions(sessions).filter((session) => startOfLocalDay(session.completedAt) === today)
    .length;
}

export function weekCount(sessions: SessionLog[]): number {
  const today = startOfLocalDay(Date.now());
  const weekStart = today - 6 * 24 * 60 * 60 * 1000;
  return workSessions(sessions).filter((session) => session.completedAt >= weekStart).length;
}

export function totalCount(sessions: SessionLog[]): number {
  return workSessions(sessions).length;
}

function workDaySet(sessions: SessionLog[]): Set<number> {
  return new Set(workSessions(sessions).map((session) => startOfLocalDay(session.completedAt)));
}

export function currentStreak(sessions: SessionLog[]): number {
  const days = workDaySet(sessions);
  let cursor = startOfLocalDay(Date.now());
  let streak = 0;

  while (days.has(cursor)) {
    streak += 1;
    cursor -= 24 * 60 * 60 * 1000;
  }

  return streak;
}

export function longestStreak(sessions: SessionLog[]): number {
  const sortedDays = [...workDaySet(sessions)].sort((a, b) => a - b);
  let longest = 0;
  let current = 0;
  let previous: number | null = null;

  for (const day of sortedDays) {
    current = previous !== null && day - previous === 24 * 60 * 60 * 1000 ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = day;
  }

  return longest;
}

export function last7DaysCounts(sessions: SessionLog[]): number[] {
  const today = startOfLocalDay(Date.now());
  return Array.from({ length: 7 }, (_, index) => {
    const day = today - (6 - index) * 24 * 60 * 60 * 1000;
    return workSessions(sessions).filter((session) => startOfLocalDay(session.completedAt) === day)
      .length;
  });
}
