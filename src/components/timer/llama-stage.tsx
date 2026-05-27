import { Image } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { getLlamaById } from '@/data/llamas';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useLlamasStore } from '@/stores/llamas';
import { TimerPhase } from '@/types/llama';

interface LlamaStageProps {
  phase: TimerPhase | null;
  isRunning: boolean;
}

export function LlamaStage({ phase, isRunning }: LlamaStageProps) {
  const activeLlamaId = useLlamasStore((state) => state.activeLlamaId);
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const llama = getLlamaById(activeLlamaId);

  const source = useMemo(() => {
    if (isRunning && phase === 'work') return llama.art.focus;
    if (isRunning && (phase === 'shortBreak' || phase === 'longBreak')) return llama.art.break;
    return llama.art.idle;
  }, [isRunning, llama.art.break, llama.art.focus, llama.art.idle, phase]);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 250 });
  }, [opacity, reducedMotion, source]);

  useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(withTiming(1.02, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1,
      true,
    );
  }, [reducedMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.stage}>
      <Animated.View style={[styles.imageWrap, animatedStyle]}>
        <Image source={source} style={styles.image} contentFit="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
