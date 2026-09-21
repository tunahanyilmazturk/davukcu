/* Mağaza kartı ikonları (16x16) */
import { makeSprite } from './core.js';

export const ICON_EGG = makeSprite([
"................",
".....WWWW.......",
"....WWWWWW......",
"...WWWWWWWW.....",
"...WWWWWWWW.....",
"..WWWWWWWWWW....",
"..WWWWWWWWWW....",
"..WWWWWWWWww....",
"..WWWWWWwwww....",
"...WWWWwwww.....",
"....WWwwww......",
".....wwww.......",
"................",
"................",
"................",
"................",
], { W:'#f8f2e6', w:'#d0c4b2' });

export const ICON_GOLDEGG = makeSprite([
"................",
".....WWWW.......",
"....WWWWWW......",
"...WWWWWWWW.....",
"...WWWWWWWW.....",
"..WWWWWWWWWW....",
"..WWWWWWWWWW....",
"..WWWWWWWWww....",
"..WWWWWWwwww....",
"...WWWWwwww.....",
"....WWwwww......",
".....wwww.......",
"................",
"................",
"................",
"................",
], { W:'#ffd23e', w:'#d89818' });

// yemlik: ahşap tekne + yem taneleri
export const ICON_FEED = makeSprite([
"................",
"................",
"....YYYYY.......",
"..YYYYYYYYY.....",
".YYYYYYYYYYY....",
"WWWWWWWWWWWWW...",
"WDDDDDDDDDDDW...",
"WDDDDDDDDDDDW...",
".WWWWWWWWWWW....",
"...W.......W....",
"...W.......W....",
"................",
"................",
"................",
"................",
"................",
], { W:'#7a5838', D:'#3a2818', Y:'#e8c040' });

// suluk: su damlası
export const ICON_WATER = makeSprite([
"................",
"......bb........",
".....bWWb.......",
".....bWWb.......",
"....bWWWWb......",
"...bWWWWWwb.....",
"..bWWWWWWwb.....",
"..bWWWWWWwwb....",
"..bWWWWWwwwb....",
"..bWWWWwwwwb....",
"...bbwwwwwbb....",
".....bbbbb......",
"................",
"................",
"................",
"................",
], { b:'#1a4a70', W:'#4aa8e8', w:'#2a6ea8' });

// otomatik yemlik / suluk: kaynak + dişli işareti
export const ICON_AUTOF = makeSprite([
".............GG.",
"....YYYYY...GgGG",
"..YYYYYYYYY..GG.",
".YYYYYYYYYYY....",
"WWWWWWWWWWWWW...",
"WDDDDDDDDDDDW...",
"WDDDDDDDDDDDW...",
".WWWWWWWWWWW....",
"...W.......W....",
"...W.......W....",
"................",
"................",
"................",
"................",
"................",
"................",
], { W:'#7a5838', D:'#3a2818', Y:'#e8c040', G:'#9a9aa8', g:'#3a3a44' });

export const ICON_AUTOW = makeSprite([
".............GG.",
"......bb....GgGG",
".....bWWb....GG.",
".....bWWb.......",
"....bWWWWb......",
"...bWWWWWwb.....",
"..bWWWWWWwb.....",
"..bWWWWWWwwb....",
"..bWWWWWwwwb....",
"..bWWWWwwwwb....",
"...bbwwwwwbb....",
".....bbbbb......",
"................",
"................",
"................",
"................",
], { b:'#1a4a70', W:'#4aa8e8', w:'#2a6ea8', G:'#9a9aa8', g:'#3a3a44' });

// elmas yumurta + parıltı (nadir yumurtalar)
export const ICON_RARE = makeSprite([
"................",
".....WWWW.......",
"....WWWWWW......",
"...WWkWWWWW.....",
"...WWWWWWWW..k..",
"..WWWWWWWWWW....",
"..WWWWWWWWWW....",
"..WWWWWWWWww....",
"..WWWWWWwwww....",
"...WWWWwwww.....",
"....WWwwww......",
".....wwww...k...",
"................",
"................",
"................",
"................",
], { W:'#a8ecff', w:'#58b8d8', k:'#ffffff' });

