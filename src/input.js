// Girdi: tavuk sevme/sürükleme + mıknatıs ile yumurta toplama
import { S } from './state.js';
import { L, fmt } from './config.js';
import { sellPrice, autoPetCd } from './economy.js';
import { sndPet, sndCoin, sndZap } from './audio.js';
import { tryRefill } from './entities/index.js';
import { manureAt, collectManure } from './entities/manure.js';
import { HOP_T } from './entities/chickens.js';
import { toast } from './toast.js';

export const drag = { current: null }; // {ch, ox, oy, origX, origY, moved}
export const magnet = { active: false, x: 0, y: 0, held: [] }; // basılıyken yumurtaları kapar
export const pointer = { x: -1, y: -1 }; // imlecin sahne koordinatı (Sevgi Eli için sürekli izlenir)
let cv = null;

function evPos(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (L.W / r.width),
           y: (e.clientY - r.top) * (L.H / r.height),
           cx: e.clientX, rectRight: r.right };
}

export function chickenAt(x, y) {
  const sorted = [...S.chickens].sort((a, b) => b.y - a.y);
  return sorted.find(c => Math.abs(x - c.x) < 20 && y > c.y - 42 && y < c.y + 7);
}

// sevme: tavuk zıplar, kalpler çıkar, bir sonraki yumurtlama hızlanır
// hızlandırma aralıklıdır — spam tıkla sonsuz hız exploit'i yok
export function pet(ch) {
  ch.hop = HOP_T;
  S.stats.pets++;
  if ((ch.petCd || 0) <= 0) {
    ch.layT = Math.max(0.25, ch.layT * 0.7);
    ch.petCd = S.lvl.autopet > 0 ? Math.min(autoPetCd(), 1.0) : 1.0;
  }
  for (let i = 0; i < 3; i++) {
    S.parts.push({ kind: 'heart', x: ch.x - 12 + i * 12, y: ch.y - 44,
      vy: -30 - i * 8, t: 0, life: .9 });
  }
  sndPet();
}

// yemlik/suluk tıklama alanı (etiket satırı dahil)
function troughAt(x, y) {
  for (const [key, kind] of [['FEED', 'feed'], ['WATER', 'water']]) {
    const t = L[key];
    if (x >= t.x - 4 && x <= t.x + t.w + 4 && y >= t.y - 14 && y <= t.y + t.h) return kind;
  }
  return null;
}

// tutulan yumurtayı bırak: kutu ağzındaysa içeri düşer (satılır), değilse sahneye düşer
function dropEgg(eg) {
  const z = L.CRATE_ZONE;
  eg.x = Math.max(8, Math.min(L.W - 8, eg.x));
  if (eg.x > z.x0 && eg.x < z.x1 && eg.y > z.rimY - 30 && eg.y < z.inY + 44) {
    eg.phase = 'in'; eg.vy = 0;
  } else {
    eg.phase = eg.y > L.BELT2_Y + 30 ? 'floorfall' : (eg.y < L.BEAM_Y + 20 ? 'fall' : 'fall2');
    eg.vy = 0;
  }
}

// mıknatıs bırakma: tutulan/çekilen yumurtalar düşer veya satılır
function releaseMagnet() {
  magnet.active = false;
  for (const eg of S.eggs) {
    if (eg.phase === 'pulled') { eg.vx = 0; dropEgg(eg); }
  }
  for (const eg of magnet.held) {
    if (eg.phase === 'held') dropEgg(eg);
  }
  magnet.held = [];
  cv.style.cursor = 'default';
}

// sürükleme iptali (pencere odağı kaybolunca) — tavuk eski yerine döner
function cancelDrag() {
  const d = drag.current;
  if (d) { d.ch.drag = false; d.ch.x = d.origX; d.ch.y = d.origY; drag.current = null; }
  document.getElementById('panel').classList.remove('sell-hover');
}

