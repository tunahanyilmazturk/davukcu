// Statik arka plan: offscreen canvas'a çizilir, resize'da yeniden kurulur
import { L, mulberry32 } from './config.js';

export const bg = document.createElement('canvas');

// --- depo dekoru parçaları (yB = zemine basan alt kenar) ---
function drawCrate(g, x, yB, w, h) {
  g.fillStyle = '#1c100a'; g.fillRect(x - 1, yB - h - 1, w + 2, h + 2);
  g.fillStyle = '#5a3a22'; g.fillRect(x, yB - h, w, h);
  g.fillStyle = '#7a4e2a'; g.fillRect(x + 2, yB - h + 2, w - 4, h - 4);
  g.strokeStyle = '#5a3a22'; g.lineWidth = 3;
  g.beginPath();
  g.moveTo(x + 2, yB - h + 2); g.lineTo(x + w - 2, yB - 2);
  g.moveTo(x + w - 2, yB - h + 2); g.lineTo(x + 2, yB - 2);
  g.stroke();
}
function drawEggCrate(g, x, yB) {
  g.fillStyle = '#1c1220'; g.fillRect(x - 1, yB - 17, 30, 18);
  g.fillStyle = '#3a4a5c'; g.fillRect(x, yB - 16, 28, 16);
  g.fillStyle = '#e8e0d8';
  for (let i = 0; i < 4; i++) g.fillRect(x + 3 + i * 6, yB - 19, 5, 5);
  g.fillStyle = '#2c3c4c'; g.fillRect(x, yB - 8, 28, 2);
}
function drawSack(g, x, yB) {
  g.fillStyle = '#241c14'; g.fillRect(x - 1, yB - 27, 24, 28);
  g.fillStyle = '#a88a58';
  g.fillRect(x, yB - 16, 22, 16);
  g.fillRect(x + 3, yB - 24, 16, 8);
  g.fillStyle = '#8a6a3c'; g.fillRect(x + 7, yB - 27, 8, 4);
  g.fillStyle = '#c8aa72'; g.fillRect(x + 2, yB - 14, 4, 12);
}
function drawBarrel(g, x, yB) {
  g.fillStyle = '#1c100a'; g.fillRect(x - 1, yB - 39, 26, 40);
  g.fillStyle = '#6a4a30';
  g.fillRect(x + 2, yB - 38, 20, 38);
  g.fillRect(x, yB - 34, 24, 30);
  g.fillStyle = '#8a5a30'; g.fillRect(x + 3, yB - 36, 5, 34);
  g.fillStyle = '#3c3048';
  g.fillRect(x, yB - 32, 24, 3); g.fillRect(x, yB - 12, 24, 3);
}

