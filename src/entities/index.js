// Varlıklar: tavuklar, yumurtalar, kaynaklar, parçacıklar — güncelleme döngüsü
import { S } from '../state.js';
import { L } from '../config.js';
import { updateResources } from './refill.js';
import { updateChickens } from './chickens.js';
import { updateChicks } from './chicks.js';
import { updateEggs, box } from './eggs.js';
import { updateTruck } from './truck.js';
import { updateManure } from './manure.js';
import { pointer, pet, chickenAt, drag, magnet } from '../input.js';

export { spawnChicken } from './chickens.js';
export { spawnChick } from './chicks.js';
export { tryRefill } from './refill.js';
export { box };

// dünya yeniden boyutlandığında varlıkları sınırlar içinde tut
export function clampEntities() {
  const P = L.PEN;
  for (const ch of S.chickens) {
    ch.x = Math.max(P.x + 16, Math.min(P.x + P.w - 16, ch.x));
    ch.y = Math.max(P.y + 30, Math.min(P.y + P.h, ch.y));
  }
  for (const c of S.chicks) {
    c.x = Math.max(P.x + 12, Math.min(P.x + P.w - 12, c.x));
    c.y = Math.max(P.y + 30, Math.min(P.y + P.h, c.y));
  }
  for (const e of S.eggs) {
    e.x = Math.min(e.x, e.phase === 'belt1' ? L.BELT1_LIMIT : L.BELT2_X1 - 4);
  }
}

export function update(dt) {
  S.playTime += dt;

  const fed = updateResources(dt);
  updateChickens(dt, fed);

  // Sevgi Eli: imlecin üstündeki tavuk aralıklarla otomatik sevilir
  if (S.lvl.autopet > 0 && !drag.current && !magnet.active) {
    const hov = chickenAt(pointer.x, pointer.y);
    if (hov && !hov.drag && (hov.petCd || 0) <= 0) pet(hov);
  }
  updateChicks(dt);
  updateEggs(dt);
  updateTruck(dt);
  updateManure(dt);

  // kutu animasyonu
  if (box.t > 0) box.t -= dt;

  // parçacıklar (ayarlar → görsel kapalıysa üretilmez)
  if (S.fxParts) {
    for (const p of S.parts) {
      p.t += dt;
      p.x += (p.vx || 0) * dt;
      p.y += (p.vy || 0) * dt;
      if (p.kind === 'feather') { p.vy += 60 * dt; p.vx = Math.sin(p.t * 6) * 15; }
      if (p.kind === 'coin') { p.vy += 260 * dt; }
    }
    S.parts = S.parts.filter(p => p.t < p.life);
  } else if (S.parts.length) S.parts.length = 0;
}
