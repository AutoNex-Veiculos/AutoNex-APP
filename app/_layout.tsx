import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/query-client';
import { setUnauthorizedHandler } from '@/lib/api/client';
import { useAuthStore } from '@/features/auth/auth-store';
import { colors } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const ready = useAuthStore((s) => s.ready);
  const hasSession = useAuthStore((s) => !!s.session);

  useEffect(() => {
    setUnauthorizedHandler(() => useAuthStore.getState().clearSession());
    void useAuthStore.getState().hydrate();
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Protected guard={hasSession}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
          <Stack.Protected guard={!hasSession}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
