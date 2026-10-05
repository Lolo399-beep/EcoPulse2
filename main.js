(()=>{
const root=document.getElementById("Polo")||document,K="Polo-v2",$=id=>root.querySelector("#"+id),lim=n=>Math.max(0,Math.min(100,n));
const ST=["hambre","energia","diversion","limpieza"],TICK=4000;
const COMIDA=[["Pescado",0,5,0,"🐟"],["Salmón",100,20,5,"🍣"],["Helado",150,25,20,"🍦"],["Frutillas",200,30,10,"🍓"],["Camarones",250,35,8,"🦐"],["Torta",300,50,30,"🍰"]];
const ROPA={gorro:["🧢","Gorro",3],bufanda:["🧣","Bufanda",5],lentes:["🕶️","Lentes",7],
  mono:["🎀","Moño",4],auriculares:["🎧","Auriculares",6],galera:["🎩","Galera",8],
  remera:["👕","Remera",9],corona:["👑","Corona",10],capa:["🦸","Capa",12]};
const FAV=new Date().getDate()%COMIDA.length;
const nuevo=()=>({hambre:55,energia:80,diversion:80,limpieza:80,monedas:250,xp:0,org:0,pla:0,comp:0,ropa:{gorro:0,bufanda:0,lentes:0,mono:0,auriculares:0,galera:0,remera:0,corona:0,capa:0},dormido:false,muerto:false,ultimo:Date.now()});let s;try{s={...nuevo(),...JSON.parse(localStorage.getItem(K))}}catch{s=nuevo()}
const guardar=()=>{try{localStorage.setItem(K,JSON.stringify(s))}catch{}};
const bear=$("bear"),stage=$("stage"),msg=$("msg"),mouth=$("mouth"),panel=$("panel");
let sala="cocina",parar=()=>{};
const decir=t=>msg.textContent=t;
const gana=x=>{};
const prom=()=>ST.reduce((a,k)=>a+s[k],0)/4;

function tiempo(n){
  if(s.muerto)return;
  for(let i=0;i<n;i++){
    if(s.dormido){s.energia=lim(s.energia+4);s.hambre=lim(s.hambre-.4);s.diversion=lim(s.diversion-.3);s.limpieza=lim(s.limpieza-.2)}
    else{s.hambre=lim(s.hambre-1.2);s.energia=lim(s.energia-.8);s.diversion=lim(s.diversion-1);s.limpieza=lim(s.limpieza-.6)}
  }
  if(s.dormido&&s.hambre<10){s.dormido=false;decir("Polo se despertó con hambre…");pintar()}else if(s.dormido&&s.energia>=100){s.dormido=false;decir("¡Polo despertó con energía!");pintar()}
}
function estadoMsg(){
  if(s.muerto)return "Polo ya no está con nosotros…";
  if(s.dormido)return "Zzz… energía "+Math.round(s.energia)+"%";
  const p=ST.reduce((a,b)=>s[a]<s[b]?a:b);
  if(s[p]>35)return "Polo está contento.";
  return {hambre:"Polo tiene hambre.",energia:"Polo tiene sueño.",diversion:"Polo se aburre.",limpieza:"Polo necesita un baño."}[p];
}
function anim(c,ms=700){const L=["salto","mastica","sacude","baila","saluda","bosteza","no"];bear.classList.remove(...L);void bear.getBoundingClientRect();bear.classList.add(c);clearTimeout(anim.t);anim.t=setTimeout(()=>bear.classList.remove(c),ms)}
function burbujas(){const g=$("bubbles");for(let i=0;i<5;i++){const c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",50+Math.random()*100);c.setAttribute("cy",60+Math.random()*120);c.setAttribute("r",4+Math.random()*6);g.appendChild(c);setTimeout(()=>c.remove(),1500)}}

function render(){
  ST.forEach(k=>{const b=$("b-"+k);b.style.width=s[k]+"%";b.classList.toggle("bajo",s[k]<=30)});
  $("monedas").textContent=s.monedas+" ❄️";
  stage.dataset.room=sala;$("mugre").style.opacity=s.limpieza<60?(60-s.limpieza)/60:0;stage.classList.toggle("noche",s.dormido);
  bear.classList.toggle("dormido",s.dormido);bear.classList.toggle("muerto",s.muerto);

  root.classList.toggle("dormido", s.dormido);
  document.body.classList.toggle("dormido", s.dormido);

  const p=prom();
  mouth.setAttribute("d",s.muerto?"M90 120 h20":p>60?"M86 113 q14 14 28 0":p>30?"M90 118 q10 2 20 0":"M88 122 q12 -10 24 0");
  root.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.room==sala));
  Object.keys(ROPA).forEach(k=>$("r-"+k).style.display=s.ropa[k]==2?"":"none");
}
function pintar(){
  parar();
  if(s.muerto){panel.innerHTML='<button class="rosa" data-a="revivir">Revivir a Polo</button>';return}
  if(s.dormido){panel.innerHTML='<button class="rosa" data-a="dormir">Encender luz</button>';return}
  const B=(a,t,x="",c="")=>`<button class="${c}" data-a="${a}" data-x="${x}">${t}</button>`;
  panel.innerHTML={
    cocina:COMIDA.map((c,i)=>`<div class="food" data-i="${i}" data-e="${c[4]}"><b>${c[4]}</b>${c[0]}${i==FAV?" ⭐":""}<small>${c[1]?c[1]+" ❄️":"gratis"}</small></div>`).join("")+'<p class="info">Arrastrá la comida hasta la boca de Polo (o tocala).</p>',
    bano:'<div class="jabon"><b>🧼</b>Jabón<small>frotalo sobre Polo</small></div>'+B("banar","Ducha rápida<small>gratis</small>")+'<p class="info">Arrastrá el jabón y frotá a Polo hasta dejarlo limpio.</p>',
    cuarto: B("dormir", "Apagar luz y dormir<small>recupera energía</small>", "", "full"), juego: 
    B("jugarTuberias", "🚰 Tuberías<small>−15 energía, regá el huerto</small>", "", "azul") +
    B("jugarReciclaje", "♻️️ Ecorreciclaje<small>−15 energía, ganás ❄️</small>") +
    B("jugarFocos", "💡 Apaga Focos<small>−15 energía, 2 min de rapidez</small>", "", "rosa") +
    B("jugarCinta", "🏭 Cinta de Residuos<small>−15 energía, ¡clasificá antes del 🔥!</small>", "", "verde"),
    eco:`<p class="info">🍎 Orgánico <b>${s.org}</b> · 🥤 Plástico <b>${s.pla}</b> · 🌱 Compost <b>${s.comp}</b></p>`+B("compostar","🌱 Hacer compost<small>orgánico → ❄️ y ✨</small>","","verde")+Object.entries(ROPA).map(([k,[e,n,c]])=>B("ropa",e+" "+n+"<small>"+(s.ropa[k]==2?"puesto ✓":s.ropa[k]?"ponérselo":c+" 🥤")+"</small>",k)).join("")+'<p class="info">Tocá la basura que flota: 🍌 se composta y 🥤 se cambia por ropa.</p>',
  }[sala];
  panel.style.gridTemplateColumns=sala=="cocina"||sala=="eco"?"repeat(3,1fr)":"";
}

function juego(p){
  // Lista de ítems reciclables y no reciclables con emojis
  const RECICLABLES = ["🍾", "📰", "📦", "🥫", "🥤"];
  const NO_RECICLABLES = ["🍎", "🍌", "🍕", "🧻"];

  p.innerHTML = `
    <canvas id="cv" width="320" height="280"></canvas>
    <div class="info" style="font-size:0.8rem; text-align:left; line-height:1.3; margin-top:6px;">
      <p style="margin:2px 0;"><b>🟢 RECICLABLES (+1 pt):</b> 🍾 Botellas, 📰 Papel, 📦 Cartón, 🥫 Latas, 🥤 Plásticos</p>
      <p style="margin:2px 0; color:#c62828;"><b>🔴 NO RECICLABLES (-1 pt):</b> 🍎 Manzanas, 🍌 Cáscaras, 🍕 Comida, 🧻 Papel sucio</p>
      <p style="margin:2px 0; font-style:italic;">Mové el contenedor verde con el mouse, táctil o flechas ← →</p>
    </div>
  `;

  const cv = $("cv"), c = cv.getContext("2d"), ks = {};
  let x = 160, pts = 0, t = 20, it = [], u = performance.now(), sp = 0, vivo = true;

  const mv = e => {
    const r = cv.getBoundingClientRect();
    x = (e.clientX - r.left) * 320 / r.width;
  };

  cv.addEventListener("pointermove", mv);
  cv.addEventListener("pointerdown", mv);

  const kd = e => { ks[e.key] = 1; if(e.key.startsWith("Arrow")) e.preventDefault(); };
  const ku = e => delete ks[e.key];

  addEventListener("keydown", kd);
  addEventListener("keyup", ku);

  parar = () => {
    vivo = false;
    removeEventListener("keydown", kd);
    removeEventListener("keyup", ku);
    parar = () => {};
  };

  const fin = () => {
    const g = Math.max(0, pts);
    parar();
    s.monedas += g * 10;
    s.diversion = lim(s.diversion + 30);
    s.energia = lim(s.energia - 15);
    s.limpieza = lim(s.limpieza - 5);
    gana(g * 2);
    decir("¡Ecorreciclaje completado! +" + g * 10 + " monedas");
    guardar();
    pintar();
    render();
  };

  const f = n => {
    if (!vivo) return;
    const dt = Math.min((n - u) / 1000, .05);
    u = n; t -= dt; sp -= dt;

    if (ks.ArrowLeft) x -= 260 * dt;
    if (ks.ArrowRight) x += 260 * dt;
    x = Math.max(30, Math.min(290, x));

    // Generar nuevos objetos que caen del cielo
    if (sp <= 0) {
      sp = 0.45;
      const esRecic = Math.random() > 0.35; // 65% probabilidad de reciclable
      const list = esRecic ? RECICLABLES : NO_RECICLABLES;
      const emoji = list[Math.floor(Math.random() * list.length)];
      it.push({
        x: 20 + Math.random() * 280,
        y: -10,
        reciclable: esRecic,
        emoji: emoji
      });
    }

    // Fondo verde claro ecológico
    c.fillStyle = "#e8f5e9";
    c.fillRect(0, 0, 320, 280);

    // Dibujar Contenedor de Basura Verde (Reciclaje)
    c.fillStyle = "#2e7d32"; // Cuerpo del tacho verde
    c.fillRect(x - 22, 242, 44, 34);

    c.fillStyle = "#1b5e20"; // Borde/tapa del tacho
    c.fillRect(x - 26, 236, 52, 7);

    // Símbolo de reciclaje ♻️ pintado en el contenedor
    c.font = "18px serif";
    c.fillStyle = "#ffffff";
    c.textAlign = "center";
    c.fillText("♻️️", x, 265);

    // Mover y renderizar objetos cayendo
    it = it.filter(o => {
      o.y += (110 + (20 - t) * 4) * dt;

      // Colisión con la boca del contenedor
      if (Math.abs(o.x - x) < 30 && o.y > 230 && o.y < 275) {
        pts += o.reciclable ? 1 : -1;
        return false;
      }

      c.font = "26px serif";
      c.fillText(o.emoji, o.x, o.y);
      return o.y < 300;
    });

    // Marcador de Puntos y Tiempo
    c.font = "600 16px Fredoka,sans-serif";
    c.fillStyle = "#1b5e20";
    c.textAlign = "left";
    c.fillText("♻️ Puntos: " + pts + "   ⏱ " + Math.ceil(t) + "s", 8, 22);

    t > 0 ? requestAnimationFrame(f) : fin();
  };

  requestAnimationFrame(f);
}

// ---- Minijuego 2: Apaga los Focos 💡 ----
function juegoFocos(p) {
  p.innerHTML = `
    <div class="focos-container">
      <div class="focos-header">
        <span>💡 Apagados: <b id="focos-count">0</b></span>
        <span>⏱️ Tiempo: <b id="focos-timer">2:00</b></span>
      </div>
      <div class="focos-grid" id="focos-grid"></div>
    </div>
  `;

  const countEl = $("focos-count");
  const timerEl = $("focos-timer");
  const gridEl = $("focos-grid");

  let focos = Array(9).fill(false); // false = apagado, true = encendido
  let apagadosCount = 0;
  let tiempoRestante = 120; // 2 minutos (120 segundos)
  let timerInterval = null;
  let spawnTimeout = null;
  let activo = true;

  // Crear los 9 focos de la cuadrícula 3x3
  for (let i = 0; i < 9; i++) {
    const btn = document.createElement("button");
    btn.className = "foco-btn";
    btn.dataset.index = i;
    btn.innerHTML = "🔌"; // Icono de foco apagado
    btn.addEventListener("click", () => apagarFoco(i));
    gridEl.appendChild(btn);
  }

  const actualizarGrid = () => {
    const btns = gridEl.children;
    for (let i = 0; i < 9; i++) {
      if (focos[i]) {
        btns[i].classList.add("on");
        btns[i].innerHTML = "💡";
      } else {
        btns[i].classList.remove("on");
        btns[i].innerHTML = "🔌";
      }
    }
  };

  const apagarFoco = (index) => {
    if (!activo) return;
    if (focos[index]) {
      focos[index] = false;
      apagadosCount++;
      countEl.textContent = apagadosCount;
      actualizarGrid();

      // Efecto visual de chispas/estrellas al apagar
      const rect = gridEl.children[index].getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      emite("✨", 3, {
        X: rect.left + rect.width / 2 - stageRect.left,
        Y: rect.top + rect.height / 2 - stageRect.top,
        v: 90, up: 40, g: 100, l: 0.8
      });
    }
  };

  // Enciende focos aleatorios a un ritmo cada vez más rápido
  const programarSiguienteFoco = () => {
    if (!activo) return;

    // Obtener índices de focos actualmente apagados
    const apagados = [];
    for (let i = 0; i < 9; i++) {
      if (!focos[i]) apagados.push(i);
    }

    if (apagados.length > 0) {
      // Elegir un foco apagado al azar y encenderlo
      const idx = apagados[Math.floor(Math.random() * apagados.length)];
      focos[idx] = true;
      actualizarGrid();
    }

    // Aceleración Progresiva:
    // Empieza en 1100 ms por foco y acelera hasta 220 ms a medida que el tiempo llega a 0
    const velocidadMinima = 220;
    const velocidadInicial = 1100;
    const factorTiempo = tiempoRestante / 120; // Va de 1.0 a 0.0
    const delay = velocidadMinima + factorTiempo * (velocidadInicial - velocidadMinima);

    spawnTimeout = setTimeout(programarSiguienteFoco, delay);
  };

  const formatearTiempo = (s) => {
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  };

  parar = () => {
    activo = false;
    clearInterval(timerInterval);
    clearTimeout(spawnTimeout);
    parar = () => {};
  };

  const finJuego = () => {
    parar();
    const premio = apagadosCount; // 1 Copo de nieve por foco apagado
    s.monedas += premio;
    s.diversion = lim(s.diversion + 35);
    s.energia = lim(s.energia - 15);
    s.limpieza = lim(s.limpieza - 5);
    gana(premio * 2);
    decir(`¡Tiempo agotado! Apagaste ${apagadosCount} focos y ganaste ${premio} ❄️`);
    guardar();
    pintar();
    render();
  };

  // Cronómetro de 1 segundo
  timerInterval = setInterval(() => {
    if (!activo) return;
    tiempoRestante--;
    timerEl.textContent = formatearTiempo(tiempoRestante);
    if (tiempoRestante <= 0) {
      finJuego();
    }
  }, 1000);

  // Iniciar la secuencia
  programarSiguienteFoco();
}

// ---- Minijuego 3: Cinta de Residuos 🏭🔥 ----
// Los residuos viajan por la cinta hacia el incinerador. Arrastralos al contenedor correcto
// (orgánico / reciclable / vidrio) antes de que lleguen. 3 vidas, 60 segundos.
function juegoCinta(p) {
  const CW = 320, CH = 300;   // tamaño lógico del canvas
  const BY = 96;              // altura (y) de los residuos sobre la cinta
  const INC = 262;            // x donde empieza el incinerador
  const VIDAS = 3, DUR = 60;
  const FONT = "Fredoka,system-ui,sans-serif";
  const TIPOS = {
    org: { n: "Orgánico",   ic: "🍌", col: "#8d6e3f", dk: "#6d4c2a", obj: ["🍌", "🍎", "🥕"] },
    rec: { n: "Reciclable", ic: "♻️", col: "#1e88e5", dk: "#1565c0", obj: ["🧴", "🥫", "📰", "📦", "🥤"] },
    vid: { n: "Vidrio",     ic: "🍾", col: "#2e7d32", dk: "#1b5e20", obj: ["🍾", "🍷", "🥛"] }
  };
  const BINS = ["org", "rec", "vid"].map((k, i) => ({ k, x: 10 + i * 104, y: 196, w: 92, h: 88 }));

  p.innerHTML = `
    <canvas id="cv-cinta" width="${CW}" height="${CH}"></canvas>
    <div class="info" style="font-size:0.8rem; text-align:left; line-height:1.3; margin-top:6px;">
      <p style="margin:2px 0;"><b>🍌 Orgánico:</b> cáscaras y restos · <b>♻️ Reciclable:</b> plástico, latas, papel y cartón · <b>🍾 Vidrio:</b> botellas y vasos</p>
      <p style="margin:2px 0; font-style:italic;">Arrastrá cada residuo a su contenedor antes de que llegue al incinerador 🔥. Con teclado: O · R · V mandan el residuo más cercano al fuego.</p>
    </div>
  `;

  const cv = $("cv-cinta"), c = cv.getContext("2d");
  const dpr = Math.min(2, window.devicePixelRatio || 1);   // canvas nítido en pantallas retina
  cv.width = CW * dpr; cv.height = CH * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);

  let it = [], pop = [], flash = [], drag = null, aviso = null;
  let vivo = true, raf = 0, u = performance.now(), t = DUR, sp = .6, reloj = 0, belt = 0, quemado = 0;
  let pts = 0, ok = 0, vidas = VIDAS, racha = 0;

  const rr = (x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
  const lp = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * CW / r.width, y: (e.clientY - r.top) * CH / r.height }; };
  const binEn = o => BINS.find(b => o.x >= b.x - 6 && o.x <= b.x + b.w + 6 && o.y >= 150);

  const aparece = () => {
    const r = Math.random(), k = r < .3 ? "org" : r < .75 ? "rec" : "vid", l = TIPOS[k].obj;
    it.push({ x: -16, y: BY, k, e: l[Math.random() * l.length | 0] });
  };

  const clasifica = (o, b) => {
    it = it.filter(z => z !== o);
    const bx = b.x + b.w / 2;
    if (o.k === b.k) {
      ok++; racha++; pts++;
      let txt = "+1";
      if (racha % 5 === 0) { pts += 2; txt = "+3 ¡racha!"; }
      pop.push({ t: 0, x: bx, y: b.y - 6, txt, col: "#2e7d32" });
      flash.push({ t: 0, b, ok: true });
    } else {
      pts--; racha = 0;
      pop.push({ t: 0, x: bx, y: b.y - 6, txt: "−1", col: "#c62828" });
      flash.push({ t: 0, b, ok: false });
      aviso = { txt: o.e + " va en " + TIPOS[o.k].n, t: 2.2 };
    }
  };

  const quema = o => {
    vidas--; racha = 0; quemado = .35;
    pop.push({ t: 0, x: INC - 14, y: BY - 34, txt: "🔥 −❤️", col: "#e65100" });
    aviso = { txt: o.e + " se quemó · va en " + TIPOS[o.k].n, t: 2.2 };
  };

  // Arrastrar: se agarra con el puntero sobre el canvas; mover y soltar se escuchan en window
  cv.addEventListener("pointerdown", e => {
    if (!vivo || drag) return;
    const q = lp(e);
    let mejor = null, bd = 30;
    it.forEach(o => { const d = Math.hypot(o.x - q.x, o.y - q.y); if (d < bd) { bd = d; mejor = o; } });
    if (!mejor) return;
    e.preventDefault();
    drag = mejor; drag.x = q.x; drag.y = q.y;
  });
  const mueve = e => {
    if (!drag) return;
    const q = lp(e);
    drag.x = Math.max(14, Math.min(CW - 14, q.x));
    drag.y = Math.max(14, Math.min(CH - 14, q.y));
  };
  const suelta = () => {
    if (!drag) return;
    const o = drag; drag = null;
    const b = binEn(o);
    if (b) clasifica(o, b);
    else { o.y = BY; o.x = Math.min(o.x, INC - 24); }   // si no cae en un contenedor, vuelve a la cinta
  };
  // Teclado: O / R / V mandan al contenedor el residuo más cercano al incinerador
  const kd = e => {
    if (!vivo || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = { o: "org", r: "rec", v: "vid" }[e.key.toLowerCase()];
    if (!k) return;
    const o = it.filter(z => z !== drag && z.x > 0).sort((a, b) => b.x - a.x)[0];
    if (o) clasifica(o, BINS.find(b => b.k === k));
  };
  addEventListener("pointermove", mueve);
  addEventListener("pointerup", suelta);
  addEventListener("pointercancel", suelta);
  addEventListener("keydown", kd);

  parar = () => {
    vivo = false;
    cancelAnimationFrame(raf);
    removeEventListener("pointermove", mueve);
    removeEventListener("pointerup", suelta);
    removeEventListener("pointercancel", suelta);
    removeEventListener("keydown", kd);
    parar = () => {};
  };

  const fin = () => {
    const g = Math.max(0, pts), ganoCinta = vidas > 0;
    parar();
    s.monedas += g * 10;
    s.diversion = lim(s.diversion + 30);
    s.energia = lim(s.energia - 15);
    s.limpieza = lim(s.limpieza - 5);
    gana(g * 2);
    decir(ganoCinta
      ? "¡Cinta despejada! " + ok + " residuos bien clasificados, +" + g * 10 + " ❄️"
      : "¡El incinerador ganó esta vez! " + ok + " aciertos, +" + g + " ❄️");
    guardar();
    pintar();
    render();
  };

  const dibuja = () => {
    c.textBaseline = "middle";
    c.fillStyle = "#eaf3f7"; c.fillRect(0, 0, CW, CH);
    c.fillStyle = "#dbe8ee"; c.fillRect(0, 152, CW, CH - 152);

    // Cinta transportadora (las tablillas avanzan a la misma velocidad que los residuos)
    c.fillStyle = "#37474f"; c.fillRect(40, 132, 12, 20); c.fillRect(200, 132, 12, 20);
    c.fillStyle = "#455a64"; rr(-10, 108, INC + 14, 24, 8); c.fill();
    c.fillStyle = "#607d8b"; c.fillRect(0, 108, INC + 4, 4);
    c.strokeStyle = "rgba(0,0,0,.22)"; c.lineWidth = 2;
    for (let x = belt - 24; x < INC; x += 24) { c.beginPath(); c.moveTo(x, 114); c.lineTo(x, 130); c.stroke(); }
    c.fillStyle = "rgba(244,67,54,.2)"; c.fillRect(INC - 44, 112, 44, 20);   // zona de peligro

    // Residuos sobre la cinta (el que se arrastra se dibuja al final, encima de todo)
    c.font = "28px serif"; c.textAlign = "center";
    it.forEach(o => { if (o !== drag) c.fillText(o.e, o.x, o.y); });

    // Incinerador (tapa a los residuos que "entran")
    c.fillStyle = "#37474f"; rr(INC, 66, CW - INC + 8, 76, 8); c.fill();
    c.fillStyle = "#455a64"; c.fillRect(CW - 26, 44, 16, 24);
    c.fillStyle = "#1b1b1b"; rr(INC + 2, 84, 34, 48, 6); c.fill();
    c.font = (26 + Math.sin(reloj * 12) * 3).toFixed(1) + "px serif"; c.textAlign = "center";
    c.fillText("🔥", INC + 19, 110);
    for (let i = 0; i < 3; i++) {
      const k = (reloj * .8 + i / 3) % 1;
      c.fillStyle = "rgba(120,120,120," + (.5 * (1 - k)).toFixed(2) + ")";
      c.beginPath(); c.arc(302 + Math.sin(k * 6 + i) * 4, 44 - k * 14, 3 + k * 5, 0, 7); c.fill();
    }

    // Contenedores
    BINS.forEach(b => {
      const T = TIPOS[b.k], hov = drag && binEn(drag) === b, dy = hov ? -5 : 0, bx = b.x + b.w / 2;
      c.fillStyle = "rgba(0,0,0,.12)"; c.beginPath(); c.ellipse(bx, b.y + b.h + 2, b.w / 2, 5, 0, 0, 7); c.fill();
      c.fillStyle = T.col; rr(b.x, b.y + 12 + dy, b.w, b.h - 12, 10); c.fill();
      c.fillStyle = T.dk; rr(b.x - 4, b.y + dy, b.w + 8, 14, 6); c.fill();
      if (hov) { c.strokeStyle = "#fff"; c.lineWidth = 4; rr(b.x, b.y + 12 + dy, b.w, b.h - 12, 10); c.stroke(); }
      const fl = flash.find(q => q.b === b);
      if (fl) {
        c.fillStyle = (fl.ok ? "rgba(255,255,255," : "rgba(244,67,54,") + (.6 * (1 - fl.t / .4)).toFixed(2) + ")";
        rr(b.x, b.y + 12 + dy, b.w, b.h - 12, 10); c.fill();
      }
      c.textAlign = "center";
      c.font = "30px serif"; c.fillStyle = "#fff"; c.fillText(T.ic, bx, b.y + 44 + dy);
      c.font = "700 13px " + FONT; c.fillText(T.n, bx, b.y + 74 + dy);
    });

    // Aviso didáctico (a qué contenedor iba el residuo)
    if (aviso) {
      c.globalAlpha = Math.min(1, aviso.t * 2);
      c.font = "600 13px " + FONT; c.fillStyle = "#263238"; c.textAlign = "center";
      c.fillText(aviso.txt, CW / 2, 172);
      c.globalAlpha = 1;
    }

    // Residuo agarrado
    if (drag) {
      c.save();
      c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 10;
      c.font = "36px serif"; c.textAlign = "center";
      c.fillText(drag.e, drag.x, drag.y);
      c.restore();
    }

    // Textos flotantes (+1, −1, racha…)
    pop.forEach(q => {
      c.globalAlpha = Math.max(0, 1 - q.t / 1.1);
      c.font = "700 15px " + FONT; c.fillStyle = q.col; c.textAlign = "center";
      c.fillText(q.txt, q.x, q.y - q.t * 30);
    });
    c.globalAlpha = 1;

    // Ayuda inicial
    if (DUR - t < 8 && pts === 0) {
      c.font = "600 12px " + FONT; c.fillStyle = "#546e7a"; c.textAlign = "center";
      c.fillText("Arrastrá cada residuo a su contenedor ↓", 130, 64);
    }

    // Marcador
    c.font = "600 15px " + FONT; c.fillStyle = "#263238";
    c.textAlign = "left";   c.fillText("⭐ " + pts, 8, 16);
    c.textAlign = "center"; c.fillText("❤️".repeat(vidas) + "🖤".repeat(VIDAS - vidas), CW / 2, 16);
    c.textAlign = "right";  c.fillText("⏱ " + Math.max(0, Math.ceil(t)) + "s", CW - 8, 16);
    if (racha >= 2) { c.font = "600 12px " + FONT; c.textAlign = "left"; c.fillText("Racha x" + racha, 8, 36); }

    // Destello rojo cuando algo se quema
    if (quemado > 0) { c.fillStyle = "rgba(255,87,34," + (quemado * .6).toFixed(2) + ")"; c.fillRect(0, 0, CW, CH); }
  };

  const f = n => {
    if (!vivo) return;
    const dt = Math.min((n - u) / 1000, .05);
    u = n; t -= dt; sp -= dt; reloj += dt;

    // La cinta se acelera y los residuos aparecen cada vez más seguido
    const prog = Math.min(1, (DUR - t) / DUR), v = 40 + 50 * prog;
    belt = (belt + v * dt) % 24;
    if (quemado > 0) quemado -= dt;
    if (sp <= 0) { sp = 1.8 - .8 * prog; aparece(); }

    it = it.filter(o => {
      if (o === drag) return true;          // el que tenés agarrado no avanza
      o.x += v * dt;
      if (o.x > INC) { quema(o); return false; }
      return true;
    });
    pop = pop.filter(q => (q.t += dt) < 1.1);
    flash = flash.filter(q => (q.t += dt) < .4);
    if (aviso && (aviso.t -= dt) <= 0) aviso = null;

    dibuja();
    if (t <= 0 || vidas <= 0) return fin();
    raf = requestAnimationFrame(f);
  };

  raf = requestAnimationFrame(f);
}

// ---- Minijuego 4: Tuberías 🚰 ----
function juegoTuberias(p) {
  const CW = 320, CH = 280;
  p.innerHTML = `
    <canvas id="cv-tub" width="${CW}" height="${CH}"></canvas>
    <div class="info" style="font-size:0.8rem; text-align:left; line-height:1.3; margin-top:6px;">
      <p style="margin:2px 0;"><b>Objetivo:</b> Tocá las piezas para girarlas y llevar el agua limpia 🚰 al huerto 🌱.</p>
      <p style="margin:2px 0; font-style:italic;">¡Hacelo antes de que se vacíe el tanque de reserva para ganar ❄️!</p>
    </div>
  `;

  const cv = $("cv-tub"), c = cv.getContext("2d");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = CW * dpr; cv.height = CH * dpr; 
  c.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cols = 5, rows = 5, cs = 48, offX = 40, offY = 32;
  let grid = Array.from({length: rows}, () => Array(cols).fill(null));

  let cx = 0, cy = 0;
  let path = [{x: 0, y: 0}];
  while (cx < cols - 1 || cy < rows - 1) {
    if (cx === cols - 1) cy++;
    else if (cy === rows - 1) cx++;
    else if (Math.random() < 0.5) cx++;
    else cy++;
    path.push({x: cx, y: cy});
  }

  for (let i = 0; i < path.length; i++) {
    let pt = path[i];
    let prev = i > 0 ? path[i-1] : {x: -1, y: 0};
    let next = i < path.length - 1 ? path[i+1] : {x: cols, y: rows-1};
    
    let conn = [0, 0, 0, 0];
    if (prev.y < pt.y || next.y < pt.y) conn[0] = 1;
    if (prev.x > pt.x || next.x > pt.x) conn[1] = 1;
    if (prev.y > pt.y || next.y > pt.y) conn[2] = 1;
    if (prev.x < pt.x || next.x < pt.x) conn[3] = 1;

    if (Math.random() < 0.3) conn[Math.floor(Math.random()*4)] = 1;
    grid[pt.y][pt.x] = { conn, rot: Math.floor(Math.random() * 4) };
  }

  const shapes = [[1, 0, 1, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 1, 1]];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) {
        grid[y][x] = { conn: [...shapes[Math.floor(Math.random() * shapes.length)]], rot: Math.floor(Math.random() * 4) };
      }
    }
  }

  const getConn = (celda) => [
    celda.conn[(0 - celda.rot + 4) % 4],
    celda.conn[(1 - celda.rot + 4) % 4],
    celda.conn[(2 - celda.rot + 4) % 4],
    celda.conn[(3 - celda.rot + 4) % 4]
  ];

  let MAX_T = 45, t = MAX_T, vivo = true, raf, u = performance.now();
  let win = false;

  const lp = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * CW / r.width, y: (e.clientY - r.top) * CH / r.height }; };
  cv.addEventListener("pointerdown", e => {
    if (!vivo) return;
    const pt = lp(e);
    let col = Math.floor((pt.x - offX) / cs);
    let row = Math.floor((pt.y - offY) / cs);
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      grid[row][col].rot = (grid[row][col].rot + 1) % 4;
    }
  });

  parar = () => { vivo = false; cancelAnimationFrame(raf); parar = () => {}; };

  const fin = (gano) => {
    parar();
    let pts = 0;
    if (gano) pts = t > (MAX_T / 2) ? 200 : 100;
    
    if (pts > 0) s.monedas += pts;
    s.diversion = (typeof lim === 'function') ? lim(s.diversion + 30) : Math.min(100, s.diversion + 30);
    s.energia = (typeof lim === 'function') ? lim(s.energia - 15) : Math.max(0, s.energia - 15);
    s.limpieza = (typeof lim === 'function') ? lim(s.limpieza - 5) : Math.max(0, s.limpieza - 5);
    
    if (typeof gana === 'function') gana(pts > 0 ? pts * 2 : 0);
    
    decir(gano ? "¡Agua conectada! Sobró reserva y ganaste " + pts + " ❄️" : "¡Se vació el tanque! El huerto no se regó.");
    guardar(); pintar(); render();
  };

  const dibuja = () => {
    c.fillStyle = "#e0f2f1"; c.fillRect(0, 0, CW, CH);

    const px = Math.max(0, t / MAX_T);
    c.fillStyle = "#b0bec5"; c.beginPath(); 
    if (c.roundRect) c.roundRect(10, 10, 300, 14, 7); else c.rect(10, 10, 300, 14); 
    c.fill();
    
    c.fillStyle = px < 0.25 ? "#f44336" : "#0288d1"; 
    c.beginPath(); 
    if (c.roundRect) c.roundRect(11, 11, 298 * px, 12, 6); else c.rect(11, 11, 298 * px, 12); 
    c.fill();
    
    c.font = "600 11px Fredoka,sans-serif"; c.fillStyle = "#fff"; c.textAlign="center"; c.fillText("TANQUE DE RESERVA", CW/2, 21);

    c.font = "26px serif"; c.textAlign="center"; c.textBaseline="middle";
    c.fillText("🚰", offX - 20, offY + cs/2);
    c.fillText("🌱", offX + cols*cs + 20, offY + (rows-1)*cs + cs/2);

    let water = Array.from({length: rows}, () => Array(cols).fill(false));
    win = false;
    let q = [];
    
    if (getConn(grid[0][0])[3]) { q.push({x:0, y:0}); water[0][0] = true; }

    let dx = [0, 1, 0, -1], dy = [-1, 0, 1, 0];
    while(q.length > 0) {
      let curr = q.shift();
      let conn = getConn(grid[curr.y][curr.x]);
      
      for (let d = 0; d < 4; d++) {
        if (conn[d]) {
          if (curr.x === cols-1 && curr.y === rows-1 && d === 1) win = true;
          
          let nx = curr.x + dx[d], ny = curr.y + dy[d];
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !water[ny][nx]) {
            if (getConn(grid[ny][nx])[(d + 2) % 4]) {
              water[ny][nx] = true;
              q.push({x: nx, y: ny});
            }
          }
        }
      }
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let cell = grid[y][x], isWater = water[y][x];
        c.save();
        c.translate(offX + x * cs + cs/2, offY + y * cs + cs/2);

        c.fillStyle = "rgba(0,0,0,0.04)";
        c.fillRect(-cs/2 + 2, -cs/2 + 2, cs - 4, cs - 4);

        c.rotate(cell.rot * Math.PI / 2);

        c.lineWidth = 14; c.lineCap = 'square'; c.strokeStyle = "#455a64";
        c.beginPath();
        if (cell.conn[0]) { c.moveTo(0,0); c.lineTo(0, -cs/2); }
        if (cell.conn[1]) { c.moveTo(0,0); c.lineTo(cs/2, 0); }
        if (cell.conn[2]) { c.moveTo(0,0); c.lineTo(0, cs/2); }
        if (cell.conn[3]) { c.moveTo(0,0); c.lineTo(-cs/2, 0); }
        c.stroke();

        c.lineWidth = 10; c.strokeStyle = "#b0bec5"; c.stroke();

        if (isWater) {
          c.lineWidth = 6; c.strokeStyle = "#03a9f4"; c.stroke();
          c.fillStyle = "#03a9f4";
        } else {
          c.fillStyle = "#b0bec5";
        }
        
        c.beginPath(); c.arc(0, 0, isWater ? 4 : 5, 0, 7); c.fill();
        c.restore();
      }
    }
  };

  const f = n => {
    if (!vivo) return;
    const dt = (n - u) / 1000; u = n;
    t -= dt;
    dibuja();
    
    if (win) {
      setTimeout(() => fin(true), 500);
      vivo = false;
    } else if (t <= 0) {
      fin(false);
    } else {
      raf = requestAnimationFrame(f);
    }
  };
  
  raf = requestAnimationFrame(f);
}