// yumurta + hız çizgileri (hızlı yumurtlama)
export const ICON_FASTLAY = makeSprite([
"................",
"...........WW...",
"..........WWWW..",
"..w......WWWWW..",
".wwww...WWWWWW..",
"..w.....WWWWWW..",
".....w.WWWWWw...",
"......WWWWww....",
"......WWwww.....",
".......ww.......",
"................",
"................",
"................",
"................",
"................",
"................",
], { W:'#f8f2e6', w:'#9fd8ff' });

// konveyör: şerit + oklar
export const ICON_BELT = makeSprite([
"................",
"................",
"................",
"................",
".g..g..g..g..g..",
"ggggggggggggggg.",
"DDDDDDDDDDDDDDD.",
".YY.YY.YY.YY.Y..",
"DDDDDDDDDDDDDDD.",
"ggggggggggggggg.",
"..g..g..g..g..g.",
"................",
"................",
"................",
"................",
"................",
], { g:'#8a8a96', D:'#3a3a44', Y:'#ffd23e' });

// yıkama: yumurta + su damlaları
export const ICON_WASH = makeSprite([
"................",
"....b.b.........",
".....b.b.b......",
"....b...b.......",
".....WWWW.......",
"....WWWWWW......",
"...WWWWWWWW.....",
"..WWWWWWWWWW....",
"..WWWWWWWWWW....",
"..WWWWWWWWww....",
"..WWWWWWwwww....",
"...WWWWwwww.....",
"....WWwwww......",
".....wwww.......",
"................",
"................",
], { W:'#f8f2e6', w:'#d0c4b2', b:'#6ab8f0' });

// yıkama hızı: su damlası + hız çizgileri
export const ICON_WASHSPD = makeSprite([
"................",
"..YY............",
"......bb........",
"..YY..bbb.......",
"......bbbbb.....",
".....bbbbbbb....",
"..YY.bbbbbbb....",
"....bbbbbbbbb...",
"....bbbbbbbbb...",
"....bbbbbbbbb...",
".....bbbbbbb....",
"......bbbbb.....",
".......bbb......",
"................",
"................",
"................",
], { b:'#6ab8f0', Y:'#ffd23e' });

// cila: parlak yumurta + fırça
export const ICON_POLISH = makeSprite([
"................",
"...k.....WWW....",
"....k...WWWWW...",
"..k.k..WWWWWWW..",
".......WWWWWWWW.",
".YYY.WWWWWWWWWW.",
"YYYY.WWWWWWWWWW.",
".YYY.WWWWWWWww..",
".....WWWWWwwww..",
".YYY..WWWwwww...",
"YYYY...Wwwww..k.",
".YYY....www.....",
"................",
"................",
"................",
"................",
], { W:'#f8f2e6', w:'#d0c4b2', k:'#ffffff', Y:'#d8a040' });

// mıknatıs: at nalı (kırmızı kutuplar, gri gövde)
export const ICON_MAGNET = makeSprite([
"................",
"....RRRRRR......",
"...RRRRRRRR.....",
"..RRssssssRR....",
"..Rs......sR....",
"..Rs......sR....",
"..Rs......sR....",
"..Rs......sR....",
"..RR......RR....",
"..RR......RR....",
"..ww......ww....",
"..ww......ww....",
"................",
"................",
"................",
"................",
], { R:'#e04840', s:'#8a8a96', w:'#e8e8f0' });

// makine: gövde + ekran + ışık
export const ICON_MACHINE = makeSprite([
".......r........",
"......gg........",
"..gggggggggg....",
"..gDDDDDDDDg....",
"..gDbDDDDbDg....",
"..gDDDDDDDDg....",
"..gDbDDDbDDg....",
"..gDDDDDDDDg....",
"..gggYYYYggg....",
"....gDDDDg......",
"....gDDDDg......",
"....gggggg......",
"................",
"................",
"................",
"................",
], { g:'#8a8a96', D:'#3a3a44', b:'#7de87d', r:'#e04840', Y:'#ffd23e' });

