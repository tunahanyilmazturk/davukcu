// Denge simülasyonu — economy.js formüllerinin kopyası, açgözlü oyuncu modeli.
// Kullanım: node sim.mjs [current|new]
const BASE = { egg: 1, lay: 5.0, belt: 75, beltD: 85, golden: 0.02, rare: 0.03 };
const MAXL = { value: 99, lay: 12, beltF: 10, beltD: 10, golden: 14, rare: 8, wash: 5, washS: 8,
               polish: 5, polishS: 8, feedCap: 8, waterCap: 8, autoF: 4, autoW: 4, magnet: 8,
               twin: 6, lucky: 8, saver: 5, offline: 5, rooster: 3, pack: 4,
               hatch: 8, grow: 8, grade: 6, truck: 6, autopet: 5 };
const MAX_CH = 80;
const MODE = process.argv[2] || 'current';
const NEW = MODE === 'new';

// ---- fiyat eğrileri ----
const COST = !NEW ? {
  chicken: n => Math.ceil(10 * Math.pow(1.18, n)),
  lay:    l => Math.ceil(25 * Math.pow(1.8, l)),
  rooster:l => Math.ceil(300 * Math.pow(2.6, l)),
  beltF:  l => l === 0 ? 60 : Math.ceil(30 * Math.pow(1.8, l)),
  beltD:  l => l === 0 ? 90 : Math.ceil(40 * Math.pow(1.8, l)),
  wash:   l => Math.ceil(120 * Math.pow(2.3, l)),
  washS:  l => Math.ceil(90 * Math.pow(1.9, l)),
  grade:  l => Math.ceil(220 * Math.pow(2.1, l)),
  polish: l => Math.ceil(180 * Math.pow(2.4, l)),
  polishS:l => Math.ceil(140 * Math.pow(1.9, l)),
  truck:  l => Math.ceil(260 * Math.pow(2.0, l)),
  value:  l => Math.ceil(20 * Math.pow(1.7, l)),
  golden: l => Math.ceil(80 * Math.pow(2.1, l)),
  rare:   l => Math.ceil(150 * Math.pow(2.4, l)),
  twin:   l => Math.ceil(140 * Math.pow(2.3, l)),
  lucky:  l => Math.ceil(120 * Math.pow(2.1, l)),
  pack:   l => Math.ceil(80 * Math.pow(2.0, l)),
} : {
  chicken: n => Math.ceil(12 * Math.pow(1.23, n)),
  lay:    l => Math.ceil(40 * Math.pow(1.9, l)),
  rooster:l => Math.ceil(800 * Math.pow(2.8, l)),
  beltF:  l => l === 0 ? 80 : Math.ceil(45 * Math.pow(1.9, l)),
  beltD:  l => l === 0 ? 150 : Math.ceil(60 * Math.pow(1.9, l)),
  wash:   l => Math.ceil(300 * Math.pow(2.5, l)),
  washS:  l => Math.ceil(250 * Math.pow(2.0, l)),
  grade:  l => Math.ceil(500 * Math.pow(2.4, l)),
  polish: l => Math.ceil(600 * Math.pow(2.6, l)),
  polishS:l => Math.ceil(300 * Math.pow(2.1, l)),
  truck:  l => Math.ceil(600 * Math.pow(2.2, l)),
  value:  l => Math.ceil(25 * Math.pow(1.75, l)),
  golden: l => Math.ceil(400 * Math.pow(2.7, l)),
  rare:   l => Math.ceil(600 * Math.pow(3.0, l)),
  twin:   l => Math.ceil(600 * Math.pow(2.7, l)),
  lucky:  l => Math.ceil(500 * Math.pow(2.5, l)),
  pack:   l => Math.ceil(100 * Math.pow(2.1, l)),
};
// ---- etki katsayıları ----
const F = !NEW ? {
  washM: l => 1 + 0.5 * l, polishM: l => 1 + 0.4 * l, grade: l => 0.08 * l,
  golden: l => Math.min(0.3, 0.02 + 0.02 * l), rare: l => Math.min(0.35, 0.03 + 0.05 * l),
  twin: l => 0.04 * l, lucky: l => 0.03 * l, roost: l => 1 + 0.1 * l, gap: l => 13 - l,
} : {
  washM: l => 1 + 0.4 * l, polishM: l => 1 + 0.3 * l, grade: l => 0.06 * l,
  golden: l => Math.min(0.25, 0.02 + 0.015 * l), rare: l => Math.min(0.30, 0.03 + 0.04 * l),
  twin: l => 0.03 * l, lucky: l => 0.025 * l, roost: l => 1 + 0.08 * l, gap: l => 13 - l,
};
// ---- kilit şartları (para dışı tempo kapıları) ----
const REQ = !NEW ? {
  washS: () => lvl.wash > 0, polish: () => lvl.wash > 0, polishS: () => lvl.polish > 0,
  grade: () => lvl.beltD > 0,
} : {
  beltD:  () => sold >= 10,                     // otomasyon ödülü: önce 10 yumurta elle taşı
  wash:   () => lvl.beltD > 0,                  // yıkama ancak akan bantta işe yarar
  washS:  () => lvl.wash > 0,
  polish: () => lvl.wash >= 2,                  // cila orta oyuna kayar
  polishS:() => lvl.polish > 0,
  grade:  () => lvl.wash >= 1,                  // sınıflandırıcı yıkama sonrası
  golden: () => lvl.value >= 3,                 // değer belli olunca altın mantıklı
  rare:   () => lvl.golden >= 2,                // nadirler altın sonrası
  twin:   () => sold >= 300,                    // pasifler satış kilometre taşına bağlı
  lucky:  () => sold >= 100,
  rooster:() => chickens.length >= 8,           // horoz orta boy sürüye
};
const BREED = {
  white: { cm: 1,   lr: 1,    rare: 0,    gold: 0,    val: 1, req: 0 },
  brown: { cm: 2.2, lr: 0.72, rare: 0,    gold: 0,    val: 1, req: 3 },
  black: { cm: 3,   lr: 1.1,  rare: 0.08, gold: 0.03, val: 1, req: 8 },
  gold:  { cm: 7,   lr: 1.25, rare: 0.05, gold: 0.08, val: 2, req: 15 },
  rooster: { cm: 4, lr: 1,    rare: 0,    gold: 0,    val: 1, lays: false },
};

