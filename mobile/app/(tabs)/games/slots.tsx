import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SlotsGame } from '@/components/games/SlotsGame';

export default function SlotsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🎰 Lucky Spins' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <SlotsGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
