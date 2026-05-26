import {
  DEFAULT_CONFIG,
  computeEndTimestamp,
  formatCountdown,
  isSessionEnded,
  nextPhase,
  phaseDurationMs,
  phaseProgress,
  remainingMs,
} from './index';

const cfg = DEFAULT_CONFIG;

describe('phaseDurationMs', () => {
  it('returns work duration', () => {
    expect(phaseDurationMs('work', cfg)).toBe(25 * 60 * 1000);
  });
  it('returns shortBreak duration', () => {
    expect(phaseDurationMs('shortBreak', cfg)).toBe(5 * 60 * 1000);
  });
  it('returns longBreak duration', () => {
    expect(phaseDurationMs('longBreak', cfg)).toBe(15 * 60 * 1000);
  });
});

describe('nextPhase', () => {
  it('work → shortBreak after 1 session', () => {
    expect(nextPhase('work', 1, cfg)).toBe('shortBreak');
  });
  it('work → longBreak after 4 sessions (longBreakEvery=4)', () => {
    expect(nextPhase('work', 4, cfg)).toBe('longBreak');
  });
  it('work → longBreak after 8 sessions', () => {
    expect(nextPhase('work', 8, cfg)).toBe('longBreak');
  });
  it('work → shortBreak after 2 sessions', () => {
    expect(nextPhase('work', 2, cfg)).toBe('shortBreak');
  });
  it('shortBreak → work', () => {
    expect(nextPhase('shortBreak', 1, cfg)).toBe('work');
  });
  it('longBreak → work', () => {
    expect(nextPhase('longBreak', 4, cfg)).toBe('work');
  });
  it('work → shortBreak after 0 sessions (first session start edge case)', () => {
    expect(nextPhase('work', 0, cfg)).toBe('shortBreak');
  });
});

describe('computeEndTimestamp', () => {
  it('adds work duration to now', () => {
    const now = 1_000_000;
    expect(computeEndTimestamp(now, 'work', cfg)).toBe(now + 25 * 60 * 1000);
  });
});

describe('remainingMs', () => {
  it('returns positive remaining time', () => {
    expect(remainingMs(1000 + 5000, 1000)).toBe(5000);
  });
  it('clamps to 0 when past end', () => {
    expect(remainingMs(1000, 2000)).toBe(0);
  });
  it('returns 0 at exact end', () => {
    expect(remainingMs(1000, 1000)).toBe(0);
  });
});

describe('isSessionEnded', () => {
  it('false when time remaining', () => {
    expect(isSessionEnded(2000, 1000)).toBe(false);
  });
  it('true when now equals end', () => {
    expect(isSessionEnded(1000, 1000)).toBe(true);
  });
  it('true when past end', () => {
    expect(isSessionEnded(1000, 2000)).toBe(true);
  });
});

describe('formatCountdown', () => {
  it('formats zero as 00:00', () => {
    expect(formatCountdown(0)).toBe('00:00');
  });
  it('formats 25 minutes', () => {
    expect(formatCountdown(25 * 60 * 1000)).toBe('25:00');
  });
  it('formats 1 second', () => {
    expect(formatCountdown(1000)).toBe('00:01');
  });
  it('rounds up partial seconds', () => {
    expect(formatCountdown(999)).toBe('00:01');
    expect(formatCountdown(1)).toBe('00:01');
  });
  it('pads single-digit minutes and seconds', () => {
    expect(formatCountdown(1 * 60 * 1000 + 5 * 1000)).toBe('01:05');
  });
});

describe('phaseProgress', () => {
  it('returns 1 at start of phase', () => {
    const now = 0;
    const end = phaseDurationMs('work', cfg);
    expect(phaseProgress(end, now, 'work', cfg)).toBeCloseTo(1, 5);
  });
  it('returns 0 at end of phase', () => {
    const end = 1000;
    expect(phaseProgress(end, end, 'work', cfg)).toBe(0);
  });
  it('returns 0.5 at halfway', () => {
    const duration = phaseDurationMs('work', cfg);
    const half = duration / 2;
    // endTimestamp is half the duration away from now=0
    expect(phaseProgress(half, 0, 'work', cfg)).toBeCloseTo(0.5, 5);
  });
  it('clamps to 0 when past end', () => {
    expect(phaseProgress(1000, 2000, 'work', cfg)).toBe(0);
  });
});
