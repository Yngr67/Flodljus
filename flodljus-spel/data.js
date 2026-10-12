'use strict';
// ===================== Karriärmodell =====================
const FIRST = ['Erik', 'Johan', 'Lars', 'Anders', 'Oskar', 'Viktor', 'Filip', 'Ali', 'Ahmed', 'Leo', 'Noah', 'Elias', 'Hugo', 'Liam', 'Adam', 'Emil', 'Isak', 'Theo', 'Linus', 'Jonas', 'Mattias', 'Kevin', 'Albin', 'Samuel', 'Omar', 'Yusuf', 'Marcus', 'Daniel', 'Ludvig', 'Axel', 'Nils', 'Melvin', 'Alvin', 'Ibrahim', 'Mohammed', 'Sebastian', 'Gustav', 'Jakob', 'Anton', 'William', 'Olle', 'Zlatko', 'Mikael', 'Tobias', 'Rasmus', 'Hampus', 'Edvin', 'Arvid', 'Albert', 'Alexander', 'Alfred', 'Algot', 'Alve', 'André', 'Aron', 'August', 'Benjamin', 'Bill', 'Björn', 'Carl', 'Casper', 'Charlie', 'Christian', 'Colin', 'Dante', 'David', 'Dennis', 'Dino', 'Ebbe', 'Edvard', 'Elis', 'Elliot', 'Elton', 'Felix', 'Folke', 'Frank', 'Fredrik', 'Gabriel', 'Gunnar', 'Harald', 'Harry', 'Hassan', 'Henrik', 'Herman', 'Hjalmar', 'Isac', 'Ivar', 'Jack', 'Jacob', 'Jesper', 'Joel', 'John', 'Jonathan', 'Julius', 'Kalle', 'Karim', 'Kasper', 'Kian', 'Lucas', 'Love', 'Loui', 'Ludde', 'Magnus', 'Malte', 'Marko', 'Matteo', 'Max', 'Melker', 'Milo', 'Milton', 'Mio', 'Mohamad', 'Morris', 'Neo', 'Nicolas', 'Niklas', 'Noel', 'Olof', 'Oliver', 'Otto', 'Patrik', 'Per', 'Petter', 'Philip', 'Rafael', 'Robin', 'Ruben', 'Sam', 'Sami', 'Sixten', 'Stefan', 'Svante', 'Sverker', 'Tage', 'Teodor', 'Tim', 'Valter', 'Vidar', 'Viggo', 'Vilgot', 'Wilhelm', 'Yasin', 'Zakaria', 'Åke', 'Östen', 'Amir', 'Emir', 'Ilias', 'Jamal', 'Kenan', 'Luka', 'Mateo', 'Nikola', 'Omid', 'Rami', 'Samir', 'Tariq', 'Edin', 'Arian', 'Liban', 'Mustafa'];
const LAST = ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson', 'Lindberg', 'Lindqvist', 'Berg', 'Holm', 'Sandberg', 'Ek', 'Lund', 'Nyström', 'Forsberg', 'Hassan', 'Ahmadi', 'Jovanović', 'Kovač', 'Öberg', 'Åberg', 'Mäkinen', 'Rahimi', 'Sjöberg', 'Wallin', 'Bergman', 'Engström', 'Dahl', 'Strand', 'Hedlund', 'Blom', 'Falk', 'Lind', 'Mansour', 'Novak', 'Virtanen', 'Håkansson', 'Björk', 'Fors', 'Sundqvist', 'Lundgren', 'Axelsson', 'Holmberg', 'Mattsson', 'Abrahamsson', 'Ahlberg', 'Ahlström', 'Almqvist', 'Andreasson', 'Arvidsson', 'Backlund', 'Bengtsson', 'Berggren', 'Berglund', 'Bergström', 'Björklund', 'Blomqvist', 'Bodin', 'Boström', 'Brandt', 'Bäckström', 'Carlsson', 'Dahlberg', 'Dahlgren', 'Danielsson', 'Ekberg', 'Ekholm', 'Eklund', 'Ekström', 'Elofsson', 'Englund', 'Fransson', 'Fredriksson', 'Gran', 'Granberg', 'Gunnarsson', 'Göransson', 'Hagberg', 'Hallberg', 'Hansson', 'Hedberg', 'Hellström', 'Henriksson', 'Hermansson', 'Hjalmarsson', 'Holmgren', 'Holmqvist', 'Hult', 'Hägglund', 'Isaksson', 'Ivarsson', 'Jakobsson', 'Jansson', 'Jonsson', 'Jönsson', 'Karlberg', 'Kjellberg', 'Klasson', 'Lager', 'Lindahl', 'Lindblom', 'Lindgren', 'Lindholm', 'Lindström', 'Ljung', 'Lundberg', 'Lundin', 'Lundqvist', 'Lövgren', 'Magnusson', 'Malm', 'Martinsson', 'Melin', 'Mårtensson', 'Nordin', 'Nordström', 'Norberg', 'Nyberg', 'Nyman', 'Nordqvist', 'Ottosson', 'Palm', 'Pettersson', 'Pålsson', 'Rask', 'Roos', 'Rosén', 'Samuelsson', 'Sandström', 'Selin', 'Sjögren', 'Sjöström', 'Skog', 'Stenberg', 'Strömberg', 'Sundberg', 'Sundin', 'Svärd', 'Söderberg', 'Söderström', 'Thorén', 'Torstensson', 'Vikström', 'Wahlberg', 'Wallgren', 'Westberg', 'Wikström', 'Åström', 'Öhman', 'Östlund', 'Alić', 'Begović', 'Demir', 'Hadžić', 'Haddad', 'Karimi', 'Kaya', 'Khalil', 'Lehtonen', 'Mohammadi', 'Nieminen', 'Osman', 'Petrović', 'Saleh', 'Yilmaz', 'Korhonen', 'Jensen', 'Hansen', 'Larsen', 'Nielsen', 'Berisha', 'Krasniqi', 'Hosseini', 'Abdi'];
const PLACES = ['Norrby', 'Åsberga', 'Sjövik', 'Lindhult', 'Björkås', 'Ekmora', 'Strandvik', 'Granhed', 'Tallmo', 'Källby', 'Vretby', 'Bergsjövik', 'Hällestad', 'Ängsvik', 'Mossebo', 'Rönnåsen', 'Solvik', 'Djupdal', 'Frostby', 'Ljungmora', 'Stensjö', 'Aspby', 'Tornby', 'Hagnäs', 'Kvarnbo', 'Myrholm', 'Sälgsjö', 'Ormvik', 'Brännås', 'Lövmora', 'Alby', 'Backa', 'Bjurholm', 'Dalby', 'Eksjö', 'Forsbo', 'Gransjö', 'Hagaby', 'Hultsfred', 'Ingarö', 'Järvsö', 'Kalmarsund', 'Lidby', 'Malmby', 'Nyhem', 'Orsby', 'Prästbo', 'Rydsta', 'Skogsby', 'Tibro', 'Uddebo', 'Valla', 'Västanby', 'Ytterby', 'Åkerby', 'Älvsby', 'Öjebyn', 'Björkhaga', 'Fjällby', 'Hammarby', 'Kvarnsjö', 'Lövsta', 'Myrsjö', 'Norrvik', 'Stenhamra', 'Sörby', 'Tallbacka', 'Vikby', 'Ängby', 'Österby'];
const SUFFIX = ['IF', 'BK', 'FF', 'IK', 'SK', 'GoIF', 'AIF', 'FK'];
const KITS = [
  { shirt: '#fecc02', shorts: '#0a5fa8', socks: '#fecc02', num: '#0a5fa8' },
  { shirt: '#c8102e', shorts: '#ffffff', socks: '#c8102e', num: '#ffffff' },
  { shirt: '#1f58b8', shorts: '#ffffff', socks: '#1f58b8', num: '#ffffff' },
  { shirt: '#0a8d3c', shorts: '#ffffff', socks: '#0a8d3c', num: '#ffffff' },
  { shirt: '#161616', shorts: '#161616', socks: '#161616', num: '#ffd23f' },
  { shirt: '#f4f4f4', shorts: '#111111', socks: '#f4f4f4', num: '#111111' },
  { shirt: '#ff7417', shorts: '#1a1a1a', socks: '#ff7417', num: '#1a1a1a' },
  { shirt: '#6a1b9a', shorts: '#ffffff', socks: '#6a1b9a', num: '#ffffff' },
  { shirt: '#8fc3ec', stripes: '#ffffff', shorts: '#111827', socks: '#ffffff', num: '#111827' },
  { shirt: '#7a1f2b', shorts: '#f2e6c9', socks: '#7a1f2b', num: '#f2e6c9' },
  { shirt: '#c8102e', stripes: '#ffffff', shorts: '#111111', socks: '#c8102e', num: '#111111' },
  { shirt: '#12246b', shorts: '#12246b', socks: '#ffd23f', num: '#ffd23f' },
];
const SKINS = ['#f1c7a5', '#e3ad84', '#c68a5e', '#8d5a3b', '#5e3a24'];
const HAIRS = ['#1b1410', '#3b2416', '#6b4423', '#c89b5a', '#2a2a2a', '#e6d3a3'];

const SKILLS = ['gk', 'def', 'pas', 'sho', 'spd', 'sta'];
const SKILL_NAME = { gk: 'Målvakt', def: 'Försvar', pas: 'Passning', sho: 'Avslut', spd: 'Snabbhet', sta: 'Kondition' };
const SKILL_ABBR = { gk: 'MV', def: 'FÖR', pas: 'PAS', sho: 'AVS', spd: 'SNB', sta: 'KON' };
const POS_NAME = { GK: 'MV', DEF: 'FÖR', MID: 'MIT', FWD: 'ANF' };
// 7 mot 7 i formationen 2-3-1: målvakt, två backar, tre mittfältare, en anfallare
const SLOTS = ['GK', 'DL', 'DR', 'LM', 'MF', 'RM', 'FW'];
const SLOT_NAME = { GK: 'Målvakt', DL: 'Vänsterback', DR: 'Högerback', LM: 'Vänstermittfält', MF: 'Centralt mittfält', RM: 'Högermittfält', FW: 'Anfallare' };
const SQUAD_POS = ['GK', 'GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD'];
const SLOT_W = {
  GK: { gk: 0.8, pas: 0.1, spd: 0.1 },
  DL: { def: 0.55, spd: 0.2, pas: 0.15, sta: 0.1 },
  DR: { def: 0.55, spd: 0.2, pas: 0.15, sta: 0.1 },
  LM: { pas: 0.35, spd: 0.3, sho: 0.15, sta: 0.12, def: 0.08 },
  MF: { pas: 0.45, def: 0.15, sho: 0.15, spd: 0.15, sta: 0.1 },
  RM: { pas: 0.35, spd: 0.3, sho: 0.15, sta: 0.12, def: 0.08 },
  FW: { sho: 0.55, spd: 0.25, pas: 0.1, sta: 0.1 },
};
const POS_SLOT = { GK: 'GK', DEF: 'DL', MID: 'MF', FWD: 'FW' };
const PROFILES = {
  GK: { gk: 4, def: -1, pas: -2, sho: -5, spd: -1, sta: 0 },
  DEF: { gk: -6, def: 3, pas: 0, sho: -2, spd: 0, sta: 1 },
  MID: { gk: -6, def: 0, pas: 3, sho: 0, spd: 0, sta: 1.5 },
  FWD: { gk: -6, def: -2, pas: 0, sho: 3.5, spd: 1.5, sta: 0 },
};
// ===== Format: 6 divisioner × 12 lag (nytt) eller 4 × 8 (äldre karriärer tills säsongen är slut) =====
const FMT = {
  4: { teams: 8, up: 2, level: { 1: 13.5, 2: 11, 3: 8.5, 4: 6 }, mult: { 1: 5.5, 2: 3.2, 3: 1.8, 4: 1 }, tv: { 1: 25000, 2: 12000, 3: 5000, 4: 2000 } },
  6: { teams: 12, up: 3, level: { 1: 13.5, 2: 11.5, 3: 9.8, 4: 8.3, 5: 7, 6: 6 }, mult: { 1: 5.5, 2: 3.6, 3: 2.4, 4: 1.7, 5: 1.3, 6: 1 }, tv: { 1: 25000, 2: 14000, 3: 8000, 4: 5000, 5: 3000, 6: 2000 } },
};
let DIVS = [1, 2, 3, 4, 5, 6], LEVEL = FMT[6].level, DIV_MULT = FMT[6].mult, TV_MONEY = FMT[6].tv, TEAMS_PER_DIV = 12, UP_DOWN = 3;
function setFormat(n) {
  const f = FMT[n];
  DIVS = Array.from({ length: n }, (_, i) => i + 1); LEVEL = f.level; DIV_MULT = f.mult; TV_MONEY = f.tv; TEAMS_PER_DIV = f.teams; UP_DOWN = f.up;
}
const lowestDiv = () => DIVS.length;
// Längre säsong (22 omgångar) ska inte ge snabbare utveckling per säsong: veckans träning skalas mot 14 omgångar
const seasonScale = () => 14 / Math.max(14, (C && C.fixtures ? C.fixtures.length : 14));
const PRIZE = [60000, 45000, 35000, 28000, 22000, 18000, 15000, 12000, 10000, 8000, 6000, 5000];
// Visning på skalan 1–100 (internt räknar spelet 1–20 med decimaler)
const disp = v => Math.max(1, Math.min(100, Math.round(v * 5)));
const TICKET = { standing: 12, seated: 22, covered: 30, vip: 150 };
const PRICE_LEVEL = { low: { mult: 0.8, demand: 1.18, name: 'Lågt' }, normal: { mult: 1, demand: 1, name: 'Normalt' }, high: { mult: 1.3, demand: 0.78, name: 'Högt' } };
const INTENSITY = { light: { gain: 0.7, inj: 0.7, name: 'Lätt' }, normal: { gain: 1, inj: 1, name: 'Normal' }, hard: { gain: 1.3, inj: 1.6, name: 'Hård' } };
const FOCUS = { all: 'Allround', gk: 'Målvakt', def: 'Försvar', pas: 'Passning', sho: 'Avslut', spd: 'Snabbhet', sta: 'Kondition' };
const TACTIC_NAME = { def: 'Defensiv', bal: 'Balanserad', off: 'Offensiv' };
// Utbyggnaderna växer med divisionen: i division 6 bygger man 250 platser åt gången, i division 1 ungefär 1 000.
const buildScale = () => (C ? 1 + (lowestDiv() - C.div) * 0.6 : 1);
const seats = n => Math.round(n * buildScale() / 50) * 50;
const BUILDS = {
  standing: { name: 'Ståplatsläktare', desc: () => `+${seats(250).toLocaleString('sv-SE')} ståplatser på kortsidorna`, cost: () => Math.round(30000 * buildScale() * 1.05), weeks: 2, apply: s => { s.standing += seats(250); } },
  seated: { name: 'Sittplatsläktare', desc: () => `+${seats(250).toLocaleString('sv-SE')} sittplatser på långsidan`, cost: () => Math.round(70000 * buildScale() * 1.05), weeks: 3, apply: s => { s.seated += seats(250); } },
  covered: { name: 'Tak över sittplatser', desc: () => `${seats(250).toLocaleString('sv-SE')} sittplatser får tak (dyrare biljetter)`, cost: () => Math.round(90000 * buildScale() * 1.05), weeks: 3, apply: s => { const n = Math.min(s.seated, seats(250)); s.seated -= n; s.covered += n; }, ok: s => s.seated >= 50 },
  vip: { name: 'VIP-loge', desc: () => `+${Math.round(20 * buildScale())} VIP-platser högst upp på läktaren`, cost: () => Math.round(120000 * buildScale()), weeks: 4, apply: s => { s.vip += Math.round(20 * buildScale()); } },
  lights: { name: 'Strålkastare', desc: () => 'Starkare ljus, fler sponsorer', cost: s => 120000 * (s.lights + 1), weeks: 2, apply: s => { s.lights += 1; }, ok: s => s.lights < 3 },
  screen: { name: 'Storbildsskärm', minDiv: 4, desc: () => 'Stor skärm på läktartaket med resultat och repriser. Fler åskådare (+5 %) och gladare supportrar.', cost: () => 350000, weeks: 4, apply: s => { s.screen = 1; }, ok: s => !s.screen },
  tier: { name: 'Övre läktare', minDiv: 3, desc: () => `En andra våning på långsidan: +${seats(1000).toLocaleString('sv-SE')} sittplatser`, cost: () => Math.round(260000 * buildScale()), weeks: 8, apply: s => { s.seated += seats(1000); s.tier = (s.tier || 0) + 1; }, ok: s => (s.tier || 0) < 2 && s.seated + s.covered >= 1500 },
  training: { name: 'Träningsanläggning', desc: () => 'Snabbare utveckling på träningen', cost: (s, f) => 100000 * f.training, weeks: 3, fac: true, apply: (s, f) => { f.training += 1; }, ok: (s, f) => f.training < 5 },
  youth: { name: 'Ungdomsakademi', desc: () => 'Bättre talanger varje säsong', cost: (s, f) => 80000 * f.youth, weeks: 3, fac: true, apply: (s, f) => { f.youth += 1; }, ok: (s, f) => f.youth < 5 },
};
const buildDiv = k => (BUILDS[k].minDiv ? (DIVS.length === 6 ? BUILDS[k].minDiv : Math.max(1, BUILDS[k].minDiv - 2)) : 99);
const buildLocked = k => BUILDS[k].minDiv && C.div > buildDiv(k);

