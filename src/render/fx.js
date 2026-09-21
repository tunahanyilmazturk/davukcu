// Parçacık efektleri: metin, kalp, tüy, para, su damlası, sıçrama, duman
import { S } from '../state.js';
import { SPR, drawSprite } from '../sprites/index.js';

export function drawParticles(ctx) {
  if (!S.fxParts) return;
  for (const p of S.parts) {
    ctx.globalAlpha = 1 - p.t / p.life;
    if (p.kind === 'text') {
      ctx.font = 'bold 15px "Courier New",monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1a1020'; ctx.fillText(p.text, p.x + 1, p.y + 1);
      ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y);
    } else if (p.kind === 'heart') {
      drawSprite(ctx, SPR.heart, p.x, p.y, 2);
    } else if (p.kind === 'feather') {
      drawSprite(ctx, SPR.feather, p.x, p.y, 2);
    } else if (p.kind === 'coin') {
      drawSprite(ctx, SPR.coin, p.x, p.y, 2);
    } else if (p.kind === 'drop') {
      ctx.fillStyle = '#6ab8f0'; ctx.fillRect(p.x, p.y, 2, 5);
    } else if (p.kind === 'spark') {
      ctx.fillStyle = Math.random() < .5 ? '#fff8d8' : '#ffd23e';
      ctx.fillRect(p.x, p.y, 2, 2);
    } else if (p.kind === 'splash') {
      ctx.fillStyle = 'rgba(106,184,240,.8)';
      const r = 3 + p.t * 22;
      ctx.fillRect(p.x - r, p.y - r / 3, r * 2, 3);
    } else if (p.kind === 'manureFly') {
      // kovaya uçan gübre parçası
      ctx.fillStyle = '#5a4028'; ctx.fillRect(p.x, p.y, 4, 4);
      ctx.fillStyle = '#7a5a38'; ctx.fillRect(p.x + 1, p.y, 2, 1);
    } else if (p.kind === 'speck') {
      ctx.fillStyle = '#6a4a28'; ctx.fillRect(p.x, p.y, 2, 2);
    } else if (p.kind === 'puff' || p.kind === 'smoke') {
      ctx.fillStyle = p.kind === 'smoke' ? 'rgba(200,190,200,.6)' : 'rgba(255,255,255,.5)';
      const r = p.kind === 'smoke' ? 3 + p.t * 8 : 4 + p.t * 10;
      ctx.fillRect(p.x - r, p.y - r / 2, r * 2, r);
    }
    ctx.globalAlpha = 1;
  }
}
