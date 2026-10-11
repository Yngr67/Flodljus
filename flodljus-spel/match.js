'use strict';
// ===================== Matchkontroll =====================
const $ = id => document.getElementById(id);
const HALFTIME_SECS = 4.5;
// Kraschdetektor: en markering sparas medan en match pågår. Finns den kvar när spelet startar
// har telefonen stängt sidan mitt i matchen – då sparas vad som hände och grafiken sätts till Låg.
const LIVE_KEY = 'flodljus-pagaende-match';
function markLive(clear) {
  try {
    if (clear) localStorage.removeItem(LIVE_KEY);
    else localStorage.setItem(LIVE_KEY, JSON.stringify({ v: GAME_VERSION, min: Math.round(G.clock), st: G.state, rep: !$('report').hidden, low: GFX.low, sound: !Sound.muted, hidden: document.hidden, speed: Match.speed, n: Match.count || 0, up: Math.round(performance.now() / 60000), t: Date.now() }));
  } catch (e) { /* ingen lagring */ }
}
const Match = { active: false, speed: 1, onEnd: null, att: null, feed: [], replays: true, done: false, result: null, meta: null };

function kickoff(side) {
  placeKickoff(side);
  G.state = 'kickoff'; G.stateT = 0; G.timeScale = 1; G.replay = []; trail.length = 0;
}

function playStep(dt) {
  aiUpdate(dt);
  for (const p of G.players) movePlayer(p, dt);
  separate();
  updateBall(dt);
  if (G.state === 'play') contest(dt);
  updateParticles(dt);
  if (ball.owner) G.stats[ball.owner.side].poss += dt;
  if (G.state === 'play') clockTick(dt);
  if (!G.silent) record();
}

function step(dt) {
  G.stateT += dt;
  switch (G.state) {
    case 'play': playStep(dt); break;
    case 'kickoff':
      updateBall(dt);
      if (G.stateT > (G.silent ? 0.3 : 1.1)) { G.state = 'play'; G.stateT = 0; snd('whistle', 1); }
      break;
    case 'goal':
      celebrateAI(dt);
      for (const p of G.players) movePlayer(p, dt);
      separate(); updateBall(dt); updateParticles(dt);
      if (G.stateT < 1.2) record();
      if (G.stateT > 0.3) G.timeScale = 1;
      if (G.stateT > 2.8) { if (Match.replays && Match.speed === 1) startReplay(); else { hideBanner(); kickoff(G.kickoffTeam); } }
      break;
    case 'replay': {
      const i = Math.floor(G.rp);
      G.rp += Math.abs(i - G.goalFrame) < 22 ? 0.175 : 0.45;
      if (G.rp >= G.replay.length - 1 || G.skipReplay) endReplay();
      break;
    }
    case 'halftime':
      // Halvtidspaus: 4,5 sekunder verklig tid även på 2× och 4× (stateT räknas i speltid)
      if (G.stateT > (G.silent ? 0 : HALFTIME_SECS * Match.speed)) {
        hideBanner();
        for (const p of G.players) { p.fatigue *= 0.6; p.stamina = 1; }
        kickoff('away');
      }
      break;
    case 'fulltime':
      if (!G.silent) { celebrateAI(dt); for (const p of G.players) movePlayer(p, dt); separate(); updateBall(dt); }
      break;
  }
  G.net.t += dt;
  G.excite = Math.max(0, G.excite - dt * 0.25);
  G.shake *= Math.exp(-dt * 5);
}

