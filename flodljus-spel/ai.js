'use strict';
// Grundformation (lag som anfaller åt höger), andel av längd/bredd
const FORM = { GK: [0.03, 0.5], DL: [0.2, 0.3], DR: [0.2, 0.7], LM: [0.43, 0.18], MF: [0.4, 0.5], RM: [0.43, 0.82], FW: [0.62, 0.5] };

function formationTarget(p, attacking) {
  const s = dirOf(p.side), f = FORM[p.role];
  let x = f[0] * L, y = f[1] * WD;
  const bxRel = s > 0 ? ball.x : L - ball.x;
  let shift = (bxRel - L * 0.45) * 0.55 + (attacking ? 7 : -3) + tactOf(p.side).shift;
  if (p.role === 'DL' || p.role === 'DR') shift = Math.min(shift, L * 0.26);
  if (p.role === 'FW') shift = Math.max(shift, -L * 0.14);
  x += shift;
  y += (ball.y - CY) * (p.role === 'FW' ? 0.45 : p.role === 'LM' || p.role === 'RM' ? 0.22 : 0.32);
  if (attacking) y += Math.sin(G.time * 0.7 + p.idx * 1.7) * 3;
  x = clamp(x, 2, L - 4); y = clamp(y, 2, WD - 2);
  return [s > 0 ? x : L - x, y];
}

function steer(p, tx, ty, urgent) {
  const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
  if (d < 0.4) {
    p.wx = 0; p.wy = 0;
    const bx = ball.x - p.x, by = ball.y - p.y, bl = Math.hypot(bx, by) || 1;
    p.fx += (bx / bl - p.fx) * 0.1; p.fy += (by / bl - p.fy) * 0.1;
    return;
  }
  p.wx = dx / d; p.wy = dy / d;
  p.run = Math.min(1, d / 2.5);
  p.sprint = (urgent && d > 3) || d > 10;
}

// Hur gärna backarna kliver fram (lägre = oftare). 'deep' = hur långt från eget mål det gäller (andel av planen).
const BACK_STEP = { deep: 0.62, flank: 0.35, other: 0.6 };
function aiUpdate(dt) {
  const owner = ball.owner;
  for (const side of ['home', 'away']) {
    const team = teamOf(side), s = dirOf(side);
    const attacking = owner && owner.side === side;
    const hx = ball.x + ball.vx * 0.35, hy = ball.y + ball.vy * 0.35;
    let chaser = null, cd = 1e9, second = null, sd = 1e9;
    if (!attacking) {
      // Backarna kliver fram när bollen är på egen planhalva nära deras zon (räknas som närmare än de är)
      const deep = Math.abs(hx - ownGoalX(side)) < L * BACK_STEP.deep;
      for (const p of team) {
        if (p.role === 'GK') continue;
        const back = p.role === 'DL' || p.role === 'DR';
        // Backen tar sin egen kant: bollen på samma sida som backens zon
        const ownFlank = back && (p.role === 'DL' ? hy < CY + 2 : hy > CY - 2);
        const d = Math.hypot(hx - p.x, hy - p.y) * (FX.backStep && back && deep ? (ownFlank ? BACK_STEP.flank : BACK_STEP.other) : 1);
        if (d < cd) { second = chaser; sd = cd; chaser = p; cd = d; }
        else if (d < sd) { second = p; sd = d; }
      }
    }
    for (const p of team) {
      p.sprint = false; p.run = 1;
      if (p === G.human) continue;
      if (p.role === 'GK') { keeperAI(p, dt); continue; }
      if (owner === p) { ownerAI(p, dt); continue; }
      if (p.stun > 0 || p.slide > 0) continue;
      let tx, ty, urgent = false;
      if (!attacking) {
        if (p === chaser) {
          tx = hx; ty = hy; urgent = true;
          if (owner) { tx = owner.x - s * 0.5; ty = owner.y; }
          // Datorn glidtacklar ibland
          if (owner && owner.side !== side && !owner.holding && dist(p, owner) < 1.8 && Math.random() < aiFor(p).tackle * tactOf(side).press * 0.18 * dt) {
            p.fx = (owner.x - p.x) / (dist(p, owner) || 1); p.fy = (owner.y - p.y) / (dist(p, owner) || 1);
            p.wx = p.fx; p.wy = p.fy; slideTackle(p); continue;
          }
        } else if (p === second && owner) {
          const og = ownGoalX(side);
          tx = ball.x + (og - ball.x) * 0.28; ty = ball.y + (CY - ball.y) * 0.28;
        } else {
          [tx, ty] = formationTarget(p, false);
          // Markera närmaste motståndare i zonen
          let m = null, md = 8;
          for (const o of teamOf(other(side))) { const d = Math.hypot(o.x - tx, o.y - ty); if (d < md) { md = d; m = o; } }
          if (m) { tx = (tx + m.x - s * 1.5) / 2; ty = (ty + m.y) / 2; }
        }
      } else {
        [tx, ty] = formationTarget(p, true);
        // Gör dig spelbar: kliv bort från närmaste motståndare in i en ledig yta
        const o = nearestOpp(p);
        if (o) { const dx = p.x - o.x, dy = p.y - o.y, dd = Math.hypot(dx, dy) || 1; if (dd < 5) { tx += dx / dd * (5 - dd) * 0.9; ty += dy / dd * (5 - dd) * 0.9; } }
        tx = clamp(tx, 1, L - 1); ty = clamp(ty, 1.5, WD - 1.5);
        // Löp in i straffområdet när en lagkamrat står brett och kan slå inlägg
        if (owner && owner !== p && (p.role === 'FW' || p.role === 'MF' || ((p.role === 'LM' || p.role === 'RM') && Math.sign(p.y - CY) !== Math.sign(owner.y - CY))) && (crossSpot(owner) || (has(owner, 'crs') && (attackX(side) - owner.x) * s < L * 0.5))) {
          const gx = attackX(side);
          tx = gx - s * (p.role === 'FW' ? 7 : 12); ty = CY + (owner.y > CY ? -1 : 1) * (p.role === 'FW' ? 2 : -3);
        }
      }
      steer(p, tx, ty, urgent);
    }
  }
}

