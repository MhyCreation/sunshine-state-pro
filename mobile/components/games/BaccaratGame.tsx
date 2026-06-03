import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LinearGradient } from 'expo-linear-gradient';

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type Card = { suit: Suit; rank: Rank };
type BetType = 'player' | 'banker' | 'tie';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RED: Suit[] = ['♥', '♦'];
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

function buildShoe(): Card[] {
  const deck = SUITS.flatMap(s => RANKS.map(r => ({ suit: s, rank: r })));
  const shoe = Array.from({ length: 8 }, () => deck).flat();
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

function cardValue(c: Card): number {
  if (['J', 'Q', 'K', '10'].includes(c.rank)) return 0;
  if (c.rank === 'A') return 1;
  return parseInt(c.rank);
}

function handTotal(cards: Card[]): number {
  return cards.reduce((sum, c) => (sum + cardValue(c)) % 10, 0);
}

function resolveThirdCards(
  pHand: Card[], bHand: Card[], shoe: Card[]
): { pHand: Card[]; bHand: Card[]; shoe: Card[] } {
  const pTotal = handTotal(pHand);
  const bTotal = handTotal(bHand);
  if (pTotal >= 8 || bTotal >= 8) return { pHand, bHand, shoe };

  let s = [...shoe];
  let pDrewCard: Card | null = null;
  let newPHand = [...pHand];
  let newBHand = [...bHand];

  if (pTotal <= 5) {
    const [card, ...rest] = s; s = rest;
    pDrewCard = card;
    newPHand = [...newPHand, card];
  }

  const newBTotal = handTotal(newBHand);
  let bankerDraws = false;
  if (pDrewCard === null) {
    bankerDraws = newBTotal <= 5;
  } else {
    const p3v = cardValue(pDrewCard);
    if (newBTotal <= 2) bankerDraws = true;
    else if (newBTotal === 3) bankerDraws = p3v !== 8;
    else if (newBTotal === 4) bankerDraws = [2, 3, 4, 5, 6, 7].includes(p3v);
    else if (newBTotal === 5) bankerDraws = [4, 5, 6, 7].includes(p3v);
    else if (newBTotal === 6) bankerDraws = [6, 7].includes(p3v);
  }

  if (bankerDraws) {
    const [card, ...rest] = s; s = rest;
    newBHand = [...newBHand, card];
  }
  return { pHand: newPHand, bHand: newBHand, shoe: s };
}

function CardView({ card }: { card: Card }) {
  const red = RED.includes(card.suit);
  return (
    <View style={[cs.card, cs.cardFace]}>
      <Text style={[cs.cardRank, red && cs.red]}>{card.rank}</Text>
      <Text style={[cs.cardSuit, red && cs.red]}>{card.suit}</Text>
      <Text style={[cs.cardRankBot, red && cs.red]}>{card.rank}</Text>
    </View>
  );
}

export function BaccaratGame() {
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);
  const [betType, setBetType] = useState<BetType>('player');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [bankerHand, setBankerHand] = useState<Card[]>([]);
  const [phase, setPhase] = useState<'betting' | 'dealing' | 'result'>('betting');
  const [winner, setWinner] = useState<'player' | 'banker' | 'tie' | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const [shoe, setShoe] = useState<Card[]>(() => buildShoe());

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === 'gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === 'gold' ? goldCoins : sweepsCoins;

  const deal = useCallback(async () => {
    if (balance < bet || phase !== 'betting') return;
    setPhase('dealing');
    deductBet(currency, bet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { sessionId, error } = await placeBet('baccarat', currency, bet);
    if (error) { addWin(currency, bet); setPhase('betting'); return; }

    let s = shoe.length < 20 ? buildShoe() : [...shoe];
    const [p1, ...s1] = s; s = s1;
    const [b1, ...s2] = s; s = s2;
    const [p2, ...s3] = s; s = s3;
    const [b2, ...s4] = s; s = s4;

    const { pHand, bHand, shoe: sRem } = resolveThirdCards([p1, p2], [b1, b2], s4);
    setShoe(sRem);
    setPlayerHand(pHand);
    setBankerHand(bHand);

    const pTotal = handTotal(pHand);
    const bTotal = handTotal(bHand);
    const w: 'player' | 'banker' | 'tie' = pTotal > bTotal ? 'player' : bTotal > pTotal ? 'banker' : 'tie';

    let win = 0;
    if (betType === 'player' && w === 'player') win = bet * 2;
    else if (betType === 'banker' && w === 'banker') win = Math.round(bet * 1.95 * 100) / 100;
    else if (betType === 'tie' && w === 'tie') win = bet * 9;
    else if ((betType === 'player' || betType === 'banker') && w === 'tie') win = bet;

    if (win > 0) {
      addWin(currency, win);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setWinner(w);
    setWinAmount(win);
    await recordWin(sessionId, win, { playerTotal: pTotal, bankerTotal: bTotal, winner: w, betType });
    setPhase('result');
  }, [balance, bet, betType, currency, phase, shoe, deductBet, addWin]);

  function reset() {
    setPlayerHand([]);
    setBankerHand([]);
    setWinner(null);
    setWinAmount(0);
    setPhase('betting');
  }

  const BET_LABELS: Record<BetType, string> = {
    player: 'Player 1:1',
    banker: 'Banker 0.95:1',
    tie: 'Tie 8:1',
  };

  return (
    <View style={cs.container}>
      {/* Currency */}
      <GradientCard innerStyle={cs.controlRow}>
        <View style={cs.toggle}>
          {(['gold', 'sweeps'] as Currency[]).map(c => (
            <AnimatedPressable key={c} haptic="selection"
              style={[cs.toggleBtn, currency === c && cs.toggleActive]}
              onPress={() => { if (phase === 'betting') setCurrency(c); }}
              disabled={phase !== 'betting'}>
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

      {/* Table */}
      <LinearGradient colors={['#0b2a10', '#061507']} style={cs.table}>
        {/* Banker */}
        <View style={cs.hand}>
          <View style={cs.handHeader}>
            <Text style={cs.handLabel}>BANKER</Text>
            {bankerHand.length > 0 && (
              <Text style={[cs.total, winner === 'banker' && cs.totalWin]}>
                {handTotal(bankerHand)}
              </Text>
            )}
          </View>
          <View style={cs.cards}>
            {bankerHand.map((c, i) => <CardView key={i} card={c} />)}
          </View>
        </View>

        <View style={cs.divider} />

        {/* Player */}
        <View style={cs.hand}>
          <View style={cs.handHeader}>
            <Text style={cs.handLabel}>PLAYER</Text>
            {playerHand.length > 0 && (
              <Text style={[cs.total, winner === 'player' && cs.totalWin]}>
                {handTotal(playerHand)}
              </Text>
            )}
          </View>
          <View style={cs.cards}>
            {playerHand.map((c, i) => <CardView key={i} card={c} />)}
          </View>
        </View>

        {/* Result */}
        {phase === 'result' && winner && (
          <View style={[cs.resultBox, winAmount > 0 ? cs.resultWin : cs.resultLose]}>
            <Text style={[cs.resultMsg, winAmount > 0 ? cs.textWin : cs.textLose]}>
              {winner === 'tie' ? '🤝 Tie!' : winner === 'player' ? '👤 Player wins!' : '🏦 Banker wins!'}
            </Text>
            {winAmount > 0 && (
              <Text style={cs.textWin}>
                +{currency === 'gold' ? winAmount.toLocaleString() : winAmount.toFixed(2)} {currency === 'gold' ? 'GC' : 'SC'}
              </Text>
            )}
          </View>
        )}
      </LinearGradient>

      {/* Actions */}
      <GradientCard innerStyle={cs.actions}>
        {phase === 'betting' && (
          <>
            <View style={cs.betTypeRow}>
              {(['player', 'banker', 'tie'] as BetType[]).map(t => (
                <TouchableOpacity key={t}
                  style={[cs.betTypeBtn, betType === t && cs.betTypeBtnActive]}
                  onPress={() => { Haptics.selectionAsync(); setBetType(t); }}>
                  <Text style={[cs.betTypeTxt, betType === t && cs.betTypeTxtActive]}>
                    {BET_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={cs.chipRow}>
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
            <GoldButton
              label={`Deal · ${betType.charAt(0).toUpperCase() + betType.slice(1)}`}
              onPress={deal}
              loading={phase === 'dealing'}
              disabled={balance < bet}
              size="lg"
              fullWidth
            />
          </>
        )}
        {phase === 'result' && (
          <GoldButton label="New Hand" onPress={reset} size="lg" fullWidth haptic="medium" />
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
  table: { borderRadius: 20, borderWidth: 1, borderColor: '#1a4a1a', overflow: 'hidden', padding: 20, gap: 16 },
  hand: { gap: 8 },
  handHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  handLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  total: { fontSize: 20, fontWeight: '800', color: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 2, borderRadius: 20 },
  totalWin: { color: '#22c55e', backgroundColor: 'rgba(34,197,94,0.15)' },
  cards: { flexDirection: 'row', gap: 8, minHeight: 84 },
  card: { width: 54, height: 78, borderRadius: 8, overflow: 'hidden' },
  cardFace: { backgroundColor: '#fff', padding: 4, justifyContent: 'space-between' },
  cardRank: { fontSize: 12, fontWeight: '800', color: '#111' },
  cardSuit: { fontSize: 20, textAlign: 'center', color: '#111' },
  cardRankBot: { fontSize: 12, fontWeight: '800', color: '#111', transform: [{ rotate: '180deg' }], alignSelf: 'flex-end' },
  red: { color: '#dc2626' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  resultBox: { borderRadius: 12, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1 },
  resultWin: { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' },
  resultLose: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' },
  resultMsg: { fontSize: 18, fontWeight: '700' },
  textWin: { color: '#22c55e', fontSize: 16, fontWeight: '700' },
  textLose: { color: 'rgba(255,255,255,0.5)' },
  actions: { padding: 16, gap: 12 },
  betTypeRow: { flexDirection: 'row', gap: 6 },
  betTypeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent', alignItems: 'center' },
  betTypeBtnActive: { backgroundColor: 'rgba(245,200,66,0.12)', borderColor: 'rgba(245,200,66,0.4)' },
  betTypeTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  betTypeTxtActive: { color: '#f5c842' },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(245,200,66,0.15)', borderColor: 'rgba(245,200,66,0.4)' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#f5c842' },
});
