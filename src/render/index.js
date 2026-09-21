// Sahne çizimi — katman sırası burada yönetilir
import { L, fmt } from '../config.js';
import { S } from '../state.js';
import { SPR, drawSprite } from '../sprites/index.js';
import { bg } from '../world.js';
import { sellPrice, feedCap, waterCap, fedOk } from '../economy.js';
import { drag } from '../input.js';
import { drawMagnet } from './magnet.js';
import { drawBelts } from '../belts.js';
import { drawWashBack, drawWashFront, drawWashSlot } from './wash.js';
import { drawPolishBack, drawPolishFront, drawPolishSlot } from './polish.js';
import { drawGradeBack, drawGradeFront, drawGradeSlot } from './grade.js';
import { drawAmbient } from './ambient.js';
import { drawTank } from './tanks.js';
import { drawCrate, drawCrateFront } from './crate.js';
import { drawRoad, drawTruck } from './truck.js';
import { drawPiles, drawManureBin, drawBagStack, drawShovelCursor } from './manure.js';
import { drawParticles } from './fx.js';
import { drawHint, drawHud } from './hud.js';
import { chickenPose } from '../entities/chickens.js';

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

export function draw(ctx, dt) {
  ctx.drawImage(bg, 0, 0);
  if (S.fxAmbient) drawAmbient(ctx);
  drawRoad(ctx); // lojistik yolu — en altta, her şeyin arkasında

  // iki konveyör: çiftlik bandı (sola) + depolama bandı (sağa) — belts.js
  drawBelts(ctx);

  // istasyon arka gövdeleri (alt bant üstü)
  if (S.lvl.wash > 0) drawWashBack(ctx); else drawWashSlot(ctx);
  if (S.lvl.grade > 0) drawGradeBack(ctx); else if (S.lvl.beltD > 0) drawGradeSlot(ctx);
  if (S.lvl.polish > 0) drawPolishBack(ctx); else if (S.lvl.wash > 0) drawPolishSlot(ctx);

  // paketleme kutusu (yumurta düşer düşmez satılır)
  drawCrate(ctx);

  // düşen + banttaki yumurtalar — öndeki en son çizilir (üst üste binebilir),
  // her yumurtanın kendi boyutu/eğimi var; banttakiler x'e bağlı hafif sallanır
  const order = [...S.eggs].sort((a, b) =>
    (a.phase === 'belt1' ? -a.x : a.x) - (b.phase === 'belt1' ? -b.x : b.x));
  for (const e of order) {
    const spr = (TIER_SPR[e.tier] || TIER_SPR.normal)[e.clean ? 1 : 0];
    const s = e.sc || 2, w = spr.w * s, h = spr.h * s;
    const rest = e.phase === 'belt1' || e.phase === 'belt2' || e.phase === 'floor';
    // uç taşmasında yığılan yumurtalar katman katman yükselir; yükseklik
    // sınırlı, yığın büyüdükçe yanlara genişler (tepe olmaz)
    const pile = rest && e.phase !== 'floor' ? e.pile || 0 : 0;
    const pl = Math.min(pile, 6);
    const px = pile ? (((e.seed || 0) * 7 | 0) % 2 ? 1 : -1) * (3 + Math.floor(pile / 3) * 4) : 0;
    const fy = e.y + 21 + (rest ? (e.jy || 0) - pl * 7 : 0); // dip hizası (fizik çapası ölçek-3'e göre)
    let rot = e.rot || 0;
    if (e.phase === 'belt1' || e.phase === 'belt2')
      rot += Math.sin(e.x * 0.32 + (e.seed || 0)) * 0.07;
    if (rest) {
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.beginPath(); ctx.ellipse(e.x + px, fy + 1, w * 0.45, 2, 0, 0, 7); ctx.fill();
    } else if (e.phase !== 'held' && e.phase !== 'pulled' && e.phase !== 'in' && e.phase !== 'gone') {
      // düşen yumurta: hedef yüzeye yaklaştıkça beliren gölge
      const ty = e.phase === 'fall' ? L.BELT1_Y + 5
               : e.phase === 'fall2' ? L.BELT2_Y + 5
               : e.phase === 'boxfall' ? L.CRATE_ZONE.rimY + 2
               : L.FLOOR_Y - 4;
      const k = Math.max(0, Math.min(1, 1 - (ty - e.y) / 170));
      ctx.fillStyle = `rgba(0,0,0,${(0.2 * k).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(e.x, ty, w * 0.42 * k + 2, 2.2, 0, 0, 7); ctx.fill();
    }
    ctx.save();
    ctx.translate(Math.round(e.x + px), Math.round(fy));
    ctx.rotate(rot);
    if (e.sq > 0) { // iniş ezilmesi
      const q = Math.sin(e.sq / 0.14 * Math.PI) * 0.22;
      ctx.scale(1 + q, 1 - q);
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spr.c, -w / 2, -h, w, h); // taban noktasından sallanır
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
    if (S.eggs.some(e => e.phase === 'belt1' && (e.pile || 0) >= 2)) jam(L.BELT1_LIMIT + 2, L.BELT1_Y - 16);
    if (S.eggs.some(e => e.phase === 'belt2' && (e.pile || 0) >= 2)) jam(L.BELT_X0 + 22, L.BELT2_Y - 16);
  }

  // istasyon ön yüzleri: cam tünel + jetler/fırçalar (yumurta camın arkasında)
  if (S.lvl.wash > 0) drawWashFront(ctx);
  if (S.lvl.grade > 0) drawGradeFront(ctx);
  if (S.lvl.polish > 0) drawPolishFront(ctx);
  // kutu ön duvarı — içeri düşen yumurta bunun arkasında kaybolur
  drawCrateFront(ctx);

  // yemlik & suluk (kümes zemini, tavukların arkasında)
  drawTank(ctx, L.FEED,  S.feed  / feedCap(),  'feed',  S.lvl.autoF);
  drawTank(ctx, L.WATER, S.water / waterCap(), 'water', S.lvl.autoW);

  // gübre haznesi + çuval istifi (kümes üst kenarı, tavukların arkasında)
  drawManureBin(ctx);
  drawBagStack(ctx);
  // gübre yığınları — kümes zemini, tavukların altında/arkasında
  drawPiles(ctx);

  // tavuklar (y'ye göre sırala — derinlik); kare+ofsetler chickenPose'dan
  const hungry = !fedOk(); // yem veya su bitti — tavuklar üretemez
  const sorted = [...S.chickens].sort((a, b) => a.y - b.y);
  for (const ch of sorted) {
    const sprs = SPR.chickens[ch.variant] || SPR.chickens.white;
    const pose = chickenPose(ch);
    const spr = sprs[pose.f] || sprs.a;
    const w = spr.w * CH_SC, h = spr.h * CH_SC;
    // gölge — havaya kalkınca küçülüp soluklaşır
    const shK = Math.max(0.5, 1 + pose.lift / 55);
    ctx.fillStyle = `rgba(0,0,0,${(0.18 * Math.max(0.4, shK)).toFixed(3)})`;
    ctx.beginPath(); ctx.ellipse(ch.x, ch.y + 2, 13 * shK, 4, 0, 0, 7); ctx.fill();
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

  // sürüklenen tavuğun fiyat etiketi
  const d = drag.current;
  if (d && d.moved) {
    ctx.font = 'bold 14px "Courier New",monospace';
    ctx.fillStyle = '#ffd23e'; ctx.textAlign = 'center';
    ctx.fillText('$' + fmt(sellPrice(d.ch.breed)), d.ch.x, d.ch.y - 46);
  }

  // lojistik kamyonu (yolun üstünde, yumurtaların önünde)
  drawTruck(ctx);

  // parçacıklar
  drawParticles(ctx);

  // mıknatıs aracı (alan halkası + nal + toplam değer)
  drawMagnet(ctx);
  // gübre yığını üstünde kürek imleci
  drawShovelCursor(ctx);

  // ipucu balonu + üst bilgi çubuğu
  drawHint(ctx);
  drawHud(ctx, fps);

  // fps ölçümü
  fpsAcc += 1 / Math.max(dt, 1e-4); fpsN++; fpsT += dt;
  if (fpsT > 0.5) { fps = Math.round(fpsAcc / fpsN); fpsAcc = 0; fpsN = 0; fpsT = 0; }
}
