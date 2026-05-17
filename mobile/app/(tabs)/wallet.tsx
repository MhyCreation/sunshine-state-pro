import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useWalletStore } from '@/lib/store';
import { getWallet, getRecentTransactions } from '@/lib/actions';

export default function WalletScreen() {
  const { goldCoins, sweepsCoins, setWallet } = useWalletStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const w = await getWallet();
    if (w) setWallet(Number(w.gold_coins), parseFloat(String(w.sweeps_coins)));
    const txns = await getRecentTransactions(30);
    setTransactions(txns);
  }

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const typeIcon: Record<string, string> = {
    bet: '🎲', win: '🏆', daily_login: '🎁', purchase: '🛒', bonus: '⭐', redemption: '💸',
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f5c842" />}
    >
      <Text style={s.title}>My Wallet</Text>

      <View style={s.balanceRow}>
        <View style={[s.balanceCard, { borderColor: 'rgba(245,200,66,0.3)' }]}>
          <Text style={s.balanceCoin}>🪙</Text>
          <Text style={s.balanceAmount}>{goldCoins.toLocaleString()}</Text>
          <Text style={s.balanceLabel}>Gold Coins</Text>
        </View>
        <View style={[s.balanceCard, { borderColor: 'rgba(34,197,94,0.3)' }]}>
          <Text style={s.balanceCoin}>💎</Text>
          <Text style={s.balanceAmount}>{sweepsCoins.toFixed(2)}</Text>
          <Text style={s.balanceLabel}>Sweeps Coins</Text>
        </View>
      </View>

      <Text style={s.sectionLabel}>TRANSACTION HISTORY</Text>
      {transactions.length === 0 ? (
        <Text style={s.empty}>No transactions yet. Start playing!</Text>
      ) : (
        <View style={s.txnList}>
          {transactions.map((t, i) => (
            <View key={t.id} style={[s.txnRow, i < transactions.length - 1 && s.txnBorder]}>
              <Text style={s.txnIcon}>{typeIcon[t.type] ?? '•'}</Text>
              <View style={s.txnMid}>
                <Text style={s.txnType}>{t.type.replace('_', ' ')}</Text>
                {!!t.description && <Text style={s.txnDesc}>{t.description}</Text>}
                <Text style={s.txnDate}>{new Date(t.created_at).toLocaleDateString()}</Text>
              </View>
              <View style={s.txnRight}>
                <Text style={[s.txnAmount, t.amount > 0 ? s.amtPos : s.amtNeg]}>
                  {t.amount > 0 ? '+' : ''}{t.currency === 'gold'
                    ? Math.abs(t.amount).toLocaleString()
                    : Math.abs(t.amount).toFixed(2)}
                </Text>
                <Text style={s.txnCcy}>{t.currency === 'gold' ? 'GC' : 'SC'}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingTop: 56, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 20 },
  balanceRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  balanceCard: { flex: 1, backgroundColor: '#1a1f2e', borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center', gap: 4 },
  balanceCoin: { fontSize: 28 },
  balanceAmount: { fontSize: 20, fontWeight: '700', color: '#fff' },
  balanceLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  sectionLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: 1.2, marginBottom: 10 },
  empty: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 32, fontSize: 14 },
  txnList: { backgroundColor: '#1a1f2e', borderWidth: 1, borderColor: '#2a3048', borderRadius: 12 },
  txnRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  txnBorder: { borderBottomWidth: 1, borderBottomColor: '#1e2435' },
  txnIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  txnMid: { flex: 1, gap: 1 },
  txnType: { color: '#fff', fontSize: 13, fontWeight: '500', textTransform: 'capitalize' },
  txnDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  txnDate: { color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 1 },
  txnRight: { alignItems: 'flex-end' },
  txnAmount: { fontSize: 13, fontWeight: '600' },
  txnCcy: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  amtPos: { color: '#22c55e' },
  amtNeg: { color: '#ef4444' },
});
