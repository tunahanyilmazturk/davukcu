// Yumurtalar: yumurtlama, bant akışı, yıkama, kutuya düşüş, ödeme
import { S } from '../state.js';
import { L, fmt, MAXL } from '../config.js';
import { eggValue, washMult, washTime, polishMult, polishTime, farmBeltSpeed, depoBeltSpeed,
         rollTier, TIERS, BREEDS, magnetRadius, magnetCap, magnetPull,
         twinChance, luckyChance, eggGap, gradeChance, NEXT_TIER, TIER_TR } from '../economy.js';
import { sndPop, sndCoin, sndCluck, sndPolish, sndZap, sndGrade, sndWash } from '../audio.js';
import { magnet } from '../input.js';

export const box = { t: 0 }; // paketleme kutusu — yumurta düşünce kısa ezilme animasyonu

let lastWashSnd = 0; // yıkama sesi throttle — geçiş yıkamasında ard arda çalmasın
// yıkama tamamlama: temizle + sıçrama efekti + (throttle'lı) su sesi
function finishWash(e) {
  e.clean = true;
  S.parts.push({ kind: 'splash', x: e.x, y: L.BELT2_Y - 22, t: 0, life: .4 });
  const now = performance.now();
  if (now - lastWashSnd > 150) { lastWashSnd = now; sndWash(); }
}
// yığın taşması: katman sınırını aşan yumurta bandtan dökülüp yere düşer
// (kamyonun topladığı 'floor' fazına geçer — sonsuz kule olmaz)
const PILE_MAX = 8;
function spill(e) {
  e.phase = 'floorfall'; e.vy = 0; e.pile = 0;
  S.parts.push({ kind: 'puff', x: e.x, y: e.y + 14, t: 0, life: .3 });
}

// her yumurtaya ufak görsel kişilik: boyut, eğim, dikey kayma, sallanma fazı
export function eggLooks() {
  return { sc: 1.85 + Math.random() * 0.3, rot: (Math.random() - .5) * 0.34,
           jy: -Math.random() * 2.5, seed: Math.random() * 7 };
}

export function layEgg(ch) {
  const b = BREEDS[ch.breed] || BREEDS.white;
  S.eggs.push({
    x: ch.x, y: ch.y - 18, vy: 0,
    phase: 'fall', tier: rollTier(b.rare, b.gold), valMult: b.val,
    clean: false, wash: 0, polish: 0, shine: false, graded: false,
    ...eggLooks(),
  });
  // pasif: Çift Yumurta — şansla ikinci yumurta
  if (Math.random() < twinChance()) {
    S.eggs.push({
      x: ch.x + 10, y: ch.y - 18, vy: 0,
      phase: 'fall', tier: rollTier(b.rare, b.gold), valMult: b.val,
      clean: false, wash: 0, polish: 0, shine: false, graded: false,
      ...eggLooks(),
    });
  }
  ch.squat = 0.4;
  for (let i = 0; i < 3; i++) {
    S.parts.push({ kind: 'feather', x: ch.x + (Math.random() - .5) * 20, y: ch.y - 24,
      vx: (Math.random() - .5) * 30, vy: -20 - Math.random() * 20, t: 0, life: 1.2 });
  }
  sndCluck();
}

// yumurtanın anlık satış değeri (katman × cins × yıkama × cila)
export function eggWorth(e) {
  const t = TIERS[e.tier] || TIERS.normal;
  return Math.round(eggValue() * t.mult * (e.valMult || 1)
                    * (e.clean ? washMult() : 1) * (e.shine ? polishMult() : 1));
}

export function payout(e) {
  const t = TIERS[e.tier] || TIERS.normal;
  let v = eggWorth(e);
  // pasif: Şanslı Satış — şansla çift ödeme
  const lucky = Math.random() < luckyChance();
  if (lucky) v *= 2;
  S.money += v;
  S.eggsSold++;
  S.stats.earned += v;
  if (e.tier === 'gold') S.stats.golden++;
  else if (e.tier && e.tier !== 'normal') S.stats.rare++;
  if (e.clean) S.stats.washed++;
  if (e.shine) S.stats.polished++;
  S.parts.push({ kind: 'text', text: '+$' + fmt(v) + (lucky ? ' x2!' : ''),
    x: L.CRATE_X + 36, y: L.BELT2_Y - 40,
    vy: -35, t: 0, life: 1.1,
    color: lucky ? '#ffd23e'
         : e.tier && e.tier !== 'normal' ? t.pop : (e.clean ? '#6ad8ff' : '#9fe870') });
  S.parts.push({ kind: 'coin', x: L.CRATE_X + 44, y: L.BELT2_Y - 16, vx: 40, vy: -90, t: 0, life: .8 });
  sndCoin();
}

