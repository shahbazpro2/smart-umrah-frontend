import React, { useEffect, useState } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeIn({ children, duration = 500, delay = 0, style }: FadeInProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

export function SlideIn({
  children,
  direction = 'up',
  duration = 400,
  delay = 0,
  distance = 50,
  style,
}: SlideInProps) {
  const [slideAnim] = useState(new Animated.Value(distance));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, delay]);

  const getTranslation = () => {
    switch (direction) {
      case 'left':
        return { translateX: slideAnim };
      case 'right':
        return { translateX: Animated.multiply(slideAnim, -1) };
      case 'up':
        return { translateY: slideAnim };
      case 'down':
        return { translateY: Animated.multiply(slideAnim, -1) };
      default:
        return { translateY: slideAnim };
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: [getTranslation()],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
