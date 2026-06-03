import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';

type Suit = '♠'|'♥'|'♦'|'♣';
type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A';
type Card = { suit: Suit; rank: Rank; hidden?: boolean };
type Phase = 'betting'|'player'|'dealer'|'done';
interface Result { outcome: 'win'|'lose'|'push'|'blackjack'; payout: number; message: string }

const SUITS: Suit[] = ['♠','♥','♦','♣'];
const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const RED: Suit[] = ['♥','♦'];
const BET_GC = [100,250,500,1000,2500];
const BET_SC = [0.1,0.25,0.5,1,2.5];

function buildDeck(): Card[] { return SUITS.flatMap(s => RANKS.map(r => ({ suit:s, rank:r }))); }
function shuffle<T>(arr: T[]): T[] {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;
}
function cardValue(c: Card) {
  if (['J','Q','K'].includes(c.rank)) return 10;
  if (c.rank==='A') return 11;
  return parseInt(c.rank);
}
function handTotal(cards: Card[]) {
  let t=0, aces=0;
  for(const c of cards){if(c.hidden)continue;t+=cardValue(c);if(c.rank==='A')aces++;}
  while(t>21&&aces>0){t-=10;aces--;} return t;
}
function isBust(cards: Card[]) { return handTotal(cards)>21; }
function isBlackjack(cards: Card[]) { return cards.length===2&&handTotal(cards)===21; }

// Animated playing card
function CardView({ card, index }: { card: Card; index: number }) {
  const slide = useRef(new Animated.Value(30)).current;
  const fade = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useState(() => {
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, speed: 20, bounciness: 6, useNativeDriver: true, delay: index * 80 }),
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true, delay: index * 80 }),
    ]).start();
  });

  const red = RED.includes(card.suit);
  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      {card.hidden ? (
        <LinearGradient colors={['#1e3a8a','#1e1b4b']} style={cs.card}>
          <View style={cs.cardBackPattern}>
            {[...Array(9)].map((_,i) => <View key={i} style={cs.cardDot}/>)}
          </View>
        </LinearGradient>
      ) : (
        <View style={[cs.card, cs.cardFace]}>
          <Text style={[cs.cardRank, red && cs.red]}>{card.rank}</Text>
          <Text style={[cs.cardSuit, red && cs.red]}>{card.suit}</Text>
          <Text style={[cs.cardRankBot, red && cs.red]}>{card.rank}</Text>
        </View>
      )}
    </Animated.View>
  );
}

