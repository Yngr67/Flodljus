'use strict';
// ===== Planen (meter). x = längs planen, y = bort från kameran, z = höjd =====
const L = 70, WD = 44, CY = WD / 2;
const GOAL_HW = 3.9, GOAL_H = 2.5, GOAL_D = 2.0;
const BOX_D = 14, BOX_HW = 13, SIX_D = 5, SIX_HW = 7, SPOT_D = 9.5, CIRCLE_R = 7;
// Sargen står på linjerna (7 mot 7 i bur): bollen kan aldrig gå ut, bara in i målen
const WALL_X0 = 0, WALL_X1 = L, WALL_Y0 = 0, WALL_Y1 = WD;
const GRAV = 14, BALL_R = 0.2, STEP = 1 / 60;

const ROLES = [
  { role: 'GK' }, { role: 'DL' }, { role: 'DR' }, { role: 'LM' }, { role: 'MF' }, { role: 'RM' }, { role: 'FW' },
];
const KICKOFF = { GK: [0.035, 0.5], DL: [0.2, 0.3], DR: [0.2, 0.7], LM: [0.34, 0.16], MF: [0.36, 0.42], RM: [0.34, 0.84], FW: [0.42, 0.6] };
const GK_COLORS = ['#27a35a', '#8e44ad', '#e2e2e2', '#ff8fb1', '#1fb3a8', '#3a3a44'];
// Taktik: formationens förskjutning, skottvilja och press
const TACT = {
  def: { shift: -4, shoot: -0.15, press: 0.85 },
  bal: { shift: 0, shoot: 0, press: 1 },
  off: { shift: 4, shoot: 0.15, press: 1.2 },
};

// ===== Globalt matchtillstånd =====
const G = {
  state: 'idle', stateT: 0, paused: false, silent: false, speed: 1,
  players: [], home: [], away: [], human: null, teams: { home: null, away: null },
  kits: { home: null, away: null, gkHome: '#27a35a', gkAway: '#8e44ad' },
  score: { home: 0, away: 0 }, clock: 0, matchSecs: 180,
  time: 0, timeScale: 1, excite: 0, shake: 0, halftimeDone: false, kickoffTeam: 'home',
  stats: null, events: [], particles: [], net: { side: 0, t: 9, y: CY, z: 1, amp: 0 },
  replay: [], rp: 0, goalSide: null, scorer: null, arena: null,
};

const ball = { x: L / 2, y: CY, z: 0, vx: 0, vy: 0, vz: 0, owner: null, last: null, rot: 0, spin: 0, inGoal: -1, passer: null, shooter: null };

// ===== Hjälpfunktioner =====
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dirOf = side => (side === 'home' ? 1 : -1);
const attackX = side => (side === 'home' ? L : 0);
const ownGoalX = side => (side === 'home' ? 0 : L);
const other = side => (side === 'home' ? 'away' : 'home');
const teamOf = side => (side === 'home' ? G.home : G.away);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rnd = (a, b) => a + Math.random() * (b - a);
const snd = (name, ...a) => { if (!G.silent && typeof Sound !== 'undefined') Sound[name](...a); };
const say = text => { if (typeof callout === 'function') callout(text); };

function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function colorDist(a, b) { const x = hexRgb(a), y = hexRgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); }

function aiFor(p) { return p.ai; }
function tactOf(side) { const t = G.teams[side]; return TACT[(t && t.tactic) || 'bal']; }
function inOwnBox(p, pos) { return Math.abs(pos.x - ownGoalX(p.side)) < BOX_D && Math.abs(pos.y - CY) < BOX_HW; }
function nearestOpp(p) {
  let best = null, bd = 1e9;
  for (const o of teamOf(other(p.side))) { const d = dist(o, p); if (d < bd) { bd = d; best = o; } }
  return best;
}
function nearestOppDist(p) { const o = nearestOpp(p); return o ? dist(o, p) : 99; }
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
  return [Math.hypot(px - ax - t * dx, py - ay - t * dy), t];
}
function laneBlocked(p, m) {
  for (const o of teamOf(other(p.side))) {
    const [d, t] = segDist(o.x, o.y, ball.x, ball.y, m.x, m.y);
    if (d < 1.3 && t > 0.08 && t < 0.95) return true;
  }
  return false;
}
const surname = n => n.split(' ').slice(-1)[0];

// ===== Teknik som syns: finter, tacklingar, skruv, lobbar, bröstmottagning =====
// FX kan stängas av var för sig (används vid balanstester)
const FX = { dribble: true, curl: true, chip: true, chest: true, intercept: true, backStep: true };
const tech = p => (p.rec.sk.pas + p.rec.sk.spd) / 2 + (has(p, 'drb') ? 3 : 0);
// Starta en rörelse som ritas och (för bollhållaren) styr löpningen en kort stund
function playerAct(p, type, dur, dir = 1, good = false) { p.actType = type; p.actT = dur; p.actDur = dur; p.actDir = dir; p.actGood = good; }
const acting = (p, type) => p.actT > 0 && (!type || p.actType === type);
// Kort text över spelaren (som i FIFA) och en liten kamerazoom, så att tekniken syns på telefonen
function pop(p, text, color = '#ffd66b', zoom = true) { p.popText = text; p.popColor = color; p.popT = 1.1; if (zoom && !G.silent) G.zoomPulse = 1.1; }

