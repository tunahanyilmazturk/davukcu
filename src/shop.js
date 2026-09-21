// Sağ panel: sekmeli mağaza, toplu alım, üst durum çubuğu
import { S } from './state.js';
import { MAXL, MAX_CHICKENS, BASE, fmt, fmtTime } from './config.js';
import { eggValue, layInterval, farmBeltSpeed, depoBeltSpeed, goldenChance, rareChance, washMult, washTime, polishMult, polishTime, chickenCost, ratePerSec,
         feedCap, waterCap, BREEDS, magnetRadius, magnetCap, autoFillPct, autoTrigger,
         twinChance, luckyChance, consumeMult, offlineEff, offlineCapH, roosterBoost, eggGap,
         chickInterval, chickGrowT, gradeChance, truckInterval, truckCap, truckTier, autoPetCd,
         scoopInterval, organicMult, truckBonus, fertileRate, supplyMult, sellFrac,
         chickOdds } from './economy.js';
import { checkQuests, refreshQuestBar } from './quests.js';
import { refreshPrestige } from './prestige.js';
import { spawnChicken } from './entities/index.js';
import { sndBuy, sndErr } from './audio.js';
import { SPR } from './sprites/index.js';
import { buildStats, refreshStats } from './stats.js';
import { buildAchv, refreshAchv, checkAchv } from './achievements.js';
import { isMobile } from './mobile.js';

/* ---------------- Mağaza tanımları ----------------
   lv: seviye anahtarı (S.lvl), costAt(i): i. seviyenin fiyatı,
   effAt(i): i. seviyedeki etki metni, sec: bölüm adı */
