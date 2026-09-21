// İpucu balonu + FPS ölçüm kanalı (üst bar DOM'a taşındı — index.html #topbar)
import { L } from '../config.js';
import { S } from '../state.js';

// render döngüsü her yarım saniyede güncel FPS'i buraya yazar;
// shop.js üst bar çipi refreshUI'da okur
let lastFps = 60;
export function setFps(v) { lastFps = v; }
export function getFps() { return lastFps; }

// ipucu balonu (yeni oyun): birikmiş yumurta varsa satış yolunu gösterir,
// yoksa tavuk sürükleme ipucu verir
export function drawHint(ctx) {
  if (!S.fxHints) return;
  const eggWaiting = S.eggs.some(e => e.phase === 'belt1' || e.phase === 'belt2' || e.phase === 'floor');
  if (S.eggsSold === 0 && eggWaiting) {
    // kutuya işaret eden balon — elle taşıma fazı (fabrika sayfasında, dünya uzayı)
    const bx = L.WD.crateX - 168, by = L.BELT2_Y - 104;
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx + 4, by, 128, 46);
    ctx.fillRect(bx, by + 4, 136, 38);
    ctx.fillStyle = '#241c2c';
    ctx.fillRect(bx + 4, by - 2, 128, 2); ctx.fillRect(bx + 4, by + 46, 128, 2);
    ctx.fillRect(bx - 2, by + 4, 2, 38); ctx.fillRect(bx + 136, by + 4, 2, 38);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); // sağa doğru kuyruk — kutu yönü
    ctx.moveTo(bx + 132, by + 30); ctx.lineTo(bx + 158, by + 44);
    ctx.lineTo(bx + 130, by + 44); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#241c2c';
    ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'center';
    ctx.fillText('Yumurtaları basılı', bx + 68, by + 15);
    ctx.fillText('tutup kutunun', bx + 68, by + 28);
    ctx.fillText('üstüne götür!', bx + 68, by + 41);
    return;
  }
  if (S.eggsSold !== 0 || S.playTime >= 14) return;
  const bx = 18, by = L.PEN_FLOOR - 140;
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx + 4, by, 120, 46);
  ctx.fillRect(bx, by + 4, 128, 38);
  ctx.fillStyle = '#241c2c';
  ctx.fillRect(bx + 4, by - 2, 120, 2); ctx.fillRect(bx + 4, by + 46, 120, 2);
  ctx.fillRect(bx - 2, by + 4, 2, 38); ctx.fillRect(bx + 128, by + 4, 2, 38);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(bx + 20, by + 48); ctx.lineTo(bx + 44, by + 48);
  ctx.lineTo(bx + 24, by + 62); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#241c2c';
  ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'center';
  ctx.fillText('Beni satmak', bx + 64, by + 16);
  ctx.fillText('için pazara', bx + 64, by + 29);
  ctx.fillText('sürükle!', bx + 64, by + 42);
}

