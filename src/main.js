// Giriş noktası: yükleme, çevrimdışı kazanç, ana döngü
import { S, readSave, applySave, writeSave } from './state.js';
import { H, L, computeLayout, fmt } from './config.js';
import { ratePerSec, offlineEff, offlineCapH } from './economy.js';
import { spawnChicken, spawnChick, update, clampEntities } from './entities/index.js';
import { eggLooks } from './entities/eggs.js';
import { draw } from './render/index.js';
import { initInput, magnet } from './input.js';
import { buildShop, refreshShop, refreshUI, initPanel, SHOP, buyItem } from './shop.js';
import { initSettings } from './settings.js';
import { toast } from './toast.js';
import { buildBG } from './world.js';

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const stage = document.getElementById('stage');

// ---- boyutlandırma: dünya genişliği sahneye göre ----
function resize() {
  const r = stage.getBoundingClientRect();
  if (r.width < 10 || r.height < 10) return;
  const lay = computeLayout(r.width, r.height);
  cv.width = lay.W; cv.height = H;
  ctx.imageSmoothingEnabled = false;
  const s = r.height / H;
  cv.style.width = (lay.W * s) + 'px';
  cv.style.height = r.height + 'px';
  buildBG();
  clampEntities();
}
window.addEventListener('resize', resize);
resize(); // L'i doldur — tavuklar PEN'e göre spawn oluyor

// ---- kayıt yükle ----
const saved = readSave();
let breeds = ['white'], chickTimes = [], lastSeen = Date.now();
if (saved) {
  const r = applySave(saved);
  breeds = r.breeds;
  chickTimes = r.chickTimes;
  lastSeen = r.lastSeen;
}
for (const b of breeds) spawnChicken(undefined, undefined, b);
for (const t of chickTimes) spawnChick(undefined, undefined, t); // kalan süreyle devam

// çevrimdışı kazanç — Çevrimdışı Verim yükseltmesi verim + süreyi artırır
const dtOff = Math.min(offlineCapH() * 3600, (Date.now() - lastSeen) / 1000);
const gain = Math.floor(dtOff * ratePerSec() * offlineEff());
if (gain > 0) {
  S.money += gain;
  S.stats.earned += gain;
  setTimeout(() => toast('Çevrimdışı kazanç: +$' + fmt(gain)), 400);
}

// ---- arayüz ----
initInput(cv);
initPanel();
initSettings();
buildShop();
refreshUI();

setInterval(writeSave, 10000);
window.addEventListener('beforeunload', writeSave);

// ambient müzik — tarayıcı izni için ilk tıklamada başlar
import { startMusic } from './audio.js';
window.addEventListener('pointerdown', startMusic, { once: true });

// ---- ana döngü ----
let last = performance.now(), uiT = 0;
function loop(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.1) dt = 0.1;
  update(dt);
  draw(ctx, dt);
  uiT += dt;
  if (uiT > 0.25) { uiT = 0; refreshUI(); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// geliştirme: test.html bu kancayı kullanır
if (import.meta.env && import.meta.env.DEV) {
  window.GAME = { S, update, SHOP, buyItem, writeSave, L, spawnChicken, magnet };
  // ?ff=30 → açılışta 30 saniye ileri sar (test/görsel kontrol)
  const q = new URLSearchParams(location.search);
  const ff = parseFloat(q.get('ff') || '0');
  // ?lvl=wash:2,belt:1 → seviye hilesi
  const lvls = (q.get('lvl') || '').split(',').filter(Boolean);
  for (const kv of lvls) {
    const [k, v] = kv.split(':');
    if (k in S.lvl) S.lvl[k] = parseInt(v) || 0;
  }
  const mny = parseFloat(q.get('money') || '0');
  if (mny > 0) S.money = mny;
  // ?ch=5 → test için tavuk ekle
  const ch = parseInt(q.get('ch') || '0');
  for (let i = 0; i < ch; i++) spawnChicken();
  // ?feed=30&water=0 → kaynak seviyesi testi
  if (q.get('feed') !== null) S.feed = parseFloat(q.get('feed'));
  if (q.get('water') !== null) S.water = parseFloat(q.get('water'));
  // ?rost=1&chick=1 → görsel test: horoz + civciv spawn
  if (q.has('rost')) spawnChicken(undefined, undefined, 'rooster');
  if (q.has('chick')) spawnChick();
  // ?floor=6 → görsel test: zemine yumurta serp (kamyon toplar)
  const fl = parseInt(q.get('floor') || '0');
  for (let i = 0; i < fl; i++)
    S.eggs.push({ x: 160 + i * 22 + Math.random() * 10, y: L.FLOOR_Y - 10, vy: 0, phase: 'floor',
                  tier: 'normal', valMult: 1, clean: false, wash: 0, polish: 0,
                  shine: false, graded: true, ...eggLooks() });
  // ?trucknow=1 → görsel test: kamyonu hemen yükleme pozisyonuna koy
  if (q.has('trucknow')) S.truck = { x: L.W * 0.35, state: 'arrive', cargo: 3, worth: 0, t: 1, bob: 0 };
  // ?settings=1 → ayarlar modalını açık başlat (görsel test)
  if (q.has('settings')) document.getElementById('btnSettings').click();
  // ?mag=1 → mıknatıs görselini sabit konumda aktif tut (görsel test)
  if (q.has('mag')) {
    const mx = L.W * 0.45, my = H * 0.58;
    setInterval(() => { magnet.active = true; magnet.x = mx; magnet.y = my; }, 100);
  }
  if (lvls.length || mny || ch) refreshShop();
  if (ff > 0) {
    S.muted = true;
    for (let i = 0; i < ff * 20; i++) update(0.05);
  }
}
