// Kozmetik çiftlik süsleri — MAĞAZA sekmesinden satın alınır, oyun alanına
// kalıcı eklenir (kayda yazılır, prestijden etkilenmez). Etkisi yoktur;
// tamamen görsellik. Çizim src/render/decor.js'te, engel bölgeleri
// tavukların gezinti AI'sına bildirilir (chickens.js _bz).
import { L } from './config.js';
import { S } from './state.js';

// pos(): dünya koordinatında taban ortası (x,y) — resize'da yeniden hesaplanır.
// zone(z): varsa tavukların içinden geçemeyeceği taban kutusunu doldurur.
export const DECOR = {
  flowers: {
    name: 'Çiçek Tarhı', price: 150,
    desc: 'Renk renk çiçeklerle bezeli ahşap tarh',
    pos: () => [L.W * 0.30, 452],
  },
  path: {
    name: 'Taş Yol', price: 250,
    desc: 'Kümes kapısından otlak ortasına taş patika',
    pos: () => [L.COOP.x + L.COOP.w / 2 + 8, L.COOP.y + L.COOP.h + 18],
  },
  gnome: {
    name: 'Bahçe Cücesi', price: 350,
    desc: 'Gölet kenarında nöbet tutan şanslı cüce',
    pos: () => [L.POND.x + L.POND.w + 16, L.POND.y - 12],
    zone: z => { z.x = L.POND.x + L.POND.w + 8; z.y = L.POND.y - 18; z.w = 16; z.h = 14; },
  },
  lamp: {
    name: 'Bahçe Feneri', price: 450,
    desc: 'Yolu aydınlatan sıcak ışıklı demir fener',
    pos: () => [L.W * 0.52, 582],
    zone: z => { z.x = L.W * 0.52 - 6; z.y = 576; z.w = 12; z.h = 10; },
  },
  scarecrow: {
    name: 'Korkuluk', price: 550,
    desc: 'Ortalıkta dolaşıp karga kovalayan yeni bekçi',
    pos: () => [L.W * 0.70, 318],
    zone: z => { z.x = L.W * 0.70 - 8; z.y = 310; z.w = 16; z.h = 12; },
  },
  doghouse: {
    name: 'Köpek Kulübesi', price: 700,
    desc: 'Sadık dost — ara sıra kapısından kafasını çıkarır',
    pos: () => [L.COOP.x + L.COOP.w + 66, L.COOP.y + L.COOP.h + 34],
    zone: z => { const x = L.COOP.x + L.COOP.w + 66, y = L.COOP.y + L.COOP.h + 34;
                 z.x = x - 18; z.y = y - 10; z.w = 36; z.h = 16; },
  },
  duck: {
    name: 'Gölet Ördeği', price: 800,
    desc: 'Gölette keyifle yüzen sevimli ördek',
    pos: () => [L.POND.x + L.POND.w / 2, L.POND.y + L.POND.h / 2],
  },
  beehive: {
    name: 'Arı Kovanı', price: 1100,
    desc: 'Vız vız arılar çiçeklerin arasında gezinir',
    pos: () => [L.W * 0.60, 232],
    zone: z => { z.x = L.W * 0.60 - 12; z.y = 226; z.w = 24; z.h = 12; },
  },
  fountain: {
    name: 'Taş Çeşme', price: 1400,
    desc: 'Şıkır şıkır akan merkez çeşmesi',
    pos: () => [L.W * 0.40, 352],
    zone: z => { z.x = L.W * 0.40 - 20; z.y = 344; z.w = 40; z.h = 18; },
  },
  tree: {
    name: 'Büyük Meşe', price: 1800,
    desc: 'Çiftliğin gölge veren yaşlı ağacı',
    pos: () => [L.W * 0.84, 228],
    zone: z => { z.x = L.W * 0.84 - 12; z.y = 220; z.w = 24; z.h = 14; },
  },
};

// satın alınan süslerin engel bölgeleri — kalıcı rect nesneleri her çağrıda
// L'den tazelenir (resize güvenli, tik başına tahsis yok)
const _zones = [];
export function decorZones() {
  _zones.length = 0;
  for (const id of S.decor) {
    const d = DECOR[id];
    if (!d || !d.zone) continue;
    const z = d._z || (d._z = { x: 0, y: 0, w: 0, h: 0 });
    d.zone(z);
    _zones.push(z);
  }
  return _zones;
}
