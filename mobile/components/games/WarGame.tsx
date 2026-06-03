import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

type Suit='♠'|'♥'|'♦'|'♣'; type Rank='2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A';
type Card={suit:Suit;rank:Rank};
const SUITS:Suit[]=['♠','♥','♦','♣']; const RANKS:Rank[]=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const RANK_VALUE:Record<Rank,number>={'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,J:11,Q:12,K:13,A:14};
const RED:Suit[]=['♥','♦'];
const BET_GC=[100,250,500,1000,2500]; const BET_SC=[0.1,0.25,0.5,1,2.5];
function randomCard():Card{return{suit:SUITS[Math.floor(Math.random()*4)],rank:RANKS[Math.floor(Math.random()*13)]};}

function CardView({card,highlight}:{card:Card;highlight?:'win'|'lose'|'tie'}) {
  const red=RED.includes(card.suit);
  return (
    <View style={[ws.card,highlight==='win'?ws.cardWin:highlight==='lose'?ws.cardLose:highlight==='tie'?ws.cardTie:{}]}>
      <Text style={[ws.cardRank,red?ws.textRed:ws.textBlack]}>{card.rank}</Text>
      <Text style={[ws.cardSuit,red?ws.textRed:ws.textBlack]}>{card.suit}</Text>
      <Text style={[ws.cardRankBot,red?ws.textRed:ws.textBlack]}>{card.rank}</Text>
    </View>
  );
}

export function WarGame() {
  const [currency,setCurrency]=useState<Currency>('gold');
  const [betIdx,setBetIdx]=useState(1);
  const [playerCard,setPlayerCard]=useState<Card|null>(null);
  const [dealerCard,setDealerCard]=useState<Card|null>(null);
  const [phase,setPhase]=useState<'betting'|'dealing'|'result'>('betting');
  const [outcome,setOutcome]=useState<'win'|'lose'|'tie'|null>(null);
  const [winAmount,setWinAmount]=useState(0);

  const {goldCoins,sweepsCoins,deductBet,addWin}=useWalletStore();
  const betOptions=currency==='gold'?BET_GC:BET_SC;
  const bet=betOptions[betIdx]; const balance=currency==='gold'?goldCoins:sweepsCoins;

  const deal=useCallback(async()=>{
    if(balance<bet||phase!=='betting')return;
    setPhase('dealing'); deductBet(currency,bet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const{sessionId,error}=await placeBet('war',currency,bet);
    if(error){addWin(currency,bet);setPhase('betting');return;}
    const p=randomCard(); const d=randomCard();
    const pv=RANK_VALUE[p.rank]; const dv=RANK_VALUE[d.rank];
    const out:'win'|'lose'|'tie'=pv>dv?'win':pv<dv?'lose':'tie';
    let win=0;
    if(out==='win')win=bet*2; else if(out==='tie')win=bet;
    setPlayerCard(p); setDealerCard(d); setOutcome(out); setWinAmount(win);
    if(win>0){addWin(currency,win);Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);}
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await recordWin(sessionId,win,{player:p,dealer:d,outcome:out});
    setPhase('result');
  },[balance,bet,currency,phase,deductBet,addWin]);

  function reset(){setPlayerCard(null);setDealerCard(null);setOutcome(null);setWinAmount(0);setPhase('betting');}

  return (
    <View style={ws.container}>
      <GradientCard innerStyle={ws.controlRow}>
        <View style={ws.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <AnimatedPressable key={c} haptic="selection" style={[ws.toggleBtn,currency===c&&ws.toggleActive]} onPress={()=>{if(phase==='betting')setCurrency(c);}} disabled={phase!=='betting'}>
              <Text style={[ws.toggleText,currency===c&&ws.toggleTextActive]}>{c==='gold'?'🪙 Gold':'💎 Sweeps'}</Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={ws.balance}>{currency==='gold'?`🪙 ${goldCoins.toLocaleString()}`:`💎 ${sweepsCoins.toFixed(2)}`}</Text>
      </GradientCard>

      <LinearGradient colors={['#0d1a0d','#061006']} style={ws.table}>
        <View style={ws.tableRow}>
          <View style={ws.side}>
            <Text style={ws.sideLabel}>YOU</Text>
            {playerCard?<CardView card={playerCard} highlight={outcome??undefined}/>:<View style={ws.emptyCard}><Text style={ws.emptyText}>?</Text></View>}
          </View>
          <View style={ws.center}>
            {outcome?(
              <View style={[ws.outcomeBox,outcome==='win'?ws.outcomeWin:outcome==='tie'?ws.outcomeTie:ws.outcomeLose]}>
                <Text style={[ws.outcomeIcon]}>{outcome==='win'?'🏆':outcome==='tie'?'🤝':'💀'}</Text>
                {winAmount>0&&<Text style={ws.textWin}>+{currency==='gold'?winAmount.toLocaleString():winAmount.toFixed(2)}</Text>}
              </View>
            ):<Text style={ws.sword}>⚔</Text>}
          </View>
          <View style={ws.side}>
            <Text style={ws.sideLabel}>DEALER</Text>
            {dealerCard?<CardView card={dealerCard} highlight={outcome==='lose'?'win':outcome==='win'?'lose':outcome==='tie'?'tie':undefined}/>:<View style={ws.emptyCard}><Text style={ws.emptyText}>?</Text></View>}
          </View>
        </View>
      </LinearGradient>

      <GradientCard innerStyle={ws.actions}>
        {phase==='betting'&&(
          <>
            <Text style={ws.rulesText}>Higher card wins · Ace beats all · Tie = push</Text>
            <View style={ws.chips}>
              {betOptions.map((opt,i)=>(
                <AnimatedPressable key={i} haptic="selection" style={[ws.chip,betIdx===i&&ws.chipActive]} onPress={()=>setBetIdx(i)}>
                  <Text style={[ws.chipText,betIdx===i&&ws.chipTextActive]}>{currency==='gold'?opt.toLocaleString():opt.toFixed(2)}</Text>
                </AnimatedPressable>
              ))}
            </View>
            <GoldButton label="⚔ Go to War!" onPress={deal} disabled={balance<bet} size="lg" fullWidth haptic="heavy"/>
          </>
        )}
        {phase==='result'&&<GoldButton label="Play Again" onPress={reset} size="lg" fullWidth/>}
      </GradientCard>
    </View>
  );
}

const ws=StyleSheet.create({
  container:{gap:12}, controlRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14},
  toggle:{flexDirection:'row',gap:6}, toggleBtn:{paddingHorizontal:14,paddingVertical:7,borderRadius:20,backgroundColor:'rgba(255,255,255,0.06)'},
  toggleActive:{backgroundColor:'#f5c842'}, toggleText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'600'},
  toggleTextActive:{color:'#0f1117'}, balance:{color:'rgba(255,255,255,0.4)',fontSize:12},
  table:{borderRadius:20,borderWidth:1,borderColor:'#1a3a1a',padding:24},
  tableRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  side:{alignItems:'center',gap:10,flex:1}, sideLabel:{color:'rgba(255,255,255,0.4)',fontSize:10,fontWeight:'700',letterSpacing:1.5},
  card:{width:72,height:100,borderRadius:10,backgroundColor:'#fff',padding:6,justifyContent:'space-between',borderWidth:2,borderColor:'transparent'},
  cardWin:{borderColor:'#22c55e',transform:[{scale:1.08}]}, cardLose:{opacity:0.5}, cardTie:{borderColor:'#f5c842'},
  cardRank:{fontSize:14,fontWeight:'800'}, cardSuit:{fontSize:26,textAlign:'center'},
  cardRankBot:{fontSize:14,fontWeight:'800',transform:[{rotate:'180deg'}],alignSelf:'flex-end'},
  textRed:{color:'#dc2626'}, textBlack:{color:'#111'},
  emptyCard:{width:72,height:100,borderRadius:10,borderWidth:2,borderColor:'rgba(255,255,255,0.1)',borderStyle:'dashed',alignItems:'center',justifyContent:'center'},
  emptyText:{color:'rgba(255,255,255,0.2)',fontSize:28},
  center:{width:60,alignItems:'center',justifyContent:'center'},
  sword:{color:'rgba(255,255,255,0.15)',fontSize:28},
  outcomeBox:{alignItems:'center',padding:8,borderRadius:10,borderWidth:1,gap:2},
  outcomeWin:{backgroundColor:'rgba(34,197,94,0.1)',borderColor:'rgba(34,197,94,0.3)'},
  outcomeTie:{backgroundColor:'rgba(245,200,66,0.1)',borderColor:'rgba(245,200,66,0.3)'},
  outcomeLose:{backgroundColor:'rgba(239,68,68,0.08)',borderColor:'rgba(239,68,68,0.2)'},
  outcomeIcon:{fontSize:24},
  textWin:{color:'#22c55e',fontSize:11,fontWeight:'700'},
  actions:{padding:16,gap:12},
  rulesText:{color:'rgba(255,255,255,0.25)',fontSize:11,textAlign:'center'},
  chips:{flexDirection:'row',gap:6,flexWrap:'wrap'},
  chip:{paddingHorizontal:12,paddingVertical:8,borderRadius:10,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'transparent'},
  chipActive:{backgroundColor:'rgba(245,200,66,0.15)',borderColor:'rgba(245,200,66,0.4)'},
  chipText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'700'},
  chipTextActive:{color:'#f5c842'},
});
