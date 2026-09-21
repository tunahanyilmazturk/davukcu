// Karakterler: İşçi gübre yığınlarını toplayıp kovaya taşır;
// Bakıcı kümeste gezip tavukları sever (yumurtlamayı hızlandırır).
import { S } from '../state.js';
import { L } from '../config.js';
import { workerSpeed, workerCarry, keeperBoost, keeperCd } from '../economy.js';
import { posBlocked } from './chickens.js';
import { binAdd } from './manure.js';
import { sndPop, sndPet } from '../audio.js';

const PICK_T = 0.35; // yığın alma süresi
const PET_T  = 0.55; // sevme süresi

export function spawnWorker(role, x, y) {
  const P = L.PEN;
  const w = {
    role, dir: Math.random() < 0.5 ? 1 : -1,
    x: x ?? P.x + P.w * 0.5 + (Math.random() - .5) * 80,
    y: y ?? P.y + P.h * 0.65 + (Math.random() - .5) * 60,
    state: 'idle', t: 0.4 + Math.random(), tx: 0, ty: 0,
    carry: 0, tgt: null, bob: Math.random() * 6, stuck: 0,
    seed: Math.floor(Math.random() * 997), // kova önünde duruş ofseti
  };
  S.workers.push(w);
  return w;
}

// engelsiz rastgele gezinme hedefi (tavuk pickWander ile aynı mantık)
function wanderTarget(w, P) {
  for (let i = 0; i < 8; i++) {
    const tx = P.x + 24 + Math.random() * (P.w - 48);
    const ty = P.y + 40 + Math.random() * (P.h - 50);
    if (posBlocked(tx, ty)) continue;
    const dx = tx - w.x, dy = ty - w.y;
    if (dx * dx + dy * dy < 3600) continue; // çok yakın hedef atlama
    w.tx = tx; w.ty = ty;
    return true;
  }
  return false;
}

// en yakın gübre yığını
function seekManure(w) {
  let best = null, bd = 1e9;
  for (const m of S.manures) {
    const d = (m.x - w.x) * (m.x - w.x) + (m.y - w.y) * (m.y - w.y);
    if (d < bd) { bd = d; best = m; }
  }
  if (!best) return false;
  w.tgt = best; w.tx = best.x; w.ty = best.y + 2;
  return true;
}

// bakıcının seveceği tavuk — keepCd geçmiş en yakın aday
function seekChicken(w) {
  let best = null, bd = 1e9;
  for (const ch of S.chickens) {
    if (ch.stolen || ch.drag || (ch.keepCd || 0) > 0) continue;
    const d = (ch.x - w.x) * (ch.x - w.x) + (ch.y - w.y) * (ch.y - w.y);
    if (d < bd) { bd = d; best = ch; }
  }
  if (!best) return false;
  w.tgt = best; w.tx = best.x; w.ty = best.y + 10;
  return true;
}

// hedefe yürü; true = vardı, 'stuck' = takıldı (çağıran abandone etsin)
function moveTo(w, dt) {
  const dx = w.tx - w.x, dy = w.ty - w.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const step = workerSpeed() * dt;
  if (dist <= step + 2) { w.x = w.tx; w.y = w.ty; return true; }
  let nx = w.x + dx / dist * step, ny = w.y + dy / dist * step;
  if (!posBlocked(w.x, w.y) && posBlocked(nx, ny)) { // engel: dikey kay
    ny = w.y;
    if (posBlocked(nx, ny)) nx = w.x;
  }
  const mx = nx - w.x, my = ny - w.y;
  w.stuck = (mx * mx + my * my) < step * step * 0.12 ? w.stuck + dt : 0;
  w.x = nx; w.y = ny;
  if (Math.abs(dx) > 6) w.dir = dx > 0 ? 1 : -1;
  w.bob += dt * 9;
  return w.stuck > 1.2 ? 'stuck' : false;
}

function toIdle(w, t) { w.state = 'idle'; w.t = t ?? (0.5 + Math.random() * 1.4); w.tgt = null; }

