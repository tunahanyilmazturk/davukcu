// Lojistik hattı: en altta asfalt yol + yükleme iskelesi + sevkiyat aracı.
// Yol ve iskele her zaman görünür (Sv.0'dan itibaren sistem çalışır);
// araç seviyeyle büyür: kamyonet → panelvan → tır.
import { L, fmt } from '../config.js';
import { S } from '../state.js';
import { truckCap } from '../economy.js';
import { truckEta } from '../entities/truck.js';

const WHEEL_Y = () => L.ROAD_Y + 52; // tekerlek merkezi — yolun alt şeridi

// ---- yol: asfalt şerit + dokular + boyalı yükleme bölgesi ----
export function drawRoad(ctx) {
  const y = L.ROAD_Y, h = L.H - y;
  // asfalt gövde + üst kenar parlaklığı
  ctx.fillStyle = '#1b1922'; ctx.fillRect(0, y, L.W, h);
  ctx.fillStyle = '#252230'; ctx.fillRect(0, y, L.W, 5);
  // doku benekleri (deterministik serpiştirme)
  ctx.fillStyle = 'rgba(255,255,255,.035)';
  for (let i = 0; i < 46; i++)
    ctx.fillRect((i * 173) % (L.W - 8), y + 12 + (i * 61) % (h - 20), 3, 2);
  // yağ lekeleri
  ctx.fillStyle = 'rgba(8,6,12,.5)';
  ctx.beginPath(); ctx.ellipse(L.W * .3, y + h * .62, 26, 6, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(L.W * .68, y + h * .4, 18, 5, 0, 0, 7); ctx.fill();
  // kaldırım çizgileri
  ctx.fillStyle = '#4a4450'; ctx.fillRect(0, y - 3, L.W, 3);
  ctx.fillStyle = '#3a3442'; ctx.fillRect(0, y + h - 4, L.W, 4);
  // orta kesikli şerit
  ctx.fillStyle = '#8a7a3a';
  for (let x = 16; x < L.W - 24; x += 36) ctx.fillRect(x, y + h * .55, 16, 3);
  // rögar kapağı
  ctx.fillStyle = '#171520'; ctx.beginPath(); ctx.ellipse(L.W * .5, y + h * .78, 9, 3.4, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#2c2836'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(L.W * .5, y + h * .78, 9, 3.4, 0, 0, 7); ctx.stroke();

  // boyalı yükleme bölgesi: sarı taralı kutu + tarak çizgileri
  const dx = L.DOCK_X;
  ctx.strokeStyle = 'rgba(255,210,62,.5)'; ctx.lineWidth = 2;
  ctx.setLineDash([7, 5]);
  ctx.strokeRect(dx - 50, y + 30, 132, 58);
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,210,62,.18)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(dx - 44 + i * 24, y + 84);
    ctx.lineTo(dx - 20 + i * 24, y + 34);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,210,62,.5)';
  ctx.font = 'bold 8px "Courier New",monospace'; ctx.textAlign = 'center';
  ctx.fillText('SEVKİYAT', dx + 16, y + 80);
  ctx.textAlign = 'left';
}

