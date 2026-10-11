'use strict';
// ===== TV-kamera med perspektiv =====
const cv = document.getElementById('pitch'), cx = cv.getContext('2d');
const mini = document.getElementById('mini'), mx = mini.getContext('2d');
const cam = { x: L / 2, y0: -30, h: 21, lookY: 20, F: 900, oy: 0, W: 1, H: 1, cos: 1, sin: 0, zoom: 1, dpr: 1 };
const REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
let SX = 0, SY = 0, vignette = null;
const TAU = Math.PI * 2;
// Textstorlekar avrundas till hela pixlar. Tidigare fick varje skylt, tröjnummer och namn en ny decimalstorlek
// varje bildruta (tiotusentals olika typsnittsstorlekar per match). iPhones webbläsare sparar typsnitt per storlek,
// vilket troligen fyllde minnet tills telefonen stängde sidan.
const FONTS = new Map();
function setFont(weight, px, fam) {
  const k = `${weight}|${Math.max(6, Math.round(px))}|${fam}`;
  let f = FONTS.get(k);
  if (!f) { if (FONTS.size > 300) FONTS.clear(); f = `${weight} ${Math.max(6, Math.round(px))}px ${fam}`; FONTS.set(k, f); }
  cx.font = f;
}
const TEKO = "Teko, 'Arial Narrow', sans-serif", BARLOW = "Barlow, 'Segoe UI', sans-serif";
// Övertoningar skapas en gång (runt origo, radie 1) och flyttas/skalas på plats i stället för att skapas nya varje bildruta
const GRAD = {};
function unitRadial(key, stops) {
  let g = GRAD[key];
  if (!g) { g = cx.createRadialGradient(0, 0, 0, 0, 0, 1); for (const [o, c] of stops) g.addColorStop(o, c); GRAD[key] = g; }
  return g;
}
function fillRadial(key, stops, x, y, r) {
  cx.save(); cx.translate(x, y); cx.scale(r, r);
  cx.fillStyle = unitRadial(key, stops); cx.fillRect(-1, -1, 2, 2);
  cx.restore();
}

function resize() {
  const r = cv.getBoundingClientRect();
  // Mobil: högst 1,5 i pixeltäthet (ca 45 % färre pixlar per bildruta än 2) – lättare för telefonen
  cam.dpr = GFX.low ? 1 : Math.min(Math.min(window.innerWidth, window.innerHeight) < 600 ? 1.5 : 2, window.devicePixelRatio || 1);
  cam.W = cv.width = Math.max(2, Math.round(r.width * cam.dpr));
  cam.H = cv.height = Math.max(2, Math.round(r.height * cam.dpr));
  const th = Math.atan2(cam.h, cam.lookY - cam.y0);
  cam.cos = Math.cos(th); cam.sin = Math.sin(th);
  vignette = cx.createRadialGradient(cam.W / 2, cam.H * 0.55, Math.min(cam.W, cam.H) * 0.35, cam.W / 2, cam.H * 0.55, Math.hypot(cam.W, cam.H) * 0.62);
  vignette.addColorStop(0, 'rgba(0,0,8,0)');
  vignette.addColorStop(1, 'rgba(0,0,8,0.62)');
}

function P(x, y, z) {
  const dx = x - cam.x, dy = y - cam.y0, dz = z - cam.h;
  const Z = Math.max(0.5, dy * cam.cos - dz * cam.sin);
  const Y = dy * cam.sin + dz * cam.cos, s = cam.F / Z;
  return [cam.W / 2 + dx * s + SX, cam.oy - Y * s + SY, s];
}

function camUpdate(dt, fx, fy, zoomT, fast) {
  const W = cam.W, H = cam.H;
  const baseF = W > H ? Math.min(W * 1.3, H * 2.0) : Math.min(W * 1.75, H * 1.8);
  cam.zoom += (zoomT - cam.zoom) * Math.min(1, dt * 2.5);
  cam.F = baseF * cam.zoom;
  const halfVis = (W / 2) * 46 / cam.F;
  const lo = Math.min(L / 2, halfVis - 6), hi = Math.max(L / 2, L - halfVis + 6);
  cam.x += (clamp(fx, lo, hi) - cam.x) * Math.min(1, dt * (fast ? 5 : 2.6));
  const Z0 = -cam.y0 * cam.cos + cam.h * cam.sin, Y0 = -cam.y0 * cam.sin - cam.h * cam.cos;
  let oy = H * 0.92 + cam.F * Y0 / Z0;
  const w = clamp((cam.zoom - 1) / 0.3, 0, 1);
  if (w > 0) {
    const dy = fy - cam.y0, Zb = dy * cam.cos + cam.h * cam.sin, Yb = dy * cam.sin - cam.h * cam.cos;
    oy = oy * (1 - w) + (H * 0.6 + cam.F * Yb / Zb) * w;
  }
  cam.oy = oy;
  const sh = REDUCED ? 0 : G.shake * 7 * cam.dpr;
  SX = (Math.random() - 0.5) * sh; SY = (Math.random() - 0.5) * sh;
}

// ===== Ritverktyg =====
function poly(pts) {
  cx.beginPath(); cx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) cx.lineTo(pts[i][0], pts[i][1]);
  cx.closePath();
}
function gQuad(x0, y0, x1, y1) { poly([P(x0, y0, 0), P(x1, y0, 0), P(x1, y1, 0), P(x0, y1, 0)]); cx.fill(); }
const LW = 0.07;
function hLine(x0, x1, y) { gQuad(x0, y - LW, x1, y + LW); }
function vLine(x, y0, y1) { gQuad(x - LW, y0, x + LW, y1); }
function arcBand(xc, yc, r, a0, a1, w) {
  const n = Math.max(10, Math.ceil(Math.abs(a1 - a0) * r * 1.4));
  cx.beginPath();
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, q = P(xc + Math.cos(a) * (r + w), yc + Math.sin(a) * (r + w), 0); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }
  for (let i = n; i >= 0; i--) { const a = a0 + (a1 - a0) * i / n, q = P(xc + Math.cos(a) * (r - w), yc + Math.sin(a) * (r - w), 0); cx.lineTo(q[0], q[1]); }
  cx.closePath(); cx.fill();
}
function disc(x, y, r) { arcBand(x, y, r / 2, 0, TAU, r / 2); }
function rr(x, y, w, h, r) {
  cx.beginPath(); cx.moveTo(x + r, y); cx.lineTo(x + w - r, y); cx.quadraticCurveTo(x + w, y, x + w, y + r);
  cx.lineTo(x + w, y + h - r); cx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); cx.lineTo(x + r, y + h);
  cx.quadraticCurveTo(x, y + h, x, y + h - r); cx.lineTo(x, y + r); cx.quadraticCurveTo(x, y, x + r, y); cx.closePath();
}

