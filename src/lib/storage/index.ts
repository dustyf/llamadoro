import AsyncStorage from '@react-native-async-storage/async-storage';

// Base storage interface compatible with Zustand's createJSONStorage.
// Use with createJSONStorage(() => immediateAsyncStorage) or
// createJSONStorage(() => debouncedAsyncStorage).

const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();

function debouncedWrite(key: string, value: string, delayMs: number) {
  const existing = pendingWrites.get(key);
  if (existing) clearTimeout(existing);
  const handle = setTimeout(() => {
    AsyncStorage.setItem(key, value).catch(() => {});
    pendingWrites.delete(key);
  }, delayMs);
  pendingWrites.set(key, handle);
}

// Immediate — use for timer bookmark and stats (every write matters).
export const immediateAsyncStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// Debounced (200ms) — use for settings, llamas, purchases.
export const debouncedAsyncStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => {
    debouncedWrite(key, value, 200);
    return Promise.resolve();
  },
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

const lastPersistedValues = new Map<string, string>();

export const dedupedImmediateAsyncStorage = {
  getItem: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      lastPersistedValues.set(key, value);
    }
    return value;
  },
  setItem: (key: string, value: string) => {
    if (lastPersistedValues.get(key) === value) {
      return Promise.resolve();
    }
    lastPersistedValues.set(key, value);
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    lastPersistedValues.delete(key);
    return AsyncStorage.removeItem(key);
  },
};