// Finter: överstegsfint, vändning och tunnel. Lyckas oftare för tekniska spelare mot svagare försvarare.
function tryDribble(p, near) {
  const s = dirOf(p.side), def = near.rec.sk.def + (has(near, 'tkl') ? 3 : 0);
  const okP = clamp(0.5 + (tech(p) - def) / 25, 0.2, 0.85);
  const r = Math.random(), type = r < 0.5 ? 'over' : r < 0.8 || !(has(p, 'drb') || p.rec.sk.pas >= 12) ? 'turn' : 'nutmeg';
  const side = Math.sign(p.y - near.y) || (Math.random() < 0.5 ? -1 : 1);
  if (Math.random() > okP) {
    // Försvararen läser finten
    playerAct(p, type === 'nutmeg' ? 'over' : type, 0.25, side);
    stealBy(near, p);
    pop(near, 'Bollvinst!', '#7be3ff', false);
    traitSay(near, `${near.short} läser finten och tar bollen.`);
    return true;
  }
  playerAct(near, 'wrong', 0.55, -side); near.stun = Math.max(near.stun, type === 'nutmeg' ? 0.7 : 0.5); near.kickCD = 0.4;
  if (type !== 'over' && Math.random() < 0.4) { near.fallen = 1; near.fallDir = -side; near.stun = 0.9; }
  pop(p, type === 'nutmeg' ? 'TUNNEL!' : type === 'turn' ? 'Vändning!' : 'Fint!', type === 'nutmeg' ? '#ff9f43' : '#ffd66b');
  if (type === 'nutmeg') {
    playerAct(p, 'nutmeg', 0.3, side, true);
    release(p);
    ball.vx = s * 9 + p.vx * 0.3; ball.vy = rnd(-0.8, 0.8); ball.vz = 0.4; ball.z = 0.02;
    p.kickCD = 0.15; p.aiX = s; p.aiY = 0;
    traitSay(p, `🥜 TUNNEL! ${p.short} spelar bollen mellan benen på ${near.short}!`);
    G.excite += 0.4;
  } else {
    const dur = type === 'over' ? 0.5 : 0.62;
    playerAct(p, type, dur, side, true);
    let ex = s * (type === 'over' ? 0.55 : 0.35), ey = side * 1;
    const l = Math.hypot(ex, ey); p.actVX = ex / l; p.actVY = ey / l;
    traitSay(p, type === 'over' ? `🪄 Överstegsfint av ${p.short}!` : `🪄 ${p.short} snurrar runt ${near.short}!`);
    G.excite += 0.25;
  }
  spawnGrass(p.x, p.y, 4);
  return true;
}

// Simulera bollens bana (samma fysik som i spelet) och mät hur långt vid sidan av målet den passerar
function simOffset(vx, vy, vz, spin, tx, ty) {
  let x = ball.x, y = ball.y, z = Math.max(ball.z, 0.05);
  const ux = tx - x, uy = ty - y, d = Math.hypot(ux, uy) || 1, nx = ux / d, ny = uy / d;
  for (let i = 0; i < 300; i++) {
    const dt = STEP;
    if (spin) { vx += -vy * spin * dt * 60; vy += vx * spin * dt * 60; spin *= Math.exp(-dt * 1.2); }
    vz -= GRAV * dt; x += vx * dt; y += vy * dt; z += vz * dt;
    if (z <= 0) { z = 0; vz = vz < -2.5 ? -vz * 0.5 : 0; }
    const f = Math.exp(-(z <= 0.001 && vz === 0 ? 0.72 : 0.08) * dt); vx *= f; vy *= f;
    const along = (x - ball.x) * nx + (y - ball.y) * ny;
    if (along >= d) return (x - ball.x) * -ny + (y - ball.y) * nx;
  }
  return null;
}
// Sparka bollen med skruv så att den böjer in mot (tx, ty): leta upp rätt utgångsvinkel
function curlLaunch(p, tx, ty, hz, vh, spin) {
  const z0 = Math.max(ball.z, 0.05), d = Math.hypot(tx - ball.x, ty - ball.y) || 1, t = d / vh;
  const vzz = (hz - z0 + 0.5 * GRAV * t * t) / t, base = Math.atan2(ty - ball.y, tx - ball.x);
  const off = th => simOffset(Math.cos(base + th) * vh, Math.sin(base + th) * vh, vzz, spin, tx, ty);
  let lo = -0.7, hi = 0.7, flo = off(lo);
  const fhi = off(hi);
  // Hittar vi ingen bana som går in mot målet blir det ett vanligt rakt skott
  if (flo == null || fhi == null || (flo > 0) === (fhi > 0)) { launch(p, tx, ty, hz, vh, 0); return; }
  for (let i = 0; i < 16; i++) { const mid = (lo + hi) / 2, fm = off(mid); if (fm == null) break; if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else hi = mid; }
  const th = (lo + hi) / 2;
  launch(p, ball.x + Math.cos(base + th) * d, ball.y + Math.sin(base + th) * d, hz, vh, spin);
  ball.curl = true;
}

