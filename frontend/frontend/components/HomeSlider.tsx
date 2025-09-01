// HomeSlider.tsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import SilverText from './SilverText';
import GoldText from './GoldText';

const { width: screenWidth } = Dimensions.get('window');

// Standard slider dimensions
const SLIDER_WIDTH = screenWidth - 32; // Full width minus padding
const SLIDER_HEIGHT = 200; // Standard height

// ---- Types
type Slide = {
  id: string;
  title: string;
  subtitle: string;
  image: any;
  routeTo: string; // Direct route
  categoryFilter?: string; // Optional category filter for explore page
};

// ---- Data
const slides: Slide[] = [
  {
    id: '1',
    title: 'Golden Hour Collection',
    subtitle: 'Luxury watches redefined.',
    image: require('../assets/images/RolexGoldWatch.jpg'),
    routeTo: '/(tabs)/explore', // Watches -> Explore with filter
    categoryFilter: 'Watch',
  },
  {
    id: '2',
    title: 'Eyewear that Elevates',
    subtitle: 'Vision meets style.',
    image: require('../assets/images/pradaEyewear0.jpg'),
    routeTo: '/(tabs)/explore', // Glasses -> Explore with filter
    categoryFilter: 'Glasses', // Filter for glasses category
  },
  {
    id: '3',
    title: 'Timeless Jewelry',
    subtitle: 'Designed for elegance.',
    image: require('../assets/images/jewelry4.jpg'),
    routeTo: '/(tabs)/explore',
    categoryFilter: 'Jewelry',
  },
];

export default function HomeSlider() {
  const router = useRouter();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the slides data to prevent unnecessary re-renders
  const memoizedSlides = useMemo(() => slides, []);

  // ---- CTA handler (direct navigation to categorized pages)
  const onPressSlide = useCallback((slide: Slide) => {
    console.log(`[HomeSlider] Navigating to: ${slide.routeTo}`);
    
    // Special handling for explore page with category filter
    if (slide.routeTo === '/(tabs)/explore' && slide.categoryFilter) {
      console.log(`[HomeSlider] Applying category filter: ${slide.categoryFilter}`);
      router.push({
        pathname: '/(tabs)/explore',
        params: { 
          preSelectedCategory: slide.categoryFilter 
        },
      });
      return;
    }
    
    // Navigate directly to the specified route
    router.push(slide.routeTo);
  }, [router]);

  // Optimized auto-scroll with useCallback
  const scrollToNext = useCallback(() => {
    const nextIndex = (activeIndex + 1) % memoizedSlides.length;
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
      viewPosition: 0,
    });
    setActiveIndex(nextIndex);
  }, [activeIndex, memoizedSlides.length]);

  useEffect(() => {
    intervalRef.current = setInterval(scrollToNext, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scrollToNext]);

  // Optimized viewability callback
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const newIndex = viewableItems[0].index;
        if (typeof newIndex === 'number' && newIndex !== activeIndex) {
          setActiveIndex(newIndex);
        }
      }
    },
    [activeIndex]
  );

  // Memoized viewability config
  const viewabilityConfig = useMemo(
    () => ({
      viewAreaCoveragePercentThreshold: 50,
      minimumViewTime: 50,
      waitForInteraction: false,
    }),
    []
  );

  // Memoized item layout
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SLIDER_WIDTH,
      offset: SLIDER_WIDTH * index,
      index,
    }),
    []
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: Slide) => item.id, []);

  // Memoized render item
  const renderItem = useCallback(
    ({ item }: { item: Slide }) => (
      <Pressable style={styles.slide} onPress={() => onPressSlide(item)}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={0}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.overlay}
        />
        <View style={styles.textContainer}>
          <GoldText style={styles.title}>{item.title}</GoldText>
          <SilverText style={styles.subtitle}>{item.subtitle}</SilverText>
        </View>
      </Pressable>
    ),
    [onPressSlide]
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={memoizedSlides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        // Aggressive performance optimizations
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={1}
        windowSize={2}
        initialNumToRender={1}
        getItemLayout={getItemLayout}
        // Ultra-smooth scrolling optimizations
        decelerationRate={0.98}
        snapToInterval={SLIDER_WIDTH}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces={false}
        scrollEventThrottle={1}
        // Additional performance props
        legacyImplementation={false}
        disableVirtualization={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
      <View style={styles.dotsContainer}>
        {memoizedSlides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, activeIndex === i && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    marginHorizontal: 16, // Add horizontal margin for centering
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    overflow: 'hidden',
    backgroundColor: '#0B0B0B',
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
  },
  slide: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    position: 'relative',
    backgroundColor: '#0B0B0B',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#0B0B0B',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  textContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'CormorantGaramond_400Regular',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#777',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#C48913',
    width: 10,
    height: 10,
  },
});
