/* ---- background music + beat grid (analysed from the decoded audio, so glow = what you hear) ---- */
let song=null,mg=null,mt0=0,OFF=0,lb=0;const VOL=.05;
try{OFF=+localStorage.getItem('boff')||0}catch(e){}
function analyse(buf){
  const sr=buf.sampleRate,n=buf.length,A=buf.getChannelData(0),B=buf.numberOfChannels>1?buf.getChannelData(1):A;
  const hop=Math.round(sr*.005),nb=Math.floor(n/hop),dt=hop/sr,k1=1-Math.exp(-2*Math.PI*150/sr),k2=1-Math.exp(-2*Math.PI*800/sr);
  let l1=0,l2=0,l3=0,m=0;const eL=new Float32Array(nb),eH=new Float32Array(nb);
  for(let k=0;k<nb;k++){let sl=0,sh=0;for(let i=k*hop,e=i+hop;i<e;i++){const x=(A[i]+B[i])*.5;l1+=k1*(x-l1);l2+=k1*(l1-l2);l3+=k1*(l2-l3);m+=k2*(x-m);const h=x-m;sl+=l3*l3;sh+=h*h}eL[k]=Math.sqrt(sl/hop);eH[k]=Math.sqrt(sh/hop)}
  const flux=e=>{const lg=new Float32Array(nb),o=new Float32Array(nb);let t=0;for(let k=0;k<nb;k++)lg[k]=Math.log(1+40*e[k]);
    for(let k=0;k<nb;k++){let s=0,c=0;for(let j=Math.max(0,k-6);j<k;j++){s+=lg[j];c++}o[k]=c?Math.max(0,lg[k]-s/c):0;t+=o[k]}t/=nb||1;for(let k=0;k<nb;k++)o[k]/=t||1;return o};
  const oL=flux(eL),oH=flux(eH),o=new Float32Array(nb);for(let k=0;k<nb;k++)o[k]=oL[k]+.8*oH[k];
  const T=nb*dt,sc=(P,ph)=>{let s=0;for(let t=ph;t<T-.05;t+=P)s+=o[Math.floor(t/dt)];return s};
  let best=[-1,.46,0];
  for(let P=.4;P<.52;P+=.0004)for(let ph=0;ph<P;ph+=.005){const v=sc(P,ph);if(v>best[0])best=[v,P,ph]}
  const P0=best[1],h0=best[2];best=[-1,P0,h0];
  for(let P=P0-.0006;P<=P0+.0006;P+=.00002)for(let ph=h0-.012;ph<=h0+.012;ph+=.001){const v=sc(P,ph);if(v>best[0])best=[v,P,ph]}
  const P=best[1];let ph=best[2];while(ph<0)ph+=P;while(ph>=P)ph-=P;
  const bt=[],raw=[];for(let t=ph;t<T-.05;t+=P){bt.push(t);let v=0;const c=Math.floor(t/dt);for(let j=c-3;j<=c+3;j++)if(o[j]>v)v=o[j];raw.push(v)}
  const srt=[...raw].sort((a,b)=>a-b),ref=srt[Math.floor(srt.length*.85)]||1;
  return{P,ph,bt:Float64Array.from(bt),amp:Float32Array.from(raw,v=>.15+.85*Math.pow(Math.min(1,v/ref),.7)),buf}}
function b64buf(){const t=atob(SONG_B64),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);return u.buffer}
async function prep(){try{const C=window.OfflineAudioContext||window.webkitOfflineAudioContext,oc=new C(2,44100,44100);
  const buf=await new Promise((r,j)=>{const p=oc.decodeAudioData(b64buf(),r,j);if(p&&p.catch)p.catch(j)});
  song=analyse(buf);if(ready)startMusic()}catch(e){}}
function startMusic(){try{if(!on||!ac||!song||msrc)return;
  msrc=ac.createBufferSource();msrc.buffer=song.buf;msrc.loop=true;mg=ac.createGain();mg.gain.value=0;msrc.connect(mg);mg.connect(ac.destination);
  mt0=ac.currentTime+.1;msrc.start(mt0);mg.gain.setValueAtTime(0,mt0);mg.gain.linearRampToValueAtTime(VOL,mt0+1.2);playing=true;$('hint').innerHTML='&#9835; On a mission';lab()}catch(e){msrc=null}}
function musicSet(){if(on&&!msrc)startMusic();if(!mg)return;mg.gain.cancelScheduledValues(ac.currentTime);mg.gain.setTargetAtTime(on?VOL:0,ac.currentTime,.08)}
let est=0,lastP=0,prevR=null,bsAcc=0,lk=-1;
/* smooth song clock: follows the audio clock but advances with the frame timer, so coarse audio clocks don't make the glow jump */
function heard(){const now=performance.now(),o=ac.getOutputTimestamp&&ac.getOutputTimestamp();let m;
  if(o&&o.performanceTime>0)m=o.contextTime+(now-o.performanceTime)/1000;else m=ac.currentTime-(ac.outputLatency||ac.baseLatency||0);
  if(!lastP||Math.abs(m-est)>.3)est=m;else{est+=(now-lastP)/1000;est+=(m-est)*.08}
  lastP=now;return est}
const wrp=document.querySelector('.wrap'),bte=$('bt'),blobs=document.querySelector('.blobs');
(function pulse(){requestAnimationFrame(pulse);let v=0;
  if(!RM&&on&&song&&msrc&&ac&&ac.state==='running'&&!document.hidden){
    const d=song.buf.duration;let t=heard()-mt0+.016+OFF;const raw=t;
    if(t>0){t%=d;const B=song.bt,K=B.length;let k=Math.floor((t-B[0])/song.P),tb;
      if(k<0){k=K-1;tb=B[k]-d}else{k=Math.min(k,K-1);tb=B[k]}
      v=song.amp[k]*Math.exp(-(t-tb)/.15);
      const ph=Math.min(1,Math.max(0,(t-tb)/song.P)),r=Math.floor(raw/d)*K+k+(1-Math.pow(1-Math.min(1,ph*2.2),3));
      if(prevR!==null){const dl=r-prevR;if(dl>0&&dl<6)bsAcc+=dl}prevR=r;bph=ph;bs=bsAcc;
      if(k!==lk){lk=k;if(song.amp[k]>.85)G=Math.max(G,.3)}}}
  if(!v){lastP=0;prevR=null;bph=0}
  bb=v;if(v>.003||lb>.003){wrp.style.setProperty('--b',v.toFixed(3));bte.style.opacity=(v*.8).toFixed(3);if(!gl)blobs.style.setProperty('--b',v.toFixed(3))}lb=v})();
document.addEventListener('visibilitychange',()=>{if(!ac||!msrc)return;if(document.hidden)ac.suspend();else ac.resume()});
/* nudge sync if your speakers or Bluetooth lag: ] = glow earlier, [ = glow later (10 ms per press) */
document.addEventListener('keydown',e=>{const n=e.target.tagName;if(n==='INPUT'||n==='TEXTAREA')return;if(e.key===']'||e.key==='['){OFF+=e.key===']'?.01:-.01;try{localStorage.setItem('boff',OFF)}catch(x){}}});
