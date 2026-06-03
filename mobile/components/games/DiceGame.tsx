import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

type DiceBet = { label: string; description: string; winChance: number; payout: number };
const DICE_BETS: DiceBet[] = [
  { label: 'Under 34', description: 'Roll 1–33',   winChance: 0.33, payout: 2.94 },
  { label: 'Under 50', description: 'Roll 1–49',   winChance: 0.49, payout: 1.98 },
  { label: 'Over 50',  description: 'Roll 51–100', winChance: 0.50, payout: 1.94 },
  { label: 'Over 67',  description: 'Roll 68–100', winChance: 0.33, payout: 2.94 },
];

export function DiceGame() {
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);
  const [diceType, setDiceType] = useState(2);
  const [phase, setPhase] = useState<'idle' | 'rolling' | 'result'>('idle');
  const [roll, setRoll] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === 'gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === 'gold' ? goldCoins : sweepsCoins;
  const selected = DICE_BETS[diceType];

  const rollDice = useCallback(async () => {
    if (phase !== 'idle' || balance < bet) return;
    setPhase('rolling');
    setRoll(null);
    deductBet(currency, bet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const { sessionId, error } = await placeBet('dice', currency, bet);
    if (error) { addWin(currency, bet); setPhase('idle'); return; }

    for (let i = 0; i < 12; i++) {
      await new Promise<void>(r => setTimeout(r, 60));
      setRoll(Math.floor(Math.random() * 100) + 1);
    }
    const result = Math.floor(Math.random() * 100) + 1;
    setRoll(result);

    const db = DICE_BETS[diceType];
    let didWin = false;
    if (db.label.startsWith('Under')) didWin = result < parseInt(db.label.split(' ')[1]);
    else didWin = result > parseInt(db.label.split(' ')[1]);

    const win = didWin ? (currency === 'gold' ? Math.round(bet * db.payout) : Math.round(bet * db.payout * 100) / 100) : 0;
    setWon(didWin);
    setWinAmount(win);
    if (win > 0) {
      addWin(currency, win);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    await recordWin(sessionId, win, { roll: result, bet: db.label, won: didWin });
    setPhase('result');
  }, [phase, balance, bet, currency, diceType, deductBet, addWin]);

  function reset() { setPhase('idle'); setRoll(null); }

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

      {/* Roll display */}
      <GradientCard innerStyle={[s.display, phase === 'result' && won ? s.displayWin : phase === 'result' ? s.displayLose : {}]}>
        <Text style={s.displayLabel}>
          {phase === 'rolling' ? 'Rolling…' : phase === 'result' ? (won ? '🎉 Winner!' : 'No luck') : 'Place your bet'}
        </Text>
        <Text style={[s.displayNum, phase === 'result' && won ? s.textWin : phase === 'result' ? s.textLose : roll !== null ? s.textRolling : s.textIdle]}>
          {roll ?? '?'}
        </Text>
        {phase === 'result' && (
          <Text style={[s.resultSub, won ? s.textWin : s.textIdle]}>
            {won
              ? `+${currency === 'gold' ? winAmount.toLocaleString() : winAmount.toFixed(2)} ${currency === 'gold' ? 'GC' : 'SC'}`
              : `Needed ${selected.description.toLowerCase()}`}
          </Text>
        )}
      </GradientCard>

      {/* Bet type */}
      <GradientCard innerStyle={s.betWrap}>
        <View style={s.betTypes}>
          {DICE_BETS.map((db, i) => (
            <TouchableOpacity key={i}
              style={[s.betType, diceType === i && s.betTypeActive]}
              onPress={() => { if (phase === 'idle') { Haptics.selectionAsync(); setDiceType(i); } }}>
              <Text style={[s.betTypeLabel, diceType === i && s.betTypeLabelActive]}>{db.label}</Text>
              <Text style={[s.betTypeSub, diceType === i && s.betTypeSubActive]}>{db.description} · {db.payout}×</Text>
            </TouchableOpacity>
          ))}
        </View>
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
          <GoldButton label="Roll Again" onPress={reset} size="lg" fullWidth />
        ) : (
          <GoldButton
            label={phase === 'rolling' ? 'Rolling…' : `Roll — ${selected.payout}× payout`}
            onPress={rollDice}
            loading={phase === 'rolling'}
            disabled={balance < bet || phase === 'rolling'}
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
  display: { padding: 40, alignItems: 'center', gap: 8, minHeight: 180, justifyContent: 'center' },
  displayWin: { backgroundColor: 'rgba(34,197,94,0.08)' },
  displayLose: { backgroundColor: 'rgba(239,68,68,0.06)' },
  displayLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  displayNum: { fontSize: 80, fontWeight: '900', letterSpacing: -4 },
  textWin: { color: '#22c55e' },
  textLose: { color: '#f87171' },
  textRolling: { color: 'rgba(255,255,255,0.6)' },
  textIdle: { color: 'rgba(255,255,255,0.2)' },
  resultSub: { fontSize: 13, fontWeight: '600' },
  betWrap: { padding: 16, gap: 12 },
  betTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  betType: { flex: 1, minWidth: '45%', padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  betTypeActive: { backgroundColor: 'rgba(245,200,66,0.1)', borderColor: 'rgba(245,200,66,0.4)' },
  betTypeLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  betTypeLabelActive: { color: '#f5c842' },
  betTypeSub: { color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 2 },
  betTypeSubActive: { color: 'rgba(245,200,66,0.5)' },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(245,200,66,0.15)', borderColor: 'rgba(245,200,66,0.4)' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#f5c842' },
});