// ===== Personal =====
// Låses upp när klubben klättrar. Nivå ★ till ★★★: högsta nivån beror på divisionen (div 4: ★, div 3: ★★, div 2–1: ★★★).
const STAFF = {
  physio: { icon: '🩺', name: 'Fysioterapeut', minDiv: 4, minDiv6: 6, desc: l => `${l * 20} % färre skador, och skadade spelare blir friska snabbare.` },
  coach: { icon: '📋', name: 'Hjälptränare', minDiv: 3, minDiv6: 5, desc: l => `+${l * 15} % utveckling på träningen.` },
  scout: { icon: '🔭', name: 'Scout', minDiv: 3, minDiv6: 4, desc: l => `Hittar bättre spelare till transfermarknaden och förhandlar ner priset ${l * 4} %.` },
  admin: { icon: '🗂️', name: 'Administratör', minDiv: 2, minDiv6: 3, desc: l => `Byggen ${l * 10} % billigare${l >= 2 ? ' och en vecka snabbare' : ''}, och +${l * 5} % från sponsorer.` },
  // Dyrare specialister (lön ×1,8) – några sköter saker automatiskt
  fitness: { icon: '💪', name: 'Fystränare', minDiv: 4, minDiv6: 6, pricey: true, desc: l => `Spelarna orkar mer i slutet av matcherna och skadar sig ${l * 10} % mer sällan.` },
  youthHead: { icon: '🎓', name: 'Akademichef', minDiv: 4, minDiv6: 5, pricey: true, auto: 'loan', autoText: 'Låna ut juniorer som inte får speltid automatiskt inför varje säsong', desc: l => `Större chans till stjärnor i akademin${l >= 3 ? ' och en extra junior varje år' : ''}.` },
  marketing: { icon: '📣', name: 'Marknadschef', minDiv: 3, minDiv6: 4, pricey: true, desc: l => `+${l * 8} % sponsorpengar, +${l * 10} % souvenirer och fler åskådare.` },
  director: { icon: '🧑‍💼', name: 'Sportchef', minDiv: 3, minDiv6: 4, pricey: true, auto: 'sell', autoText: 'Sälj spelare som ligger ute till försäljning automatiskt när ett bra bud kommer', desc: l => `Klubbar bjuder ${l * 5} % mer på dina spelare, och fynd på transfermarknaden markeras med ⭐.` },
  finance: { icon: '💼', name: 'Ekonomichef', minDiv: 4, minDiv6: 6, desc: l => `Ger råd om ekonomin och räknar ut om byggen lönar sig. Sänker driftkostnaderna ${l * 5} %.` },
  analyst: { icon: '🧠', name: 'Matchanalytiker', minDiv: 2, minDiv6: 3, pricey: true, desc: l => `Laget presterar ${l * 2} % bättre i matcherna, och du får veta motståndarens farligaste spelare.` },
};
const staffWage = (k, l) => Math.round(STAFF_WAGE[l] * (STAFF[k].pricey ? 1.8 : 1));
const autoOn = k => !!(C.club.staff && C.club.staff[k] && STAFF[k].auto && (C.club.auto || {})[STAFF[k].auto] !== false);
const STAFF_WAGE = { 1: 900, 2: 2500, 3: 6000 };
const STAFF_TITLE = { 1: 'Junior', 2: 'Erfaren', 3: 'Elit' };
const staffMinDiv = k => (DIVS.length === 6 ? STAFF[k].minDiv6 : STAFF[k].minDiv);
const staffMax = () => (DIVS.length === 6 ? (C.div >= 5 ? 1 : C.div >= 3 ? 2 : 3) : (C.div >= 4 ? 1 : C.div === 3 ? 2 : 3));
const staffLvl = k => (C.club.staff && C.club.staff[k] ? C.club.staff[k].lvl : 0);
function hireStaff(k, lvl) {
  const S = STAFF[k], cl = C.club;
  cl.staff = cl.staff || {};
  if (C.div > staffMinDiv(k)) return `${S.name} kan anställas först i division ${staffMinDiv(k)}.`;
  if (lvl > staffMax()) return `Nivå ${'★'.repeat(lvl)} kräver en högre division.`;
  const fee = staffWage(k, lvl) * 4;
  if (cl.cash < fee) return `Du har inte råd. Det saknas ${money(fee - cl.cash)}.`;
  const old = cl.staff[k];
  cl.cash -= fee; addLedger('hire', -fee);
  cl.staff[k] = { name: `${R.pick(FIRST)} ${R.pick(LAST)}`, lvl, since: C.season };
  news(`${cl.staff[k].name} anställs som ${S.name.toLowerCase()} (${STAFF_TITLE[lvl]}${old ? `, ersätter ${old.name}` : ''}).`, 'good');
  return null;
}
function fireStaff(k) {
  const cl = C.club, st = cl.staff && cl.staff[k];
  if (!st) return 'Ingen att säga upp.';
  delete cl.staff[k];
  news(`${st.name} (${STAFF[k].name.toLowerCase()}) lämnar klubben.`);
  return null;
}
const buildCost = key => Math.round(BUILDS[key].cost(C.club.stadium, C.club.fac) * (1 - staffLvl('admin') * 0.1) / 500) * 500;
const buildWeeks = key => Math.max(1, BUILDS[key].weeks - (staffLvl('admin') >= 2 ? 1 : 0));

// Specialegenskaper (märken). Ungefär var femte spelare har en, några få har två.
const TRAITS = {
  drb: { icon: '🌀', name: 'Dribblare', desc: 'Svår att ta bollen ifrån och kan hoppa över glidtacklingar.' },
  pow: { icon: '💥', name: 'Kanonskott', desc: 'Skjuter extra hårt och vågar skjuta från längre håll.' },
  hdr: { icon: '🎯', name: 'Nickkung', desc: 'Når högre och nickar oftare och säkrare mot mål.' },
  crs: { icon: '📐', name: 'Inläggsspecialist', desc: 'Slår precisa inlägg från kanten in i straffområdet.' },
  gkj: { icon: '🧤', name: 'Flygande målvakt', desc: 'Kastar sig längre och snabbare och räddar fler skott.' },
  spd: { icon: '⚡', name: 'Snabbis', desc: 'Extra snabb, både med och utan boll.' },
  tkl: { icon: '🛡️', name: 'Bollvinnare', desc: 'Vinner bollen oftare och når längre i glidtacklingar.' },
  sta: { icon: '🫁', name: 'Maratonlöpare', desc: 'Tröttnar knappt och orkar lika mycket i slutet av matchen.' },
};
const TRAIT_POOL = {
  GK: { gkj: 1 },
  DEF: { tkl: 3, spd: 2, sta: 2, hdr: 2 },
  MID: { drb: 2, crs: 2, sta: 2, pow: 2, tkl: 1, spd: 1 },
  FWD: { drb: 3, pow: 3, hdr: 3, spd: 2 },
};
function rollTraits(pos, level) {
  const out = [], pool = { ...TRAIT_POOL[pos] };
  if (Math.random() > clamp(0.16 + (level - 6) * 0.015, 0.14, 0.3)) return out;
  const n = Math.random() < 0.25 && Object.keys(pool).length > 1 ? 2 : 1;
  for (let i = 0; i < n; i++) {
    let r = Math.random() * Object.values(pool).reduce((a, b) => a + b, 0);
    for (const k in pool) { r -= pool[k]; if (r <= 0) { out.push(k); delete pool[k]; break; } }
  }
  return out;
}

