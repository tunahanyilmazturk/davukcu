// Lojistik hattı: en altta asfalt yol + sevkiyat kamyonu
// Kamyon soldan gelir, DOCK_X'te durur, yerdeki yumurtaları yükler, sağdan çıkar
import { L } from '../config.js';
import { S } from '../state.js';
import { truckCap } from '../economy.js';

// yol şeridi — kamyon seviyesi alınınca görünür (hatların altına döşenir)
export function drawRoad(ctx) {
  if (S.lvl.truck <= 0) return;
  const y = L.ROAD_Y, h = L.H - y;
  // asfalt
  ctx.fillStyle = '#1c1a22';
  ctx.fillRect(0, y, L.W, h);
  ctx.fillStyle = '#262430';
  ctx.fillRect(0, y, L.W, 6);
  // üst/alt kaldırım çizgisi
  ctx.fillStyle = '#4a4450';
  ctx.fillRect(0, y - 3, L.W, 3);
  ctx.fillStyle = '#3a3442';
  ctx.fillRect(0, y + h - 3, L.W, 3);
  // orta kesikli şerit
  ctx.fillStyle = '#8a7a3a';
  for (let x = 14; x < L.W - 20; x += 34) ctx.fillRect(x, y + 22, 16, 3);
  // yükleme alanı işaretleri (kutunun altında)
  ctx.strokeStyle = 'rgba(255,210,62,.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(L.DOCK_X - 34, y + 8, 88, 30);
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,210,62,.55)';
  ctx.font = 'bold 8px "Courier New",monospace'; ctx.textAlign = 'center';
  ctx.fillText('SEVKİYAT', L.DOCK_X + 10, y + 40);
  ctx.textAlign = 'left';
}

// kamyon: dorse + kabin + tekerlekler; yüklemede kasa üstünde yumurtalar görünür
export function drawTruck(ctx) {
  const tr = S.truck;
  if (!tr) return;
  const t = performance.now() / 1000;
  const bobY = tr.state === 'load' ? Math.sin(tr.bob * 2) * 1 : Math.sin(tr.bob * 3) * 1.2;
  const x = Math.round(tr.x), y = L.ROAD_Y + bobY;

  // gölge
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.fillRect(x - 2, y + 30, 74, 5);

  // dorse (kutu kasa)
  ctx.fillStyle = '#101418';
  ctx.fillRect(x - 1, y - 21, 49, 28);
  ctx.fillStyle = '#d8d0c0';
  ctx.fillRect(x, y - 20, 46, 26);
  ctx.fillStyle = '#b8b0a0';
  ctx.fillRect(x, y - 20, 46, 4);
  // kasa üzerinde taşınan gübre çuvalları (arkada) + yumurtalar (kargo görünür)
  for (let i = 0; i < Math.min(tr.bags || 0, 6); i++) {
    const bx = x + 4 + i * 7;
    ctx.fillStyle = '#4a3420'; ctx.fillRect(bx, y - 30, 6, 9);
    ctx.fillStyle = '#8a6a3e'; ctx.fillRect(bx, y - 29, 5, 8);
    ctx.fillStyle = '#5e4526'; ctx.fillRect(bx + 1, y - 31, 3, 2);
  }
  ctx.fillStyle = '#f8f2e6';
  for (let i = 0; i < Math.min(tr.cargo, 8); i++) ctx.fillRect(x + 4 + i * 5, y - 24, 3, 4);
  // kasa yazısı
  ctx.fillStyle = '#7a4030';
  ctx.font = 'bold 8px "Courier New",monospace'; ctx.textAlign = 'center';
  ctx.fillText('YUMURTA', x + 23, y - 2);
  ctx.fillText('EKSPRES', x + 23, y + 6);
  ctx.textAlign = 'left';
  // kasa kapı bandı + reflektörler
  ctx.fillStyle = '#b8b0a0';
  ctx.fillRect(x, y + 1, 46, 2);
  ctx.fillStyle = '#e04840';
  ctx.fillRect(x + 1, y + 3, 3, 2);
  ctx.fillStyle = '#ffd23e';
  ctx.fillRect(x + 42, y + 3, 3, 2);

  // kabin (sağda — sağa sürer)
  ctx.fillStyle = '#101418';
  ctx.fillRect(x + 47, y - 13, 20, 20);
  ctx.fillStyle = '#4a7ab0';
  ctx.fillRect(x + 48, y - 12, 18, 18);
  ctx.fillStyle = '#3a6a98';
  ctx.fillRect(x + 48, y - 12, 18, 3);
  // cam
  ctx.fillStyle = '#aee0ff';
  ctx.fillRect(x + 54, y - 9, 10, 7);
  ctx.fillStyle = '#d8f2ff';
  ctx.fillRect(x + 55, y - 8, 3, 3);
  // tampon + far
  ctx.fillStyle = '#8a8a96';
  ctx.fillRect(x + 64, y + 1, 4, 4);
  ctx.fillStyle = '#fff8b0';
  ctx.fillRect(x + 65, y - 2, 2, 3);

  // tekerlekler (yüklerken sabit, sürerken dönen jant noktası)
  const spin = tr.state === 'load' ? 0 : t * 14;
  for (const wx of [x + 9, x + 20, x + 57]) {
    ctx.fillStyle = '#0c0a10';
    ctx.beginPath(); ctx.arc(wx, y + 7, 5.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a3442';
    ctx.beginPath(); ctx.arc(wx, y + 7, 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#8a8494';
    ctx.fillRect(wx + Math.cos(spin) * 1.5 - 1, y + 7 + Math.sin(spin) * 1.5 - 1, 2, 2);
  }

  // doluluk göstergesi — dorse üstünde kapasite çizgisi
  if (tr.state === 'load') {
    const cap = truckCap(S.lvl.truck);
    ctx.fillStyle = '#101418';
    ctx.fillRect(x, y - 32, 46, 5);
    ctx.fillStyle = '#7df0ff';
    ctx.fillRect(x + 1, y - 31, Math.round(44 * tr.cargo / cap), 3);
  }
}
