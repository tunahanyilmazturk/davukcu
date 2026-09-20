// Civcivler: kümesde horoz varken periyodik çıkar, süresi dolunca tavuğa dönüşür
import { S } from '../state.js';
import { L, MAX_CHICKENS } from '../config.js';
import { chickInterval, chickGrowT } from '../economy.js';
import { spawnChicken, inSilo } from './chickens.js';
import { sndPop, sndCluck } from '../audio.js';

let hatchT = 8; // ilk civciv biraz gecikmeli

export function spawnChick(x, y, growT) {
  const P = L.PEN;
  S.chicks.push({
    x: x !== undefined ? x : P.x + 40 + Math.random() * (P.w - 80),
    y: y !== undefined ? y : P.y + 60 + Math.random() * (P.h - 80),
    tx: 0, ty: 0, state: 'idle', t: Math.random() * 1.5,
    dir: Math.random() < 0.5 ? 1 : -1, frame: 'a', frameT: Math.random(),
    growT: growT !== undefined ? growT : chickGrowT(),
  });
}

export function updateChicks(dt) {
  const P = L.PEN;

  // kuluçka: gerçek horoz sayısına göre (horoz satılırsa durur); kümes dolunca da durur
  const roosters = S.chickens.reduce((n, c) => n + (c.breed === 'rooster' ? 1 : 0), 0);
  if (roosters > 0 && S.chickens.length + S.chicks.length < MAX_CHICKENS) {
    hatchT -= dt;
    if (hatchT <= 0) {
      hatchT = chickInterval(roosters);
      spawnChick();
      const c = S.chicks[S.chicks.length - 1];
      S.parts.push({ kind: 'puff', x: c.x, y: c.y - 10, t: 0, life: .35 });
      sndPop();
    }
  }

  // gezinme + büyüme
  for (const c of S.chicks) {
    c.t -= dt; c.frameT += dt; c.growT -= dt;
    if (c.state === 'idle') {
      c.frame = 'a';
      if (c.t <= 0) {
        // hedef silo şeridine düşmesin + çok yakın olmasın (tavuklarla aynı kural)
        let ok = false;
        for (let i = 0; i < 6; i++) {
          const tx = P.x + 16 + Math.random() * (P.w - 32);
          const ty = P.y + 30 + Math.random() * (P.h - 34);
          if (inSilo(tx, ty, L.FEED) || inSilo(tx, ty, L.WATER)) continue;
          if (Math.hypot(tx - c.x, ty - c.y) < 24) continue;
          c.tx = tx; c.ty = ty; ok = true; break;
        }
        if (!ok) { c.t = 0.4 + Math.random(); continue; }
        if (Math.abs(c.tx - c.x) > 8) c.dir = c.tx > c.x ? 1 : -1; // mini kaymada yönü koru
        c.state = 'walk';
      }
    } else {
      // çapraz yürüyüş — civcivler hem yatay hem dikey seyirtir
      const dx = c.tx - c.x, dy = c.ty - c.y;
      const dist = Math.hypot(dx, dy) || 1;
      const step = 55 * dt;
      if (dist <= step + 1) {
        c.x = c.tx; c.y = c.ty; c.state = 'idle'; c.t = 0.5 + Math.random() * 1.8;
      } else {
        const nx = c.x + dx / dist * step, ny = c.y + dy / dist * step;
        // silo şeridine çarparsa durur — tavuklar gibi üstüne çıkamaz
        const hit = [L.FEED, L.WATER].some(t => !inSilo(c.x, c.y, t) && inSilo(nx, ny, t));
        if (hit) { c.state = 'idle'; c.t = 0.5 + Math.random(); }
        else {
          c.x = nx; c.y = ny;
          c.frame = (Math.floor(c.frameT * 10) % 2) ? 'a' : 'b';
        }
      }
    }
  }

  // süresi dolan civciv tavuğa dönüşür (çoğu beyaz, ara sıra cins)
  for (let i = S.chicks.length - 1; i >= 0; i--) {
    const c = S.chicks[i];
    if (c.growT > 0) continue;
    S.chicks.splice(i, 1);
    const r = Math.random();
    spawnChicken(c.x, c.y, r < 0.7 ? 'white' : r < 0.95 ? 'brown' : 'black');
    for (let k = 0; k < 4; k++) {
      S.parts.push({ kind: 'feather', x: c.x + (Math.random() - .5) * 14, y: c.y - 12,
        vx: (Math.random() - .5) * 40, vy: -30 - Math.random() * 30, t: 0, life: 1 });
    }
    S.parts.push({ kind: 'text', text: '+1 Tavuk', x: c.x - 16, y: c.y - 26,
      vy: -28, t: 0, life: 1.1, color: '#9fe870' });
    sndCluck();
  }
}
