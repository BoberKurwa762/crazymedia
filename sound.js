/* ---- sound: pre-rendered buffers, unlocked on first gesture, one voice at a time ---- */
let ac,mix,B={},ready=false,voice=null,lastT=0,lastEl=null;
try{on=localStorage.getItem('snd')!=='off'}catch(e){}
const sb=$('snd'),lab=()=>{sb.textContent='Sound: '+(on?'on':'off');sb.setAttribute('aria-pressed',on);$('hint').style.visibility=(on&&(!ready||playing))?'visible':'hidden'};
function mk(d,f){const n=ac.sampleRate*d|0,b=ac.createBuffer(1,n,ac.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=f(i/ac.sampleRate,i/n);return b}
function unlock(){if(ready)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  try{ac=new C();mix=ac.createGain();mix.gain.value=.9;const k=ac.createDynamicsCompressor();mix.connect(k);k.connect(ac.destination);
    const r=()=>Math.random()*2-1,T=2*Math.PI;
    B.h=mk(.16,(t,p)=>(Math.sin(T*(900*t-2300*t*t))*.55+r()*(t<.03?.5:.06))*Math.pow(1-p,3));   // tape blip
    B.c=mk(.32,(t,p)=>(Math.sin(T*(170*t-450*t*t))*.95+r()*(t<.05?.55:0))*Math.pow(1-p,2));     // heavy thud
    ready=true;ac.resume();lab();startMusic()}catch(e){ac=null}}
function play(k,v,again){if(!on||!ac)return;
  if(ac.state!=='running'){if(!again)ac.resume().then(()=>play(k,v,1)).catch(()=>{});return}
  try{voice&&voice.stop()}catch(e){}                               // never stack: new sound replaces the old
  const s=ac.createBufferSource(),g=ac.createGain();s.buffer=B[k];g.gain.value=v;s.connect(g);g.connect(mix);s.start();voice=s;s.onended=()=>{if(voice===s)voice=null}}
const btn=e=>e.target.closest&&e.target.closest('.btn,header>a');
document.addEventListener('pointerover',e=>{const b=btn(e);if(!b||e.pointerType!=='mouse'||b.contains(e.relatedTarget))return;
  const n=performance.now();if(n-lastT<110||(b===lastEl&&n-lastT<450))return;lastT=n;lastEl=b;play('h',.55)},{passive:true});
document.addEventListener('pointerdown',e=>{unlock();const b=btn(e);if(b&&b.id!=='snd')play('c',.9)},{passive:true});
document.addEventListener('keydown',e=>{unlock();if(!e.repeat&&(e.key==='Enter'||e.key===' ')&&btn(e)&&e.target.id!=='snd')play('c',.9)});
sb.addEventListener('click',()=>{on=!on;try{localStorage.setItem('snd',on?'on':'off')}catch(e){}lab();musicSet();if(on)play('c',.9)});
if(matchMedia('(pointer:coarse)').matches)$('hint').innerHTML='&#9654; Tap anywhere for sound';
