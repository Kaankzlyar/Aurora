// HomeSlider.tsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
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

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Golden Hour Collection',
    subtitle: 'Luxury watches redefined.',
    image: require('../assets/images/RolexGoldWatch.jpg'),
  },
  {
    id: '2',
    title: 'Eyewear that Elevates',
    subtitle: 'Vision meets style.',
    image: require('../assets/images/pradaEyewear0.jpg'),
  },
  {
    id: '3',
    title: 'Timeless Jewelry',
    subtitle: 'Designed for elegance.', 
    image: require('../assets/images/jewelry4.jpg'),
  },
];

export default function HomeSlider() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the slides data to prevent unnecessary re-renders
  const memoizedSlides = useMemo(() => slides, []);

  // Optimized auto-scroll with useCallback
  const scrollToNext = useCallback(() => {
    const nextIndex = (activeIndex + 1) % memoizedSlides.length;
    flatListRef.current?.scrollToIndex({ 
      index: nextIndex, 
      animated: true,
      viewPosition: 0
    });
    setActiveIndex(nextIndex);
  }, [activeIndex, memoizedSlides.length]);

  useEffect(() => {
    intervalRef.current = setInterval(scrollToNext, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [scrollToNext]);

  // Optimized viewability callback
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  }, [activeIndex]);

  // Memoized viewability config
  const viewabilityConfig = useMemo(() => ({
    viewAreaCoveragePercentThreshold: 50,
    minimumViewTime: 50,
    waitForInteraction: false
  }), []);

  // Memoized item layout
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  }), []);

  // Memoized key extractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Memoized render item
  const renderItem = useCallback(({ item }: any) => (
    <Pressable 
      style={styles.slide}
      onPress={() => router.push('/(tabs)/explore')}
    >
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
  ), [router]);

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
        snapToInterval={width}
        snapToAlignment="start"
        disableIntervalMomentum={true}
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
    borderRadius: 16, 
    overflow: 'hidden',
    backgroundColor: '#0B0B0B',
  },
  slide: {
    width: width,
    height: 260,
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
