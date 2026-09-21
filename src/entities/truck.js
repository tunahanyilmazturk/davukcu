// Lojistik kamyonu: yoldan gelir, yerdeki yumurtaları + gübre çuvallarını
// toplar, giderken satar. Sv.0'da küçük kamyonet çalışır (seyrek gelir, az
// taşır); seviye arttıkça araç büyür: kamyonet → panelvan → tır.
import { S } from '../state.js';
import { L, fmt } from '../config.js';
import { truckInterval, truckCap, truckTier, manureBagValue, truckBonus } from '../economy.js';
import { eggWorth } from './eggs.js';
import { sndCoin, sndPop, sndTruck } from '../audio.js';

let timer = 8;
const FLOOR_CAP = 40; // zeminde taşabilecek yumurta üst sınırı

// sonraki araca kalan süre — iskele tabelası okur. -1 = yük bekleniyor
export function truckEta() {
  if (S.truck) return 0;
  if (S.truckOff) return -1;
  return (S.eggs.some(e => e.phase === 'floor') || S.manureBags > 0) ? timer : -1;
}

export function updateTruck(dt) {
  const lvl = S.lvl.truck;

  // zemin yığılımı sınırı — üstü eski usul sessizce satılır
  // (kamyon istatistiğine yazılmaz: trucked = sadece kamyonun taşıdığı)
  // (tahsis yok: sayaç + ilk yerde yumurta referansı yeterli)
  let floorN = 0, firstFloor = null;
  for (const e of S.eggs) {
    if (e.phase !== 'floor') continue;
    if (!firstFloor) firstFloor = e;
    floorN++;
  }
  if (floorN > FLOOR_CAP) {
    firstFloor.phase = 'gone';
    S.money += eggWorth(firstFloor);
    S.eggsSold++;
    S.stats.earned += eggWorth(firstFloor);
  }

  if (!S.truck) {
    // taşınacak şey (yerde yumurta / stokta çuval) yoksa gelmez
    // (S.truckOff: test/dev kancası — sim kamyonu durdurur)
    if (S.truckOff || (!floorN && !S.manureBags)) { timer = Math.max(1.5, timer); return; }
    timer -= dt;
    if (timer <= 0) {
      S.truck = { x: -150, state: 'arrive', cargo: 0, bags: 0, worth: 0,
                  t: 0, bob: 0, dip: 0, tier: truckTier(lvl) };
    }
    return;
  }

  const tr = S.truck;
  tr.bob += dt * 10;
  if (tr.dip > 0) tr.dip = Math.max(0, tr.dip - dt * 5);

  // hareket halinde egzoz pufu
  if (tr.state !== 'load' && Math.random() < dt * 6) {
    S.parts.push({ kind: 'smoke', x: L.FX + tr.x + 4, y: L.ROAD_Y + 18,
      vx: -30, vy: -18, t: 0, life: .6 });
  }

  if (tr.state === 'arrive') {
    tr.x += 150 * dt;
    const len = tr.tier === 2 ? 112 : tr.tier === 1 ? 86 : 64;
    const stopX = L.DOCK_X + 22 - len; // kasa/kasa ucu iskele ortasına denk gelsin
    if (tr.x >= stopX) { tr.x = stopX; tr.state = 'load'; tr.t = 0.3; sndTruck(); }
    return;
  }

  if (tr.state === 'load') {
    tr.t -= dt;
    if (tr.t > 0) return;
    const e = S.eggs.find(e => e.phase === 'floor');
    if (e && tr.cargo < truckCap(lvl)) {
      tr.cargo++;
      tr.worth += eggWorth(e);
      e.phase = 'load2';                       // kasaya uçar — updateEggs yutar
      e.tx = L.FX + tr.x + 16 + (tr.cargo % 9) * 4;
      e.ty = L.ROAD_Y + 24;
      tr.dip = 1;                              // süspansiyon oturması
      tr.t = 0.16;                             // yumurta başı yükleme süresi
      sndPop();
      return;
    }
    // gübre çuvalları: kasa dolsa da toptan yüklenir (lojistik teşviki)
    if (S.manureBags > 0) {
      S.manureBags--;
      tr.bags++;
      tr.worth += manureBagValue();
      tr.dip = 1;
      tr.t = 0.22;                             // çuval başı yükleme süresi
      S.parts.push({ kind: 'manureFly', x: L.FX + tr.x + 52, y: L.ROAD_Y + 4,
        vx: -90, vy: -50, t: 0, life: .45 });
      sndPop();
      return;
    }
    tr.state = 'leave';                        // doldu ya da taşınacak kalmadı
    return;
  }

  // leave: sağa sürer, ekrandan çıkınca toptan ödeme
  tr.x += 190 * dt;
  if (tr.x > L.W + 140) {
    if (tr.worth > 0) {
      const pay = Math.round(tr.worth * truckBonus()); // toptancı primi
      S.money += pay;
      S.eggsSold += tr.cargo;
      S.stats.earned += pay;
      S.stats.trucked += tr.cargo;
      S.stats.bags += tr.bags;
      S.parts.push({ kind: 'text', text: '+$' + fmt(pay) + ' kamyon' +
          (tr.bags ? ' (' + tr.bags + ' çuval)' : ''),
        x: L.WD.dockX - 20, y: L.ROAD_Y - 40, vy: -30, t: 0, life: 1.2, color: '#8fd8ff' });
      sndCoin();
    }
    S.truck = null;
    timer = truckInterval(lvl);
  }
}