export const SHOP = [
  { id: 'chicken', sec: 'ÜRETİM', name: 'Tavuk Satın Al', icon: 'chicken',
    costAt: n => chickenCost(n),
    effAt: n => n + ' tavuk',
    can: () => S.chickens.length < MAX_CHICKENS,
    idx: () => S.chickens.length,
    buy() { spawnChicken(undefined, undefined, 'white'); S.stats.bought++; } },
  { id: 'ch_brown', sec: 'ÜRETİM', name: 'Esmer Tavuk', icon: 'chicken', breed: 'brown', flat: true,
    costAt: n => Math.ceil(chickenCost(n) * BREEDS.brown.costMult),
    effAt: () => 'yumurtlama %28 hızlı',
    can: () => S.chickens.length < MAX_CHICKENS,
    idx: () => S.chickens.length,
    req: () => S.chickens.length >= 3, reqText: 'En az 3 tavuk gerekli',
    buy() { spawnChicken(undefined, undefined, 'brown'); S.stats.bought++; } },
  { id: 'ch_black', sec: 'ÜRETİM', name: 'Kara Tavuk', icon: 'chicken', breed: 'black', flat: true,
    costAt: n => Math.ceil(chickenCost(n) * BREEDS.black.costMult),
    effAt: () => '+%8 nadir · +%3 altın',
    can: () => S.chickens.length < MAX_CHICKENS,
    idx: () => S.chickens.length,
    req: () => S.chickens.length >= 8, reqText: 'En az 8 tavuk gerekli',
    buy() { spawnChicken(undefined, undefined, 'black'); S.stats.bought++; } },
  { id: 'ch_gold', sec: 'ÜRETİM', name: 'Altın Tavuk', icon: 'chicken', breed: 'gold', flat: true,
    costAt: n => Math.ceil(chickenCost(n) * BREEDS.gold.costMult),
    effAt: () => 'x2 değer · +%8 altın',
    can: () => S.chickens.length < MAX_CHICKENS,
    idx: () => S.chickens.length,
    req: () => S.chickens.length >= 15, reqText: 'En az 15 tavuk gerekli',
    buy() { spawnChicken(undefined, undefined, 'gold'); S.stats.bought++; } },
  { id: 'lay', sec: 'ÜRETİM', name: 'Hızlı Yumurtlama', icon: 'fastlay', lv: 'lay',
    costAt: l => Math.ceil(40 * Math.pow(1.9, l)),
    effAt: l => layInterval(l).toFixed(1) + ' sn' },
  { id: 'rooster', sec: 'ÜRETİM', name: 'Horoz', icon: 'chicken', breed: 'rooster', lv: 'rooster',
    costAt: l => Math.ceil(800 * Math.pow(2.8, l)),
    effAt: l => l === 0 ? 'civciv getirir · +%8 hız'
      : '+%' + Math.round((roosterBoost(l) - 1) * 100) + ' hız · daha sık civciv',
    req: () => S.chickens.length >= 8, reqText: 'En az 8 tavuk gerekli',
    buy() { spawnChicken(undefined, undefined, 'rooster'); } },
  { id: 'hatch', sec: 'ÜRETİM', name: 'Hızlı Kuluçka', icon: 'hatch', lv: 'hatch',
    costAt: l => Math.ceil(400 * Math.pow(2.0, l)),
    effAt: l => Math.round(chickInterval(1, l)) + ' sn civciv',
    req: () => S.lvl.rooster > 0, reqText: 'Önce horoz al' },
  { id: 'grow', sec: 'ÜRETİM', name: 'Hızlı Büyüme', icon: 'grow', lv: 'grow',
    costAt: l => Math.ceil(300 * Math.pow(2.0, l)),
    effAt: l => Math.round(chickGrowT(l)) + ' sn büyüme',
    req: () => S.lvl.rooster > 0, reqText: 'Önce horoz al' },
  { id: 'gene', sec: 'ÜRETİM', name: 'Seleksiyon', icon: 'gene', lv: 'gene',
    costAt: l => Math.ceil(900 * Math.pow(2.4, l)),
    effAt: l => { const o = chickOdds(l);
      return 'beyaz %' + Math.round(o.w * 100) + ' · kara %' + Math.round(o.k * 100) +
        (o.g ? ' · altın %' + Math.round(o.g * 100) : ''); },
    req: () => S.lvl.rooster > 0, reqText: 'Önce horoz al' },
  { id: 'beltF', sec: 'HAT', name: 'Çiftlik Bandı', icon: 'belt', lv: 'beltF',
    costAt: l => l === 0 ? 80 : Math.ceil(45 * Math.pow(1.9, l)),   // Sv.0→1 = hız artışı
    effAt: l => 'x' + (farmBeltSpeed(l) / BASE.belt).toFixed(2) + ' hız' },
  { id: 'beltD', sec: 'HAT', name: 'Depolama Bandı', icon: 'belt', lv: 'beltD',
    costAt: l => l === 0 ? 150 : Math.ceil(60 * Math.pow(1.9, l)),
    effAt: l => 'x' + (depoBeltSpeed(l) / BASE.beltD).toFixed(2) + ' hız',
    req: () => S.eggsSold >= 10, reqText: 'Önce 10 yumurta sat' },
  { id: 'wash', sec: 'HAT', name: 'Yumurta Yıkama', icon: 'wash', lv: 'wash',
    costAt: l => Math.ceil(300 * Math.pow(2.5, l)),
    effAt: l => l === 0 ? 'yıkama yok' : 'x' + washMult(l).toFixed(1) + ' değer',
    req: () => S.lvl.beltD > 0, reqText: 'Önce depolama bandını kur' },
  { id: 'washS', sec: 'HAT', name: 'Yıkama Hızı', icon: 'washspd', lv: 'washS',
    costAt: l => Math.ceil(250 * Math.pow(2.0, l)),
    effAt: l => l >= MAXL.washS ? 'durmadan geçer' : washTime(l).toFixed(2) + ' sn',
    req: () => S.lvl.wash > 0, reqText: 'Önce yıkama kur' },
  { id: 'grade', sec: 'HAT', name: 'Sınıflandırıcı', icon: 'grade', lv: 'grade',
    costAt: l => Math.ceil(500 * Math.pow(2.4, l)),
    effAt: l => '%' + Math.round(gradeChance(l) * 100) + ' katman yükseltir',
    req: () => S.lvl.wash >= 1, reqText: 'Önce yıkama kur' },
  { id: 'polish', sec: 'HAT', name: 'Yumurta Cilası', icon: 'polish', lv: 'polish',
    costAt: l => Math.ceil(600 * Math.pow(2.6, l)),
    effAt: l => l === 0 ? 'cila yok' : 'x' + polishMult(l).toFixed(1) + ' değer',
    req: () => S.lvl.wash > 0, reqText: 'Önce yıkama kur' },
  { id: 'polishS', sec: 'HAT', name: 'Cila Hızı', icon: 'polish', lv: 'polishS',
    costAt: l => Math.ceil(300 * Math.pow(2.1, l)),
    effAt: l => polishTime(l).toFixed(2) + ' sn',
    req: () => S.lvl.polish > 0, reqText: 'Önce cila kur' },
  { id: 'truck', sec: 'HAT', name: 'Lojistik Kamyonu', icon: 'truck', lv: 'truck',
    costAt: l => Math.ceil(600 * Math.pow(2.2, l)),
    effAt: l => Math.round(truckInterval(l)) + ' sn · ' + truckCap(l) + ' kasa · '
      + (truckTier(l) === 2 ? 'TIR' : truckTier(l) === 1 ? 'kamyon' : 'kamyonet') },
  { id: 'dealer', sec: 'HAT', name: 'Toptancı Anlaşması', icon: 'dealer', lv: 'dealer',
    costAt: l => Math.ceil(800 * Math.pow(2.5, l)),
    effAt: l => l === 0 ? 'kamyon primi yok'
      : 'kamyon ödemesi +%' + Math.round((truckBonus(l) - 1) * 100),
    req: () => S.stats.trucked > 0, reqText: 'İlk sevkiyatı bekle' },
  { id: 'value', sec: 'DEĞER', name: 'Yumurta Değeri', icon: 'egg', lv: 'value',
    costAt: l => Math.ceil(25 * Math.pow(1.75, l)),
    effAt: l => '$' + fmt(eggValue(l)) + '/yumurta' },
  { id: 'golden', sec: 'DEĞER', name: 'Altın Yumurta', icon: 'goldegg', lv: 'golden',
    costAt: l => Math.ceil(400 * Math.pow(2.7, l)),
    effAt: l => '%' + Math.round(goldenChance(l) * 100) + ' şans · 10x',
    req: () => S.lvl.value >= 3, reqText: 'Yumurta Değeri Sv.3 gerekli' },
  { id: 'rare', sec: 'DEĞER', name: 'Nadir Yumurtalar', icon: 'rare', lv: 'rare',
    costAt: l => Math.ceil(600 * Math.pow(3.0, l)),
    effAt: l => '%' + Math.round(rareChance(l) * 100) + ' şans · ' + (l >= 3 ? 'x2-20' : 'x2-4'),
    req: () => S.lvl.golden >= 2, reqText: 'Altın Yumurta Sv.2 gerekli' },
  { id: 'organic', sec: 'DEĞER', name: 'Organik Sertifika', icon: 'organic', lv: 'organic',
    costAt: l => Math.ceil(700 * Math.pow(2.3, l)),
    effAt: l => 'x' + organicMult(l).toFixed(2) + ' tüm değer',
    req: () => S.lvl.value >= 5, reqText: 'Yumurta Değeri Sv.5 gerekli' },
  { id: 'feedCap', sec: 'BAKIM', name: 'Büyük Yemlik', icon: 'feed', lv: 'feedCap',
    costAt: l => Math.ceil(50 * Math.pow(1.9, l)),
    effAt: l => fmt(feedCap(l)) + ' birim' },
  { id: 'waterCap', sec: 'BAKIM', name: 'Büyük Suluk', icon: 'water', lv: 'waterCap',
    costAt: l => Math.ceil(50 * Math.pow(1.9, l)),
    effAt: l => fmt(waterCap(l)) + ' birim' },
  { id: 'autoF', sec: 'BAKIM', name: 'Otomatik Yemlik', icon: 'autof', lv: 'autoF',
    costAt: l => Math.ceil(300 * Math.pow(2.4, l)),
    effAt: l => l === 0 ? 'kapalı'
      : 'düşükken %' + Math.round(autoTrigger(l) * 100) + "'de · %" + Math.round(autoFillPct(l) * 100) + ' dolar' },
  { id: 'autoW', sec: 'BAKIM', name: 'Otomatik Suluk', icon: 'autow', lv: 'autoW',
    costAt: l => Math.ceil(300 * Math.pow(2.4, l)),
    effAt: l => l === 0 ? 'kapalı'
      : 'düşükken %' + Math.round(autoTrigger(l) * 100) + "'de · %" + Math.round(autoFillPct(l) * 100) + ' dolar' },
  { id: 'supply', sec: 'BAKIM', name: 'Tedarik Anlaşması', icon: 'supply', lv: 'supply',
    costAt: l => Math.ceil(180 * Math.pow(2.0, l)),
    effAt: l => 'dolum maliyeti -%' + Math.round((1 - supplyMult(l)) * 100),
    req: () => S.lvl.feedCap > 0 || S.lvl.waterCap > 0,
    reqText: 'Önce yemlik veya suluk büyüt' },
  { id: 'scoop', sec: 'BAKIM', name: 'Gübre Kepçesi', icon: 'scoop', lv: 'scoop',
    costAt: l => Math.ceil(150 * Math.pow(2.2, l)),
    effAt: l => l === 0 ? 'kapalı — tıkla da kovaya alınır'
      : 'her ' + Math.round(scoopInterval(l)) + ' sn tüm gübreyi kovaya doldurur' },
  { id: 'fertile', sec: 'BAKIM', name: 'Bereketli Yem', icon: 'fertile', lv: 'fertile',
    costAt: l => Math.ceil(250 * Math.pow(2.1, l)),
    effAt: l => l === 0 ? 'normal gübre sıklığı'
      : '+%' + Math.round((fertileRate(l) - 1) * 100) + ' daha sık yığın' },
  { id: 'magnet', sec: 'ARAÇLAR', name: 'Mıknatıs', icon: 'magnet', lv: 'magnet',
    costAt: l => Math.ceil(60 * Math.pow(2.0, l)),
    effAt: l => magnetRadius(l) + 'px · ' + magnetCap(l) + ' yumurta' },
  { id: 'autopet', sec: 'ARAÇLAR', name: 'Sevgi Eli', icon: 'pet', lv: 'autopet',
    costAt: l => Math.ceil(200 * Math.pow(2.1, l)),
    effAt: l => l === 0 ? 'kapalı — imleç üstündeki tavuğu sever'
      : 'her ' + autoPetCd(l).toFixed(1) + ' sn\'de sever' },
  { id: 'twin', sec: 'PASİF', name: 'Çift Yumurta', icon: 'twin', lv: 'twin',
    costAt: l => Math.ceil(600 * Math.pow(2.7, l)),
    effAt: l => '%' + Math.round(twinChance(l) * 100) + ' ikiz şansı',
    req: () => S.eggsSold >= 300, reqText: '300 yumurta satınca açılır' },
  { id: 'lucky', sec: 'PASİF', name: 'Şanslı Satış', icon: 'lucky', lv: 'lucky',
    costAt: l => Math.ceil(500 * Math.pow(2.5, l)),
    effAt: l => '%' + Math.round(luckyChance(l) * 100) + ' şansla x2 ödeme',
    req: () => S.eggsSold >= 100, reqText: '100 yumurta satınca açılır' },
  { id: 'bargain', sec: 'PASİF', name: 'Pazarlık Ustası', icon: 'bargain', lv: 'bargain',
    costAt: l => Math.ceil(350 * Math.pow(2.3, l)),
    effAt: l => 'satış maliyetin %' + Math.round(sellFrac(l) * 100) + "'i",
    req: () => S.stats.sold >= 1, reqText: 'Önce bir tavuk sat' },
  { id: 'saver', sec: 'PASİF', name: 'Tutumlu Kaynak', icon: 'saver', lv: 'saver',
    costAt: l => Math.ceil(120 * Math.pow(2.1, l)),
    effAt: l => 'tüketim -%' + Math.round((1 - consumeMult(l)) * 100) },
  { id: 'pack', sec: 'PASİF', name: 'Sıkı Dizilim', icon: 'pack', lv: 'pack',
    costAt: l => Math.ceil(100 * Math.pow(2.1, l)),
    effAt: l => eggGap(l) + 'px aralık' },
  { id: 'offline', sec: 'PASİF', name: 'Çevrimdışı Verim', icon: 'offline', lv: 'offline',
    costAt: l => Math.ceil(120 * Math.pow(2.1, l)),
    effAt: l => '%' + Math.round(offlineEff(l) * 100) + ' verim · ' + offlineCapH(l) + ' saat' },
];

