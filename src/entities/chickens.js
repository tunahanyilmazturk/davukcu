// Tavuklar: üretim, gezinme ve yumurtlama yapay zekası.
// Animasyon sistemi: davranış → koreografi (ANIMS adım listeleri) →
// prosedürel ofsetler (chickenPose). Kare geçişleri zaman çizelgesiyle
// yönetilir; render tarafı sadece pozu okur.
import { S } from '../state.js';
import { L } from '../config.js';
import { layInterval, BREEDS, roosterBoost } from '../economy.js';
import { CHICKEN_VARIANTS } from '../sprites/index.js';
import { layEgg } from './eggs.js';
import { tickManure } from './manure.js';

// ---- animasyon koreografileri: [kare, süre-sn] adım listeleri ----
// loop=true döner; aksi halde bitince 'idle'a düşer ve stepAnim true döner
const ANIMS = {
  idle:  { loop: true, seq: [['a', 1]] },
  walk:  { loop: true, seq: [['b', .13], ['b2', .13]] },
  // gaga vurma: ön-eğilme → iki hızlı vuruş → doğrulma
  peck:  { seq: [['d', .09], ['c', .12], ['d', .05], ['c', .12], ['d', .08], ['a', .05]] },
  // yemlikte yeme: daha yavaş ve tekrarlı
  eat:   { loop: true, seq: [['d', .15], ['c', .17], ['d', .09], ['c', .17], ['d', .11]] },
  squat: { loop: true, seq: [['e', 1]] },   // yumurtlama çökmesi
  flap:  { loop: true, seq: [['f', .12]] }, // zıplama / sürüklenme paniği
};
// davranış durumu → animasyon eşlemesi
const STATE_ANIM = { idle: 'idle', peck: 'peck', eat: 'eat', walk: 'walk', toTrough: 'walk' };

const HOP_T = 0.42;   // sevilince zıplama süresi (input.js pet() kullanır)
const TURN_T = 0.09;  // yön değişiminde kısa ezilme
const LAND_T = 0.14;  // iniş ezilmesi
export { HOP_T };

// rastgele spawn havuzu — yumurtlamayanlar (horoz) hariç
const VARIANT_KEYS = Object.keys(CHICKEN_VARIANTS)
  .filter(k => (BREEDS[k] || {}).lays !== false);

export function spawnChicken(x, y, breed) {
  const P = L.PEN;
  // cins verilmezse rastgele (görsel çeşitlilik); mağaza kartları cinsi belirtir
  breed = breed || VARIANT_KEYS[Math.floor(Math.random() * VARIANT_KEYS.length)];
  const b = BREEDS[breed] || BREEDS.white;
  let sx = x !== undefined ? x : P.x + 40 + Math.random() * (P.w - 80);
  let sy = y !== undefined ? y : P.y + 60 + Math.random() * (P.h - 80);
  // dekor engelleri içinde doğma — kümes/gölet üstüne spawn olmasın
  for (let i = 0; i < 8 && posBlocked(sx, sy); i++) {
    sx = P.x + 40 + Math.random() * (P.w - 80);
    sy = P.y + 60 + Math.random() * (P.h - 80);
  }
  S.chickens.push({
    x: sx, y: sy,
    tx: 0, ty: 0, state: 'idle', t: Math.random() * 2,
    layT: b.lays === false ? Infinity : layInterval() * b.layRate * (0.4 + Math.random() * 0.8),
    dir: Math.random() < 0.5 ? 1 : -1,
    frame: 'a', frameT: Math.random() * 4, // faz kayması — toplu spawn senkron görünmesin
    anim: 'idle', animT: Math.random(), animI: 0,
    turnT: 0, landT: 0,
    variant: breed, breed,
    hop: 0, squat: 0, drag: false,
  });
}

// animasyon geçişi — yeni animasyonsa adım sayacını sıfırlar
function setAnim(ch, name) {
  if (ch.anim === name) return;
  ch.anim = name; ch.animT = 0; ch.animI = 0;
}
// adım çizelgesini ilerletir; biten doğrusal animasyonda true döner
function stepAnim(ch, dt) {
  const a = ANIMS[ch.anim];
  ch.animT += dt;
  while (ch.animT >= a.seq[ch.animI][1]) {
    ch.animT -= a.seq[ch.animI][1];
    if (++ch.animI >= a.seq.length) {
      if (a.loop) ch.animI = 0;
      else { setAnim(ch, 'idle'); return true; }
    }
  }
  ch.frame = a.seq[ch.animI][0];
  return false;
}

