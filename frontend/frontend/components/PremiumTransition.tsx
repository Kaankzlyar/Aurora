import React, { useRef, useEffect } from 'react';
import { Animated, Easing, View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PremiumTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  animationType?: 'slideIn' | 'fadeIn' | 'scaleIn' | 'luxurySlide';
  duration?: number;
  disableGlow?: boolean;
}

export function PremiumTransition({ 
  children, 
  isVisible, 
  animationType = 'luxurySlide',
  duration = 800,
  disableGlow = false
}: PremiumTransitionProps) {
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const rotateAnim = useRef(new Animated.Value(2)).current;
  const overlayFade = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Luxury entrance animation with sophisticated timing
      Animated.sequence([
        // Sophisticated entrance with premium timing
        Animated.parallel([
          // Ultra-smooth slide with luxury curve
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: duration,
            easing: Easing.bezier(0.16, 1, 0.3, 1), // High-end easing curve
            useNativeDriver: true,
          }),
          
          // Elegant fade with perfect timing
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: duration * 0.9,
            delay: duration * 0.1,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
          
          // Premium scale effect with spring
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration * 1.1,
            delay: duration * 0.15,
            easing: Easing.out(Easing.back(1.05)), // Subtle luxury spring
            useNativeDriver: true,
          }),
          
          // Sophisticated rotation entrance
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: duration * 1.2,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            useNativeDriver: true,
          }),
          
          // Conditional glow effect
          ...(disableGlow ? [] : [
            Animated.sequence([
              Animated.delay(duration * 0.4),
              Animated.timing(glowAnim, {
                toValue: 0.3,
                duration: duration * 0.8,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 0,
                duration: duration * 0.4,
                easing: Easing.bezier(0.4, 0.0, 0.6, 1),
                useNativeDriver: true,
              }),
            ])
          ]),
        ]),
      ]).start();
    } else {
      // Reset animations when not visible
      fadeAnim.setValue(0);
      slideAnim.setValue(screenWidth);
      scaleAnim.setValue(0.85);
      rotateAnim.setValue(2);
      overlayFade.setValue(0);
      glowAnim.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Premium overlay with gradient */}
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: overlayFade,
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(20,20,20,0.7)', 'rgba(0,0,0,0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Conditional luxury glow effect */}
      {!disableGlow && (
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: glowAnim,
              transform: [
                { scale: Animated.add(1, Animated.multiply(glowAnim, 0.1)) }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(212,175,55,0.08)',
              'rgba(212,175,55,0.04)',
              'rgba(212,175,55,0.02)',
              'transparent'
            ]}
            style={styles.glow}
          />
        </Animated.View>
      )}

      {/* Main content with premium animations */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim },
              { 
                rotateY: rotateAnim.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                })
              }
            ]
          }
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  glowContainer: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '20%',
    zIndex: 2,
  },
  glow: {
    flex: 1,
    borderRadius: 20,
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    zIndex: 3,
  },
});

export default PremiumTransition;