const QTY_STEPS = [1, 10, 'max'];
const ui = { qty: 0, avail: false }; // qty: QTY_STEPS indeksi, avail: sadece alınabilir filtresi
const SEC_COLORS = { 'ÜRETİM': '#9fe870', 'HAT': '#ffd23e', 'DEĞER': '#e0637c',
                     'BAKIM': '#e8a54c', 'ARAÇLAR': '#5cb8e8', 'PASİF': '#b8a0ff' };
// daraltılmış bölümler — localStorage'da kalıcı
let collapsed = new Set();
try { collapsed = new Set(JSON.parse(localStorage.getItem('shopCollapsed') || '[]')); } catch (e) {}

/* ---------------- Satın alma ---------------- */
// idx → seviye öğeleri için mevcut seviye, tavuk için mevcut sayı
function itemIdx(item) { return item.lv ? S.lvl[item.lv] : item.idx(); }
function itemMaxed(item) {
  if (item.lv) return S.lvl[item.lv] >= MAXL[item.lv];
  return !item.can();
}
// alınabilecek adet ve toplam fiyat (qty kadar, bütçe yettiğince)
function planBuy(item) {
  if (item.req && !item.req()) return { n: 0, total: 0 };
  const want = ui.qty === QTY_STEPS.length - 1 ? 200 : QTY_STEPS[ui.qty];
  let n = 0, total = 0, idx = itemIdx(item);
  const cap = item.lv ? MAXL[item.lv] : MAX_CHICKENS;
  while (n < want && idx + n < cap) {
    const c = item.costAt(idx + n);
    if (S.money < total + c) break;
    total += c; n++;
  }
  return { n, total };
}

