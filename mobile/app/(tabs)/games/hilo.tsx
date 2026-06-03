import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { HiLoGame } from '@/components/games/HiLoGame';

export default function HiLoScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🃏 Hi-Lo' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <HiLoGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
