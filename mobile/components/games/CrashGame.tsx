import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

function generateCrashPoint(): number {
  const r = Math.random();
  if (r < 0.03) return 1.0;
  return Math.round((0.97 / (1 - r)) * 100) / 100;
}

export function CrashGame() {
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'running' | 'cashed' | 'crashed'>('idle');
  const [multiplier, setMultiplier] = useState(1.0);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(0);
  const [crashPoint, setCrashPoint] = useState(0);

  const sessionIdRef = useRef('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const multiplierRef = useRef(1.0);
  const crashPointRef = useRef(0);
  const phaseRef = useRef<'idle' | 'running' | 'cashed' | 'crashed'>('idle');

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === 'gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === 'gold' ? goldCoins : sweepsCoins;

  function stopTimer() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }
  useEffect(() => () => stopTimer(), []);

  const play = useCallback(async () => {
    if (phaseRef.current !== 'idle' || balance < bet) return;
    deductBet(currency, bet);
    const { sessionId, error } = await placeBet('crash', currency, bet);
    if (error) { addWin(currency, bet); return; }
    sessionIdRef.current = sessionId;

    const cp = generateCrashPoint();
    crashPointRef.current = cp;
    multiplierRef.current = 1.0;
    setCrashPoint(cp);
    setMultiplier(1.0);
    setCashoutMultiplier(0);
    phaseRef.current = 'running';
    setPhase('running');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    intervalRef.current = setInterval(() => {
      if (phaseRef.current !== 'running') { stopTimer(); return; }
      const next = Math.round(multiplierRef.current * 1.00365 * 100) / 100;
      multiplierRef.current = next;
      setMultiplier(next);
      if (next >= crashPointRef.current) {
        stopTimer();
        phaseRef.current = 'crashed';
        setPhase('crashed');
        recordWin(sessionIdRef.current, 0, { crashPoint: cp });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }, 50);
  }, [balance, bet, currency, deductBet, addWin]);

  const cashOut = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    stopTimer();
    const m = multiplierRef.current;
    const win = currency === 'gold' ? Math.round(bet * m) : Math.round(bet * m * 100) / 100;
    setCashoutMultiplier(m);
    addWin(currency, win);
    recordWin(sessionIdRef.current, win, { cashoutMultiplier: m });
    phaseRef.current = 'cashed';
    setPhase('cashed');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [bet, currency, addWin]);

  function reset() {
    phaseRef.current = 'idle';
    setPhase('idle');
    setMultiplier(1.0);
  }

  const isRunning = phase === 'running';
  const isCrashed = phase === 'crashed';
  const isCashed = phase === 'cashed';

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

      {/* Crash display */}
      <GradientCard innerStyle={[s.display, isCrashed && s.displayCrashed, isCashed && s.displayCashed]}>
        <Text style={s.displayLabel}>
          {isRunning ? '🚀 Flying… tap to cash out!' : isCrashed ? '💥 Crashed!' : isCashed ? '🎉 Cashed Out!' : 'Ready to launch'}
        </Text>
        <Text style={[s.displayMult, isCrashed && s.textCrashed, isCashed && s.textWin]}>
          {multiplier.toFixed(2)}×
        </Text>
        {isCashed && (
          <Text style={s.textWin}>
            +{currency === 'gold'
              ? Math.round(bet * cashoutMultiplier).toLocaleString()
              : (bet * cashoutMultiplier).toFixed(2)
            } {currency === 'gold' ? 'GC' : 'SC'}
          </Text>
        )}
        {isCrashed && (
          <Text style={s.crashedSub}>Crashed at {crashPoint.toFixed(2)}×</Text>
        )}
      </GradientCard>

      {/* Bet + actions */}
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

        {phase === 'idle' && (
          <GoldButton
            label="Launch 🚀"
            onPress={play}
            disabled={balance < bet}
            size="lg"
            fullWidth
          />
        )}
        {isRunning && (
          <GoldButton
            label={`Cash Out ${multiplier.toFixed(2)}× · ${currency === 'gold' ? Math.round(bet * multiplier).toLocaleString() : (bet * multiplier).toFixed(2)} ${currency === 'gold' ? 'GC' : 'SC'}`}
            onPress={cashOut}
            size="lg"
            fullWidth
            haptic="heavy"
          />
        )}
        {(isCrashed || isCashed) && (
          <GoldButton label="Play Again" onPress={reset} size="lg" fullWidth />
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
  display: { padding: 40, alignItems: 'center', gap: 10, minHeight: 200, justifyContent: 'center' },
  displayCrashed: { backgroundColor: 'rgba(239,68,68,0.08)' },
  displayCashed: { backgroundColor: 'rgba(34,197,94,0.08)' },
  displayLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' },
  displayMult: { fontSize: 64, fontWeight: '900', color: 'rgba(255,255,255,0.3)', letterSpacing: -2 },
  textCrashed: { color: '#f87171' },
  textWin: { color: '#22c55e', fontSize: 18, fontWeight: '700' },
  crashedSub: { color: 'rgba(248,113,113,0.6)', fontSize: 13 },
  betWrap: { padding: 16, gap: 12 },
  betRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(245,200,66,0.15)', borderColor: 'rgba(245,200,66,0.4)' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#f5c842' },
});
