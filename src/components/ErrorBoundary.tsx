import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    State
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, info);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.emoji}>⚠️</Text>
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </Text>
                    <Pressable onPress={this.handleRetry} style={styles.btn}>
                        <Text style={styles.btnText}>Try Again</Text>
                    </Pressable>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#FAFAFA',
        gap: 12,
    },
    emoji: { fontSize: 48 },
    title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
    message: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
    btn: {
        marginTop: 8,
        backgroundColor: '#6366F1',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 12,
    },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