// ---- iskele: sahanlık kenarı, dubalar, palet istifi, direk + tabela ----
export function drawDock(ctx) {
  const t = performance.now() / 1000;
  const dx = L.DOCK_X, ry = L.ROAD_Y;
  // beton sahanlık kenarı — zeminden yola ayrım çizgisi
  ctx.fillStyle = '#3a3442'; ctx.fillRect(dx - 56, ry - 2, 140, 4);
  ctx.fillStyle = '#555060'; ctx.fillRect(dx - 56, ry - 2, 140, 1);
  // sarı dubalar (iskele köşeleri — sağ taraf kutuya girmez)
  for (const bx of [dx - 46, dx + 16]) {
    ctx.fillStyle = '#241f2c'; ctx.fillRect(bx - 3, ry + 24, 10, 3); // kaide
    ctx.fillStyle = '#c8a028'; ctx.fillRect(bx, ry + 2, 5, 23);
    ctx.fillStyle = '#241f2c'; ctx.fillRect(bx, ry + 9, 5, 4);
    ctx.fillStyle = '#e8c838'; ctx.fillRect(bx + 1, ry + 3, 3, 5);
  }
  // palet istifi — yolun solunda, iskeleden uzakta dekor
  const px = 70;
  ctx.fillStyle = '#4a3820'; ctx.fillRect(px - 2, ry + 20, 30, 5);      // palet
  ctx.fillStyle = '#6a5230'; ctx.fillRect(px, ry + 8, 12, 12);         // kasa 1
  ctx.fillStyle = '#7a6238'; ctx.fillRect(px, ry + 8, 12, 3);
  ctx.fillStyle = '#5e4a28'; ctx.fillRect(px + 14, ry + 12, 12, 8);    // kasa 2
  ctx.fillStyle = '#6e582f'; ctx.fillRect(px + 14, ry + 12, 12, 2);

  // tabela direği + durum panosu
  const sx = dx - 62;
  ctx.fillStyle = '#3c3644'; ctx.fillRect(sx, ry - 66, 5, 68);         // direk
  ctx.fillStyle = '#2c2834'; ctx.fillRect(sx - 2, ry - 2, 9, 4);       // kaide
  const bw = 74, bh = 32, bx = sx - 12, by = ry - 100;
  ctx.fillStyle = '#14101c'; ctx.fillRect(bx, by, bw, bh);             // pano
  ctx.strokeStyle = '#c8a028'; ctx.lineWidth = 2;
  ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 9px "Courier New",monospace';
  ctx.fillText('SEVKİYAT', bx + bw / 2, by + 12);
  const eta = truckEta();
  ctx.font = 'bold 8px "Courier New",monospace';
  if (S.truck) {
    ctx.fillStyle = '#8fd8ff';
    ctx.fillText(S.truck.state === 'load' ? 'YÜKLENİYOR' : 'ARAÇ YOLDA', bx + bw / 2, by + 24);
  }
  else if (eta < 0) { ctx.fillStyle = '#6a6478'; ctx.fillText('yük bekleniyor', bx + bw / 2, by + 24); }
  else { ctx.fillStyle = '#9fe870'; ctx.fillText('↻ ' + Math.ceil(eta) + ' sn', bx + bw / 2, by + 24); }
  // amber lamba — araç yaklaşınca çakar
  if (eta >= 0 && eta < 5 && Math.floor(t * 4) % 2 === 0) {
    ctx.fillStyle = '#ffb028';
    ctx.beginPath(); ctx.arc(sx + 2, by - 6, 4, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,176,40,.25)';
    ctx.beginPath(); ctx.arc(sx + 2, by - 6, 7, 0, 7); ctx.fill();
  }
  ctx.textAlign = 'left';
}

