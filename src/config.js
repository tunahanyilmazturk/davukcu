// Saha geometrisi ve oyun sabitleri.
// Dünya iki ekranlık: sayfa 0 ÇİFTLİK (x: 0..W), sayfa 1 FABRİKA (x: W..2W).
// Kamera cam.x sayfalar arasında kayar (src/camera.js). Yükseklik H=800 sabit;
// sayfa genişliği (L.W) sahne en/boy oranına göre değişir — computeLayout
// resize'da çağrılır.
//
// Koordinat kuralı:
//   - Fabrika sayfası sabitleri (BELT*, CRATE*, WASH_X...) LOKALdir (0..W);
//     fabrika render kodları translate(-cam.x + FX) bağlamında çizilir.
//   - Varlık/fizik kodu DÜNYA koordinatı kullanır; lokal sabitlere L.FX eklenir.
//     L.WD = sık kullanılan fabrika noktalarının dünya-uzayı eşlemesi.
export const H = 800;

export const L = { W: 660, H };

export function computeLayout(stageW, stageH) {
  const w = Math.round(Math.min(1900, Math.max(640, H * stageW / stageH)));
  L.W = w; L.H = H;
  L.HUD_H = 18;
  L.FX = w;                 // fabrika sayfasının dünya x ofseti
  L.WORLD_W = w * 2;        // toplam dünya genişliği

  // ---- ÇİFTLİK sayfası (lokal = dünya, x: 0..w) ----
  L.FARM = { x: 0, y: L.HUD_H, w, h: H - L.HUD_H };
  L.PEN = { x: 24, y: 54, w: w - 48, h: 620 }; // kümes — neredeyse tam boy
  L.PEN_FLOOR = 700;        // yumurtaların sağa yuvarlandığı toprak hat
  L.WATER = { x: 28,     y: 120, w: 36, h: 320 }; // su deposu — sol kenar, boydan boya
  L.FEED  = { x: w - 64, y: 120, w: 36, h: 320 }; // yem silosu — sağ kenar
  // gübre toplama alanı: kümesin üst iç kenarında hazne + yanında çuval istifi
  L.MANURE_BIN = { x: Math.round(w / 2 - 30), y: L.PEN.y + 6, w: 60, h: 36 };
  L.BAG_STACK = { x: L.MANURE_BIN.x + L.MANURE_BIN.w + 10, y: L.MANURE_BIN.y + L.MANURE_BIN.h };
  // yumurta kanalı girişi — sağ alt köşedeki boru ağzı
  L.DUCT_IN = w - 42;       // yuvarlanan yumurtanın boruya girdiği x (çiftlik)
  L.DUCT_Y = 692;           // zemin seviyesindeki boru hattı

  // ---- FABRİKA sayfası (LOKAL koordinatlar, x: 0..w) ----
  L.BEAM_Y = 44;            // fabrika tavan kirişi (sayfa üstü)
  L.LINE = { x: 0, y: 66, w, h: 640 }; // fabrika duvarı bölgesi
  L.BELT_H = 14;
  L.BELT_X0 = 24; L.BELT_X1 = w - 12;
  L.BELT1_X0 = 64;              // üst bandın sol ucu — kanalın sağında, açıkta durur
  L.BELT1_Y = 330;              // çiftlik bandı (sola akar)
  L.BELT2_Y = 470;              // depolama bandı (sağa akar, kutuya)
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
  L.FLOOR_Y = 700;
  L.ROAD_Y = 686;                    // lojistik yolu şeridi (en alt)
  L.DOCK_X = L.CRATE_X - 30;         // kamyonun durduğu yükleme noktası
  // yumurta kanalı (fabrika tarafı, lokal): zeminden girer, sol duvar boyunca
  // yükselir, üstten sağa koşar, üst bandın sağ ucu üstünde yumurtayı bırakır
  L.DUCT = { rx: 12,            // yükselen kolonun lokal x'i (sol duvar içi)
             top: 230,          // üst yatay hattın y'si
             outX: w - 70,      // bırakma ağzı lokal x'i (BELT1 sağ ucu üstü)
             y: 692 };          // zemin hattı (çiftlik DUCT_Y ile aynı seviye)
  L.EGG_GAP = 22;

  // ---- dünya-uzayı eşlemleri (varlık/fizik kodu için, +FX) ----
  L.WD = {
    dropX:    L.FX + L.DROP_X,
    belt1x0:  L.FX + L.BELT1_X0,
    belt1lim: L.FX + L.BELT1_LIMIT,
    beltX0:   L.FX + L.BELT_X0,
    beltX1:   L.FX + L.BELT_X1,
    belt2x1:  L.FX + L.BELT2_X1,
    crateX:   L.FX + L.CRATE_X,
    mouthX:   L.FX + L.MOUTH_X,
    washX:    L.FX + L.WASH_X,
    gradeX:   L.FX + L.GRADE_X,
    polishX:  L.FX + L.POLISH_X,
    dockX:    L.FX + L.DOCK_X,
    crateZone: { x0: L.FX + L.CRATE_ZONE.x0, x1: L.FX + L.CRATE_ZONE.x1,
                 rimY: L.CRATE_ZONE.rimY, inY: L.CRATE_ZONE.inY },
    // kanal yolu: ağız → sınır altı → yükseliş → üst hat → bırakma ağzı → bant
    duct: [[L.DUCT_IN, L.DUCT_Y], [L.FX + L.DUCT.rx, L.DUCT_Y],
           [L.FX + L.DUCT.rx, L.DUCT.top], [L.FX + L.DUCT.outX, L.DUCT.top],
           [L.FX + L.DUCT.outX, L.BELT1_Y - 34]],
  };
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