// Animated result banner
function ResultBanner({ result }: { result: Result }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useState(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, speed: 16, bounciness: 10, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  });
  const isWin = result.outcome === 'win' || result.outcome === 'blackjack';
  const isPush = result.outcome === 'push';
  return (
    <Animated.View style={[cs.resultOverlay, { opacity }]}>
      <Animated.View style={[cs.resultBox, isWin && cs.resultBoxWin, isPush && cs.resultBoxPush, { transform: [{ scale }] }]}>
        <Text style={[cs.resultMsg, isWin ? cs.textWin : isPush ? cs.textGold : cs.textLose]}>
          {result.message}
        </Text>
        {result.payout > 0 && (
          <Text style={[cs.resultPayout, isWin ? cs.textWin : cs.textGold]}>
            +{result.payout.toLocaleString()} {result.payout < 10 ? result.payout.toFixed(2) : ''}
          </Text>
        )}
      </Animated.View>
    </Animated.View>
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

  function drawCard(d: Card[], hidden=false): [Card,Card[]] {
    const [c,...rest]=d; return [{...c,hidden},rest];
  }

  const deal = useCallback(async () => {
    if (balance<bet||dealing) return;
    setDealing(true);
    deductBet(currency,bet);
    const {sessionId:sid,error}=await placeBet('blackjack',currency,bet);
    if(error){addWin(currency,bet);setDealing(false);return;}
    setSessionId(sid);

    let d=deck.length<20?shuffle([...buildDeck(),...buildDeck()]):[...deck];
    const [c1,d1]=drawCard(d);d=d1;
    const [c2,d2]=drawCard(d);d=d2;
    const [c3,d3]=drawCard(d);d=d3;
    const [c4,d4]=drawCard(d,true);d=d4;

    setPlayerHand([c1,c2]);setDealerHand([c3,c4]);setDeck(d);setResult(null);setDealing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if(isBlackjack([c1,c2])){
      const revealed=[c3,{...c4,hidden:false}];setDealerHand(revealed);
      if(isBlackjack(revealed)){
        const r:Result={outcome:'push',payout:bet,message:'Push — both have Blackjack!'};
        setResult(r);setPhase('done');addWin(currency,bet);await recordWin(sid,bet);
      }else{
        const payout=bet*2.5;
        const r:Result={outcome:'blackjack',payout,message:'Blackjack! 3:2!'};
        setResult(r);setPhase('done');addWin(currency,payout);await recordWin(sid,payout);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }else{setPhase('player');}
  },[balance,bet,currency,deck,dealing,deductBet,addWin]);

  function hit(){
    if(phase!=='player')return;
    const [card,rest]=drawCard(deck);
    const hand=[...playerHand,card];
    setPlayerHand(hand);setDeck(rest);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if(isBust(hand)){
      const r:Result={outcome:'lose',payout:0,message:'Bust! You lose.'};
      setResult(r);setPhase('done');recordWin(sessionId,0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function stand(){
    if(phase!=='player')return;
    setPhase('dealer');
    let dCards=dealerHand.map(c=>({...c,hidden:false}));
    let d=[...deck];
    while(handTotal(dCards)<17){const[card,rest]=drawCard(d);dCards=[...dCards,card];d=rest;}
    setDealerHand(dCards);setDeck(d);
    const pt=handTotal(playerHand),dt=handTotal(dCards);
    let r:Result;
    if(isBust(dCards)) r={outcome:'win',payout:bet*2,message:'Dealer busts! You win!'};
    else if(pt>dt) r={outcome:'win',payout:bet*2,message:'You win!'};
    else if(pt<dt) r={outcome:'lose',payout:0,message:'Dealer wins.'};
    else r={outcome:'push',payout:bet,message:"It's a tie!"};
    setResult(r);setPhase('done');
    if(r.payout>0){addWin(currency,r.payout);Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);}
    await recordWin(sessionId,r.payout);
  }

  async function doubleDown(){
    if(phase!=='player'||playerHand.length!==2||balance<bet)return;
    deductBet(currency,bet);
    const[card,rest]=drawCard(deck);
    const hand=[...playerHand,card];
    setPlayerHand(hand);setDeck(rest);
    if(isBust(hand)){setResult({outcome:'lose',payout:0,message:'Bust after double!'});setPhase('done');await recordWin(sessionId,0);}
    else await stand();
  }

  function reset(){setPhase('betting');setPlayerHand([]);setDealerHand([]);setResult(null);}

  return (
    <View style={cs.container}>
      {/* Currency + balance */}
      <GradientCard innerStyle={cs.controlRow}>
        <View style={cs.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <AnimatedPressable key={c} haptic="selection"
              style={[cs.toggleBtn, currency===c && cs.toggleActive]}
              onPress={()=>{if(phase==='betting')setCurrency(c)}}
              disabled={phase!=='betting'}>
              <Text style={[cs.toggleText, currency===c && cs.toggleTextActive]}>
                {c==='gold'?'🪙 Gold':'💎 Sweeps'}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={cs.balance}>
          {currency==='gold'?`🪙 ${goldCoins.toLocaleString()}`:`💎 ${sweepsCoins.toFixed(2)}`}
        </Text>
      </GradientCard>

      {/* Table */}
      <LinearGradient colors={['#0b2a10','#061507']} style={cs.table}>
        <View style={cs.tableBorder}>
          <Text style={cs.handLabel}>
            DEALER {phase!=='betting'&&dealerHand.length>0
              ?`· ${handTotal(dealerHand.filter(c=>!c.hidden))}${dealerHand.some(c=>c.hidden)?'+':''}`:''}
          </Text>
          <View style={cs.handRow}>
            {dealerHand.map((c,i)=><CardView key={`d${i}`} card={c} index={i}/>)}
          </View>

          <View style={cs.tableDivider}/>

          <Text style={cs.handLabel}>
            YOU {playerHand.length>0?`· ${handTotal(playerHand)}`:''}
          </Text>
          <View style={cs.handRow}>
            {playerHand.map((c,i)=><CardView key={`p${i}`} card={c} index={i}/>)}
          </View>
        </View>

        {result && <ResultBanner result={result}/>}
      </LinearGradient>

      {/* Action bar */}
      <GradientCard innerStyle={cs.actions}>
        {phase==='betting' && (
          <View style={cs.betSection}>
            <Text style={cs.betLabel}>Select bet</Text>
            <View style={cs.chipRow}>
              {betOptions.map((opt,i)=>(
                <AnimatedPressable key={i} haptic="selection"
                  style={[cs.chip, betIdx===i && cs.chipActive]}
                  onPress={()=>setBetIdx(i)}>
                  <Text style={[cs.chipText, betIdx===i && cs.chipTextActive]}>
                    {currency==='gold'?opt.toLocaleString():opt.toFixed(2)}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
            <GoldButton
              label={`Deal · ${currency==='gold'?bet.toLocaleString():bet.toFixed(2)} ${currency==='gold'?'GC':'SC'}`}
              onPress={deal} loading={dealing} disabled={balance<bet}
              size="lg" fullWidth
            />
          </View>
        )}
        {phase==='player' && (
          <View style={cs.playerBtns}>
            <GoldButton label="Hit" onPress={hit} size="lg" style={{flex:1}}/>
            <GoldButton label="Stand" onPress={stand} variant="outline" size="lg" style={{flex:1}}/>
            {playerHand.length===2&&balance>=bet&&(
              <GoldButton label="2×" onPress={doubleDown} variant="ghost" size="lg" style={{flex:0.6}}/>
            )}
          </View>
        )}
        {phase==='dealer' && (
          <View style={cs.dealerRow}>
            <Text style={cs.dealerText}>Dealer is playing…</Text>
          </View>
        )}
        {phase==='done' && (
          <GoldButton label="New Hand" onPress={reset} size="lg" fullWidth haptic="medium"/>
        )}
      </GradientCard>
    </View>
  );
}

const cs = StyleSheet.create({
  container: { gap: 12 },
  controlRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:14 },
  toggle: { flexDirection:'row', gap:6 },
  toggleBtn: { paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:'rgba(255,255,255,0.06)' },
  toggleActive: { backgroundColor:'#f5c842' },
  toggleText: { color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:'600' },
  toggleTextActive: { color:'#0f1117' },
  balance: { color:'rgba(255,255,255,0.4)', fontSize:12 },
  table: { borderRadius:20, borderWidth:1, borderColor:'#1a4a1a', overflow:'hidden', minHeight:300 },
  tableBorder: { padding:20, gap:12 },
  handLabel: { color:'rgba(255,255,255,0.4)', fontSize:10, fontWeight:'700', letterSpacing:1.5 },
  handRow: { flexDirection:'row', flexWrap:'wrap', gap:8, minHeight:88 },
  tableDivider: { height:1, backgroundColor:'rgba(255,255,255,0.08)' },
  card: { width:54, height:78, borderRadius:8, overflow:'hidden' },
  cardFace: { backgroundColor:'#fff', padding:4, justifyContent:'space-between' },
  cardBackPattern: { flex:1, flexDirection:'row', flexWrap:'wrap', padding:6, gap:4, alignItems:'center', justifyContent:'center' },
  cardDot: { width:8, height:8, borderRadius:4, backgroundColor:'rgba(255,255,255,0.15)' },
  cardRank: { fontSize:12, fontWeight:'800', color:'#111' },
  cardSuit: { fontSize:20, textAlign:'center', color:'#111' },
  cardRankBot: { fontSize:12, fontWeight:'800', color:'#111', transform:[{rotate:'180deg'}], alignSelf:'flex-end' },
  red: { color:'#dc2626' },
  resultOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.6)', borderRadius:20, alignItems:'center', justifyContent:'center' },
  resultBox: { backgroundColor:'rgba(255,255,255,0.08)', borderWidth:1, borderColor:'rgba(255,255,255,0.12)', borderRadius:16, padding:24, alignItems:'center', gap:8, minWidth:220 },
  resultBoxWin: { borderColor:'rgba(34,197,94,0.4)', backgroundColor:'rgba(34,197,94,0.08)' },
  resultBoxPush: { borderColor:'rgba(245,200,66,0.4)' },
  resultMsg: { fontSize:22, fontWeight:'800', textAlign:'center' },
  resultPayout: { fontSize:18, fontWeight:'700' },
  textWin: { color:'#22c55e' },
  textGold: { color:'#f5c842' },
  textLose: { color:'#ef4444' },
  actions: { padding:16, gap:12 },
  betSection: { gap:12 },
  betLabel: { color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:'600', letterSpacing:0.5, textTransform:'uppercase' },
  chipRow: { flexDirection:'row', gap:6, flexWrap:'wrap' },
  chip: { paddingHorizontal:14, paddingVertical:8, borderRadius:10, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'transparent' },
  chipActive: { backgroundColor:'rgba(245,200,66,0.15)', borderColor:'rgba(245,200,66,0.4)' },
  chipText: { color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:'700' },
  chipTextActive: { color:'#f5c842' },
  playerBtns: { flexDirection:'row', gap:8 },
  dealerRow: { paddingVertical:8, alignItems:'center' },
  dealerText: { color:'rgba(255,255,255,0.4)', fontSize:14 },
});
