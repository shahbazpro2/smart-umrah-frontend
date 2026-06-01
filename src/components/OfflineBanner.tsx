import { useNetwork } from '@/store/network.context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function OfflineBanner() {
    const { isOnline } = useNetwork();
    const insets = useSafeAreaInsets();
    const BANNER_HEIGHT = 36;
    // Start hidden above the safe area top
    const translateY = useRef(new Animated.Value(-(insets.top + BANNER_HEIGHT))).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isOnline) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 4,
                }),
                Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -(insets.top + BANNER_HEIGHT),
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();
        }
    }, [isOnline, insets.top]);

    return (
        <Animated.View
            style={[
                styles.banner,
                {
                    // Sit right below the status bar
                    top: insets.top,
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={styles.text}>You're offline — using cached data</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 999,
        backgroundColor: '#F59E0B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 36,
        paddingHorizontal: 16,
    },
    text: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
