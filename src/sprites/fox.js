/* Tilki sprite'ı: 20x12, sola bakan çömelmiş profil — kümese sızar.
   w1/w2 = sinsi yürüyüş fazları (bacaklar karşılıklı), run = kaçış.
   o=gövde, e=kulak, n=burun, E=göz, t=kuyruk, w=kuyruk ucu, l=bacak. */
import { makeSprite } from './core.js';

const FOX_W1 = [
"....................",
"..e....e............",
"..ee..ee............",
"..ooooooo...........",
".noooooEo...........",
".oooooooooo.........",
"..oooooooooooo.ttw..",
"..oooooooooo.ttw....",
"...oo......oo.......",
"..ll........ll......",
".ll..........ll.....",
"....................",
];

const FOX_W2 = [
"....................",
"..e....e............",
"..ee..ee............",
"..ooooooo...........",
".noooooEo...........",
".oooooooooo.........",
"..oooooooooooo.ttw..",
"..oooooooooo.ttw....",
"...oo......oo.......",
"...ll........ll.....",
"....ll.......ll.....",
"....................",
];

const FOX_RUN = [
"....................",
"..e....e............",
"..ee..ee............",
"..ooooooo...........",
".noooooEo...........",
".oooooooooo.........",
"..oooooooooooo.ttw..",
"..oooooooooooo.ttw..",
"..o.........o.......",
".l...........l......",
"l.............l.....",
"....................",
];

const PAL = {
  o: '#d87038', // turuncu gövde
  e: '#402818', // kulak içi
  n: '#241410', // burun
  E: '#101018', // göz
  t: '#a85028', // koyu kuyruk
  w: '#f0e8d8', // kuyruk ucu
  l: '#6a3418', // bacak
};

export const FOX_SPR = {
  w1: makeSprite(FOX_W1, PAL),
  w2: makeSprite(FOX_W2, PAL),
  run: makeSprite(FOX_RUN, PAL),
};
