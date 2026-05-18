import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';

const SYMBOLS = ['🍒','🍋','🍊','🍇','⭐','💎','7️⃣','🎰'];
const REELS = 3;
const ROWS = 3;
const STOP_DELAYS = [800, 1300, 1800]; // staggered reel stops

function getSymbol() { return SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)]; }
function spinReels(): string[][] { return Array(REELS).fill(null).map(()=>Array(ROWS).fill(null).map(getSymbol)); }
function calcWin(grid: string[][], bet: number): { win: number; lines: number } {
  let totalWin=0, winLines=0;
  for(let row=0;row<ROWS;row++){
    const[a,b,c]=[grid[0][row],grid[1][row],grid[2][row]];
    if(a===b&&b===c){
      winLines++;
      const mult=a==='🎰'?100:a==='7️⃣'?50:a==='💎'?20:a==='⭐'?10:a==='🍇'?6:a==='🍊'?4:a==='🍋'?3:2;
      totalWin+=bet*mult;
    }
  }
  return{win:totalWin,lines:winLines};
}

const BET_GC=[100,250,500,1000,2500];
const BET_SC=[0.1,0.25,0.5,1,2.5];
const PAYTABLE=[['🎰','100×'],['7️⃣','50×'],['💎','20×'],['⭐','10×'],['🍇','6×'],['🍊','4×'],['🍋','3×'],['🍒','2×']];