// ---- ortak parçalar ----
function wheel(ctx, x, gy, spin, r) {
  ctx.fillStyle = '#0c0a10';
  ctx.beginPath(); ctx.arc(x, gy, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#3a3442';
  ctx.beginPath(); ctx.arc(x, gy, r * .55, 0, 7); ctx.fill();
  ctx.fillStyle = '#8a8494';
  ctx.fillRect(x + Math.cos(spin) * r * .3 - 1, gy + Math.sin(spin) * r * .3 - 1, 2, 2);
}

function tailLight(ctx, x, y, on) {
  ctx.fillStyle = on ? '#ff4a3e' : '#7a2a24';
  ctx.fillRect(x, y, 3, 4);
  if (on) { ctx.fillStyle = 'rgba(255,74,62,.3)'; ctx.fillRect(x - 1, y - 1, 5, 6); }
}

// doluluk + manifest — yükleme sırasında araç üstünde
function manifest(ctx, tr, cx, topY) {
  if (tr.state !== 'load' || (!tr.cargo && !tr.bags)) return;
  const cap = truckCap(S.lvl.truck);
  const txt = 'YUM ' + tr.cargo + '/' + cap + (tr.bags ? '  ÇUV ' + tr.bags : '')
            + '  $' + fmt(tr.worth);
  ctx.font = 'bold 8px "Courier New",monospace'; ctx.textAlign = 'center';
  const w = ctx.measureText(txt).width + 10;
  ctx.fillStyle = 'rgba(16,12,24,.85)';
  ctx.fillRect(cx - w / 2, topY - 22, w, 13);
  ctx.strokeStyle = '#4a4450'; ctx.lineWidth = 1;
  ctx.strokeRect(cx - w / 2 + .5, topY - 21.5, w - 1, 12);
  ctx.fillStyle = '#9fe870';
  ctx.fillText(txt, cx, topY - 12);
  ctx.textAlign = 'left';
}

// küçük yumurta kasası (kamyonet kasasında görünen yük)
function eggCrate(ctx, x, y) {
  ctx.fillStyle = '#7a6238'; ctx.fillRect(x, y, 9, 8);
  ctx.fillStyle = '#8a7040'; ctx.fillRect(x, y, 9, 2);
  ctx.fillStyle = '#f8f2e6'; ctx.fillRect(x + 2, y + 3, 2, 3);
  ctx.fillRect(x + 5, y + 3, 2, 3);
}

function bagMini(ctx, x, y) {
  ctx.fillStyle = '#4a3420'; ctx.fillRect(x, y, 6, 8);
  ctx.fillStyle = '#8a6a3e'; ctx.fillRect(x, y + 1, 5, 7);
  ctx.fillStyle = '#5e4526'; ctx.fillRect(x + 1, y - 1, 3, 2);
}

// ---- araç gövdeleri (seviye tipine göre) ----

// Sv.0-1: kamyonet — açık kasa, yük görünür
function drawPickup(ctx, tr, x, gy, t) {
  const spin = tr.state === 'load' ? 0 : t * 14;
  // kasa tabanı + alçak yanaklar
  ctx.fillStyle = '#101418'; ctx.fillRect(x - 1, gy - 14, 44, 10);
  ctx.fillStyle = '#a04a38'; ctx.fillRect(x, gy - 15, 42, 9);
  ctx.fillStyle = '#7a382c'; ctx.fillRect(x, gy - 24, 42, 9);          // kasa duvarı
  ctx.fillStyle = '#5e2a22'; ctx.fillRect(x, gy - 24, 3, 9);           // duvar direği
  ctx.fillRect(x + 39, gy - 24, 3, 9);
  // yük: yumurta kasaları iki sıra istiflenir, çuvallar üste konur
  for (let i = 0; i < Math.min(tr.cargo, 8); i++)
    eggCrate(ctx, x + 3 + (i % 4) * 10, gy - 33 - Math.floor(i / 4) * 9);
  for (let i = 0; i < Math.min(tr.bags || 0, 3); i++)
    bagMini(ctx, x + 6 + i * 11, gy - 50);
  // kabin
  ctx.fillStyle = '#101418'; ctx.fillRect(x + 41, gy - 34, 22, 30);
  ctx.fillStyle = '#a04a38'; ctx.fillRect(x + 42, gy - 33, 20, 28);
  ctx.fillStyle = '#7a382c'; ctx.fillRect(x + 42, gy - 33, 20, 4);
  ctx.fillStyle = '#aee0ff'; ctx.fillRect(x + 47, gy - 29, 12, 8);     // cam
  ctx.fillStyle = '#d8f2ff'; ctx.fillRect(x + 48, gy - 28, 4, 3);
  ctx.fillStyle = '#8a8a96'; ctx.fillRect(x + 60, gy - 8, 4, 5);       // tampon
  ctx.fillStyle = '#fff8b0'; ctx.fillRect(x + 61, gy - 12, 2, 3);      // far
  tailLight(ctx, x - 1, gy - 10, tr.state === 'load');
  wheel(ctx, x + 11, gy, spin, 5.5);
  wheel(ctx, x + 52, gy, spin, 5.5);
  manifest(ctx, tr, x + 32, gy - 36);
}

// Sv.2-4: panelvan — kapalı kutu kasa + üstten motorlu kabin
function drawBoxTruck(ctx, tr, x, gy, t) {
  const spin = tr.state === 'load' ? 0 : t * 14;
  const cap = truckCap(S.lvl.truck);
  // kutu kasa
  ctx.fillStyle = '#101418'; ctx.fillRect(x - 1, gy - 45, 60, 41);
  ctx.fillStyle = '#d8d0c0'; ctx.fillRect(x, gy - 44, 58, 39);
  ctx.fillStyle = '#b8b0a0'; ctx.fillRect(x, gy - 44, 58, 5);
  ctx.fillStyle = '#c8402e'; ctx.fillRect(x, gy - 14, 58, 4);          // firma şeridi
  // kapı derzleri + logo
  ctx.fillStyle = '#b0a898';
  for (let i = 0; i < 3; i++) ctx.fillRect(x + 14 + i * 16, gy - 40, 1, 22);
  ctx.fillStyle = '#7a4030'; ctx.font = 'bold 8px "Courier New",monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DAVUKÇU', x + 29, gy - 30);
  ctx.fillText('LOJİSTİK', x + 29, gy - 21);
  ctx.textAlign = 'left';
  // doluluk çizgisi (yüklemede)
  if (tr.state === 'load' && tr.cargo) {
    ctx.fillStyle = '#101418'; ctx.fillRect(x + 2, gy - 42, 54, 4);
    ctx.fillStyle = '#7df0ff'; ctx.fillRect(x + 3, gy - 41, Math.round(52 * tr.cargo / cap), 2);
  }
  // kabin (üstten motorlu)
  ctx.fillStyle = '#101418'; ctx.fillRect(x + 59, gy - 36, 27, 32);
  ctx.fillStyle = '#4a7ab0'; ctx.fillRect(x + 60, gy - 35, 25, 30);
  ctx.fillStyle = '#3a6a98'; ctx.fillRect(x + 60, gy - 35, 25, 4);
  ctx.fillStyle = '#aee0ff'; ctx.fillRect(x + 66, gy - 31, 14, 9);     // cam
  ctx.fillStyle = '#d8f2ff'; ctx.fillRect(x + 67, gy - 30, 4, 3);
  ctx.fillStyle = '#2a5278'; ctx.fillRect(x + 60, gy - 14, 25, 3);     // ızgara
  ctx.fillStyle = '#8a8a96'; ctx.fillRect(x + 82, gy - 8, 4, 5);       // tampon
  ctx.fillStyle = '#fff8b0'; ctx.fillRect(x + 83, gy - 13, 2, 3);      // far
  tailLight(ctx, x - 1, gy - 10, tr.state === 'load');
  wheel(ctx, x + 12, gy, spin, 6.5);
  wheel(ctx, x + 30, gy, spin, 6.5);
  wheel(ctx, x + 72, gy, spin, 6.5);
  manifest(ctx, tr, x + 43, gy - 48);
}

