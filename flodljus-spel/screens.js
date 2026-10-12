'use strict';
// ===================== Skärmar: laget, träning, transfer, arena, ekonomi, serien =====================

// ===== Laguppställning =====
const PITCH_POS = { GK: [8, 50], DL: [28, 27], DR: [28, 73], LM: [55, 14], MF: [55, 50], RM: [55, 86], FW: [84, 50] };
const TACTIC_DESC = {
  def: 'Laget ligger lågt, pressar mindre och skjuter bara från bra lägen.',
  bal: 'Normal höjd och press. Ett bra grundval.',
  off: 'Laget flyttar upp, pressar hårt och skjuter oftare, men lämnar mer ytor bakåt.',
};
// Smal skärm (stående mobil): planen på höjden med målvakten längst ner
const SLOT_SHORT = { GK: 'MV', DL: 'VB', DR: 'HB', LM: 'VM', MF: 'CM', RM: 'HM', FW: 'ANF' };
SCREENS.lineup = () => {
  const vert = window.innerWidth < 640;
  const t = userTeam(), lu = lineupPlayers(t);
  const opts = (slot, sel) => t.players.slice().sort((a, b) => slotRating(b, slot) - slotRating(a, slot))
    .map(p => `<option value="${p.id}"${p.id === sel ? ' selected' : ''}${away(p) ? ' disabled' : ''}>${p.num} ${esc(p.name)} ${traitText(p)} · ${disp(slotRating(p, slot))}${p.inj ? ' (skadad)' : p.away ? ' (landslaget)' : ''}</option>`).join('');
  const bench = t.players.filter(p => !t.lineup.includes(p.id));
  return `<div class="spread"><h2 style="font-size:40px">Laguppställning</h2><div class="row"><span class="muted">Lagstyrka</span><b style="font-family:var(--display);font-size:30px;font-weight:500">${disp(teamStrength(t))}</b></div></div>
  <div class="card">
    <div class="pitch2d${vert ? ' vert' : ''}">${SLOTS.map((slot, i) => `<div class="slot" style="${vert ? `left:${PITCH_POS[slot][1]}%;top:${100 - PITCH_POS[slot][0]}%` : `left:${PITCH_POS[slot][0]}%;top:${PITCH_POS[slot][1]}%`}">
      <label for="slot-${i}" title="${SLOT_NAME[slot]}">${SLOT_SHORT[slot]}</label>
      <span class="rt" style="color:${skColor(slotRating(lu[i], slot))}">${disp(slotRating(lu[i], slot))}</span>
      <select id="slot-${i}" data-change="setSlot" data-slot="${i}">${opts(slot, lu[i].id)}</select></div>`).join('')}</div>
    <div class="row"><button class="btn" type="button" data-act="autoLineup">Välj bästa laget automatiskt</button><span class="muted" style="font-size:13px">Siffran är spelarens styrka på just den positionen, formen oräknad.</span></div>
  </div>
  <div class="grid">
    <div class="card"><h3>Taktik</h3>
      <div class="seg" role="group" aria-label="Taktik">${Object.entries(TACTIC_NAME).map(([k, n]) => `<button type="button" id="tac-${k}" data-act="tactic" data-v="${k}" aria-pressed="${t.tactic === k}">${n}</button>`).join('')}</div>
      <p class="muted" style="margin:0">${TACTIC_DESC[t.tactic]}</p>
      <p class="muted" style="margin:0;font-size:13px">Du kan byta taktik under matchen också.</p>
    </div>
    <div class="card"><h3>Avbytare</h3>
      <div class="tablewrap"><table><tbody>${bench.map(p => `<tr class="click" data-act="player" data-id="${p.id}"><td>${p.num}</td><td>${esc(p.name)} ${traitBadges(p)}</td><td><span class="pos">${POS_NAME[p.pos]}</span></td><td class="num">${skCell(ovr(p))}</td><td>${formDots(p.form)}</td><td>${statusTags(p)}</td></tr>`).join('') || '<tr><td class="muted">Inga avbytare</td></tr>'}</tbody></table></div>
    </div>
  </div>`;
};
ACTIONS.setSlot = el => {
  const t = userTeam(), i = +el.dataset.slot, id = +el.value, j = t.lineup.indexOf(id);
  if (j >= 0 && j !== i) t.lineup[j] = t.lineup[i];
  t.lineup[i] = id; t.wish = t.lineup.slice();
  act(null);
};
ACTIONS.tactic = el => { userTeam().tactic = el.dataset.v; act(null); };
ACTIONS.autoLineup = () => { const t = userTeam(); autoLineup(t); t.wish = t.lineup.slice(); act(null, 'Bästa laget är uttaget.'); };

