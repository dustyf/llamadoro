import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  currentStreak,
  last7DaysCounts,
  longestStreak,
  todayCount,
  totalCount,
  useStatsStore,
  weekCount,
} from '@/stores/stats';

export default function StatsScreen() {
  const sessions = useStatsStore((state) => state.sessions);
  const sessionTotal = totalCount(sessions);
  const bars = last7DaysCounts(sessions);
  const max = Math.max(1, ...bars);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Stats</Text>
        {sessions.length === 0 || sessionTotal === 0 ? (
          <View style={styles.empty}>
            <Image
              source={require('@/assets/images/llama-placeholder.png')}
              style={styles.emptyImage}
              contentFit="contain"
            />
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete your first focus session to start tracking your streak.
            </Text>
            <Pressable style={styles.emptyButton} onPress={() => router.push('/')}>
              <Text style={styles.emptyButtonText}>Start Focusing</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              <Stat label="Today" value={todayCount(sessions)} />
              <Stat label="This Week" value={weekCount(sessions)} />
              <Stat label="Current Streak" value={`${currentStreak(sessions)} \u{1F525}`} />
              <Stat label="Longest Streak" value={longestStreak(sessions)} />
              <Stat label="Total Sessions" value={sessionTotal} wide />
            </View>
            <Text style={styles.chartTitle}>Last 7 Days</Text>
            <View style={styles.chart}>
              {bars.map((count, index) => (
                <View key={index} style={styles.barSlot}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${Math.max(8, (count / max) * 100)}%` as `${number}%` },
                    ]}
                  />
                  <Text style={styles.barLabel}>{count}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value, wide }: { label: string; value: string | number; wide?: boolean }) {
  return (
    <View style={[styles.stat, wide && styles.wideStat]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E8E6F5',
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 18,
  },
  title: {
    color: '#2A2040',
    fontSize: 28,
    fontWeight: '800',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 56,
  },
  emptyImage: {
    width: 210,
    height: 210,
  },
  emptyTitle: {
    color: '#2A2040',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 18,
  },
  emptySubtitle: {
    color: '#5A5070',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
    marginTop: 8,
    maxWidth: 300,
    textAlign: 'center',
  },
  emptyButton: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#7B68C8',
    marginTop: 24,
    paddingVertical: 15,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stat: {
    width: '48%',
    borderRadius: 8,
    backgroundColor: '#F7F5FC',
    padding: 16,
  },
  wideStat: {
    width: '100%',
  },
  statValue: {
    color: '#2A2040',
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    color: '#5A5070',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  chartTitle: {
    color: '#2A2040',
    fontSize: 18,
    fontWeight: '800',
  },
  chart: {
    height: 190,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderRadius: 8,
    backgroundColor: '#F7F5FC',
    padding: 16,
  },
  barSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: '#7B68C8',
  },
  barLabel: {
    color: '#5A5070',
    fontSize: 12,
    fontWeight: '700',
  },
});
