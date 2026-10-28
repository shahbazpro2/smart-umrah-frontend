import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'jotai';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/store/auth.context';
import { ToastProvider } from '@/store/toast.context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 1000 * 60 * 5,
    },
  },
});

function RootLayoutContent() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  // Track whether we've done the initial redirect so we don't repeat it
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't do anything while auth is still resolving
    if (loading) return;

    const inAuth = segments[0] === '(auth)';

    if (!token && !inAuth) {
      hasRedirected.current = true;
      router.replace('/(auth)/login');
    } else if (token && inAuth) {
      hasRedirected.current = true;
      router.replace('/(tabs)');
    }
    // Only re-run when token or loading changes — NOT on segment changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loading]);

  // Block rendering entirely until auth is resolved — prevents any flash
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Slot />
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <RootLayoutContent />
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
