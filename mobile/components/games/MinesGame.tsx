import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const GRID = 25;
const MINE_OPTIONS = [3, 5, 10, 15];
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

function computeMultiplier(mineCount: number, revealed: number): number {
  if (revealed === 0) return 1;
  let prob = 1;
  for (let i = 0; i < revealed; i++) {
    prob *= (GRID - mineCount - i) / (GRID - i);
  }
  return Math.round((0.97 / prob) * 100) / 100;
}

function placeMinesAvoidingCell(count: number, avoid: number): Set<number> {
  const mines = new Set<number>();
  while (mines.size < count) {
    const r = Math.floor(Math.random() * GRID);
    if (r !== avoid) mines.add(r);
  }
  return mines;
}

export function MinesGame() {
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);
  const [mineCount, setMineCount] = useState(5);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'cashed' | 'exploded'>('idle');
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [multiplier, setMultiplier] = useState(1.0);
  const [winAmount, setWinAmount] = useState(0);
  const [sessionId, setSessionId] = useState('');

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === 'gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === 'gold' ? goldCoins : sweepsCoins;
  const canCashout = phase === 'playing' && revealed.size > 0;

  const startGame = useCallback(async () => {
    if (balance < bet || phase !== 'idle') return;
    deductBet(currency, bet);
    const { sessionId: sid, error } = await placeBet('mines', currency, bet);
    if (error) { addWin(currency, bet); return; }
    setSessionId(sid);
    setRevealed(new Set());
    setMines(new Set());
    setMultiplier(1.0);
    setWinAmount(0);
    setPhase('playing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [balance, bet, currency, phase, deductBet, addWin]);

  function clickCell(idx: number) {
    if (phase !== 'playing' || revealed.has(idx)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let m = mines;
    if (m.size === 0) {
      m = placeMinesAvoidingCell(mineCount, idx);
      setMines(m);
    }

    if (m.has(idx)) {
      setRevealed(prev => new Set([...prev, idx]));
      setPhase('exploded');
      recordWin(sessionId, 0, { mines: [...m], hit: idx });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      const newRevealed = new Set([...revealed, idx]);
      setRevealed(newRevealed);
      const mult = computeMultiplier(mineCount, newRevealed.size);
      setMultiplier(mult);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (newRevealed.size === GRID - mineCount) {
        const win = currency === 'gold' ? Math.round(bet * mult) : Math.round(bet * mult * 100) / 100;
        setWinAmount(win);
        addWin(currency, win);
        recordWin(sessionId, win, { multiplier: mult });
        setPhase('cashed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }

  function cashout() {
    if (!canCashout) return;
    const win = currency === 'gold' ? Math.round(bet * multiplier) : Math.round(bet * multiplier * 100) / 100;
    setWinAmount(win);
    addWin(currency, win);
    recordWin(sessionId, win, { multiplier, safe: [...revealed] });
    setPhase('cashed');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function reset() {
    setPhase('idle');
    setRevealed(new Set());
    setMines(new Set());
    setMultiplier(1.0);
    setWinAmount(0);
  }

  const isPlaying = phase === 'playing';
  const isCashed = phase === 'cashed';
  const isExploded = phase === 'exploded';
  const isDone = isCashed || isExploded;

  function getCellState(idx: number) {
    if (revealed.has(idx)) return mines.has(idx) ? 'mine' : 'safe';
    if (isDone && mines.has(idx)) return 'unrevealed-mine';
    return 'hidden';
  }

  return (
    <View style={ms.container}>
      {/* Currency */}
      <GradientCard innerStyle={ms.controlRow}>
        <View style={ms.toggle}>
          {(['gold', 'sweeps'] as Currency[]).map(c => (
            <AnimatedPressable key={c} haptic="selection"
              style={[ms.toggleBtn, currency === c && ms.toggleActive]}
              onPress={() => { if (phase === 'idle') setCurrency(c); }}
              disabled={phase !== 'idle'}>
              <Text style={[ms.toggleText, currency === c && ms.toggleTextActive]}>
                {c === 'gold' ? '🪙 Gold' : '💎 Sweeps'}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={ms.balance}>
          {currency === 'gold' ? `🪙 ${goldCoins.toLocaleString()}` : `💎 ${sweepsCoins.toFixed(2)}`}
        </Text>
      </GradientCard>

      {/* Multiplier bar */}
      <GradientCard innerStyle={[ms.multBar, isExploded && ms.multBarCrash, isCashed && ms.multBarWin]}>
        <View>
          <Text style={ms.multLabel}>
            {isExploded ? '💥 Hit a mine!' : isCashed ? '🎉 Cashed out!' : isPlaying ? 'Current payout' : 'Select settings'}
          </Text>
          {isDone && winAmount > 0 && (
            <Text style={ms.winText}>
              +{currency === 'gold' ? winAmount.toLocaleString() : winAmount.toFixed(2)} {currency === 'gold' ? 'GC' : 'SC'}
            </Text>
          )}
        </View>
        <Text style={[ms.multValue, isExploded && ms.multCrash, isCashed && ms.multWin]}>
          {multiplier.toFixed(2)}×
        </Text>
      </GradientCard>

      {/* Grid */}
      <GradientCard innerStyle={ms.gridWrap}>
        <View style={ms.grid}>
          {Array.from({ length: GRID }, (_, i) => {
            const state = getCellState(i);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => clickCell(i)}
                disabled={!isPlaying || revealed.has(i)}
                activeOpacity={0.7}
                style={[
                  ms.cell,
                  state === 'safe' ? ms.cellSafe :
                  state === 'mine' ? ms.cellMine :
                  state === 'unrevealed-mine' ? ms.cellUnrevealedMine :
                  ms.cellHidden,
                ]}>
                <Text style={ms.cellIcon}>
                  {state === 'safe' ? '💎' : state === 'mine' || state === 'unrevealed-mine' ? '💣' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GradientCard>

      {/* Controls */}
      <GradientCard innerStyle={ms.controls}>
        {phase === 'idle' && (
          <>
            <View style={ms.optRow}>
              <Text style={ms.optLabel}>Mines</Text>
              <View style={ms.chips}>
                {MINE_OPTIONS.map(m => (
                  <AnimatedPressable key={m} haptic="selection"
                    style={[ms.chip, mineCount === m && ms.chipMineActive]}
                    onPress={() => setMineCount(m)}>
                    <Text style={[ms.chipText, mineCount === m && ms.chipMineText]}>{m} 💣</Text>
                  </AnimatedPressable>
                ))}
              </View>
            </View>
            <View style={ms.optRow}>
              <Text style={ms.optLabel}>Bet</Text>
              <View style={ms.chips}>
                {betOptions.map((opt, i) => (
                  <AnimatedPressable key={i} haptic="selection"
                    style={[ms.chip, betIdx === i && ms.chipActive]}
                    onPress={() => setBetIdx(i)}>
                    <Text style={[ms.chipText, betIdx === i && ms.chipActiveText]}>
                      {currency === 'gold' ? opt.toLocaleString() : opt.toFixed(2)}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>
            </View>
            <GoldButton
              label={`Start · ${mineCount} mines`}
              onPress={startGame}
              disabled={balance < bet}
              size="lg"
              fullWidth
            />
          </>
        )}
        {isPlaying && (
          <GoldButton
            label={canCashout
              ? `Cash Out ${multiplier.toFixed(2)}× · ${currency === 'gold' ? Math.round(bet * multiplier).toLocaleString() : (bet * multiplier).toFixed(2)} ${currency === 'gold' ? 'GC' : 'SC'}`
              : 'Tap a tile to reveal'}
            onPress={cashout}
            disabled={!canCashout}
            size="lg"
            fullWidth
            haptic="heavy"
          />
        )}
        {isDone && (
          <GoldButton label="Play Again" onPress={reset} size="lg" fullWidth />
        )}
      </GradientCard>
    </View>
  );
}

const ms = StyleSheet.create({
  container: { gap: 12 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  toggle: { flexDirection: 'row', gap: 6 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)' },
  toggleActive: { backgroundColor: '#f5c842' },
  toggleText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  toggleTextActive: { color: '#0f1117' },
  balance: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  multBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  multBarCrash: { backgroundColor: 'rgba(239,68,68,0.08)' },
  multBarWin: { backgroundColor: 'rgba(34,197,94,0.08)' },
  multLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  winText: { color: '#22c55e', fontSize: 14, fontWeight: '700', marginTop: 2 },
  multValue: { fontSize: 28, fontWeight: '900', color: 'rgba(255,255,255,0.2)' },
  multCrash: { color: '#f87171' },
  multWin: { color: '#22c55e' },
  gridWrap: { padding: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: '17.6%', aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cellHidden: { backgroundColor: 'rgba(255,255,255,0.08)' },
  cellSafe: { backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)' },
  cellMine: { backgroundColor: 'rgba(239,68,68,0.3)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)' },
  cellUnrevealedMine: { backgroundColor: 'rgba(255,255,255,0.04)' },
  cellIcon: { fontSize: 18 },
  controls: { padding: 16, gap: 12 },
  optRow: { gap: 8 },
  optLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(245,200,66,0.15)', borderColor: 'rgba(245,200,66,0.4)' },
  chipMineActive: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  chipActiveText: { color: '#f5c842' },
  chipMineText: { color: '#f87171' },
});
