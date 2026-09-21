/* Yumurta sprite'ları (8×9): tüm katmanlar aynı gövde şablonunu paylaşır —
   tutarlılık garanti. Işık dili: h=sol-üst parlak nokta, W=ana renk,
   w=sağ-alt gölge. Kirli varyant zemini matlaştırır ve d benekleri ekler;
   kaba pislik (e.dirt) runtime'da ayrıca çizilir. k=elmas facet parıltısı. */
import { makeSprite } from './core.js';

const CLEAN = [
"..WWW...",
".WhWWW..",
".WhWWWW.",
"WhWWWWWW",
"WWWWWWWW",
"WWWWWWWw",
"WWWWWWww",
".WWWWww.",
"..Wwww..",
];

const DIRTY = [
"..WWW...",
".WhWWW..",
".WhWWdW.",
"WhWWWWWW",
"WdWWWWWW",
"WWWWWWWw",
"WWdWWWww",
".WWWWww.",
"..Wwww..",
];

const TINT = { // kirli zemin tonu — aynı rengin mat hali
  normal:  { W: '#ece2d2', w: '#c0b4a2' },
  gold:    { W: '#f0c238', w: '#c08a18' },
  bronze:  { W: '#dc9a52', w: '#a06528' },
  silver:  { W: '#ccd8e4', w: '#8898b0' },
  diamond: { W: '#a0ddf2', w: '#50a8c8' },
};

function egg(rows, pal) { return makeSprite(rows, pal); }

// normal
export const EGG = egg(CLEAN, { W: '#f8f2e6', w: '#d0c4b2', h: '#fffef8' });
export const EGG_DIRTY = egg(DIRTY, { ...TINT.normal, h: '#f6f0e2', d: '#8a6038' });
// altın
export const GOLDEN_EGG = egg(CLEAN, { W: '#ffd23e', w: '#d89818', h: '#fff0a8' });
export const GOLDEN_EGG_DIRTY = egg(DIRTY, { ...TINT.gold, h: '#ffe878', d: '#7a5220' });
// nadir: bronz x2 / gümüş x4 / elmas x20
export const BRONZE_EGG = egg(CLEAN, { W: '#e8a860', w: '#b07030', h: '#ffd8a8' });
export const BRONZE_EGG_DIRTY = egg(DIRTY, { ...TINT.bronze, h: '#f4c088', d: '#6a4820' });
export const SILVER_EGG = egg(CLEAN, { W: '#d8e4f0', w: '#98a8c0', h: '#f4faff' });
export const SILVER_EGG_DIRTY = egg(DIRTY, { ...TINT.silver, h: '#e8f0fa', d: '#687890' });
export const DIAMOND_EGG = egg([
"..WWW...",
".WhWWW..",
".WhWWkW.",
"WhWWWWWW",
"WWkWWWWW",
"WWWWWWWw",
"WWWWWWww",
".WWWWww.",
"..Wwww..",
], { W: '#a8ecff', w: '#58b8d8', h: '#e8fbff', k: '#ffffff' });
export const DIAMOND_EGG_DIRTY = egg(DIRTY, { ...TINT.diamond, h: '#d8f4ff', d: '#4888a0' });