export function SlotsGame() {
  const [grid, setGrid] = useState<string[][]>(spinReels);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<{win:number;lines:number}|null>(null);
  const [currency, setCurrency] = useState<Currency>('gold');
  const [betIdx, setBetIdx] = useState(1);

  // Per-reel animations
  const reelAnims = useRef(Array(REELS).fill(null).map(()=>new Animated.Value(0))).current;
  const reelStopped = useRef([true,true,true]);
  const winAnim = useRef(new Animated.Value(0)).current;

  const {goldCoins,sweepsCoins,deductBet,addWin} = useWalletStore();
  const betOptions = currency==='gold' ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency==='gold' ? goldCoins : sweepsCoins;

  async function spin() {
    if (spinning || balance<bet) return;
    setSpinning(true);
    setLastWin(null);
    deductBet(currency, bet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const {sessionId,error} = await placeBet('slots',currency,bet);
    if (error) { addWin(currency,bet); setSpinning(false); return; }

    // Start all reels spinning
    reelStopped.current = [false,false,false];
    reelAnims.forEach(anim=>{
      anim.setValue(0);
      Animated.loop(
        Animated.timing(anim,{toValue:1,duration:120,useNativeDriver:true,easing:Easing.linear})
      ).start();
    });

    const newGrid = spinReels();

    // Stop reels one by one with stagger
    for (let r=0; r<REELS; r++) {
      await new Promise(resolve=>setTimeout(resolve, STOP_DELAYS[r]));
      reelAnims[r].stopAnimation();
      reelAnims[r].setValue(0);
      reelStopped.current[r]=true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setGrid(newGrid);
    const result = calcWin(newGrid, bet);
    setLastWin(result);

    if (result.win > 0) {
      addWin(currency, result.win);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      winAnim.setValue(0);
      Animated.spring(winAnim,{toValue:1,speed:12,bounciness:12,useNativeDriver:true}).start();
    }
    await recordWin(sessionId, result.win, {grid:newGrid,lines:result.lines});
    setSpinning(false);
  }

  return (
    <View style={sl.container}>
      {/* Currency */}
      <GradientCard innerStyle={sl.controlRow}>
        <View style={sl.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <AnimatedPressable key={c} haptic="selection"
              style={[sl.toggleBtn,currency===c&&sl.toggleActive]}
              onPress={()=>{if(!spinning)setCurrency(c)}} disabled={spinning}>
              <Text style={[sl.toggleText,currency===c&&sl.toggleTextActive]}>
                {c==='gold'?'🪙 Gold':'💎 Sweeps'}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={sl.balance}>{currency==='gold'?`🪙 ${goldCoins.toLocaleString()}`:`💎 ${sweepsCoins.toFixed(2)}`}</Text>
      </GradientCard>

      {/* Machine frame */}
      <LinearGradient colors={['#1a1408','#0d0b05']} style={sl.machine}>
        {/* Gold trim top */}
        <LinearGradient colors={['#f7d35e','#d4900a']} style={sl.machineTrim}/>

        <View style={sl.reelFrame}>
          <LinearGradient colors={['rgba(0,0,0,0.4)','transparent']} style={sl.reelShadowTop}/>
          <View style={sl.reelsRow}>
            {Array(REELS).fill(null).map((_,reelIdx)=>(
              <Animated.View key={reelIdx} style={[
                sl.reel,
                {transform:[{translateY:reelAnims[reelIdx].interpolate({inputRange:[0,0.5,1],outputRange:[0,-10,0]})}]}
              ]}>
                {grid[reelIdx].map((sym,row)=>(
                  <View key={row} style={[sl.cell,row===1&&sl.cellCenter]}>
                    <Text style={[sl.symbol,row===1&&sl.symbolCenter]}>{sym}</Text>
                  </View>
                ))}
              </Animated.View>
            ))}
          </View>
          {/* Payline indicator */}
          <View style={sl.payline}/>
          <LinearGradient colors={['transparent','rgba(0,0,0,0.4)']} style={sl.reelShadowBot}/>
        </View>

        {/* Win display */}
        {lastWin && lastWin.win > 0 && (
          <Animated.View style={[sl.winBanner,{transform:[{scale:winAnim}]}]}>
            <LinearGradient colors={['rgba(245,200,66,0.2)','rgba(245,200,66,0.05)']} style={sl.winBannerInner}>
              <Text style={sl.winTitle}>🎉 WIN!</Text>
              <Text style={sl.winAmount}>
                +{currency==='gold'?lastWin.win.toLocaleString():lastWin.win.toFixed(2)}{' '}
                {currency==='gold'?'GC':'SC'}
              </Text>
              {lastWin.lines > 1 && <Text style={sl.winLines}>{lastWin.lines} lines!</Text>}
            </LinearGradient>
          </Animated.View>
        )}
        {lastWin && lastWin.win === 0 && (
          <Text style={sl.noWin}>No win · Try again!</Text>
        )}

        {/* Bottom trim */}
        <LinearGradient colors={['#d4900a','#f7d35e']} style={sl.machineTrim}/>
      </LinearGradient>

      {/* Paytable */}
      <GradientCard innerStyle={sl.paytable}>
        <Text style={sl.paytableTitle}>Paytable · 3 in a row</Text>
        <View style={sl.paytableGrid}>
          {PAYTABLE.map(([sym,mult])=>(
            <View key={sym} style={sl.payItem}>
              <Text style={sl.paySym}>{sym}</Text>
              <Text style={sl.payMult}>{mult}</Text>
            </View>
          ))}
        </View>
      </GradientCard>

      {/* Bet + spin */}
      <GradientCard innerStyle={sl.betPanel}>
        <View style={sl.betRow}>
          <Text style={sl.betLabel}>Bet</Text>
          {betOptions.map((opt,i)=>(
            <AnimatedPressable key={i} haptic="selection"
              style={[sl.chip,betIdx===i&&sl.chipActive]}
              onPress={()=>setBetIdx(i)} disabled={spinning}>
              <Text style={[sl.chipText,betIdx===i&&sl.chipTextActive]}>
                {currency==='gold'?opt.toLocaleString():opt.toFixed(2)}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        <GoldButton
          label={spinning ? 'Spinning…' : '🎰 SPIN'}
          onPress={spin}
          loading={false}
          disabled={spinning||balance<bet}
          size="lg"
          fullWidth
          haptic="medium"
        />
      </GradientCard>
    </View>
  );
}

const sl = StyleSheet.create({
  container: { gap:12 },
  controlRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:14 },
  toggle: { flexDirection:'row', gap:6 },
  toggleBtn: { paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:'rgba(255,255,255,0.06)' },
  toggleActive: { backgroundColor:'#f5c842' },
  toggleText: { color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:'600' },
  toggleTextActive: { color:'#0f1117' },
  balance: { color:'rgba(255,255,255,0.4)', fontSize:12 },
  machine: { borderRadius:20, borderWidth:2, borderColor:'#d4900a', overflow:'hidden', gap:0 },
  machineTrim: { height:4 },
  reelFrame: { position:'relative', marginHorizontal:16, marginVertical:12 },
  reelShadowTop: { position:'absolute', top:0, left:0, right:0, height:20, zIndex:1 },
  reelShadowBot: { position:'absolute', bottom:0, left:0, right:0, height:20, zIndex:1 },
  reelsRow: { flexDirection:'row', gap:6, justifyContent:'center' },
  reel: { backgroundColor:'#080c14', borderRadius:10, borderWidth:1, borderColor:'#1a1408', overflow:'hidden' },
  cell: { width:88, height:76, alignItems:'center', justifyContent:'center', borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.04)' },
  cellCenter: { borderTopWidth:2, borderBottomWidth:2, borderColor:'rgba(245,200,66,0.4)', backgroundColor:'rgba(245,200,66,0.04)' },
  symbol: { fontSize:34, opacity:0.7 },
  symbolCenter: { opacity:1, fontSize:38 },
  payline: { position:'absolute', top:'50%', left:0, right:0, height:2, backgroundColor:'rgba(245,200,66,0.2)', marginTop:-1 },
  winBanner: { marginHorizontal:16, marginBottom:8 },
  winBannerInner: { borderRadius:12, borderWidth:1, borderColor:'rgba(245,200,66,0.3)', padding:14, alignItems:'center', gap:4 },
  winTitle: { fontSize:22, fontWeight:'800', color:'#f5c842' },
  winAmount: { fontSize:20, fontWeight:'800', color:'#22c55e' },
  winLines: { fontSize:12, color:'rgba(255,255,255,0.5)' },
  noWin: { textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:12, marginBottom:12 },
  paytable: {},
  paytableInner: { padding:12 },
  paytableTitle: { color:'rgba(255,255,255,0.3)', fontSize:10, fontWeight:'700', letterSpacing:1.2, marginBottom:10, marginHorizontal:12, marginTop:12 },
  paytableGrid: { flexDirection:'row', flexWrap:'wrap', gap:6, paddingHorizontal:12, paddingBottom:12 },
  payItem: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:8, paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:'#1e2840' },
  paySym: { fontSize:18 },
  payMult: { color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:'700' },
  betPanel: { padding:14, gap:12 },
  betRow: { flexDirection:'row', alignItems:'center', gap:8, flexWrap:'wrap' },
  betLabel: { color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:'600', letterSpacing:0.5 },
  chip: { paddingHorizontal:14, paddingVertical:7, borderRadius:10, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'transparent' },
  chipActive: { backgroundColor:'rgba(245,200,66,0.12)', borderColor:'rgba(245,200,66,0.35)' },
  chipText: { color:'rgba(255,255,255,0.4)', fontSize:13, fontWeight:'700' },
  chipTextActive: { color:'#f5c842' },
});
