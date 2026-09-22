// Konveyör sistemleri: üstte ÇİFTLİK bandı (kümesten toplar, rustik),
// altta DEPOLAMA bandı (yıkama → kutuya taşır, endüstriyel metal).
// Her bandın kendi hızı, görünümü ve yükseltmesi var.
import { L } from './config.js';
import { farmBeltSpeed, depoBeltSpeed } from './economy.js';

// görünüm paletleri
const STYLE = {
  farm: { // rustik: koyu ahşap şasi, toprak rengi bant
    edge: '#1c140e', frame: '#332418', frameHi: '#4a3524', bolt: '#6a5238',
    surf: '#57503e', surfHi: '#6a6248', slat: '#443c2c', slatHi: '#5e543e',
    roller: '#4a3524', rollerHi: '#6a5238',
  },
  depo: { // endüstriyel: metal şasi, kauçuk bant
    edge: '#1c1220', frame: '#2e2438', frameHi: '#3c3048', bolt: '#54445f',
    surf: '#46465a', surfHi: '#5a5a70', slat: '#2b2b3a', slatHi: '#565670',
    roller: '#54445f', rollerHi: '#6a5a78',
  },
};

// uç silindiri (davul): merkezdeki nokta döndüğünü gösterir
function drawRoller(ctx, x, cy, r, ang, st) {
  ctx.fillStyle = st.edge;
  ctx.beginPath(); ctx.arc(x, cy, r + 1.5, 0, 7); ctx.fill();
  ctx.fillStyle = st.roller;
  ctx.beginPath(); ctx.arc(x, cy, r, 0, 7); ctx.fill();
  ctx.fillStyle = st.rollerHi;
  ctx.beginPath(); ctx.arc(x - r * 0.25, cy - r * 0.25, r * 0.55, 0, 7); ctx.fill();
  ctx.fillStyle = '#241c2c';
  ctx.fillRect(x + Math.cos(ang) * r * 0.55 - 1.5, cy + Math.sin(ang) * r * 0.55 - 1.5, 3, 3);
  ctx.fillRect(x - 1.5, cy - 1.5, 3, 3);
}

// tahrik motoru: gövde + dönen fan + LED (bs=0'da fan durur, LED kırmızı)
function drawMotor(ctx, x, topY, bottomY, bs) {
  const running = bs > 0;
  const w = 22;
  ctx.fillStyle = '#1c1220';
  ctx.fillRect(x - w / 2 - 1, topY - 1, w + 2, bottomY - topY + 2);
  ctx.fillStyle = '#2e2438';
  ctx.fillRect(x - w / 2, topY, w, bottomY - topY);
  ctx.fillStyle = '#3c3048';
  ctx.fillRect(x - w / 2 + 2, topY + 2, w - 4, bottomY - topY - 4);
  const cy = topY + (bottomY - topY) / 2;
  ctx.fillStyle = '#241c2c';
  ctx.beginPath(); ctx.arc(x, cy, 6, 0, 7); ctx.fill();
  const a = running ? performance.now() / 1000 * bs / 12 : 0; // fan bant hızıyla döner
  ctx.strokeStyle = running ? '#6a5a78' : '#4a3c58';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ang = a + i * 2.09;
    ctx.beginPath(); ctx.moveTo(x, cy);
    ctx.lineTo(x + Math.cos(ang) * 4, cy + Math.sin(ang) * 4); ctx.stroke();
  }
  ctx.fillStyle = '#54445f'; ctx.fillRect(x - 1.5, cy - 1.5, 3, 3);
  const blink = Math.floor(performance.now() / 350) % 2 === 0;
  ctx.fillStyle = running ? (blink ? '#8aff6a' : '#2c5a28') : '#e04840';
  ctx.fillRect(x + w / 2 - 5, topY + 3, 3, 3);
  if (!running) {
    ctx.fillStyle = '#e04840';
    ctx.font = 'bold 7px "Courier New",monospace'; ctx.textAlign = 'center';
    ctx.fillText('KAPALI', x, topY - 4);
  }
}

// bant isim plakası: şasi üstünde küçük etiket
function drawPlate(ctx, x, y, label) {
  ctx.font = 'bold 8px "Courier New",monospace';
  const w = ctx.measureText(label).width + 10;
  ctx.fillStyle = '#1c1220';
  ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, 12);
  ctx.fillStyle = '#54445f';
  ctx.fillRect(x - w / 2, y, w, 10);
  ctx.fillStyle = '#e8e0e8';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y + 8);
}