// ===== Träning =====
const FOCUS_DESC = {
  all: 'Lite av allt. Bra för en ung trupp.', gk: 'Reflexer och placering för målvakterna.', def: 'Brytningar och positionsspel för backarna.',
  pas: 'Passningar och spelförståelse för mittfältet.', sho: 'Avslut och skottkraft för anfallarna.', spd: 'Snabbhet för hela laget.', sta: 'Uthållighet, så att laget orkar hela matchen.',
};
SCREENS.training = () => {
  const cl = C.club, tr = cl.training, t = userTeam();
  const young = t.players.filter(p => p.age <= 23).sort((a, b) => (b.pot - ovr(b)) - (a.pot - ovr(a)));
  return `<h2 style="font-size:40px">Träning</h2>
  <div class="card"><h3>Veckans fokus</h3>
    <div class="choice">${Object.entries(FOCUS).map(([k, n]) => `<button type="button" id="focus-${k}" data-act="focus" data-v="${k}" aria-pressed="${tr.focus === k}"><b>${n}</b><small>${FOCUS_DESC[k]}</small></button>`).join('')}</div>
    <p class="muted" style="margin:0;font-size:13px">Fokusegenskapen utvecklas mest. De andra utvecklas lite grann. Unga spelare lär sig snabbast, och alla närmar sig till slut sin potential. <b>Speltid räknas:</b> den som spelar hela matchen utvecklas ungefär 60 % snabbare den veckan än den som sitter på bänken. Inhoppare får en del av effekten.</p>
  </div>
  <div class="grid">
    <div class="card"><h3>Intensitet</h3>
      <div class="seg" role="group" aria-label="Intensitet">${Object.entries(INTENSITY).map(([k, v]) => `<button type="button" id="int-${k}" data-act="intensity" data-v="${k}" aria-pressed="${tr.intensity === k}">${v.name}</button>`).join('')}</div>
      <p class="muted" style="margin:0">${tr.intensity === 'hard' ? 'Snabbare utveckling men större skaderisk.' : tr.intensity === 'light' ? 'Långsammare utveckling men färre skador.' : 'Balans mellan utveckling och skaderisk.'}</p>
    </div>
    <div class="card"><h3>Anläggning</h3>
      <div class="spread"><span>Träningsanläggning nivå <b>${cl.fac.training}</b> av 5</span><span class="muted">×${(0.7 + cl.fac.training * 0.15).toFixed(2)} utveckling</span></div>
      <div class="spread"><span>📋 Hjälptränare</span><span class="muted">${staffLvl('coach') ? `${'★'.repeat(staffLvl('coach'))} · +${staffLvl('coach') * 15} % utveckling` : 'Ingen anställd (se Personal)'}</span></div>
      <div class="bar"><i style="width:${cl.fac.training * 20}%;background:var(--flood)"></i></div>
      <button class="btn sm" type="button" data-act="tab" data-tab="arena">Bygg ut under Arena</button>
    </div>
    <div class="card"><h3>Senaste veckan</h3>
      ${C.trainLog.length ? `<ul class="news">${C.trainLog.map(x => `<li class="good">${esc(x)}</li>`).join('')}</ul>` : '<p class="muted" style="margin:0">Inga egenskaper har gått upp en hel nivå ännu. Utvecklingen syns efter varje omgång.</p>'}
    </div>
  </div>
  <div class="card"><h3>Unga spelare</h3>
    <div class="tablewrap"><table><thead><tr><th>Namn</th><th class="num">Ålder</th><th>Pos</th><th class="num">Betyg</th><th>Utveckling</th><th>Bedömning</th></tr></thead><tbody>
    ${young.map(p => `<tr class="click" data-act="player" data-id="${p.id}"><td>${esc(p.name)}</td><td class="num">${p.age}</td><td><span class="pos">${POS_NAME[p.pos]}</span></td><td class="num">${skCell(ovr(p))}</td>
      <td style="min-width:140px"><div class="bar"><i style="width:${Math.min(100, ovr(p) / Math.max(p.pot, 1) * 100)}%;background:${skColor(ovr(p))}"></i></div></td><td class="muted">${potLabel(p)}</td></tr>`).join('') || '<tr><td class="muted">Inga spelare under 24 år.</td></tr>'}
    </tbody></table></div>
  </div>`;
};
ACTIONS.focus = el => { C.club.training.focus = el.dataset.v; act(null); };
ACTIONS.intensity = el => { C.club.training.intensity = el.dataset.v; act(null); };

