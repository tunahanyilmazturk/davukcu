// OTLAK bölgesi (L.FARM): çim zemin, yamalar, çiçekler, çitler.
// Fabrika hattıyla karışmaması için bu dosya sadece BEAM_Y üstünü çizer;
// kiriş ve altı src/world/factory.js'te.
import { L, mulberry32 } from '../config.js';

export function drawFarm(g) {
  const rnd = mulberry32(1234);
  const wf = L.W / 660; // genişliğe göre dekor yoğunluğu

  // çimen (kirişin 4px altına taşar — birleşimde çatlak olmaz)
  const F = L.FARM;
  g.fillStyle = '#5aa348'; g.fillRect(0, 0, L.W, L.BEAM_Y + 4);
  for (let i = 0; i < 2600 * wf; i++) {
    const x = rnd() * L.W, y = F.y + rnd() * F.h;
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

  // ---- sınır: kiriş üstünde aşınmış toprak şeridi + alçak kümes çiti ----
  // otlak ile fabrika hattını görsel olarak ayırır
  g.fillStyle = '#8a9a44'; g.fillRect(0, L.BEAM_Y - 14, L.W, 14);
  for (let i = 0; i < 70 * wf; i++) {
    const x = rnd() * L.W, y = L.BEAM_Y - 14 + rnd() * 13;
    g.fillStyle = rnd() < .5 ? '#7a6a3c' : '#98a850';
    g.fillRect(x | 0, y | 0, 3, 2);
  }
  // alçak çit: kiriş hizasında direkler + iki yatay kutu
  g.fillStyle = '#8a5a30';
  for (let x = 6; x < L.W; x += 36) {
    g.fillRect(x, L.BEAM_Y - 18, 6, 18);
    g.fillStyle = '#a06a38'; g.fillRect(x + 1, L.BEAM_Y - 18, 2, 18);
    g.fillStyle = '#8a5a30';
  }
  g.fillStyle = '#b87a44'; g.fillRect(0, L.BEAM_Y - 14, L.W, 4);
  g.fillRect(0, L.BEAM_Y - 6, L.W, 4);
  g.fillStyle = '#8a5a30'; g.fillRect(0, L.BEAM_Y - 11, L.W, 1); g.fillRect(0, L.BEAM_Y - 3, L.W, 1);
}