// mıknatısın kapabileceği fazlar — çekim ve önizleme bunu paylaşır
export function eggGrabbable(e) {
  return e.phase !== 'held' && e.phase !== 'pulled' && e.phase !== 'boxfall'
      && e.phase !== 'gone' && e.phase !== 'in';
}

export function updateEggs(dt) {
  // mıknatıs: basılıyken yarıçap içindeki yumurtalar imlece ÇEKİLİR,
  // yeterince yaklaşan tutulur (held), bırakılınca input.js düşürür/satar
  if (magnet.active) {
    const r = magnetRadius(), cap = magnetCap(), pull = magnetPull();
    const damp = Math.max(0, 1 - dt * 5);
    // çekilenler imlece hızlanır — merkeze yaklaştıkça çekim güçlenir
    for (const e of S.eggs) {
      if (e.phase !== 'pulled') continue;
      const dx = magnet.x - e.x, dy = magnet.y - 10 - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const f = pull * (0.45 + 1.1 * Math.max(0, 1 - d / r));
      e.vx = ((e.vx || 0) + dx / d * f * dt) * damp;
      e.vy = ((e.vy || 0) + dy / d * f * dt) * damp;
      e.x += e.vx * dt; e.y += e.vy * dt;
      // çekim parıltısı
      if (Math.random() < dt * 7) {
        S.parts.push({ kind: 'spark', x: e.x + (Math.random() - .5) * 12,
          y: e.y + (Math.random() - .5) * 10, vy: -30, t: 0, life: .3 });
      }
      if (d < 16) {
        e.phase = 'held';
        magnet.held.push(e);
        sndZap();
      }
    }
    // yeni yumurtaları çekmeye başla (kapasite dolana dek)
    let room = cap - magnet.held.length
             - S.eggs.reduce((n, e) => n + (e.phase === 'pulled' ? 1 : 0), 0);
    for (const e of S.eggs) {
      if (room <= 0) break;
      if (!eggGrabbable(e)) continue;
      if (Math.hypot(e.x - magnet.x, e.y + 10 - magnet.y) < r) {
        e.phase = 'pulled'; e.wash = 0; e.washM = 0; e.polish = 0; e.vx = 0; e.vy = 0;
        room--;
      }
    }
    // tutulanlar imlecin çevresinde yörüngede döner
    const ot = performance.now() / 1000 * 2.4;
    magnet.held.forEach((e, i) => {
      const a = ot + i * Math.PI * 2 / magnet.held.length;
      const k = Math.min(1, dt * 14);
      e.x += (magnet.x + Math.cos(a) * 13 - e.x) * k;
      e.y += (magnet.y - 6 + Math.sin(a) * 9 - e.y) * k;
    });
  }

  // yumurtalar: düşme → çiftlik bandı (sol) → depolama bandı (sağ) → kutu
  // bant Sv.0'da kurulu ama kapalı — hız 0, yumurtalar üstünde birikir
  const bs1 = S.lvl.beltF > 0 ? farmBeltSpeed() : 0;
  const bs2 = S.lvl.beltD > 0 ? depoBeltSpeed() : 0;

  // üst bant: sola akar, lider DROP_X'e varınca alt banda düşer;
  // aralık ihlali (yeni inen yumurta) anında düzeltilmez — yumuşakça geriye kayar
  const b1 = S.eggs.filter(e => e.phase === 'belt1').sort((a, b) => a.x - b.x);
  const push1 = Math.max(bs1, 70), gap = eggGap();
  let lead1 = -Infinity, pile1 = 0;
  for (let i = 0; i < b1.length; i++) {
    const e = b1[i];
    const limit = (i === 0) ? L.DROP_X : lead1 + gap;
    if (e.x > limit) e.x = Math.max(limit, e.x - bs1 * dt);
    else if (i > 0 && e.x < limit) e.x = Math.min(limit, e.x + push1 * dt);
    if (e.x > L.BELT1_LIMIT) e.x = L.BELT1_LIMIT; // sağ uçta sıkışıp kalırlar
    // uç taşması: aralık sağlanamayan yumurtalar üst üste katmanlanır;
    // katman sınırını aşanlar bandtan dökülür
    if (i > 0 && e.x >= L.BELT1_LIMIT - 1 && e.x - lead1 < gap - 3) {
      e.pile = ++pile1;
      if (e.pile > PILE_MAX) spill(e);
    } else { e.pile = 0; pile1 = 0; }
    if (i === 0 && e.x <= L.DROP_X) { e.phase = 'fall2'; e.vy = 0; }
    lead1 = e.x;
    // kirli yumurta bantta tortu bırakır
    if (!e.clean && Math.random() < dt * 0.4) {
      S.parts.push({ kind: 'speck', x: e.x + (Math.random() - .5) * 8,
        y: L.BELT1_Y + 2, vy: 20, t: 0, life: .6 });
    }
  }

  // alt bant: sağa akar; kirli yumurtalar yıkama yuvasında durur,
  // lider kutunun üstüne gelince içine düşer
  const washOn = S.lvl.wash > 0, polishOn = S.lvl.polish > 0, gradeOn = S.lvl.grade > 0;
  // maks hız seviyesinde tünel durmadan yıkar: yumurta bantta akarken temizlenir
  const washThru = S.lvl.washS >= MAXL.washS;
  const thruDur = Math.max(0.12, 40 / Math.max(bs2, 20));
  const b2 = S.eggs.filter(e => e.phase === 'belt2').sort((a, b) => b.x - a.x);
  const push2 = Math.max(bs2, 70);
  let lead2 = Infinity, washerBusy = false, polishBusy = false, pile2 = 0;
  for (let i = 0; i < b2.length; i++) {
    const e = b2[i];
    let limit = (i === 0) ? L.BELT2_X1 - 4 : lead2 - eggGap();

    // geçiş yıkaması: hareket halindeyken tünelde temizlenir (kuyruk tutmaz)
    if (e.washM > 0) {
      e.washM -= dt;
      if (Math.random() < 0.7) {
        S.parts.push({ kind: 'drop', x: e.x - 8 + Math.random() * 16,
          y: L.BELT2_Y - 40, vy: 140, t: 0, life: .3 });
      }
      if (e.washM <= 0) { e.washM = 0; finishWash(e); }
    }

    if (e.wash > 0) {
      // yıkanıyor: yerinde dur, su püskürt
      e.wash -= dt;
      if (Math.random() < 0.6) {
        S.parts.push({ kind: 'drop', x: e.x - 8 + Math.random() * 16,
          y: L.BELT2_Y - 40, vy: 140, t: 0, life: .3 });
      }
      if (e.wash <= 0) { e.wash = 0; finishWash(e); }
      washerBusy = true;
      lead2 = e.x;
      continue;
    }
    if (e.polish > 0) {
      // cilalanıyor: yerinde dur, parıltı saç
      e.polish -= dt;
      if (Math.random() < 0.5) {
        S.parts.push({ kind: 'spark', x: e.x - 8 + Math.random() * 16,
          y: L.BELT2_Y - 34 - Math.random() * 8, vy: -40 - Math.random() * 30, t: 0, life: .4 });
      }
      if (e.polish <= 0) { e.polish = 0; e.shine = true; sndPolish(); }
      polishBusy = true;
      lead2 = e.x;
      continue;
    }
    if (washOn && !e.clean) {
      if (e.x >= L.WASH_X - 1) {
        if (washThru) {
          if (e.washM <= 0) e.washM = e.washT = thruDur; // durmadan geçer
        } else if (!washerBusy) {
          e.wash = e.washT = washTime(); washerBusy = true; lead2 = e.x; continue;
        } else {
          limit = Math.min(limit, L.WASH_X + gap);
        }
      }
    }
    if (polishOn && e.clean && !e.shine) {
      if (e.x >= L.POLISH_X - 1) {
        if (!polishBusy) { e.polish = e.polishT = polishTime(); polishBusy = true; lead2 = e.x; continue; }
        limit = Math.min(limit, L.POLISH_X + gap);
      }
    }
    // sınıflandırıcı: kemer altından geçerken tek seferlik tarama — durmaz
    if (gradeOn && !e.graded && e.x >= L.GRADE_X) {
      e.graded = true;
      const up = NEXT_TIER[e.tier];
      if (up && Math.random() < gradeChance()) {
        e.tier = up;
        S.stats.upg++;
        S.parts.push({ kind: 'text', text: TIER_TR[up] + '!',
          x: e.x - 14, y: L.BELT2_Y - 34, vy: -30, t: 0, life: 1,
          color: TIERS[up].pop });
        sndGrade();
      }
      S.parts.push({ kind: 'spark', x: e.x - 4 + Math.random() * 8,
        y: L.BELT2_Y - 16, vy: -60, t: 0, life: .3 });
    }
    if (e.x < limit) e.x = Math.min(limit, e.x + bs2 * dt);
    else if (i > 0 && e.x > limit) e.x = Math.max(limit, e.x - push2 * dt); // aralık ihlali → geriye kay
    if (e.x < L.BELT_X0 + 4) e.x = L.BELT_X0 + 4;
    // sol uç taşması: kuyruk duvara dayanınca yumurtalar katmanlanır;
    // katman sınırını aşanlar yere dökülür (kamyon toplar)
    if (i > 0 && e.x <= L.BELT_X0 + 6 && lead2 - e.x < gap - 3) {
      e.pile = ++pile2;
      if (e.pile > PILE_MAX) spill(e);
    } else { e.pile = 0; pile2 = 0; }
    if (!e.clean && Math.random() < dt * 0.4) {
      S.parts.push({ kind: 'speck', x: e.x + (Math.random() - .5) * 8,
        y: L.BELT2_Y + 2, vy: 20, t: 0, life: .6 });
    }
    if (i === 0 && e.x >= L.BELT2_X1 - 5) {
      // bant ucundan fırlar: ileri momentum + yerçekimiyle kutu ağzına düşer
      e.phase = 'boxfall'; e.vy = 0;
      e.vx = Math.min(140 + bs2 * 0.2, 200);
    }
    lead2 = e.x;
  }

  // düşen yumurtalar
  for (const e of S.eggs) {
    if (e.sq > 0) e.sq -= dt; // iniş ezilmesi sayacı
    if (e.phase === 'boxfall') {
      // bant ucundan kutuya uçuş — ağız bölgesine girince içeri düşer
      e.vy += 1400 * dt;
      e.x += (e.vx || 0) * dt;
      e.y += e.vy * dt;
      const z = L.CRATE_ZONE;
      if (e.y >= z.rimY && e.x >= z.x0 && e.x <= z.x1) {
        e.phase = 'in';
      } else if (e.y >= L.FLOOR_Y - 8) {
        // kutuyu ıskaladı — zeminde kalır; kamyon veya mıknatıs toplar
        e.phase = 'floor'; e.vy = 0; e.sq = 0.14;
        S.parts.push({ kind: 'puff', x: e.x, y: L.FLOOR_Y - 4, t: 0, life: .3 });
      }
      continue;
    }
    if (e.phase === 'in') {
      // kutu içine gömülme: ağız ortasına kayar, ön duvarın arkasında kaybolur
      e.vy += 1600 * dt;
      e.y += e.vy * dt;
      e.x += (L.MOUTH_X - e.x) * Math.min(1, dt * 10);
      if (e.y >= L.CRATE_ZONE.inY) { e.phase = 'gone'; box.t = 0.18; payout(e); }
      continue;
    }
    if (e.phase === 'floorfall') {
      // zemine düşüş (mıknatısla aşağı bırakılan) — yolda kalır
      e.vy += 1400 * dt;
      e.y += e.vy * dt;
      if (e.y >= L.FLOOR_Y - 10) {
        e.y = L.FLOOR_Y - 10; e.phase = 'floor'; e.vy = 0; e.sq = 0.14;
        S.parts.push({ kind: 'puff', x: e.x, y: L.FLOOR_Y - 4, t: 0, life: .3 });
      }
      continue;
    }
    if (e.phase !== 'fall' && e.phase !== 'fall2') continue;
    const toBelt1 = e.phase === 'fall';
    const targetY = toBelt1 ? L.BELT1_Y : L.BELT2_Y;
    e.vy += 1400 * dt;
    e.y += e.vy * dt;
    if (e.y >= targetY - 20) {
      e.y = targetY - 20;
      e.phase = toBelt1 ? 'belt1' : 'belt2';
      // düştüğü hizada konumlanır — üst bantta sol uç kanalın sağında kalır
      e.x = Math.min(Math.max(e.x, (toBelt1 ? L.BELT1_X0 : L.BELT_X0) + 6),
                     toBelt1 ? L.BELT1_LIMIT : L.BELT2_X1 - 6);
      e.sq = 0.14; // iniş ezilmesi
      S.parts.push({ kind: 'puff', x: e.x, y: targetY - 4, t: 0, life: .3 });
      sndPop();
    }
  }
  S.eggs = S.eggs.filter(e => e.phase !== 'gone');
}
