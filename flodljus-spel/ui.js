'use strict';
// ===================== Gränssnitt: skal, flöde, översikt, trupp =====================
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TABS = [['overview', 'Översikt'], ['squad', 'Trupp'], ['lineup', 'Laguppställning'], ['training', 'Träning'], ['transfer', 'Transfer'], ['arena', 'Arena'], ['staff', 'Personal'], ['economy', 'Ekonomi'], ['league', 'Serien']];
const SCREENS = {}, ACTIONS = {};
let tab = 'overview';
const START = { kit: 0, saved: null };

function traitBadges(p) { return (p.tr || []).map(k => `<span class="trt" title="${TRAITS[k].name}: ${TRAITS[k].desc}">${TRAITS[k].icon}</span>`).join(''); }
function traitText(p) { return (p.tr || []).map(k => TRAITS[k].icon).join(''); }
function traitList(p) {
  return p.tr && p.tr.length ? `<div class="traits">${p.tr.map(k => `<div><span class="trt">${TRAITS[k].icon}</span> <b>${TRAITS[k].name}</b> <span class="muted">${TRAITS[k].desc}</span></div>`).join('')}</div>` : '';
}
function highlightRow(h) { return `<li class="good"><small>S${h.s} · O${h.w} · ${h.min}'</small>${ACRO[h.type].icon} <b>${ACRO[h.type].name}</b> av ${esc(h.scorer)} (${esc(h.team)}) mot ${esc(h.vs)}</li>`; }
function skLevel(v) { return v < 5 ? 0 : v < 8 ? 1 : v < 11 ? 2 : v < 14 ? 3 : v < 17 ? 4 : 5; }
function skCell(v) { return `<span class="sk l${skLevel(v)}" title="${levelName(v)}">${disp(v)}</span>`; }
function skColor(v) { return ['#e0605a', '#f0a24b', '#e8d45a', '#6fd08c', '#4fd1c5', '#b58cff'][skLevel(v)]; }
function formDots(f) { return `<span class="form" title="Form ${f} av 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= f ? 'on' : ''}"></i>`).join('')}</span>`; }
function moodName(m) { return m >= 85 ? 'Euforisk' : m >= 65 ? 'Nöjd' : m >= 45 ? 'Lugn' : m >= 25 ? 'Orolig' : 'Arg'; }
function kitVars(k) { return `--shirt:${k.stripes ? `repeating-linear-gradient(90deg, ${k.shirt} 0 4px, ${k.stripes} 4px 7px)` : k.shirt};--shorts:${k.shorts}`; }
function crest(k, size = 34) { return `<div class="crest" style="${kitVars(k)};width:${size}px;height:${Math.round(size * 1.18)}px"></div>`; }
function potLabel(p) { const d = p.pot - ovr(p); return d > 4 ? 'Stor talang' : d > 2 ? 'Kan utvecklas' : d > 0.8 ? 'Lite kvar att ge' : 'Färdigutvecklad'; }
function statusTags(p) {
  return `${p.inj ? `<span class="tag inj">Skadad ${p.inj} v</span>` : ''}${p.away ? `<span class="tag" style="background:rgba(123,227,255,.15);color:#7be3ff">🌍 Landslag ${p.away} omg</span>` : ''}${p.listed ? '<span class="tag sale">Till salu</span>' : ''}${p.rise && p.rise >= C.season * 100 + C.round - 1 ? '<span class="tag up">▲ Utvecklas</span>' : ''}`;
}

let toastT = null;
function toast(msg, bad) {
  const el = $('toast'); el.textContent = msg; el.className = 'show' + (bad ? ' bad' : '');
  clearTimeout(toastT); toastT = setTimeout(() => { el.className = ''; }, 3200);
}
function modal(html) {
  const root = $('modalRoot');
  root.innerHTML = `<div class="overlay" id="ov"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  root.querySelector('#ov').addEventListener('click', e => { if (e.target.id === 'ov') closeModal(); });
  const f = root.querySelector('.btn.primary') || root.querySelector('button'); if (f) f.focus();
}
function closeModal() { $('modalRoot').innerHTML = ''; }
addEventListener('keydown', e => { if (e.key === 'Escape' && $('modalRoot').innerHTML) closeModal(); });
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const f = ACTIONS[el.dataset.act];
  if (f) { e.preventDefault(); f(el); }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-change]');
  if (el && ACTIONS[el.dataset.change]) ACTIONS[el.dataset.change](el);
});
function act(result, okMsg) {
  if (result) { toast(result, true); return false; }
  saveCareer(); if (okMsg) toast(okMsg); refresh(); return true;
}

// ===== Skal =====
function renderHeader() {
  const t = userTeam(), cl = C.club;
  $('crest').setAttribute('style', kitVars(t.kit));
  $('clubName').textContent = t.name;
  $('clubSub').textContent = C.pre > 0 ? `Division ${C.div} · Säsong ${C.season} · Försäsong, vecka ${PRE_WEEKS - C.pre + 1} av ${PRE_WEEKS} · ${fmtDate(preDate(PRE_WEEKS - C.pre))}` : C.round < C.fixtures.length ? `Division ${C.div} · Säsong ${C.season} · Omgång ${C.round + 1} av ${C.fixtures.length} · ${fmtDate(cupPending() ? cupDate(cupPending().stage) : leagueDate(C.round))}` : `Division ${C.div} · Säsong ${C.season}`;
  $('kCash').textContent = money(cl.cash); $('kCash').className = cl.cash < 0 ? 'bad' : '';
  $('kFans').textContent = cl.fans.toLocaleString('sv-SE');
  $('kMood').textContent = moodName(cl.mood);
  $('kPos').textContent = `${table().findIndex(r => r.t.user) + 1}:a`;
}
function renderTabs() {
  $('tabs').innerHTML = TABS.map(([k, n]) => `<button type="button" id="tab-${k}" data-act="tab" data-tab="${k}"${k === tab ? ' aria-current="page"' : ''}>${n}${k === 'transfer' && C.offers.length ? `<span class="dot">${C.offers.length}</span>` : ''}</button>`).join('');
}
function show(t) {
  tab = t; renderTabs(); renderHeader();
  $('view').innerHTML = `<div class="wrap">${SCREENS[t]()}</div>`;
}
function refresh() { show(tab); }
ACTIONS.tab = el => { show(el.dataset.tab); window.scrollTo(0, 0); };

