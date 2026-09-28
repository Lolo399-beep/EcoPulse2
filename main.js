(()=>{
const root=document.getElementById("nanuk")||document,K="nanuk-v2",$=id=>root.querySelector("#"+id),lim=n=>Math.max(0,Math.min(100,n));
const ST=["hambre","energia","diversion","limpieza"],TICK=4000;
const COMIDA=[["Pescado",0,25,0,"🐟"],["Salmón",5,40,5,"🍣"],["Helado",8,25,20,"🍦"],["Frutillas",3,20,10,"🍓"],["Camarones",6,35,8,"🦐"],["Torta",10,30,30,"🍰"]];
const FAV=new Date().getDate()%COMIDA.length;
const nuevo=()=>({hambre:55,energia:80,diversion:80,limpieza:80,monedas:20,xp:0,dormido:false,muerto:false,ultimo:Date.now()});
let s;try{s={...nuevo(),...JSON.parse(localStorage.getItem(K))}}catch{s=nuevo()}
const guardar=()=>{try{localStorage.setItem(K,JSON.stringify(s))}catch{}};
const bear=$("bear"),stage=$("stage"),msg=$("msg"),mouth=$("mouth"),panel=$("panel");
let sala="cocina",parar=()=>{};
const decir=t=>msg.textContent=t;
const nivel=()=>1+Math.floor(s.xp/60);
const gana=x=>{const a=nivel();s.xp+=x;if(nivel()>a){s.monedas+=10;decir("¡Nivel "+nivel()+"! +10 monedas");anim("baila",2000);emite("✨",10,{v:260,up:120,g:120,l:1.6})}};
const prom=()=>ST.reduce((a,k)=>a+s[k],0)/4;
 
function tiempo(n){
  if(s.muerto)return;
  for(let i=0;i<n;i++){
    if(s.dormido){s.energia=lim(s.energia+4);s.hambre=lim(s.hambre-.4);s.diversion=lim(s.diversion-.3);s.limpieza=lim(s.limpieza-.2)}
    else{s.hambre=lim(s.hambre-1.2);s.energia=lim(s.energia-.8);s.diversion=lim(s.diversion-1);s.limpieza=lim(s.limpieza-.6)}
  }
  if(s.dormido&&s.hambre<10){s.dormido=false;decir("Nanuk se despertó con hambre…");pintar()}else if(s.dormido&&s.energia>=100){s.dormido=false;decir("¡Nanuk despertó con energía!");pintar()}
}
function estadoMsg(){
  if(s.muerto)return "Nanuk ya no está con nosotros…";
  if(s.dormido)return "Zzz… energía "+Math.round(s.energia)+"%";
  const p=ST.reduce((a,b)=>s[a]<s[b]?a:b);
  if(s[p]>35)return "Nanuk está contento.";
  return {hambre:"Nanuk tiene hambre.",energia:"Nanuk tiene sueño.",diversion:"Nanuk se aburre.",limpieza:"Nanuk necesita un baño."}[p];
}
function anim(c,ms=700){const L=["salto","mastica","sacude","baila","saluda","bosteza","no"];bear.classList.remove(...L);void bear.getBoundingClientRect();bear.classList.add(c);clearTimeout(anim.t);anim.t=setTimeout(()=>bear.classList.remove(c),ms)}
function burbujas(){const g=$("bubbles");for(let i=0;i<5;i++){const c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",50+Math.random()*100);c.setAttribute("cy",60+Math.random()*120);c.setAttribute("r",4+Math.random()*6);g.appendChild(c);setTimeout(()=>c.remove(),1500)}}
 
function render(){
  ST.forEach(k=>{const b=$("b-"+k);b.style.width=s[k]+"%";b.classList.toggle("bajo",s[k]<=30)});
  $("nivel").textContent="Nivel "+nivel();$("monedas").textContent=s.monedas+" 🪙";
  stage.dataset.room=sala;$("mugre").style.opacity=s.limpieza<60?(60-s.limpieza)/60:0;stage.classList.toggle("noche",s.dormido);
  bear.classList.toggle("dormido",s.dormido);bear.classList.toggle("muerto",s.muerto);
  const p=prom();
  mouth.setAttribute("d",s.muerto?"M90 120 h20":p>60?"M86 113 q14 14 28 0":p>30?"M90 118 q10 2 20 0":"M88 122 q12 -10 24 0");
  root.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.room==sala));
}
function pintar(){
  parar();
  if(s.muerto){panel.innerHTML='<button class="rosa" data-a="revivir">Revivir a Nanuk</button>';return}
  if(s.dormido){panel.innerHTML='<button class="rosa" data-a="dormir">Encender luz</button>';return}
  const B=(a,t,x="",c="")=>`<button class="${c}" data-a="${a}" data-x="${x}">${t}</button>`;
  panel.innerHTML={
    cocina:COMIDA.map((c,i)=>`<div class="food" data-i="${i}" data-e="${c[4]}"><b>${c[4]}</b>${c[0]}${i==FAV?" ⭐":""}<small>${c[1]?c[1]+" 🪙":"gratis"}</small></div>`).join("")+'<p class="info">Arrastrá la comida hasta la boca de Nanuk (o tocala).</p>',
    bano:'<div class="jabon"><b>🧼</b>Jabón<small>frotalo sobre Nanuk</small></div>'+B("banar","Ducha rápida<small>gratis</small>")+'<p class="info">Arrastrá el jabón y frotá a Nanuk hasta dejarlo limpio.</p>',
    cuarto:B("dormir","Apagar luz y dormir<small>recupera energía</small>")+B("pocion","Poción de matar","","mor"),
    juego:B("jugar","Atrapa pescados<small>−15 energía, ganás 🪙</small>"),
  }[sala];
  panel.style.gridTemplateColumns=sala=="cocina"?"repeat(3,1fr)":"";
}
 
function juego(p){
  p.innerHTML='<canvas id="cv" width="320" height="280"></canvas><p class="info">Atrapá 🐟 y esquivá 🧊. Mové con mouse, dedo o ← →</p>';
  const cv=$("cv"),c=cv.getContext("2d"),ks={};
  let x=160,pts=0,t=20,it=[],u=performance.now(),sp=0,vivo=true;
  const mv=e=>{const r=cv.getBoundingClientRect();x=(e.clientX-r.left)*320/r.width};
  cv.addEventListener("pointermove",mv);cv.addEventListener("pointerdown",mv);
  const kd=e=>{ks[e.key]=1;if(e.key.startsWith("Arrow"))e.preventDefault()},ku=e=>delete ks[e.key];
  addEventListener("keydown",kd);addEventListener("keyup",ku);
  parar=()=>{vivo=false;removeEventListener("keydown",kd);removeEventListener("keyup",ku);parar=()=>{}};
  const fin=()=>{const g=Math.max(0,pts);parar();s.monedas+=g;s.diversion=lim(s.diversion+30);s.energia=lim(s.energia-15);s.limpieza=lim(s.limpieza-5);gana(g*2);decir("Juego terminado: +"+g+" monedas");guardar();pintar();render()};
  const f=n=>{
    if(!vivo)return;
    const dt=Math.min((n-u)/1000,.05);u=n;t-=dt;sp-=dt;
    if(ks.ArrowLeft)x-=260*dt;if(ks.ArrowRight)x+=260*dt;x=Math.max(30,Math.min(290,x));
    if(sp<=0){sp=.45;it.push({x:20+Math.random()*280,y:-10,m:Math.random()<.25})}
    c.fillStyle="#cfeaf5";c.fillRect(0,0,320,280);
    c.textAlign="center";c.font="44px serif";c.fillText("🐻‍❄️",x,276);
    it=it.filter(o=>{o.y+=(110+(20-t)*4)*dt;
      if(Math.abs(o.x-x)<32&&o.y>235&&o.y<280){pts+=o.m?-1:1;return false}
      c.font="26px serif";c.fillText(o.m?"🧊":"🐟",o.x,o.y);return o.y<300});
    c.font="600 16px Fredoka,sans-serif";c.fillStyle="#0d2a40";c.textAlign="left";c.fillText("🐟 "+pts+"   ⏱ "+Math.ceil(t),8,22);
    t>0?requestAnimationFrame(f):fin();
  };
  requestAnimationFrame(f);
}
 
let sure=0;
const A={
  comer(i){const[n,p,h,d,e]=COMIDA[i];
    if(s.hambre>=95){anim("no",1000);return decir("Nanuk está lleno. Esperá a que le baje el hambre.")}
    if(s.monedas<p)return decir("Te faltan monedas.");
    s.monedas-=p;const fav=i==FAV;
    s.hambre=lim(s.hambre+h*(fav?1.5:1));s.diversion=lim(s.diversion+d+(fav?10:0));s.limpieza=lim(s.limpieza-4);
    anim("mastica",1500);emite(e,5,{y:.55,up:50,g:200,v:160,l:.9});
    setTimeout(()=>{emite("❤️",fav?6:3,{y:.2,up:70,g:-30,l:1.5});if(s.hambre>90){emite("💨",2,{x:.65,y:.55,up:10,g:-10,v:50,l:1});decir("¡Buuurp!")}},1500);
    gana(fav?6:3);decir(fav?"¡Es su comida favorita! ⭐":"Ñam ñam, ¡"+n.toLowerCase()+"!")},
  banar(){s.limpieza=100;s.diversion=lim(s.diversion+5);anim("sacude");burbujas();emite("🫧",8,{v:200,up:60,g:-60,l:1.6});gana(3);decir("Nanuk quedó blanquito.")},
  dormir(){if(!s.dormido&&s.energia>=95)return decir("Nanuk no tiene sueño todavía.");s.dormido=!s.dormido;if(!s.dormido)gana(4);decir(s.dormido?"Luz apagada. Buenas noches, Nanuk…":"¡Buen día, Nanuk!");pintar()},
  pocion(){if(!sure){sure=1;setTimeout(()=>sure=0,3000);return decir("¿Seguro? Tocá la poción otra vez para confirmar.")}sure=0;s.muerto=true;s.dormido=false;burbujas();decir("Nanuk se fue al cielo polar…");pintar()},
  revivir(){s.muerto=false;ST.forEach(k=>s[k]=50);anim("salto");decir("¡Nanuk volvió!");pintar()},
  jugar(){if(s.energia<15)return decir("Nanuk está muy cansado.");juego(panel)}
};
panel.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;A[b.dataset.a](b.dataset.x);guardar();render()});
const irA=r=>{sala=r;pintar();render()};
$("nav").addEventListener("click",e=>{const b=e.target.closest("button");if(b)irA(b.dataset.room)});
 
