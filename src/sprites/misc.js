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
