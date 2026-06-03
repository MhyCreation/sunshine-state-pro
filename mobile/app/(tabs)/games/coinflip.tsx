import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { CoinflipGame } from '@/components/games/CoinflipGame';

export default function CoinflipScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🪙 Coin Flip' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <CoinflipGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
