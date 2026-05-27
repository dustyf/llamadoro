import { StyleSheet, Text, View } from 'react-native';

import { formatCountdown } from '@/lib/timer';

interface TimerRingProps {
  progress: number;
  remainingMs: number;
  color?: string;
}

const SIZE = 190;
const STROKE = 14;

export function TimerRing({ progress, remainingMs, color = '#7B68C8' }: TimerRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const rightDegrees = clamped <= 0.5 ? clamped * 360 : 180;
  const leftDegrees = clamped > 0.5 ? (clamped - 0.5) * 360 : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.track} />
      <View style={[styles.halfClip, styles.rightClip]}>
        <View
          style={[
            styles.halfFill,
            styles.rightFill,
            { backgroundColor: color, transform: [{ rotate: `${rightDegrees}deg` }] },
          ]}
        />
      </View>
      <View style={[styles.halfClip, styles.leftClip]}>
        <View
          style={[
            styles.halfFill,
            styles.leftFill,
            { backgroundColor: color, transform: [{ rotate: `${leftDegrees}deg` }] },
          ]}
        />
      </View>
      <View style={styles.inner}>
        <Text style={styles.countdown}>{formatCountdown(remainingMs)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#C8C6D8',
  },
  halfClip: {
    position: 'absolute',
    top: 0,
    width: SIZE / 2,
    height: SIZE,
    overflow: 'hidden',
  },
  leftClip: {
    left: 0,
  },
  rightClip: {
    right: 0,
  },
  halfFill: {
    position: 'absolute',
    width: SIZE / 2,
    height: SIZE,
  },
  rightFill: {
    left: -SIZE / 2,
    borderTopLeftRadius: SIZE / 2,
    borderBottomLeftRadius: SIZE / 2,
    transformOrigin: 'right center',
  },
  leftFill: {
    right: -SIZE / 2,
    borderTopRightRadius: SIZE / 2,
    borderBottomRightRadius: SIZE / 2,
    transformOrigin: 'left center',
  },
  inner: {
    width: SIZE - STROKE * 2,
    height: SIZE - STROKE * 2,
    borderRadius: (SIZE - STROKE * 2) / 2,
    backgroundColor: '#E8E6F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdown: {
    color: '#2A2040',
    fontSize: 44,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
