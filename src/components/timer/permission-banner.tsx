import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface PermissionBannerProps {
  onOpenSettings: () => void;
}

// Shown on the timer screen when notification permission is denied.
// Foreground timer continues to work normally — this is informational only.
export function PermissionBanner({ onOpenSettings }: PermissionBannerProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="small" style={styles.message}>
        Background alerts require notification permission.
      </ThemedText>
      <Pressable onPress={onOpenSettings} style={styles.button} hitSlop={8}>
        <ThemedText type="smallBold" style={styles.buttonText}>
          Open Settings
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFEAA7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  message: {
    flex: 1,
    color: '#6B5A00',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0D000',
    borderRadius: 6,
  },
  buttonText: {
    color: '#3A2E00',
  },
});