function drawBelt(ctx, y, dirRight, x0, x1, bs, st) {
  const t = performance.now() / 1000;
  const off = (t * bs) % 16;

  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.fillRect(x0 + 4, y + L.BELT_H + 7, x1 - x0, 5);

  // arka koruma rayı: banttaki yumurtaların arkasında kalır (derinlik)
  ctx.fillStyle = st.frame;
  for (let x = x0 + 20; x < x1 - 16; x += 72) ctx.fillRect(x, y - 11, 3, 9);
  ctx.fillStyle = st.frameHi;
  ctx.fillRect(x0 + 8, y - 11, x1 - x0 - 16, 3);
  ctx.fillStyle = st.edge;
  ctx.fillRect(x0 + 8, y - 8, x1 - x0 - 16, 1);

  // metal/ahşap şasi
  ctx.fillStyle = st.edge;
  ctx.fillRect(x0 - 5, y - 6, x1 - x0 + 10, L.BELT_H + 12);
  ctx.fillStyle = st.frame;
  ctx.fillRect(x0 - 4, y - 5, x1 - x0 + 8, L.BELT_H + 10);
  ctx.fillStyle = st.edge;
  ctx.fillRect(x0 - 4, y + L.BELT_H + 3, x1 - x0 + 8, 2);
  ctx.fillStyle = st.bolt;
  for (let x = x0 + 12; x < x1 - 8; x += 56) ctx.fillRect(x, y + L.BELT_H + 1, 2, 2);

  // bant yüzeyi
  ctx.fillStyle = st.surf;
  ctx.fillRect(x0, y - 2, x1 - x0, L.BELT_H + 4);
  ctx.fillStyle = st.frame;
  ctx.fillRect(x0, y + 1, x1 - x0, L.BELT_H - 2);
  ctx.fillStyle = st.surfHi;
  ctx.fillRect(x0, y - 2, x1 - x0, 2);
  ctx.fillStyle = st.edge;
  ctx.fillRect(x0, y + L.BELT_H, x1 - x0, 2);
  // kayan çıtalar
  for (let x = x0 - 16 + (dirRight ? off : 16 - off); x < x1 + 4; x += 16) {
    ctx.fillStyle = st.slat;
    ctx.fillRect(x, y - 1, 4, L.BELT_H + 2);
    ctx.fillStyle = st.slatHi;
    ctx.fillRect(x, y - 1, 4, 2);
  }
  // şasi önünde yön çentikleri (akan yönü gösterir: > veya <)
  ctx.fillStyle = st.frameHi;
  for (let x = x0 + 60; x < x1 - 40; x += 200) {
    const dx = dirRight ? 1 : -1;
    ctx.fillRect(x, y + L.BELT_H + 6, 4, 2);
    ctx.fillRect(x + dx * 3, y + L.BELT_H + 8, 4, 2);
    ctx.fillRect(x, y + L.BELT_H + 10, 4, 2);
  }
  // uç silindirleri
  const cy = y + L.BELT_H / 2;
  const ang = t * bs / 9 * (dirRight ? 1 : -1);
  drawRoller(ctx, x0 + 1, cy, 7, ang, st);
  drawRoller(ctx, x1 - 1, cy, 7, ang, st);
  // sağa akan bandın ucu: yumurtaları kutu ağzına yönlendiren sac deflektör
  if (dirRight) {
    ctx.fillStyle = st.edge;
    ctx.fillRect(x1 - 2, y - 9, 12, 3);
    ctx.fillRect(x1 + 7, y - 7, 3, 9);
    ctx.fillStyle = st.frameHi;
    ctx.fillRect(x1 - 1, y - 8, 10, 1);
  }
}

// taşıyıcı ayaklar: şasi altından zemine/alt banda inen dikmeler + pabuç
function drawStruts(ctx, y, x0, x1, st, bottom) {
  for (let x = x0 + 90; x < x1 - 60; x += 170) {
    ctx.fillStyle = st.edge;
    ctx.fillRect(x - 1, y + L.BELT_H + 6, 8, bottom - y - L.BELT_H - 6);
    ctx.fillStyle = st.frame;
    ctx.fillRect(x, y + L.BELT_H + 6, 6, bottom - y - L.BELT_H - 6);
    ctx.fillStyle = st.frameHi;
    ctx.fillRect(x, y + L.BELT_H + 6, 2, bottom - y - L.BELT_H - 6);
    // pabuç
    ctx.fillStyle = st.edge;
    ctx.fillRect(x - 3, bottom - 4, 12, 4);
  }
}

export function drawBelts(ctx) {
  // bantlar her zaman görünür ve çalışır; Sv.0 = yavaş, yükseltme hızlandırır
  const bs1 = farmBeltSpeed(), bs2 = depoBeltSpeed();
  // çiftlik bandı: kümesten sola → huniye
  drawBelt(ctx, L.BELT1_Y, false, L.BELT1_X0, L.BELT_X1, bs1, STYLE.farm);
  drawStruts(ctx, L.BELT1_Y, L.BELT1_X0, L.BELT_X1, STYLE.farm, L.BELT2_Y - 20);
  drawMotor(ctx, L.BELT1_X0 + 70, L.BELT1_Y + L.BELT_H + 6, L.BELT1_Y + L.BELT_H + 26, bs1);
  drawPlate(ctx, L.BELT_X1 - 70, L.BELT1_Y + L.BELT_H + 7, 'ÇİFTLİK');
  // depolama bandı: huni → yıkama → kutuya (sağa)
  drawBelt(ctx, L.BELT2_Y, true, L.BELT_X0, L.BELT2_X1, bs2, STYLE.depo);
  drawStruts(ctx, L.BELT2_Y, L.BELT_X0, L.BELT2_X1, STYLE.depo, L.FLOOR_Y);
  drawMotor(ctx, L.CRATE_X - 70, L.BELT2_Y + L.BELT_H + 6, L.BELT2_Y + L.BELT_H + 26, bs2);
  drawPlate(ctx, 255, L.BELT2_Y + L.BELT_H + 7, 'DEPOLAMA');
}
