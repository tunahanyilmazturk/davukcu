// Kozmetik çiftlik süsleri — MAĞAZA sekmesinden satın alınır, oyun alanına
// kalıcı eklenir (kayda yazılır, prestijden etkilenmez). Etkisi yoktur;
// tamamen görsellik. Çizim src/render/decor.js'te, engel bölgeleri
// tavukların gezinti AI'sına bildirilir (chickens.js _bz).
import { L } from './config.js';
import { S } from './state.js';

// Çiftlik manzarası — MAĞAZA sekmesinden satın alınır, arsasına kalıcı
// dikilir (kayda yazılır, prestijden etkilenmez). Statik öğeler dünya
// arka planına işlenir (world/farm.js SCEN_DRAW); hareketli parçalar
// (değirmen kanatları, bayrak kumaşı, gölet dalgası) ambient katmanında
// sahiplikle kapılıdır. Sahipsiz arsada "SATILIK" tabelası görünür.
// view(): mağaza önizlemesi için dünya kırpma kutusu [x,y,w,h];
// sign(): satılık tabelasının tahta sol-üst köşesi.
export const SCENERY = {
  hay: {
    name: 'Saman Balyası', price: 180,
    desc: 'Gıcır gıcır sarı saman — otlakta klasik dokunuş',
    view: () => [L.HAY.x - 34, L.HAY.y - 44, 100, 96],
    sign: () => [L.HAY.x - 30, L.HAY.y + L.HAY.h + 10],
  },
  coop: {
    name: 'Kırmızı Kümes', price: 350,
    desc: 'Tavukların yuvası — rampalı kapı, yuvalık ve ayçiçekleriyle',
    view: () => [L.COOP.x - 16, L.COOP.y - 52, L.COOP.w + 48, L.COOP.h + 72],
    sign: () => [L.COOP.x + L.COOP.w / 2 - 16, L.COOP.y + L.COOP.h + 24],
  },
  pond: {
    name: 'Gölet', price: 550,
    desc: 'Nilüferli, kamışlı serinletici gölet — dalgaları canlıdır',
    view: () => [L.POND.x - 18, L.POND.y - 34, L.POND.w + 36, L.POND.h + 44],
    sign: () => [L.POND.x + L.POND.w / 2 - 23, L.POND.y - 22],
  },
  flag: {
    name: 'Türk Bayrağı', price: 750,
    desc: 'Dalgalanan ay-yıldız — çiftliğin gururu',
    view: () => [L.FLAG.x - 26, L.FLAG.y + L.FLAG.h - 118, 70, 124],
    sign: () => [L.FLAG.x - 14, L.FLAG.y + L.FLAG.h - 4],
  },
  wheat: {
    name: 'Buğday Tarlası', price: 900,
    desc: 'Başak sıraları ve korkuluklu altın sarısı tarla',
    view: () => [L.WHEAT.x - 10, L.WHEAT.y - 48, L.WHEAT.w + 20, L.WHEAT.h + 56],
    sign: () => [L.WHEAT.x + L.WHEAT.w / 2 - 23, L.WHEAT.y - 20],
  },
  mill: {
    name: 'Rüzgar Değirmeni', price: 1600,
    desc: 'Dönen kanatlı ahşap değirmen kulesi',
    view: () => [L.MILL.x - 26, L.MILL.y - 32, L.MILL.w + 52, L.MILL.h + 38],
    sign: () => [L.MILL.x + L.MILL.w / 2 - 23, L.MILL.y + L.MILL.h + 8],
  },
};

// pos(): dünya koordinatında taban ortası (x,y) — resize'da yeniden hesaplanır.
// zone(z): varsa tavukların içinden geçemeyeceği taban kutusunu doldurur.
// req: varsa o manzara satın alınmadan kilitli kalır (ördek göletsiz olmaz).
export const DECOR = {
  flowers: {
    name: 'Çiçek Tarhı', price: 150,
    desc: 'Renk renk çiçeklerle bezeli ahşap tarh',
    pos: () => [L.W * 0.30, 452],
  },
  path: {
    name: 'Taş Yol', price: 250, req: 'coop',
    desc: 'Kümes kapısından otlak ortasına taş patika',
    pos: () => [L.COOP.x + L.COOP.w / 2 + 8, L.COOP.y + L.COOP.h + 18],
  },
  gnome: {
    name: 'Bahçe Cücesi', price: 350, req: 'pond',
    desc: 'Gölet kenarında nöbet tutan şanslı cüce',
    pos: () => [L.POND.x + L.POND.w + 16, L.POND.y - 12],
    zone: z => { z.x = L.POND.x + L.POND.w + 8; z.y = L.POND.y - 18; z.w = 16; z.h = 14; },
  },
  lamp: {
    name: 'Bahçe Feneri', price: 450,
    desc: 'Yolu aydınlatan sıcak ışıklı demir fener',
    pos: () => [L.W * 0.45, 470],
    zone: z => { z.x = L.W * 0.45 - 6; z.y = 464; z.w = 12; z.h = 10; },
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
    name: 'Gölet Ördeği', price: 800, req: 'pond',
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