function clockTick(dt) {
  G.clock += dt * 90 / G.matchSecs;
  if (G.halftimeDone) autoSubTick();
  const calm = ball.owner || Math.hypot(ball.vx, ball.vy) < 10;
  if (!G.halftimeDone && G.clock >= 45 && calm) {
    G.halftimeDone = true; G.clock = 45; G.state = 'halftime'; G.stateT = 0;
    snd('whistle', 2, true);
    callout(`Halvtid: ${G.teams.home.short} ${G.score.home}–${G.score.away} ${G.teams.away.short}`);
    if (!G.silent) { showBanner('HALVTID', `${G.teams.home.name}  ${G.score.home} – ${G.score.away}  ${G.teams.away.name}`, '#ffd66b'); $('bannerHint').textContent = 'Andra halvlek börjar strax · tryck på planen för att starta direkt · tryck Byten för att byta'; }
  } else if (G.clock >= 90 && calm) { G.clock = 90; fullTime(); }
}

function onGoal(side) {
  if (G.state !== 'play') return;
  G.score[side]++;
  const sc = ball.last && ball.last.side === side ? ball.last : null;
  let assist = null;
  if (sc) {
    sc.st.goals++;
    if (sc.assistFrom && sc.assistFrom.side === side && sc.assistFrom !== sc && G.clock - sc.assistT < 5) { assist = sc.assistFrom; assist.st.assists++; }
  }
  for (const p of teamOf(other(side))) p.st.conceded++;
  const min = Math.max(1, Math.ceil(G.clock));
  const acro = sc && ball.acro && ball.shooter === sc ? ball.acro : null;
  G.events.push({ min, side, scorer: sc ? sc.name : null, assist: assist ? assist.name : null, acro });
  G.goalSide = side; G.scorer = sc; G.kickoffTeam = other(side); G.goalFrame = G.replay.length;
  callout(`${acro ? ACRO[acro].icon + ' ' + ACRO[acro].name.toUpperCase() + '-MÅL' : 'MÅL'}! ${sc ? sc.name : 'Självmål'}${assist ? ` (${assist.short})` : ''} – ${G.teams.home.short} ${G.score.home}–${G.score.away} ${G.teams.away.short}`, 'goal');
  if (G.silent) { kickoff(G.kickoffTeam); return; }
  G.state = 'goal'; G.stateT = 0; G.timeScale = Match.speed === 1 ? 0.35 : 1;
  G.excite = 1.6; G.shake = 1;
  snd('goal');
  const k = G.kits[side];
  showBanner(acro ? ACRO[acro].big : sc ? 'MÅL!' : 'SJÄLVMÅL', `${sc ? sc.name : G.teams[side].name}  ·  ${min}'`, k.shirt);
  spawnConfetti([k.shirt, k.shorts, k.num, '#ffffff']);
}

function fullTime() {
  G.state = 'fulltime'; G.stateT = 0;
  snd('whistle', 3, true);
  G.goalSide = G.score.home > G.score.away ? 'home' : G.score.away > G.score.home ? 'away' : null; G.scorer = null;
  callout(`Slutsignal: ${G.teams.home.short} ${G.score.home}–${G.score.away} ${G.teams.away.short}`);
  Match.result = buildResult();
  if (!G.silent) { subsButton(); setTimeout(() => showReport(), 1400); }
}

function buildResult() {
  const players = { home: [], away: [] };
  const add = (p, minOut, off) => {
    const op = G.score[other(p.side)], mine = G.score[p.side];
    players[p.side].push({ id: p.rec.id, name: p.name, num: p.num, role: p.role, goals: p.st.goals, assists: p.st.assists, rating: rateMatch(p, p.st, mine > op, mine < op, op), st: { ...p.st }, min: Math.round(minOut - p.minIn), minIn: Math.round(p.minIn), off });
  };
  for (const p of G.players) add(p, 90, false);
  for (const p of G.subbedOff) add(p, p.minOut, true);
  return { hg: G.score.home, ag: G.score.away, events: G.events.slice(), stats: JSON.parse(JSON.stringify(G.stats)), players, att: Match.att };
}

