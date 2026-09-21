/* Tavuk sprite'ları: 20x19, dik duruş — baş ve boyun gövdenin üstünde.
   Kareler (animasyon koreografisi entities/chickens.js'te):
     a  = duruş          b/b2 = yürüme fazları (bacaklar karşılıklı açık)
     d  = ön-eğilme      c    = gaga vuruşu (baş yerde)
     e  = çökme (yumurtlama)  f = kanat çırpma (zıplama/sürüklenme)
   W=gövde, w=gölge, t=kuyruk, n=kanat gölgesi, r=ibik,
   R=ibik parlaması/gerdan, o=gaga, E=göz, l=bacak.
   Tüm karelerde en alt dolu satır = zemin çizgisi (ortak taban). */
import { makeSprite } from './core.js';

const CHICKEN_A = [
"..........r.r.......",
".........rRrRr......",
".........WWWWW......",
"........WWWWWWW.....",
"........WWWEWwoo....",
".........WWWWoR.....",
".........WWWWW......",
"..ttt....WWWWWW.....",
".ttttt..WWWWWWWW....",
".ttttttWWWWWWWWWw...",
".ttttWWWWnnWWWWWw...",
"..ttWWWWnnnnWWWWw...",
"...WWWWWWWWWWww.....",
"....WWWWWWWWw.......",
"......WWWW..........",
"......l....l........",
"......l....l........",
".....ll....ll.......",
"....................",
];

const CHICKEN_B = [ // yürüme 1: bacaklar açık — ön ayak ileride
"..........r.r.......",
".........rRrRr......",
".........WWWWW......",
"........WWWWWWW.....",
"........WWWEWwoo....",
".........WWWWoR.....",
".........WWWWW......",
"..ttt....WWWWWW.....",
".ttttt..WWWWWWWW....",
".ttttttWWWWWWWWWw...",
".ttttWWWWnnWWWWWw...",
"..ttWWWWnnnnWWWWw...",
"...WWWWWWWWWWww.....",
"....WWWWWWWWw.......",
".....WWWW...........",
".....l......l.......",
"....l........l......",
"....l.........l.....",
"...ll.........ll....",
];

const CHICKEN_B2 = [ // yürüme 2: geçiş — bacaklar toplanır
"..........r.r.......",
".........rRrRr......",
".........WWWWW......",
"........WWWWWWW.....",
"........WWWEWwoo....",
".........WWWWoR.....",
".........WWWWW......",
"..ttt....WWWWWW.....",
".ttttt..WWWWWWWW....",
".ttttttWWWWWWWWWw...",
".ttttWWWWnnWWWWWw...",
"..ttWWWWnnnnWWWWw...",
"...WWWWWWWWWWww.....",
"....WWWWWWWWw.......",
"......WWWW..........",
".......l..l.........",
".......l..l.........",
".......ll.ll........",
"....................",
];

const CHICKEN_D = [ // ön-eğilme: baş ileri-yarı aşağı (gaga öncesi hazırlık)
"....................",
"....................",
"..ttt...............",
".ttttt..............",
".ttttttWWWWWWWWW....",
".ttttWWWWWWWWWWWrR..",
"..ttWWWWnnWWWWWWWW..",
"...WWWWnnnnWWWWWEWw.",
"....WWWWWWWWWWWWoo..",
".....WWWWWWWWwWR....",
"......WWWWWW........",
".......WWWW.........",
"....................",
"....................",
"....................",
"......l....l........",
"......l....l........",
"......l....l........",
".....ll....ll.......",
];

const CHICKEN_C = [ // gaga vuruşu: baş yere iner, boyun sağa uzanır
"....................",
"....................",
"..ttttt.............",
".ttttttt............",
".tttWWWWWWWW........",
"..WWWWWWWWWWWW......",
".WWWWnnWWWWWWWW.....",
".WWWWnnnnWWWWWWw....",
"..WWWWWWWWWWWWww....",
"...WWWWWWWWWWW......",
"....WWWWWWWWW.......",
"........WWWW........",
"....l...rWWWr.......",
"....l..rRWWWW.......",
"...ll..WWWEWWW......",
"...l...WWWWWWo......",
"...l....WWWWoo......",
".........WWR........",
"..........w.........",
];

