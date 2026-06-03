import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const ROWS = 8;
const MULT = [22, 5, 1, 0.5, 0.2, 0.5, 1, 5, 22];
const BUCKET_COLORS = ['#f5c842','#a78bfa','#60a5fa','#34d399','#6b7280','#34d399','#60a5fa','#a78bfa','#f5c842'];
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

function simulateDrop(): { path: number[]; bucket: number } {
  const choices: number[] = [];
  for (let i = 0; i < ROWS; i++) choices.push(Math.random() < 0.5 ? 0 : 1);
  const path: number[] = [0];
  for (const c of choices) path.push(path[path.length - 1] + c);
  return { path, bucket: path[ROWS] };
}

export function PlinkoGame() {
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'dropping' | 'result'>('idle');
  const [activePath, setActivePath] = useState<number[]>([]);
  const [bucket, setBucket] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === 'gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === 'gold' ? goldCoins : sweepsCoins;

  const drop = useCallback(async () => {
    if (phase !== 'idle' || balance < bet) return;
    setPhase('dropping');
    setActivePath([]);
    setBucket(null);
    deductBet(currency, bet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { sessionId, error } = await placeBet('plinko', currency, bet);
    if (error) { addWin(currency, bet); setPhase('idle'); return; }

    const { path, bucket: b } = simulateDrop();
    for (let i = 1; i <= path.length; i++) {
      await new Promise<void>(r => setTimeout(r, 150));
      setActivePath(path.slice(0, i));
      if (i > 1) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const mult = MULT[b];
    const win = currency === 'gold' ? Math.round(bet * mult) : Math.round(bet * mult * 100) / 100;
    setBucket(b);
    setWinAmount(win);
    if (win > 0) {
      addWin(currency, win);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await recordWin(sessionId, win, { bucket: b, multiplier: mult });
    setPhase('result');
  }, [phase, balance, bet, currency, deductBet, addWin]);

  function reset() { setPhase('idle'); setActivePath([]); setBucket(null); setWinAmount(0); }

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

      {/* Board */}
      <GradientCard innerStyle={s.board}>
        {/* Peg rows */}
        {Array.from({ length: ROWS }, (_, row) => {
          const pegsInRow = row + 2;
          return (
            <View key={row} style={s.pegRow}>
              {Array.from({ length: pegsInRow }, (_, peg) => {
                const isBall = activePath.length === row + 2 && peg === activePath[row + 1];
                const isPath = activePath.length > row + 2 && peg === activePath[row + 1];
                return (
                  <View key={peg} style={[
                    s.peg,
                    isBall ? s.pegBall : isPath ? s.pegPath : s.pegDefault,
                  ]} />
                );
              })}
            </View>
          );
        })}

        {/* Buckets */}
        <View style={s.buckets}>
          {MULT.map((m, i) => (
            <View key={i} style={[s.bucket, { borderColor: BUCKET_COLORS[i] + (bucket === i ? 'ff' : '33') }, bucket === i && s.bucketActive]}>
              <Text style={[s.bucketText, { color: BUCKET_COLORS[i] }]}>{m}×</Text>
            </View>
          ))}
        </View>

        {phase === 'result' && bucket !== null && (
          <Text style={[s.resultText, winAmount > 0 ? s.win : s.noWin]}>
            {winAmount > 0
              ? `🎉 +${currency === 'gold' ? winAmount.toLocaleString() : winAmount.toFixed(2)} ${currency === 'gold' ? 'GC' : 'SC'}`
              : 'No win — try again!'}
          </Text>
        )}
      </GradientCard>

      {/* Bet + action */}
      <GradientCard innerStyle={s.betWrap}>
        <View style={s.betRow}>
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
          <GoldButton label="Drop Again" onPress={reset} size="lg" fullWidth />
        ) : (
          <GoldButton
            label={phase === 'dropping' ? 'Dropping…' : 'Drop Ball 🎱'}
            onPress={drop}
            loading={phase === 'dropping'}
            disabled={balance < bet || phase === 'dropping'}
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
  board: { padding: 14, gap: 6 },
  pegRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  peg: { width: 12, height: 12, borderRadius: 6 },
  pegDefault: { backgroundColor: 'rgba(255,255,255,0.12)' },
  pegPath: { backgroundColor: 'rgba(245,200,66,0.4)' },
  pegBall: { backgroundColor: '#f5c842', shadowColor: '#f5c842', shadowOpacity: 0.8, shadowRadius: 6 },
  buckets: { flexDirection: 'row', gap: 2, marginTop: 6 },
  bucket: { flex: 1, paddingVertical: 6, borderRadius: 6, alignItems: 'center', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  bucketActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  bucketText: { fontSize: 8, fontWeight: '800' },
  resultText: { textAlign: 'center', fontSize: 13, fontWeight: '700', marginTop: 6 },
  win: { color: '#22c55e' },
  noWin: { color: 'rgba(255,255,255,0.3)' },
  betWrap: { padding: 16, gap: 12 },
  betRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(245,200,66,0.15)', borderColor: 'rgba(245,200,66,0.4)' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#f5c842' },
});