// ===== Specialegenskaper och konstsparkar =====
const has = (p, k) => !!(p && p.tr && p.tr.includes(k));
// Kommentar när en egenskap syns, högst var 6:e matchminut per spelare så att flödet inte svämmar över
function traitSay(p, text) { if (G.clock - (p.traitSaid ?? -99) < 6) return; p.traitSaid = G.clock; say(text); }
// Bollhållaren står brett på motståndarens planhalva: läge för inlägg
function crossSpot(p) {
  const s = dirOf(p.side), gx = attackX(p.side), ahead = (gx - p.x) * s;
  const good = has(p, 'crs');
  return p.role !== 'GK' && Math.abs(p.y - CY) > (good ? 6 : 8) && ahead > 4 && ahead < L * (good ? 0.55 : 0.45);
}
// Inlägget slås mot en punkt i straffområdet dit lagkamraten är på väg
function cross(p, spot) {
  const good = has(p, 'crs'), err = good ? 0.8 : 2.6;
  const tx = clamp(spot.x + rnd(-err, err), 1, L - 1), ty = clamp(spot.y + rnd(-err, err), 1, WD - 1);
  const d = Math.hypot(tx - ball.x, ty - ball.y);
  const vh = clamp(11 + d * 0.38, 13, 22), s = dirOf(p.side);
  if (FX.curl && Math.random() < (good ? 0.7 : 0.3)) curlLaunch(p, tx, ty, rnd(1.45, 2.05), vh, -s * Math.sign(ty - ball.y || 1) * rnd(0.003, 0.005));
  else launch(p, tx, ty, rnd(1.45, 2.05), vh);
  ball.passer = p; p.st.passes++;
  traitSay(p, good ? `📐 Inlägg från ${p.short}!` : `${p.short} slår in bollen.`);
}
// Sällsynta konstsparkar när en hög boll kommer till en anfallare framför mål
const ACRO = {
  cyk: { name: 'Cykelspark', big: 'CYKELSPARK!', icon: '🤸', zMin: 1.15, zMax: 2.3, p: 0.08 },
  sax: { name: 'Saxspark', big: 'SAXSPARK!', icon: '🦵', zMin: 0.6, zMax: 1.15, p: 0.07 },
};
function tryAcro(p) {
  const b = ball, s = dirOf(p.side), gx = attackX(p.side);
  if (p.role === 'GK' || p.acro > 0) return false;
  const toGoal = Math.hypot(gx - p.x, CY - p.y);
  if (toGoal > 15 || (gx - p.x) * s < 2) return false;
  const type = b.z >= ACRO.cyk.zMin && b.z < ACRO.cyk.zMax ? 'cyk' : b.z >= ACRO.sax.zMin && b.z < ACRO.sax.zMin + 0.55 ? 'sax' : null;
  if (!type) return false;
  // Nickkungar nickar hellre; skickliga avslutare vågar oftare
  const chance = ACRO[type].p * (0.5 + p.rec.sk.sho / 20) * (type === 'cyk' && has(p, 'hdr') ? 0.4 : 1);
  if (Math.random() > chance) return false;
  p.acro = 0.7; p.acroType = type; p.acroFace = s;
  // Svårt att träffa: en del går utanför eller över
  const ty = CY + rnd(-GOAL_HW * 1.3, GOAL_HW * 1.3) * (0.8 + p.ai.shotErr * 0.4);
  launch(p, gx, ty, rnd(0.3, 2.9), rnd(18, 25), (Math.random() - 0.5) * 0.006);
  ball.shooter = p; ball.acro = type;
  G.stats[p.side].shots++; p.st.shots++;
  if (Math.abs(ty - CY) < GOAL_HW) { G.stats[p.side].onTarget++; p.st.onT++; }
  G.excite += 0.8; G.shake = Math.max(G.shake, 0.5);
  say(`${ACRO[type].icon} ${ACRO[type].name.toUpperCase()} av ${p.short}!`);
  return true;
}

// ===== Egenskaper → beteende på planen =====
// Skala 1–20 internt (visas som 1–100). Formen (1–5) ger ±12 %. Allt är slumpmässigt på planen, men bättre spelare lyckas oftare.
function makeAI(rec) {
  const f = 0.88 + ((rec.form || 3) - 1) * 0.06;
  const k = v => clamp(v * f, 1, 22) / 20;
  const s = rec.sk, t = rec.tr || [];
  return {
    speed: 0.8 + k(s.spd) * 0.34 + (t.includes('spd') ? 0.1 : 0),
    think: 0.36 - k(s.pas) * 0.2,
    tackle: (0.45 + k(s.def) * 2.4) * (t.includes('tkl') ? 1.6 : 1),
    range: 1 + k(s.sho) * 8,
    shotErr: 1.5 - k(s.sho) * 1.1,
    pasErr: 1.45 - k(s.pas) * 1.05,
    gkReact: 0.3 - k(s.gk) * 0.22,
    gkSkill: 0.3 + k(s.gk) * 0.62,
    sta: Math.min(1.25, k(s.sta) + (t.includes('sta') ? 0.4 : 0)),
  };
}

// ===== Lag och spelare =====
// team: { name, short, kit, alt, tactic, lineup: [GK, DL, DR, MF, FW] (spelarposter) }
function setupMatch(home, away) {
  G.teams = { home, away };
  G.kits.home = home.kit;
  G.kits.away = colorDist(home.kit.shirt, away.kit.shirt) < 150 ? away.alt : away.kit;
  const byDist = GK_COLORS.slice().sort((a, b) =>
    Math.min(colorDist(b, G.kits.home.shirt), colorDist(b, G.kits.away.shirt)) - Math.min(colorDist(a, G.kits.home.shirt), colorDist(a, G.kits.away.shirt)));
  G.kits.gkHome = byDist[0]; G.kits.gkAway = byDist[1];
  G.players = []; G.home = []; G.away = []; G.human = null;
  for (const side of ['home', 'away']) {
    const team = G.teams[side];
    ROLES.forEach((r, i) => {
      const rec = team.lineup[i];
      const p = {
        side, role: r.role, num: rec.num, name: rec.name, short: surname(rec.name), rec, idx: i + (side === 'away' ? ROLES.length : 0),
        x: 0, y: 0, vx: 0, vy: 0, fx: dirOf(side), fy: 0, wx: 0, wy: 0, run: 1, sprint: false,
        anim: Math.random() * 6, stamina: 1, fatigue: 0, stun: 0, fallen: 0, slide: 0, sdx: 0, sdy: 0,
        kickCD: 0, kickAnim: 0, dive: 0, diveDir: 0, diveUp: 0, diveSpeed: 0,
        holding: false, hold: 0, think: 0, aiX: 0, aiY: 0, react: 0, charge: 0, charging: false,
        cele: 0, jump: 0, spd: 1, assistFrom: null, assistT: 0,
        skin: rec.skin, hair: rec.hair, ai: makeAI(rec), tr: rec.tr || [], acro: 0, acroType: null, acroFace: 1, traitSaid: -99, actType: null, actT: 0, actDur: 1, actDir: 1, actGood: false, actVX: 0, actVY: 0, duel: 0, duelDir: 0, popText: '', popColor: '', popT: 0,
        st: { goals: 0, assists: 0, shots: 0, onT: 0, tackles: 0, saves: 0, passes: 0, passOk: 0, conceded: 0 },
      };
      p.spd = p.ai.speed; p.minIn = 0;
      G.players.push(p); teamOf(side).push(p);
    });
  }
  G.bench = { home: (home.bench || []).slice(), away: (away.bench || []).slice() };
  G.subs = { home: 0, away: 0 }; G.subbedOff = []; G.subMin = -1;
  G.score = { home: 0, away: 0 }; G.clock = 0; G.halftimeDone = false;
  G.stats = { home: { shots: 0, onTarget: 0, poss: 0, tackles: 0 }, away: { shots: 0, onTarget: 0, poss: 0, tackles: 0 } };
  G.events = []; G.replay = []; G.particles = [];
}

