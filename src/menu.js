// Ana menü: oyun açılırken simülasyon durur, şık giriş ekranı gösterilir.
// OYNA → oyuna girer (kayıt varsa DEVAM ET); YENİ OYUN iki aşamalı onayla
// kaydı sıfırlar. Menü arkasında dünya canlı çizilmeye devam eder —
// update durur ama draw çalışır (ambient animasyonlar, dalgalanan bayrak).
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

  // yürüyen tavuklar şeridi — menü canlı aksesuarı
  const strip = document.createElement('canvas');
  strip.id = 'mStrip'; strip.width = 320; strip.height = 38;
  card.appendChild(strip);

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

  document.getElementById('stage').appendChild(ov);

  // ---- şerit animasyonu: üç tavuk soldan sağa geçit yapar ----
  const sg = strip.getContext('2d'); sg.imageSmoothingEnabled = false;
  const flock = [
    { sp: SPR.chickens.white, x: 20,  v: 30, y: 10, ph: 0 },
    { sp: SPR.chickens.brown, x: 150, v: 22, y: 16, ph: 2.4 },
    { sp: SPR.chickens.gold || SPR.chickens.white, x: 250, v: 38, y: 5, ph: 4.1 },
  ];
  const t0 = performance.now();
  function tick(now) {
    if (!open) return;
    const t = (now - t0) / 1000;
    sg.clearRect(0, 0, 320, 38);
    for (const c of flock) {
      const x = ((c.x + t * c.v) % 360) - 20;
      const fr = (t * 7 + c.ph) % 1 < .5 ? 'b' : 'b2';
      const s = c.sp[fr] || c.sp.b;
      sg.fillStyle = 'rgba(0,0,0,.25)';
      sg.fillRect(x + 3, c.y + 17, 11, 3);
      sg.drawImage(s.c, x, c.y + Math.sin(t * 8 + c.ph));
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
