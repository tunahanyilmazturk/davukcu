// Yem & su: tüketim, tıkla/otomatik dolum
import { S } from '../state.js';
import { L, fmt } from '../config.js';
import { feedCap, waterCap, autoFillPct, autoTrigger, consumeMult, refillRate, FEED_RATE, WATER_RATE } from '../economy.js';
import { sndBuy, sndErr } from '../audio.js';
import { toast } from '../toast.js';

// kind: 'feed' | 'water'; auto: otomatik dolumdan mı tetiklendi
// otomatikte seviye başına kapasitenin %25'i dolar; el ile hep tam dolar
export function tryRefill(kind, auto = false) {
  const cap = kind === 'feed' ? feedCap() : waterCap();
  let amount = cap - S[kind];
  if (auto) {
    const l = S.lvl[kind === 'feed' ? 'autoF' : 'autoW'];
    // en az tetik eşiğinin üstüne çıkar — yoksa sonraki karede tekrar tetiklenir
    const need = cap * autoTrigger(l) - S[kind];
    amount = Math.min(amount, Math.max(cap * autoFillPct(l), need + 1));
  }
  const rate = refillRate();
  // para yettiği kadar dolar — tam dolum yetmiyorsa kısmi dolum;
  // bütçe tam dolara yuvarlanır ki ceil(cost) bakiyeyi aşmasın
  const afford = Math.floor(Math.floor(S.money) / rate);
  const partial = amount > afford;
  if (partial) amount = afford;
  if (amount < 1) {
    if (!auto) {
      toast(S[kind] >= cap - 1 ? (kind === 'feed' ? 'Yemlik' : 'Suluk') + ' zaten dolu'
        : 'Para yetmez — hiç ' + (kind === 'feed' ? 'yem' : 'su') + ' alınamadı');
      if (S[kind] < cap - 1) sndErr();
    }
    return false;
  }
  const cost = Math.max(1, Math.ceil(amount * rate));
  S.money -= cost;
  S[kind] += amount;
  S.stats.fills++;
  const t = kind === 'feed' ? L.FEED : L.WATER;
  S.parts.push({ kind: 'text', text: kind === 'feed' ? '+YEM' : '+SU',
    x: t.x + t.w / 2 - 12, y: t.y - 6, vy: -30, t: 0, life: 1,
    color: kind === 'feed' ? '#e8c040' : '#4aa8e8' });
  toast((auto ? 'Oto dolum' : 'Dolduruldu') + ': ' + (kind === 'feed' ? 'Yemlik' : 'Suluk')
    + ' +%' + Math.round(amount / cap * 100) + ' -$' + fmt(cost) + (partial ? ' (kısmi)' : ''));
  sndBuy();
  return true;
}

// her kare: tavuk başına tüketim + otomatik dolum; dönüş = tavuklar tok/sulu mu
export function updateResources(dt) {
  const nCh = S.chickens.length, cm = consumeMult(); // Tutumlu Kaynak pasifi
  S.feed  = Math.max(0, S.feed  - FEED_RATE  * cm * nCh * dt);
  S.water = Math.max(0, S.water - WATER_RATE * cm * nCh * dt);
  if (S.lvl.autoF && S.feed  < feedCap()  * autoTrigger(S.lvl.autoF)) tryRefill('feed',  true);
  if (S.lvl.autoW && S.water < waterCap() * autoTrigger(S.lvl.autoW)) tryRefill('water', true);
  return S.feed > 0 && S.water > 0;
}