// ===== Byten =====
const MAX_SUBS = 3;
const energy = p => clamp(1 - p.fatigue / 0.3, 0, 1);
// Byter ut spelaren på planen mot en från bänken. Den nya tar över position och roll, med full ork.
function makeSub(p, rec) {
  const side = p.side;
  if (G.subs[side] >= MAX_SUBS || !G.bench[side].includes(rec)) return false;
  G.subbedOff.push({ side, rec: p.rec, name: p.name, num: p.num, role: p.role, st: p.st, minIn: p.minIn, minOut: Math.min(90, G.clock) });
  G.bench[side] = G.bench[side].filter(r => r !== rec);
  G.subs[side]++;
  Object.assign(p, {
    rec, name: rec.name, num: rec.num, short: surname(rec.name), skin: rec.skin, hair: rec.hair, tr: rec.tr || [], ai: makeAI(rec),
    stamina: 1, fatigue: 0, traitSaid: -99, minIn: Math.min(90, G.clock), popT: 0,
    st: { goals: 0, assists: 0, shots: 0, onT: 0, tackles: 0, saves: 0, passes: 0, passOk: 0, conceded: 0 },
  });
  p.spd = p.ai.speed;
  if (typeof callout === 'function') callout(`Byte ${G.teams[side].short}: ${rec.name} in, ${G.subbedOff[G.subbedOff.length - 1].name} ut.`, 'sub');
  return true;
}
// Datorn (och assistenten när du simulerar) byter ut trötta spelare under andra halvlek.
function aiSubs(side) {
  if (G.subs[side] >= MAX_SUBS || !G.bench[side].length) return;
  const tired = teamOf(side).filter(p => p.role !== 'GK' && energy(p) < 0.62).sort((a, b) => energy(a) - energy(b))[0];
  if (!tired || typeof slotRating !== 'function') return;
  const now = slotRating(tired.rec, tired.role) * (1 - tired.fatigue * 0.5);
  let best = null, bv = 0;
  for (const r of G.bench[side]) { if (r.pos === 'GK') continue; const v = slotRating(r, tired.role); if (v > bv) { bv = v; best = r; } }
  if (best && bv >= now * 0.85) makeSub(tired, best);
}
function autoSubTick() {
  const m = Math.floor(G.clock);
  if (m === G.subMin || m < 55) return;
  G.subMin = m;
  if (m % 6 || m > 84) return;
  for (const side of ['home', 'away']) if (G.silent || !G.userSide || side !== G.userSide) aiSubs(side);
}

function placeKickoff(kickSide) {
  for (const p of G.players) {
    const k = KICKOFF[p.role], s = dirOf(p.side);
    let fx = k[0];
    if (p.side !== kickSide && p.role !== 'GK') fx = Math.min(fx, 0.36);
    p.x = s > 0 ? fx * L : L - fx * L;
    p.y = k[1] * WD;
    p.vx = p.vy = p.wx = p.wy = 0; p.fx = s; p.fy = 0;
    p.stun = p.slide = p.dive = p.fallen = p.kickCD = p.kickAnim = p.charge = p.cele = p.jump = 0;
    p.holding = false; p.charging = false; p.hold = 0; p.stamina = Math.max(p.stamina, 0.6); p.think = 0;
  }
  const s = dirOf(kickSide);
  const kicker = teamOf(kickSide).find(p => p.role === 'FW');
  kicker.x = L / 2 - s * 0.8; kicker.y = CY;
  const mf = teamOf(kickSide).find(p => p.role === 'MF');
  mf.x = L / 2 - s * 5; mf.y = CY - 6;
  Object.assign(ball, { x: L / 2, y: CY, z: 0, vx: 0, vy: 0, vz: 0, owner: kicker, last: kicker, spin: 0, inGoal: -1, passer: null, shooter: null });
  G.net.amp = 0;
}

// ===== Fysik för spelare =====
function movePlayer(p, dt) {
  if (p.stun > 0) {
    p.stun -= dt; if (p.stun <= 0) p.fallen = 0;
    const f = Math.exp(-7 * dt); p.vx *= f; p.vy *= f;
  } else if (p.slide > 0) {
    p.slide -= dt;
    const sp = 2 + 10 * (p.slide / 0.5);
    p.vx = p.sdx * sp; p.vy = p.sdy * sp;
    if (p.slide <= 0) { p.stun = 0.35; p.fallen = 0; }
  } else if (p.acro > 0) {
    p.acro -= dt;
    const f = Math.exp(-6 * dt); p.vx *= f; p.vy *= f;
    if (p.acro <= 0) { p.stun = 0.45; p.fallen = 1; p.fallDir = -p.acroFace; }
  } else if (p.dive > 0) {
    p.dive -= dt;
    p.vx = 0; p.vy = p.diveDir * p.diveSpeed * (p.dive > 0.15 ? 1 : 0.3);
    if (p.dive <= 0) { p.stun = 0.55; p.fallen = 1; p.fallDir = p.diveDir; }
  } else {
    const sta = p.ai.sta;
    let maxV = 6.4 * p.spd * (1 - p.fatigue * 0.5);
    if (ball.owner === p) maxV *= 0.9;
    const moving = p.wx || p.wy;
    const sprint = p.sprint && p.stamina > 0.05 && moving;
    if (sprint) maxV *= 1.36;
    if (p.stamina < 0.15) maxV *= 0.88;
    const acc = 1 - Math.exp(-dt * 9);
    p.vx += (p.wx * maxV * p.run - p.vx) * acc;
    p.vy += (p.wy * maxV * p.run - p.vy) * acc;
    p.stamina = sprint ? Math.max(0, p.stamina - dt * 0.2 * (1.5 - sta)) : Math.min(1, p.stamina + dt * 0.1 * (0.5 + sta));
    p.fatigue = Math.min(0.3, p.fatigue + dt * 0.0022 * (1.4 - sta) * (180 / G.matchSecs));
  }
  p.x = clamp(p.x + p.vx * dt, WALL_X0 + 0.4, WALL_X1 - 0.4);
  p.y = clamp(p.y + p.vy * dt, WALL_Y0 + 0.4, WALL_Y1 - 0.4);
  const sp = Math.hypot(p.vx, p.vy);
  if (sp > 0.6 && p.slide <= 0 && p.dive <= 0 && p.stun <= 0) {
    const k = Math.min(1, dt * 12);
    p.fx += (p.vx / sp - p.fx) * k; p.fy += (p.vy / sp - p.fy) * k;
    const l = Math.hypot(p.fx, p.fy) || 1; p.fx /= l; p.fy /= l;
  }
  p.anim += dt * (2 + sp * 1.9);
  p.kickCD -= dt; p.kickAnim -= dt; p.jump -= dt; p.actT -= dt; p.duel -= dt; p.popT -= dt;
}

