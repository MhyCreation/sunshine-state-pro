import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>Screen not found</Text>
      <Link href="/(tabs)" style={styles.link}>Go home</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117', alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 48, fontWeight: '700', color: '#f5c842' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.5)' },
  link: { color: '#f5c842', fontSize: 15, marginTop: 8 },
});
