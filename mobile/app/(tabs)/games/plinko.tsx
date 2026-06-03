import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { PlinkoGame } from '@/components/games/PlinkoGame';

export default function PlinkoScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🎱 Plinko' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <PlinkoGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