export function buyItem(item) {
  const { n, total } = planBuy(item);
  if (n === 0) { sndErr(); return; }
  S.money -= total;
  for (let i = 0; i < n; i++) {
    if (item.lv) S.lvl[item.lv]++;
    if (item.buy) item.buy(); // lv'li kartlar da ekstra eylem tetikleyebilir (horoz)
  }
  sndBuy();
  refreshShop();
}

/* ---------------- Kart arayüzü ---------------- */
const cardsEl = document.getElementById('cards');
const cardEls = [];
const secEls = [];

export function buildShop() {
  cardsEl.innerHTML = '';
  cardEls.length = 0;
  secEls.length = 0;
  let lastSec = null;
  for (const item of SHOP) {
    if (item.sec !== lastSec) {
      lastSec = item.sec;
      const h = document.createElement('div');
      h.className = 'sec';
      const c = SEC_COLORS[lastSec];
      if (c) { h.style.borderLeftColor = c; h.style.color = c; }
      const nm = document.createElement('span'); nm.textContent = lastSec;
      const pr = document.createElement('span'); pr.className = 'sec-prog';
      h.appendChild(nm); h.appendChild(pr);
      h.title = 'Bölümü daralt / genişlet';
      h.addEventListener('click', () => {
        if (collapsed.has(lastSec)) collapsed.delete(lastSec); else collapsed.add(lastSec);
        try { localStorage.setItem('shopCollapsed', JSON.stringify([...collapsed])); } catch (e) {}
        refreshShop();
      });
      cardsEl.appendChild(h);
      secEls.push({ h, pr, sec: lastSec });
    }
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.sec = item.sec;

    const top = document.createElement('div'); top.className = 'top';
    const ic = document.createElement('canvas'); ic.width = 16; ic.height = 16;
    const ig = ic.getContext('2d'); ig.imageSmoothingEnabled = false;
    if (item.icon === 'chicken') ig.drawImage(SPR.chickens[item.breed || 'white'].a.c, 1, 2);
    else ig.drawImage(SPR.icons[item.icon].c, 0, 0);
    const txt = document.createElement('div'); txt.style.flex = '1';
    const nm = document.createElement('div'); nm.className = 'name'; nm.textContent = item.name;
    const sub = document.createElement('div'); sub.className = 'lvl';
    txt.appendChild(nm); txt.appendChild(sub);
    top.appendChild(ic); top.appendChild(txt);
    el.appendChild(top);

    let pips = null;
    if (item.lv && MAXL[item.lv] <= 14) {
      pips = document.createElement('div'); pips.className = 'pips';
      for (let i = 0; i < MAXL[item.lv]; i++) {
        const p = document.createElement('i'); pips.appendChild(p);
      }
      el.appendChild(pips);
    }

    const eff = document.createElement('div'); eff.className = 'eff';
    el.appendChild(eff);
    const cost = document.createElement('div'); cost.className = 'cost';
    el.appendChild(cost);
    el.addEventListener('click', () => buyItem(item));
    cardsEl.appendChild(el);
    cardEls.push({ el, sub, pips, eff, cost, item });
  }
}