// ===== Transfer =====
SCREENS.transfer = () => {
  const t = userTeam(), listed = t.players.filter(p => p.listed);
  const offers = C.offers.map((o, i) => ({ ...o, i, p: findP(t, o.pid) })).filter(o => o.p);
  return `<div class="spread"><h2 style="font-size:40px">Transfer</h2><span class="muted">Kassa <b>${money(C.club.cash)}</b> · Trupp ${t.players.length + C.loans.length}/${SQUAD_MAX}</span></div>
  <div class="grid">
    <div class="card"><h3>Bud på dina spelare</h3>
      ${offers.length ? `<div class="tablewrap"><table><thead><tr><th>Spelare</th><th>Klubb</th><th class="num">Bud</th><th class="num">Värde</th><th></th></tr></thead><tbody>
        ${offers.map(o => `<tr><td>${esc(o.p.name)}</td><td>${esc(o.club)}</td><td class="num"><b>${money(o.amount)}</b></td><td class="num muted">${money(playerValue(o.p))}</td>
          <td><div class="row"><button class="btn sm primary" type="button" data-act="accept" data-i="${o.i}">Acceptera</button><button class="btn sm" type="button" data-act="decline" data-i="${o.i}">Neka</button></div></td></tr>`).join('')}
      </tbody></table></div>` : `<p class="muted" style="margin:0">${listed.length ? 'Inga bud just nu. Nya bud kommer efter nästa omgång.' : 'Sätt spelare till salu via Trupp så börjar andra klubbar lägga bud.'}</p>`}
      ${listed.length ? `<div class="muted" style="font-size:13px">Till salu: ${listed.map(p => esc(p.name)).join(', ')}</div>` : ''}
    </div>
    <div class="card"><h3>Så funkar marknaden</h3>
      <p class="muted" style="margin:0">Listan förnyas varje vecka. Priserna utgår från spelarens värde, som beror på betyg, ålder och potential. Unga spelare med stor potential är dyra, men kan bli klubbens stjärnor.</p>
    </div>
  </div>
  <div class="card"><h3>Spelare på marknaden</h3>
    <div class="tablewrap"><table><thead><tr><th>Namn</th><th>Pos</th><th class="num">Ålder</th><th class="num">Betyg</th>${SKILLS.map(k => `<th class="num" title="${SKILL_NAME[k]}">${SKILL_ABBR[k]}</th>`).join('')}<th>Bedömning</th><th class="num">Lön/v</th><th class="num">Pris</th><th></th></tr></thead><tbody>
    ${C.market.slice().sort((a, b) => ovr(b) - ovr(a)).map(p => `<tr class="click" data-act="mplayer" data-id="${p.id}">
      <td>${natFlag(p)}<b>${esc(p.name)}</b> ${traitBadges(p)}${isBargain(p) ? ' <span class="tag up" title="Sportchefens tips: bra pris för kvaliteten">⭐ Fynd</span>' : ''}</td><td><span class="pos">${POS_NAME[p.pos]}</span></td><td class="num">${p.age}</td><td class="num">${skCell(ovr(p))}</td>
      ${SKILLS.map(k => `<td class="num">${skCell(p.sk[k])}</td>`).join('')}<td class="muted">${potLabel(p)}</td><td class="num">${money(playerWage(p))}</td>
      <td class="num"><b>${money(p.price)}</b></td><td><button class="btn sm primary" type="button" data-act="buy" data-id="${p.id}"${C.club.cash < p.price ? ' disabled' : ''}>Köp</button></td></tr>`).join('')}
    </tbody></table></div>
  </div>`;
};
ACTIONS.buy = el => {
  const p = C.market.find(x => x.id === +el.dataset.id), name = p && p.name;
  closeModal(); act(buyPlayer(+el.dataset.id), `${name} har skrivit på för klubben!`);
};
ACTIONS.accept = el => act(acceptOffer(+el.dataset.i), 'Affären är klar.');
ACTIONS.decline = el => { C.offers.splice(+el.dataset.i, 1); act(null, 'Budet är nekat.'); };
ACTIONS.mplayer = el => {
  const p = C.market.find(x => x.id === +el.dataset.id);
  if (!p) return;
  modal(`<div class="spread"><div><div class="eyebrow">${POS_NAME[p.pos]} · ${p.age} år · På marknaden</div><h2>${natFlag(p)}${esc(p.name)}</h2></div>${skCell(ovr(p))}</div>
    ${traitList(p)}
    ${skillBars(p, true)}
    <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:10px">
      <div><div class="muted">Bedömning</div><b>${potLabel(p)}</b></div>
      <div><div class="muted">Pris</div><b>${money(p.price)}</b></div>
      <div><div class="muted">Lön</div><b>${money(playerWage(p))}/v</b></div>
    </div>
    <div class="row"><button class="btn primary" type="button" data-act="buy" data-id="${p.id}"${C.club.cash < p.price ? ' disabled' : ''}>Köp för ${money(p.price)}</button><button class="btn" type="button" data-act="closeModal">Stäng</button></div>
    ${C.club.cash < p.price ? `<p class="bad" style="margin:0">Det saknas ${money(p.price - C.club.cash)} i kassan.</p>` : ''}`);
};

