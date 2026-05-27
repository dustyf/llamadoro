import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

interface PersonalityLineProps {
  text: string;
  reducedMotion: boolean;
}

export function PersonalityLine({ text, reducedMotion }: PersonalityLineProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!text) {
      opacity.value = 0;
      return;
    }

    if (reducedMotion) {
      opacity.value = 1;
      opacity.value = withDelay(3000, withTiming(0, { duration: 0 }));
      return;
    }

    opacity.value = withTiming(1, { duration: 300 }, () => {
      opacity.value = withDelay(3000, withTiming(0, { duration: 300 }));
    });
  }, [opacity, reducedMotion, text]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!text) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, animatedStyle]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '44%',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  text: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: 'rgba(42, 32, 64, 0.82)',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    textAlign: 'center',
  },
});
