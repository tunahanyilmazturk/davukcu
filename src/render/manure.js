// Gübre zinciri görselleri: kümesteki yığınlar, üst kenardaki toplama
// haznesi (kova), yanında istiflenen çuvallar, yığın üstünde kürek imleci
import { L, BAG_AT } from '../config.js';
import { S } from '../state.js';
import { SPR, drawSprite } from '../sprites/index.js';
import { pointer, drag, magnet } from '../input.js';
import { manureAt } from '../entities/manure.js';

// yığınlar — kümes zemini, tavukların altında (x0.8 küçültülmüş)
export function drawPiles(ctx) {
  const hov = (!drag.current && !magnet.active) ? manureAt(pointer.x, pointer.y) : null;
  for (const m of S.manures) {
    const sw = Math.sin(m.seed || 0) * 1.6;
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    ctx.beginPath(); ctx.ellipse(m.x, m.y + 2, 7, 2.4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#5a4028';
    ctx.fillRect(m.x - 6 + sw, m.y - 3, 11, 5);
    ctx.fillRect(m.x - 4 + sw, m.y - 6, 8, 3);
    ctx.fillRect(m.x - 2 + sw, m.y - 9, 4, 3);
    ctx.fillStyle = '#7a5a38';
    ctx.fillRect(m.x - 5 + sw, m.y - 3, 3, 2);
    ctx.fillRect(m.x - 2 + sw, m.y - 6, 2, 1);
    // kürek imleci hedefi — imleç gizli olduğundan yığın konturlanır
    if (m === hov) {
      ctx.strokeStyle = 'rgba(255,230,150,.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(m.x - 8 + sw), m.y - 11, 15, 13);
    }
  }
}

// gübre haznesi: ahşap kova — iç doluluk manureBin/BAG_AT ile yükselir,
// üstünde "n/20" sayacı
export function drawManureBin(ctx) {
  const b = L.MANURE_BIN;
  // sayaç — haznenin üstünde
  ctx.font = 'bold 9px "Courier New",monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#241c14';
  ctx.fillText(S.manureBin + '/' + BAG_AT, b.x + b.w / 2 + 1, b.y - 4);
  ctx.fillStyle = S.manureBin >= BAG_AT - 5 ? '#ffd23e' : '#e8d8b0';
  ctx.fillText(S.manureBin + '/' + BAG_AT, b.x + b.w / 2, b.y - 5);

  // ayaklar
  ctx.fillStyle = '#2a1c10';
  ctx.fillRect(b.x + 4, b.y + b.h - 4, 4, 7);
  ctx.fillRect(b.x + b.w - 8, b.y + b.h - 4, 4, 7);
  // gövde: koyu çerçeve + ahşap ön duvar
  ctx.fillStyle = '#241610';
  ctx.fillRect(b.x - 1, b.y - 1, b.w + 2, b.h - 2);
  ctx.fillStyle = '#6a4a30';
  ctx.fillRect(b.x, b.y + 8, b.w, b.h - 12);
  ctx.fillStyle = '#8a5a30';
  ctx.fillRect(b.x, b.y + 8, b.w, 2);
  // tahta derzleri
  ctx.fillStyle = '#4a2e1c';
  for (let x = b.x + 10; x < b.x + b.w - 4; x += 12) ctx.fillRect(x, b.y + 10, 2, b.h - 14);
  // iç boşluk (üstten görünen) + gübre dolgusu
  const ix = b.x + 4, iw = b.w - 8, iy = b.y + 2, ih = 8;
  ctx.fillStyle = '#1c120a';
  ctx.fillRect(ix, iy, iw, ih);
  const fh = Math.round(ih * Math.min(1, S.manureBin / BAG_AT));
  if (fh > 0) {
    ctx.fillStyle = '#5a4028';
    ctx.fillRect(ix, iy + ih - fh, iw, fh);
    ctx.fillStyle = '#7a5a38';
    ctx.fillRect(ix, iy + ih - fh, iw, 1);
  }
  // üst kenar rayı
  ctx.fillStyle = '#8a5a30';
  ctx.fillRect(b.x - 2, b.y, b.w + 4, 3);
  ctx.fillStyle = '#b07840';
  ctx.fillRect(b.x - 2, b.y, b.w + 4, 1);
}

// çuval istifi — haznenin sağında, ince ahşap raf üstünde; çoksa ×n rozeti
export function drawBagStack(ctx) {
  const n = S.manureBags;
  if (n <= 0) return;
  const st = L.BAG_STACK;
  const shown = Math.min(n, 4);
  // raf
  ctx.fillStyle = '#3a2416';
  ctx.fillRect(st.x - 4, st.y, shown * 22 + 8, 4);
  ctx.fillStyle = '#5c3c24';
  ctx.fillRect(st.x - 4, st.y, shown * 22 + 8, 2);
  for (let i = 0; i < shown; i++) {
    drawSprite(ctx, SPR.bag, st.x + i * 22, st.y - 22, 2);
  }
  if (n > shown) {
    ctx.font = 'bold 10px "Courier New",monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#241c14';
    ctx.fillText('×' + n, st.x + shown * 22 + 3, st.y - 8);
    ctx.fillStyle = '#e8d8b0';
    ctx.fillText('×' + n, st.x + shown * 22 + 2, st.y - 9);
  }
}

// kürek imleci — yığın üstündeyken sistem imleci gizlenir, kürek çizilir
// (işlevsel imleç: fxParts ayarından bağımsız, mıknatıs nalı deseni gibi)
export function drawShovelCursor(ctx) {
  if (drag.current || magnet.active) return;
  if (pointer.x < 0 || !manureAt(pointer.x, pointer.y)) return;
  ctx.save();
  ctx.translate(pointer.x, pointer.y);
  ctx.rotate(Math.sin(performance.now() / 300) * 0.06);
  drawSprite(ctx, SPR.shovel, -10, -26, 2);
  ctx.restore();
}
