// Gübre: tavuklar kümese yığın bırakır — tıkla topla veya kepçe otomatik toplar
import { S } from '../state.js';
import { L, fmt } from '../config.js';
import { manureValue, scoopInterval, BREEDS } from '../economy.js';
import { sndCoin } from '../audio.js';
import { toast } from '../toast.js';

const MAX_PILES = 14; // kümesde birikebilecek yığın sınırı
let scoopT = 5;       // kepçe sayacı

// tavuk başına düşürme sayacı — updateChickens çağırır
export function tickManure(ch, dt) {
  if ((BREEDS[ch.breed] || BREEDS.white).lays === false) return; // horoz bırakmaz
  ch.manureT = (ch.manureT ?? 10 + Math.random() * 25) - dt;
  if (ch.manureT <= 0) {
    ch.manureT = 22 + Math.random() * 30;
    if (S.manures.length < MAX_PILES) {
      S.manures.push({ x: ch.x + (Math.random() - .5) * 22, y: ch.y - 2,
                       seed: Math.random() * 7 });
    }
  }
}

function collectPile(m) {
  const v = manureValue();
  S.money += v;
  S.stats.earned += v;
  S.stats.manure++;
  S.parts.push({ kind: 'text', text: '+$' + fmt(v), x: m.x - 8, y: m.y - 14,
    vy: -30, t: 0, life: .9, color: '#c89858' });
}

// tıklanan noktadaki yığını topla (input.js sorar)
export function manureAt(x, y) {
  return S.manures.find(m => Math.abs(x - m.x) < 14 && y > m.y - 12 && y < m.y + 6);
}
export function collectManure(m) {
  const i = S.manures.indexOf(m);
  if (i < 0) return;
  S.manures.splice(i, 1);
  collectPile(m);
  sndCoin();
}

// kepçe: aralıklarla tüm yığınları toplar
export function updateManure(dt) {
  if (S.lvl.scoop <= 0 || !S.manures.length) { scoopT = Math.max(scoopT, 1); return; }
  scoopT -= dt;
  if (scoopT > 0) return;
  scoopT = scoopInterval();
  let tot = 0;
  for (const m of S.manures) tot += manureValue();
  const n = S.manures.length;
  S.manures.length = 0;
  S.money += tot;
  S.stats.earned += tot;
  S.stats.manure += n;
  if (n > 0) {
    toast('Gübre toplandı: ' + n + ' yığın +$' + fmt(tot));
    sndCoin();
  }
}
