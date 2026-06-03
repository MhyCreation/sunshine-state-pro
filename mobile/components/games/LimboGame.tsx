import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const BET_GC = [100,250,500,1000,2500]; const BET_SC = [0.1,0.25,0.5,1,2.5];
const TARGET_OPTIONS = [1.5,2,3,5,10,25,50,100];

function generateResult(): number {
  const r = Math.random();
  if (r < 0.03) return 1.0;
  return Math.round((0.97 / (1 - r)) * 100) / 100;
}

export function LimboGame() {
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);
  const [target, setTarget] = useState(2);
  const [phase, setPhase] = useState<'idle'|'launching'|'result'>('idle');
  const [result, setResult] = useState<number|null>(null);
  const [won, setWon] = useState(false);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === 'gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx]; const balance = currency === 'gold' ? goldCoins : sweepsCoins;
  const winChance = Math.min(97, Math.round((0.97 / target) * 100));

  const launch = useCallback(async () => {
    if (phase !== 'idle' || balance < bet) return;
    setPhase('launching'); setResult(null);
    deductBet(currency, bet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const { sessionId, error } = await placeBet('limbo', currency, bet);
    if (error) { addWin(currency, bet); setPhase('idle'); return; }
    await new Promise<void>(r => setTimeout(r, 1200));
    const r = generateResult();
    const didWin = r >= target;
    const win = didWin ? (currency==='gold' ? Math.round(bet*target) : Math.round(bet*target*100)/100) : 0;
    setResult(r); setWon(didWin); setWinAmount(win);
    if (win > 0) { addWin(currency, win); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await recordWin(sessionId, win, { result: r, target, won: didWin });
    setPhase('result');
  }, [phase, balance, bet, currency, target, deductBet, addWin]);

  function reset() { setPhase('idle'); setResult(null); }

  return (
    <View style={s.container}>
      <GradientCard innerStyle={s.controlRow}>
        <View style={s.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <AnimatedPressable key={c} haptic="selection" style={[s.toggleBtn, currency===c&&s.toggleActive]} onPress={()=>{if(phase==='idle')setCurrency(c);}} disabled={phase!=='idle'}>
              <Text style={[s.toggleText, currency===c&&s.toggleTextActive]}>{c==='gold'?'🪙 Gold':'💎 Sweeps'}</Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={s.balance}>{currency==='gold'?`🪙 ${goldCoins.toLocaleString()}`:`💎 ${sweepsCoins.toFixed(2)}`}</Text>
      </GradientCard>

      <GradientCard innerStyle={[s.display, phase==='result'&&won?s.displayWin:phase==='result'?s.displayLose:{}]}>
        <Text style={s.displayLabel}>
          {phase==='launching'?'🚀 Launching…':phase==='result'?(won?'✅ Hit target!':'❌ Missed'):`Target: ${target}×`}
        </Text>
        <Text style={[s.displayNum, phase==='result'&&won?s.textWin:phase==='result'?s.textLose:s.textDim]}>
          {phase==='launching'?'…':result!==null?`${result.toFixed(2)}×`:`${target}×`}
        </Text>
        {phase==='result'&&(
          <Text style={[s.resultSub, won?s.textWin:s.textDim]}>
            {won?`+${currency==='gold'?winAmount.toLocaleString():winAmount.toFixed(2)} ${currency==='gold'?'GC':'SC'}`:`Crashed at ${result?.toFixed(2)}×`}
          </Text>
        )}
      </GradientCard>

      <GradientCard innerStyle={s.controls}>
        <View style={s.targetHeader}>
          <Text style={s.targetLabel}>Target Multiplier</Text>
          <Text style={s.winChance}>{winChance}% win chance</Text>
        </View>
        <View style={s.targets}>
          {TARGET_OPTIONS.map(t=>(
            <AnimatedPressable key={t} haptic="selection" style={[s.targetBtn, target===t&&s.targetBtnActive]} onPress={()=>{if(phase==='idle')setTarget(t);}}>
              <Text style={[s.targetText, target===t&&s.targetTextActive]}>{t}×</Text>
            </AnimatedPressable>
          ))}
        </View>
        <View style={s.chips}>
          {betOptions.map((opt,i)=>(
            <AnimatedPressable key={i} haptic="selection" style={[s.chip, betIdx===i&&s.chipActive]} onPress={()=>setBetIdx(i)} disabled={phase!=='idle'}>
              <Text style={[s.chipText, betIdx===i&&s.chipTextActive]}>{currency==='gold'?opt.toLocaleString():opt.toFixed(2)}</Text>
            </AnimatedPressable>
          ))}
        </View>
        {phase==='result'?(
          <GoldButton label="Launch Again" onPress={reset} size="lg" fullWidth />
        ):(
          <GoldButton label={phase==='launching'?'Launching…':`Launch · Win ${target}×`} onPress={launch} loading={phase==='launching'} disabled={balance<bet||phase==='launching'} size="lg" fullWidth />
        )}
      </GradientCard>
    </View>
  );
}

const s = StyleSheet.create({
  container:{gap:12}, controlRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14},
  toggle:{flexDirection:'row',gap:6}, toggleBtn:{paddingHorizontal:14,paddingVertical:7,borderRadius:20,backgroundColor:'rgba(255,255,255,0.06)'},
  toggleActive:{backgroundColor:'#f5c842'}, toggleText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'600'},
  toggleTextActive:{color:'#0f1117'}, balance:{color:'rgba(255,255,255,0.4)',fontSize:12},
  display:{padding:40,alignItems:'center',gap:10,minHeight:180,justifyContent:'center'},
  displayWin:{backgroundColor:'rgba(34,197,94,0.08)'}, displayLose:{backgroundColor:'rgba(239,68,68,0.06)'},
  displayLabel:{color:'rgba(255,255,255,0.4)',fontSize:12,textTransform:'uppercase',letterSpacing:0.5},
  displayNum:{fontSize:64,fontWeight:'900',letterSpacing:-2},
  textWin:{color:'#22c55e',fontSize:14,fontWeight:'700'}, textLose:{color:'#f87171',fontSize:14,fontWeight:'700'},
  textDim:{color:'rgba(255,255,255,0.15)'}, resultSub:{fontSize:13,fontWeight:'600'},
  controls:{padding:16,gap:12},
  targetHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  targetLabel:{color:'rgba(255,255,255,0.4)',fontSize:11,fontWeight:'600',textTransform:'uppercase',letterSpacing:0.5},
  winChance:{color:'rgba(255,255,255,0.25)',fontSize:11},
  targets:{flexDirection:'row',flexWrap:'wrap',gap:6},
  targetBtn:{paddingHorizontal:12,paddingVertical:8,borderRadius:10,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'transparent'},
  targetBtnActive:{backgroundColor:'rgba(245,200,66,0.15)',borderColor:'rgba(245,200,66,0.4)'},
  targetText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'700'},
  targetTextActive:{color:'#f5c842'},
  chips:{flexDirection:'row',gap:6,flexWrap:'wrap'},
  chip:{paddingHorizontal:12,paddingVertical:8,borderRadius:10,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'transparent'},
  chipActive:{backgroundColor:'rgba(245,200,66,0.15)',borderColor:'rgba(245,200,66,0.4)'},
  chipText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'700'},
  chipTextActive:{color:'#f5c842'},
});
