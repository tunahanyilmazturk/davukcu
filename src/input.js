// Girdi: tavuk sevme/sürükleme + mıknatıs ile yumurta toplama + sayfa geçişi.
// pointer/magnet dünya koordinatıdır (ekran x + cam.x). Sayfa geçişi:
// ekran kenarındaki oklar, kenardan yatay sürükleme, ←/→ tuşları, tekerlek.
import { S } from './state.js';
import { L, fmt } from './config.js';
import { sellPrice, autoPetCd } from './economy.js';
import { sndPet, sndCoin, sndZap } from './audio.js';
import { tryRefill } from './entities/index.js';
import { manureAt, collectManure } from './entities/manure.js';
import { scareFox } from './entities/fox.js';
import { catchButterfly } from './entities/events.js';
import { HOP_T } from './entities/chickens.js';
import { cam, goToPage, snapCam, navZones } from './camera.js';
import { toast } from './toast.js';
import { COARSE, isMobile } from './mobile.js';

export const drag = { current: null }; // {ch, ox, oy, origX, origY, moved}
export const magnet = { active: false, x: 0, y: 0, held: [] }; // basılıyken yumurtaları kapar
export const pointer = { x: -1, y: -1 }; // imlecin DÜNYA koordinatı (Sevgi Eli için sürekli izlenir)
let cv = null;
let pan = null; // kenar-sürükleme durumu {sx, camX, active}
const EDGE = COARSE ? 48 : 26;   // kenar şeridi — dokunmada daha geniş
const MOVE_T = COARSE ? 16 : 10; // sevme/sürükleme ayrımı — parmak titreşimi payı

function evPos(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (L.W / r.width),
           y: (e.clientY - r.top) * (L.H / r.height),
           cx: e.clientX, cy: e.clientY,
           rectRight: r.right, rectBottom: r.bottom };
}

