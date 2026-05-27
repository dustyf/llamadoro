import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemePreference, useSettingsStore } from '@/stores/settings';

export default function SettingsScreen() {
  const settings = useSettingsStore();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Section title="Timer Settings">
          <LockedRow label="Work length" value={`${settings.workMinutes} min`} />
          <LockedRow label="Short break" value={`${settings.shortBreakMinutes} min`} />
          <LockedRow label="Long break" value={`${settings.longBreakMinutes} min`} />
          <LockedRow label="Long break every" value={`${settings.longBreakEvery} sessions`} />
        </Section>
        <Section title="Preferences">
          <ToggleRow label="Sound" value={settings.soundEnabled} onValueChange={settings.setSoundEnabled} />
          <ToggleRow label="Haptics" value={settings.hapticsEnabled} onValueChange={settings.setHapticsEnabled} />
          <ToggleRow
            label="Reduced motion"
            value={settings.reducedMotion}
            onValueChange={settings.setReducedMotion}
          />
          <ToggleRow label="Keep awake" value={settings.keepAwake} onValueChange={settings.setKeepAwake} />
          <ThemeRow value={settings.theme} onChange={settings.setTheme} />
          <Pressable
            style={styles.row}
            onPress={() => Alert.alert('Restore Purchases', 'Nothing to restore')}
          >
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

function LockedRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={[styles.row, styles.disabled]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>Lock {value}</Text>
    </View>
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
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: '#B9AEE5' }} thumbColor={value ? '#7B68C8' : '#F7F5FC'} />
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
            style={[styles.segment, value === option && styles.segmentActive]}
          >
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
  disabled: {
    opacity: 0.55,
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
