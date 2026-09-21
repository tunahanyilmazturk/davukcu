// İpucu balonları + FPS ölçüm kanalı (üst bar DOM'a taşındı — index.html #topbar)
import { L } from '../config.js';
import { S } from '../state.js';

// render döngüsü her yarım saniyede güncel FPS'i buraya yazar;
// shop.js üst bar çipi refreshUI'da okur
let lastFps = 60;
export function setFps(v) { lastFps = v; }
export function getFps() { return lastFps; }

// piksel balon: gövde + 2px koyu çerçeve + kuyruk (tail: [tabanX, uçX, uçY])
function bubble(ctx, bx, by, bw, bh, tail) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx + 4, by, bw - 8, bh);
  ctx.fillRect(bx, by + 4, bw, bh - 8);
  ctx.fillStyle = '#241c2c';
  ctx.fillRect(bx + 4, by - 2, bw - 8, 2); ctx.fillRect(bx + 4, by + bh, bw - 8, 2);
  ctx.fillRect(bx - 2, by + 4, 2, bh - 8); ctx.fillRect(bx + bw, by + 4, 2, bh - 8);
  if (tail) {
    const [tbx, tax, tay] = tail; // taban x'i balon kenarında, uç hedefe bakar
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(tbx - 8, by + bh); ctx.lineTo(tbx + 8, by + bh);
    ctx.lineTo(tax, tay); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#241c2c'; // kuyruk alt kenarı
    ctx.beginPath();
    ctx.moveTo(tbx - 8, by + bh); ctx.lineTo(tax, tay);
    ctx.lineTo(tax - 2, tay + 2); ctx.lineTo(tbx - 10, by + bh + 2);
    ctx.closePath(); ctx.fill();
  }
}
function bubbleText(ctx, bx, by, bw, lines) {
  ctx.fillStyle = '#241c2c';
  ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'center';
  lines.forEach((ln, i) => ctx.fillText(ln, bx + bw / 2, by + 16 + i * 13));
}

// ipucu balonları: ilk yumurta satılana dek kutu yanında mıknatıs
// anlatımı; ilk tavuk satılana dek ilk tavuğun başında satış ipucu
export function drawHint(ctx) {
  if (!S.fxHints) return;
  const eggWaiting = S.eggs.some(e => e.phase === 'belt1' || e.phase === 'belt2' || e.phase === 'floor');
  if (S.eggsSold === 0 && eggWaiting) {
    // fabrika sayfası — kuyruk sağa, kutu ağzına bakar
    const bx = L.WD.crateX - 190, by = L.BELT2_Y - 112, bw = 164, bh = 46;
    bubble(ctx, bx, by, bw, bh, [bx + bw - 16, bx + bw + 14, by + bh + 12]);
    bubbleText(ctx, bx, by, bw, [
      'Yumurtalar kutuya',
      'varınca satılır —',
      'mıknatıs: basılı tut!',
    ]);
    return;
  }
  // tavuk satışı — balon ilk tavuğun üstünde süzülür, PAZAR panelini işaret eder
  if (S.stats.sold !== 0 || S.playTime >= 24 || !S.chickens.length) return;
  const ch = S.chickens[0];
  const bw = 168, bh = 46;
  const bx = Math.max(8, Math.min(L.W - bw - 8, ch.x - bw / 2));
  const by = Math.max(L.HUD_H + 8, ch.y - 96);
  const tx = Math.max(bx + 18, Math.min(bx + bw - 18, ch.x));
  bubble(ctx, bx, by, bw, bh, [tx, ch.x, ch.y - 34]);
  bubbleText(ctx, bx, by, bw, [
    'Satmak için beni tut,',
    'sağdaki PAZAR paneline',
    'sürükleyip bırak!',
  ]);
}
