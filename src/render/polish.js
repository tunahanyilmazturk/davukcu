// Cila makinesi: yıkama sonrası parlatma istasyonu — bakır/yeşil tema,
// dönen fırça silindirleri ve parıltı efektleri
import { L, MAXL } from '../config.js';
import { S } from '../state.js';

const POL_W = 54;
const polSX = () => L.POLISH_X - POL_W / 2;

// arka: gövde + üst hazne + LED'ler + zemin detayı
export function drawPolishBack(ctx) {
  const sx = polSX(), W = POL_W;
  const top = L.BELT2_Y - 66, uh = 46;
  const cavTop = L.BELT2_Y - 20;
  const t = performance.now() / 1000;
  const anyPol = S.eggs.some(e => e.polish > 0);

  // zemin: parlatıcı birikintisi (kehribar)
  ctx.fillStyle = 'rgba(232,180,80,.16)';
  ctx.beginPath(); ctx.ellipse(L.POLISH_X, L.FLOOR_Y - 2, 20, 4, 0, 0, 7); ctx.fill();

  // boşluk tavanı
  ctx.fillStyle = '#181018';
  ctx.fillRect(sx + 8, cavTop, W - 16, 8);

  // ---- üst ünite ----
  ctx.fillStyle = '#1a1018';
  ctx.fillRect(sx - 5, top - 1, W + 10, uh + 2);
  ctx.fillStyle = '#3e2c20';
  ctx.fillRect(sx - 4, top, W + 8, uh);
  ctx.fillStyle = '#5c442e';
  ctx.fillRect(sx - 4, top, W + 8, 3);
  ctx.fillStyle = '#2c1e14';
  ctx.fillRect(sx - 4, top + uh - 4, W + 8, 4);

  // üstte dönen büyük dişli (polish motoru)
  const gx = sx + W - 12, gy = top + 12, gr = 7;
  ctx.fillStyle = '#241a10';
  ctx.beginPath(); ctx.arc(gx, gy, gr + 2, 0, 7); ctx.fill();
  ctx.fillStyle = '#c08a40';
  ctx.beginPath(); ctx.arc(gx, gy, gr, 0, 7); ctx.fill();
  ctx.fillStyle = '#8a5c24';
  for (let i = 0; i < 4; i++) {
    const a = t * 2.4 + i * Math.PI / 2;
    ctx.fillRect(gx + Math.cos(a) * gr - 1.5, gy + Math.sin(a) * gr - 1.5, 3, 3);
  }
  ctx.fillStyle = '#241a10';
  ctx.fillRect(gx - 1, gy - 1, 3, 3);

  // ön panel: etiket + LED'ler + durum lambası
  ctx.fillStyle = '#2e2218';
  ctx.fillRect(sx + 6, top + 24, 42, 15);
  ctx.fillStyle = '#ffd88a';
  ctx.font = 'bold 8px "Courier New",monospace'; ctx.textAlign = 'left';
  ctx.fillText('CİLA', sx + 9, top + 33);
  for (let i = 0; i < MAXL.polish; i++) {
    ctx.fillStyle = i < S.lvl.polish ? '#ffd23e' : '#332a1c';
    ctx.fillRect(sx + 9 + i * 7, top + 35, 5, 3);
  }
  ctx.fillStyle = anyPol && Math.floor(t * 6) % 2 ? '#ffd23e' : '#5a4a28';
  ctx.fillRect(sx + W - 11, top + 26, 5, 5);

  // fırça besleme barı
  ctx.fillStyle = '#1a1018';
  ctx.fillRect(sx + 4, top + uh - 10, W - 8, 10);
  ctx.fillStyle = '#4a3826';
  ctx.fillRect(sx + 4, top + uh - 10, W - 8, 7);
  // uyarı şeridi (turuncu-siyah)
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? '#e8a040' : '#241a12';
    ctx.fillRect(sx + 4 + i * 8, top + uh - 2, 8, 2);
  }
}

// ön: kolonlar + dönen fırçalar + parıltılar — yumurtaların ÜSTÜNE
export function drawPolishFront(ctx) {
  const sx = polSX(), W = POL_W;
  const cavTop = L.BELT2_Y - 20;
  const glassBot = L.BELT2_Y + L.BELT_H + 8;
  const t = performance.now() / 1000;
  const anyPol = S.eggs.some(e => e.polish > 0);

  // ön kolonlar
  for (const cx of [sx - 6, sx + W - 6]) {
    ctx.fillStyle = '#1a1018';
    ctx.fillRect(cx - 1, cavTop - 1, 14, L.FLOOR_Y - cavTop + 1);
    ctx.fillStyle = '#3e2c20';
    ctx.fillRect(cx, cavTop, 12, L.FLOOR_Y - cavTop);
    ctx.fillStyle = '#5c442e';
    ctx.fillRect(cx + 1, cavTop + 2, 3, L.FLOOR_Y - cavTop - 4);
    ctx.fillStyle = '#1a1018';
    ctx.fillRect(cx - 3, L.FLOOR_Y - 4, 18, 4);
  }

  // cam bölme
  ctx.fillStyle = 'rgba(240,200,140,.08)';
  ctx.fillRect(sx + 6, cavTop, W - 12, glassBot - cavTop);
  ctx.fillStyle = 'rgba(255,220,170,.25)';
  ctx.fillRect(sx + 6, cavTop, 2, glassBot - cavTop);
  ctx.fillRect(sx + W - 8, cavTop, 2, glassBot - cavTop);

  // dönen fırça silindirleri (3 adet, asılı)
  for (let i = 0; i < 3; i++) {
    const bx = sx + 12 + i * 15, by = cavTop + 7;
    ctx.fillStyle = '#241a10';
    ctx.fillRect(bx - 4, by - 3, 9, 10);
    ctx.fillStyle = '#c08040';
    ctx.fillRect(bx - 3, by - 2, 7, 8);
    // dönüş işareti
    ctx.fillStyle = '#7a4c20';
    const ph = (t * (anyPol ? 10 : 2) + i) % 1;
    ctx.fillRect(bx - 3, by - 2 + Math.floor(ph * 8), 7, 2);
  }

  if (anyPol) {
    // parıltı kıvılcımları
    for (let i = 0; i < 5; i++) {
      const a = t * 6 + i * 1.3;
      const px = L.POLISH_X + Math.cos(a) * (8 + i * 2);
      const py = L.BELT2_Y - 10 + Math.sin(a * 1.7) * 5;
      ctx.fillStyle = i % 2 ? '#fff8d8' : '#ffd23e';
      ctx.fillRect(px, py, 2, 2);
    }
  } else {
    // boşta zayıf parıltı kırpması
    if (Math.floor(t * 2) % 3 === 0) {
      ctx.fillStyle = 'rgba(255,220,140,.5)';
      ctx.fillRect(L.POLISH_X - 2, L.BELT2_Y - 12, 3, 3);
    }
  }
}

// kurulu değilken boş yuva işareti
export function drawPolishSlot(ctx) {
  const sx = polSX();
  ctx.strokeStyle = 'rgba(232,200,150,.22)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(sx + 6, L.BELT2_Y - 42, POL_W - 12, 36);
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(232,200,150,.3)';
  ctx.font = 'bold 9px "Courier New",monospace'; ctx.textAlign = 'center';
  ctx.fillText('CİLA YUVASI', L.POLISH_X, L.BELT2_Y - 22);
}
