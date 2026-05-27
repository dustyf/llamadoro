import { Accessory } from '@/types/accessory';

// Accessory art will be generated in Phase 9/10.
export const ACCESSORIES: Accessory[] = [];

export function getAccessoryById(id: string): Accessory | undefined {
  return ACCESSORIES.find((accessory) => accessory.id === id);
}
