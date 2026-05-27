import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePurchasesStore } from '@/stores/purchases';
import { ThemePreference, useSettingsStore } from '@/stores/settings';

export default function SettingsScreen() {
  const settings = useSettingsStore();
  const hasFullUnlock = usePurchasesStore((state) => state.entitlements.fullUnlock);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Section title="Timer Settings">
          <StepperRow
            label="Work length"
            value={settings.workMinutes}
            suffix="min"
            min={5}
            max={90}
            step={5}
            hasFullUnlock={hasFullUnlock}
            onChange={settings.setWorkMinutes}
          />
          <StepperRow
            label="Short break"
            value={settings.shortBreakMinutes}
            suffix="min"
            min={1}
            max={30}
            step={1}
            hasFullUnlock={hasFullUnlock}
            onChange={settings.setShortBreakMinutes}
          />
          <StepperRow
            label="Long break"
            value={settings.longBreakMinutes}
            suffix="min"
            min={5}
            max={60}
            step={5}
            hasFullUnlock={hasFullUnlock}
            onChange={settings.setLongBreakMinutes}
          />
          <StepperRow
            label="Long break every"
            value={settings.longBreakEvery}
            suffix="sessions"
            min={2}
            max={8}
            step={1}
            hasFullUnlock={hasFullUnlock}
            onChange={settings.setLongBreakEvery}
          />
        </Section>
        <Section title="Preferences">
          <ToggleRow
            label="Sound"
            value={settings.soundEnabled}
            onValueChange={settings.setSoundEnabled}
          />
          <ToggleRow
            label="Haptics"
            value={settings.hapticsEnabled}
            onValueChange={settings.setHapticsEnabled}
          />
          <ToggleRow
            label="Reduced motion"
            value={settings.reducedMotion}
            onValueChange={settings.setReducedMotion}
          />
          <ToggleRow
            label="Keep awake"
            value={settings.keepAwake}
            onValueChange={settings.setKeepAwake}
          />
          <ThemeRow value={settings.theme} onChange={settings.setTheme} />
          <Pressable
            style={styles.row}
            onPress={() => Alert.alert('Restore Purchases', 'Nothing to restore')}>
            <Text style={styles.rowLabel}>Restore Purchases</Text>
          </Pressable>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

function StepperRow({
  label,
  value,
  suffix,
  min,
  max,
  step,
  hasFullUnlock,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  hasFullUnlock: boolean;
  onChange: (value: number) => void;
}) {
  function handleLockedPress() {
    Alert.alert('Upgrade to Premium to customize your timer intervals.');
    router.push('/paywall');
  }

  function handleChange(direction: -1 | 1) {
    if (!hasFullUnlock) {
      handleLockedPress();
      return;
    }
    onChange(Math.min(max, Math.max(min, value + direction * step)));
  }

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.stepper}>
        <StepperButton
          label="-"
          disabled={!hasFullUnlock || value <= min}
          onPress={() => handleChange(-1)}
        />
        <Text style={styles.rowValue}>
          {value} {suffix}
        </Text>
        <StepperButton
          label="+"
          disabled={!hasFullUnlock || value >= max}
          onPress={() => handleChange(1)}
        />
      </View>
    </View>
  );
}

function StepperButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={[styles.stepperButton, disabled && styles.stepperButtonDisabled]}
      hitSlop={8}>
      <Text style={[styles.stepperButtonText, disabled && styles.stepperButtonTextDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: '#B9AEE5' }}
        thumbColor={value ? '#7B68C8' : '#F7F5FC'}
      />
    </View>
  );
}

function ThemeRow({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
}) {
  const options: ThemePreference[] = ['auto', 'light', 'dark'];
  return (
    <View style={styles.themeRow}>
      <Text style={styles.rowLabel}>Theme</Text>
      <View style={styles.segmented}>
        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segment, value === option && styles.segmentActive]}>
            <Text style={[styles.segmentText, value === option && styles.segmentTextActive]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E8E6F5',
  },
  container: {
    padding: 20,
    gap: 20,
  },
  title: {
    color: '#2A2040',
    fontSize: 28,
    fontWeight: '800',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: '#5A5070',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  rows: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#F7F5FC',
  },
  row: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8D6E8',
    paddingHorizontal: 16,
  },
  rowLabel: {
    color: '#2A2040',
    fontSize: 16,
    fontWeight: '700',
  },
  rowValue: {
    color: '#5A5070',
    fontSize: 14,
    fontWeight: '700',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#7B68C8',
  },
  stepperButtonDisabled: {
    backgroundColor: '#D8D6E8',
  },
  stepperButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  stepperButtonTextDisabled: {
    color: '#6F6880',
  },
  themeRow: {
    gap: 10,
    padding: 16,
  },
  segmented: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#E8E6F5',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: '#7B68C8',
  },
  segmentText: {
    color: '#5A5070',
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
});
