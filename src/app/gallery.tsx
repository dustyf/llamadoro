import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccessoryPicker } from '@/components/gallery/accessory-picker';
import { LlamaCard } from '@/components/gallery/llama-card';
import { LLAMAS } from '@/data/llamas';
import { useLlamasStore } from '@/stores/llamas';
import { Llama } from '@/types/llama';

function requirementText(llama: Llama): string | undefined {
  if (llama.unlockCondition.type === 'sessions') return `${llama.unlockCondition.count} sessions`;
  if (llama.unlockCondition.type === 'streak') return `${llama.unlockCondition.days}-day streak`;
  return undefined;
}

export default function GalleryScreen() {
  const { activeLlamaId, unlockedIds, setActiveLlama } = useLlamasStore();
  const [pickerLlamaId, setPickerLlamaId] = useState<string | null>(null);
  const pickerLlama = LLAMAS.find((llama) => llama.id === pickerLlamaId);

  function handlePress(llama: Llama) {
    const unlocked = unlockedIds.includes(llama.id);
    if (unlocked) {
      if (llama.id === activeLlamaId) {
        setPickerLlamaId(llama.id);
        return;
      }
      setActiveLlama(llama.id);
      return;
    }
    if (llama.tier === 'paid') {
      router.push('/paywall');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Gallery</Text>
      </View>
      <FlashList
        data={LLAMAS}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <LlamaCard
              llama={item}
              unlocked={unlockedIds.includes(item.id)}
              active={activeLlamaId === item.id}
              requirement={requirementText(item)}
              onPress={() => handlePress(item)}
              onCustomize={
                unlockedIds.includes(item.id) && activeLlamaId === item.id
                  ? () => setPickerLlamaId(item.id)
                  : undefined
              }
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <AccessoryPicker
        llamaId={pickerLlamaId ?? ''}
        llamaName={pickerLlama?.name ?? ''}
        visible={pickerLlamaId !== null}
        onClose={() => setPickerLlamaId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E8E6F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    color: '#2A2040',
    fontSize: 28,
    fontWeight: '800',
  },
  list: {
    padding: 12,
  },
  item: {
    flex: 1,
    padding: 8,
  },
});
