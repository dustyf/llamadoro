import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Llama } from '@/types/llama';

interface LlamaCardProps {
  llama: Llama;
  unlocked: boolean;
  active: boolean;
  requirement?: string;
  onPress: () => void;
}

export function LlamaCard({ llama, unlocked, active, requirement, onPress }: LlamaCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, active && styles.active]} hitSlop={4}>
      <Image source={llama.art.idle} style={styles.image} contentFit="contain" />
      <Text style={styles.name}>{llama.name}</Text>
      {!unlocked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockText}>{llama.tier === 'paid' ? 'Lock' : requirement}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 190,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    backgroundColor: '#F5F3FA',
    padding: 12,
  },
  active: {
    borderColor: '#7B68C8',
  },
  image: {
    width: '100%',
    height: 130,
  },
  name: {
    color: '#2A2040',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(42, 32, 64, 0.55)',
    padding: 10,
  },
  lockText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
});
