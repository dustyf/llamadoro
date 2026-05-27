import { MILESTONES } from '@/data/milestones';

export function detectNewUnlocks(
  sessions: number,
  streak: number,
  alreadyUnlocked: string[],
): string[] {
  return MILESTONES.filter((milestone) => {
    if (alreadyUnlocked.includes(milestone.llamaId)) return false;
    if (milestone.type === 'sessions') return sessions >= milestone.count;
    return streak >= milestone.count;
  }).map((milestone) => milestone.llamaId);
}
