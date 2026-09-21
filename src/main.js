// Giriş noktası: yükleme, çevrimdışı kazanç, ana döngü
import { S, readSave, applySave, writeSave } from './state.js';
import { H, L, computeLayout, fmt } from './config.js';
import { ratePerSec, offlineEff, offlineCapH, eggValue, sellPrice,
         refillCost, refillRate, truckBonus, truckTier, fertileRate, chickOdds, consumeMult } from './economy.js';
import { spawnChicken, spawnChick, update, clampEntities, tryRefill } from './entities/index.js';
import { eggLooks } from './entities/eggs.js';
import { draw } from './render/index.js';
import { initInput, magnet } from './input.js';
import { buildShop, buildMarket, refreshShop, refreshUI, initPanel, initTopbar, SHOP, buyItem, buyDecor, openTab } from './shop.js';
import { initSettings } from './settings.js';
import { initMenu, menuOpen } from './menu.js';
import { initPrestige } from './prestige.js';
import { checkQuests, refreshQuestBar, QUESTS } from './quests.js';
import { collectManure } from './entities/manure.js';
import { SCENERY } from './decor.js';
import { scareFox } from './entities/fox.js';
import { catchButterfly } from './entities/events.js';
import { toast } from './toast.js';
import { buildBG } from './world.js';
import { cam, goToPage, syncCam } from './camera.js';
import { applyMobClass } from './mobile.js';

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const stage = document.getElementById('stage');

