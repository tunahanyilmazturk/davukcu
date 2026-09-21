// ÇİFTLİK sayfası (sayfa 0, dünya x: 0..W): tam boy otlak, üst çit,
// sağ kenar çiti, alt toprak hat (yumurtaların yuvarlandığı yol) ve
// fabrikaya giden boru ağzı. Fabrika çizimi src/world/factory.js'te —
// geliştirirken iki alan birbirine karışmaz.
import { L, H, mulberry32 } from '../config.js';

export function drawFarm(g) {
  const rnd = mulberry32(1234);
  const wf = L.W / 660; // genişliğe göre dekor yoğunluğu
  const P = L.PEN;

  // çimen — sayfa boyu
  g.fillStyle = '#5aa348'; g.fillRect(0, 0, L.W, H);
  for (let i = 0; i < 3800 * wf; i++) {
    const x = rnd() * L.W, y = L.FARM.y + rnd() * L.FARM.h;
    g.fillStyle = rnd() < .5 ? '#539b42' : '#63b051';
    g.fillRect(x | 0, y | 0, 2, 2);
  }
  // açık yeşil yamalar
  for (let i = 0; i < 20 * wf; i++) {
    const x = rnd() * L.W, y = P.y + rnd() * (P.h - 40), r = 18 + rnd() * 44;
    g.fillStyle = 'rgba(140,200,90,.35)';
    g.beginPath(); g.ellipse(x, y, r, r * .5, 0, 0, 7); g.fill();
  }
  // çiçekler
  const fc = ['#f0f0f0', '#ffd23e', '#e0637c', '#f0a028'];
  for (let i = 0; i < 34 * wf; i++) {
    const x = rnd() * (L.W - 30) + 15, y = P.y + 10 + rnd() * (P.h - 30), c = fc[(rnd() * fc.length) | 0];
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

  // ---- yumurta yolu: kümesin altında toprak hat — yumurtalar sağa yuvarlanır ----
  const py = L.PEN_FLOOR - 16;           // yol üst kenarı
  g.fillStyle = '#8a7a4c'; g.fillRect(0, py, L.W, 34);          // toprak hat
  g.fillStyle = '#7a6a3e'; g.fillRect(0, py, L.W, 3);           // üst gölge
  g.fillStyle = '#9a8a58'; g.fillRect(0, py + 3, L.W, 2);       // kenar ışığı
  for (let i = 0; i < 90 * wf; i++) {                            // taş/ot parçaları
    const x = rnd() * L.W, y = py + 6 + rnd() * 24;
    g.fillStyle = rnd() < .5 ? '#7a6a40' : '#5e9040';
    g.fillRect(x | 0, y | 0, 3, 2);
  }
  // yol altı: çim devam + hafif gölge bandı
  g.fillStyle = '#4a8a3c'; g.fillRect(0, py + 34, L.W, 4);

  // ---- sağ kenar: kümes çiti + yumurta borusu ağzı ----
  const ex = L.W - 14;
  g.fillStyle = '#8a5a30';
  for (let y = 60; y < py; y += 44) {   // dikey çit direkleri
    g.fillRect(ex, y, 10, 30);
    g.fillStyle = '#a06a38'; g.fillRect(ex + 2, y, 3, 30);
    g.fillStyle = '#8a5a30';
  }
  g.fillStyle = '#b87a44'; g.fillRect(ex - 2, 70, 14, 5);      // yatay kuşaklar
  g.fillRect(ex - 2, 200, 14, 5); g.fillRect(ex - 2, 400, 14, 5);
  // boru ağzı: huni — soldan geniş ağız, sağda kenara çıkan cam tüpe daralır
  const dx = L.DUCT_IN - 10;
  const my = L.DUCT_Y;
  // zemin gölgesi + boru gövdesi (kenara kadar)
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(dx - 26, my - 10, L.W - dx + 30, 24);
  g.fillStyle = '#161020'; g.fillRect(dx + 2, my - 13, L.W - dx, 26);       // kasa dış hat
  g.fillStyle = '#3f3650'; g.fillRect(dx + 3, my - 12, L.W - dx - 1, 24);   // metal gövde
  g.fillStyle = '#5a5270'; g.fillRect(dx + 3, my - 12, L.W - dx - 1, 3);
  g.fillRect(dx + 3, my + 9, L.W - dx - 1, 3);
  g.fillStyle = '#141c28'; g.fillRect(dx + 4, my - 9, L.W - dx - 4, 18);    // cam kanal
  g.fillStyle = 'rgba(140,190,235,.15)'; g.fillRect(dx + 4, my - 9, L.W - dx - 4, 18);
  g.fillStyle = 'rgba(220,240,255,.32)'; g.fillRect(dx + 4, my - 9, L.W - dx - 4, 2);
  g.fillStyle = 'rgba(0,0,0,.30)'; g.fillRect(dx + 4, my + 7, L.W - dx - 4, 2);
  // huni: soldan genişleyen yamuk ağız
  g.fillStyle = '#161020';
  g.beginPath();
  g.moveTo(dx - 34, my - 17); g.lineTo(dx + 4, my - 12);
  g.lineTo(dx + 4, my + 12);  g.lineTo(dx - 34, my + 17);
  g.closePath(); g.fill();
  g.fillStyle = '#54445f';
  g.beginPath();
  g.moveTo(dx - 32, my - 15); g.lineTo(dx + 3, my - 10);
  g.lineTo(dx + 3, my + 10);  g.lineTo(dx - 32, my + 15);
  g.closePath(); g.fill();
  g.fillStyle = '#14101a'; // ağız içi — karanlık yamuk
  g.beginPath();
  g.moveTo(dx - 30, my - 11); g.lineTo(dx - 2, my - 7);
  g.lineTo(dx - 2, my + 7);   g.lineTo(dx - 30, my + 11);
  g.closePath(); g.fill();
  // huni kenar cıvataları + alt kılavuz rampa
  g.fillStyle = '#6a5a78';
  g.fillRect(dx - 32, my - 15, 3, 3); g.fillRect(dx - 32, my + 12, 3, 3);
  g.fillRect(dx - 20, my - 13, 3, 3); g.fillRect(dx - 20, my + 10, 3, 3);
  g.fillStyle = '#3f3650'; // rampa: yoldan ağız dibine eğim
  g.beginPath();
  g.moveTo(dx - 34, my + 17); g.lineTo(dx + 4, my + 12); g.lineTo(dx + 4, my + 17);
  g.closePath(); g.fill();
  // ağız üstü ok tabelası
  g.fillStyle = '#6a4a30'; g.fillRect(dx - 8, L.DUCT_Y - 44, 6, 26);
  g.fillStyle = '#241c14'; g.fillRect(dx - 24, L.DUCT_Y - 64, 60, 22);
  g.fillStyle = '#e8d8b0'; g.fillRect(dx - 22, L.DUCT_Y - 62, 56, 18);
  g.fillStyle = '#7a4030';
  g.font = 'bold 9px "Courier New",monospace'; g.textAlign = 'center';
  g.fillText('FABRİKA', dx + 6, L.DUCT_Y - 51);
  g.textAlign = 'left';
}