// ikiz yumurta: yan yana iki yumurta
export const ICON_TWIN = makeSprite([
"................",
"................",
"...OO....OO.....",
"..OCCO..OCCO....",
".OCCCCOOCCCCO...",
".OCCCCOOCCCCO...",
".OCCCCOOCCCCO...",
"..OccO..OccO....",
"...OO....OO.....",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
], { O:'#8a6c50', C:'#f8f2e6', c:'#e0d4c0' });

// yonca: dört yapraklı şans simgesi
export const ICON_LUCKY = makeSprite([
"................",
"................",
"..GGG...GGG.....",
".GGEGG.GGEGG....",
".GGGGG.GGGGG....",
"..GGGGGGGGG.....",
"...GGGGGGG......",
"....GG.GG.......",
".....G.G........",
"......GG........",
"......G.........",
"................",
"................",
"................",
"................",
"................",
], { G:'#4a9c3f', E:'#8adc70' });

// yaprak: tutumlu kaynak (az tüketim)
export const ICON_SAVER = makeSprite([
"................",
".......GGG......",
"......GGEEG.....",
".....GGEEGG.....",
"....GGEEGGG.....",
"...GGEEGGG......",
"..GGEEGG........",
"..GEEGG.........",
"..G.GG..........",
"...G............",
"................",
"................",
"................",
"................",
"................",
"................",
], { G:'#5cb84c', E:'#a8e878' });

// ay + Z: çevrimdışı kazanç
export const ICON_OFFLINE = makeSprite([
"................",
"................",
"....MMMM........",
"..MMMMMM..ZZZ...",
".MMMMMMMM...Z...",
".MMMMMM.....Z...",
"..MMMMM...Z.....",
"....MMMM..ZZZZ..",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
], { M:'#e8d890', Z:'#b8d0f0' });

// sıkı dizilim: üç yumurta yan yana sıkışık + sıkıştırma okları
export const ICON_PACK = makeSprite([
"................",
"................",
"..>..........<..",
"..>OO..OO.OO.<..",
".>OCCOOCCOOCCO<.",
".>OCCOOCCOOCCO<.",
".>OCCOOCCOOCCO<.",
"..>OO..OO.OO.<..",
"..>..........<..",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
], { O:'#8a6c50', C:'#f8f2e6', '>':'#e04840', '<':'#e04840' });

// hızlı kuluçka: çatlayan kabuktan çıkan civciv başı
export const ICON_HATCH = makeSprite([
"................",
"......YYY.......",
".....YYYYY......",
".....YKYYO......",
".....YYYYY......",
"..WW.WYYY.W.....",
".WWWZZZWWZWWW...",
".WWWWWWWWWWWW...",
"..WWWWWWWWWW....",
"..WWWWWWWWWW....",
"...WWWWWWWW.....",
"....WWWWWW......",
".....wwww.......",
"................",
"................",
"................",
], { Y:'#ffd23e', K:'#2a1c10', O:'#e08030', W:'#f8f2e6', w:'#d0c4b2', Z:'#e0d4c0' });

// hızlı büyüme: civciv → tavuk yukarı ok
export const ICON_GROW = makeSprite([
"................",
".......G........",
"......GGG.......",
".....GGGGG......",
"....GGGGGGG.....",
"...GGGGGGGGG....",
"......GGG.......",
"......GGG.......",
"......GGG.......",
"..YY..GGG...WW..",
".YYYY.GGG..WWWW.",
".YKYY..G...WWKW.",
".YYYY.......WWW.",
"..YY........WW..",
"................",
"................",
], { G:'#8adc70', Y:'#ffd23e', K:'#2a1c10', W:'#f8f2e6' });

// sınıflandırıcı: tarama çerçevesi içinde yumurta + yukarı çentik
export const ICON_GRADE = makeSprite([
"................",
"..CC........CC..",
"..CC........CC..",
"................",
"......GG........",
".....GGGG.......",
"....GGGGGG......",
".....WWWW.......",
"....WWWWWW......",
"...WWWWWWWW.....",
"...WWWWWWWW.....",
"....WWWWWW......",
".....WWWW.......",
"..CC........CC..",
"..CC........CC..",
"................",
], { C:'#5cb8e8', G:'#7df0ff', W:'#f8f2e6' });

