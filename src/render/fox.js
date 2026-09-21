// Tilki çizimi: sprite + gölge + korku işareti + ağzında taşınan tavuk
import { S } from '../state.js';
import { FOX_SPR } from '../sprites/fox.js';
import { SPR } from '../sprites/index.js';
import { drawSprite } from '../sprites/core.js';

export function drawFox(ctx) {
  const f = S.fox;
  if (!f) return;
  const t = performance.now() / 1000;

  // gölge
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath(); ctx.ellipse(f.x, f.y + 2, 17, 4, 0, 0, 7); ctx.fill();

  const spr = f.state === 'flee' ? FOX_SPR.run
            : f.pause ? FOX_SPR.w1
            : (Math.floor(t * 7) % 2 ? FOX_SPR.w1 : FOX_SPR.w2);
  drawSprite(ctx, spr, f.x - 30, f.y - 33, 3, f.dir > 0);

  // korku göstergesi — scare birikimi veya kapma anında ünlem
  if (f.scare > 0.4 || f.state === 'grab') {
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#241c2c'; ctx.fillText('!', f.x + 1, f.y - 39 - Math.sin(t * 9) * 2);
    ctx.fillStyle = '#ffd23e'; ctx.fillText('!', f.x, f.y - 40 - Math.sin(t * 9) * 2);
  }

  // ağzında taşınan tavuk — kanat çırpma karesiyle, tilkinin önünde
  if (f.carry) {
    const cs = SPR.chickens[f.carry.variant] || SPR.chickens.white;
    const cspr = cs.f || cs.a;
    drawSprite(ctx, cspr, f.carry.x - 10, f.carry.y - 18, 2, f.dir > 0);
  }
}
