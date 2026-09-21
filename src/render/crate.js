// Paketleme kasası: dışa açık kapaklı ahşap kutu, içi samanlı.
// İki katman: drawCrate (arka — kapaklar + içi + saman) yumurtalardan önce,
// drawCrateFront (ön duvar + palet + etiket) sonra — içeri düşen yumurta
// ön duvarın arkasında kaybolur.
import { L } from '../config.js';
import { SPR, drawSprite } from '../sprites/index.js';
import { box } from '../entities/index.js';
import { overCrate } from '../entities/eggs.js';
import { magnet } from '../input.js';

function crateTransform(ctx) {
  const cx = L.CRATE_X, cw = L.W - 18 - cx;
  const ry = L.BELT2_Y + 6, by = L.FLOOR_Y + 4, ch = by - ry;
  const sq = box.t > 0 ? Math.sin(box.t / 0.18 * Math.PI) * 0.08 : 0;
  ctx.translate(cx + cw / 2, by);
  ctx.scale(1 + sq, 1 - sq);
  ctx.translate(-cw / 2, -ch); // yerel: x 0..cw, y 0..ch (0 = ağız hizası)
  return { cw, ch };
}

export function drawCrate(ctx) {
  ctx.save();
  const { cw } = crateTransform(ctx);

  // dışa açık kapaklar
  ctx.fillStyle = '#8a5a30';
  ctx.beginPath();
  ctx.moveTo(2, 0); ctx.lineTo(-12, -12); ctx.lineTo(-12, -8); ctx.lineTo(2, 5);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cw - 2, 0); ctx.lineTo(cw + 12, -12); ctx.lineTo(cw + 12, -8); ctx.lineTo(cw - 2, 5);
  ctx.closePath(); ctx.fill();
  // kapak iç yüzleri (açık ton)
  ctx.fillStyle = '#a06838';
  ctx.fillRect(-11, -11, 9, 3); ctx.fillRect(cw + 2, -11, 9, 3);

  // içi karanlık ağız + saman demetleri
  ctx.fillStyle = '#120c18'; ctx.fillRect(4, -2, cw - 8, 22);
  ctx.strokeStyle = '#c9a03c'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 14); ctx.lineTo(18, 6);
  ctx.moveTo(24, 16); ctx.lineTo(32, 8);
  ctx.moveTo(cw - 32, 8); ctx.lineTo(cw - 24, 15);
  ctx.moveTo(cw - 16, 6); ctx.lineTo(cw - 10, 13);
  ctx.stroke();
  ctx.restore();
}

export function drawCrateFront(ctx) {
  ctx.save();
  const { cw, ch } = crateTransform(ctx);

  // ön duvar — ağzın 8px altından başlar; içeri düşen yumurta burada kaybolur
  const fy = 8;
  ctx.fillStyle = '#6a4a30'; ctx.fillRect(0, fy, cw, ch - fy);
  ctx.fillStyle = '#8a5a30'; ctx.fillRect(4, fy + 2, cw - 8, ch - fy - 4);
  // dikey tahta derzleri
  ctx.fillStyle = '#5c3c24';
  for (let x = 12; x < cw - 6; x += 12) ctx.fillRect(x, fy + 2, 2, ch - fy - 4);
  // köşe direkleri + çiviler
  ctx.fillStyle = '#c07830';
  ctx.fillRect(0, fy, 5, ch - fy); ctx.fillRect(cw - 5, fy, 5, ch - fy);
  ctx.fillStyle = '#4a2c18';
  ctx.fillRect(2, fy + 4, 2, 2); ctx.fillRect(cw - 4, fy + 4, 2, 2);
  ctx.fillRect(2, ch - 14, 2, 2); ctx.fillRect(cw - 4, ch - 14, 2, 2);
  // ağız kenarı profili
  ctx.fillStyle = '#c07830'; ctx.fillRect(0, fy, cw, 3);

  // etiket: krem kart + para simgesi + TAZE
  const lw = 46, lh = 22, lx = cw / 2 - lw / 2, ly = fy + (ch - fy) / 2 - lh / 2 - 2;
  ctx.fillStyle = '#e8d8b0'; ctx.fillRect(lx, ly, lw, lh);
  ctx.fillStyle = '#b09868'; ctx.fillRect(lx, ly + lh - 3, lw, 3);
  drawSprite(ctx, SPR.coin, lx + 4, ly + 4, 1);
  ctx.fillStyle = '#7a5830';
  ctx.font = 'bold 9px "Courier New",monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TAZE', lx + 16, ly + 12);
  ctx.font = '7px "Courier New",monospace';
  ctx.fillText('↑ ↑', lx + 16, ly + 19);

  // palet ön yüzü
  ctx.fillStyle = '#4a3520'; ctx.fillRect(-4, ch - 8, cw + 8, 8);
  ctx.fillStyle = '#5c4528'; ctx.fillRect(-4, ch - 10, cw + 8, 3);

  // mıknatıs kutu üstündeyse hedef olarak parlar — tutulanlar otomatik satılır
  // (overCrate dünya koordinatlı; magnet.x/y de öyle)
  if (magnet.active && magnet.held.length && overCrate(magnet.x, magnet.y)) {
    ctx.strokeStyle = 'rgba(255,210,62,.9)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(-3, -6, cw + 6, 28);
    ctx.setLineDash([]);
  }
  ctx.restore();
}
