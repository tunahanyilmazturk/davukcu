// Yıkama makinesi: bandı aşan cam tünel — arka gövde + ön cam/jetler
import { L, MAXL } from '../config.js';
import { S } from '../state.js';

const WASH_W = 64;
const washSX = () => L.WASH_X - WASH_W / 2;

// arka parçalar: üst ünite (depo + panel + püskürtme barı), zemin detayı
export function drawWashBack(ctx) {
  const sx = washSX(), W = WASH_W;
  const top = L.BELT2_Y - 74, uh = 54;           // üst ünite — kompakt
  const cavTop = L.BELT2_Y - 20;                 // cam boşluk tavanı
  const t = performance.now() / 1000;
  const anyWashing = S.eggs.some(e => e.wash > 0 || e.washM > 0);

  // zeminde su birikintisi + gider ızgarası
  ctx.fillStyle = 'rgba(106,184,240,.22)';
  ctx.beginPath(); ctx.ellipse(L.WASH_X, L.FLOOR_Y - 2, 26, 4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#1a1420';
  ctx.fillRect(sx + 15, L.FLOOR_Y - 6, 34, 6);
  ctx.fillStyle = '#2e2438';
  for (let x = sx + 18; x < sx + 47; x += 7) ctx.fillRect(x, L.FLOOR_Y - 5, 4, 4);

  // boşluk tavanı gölgesi
  ctx.fillStyle = '#141020';
  ctx.fillRect(sx + 8, cavTop, W - 16, 8);

  // ---- üst ünite gövdesi ----
  ctx.fillStyle = '#1a1420';
  ctx.fillRect(sx - 5, top - 1, W + 10, uh + 2);
  ctx.fillStyle = '#2e3a48';
  ctx.fillRect(sx - 4, top, W + 8, uh);
  ctx.fillStyle = '#46586c';
  ctx.fillRect(sx - 4, top, W + 8, 3);
  ctx.fillStyle = '#222c38';
  ctx.fillRect(sx - 4, top + uh - 4, W + 8, 4);
  // yan boru (depodan aşağı su hattı)
  ctx.fillStyle = '#1a1420';
  ctx.fillRect(sx + W - 2, top + 8, 7, uh - 20);
  ctx.fillStyle = '#34414f';
  ctx.fillRect(sx + W - 1, top + 9, 5, uh - 22);
  ctx.fillStyle = '#4aa0e0';
  ctx.fillRect(sx + W, top + 10 + Math.floor((t * 20) % (uh - 34)), 3, 4);

  // ---- su deposu: cam hazne, dalgalı su, kabarcıklar ----
  const tx = sx + 8, tw = W - 16, ty = top + 5, th = 19;
  ctx.fillStyle = '#141c28'; ctx.fillRect(tx - 2, ty - 2, tw + 4, th + 4);
  ctx.fillStyle = '#22303e'; ctx.fillRect(tx, ty, tw, th);
  const wl = ty + 7;
  ctx.fillStyle = '#2e6ea8';
  ctx.fillRect(tx + 1, wl, tw - 2, ty + th - wl - 1);
  ctx.fillStyle = '#4aa0e0';
  for (let i = 0; i < 6; i++) {
    const wx = tx + 1 + i * 8;
    const wy = wl + Math.round(Math.sin(t * 3 + i * 1.3) * 1.5);
    ctx.fillRect(wx, wy, 8, 2);
  }
  ctx.fillStyle = 'rgba(180,225,255,.5)';
  for (let i = 0; i < 3; i++) {
    const by = ty + th - 3 - ((t * 12 + i * 6) % (th - 9));
    ctx.fillRect(tx + 7 + i * 14, by, 3, 3);
  }
  ctx.fillStyle = 'rgba(200,230,255,.18)';
  ctx.fillRect(tx + 2, ty + 2, 4, th - 4);

  // ---- ön panel: etiket + seviye LED'leri + durum lambası ----
  ctx.fillStyle = '#26313e';
  ctx.fillRect(sx + 8, top + 28, 48, 16);
  ctx.fillStyle = '#8fd8ff';
  ctx.font = 'bold 8px "Courier New",monospace'; ctx.textAlign = 'left';
  ctx.fillText('YIKAMA', sx + 11, top + 36);
  for (let i = 0; i < MAXL.wash; i++) {
    ctx.fillStyle = i < S.lvl.wash ? '#8aff6a' : '#1c2a1c';
    ctx.fillRect(sx + 11 + i * 8, top + 39, 5, 3);
  }
  ctx.fillStyle = anyWashing && Math.floor(t * 6) % 2 ? '#8aff6a' : '#2c5a28';
  ctx.fillRect(sx + W - 11, top + 30, 5, 5);

  // ---- püskürtme barı + nozullar ----
  ctx.fillStyle = '#1a1420';
  ctx.fillRect(sx + 4, top + uh - 12, W - 8, 12);
  ctx.fillStyle = '#34414f';
  ctx.fillRect(sx + 4, top + uh - 12, W - 8, 8);
  ctx.fillStyle = '#141c28';
  for (let i = 0; i < 4; i++) {
    const nx = sx + 13 + i * 13;
    ctx.fillRect(nx, top + uh - 4, 6, 4);
    ctx.fillRect(nx + 1, top + uh, 4, 3);
  }
  // uyarı şeridi
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = i % 2 ? '#ffd23e' : '#2c2430';
    ctx.fillRect(sx + 4 + i * 8, top + uh - 2, 8, 2);
  }
}