export function initInput(canvas) {
  cv = canvas;
  // sağ tık mıknatıs yumurtası ayıklamada kullanılıyor — menüyü kapat
  cv.addEventListener('contextmenu', e => e.preventDefault());

  // imleç pencere dışında bırakılırsa mouseup hiç gelmez — kilitlenmeyi önle
  window.addEventListener('blur', () => { if (magnet.active) releaseMagnet(); cancelDrag(); });
  document.documentElement.addEventListener('mouseleave',
    () => { if (magnet.active) releaseMagnet(); cancelDrag(); });

  cv.addEventListener('mousedown', e => {
    if (e.button !== 0) return; // sadece sol tık etkileşim başlatır
    const p = evPos(e);
    pointer.x = p.x; pointer.y = p.y;
    const tr = troughAt(p.x, p.y);
    if (tr) { tryRefill(tr); return; }
    const ch = chickenAt(p.x, p.y);
    if (ch) {
      drag.current = { ch, ox: p.x - ch.x, oy: p.y - ch.y, origX: ch.x, origY: ch.y, moved: false };
      ch.drag = true;
      return;
    }
    // gübre yığını — tıkla topla (küçük gelir)
    const mn = manureAt(p.x, p.y);
    if (mn) { collectManure(mn); return; }
    // boş alanda basılı tut → mıknatıs devrede (yumurtaları kapar)
    magnet.active = true;
    magnet.x = p.x; magnet.y = p.y;
  });

  window.addEventListener('mousemove', e => {
    const p = evPos(e);
    pointer.x = p.x; pointer.y = p.y;
    const d = drag.current;
    if (d) {
      if (!d.moved && Math.hypot(p.x - (d.origX + d.ox), p.y - (d.origY + d.oy)) > 10) {
        d.moved = true;
      }
      if (d.moved) {
        d.ch.x = Math.max(10, Math.min(L.W - 10, p.x - d.ox));
        d.ch.y = Math.max(50, Math.min(L.H - 10, p.y - d.oy));
      }
      document.getElementById('panel').classList.toggle('sell-hover', d.moved && p.cx > p.rectRight);
    } else if (magnet.active) {
      magnet.x = p.x; magnet.y = p.y;
      cv.style.cursor = 'none'; // imlecin yerini nal görseli alıyor
    } else {
      // imleç önceliği tıklamayla aynı: silo → tavuk → gübre → mıknatıs;
      // yığın üstünde 'none' — yerini render/manure.js'teki kürek alır
      cv.style.cursor = troughAt(p.x, p.y) ? 'pointer'
        : chickenAt(p.x, p.y) ? 'grab'
        : manureAt(p.x, p.y) ? 'none' : 'default';
    }
  });

  window.addEventListener('mouseup', e => {
    const d = drag.current;
    // sağ tık: mıknatıs tutarken tutulan yumurtalardan birini ayıkla
    if (e.button === 2) {
      if (magnet.active && magnet.held.length) {
        const eg = magnet.held.pop(); // en son kapılan önce bırakılır
        if (eg.phase === 'held') dropEgg(eg);
        sndZap();
      }
      return;
    }
    if (e.button !== 0) return;
    // mıknatıs bırakılınca: tutulan yumurtalar düşer veya satılır
    if (magnet.active) {
      releaseMagnet();
      document.getElementById('panel').classList.remove('sell-hover');
      if (!d) return;
    }
    if (!d) return;
    const p = evPos(e);
    const ch = d.ch;
    ch.drag = false;
    const P = L.PEN;
    if (!d.moved) {
      pet(ch); // tıkla sevme — aralık beklemeden her zaman çalışır
    } else if (p.cx > p.rectRight) {
      // panele bırakıldı → sat (cins fiyatıyla)
      const v = sellPrice(ch.breed);
      S.money += v;
      S.stats.sold++;
      S.stats.earned += v;
      S.chickens.splice(S.chickens.indexOf(ch), 1);
      toast('Tavuk satıldı: +$' + fmt(v));
      sndCoin();
    } else if (p.x > P.x && p.x < P.x + P.w && p.y > P.y && p.y < P.y + P.h + 30) {
      ch.x = Math.max(P.x + 16, Math.min(P.x + P.w - 16, p.x - d.ox));
      ch.y = Math.max(P.y + 30, Math.min(P.y + P.h, p.y - d.oy));
    } else {
      ch.x = d.origX; ch.y = d.origY;
    }
    drag.current = null;
    document.getElementById('panel').classList.remove('sell-hover');
  });
}
