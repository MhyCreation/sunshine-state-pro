import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';

type Suit = '♠'|'♥'|'♦'|'♣';
type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A';
type Card = { suit:Suit; rank:Rank };
type Phase = 'betting'|'holding'|'result';

const SUITS: Suit[] = ['♠','♥','♦','♣'];
const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const RED: Suit[] = ['♥','♦'];
const RANK_VAL: Record<Rank,number> = {
  '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14,
};

function buildDeck(): Card[] {
  return SUITS.flatMap(s=>RANKS.map(r=>({suit:s,rank:r})));
}
function shuffle<T>(arr:T[]) {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;
}

type HandRank = 'Royal Flush'|'Straight Flush'|'Four of a Kind'|'Full House'|'Flush'|'Straight'|'Three of a Kind'|'Two Pair'|'Jacks or Better'|'Nothing';

const PAYOUTS: Record<HandRank,number> = {
  'Royal Flush':800,'Straight Flush':50,'Four of a Kind':25,'Full House':9,'Flush':6,
  'Straight':4,'Three of a Kind':3,'Two Pair':2,'Jacks or Better':1,'Nothing':0,
};

function evaluate(hand: Card[]): HandRank {
  const vals = hand.map(c=>RANK_VAL[c.rank]).sort((a,b)=>a-b);
  const suits = hand.map(c=>c.suit);
  const isFlush = new Set(suits).size===1;
  const isStraight = vals[4]-vals[0]===4 && new Set(vals).size===5;
  const isRoyalStraight = [10,11,12,13,14].every((v,i)=>vals[i]===v);

  const counts: Record<number,number> = {};
  for (const v of vals) counts[v]=(counts[v]||0)+1;
  const groups = Object.values(counts).sort((a,b)=>b-a);

  if (isFlush&&isRoyalStraight) return 'Royal Flush';
  if (isFlush&&isStraight) return 'Straight Flush';
  if (groups[0]===4) return 'Four of a Kind';
  if (groups[0]===3&&groups[1]===2) return 'Full House';
  if (isFlush) return 'Flush';
  if (isStraight) return 'Straight';
  if (groups[0]===3) return 'Three of a Kind';
  if (groups[0]===2&&groups[1]===2) {
    // Two pair — check if highest pair is J or better
    return 'Two Pair';
  }
  if (groups[0]===2) {
    // Pair — must be J,Q,K,A to pay
    const pairVal = parseInt(Object.keys(counts).find(k=>counts[parseInt(k)]===2) ?? '0');
    if (pairVal>=11) return 'Jacks or Better';
  }
  return 'Nothing';
}

const BET_GC=[100,250,500,1000,2500];
const BET_SC=[0.1,0.25,0.5,1,2.5];

function CardView({card,held,onToggle,phase}:{card:Card;held:boolean;onToggle:()=>void;phase:Phase}) {
  const red=RED.includes(card.suit);
  return (
    <TouchableOpacity
      style={[ps.card, held&&ps.cardHeld]}
      onPress={onToggle}
      disabled={phase!=='holding'}
      activeOpacity={0.7}
    >
      <Text style={[ps.cardRank,red&&ps.cardRed]}>{card.rank}</Text>
      <Text style={[ps.cardSuit,red&&ps.cardRed]}>{card.suit}</Text>
      <Text style={[ps.cardRankBot,red&&ps.cardRed]}>{card.rank}</Text>
      {held&&<View style={ps.heldBadge}><Text style={ps.heldText}>HOLD</Text></View>}
    </TouchableOpacity>
  );
}