const lvl = {}; for (const k in MAXL) lvl[k] = 0;
const chickens = [{ b: 'white' }];
let money = 0, t = 0, sold = 0;

const eggValue   = () => BASE.egg + lvl.value;
const layInt     = () => Math.max(0.7, BASE.lay * Math.pow(0.88, lvl.lay));
const TIERS = { normal: 1, bronze: 2, silver: 4, gold: 10, diamond: 20 };
const NEXT = { normal: 'bronze', bronze: 'silver', silver: 'gold', gold: 'diamond', diamond: 'diamond' };
const washTime  = () => Math.max(0.12, (NEW ? 0.38 : 0.45) * Math.pow(0.85, lvl.washS));
const polishTime= () => Math.max(0.15, (NEW ? 0.5 : 0.6) * Math.pow(0.85, lvl.polishS));
const farmSpd   = () => BASE.belt * Math.pow(1.25, lvl.beltF);
const depoSpd   = () => BASE.beltD * Math.pow(1.22, lvl.beltD);

function eggAvg(rareB, goldB, valM) {
  const g = F.golden(lvl.golden) + goldB, rc = F.rare(lvl.rare) + rareB;
  const d = lvl.rare >= 3 ? 0.08 : 0, s = 0.35 - d, b = 1 - d - s;
  const p = { normal: Math.max(0, 1 - g - rc), gold: g, bronze: rc * b, silver: rc * s, diamond: rc * d };
  const gc = F.grade(lvl.grade);
  let m = 0;
  for (const k in p) m += p[k] * (TIERS[k] + gc * (TIERS[NEXT[k]] - TIERS[k]));
  const w = lvl.wash > 0 ? F.washM(lvl.wash) * (lvl.polish > 0 ? F.polishM(lvl.polish) : 1) : 1;
  return eggValue() * m * w * valM;
}
function stats() {
  let eps = 0, vsum = 0;
  for (const c of chickens) {
    const b = BREED[c.b];
    if (b.lays === false) continue;
    const r = 1 / (layInt() * b.lr);
    eps += r; vsum += r * eggAvg(b.rare, b.gold, b.val);
  }
  eps *= F.roost(lvl.rooster) * (1 + F.twin(lvl.twin));
  const avgEgg = eps > 0 ? vsum * F.roost(lvl.rooster) / (eps / (1 + F.twin(lvl.twin))) : eggValue();
  const capB1 = lvl.beltF > 0 ? farmSpd() / F.gap(lvl.pack) : Infinity;
  const capB2 = lvl.beltD > 0 ? depoSpd() / F.gap(lvl.pack) : 0.5; // bant yokken elle taşıma
  const capW  = lvl.wash > 0 && lvl.washS < MAXL.washS ? 1 / washTime() : Infinity;
  const capP  = lvl.polish > 0 ? 1 / polishTime() : Infinity;
  const flow = Math.min(eps, capB1, capB2, capW, capP);
  return { income: flow * avgEgg * (1 + F.lucky(lvl.lucky)), flow };
}
function incomeWith(mut) {
  const saved = { ...lvl }, sch = chickens.map(c => ({ ...c })), s0 = sold;
  mut();
  const r = stats().income;
  for (const k in saved) lvl[k] = saved[k];
  chickens.length = 0; sch.forEach(c => chickens.push(c));
  sold = s0;
  return r;
}
function* candidates() {
  for (const k of ['lay','value','golden','rare','twin','lucky','pack','beltF','beltD','wash','washS','polish','polishS','grade','rooster']) {
    if (lvl[k] >= MAXL[k]) continue;
    if (REQ[k] && !REQ[k]()) continue;
    yield { id: k, cost: COST[k](lvl[k]), inc: incomeWith(() => { lvl[k]++; if (k === 'rooster') chickens.push({ b: 'rooster' }); }) };
  }
  for (const b of ['white','brown','black','gold']) {
    if (chickens.length >= MAX_CH || chickens.length < BREED[b].req) continue;
    yield { id: 'ch_' + b, cost: Math.ceil(COST.chicken(chickens.length) * BREED[b].cm),
            inc: incomeWith(() => chickens.push({ b })) };
  }
}