// ===== Nationaliteter =====
// De flesta spelare är svenska. Utländska spelare är vanligare högre upp i pyramiden.
const NATIONS = {
  SE: { flag: '🇸🇪', name: 'Sverige', gen: 'Sveriges' },
  NO: { flag: '🇳🇴', name: 'Norge', gen: 'Norges', first: ['Ola', 'Sander', 'Magnus', 'Jonas', 'Henrik', 'Erling', 'Martin', 'Kristian', 'Sindre', 'Eirik', 'Håkon', 'Torbjørn'], last: ['Hansen', 'Johansen', 'Olsen', 'Berge', 'Haugen', 'Solberg', 'Bakken', 'Dahl', 'Strand', 'Myhre', 'Lie', 'Nygård'] },
  DK: { flag: '🇩🇰', name: 'Danmark', gen: 'Danmarks', first: ['Mads', 'Rasmus', 'Kasper', 'Mikkel', 'Frederik', 'Christian', 'Søren', 'Anders', 'Jonas', 'Thomas', 'Mathias', 'Nicolai'], last: ['Jensen', 'Nielsen', 'Hansen', 'Pedersen', 'Kristensen', 'Sørensen', 'Rasmussen', 'Poulsen', 'Madsen', 'Christensen', 'Thomsen', 'Møller'] },
  FI: { flag: '🇫🇮', name: 'Finland', gen: 'Finlands', first: ['Juha', 'Teemu', 'Jukka', 'Mikko', 'Antti', 'Lauri', 'Joni', 'Eero', 'Ville', 'Sami', 'Tuomas', 'Jere'], last: ['Virtanen', 'Korhonen', 'Mäkinen', 'Nieminen', 'Hämäläinen', 'Laine', 'Heikkinen', 'Koskinen', 'Järvinen', 'Lehtonen', 'Salonen', 'Rantanen'] },
  IS: { flag: '🇮🇸', name: 'Island', gen: 'Islands', first: ['Gylfi', 'Aron', 'Jóhann', 'Birkir', 'Hörður', 'Ragnar', 'Kári', 'Arnór', 'Alfreð', 'Hannes'], last: ['Sigurðsson', 'Gunnarsson', 'Guðmundsson', 'Bjarnason', 'Magnússon', 'Jónsson', 'Halldórsson', 'Finnbogason', 'Árnason', 'Traustason'] },
  DE: { flag: '🇩🇪', name: 'Tyskland', gen: 'Tysklands', first: ['Lukas', 'Jonas', 'Leon', 'Felix', 'Maximilian', 'Tim', 'Niklas', 'Florian', 'Julian', 'Moritz', 'Kai', 'Thomas'], last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Becker', 'Hoffmann', 'Wagner', 'Koch', 'Richter', 'Wolf', 'Neuer'] },
  NL: { flag: '🇳🇱', name: 'Nederländerna', gen: 'Nederländernas', first: ['Daan', 'Bram', 'Sem', 'Thijs', 'Joris', 'Ruben', 'Stijn', 'Jesse', 'Lars', 'Wout', 'Frenkie', 'Ryan'], last: ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'Bos', 'Vos'] },
  EN: { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England', gen: 'Englands', first: ['Harry', 'Jack', 'James', 'Oliver', 'George', 'Charlie', 'Jordan', 'Mason', 'Declan', 'Kyle', 'Jude', 'Bukayo'], last: ['Smith', 'Jones', 'Taylor', 'Brown', 'Walker', 'Wright', 'Robinson', 'Hughes', 'Clarke', 'Stones', 'Rice', 'Henderson'] },
  ES: { flag: '🇪🇸', name: 'Spanien', gen: 'Spaniens', first: ['Pablo', 'Sergio', 'Álvaro', 'Iker', 'Javier', 'Raúl', 'Diego', 'Marcos', 'Rodrigo', 'Dani', 'Pedro', 'Unai'], last: ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Ruiz', 'Moreno', 'Navarro'] },
  FR: { flag: '🇫🇷', name: 'Frankrike', gen: 'Frankrikes', first: ['Lucas', 'Hugo', 'Antoine', 'Théo', 'Mathis', 'Kylian', 'Olivier', 'Raphaël', 'Ousmane', 'Adrien', 'Benjamin', 'Jules'], last: ['Martin', 'Bernard', 'Dubois', 'Durand', 'Lefebvre', 'Moreau', 'Laurent', 'Girard', 'Mercier', 'Fontaine', 'Rousseau', 'Blanc'] },
  BR: { flag: '🇧🇷', name: 'Brasilien', gen: 'Brasiliens', first: ['Gabriel', 'Lucas', 'Matheus', 'Rafael', 'Thiago', 'Bruno', 'Vinícius', 'Rodrigo', 'Felipe', 'Caio', 'Renan', 'Danilo'], last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Almeida', 'Ferreira', 'Lima', 'Carvalho', 'Ribeiro', 'Barbosa'] },
  AR: { flag: '🇦🇷', name: 'Argentina', gen: 'Argentinas', first: ['Lautaro', 'Julián', 'Nicolás', 'Facundo', 'Gonzalo', 'Ezequiel', 'Rodrigo', 'Lionel', 'Enzo', 'Alexis', 'Matías', 'Thiago'], last: ['Fernández', 'Álvarez', 'Romero', 'Martínez', 'Acuña', 'Paredes', 'Otamendi', 'Molina', 'Correa', 'Domínguez', 'Rojas', 'Medina'] },
  NG: { flag: '🇳🇬', name: 'Nigeria', gen: 'Nigerias', first: ['Victor', 'Samuel', 'Ahmed', 'Kelechi', 'Emmanuel', 'Wilfred', 'Ademola', 'Chidozie', 'Calvin', 'Joe', 'Taiwo', 'Moses'], last: ['Osimhen', 'Iheanacho', 'Ndidi', 'Musa', 'Lookman', 'Aribo', 'Awoniyi', 'Okoye', 'Ekong', 'Simon', 'Onyeka', 'Bassey'] },
  GH: { flag: '🇬🇭', name: 'Ghana', gen: 'Ghanas', first: ['Kwame', 'Kofi', 'Thomas', 'Mohammed', 'Jordan', 'Daniel', 'Inaki', 'Abdul', 'Kamaldeen', 'Joseph', 'Emmanuel', 'Richard'], last: ['Partey', 'Ayew', 'Kudus', 'Amartey', 'Salisu', 'Semenyo', 'Owusu', 'Mensah', 'Boateng', 'Asamoah', 'Djiku', 'Lamptey'] },
  RS: { flag: '🇷🇸', name: 'Serbien', gen: 'Serbiens', first: ['Dušan', 'Aleksandar', 'Nemanja', 'Sergej', 'Luka', 'Filip', 'Strahinja', 'Andrija', 'Uroš', 'Nikola', 'Marko', 'Lazar'], last: ['Vlahović', 'Mitrović', 'Milinković', 'Tadić', 'Kostić', 'Pavlović', 'Živković', 'Jović', 'Lukić', 'Gudelj', 'Babić', 'Nikolić'] },
  PL: { flag: '🇵🇱', name: 'Polen', gen: 'Polens', first: ['Robert', 'Piotr', 'Jakub', 'Kamil', 'Krzysztof', 'Wojciech', 'Mateusz', 'Arkadiusz', 'Przemysław', 'Bartosz', 'Sebastian', 'Karol'], last: ['Nowak', 'Kowalski', 'Wiśniewski', 'Lewandowski', 'Zieliński', 'Szymański', 'Kamiński', 'Piątek', 'Bednarek', 'Glik', 'Krychowiak', 'Frankowski'] },
  BA: { flag: '🇧🇦', name: 'Bosnien', gen: 'Bosniens', first: ['Edin', 'Miralem', 'Sead', 'Ermedin', 'Rade', 'Haris', 'Amar', 'Benjamin', 'Ermin', 'Kenan', 'Anel', 'Smail'], last: ['Džeko', 'Pjanić', 'Kolašinac', 'Demirović', 'Krunić', 'Hajradinović', 'Hadžikadunić', 'Tahirović', 'Bičakčić', 'Ahmetović', 'Prevljak', 'Gojak'] },
};
const FOREIGN = Object.keys(NATIONS).filter(k => k !== 'SE');
// Andel utländska spelare per division (högre upp = fler)
const foreignShare = d => ({ 1: 0.25, 2: 0.2, 3: 0.15, 4: 0.1, 5: 0.07, 6: 0.05 }[d] || 0.05);
const rollNat = share => (Math.random() < share ? R.pick(FOREIGN) : 'SE');
const natFlag = p => (p.nat && p.nat !== 'SE' ? NATIONS[p.nat].flag + ' ' : '');
const away = p => !!(p.inj || p.away); // skadad eller i landslaget

let C = null;
// Unika spelarnamn: varje namn delas bara ut en gång i världen
let NAMES = null;
function namesInUse() {
  if (NAMES) return NAMES;
  NAMES = new Set();
  if (!C) return NAMES;
  const teams = (C.teams || []).slice();
  if (C.league) for (const k in C.league) teams.push(...C.league[k].teams);
  for (const t of teams) for (const p of t.players) NAMES.add(p.name);
  for (const p of C.market || []) NAMES.add(p.name);
  for (const l of C.loans || []) NAMES.add(l.p.name);
  return NAMES;
}
function genName(nat) {
  const used = namesInUse(), N = nat && nat !== 'SE' ? NATIONS[nat] : null;
  let n;
  for (let i = 0; i < 60; i++) { n = N ? `${R.pick(N.first)} ${R.pick(N.last)}` : `${R.pick(FIRST)} ${R.pick(LAST)}`; if (!used.has(n)) break; }
  used.add(n);
  return n;
}
// Äldre karriärer: döp om dubbletter (din klubbs spelare behåller sina namn så långt det går)
function fixDuplicateNames() {
  if (C.nameFix) return 0;
  C.nameFix = 1; NAMES = new Set();
  const me = userTeam(), teams = [me].concat(allTeams().filter(t => t !== me));
  let n = 0, mine = [];
  const fix = (p, own) => { if (NAMES.has(p.name)) { const old = p.name; p.name = genName(); n++; if (own) mine.push(`${old} → ${p.name}`); } else NAMES.add(p.name); };
  for (const t of teams) for (const p of t.players) fix(p, t === me);
  for (const l of C.loans || []) fix(l.p, true);
  for (const p of C.market || []) fix(p, false);
  if (mine.length) news(`Två spelare hade samma namn. Nytt namn: ${mine.join(', ')}.`);
  return n;
}
const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  gauss: () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); },
  poisson: l => { const Lx = Math.exp(-l); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > Lx); return k - 1; },
};
const r1 = v => Math.round(v * 10) / 10;
const money = v => `${Math.round(v).toLocaleString('sv-SE')} kr`;

// ===== Spelare =====
function genPlayer(level, pos, age, nat) {
  age = age || R.int(17, 33); nat = nat || 'SE';
  if (nat !== 'SE') level += 0.4; // utländska värvningar håller ofta lite högre nivå
  const base = level + R.gauss() * 1.5 + (age < 20 ? -1.4 : age < 22 ? -0.6 : age > 30 ? 0.4 : 0);
  const sk = {};
  for (const k of SKILLS) sk[k] = r1(clamp(base + PROFILES[pos][k] + R.gauss() * 1.2, 1, 20));
  const main = Math.max(...SKILLS.filter(k => PROFILES[pos][k] > 0).map(k => sk[k]));
  // Potential: de flesta unga blir hyggliga, ett fåtal blir stjärnor (sned fördelning – inte en stjärna i varje kull)
  const u = Math.random();
  const head = age <= 19 ? 0.5 + 6.5 * Math.pow(u, 2.2) : age <= 22 ? 0.3 + 4 * Math.pow(u, 2) : age <= 26 ? u * 1.8 : u * 0.6;
  return {
    id: C ? C.nextId++ : Math.floor(Math.random() * 1e9), name: genName(nat), nat, age, pos, sk,
    pot: r1(clamp(main + head, main, 20)), form: R.int(2, 4), num: 0, inj: 0, listed: false,
    skin: R.pick(SKINS), hair: R.pick(HAIRS), goals: 0, apps: 0, rsum: 0, last: null, tr: rollTraits(pos, level),
  };
}
function slotRating(p, slot) { let r = 0; const w = SLOT_W[slot]; for (const k in w) r += p.sk[k] * w[k]; return r; }
function ovr(p) { return slotRating(p, POS_SLOT[p.pos]); }
function formMult(p) { return 0.88 + (p.form - 1) * 0.06; }
function playerValue(p) {
  const o = ovr(p);
  const ageM = p.age <= 21 ? 1.4 : p.age <= 26 ? 1.2 : p.age <= 29 ? 1 : p.age <= 32 ? 0.65 : 0.35;
  const v = Math.pow(o, 3.2) * 30 * ageM * (1 + Math.max(0, p.pot - o) * (p.age <= 23 ? 0.12 : 0.07)) * (1 + 0.15 * (p.tr ? p.tr.length : 0)) * (1 + Math.min(20, p.caps || 0) * 0.01);
  return Math.max(2000, Math.round(v / 500) * 500);
}
// Lön: stiger brant med kvaliteten. En typisk spelare i division 1 kostar några tusen i veckan, en stjärna mycket mer.
function playerWage(p) {
  const o = Math.max(1, ovr(p)), young = p.age <= 20 ? 0.6 : 1, caps = 1 + Math.min(20, p.caps || 0) * 0.01;
  return Math.round((250 + 1900 * Math.pow(o / 14, 3.6) * young * caps) / 10) * 10;
}
function levelName(v) { return v < 5 ? 'Svag' : v < 8 ? 'Hygglig' : v < 11 ? 'Bra' : v < 14 ? 'Utmärkt' : v < 17 ? 'Fantastisk' : 'Världsklass'; }
function freeNumber(team, pos) {
  const used = new Set(team.players.map(p => p.num));
  const pref = { GK: [1, 12, 30], DEF: [2, 3, 4, 5, 6], MID: [8, 10, 7, 14, 16], FWD: [9, 11, 19, 20] }[pos];
  for (const n of pref) if (!used.has(n)) return n;
  for (let n = 2; n < 99; n++) if (!used.has(n)) return n;
  return 99;
}

// ===== Lag =====
function altKit(k) {
  return colorDist(k.shirt, '#ffffff') > 200
    ? { shirt: '#f2f2f2', shorts: k.shirt, socks: '#f2f2f2', num: k.shirt, stripes: null }
    : { shirt: '#1b1f2e', shorts: '#1b1f2e', socks: '#1b1f2e', num: '#ffffff', stripes: null };
}
function genStadium(div) {
  // Datorlagens arenor: större högre upp (gäller både 4- och 6-divisionsformatet)
  const six = DIVS.length === 6, d = six ? div : div + (div >= 3 ? 2 : div === 2 ? 1 : 0);
  const cap = ({ 1: 15000, 2: 8000, 3: 4500, 4: 2600, 5: 1500, 6: 900 }[d] || 900) * rnd(0.7, 1.3);
  return {
    standing: Math.round(cap * 0.55 / 50) * 50, seated: Math.round(cap * 0.35 / 50) * 50,
    covered: Math.round(cap * (d <= 2 ? 0.1 : 0.03) / 50) * 50, vip: d <= 2 ? 40 : 0, lights: d <= 1 ? 3 : d <= 3 ? 2 : 1,
    tier: d === 1 ? 1 : 0, screen: d <= 2 ? 1 : 0,
  };
}
// Reparera arenor som saknar giltig kapacitet (fel i äldre versioner för division 5–6)
function fixStadiums() {
  let n = 0;
  for (const d of DIVS) for (const t of divGroup(d).teams) if (!t.user && !(capacity(t.stadium) > 0)) { t.stadium = genStadium(d); n++; }
  return n;
}
function genTeam(div, usedNames) {
  let name;
  do { name = `${R.pick(PLACES)} ${R.pick(SUFFIX)}`; } while (usedNames.has(name));
  usedNames.add(name);
  const kit = { ...R.pick(KITS) };
  const t = {
    id: C.nextId++, name, short: name.slice(0, 3).toUpperCase(), kit, alt: altKit(kit), tactic: R.pick(['def', 'bal', 'bal', 'off']),
    players: [], lineup: [], stadium: genStadium(div),
  };
  const lvl = LEVEL[div] + rnd(-1.3, 1.3);
  for (const pos of SQUAD_POS) {
    const p = genPlayer(lvl, pos, null, rollNat(foreignShare(div))); p.num = freeNumber(t, pos); t.players.push(p);
  }
  autoLineup(t);
  return t;
}
function autoLineup(t) {
  const avail = t.players.filter(p => !away(p));
  const pool = avail.length >= SLOTS.length ? avail : t.players.slice();
  const chosen = {};
  for (const slot of ['GK', 'FW', 'MF', 'LM', 'RM', 'DL', 'DR']) {
    let best = null, bv = -1;
    for (const p of pool) { if (Object.values(chosen).includes(p.id)) continue; const v = slotRating(p, slot) * formMult(p); if (v > bv) { bv = v; best = p; } }
    chosen[slot] = best ? best.id : null;
  }
  t.lineup = SLOTS.map(s => chosen[s]);
}
function findP(t, id) { return t.players.find(p => p.id === id); }
function lineupPlayers(t) {
  // Fyller luckor (skadade/sålda/landslag) automatiskt. Din valda startelva (t.wish) kommer ihåg vilka som ska
  // spela, så att spelarna tar tillbaka sina platser när de är friska eller hemma från landslaget igen.
  const valid = id => { const p = findP(t, id); return p && !away(p); };
  const okSet = a => a.length === SLOTS.length && new Set(a).size === SLOTS.length;
  if (t.user && !t.wish && okSet(t.lineup) && t.lineup.every(valid)) t.wish = t.lineup.slice();
  const ids = (t.user && t.wish && okSet(t.wish) ? t.wish : t.lineup).slice();
  if (ids.every(valid) && okSet(ids)) t.lineup = ids;
  else {
    const keep = SLOTS.map((_, i) => (valid(ids[i]) ? ids[i] : null));
    const used = new Set(keep.filter(Boolean));
    SLOTS.forEach((slot, i) => {
      if (keep[i] && ids.indexOf(keep[i]) === i) return;
      let best = null, bv = -1;
      for (const p of t.players) { if (away(p) || used.has(p.id)) continue; const v = slotRating(p, slot); if (v > bv) { bv = v; best = p; } }
      if (!best) best = t.players.find(p => !used.has(p.id));
      keep[i] = best.id; used.add(best.id);
    });
    t.lineup = keep;
  }
  return t.lineup.map(id => findP(t, id));
}
function teamStrength(t) {
  const ps = lineupPlayers(t);
  return SLOTS.reduce((s, slot, i) => s + slotRating(ps[i], slot) * formMult(ps[i]), 0) / SLOTS.length;
}
function engineTeam(t) {
  const lineup = lineupPlayers(t), on = new Set(lineup.map(p => p.id));
  return { name: t.name, short: t.short, kit: t.kit, alt: t.alt, tactic: t.tactic, lineup, bench: t.players.filter(p => !away(p) && !on.has(p.id)) };
}
const userTeam = () => C.teams.find(t => t.user);