export function PokerGame() {
  const [deck,setDeck]=useState<Card[]>(()=>shuffle(buildDeck()));
  const [hand,setHand]=useState<Card[]>([]);
  const [held,setHeld]=useState<boolean[]>([false,false,false,false,false]);
  const [phase,setPhase]=useState<Phase>('betting');
  const [currency,setCurrency]=useState<Currency>('gold');
  const [betIdx,setBetIdx]=useState(2);
  const [handRank,setHandRank]=useState<HandRank|null>(null);
  const [payout,setPayout]=useState(0);
  const [sessionId,setSessionId]=useState('');

  const {goldCoins,sweepsCoins,deductBet,addWin}=useWalletStore();
  const betOptions=currency==='gold'?BET_GC:BET_SC;
  const bet=betOptions[betIdx];
  const balance=currency==='gold'?goldCoins:sweepsCoins;

  async function deal() {
    if (balance<bet) return;
    deductBet(currency,bet);
    const {sessionId:sid,error}=await placeBet('poker',currency,bet);
    if (error) { addWin(currency,bet); return; }
    setSessionId(sid);

    const d=deck.length<10?shuffle(buildDeck()):[...deck];
    const newHand=d.slice(0,5);
    setDeck(d.slice(5));
    setHand(newHand);
    setHeld([false,false,false,false,false]);
    setHandRank(null);
    setPayout(0);
    setPhase('holding');
  }

  async function draw() {
    let d=[...deck];
    const newHand=hand.map((card,i)=>{
      if (held[i]) return card;
      const [c,...rest]=d; d=rest; return c;
    });
    setDeck(d);
    setHand(newHand);

    const rank=evaluate(newHand);
    const mult=PAYOUTS[rank];
    const winAmt=mult*bet;
    setHandRank(rank);
    setPayout(winAmt);
    setPhase('result');

    if (winAmt>0) addWin(currency,winAmt);
    await recordWin(sessionId,winAmt,{hand:rank});
  }

  function toggleHold(i:number) {
    setHeld(h=>h.map((v,idx)=>idx===i?!v:v));
  }

  function reset() { setPhase('betting'); setHand([]); setHeld([false,false,false,false,false]); setHandRank(null); }

  return (
    <View style={ps.container}>
      {/* Currency */}
      <View style={ps.controlRow}>
        <View style={ps.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <TouchableOpacity key={c} style={[ps.toggleBtn,currency===c&&ps.toggleActive]}
              onPress={()=>{if(phase==='betting')setCurrency(c)}} disabled={phase!=='betting'}>
              <Text style={[ps.toggleText,currency===c&&ps.toggleTextActive]}>{c==='gold'?'🪙 Gold':'💎 Sweeps'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={ps.balance}>{currency==='gold'?`🪙 ${goldCoins.toLocaleString()}`:`💎 ${sweepsCoins.toFixed(2)}`}</Text>
      </View>

      {/* Paytable */}
      <View style={ps.paytable}>
        {(Object.entries(PAYOUTS) as [HandRank,number][]).filter(([,p])=>p>0).map(([name,mult])=>(
          <View key={name} style={[ps.payRow,handRank===name&&ps.payRowActive]}>
            <Text style={[ps.payName,handRank===name&&ps.payNameActive]}>{name}</Text>
            <Text style={[ps.payMult,handRank===name&&ps.payMultActive]}>{mult}×</Text>
          </View>
        ))}
      </View>

      {/* Cards */}
      <View style={ps.handRow}>
        {phase==='betting'
          ? Array(5).fill(null).map((_,i)=>(
              <View key={i} style={ps.cardBack}>
                <Text style={ps.cardBackText}>?</Text>
              </View>
            ))
          : hand.map((card,i)=>(
              <CardView key={i} card={card} held={held[i]} onToggle={()=>toggleHold(i)} phase={phase}/>
            ))
        }
      </View>

      {/* Result */}
      {phase==='result'&&handRank&&(
        <View style={[ps.result, payout>0?ps.resultWin:ps.resultLoss]}>
          <Text style={ps.resultRank}>{handRank}</Text>
          {payout>0&&(
            <Text style={ps.resultPayout}>
              +{currency==='gold'?payout.toLocaleString():payout.toFixed(2)} {currency==='gold'?'GC':'SC'}
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={ps.actions}>
        {phase==='betting'&&(
          <>
            <View style={ps.betRow}>
              {betOptions.map((opt,i)=>(
                <TouchableOpacity key={i} style={[ps.betChip,betIdx===i&&ps.betChipActive]} onPress={()=>setBetIdx(i)}>
                  <Text style={[ps.betChipText,betIdx===i&&ps.betChipTextActive]}>
                    {currency==='gold'?opt.toLocaleString():opt.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[ps.btn,ps.btnGold,balance<bet&&ps.btnDim]} onPress={deal} disabled={balance<bet}>
              <Text style={ps.btnGoldText}>Deal ({currency==='gold'?bet.toLocaleString():bet.toFixed(2)} {currency==='gold'?'GC':'SC'})</Text>
            </TouchableOpacity>
          </>
        )}
        {phase==='holding'&&(
          <View style={ps.holdHint}>
            <Text style={ps.holdHintText}>Tap cards to hold, then Draw</Text>
            <TouchableOpacity style={[ps.btn,ps.btnGold,{flex:1}]} onPress={draw}>
              <Text style={ps.btnGoldText}>Draw</Text>
            </TouchableOpacity>
          </View>
        )}
        {phase==='result'&&(
          <TouchableOpacity style={[ps.btn,ps.btnGold]} onPress={reset}>
            <Text style={ps.btnGoldText}>New Hand</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const ps = StyleSheet.create({
  container:{gap:10},
  controlRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#1a1f2e',borderWidth:1,borderColor:'#2a3048',borderRadius:12,padding:12},
  toggle:{flexDirection:'row',gap:6},
  toggleBtn:{paddingHorizontal:12,paddingVertical:6,borderRadius:20,backgroundColor:'#2a3048'},
  toggleActive:{backgroundColor:'#f5c842'},
  toggleText:{color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:'600'},
  toggleTextActive:{color:'#0f1117'},
  balance:{color:'rgba(255,255,255,0.5)',fontSize:12},
  paytable:{backgroundColor:'#1a1f2e',borderWidth:1,borderColor:'#2a3048',borderRadius:12,padding:10,flexDirection:'row',flexWrap:'wrap',gap:4},
  payRow:{flexDirection:'row',gap:6,paddingHorizontal:8,paddingVertical:3,borderRadius:6,alignItems:'center'},
  payRowActive:{backgroundColor:'rgba(245,200,66,0.15)',borderWidth:1,borderColor:'rgba(245,200,66,0.3)'},
  payName:{color:'rgba(255,255,255,0.5)',fontSize:11},
  payNameActive:{color:'#f5c842',fontWeight:'600'},
  payMult:{color:'rgba(255,255,255,0.3)',fontSize:11},
  payMultActive:{color:'#f5c842',fontWeight:'700'},
  handRow:{flexDirection:'row',gap:6,justifyContent:'center',paddingVertical:8},
  card:{width:56,height:80,backgroundColor:'#fff',borderRadius:8,padding:4,justifyContent:'space-between',alignItems:'center',position:'relative'},
  cardHeld:{borderWidth:2,borderColor:'#f5c842'},
  cardBack:{width:56,height:80,backgroundColor:'#1e3a8a',borderRadius:8,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#2d4a9a'},
  cardBackText:{color:'rgba(255,255,255,0.2)',fontSize:24,fontWeight:'700'},
  cardRank:{fontSize:13,fontWeight:'700',color:'#111',alignSelf:'flex-start'},
  cardSuit:{fontSize:22,color:'#111'},
  cardRankBot:{fontSize:13,fontWeight:'700',color:'#111',alignSelf:'flex-end',transform:[{rotate:'180deg'}]},
  cardRed:{color:'#dc2626'},
  heldBadge:{position:'absolute',bottom:-8,backgroundColor:'#f5c842',paddingHorizontal:5,paddingVertical:1,borderRadius:4},
  heldText:{color:'#0f1117',fontSize:8,fontWeight:'700'},
  result:{padding:14,borderRadius:10,alignItems:'center',gap:4},
  resultWin:{backgroundColor:'rgba(34,197,94,0.1)',borderWidth:1,borderColor:'rgba(34,197,94,0.3)'},
  resultLoss:{backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  resultRank:{fontSize:18,fontWeight:'700',color:'#fff'},
  resultPayout:{fontSize:16,fontWeight:'600',color:'#22c55e'},
  actions:{backgroundColor:'#1a1f2e',borderWidth:1,borderColor:'#2a3048',borderRadius:12,padding:14,gap:10},
  betRow:{flexDirection:'row',justifyContent:'center',gap:6,flexWrap:'wrap'},
  betChip:{paddingHorizontal:12,paddingVertical:6,borderRadius:8,backgroundColor:'#2a3048'},
  betChipActive:{backgroundColor:'#f5c842'},
  betChipText:{color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:'600'},
  betChipTextActive:{color:'#0f1117'},
  holdHint:{gap:8},
  holdHintText:{color:'rgba(255,255,255,0.4)',fontSize:12,textAlign:'center'},
  btn:{paddingVertical:14,borderRadius:10,alignItems:'center'},
  btnGold:{backgroundColor:'#f5c842'},
  btnGoldText:{color:'#0f1117',fontWeight:'700',fontSize:15},
  btnDim:{opacity:0.4},
});
