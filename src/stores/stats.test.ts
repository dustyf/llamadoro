jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    setItem: jest.fn(() => Promise.resolve()),
  },
}));

import {
  currentStreak,
  last7DaysCounts,
  longestStreak,
  SessionLog,
  todayCount,
  totalCount,
  weekCount,
} from '@/stores/stats';

// Fixed "now": 2026-01-15 at noon UTC
// Noon UTC is safely within the same calendar day across all UTC±12 timezones.
const FIXED_NOW = new Date('2026-01-15T12:00:00.000Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

let dateSpy: jest.SpyInstance;
let idCounter = 0;

beforeEach(() => {
  dateSpy = jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW);
  idCounter = 0;
});

afterEach(() => {
  dateSpy.mockRestore();
});

function work(daysAgo: number): SessionLog {
  return {
    id: `w${idCounter++}`,
    completedAt: FIXED_NOW - daysAgo * DAY_MS,
    durationMs: 25 * 60 * 1000,
    type: 'work',
  };
}

function shortBreak(daysAgo: number): SessionLog {
  return {
    id: `sb${idCounter++}`,
    completedAt: FIXED_NOW - daysAgo * DAY_MS,
    durationMs: 5 * 60 * 1000,
    type: 'shortBreak',
  };
}

function longBreak(daysAgo: number): SessionLog {
  return {
    id: `lb${idCounter++}`,
    completedAt: FIXED_NOW - daysAgo * DAY_MS,
    durationMs: 15 * 60 * 1000,
    type: 'longBreak',
  };
}

// ---------------------------------------------------------------------------
// todayCount
// ---------------------------------------------------------------------------
describe('todayCount', () => {
  it('returns 0 for empty sessions', () => {
    expect(todayCount([])).toBe(0);
  });

  it('counts work sessions from today', () => {
    expect(todayCount([work(0), work(0)])).toBe(2);
  });

  it('ignores sessions from yesterday', () => {
    expect(todayCount([work(1)])).toBe(0);
  });

  it('ignores shortBreak and longBreak sessions today', () => {
    expect(todayCount([shortBreak(0), longBreak(0)])).toBe(0);
  });

  it('counts only today from mixed-age sessions', () => {
    expect(todayCount([work(0), work(1), work(2)])).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// weekCount
// ---------------------------------------------------------------------------
describe('weekCount', () => {
  it('returns 0 for empty sessions', () => {
    expect(weekCount([])).toBe(0);
  });

  it('counts work sessions across the last 7 days', () => {
    expect(weekCount([work(0), work(3), work(6)])).toBe(3);
  });

  it('excludes sessions older than 6 days ago (day 7+)', () => {
    // weekStart = startOfLocalDay(now) - 6 days; session at daysAgo=7 falls before weekStart
    expect(weekCount([work(7)])).toBe(0);
  });

  it('ignores break sessions', () => {
    expect(weekCount([shortBreak(0), longBreak(2)])).toBe(0);
  });

  it('includes sessions exactly 6 days ago', () => {
    expect(weekCount([work(6)])).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// totalCount
// ---------------------------------------------------------------------------
describe('totalCount', () => {
  it('returns 0 for empty sessions', () => {
    expect(totalCount([])).toBe(0);
  });

  it('counts all work sessions regardless of age', () => {
    expect(totalCount([work(0), work(30), work(365)])).toBe(3);
  });

  it('ignores shortBreak and longBreak sessions', () => {
    expect(totalCount([shortBreak(0), longBreak(0), work(0)])).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// currentStreak
// ---------------------------------------------------------------------------
describe('currentStreak', () => {
  it('returns 0 for no sessions', () => {
    expect(currentStreak([])).toBe(0);
  });

  it('returns 0 when only yesterday has work (not today)', () => {
    expect(currentStreak([work(1)])).toBe(0);
  });

  it('returns 1 for a single session today', () => {
    expect(currentStreak([work(0)])).toBe(1);
  });

  it('returns 2 for sessions today and yesterday', () => {
    expect(currentStreak([work(0), work(1)])).toBe(2);
  });

  it('returns 3 for three consecutive days ending today', () => {
    expect(currentStreak([work(0), work(1), work(2)])).toBe(3);
  });

  it('breaks on a gap: today + 2 days ago but not yesterday = streak 1', () => {
    expect(currentStreak([work(0), work(2)])).toBe(1);
  });

  it('ignores break sessions — only work sessions count', () => {
    // shortBreak today + work yesterday → today has no work → streak 0
    expect(currentStreak([shortBreak(0), work(1)])).toBe(0);
  });

  it('multiple work sessions on the same day still count as 1 streak day', () => {
    expect(currentStreak([work(0), work(0), work(0)])).toBe(1);
  });

  it('long consecutive run from today backward', () => {
    const sessions = Array.from({ length: 10 }, (_, i) => work(i));
    expect(currentStreak(sessions)).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// longestStreak
// ---------------------------------------------------------------------------
describe('longestStreak', () => {
  it('returns 0 for no sessions', () => {
    expect(longestStreak([])).toBe(0);
  });

  it('returns 1 for a single session', () => {
    expect(longestStreak([work(10)])).toBe(1);
  });

  it('3 consecutive then gap then 2 consecutive = longest 3', () => {
    const sessions = [work(0), work(1), work(2), work(10), work(11)];
    expect(longestStreak(sessions)).toBe(3);
  });

  it('returns 0 when only break sessions exist', () => {
    expect(longestStreak([shortBreak(0), longBreak(1)])).toBe(0);
  });

  it('reports longest from middle of history', () => {
    // gap of 5 days, then 4 consecutive, then gap, then 2 consecutive
    const sessions = [work(20), work(21), work(22), work(23), work(30), work(31)];
    expect(longestStreak(sessions)).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// last7DaysCounts
// ---------------------------------------------------------------------------
describe('last7DaysCounts', () => {
  it('returns 7 zeros for no sessions', () => {
    expect(last7DaysCounts([])).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it('returns array of exactly 7 elements', () => {
    expect(last7DaysCounts([work(0)])).toHaveLength(7);
  });

  it('last element (index 6) reflects today count', () => {
    const counts = last7DaysCounts([work(0), work(0)]);
    expect(counts[6]).toBe(2);
  });

  it('distributes sessions to the correct day slot', () => {
    const sessions = [
      work(0), // today → index 6
      work(1), // yesterday → index 5
      work(6), // 6 days ago → index 0
    ];
    const counts = last7DaysCounts(sessions);
    expect(counts[6]).toBe(1);
    expect(counts[5]).toBe(1);
    expect(counts[0]).toBe(1);
    expect(counts[1]).toBe(0);
  });

  it('sessions older than 6 days do not appear in any slot', () => {
    const counts = last7DaysCounts([work(7), work(100)]);
    expect(counts.every((c) => c === 0)).toBe(true);
  });

  it('ignores break sessions in all slots', () => {
    const counts = last7DaysCounts([shortBreak(0), longBreak(3)]);
    expect(counts.every((c) => c === 0)).toBe(true);
  });

  it('accumulates multiple sessions on the same day', () => {
    const counts = last7DaysCounts([work(2), work(2), work(2)]);
    expect(counts[4]).toBe(3); // 2 days ago = index 6-2 = 4
  });
});
