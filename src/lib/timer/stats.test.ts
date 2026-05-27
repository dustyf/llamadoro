jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    setItem: jest.fn(() => Promise.resolve()),
  },
}));

import {
  SessionLog,
  currentStreak,
  last7DaysCounts,
  longestStreak,
  todayCount,
  totalCount,
  weekCount,
} from '@/stores/stats';

const FIXED_NOW = Date.UTC(2026, 0, 15, 12, 0, 0, 0);

function session(
  daysAgo: number,
  type: 'work' | 'shortBreak' | 'longBreak' = 'work',
): SessionLog {
  const date = new Date(Date.now());
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);

  return {
    id: `${type}-${daysAgo}-${date.getTime()}`,
    completedAt: date.getTime(),
    durationMs: 25 * 60 * 1000,
    type,
  };
}

describe('stats selectors', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('empty sessions return all counters as 0', () => {
    const sessions: SessionLog[] = [];

    expect(todayCount(sessions)).toBe(0);
    expect(weekCount(sessions)).toBe(0);
    expect(totalCount(sessions)).toBe(0);
    expect(currentStreak(sessions)).toBe(0);
    expect(longestStreak(sessions)).toBe(0);
    expect(last7DaysCounts(sessions)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("todayCount counts only today's work sessions", () => {
    const sessions = [
      session(0),
      session(0),
      session(0, 'shortBreak'),
      session(0, 'longBreak'),
      session(1),
    ];

    expect(todayCount(sessions)).toBe(2);
  });

  it('weekCount counts work sessions in the last 7 days', () => {
    const sessions = [
      session(0),
      session(1),
      session(6),
      session(7),
      session(0, 'shortBreak'),
      session(2, 'longBreak'),
    ];

    expect(weekCount(sessions)).toBe(3);
  });

  it('totalCount counts all work sessions', () => {
    const sessions = [
      session(0),
      session(3),
      session(30),
      session(0, 'shortBreak'),
      session(1, 'longBreak'),
    ];

    expect(totalCount(sessions)).toBe(3);
  });

  it('currentStreak returns 0 with no sessions', () => {
    expect(currentStreak([])).toBe(0);
  });

  it('currentStreak returns 0 when there is only yesterday and not today', () => {
    expect(currentStreak([session(1)])).toBe(0);
  });

  it('currentStreak returns 1 with only today', () => {
    expect(currentStreak([session(0)])).toBe(1);
  });

  it('currentStreak returns 2 with today and yesterday', () => {
    expect(currentStreak([session(0), session(1)])).toBe(2);
  });

  it('currentStreak returns 3 with today, yesterday, and 2 days ago', () => {
    expect(currentStreak([session(0), session(1), session(2)])).toBe(3);
  });

  it('currentStreak breaks at a missing yesterday', () => {
    expect(currentStreak([session(0), session(2)])).toBe(1);
  });

  it('currentStreak ignores break sessions today', () => {
    expect(currentStreak([session(0, 'shortBreak'), session(0, 'longBreak')])).toBe(0);
  });

  it('currentStreak ignores break sessions in the chain', () => {
    expect(currentStreak([session(0), session(1, 'shortBreak')])).toBe(1);
  });

  it('longestStreak returns 3 for a 3-day run, gap, then 2-day run', () => {
    const sessions = [session(8), session(7), session(6), session(3), session(2)];

    expect(longestStreak(sessions)).toBe(3);
  });

  it("last7DaysCounts returns 7 integers with today's count last", () => {
    const counts = last7DaysCounts([session(6), session(3), session(0), session(0)]);

    expect(counts).toHaveLength(7);
    expect(counts.every(Number.isInteger)).toBe(true);
    expect(counts).toEqual([1, 0, 0, 1, 0, 0, 2]);
  });

  it('shortBreak and longBreak never affect any counter', () => {
    const breaks = [
      session(0, 'shortBreak'),
      session(1, 'shortBreak'),
      session(2, 'longBreak'),
      session(6, 'longBreak'),
    ];

    expect(todayCount(breaks)).toBe(0);
    expect(weekCount(breaks)).toBe(0);
    expect(totalCount(breaks)).toBe(0);
    expect(currentStreak(breaks)).toBe(0);
    expect(longestStreak(breaks)).toBe(0);
    expect(last7DaysCounts(breaks)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});
