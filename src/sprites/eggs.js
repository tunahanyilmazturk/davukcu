/* Yumurta sprite'ları: her katmanın temiz + kirli (boklu, d=leke) varyantı.
   W=ana renk, w=gölge, d=leke, k=parıltı */
import { makeSprite } from './core.js';

export const EGG = makeSprite([
"..WW..",
".WWWW.",
"WWWWWW",
"WWWWWw",
"WWWWww",
".WWww.",
"..ww..",
], { W:'#f8f2e6', w:'#d0c4b2' });

export const GOLDEN_EGG = makeSprite([
"..WW..",
".WWWW.",
"WWWWWW",
"WWWWWw",
"WWWWww",
".WWww.",
"..ww..",
], { W:'#ffd23e', w:'#d89818' });

// kirli (boklu) yumurtalar
export const EGG_DIRTY = makeSprite([
"..WW..",
".WWWW.",
"WWWdWW",
"WWdWWw",
"WWWWdw",
".Wdww.",
"..ww..",
], { W:'#f8f2e6', w:'#d0c4b2', d:'#8a6038' });

export const GOLDEN_EGG_DIRTY = makeSprite([
"..WW..",
".WWWW.",
"WWWdWW",
"WWdWWw",
"WWWWdw",
".Wdww.",
"..ww..",
], { W:'#ffd23e', w:'#d89818', d:'#8a6038' });

// nadir yumurtalar: bronz x2 / gümüş x4 / elmas x20
export const BRONZE_EGG = makeSprite([
"..WW..",
".WWWW.",
"WWWWWW",
"WWWWWw",
"WWWWww",
".WWww.",
"..ww..",
], { W:'#e8a860', w:'#b07030' });

export const BRONZE_EGG_DIRTY = makeSprite([
"..WW..",
".WWWW.",
"WWWdWW",
"WWdWWw",
"WWWWdw",
".Wdww.",
"..ww..",
], { W:'#e8a860', w:'#b07030', d:'#6a4820' });

export const SILVER_EGG = makeSprite([
"..WW..",
".WwWW.",
"WWWWWW",
"WWWWWw",
"WWWWww",
".WWww.",
"..ww..",
], { W:'#d8e4f0', w:'#98a8c0' });

export const SILVER_EGG_DIRTY = makeSprite([
"..WW..",
".WWWW.",
"WWWdWW",
"WWdWWw",
"WWWWdw",
".Wdww.",
"..ww..",
], { W:'#d8e4f0', w:'#98a8c0', d:'#687890' });

export const DIAMOND_EGG = makeSprite([
"..WW..",
".WkWW.",
"WWWWWW",
"WkWWWw",
"WWWWww",
".WWww.",
"..ww..",
], { W:'#a8ecff', w:'#58b8d8', k:'#ffffff' });

export const DIAMOND_EGG_DIRTY = makeSprite([
"..WW..",
".WWWW.",
"WWWdWW",
"WWdWWw",
"WWWWdw",
".Wdww.",
"..ww..",
], { W:'#a8ecff', w:'#58b8d8', d:'#4888a0' });
