import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getLlamaById } from '@/data/llamas';
import { pickLine } from '@/lib/personality';
import { useLlamasStore } from '@/stores/llamas';

export default function UnlockScreen() {
  const pendingUnlockIds = useLlamasStore((state) => state.pendingUnlockIds);
  const consumeNextPendingUnlock = useLlamasStore((state) => state.consumeNextPendingUnlock);
  const llama = pendingUnlockIds[0] ? getLlamaById(pendingUnlockIds[0]) : null;

  useEffect(() => {
    if (pendingUnlockIds.length === 0) {
      router.back();
    }
  }, [pendingUnlockIds.length]);

  if (!llama) return null;

  function dismiss() {
    consumeNextPendingUnlock();
    const remaining = useLlamasStore.getState().pendingUnlockIds;
    if (remaining.length === 0) {
      router.back();
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image source={llama.art.idle} style={styles.image} contentFit="contain" />
        <Text style={styles.kicker}>New llama unlocked!</Text>
        <Text style={styles.name}>{llama.name}</Text>
        <Text style={styles.line}>{pickLine(llama, 'greeting')}</Text>
        <Pressable style={styles.button} onPress={dismiss}>
          <Text style={styles.buttonText}>Let's go!</Text>
        </Pressable>
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
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  image: {
    width: '90%',
    height: 320,
  },
  kicker: {
    color: '#7B68C8',
    fontSize: 18,
    fontWeight: '800',
  },
  name: {
    color: '#2A2040',
    fontSize: 40,
    fontWeight: '900',
  },
  line: {
    color: '#5A5070',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    minWidth: 180,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#7B68C8',
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
