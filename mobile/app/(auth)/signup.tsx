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

export default function SignupScreen() {
  const [username, setUsername] = useState('');
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
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function signup() {
    if (!username || !email || !password) { setError('Please fill in all fields'); triggerShake(); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); triggerShake(); return; }
    setLoading(true); setError('');

    const { data, error: e } = await supabase.auth.signUp({
      email, password, options: { data: { username } },
    });
    if (e) { setError(e.message); triggerShake(); setLoading(false); return; }
    if (data.user) await supabase.from('profiles').update({ username }).eq('id', data.user.id);
    setLoading(false);
  }

  return (
    <LinearGradient colors={['#080c14', '#0d1321', '#080c14']} style={s.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
        <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">

          <View style={s.hero}>
            <LinearGradient colors={['rgba(245,200,66,0.12)', 'transparent']} style={s.heroBg} />
            <Text style={s.heroEmoji}>🎰</Text>
            <Text style={s.heroTitle}>Join SunshineSpins</Text>
            <Text style={s.heroSub}>Get 10,000 GC + 2 SC free</Text>
          </View>

          <Animated.View style={[s.card, { transform: [{ translateX: shake }] }]}>
            <LinearGradient colors={['#141b2d', '#0d1321']} style={s.cardInner}>
              <Text style={s.formTitle}>Create your account</Text>
              <Text style={s.formSub}>Free to join · No credit card required</Text>

              <View style={s.fields}>
                {[
                  { label: 'Username', value: username, set: setUsername, ph: 'YourNickname', cap: 'none' as const },
                  { label: 'Email', value: email, set: setEmail, ph: 'you@example.com', cap: 'none' as const, kb: 'email-address' as const },
                  { label: 'Password', value: password, set: setPassword, ph: '6+ characters', cap: 'none' as const, secure: true },
                ].map(({ label, value, set, ph, cap, kb, secure }) => (
                  <View key={label} style={s.fieldWrap}>
                    <Text style={s.fieldLabel}>{label}</Text>
                    <TextInput
                      style={s.input}
                      placeholder={ph}
                      placeholderTextColor="#3a4260"
                      value={value}
                      onChangeText={set}
                      autoCapitalize={cap}
                      keyboardType={kb}
                      secureTextEntry={secure}
                      selectionColor="#f5c842"
                    />
                  </View>
                ))}
              </View>

              {!!error && (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>⚠ {error}</Text>
                </View>
              )}

              <GoldButton label="Create Account" onPress={signup} loading={loading} size="lg" fullWidth style={{ marginTop: 8 }} />

              <Link href="/(auth)/login" asChild>
                <AnimatedPressable haptic="selection" style={s.switchRow}>
                  <Text style={s.switchText}>Already have an account?{'  '}<Text style={s.switchAccent}>Sign in →</Text></Text>
                </AnimatedPressable>
              </Link>
            </LinearGradient>
          </Animated.View>

          <Text style={s.footer}>By creating an account you agree to our Terms of Service</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  flex: { flex: 1 },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 48, gap: 24 },
  hero: { alignItems: 'center', gap: 6, paddingBottom: 4 },
  heroBg: { position: 'absolute', top: -40, width: 240, height: 240, borderRadius: 120 },
  heroEmoji: { fontSize: 48 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#f5c842', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: 'rgba(34,197,94,0.8)', fontWeight: '600' },
  card: { borderRadius: 20, borderWidth: 1, borderColor: '#1e2840', overflow: 'hidden' },
  cardInner: { padding: 24 },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 2 },
  formSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 22 },
  fields: { gap: 14, marginBottom: 18 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: '#1e2840',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, color: '#fff', fontSize: 15,
  },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 10 },
  errorText: { color: '#fca5a5', fontSize: 13 },
  switchRow: { alignItems: 'center', paddingVertical: 16 },
  switchText: { color: 'rgba(255,255,255,0.35)', fontSize: 14 },
  switchAccent: { color: '#f5c842', fontWeight: '600' },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 4 },
});
