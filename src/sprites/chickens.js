/* Tavuk sprite'ları: 16x16, dik duruş — baş ve boyun gövdenin üstünde.
   Üç kare: a=duruş, b=yürüme (bacaklar açık), c=gaga vurma (baş yerde).
   W=gövde, w=gölge, t=kuyruk, n=kanat gölgesi, r=ibik,
   R=ibik parlaması/gerdan, o=gaga, E=göz, l=bacak */
import { makeSprite } from './core.js';

const CHICKEN_ROWS_A = [
".........r.r....",
"........rRrRr...",
"........WWWW....",
".......WWWWWW...",
".......WWWEWwoo.",
"........WWWWoR..",
"........WWWW....",
"..ttt..WWWWWW...",
".tttt.WWWWWWWW..",
".ttttWWWWWWWWWw.",
".tttWWWWnnWWWWww",
"..tWWWWnnnnWWww.",
"..WWWWWWWWWww...",
"...WWWWWWww.....",
".....l....l.....",
"....ll....ll....",
];

const CHICKEN_ROWS_B = [
".........r.r....",
"........rRrRr...",
"........WWWW....",
".......WWWWWW...",
".......WWWEWwoo.",
"........WWWWoR..",
"........WWWW....",
"..ttt..WWWWWW...",
".tttt.WWWWWWWW..",
".ttttWWWWWWWWWw.",
".tttWWWWnnWWWWww",
"..tWWWWnnnnWWww.",
"..WWWWWWWWWww...",
"...WWWWWWww.....",
"....l......l....",
"...l........l...",
];

const CHICKEN_ROWS_C = [
"................",
"................",
"..tttt..........",
".tttttt.........",
".tttWWWWWWW.....",
"..WWWWWWWWWW....",
".WWWWnnWWWWW....",
".WWWWnnnnWWWWw..",
"..WWWWWWWWWWww..",
"...WWWWWWWWw....",
"....WWWWWWWWrrr.",
"....l....lWWWW..",
"...ll....lWWWEW.",
"...........WWWoo",
"............Rw..",
"................",
];

export const CHICKEN_VARIANTS = {
  white: { W:'#f5efe4', w:'#d6ccba', t:'#e8dfce', n:'#e0d4c0', r:'#e04840', R:'#ff7868', o:'#f0a028', E:'#181818', l:'#e89830' },
  brown: { W:'#b87a48', w:'#96603a', t:'#cc9058', n:'#a86840', r:'#e04840', R:'#ff7868', o:'#f0b040', E:'#181818', l:'#e89830' },
  black: { W:'#5c5c6c', w:'#42424e', t:'#74747f', n:'#50505e', r:'#e04840', R:'#ff7868', o:'#f0a028', E:'#f0e8d8', l:'#e89830' },
  gold:  { W:'#ffd860', w:'#d8a838', t:'#ffe888', n:'#e8b840', r:'#e04840', R:'#ff7868', o:'#f08018', E:'#181818', l:'#e89830' },
  // horoz: kızıl-kahve gövde, koyu yeşil kuyruk, iri ibik
  rooster: { W:'#d86038', w:'#a84828', t:'#2c4a38', n:'#b04828', r:'#e02828', R:'#ff6858', o:'#f0b028', E:'#181818', l:'#e89830' },
};

export const CHICKEN_SPRITES = {};
for (const v in CHICKEN_VARIANTS) {
  CHICKEN_SPRITES[v] = {
    a: makeSprite(CHICKEN_ROWS_A, CHICKEN_VARIANTS[v]),
    b: makeSprite(CHICKEN_ROWS_B, CHICKEN_VARIANTS[v]),
    c: makeSprite(CHICKEN_ROWS_C, CHICKEN_VARIANTS[v]),
  };
}

/* Civciv: 8x8, A/B yürüme kareleri */
const CHICK_ROWS_A = [
"...WWW..",
"..WWWWW.",
".WWWEWoo",
".WWWWWWw",
"..WWWww.",
"...l.l..",
"........",
"........",
];
const CHICK_ROWS_B = [
"...WWW..",
"..WWWWW.",
".WWWEWoo",
".WWWWWWw",
"..WWWww.",
"..l...l.",
"........",
"........",
];
const CHICK_PAL = { W:'#ffe888', w:'#f0c860', E:'#181818', o:'#f08018', l:'#e89830' };
export const CHICK_SPRITE = {
  a: makeSprite(CHICK_ROWS_A, CHICK_PAL),
  b: makeSprite(CHICK_ROWS_B, CHICK_PAL),
};