const mimo=()=>{
  if(s.muerto)return;
  if(s.dormido){s.dormido=false;s.diversion=lim(s.diversion-6);decir("Nanuk despertó de mal humor…");pintar()}
  else{s.diversion=lim(s.diversion+4);gana(1);anim("salto");emite("❤️",3,{y:.2,up:70,g:-30,l:1.5});decir("¡Nanuk disfruta los mimos!")}
  guardar();render();
};
bear.addEventListener("click",mimo);
bear.addEventListener("keydown",e=>{if(e.key=="Enter"||e.key==" "){e.preventDefault();mimo()}});
const salas=["cocina","bano","cuarto","juego"];
document.addEventListener("keydown",e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||(e.target.closest&&e.target.closest("input,textarea,select,[contenteditable]")))return;
  const k=e.key.toLowerCase();
  if(salas[k-1]){irA(salas[k-1]);return}
  const a={d:"dormir",p:"pocion",r:"revivir"}[k];
  if(!a||(a=="revivir")!=s.muerto||(s.dormido&&a!="dormir"))return;
  A[a]();guardar();render();
});
 
 
// ---- Partículas, mirada, comida arrastrable y vida propia ----
const fx=$("fx"),cx=fx.getContext("2d");let P=[],W=0,H=0,lt=performance.now();
const fit=()=>{W=fx.width=stage.clientWidth;H=fx.height=stage.clientHeight};
const nieve=Array.from({length:26},()=>({x:Math.random()*400,y:Math.random()*400,r:1+Math.random()*2.5,v:12+Math.random()*25}));
function emite(e,n,o={}){const b=bear.getBoundingClientRect(),r=stage.getBoundingClientRect(),x=o.X??b.left-r.left+b.width*(o.x??.5),y=o.Y??b.top-r.top+b.height*(o.y??.5);
  for(let i=0;i<n;i++)P.push({e,x,y,vx:(Math.random()-.5)*(o.v||120),vy:-(o.up??60)-Math.random()*80,g:o.g??200,t:0,l:o.l||1.2})}
