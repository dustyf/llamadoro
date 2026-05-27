import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaywallScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Full Collection - $2.99</Text>
        <View style={styles.props}>
          <Text style={styles.prop}>Unlock 35 premium llamas</Text>
          <Text style={styles.prop}>Keep every starter and milestone llama</Text>
          <Text style={styles.prop}>One collection, no subscription</Text>
        </View>
        <Pressable
          style={styles.purchase}
          onPress={() => Alert.alert('Coming soon', 'Coming soon - IAP not yet configured.')}
        >
          <Text style={styles.purchaseText}>Purchase</Text>
        </Pressable>
        <Pressable
          style={styles.restore}
          onPress={() => Alert.alert('Restore Purchases', 'Nothing to restore.')}
        >
          <Text style={styles.restoreText}>Restore</Text>
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
    justifyContent: 'center',
    gap: 18,
    padding: 24,
  },
  title: {
    color: '#2A2040',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  props: {
    gap: 10,
    marginBottom: 12,
  },
  prop: {
    color: '#5A5070',
    fontSize: 17,
    fontWeight: '700',
  },
  purchase: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#7B68C8',
    paddingVertical: 16,
  },
  purchaseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  restore: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  restoreText: {
    color: '#7B68C8',
    fontSize: 16,
    fontWeight: '800',
  },
});