function aiPassTarget(p, pressured) {
  const s = dirOf(p.side);
  let best = null, bs = pressured ? -2 : 0.9;
  for (const m of teamOf(p.side)) {
    if (m === p || (m.role === 'GK' && !pressured)) continue;
    const d = dist(p, m);
    if (d < 3.5 || d > 34) continue;
    let sc = (m.x - p.x) * s * 0.13 + Math.min(7, nearestOppDist(m)) * 0.32 - d * 0.025;
    // Hur nära passningslinjen står närmaste motståndare? Ju närmare, desto sämre val
    let lane = 9;
    for (const o of teamOf(other(p.side))) { const [dd, t] = segDist(o.x, o.y, ball.x, ball.y, m.x, m.y); if (t > 0.05 && t < 1) lane = Math.min(lane, dd); }
    if (lane < 2.2) sc -= (2.2 - lane) * 2.2;
    if (sc > bs) { bs = sc; best = m; }
  }
  return best;
}

function ownerAI(p, dt) {
  const s = dirOf(p.side), gx = attackX(p.side), ai = aiFor(p);
  const toGoal = Math.hypot(gx - p.x, CY - p.y);
  const near = nearestOpp(p), nd = near ? dist(near, p) : 99;
  // Under en fint styr finten löpningen; under bröstmottagning står spelaren still
  if (acting(p, 'chest')) { p.wx = 0; p.wy = 0; return; }
  if (p.actT > 0 && p.actGood && (p.actType === 'over' || p.actType === 'turn')) { p.wx = p.actVX; p.wy = p.actVY; p.run = 1; p.sprint = true; return; }
  p.think -= dt;
  if (p.think <= 0) {
    p.think = ai.think * rnd(0.7, 1.3);
    const angOk = Math.abs(p.y - CY) < toGoal * 0.95 && (gx - p.x) * s > 2;
    if (crossSpot(p) && Math.random() < (has(p, 'crs') ? 0.75 : 0.12)) {
      const spot = { x: gx - s * 7, y: CY + (p.y > CY ? -1 : 1) * 2 };
      const near = teamOf(p.side).filter(m => m !== p && m.role !== 'GK').map(m => Math.hypot(m.x - spot.x, m.y - spot.y));
      if (Math.min(...near) < (has(p, 'crs') ? 15 : 8)) { cross(p, spot); return; }
    }
    // Lobb när målvakten har kommit ut
    const keeper = teamOf(other(p.side)).find(q => q.role === 'GK');
    if (FX.chip && angOk && keeper && Math.abs(keeper.x - gx) > 3 && toGoal > 10 && toGoal < 24 && Math.random() < 0.018 + p.rec.sk.pas / 600) { chip(p); return; }
    // Fint när en försvarare står i vägen
    if (FX.dribble && near && nd < 2.4 && (near.x - p.x) * s > -0.5 && Math.random() < (has(p, 'drb') ? 0.45 : 0.06 + p.rec.sk.pas / 200)) { if (tryDribble(p, near)) return; }
    if (angOk && toGoal < 16 + ai.range + (has(p, 'pow') ? 5 : 0) && (Math.random() < 0.6 + tactOf(p.side).shoot || toGoal < 12)) {
      const gk = teamOf(other(p.side)).find(q => q.role === 'GK');
      const aim = gk ? (gk.y < CY ? 1 : -1) * rnd(0.5, 0.95) : null;
      shoot(p, clamp(0.5 + toGoal / 40 + rnd(-0.08, 0.08), 0.45, 0.9), aim);
      return;
    }
    const goWide = has(p, 'crs') && (gx - p.x) * s < L * 0.45 && !crossSpot(p) && nd > 2.6;
    if ((nd < 2.9 && !(has(p, 'drb') && Math.random() < 0.6)) || Math.random() < (goWide ? 0.06 : 0.13)) {
      const m = aiPassTarget(p, nd < 2.9);
      if (m) { passTo(p, m, laneBlocked(p, m) || dist(p, m) > 26); return; }
    }
    // Inläggsspecialisten stannar ute på kanten i stället för att vika in mot mitten
    let dx = gx - p.x, dy = CY + (p.y - CY) * (has(p, 'crs') && Math.abs(p.y - CY) > 8 ? 0.97 : 0.35) - p.y;
    if (goWide) { dy = (p.y > CY ? WD - 5 : 5) - p.y; dx *= 0.5; }
    let l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    if (near && nd < 5) {
      const ax = p.x - near.x, ay = p.y - near.y, al = Math.hypot(ax, ay) || 1, w = (5 - nd) / 5 * 1.3;
      dx += ax / al * w; dy += ay / al * w;
      if (dx * s < 0.2) dx = s * 0.2;
      l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    }
    if (p.y < 3) dy = Math.abs(dy); if (p.y > WD - 3) dy = -Math.abs(dy);
    p.aiX = dx; p.aiY = dy;
  }
  p.wx = p.aiX; p.wy = p.aiY; p.run = 1;
  p.sprint = nd > 3 && p.stamina > 0.35;
}

