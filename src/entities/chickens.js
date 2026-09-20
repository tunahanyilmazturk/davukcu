// Tavuklar: üretim, gezinme ve yumurtlama yapay zekası
import { S } from '../state.js';
import { L } from '../config.js';
import { layInterval, BREEDS, roosterBoost } from '../economy.js';
import { CHICKEN_VARIANTS } from '../sprites/index.js';
import { layEgg } from './eggs.js';
import { tickManure } from './manure.js';

// rastgele spawn havuzu — yumurtlamayanlar (horoz) hariç
const VARIANT_KEYS = Object.keys(CHICKEN_VARIANTS)
  .filter(k => (BREEDS[k] || {}).lays !== false);

export function spawnChicken(x, y, breed) {
  const P = L.PEN;
  // cins verilmezse rastgele (görsel çeşitlilik); mağaza kartları cinsi belirtir
  breed = breed || VARIANT_KEYS[Math.floor(Math.random() * VARIANT_KEYS.length)];
  const b = BREEDS[breed] || BREEDS.white;
  S.chickens.push({
    x: x !== undefined ? x : P.x + 40 + Math.random() * (P.w - 80),
    y: y !== undefined ? y : P.y + 60 + Math.random() * (P.h - 80),
    tx: 0, ty: 0, state: 'idle', t: Math.random() * 2,
    layT: b.lays === false ? Infinity : layInterval() * b.layRate * (0.4 + Math.random() * 0.8),
    dir: Math.random() < 0.5 ? 1 : -1,
    frame: 'a', frameT: 0,
    variant: breed, breed,
    hop: 0, squat: 0, drag: false,
  });
}

// silo şeridi: tank gövdesi yüksekliğinde (y < taban+8) içine girilmez;
// altından/önünden geçmek serbest — tavuk yemliğin üstüne çıkamaz
export function inSilo(x, y, t) {
  return y < t.y + t.h + 8 && x > t.x - 12 && x < t.x + t.w + 12;
}
function siloBlocked(ch, nx, ny) {
  for (const t of [L.FEED, L.WATER]) {
    if (!inSilo(ch.x, ch.y, t) && inSilo(nx, ny, t)) return true;
  }
  return false;
}
// gezinme hedefi: silo şeridine düşmesin + çok yakın olmasın
// (yakın hedef = anında varış → ardı ardına yön değişimi "ters dönme" gibi görünür)
function pickWander(ch, P) {
  for (let i = 0; i < 8; i++) {
    const tx = P.x + 20 + Math.random() * (P.w - 40);
    const ty = P.y + 30 + Math.random() * (P.h - 34);
    if (inSilo(tx, ty, L.FEED) || inSilo(tx, ty, L.WATER)) continue;
    if (Math.hypot(tx - ch.x, ty - ch.y) < 60) continue;
    ch.tx = tx; ch.ty = ty;
    return true;
  }
  return false;
}
// ufak yatay kaymalarda yönü koru — tavuk sağa-sola dönmez
function faceTarget(ch) {
  if (Math.abs(ch.tx - ch.x) > 8) ch.dir = ch.tx > ch.x ? 1 : -1;
}

// fed: tavuklar tok/sulu mu (yem+su > 0) — değilse yumurtlama durur
export function updateChickens(dt, fed) {
  const P = L.PEN;
  for (const ch of S.chickens) {
    if (ch.drag) continue;
    ch.t -= dt; ch.frameT += dt;
    tickManure(ch, dt); // gübre yığını bırakma sayacı
    if (ch.hop > 0) ch.hop -= dt;
    if (ch.squat > 0) ch.squat -= dt;
    if (ch.petCd > 0) ch.petCd -= dt; // Sevgi Eli aralığı

    if (ch.state === 'idle') {
      ch.frame = 'a';
      if (ch.t <= 0) {
        const roll = Math.random();
        if (fed && roll < 0.28) {
          // yemliğe/suluğa git → silonun önünde durup yer/içer
          const t = Math.random() < 0.5 ? L.FEED : L.WATER;
          ch.trough = t === L.FEED ? 'feed' : 'water';
          ch.tx = t.x + t.w / 2 + (Math.random() - .5) * 24;
          ch.ty = t.y + t.h + 20;
          faceTarget(ch);
          ch.state = 'toTrough';
        } else if (roll < 0.62) {
          // gagını yere vurur — a/c kareleri hızlı dönüşür (baş iner kalkar)
          ch.state = 'peck'; ch.t = 0.5 + Math.random() * 0.6;
        } else if (pickWander(ch, P)) {
          faceTarget(ch);
          ch.state = 'walk';
        } else {
          ch.t = 0.5 + Math.random(); // uygun hedef yok — yerinde kal
        }
      }
    } else if (ch.state === 'peck' || ch.state === 'eat') {
      ch.frame = (Math.floor(ch.frameT * 6) % 2) ? 'c' : 'a';
      // yerken küçük kırıntı/damla efekti
      if (ch.state === 'eat' && Math.random() < dt * 3) {
        S.parts.push({ kind: ch.trough === 'water' ? 'drop' : 'spark',
          x: ch.x + (Math.random() - .5) * 16, y: ch.y - 4,
          vy: ch.trough === 'water' ? 60 : -20, t: 0, life: .35 });
      }
      if (ch.t <= 0) { ch.state = 'idle'; ch.t = 0.4 + Math.random() * 2; }
    } else { // walk / toTrough
      const dx = ch.tx - ch.x, dy = (ch.ty !== undefined ? ch.ty : ch.y) - ch.y;
      const dist = Math.hypot(dx, dy) || 1;
      const step = 36 * dt;
      if (dist <= step + 1) {
        ch.x = ch.tx; ch.y = ch.ty;
        if (ch.state === 'toTrough') {
          ch.state = 'eat'; ch.t = 1.1 + Math.random() * 0.8;
          const t = ch.trough === 'feed' ? L.FEED : L.WATER;
          ch.dir = t.x + t.w / 2 > ch.x ? 1 : -1; // depoya dönük yer/içer
        } else {
          ch.state = 'idle'; ch.t = 0.8 + Math.random() * 2.6;
        }
      } else {
        let nx = ch.x + dx / dist * step;
        const ny = ch.y + dy / dist * step;
        if (siloBlocked(ch, nx, ny)) nx = ch.x; // silo şeridi — dikey kayıp kenarından geçer
        ch.stuck = Math.hypot(nx - ch.x, ny - ch.y) < step * 0.35 ? (ch.stuck || 0) + dt : 0;
        if (ch.stuck > 1.2) { ch.stuck = 0; ch.state = 'idle'; ch.t = 0.4 + Math.random(); }
        ch.x = nx; ch.y = ny;
        ch.frame = (Math.floor(ch.frameT * 8) % 2) ? 'a' : 'b';
      }
    }
    const canLay = (BREEDS[ch.breed] || BREEDS.white).lays !== false;
    if (fed && canLay) {
      ch.layT -= dt * roosterBoost(); // horozlar tüm tavukları hızlandırır
      if (ch.layT <= 0) {
        layEgg(ch);
        const rate = (BREEDS[ch.breed] || BREEDS.white).layRate;
        ch.layT = layInterval() * rate * (0.75 + Math.random() * 0.5);
      }
    } else if (!fed && canLay) {
      ch.layT = Math.min(ch.layT, 0.8); // aç/susuz — dolumdan hemen sonra devam etsin
    }
  }
}
