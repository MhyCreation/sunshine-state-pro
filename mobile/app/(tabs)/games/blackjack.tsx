import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { BlackjackGame } from '@/components/games/BlackjackGame';

export default function BlackjackScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🃏 21 Royale' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <BlackjackGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
