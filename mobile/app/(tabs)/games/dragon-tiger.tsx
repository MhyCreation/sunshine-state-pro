import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { DragonTigerGame } from '@/components/games/DragonTigerGame';

export default function DragonTigerScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🐉 Dragon Tiger' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <DragonTigerGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