// ===== Arena =====
function stadiumSvg(s) {
  const main = Math.min(70, 14 + (s.seated + s.covered + s.vip) / 40), ends = Math.min(60, s.standing / 45);
  const W = 520, H = 300, px = 110, py = 110, pw = 300, ph = 150;
  const roofW = s.covered ? (s.covered / Math.max(1, s.seated + s.covered)) * pw + 40 : 0;
  const lights = [[px - ends - 18, py - main - 10], [px + pw + ends + 18, py - main - 10], [px - ends - 18, py + ph + 22], [px + pw + ends + 18, py + ph + 22]].slice(0, s.lights ? (s.lights >= 3 ? 4 : 2) : 0);
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:640px;height:auto" role="img" aria-label="Arenan uppifrån">
    <rect x="${px - ends}" y="${py}" width="${ends}" height="${ph}" fill="#3a4f8c" rx="4"/>
    <rect x="${px + pw}" y="${py}" width="${ends}" height="${ph}" fill="#3a4f8c" rx="4"/>
    <rect x="${px - 20}" y="${py - main}" width="${pw + 40}" height="${main}" fill="#5b6aa0" rx="4"/>
    ${roofW ? `<rect x="${px + pw / 2 - roofW / 2}" y="${py - main}" width="${roofW}" height="${main}" fill="#8a96c4" opacity=".75" rx="4"/>` : ''}
    ${s.vip ? `<rect x="${px + pw / 2 - Math.min(pw, 20 + s.vip) / 2}" y="${py - main - 10}" width="${Math.min(pw, 20 + s.vip)}" height="9" fill="#ffcf7a" rx="2"/>` : ''}
    <rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#2f7f3b" stroke="#fff" stroke-opacity=".6"/>
    <line x1="${px + pw / 2}" y1="${py}" x2="${px + pw / 2}" y2="${py + ph}" stroke="#fff" stroke-opacity=".6"/>
    <circle cx="${px + pw / 2}" cy="${py + ph / 2}" r="22" fill="none" stroke="#fff" stroke-opacity=".6"/>
    ${lights.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff3cf"/><circle cx="${x}" cy="${y}" r="16" fill="#fff3cf" opacity=".18"/>`).join('')}
    <text x="${px + pw / 2}" y="${py - main / 2 + 5}" text-anchor="middle" fill="#fff" font-size="14" font-family="Barlow, sans-serif">${(s.seated + s.covered + s.vip).toLocaleString('sv-SE')} sittplatser</text>
    <text x="${px + pw / 2}" y="${py + ph + 28}" text-anchor="middle" fill="#97a3c6" font-size="13" font-family="Barlow, sans-serif">Ståplats på kortsidorna: ${s.standing.toLocaleString('sv-SE')}</text>
  </svg>`;
}
SCREENS.arena = () => {
  const cl = C.club, s = cl.stadium;
  const rows = [['Ståplats', s.standing, TICKET.standing], ['Sittplats', s.seated, TICKET.seated], ['Sittplats med tak', s.covered, TICKET.covered], ['VIP-loge', s.vip, TICKET.vip]];
  const pl = PRICE_LEVEL[cl.ticket];
  return `<div class="spread"><h2 style="font-size:40px">Arena</h2><button class="btn" type="button" data-act="tour">Visa arenan i 3D (träningsmatch)</button></div>
  <div class="grid">
    <div class="card" style="grid-column:1/-1">${stadiumSvg(s)}</div>
    <div class="card"><h3>Kapacitet</h3>
      <div class="tablewrap"><table><thead><tr><th>Sektion</th><th class="num">Platser</th><th class="num">Biljettpris</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>${r[0]}</td><td class="num">${r[1].toLocaleString('sv-SE')}</td><td class="num">${money(r[2] * pl.mult)}</td></tr>`).join('')}
      <tr><td><b>Totalt</b></td><td class="num"><b>${capacity(s).toLocaleString('sv-SE')}</b></td><td></td></tr></tbody></table></div>
    </div>
    <div class="card"><h3>Biljettpriser</h3>
      <div class="seg" role="group" aria-label="Biljettpris">${Object.entries(PRICE_LEVEL).map(([k, v]) => `<button type="button" id="price-${k}" data-act="ticket" data-v="${k}" aria-pressed="${cl.ticket === k}">${v.name}</button>`).join('')}</div>
      <p class="muted" style="margin:0">Höga priser ger mer per biljett men färre åskådare. Stämningen och antalet supportrar styr hur många som kommer.</p>
      <p class="muted" style="margin:0">Strålkastare: nivå <b>${s.lights}</b> av 3 · Supportrar: <b>${cl.fans.toLocaleString('sv-SE')}</b></p>
    </div>
  </div>
  <h2 style="font-size:30px">Bygg ut</h2>
  <div class="grid">${Object.entries(BUILDS).map(([k, b]) => {
    const running = cl.builds.find(x => x.key === k), ok = !b.ok || b.ok(s, cl.fac), cost = buildCost(k);
    const cur = k === 'lights' ? `Nivå ${s.lights}/3` : k === 'training' ? `Nivå ${cl.fac.training}/5` : k === 'youth' ? `Nivå ${cl.fac.youth}/5` : k === 'vip' ? `${s.vip} platser` : k === 'covered' ? `${s.covered} under tak` : `${s[k].toLocaleString('sv-SE')} platser`;
    return `<div class="card"><div class="spread"><h2 style="font-size:24px">${b.name}</h2><span class="muted">${cur}</span></div>
      <p class="muted" style="margin:0">${b.desc}</p>
      <div class="spread"><b>${ok ? money(cost) : 'Max'}</b><span class="muted">${buildWeeks(k)} ${buildWeeks(k) === 1 ? 'vecka' : 'veckor'}</span></div>
      ${running ? `<div class="tag sale" style="align-self:flex-start">Pågår · klart om ${running.left} v</div>`
        : `<button class="btn${ok && cl.cash >= cost ? ' primary' : ''}" type="button" data-act="build" data-k="${k}"${!ok || cl.cash < cost ? ' disabled' : ''}>${ok ? 'Bygg' : 'Fullt utbyggt'}</button>`}
    </div>`;
  }).join('')}</div>`;
};
ACTIONS.ticket = el => { C.club.ticket = el.dataset.v; act(null); };
ACTIONS.build = el => act(startBuild(el.dataset.k), 'Bygget har startat!');
ACTIONS.tour = () => {
  const me = userTeam(), opp = C.teams.find(t => !t.user);
  const att = attendance(me, opp);
  startMatch({
    home: engineTeam(me), away: engineTeam(opp), arena: arenaCfg(me, att), att, userSide: 'home',
    roundLabel: 'Träningsmatch (räknas inte)', onEnd: () => refresh(),
  });
};

// ===== Personal =====
SCREENS.staff = () => {
  const cl = C.club, max = staffMax(), wb = weeklyBudget();
  const card = (k, S) => {
    const cur = cl.staff && cl.staff[k], locked = C.div > staffMinDiv(k);
    const lv = cur ? cur.lvl : 0;
    const opts = [1, 2, 3].map(l => {
      const fee = staffWage(k, l) * 4, can = !locked && l <= max && l !== lv && cl.cash >= fee;
      const why = locked ? '' : l > max ? `<small>Kräver div ${l === 2 ? (DIVS.length === 6 ? 4 : 3) : 2}</small>` : l === lv ? '<small>Anställd</small>' : `<small>${money(staffWage(k, l))}/v · värvning ${money(fee)}</small>`;
      return `<button class="btn sm${can && l > lv ? ' primary' : ''}" type="button" data-act="hire" data-k="${k}" data-l="${l}"${can ? '' : ' disabled'} style="display:flex;flex-direction:column;align-items:flex-start;gap:2px"><b>${'★'.repeat(l)} ${STAFF_TITLE[l]}</b>${why}</button>`;
    }).join('');
    return `<div class="card"${locked ? ' style="opacity:.6"' : ''}>
      <div class="spread"><h3 style="margin:0">${S.icon} ${S.name}</h3>${cur ? `<span class="tag up">${'★'.repeat(cur.lvl)} ${STAFF_TITLE[cur.lvl]}</span>` : locked ? `<span class="tag">🔒 Division ${staffMinDiv(k)}</span>` : '<span class="tag sale">Ledig tjänst</span>'}</div>
      ${cur ? `<div><b>${esc(cur.name)}</b> <span class="muted">· sedan säsong ${cur.since} · ${money(staffWage(k, cur.lvl))} i veckan</span></div><p style="margin:0">${S.desc(cur.lvl)}</p>${S.auto ? `<label style="display:flex;align-items:flex-start;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" style="margin-top:2px;flex:none" data-change="autoToggle" data-a="${S.auto}"${(cl.auto || {})[S.auto] !== false ? ' checked' : ''}> 🤖 ${S.autoText}</label>` : ''}`
        : `<p class="muted" style="margin:0">${locked ? `Låses upp när ni når division ${staffMinDiv(k)}. ` : ''}Med en ${S.name.toLowerCase()}: ${S.desc(1).charAt(0).toLowerCase() + S.desc(1).slice(1)} <small>(nivå ★)</small></p>`}
      ${locked ? '' : `<div class="row" style="flex-wrap:wrap">${opts}</div>`}
      ${cur ? `<button class="btn sm" type="button" data-act="fire" data-k="${k}" style="align-self:flex-start">Säg upp</button>` : ''}
    </div>`;
  };
  return `<div class="spread"><h2 style="font-size:40px">Personal</h2><span class="muted">Kassa <b>${money(cl.cash)}</b> · Personallöner <b>${money(-wb.staff)}</b>/v</span></div>
  <p class="muted" style="margin:0 0 4px">Ju högre upp ni spelar, desto fler och bättre medarbetare kan ni anställa. ${DIVS.length === 6 ? 'Division 5–6: nivå ★ · division 3–4: upp till ★★ · division 1–2: upp till ★★★.' : 'Division 4: nivå ★ · division 3: upp till ★★ · division 2 och 1: upp till ★★★.'} Värvningen kostar fyra veckolöner.</p>
  <div class="grid">${Object.entries(STAFF).map(([k, S]) => card(k, S)).join('')}</div>`;
};
ACTIONS.autoToggle = el => { C.club.auto = C.club.auto || {}; C.club.auto[el.dataset.a] = el.checked; act(null, el.checked ? 'Automatiken är på.' : 'Automatiken är av.'); };
ACTIONS.hire = el => { const k = el.dataset.k, l = +el.dataset.l; act(hireStaff(k, l), `${STAFF[k].name} anställd!`); };
ACTIONS.fire = el => {
  const k = el.dataset.k, st = C.club.staff[k];
  modal(`<h2>Säga upp ${esc(st.name)}?</h2><p>${STAFF[k].name} slutar direkt. Du får inte tillbaka värvningskostnaden.</p>
    <div class="row"><button class="btn" type="button" data-act="fireYes" data-k="${k}">Ja, säg upp</button><button class="btn primary" type="button" data-act="closeModal">Avbryt</button></div>`);
};
ACTIONS.fireYes = el => { closeModal(); act(fireStaff(el.dataset.k), 'Uppsagd.'); };

// ===== Ekonomi =====
const LEDGER_NAME = { staff: 'Personallöner', hire: 'Värvning av personal', cup: 'Ligacupen', tickets: 'Biljetter', sponsors: 'Sponsorer', tv: 'TV-pengar', merch: 'Souvenirer', wages: 'Löner', upkeep: 'Drift av arena och anläggningar', transfers: 'Spelarköp och -försäljningar', build: 'Byggen' };
SCREENS.economy = () => {
  const wb = weeklyBudget(), t = userTeam(), last = C.lastMatch && C.lastMatch.ledger;
  const est = attendance(t, C.teams.find(x => !x.user));
  const line = (k, v) => `<tr><td>${LEDGER_NAME[k] || k}</td><td class="num ${v < 0 ? 'bad' : 'good'}">${money(v)}</td></tr>`;
  const wages = t.players.slice().sort((a, b) => playerWage(b) - playerWage(a));
  return `<div class="spread"><h2 style="font-size:40px">Ekonomi</h2><span>Kassa <b class="${C.club.cash < 0 ? 'bad' : ''}">${money(C.club.cash)}</b></span></div>
  <div class="grid">
    <div class="card"><h3>Förra veckan</h3>
      ${last ? `<table><tbody>${Object.entries(last).map(([k, v]) => line(k, v)).join('')}<tr><td><b>Netto</b></td><td class="num"><b class="${sumLedger(last) < 0 ? 'bad' : 'good'}">${money(sumLedger(last))}</b></td></tr></tbody></table>` : '<p class="muted" style="margin:0">Ingen match spelad ännu.</p>'}
    </div>
    <div class="card"><h3>Varje vecka</h3>
      <table><tbody>${Object.entries(wb).map(([k, v]) => line(k, v)).join('')}<tr><td><b>Netto utan biljetter</b></td><td class="num"><b class="${sumLedger(wb) < 0 ? 'bad' : 'good'}">${money(sumLedger(wb))}</b></td></tr></tbody></table>
      <p class="muted" style="margin:0">Biljetter vid hemmamatch: ungefär ${money(est.income)} (${est.total.toLocaleString('sv-SE')} åskådare).</p>
    </div>
    <div class="card"><h3>Högsta lönerna</h3>
      <table><tbody>${wages.slice(0, 6).map(p => `<tr><td>${esc(p.name)}</td><td class="num">${money(playerWage(p))}</td></tr>`).join('')}</tbody></table>
      <p class="muted" style="margin:0">Lönen följer spelarens värde, så den stiger när spelaren utvecklas.</p>
    </div>
    <div class="card"><h3>Prispengar</h3>
      <table><tbody>${PRIZE.slice(0, divGroup(C.div).teams.length).map((v, i) => `<tr><td>${i + 1}:a plats</td><td class="num">${money(v * DIV_MULT[C.div])}</td></tr>`).join('')}</tbody></table>
    </div>
  </div>`;
};

// ===== Serien =====
let leagueDiv = null, scorerScope = 'div';
function scorerCards(d) {
  const all = scorerScope === 'all', rows = leaders(all ? allTeams() : divGroup(d).teams);
  const divOf = t => DIVS.find(n => divGroup(n).teams.includes(t));
  // Laget står på en egen liten rad under namnet, så att siffrorna får plats på mobilen
  const list = (sorted, cols) => `<div class="tablewrap"><table><thead><tr><th>#</th><th>Spelare</th>${cols.map(c => `<th class="num">${c[0]}</th>`).join('')}</tr></thead><tbody>
    ${sorted.slice(0, 10).map((r, i) => `<tr class="${r.t.user ? 'me' : ''}"><td>${i + 1}</td><td style="white-space:normal">${esc(r.p.name)} ${traitBadges(r.p)}<div class="muted" style="font-size:12px">${esc(r.t.name)}${all ? ` · Div ${divOf(r.t)}` : ''}</div></td>${cols.map(c => `<td class="num">${c[1](r)}</td>`).join('')}</tr>`).join('') || '<tr><td colspan="5" class="muted">Inga mål ännu den här säsongen.</td></tr>'}
  </tbody></table></div>`;
  const scorers = rows.filter(r => r.g > 0).sort((x, y) => y.g - x.g || y.a - x.a || x.p.name.localeCompare(y.p.name));
  const points = rows.filter(r => r.g + r.a > 0).sort((x, y) => (y.g + y.a) - (x.g + x.a) || y.g - x.g || x.p.name.localeCompare(y.p.name));
  const pick = `<div class="seg" role="group" aria-label="Omfattning"><button type="button" data-act="scorerScope" data-v="div" aria-pressed="${!all}">Division ${d}</button><button type="button" data-act="scorerScope" data-v="all" aria-pressed="${all}">Hela ligan</button></div>`;
  return `<div class="spread"><h2 style="font-size:30px">Skytteliga och poängliga</h2>${pick}</div>
  <div class="grid">
    <div class="card"><h3>⚽ Skytteliga</h3>${list(scorers, [['Mål', r => `<b>${r.g}</b>`], ['Ass', r => r.a]])}</div>
    <div class="card"><h3>⭐ Poängliga</h3>${list(points, [['Mål', r => r.g], ['Ass', r => r.a], ['P', r => `<b>${r.g + r.a}</b>`]])}<div class="muted" style="font-size:12px">Poäng = mål + assist.</div></div>
  </div>`;
}
SCREENS.league = () => {
  const d = leagueDiv || C.div, g = divGroup(d), tb = table(g);
  const formHtml = f => f.slice(-5).map(x => `<span class="tag" style="background:${x === 'V' ? 'rgba(111,208,140,.2)' : x === 'F' ? 'rgba(255,107,107,.18)' : 'rgba(255,255,255,.08)'}">${x}</span>`).join(' ');
  const rounds = g.fixtures.map((pairs, r) => `<div class="card" style="gap:6px${r === C.round ? ';border-color:var(--flood)' : ''}"><h3 style="font-size:16px">Omgång ${r + 1}${r === C.round ? ' · Nästa' : ''}</h3>
    ${pairs.map(([h, a], k) => { const res = g.results[r] && g.results[r][k], mine = g.teams[h].user || g.teams[a].user;
      return `<div class="spread" style="font-size:13px${mine ? ';color:var(--flood)' : ''}"><span>${esc(g.teams[h].name)} – ${esc(g.teams[a].name)}</span><b class="num">${res ? `${res[0]}–${res[1]}` : ''}</b></div>`; }).join('')}</div>`).join('');
  const pick = `<div class="seg" role="group" aria-label="Division">${DIVS.map(n => `<button type="button" id="div-${n}" data-act="leagueDiv" data-v="${n}" aria-pressed="${n === d}">Div ${n}${n === C.div ? ' ★' : ''}</button>`).join('')}</div>`;
  return `<div class="spread"><h2 style="font-size:40px">Division ${d}</h2>${pick}</div>
  <p class="muted" style="margin:0;font-size:13px">Tryck på ett lag för att se startelvan. Säsong ${C.season} · ${d === C.div ? 'Din division.' : `Din klubb spelar i division ${C.div} (★).`} ${(() => { const n = divGroup(d).teams.length, dn = `plats ${n - UP_DOWN + 1}–${n} åker ner`; return d === 1 ? `Högsta divisionen · ${dn}.` : d === lowestDiv() ? `Lägsta divisionen · topp ${UP_DOWN} går upp.` : `Topp ${UP_DOWN} går upp · ${dn}.`; })()}</p>
  <div class="card"><div class="tablewrap"><table>
    <thead><tr><th>#</th><th>Lag</th><th class="num">S</th><th class="num">V</th><th class="num">O</th><th class="num">F</th><th class="num">Mål</th><th class="num">+/-</th><th class="num">P</th><th>Form</th></tr></thead>
    <tbody>${tb.map((r, i) => `<tr class="click${r.t.user ? ' me' : ''}" data-act="team" data-id="${r.t.id}"><td>${i + 1}${i < UP_DOWN && d > 1 ? ' ▲' : i >= tb.length - UP_DOWN && d < lowestDiv() ? ' ▼' : ''}</td><td><div class="row" style="gap:8px">${crest(r.t.kit, 16)}${esc(r.t.name)}</div></td>
      <td class="num">${r.p}</td><td class="num">${r.w}</td><td class="num">${r.d}</td><td class="num">${r.l}</td><td class="num">${r.gf}–${r.ga}</td><td class="num">${r.gf - r.ga}</td><td class="num"><b>${r.pts}</b></td><td>${formHtml(r.form)}</td></tr>`).join('')}</tbody>
  </table></div></div>
  ${C.history.length ? `<div class="card"><h3>Tidigare säsonger</h3><table><tbody>${C.history.map(h => `<tr><td>Säsong ${h.season}</td><td>Division ${h.div}</td><td>${h.pos}:a</td><td class="num">${h.pts} p</td></tr>`).join('')}</tbody></table></div>` : ''}
  ${scorerCards(d)}
  <h2 style="font-size:30px">Spelschema</h2>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${rounds}</div>`;
};

ACTIONS.leagueDiv = el => { leagueDiv = +el.dataset.v; refresh(); };
ACTIONS.scorerScope = el => { scorerScope = el.dataset.v; refresh(); };
// Fliken Serien öppnas alltid på din egen division
{ const openTab = ACTIONS.tab; ACTIONS.tab = el => { if (el.dataset.tab === 'league') leagueDiv = null; openTab(el); }; }

// ===== Start =====
// Startskärmen visas direkt, men "Starta karriär" är spärrad tills vi vet om det finns en sparad karriär i molnet.
// Annars kunde man av misstag börja om innan den sparade karriären hunnit laddas.
(async function boot() {
  try {
    const live = JSON.parse(localStorage.getItem(LIVE_KEY) || 'null');
    if (live) {
      localStorage.removeItem(LIVE_KEY);
      const info = { t: new Date(live.t).toLocaleString('sv-SE'), v: live.v, where: 'Sidan stängdes mitt i en match', state: `minut ${live.min}${live.st ? ' · ' + live.st : ''}${live.rep ? ' · rapporten visades' : ''}`,
        msg: `Telefonen stängde spelet (troligen minnesbrist). Grafik: ${live.low ? 'låg' : 'hög'} · ljud: ${live.sound ? 'på' : 'av'} · hastighet ${live.speed}× · ${live.hidden ? 'skärmen var släckt' : 'skärmen var tänd'}${live.n ? ` · match nr ${live.n} sedan spelet öppnades · ${live.up} min speltid` : ''}`,
        stack: live.low ? '' : 'Grafiken har nu satts till Låg för att minska risken. Du kan ändra under matchen.' };
      localStorage.setItem('flodljus-senaste-fel', JSON.stringify(info));
      if (!live.low) setLowGfx(true);
    }
  } catch (e) { /* ingen lagring */ }
  const local = localLoad();
  START.checking = true;
  renderStart(local && local.v === 1 ? local : null);
  let cloud = null;
  try { if (await initCloud()) cloud = await cloudLoad(); } catch (e) { recordError(e, 'molnladdning'); }
  START.checking = false;
  if (C) return;
  // Molnets version gäller om den är nyare, eller om telefonens kopia bygger på en äldre molnversion
  // (då har karriären spelats vidare på en annan enhet).
  const loc = START.saved;
  const useCloud = cloud && cloud.v === 1 && (!loc || cloud.savedAt > loc.savedAt || (loc.cloudBase != null && cloud.savedAt > loc.cloudBase));
  renderStart(useCloud ? cloud : loc);
})();
