import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '@/lib/store';
import { purchaseGoldCoins, getWallet } from '@/lib/actions';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { GradientCard } from '@/components/ui/GradientCard';

const PACKS = [
  { id: 'starter', label: 'Starter Bundle', scCost: 0.10, gcTotal:   5_000, icon: '🌤', badge: null },
  { id: 'classic', label: 'Classic Bundle', scCost: 0.25, gcTotal:  15_000, icon: '☀️', badge: null },
  { id: 'popular', label: 'Popular Bundle', scCost: 0.50, gcTotal:  35_000, icon: '🌟', badge: 'POPULAR' },
  { id: 'premium', label: 'Premium Bundle', scCost: 1.00, gcTotal:  80_000, icon: '💫', badge: null },
  { id: 'elite',   label: 'Elite Bundle',   scCost: 2.50, gcTotal: 225_000, icon: '🏆', badge: 'BEST VALUE' },
  { id: 'jackpot', label: 'Jackpot Bundle', scCost: 5.00, gcTotal: 500_000, icon: '💎', badge: null },
] as const;

export default function ShopScreen() {
  const { sweepsCoins, setWallet } = useWalletStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  async function handleBuy(packId: string, scCost: number, gcTotal: number) {
    if (sweepsCoins < scCost) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Insufficient SC', `You need ${scCost.toFixed(2)} SC for this bundle.`);
      return;
    }
    setPurchasing(packId);
    const result = await purchaseGoldCoins(packId);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('🎉 Purchase Complete!', `+${gcTotal.toLocaleString()} Gold Coins added to your wallet!`);
      const w = await getWallet();
      if (w) setWallet(Number(w.gold_coins), parseFloat(String(w.sweeps_coins)));
    } else {
      Alert.alert('Error', result.error ?? 'Purchase failed');
    }
    setPurchasing(null);
  }

  return (
    <LinearGradient colors={['#080c14', '#0d1321']} style={s.bg}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Gold Coin Shop</Text>
        <Text style={s.subtitle}>Spend Sweeps Coins to get Gold Coins for play</Text>

        {/* SC balance pill */}
        <GradientCard variant="elevated" style={s.scCard} innerStyle={s.scCardInner}>
          <Text style={s.scLabel}>Your SC balance</Text>
          <Text style={s.scValue}>💎 {sweepsCoins.toFixed(2)}</Text>
        </GradientCard>

        <Text style={s.sectionLabel}>BUNDLES</Text>

        {PACKS.map((pack) => {
          const canAfford = sweepsCoins >= pack.scCost;
          const isActive = purchasing === pack.id;
          return (
            <AnimatedPressable
              key={pack.id}
              onPress={() => handleBuy(pack.id, pack.scCost, pack.gcTotal)}
              disabled={!canAfford || !!purchasing}
              haptic="medium"
              style={s.packWrap}
              scaleDown={0.97}
            >
              <LinearGradient
                colors={canAfford ? ['#141b2d', '#0d1321'] : ['#0d1018', '#080c14']}
                style={[s.pack, !!pack.badge && s.packFeatured]}
              >
                {pack.badge && (
                  <LinearGradient colors={['#f7d35e', '#d4900a']} style={s.packBadge}>
                    <Text style={s.packBadgeText}>{pack.badge}</Text>
                  </LinearGradient>
                )}
                <View style={s.packRow}>
                  <Text style={[s.packIcon, !canAfford && s.dim]}>{pack.icon}</Text>
                  <View style={s.packInfo}>
                    <Text style={[s.packName, !canAfford && s.dim]}>{pack.label}</Text>
                    <Text style={[s.packGc, !canAfford && s.dim]}>
                      🪙 {pack.gcTotal.toLocaleString()} Gold Coins
                    </Text>
                  </View>
                  <View style={[s.buyBtn, !canAfford && s.buyBtnDim]}>
                    {isActive ? (
                      <ActivityIndicator color="#0f1117" size="small" />
                    ) : (
                      <>
                        <Text style={[s.buyCost, !canAfford && s.buyCostDim]}>
                          💎 {pack.scCost.toFixed(2)}
                        </Text>
                        <Text style={[s.buyLabel, !canAfford && s.buyLabelDim]}>
                          {canAfford ? 'Buy' : 'Need SC'}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 60, paddingBottom: 36, gap: 0 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20 },
  scCard: { marginBottom: 24 },
  scCardInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  scLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  scValue: { color: '#22c55e', fontSize: 18, fontWeight: '800' },
  sectionLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  packWrap: { marginBottom: 10 },
  pack: { borderRadius: 16, borderWidth: 1, borderColor: '#1e2840', padding: 16, overflow: 'hidden' },
  packFeatured: { borderColor: 'rgba(245,200,66,0.3)' },
  packBadge: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 12 },
  packBadgeText: { color: '#0f1117', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  packRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  packIcon: { fontSize: 36 },
  packInfo: { flex: 1, gap: 4 },
  packName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  packGc: { color: '#f5c842', fontSize: 13, fontWeight: '600' },
  buyBtn: { backgroundColor: '#f5c842', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, alignItems: 'center', minWidth: 72 },
  buyBtnDim: { backgroundColor: '#1e2840' },
  buyCost: { color: '#0f1117', fontSize: 11, fontWeight: '700' },
  buyCostDim: { color: 'rgba(255,255,255,0.3)' },
  buyLabel: { color: '#0f1117', fontSize: 13, fontWeight: '800' },
  buyLabelDim: { color: 'rgba(255,255,255,0.3)' },
  dim: { opacity: 0.4 },
});
