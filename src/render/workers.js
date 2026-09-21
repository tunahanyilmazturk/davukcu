// Karakter çizimi: işçi/bakıcı figürü, yürüyüş karesi, taşıdığı yığın
import { SPR, drawSprite } from '../sprites/index.js';

// çiftlik tarafında, tavuklarla aynı derinlik düzeninde çağrılır (y sıralı)
export function drawWorker(ctx, w) {
  const sprs = SPR.people[w.role] || SPR.people.worker;
  const moving = w.state === 'walk' || w.state === 'haul';
  const spr = moving && Math.floor(w.bob) % 2 === 0 ? sprs.b : sprs.a;
  const SC = 2, sw = spr.w * SC, sh = spr.h * SC;
  // gölge
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  ctx.beginPath(); ctx.ellipse(w.x, w.y + 1, 9, 3.5, 0, 0, 7); ctx.fill();
  // gövde — taban noktasından; yürürken hafif bob
  const lift = moving ? -Math.abs(Math.sin(w.bob * Math.PI)) * 1.2 : 0;
  drawSprite(ctx, spr, w.x - sw / 2, w.y - sh + lift, SC, w.dir < 0);
  // işçi yığın taşırken: başının üstünde mini gübre
  if (w.carry > 0) {
    const cx = w.x, cy = w.y - sh - 4 + lift;
    ctx.fillStyle = '#5a4028';
    ctx.fillRect(cx - 5, cy, 10, 4);
    ctx.fillRect(cx - 3, cy - 3, 6, 3);
    ctx.fillStyle = '#7a5a38';
    ctx.fillRect(cx - 4, cy, 3, 1);
    if (w.carry > 1) { // sayı rozeti
      ctx.font = 'bold 8px "Courier New",monospace'; ctx.textAlign = 'left';
      ctx.fillStyle = '#241c2c'; ctx.fillText('x' + w.carry, cx + 7, cy + 1);
      ctx.fillStyle = '#e8c878'; ctx.fillText('x' + w.carry, cx + 6, cy);
    }
  }
}
