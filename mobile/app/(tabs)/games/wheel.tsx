import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { WheelGame } from '@/components/games/WheelGame';

export default function WheelScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '🎡 Fortune Wheel' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <WheelGame />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingBottom: 40 },
});