// ===== Start =====
// Visar senaste felet (om något), så att det kan skickas till Claude
function diagCard(saved) {
  let d = saved && saved.diag;
  try { const l = JSON.parse(localStorage.getItem('flodljus-senaste-fel') || 'null'); if (l && (!d || l.t > d.t)) d = l; } catch (e) { /* ingen lagring */ }
  if (!d) return '';
  return `<div class="card" style="border-color:rgba(255,107,107,.5)"><h3>Senaste fel</h3>
    <div style="font-size:13px">${esc(d.t)} · version ${esc(d.v || '?')} · ${esc(d.where || '')} · läge ${esc(d.state || '')}</div>
    <div style="font-size:13px;word-break:break-word"><b>${esc(d.msg)}</b></div>
    <div class="muted" style="font-size:11px;word-break:break-word">${esc(d.stack || '')}</div>
    <div class="muted" style="font-size:12px">Ta en skärmbild av den här rutan och skicka till Claude.</div>
    <button class="btn sm" type="button" data-act="clearDiag" style="align-self:flex-start">Dölj</button></div>`;
}
ACTIONS.clearDiag = () => {
  try { localStorage.removeItem('flodljus-senaste-fel'); } catch (e) { /* ingen lagring */ }
  if (START.saved) delete START.saved.diag;
  renderStart(START.saved);
}
function renderStart(saved) {
  START.saved = saved;
  $('shell').hidden = true;
  const s = $('start'); s.hidden = false;
  const st = saved && saved.teams.find(t => t.user);
  s.innerHTML = `<div class="start-card">
    <div class="eyebrow">Fotbollsmanager · 7 mot 7 med sarg</div>
    <h1>Flodljus<span>Manager</span></h1>
    <p class="muted">Ta över en liten klubb i division 6, den lägsta av sex. Köp och sälj spelare, träna upp talanger, bygg ut arenan och se varje match live under strålkastarna.</p>
    ${st ? `<div class="card"><div class="spread"><div class="row">${crest(st.kit, 40)}<div><h2>${esc(st.name)}</h2><div class="muted">Säsong ${saved.season} · Division ${saved.div} · Omgång ${Math.min(saved.round + 1, saved.fixtures.length)}</div></div></div><button class="btn primary big" type="button" data-act="continue">Fortsätt</button></div></div>` : ''}
    ${codeCard()}
    <div class="card">
      <h3>${st ? 'Ny karriär' : 'Din klubb'}</h3>
      <label for="clubInput" class="muted">Klubbnamn</label>
      <input id="clubInput" type="text" maxlength="24" value="Flodljus IF" autocomplete="off">
      <div class="muted">Klubbfärger</div>
      <div class="kits">${KITS.map((k, i) => `<button type="button" class="kitbtn" id="kit-${i}" data-act="pickKit" data-i="${i}" aria-pressed="${i === START.kit}" aria-label="Klubbfärg ${i + 1}" style="${kitVars(k)}"><i></i></button>`).join('')}</div>
      ${st ? '<label class="row muted" for="confirmNew"><input type="checkbox" id="confirmNew"> Jag förstår att den sparade karriären skrivs över</label>' : ''}
      ${START.checking && !st ? '<p class="muted" style="margin:0">⏳ Letar efter din sparade karriär …</p>' : ''}
      <button class="btn ${st ? '' : 'primary big'}" type="button" data-act="newGame"${START.checking && !st ? ' disabled' : ''}>Starta karriär</button>
    </div>
    ${diagCard(saved)}
    <div class="muted" style="font-size:12px">Version ${GAME_VERSION}</div>
  </div>`;
}
// ===== Spelarkod: samma karriär på flera enheter (egen server) =====
function codeCard() {
  if (Cloud.mode !== 'server') return '';
  return `<div class="card codecard">
    <h3>☁️ Sparas på din server</h3>
    <div class="spread"><div><div class="muted" style="font-size:13px">Din spelarkod</div><b class="code">${fmtCode(Cloud.uid)}</b></div><button class="btn sm" type="button" data-act="copyCode">Kopiera</button></div>
    <p class="muted" style="margin:0;font-size:13px">Skriv in koden på en annan enhet för att spela samma karriär där. Håll koden för dig själv – den som har koden kan öppna karriären.</p>
    <label for="codeInput" class="muted">Har du en kod från en annan enhet?</label>
    <div class="row"><input id="codeInput" type="text" maxlength="9" placeholder="ABCD-1234" autocomplete="off" autocapitalize="characters" style="flex:1;text-transform:uppercase"><button class="btn" type="button" data-act="useCode"${START.checking ? ' disabled' : ''}>Hämta karriär</button></div>
  </div>`;
}
// En annan enhet har sparat en nyare version: sluta skriva till molnet och be om omladdning
function cloudConflict() {
  modal(`<h2>Karriären har spelats på en annan enhet</h2>
    <p>Det finns en nyare sparning på servern. För att inte skriva över den sparas inte den här enhetens version längre.</p>
    <p class="muted">Ladda om sidan så fortsätter du där du slutade på den andra enheten.</p>
    <button class="btn primary big" type="button" data-act="reloadPage">Ladda om</button>`);
}
ACTIONS.reloadPage = () => location.reload();
ACTIONS.copyCode = () => {
  const c = fmtCode(Cloud.uid);
  (navigator.clipboard ? navigator.clipboard.writeText(c) : Promise.reject()).then(() => toast(`Koden ${c} är kopierad.`), () => toast(`Din kod: ${c}`));
};
ACTIONS.useCode = async () => {
  const c = normCode($('codeInput').value);
  if (c.length !== 8) return toast('Koden ska vara 8 tecken, till exempel ABCD-1234.', true);
  if (c === Cloud.uid) return toast('Det är redan den här enhetens kod.');
  const old = Cloud.uid, oldBase = Cloud.base;
  Cloud.uid = c; START.checking = true; renderStart(START.saved);
  let found = null;
  try { found = await cloudLoad(); } catch (e) { found = null; }
  START.checking = false;
  if (!found || found.v !== 1) { Cloud.uid = old; Cloud.base = oldBase; renderStart(START.saved); return toast('Hittade ingen karriär med den koden. Kontrollera koden och att den andra enheten har sparat.', true); }
  try { localStorage.setItem('flodljus-tidigare-kod', old); } catch (e) { /* ingen lagring */ }
  setPlayerCode(c);
  renderStart(found);
  toast(`Karriären hämtad! Den här enheten använder nu kod ${fmtCode(c)}.`);
};
ACTIONS.pickKit = el => { START.kit = +el.dataset.i; document.querySelectorAll('.kitbtn').forEach(b => b.setAttribute('aria-pressed', String(b === el))); };
ACTIONS.newGame = () => {
  const name = $('clubInput').value.trim().replace(/\s+/g, ' ');
  if (START.checking) return toast('Vänta ett ögonblick – letar efter din sparade karriär.', true);
  if (name.length < 2) return toast('Skriv ett klubbnamn med minst två tecken.', true);
  if (START.saved && !($('confirmNew') && $('confirmNew').checked)) return toast('Bocka i rutan för att skriva över den sparade karriären.', true);
  newCareer(name, START.kit); saveCareer(); enterGame();
};
ACTIONS.continue = () => { C = START.saved; hydrate(); enterGame(); };
function hydrate() {
  setFormat(C.v6 ? 6 : 4); NAMES = null;
  const t = userTeam(); t.stadium = C.club.stadium;
  C.offers = C.offers || []; C.trainLog = C.trainLog || []; C.history = C.history || [];
  C.highlights = C.highlights || []; C.loans = C.loans || [];
  if (C.cup && C.cup.v !== 2) C.cup = null; // Supercupen ersätts av Ligacupen
  if (fixDuplicateNames()) saveCareer();
  if (fixStadiums()) saveCareer();
  // Balansändring (v27): supportrarna hade vuxit utan gräns – sätt dem till en rimlig nivå för divisionen
  if (!C.bal27) {
    C.bal27 = true;
    const target = Math.round(1100 * DIV_MULT[C.div] * (0.5 + C.club.mood / 100) * 1.3);
    if (C.club.fans > target) { C.club.fans = target; }
    news('Balansändring: lönerna stiger nu brant med spelarnas kvalitet, supportrarna har ett tak per division, akademins stjärnor är sällsyntare och transfermarknaden byts ut långsammare.', 'info');
    saveCareer();
  }
  if (migrateNations()) { news('Nytt: utländska spelare (flagga vid namnet) och landslagsuppehåll två gånger per säsong. De bästa spelarna kallas till landslaget och missar två omgångar.', 'good'); saveCareer(); }
  if (migrateTrophies()) news('Nytt: troféskåpet! Era titlar finns på översikten.', 'good');
  { const o = cupPlan().order; if ((!C.cup || C.cup.season !== C.season) && C.round >= cupRoundOf(o[0]) && C.round < cupRoundOf(o[1])) { startCup(); saveCareer(); } }
  if (!C.club.staff) { C.club.staff = {}; news('Nytt: fliken Personal. Anställ fysioterapeut, hjälptränare, scout och administratör när ni klättrar i divisionerna.', 'good'); }
  if (!C.league) {
    buildLeague();
    news('Nu finns hela seriepyramiden: fyra divisioner med lag som finns kvar år efter år. Se fliken Serien.', 'good');
    saveCareer();
  }
  if (upgradeTo7()) { news('Nu spelas 7 mot 7! Formationen är 2-3-1 med två kantmittfältare. Kolla din laguppställning.', 'good'); saveCareer(); }
  // Pyramiden måste finnas innan alla lag kan få egenskaper
  if (giveMissingTraits()) { news('Nytt: vissa spelare har specialegenskaper, till exempel 🌀 Dribblare och 💥 Kanonskott. Se märkena i Trupp.', 'good'); saveCareer(); }
}
function enterGame() { $('start').hidden = true; $('shell').hidden = false; show('overview'); }

