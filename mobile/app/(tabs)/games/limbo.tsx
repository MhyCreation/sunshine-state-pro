import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { LimboGame } from '@/components/games/LimboGame';

export default function LimboScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🚀 Limbo' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <LimboGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
