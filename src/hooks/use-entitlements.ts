import { usePurchasesStore } from '@/stores/purchases';

export interface Entitlements {
  hasFullUnlock: boolean;
}

export function useEntitlements(): Entitlements {
  const fullUnlock = usePurchasesStore((state) => state.entitlements.fullUnlock);
  return { hasFullUnlock: fullUnlock };
}
