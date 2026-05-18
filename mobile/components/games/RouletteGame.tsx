import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { GoldButton } from '@/components/ui/GoldButton';
import { GradientCard } from '@/components/ui/GradientCard';

const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
function getColor(n: number): 'red'|'black'|'green' {
  if(n===0)return 'green'; return RED_NUMS.has(n)?'red':'black';
}

type BetType =
  | { kind:'straight'; number:number }
  | { kind:'color'; color:'red'|'black' }
  | { kind:'parity'; parity:'odd'|'even' }
  | { kind:'half'; half:'low'|'high' }
  | { kind:'dozen'; dozen:1|2|3 };

interface PlacedBet { id:string; bet:BetType; amount:number; label:string }

function betPays(b:BetType,r:number):number{
  const c=getColor(r);
  switch(b.kind){
    case'straight':return b.number===r?35:0;
    case'color':return c===b.color&&r!==0?1:0;
    case'parity':if(r===0)return 0;return(b.parity==='odd'?r%2!==0:r%2===0)?1:0;
    case'half':if(r===0)return 0;return(b.half==='low'?r<=18:r>=19)?1:0;
    case'dozen':if(r===0)return 0;return Math.ceil(r/12)===b.dozen?2:0;
    default:return 0;
  }
}
function betLabel(b:BetType):string{
  switch(b.kind){
    case'straight':return`#${b.number}`;
    case'color':return b.color==='red'?'Red':'Black';
    case'parity':return b.parity==='odd'?'Odd':'Even';
    case'half':return b.half==='low'?'1–18':'19–36';
    case'dozen':return`${b.dozen===1?'1st':b.dozen===2?'2nd':'3rd'} 12`;
    default:return'Bet';
  }
}

const CHIPS_GC=[100,500,1000,5000];
const CHIPS_SC=[0.1,0.5,1,5];
const GRID=[
  [3,6,9,12,15,18,21,24,27,30,33,36],
  [2,5,8,11,14,17,20,23,26,29,32,35],
  [1,4,7,10,13,16,19,22,25,28,31,34],
];
type Phase='betting'|'spinning'|'result';

