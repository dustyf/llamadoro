import { useEffect } from 'react';
import * as KeepAwake from 'expo-keep-awake';

import { useSettingsStore } from '@/stores/settings';

const KEEP_AWAKE_TAG = 'llamadoro-session';

export function useKeepAwakeDuringSession(isRunning: boolean): void {
  const keepAwake = useSettingsStore((state) => state.keepAwake);

  useEffect(() => {
    if (!isRunning || !keepAwake) {
      KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
      return;
    }

    KeepAwake.activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [isRunning, keepAwake]);
}