function bucle(n){
  const dt=Math.min((n-lt)/1000,.05);lt=n;
  if(W!=stage.clientWidth||H!=stage.clientHeight)fit();
  cx.clearRect(0,0,W,H);cx.fillStyle="rgba(255,255,255,.85)";
  nieve.forEach(f=>{f.y+=f.v*dt;f.x+=Math.sin(f.y/30)*.3;if(f.y>H){f.y=-5;f.x=Math.random()*W}cx.beginPath();cx.arc(f.x%W,f.y,f.r,0,7);cx.fill()});
  cx.font="22px serif";cx.textAlign="center";
  P=P.filter(p=>{p.t+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;cx.globalAlpha=Math.max(0,1-p.t/p.l);cx.fillText(p.e,p.x,p.y);return p.t<p.l});
  cx.globalAlpha=1;requestAnimationFrame(bucle);
}
fit();requestAnimationFrame(bucle);
const mir=$("mirada");
addEventListener("pointermove",e=>{if(s.dormido||s.muerto)return;const b=bear.getBoundingClientRect(),dx=e.clientX-(b.left+b.width/2),dy=e.clientY-(b.top+b.height*.4),d=Math.hypot(dx,dy)||1,k=Math.min(1,d/200);mir.style.transform=`translate(${dx/d*5*k}px,${dy/d*4*k}px)`});
const sobreBoca=e=>{const b=bear.getBoundingClientRect();return Math.hypot(e.clientX-(b.left+b.width*.5),e.clientY-(b.top+b.height*.5))<b.width*.32};
panel.addEventListener("pointerdown",e=>{
  const f=e.target.closest(".food");if(!f||s.muerto||s.dormido)return;e.preventDefault();
  const i=+f.dataset.i;if(s.monedas<COMIDA[i][1])return decir("Te faltan monedas.");
  const g=document.createElement("div");g.className="drag";g.textContent=f.dataset.e;(root.body||root).appendChild(g);
  const x0=e.clientX,y0=e.clientY;let mov=false;
  const pos=ev=>{g.style.left=ev.clientX+"px";g.style.top=ev.clientY+"px";mov=mov||Math.hypot(ev.clientX-x0,ev.clientY-y0)>8;bear.classList.toggle("abre",mov&&sobreBoca(ev))};
  const up=ev=>{removeEventListener("pointermove",pos);removeEventListener("pointerup",up);removeEventListener("pointercancel",up);g.remove();bear.classList.remove("abre");
    if(!mov||sobreBoca(ev)){A.comer(i);guardar();render()}else decir("Soltala sobre la boca de Nanuk.")};
  pos(e);addEventListener("pointermove",pos);addEventListener("pointerup",up);addEventListener("pointercancel",up);
});
setInterval(()=>{if(s.dormido||s.muerto||document.hidden)return;const a=s.energia<30?"bosteza":["saluda","bosteza","salto"][Math.random()*3|0];
  anim(a,a=="bosteza"?2000:1600);if(a=="saluda")emite("👋",1,{y:.1,up:30,g:-20,v:20})},8000);