export function buildBG() {
  bg.width = L.W; bg.height = L.H;
  const g = bg.getContext('2d');
  const rnd = mulberry32(1234);
  const wf = L.W / 660; // genişliğe göre dekor yoğunluğu

  // çimen
  g.fillStyle = '#5aa348'; g.fillRect(0, 0, L.W, L.BEAM_Y + 4);
  for (let i = 0; i < 2600 * wf; i++) {
    const x = rnd() * L.W, y = L.HUD_H + rnd() * (L.BEAM_Y - L.HUD_H);
    g.fillStyle = rnd() < .5 ? '#539b42' : '#63b051';
    g.fillRect(x | 0, y | 0, 2, 2);
  }
  // açık yeşil yamalar
  for (let i = 0; i < 14 * wf; i++) {
    const x = rnd() * L.W, y = L.PEN.y + rnd() * (L.PEN.h - 40), r = 18 + rnd() * 40;
    g.fillStyle = 'rgba(140,200,90,.35)';
    g.beginPath(); g.ellipse(x, y, r, r * .5, 0, 0, 7); g.fill();
  }
  // çiçekler
  const fc = ['#f0f0f0', '#ffd23e', '#e0637c', '#f0a028'];
  for (let i = 0; i < 26 * wf; i++) {
    const x = rnd() * (L.W - 30) + 15, y = L.PEN.y + 10 + rnd() * (L.PEN.h - 30), c = fc[(rnd() * fc.length) | 0];
    g.fillStyle = c;
    g.fillRect(x - 3, y, 3, 3); g.fillRect(x + 3, y, 3, 3);
    g.fillRect(x, y - 3, 3, 3); g.fillRect(x, y + 3, 3, 3);
    g.fillStyle = '#ffd23e'; g.fillRect(x, y, 3, 3);
  }
  // üst çit
  g.fillStyle = '#8a5a30';
  for (let x = 0; x < L.W; x += 44) {
    g.fillRect(x, 4, 10, 34);
    g.fillStyle = '#a06a38'; g.fillRect(x + 2, 4, 3, 34);
    g.fillStyle = '#8a5a30';
  }
  g.fillStyle = '#b87a44'; g.fillRect(0, 10, L.W, 6);
  g.fillRect(0, 26, L.W, 6);
  g.fillStyle = '#8a5a30'; g.fillRect(0, 14, L.W, 2); g.fillRect(0, 30, L.W, 2);

  // ahşap ayraç: kalın kiriş
  g.fillStyle = '#c07830'; g.fillRect(0, L.BEAM_Y, L.W, 14);
  g.fillStyle = '#e09440'; g.fillRect(0, L.BEAM_Y, L.W, 4);
  g.fillStyle = '#8a5424';
  for (let x = 10; x < L.W; x += 90) g.fillRect(x, L.BEAM_Y + 7, 34, 2);
  g.fillStyle = '#6a4a30'; g.fillRect(0, L.BEAM_Y + 14, L.W, 4);
  // sarı-siyah uyarı şeridi
  for (let x = 0; x < L.W; x += 16) {
    g.fillStyle = (x / 16) % 2 ? '#ffd23e' : '#2c2430';
    g.beginPath();
    g.moveTo(x + 6, L.BEAM_Y + 18); g.lineTo(x + 22, L.BEAM_Y + 18);
    g.lineTo(x + 16, L.BEAM_Y + 30); g.lineTo(x, L.BEAM_Y + 30);
    g.closePath(); g.fill();
  }

  // fabrika duvarı: koyu tahtalar
  g.fillStyle = '#3a2430'; g.fillRect(0, L.BEAM_Y + 30, L.W, L.H - L.BEAM_Y - 30);
  for (let y = L.BEAM_Y + 30; y < L.H; y += 22) {
    g.fillStyle = '#432b38'; g.fillRect(0, y, L.W, 2);
    for (let x = ((y / 22) | 0) % 2 ? 30 : 70; x < L.W; x += 140) {
      g.fillStyle = '#432b38'; g.fillRect(x, y, 2, 22);
    }
  }
  // zemin
  g.fillStyle = '#2c1a26'; g.fillRect(0, L.FLOOR_Y, L.W, L.H - L.FLOOR_Y);
  g.fillStyle = '#3a2430'; g.fillRect(0, L.FLOOR_Y, L.W, 3);
  // taban dama şeridi (tüm genişlik)
  for (let i = 0, n = Math.ceil(L.W / 10); i < n; i++) {
    for (let j = 0; j < 2; j++) {
      g.fillStyle = (i + j) % 2 ? '#e8e0e8' : '#241c2c';
      g.fillRect(i * 10, L.H - 20 + j * 10, 10, 10);
    }
  }

  // üst bant askıları: kirişten sarkan L profil + kıskaç
  for (let x = 100; x < L.W - 60; x += 160) {
    g.fillStyle = '#1c1220';
    g.fillRect(x - 1, L.BEAM_Y + 30, 8, L.BELT1_Y - L.BEAM_Y - 34);
    g.fillStyle = '#2e2438';
    g.fillRect(x, L.BEAM_Y + 30, 6, L.BELT1_Y - L.BEAM_Y - 34);
    g.fillStyle = '#54445f';
    g.fillRect(x + 1, L.BEAM_Y + 32, 2, L.BELT1_Y - L.BEAM_Y - 38);
    // banta bağlanan kıskaç + cıvata
    g.fillStyle = '#1c1220';
    g.fillRect(x - 5, L.BELT1_Y - 8, 16, 5);
    g.fillStyle = '#54445f';
    g.fillRect(x + 1, L.BELT1_Y - 7, 2, 2); g.fillRect(x + 8, L.BELT1_Y - 7, 2, 2);
  }
  // sol düşme kanalı: metal huni (sol dik duvar, sağ basamaklı eğim)
  // üst bandın ucu huninin sağında kalır; yumurta açık kanala düşer
  g.fillStyle = '#1c1220';
  g.fillRect(9, L.BELT1_Y - 10, 9, L.BELT2_Y - L.BELT1_Y + L.BELT_H + 16);
  // sağ duvar: basamaklı huni → daralınca düz şaft
  let rx = 82;
  for (let y = L.BELT1_Y + 12; y < L.BELT2_Y - 6; y += 16) {
    g.fillStyle = '#1c1220'; g.fillRect(rx, y, 9, 18);
    g.fillStyle = '#2e2438'; g.fillRect(rx + 1, y, 7, 17);
    rx = Math.max(62, rx - 3);
  }
  g.fillStyle = '#2e2438';
  g.fillRect(10, L.BELT1_Y - 10, 7, L.BELT2_Y - L.BELT1_Y + L.BELT_H + 14);
  // kanal kenar kaplamaları + cıvatalar
  g.fillStyle = '#54445f';
  g.fillRect(9, L.BELT1_Y - 10, 9, 4);
  g.fillRect(82, L.BELT1_Y + 12, 9, 4);
  for (let yy = L.BELT1_Y + 14; yy < L.BELT2_Y; yy += 24) g.fillRect(12, yy, 3, 3);
  g.fillRect(70, L.BELT2_Y - 20, 3, 3);
  // alt bant taşıyıcı kirişi (ayakların üstünde)
  g.fillStyle = '#1c1220';
  g.fillRect(40, L.BELT2_Y + L.BELT_H + 6, L.CRATE_X - 60, 6);
  g.fillStyle = '#2e2438';
  g.fillRect(40, L.BELT2_Y + L.BELT_H + 6, L.CRATE_X - 60, 4);
  // alt bant ayakları: I-kiriş + taban pabucu + cıvata
  for (let x = 60; x < L.CRATE_X - 20; x += 140) {
    g.fillStyle = '#1c1220';
    g.fillRect(x - 1, L.BELT2_Y + L.BELT_H + 12, 12, L.FLOOR_Y - L.BELT2_Y - L.BELT_H - 12);
    g.fillRect(x - 5, L.FLOOR_Y - 4, 20, 4);
    g.fillStyle = '#2e2438';
    g.fillRect(x, L.BELT2_Y + L.BELT_H + 12, 10, L.FLOOR_Y - L.BELT2_Y - L.BELT_H - 12);
    g.fillStyle = '#54445f';
    g.fillRect(x + 2, L.BELT2_Y + L.BELT_H + 14, 3, L.FLOOR_Y - L.BELT2_Y - L.BELT_H - 16);
    g.fillRect(x - 3, L.FLOOR_Y - 3, 3, 2); g.fillRect(x + 10, L.FLOOR_Y - 3, 3, 2);
  }
  // bant altı yağ lekeleri (ince zemin yüzünde)
  g.fillStyle = 'rgba(0,0,0,.2)';
  for (let x = 80; x < L.CRATE_X - 40; x += 180) {
    g.fillRect(x, L.FLOOR_Y + 2, 34, 3);
    g.fillRect(x + 8, L.FLOOR_Y + 5, 18, 2);
  }

  // ---- hat duvarı dekoru: iki bant arasındaki boş fabrika duvarı ----
  // yatay buhar/su boru hattı + flanşlar + vana tekerlekleri
  const py = L.BELT1_Y + 62;
  g.fillStyle = '#241c2c'; g.fillRect(60, py - 2, L.CRATE_X - 110, 9);
  g.fillStyle = '#3c3048'; g.fillRect(60, py - 1, L.CRATE_X - 110, 7);
  g.fillStyle = '#54445f'; g.fillRect(60, py, L.CRATE_X - 110, 2);
  for (let x = 140; x < L.CRATE_X - 90; x += 230) {
    // flanş
    g.fillStyle = '#241c2c'; g.fillRect(x - 2, py - 4, 8, 13);
    g.fillStyle = '#54445f'; g.fillRect(x, py - 3, 4, 11);
    // vana tekerleği (borudan aşağı sarkan)
    g.fillStyle = '#1c1220'; g.fillRect(x + 13, py + 5, 3, 10);
    g.fillStyle = '#8a4030'; g.fillRect(x + 8, py + 14, 13, 4);
    g.fillRect(x + 12, py + 10, 5, 12);
    g.fillStyle = '#5c2a1e'; g.fillRect(x + 14, py + 15, 3, 3);
  }
  // manometreler: gövde + kadran + ibre
  for (let x = 320; x < L.CRATE_X - 90; x += 340) {
    g.fillStyle = '#1c1220'; g.fillRect(x - 1, py - 16, 14, 16);
    g.fillStyle = '#e8e0d8';
    g.beginPath(); g.arc(x + 6, py - 8, 6, 0, 7); g.fill();
    g.strokeStyle = '#7a4030'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x + 6, py - 8); g.lineTo(x + 9, py - 12); g.stroke();
    g.fillStyle = '#54445f'; g.fillRect(x + 4, py - 2, 4, 2);
  }
  // hat tabelası
  g.fillStyle = '#1c1220'; g.fillRect(L.W * 0.36 - 2, L.BELT1_Y + 34, 92, 15);
  g.fillStyle = '#54445f'; g.fillRect(L.W * 0.36, L.BELT1_Y + 35, 88, 13);
  g.fillStyle = '#e8e0e8';
  g.font = 'bold 8px "Courier New",monospace'; g.textAlign = 'center';
  g.fillText('★ YUMURTA HATTI ★', L.W * 0.36 + 44, L.BELT1_Y + 45);
  g.textAlign = 'left';
  // asma iş lambaları: kirişten sarkan kordon + koni + sıcak hale
  for (let x = 240; x < L.CRATE_X - 60; x += 300) {
    const ly = L.BELT1_Y + 92;
    g.fillStyle = '#1c1220'; g.fillRect(x, L.BEAM_Y + 30, 2, ly - L.BEAM_Y - 36);
    g.fillStyle = '#241c2c'; g.fillRect(x - 6, ly - 7, 16, 8);
    g.fillStyle = '#3c3048'; g.fillRect(x - 4, ly - 6, 12, 5);
    g.fillStyle = '#ffd88a'; g.fillRect(x - 2, ly + 1, 6, 3);
    const gr = g.createRadialGradient(x + 1, ly + 1, 2, x + 1, ly + 1, 48);
    gr.addColorStop(0, 'rgba(255,210,120,.14)');
    gr.addColorStop(1, 'rgba(255,210,120,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x + 1, ly + 1, 48, 0, 7); g.fill();
  }
  // duvar havalandırma panjurları
  for (let x = 180; x < L.CRATE_X - 90; x += 380) {
    g.fillStyle = '#1c1220'; g.fillRect(x, L.BELT2_Y - 34, 26, 20);
    g.fillStyle = '#3c3048';
    for (let yy = 0; yy < 14; yy += 5) g.fillRect(x + 3, L.BELT2_Y - 31 + yy, 20, 2);
  }

  // depo dekoru: bacakların sağına istifler (sandık, yumurta kasası, çuval, varil)
  for (let x = 85; x < L.CRATE_X - 80; x += 140) {
    const pick = rnd();
    if (pick < 0.5) {
      drawCrate(g, x, L.FLOOR_Y, 34, 24);
      drawCrate(g, x + 2, L.FLOOR_Y - 24, 30, 22);
      if (rnd() < 0.5) drawEggCrate(g, x + 4, L.FLOOR_Y - 46);
    } else if (pick < 0.8) {
      drawCrate(g, x, L.FLOOR_Y, 34, 24);
      drawSack(g, x + 40, L.FLOOR_Y);
    } else {
      drawBarrel(g, x + 4, L.FLOOR_Y);
    }
  }
}
