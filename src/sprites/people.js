/* Karakter sprite'ları: işçi + bakıcı (12×16, iki yürüyüş karesi).
   H=samân şapka, f=yüz, k=göz/koyu, B=gövde (role göre renk), P=pantolon, K=bot */
import { makeSprite } from './core.js';

const ROWS_A = [
"....HHHH....",
"..HHHHHHHH..",
".HHHHHHHHHH.",
"....ffff....",
"...ffffff...",
"...fkffkf...",
"...ffffff...",
"....ffff....",
"..BBBBBBBB..",
".BBBBBBBBBB.",
".BBBBBBBBBB.",
"..PPPPPPPP..",
"..PPP..PPP..",
"..PPP..PPP..",
"..KKK..KKK..",
"............",
];
const ROWS_B = [
"....HHHH....",
"..HHHHHHHH..",
".HHHHHHHHHH.",
"....ffff....",
"...ffffff...",
"...fkffkf...",
"...ffffff...",
"....ffff....",
"..BBBBBBBB..",
".BBBBBBBBBB.",
".BBBBBBBBBB.",
"..PPPPPPPP..",
"...PPPPPP...",
"...PP..PP...",
"...KK..KK...",
"............",
];
const PAL = {
  worker: { H:'#d8a840', f:'#e8b088', k:'#241c1c', B:'#4878a8', P:'#5a4a38', K:'#2a2028' },
  keeper: { H:'#b04848', f:'#e8b088', k:'#241c1c', B:'#58a860', P:'#3a4a5a', K:'#2a2028' },
};

export const PEOPLE = {
  worker: { a: makeSprite(ROWS_A, PAL.worker), b: makeSprite(ROWS_B, PAL.worker) },
  keeper: { a: makeSprite(ROWS_A, PAL.keeper), b: makeSprite(ROWS_B, PAL.keeper) },
};
