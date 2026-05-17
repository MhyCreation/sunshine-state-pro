import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function signup() {
    if (!username || !email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');

    const { data, error: signupError } = await supabase.auth.signUp({
      email, password, options: { data: { username } },
    });

    if (signupError) { setError(signupError.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from('profiles').update({ username }).eq('id', data.user.id);
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>☀️ SunshineSpins</Text>
        <Text style={styles.title}>Create an account</Text>

        <TextInput
          style={styles.input} placeholder="Username" placeholderTextColor="#555"
          value={username} onChangeText={setUsername} autoCapitalize="none"
        />
        <TextInput
          style={styles.input} placeholder="Email" placeholderTextColor="#555"
          value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
        />
        <TextInput
          style={styles.input} placeholder="Password (min 6 chars)" placeholderTextColor="#555"
          value={password} onChangeText={setPassword} secureTextEntry
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.btn} onPress={signup} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#0f1117" />
            : <Text style={styles.btnText}>Create Account</Text>
          }
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkBtn}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Sign in</Text></Text>
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
