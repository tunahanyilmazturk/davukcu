// Tilki baskını: ara sıra sağ kenardan kümese sızar, bir tavuğu kapıp
// götürmeye çalışır. Tıklayınca ürküp kaçar (tavuk taşıyorsa düşürür);
// horozlar ötüşleriyle kendi başlarına da korkutabilir.
import { S } from '../state.js';
import { L, fmt } from '../config.js';
import { eggValue } from '../economy.js';
import { sndCluck, sndCoin, sndCrow, sndYip } from '../audio.js';
import { toast } from '../toast.js';

let foxT = 55 + Math.random() * 70; // ilk baskın sayacı
let crowT = 0;

export function updateFox(dt) {
  if (!S.fox) {
    if (S.chickens.length < 2 || S.playTime < 90) { foxT = Math.max(foxT, 20); return; }
    foxT -= dt;
    if (foxT <= 0) {
      const target = S.chickens[Math.floor(Math.random() * S.chickens.length)];
      S.fox = { x: L.FX - 26, y: target.y, state: 'sneak',
                t: 0, pause: false, dir: -1, target, scare: 0, carry: null };
      sndYip();
    }
    return;
  }
  const f = S.fox;

  if (f.state === 'sneak') {
    if (!f.target || !S.chickens.includes(f.target))
      f.target = S.chickens[Math.floor(Math.random() * S.chickens.length)];
    if (!f.target) { S.fox = null; return; }
    // atak-bekle ritmiyle sinsice sokul
    f.t -= dt;
    if (f.t <= 0) {
      f.pause = !f.pause;
      f.t = f.pause ? (0.3 + Math.random() * 0.4) : (0.55 + Math.random() * 0.5);
    }
    const dx = f.target.x - f.x, dy = f.target.y - f.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (!f.pause && d > 4) {
      f.x += dx / d * 62 * dt;
      f.y += dy / d * 62 * dt;
    }
    f.dir = dx < 0 ? -1 : 1;
    if (d < 16) {
      // kapma — yakındaki tavuklar panikleyerek kaçışır
      f.state = 'grab'; f.t = 0.45;
      for (const c of S.chickens) {
        const cdx = c.x - f.x, cdy = c.y - f.y;
        if (c !== f.target && cdx * cdx + cdy * cdy < 170 * 170) c.panicT = 1.7;
      }
      sndCluck(); sndCluck();
    }
  } else if (f.state === 'grab') {
    f.t -= dt;
    if (f.t <= 0 && f.target) {
      f.carry = f.target; f.target = null;
      f.carry.stolen = true; f.carry.panicT = 0;
      f.state = 'flee'; f.dir = 1;
    }
  } else { // flee — sağ kenara kaçar; tavukluysa kurtarma penceresi açık
    f.x += 155 * dt;
    if (f.carry) { f.carry.x = f.x + f.dir * 12; f.carry.y = f.y - 16; }
    if (f.x > L.FX + 70) {
      if (f.carry) {
        S.chickens.splice(S.chickens.indexOf(f.carry), 1);
        S.stats.foxStolen = (S.stats.foxStolen || 0) + 1;
        toast('Tilki bir tavuk kaçırdı!');
      }
      S.fox = null;
      foxT = 80 + Math.random() * 110;
    }
  }

  // horoz savunması — yakındaki horozlar öterek tilkiyi ürkütür
  if (f.state !== 'flee') {
    for (const r of S.chickens) {
      if (r.breed !== 'rooster' || r.stolen) continue;
      const rdx = r.x - f.x, rdy = r.y - f.y;
      if (rdx * rdx + rdy * rdy < 240 * 240) {
        f.scare += dt * 0.55;
        r.alertT = 0.5;
        crowT -= dt;
        if (crowT <= 0) {
          crowT = 1.15;
          sndCrow();
          S.parts.push({ kind: 'text', text: 'ÜRÜRÜ!', x: r.x, y: r.y - 46,
            vy: -26, t: 0, life: 0.9, color: '#ffd23e' });
        }
      }
    }
    if (f.scare > 1.6) scareFox(false); // horoz kendi başardı — ödül yok
  }
}

// tıkla ürküt (byPlayer → ödül) / horoz ürkütmesi (ödül yok)
export function scareFox(byPlayer = true) {
  const f = S.fox;
  if (!f) return;
  if (f.carry) {
    f.carry.stolen = false; f.carry.panicT = 1.4;
    f.carry = null;
    if (byPlayer) toast('Tavuk kurtarıldı!');
  }
  f.state = 'flee'; f.dir = 1; f.scare = 0; f.target = null;
  sndYip();
  for (let i = 0; i < 3; i++)
    S.parts.push({ kind: 'feather', x: f.x + (Math.random() - .5) * 16, y: f.y - 14,
      vx: (Math.random() - .5) * 90, vy: -50 - Math.random() * 40, t: 0, life: 0.8 });
  if (byPlayer && !f.paid) {
    f.paid = true; // ödül bir kez — kaçan tilkiye tekrar tıklamak kazandırmaz
    const v = Math.max(10, Math.round(eggValue() * 3));
    S.money += v; S.stats.earned += v;
    S.stats.foxed = (S.stats.foxed || 0) + 1;
    S.parts.push({ kind: 'text', text: '+$' + fmt(v), x: f.x, y: f.y - 30,
      vy: -32, t: 0, life: 1, color: '#ffd23e' });
    sndCoin();
  }
}
