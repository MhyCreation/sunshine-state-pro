import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { BaccaratGame } from '@/components/games/BaccaratGame';

export default function BaccaratScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🎴 Baccarat' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <BaccaratGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
