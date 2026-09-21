// Ortam olayları: yaz yağmuru (kaynak tasarrufu + tavuklar kümes altına
// sığınır) ve yakalanabilir altın kelebek (tıkla → para ödülü).
import { S } from '../state.js';
import { L, fmt } from '../config.js';
import { eggValue } from '../economy.js';
import { sndCoin } from '../audio.js';

let rainT = 150 + Math.random() * 150; // ilk yağmur
let flyT = 70 + Math.random() * 60;    // ilk kelebek

export function updateEvents(dt) {
  // yaz yağmuru döngüsü
  if (S.rain) {
    S.rain.t -= dt;
    if (S.rain.t <= 0) { S.rain = null; rainT = 220 + Math.random() * 160; }
  } else {
    rainT -= dt;
    if (rainT <= 0) S.rain = { t: 32 + Math.random() * 16 };
  }

  // altın kelebek — çiftlik sağından girer, salınarak sola süzülür
  if (!S.butterfly) {
    flyT -= dt;
    if (flyT <= 0 && S.eggsSold > 3) {
      S.butterfly = { x: L.FX - 40, t: 0, seed: Math.random() * 9,
        y: L.PEN.y + 70 + Math.random() * (L.PEN.h - 170) };
    }
  } else {
    const b = S.butterfly;
    b.t += dt;
    b.x -= 55 * dt;
    b.y += Math.sin(b.t * 2.3 + b.seed) * 34 * dt;
    if (b.x < -40) { S.butterfly = null; flyT = 75 + Math.random() * 85; }
  }
}

// kelebek yakalama — tıklanınca para + altın zerre
export function catchButterfly() {
  const b = S.butterfly;
  if (!b) return;
  const v = Math.max(15, Math.round(eggValue() * 8));
  S.money += v; S.stats.earned += v;
  S.stats.butter = (S.stats.butter || 0) + 1;
  for (let i = 0; i < 7; i++)
    S.parts.push({ kind: 'coin', x: b.x + (Math.random() - .5) * 14, y: b.y + (Math.random() - .5) * 10,
      vx: (Math.random() - .5) * 90, vy: -60 - Math.random() * 60, t: 0, life: 0.7 });
  S.parts.push({ kind: 'text', text: '+$' + fmt(v), x: b.x, y: b.y - 16,
    vy: -30, t: 0, life: 1, color: '#ffd23e' });
  sndCoin();
  S.butterfly = null;
  flyT = 80 + Math.random() * 80;
}