function separate() {
  const ps = G.players;
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const a = ps[i], b = ps[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
    if (d < 0.8 && d > 0.001) {
      const push = (0.8 - d) / 2, nx = dx / d, ny = dy / d;
      a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
    }
  }
}

// ===== Bollen =====
function updateBall(dt) {
  const b = ball;
  if (b.owner) {
    const p = b.owner;
    if (p.holding) {
      b.x = p.x + p.fx * 0.3; b.y = p.y + 0.05; b.z = 1.0; b.vx = p.vx; b.vy = p.vy; b.vz = 0;
      return;
    }
    if (p.stun > 0 || p.slide > 0 || p.dive > 0) { b.owner = null; }
    else {
      const sp = Math.hypot(p.vx, p.vy);
      const lead = 0.62 + Math.min(sp, 9) * 0.035 + Math.max(0, Math.sin(p.anim * 0.5)) * 0.14 * Math.min(1, sp / 5);
      const k = 1 - Math.exp(-dt * 18);
      let ox = 0, oy = 0;
      if (acting(p, 'over')) { const a = 1 - p.actT / p.actDur, w = Math.sin(a * Math.PI * 2) * 0.35; ox = -p.fy * w; oy = p.fx * w; }
      if (acting(p, 'turn')) { const a = (1 - p.actT / p.actDur) * TAU; ox = Math.cos(a) * 0.5 - p.fx * lead; oy = Math.sin(a) * 0.5 - p.fy * lead; }
      b.x += (p.x + p.fx * lead + ox - b.x) * k; b.y += (p.y + p.fy * lead + oy - b.y) * k;
      // Bollen vid foten får inte heller hamna i sargen (utom i målöppningen)
      b.y = clamp(b.y, WALL_Y0 + BALL_R, WALL_Y1 - BALL_R);
      if (Math.abs(b.y - CY) > GOAL_HW) b.x = clamp(b.x, WALL_X0 + BALL_R, WALL_X1 - BALL_R);
      b.z = acting(p, 'chest') ? 1.25 * (p.actT / p.actDur) : 0; b.vx = p.vx; b.vy = p.vy; b.vz = 0; b.spin = 0;
      b.rot += sp * dt / BALL_R * 0.5;
      return;
    }
  }
  const px = b.x, py = b.y, pz = b.z;
  if (b.spin) { b.vx += -b.vy * b.spin * dt * 60; b.vy += b.vx * b.spin * dt * 60; b.spin *= Math.exp(-dt * 1.2); }
  b.vz -= GRAV * dt;
  b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
  if (b.z <= 0) {
    b.z = 0;
    if (b.vz < -2.5) { b.vz = -b.vz * 0.5; if (b.vz > 2) snd('bounce', Math.min(1, b.vz / 8)); }
    else b.vz = 0;
  }
  const onGround = b.z <= 0.001 && b.vz === 0;
  const f = Math.exp(-(onGround ? 0.72 : 0.08) * dt);
  b.vx *= f; b.vy *= f;
  const hs = Math.hypot(b.vx, b.vy);
  if (onGround && hs < 0.25) { b.vx = b.vy = 0; }
  b.rot += hs * dt / BALL_R * 0.5;
  goalsAndWalls(px, py, pz, hs);
}