const marks = [];
let guard = 0;
while (t < 10 * 3600 && guard++ < 4000) {
  const { income, flow } = stats();
  let best = null, bestRoi = 0;
  for (const c of candidates()) {
    const roi = (c.inc - income) / c.cost;
    if (roi > bestRoi) { bestRoi = roi; best = c; }
  }
  if (!best || bestRoi <= 1e-9) break;
  if (money < best.cost) {
    if (income <= 0) break;
    const dt = (best.cost - money) / income;
    t += dt; money += income * dt; sold += flow * dt;
  }
  money -= best.cost;
  if (best.id.startsWith('ch_')) chickens.push({ b: best.id.slice(3) });
  else { lvl[best.id]++; if (best.id === 'rooster') chickens.push({ b: 'rooster' }); }
  marks.push({ t, id: best.id, lv: best.id.startsWith('ch_') ? chickens.length : lvl[best.id] });
}

const fm = s => Math.floor(s / 60) + 'dk' + String(Math.round(s % 60)).padStart(2, '0');
console.log('=== ' + MODE + ' ===  (satılan: ' + Math.round(sold) + ' yumurta)');
const first = {};
for (const m of marks) if (!(m.id in first)) first[m.id] = m.t;
console.log('ilk açılışlar:');
for (const id in first) console.log('  ' + fm(first[id]).padStart(7) + '  ' + id);
for (const c of [5, 10, 20, 40, 80]) {
  const m = marks.find(x => x.id.startsWith('ch_') && x.lv >= c);
  if (m) console.log('tavuk ' + c + ': ' + fm(m.t));
}
for (const [id, mx] of [['value',99],['lay',12],['wash',5],['polish',5],['grade',6],['golden',14],['rare',8],['beltD',10],['washS',8],['twin',6],['lucky',8],['pack',4]]) {
  const ms = marks.filter(x => x.id === id);
  const m = ms.pop();
  if (!m) { console.log(id + ': hiç'); continue; }
  console.log(id + ' ' + (m.lv >= mx ? 'MAX' : 'Sv.' + m.lv) + ': ' + fm(m.t));
}
console.log('son: t=' + fm(t) + ', rate=$' + Math.round(stats().income) + '/sn, tavuk=' + chickens.length);