export function refreshShop() {
  for (const rec of cardEls) {
    const { el, sub, pips, eff, cost, item } = rec;
    const idx = itemIdx(item);
    const maxed = itemMaxed(item);
    const locked = !!(item.req && !item.req());
    const { n, total } = planBuy(item);

    rec.filtered = ui.avail && (maxed || locked || n === 0);
    el.style.display = (collapsed.has(item.sec) || rec.filtered) ? 'none' : '';

    el.classList.toggle('cant', !maxed && (locked || n === 0));
    el.classList.toggle('maxed', maxed);
    el.classList.toggle('locked', locked);

    // seviye / adet satırı
    sub.textContent = item.lv
      ? 'Sv.' + idx + (maxed ? ' · MAX' : '')
      : idx + ' tavuk' + (S.chickens.length >= MAX_CHICKENS ? ' · MAX' : '');

    // pip göstergesi
    if (pips) {
      const ps = pips.children;
      for (let i = 0; i < ps.length; i++) ps[i].classList.toggle('on', i < idx);
    }

    // etki önizleme: şimdi → alım sonrası
    if (locked) {
      eff.textContent = item.reqText;
    } else if (maxed || item.flat) {
      eff.textContent = item.effAt(idx);
    } else {
      const after = item.lv ? Math.min(idx + Math.max(n, 1), MAXL[item.lv])
                            : Math.min(idx + Math.max(n, 1), MAX_CHICKENS);
      eff.textContent = item.effAt(idx) + ' → ' + item.effAt(after);
    }

    // fiyat: toplu alımda "n× $toplam"
    cost.textContent = maxed ? 'MAX'
      : (n > 1 ? n + '× $' + fmt(total) : '$' + fmt(item.costAt(idx)));
  }
  // bölüm başlıkları: ok durumu + MAX ilerlemesi, tamamen filtrelenen bölümü gizle
  for (const { h, pr, sec } of secEls) {
    const recs = cardEls.filter(c => c.item.sec === sec);
    pr.textContent = recs.filter(c => itemMaxed(c.item)).length + '/' + recs.length;
    h.classList.toggle('collapsed', collapsed.has(sec));
    h.style.display = ui.avail && recs.every(c => c.filtered) ? 'none' : '';
  }
}

