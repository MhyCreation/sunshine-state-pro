import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { KenoGame } from '@/components/games/KenoGame';

export default function KenoScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🎱 Keno' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <KenoGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
