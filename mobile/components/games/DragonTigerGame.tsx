import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

type Suit = '♠'|'♥'|'♦'|'♣'; type Rank = 'A'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K';
type Card = { suit: Suit; rank: Rank }; type BetType = 'dragon'|'tiger'|'tie';
const SUITS: Suit[] = ['♠','♥','♦','♣'];
const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const RANK_VALUE: Record<Rank,number> = {A:1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,J:11,Q:12,K:13};
const RED: Suit[] = ['♥','♦'];
const BET_GC = [100,250,500,1000,2500]; const BET_SC = [0.1,0.25,0.5,1,2.5];
function randomCard(): Card { return { suit: SUITS[Math.floor(Math.random()*4)], rank: RANKS[Math.floor(Math.random()*13)] }; }

function CardView({ card, highlight }: { card: Card; highlight?: 'win'|'lose' }) {
  const red = RED.includes(card.suit);
  return (
    <View style={[cs.card, red ? cs.cardRed : cs.cardBlack, highlight === 'win' ? cs.cardWin : highlight === 'lose' ? cs.cardLose : {}]}>
      <Text style={[cs.cardRank, red ? cs.textRed : cs.textBlack]}>{card.rank}</Text>
      <Text style={[cs.cardSuit, red ? cs.textRed : cs.textBlack]}>{card.suit}</Text>
      <Text style={[cs.cardRankBot, red ? cs.textRed : cs.textBlack]}>{card.rank}</Text>
    </View>
  );
}

