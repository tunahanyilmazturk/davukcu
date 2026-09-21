/* Küçük efekt sprite'ları: para, kalp, tüy */
import { makeSprite } from './core.js';

export const COIN = makeSprite([
"..gggg..",
".gYYYYg.",
"gYYWWYYg",
"gYWWWWYg",
"gYYWWYYg",
"gYYYYYYg",
".gYYYYg.",
"..gggg..",
], { g:'#c08018', Y:'#ffd23e', W:'#fff8e0' });

export const HEART = makeSprite([
".rr.rr.",
"rrrrrrr",
"rrrrrrr",
".rrrrr.",
"..rrr..",
"...r...",
], { r:'#e05878' });

export const FEATHER = makeSprite([
"..W.",
".WW.",
"WWW.",
"WWW.",
"WwW.",
".w..",
], { W:'#f5efe4', w:'#d6ccba' });

/* Gübre çuvalı: bağlı ağızlı kahverengi balya — kova yanında istiflenir,
   kamyon kasasında da görünür. T=bağcık, D=kenar, B=gövde, H=parlama */
export const MANURE_BAG = makeSprite([
"....TT....",
"...TTTT...",
"..BBBBBB..",
".DBBBBBBD.",
"DBHBBBBHBD",
"DBBBBBBBBD",
"DBBBBBBBBD",
"DBBBBBBBBD",
"DBBBBBBBBD",
".DBBBBBBD.",
"..DDDDDD..",
], { T:'#5e4526', D:'#4a3420', B:'#8a6a3e', H:'#b08a50' });

/* Kürek imleci: gübre yığını üstünde imlecin yerini alır.
   W=sap (ahşap), s=baş kenar, S=baş (metal) */
export const SHOVEL = makeSprite([
"................",
"...........WW...",
"..........WWW...",
"..........WW....",
".........WW.....",
"........WW......",
".......WW.......",
"......WW........",
"..ss..WW........",
".sSSsW..........",
"sSSSSs..........",
"sSSSSSs.........",
"sSSSSSs.........",
".sSSSs..........",
"..sss...........",
"................",
], { W:'#a07850', s:'#6a7280', S:'#aab4c2' });
