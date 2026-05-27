import { UnlockCondition } from './llama';

export type AccessorySlot = 'head' | 'neck' | 'prop';

export interface Accessory {
  id: string;
  name: string;
  slot: AccessorySlot;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asset: any;
  tier: 'free' | 'paid' | 'earned';
  unlockCondition?: UnlockCondition;
}