// ===== Himmel, läktare, publik =====
const STARS = Array.from({ length: 70 }, () => [Math.random(), Math.random(), Math.random() * 0.6 + 0.2]);
function drawSky() {
  const top = P(cam.x, WD + 19.2, 17)[1], gh = Math.round(Math.max(40, top + 40) / 8) * 8;
  if (!drawSky.g || drawSky.h !== gh) { drawSky.g = cx.createLinearGradient(0, 0, 0, gh); drawSky.g.addColorStop(0, '#02040b'); drawSky.g.addColorStop(1, '#131d40'); drawSky.h = gh; }
  cx.fillStyle = drawSky.g; cx.fillRect(0, 0, cam.W, cam.H);
  if (top > 20) {
    cx.fillStyle = '#d6ddff';
    for (const s of STARS) { cx.globalAlpha = s[2] * 0.55; cx.fillRect(s[0] * cam.W, s[1] * (top - 20), 1.3 * cam.dpr, 1.3 * cam.dpr); }
    cx.globalAlpha = 1;
  }
}

// Arenan byggs från klubbens anläggning (läktarrader, tak, VIP, strålkastare, publik)
const DEFAULT_BOARDS = [['NORDSKOG', '#1d5b2a', '#d8ffd0'], ['ÄLVKRAFT', '#7fd3ff', '#0b1230'], ['VÅFFLA & CO', '#ffc35a', '#3b2208'], ['SNABBSKO', '#5b2dbf', '#ffffff'], ['LJUSGÅRD', '#f4f1ff', '#b3122e']];
const STAND_X0 = -3.4, STAND_X1 = L + 3.4; // läktarnas läge bakom målen (oförändrat)
const ARENA = { rows: [], farRows: [], mainRows: 8, endRows: 6, roof: false, vip: 0, lights: 2, towers: [], boards: DEFAULT_BOARDS, topZ: 7, backY: WD + 12 };
function srand(seed) { let s = (seed >>> 0) || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function buildArena(cfg) {
  const R = srand(cfg.seed || 7);
  ARENA.mainRows = clamp(Math.round(cfg.mainRows || 3), 2, 14);
  ARENA.endRows = clamp(Math.round(cfg.endRows || 0), 0, 10);
  ARENA.roof = !!cfg.roof; ARENA.vip = cfg.vip || 0;
  ARENA.lights = clamp(cfg.lights == null ? 2 : cfg.lights, 0, 3);
  ARENA.boards = cfg.boards && cfg.boards.length ? cfg.boards : DEFAULT_BOARDS;
  const fill = clamp(cfg.fill == null ? 0.8 : cfg.fill, 0, 1);
  const pick = () => { const r = R(); return r < 0.42 ? 0 : r < 0.58 ? 1 : 2 + ((R() * 4) | 0); };
  const mr = ARENA.mainRows;
  ARENA.rows = [];
  for (let r = mr - 1; r >= 0; r--) {
    const row = { far: true, pts: [] };
    for (let x = -16; x <= L + 16; x += 0.8) row.pts.push({ x: x + (r % 2) * 0.4 + (R() - 0.5) * 0.2, y: WD + 4 + r * 1.1, z: 0.5 + r * 0.82, c: pick(), ph: R() * TAU, on: R() < fill });
    ARENA.rows.push(row);
  }
  for (let r = ARENA.endRows - 1; r >= 0; r--) {
    const row = { far: false, pts: [] };
    for (const e of [0, 1]) for (let y = WD + 3; y >= -4; y -= 0.8) {
      const off = 2.4 + r * 1.05;
      row.pts.push({ x: e ? STAND_X1 + off : STAND_X0 - off, y: y + (r % 2) * 0.4, z: 0.6 + r * 0.79, c: pick(), ph: R() * TAU, on: R() < fill });
    }
    ARENA.rows.push(row);
  }
  ARENA.farRows = ARENA.rows.filter(r => r.far && r.pts.some(q => q.on));
  ARENA.backY = WD + 3.6 + mr * 1.1;
  ARENA.topZ = 0.25 + mr * 0.82;
  const lv = ARENA.lights;
  ARENA.towers = lv === 0 ? [] : lv < 3 ? [[-10, WD + 22], [L + 10, WD + 22]]
    : [[-10, WD + 22], [L + 10, WD + 22], [L * 0.28, ARENA.backY + 7], [L * 0.72, ARENA.backY + 7]];
}
buildArena({ mainRows: 8, endRows: 6, lights: 2, fill: 0.8 });
const CROWD_NEUTRAL = ['#e9ecf5', '#2c3346', '#6c7896', '#a8453c'];
const flashes = [];

function drawCrowd(far, dt) {
  const cols = [G.kits.home ? G.kits.home.shirt : '#fecc02', G.kits.away ? G.kits.away.shirt : '#1b3f93', ...CROWD_NEUTRAL];
  const ex = Math.min(1.3, G.excite), t = G.time;
  for (const row of ARENA.rows) {
    if (row.far !== far) continue;
    const pr = row.pts.map(q => {
      if (!q.on) return null;
      const jump = Math.max(0, Math.sin(t * 9 + q.ph)) * 0.38 * ex + Math.sin(t * 1.7 + q.ph) * 0.03;
      const p = P(q.x, q.y, q.z + jump);
      return (p[0] < -20 || p[0] > cam.W + 20) ? null : p;
    });
    for (let c = 0; c < cols.length; c++) {
      cx.fillStyle = cols[c]; cx.beginPath();
      for (let i = 0; i < pr.length; i++) {
        const p = pr[i]; if (!p || row.pts[i].c !== c) continue;
        cx.rect(p[0] - 0.2 * p[2], p[1] - 0.62 * p[2], 0.4 * p[2], 0.52 * p[2]);
        if (ex > 0.5 && (i + c) % 3 === 0) cx.rect(p[0] - 0.24 * p[2], p[1] - 1.05 * p[2], 0.08 * p[2], 0.42 * p[2]);
      }
      cx.fill();
    }
    cx.fillStyle = '#c99a78'; cx.beginPath();
    for (const p of pr) if (p) cx.rect(p[0] - 0.1 * p[2], p[1] - 0.84 * p[2], 0.2 * p[2], 0.2 * p[2]);
    cx.fill();
  }
  if (far) {
    // Blixtar från mobilkameror
    if (ARENA.farRows.length && Math.random() < 0.12 + G.excite * 0.9) {
      const row = ARENA.farRows[(Math.random() * ARENA.farRows.length) | 0], q = row.pts[(Math.random() * row.pts.length) | 0];
      if (q.on && !GFX.low && flashes.length < 6) flashes.push({ q, t: 0.1 });
    }
    cx.save(); cx.globalCompositeOperation = 'lighter';
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i]; f.t -= dt;
      if (f.t <= 0) { flashes.splice(i, 1); continue; }
      const p = P(f.q.x, f.q.y, f.q.z + 0.9), r = 1.2 * p[2];
      fillRadial('flash', [[0, 'rgba(255,255,255,0.9)'], [1, 'rgba(200,220,255,0)']], p[0], p[1], r);
    }
    cx.restore();
  }
}

