import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWalletStore } from '@/lib/store';
import { getWallet, getRecentTransactions } from '@/lib/actions';
import { GradientCard } from '@/components/ui/GradientCard';

const TYPE_ICON: Record<string, string> = {
  bet: '🎲', win: '🏆', daily_login: '🎁', purchase: '🛒', bonus: '⭐', redemption: '💸',
};

export default function WalletScreen() {
  const { goldCoins, sweepsCoins, setWallet } = useWalletStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const w = await getWallet();
    if (w) setWallet(Number(w.gold_coins), parseFloat(String(w.sweeps_coins)));
    setTransactions(await getRecentTransactions(30));
  }
  useEffect(() => { loadData(); }, []);
  const onRefresh = useCallback(async () => { setRefreshing(true); await loadData(); setRefreshing(false); }, []);

  return (
    <LinearGradient colors={['#080c14', '#0d1321']} style={s.bg}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f5c842" />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>My Wallet</Text>

        {/* Balance cards */}
        <View style={s.balanceRow}>
          <View style={s.balanceCardWrap}>
            <LinearGradient colors={['#1e1a08', '#0f1117']} style={[s.balanceCard, s.balanceCardGold]}>
              <Text style={s.balanceEmoji}>🪙</Text>
              <Text style={[s.balanceAmt, s.goldText]}>{goldCoins.toLocaleString()}</Text>
              <Text style={s.balanceLbl}>Gold Coins</Text>
            </LinearGradient>
          </View>
          <View style={s.balanceCardWrap}>
            <LinearGradient colors={['#0a1e12', '#0f1117']} style={[s.balanceCard, s.balanceCardSC]}>
              <Text style={s.balanceEmoji}>💎</Text>
              <Text style={[s.balanceAmt, s.scText]}>{sweepsCoins.toFixed(2)}</Text>
              <Text style={s.balanceLbl}>Sweeps Coins</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Transactions */}
        <Text style={s.sectionLabel}>TRANSACTION HISTORY</Text>
        {transactions.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🎲</Text>
            <Text style={s.emptyText}>No transactions yet</Text>
            <Text style={s.emptySub}>Start playing to see your history</Text>
          </View>
        ) : (
          <GradientCard innerStyle={s.listInner}>
            {transactions.map((t, i) => (
              <View key={t.id} style={[s.row, i < transactions.length - 1 && s.rowBorder]}>
                <View style={s.rowIcon}>
                  <Text style={s.rowIconText}>{TYPE_ICON[t.type] ?? '•'}</Text>
                </View>
                <View style={s.rowMid}>
                  <Text style={s.rowType}>{t.type.replace('_', ' ')}</Text>
                  {!!t.description && <Text style={s.rowDesc}>{t.description}</Text>}
                  <Text style={s.rowDate}>{new Date(t.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={s.rowRight}>
                  <Text style={[s.rowAmt, t.amount > 0 ? s.win : s.lose]}>
                    {t.amount > 0 ? '+' : ''}{t.currency === 'gold' ? Math.abs(t.amount).toLocaleString() : Math.abs(t.amount).toFixed(2)}
                  </Text>
                  <Text style={s.rowCcy}>{t.currency === 'gold' ? 'GC' : 'SC'}</Text>
                </View>
              </View>
            ))}
          </GradientCard>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 60, paddingBottom: 36 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 20 },
  balanceRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  balanceCardWrap: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  balanceCard: { padding: 20, alignItems: 'center', gap: 6 },
  balanceCardGold: { borderColor: 'rgba(245,200,66,0.25)' } as any,
  balanceCardSC: { borderColor: 'rgba(34,197,94,0.25)' } as any,
  balanceEmoji: { fontSize: 32 },
  balanceAmt: { fontSize: 22, fontWeight: '800' },
  balanceLbl: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  goldText: { color: '#f5c842' },
  scText: { color: '#22c55e' },
  sectionLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  emptyWrap: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyIcon: { fontSize: 40, marginBottom: 4 },
  emptyText: { fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.25)' },
  listInner: { padding: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#1a2030' },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
  rowIconText: { fontSize: 18 },
  rowMid: { flex: 1 },
  rowType: { color: '#fff', fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  rowDesc: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 1 },
  rowDate: { color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowAmt: { fontSize: 14, fontWeight: '700' },
  rowCcy: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 },
  win: { color: '#22c55e' },
  lose: { color: '#ef4444' },
});