// silo şeridi: tank gövdesi yüksekliğinde (y < taban+8) içine girilmez;
// altından/önünden geçmek serbest — tavuk yemliğin üstüne çıkamaz
export function inSilo(x, y, t) {
  return y < t.y + t.h + 8 && x > t.x - 12 && x < t.x + t.w + 12;
}
// gübre kovası + çuval istifi de kümes üst kenarında — silo gibi davranır;
// kümes ve rüzgar gülü de üst-ankrajlı bina: arkasına/üstüne çıkılmaz
function blockedZones() {
  return [L.FEED, L.WATER, L.MANURE_BIN,
          { ...L.BAG_STACK, w: 96, h: 30, y: L.BAG_STACK.y - 30 },
          L.COOP, L.MILL];
}
// zemin engelleri — orta alandaki dekorlar, her yönden geçilmez
function groundZones() {
  return [{ x: L.POND.x - 8, y: L.POND.y - 8, w: L.POND.w + 16, h: L.POND.h + 16 },
          { x: L.HAY.x - 4, y: L.HAY.y - 4, w: L.HAY.w + 8, h: L.HAY.h + 8 }];
}
export function inRect(x, y, r) {
  return x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
}
export function inGroundZone(x, y) {
  return groundZones().some(r => inRect(x, y, r));
}
// civcivler ve hedef seçimi için birleşik kontrol
export function posBlocked(x, y) {
  return blockedZones().some(t => inSilo(x, y, t)) || inGroundZone(x, y);
}
function siloBlocked(ch, nx, ny) {
  for (const t of blockedZones()) {
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
    if (posBlocked(tx, ty)) continue;
    if (Math.hypot(tx - ch.x, ty - ch.y) < 60) continue;
    ch.tx = tx; ch.ty = ty;
    return true;
  }
  return false;
}
// ufak yatay kaymalarda yönü koru — tavuk sağa-sola dönmez;
// gerçek dönüşte kısa ezilme animasyonu tetiklenir
function faceTarget(ch) {
  if (Math.abs(ch.tx - ch.x) <= 8) return;
  const nd = ch.tx > ch.x ? 1 : -1;
  if (nd !== ch.dir) { ch.dir = nd; ch.turnT = TURN_T; }
}