export function RouletteGame() {
  const [currency,setCurrency]=useState<Currency>('gold');
  const [chipIdx,setChipIdx]=useState(1);
  const [bets,setBets]=useState<PlacedBet[]>([]);
  const [phase,setPhase]=useState<Phase>('betting');
  const [result,setResult]=useState<number|null>(null);
  const [winAmount,setWinAmount]=useState(0);
  const [history,setHistory]=useState<number[]>([]);
  const spinAnim=useRef(new Animated.Value(0)).current;
  const resultScale=useRef(new Animated.Value(0)).current;

  const{goldCoins,sweepsCoins,deductBet,addWin}=useWalletStore();
  const chips=currency==='gold'?CHIPS_GC:CHIPS_SC;
  const chipAmt=chips[chipIdx];
  const totalBet=bets.reduce((s,b)=>s+b.amount,0);
  const balance=currency==='gold'?goldCoins:sweepsCoins;

  function addBet(bet:BetType){
    if(phase!=='betting')return;
    if(balance-totalBet<chipAmt)return;
    Haptics.selectionAsync();
    setBets(prev=>[...prev,{id:`${bet.kind}-${Date.now()}`,bet,amount:chipAmt,label:betLabel(bet)}]);
  }

  const spin=useCallback(async()=>{
    if(bets.length===0||totalBet>balance)return;
    setPhase('spinning');
    deductBet(currency,totalBet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const{sessionId,error}=await placeBet('roulette',currency,totalBet);
    if(error){addWin(currency,totalBet);setPhase('betting');return;}

    // Spinning animation — fast then decelerates
    Animated.timing(spinAnim,{
      toValue:1440,duration:2600,easing:Easing.out(Easing.cubic),useNativeDriver:true,
    }).start();

    await new Promise(r=>setTimeout(r,2700));
    spinAnim.setValue(0);

    const winNum=Math.floor(Math.random()*37);
    setResult(winNum);

    let total=0;
    for(const b of bets){const m=betPays(b.bet,winNum);if(m>0)total+=b.amount+b.amount*m;}
    setWinAmount(total);
    setHistory(prev=>[winNum,...prev].slice(0,20));
    setPhase('result');

    if(total>0){
      addWin(currency,total);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await recordWin(sessionId,total,{result:winNum});

    // Result pop animation
    resultScale.setValue(0);
    Animated.spring(resultScale,{toValue:1,speed:16,bounciness:10,useNativeDriver:true}).start();
  },[bets,totalBet,balance,currency,deductBet,addWin,spinAnim,resultScale]);

  function reset(){setPhase('betting');setBets([]);setResult(null);setWinAmount(0);}

  const wheelRotate=spinAnim.interpolate({inputRange:[0,1440],outputRange:['0deg','1440deg']});
  const wheelBg=result!==null
    ?getColor(result)==='red'?'#7f1d1d':getColor(result)==='green'?'#14532d':'#111827'
    :'#1e2840';

  return (
    <View style={rs.container}>
      {/* Currency bar */}
      <GradientCard innerStyle={rs.controlRow}>
        <View style={rs.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <AnimatedPressable key={c} haptic="selection"
              style={[rs.toggleBtn,currency===c&&rs.toggleActive]}
              onPress={()=>{if(phase==='betting'){setCurrency(c);setBets([]);setChipIdx(1)}}}
              disabled={phase!=='betting'}>
              <Text style={[rs.toggleText,currency===c&&rs.toggleTextActive]}>
                {c==='gold'?'🪙 Gold':'💎 Sweeps'}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        <Text style={rs.balance}>{currency==='gold'?`🪙 ${goldCoins.toLocaleString()}`:`💎 ${sweepsCoins.toFixed(2)}`}</Text>
      </GradientCard>

      {/* Wheel + history */}
      <View style={rs.wheelSection}>
        <View style={rs.wheelWrap}>
          <Animated.View style={[rs.wheel,{backgroundColor:wheelBg},{transform:[{rotate:wheelRotate}]}]}>
            <LinearGradient colors={['rgba(255,255,255,0.1)','transparent']} style={rs.wheelShine}/>
            <Text style={rs.wheelNum}>
              {phase==='spinning'?'':''}
              {result!==null&&phase!=='spinning'?result:'?'}
            </Text>
          </Animated.View>
          {/* Gold ring */}
          <View style={rs.wheelRing}/>
        </View>
        <View style={rs.historyBox}>
          <Text style={rs.histLabel}>Recent</Text>
          <View style={rs.histNums}>
            {history.slice(0,10).map((n,i)=>(
              <View key={i} style={[rs.histNum,getColor(n)==='red'&&rs.histRed,getColor(n)==='green'&&rs.histGreen]}>
                <Text style={rs.histNumText}>{n}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Result banner */}
      {phase==='result'&&(
        <Animated.View style={[rs.resultBanner,winAmount>0&&rs.resultBannerWin,{transform:[{scale:resultScale}]}]}>
          <Text style={rs.resultText}>
            {winAmount>0
              ?`🎉 +${currency==='gold'?winAmount.toLocaleString():winAmount.toFixed(2)} ${currency==='gold'?'GC':'SC'}`
              :`No win · ${result} (${getColor(result!)})`}
          </Text>
        </Animated.View>
      )}

      {/* Betting table */}
      <LinearGradient colors={['#0b2a10','#061507']} style={rs.table}>
        <AnimatedPressable haptic="selection" onPress={()=>addBet({kind:'straight',number:0})}
          style={[rs.numGreen,rs.zeroBtn,result===0&&rs.numSelected]} disabled={phase!=='betting'}>
          <Text style={rs.numText}>0</Text>
        </AnimatedPressable>
        {GRID.map((row,ri)=>(
          <View key={ri} style={rs.gridRow}>
            {row.map(n=>{
              const c=getColor(n);
              return(
                <AnimatedPressable key={n} haptic="selection"
                  style={[rs.numBtn,c==='red'&&rs.numRed,c==='black'&&rs.numBlack,result===n&&rs.numSelected]}
                  onPress={()=>addBet({kind:'straight',number:n})} disabled={phase!=='betting'}
                  scaleDown={0.85}>
                  <Text style={rs.numText}>{n}</Text>
                </AnimatedPressable>
              );
            })}
          </View>
        ))}
        <View style={rs.outsideRow}>
          {([1,2,3] as const).map(d=>(
            <AnimatedPressable key={d} style={rs.outsideBtn} haptic="selection"
              onPress={()=>addBet({kind:'dozen',dozen:d})} disabled={phase!=='betting'}>
              <Text style={rs.outsideText}>{d===1?'1–12':d===2?'13–24':'25–36'}</Text>
            </AnimatedPressable>
          ))}
        </View>
        <View style={rs.outsideRow}>
          {[
            {label:'1–18',bet:{kind:'half' as const,half:'low' as const}},
            {label:'Even',bet:{kind:'parity' as const,parity:'even' as const}},
            {label:'🔴',bet:{kind:'color' as const,color:'red' as const},red:true},
            {label:'⚫',bet:{kind:'color' as const,color:'black' as const}},
            {label:'Odd',bet:{kind:'parity' as const,parity:'odd' as const}},
            {label:'19–36',bet:{kind:'half' as const,half:'high' as const}},
          ].map(({label,bet,red})=>(
            <AnimatedPressable key={label} style={[rs.outsideBtn,red&&rs.outsideBtnRed]} haptic="selection"
              onPress={()=>addBet(bet)} disabled={phase!=='betting'} scaleDown={0.92}>
              <Text style={rs.outsideText}>{label}</Text>
            </AnimatedPressable>
          ))}
        </View>
      </LinearGradient>

      {/* Chips + action */}
      <GradientCard innerStyle={rs.chipPanel}>
        <View style={rs.chipRow}>
          {chips.map((amt,i)=>(
            <AnimatedPressable key={i} haptic="selection"
              style={[rs.chip,chipIdx===i&&rs.chipActive]} onPress={()=>setChipIdx(i)}>
              <Text style={[rs.chipText,chipIdx===i&&rs.chipTextActive]}>
                {currency==='gold'?(amt>=1000?`${amt/1000}K`:amt):amt}
              </Text>
            </AnimatedPressable>
          ))}
          {totalBet>0&&(
            <Text style={rs.totalBet}>
              Bet: <Text style={{color:'#f5c842',fontWeight:'700'}}>
                {currency==='gold'?totalBet.toLocaleString():totalBet.toFixed(2)}
              </Text>
            </Text>
          )}
        </View>
        {bets.length>0&&(
          <View style={rs.placedBets}>
            {bets.map(b=>(
              <View key={b.id} style={rs.betTag}>
                <Text style={rs.betTagText}>{b.label}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={rs.btnRow}>
          {phase==='betting'&&(
            <>
              <GoldButton label="Clear" onPress={()=>setBets([])} variant="ghost" size="md"
                disabled={bets.length===0} style={{flex:1}}/>
              <GoldButton label="🎡 Spin!" onPress={spin} size="lg"
                disabled={!bets.length||totalBet>balance} style={{flex:2}}/>
            </>
          )}
          {phase==='spinning'&&(
            <View style={rs.spinningRow}>
              <Text style={rs.spinningText}>Ball in motion…</Text>
            </View>
          )}
          {phase==='result'&&(
            <GoldButton label="New Spin" onPress={reset} size="lg" fullWidth haptic="medium"/>
          )}
        </View>
      </GradientCard>
    </View>
  );
}

const rs = StyleSheet.create({
  container:{gap:12},
  controlRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14},
  toggle:{flexDirection:'row',gap:6},
  toggleBtn:{paddingHorizontal:14,paddingVertical:7,borderRadius:20,backgroundColor:'rgba(255,255,255,0.06)'},
  toggleActive:{backgroundColor:'#f5c842'},
  toggleText:{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:'600'},
  toggleTextActive:{color:'#0f1117'},
  balance:{color:'rgba(255,255,255,0.4)',fontSize:12},
  wheelSection:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:24,paddingVertical:4},
  wheelWrap:{position:'relative',alignItems:'center',justifyContent:'center'},
  wheel:{width:100,height:100,borderRadius:50,alignItems:'center',justifyContent:'center',overflow:'hidden'},
  wheelShine:{position:'absolute',top:0,left:0,right:0,height:'50%',borderRadius:50},
  wheelRing:{position:'absolute',width:108,height:108,borderRadius:54,borderWidth:3,borderColor:'#f5c842'},
  wheelNum:{fontSize:30,fontWeight:'800',color:'#fff'},
  historyBox:{gap:6},
  histLabel:{color:'rgba(255,255,255,0.3)',fontSize:10,fontWeight:'600',letterSpacing:1},
  histNums:{flexDirection:'row',flexWrap:'wrap',gap:4,maxWidth:140},
  histNum:{width:24,height:24,borderRadius:12,backgroundColor:'#1f2937',alignItems:'center',justifyContent:'center'},
  histRed:{backgroundColor:'#7f1d1d'},
  histGreen:{backgroundColor:'#14532d'},
  histNumText:{color:'#fff',fontSize:9,fontWeight:'700'},
  resultBanner:{padding:14,borderRadius:12,alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',backgroundColor:'rgba(255,255,255,0.04)'},
  resultBannerWin:{borderColor:'rgba(34,197,94,0.3)',backgroundColor:'rgba(34,197,94,0.08)'},
  resultText:{color:'#fff',fontWeight:'700',fontSize:15,textAlign:'center'},
  table:{borderRadius:16,borderWidth:1,borderColor:'#1a4a1a',padding:8,gap:3,overflow:'hidden'},
  zeroBtn:{paddingVertical:8,borderRadius:6,alignItems:'center',marginBottom:2},
  numBtn:{flex:1,paddingVertical:7,borderRadius:4,alignItems:'center',justifyContent:'center',overflow:'hidden'},
  numRed:{backgroundColor:'#7f1d1d'},
  numBlack:{backgroundColor:'#1f2937',borderWidth:1,borderColor:'#374151'},
  numGreen:{backgroundColor:'#14532d'},
  numSelected:{borderWidth:2,borderColor:'#f5c842'},
  numText:{color:'#fff',fontSize:10,fontWeight:'700'},
  gridRow:{flexDirection:'row',gap:2},
  outsideRow:{flexDirection:'row',gap:2,marginTop:2},
  outsideBtn:{flex:1,paddingVertical:8,borderRadius:6,backgroundColor:'rgba(255,255,255,0.06)',alignItems:'center',justifyContent:'center'},
  outsideBtnRed:{backgroundColor:'rgba(127,29,29,0.6)'},
  outsideText:{color:'rgba(255,255,255,0.7)',fontSize:10,fontWeight:'700'},
  chipPanel:{padding:14,gap:10},
  chipRow:{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap'},
  chip:{width:44,height:44,borderRadius:22,borderWidth:2,borderColor:'#1e2840',backgroundColor:'rgba(255,255,255,0.06)',alignItems:'center',justifyContent:'center'},
  chipActive:{borderColor:'#f5c842',backgroundColor:'rgba(245,200,66,0.15)'},
  chipText:{color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:'700'},
  chipTextActive:{color:'#f5c842'},
  totalBet:{color:'rgba(255,255,255,0.4)',fontSize:12,marginLeft:'auto'},
  placedBets:{flexDirection:'row',flexWrap:'wrap',gap:4},
  betTag:{backgroundColor:'rgba(255,255,255,0.06)',borderRadius:6,paddingHorizontal:8,paddingVertical:3,borderWidth:1,borderColor:'#1e2840'},
  betTagText:{color:'rgba(255,255,255,0.6)',fontSize:10,fontWeight:'600'},
  btnRow:{flexDirection:'row',gap:8},
  spinningRow:{flex:1,alignItems:'center',paddingVertical:14},
  spinningText:{color:'rgba(255,255,255,0.4)',fontSize:14},
});
