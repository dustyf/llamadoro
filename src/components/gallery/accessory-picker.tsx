import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ACCESSORIES } from '@/data/accessories';
import { useEntitlements } from '@/hooks/use-entitlements';
import { useLlamasStore } from '@/stores/llamas';
import { Accessory, AccessorySlot } from '@/types/accessory';

interface AccessoryPickerProps {
  llamaId: string;
  llamaName: string;
  visible: boolean;
  onClose: () => void;
}

const SLOT_LABELS: Record<AccessorySlot, string> = {
  head: 'Head',
  neck: 'Neck',
  prop: 'Prop',
};

const SLOTS: AccessorySlot[] = ['head', 'neck', 'prop'];

export function AccessoryPicker({ llamaId, llamaName, visible, onClose }: AccessoryPickerProps) {
  const { hasFullUnlock } = useEntitlements();
  const equipped = useLlamasStore((state) => state.equipped[llamaId] ?? {});

  function handleAccessoryPress(accessory: Accessory) {
    const selected = equipped[accessory.slot] === accessory.id;

    if (selected) {
      useLlamasStore.getState().unequipAccessory(llamaId, accessory.slot);
      return;
    }

    if (accessory.tier === 'paid' && !hasFullUnlock) {
      router.push('/paywall');
      onClose();
      return;
    }

    useLlamasStore.getState().equipAccessory(llamaId, accessory.slot, accessory.id);
  }

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.closePlaceholder} />
          <Text style={styles.title}>{llamaName}</Text>
          <Pressable
            accessibilityLabel="Close accessory picker"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onClose}
            style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </Pressable>
        </View>

        {ACCESSORIES.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🦙</Text>
            <Text style={styles.emptyTitle}>Accessories coming soon</Text>
            <Text style={styles.emptySubtitle}>Unique hats, scarves and props are on their way.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {SLOTS.map((slot) => {
              const accessories = ACCESSORIES.filter((accessory) => accessory.slot === slot);
              if (accessories.length === 0) return null;

              return (
                <View key={slot} style={styles.group}>
                  <Text style={styles.slotLabel}>{SLOT_LABELS[slot]}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.row}>
                    {accessories.map((accessory) => (
                      <AccessoryCell
                        key={accessory.id}
                        accessory={accessory}
                        selected={equipped[slot] === accessory.id}
                        onPress={() => handleAccessoryPress(accessory)}
                      />
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

interface AccessoryCellProps {
  accessory: Accessory;
  selected: boolean;
  onPress: () => void;
}

function AccessoryCell({ accessory, selected, onPress }: AccessoryCellProps) {
  return (
    <Pressable
      accessibilityLabel={accessory.name}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.cell, selected && styles.cellSelected]}>
      <Image source={accessory.asset} style={styles.cellImage} contentFit="contain" />
      <Text style={styles.cellName} numberOfLines={2}>
        {accessory.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D8D3EA',
    marginBottom: 10,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8D3EA',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  closePlaceholder: {
    width: 36,
  },
  title: {
    flex: 1,
    color: '#2A2040',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F7F5FC',
  },
  closeText: {
    color: '#2A2040',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#2A2040',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#5A5070',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  group: {
    marginBottom: 26,
  },
  slotLabel: {
    color: '#2A2040',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  row: {
    gap: 12,
    paddingRight: 20,
  },
  cell: {
    width: 104,
    minHeight: 130,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    backgroundColor: '#F7F5FC',
    padding: 10,
  },
  cellSelected: {
    borderColor: '#7B68C8',
  },
  cellImage: {
    width: 72,
    height: 72,
    marginBottom: 10,
  },
  cellName: {
    color: '#2A2040',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
