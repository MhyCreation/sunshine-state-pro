import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { RouletteGame } from '@/components/games/RouletteGame';

export default function RouletteScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🎡 Grand Roulette' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <RouletteGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
