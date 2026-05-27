import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PersonalityLine } from '@/components/personality/personality-line';
import { LlamaStage } from '@/components/timer/llama-stage';
import { PermissionBanner } from '@/components/timer/permission-banner';
import { TimerControls } from '@/components/timer/timer-controls';
import { TimerRing } from '@/components/timer/timer-ring';
import { useKeepAwakeDuringSession } from '@/hooks/use-keep-awake-during-session';
import { useNotificationPermission } from '@/hooks/use-notification-permission';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { requestNotificationPermissions } from '@/lib/notifications';
import { PhaseConfig, phaseProgress } from '@/lib/timer';
import { getLlamaById } from '@/data/llamas';
import { useLlamasStore } from '@/stores/llamas';
import { useSettingsStore } from '@/stores/settings';
import { todayCount, useStatsStore } from '@/stores/stats';
import { useTimerStore } from '@/stores/timer';

const PHASE_LABELS = {
  work: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export default function TimerScreen() {
  const {
    phase,
    isRunning,
    displayRemainingMs,
    endTimestamp,
    personalityLine,
    start,
    pause,
    resume,
    reset,
    skip,
    tick,
  } = useTimerStore();
  const settings = useSettingsStore();
  const sessions = useStatsStore((state) => state.sessions);
  const activeLlamaId = useLlamasStore((state) => state.activeLlamaId);
  const { status: permStatus, openSettings } = useNotificationPermission();
  const reducedMotion = useReducedMotion();

  const config = useMemo<PhaseConfig>(
    () => ({
      workMs: settings.workMinutes * 60 * 1000,
      shortBreakMs: settings.shortBreakMinutes * 60 * 1000,
      longBreakMs: settings.longBreakMinutes * 60 * 1000,
      longBreakEvery: settings.longBreakEvery,
    }),
    [settings.longBreakEvery, settings.longBreakMinutes, settings.shortBreakMinutes, settings.workMinutes],
  );

  useKeepAwakeDuringSession(isRunning);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const now = Date.now();
      tick(now);

      if (endTimestamp && now >= endTimestamp) {
        const state = useTimerStore.getState();
        if (state.sessionId && state.isRunning) {
          state.commitPhaseCompletion({
            sessionId: state.sessionId,
            phaseIndex: state.phaseIndex,
            phase: state.phase,
            config,
          });
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [config, endTimestamp, isRunning, tick]);

  async function handleStart() {
    await requestNotificationPermissions();
    await start(config);
  }

  const progress = endTimestamp ? phaseProgress(endTimestamp, Date.now(), phase, config) : 1;
  const canSkip = isRunning || displayRemainingMs < config.workMs;
  const today = todayCount(sessions);
  const llamaName = getLlamaById(activeLlamaId).name;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {permStatus === 'denied' && <PermissionBanner onOpenSettings={openSettings} />}
      <View style={styles.container}>
        <View style={styles.stageWrap}>
          <LlamaStage phase={phase} isRunning={isRunning} />
          <PersonalityLine text={personalityLine} reducedMotion={reducedMotion} />
        </View>
        <TimerRing progress={progress} remainingMs={displayRemainingMs} />
        <Text style={styles.phaseLabel}>{PHASE_LABELS[phase]}</Text>
        <TimerControls
          isRunning={isRunning}
          canSkip={canSkip}
          onStart={handleStart}
          onPause={() => pause()}
          onResume={() => resume(config)}
          onReset={() => reset()}
          onSkip={() => skip(config)}
        />
        <Text style={styles.sessionCount}>
          {today} {today === 1 ? 'session' : 'sessions'} today
        </Text>
        <Text style={styles.activeLlamaName}>with {llamaName}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E8E6F5',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 22,
  },
  stageWrap: {
    position: 'relative',
    width: '100%',
    height: '48%',
  },
  phaseLabel: {
    color: '#2A2040',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 18,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  sessionCount: {
    color: '#5A5070',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 'auto',
  },
  activeLlamaName: {
    color: '#8A85A0',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
});
