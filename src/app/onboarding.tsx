import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettingsStore } from '@/stores/settings';

const slides = [
  {
    key: 'meet',
    title: 'Meet your llama.',
    subtitle: 'Pedro is here to help you focus, one session at a time.',
    art: 'llama',
  },
  {
    key: 'focus',
    title: '25 minutes of focus.',
    subtitle: 'Work in focused bursts. Your llama celebrates every session.',
    art: 'timer',
  },
] as const;

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const currentSlideRef = useRef(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextSlide = Math.round(event.nativeEvent.contentOffset.x / width);
    if (nextSlide !== currentSlideRef.current) {
      currentSlideRef.current = nextSlide;
      setCurrentSlide(nextSlide);
    }
  }

  function handleNext() {
    if (currentSlide === 0) {
      scrollRef.current?.scrollTo({ x: width, animated: true });
      return;
    }
    useSettingsStore.getState().setHasCompletedOnboarding(true);
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {slides.map((slide) => (
          <View key={slide.key} style={[styles.slide, { width }]}>
            <View style={styles.card}>
              {slide.art === 'llama' ? (
                <Image
                  source={require('@/assets/llamas/pedro-idle.png')}
                  style={styles.llama}
                  contentFit="contain"
                />
              ) : (
                <View style={styles.emojiCircle}>
                  <Text style={styles.emoji}>⏱</Text>
                </View>
              )}
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <View
              key={slide.key}
              style={[styles.dot, index === currentSlide && styles.dotActive]}
            />
          ))}
        </View>
        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{currentSlide === 0 ? 'Next' : "Let's start"}</Text>
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
  slide: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F7F5FC',
    padding: 28,
  },
  llama: {
    width: '100%',
    height: 260,
  },
  emojiCircle: {
    width: 210,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 105,
    backgroundColor: '#FFFFFF',
    marginVertical: 25,
  },
  emoji: {
    fontSize: 96,
  },
  title: {
    color: '#2A2040',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 18,
    textAlign: 'center',
  },
  subtitle: {
    color: '#5A5070',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    gap: 22,
    padding: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B9AEE5',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#7B68C8',
  },
  button: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#7B68C8',
    paddingVertical: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