let sure=0;
const SLOT={gorro:"cabeza",corona:"cabeza",galera:"cabeza"};
const sacaMismoSlot=k=>{if(!SLOT[k])return;Object.keys(SLOT).forEach(o=>{if(o!=k&&SLOT[o]==SLOT[k]&&s.ropa[o]==2)s.ropa[o]=1})};
const A={
  comer(i){const[n,p,h,d,e]=COMIDA[i];
    if(s.hambre>=95){anim("no",1000);return decir("Polo está lleno. Esperá a que le baje el hambre.")}
    if(s.monedas<p)return decir("Te faltan monedas.");
    s.monedas-=p;const fav=i==FAV;
    s.hambre=lim(s.hambre+h*(fav?1.5:1));s.diversion=lim(s.diversion+d+(fav?10:0));s.limpieza=lim(s.limpieza-4);
    anim("mastica",1500);emite(e,5,{y:.55,up:50,g:200,v:160,l:.9});
    setTimeout(()=>{emite("❤️",fav?6:3,{y:.2,up:70,g:-30,l:1.5});if(s.hambre>90){emite("💨",2,{x:.65,y:.55,up:10,g:-10,v:50,l:1});decir("¡Buuurp!")}},1500);
    gana(fav?6:3);decir(fav?"¡Es su comida favorita! ⭐":"Ñam ñam, ¡"+n.toLowerCase()+"!")},
  banar(){s.limpieza=100;s.diversion=lim(s.diversion+5);anim("sacude");burbujas();emite("🫧",8,{v:200,up:60,g:-60,l:1.6});gana(3);decir("Polo quedó blanquito.")},
  dormir(){if(!s.dormido&&s.energia>=95)return decir("Polo no tiene sueño todavía.");s.dormido=!s.dormido;if(!s.dormido)gana(4);decir(s.dormido?"Luz apagada. Buenas noches, Polo…":"¡Buen día, Polo!");pintar()},
  revivir(){s.muerto=false;ST.forEach(k=>s[k]=50);anim("salto");decir("¡Polo volvió!");pintar()},
  jugarReciclaje(){if(s.energia<15)return decir("Polo está muy cansado.");if(s.monedas<100)return decir("Te faltan monedas.");s.monedas-=100;juego(panel)},
  jugarFocos(){if(s.energia<15)return decir("Polo está muy cansado.");if(s.monedas<100)return decir("Te faltan monedas.");s.monedas-=100;juegoFocos(panel)},
  jugarCinta(){if(s.energia<15)return decir("Polo está muy cansado.");if(s.monedas<100)return decir("Te faltan monedas.");s.monedas-=100;juegoCinta(panel)},
  jugarTuberias(){if(s.energia<15)return decir("Polo está muy cansado.");if(s.monedas<100)return decir("Te faltan monedas.");s.monedas-=100;juegoTuberias(panel)},
  compostar(){const n=s.org;if(!n)return decir("No tenés restos orgánicos. Juntá 🍌🍎🥕 del agua.");s.org=0;s.comp+=n;s.monedas+=n*2;emite("🌱",Math.min(n*2,10),{y:.3,up:80,g:80,v:200,l:1.4});decir("¡Compost listo con "+n+" resto"+(n>1?"s":"")+"! +"+n*2+" ❄️");gana(n*2);pintar()},
ropa(k){const[e,n,c]=ROPA[k],r=s.ropa;if(!r[k]){if(s.pla<c)return decir("Te faltan plásticos: "+n+" cuesta "+c+" 🥤.");s.pla-=c;r[k]=2;emite(e,6,{y:.3,up:90,g:60,l:1.4});anim("baila",1500);decir("¡Plástico → ropa nueva: "+n+"!");gana(5)}else{r[k]=3-r[k];decir("Polo se "+(r[k]==2?"puso":"sacó")+": "+n)}if(r[k]==2)sacaMismoSlot(k);pintar()}};
panel.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||!A[b.dataset.a])return;A[b.dataset.a](b.dataset.x);guardar();render()});
const irA=r=>{sala=r;pintar();render()};
$("nav").addEventListener("click",e=>{const b=e.target.closest("button");if(b)irA(b.dataset.room)});

