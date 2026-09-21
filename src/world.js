// Statik arka planlar: her sayfa kendi offscreen canvas'ına çizilir,
// resize'da yeniden kurulur. Kamera iki sayfa arasında kayar (camera.js).
//   world/farm.js    → sayfa 0 ÇİFTLİK (çim, çiçek, çit, yumurta boru ağzı)
//   world/factory.js → sayfa 1 FABRİKA (tavan, duvar, kanal borusu, hat, zemin)
import { L, H } from './config.js';
import { drawFarm } from './world/farm.js';
import { drawFactory } from './world/factory.js';

export const bgFarm = document.createElement('canvas');
export const bgFac = document.createElement('canvas');

export function buildBG() {
  bgFarm.width = bgFac.width = L.W;
  bgFarm.height = bgFac.height = H;
  drawFarm(bgFarm.getContext('2d'));
  drawFactory(bgFac.getContext('2d'));
}