function drawStands(dt) {
  const bY = ARENA.backY, tZ = ARENA.topZ;
  cx.fillStyle = '#0a0f1f';
  poly([P(-18, bY, tZ), P(L + 18, bY, tZ), P(L + 18, bY + 0.6, tZ + 3.2), P(-18, bY + 0.6, tZ + 3.2)]); cx.fill();
  if (ARENA.vip > 0) {
    const w = Math.min(L + 30, 8 + ARENA.vip * 5), x0 = L / 2 - w / 2;
    const a = P(x0, bY + 0.1, tZ + 2.4), c = P(x0 + w, bY + 0.1, tZ + 0.3);
    const g = cx.createLinearGradient(0, a[1], 0, c[1]);
    g.addColorStop(0, '#ffe2a0'); g.addColorStop(1, '#c98a35');
    cx.fillStyle = g; cx.fillRect(a[0], a[1], c[0] - a[0], c[1] - a[1]);
    cx.fillStyle = 'rgba(10,14,30,0.8)';
    for (let x = x0; x <= x0 + w + 0.01; x += 3) { const q = P(x, bY + 0.1, tZ + 2.4); cx.fillRect(q[0] - q[2] * 0.08, a[1], q[2] * 0.16, c[1] - a[1]); }
  }
  const face = [P(-18, WD + 3.3, 0), P(L + 18, WD + 3.3, 0), P(L + 18, bY, tZ), P(-18, bY, tZ)];
  cx.fillStyle = '#141c36'; poly(face); cx.fill();
  cx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let r = 0; r < ARENA.mainRows; r++) { const y = WD + 4.3 + r * 1.1, z = 0.4 + r * 0.82; poly([P(-18, y, z), P(L + 18, y, z), P(L + 18, y + 0.1, z + 0.1), P(-18, y + 0.1, z + 0.1)]); cx.fill(); }
  drawCrowd(true, dt);
  cx.fillStyle = 'rgba(6,9,22,0.28)'; poly(face); cx.fill();
  if (ARENA.roof) {
    const fy = WD + 3.8, fz = tZ + 3.8;
    cx.fillStyle = '#0c1122';
    poly([P(-18, fy, fz), P(L + 18, fy, fz), P(L + 18, bY + 0.6, tZ + 3.2), P(-18, bY + 0.6, tZ + 3.2)]); cx.fill();
    cx.strokeStyle = '#1d2640'; cx.lineWidth = Math.max(1.5, 0.18 * P(0, fy, 0)[2]);
    for (const x of [-12, L * 0.25, L * 0.5, L * 0.75, L + 12]) { const a = P(x, fy + 0.2, 0.3), b = P(x, fy + 0.2, fz); cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
    cx.fillStyle = '#1a2340';
    poly([P(-18, fy, fz + 0.9), P(L + 18, fy, fz + 0.9), P(L + 18, fy, fz), P(-18, fy, fz)]); cx.fill();
    cx.fillStyle = '#fff3cf';
    for (let x = -16; x <= L + 16; x += 4) { const p = P(x, fy - 0.05, fz + 0.15); cx.fillRect(p[0] - p[2] * 0.14, p[1] - p[2] * 0.12, p[2] * 0.28, p[2] * 0.12); }
  }
  if (ARENA.endRows > 0) {
    const off = 1.6 + ARENA.endRows * 1.05 + 0.6, h = 0.6 + ARENA.endRows * 0.79;
    cx.fillStyle = '#10172d';
    poly([P(STAND_X0 - 1.6, -6, 0), P(STAND_X0 - 1.6, WD + 5, 0), P(STAND_X0 - off, WD + 5, h), P(STAND_X0 - off, -6, h)]); cx.fill();
    poly([P(STAND_X1 + 1.6, -6, 0), P(STAND_X1 + 1.6, WD + 5, 0), P(STAND_X1 + off, WD + 5, h), P(STAND_X1 + off, -6, h)]); cx.fill();
    drawCrowd(false, dt);
  }
}

