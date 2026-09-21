// Statik arka plan: offscreen canvas'a çizilir, resize'da yeniden kurulur.
// İki bölge ayrı modüllerden gelir — otlak (üst) ve fabrika hattı (alt):
//   world/farm.js    → L.FARM  (çim, çiçek, çit, sınır çiti)
//   world/factory.js → L.LINE  (kiriş, duvar, huni, hat taşıyıcıları, zemin)
import { L } from './config.js';
import { drawFarm } from './world/farm.js';
import { drawFactory } from './world/factory.js';

export const bg = document.createElement('canvas');

export function buildBG() {
  bg.width = L.W; bg.height = L.H;
  const g = bg.getContext('2d');
  drawFarm(g);     // üst yarı: otlak/kümes zemini
  drawFactory(g);  // alt yarı: fabrika hattı
}
