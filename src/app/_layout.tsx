import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'jotai';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/OfflineBanner';
import { AuthProvider, useAuth } from '@/store/auth.context';
import { NetworkProvider } from '@/store/network.context';
import { ToastProvider } from '@/store/toast.context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      gcTime: 1000 * 60 * 10,
      staleTime: 1000 * 60 * 2,
    },
  },
});

function RootLayoutContent() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!token && !inAuth) {
      hasRedirected.current = true;
      router.replace('/(auth)/login');
    } else if (token && inAuth) {
      hasRedirected.current = true;
      router.replace('/(tabs)');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    // Single root SafeAreaView — all screens inherit top/bottom insets from here.
    // Individual screens should NOT add edges={['top']} or edges={['bottom']}
    // unless they need to override (e.g. a screen with a custom background header).
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <OfflineBanner />
      <Slot />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NetworkProvider>
              <ToastProvider>
                <RootLayoutContent />
              </ToastProvider>
            </NetworkProvider>
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
});
