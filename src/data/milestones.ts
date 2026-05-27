export interface Milestone {
  llamaId: string;
  type: 'sessions' | 'streak';
  count: number;
}

export const MILESTONES: Milestone[] = [
  { llamaId: 'luna', type: 'sessions', count: 10 },
  { llamaId: 'nova', type: 'sessions', count: 50 },
  { llamaId: 'sage', type: 'sessions', count: 200 },
  { llamaId: 'blaze', type: 'streak', count: 7 },
  { llamaId: 'zuri', type: 'streak', count: 30 },
];
