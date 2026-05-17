import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { PokerGame } from '@/components/games/PokerGame';

export default function PokerScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '♣️ Jacks or Better' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <PokerGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
