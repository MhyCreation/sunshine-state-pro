import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '@/lib/store';
import { getWallet, getRecentTransactions, requestRedemption } from '@/lib/actions';
import { GradientCard } from '@/components/ui/GradientCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const TYPE_ICON: Record<string, string> = {
  bet: '🎲', win: '🏆', daily_login: '🎁', purchase: '🛒', bonus: '⭐', redemption: '💸',
};

const MIN_SC = 100;

export default function WalletScreen() {
  const { goldCoins, sweepsCoins, setWallet } = useWalletStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  async function loadData() {
    const w = await getWallet();
    if (w) setWallet(Number(w.gold_coins), parseFloat(String(w.sweeps_coins)));
    setTransactions(await getRecentTransactions(30));
  }
  useEffect(() => { loadData(); }, []);
  const onRefresh = useCallback(async () => { setRefreshing(true); await loadData(); setRefreshing(false); }, []);

  async function handleRedeem() {
    const amount = parseFloat(redeemAmount);
    if (!Number.isFinite(amount) || amount < MIN_SC) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Amount', `Minimum redemption is ${MIN_SC} SC`);
      return;
    }
    if (amount > sweepsCoins) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Insufficient SC', `You only have ${sweepsCoins.toFixed(2)} SC`);
      return;
    }
    setRedeeming(true);
    const result = await requestRedemption(amount);
    setRedeeming(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRedeemAmount('');
      await loadData();
      Alert.alert('Request Submitted', `Your redemption of ${amount.toFixed(2)} SC has been submitted. We'll process it within 3–5 business days.`);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', result.error ?? 'Redemption failed');
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

        {/* Redemption */}
        <Text style={s.sectionLabel}>REDEEM SWEEPS COINS</Text>
        <GradientCard innerStyle={s.redeemInner} style={s.redeemCard}>
          {sweepsCoins < MIN_SC ? (
            <View style={s.redeemLocked}>
              <Text style={s.redeemLockedIcon}>🔒</Text>
              <Text style={s.redeemLockedTitle}>100 SC Minimum Required</Text>
              <Text style={s.redeemLockedSub}>Keep playing to earn more Sweeps Coins!</Text>
              <View style={s.progressBarBg}>
                <View style={[s.progressBarFill, { width: `${Math.min((sweepsCoins / MIN_SC) * 100, 100)}%` as any }]} />
              </View>
              <Text style={s.progressLabel}>{sweepsCoins.toFixed(2)} / {MIN_SC} SC</Text>
            </View>
          ) : (
            <View style={s.redeemForm}>
              <View style={s.redeemHeader}>
                <Text style={s.redeemTitle}>Redeem for Prizes</Text>
                <Text style={s.redeemMin}>Min. {MIN_SC} SC</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputPrefix}>💎</Text>
                <TextInput
                  style={s.input}
                  value={redeemAmount}
                  onChangeText={setRedeemAmount}
                  placeholder={`${MIN_SC}.00`}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="decimal-pad"
                  editable={!redeeming}
                />
                <AnimatedPressable
                  onPress={() => setRedeemAmount(sweepsCoins.toFixed(2))}
                  haptic="selection"
                  style={s.maxBtn}
                >
                  <Text style={s.maxBtnText}>MAX</Text>
                </AnimatedPressable>
              </View>
              {parseFloat(redeemAmount) > 0 && parseFloat(redeemAmount) < MIN_SC && (
                <Text style={s.inputError}>Minimum is {MIN_SC} SC</Text>
              )}
              {parseFloat(redeemAmount) > sweepsCoins && (
                <Text style={s.inputError}>Exceeds your balance ({sweepsCoins.toFixed(2)} SC)</Text>
              )}
              <GoldButton
                label={redeeming ? 'Submitting…' : `Redeem ${parseFloat(redeemAmount) >= MIN_SC ? parseFloat(redeemAmount).toFixed(2) + ' SC' : 'SC'}`}
                onPress={handleRedeem}
                loading={false}
                disabled={redeeming || parseFloat(redeemAmount) < MIN_SC || parseFloat(redeemAmount) > sweepsCoins}
                size="md"
                fullWidth
                haptic="medium"
              />
              <Text style={s.redeemNote}>Processed within 3–5 business days</Text>
            </View>
          )}
        </GradientCard>

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
  redeemCard: { marginBottom: 28 },
  redeemInner: { padding: 0 },
  redeemLocked: { padding: 20, alignItems: 'center', gap: 6 },
  redeemLockedIcon: { fontSize: 28, marginBottom: 4 },
  redeemLockedTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  redeemLockedSub: { color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' },
  progressBarBg: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#22c55e', borderRadius: 3 },
  progressLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },
  redeemForm: { padding: 16, gap: 12 },
  redeemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  redeemTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  redeemMin: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 1, borderColor: '#1e2840', paddingHorizontal: 12, gap: 8 },
  inputPrefix: { fontSize: 16 },
  input: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600', paddingVertical: 12 },
  maxBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(245,200,66,0.1)', borderRadius: 6 },
  maxBtnText: { color: '#f5c842', fontSize: 11, fontWeight: '700' },
  inputError: { color: '#ef4444', fontSize: 11 },
  redeemNote: { color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center' },
});