// ===== Serie =====
function schedule(n) {
  const t = [...Array(n).keys()], rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs = [];
    for (let i = 0; i < n / 2; i++) { const a = t[i], b = t[n - 1 - i]; pairs.push(r % 2 ? [b, a] : [a, b]); }
    rounds.push(pairs);
    t.splice(1, 0, t.pop());
  }
  return rounds.concat(rounds.map(rs => rs.map(([a, b]) => [b, a])));
}
// ===== Seriepyramiden =====
// Din egen division ligger i C.teams/C.fixtures/C.results som tidigare.
// De tre andra ligger i C.league[d] och spelar samma omgång i bakgrunden.
function divGroup(d) { return d === C.div ? { teams: C.teams, fixtures: C.fixtures, results: C.results } : C.league[d]; }
function allTeams() { return DIVS.flatMap(d => divGroup(d).teams); }
function groupFrom(teams) {
  teams.sort(() => Math.random() - 0.5);
  const fixtures = schedule(teams.length);
  return { teams, fixtures, results: fixtures.map(() => null) };
}
function playGroupRound(g, r) { g.results[r] = g.fixtures[r].map(([h, a]) => playFixture(g.teams[h], g.teams[a])); }
// Bygger de divisioner som saknas (ny karriär, eller en sparad karriär från före pyramiden)
function buildLeague() {
  const used = new Set(allNamesSoFar());
  C.league = {};
  for (const d of DIVS) {
    if (d === C.div) continue;
    const teams = [];
    for (let i = 0; i < TEAMS_PER_DIV; i++) teams.push(genTeam(d, used));
    C.league[d] = groupFrom(teams);
    for (let r = 0; r < C.round; r++) playGroupRound(C.league[d], r);
  }
}
function giveMissingTraits() {
  let n = 0;
  for (const p of allTeams().flatMap(t => t.players).concat(C.market)) if (!p.tr) { p.tr = rollTraits(p.pos, ovr(p)); n++; }
  return n;
}
function upgradeTo7() {
  if (C.format === 7) return false;
  const want = { GK: 2, DEF: 4, MID: 4, FWD: 2 };
  for (const d of DIVS) for (const t of divGroup(d).teams) {
    if (t.user) {
      // Din trupp: unga spelare från akademin om det behövs, så att det finns minst 7 + 2 avbytare
      while (t.players.length < 9) {
        const pos = ['DEF', 'MID', 'MID', 'FWD'][t.players.length % 4], p = genPlayer(LEVEL[C.div] - 1.5, pos, R.int(17, 19));
        p.num = freeNumber(t, pos); t.players.push(p);
      }
    } else {
      for (const pos in want) while (t.players.filter(p => p.pos === pos).length < want[pos]) {
        const p = genPlayer(LEVEL[d] + rnd(-1.2, 1), pos); p.num = freeNumber(t, pos); t.players.push(p);
      }
    }
    t.lineup = []; autoLineup(t);
  }
  C.format = 7;
  return true;
}
function allNamesSoFar() { return C.teams.map(t => t.name); }
// Datorlagen åldras, utvecklas och fyller på truppen inför ny säsong
function developAiTeam(tm, d) {
  for (const p of tm.players.slice()) {
    p.age++; p.goals = 0; p.assists = 0; p.apps = 0; p.rsum = 0; p.inj = 0; p.away = 0;
    const g = p.age <= 21 ? 0.9 : p.age <= 25 ? 0.4 : p.age >= 31 ? -0.5 : 0;
    for (const k of SKILLS) {
      let v = p.sk[k] + g * rnd(0.4, 1.4);
      if (g > 0) v = Math.min(v, Math.max(p.sk[k], p.pot));
      p.sk[k] = r1(clamp(v, 1, 20));
    }
    if (p.age >= 34 || (p.age >= 32 && Math.random() < 0.35)) tm.players = tm.players.filter(x => x !== p);
  }
  const want = { GK: 2, DEF: 4, MID: 4, FWD: 2 };
  for (const pos in want) {
    while (tm.players.filter(p => p.pos === pos).length < want[pos]) {
      const p = genPlayer(LEVEL[d] + rnd(-1.2, 1), pos, null, rollNat(foreignShare(d))); p.num = freeNumber(tm, pos); tm.players.push(p);
    }
  }
  // En nyvärvning på divisionens nivå ersätter ibland den svagaste i samma position
  if (Math.random() < 0.6) {
    const pos = R.pick(['DEF', 'MID', 'FWD']), same = tm.players.filter(p => p.pos === pos).sort((a, b) => ovr(a) - ovr(b));
    const p = genPlayer(LEVEL[d] + rnd(-0.5, 1.5), pos, null, rollNat(foreignShare(d) + 0.1));
    if (same.length && ovr(same[0]) < ovr(p)) { tm.players = tm.players.filter(x => x !== same[0]); p.num = freeNumber(tm, pos); tm.players.push(p); }
  }
  tm.lineup = []; autoLineup(tm);
}

function table(g) {
  g = g || divGroup(C.div);
  const rows = g.teams.map((t, i) => ({ i, t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] }));
  g.results.forEach((round, r) => round && round.forEach((res, k) => {
    if (!res) return;
    const [h, a] = g.fixtures[r][k], H = rows[h], A = rows[a];
    H.p++; A.p++; H.gf += res[0]; H.ga += res[1]; A.gf += res[1]; A.ga += res[0];
    if (res[0] > res[1]) { H.w++; A.l++; H.pts += 3; H.form.push('V'); A.form.push('F'); }
    else if (res[0] < res[1]) { A.w++; H.l++; A.pts += 3; H.form.push('F'); A.form.push('V'); }
    else { H.d++; A.d++; H.pts++; A.pts++; H.form.push('O'); A.form.push('O'); }
  }));
  return rows.sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || x.t.name.localeCompare(y.t.name));
}
// ===== Landslag =====
// Två landslagsuppehåll per säsong. De bästa spelarna kallas till sina landslag och missar de två
// följande omgångarna. Landslagserfarenheten ger extra utveckling och höjer spelarens värde.
const NT_MISS = 2, NT_SQUAD = 14;
const ntWindows = () => (DIVS.length === 6 ? [8, 16] : [5, 10]);
function callUps() {
  const pool = allTeams().flatMap(t => t.players.map(p => ({ p, t }))).filter(x => !x.p.inj && x.p.age >= 18 && x.p.age <= 34);
  const se = pool.filter(x => (x.p.nat || 'SE') === 'SE').sort((a, b) => ovr(b.p) - ovr(a.p)).slice(0, NT_SQUAD);
  const cut = se.length ? ovr(se[se.length - 1].p) * 0.97 : 99;
  const squads = { SE: se };
  for (const n of FOREIGN) {
    const got = pool.filter(x => x.p.nat === n && ovr(x.p) >= cut).sort((a, b) => ovr(b.p) - ovr(a.p)).slice(0, 3);
    if (got.length) squads[n] = got;
  }
  const me = userTeam(), mine = [];
  for (const n in squads) for (const { p, t } of squads[n]) {
    p.away = NT_MISS; p.caps = (p.caps || 0) + 2;
    // Landslagserfarenhet: lite extra utveckling i två egenskaper (unga får mer)
    const gain = p.age <= 21 ? 0.35 : p.age <= 25 ? 0.25 : 0.12;
    for (const k of SKILLS.slice().sort((a, b) => p.sk[b] - p.sk[a]).slice(0, 2)) p.sk[k] = Math.round(clamp(p.sk[k] + gain, 1, 20) * 100) / 100;
    if (t === me) mine.push({ p, n });
  }
  // Sveriges landskamper i uppehållet
  const opps = FOREIGN.slice().sort(() => Math.random() - 0.5).slice(0, 2), games = [];
  for (const o of opps) {
    const gf = R.poisson(1.5), ga = R.poisson(1.2), sc = [];
    for (let i = 0; i < gf; i++) { const x = pickWeighted(se.map(y => y.p), q => ({ FWD: 3, MID: 1.5, DEF: 0.4, GK: 0 }[q.pos]) * (0.5 + q.sk.sho / 20)); if (x) { x.ntGoals = (x.ntGoals || 0) + 1; sc.push(x.name); } }
    games.push({ opp: o, gf, ga, sc });
  }
  C.nt = { season: C.season, round: C.round, squad: se.map(x => ({ id: x.p.id, name: x.p.name, team: x.t.name, pos: x.p.pos })), games, mine: mine.map(x => ({ id: x.p.id, name: x.p.name, nat: x.n })), seen: false };
  if (mine.length) {
    C.club.mood = clamp(C.club.mood + 2 * mine.length, 5, 100);
    news(`🌍 Landslagsuppehåll: ${mine.map(x => `${x.p.name} (${NATIONS[x.n].name})`).join(', ')} är uttagna och missar ${NT_MISS} omgångar.`, 'good');
  } else news(`🌍 Landslagsuppehåll: ${NT_SQUAD} svenska spelare uttagna. Ingen från er klubb den här gången.`);
  for (const g of games) news(`🇸🇪 Sverige–${NATIONS[g.opp].name} ${g.gf}–${g.ga}${g.sc.length ? ` (mål: ${g.sc.join(', ')})` : ''}.`, g.gf > g.ga ? 'good' : g.gf < g.ga ? 'bad' : 'info');
}
// Äldre karriärer: ge alla spelare en nationalitet. Några av datorlagens spelare blir utländska.
function migrateNations() {
  if (C.natMig) return false;
  C.natMig = true;
  const me = userTeam();
  for (const d of DIVS) for (const t of divGroup(d).teams) for (const p of t.players) {
    if (p.nat) continue;
    p.nat = 'SE';
    if (t !== me && Math.random() < foreignShare(d)) { p.nat = R.pick(FOREIGN); p.name = genName(p.nat); }
  }
  for (const p of C.market || []) if (!p.nat) { p.nat = Math.random() < 0.25 ? R.pick(FOREIGN) : 'SE'; if (p.nat !== 'SE') p.name = genName(p.nat); }
  for (const l of C.loans || []) l.p.nat = l.p.nat || 'SE';
  return true;
}

// ===== Kalender =====
// Säsongen börjar första lördagen i april. Ligan spelas på lördagar, Ligacupen på onsdagar.
function seasonStart() {
  const d = new Date(2025 + C.season, 3, 1);
  d.setDate(1 + ((6 - d.getDay() + 7) % 7));
  return d;
}
function leagueDate(r) { const d = seasonStart(); d.setDate(d.getDate() + 7 * r); return d; }
function cupDate(stage) { const d = leagueDate(cupRoundOf(stage) - 1); d.setDate(d.getDate() + 4); return d; }
const fmtDate = (d, long) => d.toLocaleDateString('sv-SE', long ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : { weekday: 'long', day: 'numeric', month: 'long' });
// Kommande händelser för din klubb: seriematcher och Ligacupens omgångar
function upcoming(n = 6) {
  const out = [], me = userTeam(), ord = cupPlan().order;
  for (let i = PRE_WEEKS - (C.pre || 0); C.pre && i < PRE_WEEKS; i++) { const o = teamById(C.preOpp[i]); if (o) out.push({ date: preDate(i), kind: 'pre', text: `${i % 2 === 0 ? 'Hemma mot' : 'Borta mot'} ${o.name}`, sub: `Försäsong · träningsmatch ${i + 1} av ${PRE_WEEKS}`, team: o.id }); }
  const _ord = ord, c = C.cup && C.cup.season === C.season && C.cup.v === 2 ? C.cup : null;
  for (let r = C.round; r < C.fixtures.length && out.length < n * 2; r++) {
    const f = userFixture(r);
    out.push({ date: leagueDate(r), kind: 'league', text: `${f.home ? 'Hemma mot' : 'Borta mot'} ${f.opp.name}`, sub: `Omgång ${r + 1}`, team: f.opp.id });
  }
  for (const st of ord) {
    const at = cupRoundOf(st), when = cupDate(st);
    if (at < C.round) continue;
    if (at === C.round && c && c.stage === st) {
      const t = c.ties[st].find(x => x.h === me.id || x.a === me.id);
      if (!t) continue;
      if (t.m) continue;
      const o = teamById(t.h === me.id ? t.a : t.h);
      out.push({ date: when, kind: 'cup', text: `${t.h === me.id ? 'Hemma mot' : 'Borta mot'} ${o.name}`, sub: `${CUP_NAME} · ${CUP_STAGE_NAME[st]}`, team: o.id });
      continue;
    }
    const sub = `${CUP_NAME} · ${CUP_STAGE_NAME[st]}`;
    if (c && (!c.invited || c.out)) out.push({ date: when, kind: 'cup-other', text: c.out ? 'Ni är utslagna' : 'Ni är inte med', sub });
    else if (c) out.push({ date: when, kind: 'cup', text: 'Motståndare lottas', sub });
    else out.push({ date: when, kind: 'cup-other', text: st === ord[0] ? `De två bästa i varje division efter omgång ${at} kvalar in` : 'Lottas senare', sub });
  }
  for (const w of ntWindows()) if (w >= C.round) { const d = leagueDate(w - 1); d.setDate(d.getDate() + 3); out.push({ date: d, kind: 'nt', text: 'Landslagsuppehåll', sub: `Uttagna spelare missar omgång ${w + 1}–${w + NT_MISS}` }); }
  return out.sort((a, b) => a.date - b.date).slice(0, n);
}
function userFixture(round = C.round) {
  const ui = C.teams.findIndex(t => t.user);
  const k = C.fixtures[round].findIndex(f => f.includes(ui));
  const [h, a] = C.fixtures[round][k];
  return { k, h, a, home: h === ui, opp: C.teams[h === ui ? a : h] };
}
// Matcher som räknas fram i bakgrunden får målskyttar och assister, så att skytteligan omfattar alla lag
const SCORE_W = { GK: 0.02, DL: 0.5, DR: 0.5, LM: 1.5, MF: 1.8, RM: 1.5, FW: 5 }, ASSIST_W = { GK: 0.3, DL: 1, DR: 1, LM: 2.6, MF: 3, RM: 2.6, FW: 2 };
function pickWeighted(list, w) {
  let r = Math.random() * list.reduce((a, x) => a + w(x), 0);
  for (const x of list) { r -= w(x); if (r <= 0) return x; }
  return list[list.length - 1];
}
function creditGoals(team, n) {
  const lu = lineupPlayers(team), slotOf = p => SLOTS[lu.indexOf(p)];
  for (const p of lu) p.apps++;
  for (let i = 0; i < n; i++) {
    const sc = pickWeighted(lu, p => SCORE_W[slotOf(p)] * (0.5 + p.sk.sho / 20) * (has(p, 'pow') || has(p, 'hdr') ? 1.25 : 1));
    sc.goals++;
    if (Math.random() < 0.7) { const as = pickWeighted(lu.filter(p => p !== sc), p => ASSIST_W[slotOf(p)] * (0.5 + p.sk.pas / 20) * (has(p, 'crs') ? 1.4 : 1)); as.assists = (as.assists || 0) + 1; }
  }
}
function playFixture(home, away) { const r = quickResult(home, away); creditGoals(home, r[0]); creditGoals(away, r[1]); return r; }
// Skytte- och poängliga för en grupp lag
function leaders(teams) {
  return teams.flatMap(t => t.players.map(p => ({ p, t, g: p.goals || 0, a: p.assists || 0 })));
}