const mimo=()=>{
  if(s.muerto)return;
  if(s.dormido){s.dormido=false;s.diversion=lim(s.diversion-6);decir("Polo despertó de mal humor…");pintar()}
  else{s.diversion=lim(s.diversion+4);gana(1);anim("salto");emite("❤️",3,{y:.2,up:70,g:-30,l:1.5});decir("¡Polo disfruta los mimos!")}
  guardar();render();
};
bear.addEventListener("click",mimo);
bear.addEventListener("keydown",e=>{if(e.key=="Enter"||e.key==" "){e.preventDefault();mimo()}});
const salas=["cocina","bano","cuarto","juego","eco"];
document.addEventListener("keydown",e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||(e.target.closest&&e.target.closest("input,textarea,select,[contenteditable]")))return;
  const k=e.key.toLowerCase();
  if(salas[k-1]){irA(salas[k-1]);return}
  const a={d:"dormir"}[k];
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
    if(!mov||sobreBoca(ev)){A.comer(i);guardar();render()}else decir("Soltala sobre la boca de Polo.")};
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
    if(s.limpieza>=100&&!ok){ok=true;decir("¡Polo quedó impecable!");gana(3);emite("✨",8,{v:200,up:100,g:80,l:1.4})}
    render()};
  const up=()=>{removeEventListener("pointermove",pos);removeEventListener("pointerup",up);removeEventListener("pointercancel",up);g.remove();guardar()};
  pos(e);addEventListener("pointermove",pos);addEventListener("pointerup",up);addEventListener("pointercancel",up);
});
setInterval(()=>{if(s.dormido&&!s.muerto&&!document.hidden)emite("💤",1,{x:.62,y:.12,up:40,g:-25,v:30,l:2.4})},1600);
// ---- Basura flotante: orgánico → compost, plástico → ropa ----
const BAS=[["o","🍌"],["o","🍎"],["o","🥕"],["o","🥬"],["o","🍊"],["p","🥤"],["p","🧴"],["p","🛍️"]],G=$("basura");
function basura(){
  if(s.dormido||s.muerto||document.hidden||G.childElementCount>=4)return;
  const b=bear.getBoundingClientRect(),r=stage.getBoundingClientRect(),k=b.width/200;if(!k)return;
  const xa=(r.left-b.left)/k+16,xb=(r.right-b.left)/k-16,ym=(msg.getBoundingClientRect().top-b.top)/k-14,
    x=Math.random()<.5?xa+Math.random()*(-16-xa):216+Math.random()*(xb-216),y=216+Math.random()*Math.max(0,ym-216),
    [t,e]=BAS[Math.random()*BAS.length|0],org=t=="o",n=document.createElementNS("http://www.w3.org/2000/svg","g"),
    tx=org?"Orgánico: se composta":"Plástico: se cambia por ropa";
  n.setAttribute("class","bas");n.setAttribute("role","button");n.setAttribute("tabindex","0");n.setAttribute("aria-label",tx);
  n.innerHTML=`<title>${tx}</title><circle cx="${x}" cy="${y}" r="20" fill="#fff" fill-opacity=".001"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="26">${e}</text>`;
  const c=ev=>{ev.stopPropagation();if(!n.parentNode)return;
    const q=n.getBoundingClientRect(),rr=stage.getBoundingClientRect();n.remove();
    org?s.org++:s.pla++;
    emite(org?"🌱":"✨",4,{X:q.left+q.width/2-rr.left,Y:q.top+q.height/2-rr.top,v:100,up:50,g:60,l:1});
    decir(org?e+" ¡Al compost! Orgánico: "+s.org:e+" ¡Plástico! Ya tenés "+s.pla+" para cambiar por ropa");gana(1);guardar();render();if(sala=="eco")pintar()};
  n.onclick=c;n.onkeydown=ev=>{if(ev.key=="Enter"||ev.key==" "){ev.preventDefault();c(ev)}};
  G.appendChild(n)}
setTimeout(basura,2500);setInterval(basura,9000);
addEventListener("error",e=>{if((e.filename||"").includes("main.js"))decir("Error: "+e.message)});
tiempo(Math.min(Math.floor((Date.now()-s.ultimo)/TICK),2700));
decir(estadoMsg());pintar();render();
setInterval(()=>{tiempo(1);s.ultimo=Date.now();decir(estadoMsg());guardar();render()},TICK);
})();