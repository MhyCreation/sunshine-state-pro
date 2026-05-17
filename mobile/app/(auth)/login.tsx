import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function login() {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>☀️ SunshineSpins</Text>
        <Text style={styles.title}>Welcome back</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#555"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.btn} onPress={login} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#0f1117" />
            : <Text style={styles.btnText}>Sign In</Text>
          }
        </TouchableOpacity>

        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.linkBtn}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Sign up</Text></Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 12 },
  logo: { fontSize: 30, fontWeight: '700', color: '#f5c842', textAlign: 'center', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '600', color: '#fff', textAlign: 'center', marginBottom: 16 },
  input: {
    backgroundColor: '#1a1f2e', borderWidth: 1, borderColor: '#2a3048',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 15,
  },
  btn: {
    backgroundColor: '#f5c842', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#0f1117', fontWeight: '700', fontSize: 16 },
  linkBtn: { alignItems: 'center', marginTop: 8, paddingVertical: 8 },
  linkText: { color: '#666', fontSize: 14 },
  linkAccent: { color: '#f5c842' },
  error: { color: '#ef4444', fontSize: 13, textAlign: 'center', padding: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8 },
});