// ön parçalar: kolonlar, cam tünel, su jetleri — yumurtaların ÜSTÜNE çizilir
export function drawWashFront(ctx) {
  const sx = washSX(), W = WASH_W;
  const cavTop = L.BELT2_Y - 20;
  const glassBot = L.BELT2_Y + L.BELT_H + 8;
  const t = performance.now() / 1000;
  const anyWashing = S.eggs.some(e => e.wash > 0 || e.washM > 0);

  // ön kolonlar (bandı aşar, zemine iner)
  for (const cx of [sx - 6, sx + W - 6]) {
    ctx.fillStyle = '#1a1420';
    ctx.fillRect(cx - 1, cavTop - 1, 14, L.FLOOR_Y - cavTop + 1);
    ctx.fillStyle = '#2e3a48';
    ctx.fillRect(cx, cavTop, 12, L.FLOOR_Y - cavTop);
    ctx.fillStyle = '#46586c';
    ctx.fillRect(cx + 1, cavTop + 2, 3, L.FLOOR_Y - cavTop - 4);
    ctx.fillStyle = '#1a1420';
    ctx.fillRect(cx - 3, L.FLOOR_Y - 4, 18, 4);
    ctx.fillStyle = '#54687e';
    for (let y = cavTop + 12; y < L.FLOOR_Y - 10; y += 26) ctx.fillRect(cx + 5, y, 2, 2);
  }

  // cam tünel
  ctx.fillStyle = 'rgba(150,200,240,.10)';
  ctx.fillRect(sx + 6, cavTop, W - 12, glassBot - cavTop);
  ctx.fillStyle = 'rgba(190,225,255,.3)';
  ctx.fillRect(sx + 6, cavTop, 2, glassBot - cavTop);
  ctx.fillRect(sx + W - 8, cavTop, 2, glassBot - cavTop);
  ctx.fillStyle = 'rgba(220,240,255,.15)';
  ctx.fillRect(sx + 16, cavTop + 4, 4, 36);

  if (anyWashing) {
    // su jetleri
    ctx.fillStyle = 'rgba(140,200,255,.75)';
    for (let i = 0; i < 4; i++) {
      const nx = sx + 14 + i * 13;
      const h = 10 + Math.sin(t * 30 + i * 2) * 3 + 5;
      ctx.fillRect(nx, cavTop + 3, 3, h);
    }
    // köpük
    ctx.fillStyle = 'rgba(230,245,255,.85)';
    for (let i = 0; i < 4; i++) {
      const fx = L.WASH_X - 12 + i * 7 + Math.sin(t * 8 + i) * 3;
      const fy = L.BELT2_Y - 8 - (i % 2) * 3 - Math.abs(Math.sin(t * 5 + i * 1.7)) * 5;
      ctx.fillRect(fx, fy, 4, 3);
    }
  } else {
    // boşta sarkan damla
    const dy = cavTop + 6 + ((t * 55) % 34);
    ctx.fillStyle = 'rgba(140,200,255,.8)';
    ctx.fillRect(L.WASH_X - 1, dy, 3, 5);
  }
}

// makine kurulu değilken boş yuva işareti
export function drawWashSlot(ctx) {
  const sx = washSX();
  ctx.strokeStyle = 'rgba(232,224,232,.28)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(sx + 8, L.BELT2_Y - 46, WASH_W - 16, 40);
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(232,224,232,.35)';
  ctx.font = 'bold 9px "Courier New",monospace'; ctx.textAlign = 'center';
  ctx.fillText('BOŞ YUVA', L.WASH_X, L.BELT2_Y - 24);
}
