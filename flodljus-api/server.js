'use strict';
// Flodljus Manager – molnsparning på egen server.
// Liten HTTP-tjänst utan ramverk: bara Nodes inbyggda moduler + pg.
// Databasuppgifter läses från standardvariablerna PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE.
const http = require('http');
const { Pool } = require('pg');

const PORT = +process.env.PORT || 3000;
const MAX_BYTES = (+process.env.MAX_SAVE_MB || 5) * 1024 * 1024;
const ID_RE = /^[A-Za-z0-9_.-]{4,64}$/;
const pool = new Pool({ max: 5 });

async function initDb() {
  // Databasen kan starta långsammare än tjänsten: försök igen tills den svarar
  for (let i = 1; ; i++) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS saves (
        id text PRIMARY KEY,
        saved_at bigint NOT NULL DEFAULT 0,
        data text NOT NULL,
        updated timestamptz NOT NULL DEFAULT now()
      )`);
      console.log('Databasen är redo (tabellen saves finns).');
      return;
    } catch (e) {
      console.log(`Väntar på databasen (försök ${i}): ${e.message}`);
      await new Promise(r => setTimeout(r, Math.min(10000, 1000 * i)));
    }
  }
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const tooBig = () => Object.assign(new Error('För stor sparning'), { status: 413 });
    if (+req.headers['content-length'] > MAX_BYTES) { req.resume(); return reject(tooBig()); }
    const chunks = []; let size = 0, over = false;
    req.on('data', c => { size += c.length; if (size > MAX_BYTES) over = true; else chunks.push(c); });
    req.on('end', () => (over ? reject(tooBig()) : resolve(Buffer.concat(chunks).toString('utf8'))));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/health') {
      await pool.query('SELECT 1');
      return send(res, 200, { ok: true });
    }
    const m = url.pathname.match(/^\/api\/save\/([^/]+)$/);
    if (!m) return send(res, 404, { error: 'Finns inte' });
    const id = decodeURIComponent(m[1]);
    if (!ID_RE.test(id)) return send(res, 400, { error: 'Ogiltigt id' });

    if (req.method === 'GET') {
      const r = await pool.query('SELECT saved_at, data, updated FROM saves WHERE id = $1', [id]);
      if (!r.rows.length) return send(res, 404, { error: 'Ingen sparning' });
      const row = r.rows[0];
      return send(res, 200, { id, savedAt: Number(row.saved_at), data: row.data, updated: row.updated });
    }
    if (req.method === 'PUT') {
      const body = JSON.parse(await readBody(req) || '{}');
      if (typeof body.data !== 'string') return send(res, 400, { error: 'data saknas (text)' });
      const savedAt = Number(body.savedAt) || Date.now();
      // Skydd mot att en äldre enhet skriver över en nyare sparning: klienten skickar med 'base' =
      // den sparning den utgick från. Finns det redan något nyare på servern svarar vi 409.
      if (body.base != null) {
        const cur = await pool.query('SELECT saved_at FROM saves WHERE id = $1', [id]);
        if (cur.rows.length && Number(cur.rows[0].saved_at) > Number(body.base)) {
          return send(res, 409, { error: 'Nyare sparning finns', savedAt: Number(cur.rows[0].saved_at) });
        }
      }
      await pool.query(
        `INSERT INTO saves (id, saved_at, data, updated) VALUES ($1, $2, $3, now())
         ON CONFLICT (id) DO UPDATE SET saved_at = EXCLUDED.saved_at, data = EXCLUDED.data, updated = now()`,
        [id, savedAt, body.data]);
      return send(res, 200, { ok: true, id, savedAt, bytes: Buffer.byteLength(body.data) });
    }
    if (req.method === 'DELETE') {
      const r = await pool.query('DELETE FROM saves WHERE id = $1', [id]);
      return send(res, 200, { ok: true, deleted: r.rowCount });
    }
    res.setHeader('Allow', 'GET, PUT, DELETE');
    return send(res, 405, { error: 'Metoden stöds inte' });
  } catch (e) {
    if (e instanceof SyntaxError) return send(res, 400, { error: 'Ogiltig JSON' });
    if (!e.status) console.error(e);
    return send(res, e.status || 500, { error: e.status ? e.message : 'Serverfel' });
  }
});

initDb().then(() => server.listen(PORT, () => console.log(`flodljus-api lyssnar på port ${PORT}`)));
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => { server.close(); pool.end().finally(() => process.exit(0)); });
