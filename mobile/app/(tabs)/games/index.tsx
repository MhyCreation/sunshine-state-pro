import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';

const GAMES = [
  { path: 'blackjack', emoji: '🃏', name: '21 Royale',       subtitle: 'Blackjack',   desc: 'Beat the dealer to 21 · Blackjack 3:2',      rtp: '99.5%', hot: false },
  { path: 'slots',     emoji: '🎰', name: 'Lucky Spins',     subtitle: 'Slots',       desc: '5 reels · 9 paylines · Wild bonus',            rtp: '96%',   hot: true  },
  { path: 'poker',     emoji: '♣️',  name: 'Jacks or Better', subtitle: 'Video Poker', desc: '5-card draw · Royal Flush 800×',               rtp: '99.5%', hot: false },
  { path: 'roulette',  emoji: '🎡', name: 'Grand Roulette',  subtitle: 'Roulette',    desc: 'European wheel · 37 numbers · 0–36',          rtp: '97.3%', hot: false },
  { path: 'keno',      emoji: '🎱', name: 'Keno',            subtitle: 'Keno',        desc: 'Pick up to 10 numbers · 20 drawn · Big wins',  rtp: '92%',   hot: true  },
  { path: 'crash',     emoji: '🚀', name: 'Crash',           subtitle: 'Crash',       desc: 'Cash out before it crashes · Multiplier grows', rtp: '97%',   hot: true  },
  { path: 'baccarat',  emoji: '🎴', name: 'Baccarat',        subtitle: 'Baccarat',    desc: 'Player vs Banker · Tie pays 8:1',              rtp: '98.9%', hot: false },
  { path: 'mines',     emoji: '💣', name: 'Mines',           subtitle: 'Mines',       desc: 'Reveal gems · Avoid mines · Cash out anytime', rtp: '97%',   hot: false },
];

export default function GamesListScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'All Games' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {GAMES.map((g) => (
          <TouchableOpacity
            key={g.path}
            style={s.card}
            onPress={() => router.push(g.path as any)}
            activeOpacity={0.75}
          >
            <Text style={s.emoji}>{g.emoji}</Text>
            <View style={s.info}>
              <View style={s.nameRow}>
                <Text style={s.name}>{g.name}</Text>
                {g.hot && <View style={s.hot}><Text style={s.hotText}>HOT</Text></View>}
              </View>
              <Text style={s.sub}>{g.subtitle}</Text>
              <Text style={s.desc}>{g.desc}</Text>
              <Text style={s.rtp}>RTP {g.rtp}</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, gap: 10, paddingBottom: 32 },
  card: { backgroundColor: '#1a1f2e', borderWidth: 1, borderColor: '#2a3048', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  emoji: { fontSize: 38 },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '600', color: '#fff' },
  hot: { backgroundColor: 'rgba(245,200,66,0.15)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  hotText: { color: '#f5c842', fontSize: 9, fontWeight: '700' },
  sub: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  desc: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  rtp: { fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 },
  arrow: { color: '#f5c842', fontSize: 26 },
});
