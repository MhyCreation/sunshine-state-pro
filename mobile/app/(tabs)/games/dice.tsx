import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { DiceGame } from '@/components/games/DiceGame';

export default function DiceScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🎲 Dice' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <DiceGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