// Sv.5-6: tır — çekici + uzun dorse
function drawSemi(ctx, tr, x, gy, t) {
  const spin = tr.state === 'load' ? 0 : t * 14;
  const cap = truckCap(S.lvl.truck);
  // dorse
  ctx.fillStyle = '#101418'; ctx.fillRect(x - 1, gy - 48, 74, 44);
  ctx.fillStyle = '#8a3830'; ctx.fillRect(x, gy - 47, 72, 42);
  ctx.fillStyle = '#a04838'; ctx.fillRect(x, gy - 47, 72, 6);
  ctx.fillStyle = '#6e2a24'; ctx.fillRect(x, gy - 12, 72, 3);          // alt etek
  // kapı derzleri + büyük logo
  ctx.fillStyle = '#6e2a24';
  ctx.fillRect(x + 34, gy - 44, 1, 30); ctx.fillRect(x + 68, gy - 44, 1, 30);
  ctx.fillStyle = '#f0d8c0'; ctx.font = 'bold 9px "Courier New",monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DAVUKÇU', x + 35, gy - 32);
  ctx.font = 'bold 7px "Courier New",monospace';
  ctx.fillText('LOJİSTİK A.Ş.', x + 35, gy - 23);
  ctx.textAlign = 'left';
  // doluluk çizgisi
  if (tr.state === 'load' && tr.cargo) {
    ctx.fillStyle = '#101418'; ctx.fillRect(x + 3, gy - 45, 66, 4);
    ctx.fillStyle = '#7df0ff'; ctx.fillRect(x + 4, gy - 44, Math.round(64 * tr.cargo / cap), 2);
  }
  // kuyruk ışıkları + reflektör bandı
  ctx.fillStyle = '#e8d8a0';
  for (let i = 0; i < 5; i++) ctx.fillRect(x + 6 + i * 13, gy - 8, 6, 2);
  tailLight(ctx, x - 1, gy - 12, tr.state === 'load');
  // çekici: kaput + kabin + egzoz borusu + yakıt tankı
  ctx.fillStyle = '#101418'; ctx.fillRect(x + 74, gy - 40, 38, 36);
  ctx.fillStyle = '#3a6a98'; ctx.fillRect(x + 75, gy - 39, 36, 34);
  ctx.fillStyle = '#2a5278'; ctx.fillRect(x + 75, gy - 39, 36, 5);
  ctx.fillStyle = '#aee0ff'; ctx.fillRect(x + 84, gy - 34, 13, 9);     // cam
  ctx.fillStyle = '#d8f2ff'; ctx.fillRect(x + 85, gy - 33, 4, 3);
  ctx.fillStyle = '#1a2a3a'; ctx.fillRect(x + 78, gy - 34, 5, 9);      // yan cam
  ctx.fillStyle = '#c8ccd4'; ctx.fillRect(x + 103, gy - 26, 7, 10);    // ızgara
  ctx.fillStyle = '#9aa0ac'; ctx.fillRect(x + 76, gy - 46, 4, 8);      // egzoz borusu
  ctx.fillStyle = '#6a6f7a'; ctx.fillRect(x + 80, gy - 12, 16, 6);     // yakıt tankı
  ctx.fillStyle = '#8a8a96'; ctx.fillRect(x + 108, gy - 8, 4, 5);      // tampon
  ctx.fillStyle = '#fff8b0'; ctx.fillRect(x + 109, gy - 14, 2, 3);     // far
  wheel(ctx, x + 16, gy, spin, 6.5);
  wheel(ctx, x + 30, gy, spin, 6.5);
  wheel(ctx, x + 86, gy, spin, 7);
  wheel(ctx, x + 102, gy, spin, 7);
  manifest(ctx, tr, x + 56, gy - 51);
}

// araç: tier'e göre gövde + gölge + sallanma
export function drawTruck(ctx) {
  const tr = S.truck;
  if (!tr) return;
  const t = performance.now() / 1000;
  const tier = tr.tier || 0;
  const len = tier === 2 ? 112 : tier === 1 ? 86 : 64;
  const bobY = tr.state === 'load' ? Math.sin(tr.bob * 2) * 1
                                   : Math.sin(tr.bob * 3) * 1.2;
  const x = Math.round(tr.x), gy = WHEEL_Y() + bobY + (tr.dip || 0) * 1.5;

  // gölge
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fillRect(x - 3, gy + 6, len + 6, 5);

  if (tier === 2) drawSemi(ctx, tr, x, gy, t);
  else if (tier === 1) drawBoxTruck(ctx, tr, x, gy, t);
  else drawPickup(ctx, tr, x, gy, t);
}
