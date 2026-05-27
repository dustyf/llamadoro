import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { debouncedAsyncStorage } from '@/lib/storage';

const STARTER_IDS = ['pedro', 'beatrix', 'coco', 'rio', 'sol'];

interface LlamasState {
  version: 1;
  activeLlamaId: string;
  unlockedIds: string[];
  pendingUnlockIds: string[];
  shownUnlockIds: string[];
  equipped: Record<string, string>;
  setActiveLlama: (id: string) => void;
  addUnlock: (id: string) => void;
  consumeNextPendingUnlock: () => string | null;
}

export const useLlamasStore = create<LlamasState>()(
  persist(
    (set, get) => ({
      version: 1,
      activeLlamaId: 'pedro',
      unlockedIds: STARTER_IDS,
      pendingUnlockIds: [],
      shownUnlockIds: [],
      equipped: {},

      setActiveLlama: (id) => {
        if (!get().unlockedIds.includes(id)) return;
        set({ activeLlamaId: id });
      },

      addUnlock: (id) => {
        const state = get();
        if (state.unlockedIds.includes(id)) return;
        set({
          unlockedIds: [...state.unlockedIds, id],
          pendingUnlockIds: state.pendingUnlockIds.includes(id)
            ? state.pendingUnlockIds
            : [...state.pendingUnlockIds, id],
        });
      },

      consumeNextPendingUnlock: () => {
        const [next, ...rest] = get().pendingUnlockIds;
        if (!next) return null;
        set((state) => ({
          pendingUnlockIds: rest,
          shownUnlockIds: state.shownUnlockIds.includes(next)
            ? state.shownUnlockIds
            : [...state.shownUnlockIds, next],
        }));
        return next;
      },
    }),
    {
      name: 'llamadoro-llamas',
      storage: createJSONStorage(() => debouncedAsyncStorage),
    },
  ),
);
