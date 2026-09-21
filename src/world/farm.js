// ÇİFTLİK sayfası (sayfa 0, dünya x: 0..W): tam boy otlak, üst çit,
// sağ kenar çiti, alt toprak hat (yumurtaların yuvarlandığı yol) ve
// fabrikaya giden boru ağzı. Fabrika çizimi src/world/factory.js'te —
// geliştirirken iki alan birbirine karışmaz.
//
// Manzara öğeleri (gölet, kümes, değirmen...) MAĞAZA'dan satın alınır:
// sahipsizse arsada "SATILIK" tabelası durur, satın alınınca buildBG()
// yeniden kurulur ve öğe yerinde belirir. Her öğe bağımsız fonksiyondur;
// mağaza kartı önizlemesi de aynı fonksiyonları kullanır (SCEN_DRAW).
// Hareketli parçalar (değirmen kanatları, bayrak, gölet dalgası)
// render/ambient.js'te aynı sahiplikle kapılıdır.
import { L, H, mulberry32 } from '../config.js';
import { S } from '../state.js';
import { SCENERY } from '../decor.js';

// ---- gölet: kum halkası, su, nilüfer yaprakları, kamışlar, çakıllar ----
function drawPond(g, rnd) {
  const PO = L.POND, pcx = PO.x + PO.w / 2, pcy = PO.y + PO.h / 2;
  g.fillStyle = 'rgba(0,0,0,.14)';
  g.beginPath(); g.ellipse(pcx + 3, pcy + 5, PO.w / 2 + 8, PO.h / 2 + 6, 0, 0, 7); g.fill();
  g.fillStyle = '#9a8a58';
  g.beginPath(); g.ellipse(pcx, pcy, PO.w / 2 + 7, PO.h / 2 + 5, 0, 0, 7); g.fill();
  g.fillStyle = '#3e7a9a';
  g.beginPath(); g.ellipse(pcx, pcy, PO.w / 2, PO.h / 2, 0, 0, 7); g.fill();
  g.fillStyle = '#4a92b8';
  g.beginPath(); g.ellipse(pcx - 8, pcy - 4, PO.w / 2 - 14, PO.h / 2 - 12, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(170,225,245,.45)';
  g.beginPath(); g.ellipse(pcx - 22, pcy - 11, 24, 7, -.15, 0, 7); g.fill();
  for (const [lx, ly, lr] of [[pcx - 32, pcy + 12, 10], [pcx + 24, pcy - 7, 8], [pcx + 46, pcy + 13, 9]]) {
    g.fillStyle = '#4a8a3c';
    g.beginPath(); g.ellipse(lx, ly, lr, lr * .55, 0, 0, 7); g.fill();
    g.fillStyle = '#3e7a34';
    g.beginPath(); g.ellipse(lx - 2, ly - 1, lr * .5, lr * .28, 0, 0, 7); g.fill();
  }
  g.fillStyle = '#f0f0f0'; g.fillRect(pcx + 22, pcy - 11, 4, 4); // nilüfer çiçeği
  g.fillStyle = '#ffd23e'; g.fillRect(pcx + 23, pcy - 10, 2, 2);
  for (const [rx, rh] of [[PO.x + 12, 26], [PO.x + 22, 33], [PO.x + PO.w - 18, 24]]) {
    g.fillStyle = '#3e6a30'; g.fillRect(rx, PO.y - rh + 16, 3, rh);   // sap
    g.fillStyle = '#6a4a22'; g.fillRect(rx - 1, PO.y - rh + 11, 5, 9); // kafa
  }
  for (let i = 0; i < 8; i++) { // kenar çakılları
    const a = rnd() * 7;
    g.fillStyle = '#8a8a7a';
    g.fillRect(pcx + Math.cos(a) * (PO.w / 2 + 4) - 2, pcy + Math.sin(a) * (PO.h / 2 + 3) - 1, 4, 3);
  }
  // kenar mantarları — göletin nemli tarafında
  for (const [mx2, my2] of [[PO.x - 8, PO.y - 8], [PO.x + 18, PO.y - 14]]) {
    g.fillStyle = '#e8e0d0'; g.fillRect(mx2, my2, 4, 6);
    g.fillStyle = '#c04030'; g.fillRect(mx2 - 3, my2 - 4, 10, 5);
    g.fillStyle = '#f0f0f0'; g.fillRect(mx2, my2 - 3, 2, 2);
  }
}

// ---- buğday tarlası: sürülmüş toprak + başak sıraları + korkuluk ----
function drawWheat(g, rnd) {
  const WH = L.WHEAT;
  g.fillStyle = 'rgba(0,0,0,.10)'; g.fillRect(WH.x + 3, WH.y + 4, WH.w, WH.h);
  g.fillStyle = '#7a5a34'; g.fillRect(WH.x, WH.y, WH.w, WH.h);
  g.fillStyle = '#8a6a3e'; g.fillRect(WH.x, WH.y, WH.w, 4);
  g.fillStyle = '#644a26';
  for (let y = WH.y + 16; y < WH.y + WH.h - 6; y += 26)
    g.fillRect(WH.x + 6, y, WH.w - 12, 3);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) {
    const wx = WH.x + 16 + c * (WH.w - 32) / 8 + (rnd() - .5) * 6;
    const wy = WH.y + 20 + r * 30 + (rnd() - .5) * 5;
    g.fillStyle = '#c89830'; g.fillRect(wx - 1, wy, 3, 14);
    g.fillStyle = '#e8c048'; g.fillRect(wx - 3, wy - 8, 7, 10);
    g.fillStyle = '#d8b038'; g.fillRect(wx - 1, wy - 10, 3, 12);
  }
  const scx = WH.x + 30, scy = WH.y + 48; // korkuluk
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(scx - 8, scy + 12, 18, 4);
  g.fillStyle = '#5e4020'; g.fillRect(scx - 2, scy - 24, 4, 38);
  g.fillRect(scx - 14, scy - 16, 28, 4);
  g.fillStyle = '#d8b038'; g.fillRect(scx - 16, scy - 14, 4, 8);
  g.fillRect(scx + 12, scy - 14, 4, 8);
  g.fillStyle = '#d8b890'; g.beginPath(); g.arc(scx, scy - 28, 7, 0, 7); g.fill();
  g.fillStyle = '#7a4a20'; g.fillRect(scx - 8, scy - 36, 16, 5);
  g.fillRect(scx - 5, scy - 42, 10, 7);
  g.fillStyle = '#3a2a18'; g.fillRect(scx - 3, scy - 29, 2, 2); g.fillRect(scx + 2, scy - 29, 2, 2);
}

