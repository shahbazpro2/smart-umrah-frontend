import { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';

interface Props {
    onPress?: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
}

export function AnimatedPressable({ onPress, disabled, style, children }: Props) {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () =>
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();

    const onPressOut = () =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 8 }).start();

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={disabled}
                style={style}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
}