const CHICKEN_E = [ // çökme: yumurtlama — gövde yere basar, bacaklar gizli
"....................",
"....................",
"..........r.r.......",
".........rRrRr......",
".........WWWWW......",
"........WWWWWWW.....",
"........WWWEWwoo....",
".........WWWWoR.....",
"..ttt....WWWWW......",
".ttttt..WWWWWWW.....",
".ttttttWWWWWWWWWW...",
".ttttWWWWnnWWWWWWw..",
"..ttWWWWnnnnWWWWww..",
"...WWWWWWWWWWWWWww..",
"....WWWWWWWWWWWWw...",
".....WWWWWWWWWWw....",
"......WWWWWWWW......",
".......WWWWWW.......",
"....................",
];

const CHICKEN_F = [ // kanat çırpma: kanatlar açık, bacaklar sarkık
"....................",
"..........r.r.......",
".........rRrRr......",
".........WWWWW......",
"........WWWWWWW.....",
"........WWWEWwoo....",
".........WWWWoR.....",
".nn......WWWWW......",
".nnnn....WWWWWW.....",
"..nnnn..WWWWWWWW....",
"...nnnnWWWWWWWWWWw..",
"....nnWWWWWWWWWWw...",
".....WWWWWWWWWWw....",
"......WWWWWWw.......",
".......WWWW.........",
"......l..l..........",
".....l....l.........",
"....................",
"....................",
];

export const CHICKEN_VARIANTS = {
  white: { W:'#f5efe4', w:'#d6ccba', t:'#e8dfce', n:'#e0d4c0', r:'#e04840', R:'#ff7868', o:'#f0a028', E:'#181818', l:'#e89830' },
  brown: { W:'#b87a48', w:'#96603a', t:'#cc9058', n:'#a86840', r:'#e04840', R:'#ff7868', o:'#f0b040', E:'#181818', l:'#e89830' },
  black: { W:'#5c5c6c', w:'#42424e', t:'#74747f', n:'#50505e', r:'#e04840', R:'#ff7868', o:'#f0a028', E:'#f0e8d8', l:'#e89830' },
  gold:  { W:'#ffd860', w:'#d8a838', t:'#ffe888', n:'#e8b840', r:'#e04840', R:'#ff7868', o:'#f08018', E:'#181818', l:'#e89830' },
  // horoz: kızıl-kahve gövde, koyu yeşil kuyruk, iri ibik
  rooster: { W:'#d86038', w:'#a84828', t:'#2c4a38', n:'#b04828', r:'#e02828', R:'#ff6858', o:'#f0b028', E:'#181818', l:'#e89830' },
};

const FRAMES = { a: CHICKEN_A, b: CHICKEN_B, b2: CHICKEN_B2,
                 d: CHICKEN_D, c: CHICKEN_C, e: CHICKEN_E, f: CHICKEN_F };

export const CHICKEN_SPRITES = {};
for (const v in CHICKEN_VARIANTS) {
  CHICKEN_SPRITES[v] = {};
  for (const f in FRAMES) CHICKEN_SPRITES[v][f] = makeSprite(FRAMES[f], CHICKEN_VARIANTS[v]);
}

/* Civciv: 8x8 — a/b yürüme + c gaga vurma */
const CHICK_A = [
"...WWW..",
"..WWWWW.",
".WWWEWoo",
".WWWWWWw",
"..WWWww.",
"...l.l..",
"........",
"........",
];
const CHICK_B = [
"...WWW..",
"..WWWWW.",
".WWWEWoo",
".WWWWWWw",
"..WWWww.",
"..l...l.",
"........",
"........",
];
const CHICK_C = [ // gaga yere iner
"........",
"...WWW..",
"..WWWWW.",
".WWWWW..",
"..WWWoo.",
"....w...",
"...l.l..",
"........",
];
const CHICK_PAL = { W:'#ffe888', w:'#f0c860', E:'#181818', o:'#f08018', l:'#e89830' };
export const CHICK_SPRITE = {
  a: makeSprite(CHICK_A, CHICK_PAL),
  b: makeSprite(CHICK_B, CHICK_PAL),
  c: makeSprite(CHICK_C, CHICK_PAL),
};
