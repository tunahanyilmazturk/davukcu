// Sayfa kamerası: dünya 2 ekran genişliğinde — çiftlik [0,W) + fabrika [W,2W).
// cam.x yumuşak geçişle hedefe kayar; kenar-sürükleme input.js'te, bu modül
// sadece sayfa durumunu ve yaylanmayı yönetir.
import { L } from './config.js';

export const cam = { x: 0, page: 0, target: 0 };

// gezinme oklarının ekran-uzayı bölgeleri (render + input paylaşır).
// Dikey konum ~%62: panel kapatma kulakçığı (top:%46, 64px) ile çakışmasın,
// çiftlikte toprak yolun ve sağ silonun, fabrikada boru kanalının altında kalır.
export function navZones() {
  const y = Math.round(L.H * 0.62) - 28;
  const z = [];
  if (cam.x < L.W - 1) z.push({ x: L.W - 30, y, w: 26, h: 56, page: 1, dir: 1 });
  if (cam.x > 1)       z.push({ x: 4,        y, w: 26, h: 56, page: 0, dir: -1 });
  return z;
}

export function goToPage(i) {
  cam.page = Math.max(0, Math.min(1, i));
  cam.target = cam.page * L.W;
}

// sürükleme bittiğinde konuma + yöne göre en yakın sayfaya kenetlen
export function snapCam(dx) {
  const W = L.W;
  if (dx < -W * 0.10) cam.page = 1;
  else if (dx > W * 0.10) cam.page = 0;
  else cam.page = cam.x > W * 0.5 ? 1 : 0;
  cam.target = cam.page * W;
}

export function updateCam(dt) {
  const d = cam.target - cam.x;
  if (!d) return;
  cam.x += d * Math.min(1, dt * 9); // yumuşak kayma
  if (Math.abs(d) < 0.6) cam.x = cam.target;
}

// resize'da sayfa genişliği değişir — kamera aynı sayfada hizalanır
export function syncCam() {
  cam.target = cam.x = cam.page * L.W;
}
