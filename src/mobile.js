// Mobil algılama: dokunmatik cihaz + dar ekran → body.mob sınıfı.
// style.css'teki body.mob kuralları paneli altta bottom-sheet yapar,
// input.js/camera.js dokunma hedeflerini büyütür.
export const COARSE = matchMedia('(pointer: coarse)').matches;

export function isMobile() {
  return innerWidth < 780 || (COARSE && innerWidth < 1200);
}

export function applyMobClass() {
  document.body.classList.toggle('mob', isMobile());
}