/* ---------------- Sekmeler + toplu alım ---------------- */
const TAB_IDS = { shop: 'tabShop', stats: 'tabStats', achv: 'tabAchv', prest: 'tabPrest' };
function initTabs() {
  document.querySelectorAll('.tab').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === b));
      const t = b.dataset.tab;
      for (const k in TAB_IDS) {
        const el = document.getElementById(TAB_IDS[k]);
        if (el) el.classList.toggle('hidden', k !== t);
      }
      if (t === 'stats') refreshStats();
      if (t === 'achv') refreshAchv();
      if (t === 'prest') refreshPrestige();
    });
  });
  const q = document.getElementById('btnQty');
  q.addEventListener('click', () => {
    ui.qty = (ui.qty + 1) % QTY_STEPS.length;
    q.textContent = ui.qty === QTY_STEPS.length - 1 ? 'MAX' : QTY_STEPS[ui.qty] + 'x';
    refreshShop();
  });
  // "alınabilir" filtresi — kilitli / parası yetmeyen / MAX kartları gizler
  const av = document.getElementById('btnAvail');
  if (av) av.addEventListener('click', () => {
    ui.avail = !ui.avail;
    av.classList.toggle('on', ui.avail);
    refreshShop();
  });
}

/* ---------------- Üst durum ---------------- */
const elMoney = document.getElementById('stMoney');
const elChickens = document.getElementById('stChickens');
const elRate = document.getElementById('stRate');
const elFoot = document.getElementById('stEggsSold');
const elFeedBar = document.getElementById('barFeed');
const elFeedPct = document.getElementById('pctFeed');
const elWaterBar = document.getElementById('barWater');
const elWaterPct = document.getElementById('pctWater');
let lastMoney = -1;
let lastFlash = 0; // para flaşı reflow throttle — kare başına layout yaptırmaz