const dentro=e=>{const b=bear.getBoundingClientRect();return e.clientX>b.left&&e.clientX<b.right&&e.clientY>b.top&&e.clientY<b.bottom};
panel.addEventListener("pointerdown",e=>{
  if(!e.target.closest(".jabon")||s.muerto||s.dormido)return;e.preventDefault();
  const g=document.createElement("div");g.className="drag";g.textContent="🧼";(root.body||root).appendChild(g);
  let n=0,ok=s.limpieza>=100;
  const pos=ev=>{g.style.left=ev.clientX+"px";g.style.top=ev.clientY+"px";
    if(!dentro(ev))return;
    s.limpieza=lim(s.limpieza+1.5);s.diversion=lim(s.diversion+.15);
    if(++n%3==0){const r=stage.getBoundingClientRect();emite("🫧",1,{X:ev.clientX-r.left,Y:ev.clientY-r.top,v:60,up:30,g:-40,l:1.2})}
    if(s.limpieza>=100&&!ok){ok=true;decir("¡Nanuk quedó impecable!");gana(3);emite("✨",8,{v:200,up:100,g:80,l:1.4})}
    render()};
  const up=()=>{removeEventListener("pointermove",pos);removeEventListener("pointerup",up);removeEventListener("pointercancel",up);g.remove();guardar()};
  pos(e);addEventListener("pointermove",pos);addEventListener("pointerup",up);addEventListener("pointercancel",up);
});
setInterval(()=>{if(s.dormido&&!s.muerto&&!document.hidden)emite("💤",1,{x:.62,y:.12,up:40,g:-25,v:30,l:2.4})},1600);
addEventListener("error",e=>{if((e.filename||"").includes("main.js"))decir("Error: "+e.message)});
tiempo(Math.min(Math.floor((Date.now()-s.ultimo)/TICK),2700));
decir(estadoMsg());pintar();render();
setInterval(()=>{tiempo(1);s.ultimo=Date.now();decir(estadoMsg());guardar();render()},TICK);
})();
 