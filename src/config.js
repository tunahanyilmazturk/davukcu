// Saha geometrisi ve oyun sabitleri.
// Dünya mantıksal olarak H=600 px yüksekliğinde; genişlik (L.W) sahne
// en/boy oranına göre değişir — computeLayout resize'da çağrılır.
export const H = 800;

export const L = { W: 660, H };

export function computeLayout(stageW, stageH) {
  const w = Math.round(Math.min(1900, Math.max(640, H * stageW / stageH)));
  L.W = w; L.H = H;
  L.HUD_H = 18;
  L.BEAM_Y = 450;
  // bölgeler: FARM = otlak/kümes (kiriş üstü), LINE = fabrika hattı (kiriş altı
  // duvar). İki alan ayrı dosyalarda çizilir — geliştirirken karışmaz.
  L.FARM = { x: 0, y: L.HUD_H, w, h: L.BEAM_Y - L.HUD_H };
  L.PEN = { x: 24, y: 54, w: w - 48, h: L.BEAM_Y - 58 }; // kümes — kirişin hemen üstüne kadar
  L.BELT_H = 14;
  L.BELT_X0 = 24; L.BELT_X1 = w - 12;
  L.BELT1_X0 = 64;              // üst bandın sol ucu — kanalın sağında, açıkta durur
  L.BELT1_Y = 494;              // çiftlik bandı (sola akar)
  L.BELT2_Y = 606;              // depolama bandı (sağa akar, kutuya)
  L.DROP_X = L.BELT1_X0 - 10;   // yumurta üst bandın sol merdanesinden dökülür
  L.BELT1_LIMIT = w - 28;       // üst bantta yumurtaların gidebileceği en sağ nokta
  L.CRATE_X = w - 86;           // paketleme kutusu sol kenarı
  L.BELT2_X1 = L.CRATE_X - 16;  // alt bandın sağ ucu — kutudan önce biter
  L.MOUTH_X = w - 52;           // kutu ağzının ortası (para yazısı konumu)
  // kutu algılama bölgesi: boxfall'da bu aralığa giren yumurta içeri düşer
  L.CRATE_ZONE = { x0: L.CRATE_X - 4, x1: w - 14, rimY: L.BELT2_Y + 6, inY: L.BELT2_Y + 22 };
  L.WASH_X = Math.round(w * 0.45) + 26; // yıkama yuvası merkezi (alt bant)
  L.GRADE_X = Math.round(w * 0.58);     // sınıflandırıcı merkezi (yıkama ile cila arası)
  L.POLISH_X = Math.round(w * 0.72);    // cila makinesi merkezi (yıkamadan sonra)
  L.FLOOR_Y = 770;
  // fabrika bandı bölgesi: kiriş altı duvar → zemin hattı
  L.LINE = { x: 0, y: L.BEAM_Y + 30, w, h: L.FLOOR_Y - L.BEAM_Y - 30 };
  L.ROAD_Y = 756;                    // lojistik yolu şeridi (en alt)
  L.DOCK_X = L.CRATE_X - 30;         // kamyonun durduğu yükleme noktası
  L.EGG_GAP = 22;
  L.WATER = { x: 28,     y: 140, w: 36, h: 200 }; // su deposu — kümesin sol kenarı, boydan boya
  L.FEED  = { x: w - 64, y: 140, w: 36, h: 200 }; // yem silosu — kümesin sağ kenarı
  // gübre toplama alanı: kümesin üst iç kenarında hazne + yanında çuval istifi
  L.MANURE_BIN = { x: Math.round(w / 2 - 30), y: L.PEN.y + 6, w: 60, h: 36 };
  L.BAG_STACK = { x: L.MANURE_BIN.x + L.MANURE_BIN.w + 10, y: L.MANURE_BIN.y + L.MANURE_BIN.h };
  return L;
}

export const BASE = { egg: 1, lay: 5.0, belt: 75, beltD: 85, golden: 0.02, rare: 0.03 };
export const MAXL = { value: 99, lay: 12, beltF: 10, beltD: 10, golden: 14, rare: 8, wash: 5, washS: 8,
                      polish: 5, polishS: 8, feedCap: 8, waterCap: 8, autoF: 4, autoW: 4, magnet: 8,
                      twin: 6, lucky: 8, saver: 5, offline: 5, rooster: 3, pack: 4,
                      hatch: 8, grow: 8, grade: 6, truck: 6, autopet: 5, scoop: 6 };

export const SAVE_KEY = 'tavukciftligi_v1';
export const MAX_CHICKENS = 80;
export const BAG_AT = 20; // gübre kovasında 1 çuvala dönüşen yığın sayısı

export function fmt(n) {
  if (n < 1000) return Math.floor(n).toString();
  const u = ['k', 'M', 'B', 'T'];
  let v = n, i = -1;
  do { v /= 1000; i++; } while (v >= 1000 && i < u.length - 1);
  return v.toFixed(v < 100 ? 1 : 0) + u[i];
}

export function fmtTime(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
