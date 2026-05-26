export type TimerPhase = 'work' | 'shortBreak' | 'longBreak';

export interface PhaseConfig {
  workMs: number;
  shortBreakMs: number;
  longBreakMs: number;
  longBreakEvery: number; // after this many work sessions, fire a long break
}

export const DEFAULT_CONFIG: PhaseConfig = {
  workMs: 25 * 60 * 1000,
  shortBreakMs: 5 * 60 * 1000,
  longBreakMs: 15 * 60 * 1000,
  longBreakEvery: 4,
};

// Returns the duration in ms for a given phase.
export function phaseDurationMs(phase: TimerPhase, config: PhaseConfig): number {
  switch (phase) {
    case 'work':
      return config.workMs;
    case 'shortBreak':
      return config.shortBreakMs;
    case 'longBreak':
      return config.longBreakMs;
  }
}

// Given the current phase and the count of completed work sessions (before
// this transition), returns the next phase.
export function nextPhase(currentPhase: TimerPhase, completedWorkSessions: number, config: PhaseConfig): TimerPhase {
  if (currentPhase !== 'work') return 'work';
  if (completedWorkSessions > 0 && completedWorkSessions % config.longBreakEvery === 0) {
    return 'longBreak';
  }
  return 'shortBreak';
}

// Computes the end timestamp for a session starting now.
export function computeEndTimestamp(nowMs: number, phase: TimerPhase, config: PhaseConfig): number {
  return nowMs + phaseDurationMs(phase, config);
}

// Returns remaining milliseconds clamped to 0.
export function remainingMs(endTimestamp: number, nowMs: number): number {
  return Math.max(0, endTimestamp - nowMs);
}

// Returns true if the session has ended.
export function isSessionEnded(endTimestamp: number, nowMs: number): boolean {
  return nowMs >= endTimestamp;
}

// Formats remaining ms as MM:SS string.
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Progress 0..1 for the current phase (1 = full, 0 = done).
export function phaseProgress(endTimestamp: number, nowMs: number, phase: TimerPhase, config: PhaseConfig): number {
  const total = phaseDurationMs(phase, config);
  if (total === 0) return 0;
  return Math.min(1, Math.max(0, remainingMs(endTimestamp, nowMs) / total));
}
