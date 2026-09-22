// Ekonomi + format birim testleri — saf fonksiyonlar, DOM gerekmez
import { describe, it, expect, beforeEach } from 'vitest';
import { fmt, fmtTime, DIFFS, BAG_AT } from '../src/config.js';
import { S } from '../src/state.js';
import { diffDef, diffEarn, diffPrice, chickenCost, eggValue, sellPrice,
         refillRate, refillCost, manureValue, manureBagValue,
         workerSpeed, workerCarry, keeperBoost, keeperCd,
         prestMult } from '../src/economy.js';

beforeEach(() => {
  S.money = 0; S.diff = 'std'; S.prestige = 0;
  S.chickens.length = 0;
  for (const k in S.lvl) S.lvl[k] = 0;
});

describe('fmt', () => {
  it('küçük sayılar tam yazılır', () => {
    expect(fmt(0)).toBe('0');
    expect(fmt(999.9)).toBe('999');
  });
  it('binlikler k/M/B kısaltılır', () => {
    expect(fmt(1500)).toBe('1.5k');
    expect(fmt(25000)).toBe('25.0k');
    expect(fmt(1_500_000)).toBe('1.5M');
  });
});

describe('fmtTime', () => {
  it('ss:dd formatı', () => {
    expect(fmtTime(0)).toBe('00:00');
    expect(fmtTime(65)).toBe('01:05');
    expect(fmtTime(600)).toBe('10:00');
  });
});

describe('zorluk (DIFFS)', () => {
  it('dört mod da tanımlı ve yönleri tutarlı', () => {
    expect(Object.keys(DIFFS)).toEqual(['easy', 'std', 'hard', 'xhard']);
    expect(DIFFS.easy.earn).toBeGreaterThan(DIFFS.std.earn);
    expect(DIFFS.std.earn).toBeGreaterThan(DIFFS.hard.earn);
    expect(DIFFS.easy.price).toBeLessThan(DIFFS.std.price);
    expect(DIFFS.xhard.fox).toBeGreaterThan(DIFFS.hard.fox);
  });
  it('bilinmeyen zorluk STANDART döner', () => {
    S.diff = 'yokboyle';
    expect(diffDef()).toBe(DIFFS.std);
  });
  it('zorluk kazanç ve fiyata uygulanır', () => {
    S.diff = 'easy'; const eEasy = diffEarn(), pEasy = diffPrice();
    S.diff = 'xhard'; const eX = diffEarn(), pX = diffPrice();
    expect(eEasy).toBeGreaterThan(eX);
    expect(pEasy).toBeLessThan(pX);
  });
});

describe('fiyatlar', () => {
  it('tavuk fiyatı üstel büyür', () => {
    for (let n = 0; n < 20; n++)
      expect(chickenCost(n + 1)).toBeGreaterThan(chickenCost(n));
  });
  it('dolum birim fiyatı sürüyle ölçeklenir', () => {
    const r1 = refillRate();
    for (let i = 0; i < 49; i++) S.chickens.push({});
    expect(refillRate()).toBeGreaterThan(r1);
  });
  it('dolum maliyeti eksik kaynakla büyür', () => {
    S.feed = 0;
    const empty = refillCost('feed');
    S.feed = 90;
    expect(refillCost('feed')).toBeLessThan(empty);
    S.feed = 100;
  });
});

describe('değerler', () => {
  it('yumurta değeri seviyeyle artar', () => {
    expect(eggValue(5)).toBeGreaterThan(eggValue(0));
  });
  it('prestij çarpanı ⭐ başına büyür', () => {
    S.prestige = 2;
    expect(prestMult()).toBeGreaterThan(1);
  });
  it('satış fiyatı pozitif', () => {
    S.chickens.push({});
    expect(sellPrice()).toBeGreaterThan(0);
  });
  it('çuval = yığın × adet × toptan primi', () => {
    expect(manureBagValue()).toBe(Math.round(manureValue() * BAG_AT * 1.25));
  });
});

describe('personel eğrileri', () => {
  it('işçi hızı seviyeyle artar', () => {
    expect(workerSpeed(3)).toBeGreaterThan(workerSpeed(0));
  });
  it('taşıma kapasitesi 1 + seviye', () => {
    expect(workerCarry(0)).toBe(1);
    expect(workerCarry(4)).toBe(5);
  });
  it('bakıcı sevgisi 0.5 tabanında durur', () => {
    expect(keeperBoost(0)).toBeCloseTo(0.75);
    expect(keeperBoost(99)).toBe(0.5);
  });
  it('bakıcı aralığı seviyeyle kısalır', () => {
    expect(keeperCd(3)).toBeLessThan(keeperCd(0));
  });
});
