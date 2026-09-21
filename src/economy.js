// Ekonomi: seviyelerden türetilen değerler (parametre verilmezse mevcut seviye)
import { S } from './state.js';
import { BASE, BAG_AT, DIFFS } from './config.js';

// zorluk çarpanları — S.diff anahtarına göre DIFFS'ten okunur
export function diffDef()     { return DIFFS[S.diff] || DIFFS.std; }
export function diffEarn()    { return diffDef().earn; }
export function diffPrice()   { return diffDef().price; }
export function diffConsume() { return diffDef().consume; }
export function diffFox()     { return diffDef().fox; }

// tavuk cinsleri: layRate = yumurtlama süresi çarpanı (küçük = hızlı),
// rare/gold = yumurta başına ek şans, val = yumurta değer çarpanı
export const BREEDS = {
  white: { name: 'Tavuk',       costMult: 1,   layRate: 1,    rare: 0,    gold: 0,    val: 1 },
  brown: { name: 'Esmer Tavuk', costMult: 2.2, layRate: 0.72, rare: 0,    gold: 0,    val: 1 },
  black: { name: 'Kara Tavuk',  costMult: 3,   layRate: 1.1,  rare: 0.08, gold: 0.03, val: 1 },
  gold:  { name: 'Altın Tavuk', costMult: 7,   layRate: 1.25, rare: 0.05, gold: 0.08, val: 2 },
  // horoz: yumurtlamaz; kümesde gezer ve diğer tavukları hızlandırır (pasif aura)
  rooster: { name: 'Horoz',      costMult: 4,   layRate: 1,    rare: 0,    gold: 0,    val: 1, lays: false },
};

// prestij: her Altın Yem kalıcı +%12 yumurta değeri
export function prestMult()                    { return 1 + 0.12 * S.prestige; }
// sıfırlamada kazanılacak Altın Yem: son prestijden bu yana kazanç, √ ölçekli
export function prestGain() {
  return Math.floor(Math.sqrt(Math.max(0, S.stats.earned - S.prestigeBase) / 40000));
}
// Organik Sertifika: tüm yumurta (ve dolayısıyla gübre) değerine çarpan
export function organicMult(l = S.lvl.organic) { return 1 + 0.12 * l; }
export function eggValue(l = S.lvl.value)      { return Math.round((BASE.egg + l) * prestMult() * organicMult() * diffEarn()); }
export function layInterval(l = S.lvl.lay)     { return Math.max(0.7, BASE.lay * Math.pow(0.88, l)); }
// bantlar Sv.0'da da çalışır ama çok yavaş (%25) — yükseltme tam hıza çıkarır
export function farmBeltSpeed(l = S.lvl.beltF) { return BASE.belt * (l > 0 ? Math.pow(1.25, l) : 0.25); }   // üst bant
export function depoBeltSpeed(l = S.lvl.beltD) { return BASE.beltD * (l > 0 ? Math.pow(1.22, l) : 0.25); }  // alt bant
export function goldenChance(l = S.lvl.golden) { return Math.min(0.25, BASE.golden + 0.015 * l); }

// yumurta nadirlik katmanları: mult = değer çarpanı, pop = para yazısı rengi
export const TIERS = {
  normal:  { mult: 1,  pop: '#9fe870' },
  bronze:  { mult: 2,  pop: '#e8a860' },
  silver:  { mult: 4,  pop: '#b8d0f0' },
  gold:    { mult: 10, pop: '#ffd23e' },
  diamond: { mult: 20, pop: '#7df0ff' },
};

export function rareChance(l = S.lvl.rare) { return Math.min(0.30, BASE.rare + 0.04 * l); } // bronz/gümüş/elmas havuzu

// sınıflandırıcı: geçen yumurtanın katmanını bir üste çıkarma şansı
export const NEXT_TIER = { normal: 'bronze', bronze: 'silver', silver: 'gold', gold: 'diamond', diamond: null };
export const TIER_TR = { bronze: 'BRONZ', silver: 'GÜMÜŞ', gold: 'ALTIN', diamond: 'ELMAS' };
export function gradeChance(l = S.lvl.grade) { return 0.06 * l; }

export function rollTier(rareBonus = 0, goldBonus = 0) {
  const r = Math.random(), g = goldenChance() + goldBonus, rc = rareChance() + rareBonus;
  if (r < g) return 'gold';
  if (r < g + rc) {
    const rr = Math.random();
    if (S.lvl.rare >= 3 && rr < 0.08) return 'diamond';
    return rr < 0.35 ? 'silver' : 'bronze';
  }
  return 'normal';
}

