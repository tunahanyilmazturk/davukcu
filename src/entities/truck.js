// Lojistik kamyonu: yoldan gelir, yerdeki yumurtaları toplar, giderken satar
import { S } from '../state.js';
import { L, fmt } from '../config.js';
import { truckInterval, truckCap } from '../economy.js';
import { eggWorth } from './eggs.js';
import { sndCoin, sndPop } from '../audio.js';

let timer = 6;
const FLOOR_CAP = 40; // zeminde taşabilecek yumurta üst sınırı

export function updateTruck(dt) {
  const lvl = S.lvl.truck;

  // zemin yığılımı sınırı — üstü eski usul sessizce satılır
  // (kamyon istatistiğine yazılmaz: trucked = sadece kamyonun taşıdığı)
  const floorEggs = S.eggs.filter(e => e.phase === 'floor');
  if (floorEggs.length > FLOOR_CAP) {
    const e = floorEggs[0];
    e.phase = 'gone';
    S.money += eggWorth(e);
    S.eggsSold++;
    S.stats.earned += eggWorth(e);
  }

  if (!S.truck) {
    // seviye yoksa ya da yerde yumurta yoksa kamyon gelmez
    if (lvl <= 0 || !floorEggs.length) { timer = Math.max(1.5, timer); return; }
    timer -= dt;
    if (timer <= 0) {
      S.truck = { x: -80, state: 'arrive', cargo: 0, worth: 0, t: 0, bob: 0 };
    }
    return;
  }

  const tr = S.truck;
  tr.bob += dt * 10;

  if (tr.state === 'arrive') {
    tr.x += 150 * dt;
    if (tr.x >= L.DOCK_X) { tr.x = L.DOCK_X; tr.state = 'load'; tr.t = 0.2; }
    return;
  }

  if (tr.state === 'load') {
    tr.t -= dt;
    if (tr.t > 0) return;
    const e = S.eggs.find(e => e.phase === 'floor');
    if (e && tr.cargo < truckCap(lvl)) {
      tr.cargo++;
      tr.worth += eggWorth(e);
      S.eggs.splice(S.eggs.indexOf(e), 1);
      tr.t = 0.16;                       // yumurta başı yükleme süresi
      S.parts.push({ kind: 'spark', x: tr.x + 6, y: L.ROAD_Y - 18, vy: -50, t: 0, life: .3 });
      sndPop();
      return;
    }
    tr.state = 'leave';                  // doldu ya da yerde yumurta kalmadı
    return;
  }

  // leave: sağa sürer, ekrandan çıkınca toptan ödeme
  tr.x += 190 * dt;
  if (tr.x > L.W + 80) {
    if (tr.worth > 0) {
      S.money += tr.worth;
      S.eggsSold += tr.cargo;
      S.stats.earned += tr.worth;
      S.stats.trucked += tr.cargo;
      S.parts.push({ kind: 'text', text: '+$' + fmt(tr.worth) + ' kamyon',
        x: L.DOCK_X - 20, y: L.ROAD_Y - 60, vy: -30, t: 0, life: 1.2, color: '#8fd8ff' });
      sndCoin();
    }
    S.truck = null;
    timer = truckInterval(lvl);
  }
}
