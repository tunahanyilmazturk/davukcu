// Gübre: tavuklar kümese yığın bırakır — tıkla (kürek) veya kepçeyle kovaya;
// kova dolunca çuval olur, çuvalları lojistik kamyonu satar
import { S } from '../state.js';
import { L, BAG_AT, fmt } from '../config.js';
import { manureBagValue, scoopInterval, fertileRate, BREEDS } from '../economy.js';
import { sndCoin, sndPop } from '../audio.js';
import { toast } from '../toast.js';

const MAX_PILES = 14; // kümesde birikebilecek yığın sınırı
let scoopT = 5;       // kepçe sayacı

// tavuk başına düşürme sayacı — updateChickens çağırır
export function tickManure(ch, dt) {
  if ((BREEDS[ch.breed] || BREEDS.white).lays === false) return; // horoz bırakmaz
  ch.manureT = (ch.manureT ?? 10 + Math.random() * 25) - dt;
  if (ch.manureT <= 0) {
    ch.manureT = (22 + Math.random() * 30) / fertileRate();
    if (S.manures.length < MAX_PILES) {
      S.manures.push({ x: ch.x + (Math.random() - .5) * 22, y: ch.y - 2,
                       seed: Math.random() * 7 });
    }
  }
}

// kova dolunca çuvala dönüşür — çuvallar kamyonun satacağı stok
function checkBag() {
  while (S.manureBin >= BAG_AT) {
    S.manureBin -= BAG_AT;
    S.manureBags++;
    const b = L.MANURE_BIN;
    S.parts.push({ kind: 'text', text: '+1 GÜBRE ÇUVALI',
      x: b.x + b.w / 2 - 34, y: b.y - 12, vy: -30, t: 0, life: 1.2, color: '#e8c878' });
    sndCoin();
  }
}

// kovaya yığın ekle — işçi karakteri de kullanır (uçan parçacıksız toplu döküm)
export function binAdd(n) {
  S.manureBin += n;
  S.stats.manure += n;
  checkBag();
}

// yığın kepçelenir: para yerine kovaya girer, kovaya uçan parçacık çıkar
function collectPile(m) {
  const b = L.MANURE_BIN;
  const tx = b.x + b.w / 2, ty = b.y + 4, life = 0.45;
  S.parts.push({ kind: 'manureFly', x: m.x - 2, y: m.y - 8,
    vx: (tx - m.x) / life, vy: (ty - m.y) / life, t: 0, life });
  binAdd(1);
}

// tıklanan noktadaki yığını topla (input.js sorar)
export function manureAt(x, y) {
  return S.manures.find(m => Math.abs(x - m.x) < 11 && y > m.y - 10 && y < m.y + 5);
}
export function collectManure(m) {
  const i = S.manures.indexOf(m);
  if (i < 0) return;
  S.manures.splice(i, 1);
  collectPile(m);
  sndPop();
}

// kepçe: aralıklarla tüm yığınları kovaya doldurur
export function updateManure(dt) {
  if (S.lvl.scoop <= 0 || !S.manures.length) { scoopT = Math.max(scoopT, 1); return; }
  scoopT -= dt;
  if (scoopT > 0) return;
  scoopT = scoopInterval();
  const n = S.manures.length;
  S.manures.length = 0;
  S.manureBin += n;
  S.stats.manure += n;
  if (n > 0) {
    toast('Kepçe: ' + n + ' yığın kovaya — ' +
      (S.manureBags ? S.manureBags + ' çuval, ' : '') +
      'kova ' + S.manureBin + '/' + BAG_AT + ' (çuval ~$' + fmt(manureBagValue()) + ')');
    sndPop();
  }
  checkBag();
}