function quickResult(home, away) {
  const r = (teamStrength(home) * 1.06) / teamStrength(away);
  return [R.poisson(1.4 * Math.pow(r, 1.8)), R.poisson(1.4 * Math.pow(1 / r, 1.8))];
}

// ===== Ligacupen =====
// De två bästa lagen i varje division (8 lag) möts i en utslagscup under säsongen:
// kvartsfinal efter omgång 4, semifinal efter omgång 8 och final efter omgång 12. Oavgjort avgörs på straffar.
// Lag från lägre divisioner får "cupmagi": större chans att vinna, högst +25 procentenheter (3 divisioner emellan).
const CUP_NAME = 'Ligacupen';
// 6 divisioner: lagen från division 3–6 spelar en första omgång, vinnarna möter division 1–2 i kvartsfinal.
const cupPlan = () => (DIVS.length === 6
  ? { at: { 5: 'r1', 10: 'qf', 15: 'sf', 20: 'final' }, order: ['r1', 'qf', 'sf', 'final'] }
  : { at: { 4: 'qf', 8: 'sf', 12: 'final' }, order: ['qf', 'sf', 'final'] });
const cupRoundOf = st => +Object.keys(cupPlan().at).find(k => cupPlan().at[k] === st);
const CUP_STAGE_NAME = { r1: 'Första omgången', qf: 'Kvartsfinal', sf: 'Semifinal', final: 'Final' };
// Extra vinstchans (procentenheter) för underdogen: växer med divisionsskillnaden, högst +25 vid största möjliga skillnad
const cupBoost = gap => 0.25 * gap / Math.max(1, DIVS.length - 1);
const CUP_PRIZE = { join: 25000, r1: 30000, qf: 50000, sf: 100000, final: 250000 }; // för att kvala in och för varje vunnen match
const teamById = id => allTeams().find(t => t.id === id);
const divOfTeam = t => DIVS.find(d => divGroup(d).teams.includes(t));
// Sannolikheten att lag med styrka a vinner hemma mot styrka b (oavgjort räknas som 50 % på straffar)
function cupWinProb(a, b) {
  const r = a * 1.06 / b, la = 1.4 * Math.pow(r, 1.8), lb = 1.4 * Math.pow(1 / r, 1.8);
  const pois = (l, k) => { let v = Math.exp(-l); for (let i = 1; i <= k; i++) v *= l / i; return v; };
  let w = 0;
  for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) { const q = pois(la, x) * pois(lb, y); if (x > y) w += q; else if (x === y) w += q / 2; }
  return w;
}
// Hur mycket underdogen behöver förstärkas för att få sin cupmagi
function cupMult(h, a) {
  const c = C.cup, dh = c.div[h.id], da = c.div[a.id], gap = Math.abs(dh - da);
  if (!gap) return { h: 1, a: 1, gap: 0, boost: 0 };
  const lowIsHome = dh > da, lo = lowIsHome ? h : a, hi = lowIsHome ? a : h;
  const sl = teamStrength(lo), sh = teamStrength(hi);
  const p0 = lowIsHome ? cupWinProb(sl, sh) : 1 - cupWinProb(sh, sl);
  const target = Math.min(0.95, p0 + cupBoost(gap));
  const pf = m => (lowIsHome ? cupWinProb(sl * m, sh) : 1 - cupWinProb(sh, sl * m));
  let x = 1, y = 4;
  for (let k = 0; k < 30; k++) { const m = (x + y) / 2; if (pf(m) < target) x = m; else y = m; }
  const m = (x + y) / 2;
  return { h: lowIsHome ? m : 1, a: lowIsHome ? 1 : m, gap, boost: cupBoost(gap), lo, p0, p1: target };
}
function shootout(a, b) {
  const gk = t => { const g = lineupPlayers(t)[0]; return g ? g.sk.gk : 8; };
  const shot = (t, keeper) => Math.random() < clamp(0.78 + (teamStrength(t) - 10) * 0.01 - (keeper - 10) * 0.012, 0.55, 0.92);
  let x = 0, y = 0;
  for (let i = 0; i < 5; i++) { if (shot(a, gk(b))) x++; if (shot(b, gk(a))) y++; if (x > y + (4 - i) || y > x + (4 - i)) break; }
  while (x === y) { const p = shot(a, gk(b)), q = shot(b, gk(a)); x += p; y += q; }
  return [x, y];
}
function cupResult(h, a, hg, ag) {
  const m = { h: h.id, a: a.id, hg, ag };
  if (hg === ag) { const [x, y] = shootout(h, a); m.ph = x; m.pa = y; }
  m.w = hg > ag || (hg === ag && m.ph > m.pa) ? h.id : a.id;
  return m;
}
const cupScore = m => `${m.hg}–${m.ag}${m.ph != null ? ` (${m.ph}–${m.pa} str)` : ''}`;
function cupSim(h, a) {
  const mu = cupMult(h, a), r = teamStrength(h) * mu.h * 1.06 / (teamStrength(a) * mu.a);
  return cupResult(h, a, R.poisson(1.4 * Math.pow(r, 1.8)), R.poisson(1.4 * Math.pow(1 / r, 1.8)));
}
// Matchlag för motorn med cupmagi: spelarnas egenskaper förstärks under matchen (bara i cupen)
function cupEngineTeam(t, m) {
  const e = engineTeam(t);
  // Din klubb: matchanalytikern (+2 % per nivå) och fystränaren (mer ork) påverkar själva matchen
  const sta = t.user ? staffLvl('fitness') * 1.2 : 0;
  if (t.user) m *= 1 + staffLvl('analyst') * 0.02;
  if (m === 1 && !sta) return e;
  const boost = p => ({ ...p, sk: Object.fromEntries(Object.entries(p.sk).map(([k, v]) => [k, v * m + (k === 'sta' ? sta : 0)])) });
  return { ...e, lineup: e.lineup.map(boost), bench: e.bench.map(boost) };
}
const matchTeam = t => cupEngineTeam(t, 1);
// Lottning: helst inte två lag från samma division i kvartsfinalen. Laget från lägre division spelar hemma.
function cupDraw(teams, avoidSame) {
  let best = null;
  for (let k = 0; k < 60; k++) {
    const t = teams.slice().sort(() => Math.random() - 0.5), pairs = [];
    for (let i = 0; i < t.length; i += 2) pairs.push([t[i], t[i + 1]]);
    best = pairs;
    if (!avoidSame || pairs.every(([x, y]) => C.cup.div[x.id] !== C.cup.div[y.id])) break;
  }
  return best.map(([x, y]) => (C.cup.div[y.id] > C.cup.div[x.id] ? [y, x] : [x, y]));
}
function cupPay(amount, why) { C.club.cash += amount; addLedger('cup', amount); return amount; }
function startCup() {
  const teams = [], div = {};
  for (const d of DIVS) for (const r of table(divGroup(d)).slice(0, 2)) { teams.push(r.t); div[r.t.id] = d; }
  const me = userTeam();
  const order = cupPlan().order, first = order[0];
  const seeded = first === 'r1' ? teams.filter(t => div[t.id] <= 2) : [];
  C.cup = { v: 2, season: C.season, div, teams: teams.map(t => t.id), seeded: seeded.map(t => t.id), order, stage: first, ties: { r1: [], qf: [], sf: [], final: [] }, done: false, invited: teams.includes(me), out: false };
  if (C.cup.invited) { cupPay(CUP_PRIZE.join); news(`🏆 Ni är kvalificerade för ${CUP_NAME}! De två bästa lagen i varje division möts. ${money(CUP_PRIZE.join)} redan nu.`, 'good'); }
  else news(`🏆 ${CUP_NAME} startar: de två bästa lagen i varje division möts. Lag från lägre divisioner får cupmagi.`);
  cupStage(first, teams.filter(t => !seeded.includes(t)));
}
function cupStage(stage, teams) {
  const c = C.cup, me = userTeam();
  c.stage = stage;
  c.ties[stage] = cupDraw(teams, stage === 'qf' || stage === 'r1').map(([h, a]) => ({ h: h.id, a: a.id, m: null }));
  for (const t of c.ties[stage]) if (t.h !== me.id && t.a !== me.id) t.m = cupSim(teamById(t.h), teamById(t.a));
  const mine = c.ties[stage].find(t => t.h === me.id || t.a === me.id);
  if (mine) { const o = teamById(mine.h === me.id ? mine.a : mine.h); news(`🏆 ${CUP_NAME}, ${CUP_STAGE_NAME[stage].toLowerCase()}: ni möter ${o.name} (division ${c.div[o.id]}) före nästa seriematch.`, 'good'); }
  cupCheck();
}
// När alla matcher i en omgång är spelade: avsluta finalen
function cupCheck() {
  const c = C.cup; if (!c || c.done) return;
  if (c.stage === 'final' && c.ties.final.length && c.ties.final.every(t => t.m)) cupFinish();
}
function cupNextStage(stage) {
  const c = C.cup; if (!c || c.done || c.season !== C.season) return;
  const order = c.order || ['qf', 'sf', 'final'], prev = order[order.indexOf(stage) - 1];
  if (!prev || !c.ties[prev].length || !c.ties[prev].every(t => t.m)) return;
  const winners = c.ties[prev].map(t => teamById(t.m.w));
  cupStage(stage, stage === 'qf' && c.seeded && c.seeded.length ? winners.concat(c.seeded.map(teamById)) : winners);
}
function cupFinish() {
  const c = C.cup, me = userTeam(), m = c.ties.final[0].m, w = teamById(m.w), l = teamById(m.w === m.h ? m.a : m.h);
  c.done = true; c.winner = w.name;
  if (w === me) {
    C.club.fans = Math.round(C.club.fans * 1.12); C.club.mood = clamp(C.club.mood + 15, 5, 100);
    C.trophies = C.trophies || []; C.trophies.push({ s: C.season, kind: 'cup', name: CUP_NAME });
    news(`🏆 NI VANN ${CUP_NAME.toUpperCase()}! ${cupScore(m)} mot ${l.name} i finalen.`, 'good');
  } else news(`🏆 ${w.name} (division ${c.div[w.id]}) vann ${CUP_NAME} efter ${cupScore(m)} mot ${l.name} (division ${c.div[l.id]}).`);
  C.cupHistory = C.cupHistory || [];
  C.cupHistory.unshift({ s: C.season, winner: w.name, wdiv: c.div[w.id], runner: l.name, score: cupScore(m), mine: w === me });
}
// Användarens nästa cupmatch, om någon väntar
function cupPending() {
  const c = C.cup; if (!c || c.v !== 2 || c.done || c.season !== C.season || !c.invited) return null;
  const me = userTeam(), t = c.ties[c.stage].find(x => !x.m && (x.h === me.id || x.a === me.id));
  return t ? { stage: c.stage, tie: t, home: teamById(t.h), away: teamById(t.a) } : null;
}
function cupPlayed(res) {
  const pend = cupPending(); if (!pend) return null;
  const me = userTeam(), m = cupResult(pend.home, pend.away, res.hg, res.ag), won = m.w === me.id;
  pend.tie.m = m;
  for (const e of res.players[pend.home === me ? 'home' : 'away']) { const p = findP(me, e.id); if (p) p.last = e.rating; }
  const prize = won ? cupPay(CUP_PRIZE[pend.stage]) : 0;
  if (!won) { C.cup.out = true; news(`Utslagna ur ${CUP_NAME} (${CUP_STAGE_NAME[pend.stage].toLowerCase()}): ${cupScore(m)}.`, 'bad'); }
  else if (pend.stage !== 'final') news(`🏆 Vidare i ${CUP_NAME} efter ${cupScore(m)}! +${money(prize)}.`, 'good');
  cupCheck();
  return { m, stage: pend.stage, won, prize };
}

// ===== Ny karriär =====
function newCareer(clubName, kitIdx) {
  setFormat(6); NAMES = null;
  C = {
    v: 1, format: 7, v6: true, trophyMig: true, bal27: true, natMig: true, nameFix: 1, savedAt: 0, season: 1, round: 0, div: 6, nextId: 1, week: 1,
    club: {
      cash: 150000, fans: 900, mood: 60, ticket: 'normal', training: { focus: 'all', intensity: 'normal' },
      stadium: { standing: 1200, seated: 300, covered: 0, vip: 0, lights: 1 }, fac: { training: 1, youth: 1 }, builds: [], staff: {},
    },
    teams: [], fixtures: [], results: [], market: [], offers: [], news: [], ledger: null, lastMatch: null, history: [], trainLog: [], loans: [],
  };
  const used = new Set([clubName]);
  const kit = { ...KITS[kitIdx] };
  const me = { id: C.nextId++, user: true, name: clubName, short: clubName.replace(/[^A-Za-zÅÄÖåäö]/g, '').slice(0, 3).toUpperCase() || 'DIN', kit, alt: altKit(kit), tactic: 'bal', players: [], lineup: [], stadium: C.club.stadium };
  for (const pos of SQUAD_POS) {
    const p = genPlayer(LEVEL[6] - 0.9, pos); p.num = freeNumber(me, pos); me.players.push(p);
  }
  const talent = genPlayer(LEVEL[6] - 1.5, 'MID', 17); talent.pot = 15; talent.num = freeNumber(me, 'MID'); me.players.push(talent);
  autoLineup(me);
  C.teams.push(me);
  for (let i = 0; i < TEAMS_PER_DIV - 1; i++) C.teams.push(genTeam(C.div, used));
  shuffleTeams();
  buildLeague();
  refreshMarket(true);
  news(`Välkommen till ${clubName}! Styrelsen vill se en stabil första säsong i division 6, den lägsta av sex.`);
  news(`Talangen ${talent.name} (17) har potential att bli något stort. Träna honom väl.`);
  return C;
}
function shuffleTeams() {
  C.teams.sort(() => Math.random() - 0.5);
  C.fixtures = schedule(C.teams.length);
  C.results = C.fixtures.map(() => null);
}
function news(text, kind = 'info') { C.news.unshift({ s: C.season, w: C.round + 1, text, kind }); C.news.length = Math.min(C.news.length, 40); }

