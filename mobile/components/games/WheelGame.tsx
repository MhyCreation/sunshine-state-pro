import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

// 30-segment wheel: 21 lose, 7×2x, 1×5x, 1×10x → ~96.7% RTP
const SEGMENTS = [
  ...Array(21).fill({ label: '✕', mult: 0, color: '#374151' }),
  ...Array(7).fill({ label: '2×', mult: 2, color: '#ef4444' }),
  { label: '5×', mult: 5, color: '#8b5cf6' },
  { label: '10×', mult: 10, color: '#f5c842' },
];

function pickSegment(): number { return Math.floor(Math.random() * 30); }

export function WheelGame() {
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [landed, setLanded] = useState<typeof SEGMENTS[number] | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const totalRotRef = useRef(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === 'gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === 'gold' ? goldCoins : sweepsCoins;

  const spin = useCallback(async () => {
    if (phase !== 'idle' || balance < bet) return;
    setPhase('spinning');
    setLanded(null);
    deductBet(currency, bet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const { sessionId, error } = await placeBet('wheel', currency, bet);
    if (error) { addWin(currency, bet); setPhase('idle'); return; }

    const targetIdx = pickSegment();
    const segDeg = 360 / 30;
    const targetDeg = targetIdx * segDeg + segDeg / 2;
    const spins = 5 + Math.random() * 3;
    const totalDeg = totalRotRef.current + spins * 360 + (360 - targetDeg);
    totalRotRef.current = totalDeg;

    Animated.timing(spinAnim, {
      toValue: totalDeg,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      const seg = SEGMENTS[targetIdx];
      setLanded(seg);
      const win = seg.mult > 0 ? (currency === 'gold' ? Math.round(bet * seg.mult) : Math.round(bet * seg.mult * 100) / 100) : 0;
      setWinAmount(win);
      if (win > 0) {
        addWin(currency, win);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await recordWin(sessionId, win, { segment: seg.label, multiplier: seg.mult });
      setPhase('result');
    });
  }, [phase, balance, bet, currency, deductBet, addWin, spinAnim]);

  function reset() { setPhase('idle'); setLanded(null); setWinAmount(0); }

  const rotation = spinAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <View style={s.container}>
      {/* Currency */}
      <GradientCard innerStyle={s.controlRow}>
        <View style={s.toggle}>
          {(['gold', 'sweeps'] as Currency[]).map(c => (
            <AnimatedPressable key={c} haptic="selection"
              style={[s.toggleBtn, currency === c && s.toggleActive]}
              onPress={() => { if (phase === 'idle') setCurrency(c); }}
              disabled={phase !== 'idle'}>
              <Text style={[s.toggleText, currency === c && s.toggleTextActive]}>
                {c === 'gold' ? '🪙 Gold' : '💎 Sweeps'}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={s.balance}>
          {currency === 'gold' ? `🪙 ${goldCoins.toLocaleString()}` : `💎 ${sweepsCoins.toFixed(2)}`}
        </Text>
      </GradientCard>

      {/* Wheel */}
      <GradientCard innerStyle={s.wheelWrap}>
        <Text style={s.needle}>▼</Text>
        <Animated.View style={[s.wheel, { transform: [{ rotate: rotation }] }]}>
          {SEGMENTS.map((seg, i) => {
            const angle = (i / 30) * 360;
            return (
              <View key={i} style={[s.segment, {
                transform: [{ rotate: `${angle}deg` }],
                backgroundColor: seg.color,
              }]} />
            );
          })}
          <View style={s.wheelCenter}>
            <Text style={s.wheelCenterText}>GO</Text>
          </View>
        </Animated.View>

        {phase === 'result' && landed && (
          <View style={[s.resultBox, landed.mult > 0 ? s.resultWin : s.resultLose]}>
            <Text style={[s.resultLabel, landed.mult > 0 ? s.textWin : s.textLose]}>{landed.label}</Text>
            {landed.mult > 0 ? (
              <Text style={s.textWin}>
                +{currency === 'gold' ? winAmount.toLocaleString() : winAmount.toFixed(2)} {currency === 'gold' ? 'GC' : 'SC'}
              </Text>
            ) : (
              <Text style={s.textLose}>No win</Text>
            )}
          </View>
        )}
        {phase === 'spinning' && <Text style={s.spinningText}>Spinning…</Text>}

        {/* Legend */}
        <View style={s.legend}>
          {[{ color: '#374151', label: '✕ lose' }, { color: '#ef4444', label: '2×' }, { color: '#8b5cf6', label: '5×' }, { color: '#f5c842', label: '10×' }].map(l => (
            <View key={l.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: l.color }]} />
              <Text style={s.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>
      </GradientCard>

      {/* Bet */}
      <GradientCard innerStyle={s.betWrap}>
        <View style={s.chips}>
          {betOptions.map((opt, i) => (
            <AnimatedPressable key={i} haptic="selection"
              style={[s.chip, betIdx === i && s.chipActive]}
              onPress={() => setBetIdx(i)}
              disabled={phase !== 'idle'}>
              <Text style={[s.chipText, betIdx === i && s.chipTextActive]}>
                {currency === 'gold' ? opt.toLocaleString() : opt.toFixed(2)}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        {phase === 'result' ? (
          <GoldButton label="Spin Again" onPress={reset} size="lg" fullWidth />
        ) : (
          <GoldButton
            label={phase === 'spinning' ? 'Spinning…' : 'Spin 🎡'}
            onPress={spin}
            disabled={balance < bet || phase === 'spinning'}
            size="lg" fullWidth
          />
        )}
      </GradientCard>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 12 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  toggle: { flexDirection: 'row', gap: 6 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)' },
  toggleActive: { backgroundColor: '#f5c842' },
  toggleText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  toggleTextActive: { color: '#0f1117' },
  balance: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  wheelWrap: { padding: 20, alignItems: 'center', gap: 12 },
  needle: { fontSize: 24, color: 'rgba(255,255,255,0.8)' },
  wheel: { width: 200, height: 200, borderRadius: 100, overflow: 'hidden', borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)' },
  segment: { position: 'absolute', width: 100, height: 100, top: 100, left: 100, transformOrigin: '0 0' },
  wheelCenter: { position: 'absolute', top: 75, left: 75, width: 50, height: 50, borderRadius: 25, backgroundColor: '#1a1f2e', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  wheelCenterText: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '700' },
  resultBox: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  resultWin: { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' },
  resultLose: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' },
  resultLabel: { fontSize: 28, fontWeight: '900' },
  textWin: { color: '#22c55e', fontSize: 14, fontWeight: '700' },
  textLose: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
  spinningText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
  legend: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
  betWrap: { padding: 16, gap: 12 },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(245,200,66,0.15)', borderColor: 'rgba(245,200,66,0.4)' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#f5c842' },
});
