/* EcoPulse extras: menú hamburguesa + mapa de tapitas + integrantes.
   No modifica main.js: el juego sigue funcionando igual. */
(() => {
const $ = s => document.querySelector(s);
const vistas = { juego: $('#Polo'), mapa: $('#vista-mapa'), integrantes: $('#vista-integrantes') };
const titulos = { juego: '🐻‍❄️ EcoPulse', mapa: '🗺️ Mapa de tapitas', integrantes: '👥 Integrantes' };
const btn = $('#menu-btn'), drawer = $('#menu-drawer'), overlay = $('#menu-overlay');
const links = [...drawer.querySelectorAll('a[data-vista]')];
let actual = 'juego';

/* ---------- Menú ---------- */
function menu(abrir) {
  drawer.classList.toggle('open', abrir);
  overlay.classList.toggle('open', abrir);
  btn.setAttribute('aria-expanded', abrir);
  btn.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
}
btn.addEventListener('click', () => menu(!drawer.classList.contains('open')));
overlay.addEventListener('click', () => menu(false));

function mostrar(nombre) {
  if (!vistas[nombre]) nombre = 'juego';
  actual = nombre;
  Object.entries(vistas).forEach(([k, el]) => el.hidden = k !== nombre);
  links.forEach(a => a.classList.toggle('on', a.dataset.vista === nombre));
  $('#ep-titulo').textContent = titulos[nombre];
  menu(false);
  if (nombre === 'mapa') iniciarMapa();
  window.scrollTo(0, 0);
  if (location.hash !== '#' + nombre) history.replaceState(null, '', '#' + nombre);
}
links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); mostrar(a.dataset.vista); }));
addEventListener('hashchange', () => mostrar(location.hash.slice(1)));

/* Esc cierra el menú. Fuera del juego, se bloquean las teclas del juego (1-5, D). */
addEventListener('keydown', e => {
  if (e.key === 'Escape' && drawer.classList.contains('open')) { menu(false); btn.focus(); return; }
  if (actual !== 'juego') e.stopImmediatePropagation();
}, true);

/* ---------- Mapa de tapitas ---------- */
const KEY = 'EcoPulse-tapitas';
let puntos = [];
try { puntos = JSON.parse(localStorage.getItem(KEY)) || []; } catch { puntos = []; }
const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(puntos)); } catch {} };

/* Si existe el servidor (server.js), los puntos se comparten con todos.
   Si no (hosting estático), se usa localStorage como antes. */
let enServidor = false;
async function cargarServidor() {
  try {
    const r = await fetch('api/puntos', { cache: 'no-store' });
    if (!r.ok) throw new Error();
    const datos = await r.json();
    if (!Array.isArray(datos)) throw new Error();
    puntos = datos; enServidor = true;
  } catch { enServidor = false; }
}

let mapa = null, listo = false, sel = null, selMarker = null;
const marcadores = new Map();
const f5 = n => Number(n).toFixed(5);

function iniciarMapa() {
  if (listo) { setTimeout(() => mapa.invalidateSize(), 50); return; }
  if (typeof L === 'undefined') { $('#mapa-error').hidden = false; return; }
  listo = true;
  const lim = L.latLngBounds([-56, -75], [-21, -52]);           // Argentina (aprox.)
  mapa = L.map('mapa', { minZoom: 3, maxBounds: lim.pad(0.4), maxBoundsViscosity: 0.8 }).setView([-38.4, -63.6], 4);
  L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}', {
    maxZoom: 19, attribution: 'Datos del mapa &copy; Google'
  }).addTo(mapa);
  mapa.on('click', e => seleccionar(e.latlng));
  setTimeout(() => mapa.invalidateSize(), 50);
  cargarServidor().then(() => { puntos.forEach(dibujar); listar(); });
}

function seleccionar(ll) {
  sel = { lat: ll.lat, lng: ll.lng };
  if (selMarker) selMarker.setLatLng(ll);
  else selMarker = L.circleMarker(ll, { radius: 9, color: '#ff7a8a', weight: 3, fillColor: '#fff', fillOpacity: .9 }).addTo(mapa);
  $('#coords-sel').textContent = `📍 Punto elegido: ${f5(ll.lat)}, ${f5(ll.lng)}`;
}

