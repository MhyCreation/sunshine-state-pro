import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useWalletStore } from '@/lib/store';
import { claimDailyBonus, getWallet } from '@/lib/actions';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';

const GAMES = [
  { path: '/games/slots',     emoji: '🎰', name: 'Lucky Spins',     tag: 'Slots',       rtp: '96%',   hot: true  },
  { path: '/games/blackjack', emoji: '🃏', name: '21 Royale',       tag: 'Blackjack',   rtp: '99.5%', hot: false },
  { path: '/games/poker',     emoji: '♣️',  name: 'Jacks or Better', tag: 'Video Poker', rtp: '99.5%', hot: false },
  { path: '/games/roulette',  emoji: '🎡', name: 'Grand Roulette',  tag: 'Roulette',    rtp: '97.3%', hot: false },
];

export default function LobbyScreen() {
  const router = useRouter();
  const { goldCoins, sweepsCoins, setWallet } = useWalletStore();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, speed: 14, bounciness: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const w = await getWallet();
    if (w) setWallet(Number(w.gold_coins), parseFloat(String(w.sweeps_coins)));
    const { data: sessions } = await supabase
      .from('game_sessions').select('game, currency, bet_amount, win_amount, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
    setRecentSessions(sessions ?? []);
    const today = new Date().toISOString().split('T')[0];
    const { data: claimed } = await supabase
      .from('daily_bonuses').select('id').eq('user_id', user.id).eq('claimed_date', today).maybeSingle();
    setDailyClaimed(!!claimed);
  }

  useEffect(() => { loadData(); }, []);
  const onRefresh = useCallback(async () => { setRefreshing(true); await loadData(); setRefreshing(false); }, []);

  async function handleClaim() {
    setClaimLoading(true);
    const result = await claimDailyBonus();
    setClaimLoading(false);
    if (result.success) {
      setDailyClaimed(true);
      const w = await getWallet();
      if (w) setWallet(Number(w.gold_coins), parseFloat(String(w.sweeps_coins)));
    }
  }

  return (
    <LinearGradient colors={['#080c14', '#0d1321']} style={s.bg}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f5c842" />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.greeting}>Casino Lobby</Text>
              <Text style={s.greetingSub}>Choose your game and play</Text>
            </View>
            {!dailyClaimed ? (
              <GoldButton
                label="🎁 Daily Bonus"
                onPress={handleClaim}
                loading={claimLoading}
                size="sm"
                haptic="medium"
              />
            ) : (
              <View style={s.claimedBadge}>
                <Text style={s.claimedText}>✓ Claimed</Text>
              </View>
            )}
          </View>

          {/* Wallet strip */}
          <GradientCard variant="elevated" glow style={s.walletCard} innerStyle={s.walletInner}>
            <LinearGradient
              colors={['rgba(245,200,66,0.08)', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.walletKpi}>
              <Text style={s.walletIcon}>🪙</Text>
              <View>
                <Text style={s.walletAmount}>{goldCoins.toLocaleString()}</Text>
                <Text style={s.walletLabel}>Gold Coins</Text>
              </View>
            </View>
            <View style={s.walletDivider} />
            <View style={s.walletKpi}>
              <Text style={s.walletIcon}>💎</Text>
              <View>
                <Text style={[s.walletAmount, s.walletAmountSC]}>{sweepsCoins.toFixed(2)}</Text>
                <Text style={s.walletLabel}>Sweeps Coins</Text>
              </View>
            </View>
          </GradientCard>

          {/* Games grid */}
          <Text style={s.sectionLabel}>GAMES</Text>
          <View style={s.gamesGrid}>
            {GAMES.map((g, i) => (
              <AnimatedPressable
                key={g.path}
                style={s.gameCardWrap}
                onPress={() => router.push(g.path as any)}
                haptic="light"
                scaleDown={0.94}
              >
                <LinearGradient
                  colors={['#141b2d', '#0d1321']}
                  style={[s.gameCard, i === 0 && s.gameCardHot]}
                >
                  {g.hot && (
                    <View style={s.hotBadge}>
                      <Text style={s.hotText}>🔥 HOT</Text>
                    </View>
                  )}
                  <Text style={s.gameEmoji}>{g.emoji}</Text>
                  <Text style={s.gameName}>{g.name}</Text>
                  <Text style={s.gameTag}>{g.tag}</Text>
                  <View style={s.gameFooter}>
                    <Text style={s.gameRtp}>RTP {g.rtp}</Text>
                    <Text style={s.gamePlay}>Play →</Text>
                  </View>
                </LinearGradient>
              </AnimatedPressable>
            ))}
          </View>

          {/* Recent sessions */}
          {recentSessions.length > 0 && (
            <>
              <Text style={s.sectionLabel}>RECENT ACTIVITY</Text>
              <GradientCard innerStyle={s.tableInner}>
                {recentSessions.map((session, i) => {
                  const net = parseFloat(String(session.win_amount)) - parseFloat(String(session.bet_amount));
                  return (
                    <View key={i} style={[s.tableRow, i < recentSessions.length - 1 && s.tableRowBorder]}>
                      <View style={s.tableLeft}>
                        <Text style={s.tableGame}>{session.game}</Text>
                        <Text style={s.tableCcy}>{session.currency.toUpperCase()}</Text>
                      </View>
                      <Text style={[s.tableNet, net > 0 ? s.win : net < 0 ? s.lose : s.neutral]}>
                        {net > 0 ? '+' : ''}{session.currency === 'gold' ? net.toLocaleString() : net.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
              </GradientCard>
            </>
          )}

        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 60, paddingBottom: 36 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  greetingSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  claimedBadge: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#1e2840' },
  claimedText: { color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: '600' },
  walletCard: { marginBottom: 28 },
  walletInner: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  walletKpi: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIcon: { fontSize: 28 },
  walletAmount: { fontSize: 20, fontWeight: '800', color: '#f5c842' },
  walletAmountSC: { color: '#22c55e' },
  walletLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  walletDivider: { width: 1, height: 36, backgroundColor: '#1e2840', marginHorizontal: 4 },
  sectionLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  gameCardWrap: { width: '48%' },
  gameCard: { borderRadius: 16, borderWidth: 1, borderColor: '#1e2840', padding: 14, gap: 6, overflow: 'hidden' },
  gameCardHot: { borderColor: 'rgba(245,200,66,0.3)' },
  hotBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(245,200,66,0.15)', borderWidth: 1, borderColor: 'rgba(245,200,66,0.3)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  hotText: { color: '#f5c842', fontSize: 9, fontWeight: '700' },
  gameEmoji: { fontSize: 32, marginBottom: 2 },
  gameName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  gameTag: { fontSize: 10, color: 'rgba(255,255,255,0.35)' },
  gameFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  gameRtp: { fontSize: 10, color: 'rgba(255,255,255,0.2)' },
  gamePlay: { color: '#f5c842', fontSize: 11, fontWeight: '600' },
  tableInner: { padding: 0, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1a2030' },
  tableLeft: { gap: 2 },
  tableGame: { color: '#fff', fontSize: 13, fontWeight: '500', textTransform: 'capitalize' },
  tableCcy: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
  tableNet: { fontSize: 13, fontWeight: '700' },
  win: { color: '#22c55e' },
  lose: { color: '#ef4444' },
  neutral: { color: 'rgba(255,255,255,0.3)' },
});
