// İstatistik sekmesi: satır tanımları + DOM oluşturma/yenileme
import { S } from './state.js';
import { MAX_CHICKENS, fmt, fmtTime } from './config.js';
import { eggValue, farmBeltSpeed, depoBeltSpeed, goldenChance, rareChance,
         washMult, washTime, polishMult, polishTime, feedCap, waterCap, refillCost,
         magnetRadius, magnetCap, magnetPull, twinChance, luckyChance, consumeMult,
         offlineEff, offlineCapH, roosterBoost, eggGap,
         chickInterval, chickGrowT, gradeChance, autoPetCd } from './economy.js';

const statDefs = [
  ['Satılan yumurta',  () => fmt(S.eggsSold)],
  ['Toplam kazanç',    () => '$' + fmt(S.stats.earned)],
  ['Yıkanan yumurta',  () => fmt(S.stats.washed)],
  ['Cilalanan yumurta',() => fmt(S.stats.polished)],
  ['Cinsli tavuk',     () => fmt(S.chickens.filter(c => c.breed && c.breed !== 'white').length)],
  ['Altın yumurta',    () => fmt(S.stats.golden)],
  ['Nadir yumurta',    () => fmt(S.stats.rare)],
  ['Yem',              () => '%' + Math.round(S.feed / feedCap() * 100) + ' / ' + fmt(feedCap())],
  ['Su',               () => '%' + Math.round(S.water / waterCap() * 100) + ' / ' + fmt(waterCap())],
  ['Dolum sayısı',     () => fmt(S.stats.fills)],
  ['Dolum fiyatı',     () => '$' + fmt(refillCost('feed')) + ' / $' + fmt(refillCost('water'))],
  ['Tavuk',            () => S.chickens.length + ' / ' + MAX_CHICKENS],
  ['Civciv',           () => S.chicks.length],
  ['Kuluçka süresi',   () => S.lvl.rooster ? Math.round(chickInterval(1)) + ' sn' : '—'],
  ['Civciv büyüme',    () => S.lvl.rooster ? Math.round(chickGrowT()) + ' sn' : '—'],
  ['Yolda yumurta',    () => S.eggs.length],
  ['Sevilen tavuk',    () => fmt(S.stats.pets)],
  ['Sevgi Eli',        () => S.lvl.autopet ? 'her ' + autoPetCd().toFixed(1) + ' sn' : '—'],
  ['Alınan tavuk',     () => fmt(S.stats.bought)],
  ['Satılan tavuk',    () => fmt(S.stats.sold)],
  ['Yumurta değeri',   () => '$' + fmt(eggValue())],
  ['Yıkama çarpanı',   () => 'x' + (S.lvl.wash ? washMult().toFixed(1) : '1.0')],
  ['Yıkama süresi',    () => S.lvl.wash ? washTime().toFixed(2) + ' sn' : '—'],
  ['Cila çarpanı',     () => 'x' + (S.lvl.polish ? polishMult().toFixed(1) : '1.0')],
  ['Cila süresi',      () => S.lvl.polish ? polishTime().toFixed(2) + ' sn' : '—'],
  ['Sınıflandırılan',  () => fmt(S.stats.upg) + (S.lvl.grade ? ' · %' + Math.round(gradeChance() * 100) : '')],
  ['Kamyonla satılan', () => fmt(S.stats.trucked)],
  ['Çiftlik bandı',    () => farmBeltSpeed().toFixed(0) + ' px/sn'],
  ['Depolama bandı',   () => depoBeltSpeed().toFixed(0) + ' px/sn'],
  ['Mıknatıs',         () => magnetRadius() + ' px · ' + magnetCap() + ' yumurta · ' + magnetPull() + ' çekim'],
  ['Altın şansı',      () => '%' + Math.round(goldenChance() * 100)],
  ['Nadir şansı',      () => '%' + Math.round(rareChance() * 100)],
  ['İkiz şansı',       () => '%' + Math.round(twinChance() * 100)],
  ['Şanslı satış',     () => '%' + Math.round(luckyChance() * 100)],
  ['Tüketim',          () => '%' + Math.round(consumeMult() * 100)],
  ['Çevrimdışı verim', () => '%' + Math.round(offlineEff() * 100) + ' · ' + offlineCapH() + ' saat'],
  ['Horoz etkisi',     () => 'x' + roosterBoost().toFixed(1)],
  ['Yumurta aralığı',  () => eggGap() + ' px'],
  ['Oyun süresi',      () => fmtTime(S.playTime)],
];
const statRows = [];

export function buildStats() {
  const list = document.getElementById('statList');
  list.innerHTML = '';
  statRows.length = 0;
  for (const [label, fn] of statDefs) {
    const r = document.createElement('div'); r.className = 'srow';
    const a = document.createElement('span'); a.textContent = label;
    const b = document.createElement('b');
    r.appendChild(a); r.appendChild(b);
    list.appendChild(r);
    statRows.push({ b, fn });
  }
}

export function refreshStats() {
  for (const { b, fn } of statRows) b.textContent = fn();
}
