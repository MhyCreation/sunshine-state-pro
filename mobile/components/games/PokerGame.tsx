import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';

type Suit='♠'|'♥'|'♦'|'♣';
type Rank='2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A';
type Card={suit:Suit;rank:Rank};
type Phase='betting'|'holding'|'result';

const SUITS:Suit[]=['♠','♥','♦','♣'];
const RANKS:Rank[]=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const RED:Suit[]=['♥','♦'];
const RV:Record<Rank,number>={2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13,A:14};

function buildDeck():Card[]{return SUITS.flatMap(s=>RANKS.map(r=>({suit:s,rank:r})));}
function shuffle<T>(arr:T[]):T[]{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

type HandRank='Royal Flush'|'Straight Flush'|'Four of a Kind'|'Full House'|'Flush'|'Straight'|'Three of a Kind'|'Two Pair'|'Jacks or Better'|'Nothing';
const PAYOUTS:Record<HandRank,number>={'Royal Flush':800,'Straight Flush':50,'Four of a Kind':25,'Full House':9,'Flush':6,'Straight':4,'Three of a Kind':3,'Two Pair':2,'Jacks or Better':1,'Nothing':0};

function evaluate(hand:Card[]):HandRank{
  const vals=hand.map(c=>RV[c.rank]).sort((a,b)=>a-b);
  const suits=hand.map(c=>c.suit);
  const isFlush=new Set(suits).size===1;
  const isStraight=vals[4]-vals[0]===4&&new Set(vals).size===5;
  const isRoyal=[10,11,12,13,14].every((v,i)=>vals[i]===v);
  const counts:Record<number,number>={};
  for(const v of vals)counts[v]=(counts[v]||0)+1;
  const groups=Object.values(counts).sort((a,b)=>b-a);
  if(isFlush&&isRoyal)return'Royal Flush';
  if(isFlush&&isStraight)return'Straight Flush';
  if(groups[0]===4)return'Four of a Kind';
  if(groups[0]===3&&groups[1]===2)return'Full House';
  if(isFlush)return'Flush';
  if(isStraight)return'Straight';
  if(groups[0]===3)return'Three of a Kind';
  if(groups[0]===2&&groups[1]===2)return'Two Pair';
  if(groups[0]===2){
    const pairVal=parseInt(Object.keys(counts).find(k=>counts[parseInt(k)]===2)??'0');
    if(pairVal>=11)return'Jacks or Better';
  }
  return'Nothing';
}

const BET_GC=[100,250,500,1000,2500];
const BET_SC=[0.1,0.25,0.5,1,2.5];

function PokerCard({card,held,onToggle,phase,index}:{card:Card;held:boolean;onToggle:()=>void;phase:Phase;index:number}){
  const red=RED.includes(card.suit);
  const slideAnim=useRef(new Animated.Value(40)).current;
  const fadeAnim=useRef(new Animated.Value(0)).current;
  useState(()=>{
    Animated.parallel([
      Animated.spring(slideAnim,{toValue:0,speed:18,bounciness:8,useNativeDriver:true,delay:index*60}),
      Animated.timing(fadeAnim,{toValue:1,duration:200,useNativeDriver:true,delay:index*60}),
    ]).start();
  });
  return(
    <Animated.View style={{opacity:fadeAnim,transform:[{translateY:slideAnim}]}}>
      <AnimatedPressable
        onPress={onToggle}
        disabled={phase!=='holding'}
        haptic="selection"
        scaleDown={0.92}
        style={[ps.card,held&&ps.cardHeld]}
      >
        <View style={[ps.card,held&&ps.cardHeld]}>
          <Text style={[ps.rank,red&&ps.red]}>{card.rank}</Text>
          <Text style={[ps.suit,red&&ps.red]}>{card.suit}</Text>
          <Text style={[ps.rankBot,red&&ps.red]}>{card.rank}</Text>
        </View>
        {held&&(
          <LinearGradient colors={['#f7d35e','#d4900a']} style={ps.holdBadge}>
            <Text style={ps.holdText}>HOLD</Text>
          </LinearGradient>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export function PokerGame(){
  const[deck,setDeck]=useState<Card[]>(()=>shuffle(buildDeck()));
  const[hand,setHand]=useState<Card[]>([]);
  const[held,setHeld]=useState([false,false,false,false,false]);
  const[phase,setPhase]=useState<Phase>('betting');
  const[currency,setCurrency]=useState<Currency>('gold');
  const[betIdx,setBetIdx]=useState(2);
  const[handRank,setHandRank]=useState<HandRank|null>(null);
  const[payout,setPayout]=useState(0);
  const[sessionId,setSessionId]=useState('');
  const resultAnim=useRef(new Animated.Value(0)).current;

  const{goldCoins,sweepsCoins,deductBet,addWin}=useWalletStore();
  const betOptions=currency==='gold'?BET_GC:BET_SC;
  const bet=betOptions[betIdx];
  const balance=currency==='gold'?goldCoins:sweepsCoins;

  async function deal(){
    if(balance<bet)return;
    deductBet(currency,bet);
    const{sessionId:sid,error}=await placeBet('poker',currency,bet);
    if(error){addWin(currency,bet);return;}
    setSessionId(sid);
    const d=deck.length<10?shuffle(buildDeck()):[...deck];
    const newHand=d.slice(0,5);
    setDeck(d.slice(5));
    setHand(newHand);
    setHeld([false,false,false,false,false]);
    setHandRank(null);setPayout(0);
    setPhase('holding');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function draw(){
    let d=[...deck];
    const newHand=hand.map((card,i)=>{
      if(held[i])return card;
      const[c,...rest]=d;d=rest;return c;
    });
    setDeck(d);setHand(newHand);
    const rank=evaluate(newHand);
    const mult=PAYOUTS[rank];
    const win=mult*bet;
    setHandRank(rank);setPayout(win);setPhase('result');
    if(win>0){
      addWin(currency,win);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await recordWin(sessionId,win,{hand:rank});
    resultAnim.setValue(0);
    Animated.spring(resultAnim,{toValue:1,speed:14,bounciness:10,useNativeDriver:true}).start();
  }

  function reset(){setPhase('betting');setHand([]);setHeld([false,false,false,false,false]);setHandRank(null);}

  return(
    <View style={ps.container}>
      {/* Currency */}
      <GradientCard innerStyle={ps.controlRow}>
        <View style={ps.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <AnimatedPressable key={c} haptic="selection"
              style={[ps.toggleBtn,currency===c&&ps.toggleActive]}
              onPress={()=>{if(phase==='betting')setCurrency(c)}} disabled={phase!=='betting'}>
              <Text style={[ps.toggleText,currency===c&&ps.toggleTextActive]}>
                {c==='gold'?'🪙 Gold':'💎 Sweeps'}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={ps.balance}>{currency==='gold'?`🪙 ${goldCoins.toLocaleString()}`:`💎 ${sweepsCoins.toFixed(2)}`}</Text>
      </GradientCard>

      {/* Paytable */}
      <GradientCard innerStyle={ps.paytable}>
        <View style={ps.paytableInner}>
          {(Object.entries(PAYOUTS) as [HandRank,number][]).filter(([,p])=>p>0).map(([name,mult])=>(
            <View key={name} style={[ps.payRow,handRank===name&&ps.payRowActive]}>
              <Text style={[ps.payName,handRank===name&&ps.payNameActive]}>{name}</Text>
              <Text style={[ps.payMult,handRank===name&&ps.payMultActive]}>{mult}×</Text>
            </View>
          ))}
        </View>
      </GradientCard>

      {/* Cards */}
      <View style={ps.handRow}>
        {phase==='betting'
          ? Array(5).fill(null).map((_,i)=>(
              <LinearGradient key={i} colors={['#1e3a8a','#1e1b4b']} style={ps.cardBack}>
                <Text style={ps.cardBackText}>?</Text>
              </LinearGradient>
            ))
          : hand.map((card,i)=>(
              <PokerCard key={i} card={card} held={held[i]} onToggle={()=>setHeld(h=>h.map((v,idx)=>idx===i?!v:v))} phase={phase} index={i}/>
            ))
        }
      </View>

      {/* Result */}
      {phase==='result'&&handRank&&(
        <Animated.View style={{transform:[{scale:resultAnim}]}}>
          <LinearGradient
            colors={payout>0?['rgba(34,197,94,0.12)','rgba(34,197,94,0.06)']:['rgba(255,255,255,0.05)','rgba(255,255,255,0.02)']}
            style={[ps.result,payout>0&&ps.resultWin]}
          >
            <Text style={[ps.resultRank,payout>0&&ps.resultRankWin]}>{handRank}</Text>
            {payout>0&&(
              <Text style={ps.resultPayout}>
                +{currency==='gold'?payout.toLocaleString():payout.toFixed(2)} {currency==='gold'?'GC':'SC'}
              </Text>
            )}
          </LinearGradient>
        </Animated.View>
      )}

      {/* Action bar */}
      <GradientCard innerStyle={ps.actions}>
        {phase==='betting'&&(
          <View style={ps.betSection}>
            <Text style={ps.betLabel}>Select bet</Text>
            <View style={ps.chipRow}>
              {betOptions.map((opt,i)=>(
                <AnimatedPressable key={i} haptic="selection"
                  style={[ps.chip,betIdx===i&&ps.chipActive]} onPress={()=>setBetIdx(i)}>
                  <Text style={[ps.chipText,betIdx===i&&ps.chipTextActive]}>
                    {currency==='gold'?opt.toLocaleString():opt.toFixed(2)}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
            <GoldButton
              label={`Deal · ${currency==='gold'?bet.toLocaleString():bet.toFixed(2)} ${currency==='gold'?'GC':'SC'}`}
              onPress={deal} disabled={balance<bet} size="lg" fullWidth
            />
          </View>
        )}
        {phase==='holding'&&(
          <View style={ps.holdSection}>
            <Text style={ps.holdHint}>Tap cards to hold, then draw</Text>
            <GoldButton label="Draw Cards" onPress={draw} size="lg" fullWidth haptic="medium"/>
          </View>
        )}
        {phase==='result'&&(
          <GoldButton label="New Hand" onPress={reset} size="lg" fullWidth haptic="medium"/>
        )}
      </GradientCard>
    </View>
  );
}

const ps=StyleSheet.create({
  container:{gap:12},
  controlRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14},
  toggle:{flexDirection:'row',gap:6},
  toggleBtn:{paddingHorizontal:14,paddingVertical:7,borderRadius:20,backgroundColor:'rgba(255,255,255,0.06)'},
  toggleActive:{backgroundColor:'#f5c842'},
  toggleText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'600'},
  toggleTextActive:{color:'#0f1117'},
  balance:{color:'rgba(255,255,255,0.4)',fontSize:12},
  paytable:{},
  paytableInner:{flexDirection:'row',flexWrap:'wrap',gap:4,padding:12},
  payRow:{flexDirection:'row',gap:6,paddingHorizontal:8,paddingVertical:4,borderRadius:6,alignItems:'center'},
  payRowActive:{backgroundColor:'rgba(245,200,66,0.12)',borderWidth:1,borderColor:'rgba(245,200,66,0.3)'},
  payName:{color:'rgba(255,255,255,0.4)',fontSize:11},
  payNameActive:{color:'#f5c842',fontWeight:'700'},
  payMult:{color:'rgba(255,255,255,0.25)',fontSize:11},
  payMultActive:{color:'#f5c842',fontWeight:'800'},
  handRow:{flexDirection:'row',gap:6,justifyContent:'center',paddingVertical:4},
  card:{width:58,height:84,backgroundColor:'#fff',borderRadius:10,padding:5,justifyContent:'space-between',position:'relative',overflow:'hidden'},
  cardHeld:{borderWidth:2.5,borderColor:'#f5c842'},
  cardBack:{width:58,height:84,borderRadius:10,alignItems:'center',justifyContent:'center'},
  cardBackText:{color:'rgba(255,255,255,0.2)',fontSize:26,fontWeight:'800'},
  rank:{fontSize:13,fontWeight:'800',color:'#111'},
  suit:{fontSize:22,textAlign:'center',color:'#111'},
  rankBot:{fontSize:13,fontWeight:'800',color:'#111',transform:[{rotate:'180deg'}],alignSelf:'flex-end'},
  red:{color:'#dc2626'},
  holdBadge:{position:'absolute',bottom:0,left:0,right:0,paddingVertical:3,alignItems:'center'},
  holdText:{color:'#0f1117',fontSize:8,fontWeight:'800',letterSpacing:0.5},
  result:{padding:16,borderRadius:12,alignItems:'center',gap:6,borderWidth:1,borderColor:'rgba(255,255,255,0.08)'},
  resultWin:{borderColor:'rgba(34,197,94,0.3)'},
  resultRank:{fontSize:18,fontWeight:'700',color:'rgba(255,255,255,0.7)'},
  resultRankWin:{color:'#fff'},
  resultPayout:{fontSize:20,fontWeight:'800',color:'#22c55e'},
  actions:{padding:16,gap:12},
  betSection:{gap:12},
  betLabel:{color:'rgba(255,255,255,0.35)',fontSize:11,fontWeight:'600',letterSpacing:0.5,textTransform:'uppercase'},
  chipRow:{flexDirection:'row',gap:6,flexWrap:'wrap'},
  chip:{paddingHorizontal:14,paddingVertical:8,borderRadius:10,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'transparent'},
  chipActive:{backgroundColor:'rgba(245,200,66,0.12)',borderColor:'rgba(245,200,66,0.35)'},
  chipText:{color:'rgba(255,255,255,0.4)',fontSize:13,fontWeight:'700'},
  chipTextActive:{color:'#f5c842'},
  holdSection:{gap:10},
  holdHint:{color:'rgba(255,255,255,0.35)',fontSize:12,textAlign:'center'},
});