// ===== Transfermarknad =====
function refreshMarket(full) {
  if (full) C.market = [];
  // Färre nya spelare per vecka (en fjärdedel byts) så att marknaden inte blir ett smörgåsbord
  C.market = C.market.filter(() => Math.random() < 0.75);
  while (C.market.length < 10) {
    const pos = R.pick(['GK', 'DEF', 'DEF', 'MID', 'MID', 'FWD', 'FWD']);
    const sc = staffLvl('scout');
    const lvl = LEVEL[C.div] + rnd(-2.5, 2.2) + sc * 0.4;
    const p = genPlayer(lvl, pos, null, rollNat(0.25));
    p.price = Math.round(playerValue(p) * rnd(1.0, 1.4) * (1 - sc * 0.04) / 500) * 500;
    C.market.push(p);
  }
}
function buyPlayer(id) {
  const t = userTeam(), i = C.market.findIndex(p => p.id === id), p = C.market[i];
  if (!p) return 'Spelaren finns inte kvar på marknaden.';
  if (t.players.length + (C.loans || []).length >= SQUAD_MAX) return `Truppen är full (${SQUAD_MAX} spelare inklusive utlånade). Sälj någon först.`;
  if (C.club.cash < p.price) return `Du har inte råd. Det saknas ${money(p.price - C.club.cash)}.`;
  C.club.cash -= p.price; C.market.splice(i, 1);
  const price = p.price; delete p.price;
  p.num = freeNumber(t, p.pos); p.goals = 0; p.apps = 0; p.rsum = 0;
  t.players.push(p);
  addLedger('transfers', -price);
  news(`${p.name} (${p.age}) är klar för klubben för ${money(price)}.`, 'good');
  return null;
}
function sellNow(id) {
  const t = userTeam(), p = findP(t, id);
  if (t.players.length <= 7) return 'Du måste ha minst 7 spelare i truppen.';
  const amount = Math.round(playerValue(p) * 0.6 / 500) * 500;
  removePlayer(t, p); C.club.cash += amount; addLedger('transfers', amount);
  news(`${p.name} såldes direkt för ${money(amount)}.`);
  return null;
}
// Bud på spelare som ligger ute till försäljning. Sportchefen höjer buden och kan sälja automatiskt.
function makeOffers(t) {
  C.offers = [];
  const dl = staffLvl('director');
  for (const p of t.players.filter(x => x.listed)) {
    const n = R.poisson(1.1);
    for (let i = 0; i < n; i++) {
      const amount = Math.round(playerValue(p) * rnd(0.72, 1.25) * (1 + dl * 0.05) / 500) * 500;
      C.offers.push({ pid: p.id, club: `${R.pick(PLACES)} ${R.pick(SUFFIX)}`, amount });
    }
  }
  if (autoOn('director')) {
    const best = {};
    for (const o of C.offers) if (!best[o.pid] || o.amount > best[o.pid].amount) best[o.pid] = o;
    for (const pid in best) {
      const o = best[pid], p = findP(t, +pid);
      if (p && o.amount >= playerValue(p) && t.players.length > 11) { const err = acceptOffer(C.offers.indexOf(o)); if (!err) news(`🧑‍💼 Sportchefen sålde ${p.name} till ${o.club} för ${money(o.amount)}.`, 'good'); }
    }
  }
  if (C.offers.length) news(`Du har fått ${C.offers.length} bud på dina spelare. Se Transfer.`, 'good');
}
// ===== Ekonomisk prognos =====
// Ett vanligt veckonetto: intäkter (biljetter ungefär varannan vecka) minus löner, personal och drift.
function finance() {
  const wb = weeklyBudget(), t = userTeam(), est = attendance(t, C.teams.find(x => !x.user) || t);
  const tickets = Math.round((est.income || 0) / 2);
  const income = wb.sponsors + wb.tv + wb.merch + tickets, costs = -(wb.wages + (wb.staff || 0) + wb.upkeep);
  const net = income - costs;
  const left = Math.max(0, C.fixtures.length - C.round) + (C.pre || 0);
  const buffer = costs * 8; // åtta veckors kostnader som säkerhetsmarginal
  const runway = net < 0 ? Math.floor(C.club.cash / -net) : Infinity;
  const endCash = C.club.cash + net * left;
  const free = Math.max(0, Math.min(C.club.cash, endCash) - buffer);
  return { income, costs, net, tickets, left, buffer, runway, endCash, free, wageShare: income ? -wb.wages / income : 1 };
}
// Ungefärlig återbetalningstid (säsonger) för ett bygge, eller null om det inte ger pengar direkt
function buildPayback(key) {
  const cl = C.club, s = cl.stadium, pl = PRICE_LEVEL[cl.ticket], homeGames = C.fixtures.length / 2;
  const demand = (cl.fans * (0.45 + cl.mood / 110) + 300 * DIV_MULT[C.div]) * pl.demand * (1 + staffLvl('marketing') * 0.05) * (s.screen ? 1.05 : 1);
  const unmet = Math.max(0, demand - capacity(s));
  let perSeason = 0;
  if (key === 'standing') perSeason = Math.min(unmet, seats(250)) * TICKET.standing * pl.mult * homeGames;
  else if (key === 'seated' || key === 'tier') perSeason = Math.min(unmet, key === 'tier' ? seats(1000) : seats(250)) * TICKET.seated * pl.mult * homeGames;
  else if (key === 'covered') perSeason = Math.min(s.seated, seats(250)) * (TICKET.covered - TICKET.seated) * pl.mult * homeGames * Math.min(1, demand / capacity(s));
  else if (key === 'vip') perSeason = Math.round(20 * buildScale()) * TICKET.vip * pl.mult * homeGames * 0.8;
  else if (key === 'lights') perSeason = weeklyBudget().sponsors * 0.05 / (1 + s.lights * 0.05) * C.fixtures.length;
  else if (key === 'screen') perSeason = Math.min(unmet + capacity(s) * 0.05, capacity(s) * 0.05) * TICKET.seated * pl.mult * homeGames;
  else return null;
  return perSeason > 0 ? buildCost(key) / perSeason : Infinity;
}
// Sportchefens fyndmarkering: priset är lågt jämfört med vad spelaren är värd för din klubb (nivå och potential)
function isBargain(p) {
  const dl = staffLvl('director'); if (!dl || p.price == null) return false;
  const worth = playerValue(p) * (1 + 0.04 * dl) * (p.age <= 21 && p.pot - ovr(p) > 2.5 ? 1.15 : 1);
  return p.price <= worth * 0.97 && ovr(p) >= LEVEL[C.div] - 1;
}
// Akademichefen lånar ut juniorer som inte får speltid, till den högsta division där de får spela ordentligt
function autoLoans() {
  if (!autoOn('youthHead')) return;
  const t = userTeam(), lu = new Set(lineupPlayers(t).map(p => p.id));
  const cands = t.players.filter(p => p.age <= LOAN_AGE && !lu.has(p.id) && !p.listed).sort((a, b) => (b.pot - ovr(b)) - (a.pot - ovr(a)));
  for (const p of cands) {
    if (loanCheck(p)) break;
    let best = null;
    for (let d = C.div + 1; d <= lowestDiv(); d++) if (loanMinutes(p, d) >= 55) { best = d; break; }
    if (!best) best = lowestDiv() > C.div ? lowestDiv() : null;
    if (best && !loanOut(p.id, best)) news(`🎓 Akademichefen lånade ut ${p.name} till division ${best} för speltid.`, 'good');
  }
}
function acceptOffer(oi) {
  const o = C.offers[oi], t = userTeam(), p = findP(t, o.pid);
  if (!p) { C.offers.splice(oi, 1); return 'Spelaren finns inte kvar.'; }
  if (t.players.length <= 7) return 'Du måste ha minst 7 spelare i truppen.';
  removePlayer(t, p); C.club.cash += o.amount; addLedger('transfers', o.amount);
  C.offers = C.offers.filter(x => x.pid !== o.pid);
  news(`${p.name} säljs till ${o.club} för ${money(o.amount)}.`, 'good');
  return null;
}
function removePlayer(t, p) { t.players = t.players.filter(x => x !== p); t.lineup = t.lineup.map(id => (id === p.id ? null : id)); lineupPlayers(t); }

// ===== Ekonomi =====
function capacity(s) { return s.standing + s.seated + s.covered + s.vip; }
function attendance(team, opp) {
  const s = team.stadium;
  if (!team.user) { const cap = capacity(s); const n = Math.round(cap * rnd(0.5, 0.95)); return { total: n, cap, sec: null }; }
  const cl = C.club, pl = PRICE_LEVEL[cl.ticket];
  const oppBoost = 1 + Math.max(0, 4 - table().findIndex(r => r.t === opp)) * 0.05;
  let demand = (cl.fans * (0.45 + cl.mood / 110) + 300 * DIV_MULT[C.div]) * pl.demand * oppBoost * rnd(0.9, 1.1) * (1 + staffLvl('marketing') * 0.05) * (s.screen ? 1.05 : 1);
  const share = { vip: 0.03, covered: 0.22, seated: 0.3, standing: 0.45 };
  const sec = {}; let spill = 0, total = 0, income = 0;
  for (const k of ['vip', 'covered', 'seated', 'standing']) {
    const want = demand * share[k] + spill, got = Math.min(s[k], Math.round(want));
    spill = k === 'vip' ? 0 : want - got; sec[k] = got; total += got; income += got * TICKET[k] * pl.mult;
  }
  return { total, cap: capacity(s), sec, income: Math.round(income) };
}
function arenaCfg(team, att) {
  const s = team.stadium, cap = capacity(s);
  const boards = [[team.name.toUpperCase(), team.kit.shirt, team.kit.num], ...DEFAULT_BOARDS];
  return {
    seed: team.id * 97 + 3, mainRows: 2 + Math.sqrt(s.seated + s.covered + s.vip) / 7, endRows: Math.sqrt(s.standing) / 7,
    roof: s.covered > 0, vip: Math.round(s.vip / 20), lights: s.lights, fill: cap ? att.total / cap : 0, boards,
    tier: s.tier || 0, screen: !!s.screen, color: team.kit.shirt,
  };
}
function weeklyBudget() {
  const cl = C.club, s = cl.stadium, t = userTeam();
  return {
    sponsors: Math.round(4500 * DIV_MULT[C.div] * (0.7 + cl.mood / 170) * (1 + s.lights * 0.05) * (1 + staffLvl('admin') * 0.05) * (1 + staffLvl('marketing') * 0.08)),
    tv: TV_MONEY[C.div],
    merch: Math.round((cl.fans * 1.2 * (0.6 + cl.mood / 125)) * (1 + staffLvl('marketing') * 0.1)),
    wages: -t.players.reduce((a, p) => a + playerWage(p), 0) - Math.round((C.loans || []).reduce((a, l) => a + playerWage(l.p), 0) / 2),
    staff: -Object.entries(cl.staff || {}).reduce((a, [k, x]) => a + staffWage(k, x.lvl), 0),
    upkeep: -Math.round((s.standing * 0.6 + s.seated * 1.2 + s.covered * 2 + s.vip * 25 + s.lights * 1500 + cl.fac.training * 1200 + cl.fac.youth * 900) * (1 - staffLvl('finance') * 0.05)),
  };
}
function addLedger(k, v) {
  if (!C.ledger) C.ledger = {};
  C.ledger[k] = (C.ledger[k] || 0) + v;
}
function startBuild(key) {
  const b = BUILDS[key], cl = C.club;
  if (buildLocked(key)) return `${b.name} kan byggas först i division ${buildDiv(key)}.`;
  if (b.ok && !b.ok(cl.stadium, cl.fac)) return 'Den här utbyggnaden är inte möjlig just nu.';
  if (cl.builds.some(x => x.key === key)) return 'Det bygget pågår redan.';
  const cost = buildCost(key), weeks = buildWeeks(key);
  if (cl.cash < cost) return `Du har inte råd. Det saknas ${money(cost - cl.cash)}.`;
  cl.cash -= cost; addLedger('build', -cost);
  cl.builds.push({ key, left: weeks });
  news(`Bygget av ${b.name.toLowerCase()} har startat. Klart om ${weeks} veckor.`);
  return null;
}

// En veckas utveckling för en spelare. Speltid (minuter) ger extra utveckling.
function developPlayer(p, min, facF, intF, focus, report, r) {
  const matchF = 0.8 + MATCH_DEV * min / 90;
  const ageF = p.age <= 20 ? 1.4 : p.age <= 24 ? 1.1 : p.age <= 28 ? 0.75 : p.age <= 31 ? 0.35 : 0;
  const before = Math.floor(ovr(p));
  for (const k of SKILLS) {
    const f = focus === 'all' ? 0.35 : k === focus ? 1 : 0.1;
    const room = clamp((p.pot + 1 - p.sk[k]) / 3, 0, 1);
    let g = 0.2 * f * ageF * facF * intF * matchF * room * rnd(0.6, 1.4) * seasonScale();
    if (p.age >= 31 && (k === 'spd' || k === 'sta')) g -= 0.04 * rnd(0.5, 1.5) * seasonScale();
    const old = p.sk[k];
    p.sk[k] = Math.round(clamp(p.sk[k] + g, 1, 20) * 100) / 100;
    if (report && disp(p.sk[k]) > disp(old)) report.trained.push(`${p.name}: ${SKILL_NAME[k]} ${disp(p.sk[k])}`);
  }
  if (Math.floor(ovr(p)) > before) p.rise = C.season * 100 + r;
}

// ===== Utlåning =====
// Unga spelare (högst 21 år) kan lånas ut till en klubb i en lägre division resten av säsongen. Högst två åt gången.
const LOAN_MAX = 4, LOAN_AGE = 21, SQUAD_MAX = 20;
// Låneklubbens träning beror på divisionen: högre division = bättre träning (men ofta mindre speltid)
const loanTraining = d => 0.7 + (lowestDiv() + 1 - d) * (0.6 / Math.max(1, lowestDiv() - 1));
// Ungefärlig speltid per match i en division, utifrån hur bra spelaren är jämfört med divisionens nivå
const loanMinutes = (p, d) => Math.round(clamp(62 + (ovr(p) - LEVEL[d]) * 14, 10, 88));
function loanCheck(p) {
  if (p.age > LOAN_AGE) return `Bara spelare som är högst ${LOAN_AGE} år kan lånas ut.`;
  if (C.div >= lowestDiv()) return 'Det finns ingen lägre division att låna ut till.';
  if ((C.loans || []).length >= LOAN_MAX) return `Du kan ha högst ${LOAN_MAX} spelare utlånade samtidigt.`;
  if (userTeam().players.length <= 10) return 'Du behöver ha kvar minst 10 spelare i truppen.';
  if (C.round >= C.fixtures.length) return 'Säsongen är slut. Vänta till nästa säsong.';
  return null;
}
function loanOut(id, d) {
  const t = userTeam(), p = findP(t, id);
  if (!p) return 'Spelaren finns inte.';
  const err = loanCheck(p); if (err) return err;
  if (d <= C.div || d > lowestDiv()) return 'Välj en lägre division.';
  const club = R.pick(divGroup(d).teams);
  removePlayer(t, p);
  p.listed = false; C.offers = C.offers.filter(o => o.pid !== p.id);
  C.loans = C.loans || [];
  C.loans.push({ p, club: club.name, div: d, apps: 0, min: 0, goals: 0, rsum: 0, start: r1(ovr(p)), since: C.round });
  news(`${p.name} lånas ut till ${club.name} (division ${d}) resten av säsongen för att få speltid.`, 'good');
  return null;
}
function recallLoan(id, auto) {
  const i = (C.loans || []).findIndex(l => l.p.id === id); if (i < 0) return 'Spelaren är inte utlånad.';
  const l = C.loans[i], t = userTeam(), p = l.p;
  C.loans.splice(i, 1);
  if (t.players.some(q => q.num === p.num)) p.num = freeNumber(t, p.pos);
  t.players.push(p);
  news(`${p.name} är tillbaka från lånet i ${l.club}: ${l.apps} matcher, ${l.goals} mål${l.apps ? `, snittbetyg ${(l.rsum / l.apps).toFixed(1)}` : ''}. Betyg ${l.start.toFixed(1)} → ${ovr(p).toFixed(1)}.`, 'good');
  return null;
}
// Varje omgång: de utlånade spelar (eller sitter på bänken) och tränar hos sin låneklubb
function playLoans(report, r) {
  for (const l of C.loans || []) {
    const p = l.p;
    if (p.inj) { p.inj--; continue; }
    let min = 0;
    if (Math.random() > 0.1) min = Math.round(clamp(loanMinutes(p, l.div) + rnd(-20, 20), 0, 90));
    if (min >= 5) {
      const lvlDiff = ovr(p) - LEVEL[l.div];
      const shot = { FWD: 0.45, MID: 0.18, DEF: 0.05, GK: 0 }[p.pos] * (1 + lvlDiff * 0.12) * min / 90;
      const goals = R.poisson(Math.max(0, shot));
      const rating = r1(clamp(6.2 + lvlDiff * 0.15 + goals * 0.9 + rnd(-0.6, 0.6), 3, 10));
      l.apps++; l.min += min; l.goals += goals; l.rsum += rating; p.last = rating;
      if (Math.random() < 0.02) { p.inj = R.int(1, 3); news(`${p.name} skadade sig i ${l.club} (${p.inj} v).`, 'bad'); }
    }
    // Låneklubbens träning: enklare anläggning, allround
    developPlayer(p, min, loanTraining(l.div), 1, 'all', report, r);
  }
}

