// Sahne çizimi — iki sayfalık dünya, kamera cam.x ile kayar.
// Katmanlar: çiftlik bg → fabrika bg (lokal uzay) → yumurtalar (dünya) →
// istasyon önleri → tavuklar → fx. HUD ve gezinme okları ekran uzayında.
import { L, H, fmt } from '../config.js';
import { S } from '../state.js';
import { SPR, drawSprite } from '../sprites/index.js';
import { bgFarm, bgFac } from '../world.js';
import { cam, navZones } from '../camera.js';
import { sellPrice, feedCap, waterCap, fedOk } from '../economy.js';
import { drag } from '../input.js';
import { drawMagnet } from './magnet.js';
import { drawBelts } from '../belts.js';
import { drawWashBack, drawWashFront, drawWashSlot } from './wash.js';
import { drawPolishBack, drawPolishFront, drawPolishSlot } from './polish.js';
import { drawGradeBack, drawGradeFront, drawGradeSlot } from './grade.js';
import { drawBrushBack, drawBrushFront, drawBrushSlot } from './brush.js';
import { drawAmbient } from './ambient.js';
import { drawDecor } from './decor.js';
import { drawTank } from './tanks.js';
import { drawCrate, drawCrateFront } from './crate.js';
import { drawRoad, drawDock, drawTruck } from './truck.js';
import { drawFactoryFX } from './facfx.js';
import { drawPiles, drawManureBin, drawBagStack, drawShovelCursor } from './manure.js';
import { drawParticles } from './fx.js';
import { drawFox } from './fox.js';
import { drawWorker } from './workers.js';
import { drawHint, setFps } from './hud.js';
import { chickenPose } from '../entities/chickens.js';

// çizim sırası taslak tamponları — her kare tahsis yerine yeniden kullanılır
const _eggOrder = [], _chSorted = [];

let fps = 60, fpsAcc = 0, fpsN = 0, fpsT = 0;

// ana içerik ölçeği — tam sayı çarpan: piksel bütünlüğü korunur
const CH_SC = 2;     // tavuk: 20px sprite → 40px
const TIER_SPR = {
  normal:  [SPR.eggDirty,        SPR.egg],
  bronze:  [SPR.eggBronzeDirty,  SPR.eggBronze],
  silver:  [SPR.eggSilverDirty,  SPR.eggSilver],
  gold:    [SPR.goldenEggDirty,  SPR.goldenEgg],
  diamond: [SPR.eggDiamondDirty, SPR.eggDiamond],
};

// gezinme okları + sayfa noktaları (ekran uzayı; bölgeler camera.js/navZones)
function drawNav(ctx) {
  const t = performance.now() / 1000;
  for (const z of navZones()) {
    const pu = 1.5 + Math.sin(t * 4) * 1.5; // hafif nabız
    ctx.fillStyle = 'rgba(20,14,26,.55)';
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.fillStyle = 'rgba(255,220,120,.85)';
    ctx.beginPath();
    const cx = z.x + z.w / 2, cy = z.y + z.h / 2;
    if (z.dir > 0) {
      ctx.moveTo(cx - 5 - pu * .3, cy - 10); ctx.lineTo(cx + 6 + pu, cy); ctx.lineTo(cx - 5 - pu * .3, cy + 10);
    } else {
      ctx.moveTo(cx + 5 + pu * .3, cy - 10); ctx.lineTo(cx - 6 - pu, cy); ctx.lineTo(cx + 5 + pu * .3, cy + 10);
    }
    ctx.closePath(); ctx.fill();
    ctx.font = 'bold 7px "Courier New",monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(240,230,240,.75)';
    ctx.fillText(z.dir > 0 ? 'FABRİKA' : 'ÇİFTLİK', cx, z.y + z.h + 9);
  }
  // sayfa noktaları — üst çubuğun hemen altında
  ctx.textAlign = 'center';
  for (let i = 0; i < 2; i++) {
    ctx.fillStyle = i === cam.page ? '#ffd23e' : 'rgba(240,230,240,.3)';
    ctx.beginPath(); ctx.arc(L.W / 2 - 10 + i * 20, L.HUD_H + 10, 4, 0, 7); ctx.fill();
  }
  ctx.textAlign = 'left';
}

