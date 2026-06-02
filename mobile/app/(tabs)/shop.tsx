import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useStripe } from '@stripe/stripe-react-native';
import { useWalletStore } from '@/lib/store';
import { purchaseGoldCoins, createMobilePaymentIntent, confirmMobilePurchase } from '@/lib/actions';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { GradientCard } from '@/components/ui/GradientCard';

const PURCHASE_PACKS = [
  { id: 'starter',  name: 'Starter Bundle',  usdCents:   99, gcTotal:   5_000, scBonus: 0.10, emoji: '🌤',  badge: null,         featured: false },
  { id: 'classic',  name: 'Classic Bundle',  usdCents:  299, gcTotal:  15_000, scBonus: 0.25, emoji: '☀️',  badge: null,         featured: false },
  { id: 'popular',  name: 'Popular Bundle',  usdCents:  499, gcTotal:  35_000, scBonus: 0.50, emoji: '🌟',  badge: 'POPULAR',    featured: false },
  { id: 'premium',  name: 'Premium Bundle',  usdCents:  999, gcTotal:  80_000, scBonus: 1.00, emoji: '💫',  badge: null,         featured: true  },
  { id: 'elite',    name: 'Elite Bundle',    usdCents: 2499, gcTotal: 225_000, scBonus: 2.50, emoji: '🏆',  badge: 'BEST VALUE', featured: false },
  { id: 'jackpot',  name: 'Jackpot Bundle',  usdCents: 4999, gcTotal: 500_000, scBonus: 5.00, emoji: '💎',  badge: null,         featured: false },
] as const;

const SC_PACKS = [
  { id: 'starter', label: 'Starter Bundle', scCost: 0.10, gcTotal:   5_000, icon: '🌤', badge: null },
  { id: 'classic', label: 'Classic Bundle', scCost: 0.25, gcTotal:  15_000, icon: '☀️', badge: null },
  { id: 'popular', label: 'Popular Bundle', scCost: 0.50, gcTotal:  35_000, icon: '🌟', badge: 'POPULAR' },
  { id: 'premium', label: 'Premium Bundle', scCost: 1.00, gcTotal:  80_000, icon: '💫', badge: null },
  { id: 'elite',   label: 'Elite Bundle',   scCost: 2.50, gcTotal: 225_000, icon: '🏆', badge: 'BEST VALUE' },
  { id: 'jackpot', label: 'Jackpot Bundle', scCost: 5.00, gcTotal: 500_000, icon: '💎', badge: null },
] as const;