// ===== Veckan efter matchen =====
// Speltid ger utveckling: hel match ×1,3, ingen speltid ×0,8 (ca 60 % skillnad). Snittet för truppen blir ungefär som förut.
const MATCH_DEV = 0.5;
function rateMatch(p, st, won, lost, conceded) {
  let r = 6 + st.goals * 1.0 + st.assists * 0.6 + st.onT * 0.15 + Math.min(1, st.tackles * 0.04) + st.saves * 0.25 + Math.min(0.8, st.passOk * 0.015) + (won ? 0.3 : lost ? -0.3 : 0) + rnd(-0.35, 0.35);
  if (p.role === 'GK') r -= conceded * 0.35; else if (p.role === 'DL' || p.role === 'DR') r -= conceded * 0.12;
  return r1(clamp(r, 3, 10));
}

function playRound(userRes) {
  const r = C.round, ui = C.teams.findIndex(t => t.user), uf = userFixture();
  C.results[r] = C.fixtures[r].map(([h, a], k) => (k === uf.k ? [userRes.hg, userRes.ag] : playFixture(C.teams[h], C.teams[a])));
  for (const d of DIVS) if (d !== C.div) playGroupRound(C.league[d], r);
  const t = userTeam(), cl = C.club;
  C.ledger = C.ledger || {};
  C.highlights = C.highlights || [];
  for (const e of userRes.events || []) if (e.acro && e.scorer) {
    const team = C.teams[e.side === 'home' ? uf.h : uf.a].name, vs = C.teams[e.side === 'home' ? uf.a : uf.h].name;
    C.highlights.unshift({ s: C.season, w: r + 1, type: e.acro, min: e.min, scorer: e.scorer, team, vs });
    news(`${ACRO[e.acro].icon} ${ACRO[e.acro].name} av ${e.scorer} (${team}) mot ${vs}! Säsongens höjdpunkt?`, 'good');
  }
  C.highlights.length = Math.min(C.highlights.length, 40);
  { const hn = C.teams[uf.h].name, an = C.teams[uf.a].name; news(`Omgång ${r + 1}: ${hn} ${userRes.hg}–${userRes.ag} ${an}.`, (uf.home ? userRes.hg > userRes.ag : userRes.ag > userRes.hg) ? 'good' : userRes.hg === userRes.ag ? 'info' : 'bad'); }
  // Spelarstatistik och skador
  for (const e of userRes.players[uf.home ? 'away' : 'home']) {
    const q = findP(uf.opp, e.id); if (q) { q.apps++; q.goals += e.goals; q.assists = (q.assists || 0) + e.assists; }
  }
  const my = userRes.players[uf.home ? 'home' : 'away'];
  const gf = uf.home ? userRes.hg : userRes.ag, ga = uf.home ? userRes.ag : userRes.hg;
  const report = { injuries: [], trained: [], retired: [] };
  for (const e of my) {
    const p = findP(t, e.id); if (!p) continue;
    p.apps++; p.goals += e.goals; p.assists = (p.assists || 0) + e.assists; p.rsum += e.rating; p.last = e.rating;
    if (Math.random() < 0.025 * INTENSITY[cl.training.intensity].inj * (1 - staffLvl('physio') * 0.2) * (1 - staffLvl('fitness') * 0.1)) {
      p.inj = R.int(1, 4); report.injuries.push(`${p.name} (${p.inj} v)`);
    }
  }
  // Träning
  const facF = (0.7 + cl.fac.training * 0.15) * (1 + staffLvl('coach') * 0.15), intF = INTENSITY[cl.training.intensity].gain, focus = cl.training.focus;
  const mins = {}; for (const e of my) mins[e.id] = e.min ?? 90;
  for (const p of t.players) if (!away(p)) developPlayer(p, mins[p.id] || 0, facF, intF, focus, report, r);
  playLoans(report, r);
  // Form och skador läker (alla lag)
  const ph = staffLvl('physio');
  for (const tm of allTeams()) for (const p of tm.players) {
    if (p.inj) p.inj--;
    if (p.away) p.away--;
    if (p.inj && tm.user && Math.random() < ph * 0.25) p.inj--; // fysioterapeuten snabbar på läkningen
    let d = R.pick([-1, 0, 0, 1]);
    if (tm.user && p.last >= 7.5) d += Math.random() < 0.5 ? 1 : 0;
    if (tm.user && p.last && p.last < 5.5) d -= Math.random() < 0.5 ? 1 : 0;
    p.form = clamp(p.form + d + (p.form < 3 && Math.random() < 0.3 ? 1 : 0) - (p.form > 3 && Math.random() < 0.3 ? 1 : 0), 1, 5);
  }
  for (const tm of allTeams()) if (!tm.user) autoLineup(tm);
  // Publik och humör
  const won = gf > ga, draw = gf === ga;
  cl.mood = clamp(cl.mood + (won ? 5 + Math.min(3, gf - ga) : draw ? 1 : -4 - Math.min(3, ga - gf)), 5, 100);
  // Supportrarna närmar sig en nivå som beror på divisionen, stämningen och klubbens titlar – de växer inte i all oändlighet
  const fanTarget = 1100 * DIV_MULT[C.div] * (0.5 + cl.mood / 100) * (1 + Math.min(10, (C.trophies || []).length) * 0.03);
  cl.fans = Math.max(200, Math.round(cl.fans + (fanTarget - cl.fans) * 0.04 + (won ? 4 * DIV_MULT[C.div] : 0)));
  // Ekonomi
  if (uf.home && userRes.att) addLedger('tickets', userRes.att.income);
  const wb = weeklyBudget();
  for (const k in wb) addLedger(k, wb[k]);
  cl.cash += Object.entries(C.ledger).filter(([k]) => !['transfers', 'build', 'cup', 'hire'].includes(k)).reduce((a, [, v]) => a + v, 0);
  // Byggen
  for (const b of cl.builds) b.left--;
  for (const b of cl.builds.filter(x => x.left <= 0)) { BUILDS[b.key].apply(cl.stadium, cl.fac); news(`${BUILDS[b.key].name} är klar!`, 'good'); }
  cl.builds = cl.builds.filter(x => x.left > 0);
  makeOffers(t);
  refreshMarket(false);
  C.trainLog = report.trained.slice(0, 12);
  C.lastMatch = { round: r, home: uf.home, opp: uf.opp.name, gf, ga, report, ledger: { ...C.ledger } };
  C.ledger = {};
  if (report.injuries.length) news(`Skadade: ${report.injuries.join(', ')}.`, 'bad');
  if (report.trained.length) news(`Träningen gav resultat: ${report.trained.slice(0, 3).join(', ')}${report.trained.length > 3 ? ' …' : ''}.`, 'good');
  if (cl.cash < 0) news('Klubbkassan är negativ. Sälj spelare eller dra ner på kostnaderna.', 'bad');
  C.round++; C.week++;
  { const st = cupPlan().at[C.round]; if (st === cupPlan().order[0]) startCup(); else if (st) cupNextStage(st); }
  if (ntWindows().includes(C.round)) callUps();
  if (C.round >= C.fixtures.length) return endSeason();
  return null;
}

// ===== Försäsong =====
// Fyra träningsmatcher innan serien börjar. Lägre intäkter men full lön, och halv träningseffekt.
const PRE_WEEKS = 4;
function preDate(i) { const d = seasonStart(); d.setDate(d.getDate() - 7 * (PRE_WEEKS - i)); return d; }
function startPreseason() {
  const near = DIVS.filter(d => Math.abs(d - C.div) <= 1).flatMap(d => divGroup(d).teams).filter(t => !t.user).sort(() => Math.random() - 0.5);
  C.pre = PRE_WEEKS; C.preOpp = near.slice(0, PRE_WEEKS).map(t => t.id); C.preRes = [];
}
function preFixture() {
  if (!C.pre) return null;
  const i = PRE_WEEKS - C.pre, opp = teamById(C.preOpp[i]), me = userTeam();
  if (!opp) return null;
  const home = i % 2 === 0;
  return { i, opp, home, h: home ? me : opp, a: home ? opp : me, date: preDate(i) };
}
function friendlyAtt(h, a) { const x = attendance(h, a); return { ...x, total: Math.round(x.total * 0.35), income: Math.round((x.income || 0) * 0.35) }; }
function playPreWeek(res) {
  const f = preFixture(); if (!f) return;
  const t = userTeam(), cl = C.club, side = f.home ? 'home' : 'away';
  C.ledger = C.ledger || {};
  const report = { injuries: [], trained: [], retired: [] }, mins = {};
  for (const e of res.players[side]) { mins[e.id] = e.min ?? 90; const p = findP(t, e.id); if (p) p.last = e.rating; }
  for (const p of t.players) if (mins[p.id] && Math.random() < 0.01) { p.inj = R.int(1, 2); report.injuries.push(`${p.name} (${p.inj} v)`); }
  // Träning med halv effekt
  const facF = (0.7 + cl.fac.training * 0.15) * (1 + staffLvl('coach') * 0.15), intF = INTENSITY[cl.training.intensity].gain * 0.5;
  for (const p of t.players) if (!away(p)) developPlayer(p, mins[p.id] || 0, facF, intF, cl.training.focus, report, 0);
  for (const l of C.loans || []) developPlayer(l.p, 45, loanTraining(l.div), 0.5, 'all', report, 0);
  for (const p of t.players) { if (p.inj) p.inj--; if (p.away) p.away--; }
  // Ekonomi: biljetter från träningsmatchen, halva sponsor- och souvenirintäkterna, inga TV-pengar – men full lön och drift
  if (f.home) addLedger('tickets', friendlyAtt(f.h, f.a).income);
  const wb = weeklyBudget();
  for (const k in wb) addLedger(k, k === 'tv' ? 0 : k === 'sponsors' || k === 'merch' ? Math.round(wb[k] * 0.5) : wb[k]);
  cl.cash += Object.entries(C.ledger).filter(([k]) => !['transfers', 'build', 'cup', 'hire'].includes(k)).reduce((a, [, v]) => a + v, 0);
  for (const b of cl.builds) b.left--;
  for (const b of cl.builds.filter(x => x.left <= 0)) { BUILDS[b.key].apply(cl.stadium, cl.fac); news(`${BUILDS[b.key].name} är klar!`, 'good'); }
  cl.builds = cl.builds.filter(x => x.left > 0);
  makeOffers(t);
  refreshMarket(false);
  const gf = f.home ? res.hg : res.ag, ga = f.home ? res.ag : res.hg;
  C.preRes.push({ opp: f.opp.name, home: f.home, gf, ga });
  C.trainLog = report.trained.slice(0, 12);
  C.lastMatch = { round: -1, home: f.home, opp: f.opp.name, gf, ga, report, ledger: { ...C.ledger }, pre: true };
  C.ledger = {};
  news(`Träningsmatch: ${f.home ? t.name : f.opp.name} ${res.hg}–${res.ag} ${f.home ? f.opp.name : t.name}.`);
  if (report.injuries.length) news(`Skadade i träningsmatchen: ${report.injuries.join(', ')}.`, 'bad');
  C.pre--; C.week++;
  if (!C.pre) news(`Försäsongen är slut (${C.preRes.filter(x => x.gf > x.ga).length} vinster av ${PRE_WEEKS}). Serien börjar ${fmtDate(leagueDate(0))}!`, 'good');
}

// ===== Säsongens utmärkelser =====
// I varje division belönas de bästa med extra utveckling i sin viktigaste egenskap. Yngre spelare får mer.
const AWARD = {
  goals: { icon: '⚽', name: 'Skyttekung', skill: 'sho', what: 'mål' },
  assists: { icon: '🅰️', name: 'Assistkung', skill: 'pas', what: 'assist' },
  keeper: { icon: '🧤', name: 'Bästa målvakt', skill: 'gk', what: 'insläppta mål (lagets)' },
  defence: { icon: '🛡️', name: 'Bästa försvarare', skill: 'def', what: 'insläppta mål (lagets)' },
};
const awardGain = age => (age <= 19 ? 2 : age <= 21 ? 1.6 : age <= 24 ? 1.2 : age <= 28 ? 0.8 : age <= 31 ? 0.5 : 0.25);
function seasonAwards() {
  const out = {};
  for (const d of DIVS) {
    const g = divGroup(d), list = [], all = leaders(g.teams);
    const give = (type, p, t, val) => {
      if (!p) return;
      const k = AWARD[type].skill, gain = awardGain(p.age);
      p.sk[k] = Math.round(clamp(p.sk[k] + gain, 1, 20) * 100) / 100;
      p.pot = Math.max(p.pot, r1(Math.min(20, p.pot + gain * 0.5)));
      p.awards = (p.awards || []).concat([{ s: C.season, type }]);
      list.push({ type, name: p.name, team: t.name, val, gain, age: p.age, mine: !!t.user });
    };
    const sc = all.slice().sort((x, y) => y.g - x.g || y.a - x.a)[0];
    if (sc && sc.g > 0) give('goals', sc.p, sc.t, sc.g);
    const as = all.slice().sort((x, y) => y.a - x.a || y.g - x.g)[0];
    if (as && as.a > 0) give('assists', as.p, as.t, as.a);
    // Bästa försvar = laget som släppt in minst mål. Målvakten och de två backarna med flest matcher belönas.
    const best = table(g).slice().sort((x, y) => x.ga - y.ga || y.pts - x.pts)[0];
    if (best) {
      const byApps = pos => best.t.players.filter(p => p.pos === pos).sort((x, y) => (y.apps || 0) - (x.apps || 0));
      give('keeper', byApps('GK')[0], best.t, best.ga);
      for (const p of byApps('DEF').slice(0, 2)) give('defence', p, best.t, best.ga);
    }
    out[d] = list;
  }
  return out;
}

