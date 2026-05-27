import { UnlockCondition } from './llama';

export type AccessorySlot = 'head' | 'neck' | 'prop';

export interface Accessory {
  id: string;
  name: string;
  slot: AccessorySlot;
  asset: number;
  tier: 'earned' | 'paid';
  unlockCondition: UnlockCondition;
}
