/* EcoPulse - servidor Node.js (sin dependencias).
   Sirve la página y guarda los puntos del mapa de tapitas en data/puntos.json
   Uso:  node server.js   ->  http://localhost:3000   */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'puntos.json');

/* Solo se sirven estos archivos (así no se expone server.js ni los datos) */
const ESTATICOS = {
  '/': 'index.html', '/index.html': 'index.html',
  '/main.js': 'main.js', '/styles.css': 'styles.css',
  '/extras.js': 'extras.js', '/extras.css': 'extras.css'
};
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

/* ---------- Datos ---------- */
fs.mkdirSync(DATA_DIR, { recursive: true });
let puntos = [];
try { puntos = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { puntos = []; }

let guardando = Promise.resolve();
function guardar() {
  const tmp = DATA_FILE + '.tmp';
  guardando = guardando
    .then(() => fs.promises.writeFile(tmp, JSON.stringify(puntos, null, 2)))
    .then(() => fs.promises.rename(tmp, DATA_FILE))
    .catch(err => console.error('Error guardando datos:', err));
  return guardando;
}

/* ---------- Utilidades ---------- */
function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(obj));
}
function leerBody(req, limite = 10 * 1024) {
  return new Promise((resolve, reject) => {
    let n = 0; const partes = [];
    req.on('data', c => { n += c.length; if (n > limite) { reject(new Error('Body demasiado grande')); req.destroy(); } else partes.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(partes).toString() || '{}')); } catch { reject(new Error('JSON inválido')); } });
    req.on('error', reject);
  });
}
function validar(b) {
  const lat = Number(b.lat), lng = Number(b.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'Coordenadas inválidas';
  if (lat < -56 || lat > -21 || lng < -75 || lng > -52) return 'El punto está fuera de Argentina';
  const cantidad = Math.max(1, Math.min(100000, parseInt(b.cantidad, 10) || 1));
  const lugar = String(b.lugar || '').trim().slice(0, 80);
  return { lat, lng, lugar, cantidad };
}

/* ---------- Servidor ---------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const ruta = url.pathname;

  try {
    /* API */
    if (ruta === '/api/puntos') {
      if (req.method === 'GET') return json(res, 200, puntos);
      if (req.method === 'POST') {
        const datos = validar(await leerBody(req));
        if (typeof datos === 'string') return json(res, 400, { error: datos });
        const p = { id: crypto.randomUUID(), ...datos, fecha: new Date().toISOString() };
        puntos.push(p); await guardar();
        return json(res, 201, p);
      }
      res.setHeader('Allow', 'GET, POST'); return json(res, 405, { error: 'Método no permitido' });
    }
    const m = ruta.match(/^\/api\/puntos\/([\w-]+)$/);
    if (m) {
      if (req.method !== 'DELETE') { res.setHeader('Allow', 'DELETE'); return json(res, 405, { error: 'Método no permitido' }); }
      const antes = puntos.length;
      puntos = puntos.filter(p => String(p.id) !== m[1]);
      if (puntos.length === antes) return json(res, 404, { error: 'No existe ese punto' });
      await guardar();
      return json(res, 200, { ok: true });
    }

    /* Archivos estáticos */
    const archivo = ESTATICOS[ruta];
    if (archivo && (req.method === 'GET' || req.method === 'HEAD')) {
      const contenido = await fs.promises.readFile(path.join(__dirname, archivo));
      res.writeHead(200, { 'Content-Type': MIME[path.extname(archivo)], 'X-Content-Type-Options': 'nosniff' });
      return res.end(req.method === 'HEAD' ? undefined : contenido);
    }

    json(res, 404, { error: 'No encontrado' });
  } catch (err) {
    console.error(err);
    json(res, err.message === 'JSON inválido' || err.message === 'Body demasiado grande' ? 400 : 500, { error: err.message });
  }
});

server.listen(PORT, () => console.log(`EcoPulse corriendo en http://localhost:${PORT}`));