// ===== Repris =====
function snap(p) {
  return {
    side: p.side, role: p.role, num: p.num, idx: p.idx, x: p.x, y: p.y, vx: p.vx, vy: p.vy, anim: p.anim, fx: p.fx, fy: p.fy,
    slide: p.slide, sdx: p.sdx, dive: p.dive, diveDir: p.diveDir, diveUp: p.diveUp, stun: p.stun, fallen: p.fallen, fallDir: p.fallDir,
    kickAnim: p.kickAnim, acro: p.acro, acroType: p.acroType, acroFace: p.acroFace, jump: p.jump, cele: p.cele, actType: p.actType, actT: p.actT, actDur: p.actDur, actDir: p.actDir, duel: p.duel, duelDir: p.duelDir, popText: p.popText, popColor: p.popColor, popT: p.popT, skin: p.skin, hair: p.hair, charging: false, charge: 0, short: p.short,
  };
}
// Reprisen sparar varannan bildruta (halva minnet); uppspelningen mellan bilderna jämnas ut ändå
let recTick = 0;
function record() {
  if (recTick++ % 2) return;
  G.replay.push({ b: { x: ball.x, y: ball.y, z: ball.z, vx: ball.vx, vy: ball.vy, vz: ball.vz, rot: ball.rot, owned: !!ball.owner }, ps: G.players.map(snap), net: { ...G.net } });
  if (G.replay.length > 165) { G.replay.shift(); G.goalFrame--; }
}
function startReplay() {
  hideBanner();
  G.state = 'replay'; G.stateT = 0; G.skipReplay = false;
  G.rp = Math.max(0, G.goalFrame - 85);
  $('matchView').classList.add('replaying'); trail.length = 0;
}
function endReplay() {
  $('matchView').classList.remove('replaying');
  G.skipReplay = false;
  kickoff(G.kickoffTeam);
}
function replayView() {
  const Rp = G.replay;
  if (Rp.length < 2) return liveView();
  const i = clamp(Math.floor(G.rp), 0, Rp.length - 2), f = clamp(G.rp - i, 0, 1), A = Rp[i], B = Rp[i + 1];
  const lerp = (a, b) => a + (b - a) * f;
  const players = A.ps.map((p, k) => { const q = B.ps[k]; return Object.assign({}, p, { x: lerp(p.x, q.x), y: lerp(p.y, q.y), anim: lerp(p.anim, q.anim) }); });
  const b = { x: lerp(A.b.x, B.b.x), y: lerp(A.b.y, B.b.y), z: lerp(A.b.z, B.b.z), vx: A.b.vx, vy: A.b.vy, vz: A.b.vz, rot: lerp(A.b.rot, B.b.rot), owner: A.b.owned ? {} : null };
  G.net = { ...A.net };
  return { players, b, human: null, tagged: null };
}
const liveView = () => ({ players: G.players, b: ball, human: null, tagged: ball.owner && G.state === 'play' ? ball.owner : null });

// ===== HUD och kommentarer =====
let calloutT = null;
function callout(text, kind) {
  const min = Math.max(1, Math.ceil(G.clock));
  Match.feed.unshift({ min, text, kind });
  if (Match.feed.length > 40) Match.feed.length = 40;
  if (G.silent) return;
  addFeedRow(Match.feed[0]);
}
// Varje händelse visas en stund och tonar sedan bort (mål stannar längre). Högst 3 rader åt gången.
function addFeedRow(f) {
  const el = $('feed');
  const row = document.createElement('div');
  row.className = 'feed-row' + (f.kind === 'goal' ? ' goal' : f.kind === 'sub' ? ' sub' : '');
  const m = document.createElement('b'); m.textContent = `${f.min}'`;
  const t = document.createElement('span'); t.textContent = f.text;
  row.append(m, t);
  row.addEventListener('animationend', () => row.remove());
  el.prepend(row);
  while (el.children.length > 3) el.lastChild.remove();
}
function clearFeed() { $('feed').innerHTML = ''; }
function showBanner(big, sub, glow) {
  $('bannerBig').textContent = big; $('bannerSub').textContent = sub;
  $('banner').style.setProperty('--glow', glow); $('banner').classList.add('show');
}
function hideBanner() { $('banner').classList.remove('show'); $('bannerHint').textContent = ''; }
function setText(e, v) { v = String(v); if (e._v !== v) { e._v = v; e.textContent = v; } }
function matchHud() {
  setText($('scH'), G.score.home); setText($('scA'), G.score.away);
  setText($('clock'), G.state === 'halftime' ? 'HT' : Math.min(90, Math.floor(G.clock)) + "'");
  const tot = (G.stats.home.poss + G.stats.away.poss) || 1;
  setText($('possH'), Math.round(G.stats.home.poss / tot * 100) + '%');
  setText($('possA'), Math.round(G.stats.away.poss / tot * 100) + '%');
  setText($('shotsH'), `${G.stats.home.shots} (${G.stats.home.onTarget})`);
  setText($('shotsA'), `${G.stats.away.shots} (${G.stats.away.onTarget})`);
}