// lojistik kamyonu: dorse + kabin + tekerlekler
export const ICON_TRUCK = makeSprite([
"................",
"................",
"..TTTTTTTT......",
"..TTTTTTTT......",
"..TTTTTTTTTCC...",
"..TTTTTTTTTCWWC.",
"..TTTTTTTTTCCCC.",
"..TTTTTTTTTCCCC.",
"..TTTTTTTTTCCCCC",
"..kkkkkkkkkkkkk.",
"...KK......KK...",
"..KXXK....KXXK..",
"..KXXK....KXXK..",
"...KK......KK...",
"................",
"................",
], { T:'#d8d0c0', C:'#4a7ab0', W:'#aee0ff', k:'#2a2430', K:'#1c1a22', X:'#8a8494' });

// sevgi eli: kalp + parıltılar (imleç üstüne gelince otomatik sevme)
export const ICON_PET = makeSprite([
"................",
".k..........k...",
"...RRR..RRR.....",
"..RRRRRRRRRR.k..",
"..RRRRRRRRRR....",
"..RRRRRRRRRR....",
"...RRRRRRRR.....",
"....RRRRRR...k..",
".....RRRR.......",
"......RR........",
"................",
"..k.........k...",
"................",
"................",
"................",
"................",
], { R:'#e0637c', k:'#ffd23e' });

// gübre kepçesi: kürek + gübre yığını
export const ICON_SCOOP = makeSprite([
"................",
"...........WW...",
"..........WW....",
".........WW.....",
"........WW......",
".......WW.......",
"......WW........",
"...bbbWW........",
"..bbbbb.........",
"..bbbbb.........",
"...bbb..........",
"................",
"................",
"................",
"................",
"................",
], { W:'#a07850', b:'#5a4028' });

// seleksiyon: DNA sarmalı — civcivler daha iyi cins doğar
export const ICON_GENE = makeSprite([
"................",
"..CC......CC....",
"...CC....CC.....",
"....CCCCCC......",
".....CCCC.......",
"....CCCCCC......",
"...CC....CC.....",
"..CC......CC....",
"...CC....CC.....",
"....CCCCCC......",
".....CCCC.......",
"....CCCCCC......",
"...CC....CC.....",
"..CC......CC....",
"................",
"................",
], { C:'#4fd8e8' });

// toptancı anlaşması: dolar işareti — kamyon ödemesine prim
export const ICON_DEALER = makeSprite([
"................",
".....$$.........",
"....$$$$$$......",
"...$$..$$.......",
"...$$..$........",
"....$$$$$.......",
".....$$$$$......",
"......$$$$$.....",
"...$$..$$$......",
"...$$..$$.......",
"....$$$$$$......",
".....$$.........",
"................",
"................",
"................",
"................",
], { $:'#ffd23e' });

// organik sertifika: damarlı yaprak — yumurta değeri çarpanı
export const ICON_ORGANIC = makeSprite([
"................",
"..........GG....",
".........GGGG...",
"........GGGGG...",
".......GGGgGG...",
"......GGGggGG...",
".....GGGggGG....",
"....GGGggGG.....",
"...GGGggGG......",
"..GGGggGG.......",
"..GGggGG........",
"..GggGG.........",
"..ggG...........",
"................",
"................",
"................",
], { G:'#5cb648', g:'#357a28' });

// bereketli yem: etiketli gübre çuvalı — yığınlar daha sık
export const ICON_FERTILE = makeSprite([
"................",
"......BBB.......",
".....BBBBB......",
"......BBB.......",
".....BBBBB......",
"....BBBBBBB.....",
"...BBBBBBBBB....",
"..BBBBBBBBBBB...",
"..BBwwwwwBBBB...",
"..BBwwwwwBBBB...",
"..BBBBBBBBBBB...",
"..BBBBBBBBBBB...",
"...BBBBBBBBB....",
"....BBBBBBB.....",
"................",
"................",
], { B:'#9a6a3a', w:'#e8d8a0' });

