// Sınıflandırıcı: bandı aşan tarayıcı kemer — camgöbeği tarama perdesi,
// geçen yumurtanın katmanını bir üste çıkarma şansı verir (durmaz)
import { L, MAXL } from '../config.js';
import { S } from '../state.js';

const GR_W = 48;
const grSX = () => L.GRADE_X - GR_W / 2;

// arka: üst ünite (kamera + ekran) + kolon tabanları — yumurtaların ARKASINDA
export function drawGradeBack(ctx) {
  const sx = grSX(), W = GR_W;
  const cavTop = L.BELT2_Y - 24;
  const top = L.BELT2_Y - 86, uh = 58;
  const t = performance.now() / 1000;
  const inZone = S.eggs.some(e => e.phase === 'belt2' && e.x > sx && e.x < sx + W);

  // zemin gölgesi + kılavuz çizgisi
  ctx.fillStyle = 'rgba(125,240,255,.10)';
  ctx.beginPath(); ctx.ellipse(L.GRADE_X, L.FLOOR_Y - 2, 20, 4, 0, 0, 7); ctx.fill();

  // kolonlar (bandı aşar, zemine iner)
  for (const cx of [sx - 4, sx + W - 8]) {
    ctx.fillStyle = '#101c22';
    ctx.fillRect(cx - 1, cavTop - 1, 14, L.FLOOR_Y - cavTop + 1);
    ctx.fillStyle = '#1e323c';
    ctx.fillRect(cx, cavTop, 12, L.FLOOR_Y - cavTop);
    ctx.fillStyle = '#324a56';
    ctx.fillRect(cx + 1, cavTop + 2, 3, L.FLOOR_Y - cavTop - 4);
    ctx.fillStyle = '#101c22';
    ctx.fillRect(cx - 3, L.FLOOR_Y - 4, 18, 4);
    ctx.fillStyle = '#4a6a78';
    for (let y = cavTop + 14; y < L.FLOOR_Y - 10; y += 24) ctx.fillRect(cx + 5, y, 2, 2);
  }

  // ---- üst ünite ----
  ctx.fillStyle = '#0e181e';
  ctx.fillRect(sx - 4, top - 1, W + 8, uh + 2);
  ctx.fillStyle = '#1e323c';
  ctx.fillRect(sx - 3, top, W + 6, uh);
  ctx.fillStyle = '#2e4a58';
  ctx.fillRect(sx - 3, top, W + 6, 3);
  ctx.fillStyle = '#14222a';
  ctx.fillRect(sx - 3, top + uh - 4, W + 6, 4);

  // kamera/kaplin göbeği — taramayı yapan optik
  const lx = sx + W / 2;
  ctx.fillStyle = '#0e181e';
  ctx.fillRect(lx - 7, top + uh - 22, 14, 12);
  ctx.fillStyle = '#24404e';
  ctx.fillRect(lx - 6, top + uh - 21, 12, 10);
  ctx.fillStyle = inZone ? '#7df0ff' : '#2e5a66';
  ctx.fillRect(lx - 2, top + uh - 17, 4, 4);   // mercek — yumurta geçerken parlar
  ctx.fillStyle = 'rgba(125,240,255,.35)';
  ctx.fillRect(lx - 1, top + uh - 10, 2, 4);   // mercek altı huzme

  // ön panel: SINIF etiketi + seviye LED'leri + durum lambası
  ctx.fillStyle = '#12242c';
  ctx.fillRect(sx + 4, top + 8, W - 8, 16);
  ctx.fillStyle = '#7df0ff';
  ctx.font = 'bold 8px "Courier New",monospace'; ctx.textAlign = 'left';
  ctx.fillText('SINIF', sx + 7, top + 19);
  for (let i = 0; i < MAXL.grade; i++) {
    ctx.fillStyle = i < S.lvl.grade ? '#7df0ff' : '#16323a';
    ctx.fillRect(sx + 6 + i * 6, top + 30, 4, 4);
  }
  ctx.fillStyle = inZone && Math.floor(t * 8) % 2 ? '#7df0ff' : '#1e4a52';
  ctx.fillRect(sx + W - 11, top + 11, 5, 5);

  // yan kablo borusu
  ctx.fillStyle = '#0e181e';
  ctx.fillRect(sx + W + 2, top + 6, 5, uh - 16);
  ctx.fillStyle = '#24404e';
  ctx.fillRect(sx + W + 3, top + 7, 3, uh - 18);
}

// ön: tarama perdesi + süpürme huzmesi — yumurtaların ÜSTÜNE
export function drawGradeFront(ctx) {
  const sx = grSX(), W = GR_W;
  const cavTop = L.BELT2_Y - 24;
  const glassBot = L.BELT2_Y + L.BELT_H + 6;
  const t = performance.now() / 1000;
  const inZone = S.eggs.some(e => e.phase === 'belt2' && e.x > sx && e.x < sx + W);

  // tarama perdesi (yarı saydam camgöbeği alan)
  ctx.fillStyle = inZone ? 'rgba(125,240,255,.16)' : 'rgba(125,240,255,.07)';
  ctx.fillRect(sx + 8, cavTop, W - 16, glassBot - cavTop);

  // süpüren dikey huzme — kemer içinde sağa-sola kayar
  const sw = sx + 10 + ((t * 46) % (W - 24));
  ctx.fillStyle = inZone ? 'rgba(180,255,255,.85)' : 'rgba(125,240,255,.5)';
  ctx.fillRect(sw, cavTop, 2, glassBot - cavTop);
  ctx.fillStyle = 'rgba(125,240,255,.3)';
  ctx.fillRect(sw - 3, cavTop, 8, 2);

  // tavan rayı (huzmenin kılavuzu)
  ctx.fillStyle = '#0e181e';
  ctx.fillRect(sx + 8, cavTop - 4, W - 16, 4);
  ctx.fillStyle = '#2e4a58';
  ctx.fillRect(sx + 8, cavTop - 4, W - 16, 1);

  // perde yan çizgileri
  ctx.fillStyle = 'rgba(125,240,255,.4)';
  ctx.fillRect(sx + 8, cavTop, 1, glassBot - cavTop);
  ctx.fillRect(sx + W - 9, cavTop, 1, glassBot - cavTop);

  // yükseltme parıltısı — yumurta kemerdeyken ekstra kıvılcım
  if (inZone) {
    for (let i = 0; i < 3; i++) {
      const px = sx + 12 + ((t * 30 + i * 11) % (W - 24));
      ctx.fillStyle = i % 2 ? '#d8fbff' : '#7df0ff';
      ctx.fillRect(px, L.BELT2_Y - 8 - (i * 5), 2, 2);
    }
  }
}

// kurulu değilken boş yuva işareti (depolama bandı kuruluysa göster)
export function drawGradeSlot(ctx) {
  const sx = grSX();
  ctx.strokeStyle = 'rgba(125,240,255,.22)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(sx + 6, L.BELT2_Y - 46, GR_W - 12, 42);
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(125,240,255,.32)';
  ctx.font = 'bold 9px "Courier New",monospace'; ctx.textAlign = 'center';
  ctx.fillText('SINIF YUVASI', L.GRADE_X, L.BELT2_Y - 22);
}