// ===== Start, snabbsimulering, rapport =====
function startMatch(meta) {
  // meta: { home, away (motorlag), arena, att, userSide, onEnd, roundLabel }
  clearFeed();
  Match.count = (Match.count || 0) + 1;
  Match.meta = meta; Match.onEnd = meta.onEnd; Match.att = meta.att; Match.feed = []; Match.done = false; Match.result = null;
  G.silent = false; setPaused(false); autoPaused = false; G.matchSecs = 180; Match.speed = 1;
  setupMatch(meta.home, meta.away); G.userSide = meta.userSide;
  buildArena(meta.arena);
  closeSubs(true);
  $('nameH').textContent = meta.home.short; $('nameA').textContent = meta.away.short;
  $('kitH').style.background = G.kits.home.shirt; $('kitA').style.background = G.kits.away.shirt;
  $('matchTitle').textContent = `${meta.home.name} – ${meta.away.name}`;
  $('matchSub').textContent = `${meta.roundLabel} · Publik ${meta.att.total.toLocaleString('sv-SE')}`;
  $('tacticSel').value = G.teams[meta.userSide].tactic;
  $('report').hidden = true;
  document.querySelectorAll('#speedSeg button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === 1)));
  $('matchView').hidden = false; $('matchView').classList.remove('replaying');
  Match.active = true;
  resize();
  cam.x = L / 2;
  kickoff('home'); subsButton();
  markLive(false); Match.liveT = 0;
  $('btnGfx').textContent = GFX.low ? 'Grafik: låg' : 'Grafik: hög';
  callout(`Avspark på ${meta.home.name}s arena inför ${meta.att.total.toLocaleString('sv-SE')} åskådare.`);
  Sound.init();
}
function simulateRest() {
  if (G.state === 'fulltime') return;
  closeSubs(true);
  G.silent = true; hideBanner();
  $('matchView').classList.remove('replaying');
  if (G.state === 'goal' || G.state === 'replay') kickoff(G.kickoffTeam);
  let n = 0;
  while (G.state !== 'fulltime' && n++ < 200000) step(STEP);
  G.silent = false;
  clearFeed(); matchHud();
  setTimeout(showReport, 200);
}
function quickMatch(meta) {
  setupMatch(meta.home, meta.away); G.userSide = meta.userSide;
  G.silent = true; G.matchSecs = 180; Match.feed = []; Match.att = meta.att; Match.result = null;
  kickoff('home');
  let n = 0;
  while (G.state !== 'fulltime' && n++ < 200000) step(STEP);
  G.silent = false;
  return Match.result;
}

function showReport() {
  if (Match.done || !Match.result) return;
  const r = Match.result, meta = Match.meta, us = meta.userSide;
  const gf = us === 'home' ? r.hg : r.ag, ga = us === 'home' ? r.ag : r.hg;
  $('repTitle').textContent = gf > ga ? 'Seger!' : gf < ga ? 'Förlust' : 'Oavgjort';
  $('repScore').textContent = `${r.hg} – ${r.ag}`;
  $('repH').textContent = meta.home.short; $('repA').textContent = meta.away.short;
  const goals = r.events.map(e => `<li><b>${e.min}'</b> ${esc(e.scorer || 'Självmål')}${e.assist ? ` <small>(${esc(e.assist)})</small>` : ''} <i>${esc(G.teams[e.side].short)}</i></li>`).join('');
  $('repGoals').innerHTML = goals || '<li class="muted">Inga mål</li>';
  const tot = (r.stats.home.poss + r.stats.away.poss) || 1;
  $('repStats').innerHTML = [
    [r.stats.home.shots, 'Skott', r.stats.away.shots],
    [r.stats.home.onTarget, 'Skott på mål', r.stats.away.onTarget],
    [Math.round(r.stats.home.poss / tot * 100) + '%', 'Bollinnehav', Math.round(r.stats.away.poss / tot * 100) + '%'],
    [r.stats.home.tackles, 'Bollvinster', r.stats.away.tackles],
  ].map(x => `<span>${x[0]}</span><span>${x[1]}</span><span>${x[2]}</span>`).join('');
  const mine = r.players[us].slice().sort((a, b) => b.rating - a.rating);
  const all = r.players.home.concat(r.players.away), best = all.reduce((a, b) => (b.rating > a.rating ? b : a));
  $('repMotm').textContent = `Matchens lirare: ${best.name} (${best.rating.toFixed(1)})`;
  $('repRatings').innerHTML = mine.map(p => `<tr><td>${p.num}</td><td>${esc(p.name)}${p.off ? ` <small class="bad">▼ ${p.minIn + p.min}'</small>` : p.minIn ? ` <small class="good">▲ ${p.minIn}'</small>` : ''}</td><td>${SLOT_NAME[p.role]}</td><td>${p.goals ? '⚽'.repeat(p.goals) : ''}${p.assists ? ` <small>${p.assists} ass</small>` : ''}</td><td class="num"><span class="rating ${ratingClass(p.rating)}">${p.rating.toFixed(1)}</span></td></tr>`).join('');
  $('repAtt').textContent = meta.userSide === 'home' ? `Publik ${r.att.total.toLocaleString('sv-SE')} av ${r.att.cap.toLocaleString('sv-SE')} · Biljettintäkter ${money(r.att.income)}` : `Publik ${r.att.total.toLocaleString('sv-SE')} (bortamatch)`;
  $('report').hidden = false;
  $('btnContinue').focus();
}
function ratingClass(v) { return v >= 7.5 ? 'hi' : v >= 6.3 ? 'mid' : 'lo'; }
function closeMatch() {
  if (Match.done) return;
  Match.done = true; Match.active = false;
  markLive(true);
  $('matchView').hidden = true; $('report').hidden = true;
  Sound.crowdOff(); Sound.suspend();
  if (Match.onEnd) Match.onEnd(Match.result);
}

// ===== Loop =====
let lastT = performance.now(), acc = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = clamp((now - lastT) / 1000, 0, 0.1); lastT = now;
  if (!Match.active) return;
  try { frameBody(dt); } catch (e) { recordError(e, `match ${G.state} ${Math.round(G.clock)}'`); }
}
function frameBody(dt) {
  Match.liveT = (Match.liveT || 0) + dt;
  if (Match.liveT > (G.clock > 80 || G.state === 'fulltime' ? 1 : 5)) { Match.liveT = 0; markLive(false); }
  G.time += dt;
  if (!G.paused) {
    acc += dt * G.timeScale * Match.speed;
    let n = 0;
    const cap = 8 * Match.speed;
    while (acc >= STEP && n < cap) { step(STEP); acc -= STEP; n++; }
    if (n >= cap) acc = 0;
  }
  const replay = G.state === 'replay';
  const view = replay ? replayView() : liveView();
  G.zoomPulse = Math.max(0, (G.zoomPulse || 0) - dt);
  camUpdate(dt, view.b.x, view.b.y, replay ? 1.3 : (G.state === 'goal' ? 1.12 : G.zoomPulse > 0 ? 1.1 : 1), replay);
  render(view, G.paused ? 0 : dt);
  if (!replay) drawMini(view.players, view.b, null);
  matchHud();
  const ng = Math.min(Math.abs(ball.x), Math.abs(L - ball.x));
  if (G.state === 'fulltime') Sound.crowdFade(1 - G.stateT / 4);
  else Sound.crowd(G.paused ? 0.05 : (0.15 + Math.max(0, 1 - ng / 30) * 0.4 + G.excite * 0.6) * Math.min(1, 0.3 + (Match.att ? Match.att.total / 4000 : 0.5)));
}
requestAnimationFrame(frame);
addEventListener('resize', () => { if (Match.active) resize(); });

