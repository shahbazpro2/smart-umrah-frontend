import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { memo, ReactNode, useCallback, useRef } from 'react';
import {
    Animated,
    KeyboardTypeOptions,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface Props {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    secureTextEntry?: boolean;
    editable?: boolean;
    rightElement?: ReactNode;
}

export const InputField = memo(function InputField({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    autoCapitalize = 'none',
    secureTextEntry,
    editable = true,
    rightElement,
}: Props) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Animate border color on focus — no setState, no re-render
    const borderAnim = useRef(new Animated.Value(0)).current;
    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.primary],
    });
    const iconColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.icon, colors.primary],
    });
    const shadowOpacity = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.15],
    });

    const onFocus = useCallback(() => {
        Animated.timing(borderAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [borderAnim]);

    const onBlur = useCallback(() => {
        Animated.timing(borderAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [borderAnim]);

    return (
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.icon }]}>{label}</Text>
            <Animated.View
                style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: editable ? colors.card : colors.cardAlt,
                        borderColor,
                        shadowColor: '#6366F1',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity,
                        shadowRadius: 6,
                        elevation: 0,
                    },
                ]}
            >
                <Animated.View style={{ justifyContent: 'center' }}>
                    <Ionicons
                        name={icon}
                        size={18}
                        // Ionicons doesn't accept Animated color — use a static fallback
                        color={colors.icon}
                    />
                </Animated.View>
                <TextInput
                    style={[styles.input, { color: editable ? colors.text : colors.icon }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.icon}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    secureTextEntry={secureTextEntry}
                    editable={editable}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                {rightElement}
            </Animated.View>
        </View>
    );
});

const styles = StyleSheet.create({
    inputGroup: { gap: Spacing.xs },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        paddingHorizontal: Spacing.md,
        height: 50,
        gap: Spacing.md,
    },
    input: { flex: 1, fontSize: 15 },
});
