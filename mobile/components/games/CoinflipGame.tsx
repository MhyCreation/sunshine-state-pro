import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const BET_GC=[100,250,500,1000,2500]; const BET_SC=[0.1,0.25,0.5,1,2.5];
const BASE_PAYOUT=1.94;

export function CoinflipGame() {
  const [currency,setCurrency]=useState<Currency>('gold');
  const [betIdx,setBetIdx]=useState(1);
  const [pick,setPick]=useState<'heads'|'tails'>('heads');
  const [phase,setPhase]=useState<'idle'|'flipping'|'playing'|'done'>('idle');
  const [result,setResult]=useState<'heads'|'tails'|null>(null);
  const [streak,setStreak]=useState(0);
  const [multiplier,setMultiplier]=useState(1.0);
  const [sessionId,setSessionId]=useState('');
  const [history,setHistory]=useState<Array<'heads'|'tails'>>([]);
  const spinAnim=useRef(new Animated.Value(0)).current;

  const {goldCoins,sweepsCoins,deductBet,addWin}=useWalletStore();
  const betOptions=currency==='gold'?BET_GC:BET_SC;
  const bet=betOptions[betIdx]; const balance=currency==='gold'?goldCoins:sweepsCoins;

  function animateCoin(cb:()=>void) {
    Animated.sequence([
      Animated.timing(spinAnim,{toValue:1,duration:350,useNativeDriver:true}),
      Animated.timing(spinAnim,{toValue:0,duration:0,useNativeDriver:true}),
    ]).start(cb);
  }

  const startFlip=useCallback(async()=>{
    if(phase!=='idle'||balance<bet)return;
    setPhase('flipping'); setResult(null); setStreak(0); setMultiplier(1.0); setHistory([]);
    deductBet(currency,bet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const{sessionId:sid,error}=await placeBet('coinflip',currency,bet);
    if(error){addWin(currency,bet);setPhase('idle');return;}
    setSessionId(sid);
    await doFlip(sid,pick,0,1.0,[]);
  },[phase,balance,bet,currency,pick,deductBet,addWin]);

  async function doFlip(sid:string,chosen:'heads'|'tails',curStreak:number,curMult:number,curHistory:Array<'heads'|'tails'>) {
    setPhase('flipping');
    await new Promise<void>(r=>setTimeout(r,700));
    const flip:'heads'|'tails'=Math.random()<0.5?'heads':'tails';
    setResult(flip);
    const newHistory=[...curHistory,flip];
    setHistory(newHistory);
    if(flip!==chosen){
      await recordWin(sid,0,{history:newHistory,streak:curStreak});
      setPhase('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      const newStreak=curStreak+1;
      const newMult=Math.round(curMult*BASE_PAYOUT*100)/100;
      setStreak(newStreak); setMultiplier(newMult);
      setPhase('playing');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  async function continueFlip(){
    if(phase!=='playing')return;
    await doFlip(sessionId,pick,streak,multiplier,history);
  }

  async function collect(){
    if(phase!=='playing'||streak===0)return;
    const win=currency==='gold'?Math.round(bet*multiplier):Math.round(bet*multiplier*100)/100;
    addWin(currency,win);
    await recordWin(sessionId,win,{history,streak,multiplier});
    setPhase('done');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function reset(){setPhase('idle');setResult(null);setStreak(0);setMultiplier(1.0);setHistory([]);}

  const isFlipping=phase==='flipping'; const isPlaying=phase==='playing'; const isDone=phase==='done';

  return (
    <View style={f.container}>
      <GradientCard innerStyle={f.controlRow}>
        <View style={f.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <AnimatedPressable key={c} haptic="selection" style={[f.toggleBtn,currency===c&&f.toggleActive]} onPress={()=>{if(phase==='idle')setCurrency(c);}} disabled={phase!=='idle'}>
              <Text style={[f.toggleText,currency===c&&f.toggleTextActive]}>{c==='gold'?'🪙 Gold':'💎 Sweeps'}</Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={f.balance}>{currency==='gold'?`🪙 ${goldCoins.toLocaleString()}`:`💎 ${sweepsCoins.toFixed(2)}`}</Text>
      </GradientCard>

      <GradientCard innerStyle={[f.display,isPlaying?f.displayWin:isDone&&streak>0?f.displayWin:isDone?f.displayLose:{}]}>
        <View style={[f.coin,isFlipping?f.coinSpin:result==='heads'?f.coinHeads:result==='tails'?f.coinTails:f.coinIdle]}>
          <Text style={f.coinEmoji}>{isFlipping?'🪙':result==='heads'?'👑':result==='tails'?'⭐':'?'}</Text>
        </View>
        {result&&!isFlipping&&<Text style={f.resultLabel}>{result.charAt(0).toUpperCase()+result.slice(1)}</Text>}
        <View style={f.statsRow}>
          {streak>0&&<View style={f.stat}><Text style={f.statLabel}>Streak</Text><Text style={f.statValue}>{streak}🔥</Text></View>}
          {multiplier>1&&<View style={f.stat}><Text style={f.statLabel}>Multiplier</Text><Text style={[f.statValue,isPlaying?f.textWin:isDone&&streak>0?f.textWin:f.textLose]}>{multiplier.toFixed(2)}×</Text></View>}
        </View>
        {history.length>0&&(
          <View style={f.historyRow}>
            {history.map((h,i)=>(
              <View key={i} style={[f.histDot,h===pick?f.histWin:f.histLose]}>
                <Text style={f.histText}>{h==='heads'?'H':'T'}</Text>
              </View>
            ))}
          </View>
        )}
      </GradientCard>

      <GradientCard innerStyle={f.actions}>
        {phase==='idle'&&(
          <>
            <View style={f.picks}>
              <AnimatedPressable haptic="selection" style={[f.pickBtn,pick==='heads'&&f.pickBtnActive]} onPress={()=>setPick('heads')}>
                <Text style={f.pickIcon}>👑</Text>
                <Text style={[f.pickLabel,pick==='heads'&&f.pickLabelActive]}>Heads</Text>
              </AnimatedPressable>
              <AnimatedPressable haptic="selection" style={[f.pickBtn,pick==='tails'&&f.pickBtnActive]} onPress={()=>setPick('tails')}>
                <Text style={f.pickIcon}>⭐</Text>
                <Text style={[f.pickLabel,pick==='tails'&&f.pickLabelActive]}>Tails</Text>
              </AnimatedPressable>
            </View>
            <View style={f.chips}>
              {betOptions.map((opt,i)=>(
                <AnimatedPressable key={i} haptic="selection" style={[f.chip,betIdx===i&&f.chipActive]} onPress={()=>setBetIdx(i)}>
                  <Text style={[f.chipText,betIdx===i&&f.chipTextActive]}>{currency==='gold'?opt.toLocaleString():opt.toFixed(2)}</Text>
                </AnimatedPressable>
              ))}
            </View>
            <GoldButton label="Flip!" onPress={startFlip} disabled={balance<bet} size="lg" fullWidth haptic="heavy"/>
          </>
        )}
        {isPlaying&&(
          <View style={f.playBtns}>
            <GoldButton label={`Flip Again ${(multiplier*BASE_PAYOUT).toFixed(2)}×`} onPress={continueFlip} size="lg" style={{flex:1}} haptic="medium"/>
            <GoldButton label={`Collect\n${currency==='gold'?Math.round(bet*multiplier).toLocaleString():(bet*multiplier).toFixed(2)}`} onPress={collect} variant="outline" size="lg" style={{flex:1}} haptic="medium"/>
          </View>
        )}
        {isDone&&<GoldButton label="Play Again" onPress={reset} size="lg" fullWidth/>}
      </GradientCard>
    </View>
  );
}

const f=StyleSheet.create({
  container:{gap:12}, controlRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14},
  toggle:{flexDirection:'row',gap:6}, toggleBtn:{paddingHorizontal:14,paddingVertical:7,borderRadius:20,backgroundColor:'rgba(255,255,255,0.06)'},
  toggleActive:{backgroundColor:'#f5c842'}, toggleText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'600'},
  toggleTextActive:{color:'#0f1117'}, balance:{color:'rgba(255,255,255,0.4)',fontSize:12},
  display:{padding:24,alignItems:'center',gap:12,minHeight:200,justifyContent:'center'},
  displayWin:{backgroundColor:'rgba(34,197,94,0.07)'}, displayLose:{backgroundColor:'rgba(239,68,68,0.06)'},
  coin:{width:100,height:100,borderRadius:50,alignItems:'center',justifyContent:'center',borderWidth:3},
  coinIdle:{backgroundColor:'rgba(255,255,255,0.06)',borderColor:'rgba(255,255,255,0.1)'},
  coinHeads:{backgroundColor:'rgba(245,200,66,0.2)',borderColor:'rgba(245,200,66,0.5)'},
  coinTails:{backgroundColor:'rgba(100,116,139,0.2)',borderColor:'rgba(100,116,139,0.4)'},
  coinSpin:{backgroundColor:'rgba(255,255,255,0.08)',borderColor:'rgba(255,255,255,0.2)'},
  coinEmoji:{fontSize:40},
  resultLabel:{color:'#fff',fontSize:16,fontWeight:'700',textTransform:'capitalize'},
  statsRow:{flexDirection:'row',gap:24},
  stat:{alignItems:'center',gap:2},
  statLabel:{color:'rgba(255,255,255,0.4)',fontSize:10,textTransform:'uppercase',letterSpacing:0.5},
  statValue:{fontSize:22,fontWeight:'900',color:'rgba(255,255,255,0.3)'},
  textWin:{color:'#22c55e'}, textLose:{color:'#f87171'},
  historyRow:{flexDirection:'row',gap:4,flexWrap:'wrap',justifyContent:'center'},
  histDot:{width:22,height:22,borderRadius:11,alignItems:'center',justifyContent:'center'},
  histWin:{backgroundColor:'rgba(34,197,94,0.2)'}, histLose:{backgroundColor:'rgba(239,68,68,0.2)'},
  histText:{fontSize:9,fontWeight:'700',color:'rgba(255,255,255,0.7)'},
  actions:{padding:16,gap:12},
  picks:{flexDirection:'row',gap:10},
  pickBtn:{flex:1,paddingVertical:16,borderRadius:14,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'transparent',alignItems:'center',gap:4},
  pickBtnActive:{backgroundColor:'rgba(245,200,66,0.12)',borderColor:'rgba(245,200,66,0.4)'},
  pickIcon:{fontSize:28}, pickLabel:{color:'rgba(255,255,255,0.4)',fontSize:14,fontWeight:'700'},
  pickLabelActive:{color:'#f5c842'},
  chips:{flexDirection:'row',gap:6,flexWrap:'wrap'},
  chip:{paddingHorizontal:12,paddingVertical:8,borderRadius:10,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'transparent'},
  chipActive:{backgroundColor:'rgba(245,200,66,0.15)',borderColor:'rgba(245,200,66,0.4)'},
  chipText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'700'},
  chipTextActive:{color:'#f5c842'},
  playBtns:{flexDirection:'row',gap:10},
});