// tavuk satış bölgesi: masaüstünde panel sağda (sağ kenar dışı),
// mobilde alt bar altta (canvas alt kenarı dışı)
function overSellZone(p) {
  return p.cx > p.rectRight || (isMobile() && p.cy > p.rectBottom);
}
// kenar şeridi: çiftlikte sağ kenar → fabrika; fabrikada sol kenar → çiftlik
function edgeZone(x) {
  if (cam.x < L.W - 1 && x > L.W - EDGE) return 1; // sağ → fabrika
  if (cam.x > 1 && x < EDGE) return -1;          // sol → çiftlik
  return 0;
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
  const z = L.WD.crateZone;
  eg.x = Math.max(8, Math.min(L.WORLD_W - 8, eg.x));
  if (eg.x > z.x0 && eg.x < z.x1 && eg.y > z.rimY - 30 && eg.y < z.inY + 44) {
    eg.phase = 'in'; eg.vy = 0;
  } else if (eg.x < L.FX) {
    eg.phase = 'fall'; eg.vy = 0;          // çiftlik sayfası → zemine, oradan kanala
  } else {
    eg.phase = eg.y > L.BELT2_Y + 30 ? 'floorfall'
             : eg.y < L.BELT1_Y + 30 ? 'fall' : 'fall2';
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
function cancelPan() { pan = null; cv.style.cursor = 'default'; }

export function initInput(canvas) {
  cv = canvas;
  // sağ tık mıknatıs yumurtası ayıklamada kullanılıyor — menüyü kapat
  cv.addEventListener('contextmenu', e => e.preventDefault());

  // imleç pencere dışında bırakılırsa mouseup hiç gelmez — kilitlenmeyi önle
  window.addEventListener('blur', () => { if (magnet.active) releaseMagnet(); cancelDrag(); cancelPan(); });
  document.documentElement.addEventListener('mouseleave',
    () => { if (magnet.active) releaseMagnet(); cancelDrag(); cancelPan(); });
  // OS dokunmayı iptal ederse (scroll devralma, çağrı) pointerup gelmez — temizle
  cv.addEventListener('pointercancel',
    () => { if (magnet.active) releaseMagnet(); cancelDrag(); cancelPan(); });

  // klavye ile sayfa geçişi
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') goToPage(1);
    else if (e.key === 'ArrowLeft') goToPage(0);
  });
  // tekerlek ile sayfa geçişi
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    goToPage((e.deltaY || e.deltaX) > 0 ? 1 : 0);
  }, { passive: false });

  cv.addEventListener('pointerdown', e => {
    if (e.button !== 0 || !e.isPrimary) return; // birincil dokunma/tık; ikinci parmak durumu bozmasın
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    const p = evPos(e);
    pointer.x = p.x + cam.x; pointer.y = p.y;
    const wx = pointer.x;
    const tr = troughAt(wx, p.y);
    if (tr) { tryRefill(tr); return; }
    // tilki — ürküt (tavuktan öncelikli: kapılan tavuğu kurtarmak kolay olsun)
    const f = S.fox;
    if (f && Math.hypot(wx - f.x, p.y - (f.y - 16)) < 34) { scareFox(); return; }
    // altın kelebek — yakala
    const bf = S.butterfly;
    if (bf && Math.hypot(wx - bf.x, p.y - bf.y) < 28) { catchButterfly(); return; }
    const ch = chickenAt(wx, p.y);
    if (ch) {
      drag.current = { ch, ox: wx - ch.x, oy: p.y - ch.y, origX: ch.x, origY: ch.y, moved: false };
      ch.drag = true;
      return;
    }
    // gübre yığını — tıkla topla (küçük gelir)
    const mn = manureAt(wx, p.y);
    if (mn) { collectManure(mn); return; }
    // gezinme okları (ekran uzayı) — varlıkların altında kalmazlar ama okun
    // üstündeki tavuk/yığın öncelikli: yanlışlıkla sayfa kaymasın
    for (const z of navZones()) {
      if (p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h) {
        goToPage(z.page); return;
      }
    }
    // kenar şeridinde boş alan → sayfa kaydırma (mıknatıs başlamaz)
    if (edgeZone(p.x)) { pan = { sx: p.x, camX: cam.x, active: false }; return; }
    // boş alanda basılı tut → mıknatıs devrede (yumurtaları kapar)
    magnet.active = true;
    magnet.x = wx; magnet.y = p.y;
  });

  window.addEventListener('pointermove', e => {
    if (!e.isPrimary) return;
    const p = evPos(e);
    pointer.x = p.x + cam.x; pointer.y = p.y;
    const d = drag.current;
    if (pan) {
      const dx = p.x - pan.sx;
      if (!pan.active && Math.abs(dx) > 7) pan.active = true;
      if (pan.active) {
        cam.x = cam.target = Math.max(0, Math.min(L.W, pan.camX - dx));
        cv.style.cursor = 'grabbing';
      }
      return;
    }
    if (d) {
      if (!d.moved && Math.hypot(pointer.x - (d.origX + d.ox), p.y - (d.origY + d.oy)) > MOVE_T) {
        d.moved = true;
      }
      if (d.moved) {
        const P = L.PEN;
        d.ch.x = Math.max(P.x + 8, Math.min(P.x + P.w - 8, pointer.x - d.ox));
        d.ch.y = Math.max(50, Math.min(L.H - 10, p.y - d.oy));
      }
      document.getElementById('panel').classList.toggle('sell-hover', d.moved && overSellZone(p));
    } else if (magnet.active) {
      magnet.x = pointer.x; magnet.y = p.y;
      cv.style.cursor = 'none'; // imlecin yerini nal görseli alıyor
    } else {
      // imleç önceliği tıklama ile aynı: silo → tavuk → gübre → ok → kenar;
      // yığın üstünde 'none' — yerini render/manure.js'teki kürek alır
      const navHov = navZones().some(z => p.x >= z.x && p.x <= z.x + z.w
                                         && p.y >= z.y && p.y <= z.y + z.h);
      const fxHov = S.fox && Math.hypot(pointer.x - S.fox.x, p.y - (S.fox.y - 16)) < 34;
      const bfHov = S.butterfly && Math.hypot(pointer.x - S.butterfly.x, p.y - S.butterfly.y) < 28;
      cv.style.cursor = troughAt(pointer.x, p.y) ? 'pointer'
        : (fxHov || bfHov) ? 'pointer'
        : chickenAt(pointer.x, p.y) ? 'grab'
        : manureAt(pointer.x, p.y) ? 'none'
        : navHov ? 'pointer'
        : edgeZone(p.x) ? 'ew-resize' : 'default';
    }
  });

  window.addEventListener('pointerup', e => {
    if (!e.isPrimary) return;
    // kenar kaydırması bitti → en yakın sayfaya kenetlen
    if (pan) {
      snapCam(pan.active ? evPos(e).x - pan.sx : 0);
      pan = null; cv.style.cursor = 'default';
      return;
    }
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
    const wx = p.x + cam.x;
    const ch = d.ch;
    ch.drag = false;
    const P = L.PEN;
    if (!d.moved) {
      pet(ch); // tıkla sevme — aralık beklemeden her zaman çalışır
    } else if (overSellZone(p)) {
      // panele bırakıldı → sat (cins fiyatıyla)
      const v = sellPrice(ch.breed);
      S.money += v;
      S.stats.sold++;
      S.stats.earned += v;
      S.chickens.splice(S.chickens.indexOf(ch), 1);
      toast('Tavuk satıldı: +$' + fmt(v));
      sndCoin();
    } else if (wx > P.x && wx < P.x + P.w && p.y > P.y && p.y < P.y + P.h + 30) {
      ch.x = Math.max(P.x + 16, Math.min(P.x + P.w - 16, wx - d.ox));
      ch.y = Math.max(P.y + 30, Math.min(P.y + P.h, p.y - d.oy));
    } else {
      ch.x = d.origX; ch.y = d.origY;
    }
    drag.current = null;
    document.getElementById('panel').classList.remove('sell-hover');
  });
}
