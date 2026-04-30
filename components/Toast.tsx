import { BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastItemProps {
    toast: ToastConfig;
    onDismiss: (id: string) => void;
}

const TOAST_META: Record<ToastType, {
    icon: keyof typeof Ionicons.glyphMap;
    bg: string;
    border: string;
    iconColor: string;
    titleColor: string;
}> = {
    success: {
        icon: 'checkmark-circle',
        bg: '#F0FDF4',
        border: '#BBF7D0',
        iconColor: '#16A34A',
        titleColor: '#15803D',
    },
    error: {
        icon: 'alert-circle',
        bg: '#FEF2F2',
        border: '#FECACA',
        iconColor: '#DC2626',
        titleColor: '#B91C1C',
    },
    warning: {
        icon: 'warning',
        bg: '#FFFBEB',
        border: '#FDE68A',
        iconColor: '#D97706',
        titleColor: '#B45309',
    },
    info: {
        icon: 'information-circle',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        iconColor: '#2563EB',
        titleColor: '#1D4ED8',
    },
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const translateY = useRef(new Animated.Value(-80)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.92)).current;
    const meta = TOAST_META[toast.type];

    useEffect(() => {
        // Enter
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 10,
                speed: 14,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                bounciness: 8,
            }),
        ]).start();

        // Auto dismiss
        const duration = toast.duration ?? 3500;
        const timer = setTimeout(() => dismiss(), duration);
        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -80,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 0.92,
                useNativeDriver: true,
            }),
        ]).start(() => onDismiss(toast.id));
    };

    return (
        <Animated.View
            style={[
                styles.toastWrap,
                {
                    transform: [{ translateY }, { scale }],
                    opacity,
                },
            ]}
        >
            <Pressable onPress={dismiss}>
                <View style={[styles.toast, { backgroundColor: meta.bg, borderColor: meta.border }]}>
                    {/* Left accent bar */}
                    <View style={[styles.accentBar, { backgroundColor: meta.iconColor }]} />

                    {/* Icon */}
                    <View style={[styles.iconWrap, { backgroundColor: `${meta.iconColor}18` }]}>
                        <Ionicons name={meta.icon} size={22} color={meta.iconColor} />
                    </View>

                    {/* Text */}
                    <View style={styles.textWrap}>
                        <Text style={[styles.title, { color: meta.titleColor }]} numberOfLines={1}>
                            {toast.title}
                        </Text>
                        {toast.message ? (
                            <Text style={[styles.message, { color: meta.titleColor + 'CC' }]} numberOfLines={2}>
                                {toast.message}
                            </Text>
                        ) : null}
                    </View>

                    {/* Dismiss */}
                    <Pressable onPress={dismiss} hitSlop={8} style={styles.closeBtn}>
                        <Ionicons name="close" size={16} color={meta.iconColor + '99'} />
                    </Pressable>
                </View>
            </Pressable>
        </Animated.View>
    );
}

interface ToastContainerProps {
    toasts: ToastConfig[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    const insets = useSafeAreaInsets();

    if (toasts.length === 0) return null;

    return (
        <View style={[styles.container, { top: insets.top + Spacing.sm }]} pointerEvents="box-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: Spacing.lg,
        right: Spacing.lg,
        zIndex: 9999,
        gap: Spacing.sm,
    },
    toastWrap: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        overflow: 'hidden',
        minHeight: 56,
        paddingRight: Spacing.md,
    },
    accentBar: {
        width: 4,
        alignSelf: 'stretch',
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: Spacing.md,
        flexShrink: 0,
    },
    textWrap: {
        flex: 1,
        paddingVertical: Spacing.md,
        gap: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.1,
    },
    message: {
        fontSize: 12,
        lineHeight: 17,
        fontWeight: '400',
    },
    closeBtn: {
        padding: Spacing.xs,
        marginLeft: Spacing.sm,
    },
});
