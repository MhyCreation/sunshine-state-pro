import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useWalletStore } from '@/lib/store';
import { getWallet } from '@/lib/actions';

function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const { setWallet } = useWalletStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) router.replace('/(auth)/login');
    else if (session && inAuthGroup) router.replace('/(tabs)');
  }, [session, initialized, segments]);

  useEffect(() => {
    if (!session) return;
    getWallet().then((w) => {
      if (w) setWallet(Number(w.gold_coins), parseFloat(String(w.sweeps_coins)));
    });
  }, [session]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f1117' } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthGate>
    </>
  );
}