function goalsAndWalls(px, py, pz, hs) {
  const b = ball;
  for (let side = 0; side < 2; side++) {
    const gx = side === 0 ? 0 : L, s = side === 0 ? -1 : 1;
    const was = (px - gx) * s, now = (b.x - gx) * s;
    if (was <= 0 && now > 0 && b.inGoal < 0) {
      const t = was / (was - now), yc = py + (b.y - py) * t, zc = pz + (b.z - pz) * t, dy = Math.abs(yc - CY);
      if (dy < GOAL_HW - BALL_R * 0.5 && zc < GOAL_H - BALL_R * 0.5) {
        b.inGoal = side;
        if (typeof onGoal === 'function') onGoal(side === 0 ? 'away' : 'home');
      } else if (Math.abs(dy - GOAL_HW) < BALL_R + 0.14 && zc < GOAL_H + 0.1) {
        b.x = gx - s * 0.05; b.vx = -b.vx * 0.55; b.vy += Math.sign(yc - CY) * (dy > GOAL_HW ? 2.5 : -2.5);
        snd('post'); G.excite += 0.6; say(`I stolpen! ${b.shooter ? b.shooter.short + ' nära' : ''}`);
      } else if (dy < GOAL_HW + 0.1 && Math.abs(zc - GOAL_H) < BALL_R + 0.14) {
        b.x = gx - s * 0.05; b.vx = -b.vx * 0.5; b.vz = zc > GOAL_H ? Math.abs(b.vz) * 0.5 + 1.5 : -Math.abs(b.vz) * 0.4;
        snd('post'); G.excite += 0.6; say(`I ribban! ${b.shooter ? b.shooter.short + ' nära' : ''}`);
      } else if (b.shooter && G.state === 'play') {
        say(`${b.shooter.short} missar målet.`);
        b.shooter = null;
      }
    }
    const depth = (b.x - gx) * s;
    if (b.inGoal === side) {
      if (depth > GOAL_D - BALL_R) {
        b.x = gx + s * (GOAL_D - BALL_R);
        if (Math.abs(b.vx) > 2) netHit(side, b.y, b.z, Math.abs(b.vx));
        b.vx = -b.vx * 0.12; b.vy *= 0.5; b.vz *= 0.5;
      }
      if (Math.abs(b.y - CY) > GOAL_HW - BALL_R) { b.y = CY + Math.sign(b.y - CY) * (GOAL_HW - BALL_R); b.vy = -b.vy * 0.2; }
      if (b.z > GOAL_H - BALL_R) { b.z = GOAL_H - BALL_R; b.vz = -Math.abs(b.vz) * 0.2; }
    } else if (depth > 0 && depth < GOAL_D && Math.abs(b.y - CY) < GOAL_HW + 0.2 && b.z < GOAL_H) {
      const dSide = GOAL_HW + 0.2 - Math.abs(b.y - CY), dBack = GOAL_D - depth, dTop = GOAL_H - b.z;
      if (dTop < dSide && dTop < dBack) { b.z = GOAL_H + 0.01; b.vz = Math.abs(b.vz) * 0.2; }
      else if (dSide < dBack) { b.y = CY + Math.sign(b.y - CY) * (GOAL_HW + 0.2); b.vy = -b.vy * 0.25; }
      else { b.x = gx + s * (GOAL_D + 0.01); b.vx = s * Math.abs(b.vx) * 0.25; }
    }
  }
  let hit = 0;
  // Kortsidornas sarg gäller inte i målöppningen; där sköter mållinjen, stolparna och ribban bollen
  const mouth = Math.abs(b.y - CY) < GOAL_HW && b.z < GOAL_H;
  if (b.inGoal !== 0 && !mouth && b.x < WALL_X0 + BALL_R) { b.x = WALL_X0 + BALL_R; hit = Math.abs(b.vx); b.vx = Math.abs(b.vx) * 0.5; }
  if (b.inGoal !== 1 && !mouth && b.x > WALL_X1 - BALL_R) { b.x = WALL_X1 - BALL_R; hit = Math.abs(b.vx); b.vx = -Math.abs(b.vx) * 0.5; }
  if (b.y < WALL_Y0 + BALL_R) { b.y = WALL_Y0 + BALL_R; hit = Math.abs(b.vy); b.vy = Math.abs(b.vy) * 0.5; }
  if (b.y > WALL_Y1 - BALL_R) { b.y = WALL_Y1 - BALL_R; hit = Math.abs(b.vy); b.vy = -Math.abs(b.vy) * 0.5; }
  if (hit > 4) snd('thud');
}

function netHit(side, y, z, speed) {
  G.net = { side, t: 0, y, z, amp: Math.min(0.9, 0.2 + speed * 0.03) };
  snd('net');
}

// ===== Sparkar =====
function release(p) {
  ball.owner = null; ball.last = p; p.kickCD = 0.3; p.kickAnim = 0.22; p.holding = false; ball.shooter = null; ball.acro = null; ball.curl = false; ball.chip = false;
}
function launch(p, tx, ty, hz, vh, spin = 0) {
  release(p);
  if (ball.z < 0.05) ball.z = 0.05;
  const dx = tx - ball.x, dy = ty - ball.y, d = Math.hypot(dx, dy) || 1, t = d / vh;
  ball.vx = dx / d * vh; ball.vy = dy / d * vh;
  ball.vz = (hz - ball.z + 0.5 * GRAV * t * t) / t;
  ball.spin = spin;
  snd('kick', Math.min(1, vh / 30));
  spawnGrass(ball.x, ball.y, 5);
}
function groundPass(p, tx, ty) {
  release(p);
  const dx = tx - ball.x, dy = ty - ball.y, d = Math.hypot(dx, dy) || 1;
  const v = clamp(8.5 + 0.8 * d, 11, 28);
  ball.vx = dx / d * v; ball.vy = dy / d * v; ball.vz = 0.8; ball.z = 0.02; ball.spin = 0;
  snd('kick', 0.3);
}
function passTo(p, m, lob = false) {
  const d0 = Math.hypot(m.x - ball.x, m.y - ball.y);
  const err = p.ai.pasErr * (0.5 + d0 * 0.06) * 0.8;
  const ex = rnd(-err, err), ey = rnd(-err, err);
  if (lob) {
    const vh = clamp(10 + d0 * 0.35, 11, 24), t = d0 / vh;
    launch(p, clamp(m.x + m.vx * t + ex, 1, L - 1), clamp(m.y + m.vy * t + ey, 1, WD - 1), 0.4, vh);
  } else {
    const v0 = clamp(8.5 + 0.8 * d0, 11, 28);
    const t = Math.log(v0 / Math.max(1.5, v0 - 0.72 * d0)) / 0.72;
    groundPass(p, clamp(m.x + m.vx * t * 0.9 + ex, 0.5, L - 0.5), clamp(m.y + m.vy * t * 0.9 + ey, 0.5, WD - 0.5));
  }
  p.st.passes++;
  ball.passer = p;
}

