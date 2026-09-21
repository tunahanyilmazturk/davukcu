// Oyun durumu + localStorage kaydı
import { SAVE_KEY } from './config.js';

export const S = {
  money: 0,
  lvl: { value: 0, lay: 0, beltF: 0, beltD: 0, golden: 0, rare: 0, wash: 0, washS: 0,
         polish: 0, polishS: 0, feedCap: 0, waterCap: 0, autoF: 0, autoW: 0, magnet: 0,
         twin: 0, lucky: 0, saver: 0, offline: 0, rooster: 0, pack: 0, hatch: 0, grow: 0,
         grade: 0, truck: 0, autopet: 0, scoop: 0,
         gene: 0, dealer: 0, organic: 0, fertile: 0, supply: 0, bargain: 0 },
  feed: 100,
  water: 100,
  eggsSold: 0,
  playTime: 0,
  prestige: 0,      // Altın Yem sayısı — her biri kalıcı +%12 yumurta değeri
  prestigeBase: 0,  // son prestijdeki toplam kazanç (bir sonraki ⭐ eşiği buradan ölçülür)
  questIdx: 0,      // görev zincirindeki konum
  muted: false,   // ses efektleri kapalı
  music: true,    // ambient müzik
  volume: 1,      // ana ses seviyesi 0..1
  fxParts: true,  // parçacık efektleri (kalp, tüy, para...)
  fxAmbient: true,// ortam efektleri (kelebek, toz)
  fxHints: true,  // ipucu balonları
  showFps: true,  // üst barda FPS göstergesi
  stats: { earned: 0, golden: 0, rare: 0, washed: 0, polished: 0, pets: 0, bought: 0, sold: 0, fills: 0, upg: 0, trucked: 0, manure: 0, bags: 0 },
  achv: {},       // açılan başarım id'leri
  chickens: [],
  chicks: [],
  eggs: [],
  manures: [],    // kümesdeki gübre yığınları (kaydedilmez)
  manureBin: 0,   // gübre kovasındaki yığın sayısı (BAG_AT'te 1 çuval olur)
  manureBags: 0,  // kamyonun satacağı gübre çuvalı stoğu
  truck: null,
  parts: [],
};

export let lastSaveAt = 0; // son başarılı kayıt zamanı (ayarlar modalı gösterir)

export function writeSave() {
  lastSaveAt = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      money: S.money, lvl: S.lvl, chickens: S.chickens.map(c => c.breed || 'white'),
      chicks: S.chicks.map(c => Math.round(c.growT * 10) / 10), // kalan büyüme süreleri
      feed: S.feed, water: S.water,
      manureBin: S.manureBin, manureBags: S.manureBags,
      eggsSold: S.eggsSold, playTime: S.playTime, muted: S.muted,
      prestige: S.prestige, prestigeBase: S.prestigeBase, questIdx: S.questIdx,
      music: S.music, volume: S.volume,
      fxParts: S.fxParts, fxAmbient: S.fxAmbient, fxHints: S.fxHints, showFps: S.showFps,
      stats: S.stats, achv: S.achv, lastSeen: Date.now(),
    }));
  } catch (e) {}
}

export function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

// Kayıt verisini S'ye uygular; {breeds, lastSeen} döner
export function applySave(d) {
  S.money = d.money || 0;
  S.lvl = Object.assign({ value: 0, lay: 0, beltF: 0, beltD: 0, golden: 0, rare: 0, wash: 0, washS: 0,
                          polish: 0, polishS: 0, feedCap: 0, waterCap: 0, autoF: 0, autoW: 0, magnet: 0,
                          twin: 0, lucky: 0, saver: 0, offline: 0, rooster: 0, pack: 0,
                          hatch: 0, grow: 0, grade: 0, truck: 0, autopet: 0, scoop: 0,
                          gene: 0, dealer: 0, organic: 0, fertile: 0, supply: 0, bargain: 0 }, d.lvl || {});
  // eski kayıtlardaki tek 'belt' seviyesini iki banda da taşı
  if (d.lvl && 'belt' in d.lvl) {
    if (!d.lvl.beltF) S.lvl.beltF = d.lvl.belt;
    if (!d.lvl.beltD) S.lvl.beltD = d.lvl.belt;
    delete S.lvl.belt;
  }
  S.eggsSold = d.eggsSold || 0;
  S.playTime = d.playTime || 0;
  S.muted = !!d.muted;
  S.music = d.music !== undefined ? !!d.music : !d.muted; // eski kayıt: kapalı ses → müzik de kapalı
  S.volume = d.volume !== undefined ? +d.volume : 1;
  S.fxParts = d.fxParts !== false;
  S.fxAmbient = d.fxAmbient !== false;
  S.fxHints = d.fxHints !== false;
  S.showFps = d.showFps !== false;
  S.feed  = d.feed  !== undefined ? d.feed  : 100;
  S.water = d.water !== undefined ? d.water : 100;
  S.manureBin  = d.manureBin  || 0;   // eski kayıt: kova/çuval yoksa sıfır
  S.manureBags = d.manureBags || 0;
  S.prestige = d.prestige || 0;
  S.prestigeBase = d.prestigeBase || 0;
  S.questIdx = d.questIdx || 0;
  S.stats = Object.assign({ earned: 0, golden: 0, rare: 0, washed: 0, polished: 0, pets: 0, bought: 0, sold: 0, fills: 0, upg: 0, trucked: 0, manure: 0, bags: 0 }, d.stats || {});
  S.achv = Object.assign({}, d.achv || {});
  // tavuklar cins listesi olarak saklanır; eski kayıtlarda sadece sayı var
  const breeds = Array.isArray(d.chickens)
    ? d.chickens.slice(0, 80)
    : new Array(Math.max(1, Math.min(80, d.chickens || 1))).fill('white');
  if (!breeds.length) breeds.push('white');
  // civcivler kalan büyüme süreleriyle saklanır
  const chickTimes = Array.isArray(d.chicks) ? d.chicks.slice(0, 20) : [];
  return { breeds, chickTimes, lastSeen: d.lastSeen || Date.now() };
}

export function resetSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}
