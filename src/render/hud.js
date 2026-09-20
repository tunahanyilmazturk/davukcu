// İpucu balonu + üst bilgi çubuğu
import { L, fmtTime } from '../config.js';
import { S } from '../state.js';

// ipucu balonu (yeni oyun): birikmiş yumurta varsa satış yolunu gösterir,
// yoksa tavuk sürükleme ipucu verir
export function drawHint(ctx) {
  if (!S.fxHints) return;
  const eggWaiting = S.eggs.some(e => e.phase === 'belt1' || e.phase === 'belt2' || e.phase === 'floor');
  if (S.eggsSold === 0 && eggWaiting) {
    // kutuya işaret eden balon — elle taşıma fazı
    const bx = L.CRATE_X - 168, by = L.BELT2_Y - 104;
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
    ctx.fillText('tutup kutuya', bx + 68, by + 28);
    ctx.fillText('sürükle!', bx + 68, by + 41);
    return;
  }
  if (S.eggsSold !== 0 || S.playTime >= 14) return;
  const bx = 18, by = L.FLOOR_Y - 140;
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

// üst bilgi çubuğu
export function drawHud(ctx, fps) {
  ctx.fillStyle = 'rgba(14,10,18,.92)';
  ctx.fillRect(0, 0, L.W, L.HUD_H);
  ctx.fillStyle = '#f0e6f0';
  ctx.font = 'bold 10px "Courier New",monospace';
  ctx.textAlign = 'left';
  ctx.fillText('⏱ ' + fmtTime(S.playTime) + '  KLASİK', 8, 13);
  ctx.textAlign = 'right';
  ctx.fillText('v1.0' + (S.showFps ? ' | ' + fps + ' FPS' : ''), L.W - 8, 13);
}
