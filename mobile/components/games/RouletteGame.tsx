import { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useWalletStore, type Currency } from '@/lib/store';
import { placeBet, recordWin } from '@/lib/actions';

const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
function getColor(n: number): 'red'|'black'|'green' {
  if (n===0) return 'green';
  return RED_NUMS.has(n) ? 'red' : 'black';
}

type BetKind = 'straight'|'color'|'parity'|'half'|'dozen'|'column';
type BetType = {kind:'straight';number:number}|{kind:'color';color:'red'|'black'}|{kind:'parity';parity:'odd'|'even'}|{kind:'half';half:'low'|'high'}|{kind:'dozen';dozen:1|2|3}|{kind:'column';column:1|2|3};
interface PlacedBet { id:string; bet:BetType; amount:number; label:string }

function betPays(b: BetType, result: number): number {
  const c=getColor(result);
  switch(b.kind){
    case 'straight': return b.number===result?35:0;
    case 'color': return c===b.color&&result!==0?1:0;
    case 'parity': if(result===0) return 0; return (b.parity==='odd'?result%2!==0:result%2===0)?1:0;
    case 'half': if(result===0) return 0; return (b.half==='low'?result<=18:result>=19)?1:0;
    case 'dozen': if(result===0) return 0; return Math.ceil(result/12)===b.dozen?2:0;
    case 'column': if(result===0) return 0; return result%3===(b.column===3?0:b.column)?2:0;
    default: return 0;
  }
}
function betLabel(b: BetType): string {
  switch(b.kind){
    case 'straight': return `#${b.number}`;
    case 'color': return b.color==='red'?'Red':'Black';
    case 'parity': return b.parity==='odd'?'Odd':'Even';
    case 'half': return b.half==='low'?'1–18':'19–36';
    case 'dozen': return `${b.dozen===1?'1st':b.dozen===2?'2nd':'3rd'} 12`;
    case 'column': return `Col ${b.column}`;
    default: return 'Bet';
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

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const chips = currency==='gold'?CHIPS_GC:CHIPS_SC;
  const chipAmt = chips[chipIdx];
  const totalBet = bets.reduce((s,b)=>s+b.amount,0);
  const balance = currency==='gold'?goldCoins:sweepsCoins;

  function addBet(bet: BetType) {
    if (phase!=='betting') return;
    if (balance-totalBet<chipAmt) return;
    setBets(prev=>[...prev,{id:`${bet.kind}-${Date.now()}`,bet,amount:chipAmt,label:betLabel(bet)}]);
  }

  const spin = useCallback(async () => {
    if (bets.length===0||totalBet>balance) return;
    setPhase('spinning');
    deductBet(currency,totalBet);

    const {sessionId,error} = await placeBet('roulette',currency,totalBet);
    if (error) { addWin(currency,totalBet); setPhase('betting'); return; }

    Animated.loop(Animated.timing(spinAnim,{toValue:1,duration:400,useNativeDriver:true}),{iterations:5}).start();

    await new Promise(r=>setTimeout(r,2200));
    spinAnim.stopAnimation();
    spinAnim.setValue(0);

    const winNum=Math.floor(Math.random()*37);
    setResult(winNum);

    let total=0;
    for (const b of bets) {
      const m=betPays(b.bet,winNum);
      if(m>0) total+=b.amount+b.amount*m;
    }
    setWinAmount(total);
    setHistory(prev=>[winNum,...prev].slice(0,20));
    setPhase('result');
    if (total>0) addWin(currency,total);
    await recordWin(sessionId,total,{result:winNum});
  },[bets,totalBet,balance,currency,deductBet,addWin,spinAnim]);

  function reset() { setPhase('betting'); setBets([]); setResult(null); setWinAmount(0); }

  const spin360=spinAnim.interpolate({inputRange:[0,1],outputRange:['0deg','360deg']});
  const wheelColor = result!==null
    ? getColor(result)==='red'?'#b91c1c':getColor(result)==='green'?'#166534':'#111'
    : '#2a3048';

  return (
    <View style={rs.container}>
      {/* Currency */}
      <View style={rs.controlRow}>
        <View style={rs.toggle}>
          {(['gold','sweeps'] as Currency[]).map(c=>(
            <TouchableOpacity key={c} style={[rs.toggleBtn,currency===c&&rs.toggleActive]}
              onPress={()=>{if(phase==='betting'){setCurrency(c);setBets([]);setChipIdx(1)}}} disabled={phase!=='betting'}>
              <Text style={[rs.toggleText,currency===c&&rs.toggleTextActive]}>{c==='gold'?'🪙 Gold':'💎 Sweeps'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={rs.balance}>{currency==='gold'?`🪙${goldCoins.toLocaleString()}`:`💎${sweepsCoins.toFixed(2)}`}</Text>
      </View>

      {/* Wheel */}
      <View style={rs.wheelSection}>
        <Animated.View style={[rs.wheel,{backgroundColor:wheelColor},{transform:[{rotate:spin360}]}]}>
          <Text style={rs.wheelNum}>{phase==='spinning'?'🎲':result!==null?result:'?'}</Text>
        </Animated.View>
        <View style={rs.history}>
          <Text style={rs.historyLabel}>Recent</Text>
          <View style={rs.historyNums}>
            {history.slice(0,8).map((n,i)=>(
              <View key={i} style={[rs.histNum,
                getColor(n)==='red'?rs.histRed:getColor(n)==='green'?rs.histGreen:rs.histBlack]}>
                <Text style={rs.histNumText}>{n}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Result message */}
      {phase==='result'&&(
        <View style={[rs.resultMsg,winAmount>0?rs.resultWin:rs.resultLose]}>
          <Text style={rs.resultText}>
            {winAmount>0
              ? `🎉 Won ${currency==='gold'?winAmount.toLocaleString():winAmount.toFixed(2)} ${currency==='gold'?'GC':'SC'}!`
              : `No win — landed on ${result} (${getColor(result!)})`}
          </Text>
        </View>
      )}

      {/* Betting table */}
      <View style={rs.bettingTable}>
        {/* Zero */}
        <TouchableOpacity style={[rs.num,rs.numGreen,result===0&&rs.numSelected]}
          onPress={()=>addBet({kind:'straight',number:0})} disabled={phase!=='betting'}>
          <Text style={rs.numText}>0</Text>
        </TouchableOpacity>
        {/* Grid */}
        {GRID.map((row,ri)=>(
          <View key={ri} style={rs.gridRow}>
            {row.map(n=>{
              const c=getColor(n);
              return (
                <TouchableOpacity key={n}
                  style={[rs.num,c==='red'?rs.numRed:rs.numBlack,result===n&&rs.numSelected]}
                  onPress={()=>addBet({kind:'straight',number:n})} disabled={phase!=='betting'}>
                  <Text style={rs.numText}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        {/* Dozens */}
        <View style={rs.outsideRow}>
          {([1,2,3] as const).map(d=>(
            <TouchableOpacity key={d} style={rs.outsideBtn}
              onPress={()=>addBet({kind:'dozen',dozen:d})} disabled={phase!=='betting'}>
              <Text style={rs.outsideText}>{d===1?'1st 12':d===2?'2nd 12':'3rd 12'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Even chances */}
        <View style={rs.outsideRow}>
          {[
            {label:'1–18',bet:{kind:'half' as const,half:'low' as const}},
            {label:'Even',bet:{kind:'parity' as const,parity:'even' as const}},
            {label:'Red',bet:{kind:'color' as const,color:'red' as const},style:rs.numRed},
            {label:'Black',bet:{kind:'color' as const,color:'black' as const},style:rs.numBlack},
            {label:'Odd',bet:{kind:'parity' as const,parity:'odd' as const}},
            {label:'19–36',bet:{kind:'half' as const,half:'high' as const}},
          ].map(({label,bet,style})=>(
            <TouchableOpacity key={label} style={[rs.outsideBtn,style]}
              onPress={()=>addBet(bet)} disabled={phase!=='betting'}>
              <Text style={rs.outsideText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chips + action */}
      <View style={rs.chipPanel}>
        <View style={rs.chipRow}>
          {chips.map((amt,i)=>(
            <TouchableOpacity key={i} style={[rs.chip,chipIdx===i&&rs.chipActive]} onPress={()=>setChipIdx(i)}>
              <Text style={[rs.chipText,chipIdx===i&&rs.chipTextActive]}>
                {currency==='gold'?(amt>=1000?`${amt/1000}K`:amt):amt}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={rs.totalBet}>Total: <Text style={{color:'#f5c842',fontWeight:'700'}}>
            {currency==='gold'?totalBet.toLocaleString():totalBet.toFixed(2)} {currency==='gold'?'GC':'SC'}
          </Text></Text>
        </View>
        {bets.length>0&&(
          <View style={rs.placedBets}>
            {bets.map(b=>(
              <View key={b.id} style={rs.betTag}>
                <Text style={rs.betTagText}>{b.label} ({currency==='gold'?b.amount.toLocaleString():b.amount.toFixed(2)})</Text>
              </View>
            ))}
          </View>
        )}
        <View style={rs.btnRow}>
          {phase==='betting'&&(
            <>
              <TouchableOpacity style={[rs.btn,rs.btnOutline,{flex:1}]} onPress={()=>setBets([])} disabled={bets.length===0}>
                <Text style={rs.btnOutlineText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[rs.btn,rs.btnGold,{flex:1},(!bets.length||totalBet>balance)&&rs.btnDim]}
                onPress={spin} disabled={!bets.length||totalBet>balance}>
                <Text style={rs.btnGoldText}>Spin!</Text>
              </TouchableOpacity>
            </>
          )}
          {phase==='spinning'&&<Text style={rs.spinningText}>Ball in motion…</Text>}
          {phase==='result'&&(
            <TouchableOpacity style={[rs.btn,rs.btnGold,{flex:1}]} onPress={reset}>
              <Text style={rs.btnGoldText}>New Spin</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const rs = StyleSheet.create({
  container:{gap:10},
  controlRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#1a1f2e',borderWidth:1,borderColor:'#2a3048',borderRadius:12,padding:12},
  toggle:{flexDirection:'row',gap:6},
  toggleBtn:{paddingHorizontal:12,paddingVertical:6,borderRadius:20,backgroundColor:'#2a3048'},
  toggleActive:{backgroundColor:'#f5c842'},
  toggleText:{color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:'600'},
  toggleTextActive:{color:'#0f1117'},
  balance:{color:'rgba(255,255,255,0.5)',fontSize:12},
  wheelSection:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:20,paddingVertical:8},
  wheel:{width:96,height:96,borderRadius:48,borderWidth:3,borderColor:'#f5c842',alignItems:'center',justifyContent:'center'},
  wheelNum:{fontSize:28,fontWeight:'700',color:'#fff'},
  history:{gap:4},
  historyLabel:{color:'rgba(255,255,255,0.4)',fontSize:10},
  historyNums:{flexDirection:'row',flexWrap:'wrap',gap:4,maxWidth:150},
  histNum:{width:26,height:26,borderRadius:13,alignItems:'center',justifyContent:'center'},
  histRed:{backgroundColor:'#b91c1c'},
  histBlack:{backgroundColor:'#1f2937',borderWidth:1,borderColor:'#374151'},
  histGreen:{backgroundColor:'#166534'},
  histNumText:{color:'#fff',fontSize:9,fontWeight:'700'},
  resultMsg:{padding:12,borderRadius:10,alignItems:'center'},
  resultWin:{backgroundColor:'rgba(34,197,94,0.15)',borderWidth:1,borderColor:'rgba(34,197,94,0.3)'},
  resultLose:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  resultText:{color:'#fff',fontWeight:'600',fontSize:14,textAlign:'center'},
  bettingTable:{backgroundColor:'#1a3a1a',borderWidth:1,borderColor:'#2d5a2d',borderRadius:12,padding:8,gap:3},
  num:{flex:1,paddingVertical:7,borderRadius:4,alignItems:'center',justifyContent:'center'},
  numRed:{backgroundColor:'#991b1b'},
  numBlack:{backgroundColor:'#1f2937',borderWidth:1,borderColor:'#374151'},
  numGreen:{backgroundColor:'#14532d',alignSelf:'stretch'},
  numSelected:{borderWidth:2,borderColor:'#f5c842'},
  numText:{color:'#fff',fontSize:10,fontWeight:'700'},
  gridRow:{flexDirection:'row',gap:2},
  outsideRow:{flexDirection:'row',gap:2},
  outsideBtn:{flex:1,paddingVertical:7,borderRadius:4,backgroundColor:'rgba(255,255,255,0.07)',alignItems:'center'},
  outsideText:{color:'#fff',fontSize:10,fontWeight:'600'},
  chipPanel:{backgroundColor:'#1a1f2e',borderWidth:1,borderColor:'#2a3048',borderRadius:12,padding:12,gap:8},
  chipRow:{flexDirection:'row',alignItems:'center',gap:6,flexWrap:'wrap'},
  chip:{width:44,height:44,borderRadius:22,borderWidth:2,borderColor:'#2a3048',backgroundColor:'#2a3048',alignItems:'center',justifyContent:'center'},
  chipActive:{borderColor:'#f5c842',backgroundColor:'#f5c842'},
  chipText:{color:'rgba(255,255,255,0.6)',fontSize:11,fontWeight:'700'},
  chipTextActive:{color:'#0f1117'},
  totalBet:{color:'rgba(255,255,255,0.5)',fontSize:12,marginLeft:'auto'},
  placedBets:{flexDirection:'row',flexWrap:'wrap',gap:4},
  betTag:{backgroundColor:'#2a3048',borderRadius:6,paddingHorizontal:8,paddingVertical:3},
  betTagText:{color:'rgba(255,255,255,0.7)',fontSize:10},
  btnRow:{flexDirection:'row',gap:8},
  btn:{paddingVertical:13,borderRadius:10,alignItems:'center'},
  btnGold:{backgroundColor:'#f5c842'},
  btnGoldText:{color:'#0f1117',fontWeight:'700',fontSize:14},
  btnOutline:{borderWidth:1,borderColor:'rgba(255,255,255,0.3)'},
  btnOutlineText:{color:'rgba(255,255,255,0.7)',fontWeight:'700',fontSize:14},
  btnDim:{opacity:0.4},
  spinningText:{color:'rgba(255,255,255,0.5)',textAlign:'center',flex:1,paddingVertical:12},
});