// fed: tavuklar tok/sulu mu (yem+su > 0) — değilse yumurtlama durur
export function updateChickens(dt, fed) {
  const P = L.PEN;
  for (const ch of S.chickens) {
    if (ch.stolen) continue; // tilki ağzında — konum tilki tarafından taşınır
    if (ch.drag) {
      // sürüklenirken panik: kanat çırpma
      ch.frameT += dt;
      setAnim(ch, 'flap'); stepAnim(ch, dt);
      continue;
    }
    if (ch.panicT > 0) {
      // tilki paniği — hızla tilkiden uzağa kaç, kanat çırp
      ch.panicT -= dt;
      const f = S.fox;
      if (f) {
        const dx = ch.x - f.x, dy = ch.y - f.y, d = Math.hypot(dx, dy) || 1;
        const sp = 95 * dt;
        const nx = ch.x + dx / d * sp, ny = ch.y + dy / d * sp;
        ch.x = Math.max(P.x + 12, Math.min(P.x + P.w - 12, nx));
        ch.y = Math.max(P.y + 26, Math.min(P.y + P.h, ny));
        ch.dir = dx < 0 ? -1 : 1;
      }
      setAnim(ch, 'flap'); stepAnim(ch, dt);
      continue;
    }
    if (ch.alertT > 0) {
      // horoz alarmı — tilkiye dönük, kanatları açmış nöbette dur
      ch.alertT -= dt;
      if (S.fox) ch.dir = S.fox.x > ch.x ? 1 : -1;
      setAnim(ch, 'flap'); stepAnim(ch, dt);
      continue;
    }
    ch.t -= dt; ch.frameT += dt;
    tickManure(ch, dt); // gübre yığını bırakma sayacı
    if (ch.hop > 0) { ch.hop -= dt; if (ch.hop <= 0) ch.landT = LAND_T; }
    if (ch.landT > 0) ch.landT -= dt;
    if (ch.squat > 0) ch.squat -= dt;
    if (ch.petCd > 0) ch.petCd -= dt; // Sevgi Eli aralığı
    if (ch.turnT > 0) ch.turnT -= dt;

    if (ch.state === 'idle') {
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
        } else if (S.rain && roll < 0.62) {
          // yağmurda gaga vurma yerine kümes saçağının altına sığın
          ch.tx = L.COOP.x + 12 + Math.random() * (L.COOP.w - 24);
          ch.ty = L.COOP.y + L.COOP.h + 24 + Math.random() * 18;
          faceTarget(ch);
          ch.state = 'walk';
        } else if (roll < 0.62) {
          // gaga vurma — koreografi bitince idle'a döner
          ch.state = 'peck';
        } else if (pickWander(ch, P)) {
          faceTarget(ch);
          ch.state = 'walk';
        } else {
          ch.t = 0.5 + Math.random(); // uygun hedef yok — yerinde kal
        }
      }
    } else if (ch.state === 'peck' || ch.state === 'eat') {
      // yerken küçük kırıntı/damla efekti
      if (ch.state === 'eat' && Math.random() < dt * 3) {
        S.parts.push({ kind: ch.trough === 'water' ? 'drop' : 'spark',
          x: ch.x + (Math.random() - .5) * 16, y: ch.y - 4,
          vy: ch.trough === 'water' ? 60 : -20, t: 0, life: .35 });
      }
      if (ch.state === 'eat' && ch.t <= 0) { ch.state = 'idle'; ch.t = 0.4 + Math.random() * 2; }
    } else { // walk / toTrough
      const dx = ch.tx - ch.x, dy = (ch.ty !== undefined ? ch.ty : ch.y) - ch.y;
      const dist = Math.hypot(dx, dy) || 1;
      const step = 36 * dt;
      if (dist <= step + 1) {
        ch.x = ch.tx; ch.y = ch.ty;
        if (ch.state === 'toTrough') {
          ch.state = 'eat'; ch.t = 1.1 + Math.random() * 0.8;
          const t = ch.trough === 'feed' ? L.FEED : L.WATER;
          const nd = t.x + t.w / 2 > ch.x ? 1 : -1; // depoya dönük yer/içer
          if (nd !== ch.dir) { ch.dir = nd; ch.turnT = TURN_T; }
        } else {
          ch.state = 'idle'; ch.t = 0.8 + Math.random() * 2.6;
        }
      } else {
        let nx = ch.x + dx / dist * step;
        let ny = ch.y + dy / dist * step;
        if (siloBlocked(ch, nx, ny)) nx = ch.x; // silo şeridi — dikey kayıp kenarından geçer
        // gölet/balya gibi zemin engelleri — iki eksende de geçiş yok
        if (!inGroundZone(ch.x, ch.y) && inGroundZone(nx, ny)) { nx = ch.x; ny = ch.y; }
        ch.stuck = Math.hypot(nx - ch.x, ny - ch.y) < step * 0.35 ? (ch.stuck || 0) + dt : 0;
        if (ch.stuck > 1.2) { ch.stuck = 0; ch.state = 'idle'; ch.t = 0.4 + Math.random(); }
        ch.x = nx; ch.y = ny;
      }
    }

    // animasyon önceliği: zıplama > çökme > durum
    if (ch.hop > 0) setAnim(ch, 'flap');
    else if (ch.squat > 0) setAnim(ch, 'squat');
    else setAnim(ch, STATE_ANIM[ch.state] || 'idle');
    const done = stepAnim(ch, dt);
    if (done && ch.state === 'peck') { ch.state = 'idle'; ch.t = 0.4 + Math.random() * 1.6; }

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

// ---- görsel poz: render tarafının okuduğu tek çıktı ----
// Kareyi ve prosedürel ofsetleri döndürür; durum değiştirmez.
export function chickenPose(ch) {
  const P = { f: ch.frame, bob: 0, lift: 0, lean: 0, sx: 1, sy: 1 };
  if (ch.drag) { // sürüklenme paniği — kanat çırpar, havada sallanır
    P.bob = Math.sin(ch.frameT * 16) * 2.2;
    P.lean = -ch.dir * 0.08;
    return P;
  }
  if (ch.hop > 0) { // sevilme zıplaması — sinus yayla
    const p = 1 - ch.hop / HOP_T;
    P.lift = -Math.sin(p * Math.PI) * 13;
    P.lean = ch.dir * Math.sin(p * Math.PI) * 0.05;
    return P;
  }
  if (ch.landT > 0) { // iniş ezilmesi — yumuşak geri yaylanma
    const k = ch.landT / LAND_T;
    P.sy = 1 - 0.14 * k; P.sx = 1 + 0.12 * k;
  }
  if (ch.squat > 0) { // yumurtlama — hafif titreme
    P.bob = Math.sin(ch.frameT * 24) * 0.5;
    return P;
  }
  if (ch.state === 'walk' || ch.state === 'toTrough') {
    // adım başına bir bob — b/b2 değişimleriyle senkron
    P.bob = -Math.abs(Math.sin(ch.animT / 0.13 * Math.PI)) * 2.2;
    P.lean = ch.dir * 0.05;
  } else {
    P.bob = Math.sin(ch.frameT * 2.3) * 0.6; // nefes alma
  }
  if (ch.turnT > 0) P.sx *= 0.84 + 0.16 * (1 - ch.turnT / TURN_T); // dönüş ezilmesi
  return P;
}
