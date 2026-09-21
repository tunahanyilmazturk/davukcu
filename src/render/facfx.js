// Fabrika dinamik efektleri (LOKAL koordinatlar — translate(FX) bağlamında):
// dönen egzoz fanı, istasyon üstü durum LED'leri, flanş buharı,
// pencere huzmelerinde süzülen toz. fxAmbient ayarıyla açılır/kapanır.
import { L } from '../config.js';
import { S } from '../state.js';

// fan kanatları — world/factory.js'teki yuva üstünde döner
function drawFan(ctx, t) {
  const F = L.FAN;
  ctx.save();
  ctx.translate(F.x, F.y);
  ctx.rotate(t * 2.2);
  ctx.fillStyle = '#4a4258';
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate(i * Math.PI / 2);
    ctx.beginPath(); // kavisli kanat
    ctx.moveTo(3, -4);
    ctx.quadraticCurveTo(F.r - 4, -10, F.r - 3, 4);
    ctx.quadraticCurveTo(F.r - 10, 12, 3, 8);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#241c2c';
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill();
  ctx.fillStyle = '#54445f';
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill();
  ctx.restore();
}

// durum LED'i — makine üstünde yanıp sönen minik lamba
function led(ctx, x, y, on, col) {
  ctx.fillStyle = '#14101a'; ctx.fillRect(x - 3, y - 3, 7, 7);
  ctx.fillStyle = on ? col : '#3a3040';
  ctx.fillRect(x - 1, y - 1, 3, 3);
  if (on) {
    ctx.fillStyle = col + '';
    ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, 5, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export function drawFactoryFX(ctx) {
  if (!S.fxAmbient) return;
  const t = performance.now() / 1000;

  // dönen fan
  drawFan(ctx, t);

  // istasyon durum LED'leri — çalışan makinede yeşil, boş yuvada kapalı
  const by = L.BELT2_Y;
  const blink = Math.floor(t * 2) % 2 === 0;
  if (S.lvl.wash > 0)   led(ctx, L.WASH_X - 22, by - 80, true, '#6ae8ff');
  if (S.lvl.grade > 0)  led(ctx, L.GRADE_X - 16, by - 68, blink, '#ffd23e');
  if (S.lvl.polish > 0) led(ctx, L.POLISH_X - 18, by - 72, true, '#9fe870');
  // kanal bırakma ağzında turuncu işaret lambası
  led(ctx, L.DUCT.outX + 14, L.BELT1_Y - 44, blink, '#ffb040');

  // flanş buharı — hat borusu flanşlarından ara sıra yükselen puflar
  const py = L.BELT1_Y + 44;
  for (let x = 140, i = 0; x < L.CRATE_X - 90; x += 230, i++) {
    const ph = (t * 0.22 + i * 0.53) % 1; // yavaş yükselme döngüsü
    if (ph < 0.55) {
      ctx.fillStyle = 'rgb(220,215,230)'; ctx.globalAlpha = 0.16 * (1 - ph / 0.55);
      const sy = py - 10 - ph * 46;
      ctx.beginPath(); ctx.arc(x + 2 + Math.sin(ph * 9) * 3, sy, 4 + ph * 7, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // pencere huzmelerinde süzülen toz zerreleri
  ctx.fillStyle = 'rgba(255,230,170,.30)';
  for (let i = 0; i < 10; i++) {
    const px = 200 + ((i * 173.7 + t * (5 + (i % 3) * 3)) % Math.max(200, L.DUCT.outX - 260));
    const py2 = 100 + ((i * 67 + t * 4 + Math.sin(t * 0.7 + i) * 18) % 300);
    ctx.fillRect(px, py2, 2, 2);
  }
}
