import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PermissionBanner } from '@/components/timer/permission-banner';
import { DEFAULT_CONFIG, formatCountdown, phaseProgress } from '@/lib/timer';
import { requestNotificationPermissions } from '@/lib/notifications';
import { useNotificationPermission } from '@/hooks/use-notification-permission';
import { useTimerStore } from '@/stores/timer';

const PHASE_LABELS: Record<string, string> = {
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
    start,
    pause,
    resume,
    reset,
    skip,
    tick,
  } = useTimerStore();

  const { status: permStatus, openSettings } = useNotificationPermission();

  // Foreground tick — 250ms interval. Does NOT write to storage.
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const now = Date.now();
      tick(now);

      // Foreground session-end detection
      if (endTimestamp && now >= endTimestamp) {
        const state = useTimerStore.getState();
        if (state.sessionId && state.isRunning) {
          state.commitPhaseCompletion({
            sessionId: state.sessionId,
            phaseIndex: state.phaseIndex,
            phase: state.phase,
            config: DEFAULT_CONFIG,
          });
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [isRunning, endTimestamp, tick]);

  async function handleStart() {
    // Request permissions on first session start, not on launch
    await requestNotificationPermissions();
    await start(DEFAULT_CONFIG);
  }

  const progress = endTimestamp
    ? phaseProgress(endTimestamp, Date.now(), phase, DEFAULT_CONFIG)
    : 1;

  const isPaused =
    !isRunning && displayRemainingMs < DEFAULT_CONFIG.workMs && displayRemainingMs > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {permStatus === 'denied' && <PermissionBanner onOpenSettings={openSettings} />}

      <View style={styles.container}>
        <Text style={styles.phaseLabel}>{PHASE_LABELS[phase] ?? phase}</Text>

        <Text style={styles.countdown}>{formatCountdown(displayRemainingMs)}</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
        </View>

        <View style={styles.controls}>
          {!isRunning && !isPaused ? (
            <ControlButton label="Start" onPress={handleStart} primary />
          ) : isRunning ? (
            <>
              <ControlButton label="Pause" onPress={() => pause()} />
              <ControlButton label="Skip" onPress={() => skip(DEFAULT_CONFIG)} />
              <ControlButton label="Reset" onPress={() => reset()} />
            </>
          ) : (
            <>
              <ControlButton label="Resume" onPress={() => resume(DEFAULT_CONFIG)} primary />
              <ControlButton label="Reset" onPress={() => reset()} />
            </>
          )}
        </View>

        <SessionCount />
      </View>
    </SafeAreaView>
  );
}

function SessionCount() {
  const completedWorkSessions = useTimerStore((s) => s.completedWorkSessions);
  return (
    <Text style={styles.sessionCount}>
      {completedWorkSessions} {completedWorkSessions === 1 ? 'session' : 'sessions'} completed
    </Text>
  );
}

function ControlButton({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, primary && styles.buttonPrimary]}
      hitSlop={8}
    >
      <Text style={[styles.buttonText, primary && styles.buttonTextPrimary]}>{label}</Text>
    </Pressable>
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
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 32,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5A5070',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  countdown: {
    fontSize: 80,
    fontWeight: '300',
    color: '#2A2040',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#C8C6D8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7B68C8',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#D8D6E8',
  },
  buttonPrimary: {
    backgroundColor: '#7B68C8',
    paddingHorizontal: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4060',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  sessionCount: {
    fontSize: 14,
    color: '#8A85A0',
    marginTop: 8,
  },
});
