// Kozmetik süs çizimi — satın alınan DECOR öğeleri çiftlik sayfasında,
// ambient katmanından sonra tavuklardan önce çizilir. Her öğe yerel
// ~64x64 kutuda, taban-merkez ankrajlı çizilir; t parametresi animasyon
// saatidir. Mağaza kart önizlemeleri aynı fonksiyonları kullanır.
import { L } from '../config.js';
import { S } from '../state.js';
import { DECOR } from '../decor.js';

// ---- öğe çizimleri: (g, t) — yerel kutu, taban ~y:58 ----
const PAINT = {
  // yükseltilmiş ahşap tarh + iki sıra çiçek
  flowers(g, t) {
    g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(6, 54, 54, 5);
    g.fillStyle = '#6a4a28'; g.fillRect(8, 46, 48, 12);
    g.fillStyle = '#54381e'; g.fillRect(8, 46, 48, 3);
    g.fillStyle = '#7a5a34'; g.fillRect(8, 46, 4, 12); g.fillRect(52, 46, 4, 12);
    g.fillStyle = '#3e2e1a'; g.fillRect(12, 49, 40, 7); // toprak
    const cols = ['#e0637c', '#ffd23e', '#f0f0f0', '#c894e8', '#f0a028'];
    for (let i = 0; i < 5; i++) {
      const fx = 15 + i * 8, sw = Math.sin(t * 1.6 + i * 1.3) * 1.2;
      g.fillStyle = '#3e6a30'; g.fillRect(fx + sw, 38, 2, 12);
      g.fillStyle = cols[i];
      g.fillRect(fx + sw - 3, 33, 3, 4); g.fillRect(fx + sw + 3, 33, 3, 4);
      g.fillRect(fx + sw - 1, 31, 4, 3); g.fillRect(fx + sw - 1, 37, 4, 3);
      g.fillStyle = '#ffd23e'; g.fillRect(fx + sw, 34, 2, 3);
    }
  },
  // kümes kapısından inen taş patika — yerde yassı taşlar
  path(g) {
    for (let i = 0; i < 6; i++) {
      const sx = 8 + (i * 7) % 40, sy = 6 + i * 9;
      g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(sx + 1, sy + 5, 12, 3);
      g.fillStyle = i % 2 ? '#8a8878' : '#9a988a';
      g.fillRect(sx, sy, 11, 6);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(sx, sy, 11, 2);
    }
  },
  // gölet kenarındaki cüce — kırmızı şapka, beyaz sakal
  gnome(g, t) {
    g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(22, 54, 20, 4);
    const bob = Math.sin(t * 2.2) * 0.8;
    g.fillStyle = '#c03828'; // sivri şapka
    g.beginPath(); g.moveTo(26 + bob, 30); g.lineTo(38 + bob, 30); g.lineTo(32 + bob, 12); g.closePath(); g.fill();
    g.fillStyle = '#e8c8a0'; g.fillRect(27 + bob, 30, 10, 8);  // yüz
    g.fillStyle = '#3a2a1a'; g.fillRect(29 + bob, 33, 2, 2); g.fillRect(34 + bob, 33, 2, 2);
    g.fillStyle = '#f0f0f0'; g.fillRect(27 + bob, 37, 10, 10); // sakal
    g.fillStyle = '#2858a8'; g.fillRect(26, 46, 12, 8);        // gövde
    g.fillStyle = '#e8b838'; g.fillRect(26, 48, 12, 2);        // kemer
    g.fillStyle = '#202020'; g.fillRect(26, 54, 5, 4); g.fillRect(33, 54, 5, 4);
  },
  // demir fener direği + sıcak ışık halesi
  lamp(g, t) {
    const glow = 0.10 + Math.sin(t * 2.4) * 0.03;
    g.fillStyle = 'rgb(255,210,62)'; g.globalAlpha = glow;
    g.beginPath(); g.ellipse(32, 22, 22, 16, 0, 0, 7); g.fill();
    g.globalAlpha = glow * 0.6;
    g.beginPath(); g.ellipse(32, 56, 26, 7, 0, 0, 7); g.fill();
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(24, 56, 16, 4);
    g.fillStyle = '#2c2830'; g.fillRect(30, 16, 4, 42); g.fillRect(25, 56, 14, 3);
    g.fillRect(26, 12, 12, 2); g.fillRect(28, 8, 8, 4);        // fener kasası
    g.fillStyle = '#ffd88a'; g.fillRect(29, 13, 6, 4);         // cam
    g.fillStyle = '#ffd23e'; g.fillRect(30, 14, 4, 3);         // alev
  },
  // balkabağı kafalı korkuluk — hafif sallanır
  scarecrow(g, t) {
    g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(22, 56, 20, 4);
    const sw = Math.sin(t * 1.1) * 1.6;
    g.fillStyle = '#5e4020'; g.fillRect(30, 22, 4, 36); g.fillRect(14 + sw, 28, 36, 4);
    g.fillStyle = '#d8b038'; g.fillRect(12 + sw, 28, 4, 8); g.fillRect(48 + sw, 28, 4, 8); // saman uçlar
    g.fillStyle = '#7a5a9a'; g.fillRect(24 + sw * .6, 30, 16, 18);   // gömlek
    g.fillStyle = '#e8b838'; g.fillRect(24 + sw * .6, 38, 16, 3);    // kuşak
    g.fillStyle = '#d8b038'; g.fillRect(26 + sw * .6, 48, 4, 6); g.fillRect(34 + sw * .6, 48, 4, 6);
    g.fillStyle = '#e09028'; // balkabağı kafa
    g.beginPath(); g.arc(32 + sw, 19, 9, 0, 7); g.fill();
    g.fillStyle = '#5e4020'; g.fillRect(30 + sw, 8, 4, 5);            // sap
    g.fillStyle = '#3a2a18'; g.fillRect(28 + sw, 17, 3, 3); g.fillRect(34 + sw, 17, 3, 3); // gözler
    g.fillRect(29 + sw, 22, 7, 2);                                  // ağız
  },
  // kırmızı köpek kulübesi — köpek ara sıra kapıdan bakar
  doghouse(g, t) {
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(10, 52, 46, 6);
    g.fillStyle = '#a03c30'; g.fillRect(14, 28, 38, 26);
    g.fillStyle = '#7a2c22'; g.fillRect(14, 28, 38, 4);
    g.fillStyle = '#5e2820'; // çatı
    g.beginPath(); g.moveTo(8, 30); g.lineTo(33, 12); g.lineTo(58, 30); g.closePath(); g.fill();
    g.fillStyle = '#6e342a';
    g.beginPath(); g.moveTo(12, 28); g.lineTo(33, 13); g.lineTo(54, 28); g.closePath(); g.fill();
    g.fillStyle = '#241c14'; g.fillRect(26, 36, 14, 18); // kapı deliği
    // köpek: çoğu zaman içeride; ara sıra başını çıkarır
    const peek = Math.sin(t * 0.55) > 0.25;
    if (peek) {
      g.fillStyle = '#c09058';
      g.fillRect(27, 30, 12, 12);                                    // kafa
      g.fillRect(26, 27, 4, 6); g.fillRect(36, 27, 4, 6);            // kulaklar
      g.fillStyle = '#3a2a18'; g.fillRect(29, 34, 2, 2); g.fillRect(34, 34, 2, 2); // gözler
      g.fillStyle = '#8a6840'; g.fillRect(30, 38, 5, 3);             // burun
    }
  },
  // kovan — katmanlı ahşap + yörüngede arılar
  beehive(g, t) {
    g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(18, 54, 28, 4);
    g.fillStyle = '#6a4a28'; g.fillRect(24, 54, 16, 4);              // ayaklar
    for (let i = 0; i < 4; i++) {
      g.fillStyle = i % 2 ? '#d8a838' : '#c89830';
      g.fillRect(20 + i * 3, 26 + i * 8, 24 - i * 6, 8);
    }
    g.fillStyle = '#8a6420'; g.fillRect(29, 48, 6, 5);               // giriş
    for (let i = 0; i < 3; i++) { // arılar — kovan çevresinde vızıltı
      const a = t * 1.7 + i * 2.1;
      const bx = 32 + Math.cos(a) * (20 + i * 4), by = 30 + Math.sin(a * 1.3) * 12;
      g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(bx - 1, by - 3, 3, 2); // kanat
      g.fillStyle = '#ffd23e'; g.fillRect(bx - 2, by - 1, 4, 3);
      g.fillStyle = '#3a2a18'; g.fillRect(bx - 1, by - 1, 1, 3);
    }
  },
  // taş çeşme — havza + su sütunu + sıçrayan damlalar
  fountain(g, t) {
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(8, 52, 48, 6);
    g.fillStyle = '#8a8a9a'; g.fillRect(10, 40, 44, 14);             // havza
    g.fillStyle = '#6a6a7a'; g.fillRect(10, 40, 44, 4);              // kenar gölgesi
    g.fillStyle = '#5cb8e8'; g.fillRect(13, 44, 38, 8);              // su
    g.fillStyle = '#9a9aaa'; g.fillRect(28, 26, 8, 16);              // orta sütun
    g.fillStyle = '#8a8a9a'; g.fillRect(24, 22, 16, 6);              // üst tas
    // su akışı: üst tastan havzaya akan çizgiler + sıçrama
    g.fillStyle = 'rgba(140,200,240,.8)';
    for (let i = 0; i < 3; i++) {
      const fx = 27 + i * 5, ph = (t * 2.2 + i * 0.7) % 1;
      g.fillRect(fx, 28 + ph * 14, 2, 3);
    }
    for (let i = 0; i < 4; i++) { // havza yüzeyinde hareketli parlama
      const sx = 15 + ((t * 12 + i * 9) % 32);
      g.fillStyle = 'rgba(220,240,255,.6)'; g.fillRect(sx, 45, 3, 1);
    }
  },
  // yaşlı meşe — kalın gövde + katmanlı taç + sallanan üst katman
  tree(g, t) {
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(16, 56, 32, 5);
    g.fillStyle = '#5e4020'; g.fillRect(28, 34, 9, 24);
    g.fillStyle = '#4a3018'; g.fillRect(28, 34, 3, 24);
    const sw = Math.sin(t * 0.9) * 1.8;
    g.fillStyle = '#3e6a30'; // alt taç
    g.beginPath(); g.ellipse(32, 30, 24, 14, 0, 0, 7); g.fill();
    g.fillStyle = '#4a8038'; // üst taç — hafif salınım
    g.beginPath(); g.ellipse(32 + sw, 20, 19, 11, 0, 0, 7); g.fill();
    g.fillStyle = '#5a9a44';
    g.beginPath(); g.ellipse(26 + sw, 16, 10, 6, 0, 0, 7); g.fill();
    g.fillStyle = '#c03828'; // elmalar
    g.fillRect(22 + sw, 26, 3, 3); g.fillRect(38 + sw, 18, 3, 3); g.fillRect(31, 33, 3, 3);
  },
  // gölet ördeği — gölette sinüsle süzülür (POND'dan pozisyon alır)
  duck(g, t) {
    const PO = L.POND;
    const dx = PO.x + 26 + (Math.sin(t * 0.35) * .5 + .5) * (PO.w - 56);
    const dy = PO.y + 26 + Math.sin(t * 1.8) * 5;
    const bob = Math.sin(t * 3.2) * 1.4;
    // iz — arkada küçük dalga
    g.strokeStyle = 'rgba(190,225,245,.4)'; g.lineWidth = 1;
    g.beginPath(); g.ellipse(dx - 10, dy + 4, 8, 2.5, 0, 0, 7); g.stroke();
    g.fillStyle = '#f0f0e8'; // gövde
    g.beginPath(); g.ellipse(dx, dy + bob, 10, 6, 0, 0, 7); g.fill();
    g.fillStyle = '#e8e4d8'; g.fillRect(dx - 8, dy + bob - 2, 5, 4); // kuyruk
    g.fillStyle = '#f0f0e8'; g.beginPath(); g.arc(dx + 8, dy + bob - 6, 5, 0, 7); g.fill(); // kafa
    g.fillStyle = '#f0a028'; g.fillRect(dx + 11, dy + bob - 6, 6, 3); // gaga
    g.fillStyle = '#3a2a18'; g.fillRect(dx + 8, dy + bob - 7, 2, 2);  // göz
  },
};

// dünyada: sahip olunan her süs kendi pos() noktasına çizilir
export function drawDecor(ctx) {
  if (!S.decor.length) return;
  const t = performance.now() / 1000;
  for (const id of S.decor) {
    const d = DECOR[id], p = PAINT[id];
    if (!d || !p) continue;
    const [x, y] = d.pos();
    ctx.save();
    ctx.translate(x - 32, y - 58);
    p(ctx, t);
    ctx.restore();
  }
}

// mağaza kartı önizlemesi — öğeyi küçük canvas'a ortalayıp çizer
export function drawDecorIcon(g, id, size) {
  const p = PAINT[id];
  if (!p) return;
  g.save();
  g.imageSmoothingEnabled = false;
  g.translate(size / 2 - 32 * (size / 64), size - 58 * (size / 64));
  g.scale(size / 64, size / 64);
  p(g, 0.7); // sabit animasyon fazı — tipik görünüm
  g.restore();
}
