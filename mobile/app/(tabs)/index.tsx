import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useWalletStore } from '@/lib/store';
import { claimDailyBonus, getWallet } from '@/lib/actions';

const GAMES = [
  { path: '/games/slots',     emoji: '🎰', name: 'Lucky Spins',     subtitle: 'Slots',       rtp: '96%',   hot: true  },
  { path: '/games/blackjack', emoji: '🃏', name: '21 Royale',       subtitle: 'Blackjack',   rtp: '99.5%', hot: false },
  { path: '/games/poker',     emoji: '♣️',  name: 'Jacks or Better', subtitle: 'Video Poker', rtp: '99.5%', hot: false },
  { path: '/games/roulette',  emoji: '🎡', name: 'Grand Roulette',  subtitle: 'Roulette',    rtp: '97.3%', hot: false },
];

export default function LobbyScreen() {
  const router = useRouter();
  const { goldCoins, sweepsCoins, setWallet } = useWalletStore();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const wallet = await getWallet();
    if (wallet) setWallet(Number(wallet.gold_coins), parseFloat(String(wallet.sweeps_coins)));

    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('game, currency, bet_amount, win_amount, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentSessions(sessions ?? []);

    const today = new Date().toISOString().split('T')[0];
    const { data: claimed } = await supabase
      .from('daily_bonuses').select('id')
      .eq('user_id', user.id).eq('claimed_date', today).maybeSingle();
    setDailyClaimed(!!claimed);
  }

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  async function handleClaim() {
    setClaimLoading(true);
    const result = await claimDailyBonus();
    setClaimLoading(false);
    if (result.success) {
      Alert.alert('Daily Bonus Claimed!', `+${result.gold?.toLocaleString()} GC  •  +${result.sweeps?.toFixed(2)} SC`);
      setDailyClaimed(true);
      const w = await getWallet();
      if (w) setWallet(Number(w.gold_coins), parseFloat(String(w.sweeps_coins)));
    } else {
      Alert.alert('Bonus', result.error ?? 'Already claimed today');
    }
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f5c842" />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.pageTitle}>Casino Lobby</Text>
          <Text style={s.pageSub}>Choose your game and start playing</Text>
        </View>
        <TouchableOpacity
          style={[s.bonusBtn, dailyClaimed && s.bonusClaimed]}
          onPress={handleClaim}
          disabled={dailyClaimed || claimLoading}
        >
          {claimLoading
            ? <ActivityIndicator color="#0f1117" size="small" />
            : <Text style={[s.bonusBtnText, dailyClaimed && s.bonusClaimedText]}>
                {dailyClaimed ? '✓ Claimed' : '🎁 Bonus'}
              </Text>
          }
        </TouchableOpacity>
      </View>

      {/* Wallet KPIs */}
      <View style={s.kpiRow}>
        <View style={s.kpiCard}>
          <Text style={s.kpiValue}>🪙 {goldCoins.toLocaleString()}</Text>
          <Text style={s.kpiLabel}>Gold Coins</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiValue}>💎 {sweepsCoins.toFixed(2)}</Text>
          <Text style={s.kpiLabel}>Sweeps Coins</Text>
        </View>
      </View>

      {/* Games grid */}
      <Text style={s.sectionLabel}>GAMES</Text>
      <View style={s.gamesGrid}>
        {GAMES.map((g) => (
          <TouchableOpacity
            key={g.path}
            style={s.gameCard}
            onPress={() => router.push(g.path as any)}
            activeOpacity={0.75}
          >
            <View style={s.gameCardTop}>
              <Text style={s.gameEmoji}>{g.emoji}</Text>
              {g.hot && <View style={s.hotBadge}><Text style={s.hotText}>HOT</Text></View>}
            </View>
            <Text style={s.gameName}>{g.name}</Text>
            <Text style={s.gameSub}>{g.subtitle}</Text>
            <Text style={s.gameRtp}>RTP {g.rtp}</Text>
            <Text style={s.playArrow}>Play →</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <>
          <Text style={s.sectionLabel}>RECENT GAMES</Text>
          <View style={s.table}>
            {recentSessions.map((session, i) => {
              const net = parseFloat(String(session.win_amount)) - parseFloat(String(session.bet_amount));
              return (
                <View key={i} style={[s.tableRow, i < recentSessions.length - 1 && s.tableRowBorder]}>
                  <Text style={s.tableGame}>{session.game}</Text>
                  <Text style={s.tableCcy}>{session.currency.toUpperCase()}</Text>
                  <Text style={[s.tableNet, net > 0 ? s.win : net < 0 ? s.lose : s.neutral]}>
                    {net > 0 ? '+' : ''}{session.currency === 'gold' ? net.toLocaleString() : net.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingTop: 56, paddingBottom: 32, gap: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  pageSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  bonusBtn: { backgroundColor: '#f5c842', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  bonusClaimed: { backgroundColor: '#2a3048' },
  bonusBtnText: { color: '#0f1117', fontWeight: '700', fontSize: 13 },
  bonusClaimedText: { color: 'rgba(255,255,255,0.5)' },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  kpiCard: { flex: 1, backgroundColor: '#1a1f2e', borderWidth: 1, borderColor: '#2a3048', borderRadius: 12, padding: 14 },
  kpiValue: { fontSize: 18, fontWeight: '700', color: '#fff' },
  kpiLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  sectionLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: 1.2, marginBottom: 10 },
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  gameCard: { width: '48%', backgroundColor: '#1a1f2e', borderWidth: 1, borderColor: '#2a3048', borderRadius: 14, padding: 14, gap: 4 },
  gameCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  gameEmoji: { fontSize: 30 },
  hotBadge: { backgroundColor: 'rgba(245,200,66,0.15)', borderWidth: 1, borderColor: 'rgba(245,200,66,0.3)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2 },
  hotText: { color: '#f5c842', fontSize: 9, fontWeight: '700' },
  gameName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  gameSub: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  gameRtp: { fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 },
  playArrow: { color: '#f5c842', fontSize: 11, marginTop: 4 },
  table: { backgroundColor: '#1a1f2e', borderWidth: 1, borderColor: '#2a3048', borderRadius: 12, marginBottom: 24 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11 },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1e2435' },
  tableGame: { flex: 1, color: '#fff', fontSize: 13, textTransform: 'capitalize' },
  tableCcy: { color: 'rgba(255,255,255,0.35)', fontSize: 10, width: 46 },
  tableNet: { fontSize: 12, fontWeight: '600' },
  win: { color: '#22c55e' },
  lose: { color: '#ef4444' },
  neutral: { color: 'rgba(255,255,255,0.35)' },
});
