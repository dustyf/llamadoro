import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useSettingsStore } from '@/stores/settings';

export function useReducedMotion(): boolean {
  const settingReducedMotion = useSettingsStore((state) => state.reducedMotion);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReducedMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setSystemReducedMotion(enabled);
    });
    return () => subscription.remove();
  }, []);

  return settingReducedMotion || systemReducedMotion;
}