function shoot(p, power, aim) {
  const side = p.side, gx = attackX(side);
  if (aim == null) aim = (Math.random() < 0.5 ? -1 : 1) * rnd(0.45, 0.95);
  const d = Math.hypot(gx - ball.x, CY - ball.y);
  const skill = p.ai.shotErr;
  let ty = CY + clamp(aim, -1, 1) * (GOAL_HW - 0.5);
  ty += (Math.random() * 2 - 1) * (0.3 + d * 0.04) * skill;
  const big = has(p, 'pow');
  const vh = 15 + power * 19 + (big ? 4 : 0);
  let hz = 0.3 + power * 1.45 + (Math.random() - 0.5) * 0.5 * skill;
  if (power > 0.93) hz += (power - 0.93) * 40;
  hz = Math.max(0.15, hz);
  // Skruvskott: från sidan, mot bortre stolpen, oftare för tekniska spelare
  const curl = FX.curl && d > 11 && d < 28 && Math.abs(ball.y - CY) > 4 && Math.random() < 0.08 + p.rec.sk.pas / 80 + (has(p, 'crs') ? 0.12 : 0);
  if (curl) {
    // Svårare att placera exakt: skruvskott missar oftare än raka skott
    ty = CY + Math.sign(CY - ball.y) * (GOAL_HW - 0.45) + (Math.random() * 2 - 1) * (0.5 + d * 0.05) * skill;
    curlLaunch(p, gx, ty, Math.min(hz, 1.9), vh * 0.85, Math.sign(ball.y - CY) * dirOf(side) * rnd(0.0035, 0.0055));
    pop(p, 'Skruv!', '#c6a3ff');
  } else launch(p, gx, ty, hz, vh, (Math.random() - 0.5) * 0.004 * power);
  ball.shooter = p;
  G.stats[side].shots++; p.st.shots++;
  if (Math.abs(ty - CY) < GOAL_HW && hz < GOAL_H) { G.stats[side].onTarget++; p.st.onT++; }
  G.excite += 0.35; G.shake = Math.max(G.shake, power * 0.35);
  spawnGrass(ball.x, ball.y, 10);
  if (big) traitSay(p, `💥 Kanonskott från ${p.short}!`); else if (curl) say(`↪️ Skruvat skott av ${p.short}!`); else say(`${p.short} skjuter!`);
}
// Lobb över en målvakt som kommit ut
function chip(p) {
  const gx = attackX(p.side), toGoal = Math.hypot(gx - ball.x, CY - ball.y);
  // Svår teknik: en del lobbar går över ribban eller utanför
  const hz = rnd(0.8, 3.3), ty2 = CY + rnd(-4.2, 4.2);
  launch(p, gx, ty2, hz, clamp(8 + toGoal * 0.35, 9, 16));
  ball.shooter = p; ball.chip = true;
  G.stats[p.side].shots++; p.st.shots++;
  if (hz < GOAL_H && Math.abs(ty2 - CY) < GOAL_HW) { G.stats[p.side].onTarget++; p.st.onT++; }
  G.excite += 0.5;
  pop(p, 'Lobb!', '#9ef0a4');
  say(`🎈 ${p.short} lobbar över målvakten!`);
}

function slideTackle(p) {
  if (p.slide > 0 || p.stun > 0 || p.dive > 0) return;
  let dx = p.wx || p.fx, dy = p.wy || p.fy;
  const l = Math.hypot(dx, dy) || 1;
  p.slide = 0.5; p.sdx = dx / l; p.sdy = dy / l; p.dodged = false;
  snd('slide'); spawnGrass(p.x, p.y, 8);
}

// ===== Närkamper, mottagning, räddningar =====
function contest(dt) {
  const b = ball;
  for (const p of G.players) {
    if (p.slide <= 0.06) continue;
    const bd = Math.hypot(b.x - p.x - p.sdx * 0.5, b.y - p.y - p.sdy * 0.5);
    if (!p.dodged && bd < (has(p, 'tkl') ? 1.3 : 1.05) && b.z < 0.8 && !(b.owner && b.owner.holding) && !(b.owner && b.owner.side === p.side)) {
      const o = b.owner;
      if (o && has(o, 'drb') && Math.random() < 0.5) { p.dodged = true; o.jump = 0.4; traitSay(o, `🌀 ${o.short} hoppar över tacklingen!`); continue; }
      if (o) { o.stun = 0.9; o.fallen = 1; o.fallDir = p.sdx >= 0 ? 1 : -1; }
      b.owner = null; b.last = p; b.passer = null;
      b.vx = p.sdx * 7 + rnd(-1.5, 1.5); b.vy = p.sdy * 7 + rnd(-1.5, 1.5); b.vz = 1.5;
      snd('tackle'); G.stats[p.side].tackles++; p.st.tackles++; spawnGrass(b.x, b.y, 8);
      if (o) say(`Glidtackling av ${p.short}!`);
    }
  }
  if (b.owner) {
    const o = b.owner;
    if (o.holding || (o.actT > 0 && o.actGood)) return;
    for (const p of G.players) {
      if (p.side === o.side || p.stun > 0 || p.slide > 0 || p.dive > 0) continue;
      if (dist(p, o) < 1.3) { p.duel = o.duel = 0.15; p.duelDir = Math.sign(o.x - p.x) || 1; o.duelDir = -p.duelDir; }
      if (Math.hypot(b.x - p.x, b.y - p.y) < 0.75) {
        const rate = p.ai.tackle * tactOf(p.side).press * 0.5;
        if (Math.random() < rate * dt) {
          // Dribblaren behåller bollen och försäkraren tappar balansen en kort stund
          if (has(o, 'drb') && Math.random() < 0.6) { p.stun = 0.4; pop(o, 'Förbi!', '#ffd66b', false); traitSay(o, `🌀 ${o.short} dribblar sig förbi ${p.short}!`); continue; }
          if (has(p, 'tkl')) traitSay(p, `🛡️ Bollvinst av ${p.short}!`);
          if (has(p, 'tkl') || Math.random() < 0.25) pop(p, 'Bollvinst!', '#7be3ff', false);
          stealBy(p, o); return;
        }
      }
    }
    return;
  }
  if (b.z > 2.6) return;
  let best = null, bd = 1e9;
  for (const p of G.players) {
    if (p.stun > 0 || p.slide > 0 || p.kickCD > 0) continue;
    const gk = p.role === 'GK' && inOwnBox(p, b);
    const fly = gk && has(p, 'gkj'), hd = !gk && has(p, 'hdr') && b.z > 1.0;
    const reach = p.dive > 0 ? (fly ? 1.7 : 1.35) : gk ? 1.0 : hd ? 1.0 : 0.8;
    const maxZ = gk ? (p.dive > 0 ? (fly ? 3.0 : 2.6) : 2.4) : hd ? 2.6 : 2.1;
    if (p.acro > 0) continue;
    const d = Math.hypot(b.x - p.x, b.y - p.y);
    if (d < reach && b.z < maxZ && d < bd) { best = p; bd = d; }
  }
  if (best) touch(best);
}