function drawTowers() {
  for (const [x, y] of ARENA.towers) {
    const b = P(x, y, 0), t = P(x, y, 27.5);
    cx.strokeStyle = '#1a2136'; cx.lineWidth = Math.max(2, 0.6 * t[2]);
    cx.beginPath(); cx.moveTo(b[0], b[1]); cx.lineTo(t[0], t[1]); cx.stroke();
    const a = P(x - 3.2, y, 30.8), c = P(x + 3.2, y, 27.3);
    cx.fillStyle = '#20283d'; cx.fillRect(a[0], a[1], c[0] - a[0], c[1] - a[1]);
    cx.fillStyle = '#fffbe8';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      const q = P(x - 2.25 + i * 1.5, y, 30.1 - j * 1.1);
      cx.beginPath(); cx.arc(q[0], q[1], 0.45 * q[2], 0, TAU); cx.fill();
    }
  }
}
const GLOW = [0, 0.55, 0.85, 1];
function drawGlow() {
  cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = GLOW[ARENA.lights];
  for (const [x, y] of ARENA.towers) {
    const q = P(x, y, 29), r = 26 * q[2];
    fillRadial('glow', [[0, 'rgba(255,244,214,0.6)'], [0.08, 'rgba(255,236,190,0.22)'], [1, 'rgba(255,230,180,0)']], q[0], q[1], r);
    if (!GRAD.streak) { const sg = GRAD.streak = cx.createLinearGradient(-1, 0, 1, 0); sg.addColorStop(0, 'rgba(255,240,210,0)'); sg.addColorStop(0.5, 'rgba(255,240,210,0.16)'); sg.addColorStop(1, 'rgba(255,240,210,0)'); }
    cx.save(); cx.translate(q[0], q[1]); cx.scale(r * 1.6, 1); cx.fillStyle = GRAD.streak; cx.fillRect(-1, -0.25 * q[2], 2, 0.5 * q[2]); cx.restore();
    if (y > WD + 30 || GFX.low) continue;
    const tg = P(x < L / 2 ? L * 0.3 : L * 0.7, CY, 0);
    const bg = cx.createLinearGradient(q[0], q[1], tg[0], tg[1]);
    bg.addColorStop(0, 'rgba(255,240,200,0.10)'); bg.addColorStop(1, 'rgba(255,240,200,0)');
    const spread = 0.35 * cam.W;
    cx.fillStyle = bg; cx.beginPath(); cx.moveTo(q[0], q[1]); cx.lineTo(tg[0] - spread, tg[1]); cx.lineTo(tg[0] + spread, tg[1]); cx.closePath(); cx.fill();
  }
  cx.restore();
}

// ===== Planen =====
const GRASS = [['#2b7536', '#2e7939'], ['#35873f', '#388b42']];
function drawPitch() {
  cx.fillStyle = '#153a1c'; gQuad(-18, -12, L + 18, WD + 3.4);
  const ys = [WALL_Y0, 11, 22, 33, WALL_Y1];
  for (let i = -1; i <= 14; i++) {
    const x0 = Math.max(WALL_X0, i * 5), x1 = Math.min(WALL_X1, (i + 1) * 5) + 0.03;
    for (let j = 0; j < 4; j++) { cx.fillStyle = GRASS[(i + 2) % 2][j % 2]; gQuad(x0, ys[j], x1, ys[j + 1] + 0.03); }
  }
  cx.fillStyle = 'rgba(244,248,255,0.86)';
  hLine(-LW, L + LW, 0); hLine(-LW, L + LW, WD); vLine(0, 0, WD); vLine(L, 0, WD); vLine(L / 2, 0, WD);
  arcBand(L / 2, CY, CIRCLE_R, 0, TAU, LW); disc(L / 2, CY, 0.36);
  for (const [gx, s] of [[0, 1], [L, -1]]) {
    const bx = gx + s * BOX_D, sx6 = gx + s * SIX_D;
    vLine(bx, CY - BOX_HW, CY + BOX_HW);
    hLine(Math.min(gx, bx), Math.max(gx, bx), CY - BOX_HW); hLine(Math.min(gx, bx), Math.max(gx, bx), CY + BOX_HW);
    vLine(sx6, CY - SIX_HW, CY + SIX_HW);
    hLine(Math.min(gx, sx6), Math.max(gx, sx6), CY - SIX_HW); hLine(Math.min(gx, sx6), Math.max(gx, sx6), CY + SIX_HW);
    disc(gx + s * SPOT_D, CY, 0.3);
    const a = Math.acos((BOX_D - SPOT_D) / CIRCLE_R);
    if (s > 0) arcBand(gx + s * SPOT_D, CY, CIRCLE_R, -a, a, LW);
    else arcBand(gx + s * SPOT_D, CY, CIRCLE_R, Math.PI - a, Math.PI + a, LW);
  }
  arcBand(0, 0, 1, 0, Math.PI / 2, LW); arcBand(L, 0, 1, Math.PI / 2, Math.PI, LW);
  arcBand(L, WD, 1, Math.PI, Math.PI * 1.5, LW); arcBand(0, WD, 1, Math.PI * 1.5, TAU, LW);
}

function drawBoards() {
  const yb = WALL_Y1 + 0.05, hB = 0.95, NB = 9, bw = (WALL_X1 - WALL_X0) / NB;
  const goalFlash = G.state === 'goal' && G.goalSide;
  for (let i = 0; i < NB; i++) {
    const x0 = WALL_X0 + i * bw, a = P(x0, yb, hB), c = P(x0 + bw, yb, 0);
    if (c[0] < 0 || a[0] > cam.W) continue;
    const w = c[0] - a[0], h = c[1] - a[1];
    let bg, fg, txt;
    if (goalFlash) {
      const on = Math.floor(G.time * 6 + i) % 2 === 0, k = G.kits[G.goalSide];
      bg = on ? k.shirt : '#0b1230'; fg = on ? k.num : '#ffffff'; txt = 'MÅL!';
    } else [txt, bg, fg] = ARENA.boards[(i + Math.floor(Math.max(0, G.time) / 5)) % ARENA.boards.length];
    cx.fillStyle = bg; cx.fillRect(a[0], a[1], w + 0.6, h);
    cx.fillStyle = fg; setFont(600, h * 0.92, TEKO);
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(txt, a[0] + w / 2, a[1] + h * 0.58);
    cx.fillStyle = 'rgba(255,255,255,0.08)'; cx.fillRect(a[0], a[1], w, h * 0.35);
  }
  for (const xb of [WALL_X0 - 0.05, WALL_X1 + 0.05]) {
    for (const [ya, yz] of [[WALL_Y0 - 0.05, CY - GOAL_HW], [CY + GOAL_HW, yb]]) {
      cx.fillStyle = '#0d1532';
      poly([P(xb, ya, 0), P(xb, yz, 0), P(xb, yz, hB), P(xb, ya, hB)]); cx.fill();
      cx.fillStyle = 'rgba(255,214,107,0.5)';
      poly([P(xb, ya, hB * 0.72), P(xb, yz, hB * 0.72), P(xb, yz, hB * 0.6), P(xb, ya, hB * 0.6)]); cx.fill();
    }
  }
}
// Närmaste långsidan: halvgenomskinlig sarg som ritas framför spelarna
function drawNearBoard() {
  const y = WALL_Y0 - 0.05, hB = 0.95;
  cx.fillStyle = 'rgba(13,21,50,0.55)';
  poly([P(WALL_X0 - 0.05, y, 0), P(WALL_X1 + 0.05, y, 0), P(WALL_X1 + 0.05, y, hB), P(WALL_X0 - 0.05, y, hB)]); cx.fill();
  cx.fillStyle = 'rgba(255,214,107,0.55)';
  poly([P(WALL_X0 - 0.05, y, hB), P(WALL_X1 + 0.05, y, hB), P(WALL_X1 + 0.05, y, hB * 0.9), P(WALL_X0 - 0.05, y, hB * 0.9)]); cx.fill();
}

