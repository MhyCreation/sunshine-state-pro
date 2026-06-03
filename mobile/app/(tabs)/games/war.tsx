import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { WarGame } from '@/components/games/WarGame';

export default function WarScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '⚔️ War' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <WarGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