export function draw(ctx, dt) {
  ctx.save();
  ctx.translate(-cam.x, 0); // kamera — dünya uzayı

  // ================= ÇİFTLİK sayfası (dünya x: 0..W) =================
  ctx.drawImage(bgFarm, 0, 0);
  if (S.fxAmbient) drawAmbient(ctx);
  drawDecor(ctx); // satın alınan kozmetik süsler — tavukların arkasında

  // yemlik & suluk (kümes zemini, tavukların arkasında)
  drawTank(ctx, L.FEED,  S.feed  / feedCap(),  'feed',  S.lvl.autoF);
  drawTank(ctx, L.WATER, S.water / waterCap(), 'water', S.lvl.autoW);

  // gübre haznesi + çuval istifi + yığınlar (çiftlik tarafı)
  drawManureBin(ctx);
  drawBagStack(ctx);
  drawPiles(ctx);

  // ================= FABRİKA sayfası (lokal uzay: translate(FX)) =================
  ctx.save();
  ctx.translate(L.FX, 0);
  ctx.drawImage(bgFac, 0, 0);
  drawRoad(ctx); // lojistik yolu — en altta, her şeyin arkasında
  drawDock(ctx); // yükleme iskelesi + sevkiyat tabelası

  // iki konveyör: çiftlik bandı (sola) + depolama bandı (sağa) — belts.js
  drawBelts(ctx);

  // süpürge (üst bant) — arka gövde yumurtaların arkasında
  if (S.lvl.brush > 0) drawBrushBack(ctx); else drawBrushSlot(ctx);

  // istasyon arka gövdeleri (alt bant üstü)
  if (S.lvl.wash > 0) drawWashBack(ctx); else drawWashSlot(ctx);
  if (S.lvl.grade > 0) drawGradeBack(ctx); else if (S.lvl.beltD > 0) drawGradeSlot(ctx);
  if (S.lvl.polish > 0) drawPolishBack(ctx); else if (S.lvl.wash > 0) drawPolishSlot(ctx);

  // paketleme kutusu (yumurta düşer düşmez satılır)
  drawCrate(ctx);
  ctx.restore();

  // ================= yumurtalar (DÜNYA uzayı: çiftlik zemini → kanal → bant) ==
  // kanal koridoru: boru yolunun her parçasının kapsadığı alan (kasa ±12 + dirsek
  // payı) — 'duct' fazındaki yumurtalar bu alana kırpılır, cam tüpten taşmaz
  let ductClip = null;
  const buildDuctClip = () => {
    if (ductClip) return ductClip;
    const p = new Path2D();
    const D = L.WD.duct;
    for (let i = 0; i + 1 < D.length; i++) {
      const [ax, ay] = D[i], [bx, by] = D[i + 1];
      p.rect(Math.min(ax, bx) - 13, Math.min(ay, by) - 13,
             Math.abs(bx - ax) + 26, Math.abs(by - ay) + 26);
    }
    return ductClip = p;
  };
  // sıralama taslakları — kare başına tahsis yerine tampon yeniden kullanımı
  _eggOrder.length = 0;
  for (const e of S.eggs) _eggOrder.push(e);
  const order = _eggOrder.sort((a, b) =>
    (a.phase === 'belt1' ? -a.x : a.x) - (b.phase === 'belt1' ? -b.x : b.x));
  for (const e of order) {
    const spr = (TIER_SPR[e.tier] || TIER_SPR.normal)[e.clean ? 1 : 0];
    const s = e.sc || 2, w = spr.w * s, h = spr.h * s;
    const rest = e.phase === 'belt1' || e.phase === 'belt2' || e.phase === 'floor'
              || e.phase === 'roll';
    // uç taşmasında yığılan yumurtalar katman katman yükselir; yükseklik
    // sınırlı, yığın büyüdükçe yanlara genişler (tepe olmaz)
    const pile = rest && (e.phase === 'belt1' || e.phase === 'belt2') ? e.pile || 0 : 0;
    const pl = Math.min(pile, 6);
    const px = pile ? (((e.seed || 0) * 7 | 0) % 2 ? 1 : -1) * (3 + Math.floor(pile / 3) * 4) : 0;
    const fy = e.y + 21 + (rest ? (e.jy || 0) - pl * 7 : 0); // dip hizası (fizik çapası ölçek-3'e göre)
    let rot = e.rot || 0;
    if (e.phase === 'belt1' || e.phase === 'belt2')
      rot += Math.sin(e.x * 0.32 + (e.seed || 0)) * 0.07;
    if (e.phase === 'duct') {
      // boru içinde — gölge yok, hafif yuvarlanma rotasyonu update'te
    } else if (rest) {
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.beginPath(); ctx.ellipse(e.x + px, fy + 1, w * 0.45, 2, 0, 0, 7); ctx.fill();
    } else if (e.phase !== 'held' && e.phase !== 'pulled' && e.phase !== 'in' && e.phase !== 'gone') {
      // düşen yumurta: hedef yüzeye yaklaştıkça beliren gölge
      const ty = e.phase === 'fall' ? (e.x < L.FX ? L.PEN_FLOOR - 4 : L.BELT1_Y + 5)
               : e.phase === 'fall2' ? L.BELT2_Y + 5
               : e.phase === 'boxfall' ? L.WD.crateZone.rimY + 2
               : L.FLOOR_Y - 4;
      const k = Math.max(0, Math.min(1, 1 - (ty - e.y) / 170));
      ctx.fillStyle = '#000'; ctx.globalAlpha = 0.2 * k;
      ctx.beginPath(); ctx.ellipse(e.x, ty, w * 0.42 * k + 2, 2.2, 0, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.save();
    if (e.phase === 'duct') ctx.clip(buildDuctClip()); // tüp koridoru dışına taşma
    ctx.translate(Math.round(e.x + px), Math.round(fy));
    ctx.rotate(rot);
    if (e.sq > 0) { // iniş ezilmesi
      const q = Math.sin(e.sq / 0.14 * Math.PI) * 0.22;
      ctx.scale(1 + q, 1 - q);
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spr.c, -w / 2, -h, w, h); // taban noktasından sallanır
    // kaba pislik — benekler + tabanda çamur bandı (süpürge kazır)
    if (e.dirt > 0) {
      const sd = e.seed || 0;
      ctx.globalAlpha = 0.35 + 0.45 * e.dirt;
      ctx.fillStyle = '#5e3f22';
      ctx.fillRect(-w * 0.3 + (sd % 4), -h * 0.68, 3, 3);
      ctx.fillRect(w * 0.1 - (sd % 3), -h * 0.44, 4, 3);
      if (e.dirt > 0.55) ctx.fillRect(-w * 0.06, -h * 0.86, 3, 2);
      ctx.fillRect(-w * 0.36, -h * 0.14, w * 0.72, Math.max(2, h * 0.1)); // çamur tabanı
      ctx.globalAlpha = 1;
    }
    // cila parıltısı — cilalanmış yumurta titreyen ışıltı taşır
    if (e.shine) {
      const gl = 0.45 + 0.4 * Math.sin(performance.now() / 240 + (e.seed || 0) * 9);
      ctx.globalAlpha = gl;
      ctx.fillStyle = '#fff';
      ctx.fillRect(-w * 0.22, -h * 0.74, 2, 2);
      ctx.fillRect(w * 0.08, -h * 0.52, 1, 1);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // istasyon ilerleme çubuğu — yıkanan/cilalanan yumurtanın üstünde
    const pr = e.wash > 0 ? 1 - e.wash / (e.washT || 1)
             : e.washM > 0 ? 1 - e.washM / (e.washT || 1)
             : e.polish > 0 ? 1 - e.polish / (e.polishT || 1) : -1;
    if (pr >= 0) {
      ctx.fillStyle = '#141020'; ctx.fillRect(e.x - 10, e.y - 4, 22, 6);
      ctx.fillStyle = '#2e2438'; ctx.fillRect(e.x - 9, e.y - 3, 20, 4);
      ctx.fillStyle = e.polish > 0 ? '#ffd23e' : '#6ad8ff';
      ctx.fillRect(e.x - 9, e.y - 3, Math.round(20 * Math.min(1, Math.max(0, pr))), 4);
    }
  }
  // hat dolu uyarısı — bant ucunda yumurtalar yığılmaya başlayınca yanıp söner
  const jamBlink = Math.floor(performance.now() / 300) % 2 === 0;
  if (jamBlink) {
    const jam = (x, y) => {
      ctx.fillStyle = '#1a1020';
      ctx.beginPath(); ctx.moveTo(x, y - 13); ctx.lineTo(x + 8, y + 1); ctx.lineTo(x - 8, y + 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd23e';
      ctx.beginPath(); ctx.moveTo(x, y - 11); ctx.lineTo(x + 6, y); ctx.lineTo(x - 6, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#241c2c';
      ctx.fillRect(x - 1, y - 8, 2, 5); ctx.fillRect(x - 1, y - 2, 2, 2);
    };
    if (S.eggs.some(e => e.phase === 'belt1' && (e.pile || 0) >= 2)) jam(L.WD.belt1lim + 2, L.BELT1_Y - 16);
    if (S.eggs.some(e => e.phase === 'belt2' && (e.pile || 0) >= 2)) jam(L.WD.beltX0 + 22, L.BELT2_Y - 16);
  }

  // ================= fabrika ön yüzleri + kamyon (lokal uzay) =================
  ctx.save();
  ctx.translate(L.FX, 0);
  // istasyon ön yüzleri: cam tünel + jetler/fırçalar (yumurta camın arkasında)
  if (S.lvl.brush > 0) drawBrushFront(ctx);
  if (S.lvl.wash > 0) drawWashFront(ctx);
  if (S.lvl.grade > 0) drawGradeFront(ctx);
  if (S.lvl.polish > 0) drawPolishFront(ctx);
  // kutu ön duvarı — içeri düşen yumurta bunun arkasında kaybolur
  drawCrateFront(ctx);
  // lojistik kamyonu (yolun üstünde, yumurtaların önünde)
  drawTruck(ctx);
  // fabrika canlı katmanı: dönen fan, durum LED'leri, buhar, toz
  drawFactoryFX(ctx);
  ctx.restore();

  // ================= tavuklar + civcivler (çiftlik tarafı) =================
  // tavuklar (y'ye göre sırala — derinlik); kare+ofsetler chickenPose'dan
  const hungry = !fedOk(); // yem veya su bitti — tavuklar üretemez
  _chSorted.length = 0;
  for (const ch of S.chickens) _chSorted.push(ch);
  for (const w of S.workers) _chSorted.push(w); // karakterler aynı derinlik düzeninde
  const sorted = _chSorted.sort((a, b) => a.y - b.y);
  for (const ch of sorted) {
    if (ch.role) { drawWorker(ctx, ch); continue; } // işçi/bakıcı
    if (ch.stolen) continue; // tilki ağzında — drawFox'ta çizilir
    const sprs = SPR.chickens[ch.variant] || SPR.chickens.white;
    const pose = chickenPose(ch);
    const spr = sprs[pose.f] || sprs.a;
    const w = spr.w * CH_SC, h = spr.h * CH_SC;
    // gölge — havaya kalkınca küçülüp soluklaşır
    const shK = Math.max(0.5, 1 + pose.lift / 55);
    ctx.fillStyle = '#000'; ctx.globalAlpha = 0.18 * Math.max(0.4, shK);
    ctx.beginPath(); ctx.ellipse(ch.x, ch.y + 2, 13 * shK, 4, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    // gövde taban noktasından çizilir — ezilme/yalpa ayak çapasından uygulanır
    ctx.save();
    ctx.translate(Math.round(ch.x), Math.round(ch.y));
    if (pose.lean) ctx.rotate(pose.lean); // dünya uzayında yalpa (dir işaretli)
    ctx.scale(pose.sx * (ch.dir < 0 ? -1 : 1), pose.sy);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spr.c, -w / 2, -h + pose.bob + pose.lift, w, h);
    ctx.restore();
    // açlık işareti: tavuğun ~üçte biri gösterir (kalabalıkta okunaklı kalır)
    if (hungry && !ch.drag && (S.chickens.indexOf(ch) % 3 === 0)) {
      const bt = Math.floor(performance.now() / 400) % 2 === 0;
      if (bt) {
        ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = '#241c2c'; ctx.fillText('!', ch.x + 1, ch.y - h - 3);
        ctx.fillStyle = '#ffb040'; ctx.fillText('!', ch.x, ch.y - h - 4);
      }
    }
  }

  // civcivler (küçük, tavuklardan sonra) — aynı bob yaklaşımı, tam sayı ölçek
  for (const c of S.chicks) {
    const spr = SPR.chick[c.frame] || SPR.chick.a;
    ctx.fillStyle = 'rgba(0,0,0,.15)';
    ctx.beginPath(); ctx.ellipse(c.x, c.y + 1, 6, 2.5, 0, 0, 7); ctx.fill();
    const cb = c.state === 'walk' ? -Math.abs(Math.sin(c.frameT * 10 * Math.PI)) * 1.5
                                  : Math.sin(c.frameT * 3) * 0.5;
    drawSprite(ctx, spr, c.x - 8, c.y - 12 + cb, 2, c.dir < 0);
  }

  // tilki baskını — tavukların üstünde, taşınan tavukla beraber
  drawFox(ctx);

  // sürüklenen tavuğun fiyat etiketi
  const d = drag.current;
  if (d && d.moved) {
    ctx.font = 'bold 14px "Courier New",monospace';
    ctx.fillStyle = '#ffd23e'; ctx.textAlign = 'center';
    ctx.fillText('$' + fmt(sellPrice(d.ch.breed)), d.ch.x, d.ch.y - 46);
  }

  // parçacıklar (dünya uzayı)
  drawParticles(ctx);
  // mıknatıs aracı (alan halkası + nal + toplam değer)
  drawMagnet(ctx);
  // gübre yığını üstünde kürek imleci
  drawShovelCursor(ctx);
  // ipucu balonları (dünya uzayı — sayfa içeriğine bağlı)
  drawHint(ctx);
  ctx.restore();

  // ================= ekran uzayı: gezinme + HUD =================
  drawNav(ctx);
  setFps(fps); // üst bar DOM'da — FPS ölçümünü kanala yaz

  // fps ölçümü
  fpsAcc += 1 / Math.max(dt, 1e-4); fpsN++; fpsT += dt;
  if (fpsT > 0.5) { fps = Math.round(fpsAcc / fpsN); fpsAcc = 0; fpsN = 0; fpsT = 0; }
}
