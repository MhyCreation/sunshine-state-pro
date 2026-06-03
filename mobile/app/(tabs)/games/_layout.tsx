import { Stack } from 'expo-router';

export default function GamesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1f2e' },
        headerTintColor: '#f5c842',
        headerTitleStyle: { color: '#fff', fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0f1117' },
      }}
    />
  );
}