function stealBy(p, o) {
  ball.owner = p; ball.last = p; ball.passer = null; o.stun = 0.35; o.kickCD = 0.5;
  playerAct(p, 'poke', 0.3, Math.sign(o.x - p.x) || 1); playerAct(o, 'stumble', 0.4, Math.sign(o.x - p.x) || 1);
  spawnGrass(ball.x, ball.y, 6);
  snd('tackle'); G.stats[p.side].tackles++; p.st.tackles++;
}

function touch(p) {
  const b = ball, sp = Math.hypot(b.vx, b.vy, b.vz);
  const passer = b.passer;
  if (passer && passer !== p) {
    if (passer.side === p.side) { passer.st.passOk++; p.assistFrom = passer; p.assistT = G.clock; }
    else if (p.role !== 'GK' && FX.intercept) {
      // Brytning: motståndarens passning tas om hand – räknas som bollvinst
      G.stats[p.side].tackles++; p.st.tackles++;
      if ((p.role === 'DL' || p.role === 'DR') && Math.random() < 0.35) pop(p, 'Brytning!', '#7be3ff', false);
    }
    b.passer = null;
  }
  if (p.role === 'GK' && inOwnBox(p, b)) {
    const sk = p.ai.gkSkill;
    const catchP = (p.dive > 0 ? 0.62 : 0.95) * sk - Math.max(0, sp - 14) * 0.02;
    const wasShot = b.shooter && b.shooter.side !== p.side;
    if (wasShot) {
      // Hårda skott kan smita förbi en sämre målvakt
      const saveP = clamp(sk * 1.1 + 0.2 - Math.max(0, sp - 18) * 0.02 + (p.dive > 0 && has(p, 'gkj') ? 0.08 : 0), 0.25, 0.94);
      if (Math.random() > saveP) { p.kickCD = 0.5; return; }
    }
    if (sp < 11 || Math.random() < catchP) {
      b.owner = p; b.last = p; p.holding = true; p.hold = 0; b.vx = b.vy = b.vz = 0;
      snd('catchBall');
      if (wasShot) { p.st.saves++; if (p.dive > 0 && has(p, 'gkj')) traitSay(p, `🧤 Flygande räddning av ${p.short}!`); else say(`Räddning av ${p.short}!`); G.excite += 0.4; }
      b.shooter = null; b.acro = null;
      return;
    }
    const s = dirOf(p.side);
    b.vx = s * (Math.abs(b.vx) * 0.35 + 2); b.vy = b.vy * 0.4 + rnd(-4.5, 4.5); b.vz = rnd(3, 7);
    b.last = p; p.kickCD = 0.5; snd('catchBall');
    if (wasShot) { p.st.saves++; say(`${p.short} boxar undan!`); }
    b.shooter = null; b.acro = null; G.excite += 0.5;
    return;
  }
  if (b.shooter && b.shooter.side !== p.side) { say(`${p.short} blockerar skottet.`); b.shooter = null; b.acro = null; }
  if (tryAcro(p)) return;
  if (FX.chest && p.role !== 'GK' && b.z > 0.95 && b.z < 1.8 && sp < 17 && Math.hypot(attackX(p.side) - p.x, CY - p.y) > 16 && nearestOppDist(p) > 1.2 && Math.random() < 0.45 + p.rec.sk.pas / 40) {
    b.owner = p; b.last = p; b.shooter = null; b.acro = null; b.vx = b.vy = b.vz = 0;
    playerAct(p, 'chest', 0.4, 1, true);
    if (Math.random() < 0.5) pop(p, 'Bröstet!', '#ffffff', false);
    if (Math.random() < 0.3) traitSay(p, `${p.short} tar ner bollen på bröstet.`);
    return;
  }
  if (b.z > 1.15) { header(p); return; }
  if (sp > 22 && Math.random() < 0.4) { b.vx *= -0.3; b.vy *= -0.3; b.last = p; p.kickCD = 0.2; snd('bounce', 0.6); return; }
  b.owner = p; b.last = p; b.shooter = null; b.acro = null;
}

function header(p) {
  const s = dirOf(p.side), gx = attackX(p.side);
  const toGoal = Math.hypot(gx - p.x, CY - p.y);
  p.jump = 0.4;
  const king = has(p, 'hdr');
  if (toGoal < (king ? 21 : 17) && (gx - p.x) * s > 1) {
    launch(p, gx, CY + rnd(-GOAL_HW * 0.8, GOAL_HW * 0.8) * (0.6 + p.ai.shotErr * 0.4) * (king ? 0.75 : 1), rnd(0.4, 1.9), king ? rnd(14, 18) : rnd(12, 17));
    ball.shooter = p; G.stats[p.side].shots++; p.st.shots++; G.excite += 0.3;
    if (king) traitSay(p, `🎯 ${p.short} nickar mot mål!`); else say(`${p.short} nickar mot mål!`);
  } else {
    release(p);
    ball.vx = s * rnd(8, 12) + p.vx * 0.3; ball.vy = rnd(-3, 3) + p.vy * 0.3; ball.vz = rnd(2.5, 4.5);
    snd('kick', 0.35);
  }
}

// ===== Partiklar =====
function spawnGrass(x, y, n) {
  if (G.silent) return;
  for (let i = 0; i < n; i++) {
    G.particles.push({ x, y, z: 0.05, vx: rnd(-2.5, 2.5), vy: rnd(-2.5, 2.5), vz: rnd(1.5, 4), life: rnd(0.4, 0.8), c: Math.random() < 0.5 ? '#5da84f' : '#3d7a35' });
  }
}
function updateParticles(dt) {
  const ps = G.particles;
  for (let i = ps.length - 1; i >= 0; i--) {
    const q = ps[i];
    q.life -= dt; q.vz -= 12 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z = Math.max(0, q.z + q.vz * dt);
    if (q.life <= 0) ps.splice(i, 1);
  }
}