export function DragonTigerGame() {
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);
  const [betType, setBetType] = useState<BetType>('dragon');
  const [dragonCard, setDragonCard] = useState<Card|null>(null);
  const [tigerCard, setTigerCard] = useState<Card|null>(null);
  const [phase, setPhase] = useState<'betting'|'dealing'|'result'>('betting');
  const [winner, setWinner] = useState<'dragon'|'tiger'|'tie'|null>(null);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === 'gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx]; const balance = currency === 'gold' ? goldCoins : sweepsCoins;

  const deal = useCallback(async () => {
    if (balance < bet || phase !== 'betting') return;
    setPhase('dealing'); deductBet(currency, bet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { sessionId, error } = await placeBet('dragon-tiger', currency, bet);
    if (error) { addWin(currency, bet); setPhase('betting'); return; }
    const d = randomCard(); const t = randomCard();
    const dv = RANK_VALUE[d.rank]; const tv = RANK_VALUE[t.rank];
    const w: 'dragon'|'tiger'|'tie' = dv > tv ? 'dragon' : tv > dv ? 'tiger' : 'tie';
    let win = 0;
    if (betType === 'dragon' && w === 'dragon') win = bet * 2;
    else if (betType === 'tiger' && w === 'tiger') win = bet * 2;
    else if (betType === 'tie' && w === 'tie') win = bet * 9;
    else if ((betType === 'dragon'||betType === 'tiger') && w === 'tie') win = bet;
    setDragonCard(d); setTigerCard(t); setWinner(w); setWinAmount(win);
    if (win > 0) { addWin(currency, win); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    await recordWin(sessionId, win, { dragon: d, tiger: t, winner: w, betType });
    setPhase('result');
  }, [balance, bet, betType, currency, phase, deductBet, addWin]);

  function reset() { setDragonCard(null); setTigerCard(null); setWinner(null); setWinAmount(0); setPhase('betting'); }

  return (
    <View style={cs.container}>
      <GradientCard innerStyle={cs.controlRow}>
        <View style={cs.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c => (
            <AnimatedPressable key={c} haptic="selection" style={[cs.toggleBtn, currency===c&&cs.toggleActive]} onPress={()=>{if(phase==='betting')setCurrency(c);}} disabled={phase!=='betting'}>
              <Text style={[cs.toggleText, currency===c&&cs.toggleTextActive]}>{c==='gold'?'🪙 Gold':'💎 Sweeps'}</Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={cs.balance}>{currency==='gold'?`🪙 ${goldCoins.toLocaleString()}`:`💎 ${sweepsCoins.toFixed(2)}`}</Text>
      </GradientCard>

      <LinearGradient colors={['#1a0a0a','#0d0505']} style={cs.table}>
        <View style={cs.tableRow}>
          <View style={cs.side}>
            <Text style={cs.sideLabel}>🐉 Dragon</Text>
            {dragonCard ? <CardView card={dragonCard} highlight={winner === 'dragon' ? 'win' : winner && winner !== 'tie' ? 'lose' : undefined} /> : <View style={cs.cardEmpty}><Text style={cs.emptyEmoji}>🐉</Text></View>}
          </View>
          <View style={cs.vs}>
            {winner ? (
              <View style={[cs.resultBox, winAmount>0?cs.resultWin:cs.resultLose]}>
                <Text style={[cs.resultMsg, winAmount>0?cs.textWin:cs.textLose]}>
                  {winner==='tie'?'🤝':winner==='dragon'?'🐉':'🐯'}
                </Text>
                {winAmount>0&&<Text style={cs.textWin}>+{currency==='gold'?winAmount.toLocaleString():winAmount.toFixed(2)}</Text>}
              </View>
            ) : <Text style={cs.vsText}>VS</Text>}
          </View>
          <View style={cs.side}>
            <Text style={cs.sideLabel}>🐯 Tiger</Text>
            {tigerCard ? <CardView card={tigerCard} highlight={winner === 'tiger' ? 'win' : winner && winner !== 'tie' ? 'lose' : undefined} /> : <View style={cs.cardEmpty}><Text style={cs.emptyEmoji}>🐯</Text></View>}
          </View>
        </View>
      </LinearGradient>

      <GradientCard innerStyle={cs.actions}>
        {phase === 'betting' && (
          <>
            <View style={cs.betTypes}>
              {([{k:'dragon',l:'🐉 Dragon',s:'1:1'},{k:'tie',l:'🤝 Tie',s:'8:1'},{k:'tiger',l:'🐯 Tiger',s:'1:1'}] as {k:BetType;l:string;s:string}[]).map(({k,l,s})=>(
                <TouchableOpacity key={k} style={[cs.betBtn, betType===k&&cs.betBtnActive]} onPress={()=>{Haptics.selectionAsync();setBetType(k);}}>
                  <Text style={[cs.betBtnLabel, betType===k&&cs.betBtnLabelActive]}>{l}</Text>
                  <Text style={[cs.betBtnSub, betType===k&&cs.betBtnSubActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={cs.chips}>
              {betOptions.map((opt,i)=>(
                <AnimatedPressable key={i} haptic="selection" style={[cs.chip, betIdx===i&&cs.chipActive]} onPress={()=>setBetIdx(i)}>
                  <Text style={[cs.chipText, betIdx===i&&cs.chipTextActive]}>{currency==='gold'?opt.toLocaleString():opt.toFixed(2)}</Text>
                </AnimatedPressable>
              ))}
            </View>
            <GoldButton label="Deal" onPress={deal} disabled={balance<bet} size="lg" fullWidth />
          </>
        )}
        {phase === 'result' && <GoldButton label="New Round" onPress={reset} size="lg" fullWidth haptic="medium" />}
      </GradientCard>
    </View>
  );
}

const cs = StyleSheet.create({
  container:{gap:12}, controlRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14},
  toggle:{flexDirection:'row',gap:6}, toggleBtn:{paddingHorizontal:14,paddingVertical:7,borderRadius:20,backgroundColor:'rgba(255,255,255,0.06)'},
  toggleActive:{backgroundColor:'#f5c842'}, toggleText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'600'},
  toggleTextActive:{color:'#0f1117'}, balance:{color:'rgba(255,255,255,0.4)',fontSize:12},
  table:{borderRadius:20,borderWidth:1,borderColor:'#4a1a1a',padding:20},
  tableRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  side:{alignItems:'center',gap:10,flex:1}, sideLabel:{color:'rgba(255,255,255,0.4)',fontSize:11,fontWeight:'700',letterSpacing:1},
  card:{width:64,height:88,borderRadius:10,padding:6,justifyContent:'space-between',borderWidth:2,borderColor:'transparent'},
  cardRed:{backgroundColor:'#fff'}, cardBlack:{backgroundColor:'#fff'},
  cardWin:{borderColor:'#22c55e',transform:[{scale:1.08}]}, cardLose:{opacity:0.5,borderColor:'transparent'},
  cardRank:{fontSize:13,fontWeight:'800'}, cardSuit:{fontSize:22,textAlign:'center'},
  cardRankBot:{fontSize:13,fontWeight:'800',transform:[{rotate:'180deg'}],alignSelf:'flex-end'},
  textRed:{color:'#dc2626'}, textBlack:{color:'#111'},
  cardEmpty:{width:64,height:88,borderRadius:10,borderWidth:2,borderColor:'#4a1a1a',borderStyle:'dashed',alignItems:'center',justifyContent:'center'},
  emptyEmoji:{fontSize:28},
  vs:{alignItems:'center',justifyContent:'center',width:60},
  vsText:{color:'rgba(255,255,255,0.15)',fontSize:20,fontWeight:'900'},
  resultBox:{alignItems:'center',padding:8,borderRadius:10,borderWidth:1,gap:2},
  resultWin:{backgroundColor:'rgba(34,197,94,0.1)',borderColor:'rgba(34,197,94,0.3)'},
  resultLose:{backgroundColor:'rgba(255,255,255,0.04)',borderColor:'rgba(255,255,255,0.08)'},
  resultMsg:{fontSize:22}, textWin:{color:'#22c55e',fontSize:11,fontWeight:'700'}, textLose:{color:'rgba(255,255,255,0.3)',fontSize:11},
  actions:{padding:16,gap:12},
  betTypes:{flexDirection:'row',gap:6},
  betBtn:{flex:1,paddingVertical:10,borderRadius:12,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'transparent',alignItems:'center'},
  betBtnActive:{backgroundColor:'rgba(245,200,66,0.12)',borderColor:'rgba(245,200,66,0.4)'},
  betBtnLabel:{color:'rgba(255,255,255,0.4)',fontSize:11,fontWeight:'600',textAlign:'center'},
  betBtnLabelActive:{color:'#f5c842'},
  betBtnSub:{color:'rgba(255,255,255,0.2)',fontSize:9,marginTop:1},
  betBtnSubActive:{color:'rgba(245,200,66,0.4)'},
  chips:{flexDirection:'row',gap:6,flexWrap:'wrap'},
  chip:{paddingHorizontal:12,paddingVertical:8,borderRadius:10,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'transparent'},
  chipActive:{backgroundColor:'rgba(245,200,66,0.15)',borderColor:'rgba(245,200,66,0.4)'},
  chipText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'700'},
  chipTextActive:{color:'#f5c842'},
});
