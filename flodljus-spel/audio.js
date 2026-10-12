'use strict';
// ===== Felrapport: fångar fel så att spelet inte fryser, och sparar senaste felet så att det kan visas efteråt =====
const GAME_VERSION = 29;
// Grafikläge: 'hog' eller 'lag' (lätt). Sparas i telefonen.
const GFX = { low: false };
try { GFX.low = localStorage.getItem('flodljus-grafik') === 'lag'; } catch (e) { /* ingen lagring */ }
function setLowGfx(on) { GFX.low = on; try { localStorage.setItem('flodljus-grafik', on ? 'lag' : 'hog'); } catch (e) { /* ingen lagring */ } }
const Diag = { shown: false };
function recordError(err, where) {
  const info = {
    t: new Date().toLocaleString('sv-SE'), where, v: GAME_VERSION,
    msg: String((err && err.message) || err).slice(0, 200),
    stack: String((err && err.stack) || '').split('\n').slice(0, 4).join(' | ').slice(0, 400),
    state: typeof G !== 'undefined' ? G.state : '?',
  };
  try { localStorage.setItem('flodljus-senaste-fel', JSON.stringify(info)); } catch (e) { /* ingen lagring */ }
  try { if (typeof C !== 'undefined' && C) { C.diag = info; saveCareer(); } } catch (e) { /* sparning misslyckades */ }
  if (!Diag.shown && typeof toast === 'function') { Diag.shown = true; toast('Ett fel uppstod. Spelet försöker fortsätta – berätta gärna för Claude.', true); }
}
addEventListener('error', e => recordError(e.error || e.message, 'error'));
addEventListener('unhandledrejection', e => recordError(e.reason, 'promise'));
// Syntetiserat ljud: publik, spark, visselpipa, stolpträff. Inga ljudfiler behövs.
const Sound = (() => {
  let ac = null, master = null, crowdG = null, crowdF = null, nb = null, muted = false;
  // iPhone klarar dåligt hundratals ljudobjekt: högst 8 effekter samtidigt, och varje ljud städas bort när det tystnat
  let voices = 0; const MAX_VOICES = 8, last = {};
  const free = (...nodes) => () => { voices--; for (const n of nodes) { try { n.disconnect(); } catch (e) { /* redan frånkopplad */ } } };
  // Samma ljud högst var 70:e millisekund (t.ex. många sparkar i följd)
  const gate = (name, gap = 0.07) => { const t = ac.currentTime; if (t - (last[name] || -1) < gap) return false; last[name] = t; return true; };

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ac = new AC(); } catch (e) { ac = null; return; }
    master = ac.createGain();
    master.gain.value = muted ? 0 : 0.8;
    master.connect(ac.destination);

    // Brusbuffert (brunt brus) som både publik och effekter använder
    const len = ac.sampleRate * 2;
    nb = ac.createBuffer(1, len, ac.sampleRate);
    const d = nb.getChannelData(0);
    let v = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      v = (v + 0.02 * w) / 1.02;
      d[i] = v * 3.5 + w * 0.12;
    }
    const src = ac.createBufferSource();
    src.buffer = nb; src.loop = true;
    crowdF = ac.createBiquadFilter();
    crowdF.type = 'bandpass'; crowdF.frequency.value = 520; crowdF.Q.value = 0.7;
    crowdG = ac.createGain(); crowdG.gain.value = 0; cg = 0;
    src.connect(crowdF); crowdF.connect(crowdG); crowdG.connect(master);
    src.start();
  }

  const ok = () => ac && !muted;
  let cg = 0, cf = 520, lastCrowd = 0;
  function crowdTo(gain, freq, now) {
    if (!ac || !crowdG) return;
    const t = performance.now();
    if (!now && t - lastCrowd < 50) return;
    const k = now ? 1 : Math.min(1, (t - lastCrowd) / 400);
    lastCrowd = t;
    cg += (gain - cg) * k; cf += (freq - cf) * k;
    crowdG.gain.value = cg; crowdF.frequency.value = cf;
  }

  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function noise(dur, type, freq, q, peak, delay = 0) {
    if (voices >= MAX_VOICES) return;
    voices++;
    const t = ac.currentTime + delay;
    const s = ac.createBufferSource(); s.buffer = nb;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain(); env(g, t, 0.004, peak, dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.onended = free(s, f, g);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }
  function tone(type, f0, f1, dur, peak, delay = 0) {
    if (voices >= MAX_VOICES) return;
    voices++;
    const t = ac.currentTime + delay;
    const o = ac.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = ac.createGain(); env(g, t, 0.005, peak, dur);
    o.connect(g); g.connect(master);
    o.onended = free(o, g);
    o.start(t); o.stop(t + dur + 0.05);
  }

  return {
    init,
    kick(p) { if (!ok() || !gate('kick')) return; tone('sine', 150, 42, 0.14, 0.45 + p * 0.5); noise(0.05, 'highpass', 1800, 0.7, 0.12 + p * 0.25); },
    bounce(p) { if (!ok() || !gate('bounce', 0.15)) return; tone('sine', 110, 50, 0.1, 0.05 + 0.15 * p); },
    thud() { if (!ok() || !gate('thud', 0.15)) return; tone('sine', 80, 38, 0.2, 0.3); noise(0.12, 'lowpass', 400, 0.8, 0.22); },
    post() { if (!ok()) return; tone('triangle', 880, 860, 0.8, 0.32); tone('triangle', 1320, 1290, 0.55, 0.18); tone('sine', 220, 200, 0.3, 0.28); },
    net() { if (!ok()) return; noise(0.4, 'bandpass', 2600, 0.6, 0.32); },
    catchBall() { if (!ok() || !gate('catch', 0.12)) return; tone('sine', 200, 90, 0.08, 0.32); noise(0.06, 'bandpass', 900, 1, 0.28); },
    tackle() { if (!ok() || !gate('tackle', 0.12)) return; noise(0.12, 'lowpass', 700, 0.6, 0.32); tone('sine', 120, 60, 0.1, 0.22); },
    slide() { if (!ok() || !gate('slide', 0.12)) return; noise(0.32, 'bandpass', 1400, 0.5, 0.16); },
    whistle(n = 1, long = false) {
      if (!ok()) return;
      for (let i = 0; i < n; i++) {
        const t = ac.currentTime + i * 0.36;
        const dur = long && i === n - 1 ? 0.95 : 0.24;
        const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = 2750;
        const lfo = ac.createOscillator(); lfo.frequency.value = 34;
        const lg = ac.createGain(); lg.gain.value = 120;
        lfo.connect(lg); lg.connect(o.frequency);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
        g.gain.setValueAtTime(0.2, t + dur - 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(master);
        o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
      }
    },
    goal() {
      if (!ok()) return;
      tone('sawtooth', 233, 231, 1.6, 0.07); tone('sawtooth', 294, 292, 1.6, 0.05);
      tone('sawtooth', 233, 231, 1.2, 0.06, 1.7); tone('sawtooth', 294, 292, 1.2, 0.045, 1.7);
    },
    // Publikljudet: volym och klang ändras direkt (mjukt, högst 20 gånger per sekund) i stället för att
    // schemaläggas varje bildruta. Schemaläggning byggde upp tiotusentals händelser per match, vilket
    // iPhone sannolikt inte rensar – troligen orsaken till krascherna i slutet av matcherna.
    crowd(level) { const l = Math.min(1.5, Math.max(0, level)); crowdTo(0.05 + l * 0.3, 460 + l * 720); },
    // Tyst när skärmen släcks eller fliken göms, annars fortsätter publikljudet i bakgrunden
    suspend() { if (ac && ac.state === 'running') ac.suspend().catch(() => {}); },
    resume() { if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); },
    // Publiken helt tyst (efter matchen); nästa match väcker ljudet igen via init()
    // Efter slutsignalen: f går från 1 till 0 och publiken tystnar
    crowdFade(f) { crowdTo(0.1 * Math.max(0, f), 460); },
    crowdOff() { crowdTo(0, 460, true); },
    get crowdLevel() { return cg; },
    get state() { return ac ? ac.state : 'none'; },
    setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.8; },
    get muted() { return muted; },
  };
})();