// ---- boyutlandırma: dünya genişliği sahneye göre ----
function resize() {
  applyMobClass(); // önce mobil düzen sınıfı — sahne ölçüsü ona göre değişir
  const r = stage.getBoundingClientRect();
  // yerleşim henüz oturmadıysa (CSS yükleniyor) sonraki karede tekrar dene;
  // L boşsa varsayılan boyutla doldur — spawn/çizim çökmez
  if (r.width < 10 || r.height < 10) {
    if (!L.PEN) computeLayout(660, 800);
    requestAnimationFrame(resize); return;
  }
  const lay = computeLayout(r.width, r.height);
  cv.width = lay.W; cv.height = H;
  ctx.imageSmoothingEnabled = false;
  // contain-fit: canvas sahneye sığsın — dar/dikey ekranda dünya kenarları
  // (nav okları, sürükleme şeridi) görünür kalır; genişte yükseklik belirler
  const s = Math.min(r.height / H, r.width / lay.W);
  cv.style.width = (lay.W * s) + 'px';
  cv.style.height = (H * s) + 'px';
  buildBG();
  syncCam();   // sayfa genişliği değişti — kamera aynı sayfada hizalanır
  clampEntities();
}
window.addEventListener('resize', resize);
window.addEventListener('load', resize); // stylesheet geç gelirse yerleşimi tazele
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
// eski kayıt: manzara alanı yok → oyuncu zaten hepsini görüyordu, toplu ver
if (S.scenery === null) {
  S.scenery = {};
  for (const id in SCENERY) S.scenery[id] = 1;
}
buildBG(); // kayıt/arsa durumuna göre çiftlik arka planını kur
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
initTopbar();
initSettings();
initMenu();
initPrestige();
buildShop();
buildMarket();
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
  if (!menuOpen()) { update(dt); draw(ctx, dt); } // menü tam ekran sahne — oyun arkada çizilmez
  uiT += dt;
  if (uiT > 0.25) { uiT = 0; refreshUI(); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// geliştirme: test.html bu kancayı kullanır
if (import.meta.env && import.meta.env.DEV) {
  window.GAME = { S, update, SHOP, buyItem, writeSave, L, spawnChicken, spawnChick, magnet,
                  QUESTS, checkQuests, refreshQuestBar, collectManure, cam, goToPage,
                  eggValue, sellPrice, refillCost, refillRate, tryRefill, truckBonus, fertileRate, chickOdds, consumeMult,
                  scareFox, catchButterfly, buyDecor, openTab, SCENERY, buildBG };
  // ?ff=30 → açılışta 30 saniye ileri sar (test/görsel kontrol)
  const q = new URLSearchParams(location.search);
  // ?scen=all veya ?scen=coop,pond → manzara hilesi
  const scenQ = q.get('scen');
  if (scenQ) {
    for (const id of (scenQ === 'all' ? Object.keys(SCENERY) : scenQ.split(',')))
      if (id in SCENERY) S.scenery[id] = 1;
    buildBG();
  }
  const ff = parseFloat(q.get('ff') || '0');
  // ?lvl=wash:2,belt:1 → seviye hilesi
  const lvls = (q.get('lvl') || '').split(',').filter(Boolean);
  for (const kv of lvls) {
    const [k, v] = kv.split(':');
    const n = parseInt(v) || 0;
    if (k === 'belt') { S.lvl.beltF = n; S.lvl.beltD = n; } // iki banda birden
    else if (k in S.lvl) S.lvl[k] = n;
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
  // ?floor=6 → görsel test: fabrika zeminine yumurta serp (kamyon toplar)
  const fl = parseInt(q.get('floor') || '0');
  for (let i = 0; i < fl; i++)
    S.eggs.push({ x: L.FX + 160 + i * 22 + Math.random() * 10, y: L.FLOOR_Y - 10, vy: 0, phase: 'floor',
                  tier: 'normal', valMult: 1, clean: false, wash: 0, polish: 0,
                  shine: false, graded: true, ...eggLooks() });
  // ?trucknow[=tier] → görsel test: aracı hemen yükleme pozisyonuna koy (lokal x)
  if (q.has('trucknow')) S.truck = { x: L.W * 0.35, state: 'arrive', cargo: 0, bags: 0, worth: 0,
    t: 1, bob: 0, dip: 0, tier: parseInt(q.get('trucknow')) || truckTier(S.lvl.truck) };
  // ?foxnow[=sneak|carry] → görsel test: tilkiyi hemen sahneye koy
  if (q.has('foxnow')) {
    const target = S.chickens[0];
    if (target) {
      const carry = q.get('foxnow') === 'carry';
      S.fox = { x: carry ? target.x + 30 : target.x + 120, y: target.y, state: carry ? 'flee' : 'sneak',
                t: 0, pause: false, dir: -1, target: carry ? null : target, scare: 0, carry: null };
      if (carry) { target.stolen = true; S.fox.carry = target; }
    }
  }
  // ?rainnow → görsel test: yağmuru hemen başlat; ?flynow → kelebek koy
  if (q.has('rainnow')) S.rain = { t: 60 };
  if (q.has('flynow')) S.butterfly = { x: L.PEN.x + L.PEN.w * 0.4, y: L.PEN.y + L.PEN.h * 0.4, t: 0, seed: 2 };
  // ?bags=3&bin=12 → görsel test: çuval stoğu + kova doluluğu
  if (q.get('bags') !== null) S.manureBags = parseInt(q.get('bags')) || 0;
  if (q.get('bin') !== null) S.manureBin = parseInt(q.get('bin')) || 0;
  // ?page=1 → fabrika sayfasında başlat (görsel test)
  if (q.get('page') === '1') { cam.page = 1; cam.x = cam.target = L.W; }
  // ?settings=1 → ayarlar modalını açık başlat (görsel test)
  if (q.has('settings')) document.getElementById('btnSettings').click();
  // ?panel=1 → pazar paneli açık başlar (initPanel uygular)
  // ?mag=1 → mıknatıs görselini sabit konumda aktif tut (görsel test, dünya x)
  if (q.has('mag')) {
    const mx = L.FX + L.W * 0.45, my = L.BELT2_Y - 40;
    setInterval(() => { magnet.active = true; magnet.x = mx; magnet.y = my; }, 100);
  }
  if (lvls.length || mny || ch) refreshShop();
  if (ff > 0) {
    S.muted = true;
    for (let i = 0; i < ff * 20; i++) update(0.05);
  }
}