// nadir havuzundaki beklenen çarpan (elmas Sv.3+ açılır)
function rareAvg(l = S.lvl.rare) {
  const d = l >= 3 ? 0.08 : 0, s = 0.35 - d, b = 1 - d - s;
  return b * TIERS.bronze.mult + s * TIERS.silver.mult + d * TIERS.diamond.mult;
}
export function washMult(l = S.lvl.wash)       { return 1 + 0.4 * l; } // yıkanmış yumurta çarpanı
export function washTime(l = S.lvl.washS)      { return Math.max(0.12, 0.38 * Math.pow(0.85, l)); } // istasyon süresi
// cila makinesi: yıkanmış yumurtayı parlatır, ek değer çarpanı
export function polishMult(l = S.lvl.polish)   { return 1 + 0.3 * l; }
export function polishTime(l = S.lvl.polishS)  { return Math.max(0.15, 0.5 * Math.pow(0.85, l)); }
// mıknatıs: basılı tutunca imleç çevresindeki yumurtaları kapar
export function magnetRadius(l = S.lvl.magnet) { return 34 + 16 * l; }  // yakalama yarıçapı (px)
export function magnetCap(l = S.lvl.magnet)    { return 1 + Math.floor(l / 3); } // aynı anda taşınan
export function magnetPull(l = S.lvl.magnet)   { return 900 + 380 * l; } // çekim ivmesi (px/sn²)
// yem & su: tavuk başına birim/sn tüketim, seviyeyle büyüyen kapasite
export const FEED_RATE = 0.05, WATER_RATE = 0.08;
export function feedCap(l = S.lvl.feedCap)   { return 100 + 100 * l; }
export function waterCap(l = S.lvl.waterCap) { return 100 + 100 * l; }
// Tedarik Anlaşması: yem/su dolum maliyeti indirimi (en çok %60 indirim)
export function supplyMult(l = S.lvl.supply) { return Math.max(0.4, 1 - 0.12 * l); }
// lojistik maliyeti sürüyle büyür: birim fiyat tavuk başına artar
// (1 tavuk ≈ $0.11/birim, 20 tavuk ≈ $0.64/birim — dolum gelirin kayda değer dilimi olur)
export function refillRate() {
  return (0.08 + 0.028 * S.chickens.length) * supplyMult() * diffPrice();
}
export function refillCost(kind) {
  const cap = kind === 'feed' ? feedCap() : waterCap();
  return Math.max(1, Math.ceil((cap - S[kind]) * refillRate()));
}
// otomatik dolum: seviye başına kapasitenin %25'i (Sv.4 = tam dolum)
export function autoFillPct(l)  { return 0.25 * l; }
// tetik eşiği: Sv.1 %15 → Sv.4 %30 (yüksek seviye daha erken devreye girer)
export function autoTrigger(l) { return 0.10 + 0.05 * l; }
export function fedOk() { return S.feed > 0 && S.water > 0; }

/* ---- pasif yükseltmeler ---- */
export function twinChance(l = S.lvl.twin)     { return 0.03 * l; }              // ikiz yumurta şansı
export function luckyChance(l = S.lvl.lucky)   { return 0.025 * l; }             // satışta x2 ödeme şansı
export function consumeMult(l = S.lvl.saver)   { return Math.max(0.5, 1 - 0.1 * l) * (S.rain ? 0.75 : 1) * diffConsume(); } // yem/su tüketimi; yağmurda yağmur suyu bedava
export function offlineEff(l = S.lvl.offline)  { return 0.5 + 0.12 * l; }        // çevrimdışı kazanç verimi
export function offlineCapH(l = S.lvl.offline) { return 4 + 1.5 * l; }           // saat üst sınırı
export function roosterBoost(l = S.lvl.rooster){ return 1 + 0.08 * l; }          // yumurtlama hızı çarpanı
export function eggGap(l = S.lvl.pack)         { return 13 - l; }                // bant üstü yumurta aralığı (<12px'de üst üste binerler)
export const CHICK_GROW_T = 25;                                              // civcivin tavuğa dönüşme süresi (sn)
// kuluçka süresi: horoz sayısına göre kısalır (1 horoz 30sn, her ek horoz -%25);
// 'Hızlı Kuluçka' yükseltmesi seviye başına %12 kısaltır
export function chickInterval(roosters, l = S.lvl.hatch) {
  return 30 * Math.pow(0.75, Math.max(0, roosters - 1)) * Math.pow(0.88, l);
}
// civciv büyüme süresi: 'Hızlı Büyüme' yükseltmesi seviye başına %12 kısaltır
export function chickGrowT(l = S.lvl.grow) { return CHICK_GROW_T * Math.pow(0.88, l); }
// Seleksiyon: civcivin cins zarı — seviye yükseldikçe beyaz yerine esmer/kara;
// Sv.3+ az da olsa altın civciv şansı
export function chickOdds(l = S.lvl.gene) {
  return { g: l >= 3 ? 0.03 * (l - 2) : 0,
           k: 0.05 + 0.03 * l,
           w: Math.max(0.15, 0.7 - 0.11 * l) };
}
export function chickBreed() {
  const o = chickOdds(), r = Math.random();
  if (r < o.g) return 'gold';
  if (r < o.g + o.k) return 'black';
  if (r < o.g + o.k + o.w) return 'white';
  return 'brown';
}