function dibujar(p) {
  const icono = L.divIcon({ html: '<span class="pin">♻️</span>', className: '', iconSize: [30, 30], iconAnchor: [15, 15] });
  const pop = document.createElement('div');
  const b = document.createElement('b'); b.textContent = p.lugar || 'Sin nombre';
  const d = document.createElement('div'); d.textContent = `${p.cantidad} tapita(s)`;
  const c = document.createElement('small'); c.textContent = `${f5(p.lat)}, ${f5(p.lng)}`;
  pop.append(b, d, c);
  marcadores.set(p.id, L.marker([p.lat, p.lng], { icon: icono }).bindPopup(pop).addTo(mapa));
}

function listar() {
  const ul = $('#lista-puntos');
  ul.textContent = '';
  puntos.forEach(p => {
    const li = document.createElement('li');
    const info = document.createElement('div'); info.className = 'info';
    const t = document.createElement('b'); t.textContent = p.lugar || 'Sin nombre';
    const s = document.createElement('small'); s.textContent = `${f5(p.lat)}, ${f5(p.lng)} · ${p.cantidad} tapita(s)`;
    info.append(t, s);
    info.addEventListener('click', () => { if (mapa) { mapa.flyTo([p.lat, p.lng], 12); marcadores.get(p.id)?.openPopup(); window.scrollTo(0, 0); } });
    const del = document.createElement('button'); del.type = 'button'; del.textContent = '🗑️'; del.setAttribute('aria-label', 'Eliminar punto');
    del.addEventListener('click', async () => {
      if (enServidor) {
        try { const r = await fetch('api/puntos/' + encodeURIComponent(p.id), { method: 'DELETE' }); if (!r.ok && r.status !== 404) throw new Error(); }
        catch { alert('No se pudo eliminar el punto. Probá de nuevo.'); return; }
      }
      puntos = puntos.filter(x => x.id !== p.id);
      marcadores.get(p.id)?.remove(); marcadores.delete(p.id);
      if (!enServidor) guardar();
      listar();
    });
    li.append(info, del); ul.append(li);
  });
  $('#lista-vacia').hidden = puntos.length > 0;
  $('#r-puntos').textContent = `${puntos.length} punto${puntos.length === 1 ? '' : 's'}`;
  $('#r-tapitas').textContent = `${puntos.reduce((a, p) => a + p.cantidad, 0)} tapitas`;
}

$('#form-punto').addEventListener('submit', async e => {
  e.preventDefault();
  if (!sel) { $('#coords-sel').textContent = '⚠️ Primero tocá un lugar en el mapa.'; return; }
  let p = {
    id: Date.now(), lat: sel.lat, lng: sel.lng,
    lugar: $('#p-lugar').value.trim(),
    cantidad: Math.max(1, parseInt($('#p-cant').value, 10) || 1),
    fecha: new Date().toISOString()
  };
  if (enServidor) {
    try {
      const r = await fetch('api/puntos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
      if (!r.ok) throw new Error((await r.json()).error || 'Error');
      p = await r.json();
    } catch (err) { $('#coords-sel').textContent = '⚠️ No se pudo registrar: ' + err.message; return; }
  }
  puntos.push(p); if (!enServidor) guardar(); dibujar(p); listar();
  if (selMarker) { selMarker.remove(); selMarker = null; }
  sel = null;
  $('#coords-sel').textContent = '✅ Punto registrado. Podés elegir otro en el mapa.';
  $('#p-lugar').value = ''; $('#p-cant').value = 1;
});

$('#btn-ubic').addEventListener('click', () => {
  if (!navigator.geolocation) { $('#coords-sel').textContent = 'Tu navegador no permite geolocalización.'; return; }
  navigator.geolocation.getCurrentPosition(
    pos => { const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude }; if (mapa) { mapa.flyTo([ll.lat, ll.lng], 14); } seleccionar(ll); },
    () => { $('#coords-sel').textContent = 'No se pudo obtener tu ubicación (revisá los permisos).'; }
  );
});

$('#btn-copiar').addEventListener('click', async e => {
  const txt = JSON.stringify(puntos.map(({ lat, lng, lugar, cantidad, fecha }) => ({ lat, lng, lugar, cantidad, fecha })), null, 2);
  const b = e.currentTarget, orig = b.textContent;
  try { await navigator.clipboard.writeText(txt); b.textContent = '✅ ¡Copiado!'; }
  catch { b.textContent = '⚠️ No se pudo copiar'; }
  setTimeout(() => b.textContent = orig, 1800);
});

/* ---------- Arranque ---------- */
mostrar(location.hash.slice(1) || 'juego');
})();