// Kontroller i matchvyn
document.querySelectorAll('#speedSeg button').forEach(b => b.addEventListener('click', () => {
  Match.speed = +b.dataset.v;
  document.querySelectorAll('#speedSeg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  if (Match.speed > 1 && G.state === 'replay') G.skipReplay = true;
}));
$('btnSimRest').addEventListener('click', simulateRest);
$('tacticSel').addEventListener('change', e => {
  const side = Match.meta.userSide;
  G.teams[side].tactic = e.target.value;
  callout(`Taktikbyte: ${TACTIC_NAME[e.target.value]}.`);
});
let autoPaused = false;
function setPaused(on) {
  G.paused = on;
  $('matchView').classList.toggle('paused', on);
  $('btnPauseM').textContent = on ? 'Fortsätt' : 'Paus';
  if (!on && autoPaused) { autoPaused = false; hideBanner(); }
}
$('btnPauseM').addEventListener('click', () => { Sound.resume(); setPaused(!G.paused); });
// Skärmen släcks / appen byts: pausa matchen, tysta ljudet och spara karriären.
// Webbläsaren stoppar ändå sidan i bakgrunden, och mobilen kan kasta den ur minnet.
function goBackground() {
  Sound.suspend();
  if (typeof saveCareer === 'function') saveCareer();
  if (Match.active && !G.paused && G.state !== 'fulltime') {
    setPaused(true); autoPaused = true;
    showBanner('PAUS', 'Tryck Fortsätt för att spela vidare', '#ffd66b');
  }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) goBackground(); else if (Match.active) Sound.resume(); });
