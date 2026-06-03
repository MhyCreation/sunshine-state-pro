import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type Card = { suit: Suit; rank: Rank };

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUE: Record<Rank, number> = { A:1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,J:11,Q:12,K:13 };
const RED: Suit[] = ['♥', '♦'];
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];
const HOUSE_EDGE = 0.97;

function shuffle(deck: Card[]): Card[] {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function buildDeck(): Card[] { return SUITS.flatMap(s => RANKS.map(r => ({ suit: s, rank: r }))); }
function pHigher(v: number) { return Math.max(0.01, (13 - v) / 13); }
function pLower(v: number) { return Math.max(0.01, (v - 1) / 13); }
function payoutFor(p: number) { return Math.round((HOUSE_EDGE / p) * 100) / 100; }

function CardView({ card }: { card: Card }) {
  const red = RED.includes(card.suit);
  return (
    <View style={[cs.card, red ? cs.cardRed : cs.cardBlack]}>
      <Text style={[cs.cardRank, red ? cs.textRed : cs.textBlack]}>{card.rank}</Text>
      <Text style={[cs.cardSuit, red ? cs.textRed : cs.textBlack]}>{card.suit}</Text>
      <Text style={[cs.cardRankBot, red ? cs.textRed : cs.textBlack]}>{card.rank}</Text>
    </View>
  );
}

export function HiLoGame() {
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [deck, setDeck] = useState<Card[]>(() => shuffle(buildDeck()));
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [sessionId, setSessionId] = useState('');
  const [rounds, setRounds] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === 'gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === 'gold' ? goldCoins : sweepsCoins;

  const startGame = useCallback(async () => {
    if (phase !== 'idle' || balance < bet) return;
    deductBet(currency, bet);
    const { sessionId: sid, error } = await placeBet('hilo', currency, bet);
    if (error) { addWin(currency, bet); return; }
    setSessionId(sid);
    const d = shuffle(buildDeck());
    const [first, ...rest] = d;
    setDeck(rest);
    setCurrentCard(first);
    setMultiplier(1.0);
    setRounds(0);
    setPhase('playing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [phase, balance, bet, currency, deductBet, addWin]);

  function guess(dir: 'higher' | 'lower') {
    if (phase !== 'playing' || !currentCard) return;
    const [next, ...rest] = deck;
    setDeck(rest);
    const cv = RANK_VALUE[currentCard.rank];
    const nv = RANK_VALUE[next.rank];
    const correct = dir === 'higher' ? nv > cv : nv < cv;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!correct) {
      recordWin(sessionId, 0, { rounds });
      setPhase('lost');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const p = dir === 'higher' ? pHigher(cv) : pLower(cv);
    const newMult = Math.round(multiplier * payoutFor(p) * 100) / 100;
    setMultiplier(newMult);
    setCurrentCard(next);
    setRounds(r => r + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  function collect() {
    if (phase !== 'playing' || rounds === 0) return;
    const win = currency === 'gold' ? Math.round(bet * multiplier) : Math.round(bet * multiplier * 100) / 100;
    addWin(currency, win);
    recordWin(sessionId, win, { multiplier, rounds });
    setPhase('won');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function reset() { setPhase('idle'); setCurrentCard(null); setMultiplier(1.0); setRounds(0); }

  const cv = currentCard ? RANK_VALUE[currentCard.rank] : 7;
  const ph = pHigher(cv);
  const pl = pLower(cv);
  const isPlaying = phase === 'playing';

  return (
    <View style={cs.container}>
      {/* Currency */}
      <GradientCard innerStyle={cs.controlRow}>
        <View style={cs.toggle}>
          {(['gold', 'sweeps'] as Currency[]).map(c => (
            <AnimatedPressable key={c} haptic="selection"
              style={[cs.toggleBtn, currency === c && cs.toggleActive]}
              onPress={() => { if (phase === 'idle') setCurrency(c); }}
              disabled={phase !== 'idle'}>
              <Text style={[cs.toggleText, currency === c && cs.toggleTextActive]}>
                {c === 'gold' ? '🪙 Gold' : '💎 Sweeps'}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={cs.balance}>
          {currency === 'gold' ? `🪙 ${goldCoins.toLocaleString()}` : `💎 ${sweepsCoins.toFixed(2)}`}
        </Text>
      </GradientCard>

      {/* Card display */}
      <GradientCard innerStyle={[cs.display, phase === 'won' ? cs.displayWin : phase === 'lost' ? cs.displayLose : {}]}>
        <View style={cs.multRow}>
          <Text style={cs.multLabel}>Multiplier</Text>
          <Text style={[cs.multValue, multiplier > 1 ? cs.textGold : cs.textDim]}>{multiplier.toFixed(2)}×</Text>
        </View>
        <View style={cs.cardRow}>
          {currentCard ? <CardView card={currentCard} /> : (
            <View style={cs.cardEmpty}><Text style={cs.cardEmptyText}>?</Text></View>
          )}
        </View>
        {phase === 'won' && <Text style={cs.textWin}>🎉 Cashed out {multiplier.toFixed(2)}×</Text>}
        {phase === 'lost' && <Text style={cs.textLose}>Wrong guess!</Text>}
      </GradientCard>

      {/* Actions */}
      <GradientCard innerStyle={cs.actions}>
        {phase === 'idle' && (
          <>
            <View style={cs.chips}>
              {betOptions.map((opt, i) => (
                <AnimatedPressable key={i} haptic="selection"
                  style={[cs.chip, betIdx === i && cs.chipActive]}
                  onPress={() => setBetIdx(i)}>
                  <Text style={[cs.chipText, betIdx === i && cs.chipTextActive]}>
                    {currency === 'gold' ? opt.toLocaleString() : opt.toFixed(2)}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
            <GoldButton label="Deal Card" onPress={startGame} disabled={balance < bet} size="lg" fullWidth />
          </>
        )}
        {isPlaying && (
          <>
            <View style={cs.guessBtns}>
              <AnimatedPressable haptic="medium" style={cs.guessBtn} onPress={() => guess('lower')}>
                <Text style={cs.guessBtnIcon}>⬇</Text>
                <Text style={cs.guessBtnLabel}>Lower</Text>
                <Text style={cs.guessBtnOdds}>{(pl * 100).toFixed(0)}% · {payoutFor(pl).toFixed(2)}×</Text>
              </AnimatedPressable>
              <AnimatedPressable haptic="medium" style={cs.guessBtn} onPress={() => guess('higher')}>
                <Text style={cs.guessBtnIcon}>⬆</Text>
                <Text style={cs.guessBtnLabel}>Higher</Text>
                <Text style={cs.guessBtnOdds}>{(ph * 100).toFixed(0)}% · {payoutFor(ph).toFixed(2)}×</Text>
              </AnimatedPressable>
            </View>
            {rounds > 0 && (
              <GoldButton
                label={`Collect ${multiplier.toFixed(2)}× · ${currency === 'gold' ? Math.round(bet * multiplier).toLocaleString() : (bet * multiplier).toFixed(2)} ${currency === 'gold' ? 'GC' : 'SC'}`}
                onPress={collect}
                variant="outline"
                size="lg"
                fullWidth
                haptic="medium"
              />
            )}
          </>
        )}
        {(phase === 'won' || phase === 'lost') && (
          <GoldButton label="Play Again" onPress={reset} size="lg" fullWidth />
        )}
      </GradientCard>
    </View>
  );
}

const cs = StyleSheet.create({
  container: { gap: 12 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  toggle: { flexDirection: 'row', gap: 6 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)' },
  toggleActive: { backgroundColor: '#f5c842' },
  toggleText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  toggleTextActive: { color: '#0f1117' },
  balance: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  display: { padding: 24, alignItems: 'center', gap: 16 },
  displayWin: { backgroundColor: 'rgba(34,197,94,0.07)' },
  displayLose: { backgroundColor: 'rgba(239,68,68,0.07)' },
  multRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  multLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  multValue: { fontSize: 24, fontWeight: '900' },
  textGold: { color: '#f5c842' },
  textDim: { color: 'rgba(255,255,255,0.2)' },
  cardRow: { flexDirection: 'row', gap: 12, minHeight: 100 },
  card: { width: 64, height: 88, borderRadius: 10, padding: 6, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8 },
  cardRed: { backgroundColor: '#fff' },
  cardBlack: { backgroundColor: '#fff' },
  cardRank: { fontSize: 14, fontWeight: '800' },
  cardSuit: { fontSize: 26, textAlign: 'center' },
  cardRankBot: { fontSize: 14, fontWeight: '800', transform: [{ rotate: '180deg' }], alignSelf: 'flex-end' },
  textRed: { color: '#dc2626' },
  textBlack: { color: '#111' },
  cardEmpty: { width: 64, height: 88, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  cardEmptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 28 },
  textWin: { color: '#22c55e', fontSize: 15, fontWeight: '700' },
  textLose: { color: '#f87171', fontSize: 15, fontWeight: '700' },
  actions: { padding: 16, gap: 12 },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(245,200,66,0.15)', borderColor: 'rgba(245,200,66,0.4)' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#f5c842' },
  guessBtns: { flexDirection: 'row', gap: 10 },
  guessBtn: { flex: 1, backgroundColor: 'rgba(245,200,66,0.1)', borderWidth: 1, borderColor: 'rgba(245,200,66,0.3)', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  guessBtnIcon: { fontSize: 24 },
  guessBtnLabel: { color: '#f5c842', fontSize: 15, fontWeight: '700' },
  guessBtnOdds: { color: 'rgba(245,200,66,0.5)', fontSize: 10 },
});