// ---- kırmızı kümes: tahta gövde, basamaklı çatı, kapı + rampa, yuvalık ----
// ayçiçekleri kümes bahçesinin parçası — kümesle birlikte gelir
function drawCoop(g) {
  const C = L.COOP;
  g.fillStyle = 'rgba(0,0,0,.20)';
  g.beginPath(); g.ellipse(C.x + C.w / 2 + 4, C.y + C.h + 4, C.w / 2 + 10, 11, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(140,120,80,.45)'; // kapı önü aşınmış toprak
  g.beginPath(); g.ellipse(C.x + C.w / 2 + 8, C.y + C.h + 8, 46, 12, 0, 0, 7); g.fill();
  g.fillStyle = '#a03c30'; g.fillRect(C.x, C.y + 22, C.w, C.h - 22); // gövde
  g.fillStyle = '#7a2c22';
  for (let x = C.x + 14; x < C.x + C.w - 6; x += 15) g.fillRect(x, C.y + 24, 2, C.h - 26); // tahta derzleri
  g.fillStyle = '#f0e8d8'; // köşe pervazları
  g.fillRect(C.x, C.y + 22, 4, C.h - 22); g.fillRect(C.x + C.w - 4, C.y + 22, 4, C.h - 22);
  g.fillRect(C.x, C.y + C.h - 4, C.w, 4);
  // basamaklı çatı (kırma)
  const rw = C.w + 14;
  g.fillStyle = '#5e2820';
  g.fillRect(C.x - 7, C.y + 12, rw, 12);
  g.fillRect(C.x + 3, C.y + 4, rw - 20, 10);
  g.fillRect(C.x + 16, C.y - 3, rw - 46, 9);
  g.fillStyle = '#6e342a';
  g.fillRect(C.x - 7, C.y + 12, rw, 4);
  g.fillRect(C.x + 3, C.y + 4, rw - 20, 3);
  g.fillRect(C.x + 16, C.y - 3, rw - 46, 3);
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(C.x, C.y + 22, C.w, 4); // saçak gölgesi
  // rüzgar gülü (horoz yelkovanı) çatı tepesinde
  const vx = C.x + C.w / 2;
  g.fillStyle = '#241c14'; g.fillRect(vx - 1, C.y - 20, 2, 18);
  g.fillRect(vx - 9, C.y - 15, 18, 2);
  g.beginPath(); g.moveTo(vx + 9, C.y - 18); g.lineTo(vx + 13, C.y - 14); g.lineTo(vx + 9, C.y - 10); g.closePath(); g.fill();
  g.fillStyle = '#c04030'; g.fillRect(vx - 4, C.y - 21, 5, 5);
  // pencere (sol)
  g.fillStyle = '#f0e8d8'; g.fillRect(C.x + 16, C.y + 44, 24, 24);
  g.fillStyle = '#ffd88a'; g.fillRect(C.x + 19, C.y + 47, 18, 18);
  g.fillStyle = '#f0e8d8'; g.fillRect(C.x + 27, C.y + 47, 2, 18); g.fillRect(C.x + 19, C.y + 55, 18, 2);
  // kapı (orta-sağ) + tabela
  const dxx = C.x + C.w / 2 + 6;
  g.fillStyle = '#f0e8d8'; g.fillRect(dxx - 3, C.y + C.h - 44, 36, 44);
  g.fillStyle = '#2a1a14'; g.fillRect(dxx, C.y + C.h - 41, 30, 41);
  g.fillStyle = '#6a4a30'; g.fillRect(dxx + 2, C.y + C.h - 39, 26, 39); // yarı açık kapı
  g.fillStyle = '#4a3020'; g.fillRect(dxx + 2, C.y + C.h - 39, 3, 39);
  g.fillStyle = '#241c14'; g.fillRect(dxx + 4, C.y + C.h - 56, 34, 13); // KÜMES tabelası
  g.fillStyle = '#e8d8b0'; g.fillRect(dxx + 5, C.y + C.h - 55, 32, 11);
  g.fillStyle = '#7a4030';
  g.font = 'bold 8px "Courier New",monospace'; g.textAlign = 'center';
  g.fillText('KÜMES', dxx + 21, C.y + C.h - 47);
  g.textAlign = 'left';
  // rampa — kapıdan aşağı eğik tahta
  g.fillStyle = '#54381e';
  g.beginPath(); g.moveTo(dxx - 2, C.y + C.h - 1); g.lineTo(dxx + 30, C.y + C.h - 1);
  g.lineTo(dxx + 44, C.y + C.h + 16); g.lineTo(dxx + 12, C.y + C.h + 16); g.closePath(); g.fill();
  g.fillStyle = '#8a5a30';
  g.beginPath(); g.moveTo(dxx + 1, C.y + C.h + 1); g.lineTo(dxx + 29, C.y + C.h + 1);
  g.lineTo(dxx + 40, C.y + C.h + 14); g.lineTo(dxx + 13, C.y + C.h + 14); g.closePath(); g.fill();
  g.fillStyle = '#54381e';
  for (let i = 0; i < 3; i++) { // rampa basamakları
    const ry = C.y + C.h + 3 + i * 4, rl = (ry - C.y - C.h) * 1.6;
    g.fillRect(dxx + 4 + rl * .4, ry, 30 - rl * .3, 2);
  }
  // yuvalık kutusu — sağ yanda çıkıntı + eğik kapak
  g.fillStyle = '#6a4a28'; g.fillRect(C.x + C.w, C.y + C.h - 34, 16, 26);
  g.fillStyle = '#54381e'; g.fillRect(C.x + C.w - 2, C.y + C.h - 38, 20, 6);
  g.fillStyle = '#241c14'; g.fillRect(C.x + C.w + 3, C.y + C.h - 26, 10, 12); // giriş deliği
  // ayçiçekleri — kümes ile gübre kovası arasındaki boşlukta
  const sfGap = Math.max(26, L.MANURE_BIN.x - (C.x + C.w) - 10);
  const sfN = sfGap > 60 ? 3 : 2;
  for (let i = 0; i < sfN; i++) {
    const sx = C.x + C.w + 8 + (i + 0.5) * (sfGap - 8) / sfN, sy = 88;
    g.fillStyle = '#3e6a30'; g.fillRect(sx - 1, sy, 3, 34);
    g.fillRect(sx - 5, sy + 16, 5, 3); g.fillRect(sx + 1, sy + 22, 5, 3);
    g.fillStyle = '#e8a028';
    for (let p = 0; p < 8; p++) {
      const a = p / 8 * Math.PI * 2;
      g.fillRect(sx + Math.cos(a) * 7 - 2, sy - 6 + Math.sin(a) * 7 - 2, 4, 4);
    }
    g.fillStyle = '#6a4a22'; g.fillRect(sx - 4, sy - 10, 8, 8);
  }
}

// ---- rüzgar gülü kulesi: A bacaklar + çaprazlar + kulübe (kanatlar ambient'te) ----
function drawMill(g) {
  const M = L.MILL, mx = M.x + M.w / 2;
  g.fillStyle = 'rgba(0,0,0,.16)';
  g.beginPath(); g.ellipse(mx + 4, M.y + M.h + 3, M.w / 2 + 8, 6, 0, 0, 7); g.fill();
  g.fillStyle = '#54381e'; // bacaklar
  g.beginPath(); g.moveTo(M.x, M.y + M.h); g.lineTo(M.x + 8, M.y + M.h);
  g.lineTo(mx - 1, M.y + 16); g.lineTo(mx - 7, M.y + 16); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(M.x + M.w - 8, M.y + M.h); g.lineTo(M.x + M.w, M.y + M.h);
  g.lineTo(mx + 7, M.y + 16); g.lineTo(mx + 1, M.y + 16); g.closePath(); g.fill();
  g.fillStyle = '#6a4a28'; // yatay çaprazlar
  g.fillRect(M.x + 5, M.y + 88, M.w - 10, 4);
  g.fillRect(M.x + 8, M.y + 60, M.w - 16, 4);
  g.fillRect(M.x + 11, M.y + 36, M.w - 22, 4);
  g.fillStyle = '#54381e'; // X çapraz vurguları
  for (let i = 0; i < 3; i++) {
    const by = M.y + 40 + i * 24;
    g.fillRect(M.x + 10 + i * 2, by, 3, 22); g.fillRect(M.x + M.w - 13 - i * 2, by, 3, 22);
  }
  g.fillStyle = '#8a5a30'; g.fillRect(mx - 16, M.y + 12, 32, 20); // kulübe
  g.fillStyle = '#5e2820';
  g.beginPath(); g.moveTo(mx - 20, M.y + 14); g.lineTo(mx, M.y - 2);
  g.lineTo(mx + 20, M.y + 14); g.closePath(); g.fill();
  g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(mx, M.y + 20, 5, 0, 7); g.fill(); // göbek
}

// ---- saman balyası ----
function drawHay(g) {
  const HB = L.HAY;
  g.fillStyle = 'rgba(0,0,0,.15)';
  g.beginPath(); g.ellipse(HB.x + HB.w / 2 + 2, HB.y + HB.h - 2, HB.w / 2 + 3, 5, 0, 0, 7); g.fill();
  g.fillStyle = '#d8b038';
  g.beginPath(); g.arc(HB.x + HB.w / 2, HB.y + HB.h / 2, HB.h / 2 + 2, 0, 7); g.fill();
  g.fillStyle = '#e8c858';
  g.beginPath(); g.arc(HB.x + HB.w / 2 - 2, HB.y + HB.h / 2 - 2, HB.h / 2 - 3, 0, 7); g.fill();
  g.strokeStyle = '#b89030'; g.lineWidth = 2;
  g.beginPath(); g.arc(HB.x + HB.w / 2, HB.y + HB.h / 2, 8, .5, 2.6); g.stroke();
  g.beginPath(); g.arc(HB.x + HB.w / 2, HB.y + HB.h / 2, 4, .5, 2.9); g.stroke();
}

// ---- satılık arsa tabelası — sahipsiz manzara parselinde durur ----
function drawForSale(g, id) {
  const [sx, sy] = SCENERY[id].sign();
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(sx + 2, sy + 22, 44, 4);
  g.fillStyle = '#6a4a28'; g.fillRect(sx + 21, sy + 12, 4, 12);      // direk
  g.fillStyle = '#54381e'; g.fillRect(sx, sy, 46, 14);               // tahta
  g.fillStyle = '#7a5a34'; g.fillRect(sx + 1, sy + 1, 44, 12);
  g.fillStyle = '#e8d8b0';
  g.font = 'bold 7px "Courier New",monospace'; g.textAlign = 'center';
  g.fillText('SATILIK', sx + 23, sy + 10);
  g.textAlign = 'left';
}

// mağaza kartı önizlemesi için statik çizimler (hareketli parçalar
// ambient'te: mill kanatları drawMillBlades, flag drawFlag)
export const SCEN_DRAW = { hay: drawHay, coop: drawCoop, pond: drawPond, wheat: drawWheat, mill: drawMill };

export function drawFarm(g) {
  const rnd = mulberry32(1234);
  const wf = L.W / 660; // genişliğe göre dekor yoğunluğu
  const P = L.PEN;
  const own = S.scenery || {};

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

  // ---- manzara öğeleri: sahipse öğe, değilse SATILIK tabelası ----
  if (own.pond) drawPond(g, rnd); else drawForSale(g, 'pond');
  if (own.wheat) drawWheat(g, rnd); else drawForSale(g, 'wheat');
  if (own.coop) drawCoop(g); else drawForSale(g, 'coop');
  if (own.mill) drawMill(g); else drawForSale(g, 'mill');
  if (own.hay) drawHay(g); else drawForSale(g, 'hay');
  if (!own.flag) drawForSale(g, 'flag'); // bayrak tamamen ambient'te çizilir

  // ---- tek başına zemin detayları (satın alımsız) ----
  // sol üst köşedeki mantar
  g.fillStyle = '#e8e0d0'; g.fillRect(34, 470, 4, 6);
  g.fillStyle = '#c04030'; g.fillRect(31, 466, 10, 5);
  g.fillStyle = '#f0f0f0'; g.fillRect(34, 467, 2, 2);
  // dağınık taş kümeleri
  for (const [sx2, sy2] of [[L.W * 0.55, 420], [L.W * 0.3, 330], [L.W - 220, 480]]) {
    g.fillStyle = '#8a8a7a';
    g.fillRect(sx2, sy2, 7, 5); g.fillRect(sx2 + 9, sy2 + 3, 5, 4); g.fillRect(sx2 + 3, sy2 - 5, 4, 4);
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
  // araba tekerlek izleri — yol boyunca iki soluk oluk
  g.fillStyle = 'rgba(60,48,26,.35)';
  g.fillRect(0, py + 8, L.W, 3); g.fillRect(0, py + 23, L.W, 3);
  // yol kenarında gaga izleri
  g.fillStyle = 'rgba(60,48,26,.3)';
  for (let i = 0; i < 26 * wf; i++) {
    const x = rnd() * L.W, y = py + 4 + rnd() * 4;
    g.fillRect(x | 0, y | 0, 2, 2); g.fillRect(x + 3, y + 1, 2, 2);
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
