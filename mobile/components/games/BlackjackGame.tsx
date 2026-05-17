import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A';
type Card = { suit: Suit; rank: Rank; hidden?: boolean };
type Phase = 'betting' | 'player' | 'dealer' | 'done';
interface Result { outcome: 'win'|'lose'|'push'|'blackjack'; payout: number; message: string }

const SUITS: Suit[] = ['♠','♥','♦','♣'];
const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const RED: Suit[] = ['♥','♦'];
const BET_GC = [100,250,500,1000,2500];
const BET_SC = [0.1,0.25,0.5,1,2.5];

function buildDeck(): Card[] {
  return SUITS.flatMap(s => RANKS.map(r => ({ suit: s, rank: r })));
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function cardValue(c: Card) {
  if (['J','Q','K'].includes(c.rank)) return 10;
  if (c.rank === 'A') return 11;
  return parseInt(c.rank);
}
function handTotal(cards: Card[]) {
  let t=0, aces=0;
  for (const c of cards) { if (c.hidden) continue; t+=cardValue(c); if(c.rank==='A') aces++; }
  while (t>21 && aces>0) { t-=10; aces--; }
  return t;
}
function isBust(cards: Card[]) { return handTotal(cards)>21; }
function isBlackjack(cards: Card[]) { return cards.length===2 && handTotal(cards)===21; }

function CardView({ card }: { card: Card }) {
  const red = RED.includes(card.suit);
  if (card.hidden) return (
    <View style={[cs.card, cs.cardBack]}>
      <Text style={cs.cardBackPattern}>▪▪▪{'\n'}▪▪▪{'\n'}▪▪▪</Text>
    </View>
  );
  return (
    <View style={cs.card}>
      <Text style={[cs.cardRank, red && cs.cardRed]}>{card.rank}</Text>
      <Text style={[cs.cardSuit, red && cs.cardRed]}>{card.suit}</Text>
      <Text style={[cs.cardRankBottom, red && cs.cardRed]}>{card.rank}</Text>
    </View>
  );
}

export function BlackjackGame() {
  const [deck, setDeck] = useState<Card[]>(() => shuffle([...buildDeck(),...buildDeck()]));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>('betting');
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(2);
  const [result, setResult] = useState<Result|null>(null);
  const [sessionId, setSessionId] = useState('');
  const [dealing, setDealing] = useState(false);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency==='gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency==='gold' ? goldCoins : sweepsCoins;

  function drawCard(d: Card[], hidden=false): [Card, Card[]] {
    const [c, ...rest] = d;
    return [{...c, hidden}, rest];
  }

  const deal = useCallback(async () => {
    if (balance < bet || dealing) return;
    setDealing(true);
    deductBet(currency, bet);

    const { sessionId: sid, error } = await placeBet('blackjack', currency, bet);
    if (error) { addWin(currency, bet); setDealing(false); return; }
    setSessionId(sid);

    let d = deck.length < 20 ? shuffle([...buildDeck(),...buildDeck()]) : [...deck];
    const [c1,d1]=drawCard(d); d=d1;
    const [c2,d2]=drawCard(d); d=d2;
    const [c3,d3]=drawCard(d); d=d3;
    const [c4,d4]=drawCard(d,true); d=d4;

    setPlayerHand([c1,c2]);
    setDealerHand([c3,c4]);
    setDeck(d);
    setResult(null);
    setDealing(false);

    if (isBlackjack([c1,c2])) {
      const revealed = [c3,{...c4,hidden:false}];
      setDealerHand(revealed);
      if (isBlackjack(revealed)) {
        const res: Result = {outcome:'push',payout:bet,message:'Push — both have Blackjack!'};
        setResult(res); setPhase('done'); addWin(currency,bet); await recordWin(sid,bet);
      } else {
        const payout=bet*2.5;
        const res: Result = {outcome:'blackjack',payout,message:'Blackjack! You win 3:2!'};
        setResult(res); setPhase('done'); addWin(currency,payout); await recordWin(sid,payout);
      }
    } else {
      setPhase('player');
    }
  }, [balance,bet,currency,deck,dealing,deductBet,addWin]);

  function hit() {
    if (phase!=='player') return;
    const [card,rest] = drawCard(deck);
    const hand = [...playerHand, card];
    setPlayerHand(hand); setDeck(rest);
    if (isBust(hand)) {
      setResult({outcome:'lose',payout:0,message:'Bust! You lose.'}); setPhase('done');
      recordWin(sessionId, 0);
    }
  }

  async function stand() {
    if (phase!=='player') return;
    setPhase('dealer');

    let dCards = dealerHand.map(c=>({...c,hidden:false}));
    let d = [...deck];
    while (handTotal(dCards)<17) {
      const [card,rest]=drawCard(d); dCards=[...dCards,card]; d=rest;
    }
    setDealerHand(dCards); setDeck(d);

    const pt=handTotal(playerHand), dt=handTotal(dCards);
    let res: Result;
    if (isBust(dCards)) res={outcome:'win',payout:bet*2,message:'Dealer busts! You win!'};
    else if (pt>dt) res={outcome:'win',payout:bet*2,message:'You win!'};
    else if (pt<dt) res={outcome:'lose',payout:0,message:'Dealer wins.'};
    else res={outcome:'push',payout:bet,message:"Push — it's a tie!"};

    setResult(res); setPhase('done');
    if (res.payout>0) addWin(currency,res.payout);
    await recordWin(sessionId, res.payout);
  }

  async function doubleDown() {
    if (phase!=='player'||playerHand.length!==2||balance<bet) return;
    deductBet(currency,bet);
    const [card,rest]=drawCard(deck);
    const hand=[...playerHand,card];
    setPlayerHand(hand); setDeck(rest);
    if (isBust(hand)) {
      setResult({outcome:'lose',payout:0,message:'Bust after double down!'}); setPhase('done');
      await recordWin(sessionId,0);
    } else { await stand(); }
  }

  function reset() { setPhase('betting'); setPlayerHand([]); setDealerHand([]); setResult(null); }

  const resultColor = result
    ? (result.outcome==='win'||result.outcome==='blackjack') ? '#22c55e'
    : result.outcome==='lose' ? '#ef4444' : '#f5c842'
    : '#fff';

  return (
    <View style={cs.container}>
      {/* Currency + balance row */}
      <View style={cs.controlRow}>
        <View style={cs.currencyToggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <TouchableOpacity
              key={c} style={[cs.ccyBtn, currency===c && cs.ccyBtnActive]}
              onPress={()=>{if(phase==='betting') setCurrency(c)}}
              disabled={phase!=='betting'}
            >
              <Text style={[cs.ccyBtnText, currency===c && cs.ccyBtnTextActive]}>
                {c==='gold'?'🪙 Gold':'💎 Sweeps'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={cs.balanceText}>
          {currency==='gold' ? `🪙 ${goldCoins.toLocaleString()}` : `💎 ${sweepsCoins.toFixed(2)}`}
        </Text>
      </View>

      {/* Table */}
      <View style={cs.table}>
        <Text style={cs.handLabel}>DEALER {phase!=='betting'&&dealerHand.length>0
          ? `(${handTotal(dealerHand.filter(c=>!c.hidden))}${dealerHand.some(c=>c.hidden)?'+':''})`
          : ''}</Text>
        <View style={cs.handRow}>
          {dealerHand.map((c,i)=><CardView key={i} card={c}/>)}
        </View>

        <View style={cs.divider}/>

        <Text style={cs.handLabel}>YOU {playerHand.length>0?`(${handTotal(playerHand)})`:''}</Text>
        <View style={cs.handRow}>
          {playerHand.map((c,i)=><CardView key={i} card={c}/>)}
        </View>

        {result && (
          <View style={cs.resultOverlay}>
            <Text style={[cs.resultMsg,{color:resultColor}]}>{result.message}</Text>
            {result.payout>0 && (
              <Text style={[cs.resultPayout,{color:resultColor}]}>
                +{currency==='gold'?result.payout.toLocaleString():result.payout.toFixed(2)} {currency==='gold'?'GC':'SC'}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={cs.actions}>
        {phase==='betting' && (
          <>
            <View style={cs.betRow}>
              {betOptions.map((opt,i)=>(
                <TouchableOpacity key={i} style={[cs.betChip,betIdx===i&&cs.betChipActive]} onPress={()=>setBetIdx(i)}>
                  <Text style={[cs.betChipText,betIdx===i&&cs.betChipTextActive]}>
                    {currency==='gold'?opt.toLocaleString():opt.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[cs.actionBtn,cs.btnGold,balance<bet&&cs.btnDisabled]}
              onPress={deal} disabled={balance<bet||dealing}
            >
              {dealing
                ? <ActivityIndicator color="#0f1117"/>
                : <Text style={cs.btnGoldText}>Deal ({currency==='gold'?bet.toLocaleString():bet.toFixed(2)} {currency==='gold'?'GC':'SC'})</Text>
              }
            </TouchableOpacity>
          </>
        )}
        {phase==='player' && (
          <View style={cs.playerActions}>
            <TouchableOpacity style={[cs.actionBtn,cs.btnGold,{flex:1}]} onPress={hit}>
              <Text style={cs.btnGoldText}>Hit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[cs.actionBtn,cs.btnOutline,{flex:1}]} onPress={stand}>
              <Text style={cs.btnOutlineText}>Stand</Text>
            </TouchableOpacity>
            {playerHand.length===2&&balance>=bet&&(
              <TouchableOpacity style={[cs.actionBtn,cs.btnDark,{flex:1}]} onPress={doubleDown}>
                <Text style={cs.btnDarkText}>Double</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {phase==='dealer' && (
          <Text style={cs.dealerPlaying}>Dealer playing…</Text>
        )}
        {phase==='done' && (
          <TouchableOpacity style={[cs.actionBtn,cs.btnGold]} onPress={reset}>
            <Text style={cs.btnGoldText}>New Hand</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const cs = StyleSheet.create({
  container: { gap: 12 },
  controlRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#1a1f2e', borderWidth:1, borderColor:'#2a3048', borderRadius:12, padding:12 },
  currencyToggle: { flexDirection:'row', gap:6 },
  ccyBtn: { paddingHorizontal:12, paddingVertical:6, borderRadius:20, backgroundColor:'#2a3048' },
  ccyBtnActive: { backgroundColor:'#f5c842' },
  ccyBtnText: { color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:'600' },
  ccyBtnTextActive: { color:'#0f1117' },
  balanceText: { color:'rgba(255,255,255,0.5)', fontSize:13 },
  table: { backgroundColor:'#1a3a1a', borderWidth:1, borderColor:'#2d5a2d', borderRadius:16, padding:16, minHeight:280, gap:12 },
  handLabel: { color:'rgba(255,255,255,0.5)', fontSize:10, fontWeight:'600', letterSpacing:1 },
  handRow: { flexDirection:'row', flexWrap:'wrap', gap:6, minHeight:80 },
  divider: { height:1, backgroundColor:'rgba(255,255,255,0.1)' },
  resultOverlay: { position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.5)', borderRadius:14, alignItems:'center', justifyContent:'center', gap:8 } as any,
  resultMsg: { fontSize:22, fontWeight:'700', textAlign:'center', paddingHorizontal:16 },
  resultPayout: { fontSize:18, fontWeight:'600' },
  card: { width:52, height:76, backgroundColor:'#fff', borderRadius:8, padding:4, justifyContent:'space-between' },
  cardBack: { backgroundColor:'#1e3a8a', alignItems:'center', justifyContent:'center' },
  cardBackPattern: { color:'rgba(255,255,255,0.2)', fontSize:10, textAlign:'center', lineHeight:14 },
  cardRank: { fontSize:13, fontWeight:'700', color:'#111' },
  cardSuit: { fontSize:18, textAlign:'center', color:'#111' },
  cardRankBottom: { fontSize:13, fontWeight:'700', color:'#111', transform:[{rotate:'180deg'}], alignSelf:'flex-end' },
  cardRed: { color:'#dc2626' },
  actions: { backgroundColor:'#1a1f2e', borderWidth:1, borderColor:'#2a3048', borderRadius:12, padding:14, gap:10 },
  betRow: { flexDirection:'row', justifyContent:'center', gap:6, flexWrap:'wrap' },
  betChip: { paddingHorizontal:12, paddingVertical:6, borderRadius:8, backgroundColor:'#2a3048' },
  betChipActive: { backgroundColor:'#f5c842' },
  betChipText: { color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:'600' },
  betChipTextActive: { color:'#0f1117' },
  playerActions: { flexDirection:'row', gap:8 },
  actionBtn: { paddingVertical:14, borderRadius:10, alignItems:'center', justifyContent:'center' },
  btnGold: { backgroundColor:'#f5c842' },
  btnGoldText: { color:'#0f1117', fontWeight:'700', fontSize:15 },
  btnOutline: { borderWidth:1, borderColor:'#f5c842' },
  btnOutlineText: { color:'#f5c842', fontWeight:'700', fontSize:15 },
  btnDark: { backgroundColor:'#2a3048' },
  btnDarkText: { color:'#fff', fontWeight:'700', fontSize:15 },
  btnDisabled: { opacity:0.4 },
  dealerPlaying: { color:'rgba(255,255,255,0.5)', textAlign:'center', paddingVertical:8 },
});
