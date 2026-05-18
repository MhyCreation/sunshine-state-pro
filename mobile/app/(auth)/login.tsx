import { useRef, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Animated,
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { GoldButton } from '@/components/ui/GoldButton';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shake = useRef(new Animated.Value(0)).current;

  function triggerShake() {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function login() {
    if (!email || !password) { setError('Please fill in all fields'); triggerShake(); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); triggerShake(); }
    setLoading(false);
  }

  return (
    <LinearGradient colors={['#080c14', '#0d1321', '#080c14']} style={s.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
        <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">

          {/* Hero */}
          <View style={s.hero}>
            <LinearGradient colors={['rgba(245,200,66,0.15)', 'transparent']} style={s.heroBg} />
            <Text style={s.heroEmoji}>☀️</Text>
            <Text style={s.heroTitle}>SunshineSpins</Text>
            <Text style={s.heroSub}>Sweepstakes Casino</Text>
          </View>

          {/* Form card */}
          <Animated.View style={[s.card, { transform: [{ translateX: shake }] }]}>
            <LinearGradient colors={['#141b2d', '#0d1321']} style={s.cardInner}>
              <Text style={s.formTitle}>Welcome back</Text>
              <Text style={s.formSub}>Sign in to your account</Text>

              <View style={s.fields}>
                <View style={s.fieldWrap}>
                  <Text style={s.fieldLabel}>Email</Text>
                  <TextInput
                    style={s.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#3a4260"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    selectionColor="#f5c842"
                  />
                </View>

                <View style={s.fieldWrap}>
                  <Text style={s.fieldLabel}>Password</Text>
                  <TextInput
                    style={s.input}
                    placeholder="••••••••"
                    placeholderTextColor="#3a4260"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    selectionColor="#f5c842"
                  />
                </View>
              </View>

              {!!error && (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>⚠ {error}</Text>
                </View>
              )}

              <GoldButton
                label="Sign In"
                onPress={login}
                loading={loading}
                size="lg"
                fullWidth
                style={{ marginTop: 8 }}
              />

              <Link href="/(auth)/signup" asChild>
                <AnimatedPressable haptic="selection" style={s.switchRow}>
                  <Text style={s.switchText}>
                    Don't have an account?{'  '}
                    <Text style={s.switchAccent}>Create one →</Text>
                  </Text>
                </AnimatedPressable>
              </Link>
            </LinearGradient>
          </Animated.View>

          <Text style={s.footer}>No purchase necessary to play</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  flex: { flex: 1 },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 48, gap: 24 },
  hero: { alignItems: 'center', gap: 4, paddingBottom: 8 },
  heroBg: { position: 'absolute', top: -40, width: 240, height: 240, borderRadius: 120 },
  heroEmoji: { fontSize: 52 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#f5c842', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase' },
  card: { borderRadius: 20, borderWidth: 1, borderColor: '#1e2840', overflow: 'hidden' },
  cardInner: { padding: 24, gap: 0 },
  formTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 2 },
  formSub: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 },
  fields: { gap: 14, marginBottom: 20 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: '#1e2840',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: '#fff', fontSize: 15,
  },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 8 },
  errorText: { color: '#fca5a5', fontSize: 13 },
  switchRow: { alignItems: 'center', paddingVertical: 16 },
  switchText: { color: 'rgba(255,255,255,0.35)', fontSize: 14 },
  switchAccent: { color: '#f5c842', fontWeight: '600' },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 8 },
});