// ===== Troféskåp =====
// Ligamästare = vinst i division 1. Seriesegrar i lägre divisioner sparas också (mindre troféer).
function addLeagueTrophy(season, div) {
  C.trophies = C.trophies || [];
  if (C.trophies.some(t => t.s === season && t.kind !== 'cup')) return;
  C.trophies.push(div === 1 ? { s: season, kind: 'league', name: 'Ligamästare', div } : { s: season, kind: 'div', name: `Seriesegrare division ${div}`, div });
}
// Äldre karriärer: bygg upp skåpet från säsongshistoriken
function migrateTrophies() {
  if (C.trophyMig) return false;
  C.trophyMig = true;
  C.trophies = (C.trophies || []).map(t => (t.kind ? t : { ...t, kind: 'cup' }));
  for (const h of C.history || []) if (h.pos === 1) addLeagueTrophy(h.season, h.div);
  return C.trophies.length > 0;
}

function endSeason() {
  const standings = {};
  for (const d of DIVS) standings[d] = table(divGroup(d)).map(r => r.t);
  const kings = {};
  for (const d of DIVS) {
    const top = leaders(divGroup(d).teams).sort((x, y) => y.g - x.g || y.a - x.a)[0];
    if (top && top.g > 0) kings[d] = { name: top.p.name, team: top.t.name, goals: top.g, mine: !!top.t.user };
  }
  const awards = seasonAwards();
  const tb = table(), pos = tb.findIndex(r => r.t.user) + 1, cl = C.club, t = userTeam();
  const prize = Math.round(PRIZE[pos - 1] * DIV_MULT[C.div]);
  cl.cash += prize;
  const oldDiv = C.div;
  let move = 0;
  const nTeams = tb.length;
  if (pos <= UP_DOWN && C.div > 1) move = -1;
  if (pos > nTeams - UP_DOWN && C.div < lowestDiv()) move = 1;
  C.div += move;
  if (move < 0) { cl.fans = Math.round(cl.fans * 1.2); cl.mood = clamp(cl.mood + 15, 5, 100); }
  if (move > 0) { cl.mood = clamp(cl.mood - 15, 5, 100); }
  const summary = { season: C.season, div: oldDiv, pos, prize, move, retired: [], youth: [], highlights: (C.highlights || []).filter(h => h.s === C.season), kings, awards };
  C.history.unshift({ season: C.season, div: oldDiv, pos, pts: tb[pos - 1].pts });
  if (pos === 1) addLeagueTrophy(C.season, oldDiv);
  // Lånade spelare kommer hem innan säsongsskiftet
  for (const l of (C.loans || []).slice()) recallLoan(l.p.id, true);
  // Ålder, pension, ungdomar
  for (const p of t.players.slice()) {
    p.age++; p.listed = p.listed && true; p.goals = 0; p.assists = 0; p.apps = 0; p.rsum = 0;
    if (p.age >= 35 || (p.age >= 33 && Math.random() < 0.4)) { removePlayer(t, p); summary.retired.push(p.name); }
  }
  const nYouth = 1 + (cl.fac.youth >= 3 ? 1 : 0) + (staffLvl('youthHead') >= 3 ? 1 : 0);
  for (let i = 0; i < nYouth; i++) {
    // Akademins juniorer: nivån följer klubbens division (men under A-laget). Potentialen är oftast medel –
    // en riktig stjärna (betyg 85+) kommer bara ibland, oftare med bättre akademi.
    const p = genPlayer(LEVEL[C.div] - 3 + cl.fac.youth * 0.3, R.pick(['DEF', 'MID', 'FWD', 'GK']), R.int(16, 17));
    const main = Math.max(...SKILLS.filter(k => PROFILES[p.pos][k] > 0).map(k => p.sk[k]));
    p.pot = r1(clamp(Math.max(main + 1, 9 + cl.fac.youth * 0.7 + staffLvl('youthHead') * 0.5 + 9 * Math.pow(Math.random(), 2.8 - staffLvl('youthHead') * 0.3)), 6, 20)); p.num = freeNumber(t, p.pos);
    if (t.players.length + (C.loans || []).length < SQUAD_MAX) { t.players.push(p); summary.youth.push(`${p.name} (${POS_NAME[p.pos]}, potential ${disp(p.pot)})`); }
  }
  // Upp- och nedflyttning i hela pyramiden: topp 3 upp, de 3 sista ner (äldre format: 2 och 2)
  const next = {}; for (const d of DIVS) next[d] = [];
  for (const d of DIVS) { const n = standings[d].length; standings[d].forEach((tm, i) => {
    const to = i < UP_DOWN && d > 1 ? d - 1 : i >= n - UP_DOWN && d < lowestDiv() ? d + 1 : d;
    next[to].push(tm);
    if (!tm.user) developAiTeam(tm, to);
  }); }
  // Äldre karriär (4 × 8): byt till 6 divisioner × 12 lag. Nivåerna behålls: gamla div 1→1, 2→2, 3→4, 4→6.
  if (!C.v6) {
    const MAP = { 1: 1, 2: 2, 3: 4, 4: 6 }, moved = {};
    for (const d of DIVS) moved[MAP[d]] = next[d];
    setFormat(6);
    const used = new Set(Object.values(moved).flat().map(x => x.name));
    for (const d of DIVS) { next[d] = moved[d] || []; while (next[d].length < TEAMS_PER_DIV) next[d].push(genTeam(d, used)); }
    const was = C.div; C.div = MAP[C.div]; C.v6 = true; summary.converted = { was, now: C.div };
    news(`Nytt format: 6 divisioner med 12 lag, 22 omgångar och 3 upp/3 ner. Er nivå är densamma – ni spelar nu i division ${C.div}.`, 'good');
  }
  summary.champion = standings[1][0].name;
  C.teams = next[C.div];
  shuffleTeams();
  C.league = {};
  for (const d of DIVS) if (d !== C.div) C.league[d] = groupFrom(next[d]);
  C.season++; C.round = 0; C.offers = [];
  refreshMarket(true);
  autoLineup(t); t.wish = t.lineup.slice();
  startPreseason();
  autoLoans();
  news(move < 0 ? `UPPFLYTTNING! Nästa säsong spelar ni i division ${C.div}.` : move > 0 ? `Nedflyttning till division ${C.div}. Dags att bygga om.` : `Säsong ${C.season - 1} slut: plats ${pos} i division ${oldDiv}.`, move < 0 ? 'good' : move > 0 ? 'bad' : 'info');
  news(`Prispengar: ${money(prize)}.`, 'good');
  news(`${summary.champion} vann division 1 säsong ${C.season - 1}.`);
  for (const d in awards) for (const a of awards[d]) if (a.mine) news(`${AWARD[a.type].icon} ${a.name} är ${AWARD[a.type].name.toLowerCase()} i division ${d}! ${SKILL_NAME[AWARD[a.type].skill]} +${Math.round(a.gain * 5)}.`, 'good');
  for (const d in kings) news(`⚽ Skyttekung i division ${d}: ${kings[d].name} (${kings[d].team}) med ${kings[d].goals} mål.`, kings[d].mine ? 'good' : 'info');
  if (summary.retired.length) news(`Avslutar karriären: ${summary.retired.join(', ')}.`);
  if (summary.youth.length) news(`Nya från akademin: ${summary.youth.join(', ')}.`, 'good');
  return summary;
}

// ===== Spara / ladda =====
const SAVE_KEY = 'flodljus-manager-v1';
const Cloud = { db: null, uid: null, mode: null, chain: Promise.resolve() };
// ===== Spelarkod (egen server) =====
// Ingen inloggning: första gången skapas en slumpad kod som sparas i telefonen.
// Samma kod på en annan enhet hämtar samma karriär.
const CODE_KEY = 'flodljus-spelarkod', CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const fmtCode = c => (c.length === 8 ? `${c.slice(0, 4)}-${c.slice(4)}` : c);
function playerCode() {
  let c = null;
  try { c = normCode(localStorage.getItem(CODE_KEY)); } catch (e) { /* ingen lagring */ }
  if (!c || c.length !== 8) {
    const r = new Uint32Array(8); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(r) : r.forEach((_, i) => { r[i] = Math.random() * 1e9; });
    c = Array.from(r, x => CODE_ABC[x % CODE_ABC.length]).join('');
    try { localStorage.setItem(CODE_KEY, c); } catch (e) { /* ingen lagring */ }
  }
  return c;
}
function setPlayerCode(c) { try { localStorage.setItem(CODE_KEY, c); } catch (e) { /* ingen lagring */ } if (Cloud.mode === 'server') Cloud.uid = c; }
// Samma gränssnitt som Claudes databas (doc(path).get/set/delete), men mot /api/save/<id> på den egna servern
const serverDb = {
  doc(path) {
    const last = path.split('/').pop(), part = last.match(/_part(\d+)$/), uid = path.split('/')[2];
    const url = `/api/save/${encodeURIComponent(uid + (part ? '.p' + part[1] : ''))}`;
    return {
      async get() {
        const r = await fetch(url, { cache: 'no-store' });
        if (r.status === 404) return { exists: false, data: () => null };
        if (!r.ok) throw new Error(`Servern svarade ${r.status}`);
        const j = await r.json(), d = JSON.parse(j.data);
        return { exists: true, data: () => d };
      },
      async set(obj, base) {
        const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ savedAt: obj.savedAt, base, data: JSON.stringify(obj) }) });
        if (r.status === 409) throw Object.assign(new Error('Nyare sparning finns'), { conflict: true });
        if (!r.ok) throw new Error(`Servern svarade ${r.status}`);
      },
      async delete() { await fetch(url, { method: 'DELETE' }); },
    };
  },
};
async function initCloud() {
  // 1) Inuti Claude: Claudes databas och inloggade användare
  try {
    if (window.claude && window.claude.use) {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const uid = db && user ? await user.id() : null;
      if (uid) { Cloud.db = db; Cloud.uid = uid; Cloud.mode = 'claude'; return true; }
    }
  } catch (e) { /* inte i Claude */ }
  // 2) På egen server: API:et på samma adress (/api/)
  try {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const tm = ctl && setTimeout(() => ctl.abort(), 4000);
    const r = await fetch('/api/health', { cache: 'no-store', signal: ctl && ctl.signal });
    if (tm) clearTimeout(tm);
    if (r.ok && (await r.json()).ok) { Cloud.db = serverDb; Cloud.uid = playerCode(); Cloud.mode = 'server'; return true; }
  } catch (e) { /* ingen server – bara telefonens sparning */ }
  return false;
}
// Molnsparningen komprimeras (gzip) och delas vid behov upp i flera dokument, eftersom varje dokument får vara högst 256 KB.
const CHUNK = 100000;
async function packSave(json) {
  if (typeof CompressionStream === 'undefined') return json;
  try {
    const st = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
    const buf = new Uint8Array(await new Response(st).arrayBuffer());
    let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return 'gz:' + btoa(bin);
  } catch (e) { return json; }
}
async function unpackSave(str) {
  if (!str.startsWith('gz:')) return str;
  const bin = atob(str.slice(3)), buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const st = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(st).text();
}
const cloudRef = i => Cloud.db.doc(`data/users/${Cloud.uid}/career${i ? '_part' + i : ''}`);
async function cloudLoad() {
  if (!Cloud.db) return null;
  try {
    const snap = await cloudRef(0).get();
    if (!snap.exists) { Cloud.base = 0; return null; }
    const d = snap.data();
    Cloud.base = d.savedAt || 0;
    if (d.json) return JSON.parse(d.json); // äldre format
    let str = d.p || '';
    for (let i = 1; i < (d.n || 1); i++) {
      const part = await cloudRef(i).get();
      if (!part.exists || part.data().savedAt !== d.savedAt) return null; // ofullständig sparning – använd telefonens kopia
      str += part.data().p;
    }
    return JSON.parse(await unpackSave(str));
  } catch (e) { recordError(e, 'molnladdning'); }
  return null;
}
function localLoad() { try { const j = localStorage.getItem(SAVE_KEY); return j ? JSON.parse(j) : null; } catch (e) { return null; } }
function saveCareer() {
  if (!C) return;
  C.savedAt = Date.now();
  // Vilken molnversion den här sparningen bygger vidare på (för att avgöra vilken som gäller mellan enheter)
  if (Cloud.db && Cloud.base != null && !Cloud.conflict) C.cloudBase = Cloud.base;
  const json = JSON.stringify(C);
  try { localStorage.setItem(SAVE_KEY, json); } catch (e) { /* ingen lagring */ }
  if (Cloud.db && !Cloud.conflict) {
    const savedAt = C.savedAt;
    Cloud.chain = Cloud.chain.then(async () => {
      if (Cloud.conflict) return;
      // Har en annan enhet sparat något nyare sedan vi laddade? Skriv då inte över det.
      if (Cloud.mode === 'claude' && Cloud.base != null) {
        const cur = await cloudRef(0).get();
        if (cur.exists && (cur.data().savedAt || 0) > Cloud.base) throw Object.assign(new Error('Nyare sparning finns'), { conflict: true });
      }
      // Egen server tar hela sparningen i ett stycke; Claudes databas kräver delning (256 KB per dokument)
      const chunk = Cloud.mode === 'server' ? 4e6 : CHUNK;
      const str = await packSave(json), n = Math.max(1, Math.ceil(str.length / chunk));
      // Delarna först, huvuddokumentet sist: då pekar huvuddokumentet aldrig på delar som inte finns
      for (let i = 1; i < n; i++) await cloudRef(i).set({ savedAt, p: str.slice(i * chunk, (i + 1) * chunk) });
      const head = { savedAt, n, p: str.slice(0, chunk) };
      await (Cloud.mode === 'server' ? cloudRef(0).set(head, Cloud.base) : cloudRef(0).set(head));
      Cloud.base = savedAt; Cloud.lastOk = Date.now();
      Cloud.lastSize = str.length;
    }).catch(e => {
      if (!e || !e.conflict) return; // molnet otillgängligt – telefonens kopia finns kvar
      Cloud.conflict = true;
      if (typeof cloudConflict === 'function') cloudConflict();
    });
  }
}
function deleteSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ingen lagring */ }
  if (Cloud.db) Cloud.chain = Cloud.chain.then(() => Cloud.db.doc(`data/users/${Cloud.uid}/career`).delete()).catch(() => {});
}
