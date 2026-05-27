import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TimerControlsProps {
  isRunning: boolean;
  canSkip: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerControls({
  isRunning,
  canSkip,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
}: TimerControlsProps) {
  return (
    <View style={styles.controls}>
      {isRunning ? (
        <Button label="Pause" accessibilityLabel="Pause timer" onPress={onPause} primary />
      ) : canSkip ? (
        <Button label="Resume" accessibilityLabel="Resume timer" onPress={onResume} primary />
      ) : (
        <Button label="Start" accessibilityLabel="Start focus session" onPress={onStart} primary />
      )}
      <View style={styles.secondaryRow}>
        <Button label="Reset" accessibilityLabel="Reset timer" onPress={onReset} />
        <Button
          label="Skip"
          accessibilityLabel="Skip to next phase"
          onPress={onSkip}
          disabled={!canSkip && !isRunning}
        />
      </View>
    </View>
  );
}

function Button({
  label,
  accessibilityLabel,
  onPress,
  primary,
  disabled,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      style={[styles.button, primary && styles.primary, disabled && styles.disabled]}
      hitSlop={8}>
      <Text
        style={[styles.buttonText, primary && styles.primaryText, disabled && styles.disabledText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controls: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    minWidth: 112,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#D8D6E8',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primary: {
    minWidth: 190,
    backgroundColor: '#7B68C8',
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#4A4060',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  disabledText: {
    color: '#6F6880',
  },
});