export default function ShopScreen() {
  const { sweepsCoins, addWin, deductBet } = useWalletStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  async function handleRealMoneyBuy(pack: typeof PURCHASE_PACKS[number]) {
    setPurchasing(pack.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { clientSecret, error: piError } = await createMobilePaymentIntent(pack.id);
    if (piError || !clientSecret) {
      Alert.alert('Error', piError ?? 'Could not start payment');
      setPurchasing(null);
      return;
    }

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'SunshineSpins',
      applePay: { merchantCountryCode: 'US' },
      googlePay: { merchantCountryCode: 'US', testEnv: true },
      style: 'alwaysDark',
      appearance: {
        colors: {
          primary: '#f5c842',
          background: '#141b2d',
          componentBackground: '#0d1321',
          componentBorder: '#1e2840',
          primaryText: '#ffffff',
          secondaryText: 'rgba(255,255,255,0.5)',
          componentText: '#ffffff',
          placeholderText: 'rgba(255,255,255,0.25)',
        },
      },
    });

    if (initError) {
      Alert.alert('Error', initError.message);
      setPurchasing(null);
      return;
    }

    const { error: presentError } = await presentPaymentSheet();
    if (presentError) {
      if (presentError.code !== 'Canceled') Alert.alert('Payment Failed', presentError.message);
      setPurchasing(null);
      return;
    }

    const paymentIntentId = clientSecret.split('_secret_')[0];
    const result = await confirmMobilePurchase(pack.id, paymentIntentId);

    if (result.success && result.gcAwarded) {
      addWin('gold', result.gcAwarded);
      addWin('sweeps', pack.scBonus);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('🎉 Purchase Complete!', `+${result.gcAwarded.toLocaleString()} GC added!\n+${pack.scBonus.toFixed(2)} SC free bonus.`);
    } else {
      Alert.alert('Error', result.error ?? 'Purchase confirmation failed');
    }
    setPurchasing(null);
  }

  async function handleScBuy(packId: string, scCost: number, gcTotal: number) {
    if (sweepsCoins < scCost) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Insufficient SC', `You need ${scCost.toFixed(2)} SC for this bundle.`);
      return;
    }
    setPurchasing(packId + '_sc');
    const result = await purchaseGoldCoins(packId);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      deductBet('sweeps', scCost);
      addWin('gold', gcTotal);
      Alert.alert('🎉 Done!', `+${gcTotal.toLocaleString()} Gold Coins added!`);
    } else {
      Alert.alert('Error', result.error ?? 'Purchase failed');
    }
    setPurchasing(null);
  }

  return (
    <LinearGradient colors={['#080c14', '#0d1321']} style={s.bg}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <Text style={s.title}>Gold Coin Shop</Text>
        <Text style={s.subtitle}>Instant delivery · Apple Pay & Google Pay accepted</Text>

        <View style={s.payBadgeRow}>
          {['💳 Card', ' Apple Pay', 'G Pay'].map(label => (
            <View key={label} style={s.payBadge}><Text style={s.payBadgeText}>{label}</Text></View>
          ))}
        </View>

        <Text style={s.sectionLabel}>BUY WITH REAL MONEY</Text>

        {PURCHASE_PACKS.map((pack) => {
          const usd = (pack.usdCents / 100).toFixed(2);
          const isActive = purchasing === pack.id;
          return (
            <AnimatedPressable key={pack.id} onPress={() => handleRealMoneyBuy(pack)} disabled={!!purchasing} haptic="medium" style={s.packWrap} scaleDown={0.97}>
              <LinearGradient colors={pack.featured ? ['#1e1a08', '#141b2d'] : ['#141b2d', '#0d1321']} style={[s.pack, pack.featured && s.packFeatured]}>
                {pack.badge && (
                  <LinearGradient colors={['#f7d35e', '#d4900a']} style={s.packBadge}>
                    <Text style={s.packBadgeText}>{pack.badge}</Text>
                  </LinearGradient>
                )}
                <View style={s.packRow}>
                  <Text style={s.packIcon}>{pack.emoji}</Text>
                  <View style={s.packInfo}>
                    <Text style={[s.packName, pack.featured && s.packNameGold]}>{pack.name}</Text>
                    <Text style={s.packGc}>🪙 {pack.gcTotal.toLocaleString()} GC</Text>
                    <Text style={s.packSc}>💎 +{pack.scBonus.toFixed(2)} SC free bonus</Text>
                  </View>
                  <View style={[s.buyBtn, pack.featured && s.buyBtnGold]}>
                    {isActive ? <ActivityIndicator color={pack.featured ? '#0f1117' : '#fff'} size="small" /> : (
                      <Text style={[s.buyPrice, pack.featured && s.buyPriceGold]}>${usd}</Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </AnimatedPressable>
          );
        })}

        <Text style={s.legalNote}>Payments secured by Stripe · No purchase necessary for SC · 18+ only</Text>

        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or exchange SC → GC</Text>
          <View style={s.dividerLine} />
        </View>

        <Text style={s.sectionLabel}>EXCHANGE SWEEPS COINS</Text>
        <GradientCard innerStyle={s.scBalance}>
          <Text style={s.scLabel}>Your SC balance</Text>
          <Text style={s.scValue}>💎 {sweepsCoins.toFixed(2)}</Text>
        </GradientCard>

        {SC_PACKS.map((pack) => {
          const canAfford = sweepsCoins >= pack.scCost;
          const isActive = purchasing === pack.id + '_sc';
          return (
            <AnimatedPressable key={pack.id} onPress={() => handleScBuy(pack.id, pack.scCost, pack.gcTotal)} disabled={!canAfford || !!purchasing} haptic="medium" style={[s.packWrap, !canAfford && s.dim]} scaleDown={0.97}>
              <LinearGradient colors={canAfford ? ['#141b2d', '#0d1321'] : ['#0d1018', '#080c14']} style={[s.pack, !!pack.badge && s.packFeatured]}>
                {pack.badge && (
                  <LinearGradient colors={['#f7d35e', '#d4900a']} style={s.packBadge}>
                    <Text style={s.packBadgeText}>{pack.badge}</Text>
                  </LinearGradient>
                )}
                <View style={s.packRow}>
                  <Text style={s.packIcon}>{pack.icon}</Text>
                  <View style={s.packInfo}>
                    <Text style={[s.packName, !canAfford && s.dimText]}>{pack.label}</Text>
                    <Text style={[s.packGc, !canAfford && s.dimText]}>🪙 {pack.gcTotal.toLocaleString()} GC</Text>
                  </View>
                  <View style={[s.buyBtnSc, !canAfford && s.buyBtnDim]}>
                    {isActive ? <ActivityIndicator color="#0f1117" size="small" /> : (
                      <Text style={[s.buyCost, !canAfford && s.buyCostDim]}>💎 {pack.scCost.toFixed(2)}</Text>
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
  content: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 12 },
  payBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: '#1e2840' },
  payBadgeText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600' },
  sectionLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  packWrap: { marginBottom: 10 },
  pack: { borderRadius: 16, borderWidth: 1, borderColor: '#1e2840', padding: 16, overflow: 'hidden' },
  packFeatured: { borderColor: 'rgba(245,200,66,0.3)' },
  packBadge: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 12 },
  packBadgeText: { color: '#0f1117', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  packRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  packIcon: { fontSize: 32 },
  packInfo: { flex: 1, gap: 2 },
  packName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  packNameGold: { color: '#f5c842' },
  packGc: { color: '#f5c842', fontSize: 12, fontWeight: '600' },
  packSc: { color: 'rgba(34,197,94,0.8)', fontSize: 11 },
  buyBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignItems: 'center', minWidth: 64, borderWidth: 1, borderColor: '#1e2840' },
  buyBtnGold: { backgroundColor: '#f5c842', borderColor: '#f5c842' },
  buyPrice: { color: '#fff', fontSize: 15, fontWeight: '800' },
  buyPriceGold: { color: '#0f1117' },
  buyBtnSc: { backgroundColor: '#f5c842', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, alignItems: 'center', minWidth: 72 },
  buyBtnDim: { backgroundColor: '#1e2840' },
  buyCost: { color: '#0f1117', fontSize: 12, fontWeight: '700' },
  buyCostDim: { color: 'rgba(255,255,255,0.3)' },
  legalNote: { fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 4, marginBottom: 24, lineHeight: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1e2840' },
  dividerText: { fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: '600', letterSpacing: 1 },
  scBalance: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 12 },
  scLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  scValue: { color: '#22c55e', fontSize: 18, fontWeight: '800' },
  dim: { opacity: 0.45 },
  dimText: { opacity: 0.5 },
});