// ===== Matchflöde =====
function matchSides() {
  const uf = userFixture(), me = userTeam();
  return { uf, home: uf.home ? me : uf.opp, away: uf.home ? uf.opp : me };
}
ACTIONS.next = () => {
  if (C.pre > 0) return preModal();
  if (cupPending()) return cupModal();
  if (C.round >= C.fixtures.length) return;
  const { uf, home, away } = matchSides(), me = userTeam(), tb = table();
  const posOf = t => tb.findIndex(r => r.t === t) + 1;
  const lu = lineupPlayers(me);
  const inj = me.players.filter(p => p.inj);
  modal(`<div class="eyebrow">${fmtDate(leagueDate(C.round))} · Division ${C.div} · Omgång ${C.round + 1} av ${C.fixtures.length}</div>
    <div class="vs">
      <div class="team">${crest(home.kit, 44)}<b>${esc(home.name)}</b><small class="muted">${posOf(home)}:a i tabellen</small></div>
      <div class="v">VS</div>
      <div class="team">${crest(away.kit, 44)}<b>${esc(away.name)}</b><small class="muted">${posOf(away)}:a i tabellen</small></div>
    </div>
    ${strengthBars(home, away)}
    ${analystTip(uf.opp)}
    <div><h3 style="font-size:17px" class="muted">Din startelva · ${TACTIC_NAME[me.tactic]}</h3>
    <div class="tablewrap"><table><tbody>${lu.map((p, i) => `<tr><td class="muted">${SLOT_NAME[SLOTS[i]]}</td><td>${p.num}</td><td>${natFlag(p)}${esc(p.name)} ${traitBadges(p)}</td><td>${formDots(p.form)}</td><td class="num">${skCell(slotRating(p, SLOTS[i]))}</td></tr>`).join('')}</tbody></table></div></div>
    ${inj.length ? `<div class="bad">Skadade: ${inj.map(p => esc(p.name)).join(', ')}</div>` : ''}
    ${me.players.some(p => p.away) ? `<div class="muted">🌍 I landslaget: ${me.players.filter(p => p.away).map(p => esc(p.name)).join(', ')}</div>` : ''}
    <div class="row"><button class="btn primary big" type="button" data-act="watch">Se matchen</button><button class="btn" type="button" data-act="sim">Simulera</button><button class="btn" type="button" data-act="lineupGo">Ändra laget</button></div>`);
};
ACTIONS.lineupGo = () => { closeModal(); show('lineup'); };
// Staplarna följer klubbmärkena: hemmalaget till vänster, bortalaget till höger
// Matchanalytikern pekar ut motståndarens farligaste spelare
function analystTip(opp) {
  if (!staffLvl('analyst') || !opp) return '';
  const p = lineupPlayers(opp).slice().sort((a, b) => ovr(b) - ovr(a))[0];
  return p ? `<div style="font-size:13px">🧠 <b>Analytikern:</b> se upp för ${natFlag(p)}${esc(p.name)} (${POS_NAME[p.pos]}, betyg ${disp(ovr(p))}${p.tr && p.tr.length ? ' ' + traitText(p) : ''}). Laget får +${staffLvl('analyst') * 2} % i matchen.</div>` : '';
}
function strengthBars(home, away) {
  const a = teamStrength(home), b = teamStrength(away), tot = a + b;
  const me = home.user ? a : b, opp = home.user ? b : a;
  const lab = t => (t.user ? 'Din lagstyrka' : 'Motståndaren');
  return `<div class="strength"><b>${disp(a)}</b><div class="bar" style="display:flex"><i style="width:${a / tot * 100}%;background:${home.user ? 'var(--flood)' : '#5b6aa0'}"></i><i style="width:${b / tot * 100}%;background:${away.user ? 'var(--flood)' : '#5b6aa0'};border-radius:0"></i></div><b>${disp(b)}</b></div>
    <div class="spread muted" style="font-size:12px;margin-top:-6px"><span>${lab(home)}</span><span>${me > opp * 1.08 ? 'Du är favorit' : opp > me * 1.08 ? 'Motståndaren är favorit' : 'Jämn match'}</span><span>${lab(away)}</span></div>`;
}
function runMatch(watch) {
  closeModal();
  if (C.pre > 0) return runPre(watch);
  if (cupPending()) return runCup(watch);
  const { uf, home, away } = matchSides();
  const att = attendance(home, away);
  const meta = {
    home: matchTeam(home), away: matchTeam(away), arena: arenaCfg(home, att), att,
    userSide: uf.home ? 'home' : 'away', roundLabel: `Division ${C.div} · Omgång ${C.round + 1} · ${fmtDate(leagueDate(C.round))}`,
    onEnd: res => afterMatch(res, false),
  };
  if (watch) startMatch(meta);
  else { Match.meta = meta; afterMatch(quickMatch(meta), true); }
}
ACTIONS.watch = () => runMatch(true);
ACTIONS.sim = () => runMatch(false);
// Matchrapport som ruta – visas efter simulerade matcher (samma innehåll som efter en sedd match)
function reportHtml(r, meta) {
  const us = meta.userSide, sh = { home: meta.home.short, away: meta.away.short };
  const goals = r.events.map(e => `<li><b>${e.min}'</b> ${e.acro ? ACRO[e.acro].icon + ' ' : ''}${esc(e.scorer || 'Självmål')}${e.assist ? ` <small>(${esc(e.assist)})</small>` : ''} <i>${esc(sh[e.side])}</i></li>`).join('');
  const tot = (r.stats.home.poss + r.stats.away.poss) || 1;
  const stats = [
    [r.stats.home.shots, 'Skott', r.stats.away.shots],
    [r.stats.home.onTarget, 'Skott på mål', r.stats.away.onTarget],
    [Math.round(r.stats.home.poss / tot * 100) + '%', 'Bollinnehav', Math.round(r.stats.away.poss / tot * 100) + '%'],
    [r.stats.home.tackles, 'Bollvinster', r.stats.away.tackles],
  ].map(x => `<span>${x[0]}</span><span>${x[1]}</span><span>${x[2]}</span>`).join('');
  const mine = r.players[us].slice().sort((a, b) => b.rating - a.rating);
  const all = r.players.home.concat(r.players.away), best = all.reduce((a, b) => (b.rating > a.rating ? b : a));
  const rows = mine.map(p => `<tr><td>${p.num}</td><td>${esc(p.name)}${p.off ? ` <small class="bad">▼ ${p.minIn + p.min}'</small>` : p.minIn ? ` <small class="good">▲ ${p.minIn}'</small>` : ''}</td><td>${SLOT_NAME[p.role]}</td><td>${p.goals ? '⚽'.repeat(p.goals) : ''}${p.assists ? ` <small>${p.assists} ass</small>` : ''}</td><td class="num"><span class="rating ${ratingClass(p.rating)}">${p.rating.toFixed(1)}</span></td></tr>`).join('');
  const att = r.att && r.att.total ? `<div class="muted">${us === 'home' && r.att.cap ? `Publik ${r.att.total.toLocaleString('sv-SE')} av ${r.att.cap.toLocaleString('sv-SE')}${r.att.income ? ` · Biljettintäkter ${money(r.att.income)}` : ''}` : `Publik ${r.att.total.toLocaleString('sv-SE')}${us === 'away' ? ' (bortamatch)' : ''}`}</div>` : '';
  return `<div class="final"><small>${esc(sh.home)}</small><span>${r.hg} – ${r.ag}</span><small>${esc(sh.away)}</small></div>
    <ul class="goals">${goals || '<li class="muted">Inga mål</li>'}</ul>
    <div class="stats3">${stats}</div>${att}
    <b>Matchens lirare: ${esc(best.name)} (${best.rating.toFixed(1)})</b>
    <div class="tablewrap"><table><thead><tr><th>#</th><th>Spelare</th><th>Position</th><th>Mål</th><th class="num">Betyg</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
let pendingSeason = null;
ACTIONS.reportDone = () => { closeModal(); if (pendingSeason) { const s = pendingSeason; pendingSeason = null; seasonModal(s); } else ntModal(); };
// Landslagsuppehåll: visas en gång, direkt efter omgången då trupperna togs ut
function ntModal() {
  const n = C.nt; if (!n || n.seen || n.season !== C.season || n.round !== C.round) return;
  n.seen = true; saveCareer();
  const mineIds = new Set(n.mine.map(x => x.id));
  modal(`<div class="eyebrow">🌍 Landslagsuppehåll</div><h2>${n.mine.length ? `${n.mine.length === 1 ? 'En spelare' : n.mine.length + ' spelare'} från er klubb är uttagna!` : 'Landslagen är uttagna'}</h2>
    ${n.mine.length ? `<ul class="news">${n.mine.map(x => `<li class="good">${NATIONS[x.nat].flag} <b>${esc(x.name)}</b> – ${NATIONS[x.nat].gen} landslag</li>`).join('')}</ul>
      <p style="margin:0">De missar de <b>${NT_MISS} kommande omgångarna</b>. Laguppställningen fylls i automatiskt – kontrollera den gärna. Landslagserfarenheten ger dem lite extra utveckling och höjer deras värde.</p>` : '<p class="muted" style="margin:0">Ingen från er klubb den här gången. Spelare kallas om de hör till de bästa i sitt land – i praktiken spelare med betyg runt 70 eller mer.</p>'}
    <div><div class="muted" style="font-size:13px">🇸🇪 Sveriges trupp</div><div style="font-size:13px">${n.squad.map(x => `<span class="${mineIds.has(x.id) ? 'good' : ''}">${esc(x.name)} <small class="muted">(${esc(x.team)})</small></span>`).join(' · ')}</div></div>
    <div><div class="muted" style="font-size:13px">Landskamper</div>${n.games.map(g => `<div>🇸🇪 Sverige – ${NATIONS[g.opp].flag} ${NATIONS[g.opp].name} <b>${g.gf}–${g.ga}</b>${g.sc.length ? ` <small class="muted">mål: ${g.sc.map(esc).join(', ')}</small>` : ''}</div>`).join('')}</div>
    <div class="row">${n.mine.length ? '<button class="btn" type="button" data-act="lineupGo">Laguppställning</button>' : ''}<button class="btn primary" type="button" data-act="closeModal">Fortsätt</button></div>`);
}
function afterMatch(res, quick) {
  const { uf } = matchSides();
  const gf = uf.home ? res.hg : res.ag, ga = uf.home ? res.ag : res.hg, oppName = uf.opp.name;
  const rep = quick && Match.meta ? reportHtml(res, Match.meta) : null, label = Match.meta && Match.meta.roundLabel;
  const summary = playRound(res);
  saveCareer();
  show('overview');
  if (rep) {
    pendingSeason = summary || null;
    modal(`<div class="eyebrow">${esc(label || 'Slutsignal')} · simulerad</div><h2>${gf > ga ? 'Seger!' : gf < ga ? 'Förlust' : 'Oavgjort'} mot ${esc(oppName)}</h2>${rep}
      <button class="btn primary big" type="button" data-act="reportDone">Fortsätt</button>`);
    return;
  }
  toast(`${gf > ga ? 'Seger' : gf < ga ? 'Förlust' : 'Oavgjort'} ${gf}–${ga} mot ${oppName}.`, gf < ga);
  if (summary) seasonModal(summary); else ntModal();
}
// ===== Försäsong =====
const PRE_INFO = 'Räknas inte i serien · biljetter och sponsorer ger mindre, men lönerna betalas som vanligt · träningen ger halv effekt';
function preNextCard() {
  const f = preFixture(), me = userTeam();
  return `<div class="card" style="grid-column:1/-1">
    <div class="spread"><div class="eyebrow">🌱 Försäsong · ${fmtDate(f.date)} · Träningsmatch ${f.i + 1} av ${PRE_WEEKS} · ${f.home ? 'Hemma' : 'Borta'}</div><span class="muted" style="font-size:12px">${PRE_INFO}</span></div>
    <div class="vs"><div class="team click" data-act="team" data-id="${f.h.id}">${crest(f.h.kit, 48)}<b>${esc(f.h.name)}</b><small class="muted">div ${divOfTeam(f.h)}</small></div><div class="v">VS</div><div class="team click" data-act="team" data-id="${f.a.id}">${crest(f.a.kit, 48)}<b>${esc(f.a.name)}</b><small class="muted">div ${divOfTeam(f.a)}</small></div></div>
    ${strengthBars(f.h, f.a)}
    ${C.preRes.length ? `<div class="muted" style="font-size:13px">Hittills: ${C.preRes.map(x => `${x.gf}–${x.ga} mot ${esc(x.opp)}`).join(' · ')}</div>` : ''}
    <div class="row"><button class="btn primary big" type="button" data-act="watch">Se matchen</button><button class="btn" type="button" data-act="sim">Simulera</button><button class="btn" type="button" data-act="preAll">Simulera hela försäsongen</button><button class="btn" type="button" data-act="tab" data-tab="lineup">Laguppställning</button></div>
  </div>`;
}
function preModal() {
  const f = preFixture();
  modal(`<div class="eyebrow">🌱 ${fmtDate(f.date)} · Försäsong · träningsmatch ${f.i + 1} av ${PRE_WEEKS}</div>
    <div class="vs"><div class="team">${crest(f.h.kit, 44)}<b>${esc(f.h.name)}</b></div><div class="v">VS</div><div class="team">${crest(f.a.kit, 44)}<b>${esc(f.a.name)}</b></div></div>
    ${strengthBars(f.h, f.a)}
    <p class="muted" style="margin:0">${PRE_INFO}.</p>
    <div class="row"><button class="btn primary big" type="button" data-act="watch">Se matchen</button><button class="btn" type="button" data-act="sim">Simulera</button><button class="btn" type="button" data-act="preAll">Hela försäsongen</button></div>`);
}
function preMeta() {
  const f = preFixture(), att = friendlyAtt(f.h, f.a);
  return { home: matchTeam(f.h), away: matchTeam(f.a), arena: arenaCfg(f.h, att), att, userSide: f.home ? 'home' : 'away', roundLabel: `🌱 Försäsong · träningsmatch ${f.i + 1} av ${PRE_WEEKS} · ${fmtDate(f.date)}`, onEnd: res => afterPre(res, false) };
}
function runPre(watch) {
  const meta = preMeta();
  if (watch) startMatch(meta);
  else { Match.meta = meta; afterPre(quickMatch(meta), true); }
}
function afterPre(res, quick) {
  const f = preFixture(), meta = Match.meta, rep = quick && meta ? reportHtml(res, meta) : null;
  playPreWeek(res); saveCareer(); show('overview');
  const gf = f.home ? res.hg : res.ag, ga = f.home ? res.ag : res.hg;
  if (rep) modal(`<div class="eyebrow">${esc(meta.roundLabel)} · simulerad</div><h2>${gf > ga ? 'Seger' : gf < ga ? 'Förlust' : 'Oavgjort'} mot ${esc(f.opp.name)}</h2>${rep}
    <button class="btn primary big" type="button" data-act="closeModal">Fortsätt</button>`);
  else toast(`Träningsmatch: ${gf > ga ? 'seger' : gf < ga ? 'förlust' : 'oavgjort'} ${gf}–${ga} mot ${f.opp.name}.`, gf < ga);
}
ACTIONS.preAll = () => {
  closeModal();
  const rows = [];
  while (C.pre > 0) { const f = preFixture(), meta = preMeta(); Match.meta = meta; const res = quickMatch(meta); playPreWeek(res); rows.push(`${fmtDate(f.date)}: ${f.home ? 'hemma' : 'borta'} mot ${esc(f.opp.name)} <b>${f.home ? res.hg : res.ag}–${f.home ? res.ag : res.hg}</b>`); }
  saveCareer(); show('overview');
  modal(`<div class="eyebrow">🌱 Försäsongen är klar</div><h2>Serien börjar ${fmtDate(leagueDate(0))}</h2><ul class="news">${rows.map(x => `<li>${x}</li>`).join('')}</ul>
    <p class="muted" style="margin:0">Spelarna har tränat med halv effekt under försäsongen, och lönerna har betalats som vanligt.</p>
    <button class="btn primary big" type="button" data-act="closeModal">Till serien</button>`);
};
// ===== Ligacupen =====
const cupDivTag = id => `<small class="muted">div ${C.cup.div[id]}</small>`;
function cupMagic(cp) {
  const mu = cupMult(cp.home, cp.away);
  if (!mu.gap) return '<div class="muted" style="font-size:13px">Båda lagen kommer från samma division – ingen cupmagi.</div>';
  const mine = mu.lo.user;
  return `<div style="font-size:13px">✨ <b>Cupmagi:</b> ${esc(mu.lo.name)} (division ${C.cup.div[mu.lo.id]}) får större vinstchans: ${Math.round(mu.p0 * 100)} % → ${Math.round(mu.p1 * 100)} %${mine ? ' – det är ni!' : ''}</div>`;
}
function cupNextCard(cp) {
  const me = userTeam();
  return `<div class="card cupnext" style="grid-column:1/-1">
    <div class="spread"><div class="eyebrow">🏆 ${fmtDate(cupDate(cp.stage))} · ${CUP_NAME} · ${CUP_STAGE_NAME[cp.stage]} · ${cp.home === me ? 'Hemma' : 'Borta'}</div><span class="muted">Oavgjort avgörs på straffar · räknas inte i serien</span></div>
    <div class="vs"><div class="team click" data-act="team" data-id="${cp.home.id}">${crest(cp.home.kit, 48)}<b>${esc(cp.home.name)}</b>${cupDivTag(cp.home.id)}</div><div class="v">VS</div><div class="team click" data-act="team" data-id="${cp.away.id}">${crest(cp.away.kit, 48)}<b>${esc(cp.away.name)}</b>${cupDivTag(cp.away.id)}</div></div>
    ${strengthBars(cp.home, cp.away)}
    ${cupMagic(cp)}
    <div class="muted" style="font-size:13px">Vinst i ${CUP_STAGE_NAME[cp.stage].toLowerCase()}en ger ${money(CUP_PRIZE[cp.stage])}${cp.stage === 'final' ? ' och pokalen' : ''}.</div>
    <div class="row"><button class="btn primary big" type="button" data-act="watch">Se matchen</button><button class="btn" type="button" data-act="sim">Simulera</button><button class="btn" type="button" data-act="tab" data-tab="lineup">Laguppställning</button></div>
  </div>`;
}
function cupCard() {
  const c = C.cup;
  if (!c || c.v !== 2 || c.season !== C.season) {
    const h = (C.cupHistory || []).slice(0, 5);
    return h.length ? `<div class="card"><h3>🏆 ${CUP_NAME}</h3><div class="muted" style="font-size:13px">De två bästa i varje division möts. Första matchen efter omgång ${cupRoundOf(cupPlan().order[0])}.</div>${h.map(x => `<div class="spread"><span>Säsong ${x.s}: <b class="${x.mine ? 'good' : ''}">${esc(x.winner)}</b>${x.wdiv ? ` <small class="muted">div ${x.wdiv}</small>` : ''}</span><span class="muted">${x.score} mot ${esc(x.runner)}</span></div>`).join('')}</div>` : '';
  }
  const nm = (id, win) => { const t = teamById(id); const n = `${esc(t.name)} <small class="muted">${c.div[id]}</small>`; return `<span class="click ${t.user ? 'good' : ''}" data-act="team" data-id="${id}">${win ? `<b>${n}</b>` : n}</span>`; };
  const row = t => `<div style="display:flex;flex-wrap:wrap;gap:0 8px;align-items:baseline"><span>${nm(t.h, t.m && t.m.w === t.h)} – ${nm(t.a, t.m && t.m.w === t.a)}</span>${t.m ? `<b style="white-space:nowrap;margin-left:auto">${cupScore(t.m)}</b>` : '<span class="muted" style="margin-left:auto">Ej spelad</span>'}</div>`;
  const sect = (k, when) => `<div class="muted" style="font-size:12px">${CUP_STAGE_NAME[k]}${c.ties[k] && c.ties[k].length ? '' : ` · efter omgång ${when}${k === 'qf' && c.seeded && c.seeded.length ? ' (lagen från division 1–2 kommer in här)' : ''}`}</div>${(c.ties[k] || []).map(row).join('')}`;
  return `<div class="card"><h3>🏆 ${CUP_NAME} ${c.season}</h3>
    ${(c.order || ['qf', 'sf', 'final']).map(k => sect(k, cupRoundOf(k))).join('')}
    ${c.done ? `<div class="${teamById(c.ties.final[0].m.w).user ? 'good' : ''}"><b>Vinnare: ${esc(c.winner)}</b></div>` : ''}
    <div class="muted" style="font-size:12px">Siffran efter laget är divisionen.</div>
  </div>`;
}
function cupModal() {
  const cp = cupPending();
  modal(`<div class="eyebrow">🏆 ${fmtDate(cupDate(cp.stage))} · ${CUP_NAME} · ${CUP_STAGE_NAME[cp.stage]}</div>
    <div class="vs"><div class="team">${crest(cp.home.kit, 44)}<b>${esc(cp.home.name)}</b>${cupDivTag(cp.home.id)}</div><div class="v">VS</div><div class="team">${crest(cp.away.kit, 44)}<b>${esc(cp.away.name)}</b>${cupDivTag(cp.away.id)}</div></div>
    ${strengthBars(cp.home, cp.away)}
    ${cupMagic(cp)}
    <p class="muted" style="margin:0">Blir det oavgjort efter 90 minuter avgörs matchen på straffar. Matchen räknas inte i serien.</p>
    <div class="row"><button class="btn primary big" type="button" data-act="watch">Se matchen</button><button class="btn" type="button" data-act="sim">Simulera</button><button class="btn" type="button" data-act="lineupGo">Ändra laget</button></div>`);
}
function runCup(watch) {
  const cp = cupPending(), att = attendance(cp.home, cp.away), mu = cupMult(cp.home, cp.away);
  const meta = {
    home: cupEngineTeam(cp.home, mu.h), away: cupEngineTeam(cp.away, mu.a), arena: arenaCfg(cp.home, att), att,
    userSide: cp.home.user ? 'home' : 'away', roundLabel: `🏆 ${CUP_NAME} · ${CUP_STAGE_NAME[cp.stage]} · ${fmtDate(cupDate(cp.stage))}`,
    onEnd: res => afterCup(res),
  };
  if (watch) startMatch(meta);
  else { Match.meta = meta; afterCup(quickMatch(meta), true); }
}
function afterCup(res, quick) {
  const rep = quick && Match.meta ? reportHtml(res, Match.meta) : '';
  const out = cupPlayed(res); if (!out) return;
  if (out.won) C.club.mood = clamp(C.club.mood + 3, 5, 100);
  saveCareer(); show('overview');
  const m = out.m, pens = m.ph != null, fin = out.stage === 'final';
  const title = fin ? (out.won ? `🏆 ${CUP_NAME.toUpperCase()}-MÄSTARE!` : 'Förlust i finalen') : out.won ? `Vidare från ${CUP_STAGE_NAME[out.stage].toLowerCase()}en!` : `Utslagna i ${CUP_STAGE_NAME[out.stage].toLowerCase()}en`;
  const ord = C.cup.order || ['qf', 'sf', 'final'], nx = ord[ord.indexOf(out.stage) + 1];
  const next = nx ? `${CUP_STAGE_NAME[nx]}en lottas efter omgång ${cupRoundOf(nx)}.` : '';
  modal(`<div class="eyebrow">${CUP_NAME} · ${CUP_STAGE_NAME[out.stage]}</div><h2>${title}</h2>
    ${rep || `<div class="final" style="font-size:48px"><small>${esc(teamById(m.h).short)}</small><span>${m.hg} – ${m.ag}</span><small>${esc(teamById(m.a).short)}</small></div>`}
    ${pens ? `<p style="margin:0;text-align:center"><b>Straffar: ${m.ph}–${m.pa}</b></p>` : ''}
    <p class="muted" style="margin:0">${out.won ? `+${money(out.prize)} i prispengar. ${fin ? 'Pokalen är er och supportrarna jublar!' : next}` : 'Nu väntar serien igen.'}</p>
    <button class="btn primary big" type="button" data-act="closeModal">Fortsätt</button>`);
}
// ===== Lagkort: tryck på ett lag för att se startelvan =====
function teamModal(t) {
  const d = divOfTeam(t), tb = table(divGroup(d)), ri = tb.findIndex(r => r.t === t), row = tb[ri];
  const lu = lineupPlayers(t), on = new Set(lu.map(p => p.id));
  const bench = t.players.filter(p => !on.has(p.id)).sort((a, b) => ovr(b) - ovr(a));
  const top = t.players.slice().sort((a, b) => (b.goals || 0) - (a.goals || 0))[0];
  const formHtml = (row ? row.form : []).slice(-5).map(x => `<span class="tag" style="background:${x === 'V' ? 'rgba(111,208,140,.2)' : x === 'F' ? 'rgba(255,107,107,.18)' : 'rgba(255,255,255,.08)'}">${x}</span>`).join(' ');
  modal(`<div class="spread"><div class="row" style="gap:12px">${crest(t.kit, 40)}<div><div class="eyebrow">Division ${d} · ${ri + 1}:a plats · ${row ? row.pts : 0} poäng</div><h2 style="margin:0">${esc(t.name)}${t.user ? ' <small class="good">(din klubb)</small>' : ''}</h2></div></div>${skCell(teamStrength(t))}</div>
    <div class="row" style="gap:12px;flex-wrap:wrap;font-size:13px"><span class="muted">Taktik: <b>${TACTIC_NAME[t.tactic] || 'Balanserad'}</b></span><span class="muted">Arena: <b>${capacity(t.stadium).toLocaleString('sv-SE')}</b> platser</span>${formHtml ? `<span class="muted">Form: ${formHtml}</span>` : ''}${top && top.goals ? `<span class="muted">Bäste målskytt: <b>${esc(top.name)}</b> (${top.goals})</span>` : ''}</div>
    <div><div class="muted" style="font-size:13px">Startelva</div>
    <div class="tablewrap"><table><thead><tr><th>Position</th><th>#</th><th>Spelare</th><th class="num">Ålder</th><th>Form</th><th class="num">Mål</th><th class="num">Betyg</th></tr></thead><tbody>
    ${lu.map((p, i) => `<tr><td class="muted">${SLOT_NAME[SLOTS[i]]}</td><td>${p.num}</td><td>${natFlag(p)}${esc(p.name)} ${traitBadges(p)}${p.caps ? ` <small class="muted" title="Landskamper">🌍${p.caps}</small>` : ''}</td><td class="num">${p.age}</td><td>${formDots(p.form)}</td><td class="num">${p.goals || 0}</td><td class="num">${skCell(slotRating(p, SLOTS[i]))}</td></tr>`).join('')}
    </tbody></table></div></div>
    ${bench.length ? `<div style="font-size:13px"><span class="muted">Bänken:</span> ${bench.map(p => `${natFlag(p)}${esc(p.name)} <small class="muted">${POS_NAME[p.pos]} ${disp(ovr(p))}</small>${p.inj ? ' <span class="tag inj">skadad</span>' : p.away ? ' <span class="tag">🌍 landslag</span>' : ''}`).join(' · ')}</div>` : ''}
    <div class="row">${t.user ? '<button class="btn" type="button" data-act="lineupGo">Ändra laguppställning</button>' : ''}<button class="btn primary" type="button" data-act="closeModal">Stäng</button></div>`);
}
ACTIONS.team = el => { const t = teamById(+el.dataset.id); if (t) teamModal(t); };

// ===== Kalender =====
function calendarCard() {
  if (C.round >= C.fixtures.length) return '';
  const ev = upcoming(6);
  return `<div class="card"><h3>🗓️ Kalender</h3>
    <div class="cal">${ev.map((e, i) => `<div class="calrow ${e.kind}${i === 0 ? ' now' : ''}"${e.team ? ` data-act="team" data-id="${e.team}"` : ''}>
      <div class="cald"><b>${e.date.toLocaleDateString('sv-SE', { weekday: 'short' })}</b><span>${e.date.getDate()}/${e.date.getMonth() + 1}</span></div>
      <div><div>${e.kind === 'nt' ? '🌍 ' : e.kind === 'pre' ? '🌱 ' : e.kind !== 'league' ? '🏆 ' : ''}${esc(e.text)}</div><small class="muted">${esc(e.sub)}</small></div></div>`).join('')}</div>
    <div class="muted" style="font-size:12px">Ligan spelas på lördagar, Ligacupen på onsdagar. Säsongen ${2025 + C.season} börjar ${fmtDate(seasonStart())}.</div>
  </div>`;
}
// ===== Troféskåp =====
const TROPHY = {
  league: { icon: '🏆', cls: 'gold', title: 'Ligamästare' },
  cup: { icon: '🏆', cls: 'silver', title: 'Ligacupen' },
  div: { icon: '🥇', cls: 'bronze', title: 'Seriesegrar' },
};
function trophyCabinet() {
  const tr = (C.trophies || []).slice().sort((a, b) => a.s - b.s);
  const big = tr.filter(t => t.kind !== 'div'), small = tr.filter(t => t.kind === 'div');
  const item = t => `<div class="trophy ${TROPHY[t.kind].cls}" title="${esc(t.name)} säsong ${t.s}"><span class="ti">${TROPHY[t.kind].icon}</span><small>${t.kind === 'div' ? `Div ${t.div}` : t.kind === 'cup' ? 'Cupen' : 'Mästare'}<br>S${t.s}</small></div>`;
  const count = k => tr.filter(t => t.kind === k).length;
  const best = (C.history || []).reduce((a, h) => (!a || h.div < a.div || (h.div === a.div && h.pos < a.pos) ? h : a), null);
  return `<div class="card cabinet" style="grid-column:1/-1"><div class="spread"><h3>🏆 Troféskåp</h3><span class="muted" style="font-size:13px">${count('league')} ${count('league') === 1 ? 'ligatitel' : 'ligatitlar'} · ${count('cup')} ${count('cup') === 1 ? 'cuptitel' : 'cuptitlar'} · ${count('div')} ${count('div') === 1 ? 'serieseger' : 'seriesegrar'}</span></div>
    <div class="shelf">${big.length ? big.map(item).join('') : '<span class="muted shelf-empty">Här ställs ligamästerskap (division 1) och Ligacupen.</span>'}</div>
    <div class="shelf low">${small.length ? small.map(item).join('') : '<span class="muted shelf-empty">Seriesegrar i lägre divisioner.</span>'}</div>
    ${best ? `<div class="muted" style="font-size:13px">Bästa säsong hittills: ${best.pos}:a i division ${best.div} (säsong ${best.season}).</div>` : ''}
  </div>`;
}
function seasonModal(s) {
  modal(`<div class="eyebrow">Säsong ${s.season} är slut</div>
    <h2>${s.move < 0 ? 'Uppflyttning!' : s.move > 0 ? 'Nedflyttning' : `${s.pos}:a plats`}</h2>
    <p>${s.move < 0 ? `Ni slutade ${s.pos}:a och går upp till division ${C.div}. Supportrarna strömmar till.` : s.move > 0 ? `Ni slutade ${s.pos}:a och flyttas ner till division ${C.div}.` : `Ni slutade ${s.pos}:a i division ${s.div} och stannar kvar.`}</p>
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <div><div class="muted">Prispengar</div><b>${money(s.prize)}</b></div>
      <div><div class="muted">Ny division</div><b>Division ${C.div}</b></div>
    </div>
    ${s.converted ? `<p class="good"><b>Nytt format nästa säsong:</b> 6 divisioner med 12 lag, 22 omgångar, 3 upp och 3 ner. Nivån är densamma – division ${s.converted.was} heter nu division ${s.converted.now}. Egenskaperna visas nu på skalan 1–100.</p>` : ''}
    ${s.retired.length ? `<p class="muted">Avslutar karriären: ${s.retired.map(esc).join(', ')}.</p>` : ''}
    ${s.youth.length ? `<p class="good">Nya från ungdomsakademin: ${s.youth.map(esc).join(', ')}.</p>` : ''}
    ${s.awards && s.awards[s.div] && s.awards[s.div].length ? `<div><div class="muted">Utmärkelser i division ${s.div} · ger extra utveckling (yngre får mer)</div><ul class="news">${s.awards[s.div].map(a => `<li class="${a.mine ? 'good' : ''}">${AWARD[a.type].icon} <b>${AWARD[a.type].name}:</b> ${esc(a.name)} (${esc(a.team)}, ${a.age} år) · ${a.val} ${AWARD[a.type].what} · ${SKILL_NAME[AWARD[a.type].skill]} +${Math.round(a.gain * 5)}</li>`).join('')}</ul></div>` : s.kings && s.kings[s.div] ? `<p>⚽ Skyttekung i division ${s.div}: <b>${esc(s.kings[s.div].name)}</b> (${esc(s.kings[s.div].team)}), ${s.kings[s.div].goals} mål.</p>` : ''}
    ${s.awards ? (() => { const mine = Object.keys(s.awards).filter(d => +d !== s.div).flatMap(d => s.awards[d].filter(a => a.mine)); return mine.length ? `<p class="good">${mine.map(a => `${AWARD[a.type].icon} ${esc(a.name)}: ${AWARD[a.type].name.toLowerCase()}`).join(' · ')}</p>` : ''; })() : ''}
    ${s.highlights && s.highlights.length ? `<div><div class="muted">Säsongens höjdpunkter</div><ul class="news">${s.highlights.map(highlightRow).join('')}</ul></div>` : ''}
    <p class="muted">Alla spelare har blivit ett år äldre, och lagen i hela seriepyramiden har flyttats upp och ner. Nu väntar en försäsong med ${PRE_WEEKS} träningsmatcher.</p>
    <button class="btn primary" type="button" data-act="closeModal">Till säsong ${C.season}</button>`);
}
ACTIONS.closeModal = closeModal;
$('btnNext').addEventListener('click', () => ACTIONS.next());

// ===== Översikt =====
SCREENS.overview = () => {
  const me = userTeam(), tb = table(), cl = C.club, s = cl.stadium;
  let next = '';
  const cp = cupPending();
  if (C.pre > 0) next = preNextCard();
  else if (cp) next = cupNextCard(cp);
  else if (C.round < C.fixtures.length) {
    const { uf, home, away } = matchSides();
    next = `<div class="card" style="grid-column:1/-1">
      <div class="spread"><div class="eyebrow">${fmtDate(leagueDate(C.round))} · Omgång ${C.round + 1} av ${C.fixtures.length} · ${uf.home ? 'Hemma' : 'Borta'}</div>
      <span class="muted">${uf.home ? `Arena: ${capacity(s).toLocaleString('sv-SE')} platser` : `Bortaarena: ${capacity(uf.opp.stadium).toLocaleString('sv-SE')} platser`}</span></div>
      <div class="vs"><div class="team click" data-act="team" data-id="${home.id}">${crest(home.kit, 48)}<b>${esc(home.name)}</b></div><div class="v">VS</div><div class="team click" data-act="team" data-id="${away.id}">${crest(away.kit, 48)}<b>${esc(away.name)}</b></div></div>
      <div class="muted" style="font-size:12px;text-align:center;margin-top:-6px">Tryck på ett lag för att se startelvan</div>
      ${strengthBars(home, away)}
      ${analystTip(uf.opp)}
      <div class="row"><button class="btn primary big" type="button" data-act="watch">Se matchen</button><button class="btn" type="button" data-act="sim">Simulera</button><button class="btn" type="button" data-act="tab" data-tab="lineup">Laguppställning</button></div>
    </div>`;
  }
  const lm = C.lastMatch;
  const last = lm ? `<div class="card"><h3>Senaste match</h3>
      <div class="spread"><b style="font-family:var(--display);font-size:34px;font-weight:500">${lm.gf}–${lm.ga}</b><span class="${lm.gf > lm.ga ? 'good' : lm.gf < lm.ga ? 'bad' : 'muted'}">${lm.gf > lm.ga ? 'Seger' : lm.gf < lm.ga ? 'Förlust' : 'Oavgjort'} ${lm.home ? 'hemma mot' : 'borta mot'} ${esc(lm.opp)}</span></div>
      <div class="muted">Veckans netto: <b class="${sumLedger(lm.ledger) >= 0 ? 'good' : 'bad'}">${money(sumLedger(lm.ledger))}</b></div>
      ${lm.report.trained.length ? `<div><div class="muted">Framsteg på träningen</div><ul class="news">${lm.report.trained.slice(0, 4).map(t => `<li class="good">${esc(t)}</li>`).join('')}</ul></div>` : ''}
    </div>` : `<div class="card"><h3>Första veckan</h3><p class="muted">Kolla truppen och laguppställningen, välj träningsfokus och ta sedan första matchen. Allt sparas automatiskt efter varje omgång.</p></div>`;
  const mini = `<div class="card"><div class="spread"><h3>Division ${C.div}</h3><button class="btn sm" type="button" data-act="tab" data-tab="league">Hela serien</button></div>
    <div class="tablewrap"><table><thead><tr><th>#</th><th>Lag</th><th class="num">S</th><th class="num">+/-</th><th class="num">P</th></tr></thead><tbody>
    ${tb.map((r, i) => `<tr class="click${r.t.user ? ' me' : ''}" data-act="team" data-id="${r.t.id}"><td>${i + 1}</td><td>${esc(r.t.name)}</td><td class="num">${r.p}</td><td class="num">${r.gf - r.ga}</td><td class="num"><b>${r.pts}</b></td></tr>`).join('')}
    </tbody></table></div><div class="muted" style="font-size:12px">${C.div > 1 ? `Topp ${UP_DOWN} går upp · ` : ''}${C.div < lowestDiv() ? `De ${UP_DOWN} sista åker ur` : 'Lägsta divisionen'}</div></div>`;
  const club = `<div class="card"><h3>Klubben</h3>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
      <div><div class="muted">Arena</div><b>${capacity(s).toLocaleString('sv-SE')} platser</b></div>
      <div><div class="muted">Trupp</div><b>${me.players.length} spelare</b></div>
      <div><div class="muted">Lagstyrka</div><b>${disp(teamStrength(me))}</b></div>
      <div><div class="muted">Veckolöner</div><b>${money(-weeklyBudget().wages)}</b></div>
      ${Cloud.mode === 'server' ? `<div style="grid-column:1/-1"><div class="muted">Spelarkod (för andra enheter)</div><b style="letter-spacing:.12em">${fmtCode(Cloud.uid)}</b></div>` : ''}
    </div>
    <div><div class="spread muted" style="font-size:13px"><span>Supporterstämning</span><span>${moodName(cl.mood)}</span></div><div class="bar"><i style="width:${cl.mood}%;background:linear-gradient(90deg,#ff6b6b,#ffd66b,#6fd08c)"></i></div></div>
    ${cl.builds.length ? `<div class="muted">Byggen: ${cl.builds.map(b => `${BUILDS[b.key].name} (${b.left} v)`).join(', ')}</div>` : ''}
  </div>`;
  const hl = (C.highlights || []).filter(h => h.s === C.season);
  const highs = hl.length ? `<div class="card"><h3>Säsongens höjdpunkter</h3><ul class="news">${hl.map(highlightRow).join('')}</ul></div>` : '';
  const newsList = `<div class="card"><h3>Nyheter</h3><ul class="news">${C.news.slice(0, 8).map(n => `<li class="${n.kind}"><small>S${n.s} · O${n.w}</small>${esc(n.text)}</li>`).join('')}</ul></div>`;
  return `<div class="grid">${next}${calendarCard()}${cupCard()}${last}${highs}${mini}${club}${newsList}${trophyCabinet()}</div>`;
};
function sumLedger(l) { return Object.values(l || {}).reduce((a, b) => a + b, 0); }

// ===== Trupp =====
SCREENS.squad = () => {
  const t = userTeam();
  const order = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
  const ps = t.players.slice().sort((a, b) => order[a.pos] - order[b.pos] || ovr(b) - ovr(a));
  return `<div class="spread"><h2 style="font-size:40px">Trupp</h2><span class="muted">${t.players.length + C.loans.length} av 16 platser${C.loans.length ? ` (${C.loans.length} utlånade)` : ''} · Klicka på en spelare för detaljer</span></div>
  <div class="card"><div class="tablewrap"><table>
    <thead><tr><th>#</th><th>Namn</th><th>Pos</th><th class="num">Ålder</th><th class="num">Betyg</th>${SKILLS.map(k => `<th class="num" title="${SKILL_NAME[k]}">${SKILL_ABBR[k]}</th>`).join('')}<th>Form</th><th class="num">Mål</th><th class="num">Snitt</th><th class="num">Värde</th><th class="num">Lön/v</th><th>Status</th></tr></thead>
    <tbody>${ps.map(p => `<tr class="click" data-act="player" data-id="${p.id}">
      <td>${p.num}</td><td>${natFlag(p)}<b>${esc(p.name)}</b> ${traitBadges(p)}${p.caps ? ` <small class="muted" title="Landskamper">🌍${p.caps}</small>` : ''}</td><td><span class="pos">${POS_NAME[p.pos]}</span></td><td class="num">${p.age}</td>
      <td class="num">${skCell(ovr(p))}</td>${SKILLS.map(k => `<td class="num">${skCell(p.sk[k])}</td>`).join('')}
      <td>${formDots(p.form)}</td><td class="num">${p.goals}</td><td class="num">${p.apps ? (p.rsum / p.apps).toFixed(1) : '–'}</td>
      <td class="num">${money(playerValue(p))}</td><td class="num">${money(playerWage(p))}</td><td>${statusTags(p)}</td></tr>`).join('')}</tbody>
  </table></div></div>
  ${loansCard()}
  <p class="muted" style="font-size:13px">Egenskaperna går från 1 till 100. Färgen visar nivån, från svag (röd) till världsklass (lila). Betyget är spelarens styrka på sin huvudposition. Märkena (🌀💥🎯📐🧤⚡🛡️🫁) är specialegenskaper – tryck på en spelare för förklaring.</p>`;
};

function skillBars(p, fuzzy) {
  return `<div class="skills">${SKILLS.map(k => `<span class="muted">${SKILL_NAME[k]}</span><div class="bar"><i style="width:${p.sk[k] / 20 * 100}%;background:${skColor(p.sk[k])}"></i></div><b class="num">${disp(p.sk[k])}</b>`).join('')}</div>`;
}
ACTIONS.player = el => {
  const t = userTeam(), p = findP(t, +el.dataset.id);
  if (!p) return;
  const quick = Math.round(playerValue(p) * 0.6 / 500) * 500;
  const slot = POS_SLOT[p.pos];
  modal(`<div class="spread"><div><div class="eyebrow">#${p.num} · ${POS_NAME[p.pos]} · ${p.age} år</div><h2>${natFlag(p)}${esc(p.name)}</h2></div>${skCell(ovr(p))}</div>
    <div class="row">${formDots(p.form)} <span class="muted">Form</span> ${statusTags(p)}</div>
    <div class="muted" style="font-size:13px">${NATIONS[p.nat || 'SE'].flag} ${NATIONS[p.nat || 'SE'].name}${p.caps ? ` · <b>${p.caps} landskamper</b>${p.ntGoals ? `, ${p.ntGoals} mål` : ''}` : ''}</div>
    ${traitList(p)}
    ${p.awards && p.awards.length ? `<div class="good" style="font-size:14px">${p.awards.map(a => `${AWARD[a.type].icon} ${AWARD[a.type].name} säsong ${a.s}`).join(' · ')}</div>` : ''}
    ${skillBars(p)}
    <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:10px">
      <div><div class="muted">Potential</div><b>${levelName(p.pot)}</b><div class="muted" style="font-size:12px">${potLabel(p)}</div></div>
      <div><div class="muted">Värde</div><b>${money(playerValue(p))}</b></div>
      <div><div class="muted">Lön</div><b>${money(playerWage(p))}/v</b></div>
      <div><div class="muted">Matcher</div><b>${p.apps}</b></div>
      <div><div class="muted">Mål</div><b>${p.goals}</b></div>
      <div><div class="muted">Snittbetyg</div><b>${p.apps ? (p.rsum / p.apps).toFixed(1) : '–'}</b></div>
    </div>
    <div class="muted" style="font-size:13px">Bäst som ${SLOT_NAME[SLOTS.reduce((a, s) => (slotRating(p, s) > slotRating(p, a) ? s : a), slot)].toLowerCase()} (${disp(Math.max(...SLOTS.map(s => slotRating(p, s))))}).</div>
    ${loanSection(p)}
    <div class="row">
      <button class="btn" type="button" data-act="toggleList" data-id="${p.id}">${p.listed ? 'Ta bort från transferlistan' : 'Sätt till salu'}</button>
      <button class="btn danger" type="button" data-act="sellNow" data-id="${p.id}">Sälj direkt för ${money(quick)}</button>
      <button class="btn" type="button" data-act="closeModal">Stäng</button>
    </div>
    <p class="muted" style="font-size:12px">Spelare till salu får bud från andra klubbar efter varje omgång. Direktförsäljning ger 60 % av värdet.</p>`);
};
// ===== Utlåning =====
function loanSection(p) {
  if (p.age > LOAN_AGE || C.div >= lowestDiv()) return '';
  const err = loanCheck(p), divs = [];
  for (let d = C.div + 1; d <= lowestDiv(); d++) divs.push(d);
  return `<div class="card" style="padding:12px;gap:8px"><b>Låna ut för speltid</b>
    <div class="muted" style="font-size:13px">Spelaren får spela i en lägre division resten av säsongen och kommer hem när säsongen är slut (eller när du kallar tillbaka spelaren). Låneklubben betalar halva lönen. Högre division ger bättre träning men ofta mindre speltid.</div>
    ${err ? `<div class="bad" style="font-size:13px">${err}</div>` : `<div class="row" style="flex-wrap:wrap">${divs.map(d => `<button class="btn sm" type="button" data-act="loan" data-id="${p.id}" data-d="${d}" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px"><b>Division ${d}</b><small>ca ${loanMinutes(p, d)} min/match · träning ${Math.round(loanTraining(d) * 100)} %</small></button>`).join('')}</div>`}
  </div>`;
}
function loansCard() {
  if (!C.loans.length) return '';
  return `<div class="card"><h3>Utlånade spelare</h3><div class="tablewrap"><table>
    <thead><tr><th>Namn</th><th>Låneklubb</th><th class="num">Matcher</th><th class="num">Min/match</th><th class="num">Mål</th><th class="num">Snitt</th><th class="num">Betyg</th><th></th></tr></thead>
    <tbody>${C.loans.map(l => `<tr><td><b>${esc(l.p.name)}</b> <span class="muted">${l.p.age} år</span>${l.p.inj ? ` <span class="tag inj">Skadad ${l.p.inj} v</span>` : ''}</td><td>${esc(l.club)} <span class="muted">div ${l.div}</span></td>
      <td class="num">${l.apps}</td><td class="num">${l.apps ? Math.round(l.min / l.apps) : '–'}</td><td class="num">${l.goals}</td><td class="num">${l.apps ? (l.rsum / l.apps).toFixed(1) : '–'}</td>
      <td class="num">${disp(l.start)} → <b class="${disp(ovr(l.p)) > disp(l.start) ? 'good' : ''}">${disp(ovr(l.p))}</b></td>
      <td><button class="btn sm" type="button" data-act="recall" data-id="${l.p.id}">Kalla tillbaka</button></td></tr>`).join('')}</tbody></table></div>
    <p class="muted" style="margin:0;font-size:13px">De kommer hem automatiskt när säsongen är slut.</p></div>`;
}
ACTIONS.loan = el => { const id = +el.dataset.id, d = +el.dataset.d, name = findP(userTeam(), id).name; closeModal(); act(loanOut(id, d), `${name} är utlånad till division ${d}.`); };
ACTIONS.recall = el => { act(recallLoan(+el.dataset.id), 'Spelaren är tillbaka i truppen.'); };
ACTIONS.toggleList = el => {
  const p = findP(userTeam(), +el.dataset.id); p.listed = !p.listed;
  if (!p.listed) C.offers = C.offers.filter(o => o.pid !== p.id);
  closeModal(); act(null, p.listed ? `${p.name} ligger nu ute till försäljning.` : `${p.name} är inte längre till salu.`);
};
ACTIONS.sellNow = el => {
  const p = findP(userTeam(), +el.dataset.id), name = p.name;
  if (el.dataset.sure !== '1') { el.dataset.sure = '1'; el.textContent = 'Klicka igen för att bekräfta'; return; }
  closeModal(); act(sellNow(p.id), `${name} är såld.`);
};
