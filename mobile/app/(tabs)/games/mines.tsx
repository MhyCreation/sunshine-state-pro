import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { MinesGame } from '@/components/games/MinesGame';

export default function MinesScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '💣 Mines' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <MinesGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
