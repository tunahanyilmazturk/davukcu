// Ortam efektleri: kümeste süzülen toz zerreleri + üstten ışık huzmeleri
import { L } from '../config.js';

export function drawAmbient(ctx) {
  const t = performance.now() / 1000;
  const P = L.PEN;

  // ışık huzmeleri — tavandan eğik inen yumuşak şeritler
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#fff8d8';
  for (let i = 0; i < 3; i++) {
    const sx = P.x + P.w * (0.18 + i * 0.3);
    ctx.beginPath();
    ctx.moveTo(sx, L.HUD_H);
    ctx.lineTo(sx + 70, L.HUD_H);
    ctx.lineTo(sx + 130, P.y + P.h);
    ctx.lineTo(sx + 40, P.y + P.h);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // toz zerreleri — deterministik sin salınımıyla süzülür
  ctx.fillStyle = 'rgba(255,245,220,.35)';
  for (let i = 0; i < 14; i++) {
    const px = P.x + ((i * 137.5 + t * (6 + i % 3 * 4)) % P.w);
    const py = P.y + 20 + ((i * 61 + Math.sin(t * 0.6 + i) * 30 + t * 3) % (P.h - 40));
    ctx.fillRect(px, py, 2, 2);
  }
}