export function refreshUI() {
  checkAchv(); // koşulu dolan başarım varsa ödül + bildirim
  checkQuests();
  refreshQuestBar();
  elMoney.textContent = fmt(S.money);
  // para artınca kısa yeşil flaş — reflow'u seyrekleştir (600ms'de en çok bir)
  if (lastMoney >= 0 && S.money > lastMoney && performance.now() - lastFlash > 600) {
    lastFlash = performance.now();
    elMoney.classList.remove('up');
    void elMoney.offsetWidth; // animasyonu yeniden tetikle
    elMoney.classList.add('up');
  }
  lastMoney = S.money;
  elChickens.textContent = S.chickens.length;
  elRate.textContent = '+$' + fmt(ratePerSec()) + '/sn';
  elFoot.textContent = '⏱ ' + fmtTime(S.playTime) + '  ·  🥚 ' + fmt(S.eggsSold);
  // kaynak barları
  const fr = S.feed / feedCap(), wr = S.water / waterCap();
  elFeedBar.style.width = Math.round(fr * 100) + '%';
  elWaterBar.style.width = Math.round(wr * 100) + '%';
  elFeedPct.textContent = '%' + Math.round(fr * 100);
  elWaterPct.textContent = '%' + Math.round(wr * 100);
  elFeedBar.classList.toggle('low', fr < 0.12);
  elWaterBar.classList.toggle('low', wr < 0.12);
  // panel kapalıyken kart/sekme güncellemeleri görünmez — DOM işini atla
  if (document.getElementById('panel').classList.contains('closed')) return;
  refreshShop();
  const tabEl = id => document.getElementById(id);
  if (!tabEl('tabStats').classList.contains('hidden')) refreshStats();
  if (!tabEl('tabAchv').classList.contains('hidden')) refreshAchv();
  if (tabEl('tabPrest') && !tabEl('tabPrest').classList.contains('hidden')) refreshPrestige();
}

export function initPanel() {
  // panel aç/kapat kulakçığı — durum localStorage'da kalıcı
  const panel = document.getElementById('panel');
  const bp = document.getElementById('btnPanel');
  const setPanel = closed => {
    panel.classList.toggle('closed', closed);
    // ok yönü: masaüstünde yatay (◀/▶), mobilde dikey (▲/▼)
    const mob = isMobile();
    bp.innerHTML = closed ? (mob ? '&#9650;' : '&#9666;')
                          : (mob ? '&#9660;' : '&#9654;');
    bp.title = closed ? 'Paneli aç' : 'Paneli kapat';
    try { localStorage.setItem('panelClosed', closed ? '1' : ''); } catch (e) {}
    // sahne genişliği değişti — canvas/layout'u yeniden hesaplat
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };
  bp.addEventListener('click', e => {
    e.stopPropagation();
    setPanel(!panel.classList.contains('closed'));
  });
  // kapalı rayın tamamı tıklanabilir — butonu ıskalasa da panel açılır
  panel.addEventListener('click', () => {
    if (panel.classList.contains('closed')) setPanel(false);
  });
  // kayıtlı durum; mobilde ilk açılış varsayılanı kapalı bar (oyun görünsün)
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('panel') === '1') setPanel(false);
    else if (localStorage.getItem('panelClosed') || isMobile()) setPanel(true);
  } catch (e) {}

  initTabs();
  buildStats();
  buildAchv();

  // panel ikonları
  const g1 = document.getElementById('icoChicken').getContext('2d');
  g1.imageSmoothingEnabled = false;
  g1.drawImage(SPR.chickens.white.a.c, 1, 2);
  const g2 = document.getElementById('icoCoin').getContext('2d');
  g2.imageSmoothingEnabled = false;
  g2.drawImage(SPR.coin.c, 4, 4);
}
