import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { debouncedAsyncStorage } from '@/lib/storage';

interface PurchasesState {
  version: 1;
  entitlements: { fullUnlock: boolean };
  status: 'idle' | 'loading' | 'synced' | 'error';
  lastSyncedAt: number | null;
  // Phase 7 will add real RevenueCat integration here
}

export const usePurchasesStore = create<PurchasesState>()(
  persist(
    (_set) => ({
      version: 1 as const,
      entitlements: { fullUnlock: false },
      status: 'idle' as const,
      lastSyncedAt: null,
    }),
    {
      name: 'llamadoro-purchases',
      storage: createJSONStorage(() => debouncedAsyncStorage),
      version: 1,
    },
  ),
);

export function useEntitlements() {
  const { entitlements } = usePurchasesStore();
  return { hasFullUnlock: entitlements.fullUnlock };
}