// lojistik kamyonu: geliş sıklığı ve kasa kapasitesi seviyeyle iyileşir
export function truckInterval(l = S.lvl.truck) { return Math.max(6, 48 * Math.pow(0.8, l)); }
export function truckCap(l = S.lvl.truck)      { return 3 + l * 2; }
// araç tipi: 0 kamyonet (Sv.0-1) · 1 panelvan (Sv.2-4) · 2 tır (Sv.5-6)
export function truckTier(l = S.lvl.truck)     { return l >= 5 ? 2 : l >= 2 ? 1 : 0; }
// Toptancı Anlaşması: kamyonun toptan ödemesine seviye başına +%15 prim
export function truckBonus(l = S.lvl.dealer)   { return 1 + 0.15 * l; }
// Bereketli Yem: gübre yığını düşme sıklığı çarpanı
export function fertileRate(l = S.lvl.fertile) { return 1 + 0.30 * l; }
// Sevgi Eli: imlecin üstündeki tavuğun otomatik sevilme aralığı (tavuk başına)
export function autoPetCd(l = S.lvl.autopet)   { return 5.5 - l; }
// süpürge (üst bant): rulo fırça — kaba kir kazıma hızı (kir/sn) ve kapsama yarıçapı
export function brushRate(l = S.lvl.brush) { return 1.0 + 0.55 * l; }
export function brushHalf(l = S.lvl.brush) { return 15 + 4 * l; }
// Gübre Kepçesi: tüm yığınları toplama aralığı (sn)
export function scoopInterval(l = S.lvl.scoop) { return 14 * Math.pow(0.8, l); }
// bir gübre yığınının satış değeri — yumurta değeriyle ölçeklenir
export function manureValue()                  { return Math.max(1, Math.ceil(eggValue() * 0.5)); }
// gübre çuvalı: 20 yığının toplu satışı — %25 toptan primi (kamyon taşır)
export function manureBagValue()               { return Math.round(manureValue() * BAG_AT * 1.25); }

export function chickenCost(n = S.chickens.length) { return Math.ceil(12 * Math.pow(1.23, n)); }
// Pazarlık Ustası: tavuk satışı maliyetin %50'sinden başlar, seviye başına +%8 (azami %90)
export function sellFrac(l = S.lvl.bargain)    { return Math.min(0.9, 0.5 + 0.08 * l); }
export function sellPrice(breed = 'white') {
  const b = BREEDS[breed] || BREEDS.white;
  return Math.max(1, Math.floor(chickenCost() * sellFrac() * b.costMult * diffEarn()));
}
export function avgEggValue()   {
  // yıkama kuruluysa tüm yumurtalar yıkanır; cila da kuruluysa hepsi parlatılır
  const w = S.lvl.wash > 0 ? washMult() * (S.lvl.polish > 0 ? polishMult() : 1) : 1;
  const g = goldenChance(), rc = rareChance();
  const mult = (1 - g - rc) * 1 + g * TIERS.gold.mult + rc * rareAvg();
  return eggValue() * mult * w;
}

export function ratePerSec() {
  // horozlar yumurtlamaz ama diğerlerini hızlandırır; ikiz/şanslı pasifler beklentiye dahil
  const layers = S.chickens.filter(c => (BREEDS[c.breed] || BREEDS.white).lays !== false).length;
  return (layers / layInterval()) * roosterBoost() * avgEggValue()
         * (1 + twinChance()) * (1 + luckyChance());
}