addEventListener('pagehide', goBackground);
$('btnGfx').textContent = GFX.low ? 'Grafik: låg' : 'Grafik: hög';
$('btnGfx').addEventListener('click', () => { setLowGfx(!GFX.low); $('btnGfx').textContent = GFX.low ? 'Grafik: låg' : 'Grafik: hög'; resize(); markLive(false); });
$('btnMuteM').addEventListener('click', () => { Sound.init(); Sound.setMuted(!Sound.muted); $('btnMuteM').textContent = Sound.muted ? 'Ljud: av' : 'Ljud: på'; });
$('btnContinue').addEventListener('click', closeMatch);

// ===== Bytespanel =====
// Matchen pausas medan panelen är öppen. Tryck först på spelaren som ska ut, sedan på den som ska in.
const Subs = { open: false, wasPaused: false, out: null };
function subsButton() {
  const left = MAX_SUBS - G.subs[G.userSide];
  $('btnSubs').textContent = `Byten ${left}`;
  $('btnSubs').disabled = left <= 0 || !G.bench[G.userSide].length || G.state === 'fulltime';
}
const enColor = e => (e > 0.6 ? 'var(--good)' : e > 0.35 ? '#e8d45a' : '#f0a24b');
function liveRating(p) { const op = G.score[other(p.side)], mine = G.score[p.side]; return clamp(6 + p.st.goals + p.st.assists * 0.6 + p.st.onT * 0.15 + Math.min(1, p.st.tackles * 0.04) + p.st.saves * 0.25 + Math.min(0.8, p.st.passOk * 0.015) + (mine > op ? 0.3 : mine < op ? -0.3 : 0) - (p.role === 'GK' ? op * 0.35 : 0), 3, 10); }
function renderSubs() {
  const side = G.userSide, left = MAX_SUBS - G.subs[side];
  $('subLeft').textContent = left ? `${left} ${left === 1 ? 'byte' : 'byten'} kvar` : 'Inga byten kvar';
  $('subHint').textContent = !left ? 'Du har gjort alla byten.' : Subs.out ? `2. Välj vem som ska in som ${SLOT_NAME[Subs.out.role].toLowerCase()} istället för ${Subs.out.short}. Siffran visar hur bra spelaren passar positionen.` : '1. Tryck på spelaren som ska ut. Stapeln visar hur mycket ork spelaren har kvar.';
  $('subOn').innerHTML = teamOf(side).map((p, i) => {
    const e = energy(p);
    return `<button class="subrow" type="button" data-i="${i}" aria-pressed="${Subs.out === p}"${left ? '' : ' disabled'}><b>${p.num}</b><span class="nm">${esc(p.name)} <small>${SLOT_SHORT[p.role] || p.role}${p.minIn ? ' · in ' + Math.round(p.minIn) + "'" : ''}</small></span><span class="fit">${liveRating(p).toFixed(1)}</span><span class="en"><i style="width:${Math.round(e * 100)}%;background:${enColor(e)}"></i></span></button>`;
  }).join('');
  const bench = G.bench[side].slice().sort((a, b) => (Subs.out ? slotRating(b, Subs.out.role) - slotRating(a, Subs.out.role) : 0));
  $('subBench').innerHTML = bench.length ? bench.map(r => `<button class="subrow" type="button" data-id="${r.id}"${Subs.out && left ? '' : ' disabled'}><b>${r.num}</b><span class="nm">${esc(r.name)} <small>${POS_NAME[r.pos]}${r.tr && r.tr.length ? ' · ' + r.tr.map(k => TRAITS[k].icon).join('') : ''}</small></span><span class="fit">${disp(Subs.out ? slotRating(r, Subs.out.role) : ovr(r))}</span></button>`).join('') : '<p class="muted" style="margin:0">Ingen kvar på bänken.</p>';
}
function openSubs() {
  if (!Match.active || G.state === 'fulltime' || Subs.open) return;
  Subs.open = true; Subs.wasPaused = G.paused; Subs.out = null;
  setPaused(true); hideBanner();
  $('subPanel').hidden = false;
  renderSubs();
}
function closeSubs(silent) {
  if (!Subs.open) { $('subPanel').hidden = true; return; }
  Subs.open = false; Subs.out = null;
  $('subPanel').hidden = true;
  if (!silent && !Subs.wasPaused) setPaused(false);
  subsButton();
}
$('btnSubs').addEventListener('click', openSubs);
$('btnSubsDone').addEventListener('click', () => closeSubs(false));
$('subOn').addEventListener('click', e => {
  const b = e.target.closest('button[data-i]'); if (!b || b.disabled) return;
  const p = teamOf(G.userSide)[+b.dataset.i];
  Subs.out = Subs.out === p ? null : p; renderSubs();
});
$('subBench').addEventListener('click', e => {
  const b = e.target.closest('button[data-id]'); if (!b || b.disabled || !Subs.out) return;
  const rec = G.bench[G.userSide].find(r => r.id === +b.dataset.id);
  if (rec && makeSub(Subs.out, rec)) { snd('whistle', 1); Subs.out = null; renderSubs(); subsButton(); }
});
$('pitch').addEventListener('pointerdown', () => {
  if (G.state === 'replay') G.skipReplay = true;
  if (G.state === 'halftime' && !G.paused) G.stateT = 1e9; // tryck för att starta andra halvlek direkt
});
addEventListener('keydown', e => {
  if (!Match.active) return;
  if (e.code === 'Space' && G.state === 'replay') { e.preventDefault(); G.skipReplay = true; }
});