// tedarik anlaşması: katlanmış sözleşme belgesi — dolum maliyeti düşer
export const ICON_SUPPLY = makeSprite([
"................",
"....DDDDDD......",
"....DDDDDDD.....",
"....DDDDDDd.....",
"....DWWWWWWD....",
"....DDDDDDDD....",
"....DWWWWWWD....",
"....DDDDDDDD....",
"....DWWWWWWD....",
"....DDDDDDDD....",
"....DWWWDDDD....",
"....DDDDDDDD....",
"................",
"................",
"................",
"................",
], { D:'#ddd2ae', d:'#b8a988', W:'#9a8a68' });

// pazarlık ustası: ipli fiyat etiketi — tavuk satışı daha kârlı
export const ICON_BARGAIN = makeSprite([
"................",
"................",
"...ss...........",
"....ss..........",
".....TTTTTTTTT..",
"....TtTTTTTTTT..",
"...TTTTTTTTTTT..",
"...TTTTTTTTTTT..",
"...TTTTTTTTTTT..",
"....TTTTTTTTTT..",
".....TTTTTTTTT..",
"................",
"................",
"................",
"................",
"................",
], { T:'#e8b838', t:'#7a5c20', s:'#c8c0a8' });

// ---- sekme rayı ikonları ----
// mağaza: el arabası / pazar tezgahı
export const ICON_CART = makeSprite([
"................",
"................",
"..aa............",
"...aaaaaaa......",
"...aAAAAAAa.....",
"...aAAAAAAa.....",
"...aAAAAAAa.....",
"....AAAAAA......",
"....aaaaaa......",
"................",
"....w....w......",
"...www..www.....",
"...www..www.....",
"....w....w......",
"................",
"................",
], { a:'#8a5a30', A:'#e8a54c', w:'#3a2a1a' });

// istatistik: yükselen çubuk grafik
export const ICON_CHART = makeSprite([
"................",
"................",
"............B...",
"...........BB...",
"......C....BB...",
"......C...BBB...",
"..A...C...BBB...",
"..A...CC.BBBB...",
"..AA..CC.BBBB...",
"..AAA.CCCBBBB...",
"..AAA.CCCBBBB...",
"..AAAACCCBBBB...",
"................",
"................",
"................",
"................",
], { A:'#e0637c', B:'#9fe870', C:'#5cb8e8' });

// başarım: altın kupa
export const ICON_TROPHY = makeSprite([
"................",
"................",
"...aaaaaaaaa....",
"..aAAAAAAAAAa...",
"..aAAAAAAAAAa...",
"...aAAAAAAAa....",
"....aAAAAAa.....",
".....aaaaa......",
"......AAA.......",
"......AAA.......",
"....aaaaaaa.....",
"...aaaaaaaaa....",
"................",
"................",
"................",
"................",
], { a:'#7a5c20', A:'#ffd23e' });

// efsane: parlak yıldız
export const ICON_STAR = makeSprite([
"................",
".......AA.......",
".......AAA......",
"......AAAA......",
"..AAAAAAAAAAA...",
"...AAAAAAAAA....",
".....AAAAAA.....",
"....AAAAAAAA....",
"...AAAA..AAAA...",
"..AAA......AA...",
"................",
"................",
"................",
"................",
"................",
"................",
], { A:'#ffd23e' });

// süpürge: dönen rulo fırça — borudan gelen yumurtaların kaba kirini kazır
export const ICON_BRUSH = makeSprite([
"................",
"....HHHH........",
"...HHHHHH.......",
"...Hhhhhh.......",
"....DDDDDD......",
"....DDDDDDDD....",
"....DDDDDDDD....",
"....dddddddd....",
"....d.d.d.d.....",
"....dddddddd....",
"....d.d.d.d.....",
".....d.d.d......",
"....EE..EE......",
"...EEEEEEEE.....",
"...EEEEEeee.....",
"....EEEEE.......",
], { H:'#54687e', h:'#3a4a5c', D:'#b8863c', d:'#8a6428', E:'#f8f2e6', e:'#d0c4b2' });