// ===== Målen =====
function netDisp(side, y, z) {
  const n = G.net;
  if (n.side !== side || n.amp <= 0.01) return 0;
  const d2 = (y - n.y) ** 2 + (z - n.z) ** 2;
  return n.amp * Math.exp(-d2 / 1.6) * Math.exp(-n.t * 2.6) * (0.65 + 0.35 * Math.cos(n.t * 16));
}
function drawGoalNet(gx, s, side) {
  const y0 = CY - GOAL_HW, y1 = CY + GOAL_HW, H = GOAL_H, Hb = GOAL_H * 0.82, D = GOAL_D;
  const bx = (y, z) => gx + s * (D + netDisp(side, y, z));
  cx.fillStyle = 'rgba(220,230,255,0.05)';
  poly([P(bx(y0, 0), y0, 0), P(bx(y1, 0), y1, 0), P(bx(y1, Hb), y1, Hb), P(bx(y0, Hb), y0, Hb)]); cx.fill();
  const sc = P(gx, CY, 1)[2];
  cx.strokeStyle = 'rgba(230,236,255,0.34)'; cx.lineWidth = Math.max(0.6, 0.02 * sc);
  cx.beginPath();
  const mv = (p, first) => first ? cx.moveTo(p[0], p[1]) : cx.lineTo(p[0], p[1]);
  for (let y = y0; y <= y1 + 1e-6; y += 0.52) for (let k = 0; k <= 6; k++) { const z = Hb * k / 6; mv(P(bx(y, z), y, z), k === 0); }
  for (let z = 0; z <= Hb + 1e-6; z += 0.41) { let f = true; for (let y = y0; y <= y1 + 1e-6; y += 0.52) { mv(P(bx(y, z), y, z), f); f = false; } mv(P(bx(y1, z), y1, z), false); }
  for (let y = y0; y <= y1 + 1e-6; y += 0.52) { mv(P(gx, y, H), true); mv(P(bx(y, Hb), y, Hb), false); }
  for (let f = 0.25; f < 1; f += 0.25) { const x = gx + s * D * f, z = H + (Hb - H) * f; mv(P(x, y0, z), true); mv(P(x, y1, z), false); }
  for (const ys of [y0, y1]) {
    for (let z = 0; z <= H + 1e-6; z += 0.42) { const zb = Math.min(z, Hb); mv(P(gx, ys, z), true); mv(P(bx(ys, zb), ys, zb), false); }
    for (let f = 0.25; f < 1; f += 0.25) { const x = gx + s * D * f; mv(P(x, ys, 0), true); mv(P(x, ys, H + (Hb - H) * f), false); }
  }
  cx.stroke();
  cx.strokeStyle = '#f4f6ff'; cx.lineCap = 'round'; cx.lineWidth = Math.max(2, 0.13 * sc);
  cx.beginPath();
  let p = P(gx, y1, 0); cx.moveTo(p[0], p[1]); p = P(gx, y1, H); cx.lineTo(p[0], p[1]); p = P(gx, y0, H); cx.lineTo(p[0], p[1]);
  cx.stroke();
}
function drawPost(gx) {
  const a = P(gx, CY - GOAL_HW, 0), b = P(gx, CY - GOAL_HW, GOAL_H);
  cx.strokeStyle = '#f4f6ff'; cx.lineCap = 'round'; cx.lineWidth = Math.max(2, 0.13 * a[2]);
  cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke();
}

