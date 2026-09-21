// Ana menü: bağımsız tam-ekran sahne — oyun alanı arkada görünmez.
// Kendi gece-gökyüzü arka planı çizilir (yıldızlar, ay, çimen, yürüyen
// tavuklar); menü açıkken update ve draw tamamen durur.
// OYNA → oyuna girer (kayıt varsa DEVAM ET); YENİ OYUN iki aşamalı onayla
// kaydı sıfırlar; hızlı ayar çipleri + tam ayarlar modalı menüden erişilir.
import { S, readSave, resetSave, writeSave } from './state.js';
import { fmt } from './config.js';
import { SPR } from './sprites/index.js';
import { openSettings } from './settings.js';
import { sndBuy, sndErr } from './audio.js';

let open = false;
export function menuOpen() { return open; }

export function initMenu() {
  // sadece gerçek oyun sayfası — test harness'larında üst bar yok
  if (!document.getElementById('topbar')) return;
  // herhangi bir parametre doğrudan oyuna girer (?play, ?ff, ?panel, ?foxnow...)
  if (location.search.length > 1) return;
  showMenu();
}

// oyun içinden de çağrılabilir — üst bar çıkış butonu menüyü geri açar
export function showMenu() {
  if (open || !document.getElementById('topbar')) return;
  const saved = readSave();
  open = true;

  const ov = document.createElement('div');
  ov.id = 'mainMenu';

  // ---- arka plan sahnesi: yarım çözünürlük canvas, pixelated büyütme ----
  const bg = document.createElement('canvas');
  bg.id = 'mBg';
  ov.appendChild(bg);

  const card = document.createElement('div');
  card.className = 'mcard2';
  ov.appendChild(card);

  // logo: altın tavuk + başlık
  const logo = document.createElement('div');
  logo.className = 'mlogo-row';
  const lc = document.createElement('canvas');
  lc.className = 'mlogo'; lc.width = 40; lc.height = 40;
  const lg = lc.getContext('2d'); lg.imageSmoothingEnabled = false;
  lg.drawImage(SPR.chickens.gold ? SPR.chickens.gold.b.c : SPR.chickens.white.b.c, 1, 2, 38, 38);
  const ttl = document.createElement('div');
  ttl.innerHTML = '<h1>TAVUK ÇİFTLİĞİ</h1><div class="msub">piksel çiftlik simülasyonu</div>';
  logo.appendChild(lc); logo.appendChild(ttl);
  card.appendChild(logo);

  // kayıt özeti
  if (saved) {
    const nCh = Array.isArray(saved.chickens) ? saved.chickens.length : (saved.chickens || 0);
    const ms = document.createElement('div');
    ms.className = 'msave';
    ms.textContent = 'Kayıt: 🐔 ' + nCh + ' tavuk · $' + fmt(saved.money || 0)
      + (saved.prestige ? ' · ⭐' + saved.prestige : '');
    card.appendChild(ms);
  }

  // OYNA / DEVAM ET
  const play = document.createElement('button');
  play.className = 'mbtn';
  play.textContent = saved ? '▶  DEVAM ET' : '▶  OYNA';
  card.appendChild(play);

  // AYARLAR
  const st = document.createElement('button');
  st.className = 'mbtn sec';
  st.textContent = '⚙  AYARLAR';
  st.addEventListener('click', () => { openSettings(); sndBuy(); });
  card.appendChild(st);

  // hızlı ayarlar — modal açmadan oyundan önce değiştirilebilir
  const qs = document.createElement('div');
  qs.className = 'mqset';
  const mkT = (label, get, set) => {
    const b = document.createElement('button');
    b.className = 'mqt';
    const paint = () => {
      b.innerHTML = label + '<b>' + (get() ? 'AÇIK' : 'KAPALI') + '</b>';
      b.classList.toggle('off', !get());
    };
    b.addEventListener('click', () => { set(!get()); paint(); writeSave(); sndBuy(); });
    paint();
    qs.appendChild(b);
  };
  mkT('🔊 Ses',   () => !S.muted,   v => { S.muted = !v; });
  mkT('🎵 Müzik', () => S.music,    v => { S.music = v; });
  mkT('✨ Efekt', () => S.fxParts && S.fxAmbient, v => { S.fxParts = S.fxAmbient = v; });
  card.appendChild(qs);

  // YENİ OYUN — kayıt varsa; iki aşamalı onay (ayarlardaki desen)
  if (saved) {
    const nw = document.createElement('button');
    nw.className = 'mbtn subtle';
    nw.textContent = 'Yeni Oyun';
    let arm = null;
    nw.addEventListener('click', () => {
      if (!arm) {
        nw.textContent = 'Kayıt silinecek — emin misin?';
        nw.classList.add('arm'); sndErr();
        arm = setTimeout(() => { arm = null; nw.textContent = 'Yeni Oyun'; nw.classList.remove('arm'); }, 3000);
        return;
      }
      clearTimeout(arm);
      resetSave();
      try { localStorage.removeItem('panelClosed'); localStorage.removeItem('shopCollapsed'); } catch (e) {}
      location.replace(location.pathname + '?play'); // menüyü atlayıp yeni oyuna
    });
    card.appendChild(nw);
  }

  // yakında gelecek bölümler — yeni oyun bölümü ekleneceğinde bu listeyi doldur
  const SOON = ['?', '?', '?'];
  const soon = document.createElement('div');
  soon.className = 'msoon';
  for (const q of SOON) {
    const b = document.createElement('div');
    b.className = 'mson';
    b.title = 'Yakında gelecek';
    b.innerHTML = '<div class="mq">' + q + '</div><span>YAKINDA</span>';
    soon.appendChild(b);
  }
  card.appendChild(soon);

  const ver = document.createElement('div');
  ver.className = 'mver';
  ver.textContent = 'v1.0';
  card.appendChild(ver);

  document.body.appendChild(ov); // stage değil — panel + üst bar dahil her şeyin üstünde

  // ---- sahne kurulumu ----
  const g = bg.getContext('2d');
  g.imageSmoothingEnabled = false;
  let stars = [], tufts = [], flw = [], trees = [], sky = null;
  const GRASS = 90; // yarım-çöz çimen bandı yüksekliği (px)

  function layBg() {
    bg.width = Math.max(160, innerWidth >> 1);
    bg.height = Math.max(120, innerHeight >> 1);
    const w = bg.width, h = bg.height, gy = h - GRASS;
    sky = g.createLinearGradient(0, 0, 0, gy);
    sky.addColorStop(0, '#140b22');
    sky.addColorStop(.62, '#2a1745');
    sky.addColorStop(1, '#5a2c50'); // ufuk kızıllığı
    stars = []; for (let i = 0; i < 80; i++) stars.push({ x: Math.random() * w, y: Math.random() * gy * .82, p: Math.random() * 6.3, s: Math.random() < .2 ? 2 : 1 });
    trees = []; for (let i = 0; i < 7; i++) trees.push({ x: Math.random() * w, r: 14 + Math.random() * 22 });
    tufts = []; for (let i = 0; i < 90; i++) tufts.push({ x: Math.random() * w, y: gy + 8 + Math.random() * (GRASS - 14), h: 3 + Math.random() * 5 });
    flw = []; for (let i = 0; i < 22; i++) flw.push({ x: Math.random() * w, y: gy + 12 + Math.random() * (GRASS - 20), c: ['#e86a9a', '#ffd23e', '#f0f0f0', '#b07ae8'][i % 4] });
  }
  layBg();
  window.addEventListener('resize', () => { if (open) layBg(); });

  const flock = [
    { sp: SPR.chickens.white, x: 30,  v: 30, dy: 12, ph: 0 },
    { sp: SPR.chickens.brown, x: 160, v: 22, dy: 34, ph: 2.4 },
    { sp: SPR.chickens.gold || SPR.chickens.white, x: 280, v: 38, dy: 4, ph: 4.1 },
    { sp: SPR.chickens.black || SPR.chickens.brown, x: 400, v: 26, dy: 55, ph: 1.2 },
  ];

  const t0 = performance.now();
  function tick(now) {
    if (!open) return;
    const t = (now - t0) / 1000, w = bg.width, h = bg.height, gy = h - GRASS;
    // gökyüzü + yıldızlar + ay
    g.fillStyle = sky; g.fillRect(0, 0, w, gy + 1);
    for (const s of stars) {
      g.globalAlpha = .25 + .65 * Math.abs(Math.sin(t * 1.6 + s.p));
      g.fillStyle = '#e8d8ff'; g.fillRect(s.x, s.y, s.s, s.s);
    }
    g.globalAlpha = 1;
    g.fillStyle = '#f0e0a8'; g.beginPath(); g.arc(w - 70, 44, 17, 0, 7); g.fill();
    g.fillStyle = '#d8c890'; g.fillRect(w - 76, 38, 4, 4); g.fillRect(w - 66, 48, 5, 5);
    // ufukta ağaç silüetleri
    g.fillStyle = '#1c1230';
    for (const tr of trees) {
      g.beginPath(); g.arc(tr.x, gy - tr.r * .6, tr.r, 0, 7); g.fill();
      g.fillRect(tr.x - 2, gy - 6, 4, 7);
    }
    // çimen bandı + tutamlar + çiçekler
    g.fillStyle = '#26401e'; g.fillRect(0, gy, w, GRASS);
    g.fillStyle = '#33522a'; g.fillRect(0, gy, w, 8);
    g.fillStyle = '#3e6030';
    for (const tf of tufts) { g.fillRect(tf.x, tf.y - tf.h, 2, tf.h); g.fillRect(tf.x + 3, tf.y - tf.h * .7, 2, tf.h * .7); }
    for (const f of flw) {
      g.fillStyle = '#4a6a34'; g.fillRect(f.x, f.y - 4, 1, 4);
      g.fillStyle = f.c; g.fillRect(f.x - 1, f.y - 6, 3, 3);
    }
    // çimende gezinen tavuklar
    for (const c of flock) {
      const x = ((c.x + t * c.v) % (w + 60)) - 30;
      const y = gy + 14 + c.dy + Math.sin(t * 8 + c.ph);
      const fr = (t * 7 + c.ph) % 1 < .5 ? 'b' : 'b2';
      const s = c.sp[fr] || c.sp.b;
      g.fillStyle = 'rgba(0,0,0,.3)';
      g.fillRect(x + 3, y + 17, 11, 3);
      g.drawImage(s.c, x, y);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ---- kapanış ----
  const close = () => {
    if (!open) return;
    open = false;
    ov.classList.add('hide');
    sndBuy();
    setTimeout(() => ov.remove(), 260);
  };
  play.addEventListener('click', close);
  window.addEventListener('keydown', function onKey(e) {
    if (!open) { window.removeEventListener('keydown', onKey); return; }
    if (e.key === 'Enter' || e.key === ' ') close();
    if (e.key === 'Escape') return; // menüde ESC bir şey yapmaz
  });
}
