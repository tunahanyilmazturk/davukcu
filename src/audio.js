// WebAudio ile minik ses efektleri + ambient müzik döngüsü
import { S } from './state.js';

let AC = null;
function ctx() {
  AC = AC || new (window.AudioContext || window.webkitAudioContext)();
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
function beep(f0, f1, dur, type, vol) {
  if (S.muted) return;
  try {
    const ac = ctx();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, f1), ac.currentTime + dur);
    g.gain.setValueAtTime(vol * S.volume, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + dur);
  } catch (e) {}
}

export const sndCoin  = () => { beep(660, 990, .12, 'square', .12); setTimeout(() => beep(880, 1320, .12, 'square', .1), 60); };
export const sndCluck = () => beep(420 + Math.random() * 80, 160, .12, 'triangle', .18);
export const sndPet   = () => beep(700, 1050, .08, 'triangle', .12);
export const sndBuy   = () => { beep(440, 440, .07, 'square', .12); setTimeout(() => beep(660, 660, .07, 'square', .12), 80); setTimeout(() => beep(880, 880, .1, 'square', .12), 160); };
export const sndErr   = () => beep(160, 110, .18, 'square', .15);
export const sndPop   = () => beep(900, 500, .05, 'sine', .1);
// mıknatıs yumurtayı kaptığında yumuşak blip
export const sndZap   = () => beep(300 + Math.random() * 120, 780, .07, 'sine', .07);
// cila tamamlanınca parıltı sesi
export const sndPolish = () => { beep(1200, 1800, .09, 'sine', .08); setTimeout(() => beep(1600, 2200, .1, 'sine', .06), 70); };
// sınıflandırıcı katman yükseltince ince çift bip
export const sndGrade = () => { beep(880, 1180, .06, 'sine', .08); setTimeout(() => beep(1180, 1560, .08, 'sine', .06), 55); };
// yıkama bitince yumuşak su sesi
export const sndWash = () => { beep(360, 140, .12, 'sine', .07); setTimeout(() => beep(500, 240, .08, 'sine', .05), 50); };
// kamyon kornası: kalın çift ton (iskele yanaşınca)
export const sndTruck = () => { beep(185, 165, .2, 'sawtooth', .09); setTimeout(() => beep(185, 165, .16, 'sawtooth', .08), 240); };
// başarım jingle'ı: kısa yükselen dörtlü
export const sndAchv = () => {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, f, .14, 'triangle', .12), i * 90));
};

/* ---- ambient müzik: yumuşak bas + arpej döngüsü ----
   İlk kullanıcı etkileşiminde startMusic() çağrılır (tarayıcı izni). */
let musicOn = false, musicTimer = null;
const MEL = [0, 4, 7, 4, 9, 7, 4, 2];          // pentatonik arpej (yarım ses, La üstünden)
const ROOT = 220;                             // A3
export function startMusic() {
  if (musicOn) return;
  musicOn = true;
  let step = 0;
  const tick = () => {
    if (!S.music) return;
    try {
      const ac = ctx();
      // bas: her 4 adımda bir
      if (step % 4 === 0) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = step % 8 === 0 ? ROOT / 2 : ROOT / 2 * 1.5;
        g.gain.setValueAtTime(.05 * S.volume, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .9);
        o.connect(g).connect(ac.destination);
        o.start(); o.stop(ac.currentTime + .9);
      }
      // arpej: her adımda bir nota
      const sem = MEL[step % MEL.length];
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.value = ROOT * Math.pow(2, sem / 12);
      g.gain.setValueAtTime(.035 * S.volume, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .32);
      o.connect(g).connect(ac.destination);
      o.start(); o.stop(ac.currentTime + .32);
      step++;
    } catch (e) {}
  };
  musicTimer = setInterval(tick, 360);
}
export function musicTickMute() {} // sessizlik anahtarı S.muted üzerinden okunuyor
