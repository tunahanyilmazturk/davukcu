// FABRİKA bölgesi (L.LINE): ayıraç kirişi, duvar, bant askıları, huni,
// hat altı taşıyıcılar, zemin ve depo dekoru — statik arka plan.
// Otlak çizimi src/world/farm.js'te; bu dosya sadece BEAM_Y ve altını çizer.
import { L, mulberry32 } from '../config.js';

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

export function drawFactory(g) {
  const rnd = mulberry32(777);
  const wTop = L.LINE.y; // duvarın başladığı hat

  // ---- ayraç kirişi: ahşap hat + cıvata sırası ----
  g.fillStyle = '#c07830'; g.fillRect(0, L.BEAM_Y, L.W, 14);
  g.fillStyle = '#e09440'; g.fillRect(0, L.BEAM_Y, L.W, 4);
  g.fillStyle = '#8a5424';
  for (let x = 10; x < L.W; x += 90) g.fillRect(x, L.BEAM_Y + 7, 34, 2);
  g.fillStyle = '#5c3a1e';
  for (let x = 24; x < L.W; x += 90) {
    g.fillRect(x, L.BEAM_Y + 4, 3, 3); g.fillRect(x, L.BEAM_Y + 10, 3, 2);
  }
  g.fillStyle = '#6a4a30'; g.fillRect(0, L.BEAM_Y + 14, L.W, 4);
  // sarı-siyah uyarı şeridi
  for (let x = 0; x < L.W; x += 16) {
    g.fillStyle = (x / 16) % 2 ? '#ffd23e' : '#2c2430';
    g.beginPath();
    g.moveTo(x + 6, L.BEAM_Y + 18); g.lineTo(x + 22, L.BEAM_Y + 18);
    g.lineTo(x + 16, L.BEAM_Y + 30); g.lineTo(x, L.BEAM_Y + 30);
    g.closePath(); g.fill();
  }

  // ---- fabrika duvarı: koyu tahtalar + payanda dikmeleri ----
  g.fillStyle = '#3a2430'; g.fillRect(0, wTop, L.W, L.H - wTop);
  for (let y = wTop; y < L.H; y += 22) {
    g.fillStyle = '#432b38'; g.fillRect(0, y, L.W, 2);
    for (let x = ((y / 22) | 0) % 2 ? 30 : 70; x < L.W; x += 140) {
      g.fillStyle = '#432b38'; g.fillRect(x, y, 2, 22);
    }
  }
  // payandalar: zemine inen hafif açık dikme + taban bloğu
  for (let x = 150; x < L.CRATE_X - 60; x += 190) {
    g.fillStyle = '#2c1a26'; g.fillRect(x - 1, wTop, 14, L.FLOOR_Y - wTop);
    g.fillStyle = '#463040'; g.fillRect(x, wTop, 12, L.FLOOR_Y - wTop);
    g.fillStyle = '#54404c'; g.fillRect(x + 1, wTop + 2, 10, 4);
    g.fillStyle = '#2c1a26'; g.fillRect(x - 2, L.FLOOR_Y - 16, 16, 16);
    g.fillStyle = '#3c2836'; g.fillRect(x, L.FLOOR_Y - 14, 12, 14);
  }
  // kiriş altı kablo tavası + sarkan kelepçeler
  g.fillStyle = '#241c2c'; g.fillRect(0, wTop + 2, L.W, 7);
  g.fillStyle = '#3c3048'; g.fillRect(0, wTop + 2, L.W, 5);
  g.fillStyle = '#54445f'; g.fillRect(0, wTop + 3, L.W, 1);
  for (let x = 30; x < L.W; x += 90) {
    g.fillStyle = '#241c2c'; g.fillRect(x, wTop + 9, 3, 5);
  }

  // üst bant askıları: kirişten sarkan L profil + kıskaç
  for (let x = 100; x < L.W - 60; x += 160) {
    g.fillStyle = '#1c1220';
    g.fillRect(x - 1, wTop + 12, 8, L.BELT1_Y - wTop - 16);
    g.fillStyle = '#2e2438';
    g.fillRect(x, wTop + 12, 6, L.BELT1_Y - wTop - 16);
    g.fillStyle = '#54445f';
    g.fillRect(x + 1, wTop + 14, 2, L.BELT1_Y - wTop - 20);
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
  // hat altı yatay kiriş — bacakların arkasında duvarı kuşatır
  const gy = L.BELT2_Y + L.BELT_H + 56;
  g.fillStyle = '#1c1220'; g.fillRect(30, gy, L.CRATE_X - 50, 9);
  g.fillStyle = '#2e2438'; g.fillRect(30, gy, L.CRATE_X - 50, 6);
  g.fillStyle = '#54445f';
  for (let x = 60; x < L.CRATE_X - 40; x += 140) g.fillRect(x, gy + 2, 3, 3);
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
  const py = L.BELT1_Y + 44;
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
  // hat tabelası — huni ile yıkama arasındaki boş duvara sabitli
  g.fillStyle = '#1c1220'; g.fillRect(162, L.BELT1_Y + 24, 92, 15);
  g.fillStyle = '#54445f'; g.fillRect(164, L.BELT1_Y + 25, 88, 13);
  g.fillStyle = '#e8e0e8';
  g.font = 'bold 8px "Courier New",monospace'; g.textAlign = 'center';
  g.fillText('★ YUMURTA HATTI ★', 208, L.BELT1_Y + 35);
  g.textAlign = 'left';
  // asma iş lambaları: kirişten sarkan kordon + koni + sıcak hale
  for (let x = 240; x < L.CRATE_X - 60; x += 300) {
    const ly = L.BELT1_Y + 72;
    g.fillStyle = '#1c1220'; g.fillRect(x, wTop + 6, 2, ly - wTop - 12);
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
    g.fillStyle = '#1c1220'; g.fillRect(x, L.BELT2_Y - 30, 26, 17);
    g.fillStyle = '#3c3048';
    for (let yy = 0; yy < 12; yy += 5) g.fillRect(x + 3, L.BELT2_Y - 27 + yy, 20, 2);
  }

  // ---- zemin hattı: süpürgelik, drenaj, yükleme platformu, beton zemin ----
  // duvar eteği (süpürgelik)
  g.fillStyle = '#241420'; g.fillRect(0, L.FLOOR_Y - 14, L.W, 14);
  g.fillStyle = '#4a3444'; g.fillRect(0, L.FLOOR_Y - 14, L.W, 2);
  // huni altı drenaj ızgarası (eteğin içinde)
  g.fillStyle = '#14101a'; g.fillRect(34, L.FLOOR_Y - 11, 46, 9);
  g.fillStyle = '#3c3048';
  for (let x = 38; x < 76; x += 8) g.fillRect(x, L.FLOOR_Y - 10, 4, 7);
  // yükleme platformu: kutu altında beton çıkıntı + sarı kenar + tamponlar
  const dx = L.CRATE_X - 26;
  g.fillStyle = '#1a141e'; g.fillRect(dx - 2, L.FLOOR_Y - 27, L.W - dx - 6, 27);
  g.fillStyle = '#443a48'; g.fillRect(dx, L.FLOOR_Y - 26, L.W - dx - 10, 24);
  g.fillStyle = '#5a4e60'; g.fillRect(dx, L.FLOOR_Y - 26, L.W - dx - 10, 3);
  g.fillStyle = '#caa028';
  for (let x = dx + 4; x < L.W - 20; x += 18) g.fillRect(x, L.FLOOR_Y - 24, 9, 2);
  for (const bx of [dx + 8, L.W - 36]) {
    g.fillStyle = '#14101a'; g.fillRect(bx, L.FLOOR_Y - 24, 12, 20);
    g.fillStyle = '#3a3242'; g.fillRect(bx + 2, L.FLOOR_Y - 22, 8, 16);
  }
  // beton zemin + derz çizgileri
  g.fillStyle = '#2c1a26'; g.fillRect(0, L.FLOOR_Y, L.W, L.H - L.FLOOR_Y);
  g.fillStyle = '#3a2430'; g.fillRect(0, L.FLOOR_Y, L.W, 3);
  g.fillStyle = '#241420';
  for (let x = 44; x < L.W; x += 80) g.fillRect(x, L.FLOOR_Y + 5, 2, L.H - L.FLOOR_Y - 25);
  // taban dama şeridi (tüm genişlik)
  for (let i = 0, n = Math.ceil(L.W / 10); i < n; i++) {
    for (let j = 0; j < 2; j++) {
      g.fillStyle = (i + j) % 2 ? '#e8e0e8' : '#241c2c';
      g.fillRect(i * 10, L.H - 20 + j * 10, 10, 10);
    }
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
