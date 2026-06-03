import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const GRID_SIZE = 80;
const DRAW_COUNT = 20;
const MAX_PICKS = 10;
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

const PAYTABLE: Record<number, Record<number, number>> = {
  1:  { 1: 3 },
  2:  { 2: 10, 1: 1 },
  3:  { 3: 30, 2: 3 },
  4:  { 4: 100, 3: 6, 2: 1 },
  5:  { 5: 400, 4: 15, 3: 3, 2: 1 },
  6:  { 6: 1600, 5: 50, 4: 8, 3: 2 },
  7:  { 7: 5000, 6: 100, 5: 20, 4: 5, 3: 1 },
  8:  { 8: 10000, 7: 500, 6: 50, 5: 10, 4: 2 },
  9:  { 9: 25000, 8: 2500, 7: 200, 6: 25, 5: 6, 4: 1 },
  10: { 10: 100000, 9: 5000, 8: 500, 7: 50, 6: 10, 5: 2 },
};

function drawNumbers(): number[] {
  const pool = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, DRAW_COUNT).sort((a, b) => a - b);
}

export function KenoGame() {
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [drawn, setDrawn] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'pick' | 'drawing' | 'result'>('pick');
  const [matches, setMatches] = useState(0);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === 'gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === 'gold' ? goldCoins : sweepsCoins;
  const canPlay = picks.size > 0 && balance >= bet;

  function togglePick(n: number) {
    if (phase !== 'pick') return;
    Haptics.selectionAsync();
    setPicks(prev => {
      const next = new Set(prev);
      if (next.has(n)) { next.delete(n); return next; }
      if (next.size >= MAX_PICKS) return prev;
      next.add(n);
      return next;
    });
  }

  const play = useCallback(async () => {
    if (!canPlay || phase !== 'pick') return;
    setPhase('drawing');
    setDrawn(new Set());
    deductBet(currency, bet);

    const { sessionId, error } = await placeBet('keno', currency, bet);
    if (error) { addWin(currency, bet); setPhase('pick'); return; }

    const numbers = drawNumbers();
    for (let i = 0; i < numbers.length; i++) {
      await new Promise<void>(r => setTimeout(r, 100));
      setDrawn(prev => new Set([...prev, numbers[i]]));
      if (picks.has(numbers[i])) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const hit = numbers.filter(n => picks.has(n)).length;
    const mult = PAYTABLE[picks.size]?.[hit] ?? 0;
    const win = mult * bet;
    setMatches(hit);
    setWinAmount(win);
    if (win > 0) {
      addWin(currency, win);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await recordWin(sessionId, win, { picks: [...picks], drawn: numbers, matches: hit });
    setPhase('result');
  }, [canPlay, phase, picks, currency, bet, deductBet, addWin]);

  function reset() {
    setPicks(new Set());
    setDrawn(new Set());
    setMatches(0);
    setWinAmount(0);
    setPhase('pick');
  }

  return (
    <View style={s.container}>
      {/* Currency + balance */}
      <GradientCard innerStyle={s.controlRow}>
        <View style={s.toggle}>
          {(['gold', 'sweeps'] as Currency[]).map(c => (
            <AnimatedPressable key={c} haptic="selection"
              style={[s.toggleBtn, currency === c && s.toggleActive]}
              onPress={() => { if (phase === 'pick') setCurrency(c); }}
              disabled={phase !== 'pick'}>
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

      {/* Header */}
      <View style={s.headerRow}>
        <Text style={s.headerText}>Pick up to {MAX_PICKS} · Selected: {picks.size}</Text>
        {phase === 'result' && (
          <Text style={[s.resultText, winAmount > 0 ? s.win : s.noWin]}>
            {winAmount > 0
              ? `🎉 +${currency === 'gold' ? winAmount.toLocaleString() : winAmount.toFixed(2)} ${currency === 'gold' ? 'GC' : 'SC'}`
              : 'No win'}
          </Text>
        )}
      </View>

      {/* Grid */}
      <GradientCard innerStyle={s.gridWrap}>
        <View style={s.grid}>
          {Array.from({ length: GRID_SIZE }, (_, i) => i + 1).map(n => {
            const isPick = picks.has(n);
            const isDrawn = drawn.has(n);
            const isMatch = isPick && isDrawn;
            return (
              <TouchableOpacity
                key={n}
                onPress={() => togglePick(n)}
                disabled={phase !== 'pick'}
                style={[
                  s.cell,
                  isMatch ? s.cellMatch :
                  isDrawn ? s.cellDrawn :
                  isPick  ? s.cellPick :
                  s.cellDefault,
                ]}>
                <Text style={[
                  s.cellText,
                  isMatch ? s.textMatch :
                  isDrawn ? s.textDrawn :
                  isPick  ? s.textPick :
                  s.textDefault,
                ]}>
                  {n}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GradientCard>

      {/* Paytable */}
      {picks.size > 0 && (
        <GradientCard innerStyle={s.paytableWrap}>
          <Text style={s.paytableTitle}>Paytable · {picks.size} picks</Text>
          <View style={s.paytableRow}>
            {Object.entries(PAYTABLE[picks.size] ?? {}).map(([match, mult]) => (
              <View key={match} style={[
                s.paytableItem,
                phase === 'result' && matches === Number(match) && s.paytableItemActive,
              ]}>
                <Text style={s.paytableMatch}>{match}×</Text>
                <Text style={[s.paytableMult, phase === 'result' && matches === Number(match) && s.paytableMultActive]}>
                  {mult}×
                </Text>
              </View>
            ))}
          </View>
        </GradientCard>
      )}

      {/* Bet + play */}
      <GradientCard innerStyle={s.betWrap}>
        <View style={s.betRow}>
          {betOptions.map((opt, i) => (
            <AnimatedPressable key={i} haptic="selection"
              style={[s.betChip, betIdx === i && s.betChipActive]}
              onPress={() => setBetIdx(i)}
              disabled={phase !== 'pick'}>
              <Text style={[s.betChipText, betIdx === i && s.betChipTextActive]}>
                {currency === 'gold' ? opt.toLocaleString() : opt.toFixed(2)}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        {phase === 'result' ? (
          <GoldButton label="Play Again" onPress={reset} size="lg" fullWidth />
        ) : (
          <GoldButton
            label={phase === 'drawing' ? 'Drawing…' : picks.size === 0 ? 'Pick numbers to play' : `Play ${picks.size} number${picks.size > 1 ? 's' : ''}`}
            onPress={play}
            loading={phase === 'drawing'}
            disabled={!canPlay || phase === 'drawing'}
            size="lg"
            fullWidth
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  headerText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  resultText: { fontSize: 13, fontWeight: '700' },
  win: { color: '#22c55e' },
  noWin: { color: 'rgba(255,255,255,0.3)' },
  gridWrap: { padding: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: '9%', aspectRatio: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  cellDefault: { backgroundColor: 'rgba(255,255,255,0.06)' },
  cellPick: { backgroundColor: '#f5c842' },
  cellDrawn: { backgroundColor: 'rgba(245,200,66,0.2)', borderWidth: 1, borderColor: 'rgba(245,200,66,0.4)' },
  cellMatch: { backgroundColor: 'rgba(34,197,94,0.25)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.5)' },
  cellText: { fontSize: 9, fontWeight: '700' },
  textDefault: { color: 'rgba(255,255,255,0.4)' },
  textPick: { color: '#0f1117' },
  textDrawn: { color: '#f5c842' },
  textMatch: { color: '#22c55e' },
  paytableWrap: { padding: 14 },
  paytableTitle: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  paytableRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  paytableItem: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', gap: 4, alignItems: 'center' },
  paytableItemActive: { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  paytableMatch: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  paytableMult: { color: '#f5c842', fontSize: 11, fontWeight: '700' },
  paytableMultActive: { color: '#22c55e' },
  betWrap: { padding: 16, gap: 12 },
  betRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  betChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  betChipActive: { backgroundColor: 'rgba(245,200,66,0.15)', borderColor: 'rgba(245,200,66,0.4)' },
  betChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  betChipTextActive: { color: '#f5c842' },
});
