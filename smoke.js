/* ---- abstract animated background: WebGL domain-warped smoke, runs forever ---- */
const VS='attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;uniform vec2 uRes,uM;uniform vec4 uP;uniform float uT,uH,uG,uA,uV,uB,uS,uPh;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.)),f.x),f.y);}
vec2 warp(vec2 uv,vec2 c,float asp,float k,float amp,out float fl){
 vec2 d=(uv-c)*vec2(asp,1.);float r=length(d);fl=exp(-r*r*k)*amp;
 return(-d*1.8+vec2(-d.y,d.x)*(3.2+uV*6.)+d/(r+1e-3)*sin(r*40.-uT*7.)*.08*(.5+uV))*fl;}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
 float t=floor(uH*12.);
 vec2 uv=v;float row=floor(v.y*140.);
 uv.x+=(h(vec2(row,t))-.5)*.004;
 float band=smoothstep(.07,0.,abs(v.y-fract(1.-uH*.06)));
 uv.x+=band*(h(vec2(row,t+7.))-.5)*.07;
 float st=floor(v.y*12.);float gs=step(.7,h(vec2(st,t)))*uG;
 uv.x+=gs*(h(vec2(st,t+3.))-.5)*.3;
  float mm=exp(-pow(length((uv-uP.xy)*vec2(uRes.x/uRes.y,1.)),2.)*10.)*uA*uV;uv.x+=(h(vec2(row,t+11.))-.5)*.14*mm;
 vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.)*2.2+uM*6.;
  float asp=uRes.x/uRes.y,f1,f2;
  p+=(warp(uv,uP.xy,asp,9.,uA,f1)+warp(uv,uP.zw,asp,3.5,uA*.8,f2))*6.;
  float fa=min(1.,f1+f2*.6);
  vec2 cd=(uv-.5)*vec2(asp,1.);float cr=length(cd);
  float sw=smoothstep(.13,0.,abs(cr-uPh*1.1))*uB;
  p*=1.-.17*uB;p+=cd/(cr+1e-3)*sw*.55;
  float an=uB*.07;p=mat2(cos(an),-sin(an),sin(an),cos(an))*p;
 float T=uT*.06+uS*.3;
 vec2 q=vec2(fbm(p+T),fbm(p+vec2(5.2,1.3)-T));
 vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+T*1.3),fbm(p+3.*q+vec2(8.3,2.8)-T));
 float f=fbm(p+3.*r),fr=fbm(p+3.*r+vec2(.07+fa*.22+uB*.1,0.));
 float blood=smoothstep(.4,.85,r.x*f*2.4+fa*.35);
 vec3 c=vec3(fr,f,f)*f*1.15;
 c=mix(c,vec3(.75,.02,.05)*(.35+f),blood*.85);
 c=(c-.16)*1.6+.08;
  c+=vec3(.9,.04,.07)*fa*(.55+.6*uV)+vec3(.5)*pow(fa,3.)*.4*(.4+uV);
  float rd=length((uv-uP.xy)*vec2(asp,1.));c+=vec3(.9,.1,.12)*smoothstep(.05,0.,abs(rd-.12-uV*.08))*uA*.8;
  c*=.7+.95*fa;
  c*=1.+uB*.9;c.r+=uB*.16;c+=vec3(.9,.05,.1)*sw*1.1;
 vec2 bl=floor(v*vec2(22.,12.));float bk=step(.985-.06*uG,h(bl+floor(uH*5.)));
 c.r+=bk*.3;
 c*=.82+.18*sin(v.y*uRes.y*3.14159);
 c+=(h(v*uRes+uH)-.5)*.12;
 gl_FragColor=vec4(max(c,0.),1.);}`;
const cv=$('gl'),gw=$('gw'),hl=document.querySelector('.hero .lg');
let gl,U={},lt=0,cw=0,ch=0,sc=.4,slow=0,par=[0,0],pt=[0,0],mx=innerWidth/2,my=innerHeight/3,gx=mx,gy=my,sx=mx,sy=my,tx=mx,ty=my,amp=0,ampT=0,vb=0,sp=0;
function fail(){gl=null;document.documentElement.classList.add('nogl')}
function initGL(){
  gl=cv.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return fail();
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o};
  try{const P=gl.createProgram();gl.attachShader(P,sh(gl.VERTEX_SHADER,VS));gl.attachShader(P,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(P);gl.useProgram(P);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const a=gl.getAttribLocation(P,'p');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  ['uRes','uM','uT','uH','uG','uP','uA','uV','uB','uS','uPh'].forEach(n=>U[n]=gl.getUniformLocation(P,n))}catch(e){fail()}
}
function draw(now){
  if(!gl)return;
  const w=Math.min(innerWidth*sc,520)|0,hh=Math.max(1,Math.round(w*innerHeight/innerWidth));   // low internal resolution = soft analog look + cheap
  if(w!==cw||hh!==ch){cw=cv.width=w;ch=cv.height=hh;gl.viewport(0,0,cw,ch)}
  par[0]+=(pt[0]-par[0])*.05;par[1]+=(pt[1]-par[1])*.05;
  gl.uniform2f(U.uRes,cw,ch);gl.uniform2f(U.uM,par[0],par[1]);
  gl.uniform1f(U.uT,RM?20:now/1000);gl.uniform1f(U.uH,RM?0:(now/1000)%1000);gl.uniform1f(U.uG,RM?0:G);
  gl.uniform4f(U.uP,sx/innerWidth,1-sy/innerHeight,tx/innerWidth,1-ty/innerHeight);gl.uniform1f(U.uA,RM?0:amp);gl.uniform1f(U.uV,Math.min(1,sp*.06+vb));gl.uniform1f(U.uB,RM?0:bb);gl.uniform1f(U.uS,RM?0:bs);gl.uniform1f(U.uPh,RM?0:bph);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
function loop(now){requestAnimationFrame(loop);if(document.hidden||now-lt<(msrc&&on?14:33))return;   // ~30fps, never stops, pauses with the tab
  const dt=now-lt;G=Math.max(0,G-dt/280);lt=now;
  if(lt&&dt<400){dt>75?slow++:slow=Math.max(0,slow-1);if(slow>14){slow=0;if(sc>.22)sc*=.75;else return fail()}}   // governor: lower resolution, then CSS fallback, on slow devices
  const px=sx,py=sy;sx+=(mx-sx)*.2;sy+=(my-sy)*.2;tx+=(mx-tx)*.07;ty+=(my-ty)*.07;
  sp+=(Math.hypot(sx-px,sy-py)-sp)*.25;vb*=.93;amp+=(ampT-amp)*.08;
  draw(now);
  gx+=(mx-gx)*.12;gy+=(my-gy)*.12;
  gw.style.transform=`translate3d(${gx}px,${gy}px,0)`;
  if(hl)hl.style.transform=`perspective(900px) rotateY(${(gx/innerWidth-.5)*8}deg) rotateX(${-(gy/innerHeight-.5)*6}deg)`}
initGL();
if(RM){draw(0);addEventListener('resize',()=>draw(0))}
else{requestAnimationFrame(loop);
  addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;if(!ampT){sx=tx=mx;sy=ty=my}ampT=1;pt=[-(e.clientX/innerWidth-.5)*.03,-(e.clientY/innerHeight-.5)*.03]},{passive:true});
  addEventListener('pointerdown',e=>{mx=e.clientX;my=e.clientY;if(!ampT){sx=tx=mx;sy=ty=my}ampT=1;vb=1},{passive:true});
  addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')setTimeout(()=>{ampT=0},500)},{passive:true});
  document.documentElement.addEventListener('mouseleave',()=>{ampT=0})}
