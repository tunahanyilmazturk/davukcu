// Süpürge: üst bandı aşan dönen rulo fırça — borudan gelen yumurtaların
// kaba kirini kazır. Arka parça: tavan askısı + motor gövdesi + seviye
// LED'leri; ön parça: yumurtaların üstünde dönen fırça rulosu.
import { L, MAXL } from '../config.js';
import { S } from '../state.js';
import { brushHalf } from '../economy.js';

const BX = () => L.BRUSH_X; // fabrika-lokal x

// arka: tavandan sarkan askı + motor kutusu + isim etiketi (yumurtaların arkasında)
export function drawBrushBack(ctx) {
  const bx = BX(), by = L.BELT1_Y;
  const t = performance.now() / 1000;
  const half = brushHalf();

  // tavan askısı
  ctx.fillStyle = '#141020';
  ctx.fillRect(bx - 4, by - 118, 10, 66);
  ctx.fillStyle = '#2e3a48';
  ctx.fillRect(bx - 3, by - 117, 8, 65);
  ctx.fillStyle = '#46586c';
  ctx.fillRect(bx - 2, by - 115, 2, 60);

  // motor gövdesi
  const mw = half * 2 + 14;
  ctx.fillStyle = '#141020'; ctx.fillRect(bx - mw / 2 - 1, by - 55, mw + 2, 26);
  ctx.fillStyle = '#6a5230'; ctx.fillRect(bx - mw / 2, by - 54, mw, 24);
  ctx.fillStyle = '#8a6a40'; ctx.fillRect(bx - mw / 2, by - 54, mw, 3);
  ctx.fillStyle = '#54401f'; ctx.fillRect(bx - mw / 2, by - 34, mw, 4);
  // havalandırma ızgarası
  ctx.fillStyle = '#3a2c18';
  for (let i = 0; i < 4; i++) ctx.fillRect(bx - mw / 2 + 5 + i * 7, by - 50, 4, 8);

  // etiket + seviye LED'leri
  ctx.fillStyle = '#f0d8a0';
  ctx.font = 'bold 8px "Courier New",monospace'; ctx.textAlign = 'left';
  ctx.fillText('SÜPÜRGE', bx - mw / 2 + 34, by - 44);
  for (let i = 0; i < MAXL.brush; i++) {
    ctx.fillStyle = i < S.lvl.brush ? '#8aff6a' : '#1c2a1c';
    ctx.fillRect(bx - mw / 2 + 34 + i * 8, by - 40, 5, 3);
  }
  // çalışma lambası: kirli yumurta altındayken yanıp söner
  const working = S.eggs.some(e => e.phase === 'belt1' && e.dirt > 0
    && Math.abs(e.x - L.WD.brushX) < half);
  ctx.fillStyle = working && Math.floor(t * 7) % 2 ? '#8aff6a' : '#2c5a28';
  ctx.fillRect(bx + mw / 2 - 9, by - 51, 5, 5);
}

// ön: dönen rulo fırça — kıllar yumurta tepesine değer (yumurtaların üstüne çizilir)
export function drawBrushFront(ctx) {
  const bx = BX(), ry = L.BELT1_Y - 14; // rulo merkezi
  const t = performance.now() / 1000;
  const R = 12, spin = t * 9;

  // rulo gövdesi
  ctx.fillStyle = '#141020';
  ctx.beginPath(); ctx.arc(bx, ry, R + 2, 0, 7); ctx.fill();
  ctx.fillStyle = '#b8863c';
  ctx.beginPath(); ctx.arc(bx, ry, R, 0, 7); ctx.fill();
  // kıl demetleri — döner
  ctx.strokeStyle = '#8a6428'; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = spin + i * Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(bx + Math.cos(a) * 3, ry + Math.sin(a) * 3);
    ctx.lineTo(bx + Math.cos(a) * (R + 3), ry + Math.sin(a) * (R + 3));
    ctx.stroke();
  }
  // göbek
  ctx.fillStyle = '#54401f';
  ctx.beginPath(); ctx.arc(bx, ry, 5, 0, 7); ctx.fill();
  ctx.fillStyle = '#8a6a40';
  ctx.beginPath(); ctx.arc(bx, ry, 2, 0, 7); ctx.fill();
}

// kurulu değilken boş yuva işareti
export function drawBrushSlot(ctx) {
  const bx = BX();
  ctx.strokeStyle = 'rgba(232,224,232,.28)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(bx - 20, L.BELT1_Y - 52, 40, 44);
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(232,224,232,.35)';
  ctx.font = 'bold 9px "Courier New",monospace'; ctx.textAlign = 'center';
  ctx.fillText('BOŞ YUVA', bx, L.BELT1_Y - 28);
}
