import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { CrashGame } from '@/components/games/CrashGame';

export default function CrashScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🚀 Crash' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <CrashGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