function keeperAI(p, dt) {
  const s = dirOf(p.side), og = ownGoalX(p.side), ai = aiFor(p), b = ball;
  if (b.owner === p) {
    p.hold += dt;
    steer(p, og + s * 5, CY, false); p.run = 0.35;
    if (p.hold > 1.1) {
      const m = aiPassTarget(p, true) || teamOf(p.side).find(q => q.role === 'MF');
      p.holding = false;
      b.z = 0.3;
      passTo(p, m, dist(p, m) > 20 || laneBlocked(p, m));
    }
    return;
  }
  if (p.dive > 0 || p.stun > 0) return;
  // En lobb på väg mot målet: backa hem mot mållinjen
  if (!b.owner && b.chip && b.vx * s < 0) { steer(p, og + s * 0.6, clamp(b.y, CY - GOAL_HW + 0.4, CY + GOAL_HW - 0.4), true); return; }
  // Skott på väg mot målet?
  if (!b.owner && b.vx * s < -8) {
    const t = (p.x - b.x) / b.vx;
    if (t > 0 && t < 1.1) {
      const yAt = b.y + b.vy * t, zAt = Math.max(0, b.z + b.vz * t - 0.5 * GRAV * t * t);
      if (Math.abs(yAt - CY) < GOAL_HW + 0.7) {
        p.react += dt;
        if (p.react > ai.gkReact) {
          const dy = yAt - p.y;
          if (Math.abs(dy) > 0.7 || zAt > 1.9) {
            p.dive = 0.6; p.diveDir = Math.sign(dy) || 1;
            p.diveSpeed = Math.min(Math.abs(dy) / Math.max(0.15, t - 0.05), 6 + 3.5 * ai.gkSkill + (has(p, 'gkj') ? 3 : 0));
            p.diveUp = clamp(zAt / 2, 0, 1);
          } else { p.wx = 0; p.wy = Math.sign(dy); p.run = 1; }
        }
        return;
      }
    }
  }
  p.react = 0;
  const bx = b.x, by = b.y, dg = Math.hypot(bx - og, by - CY) || 1;
  const loose = !b.owner || b.owner.side !== p.side;
  const inBox = Math.abs(bx - og) < BOX_D && Math.abs(by - CY) < BOX_HW;
  if (inBox && loose && Math.hypot(bx - p.x, by - p.y) < 6.5 && b.z < 1.5 && Math.hypot(b.vx, b.vy) < 14) {
    steer(p, bx, by, true); return;
  }
  const out = clamp(dg * 0.14, 0.6, 4.5);
  const tx = og + (bx - og) / dg * out;
  const ty = clamp(CY + (by - CY) / dg * out, CY - GOAL_HW + 0.4, CY + GOAL_HW - 0.4);
  steer(p, tx, ty, false);
}

// Firande efter mål
function celebrateAI(dt) {
  const scorer = G.scorer;
  for (const p of G.players) {
    p.sprint = false; p.run = 1;
    if (p.side === G.goalSide) {
      p.cele = 1;
      if (p.role === 'GK') { steer(p, ownGoalX(p.side) + dirOf(p.side) * 6, CY, false); continue; }
      if (scorer && p === scorer) steer(p, attackX(p.side) - dirOf(p.side) * 4, 2, true);
      else if (scorer) steer(p, scorer.x - dirOf(p.side) * (1 + p.idx % 3), scorer.y + 1 + (p.idx % 2), true);
      else steer(p, L / 2, CY, false);
    } else {
      p.run = 0.35; p.cele = 0;
      const [tx, ty] = formationTarget(p, false);
      steer(p, tx, ty, false); p.run = 0.35; p.sprint = false;
    }
  }
}
