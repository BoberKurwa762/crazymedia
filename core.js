const RM=matchMedia('(prefers-reduced-motion:reduce)').matches,$=id=>document.getElementById(id);
let G=0,first=true,bb=0,bph=0,bs=0,playing=false,msrc=null,on=true;
/* analog noise tile, generated once */
{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),d=x.createImageData(128,128);
for(let i=0;i<d.data.length;i+=4){d.data[i]=d.data[i+1]=d.data[i+2]=Math.random()*255;d.data[i+3]=255}
x.putImageData(d,0,0);document.documentElement.style.setProperty('--noise','url('+c.toDataURL()+')')}
/* routing */
const pages=[...document.querySelectorAll('.page')],links=[...document.querySelectorAll('nav a')];
const T={submit:'Submit a song',tracks:'Reference tracks',sent:'Submission received'};
function route(){const h=location.hash.slice(1),id=pages.some(p=>p.id==='pg-'+h)?h:'home';
  pages.forEach(p=>p.classList.toggle('on',p.id==='pg-'+id));
  links.forEach(a=>a.dataset.p===id?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  scrollTo(0,0);document.title=(id==='home'?'':T[id]+' | ')+'CRAZY MEDIA';
  if(!first){glitch();const h=document.querySelector('#pg-'+id+' h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}}first=false}
addEventListener('hashchange',route);
/* form */
const MSG={'Producer Name':'Add your producer name.',email:'Enter an email we can reply to, like you@email.com.','Song Link':'Paste the full link to your song, starting with https://'},seen={};
function fixUrl(f){const u=f.elements['Song Link'],v=u.value.trim();u.value=v&&!/^[a-z][a-z0-9+.-]*:/i.test(v)?'https://'+v:v}
function show(f,k){const el=f.elements[k],ok=k==='Producer Name'?el.value.trim()!=='':el.checkValidity(),w=el.closest('.fld');
  w.classList.toggle('bad',!ok);w.classList.toggle('good',ok);w.querySelector('.err').textContent=ok?'':MSG[k];el.setAttribute('aria-invalid',!ok);return ok}
function validate(f){fixUrl(f);let bad=null;for(const k in MSG){seen[k]=1;if(!show(f,k)&&!bad)bad=f.elements[k]}if(bad){bad.focus();glitch();return false}return true}
{const f=$('f');for(const k in MSG){const el=f.elements[k];
  el.addEventListener('blur',()=>{if(k==='Song Link')fixUrl(f);if(el.value||seen[k]){seen[k]=1;show(f,k)}});
  el.addEventListener('input',()=>{if(seen[k])show(f,k)})}}
addEventListener('pageshow',e=>{if(e.persisted){const b=$('sb');b.disabled=false;b.textContent='Send submission'}});
$('skip').addEventListener('click',()=>$('main').focus());
$('f').addEventListener('submit',e=>{const f=e.target;if(!validate(f)){e.preventDefault();return}const n=f.elements['Producer Name'].value.trim();
  f.elements['_autoresponse'].value='Hello, '+n+'. We have received your submission. Please wait 2-3 days for a response. Thank you for submitting to CRAZY MEDIA.';
  f.elements['_subject'].value='New CRAZY MEDIA submission from '+n;
  f.elements['_next'].value=location.href.split('#')[0]+'#sent';
  const b=$('sb');b.disabled=true;b.textContent='Sending...'});
/* drips */
for(let i=0;i<10;i++){const d=document.createElement('i');d.style.cssText=`left:${4+i*10+Math.random()*6}%;--h:${40+Math.random()*140|0}px;--w:${5+Math.random()*6|0}px;animation-delay:${Math.random()*8}s;animation-duration:${8+Math.random()*6}s`;$('dr').appendChild(d)}
/* OSD + one shared glitch scheduler (drives DOM tear + shader burst) */
const md=$('mode'),W=['BEHIND YOU','DON’T LOOK AWAY','WE SEE YOU'],t0=Date.now(),pad=n=>String(n).padStart(2,'0');
function glitch(){if(RM||document.hidden)return;G=1;document.body.classList.add('tear');$('trk').textContent='LOST';
  md.textContent=Math.random()<.3?W[Math.random()*W.length|0]:'TRACKING';
  setTimeout(()=>{document.body.classList.remove('tear');md.innerHTML='&#9654; PLAY';$('trk').textContent='AUTO'},240)}
if(!RM)(function s(){setTimeout(()=>{glitch();s()},4500+Math.random()*8000)})();
setInterval(()=>{if(document.hidden)return;const s=(Date.now()-t0)/1000|0;$('tc').textContent=pad(s/3600|0)+':'+pad(s/60%60|0)+':'+pad(s%60)},1000);
$('dt').textContent=new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});
/* marquee + form signal meter */
$('tk').innerHTML='<span>Now accepting submissions &#9642; Send us your heat &#9642; 2–3 day response &#9642; </span>'.repeat(10);
{const sg=[...document.querySelectorAll('.sig i')],f=$('f'),ks=['Producer Name','email','Song Link'];
f.addEventListener('input',()=>{const n=ks.filter(k=>f.elements[k].value&&f.elements[k].checkValidity()).length;sg.forEach((b,i)=>b.classList.toggle('on',i<n));$('sgl').textContent=['no signal','weak','good','locked in'][n]})}