// işçi: kovaya taşıma noktası — haznenin ön kenarı
function binSpot(w) {
  const B = L.MANURE_BIN;
  w.tx = B.x + B.w / 2 + (w.seed % 3 - 1) * 8;
  w.ty = B.y + B.h + 14;
}

export function updateWorkers(dt) {
  if (!S.workers.length) return;
  const P = L.PEN, cap = workerCarry();
  for (const w of S.workers) {
    // hedef geçerliliği: yığın toplandıysa / tavuk eldeyse bırak
    if (w.tgt) {
      const gone = w.role === 'worker'
        ? S.manures.indexOf(w.tgt) < 0
        : (w.tgt.stolen || w.tgt.drag || (w.tgt.keepCd || 0) > 0);
      if (gone) { w.tgt = null; if (w.state !== 'haul') toIdle(w, 0.2); }
    }
    switch (w.state) {
      case 'idle':
        w.t -= dt;
        if (w.t > 0) break;
        if (w.role === 'worker') {
          if (S.manures.length && w.carry < cap && seekManure(w)) { w.state = 'walk'; }
          else if (w.carry > 0) { binSpot(w); w.state = 'haul'; }
          else if (wanderTarget(w, P)) w.state = 'walk';
          else w.t = 0.6;
        } else { // keeper
          if (seekChicken(w)) w.state = 'walk';
          else if (wanderTarget(w, P)) w.state = 'walk';
          else w.t = 0.6;
        }
        break;

      case 'walk': {
        const r = moveTo(w, dt);
        if (r === 'stuck') { w.stuck = 0; toIdle(w); break; }
        if (!r) break;
        if (w.tgt) {
          w.state = w.role === 'worker' ? 'pick' : 'pet';
          w.t = w.role === 'worker' ? PICK_T : PET_T;
        } else toIdle(w);
        break;
      }

      case 'haul': { // işçi kovaya gidiyor
        const r = moveTo(w, dt);
        if (r === 'stuck') { w.stuck = 0; toIdle(w); break; }
        if (!r) break;
        if (w.carry > 0) {
          binAdd(w.carry);
          const B = L.MANURE_BIN;
          S.parts.push({ kind: 'text', text: '+' + w.carry + ' kova',
            x: B.x + B.w / 2 - 18, y: B.y - 10, vy: -26, t: 0, life: .8, color: '#c89858' });
          sndPop();
          w.carry = 0;
        }
        toIdle(w);
        break;
      }

      case 'pick':
        w.t -= dt;
        if (w.t > 0) break;
        if (w.tgt) {
          const i = S.manures.indexOf(w.tgt);
          if (i >= 0) { S.manures.splice(i, 1); w.carry++; } // başka işçi kapmışsa sayma
          w.tgt = null;
        }
        // kapasite dolduysa kovaya, değilse sıradaki yığına
        if (w.carry >= cap) { binSpot(w); w.state = 'haul'; }
        else if (S.manures.length && seekManure(w)) w.state = 'walk';
        else if (w.carry > 0) { binSpot(w); w.state = 'haul'; }
        else toIdle(w);
        break;

      case 'pet': {
        w.t -= dt;
        if (w.t > 0) break;
        const ch = w.tgt;
        w.tgt = null;
        if (ch && !ch.stolen && !ch.drag
            && Math.hypot(ch.x - w.x, ch.y - w.y) < 44) { // tavuk uzaklaştıysa sevme
          ch.hop = 0.28;
          ch.layT = Math.max(0.25, ch.layT * keeperBoost());
          ch.keepCd = keeperCd();
          S.stats.pets++;
          for (let i = 0; i < 3; i++)
            S.parts.push({ kind: 'heart', x: ch.x - 12 + i * 12, y: ch.y - 44,
              vy: -30 - i * 8, t: 0, life: .9 });
          sndPet();
        }
        toIdle(w);
        break;
      }
    }
  }
}
