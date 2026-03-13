import { BackgroundTexture } from '@/components/layout/BackgroundTexture';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'The Noise',
    description: 'Every day, thousands of intrusive messages try to breach your peace. We calls it "Brain Slop".',
    icon: 'message-alert-outline',
    color: '#ff007a',
  },
  {
    id: '2',
    title: 'The Shield',
    description: 'Aegis uses neural networks to analyze and neutralize threats before they reach your focus.',
    icon: 'shield-star-outline',
    color: '#00f5ff',
  },
  {
    id: '3',
    title: 'The Silence',
    description: 'Total relief. Smart protection that stays silent until it matters. Welcome to Aegis.',
    icon: 'leaf',
    color: '#00ffaa',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('@onboarding_complete', 'true');
      router.replace('/(tabs)');
    }
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          <View style={[styles.glow, { backgroundColor: item.color }]} />
          <MaterialCommunityIcons name={item.icon as any} size={100} color={item.color} />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BackgroundTexture />
      <FlatList
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: SLIDES[currentIndex].color },
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize['4xl'],
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '300',
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  },
  button: {
    width: width - 80,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    color: '#000',
    fontSize: FontSize.xl,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