// ===== Spelare =====
function kitOf(p) {
  if (p.role === 'GK') { const c = p.side === 'home' ? G.kits.gkHome : G.kits.gkAway; return { shirt: c, shorts: '#15161c', socks: c, num: '#ffffff', stripes: null, gk: true }; }
  return G.kits[p.side];
}
const SHD = [[0.6, -1.0], [-0.6, -1.0], [0.45, 0.5], [-0.45, 0.5]];
function drawShadows(players, b) {
  cx.lineCap = 'round';
  for (const p of players) {
    const a = P(p.x, p.y, 0);
    if (a[0] < -80 || a[0] > cam.W + 80) continue;
    const k = (p.slide > 0 || p.dive > 0 || p.fallen) ? 0.5 : 1.1;
    cx.strokeStyle = 'rgba(0,0,0,0.16)'; cx.lineWidth = 0.36 * a[2];
    // Fyra skuggor från strålkastarna, ritade i ett enda drag
    cx.beginPath();
    for (const d of SHD) { const e = P(p.x + d[0] * k, p.y + d[1] * k, 0); cx.moveTo(a[0], a[1]); cx.lineTo(e[0], e[1]); }
    cx.stroke();
    cx.fillStyle = 'rgba(0,0,0,0.32)'; cx.beginPath(); cx.ellipse(a[0], a[1], 0.4 * a[2], 0.15 * a[2], 0, 0, TAU); cx.fill();
  }
  const g0 = P(b.x, b.y, 0), hs = 1 / (1 + b.z * 0.35);
  cx.fillStyle = `rgba(0,0,0,${0.4 * hs})`;
  cx.beginPath(); cx.ellipse(g0[0], g0[1], BALL_R * 1.5 * g0[2] * (0.6 + 0.4 * hs), BALL_R * 0.6 * g0[2], 0, 0, TAU); cx.fill();
}
function drawRing(x, y, r, color, lw) {
  cx.beginPath();
  for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, q = P(x + Math.cos(a) * r, y + Math.sin(a) * r, 0); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }
  cx.strokeStyle = color; cx.lineWidth = lw; cx.stroke();
}
function leg(u, face, ox, s, kit, skin) {
  const hx = ox * u, hy = -0.9 * u;
  const fx = hx + s * 0.42 * u * face, fy = -0.07 * u - Math.max(0, -s) * 0.1 * u;
  const kx = (hx + fx) / 2 + 0.07 * u * face * (1 - Math.abs(s) * 0.5), ky = -0.5 * u;
  cx.lineWidth = 0.15 * u;
  cx.strokeStyle = skin; cx.beginPath(); cx.moveTo(hx, hy); cx.lineTo(kx, ky); cx.stroke();
  cx.strokeStyle = kit.socks; cx.beginPath(); cx.moveTo(kx, ky); cx.lineTo(fx, fy); cx.stroke();
  cx.fillStyle = '#121218'; cx.beginPath(); cx.ellipse(fx + 0.05 * u * face, fy + 0.02 * u, 0.11 * u, 0.055 * u, 0, 0, TAU); cx.fill();
}
function arm(u, side, face, sw, kit, skin, up) {
  const shx = side * 0.22 * u, shy = -1.4 * u;
  const hx = up ? side * 0.38 * u : shx + side * 0.05 * u - sw * 0.3 * u * face;
  const hy = up ? -1.98 * u : -0.98 * u;
  const ex = shx + (hx - shx) * 0.35, ey = shy + (hy - shy) * 0.35;
  cx.lineWidth = 0.12 * u; cx.strokeStyle = skin;
  cx.beginPath(); cx.moveTo(ex, ey); cx.lineTo(hx, hy); cx.stroke();
  cx.lineWidth = 0.14 * u; cx.strokeStyle = kit.shirt;
  cx.beginPath(); cx.moveTo(shx, shy); cx.lineTo(ex, ey); cx.stroke();
  if (kit.gk) { cx.fillStyle = '#e9ff6a'; cx.beginPath(); cx.arc(hx, hy, 0.075 * u, 0, TAU); cx.fill(); }
}
// Tröjans skuggning ser likadan ut för alla spelare av samma storlek: räkna ut den en gång och återanvänd
const SHADE = new Map();
function shirtShade(u) {
  const k = Math.round(u * 2);
  let g = SHADE.get(k);
  if (!g) {
    if (SHADE.size > 400) SHADE.clear();
    const uu = k / 2;
    g = cx.createLinearGradient(0, -1.47 * uu, 0, -0.94 * uu);
    g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0.25)');
    SHADE.set(k, g);
  }
  return g;
}
function drawPlayer(p, isHuman, tag) {
  const kit = kitOf(p);
  let z = 0;
  const acroT = p.acro > 0 ? 1 - p.acro / 0.7 : 0;
  if (p.acro > 0) z = Math.sin(acroT * Math.PI) * (p.acroType === 'cyk' ? 1.1 : 0.6);
  else if (p.dive > 0) z = 0.2 + p.diveUp * 0.9 * Math.sin(clamp(p.dive / 0.6, 0, 1) * Math.PI);
  else if (p.jump > 0) z = Math.sin(clamp(p.jump / 0.4, 0, 1) * Math.PI) * 0.55;
  else if (p.cele > 0) z = Math.abs(Math.sin(G.time * 7 + p.idx)) * 0.3;
  const [sx, sy, u] = P(p.x, p.y, z);
  if (sx < -80 || sx > cam.W + 80) return;
  const speed = Math.hypot(p.vx, p.vy);
  let face = Math.abs(p.vx) > 0.4 ? Math.sign(p.vx) : (p.fx >= 0 ? 1 : -1);
  const act = p.actT > 0 ? p.actType : null, at = act ? clamp(1 - p.actT / p.actDur, 0, 1) : 0;
  if (act === 'turn') face *= Math.cos(at * TAU) >= 0 ? 1 : -1;
  const lying = p.slide > 0 || p.dive > 0 || p.acro > 0 || (p.fallen && p.stun > 0);
  let rot = 0;
  if (p.acro > 0) rot = p.acroType === 'cyk' ? -(p.acroFace || 1) * Math.PI * Math.min(1, acroT * 1.4) : -(p.acroFace || 1) * 1.3 * Math.sin(acroT * Math.PI);
  else if (p.slide > 0) rot = -(p.sdx >= 0 ? 1 : -1) * 1.15;
  else if (p.dive > 0) rot = (p.diveDir > 0 ? -1 : 1) * 1.35 * dirOf(p.side);
  else if (lying) rot = (p.fallDir || 1) * 1.5;
  else if (act === 'over') rot = Math.sin(at * TAU) * 0.22;
  else if (act === 'turn') rot = Math.sin(at * TAU) * 0.15;
  else if (act === 'wrong') rot = (p.actDir || 1) * 0.45 * Math.sin(at * Math.PI);
  else if (act === 'poke') rot = (p.actDir || 1) * 0.25;
  else if (act === 'stumble') rot = -(p.actDir || 1) * 0.4 * Math.sin(at * Math.PI * 2);
  else if (act === 'chest') rot = -face * 0.3 * Math.sin(at * Math.PI);
  if (!lying && p.duel > 0 && !act) rot += 0.14 * p.duelDir;
  cx.save(); cx.translate(sx, sy); if (rot) cx.rotate(rot);
  const sw = lying ? 0 : Math.sin(p.anim) * Math.min(1, speed / 5.5);
  let legF = sw, legB = -sw;
  if (p.kickAnim > 0) legF = 1.1;
  if (p.slide > 0) { legF = 1.2; legB = 0.8; }
  if (p.acro > 0) { legF = 1.3 * Math.sin(acroT * Math.PI * 1.5); legB = -0.6; }
  if (act === 'over') { legF = Math.sin(at * Math.PI * 4) * 1.0; legB = -legF * 0.5; }
  if (act === 'nutmeg') { legF = 1.25; legB = -0.3; }
  if (act === 'wrong') { legF = 0.85; legB = -0.85; }
  if (act === 'poke') { legF = 1.5; legB = -0.2; }
  cx.lineCap = 'round';
  leg(u, face, -0.07, legB, kit, p.skin);
  leg(u, face, 0.07, legF, kit, p.skin);
  cx.fillStyle = kit.shorts; rr(-0.2 * u, -1.0 * u, 0.4 * u, 0.3 * u, 0.06 * u); cx.fill();
  cx.beginPath(); cx.moveTo(-0.24 * u, -1.47 * u); cx.lineTo(0.24 * u, -1.47 * u); cx.lineTo(0.21 * u, -0.94 * u); cx.lineTo(-0.21 * u, -0.94 * u); cx.closePath();
  cx.fillStyle = kit.shirt; cx.fill();
  if (kit.stripes) {
    cx.save(); cx.clip(); cx.fillStyle = kit.stripes;
    for (let i = -2; i <= 2; i += 2) cx.fillRect((i * 0.1 - 0.045) * u, -1.5 * u, 0.09 * u, 0.6 * u);
    cx.restore();
  }
  cx.fillStyle = shirtShade(u); cx.fill();
  if (u > 13) {
    cx.fillStyle = kit.num; setFont(600, 0.36 * u, TEKO);
    cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(String(p.num), 0, -1.16 * u);
  }
  const up = (p.cele > 0 || act === 'stumble' || act === 'chest' || act === 'turn') && !lying;
  arm(u, -1, face, sw, kit, p.skin, up);
  arm(u, 1, face, -sw, kit, p.skin, up);
  const hx = 0.03 * u * face, hy = -1.63 * u, hr = 0.135 * u;
  cx.fillStyle = p.skin; cx.beginPath(); cx.arc(hx, hy, hr, 0, TAU); cx.fill();
  cx.fillStyle = p.hair; cx.beginPath(); cx.arc(hx - 0.025 * u * face, hy - 0.015 * u, hr * 1.03, Math.PI * 1.02, Math.PI * 1.98); cx.fill();
  cx.restore();
  if (act === 'turn' && u > 6) {
    cx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - at)})`; cx.lineWidth = Math.max(1, 0.05 * u); cx.beginPath();
    for (let i = 0; i <= 16; i++) { const a = at * TAU - i / 16 * 2.4, q = P(p.x + Math.cos(a) * 0.6, p.y + Math.sin(a) * 0.6, 0.05); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }
    cx.stroke();
  }
  if (p.popT > 0 && p.popText) {
    const a = clamp(p.popT / 0.25, 0, 1), rise = (1.1 - p.popT) * 0.6, m = P(p.x, p.y, (tag && !lying ? 3.1 : 2.4) + z + rise), fs = Math.max(11 * cam.dpr, 0.42 * u);
    cx.save(); cx.globalAlpha = a;
    setFont(700, fs, TEKO); cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.lineWidth = fs * 0.18; cx.strokeStyle = 'rgba(0,0,0,0.75)'; cx.strokeText(p.popText, m[0], m[1]);
    cx.fillStyle = p.popColor || '#ffd66b'; cx.fillText(p.popText, m[0], m[1]);
    cx.restore();
  }
  if (isHuman && !lying) {
    const m = P(p.x, p.y, 2.25 + z), bob = Math.sin(G.time * 5) * 0.05 * u;
    cx.fillStyle = '#ffe07a'; cx.strokeStyle = 'rgba(0,0,0,0.55)'; cx.lineWidth = Math.max(1, 0.03 * u);
    cx.beginPath(); cx.moveTo(m[0], m[1] + 0.2 * u + bob); cx.lineTo(m[0] - 0.16 * u, m[1] - 0.03 * u + bob); cx.lineTo(m[0] + 0.16 * u, m[1] - 0.03 * u + bob); cx.closePath();
    cx.fill(); cx.stroke();
  }
  if (tag && !lying && u > 9) {
    const m = P(p.x, p.y, 2.3 + z), fs = Math.max(10 * cam.dpr, 0.3 * u);
    setFont(600, fs, BARLOW); cx.textAlign = 'center'; cx.textBaseline = 'middle';
    const tw = cx.measureText(tag).width + fs * 0.9;
    cx.fillStyle = 'rgba(6,10,24,0.78)'; rr(m[0] - tw / 2, m[1] - fs * 0.75, tw, fs * 1.5, fs * 0.35); cx.fill();
    cx.fillStyle = '#ffffff'; cx.fillText(tag, m[0], m[1] + fs * 0.05);
  }
  if (p.charging && p.charge > 0) {
    const bw = u, bh = 0.13 * u, bx0 = sx - bw / 2, by0 = sy - 2.6 * u;
    cx.fillStyle = 'rgba(0,0,0,0.6)'; cx.fillRect(bx0 - 2, by0 - 2, bw + 4, bh + 4);
    const g = cx.createLinearGradient(bx0, 0, bx0 + bw, 0);
    g.addColorStop(0, '#7be38c'); g.addColorStop(0.6, '#ffd66b'); g.addColorStop(0.93, '#ff4d5a');
    cx.fillStyle = g; cx.fillRect(bx0, by0, bw * p.charge, bh);
  }
}

// ===== Bollen =====
const trail = [];
function drawBall(b) {
  const [sx, sy, s] = P(b.x, b.y, b.z + BALL_R);
  const r = Math.max(2.2 * cam.dpr, BALL_R * 1.2 * s);
  trail.push([b.x, b.y, b.z]); if (trail.length > (b.curl || b.chip ? 22 : 9)) trail.shift();
  const spd = Math.hypot(b.vx, b.vy, b.vz);
  if ((spd > 13 || b.curl || b.chip) && !b.owner && trail.length > 2) {
    cx.lineCap = 'round';
    for (let i = 1; i < trail.length; i++) {
      const a = P(trail[i - 1][0], trail[i - 1][1], trail[i - 1][2] + BALL_R), c = P(trail[i][0], trail[i][1], trail[i][2] + BALL_R);
      cx.strokeStyle = `rgba(255,250,235,${(i / trail.length) * 0.35})`; cx.lineWidth = r * 1.7 * (i / trail.length);
      cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(c[0], c[1]); cx.stroke();
    }
  }
  if (!GRAD.ball) { const g = GRAD.ball = cx.createRadialGradient(-0.35, -0.4, 0.1, 0, 0, 1); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#e3e8f2'); g.addColorStop(1, '#8e97ad'); }
  cx.save(); cx.translate(sx, sy); cx.scale(r, r); cx.fillStyle = GRAD.ball; cx.beginPath(); cx.arc(0, 0, 1, 0, TAU); cx.fill(); cx.restore();
  cx.save(); cx.beginPath(); cx.arc(sx, sy, r, 0, TAU); cx.clip();
  cx.fillStyle = '#1b1f2b';
  for (let k = 0; k < 3; k++) {
    const a = b.rot + k * 2.1;
    cx.beginPath(); cx.arc(sx + Math.cos(a) * r * 0.6, sy + Math.sin(a * 0.8 + k * 1.3) * r * 0.45, r * 0.27, 0, TAU); cx.fill();
  }
  cx.restore();
}

// ===== Konfetti =====
const confetti = [];
function spawnConfetti(colors) {
  if (REDUCED) return;
  for (let i = 0; i < (GFX.low ? 60 : 140); i++) confetti.push({
    x: Math.random() * cam.W, y: -Math.random() * cam.H * 0.5, vx: rnd(-40, 40) * cam.dpr, vy: rnd(90, 210) * cam.dpr,
    r: Math.random() * 6, vr: rnd(-8, 8), c: colors[i % colors.length], w: rnd(5, 10) * cam.dpr, h: rnd(3, 6) * cam.dpr, life: rnd(3, 5),
  });
}
function drawConfetti(dt) {
  for (let i = confetti.length - 1; i >= 0; i--) {
    const q = confetti[i];
    q.life -= dt; q.x += (q.vx + Math.sin(q.life * 3 + q.r) * 40 * cam.dpr) * dt; q.y += q.vy * dt; q.r += q.vr * dt;
    if (q.life <= 0 || q.y > cam.H + 20) { confetti.splice(i, 1); continue; }
    cx.save(); cx.translate(q.x, q.y); cx.rotate(q.r); cx.scale(1, Math.cos(q.r * 1.7));
    cx.fillStyle = q.c; cx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); cx.restore();
  }
}

// ===== Hela bilden =====
function render(view, dt) {
  const { players, b, human } = view;
  cx.setTransform(1, 0, 0, 1, 0, 0);
  drawSky();
  drawTowers();
  drawStands(dt);
  drawPitch();
  drawBoards();
  drawGoalNet(0, -1, 0); drawGoalNet(L, 1, 1);
  if (human) { const q = P(human.x, human.y, 0); drawRing(human.x, human.y, 0.7, 'rgba(255,224,122,0.9)', Math.max(1.5, 0.07 * q[2])); }
  drawShadows(players, b);
  const ents = players.map(p => ({ y: p.y, p }));
  ents.push({ y: b.y, ball: true }, { y: CY - GOAL_HW, post: 0 }, { y: CY - GOAL_HW, post: L });
  ents.sort((a, c) => c.y - a.y);
  for (const e of ents) {
    if (e.p) drawPlayer(e.p, e.p === human, view.tagged === e.p ? `${e.p.num} ${e.p.short}` : null);
    else if (e.ball) drawBall(b);
    else drawPost(e.post);
  }
  for (const q of G.particles) {
    const p = P(q.x, q.y, q.z), sz = 0.09 * p[2];
    cx.globalAlpha = Math.min(1, q.life * 2); cx.fillStyle = q.c; cx.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz);
  }
  cx.globalAlpha = 1;
  drawNearBoard();
  const dark = [0.42, 0.2, 0.07, 0][ARENA.lights];
  if (dark) { cx.fillStyle = `rgba(2,4,14,${dark})`; cx.fillRect(0, 0, cam.W, cam.H); }
  drawGlow();
  if (!GFX.low) { cx.fillStyle = vignette; cx.fillRect(0, 0, cam.W, cam.H); }
  drawConfetti(dt);
}

function drawMini(players, b, human) {
  const w = mini.width, h = mini.height, pad = 12, kx = (w - 2 * pad) / L, ky = (h - 2 * pad) / WD;
  const X = x => pad + x * kx, Y = y => pad + (WD - y) * ky;
  mx.clearRect(0, 0, w, h);
  mx.fillStyle = 'rgba(47,127,59,0.5)'; mx.fillRect(X(0), Y(WD), L * kx, WD * ky);
  mx.strokeStyle = 'rgba(255,255,255,0.55)'; mx.lineWidth = 1.5;
  mx.strokeRect(X(0), Y(WD), L * kx, WD * ky);
  mx.beginPath(); mx.moveTo(X(L / 2), Y(0)); mx.lineTo(X(L / 2), Y(WD)); mx.stroke();
  mx.beginPath(); mx.arc(X(L / 2), Y(CY), CIRCLE_R * kx, 0, TAU); mx.stroke();
  mx.strokeRect(X(0), Y(CY + BOX_HW), BOX_D * kx, 2 * BOX_HW * ky);
  mx.strokeRect(X(L - BOX_D), Y(CY + BOX_HW), BOX_D * kx, 2 * BOX_HW * ky);
  for (const p of players) {
    mx.fillStyle = kitOf(p).shirt; mx.strokeStyle = 'rgba(0,0,0,0.7)'; mx.lineWidth = 1.5;
    mx.beginPath(); mx.arc(X(p.x), Y(p.y), 5, 0, TAU); mx.fill(); mx.stroke();
    if (p === human) { mx.strokeStyle = '#ffe07a'; mx.lineWidth = 2.5; mx.beginPath(); mx.arc(X(p.x), Y(p.y), 9, 0, TAU); mx.stroke(); }
  }
  mx.fillStyle = '#fff'; mx.strokeStyle = '#000'; mx.lineWidth = 1;
  mx.beginPath(); mx.arc(X(b.x), Y(b.y), 4, 0, TAU); mx.fill(); mx.stroke();
}
