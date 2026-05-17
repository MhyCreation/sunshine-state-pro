import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useWalletStore } from '@/lib/store';
import { purchaseGoldCoins, getWallet } from '@/lib/actions';

const PACKS = [
  { id: 'starter', label: 'Starter Bundle', scCost: 0.10, gcTotal:   5_000, icon: '🌤' },
  { id: 'classic', label: 'Classic Bundle', scCost: 0.25, gcTotal:  15_000, icon: '☀️' },
  { id: 'popular', label: 'Popular Bundle', scCost: 0.50, gcTotal:  35_000, icon: '🌟', badge: 'POPULAR' },
  { id: 'premium', label: 'Premium Bundle', scCost: 1.00, gcTotal:  80_000, icon: '💫' },
  { id: 'elite',   label: 'Elite Bundle',   scCost: 2.50, gcTotal: 225_000, icon: '🏆', badge: 'BEST VALUE' },
  { id: 'jackpot', label: 'Jackpot Bundle', scCost: 5.00, gcTotal: 500_000, icon: '💎' },
] as const;

export default function ShopScreen() {
  const { sweepsCoins, setWallet } = useWalletStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  async function handleBuy(packId: string, scCost: number) {
    if (sweepsCoins < scCost) {
      Alert.alert('Insufficient Sweeps Coins', `You need ${scCost.toFixed(2)} SC for this bundle.`);
      return;
    }
    setPurchasing(packId);
    const result = await purchaseGoldCoins(packId);
    if (result.success) {
      Alert.alert('Purchase Complete!', `🪙 +${result.goldAwarded?.toLocaleString()} Gold Coins added!`);
      const w = await getWallet();
      if (w) setWallet(Number(w.gold_coins), parseFloat(String(w.sweeps_coins)));
    } else {
      Alert.alert('Error', result.error ?? 'Purchase failed');
    }
    setPurchasing(null);
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Gold Coin Shop</Text>
      <Text style={s.subtitle}>Spend Sweeps Coins to get Gold Coins for playing</Text>

      <View style={s.scRow}>
        <Text style={s.scLabel}>Your SC balance:</Text>
        <Text style={s.scValue}>💎 {sweepsCoins.toFixed(2)}</Text>
      </View>

      {PACKS.map((pack) => {
        const canAfford = sweepsCoins >= pack.scCost;
        const isBuying = purchasing === pack.id;
        return (
          <View key={pack.id} style={[s.card, !canAfford && s.cardDisabled]}>
            {'badge' in pack && pack.badge && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{pack.badge}</Text>
              </View>
            )}
            <View style={s.cardRow}>
              <Text style={s.packIcon}>{pack.icon}</Text>
              <View style={s.packInfo}>
                <Text style={s.packLabel}>{pack.label}</Text>
                <Text style={s.packGc}>🪙 {pack.gcTotal.toLocaleString()} Gold Coins</Text>
                <Text style={s.packCost}>💎 {pack.scCost.toFixed(2)} Sweeps Coins</Text>
              </View>
              <TouchableOpacity
                style={[s.buyBtn, (!canAfford || isBuying) && s.buyBtnDisabled]}
                onPress={() => handleBuy(pack.id, pack.scCost)}
                disabled={!canAfford || !!purchasing}
              >
                {isBuying
                  ? <ActivityIndicator color="#0f1117" size="small" />
                  : <Text style={s.buyBtnText}>{canAfford ? 'Buy' : 'Need SC'}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16, paddingTop: 56, paddingBottom: 32, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 4 },
  scRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1a1f2e', borderWidth: 1, borderColor: '#2a3048', borderRadius: 12, padding: 14, marginBottom: 4 },
  scLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  scValue: { color: '#22c55e', fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: '#1a1f2e', borderWidth: 1, borderColor: '#2a3048', borderRadius: 14, padding: 16, overflow: 'hidden' },
  cardDisabled: { opacity: 0.55 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#f5c842', paddingHorizontal: 10, paddingVertical: 3, borderBottomLeftRadius: 10 },
  badgeText: { color: '#0f1117', fontSize: 9, fontWeight: '700' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  packIcon: { fontSize: 36 },
  packInfo: { flex: 1, gap: 3 },
  packLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },
  packGc: { color: '#f5c842', fontSize: 13, fontWeight: '500' },
  packCost: { color: '#22c55e', fontSize: 12 },
  buyBtn: { backgroundColor: '#f5c842', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, minWidth: 72, alignItems: 'center' },
  buyBtnDisabled: { backgroundColor: '#2a3048' },
  buyBtnText: { color: '#0f1117', fontWeight: '700', fontSize: 13 },
});
