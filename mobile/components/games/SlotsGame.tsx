import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';

const SYMBOLS = ['🍒','🍋','🍊','🍇','⭐','💎','7️⃣','🎰'];
const PAYLINES = 9;
const REELS = 3;
const ROWS = 3;

function getSymbol() { return SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)]; }
function spinReels(): string[][] {
  return Array(REELS).fill(null).map(()=>Array(ROWS).fill(null).map(getSymbol));
}
function calcWin(grid: string[][], bet: number): { win: number; lines: number } {
  // Check 3 horizontal paylines (rows)
  let totalWin=0, winLines=0;
  for (let row=0; row<ROWS; row++) {
    const [a,b,c]=[grid[0][row],grid[1][row],grid[2][row]];
    if (a===b&&b===c) {
      winLines++;
      const mult =
        a==='🎰'?100:a==='7️⃣'?50:a==='💎'?20:a==='⭐'?10:
        a==='🍇'?6:a==='🍊'?4:a==='🍋'?3:2;
      totalWin+=bet*mult;
    }
  }
  return { win: totalWin, lines: winLines };
}

const BET_GC=[100,250,500,1000,2500];
const BET_SC=[0.1,0.25,0.5,1,2.5];

export function SlotsGame() {
  const [grid,setGrid]=useState<string[][]>(()=>spinReels());
  const [spinning,setSpinning]=useState(false);
  const [lastWin,setLastWin]=useState<{win:number;lines:number}|null>(null);
  const [currency,setCurrency]=useState<Currency>('gold');
  const [betIdx,setBetIdx]=useState(1);
  const spinAnims=useRef(Array(REELS).fill(null).map(()=>new Animated.Value(0))).current;

  const {goldCoins,sweepsCoins,deductBet,addWin}=useWalletStore();
  const betOptions=currency==='gold'?BET_GC:BET_SC;
  const bet=betOptions[betIdx];
  const balance=currency==='gold'?goldCoins:sweepsCoins;

  async function spin() {
    if (spinning||balance<bet) return;
    setSpinning(true);
    setLastWin(null);
    deductBet(currency,bet);

    const {sessionId,error}=await placeBet('slots',currency,bet);
    if (error) { addWin(currency,bet); setSpinning(false); return; }

    // Animate reels
    const anims = spinAnims.map((anim,i)=>
      Animated.sequence([
        Animated.delay(i*100),
        Animated.loop(Animated.timing(anim,{toValue:1,duration:200,useNativeDriver:true}),{iterations:6}),
      ])
    );
    Animated.parallel(anims).start();

    await new Promise(r=>setTimeout(r,1500+REELS*100));
    spinAnims.forEach(a=>{a.stopAnimation();a.setValue(0);});

    const newGrid=spinReels();
    setGrid(newGrid);

    const result=calcWin(newGrid,bet);
    setLastWin(result);
    if (result.win>0) addWin(currency,result.win);
    await recordWin(sessionId,result.win,{grid:newGrid,lines:result.lines});
    setSpinning(false);
  }

  return (
    <View style={sl.container}>
      {/* Currency */}
      <View style={sl.controlRow}>
        <View style={sl.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <TouchableOpacity key={c} style={[sl.toggleBtn,currency===c&&sl.toggleActive]}
              onPress={()=>{if(!spinning)setCurrency(c)}} disabled={spinning}>
              <Text style={[sl.toggleText,currency===c&&sl.toggleTextActive]}>{c==='gold'?'🪙 Gold':'💎 Sweeps'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={sl.balance}>{currency==='gold'?`🪙 ${goldCoins.toLocaleString()}`:`💎 ${sweepsCoins.toFixed(2)}`}</Text>
      </View>

      {/* Slot machine display */}
      <View style={sl.machine}>
        <View style={sl.reelsRow}>
          {Array(REELS).fill(null).map((_,reelIdx)=>(
            <Animated.View key={reelIdx} style={[
              sl.reel,
              {transform:[{translateY:spinAnims[reelIdx].interpolate({inputRange:[0,0.5,1],outputRange:[0,-8,0]})}]}
            ]}>
              {grid[reelIdx].map((sym,row)=>(
                <View key={row} style={[sl.cell,row===1&&sl.cellCenter]}>
                  <Text style={sl.symbol}>{sym}</Text>
                </View>
              ))}
            </Animated.View>
          ))}
        </View>

        {/* Win overlay */}
        {lastWin && lastWin.win>0 && (
          <View style={sl.winOverlay}>
            <Text style={sl.winText}>🎉 WIN!</Text>
            <Text style={sl.winAmount}>
              +{currency==='gold'?lastWin.win.toLocaleString():lastWin.win.toFixed(2)} {currency==='gold'?'GC':'SC'}
            </Text>
            {lastWin.lines>1&&<Text style={sl.winLines}>{lastWin.lines} winning lines!</Text>}
          </View>
        )}
        {lastWin && lastWin.win===0 && (
          <Text style={sl.noWin}>No win — try again!</Text>
        )}
      </View>

      {/* Paytable */}
      <View style={sl.paytable}>
        <Text style={sl.paytableTitle}>Payouts (3 in a row)</Text>
        <View style={sl.paytableGrid}>
          {[['🎰','100×'],['7️⃣','50×'],['💎','20×'],['⭐','10×'],['🍇','6×'],['🍊','4×'],['🍋','3×'],['🍒','2×']].map(([sym,mult])=>(
            <View key={sym} style={sl.payItem}>
              <Text style={sl.paySym}>{sym}</Text>
              <Text style={sl.payMult}>{mult}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bet selector + spin */}
      <View style={sl.betPanel}>
        <View style={sl.betRow}>
          <Text style={sl.betLabel}>Bet:</Text>
          {betOptions.map((opt,i)=>(
            <TouchableOpacity key={i} style={[sl.betChip,betIdx===i&&sl.betChipActive]}
              onPress={()=>setBetIdx(i)} disabled={spinning}>
              <Text style={[sl.betChipText,betIdx===i&&sl.betChipTextActive]}>
                {currency==='gold'?opt.toLocaleString():opt.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[sl.spinBtn,(spinning||balance<bet)&&sl.spinBtnDim]}
          onPress={spin} disabled={spinning||balance<bet}
        >
          <Text style={sl.spinBtnText}>{spinning?'Spinning…':'🎰 SPIN'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sl = StyleSheet.create({
  container:{gap:12},
  controlRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#1a1f2e',borderWidth:1,borderColor:'#2a3048',borderRadius:12,padding:12},
  toggle:{flexDirection:'row',gap:6},
  toggleBtn:{paddingHorizontal:12,paddingVertical:6,borderRadius:20,backgroundColor:'#2a3048'},
  toggleActive:{backgroundColor:'#f5c842'},
  toggleText:{color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:'600'},
  toggleTextActive:{color:'#0f1117'},
  balance:{color:'rgba(255,255,255,0.5)',fontSize:12},
  machine:{backgroundColor:'#1a1f2e',borderWidth:2,borderColor:'#f5c842',borderRadius:16,padding:16,alignItems:'center',gap:8},
  reelsRow:{flexDirection:'row',gap:4},
  reel:{backgroundColor:'#0f1117',borderWidth:1,borderColor:'#2a3048',borderRadius:8,overflow:'hidden'},
  cell:{width:80,height:72,alignItems:'center',justifyContent:'center',borderBottomWidth:1,borderBottomColor:'#1e2435'},
  cellCenter:{borderTopWidth:2,borderBottomWidth:2,borderColor:'#f5c842',backgroundColor:'rgba(245,200,66,0.05)'},
  symbol:{fontSize:34},
  winOverlay:{alignItems:'center',gap:4},
  winText:{color:'#f5c842',fontSize:22,fontWeight:'700'},
  winAmount:{color:'#22c55e',fontSize:18,fontWeight:'700'},
  winLines:{color:'rgba(255,255,255,0.5)',fontSize:12},
  noWin:{color:'rgba(255,255,255,0.3)',fontSize:12,textAlign:'center'},
  paytable:{backgroundColor:'#1a1f2e',borderWidth:1,borderColor:'#2a3048',borderRadius:12,padding:12},
  paytableTitle:{color:'rgba(255,255,255,0.4)',fontSize:10,fontWeight:'600',letterSpacing:1,marginBottom:8},
  paytableGrid:{flexDirection:'row',flexWrap:'wrap',gap:6},
  payItem:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'#2a3048',borderRadius:6,paddingHorizontal:8,paddingVertical:4},
  paySym:{fontSize:16},
  payMult:{color:'rgba(255,255,255,0.6)',fontSize:11,fontWeight:'600'},
  betPanel:{backgroundColor:'#1a1f2e',borderWidth:1,borderColor:'#2a3048',borderRadius:12,padding:14,gap:10},
  betRow:{flexDirection:'row',alignItems:'center',gap:6,flexWrap:'wrap'},
  betLabel:{color:'rgba(255,255,255,0.4)',fontSize:12},
  betChip:{paddingHorizontal:12,paddingVertical:6,borderRadius:8,backgroundColor:'#2a3048'},
  betChipActive:{backgroundColor:'#f5c842'},
  betChipText:{color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:'600'},
  betChipTextActive:{color:'#0f1117'},
  spinBtn:{backgroundColor:'#f5c842',borderRadius:12,paddingVertical:16,alignItems:'center'},
  spinBtnDim:{opacity:0.4},
  spinBtnText:{color:'#0f1117',fontWeight:'700',fontSize:17,letterSpacing:0.5},
});
