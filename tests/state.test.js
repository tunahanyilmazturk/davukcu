// Kayıt/yükleme birim testleri — localStorage stub'ı ile tarayıcısız
import { describe, it, expect, beforeEach } from 'vitest';
import { S, applySave, writeSave, readSave, resetSave } from '../src/state.js';

// minimal localStorage stub'ı
const store = {};
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; },
};

beforeEach(() => {
  localStorage.clear();
});

describe('applySave — göç ve varsayılanlar', () => {
  it('eski kayıttaki tek belt seviyesi iki banda da taşınır', () => {
    const r = applySave({ money: 50, lvl: { belt: 3 } });
    expect(S.lvl.beltF).toBe(3);
    expect(S.lvl.beltD).toBe(3);
    expect('belt' in S.lvl).toBe(false);
    expect(r.breeds).toEqual(['white']); // sayı yoksa tek beyaz tavuk
  });

  it('bilinmeyen zorluk STANDART\'a düşer', () => {
    applySave({ diff: 'ultra' });
    expect(S.diff).toBe('std');
    applySave({ diff: 'hard' });
    expect(S.diff).toBe('hard');
  });

  it('scenery alanı yoksa null kalır (eski oyuncu — toplu verilir)', () => {
    applySave({ money: 10 });
    expect(S.scenery).toBeNull();
    applySave({ scenery: {} });
    expect(S.scenery).toEqual({});
  });

  it('yeni alanlar eksikse sıfır/boş varsayılır', () => {
    const r = applySave({ money: 5 });
    expect(r.workerRoles).toEqual([]);
    expect(r.chickTimes).toEqual([]);
    expect(S.manureBin).toBe(0);
  });

  it('tavuk sayısı (eski format) cins listesine çevrilir', () => {
    const r = applySave({ chickens: 4 });
    expect(r.breeds).toHaveLength(4);
    expect(r.breeds.every(b => b === 'white')).toBe(true);
  });
});

describe('writeSave → readSave roundtrip', () => {
  it('alanlar kayda yazılıp geri okunur', () => {
    applySave({}); // temiz başlangıç
    S.money = 1234; S.diff = 'hard'; S.eggsSold = 77;
    S.chickens.push({ breed: 'brown' }, { breed: 'gold' });
    S.workers.push({ role: 'worker' }, { role: 'keeper' });
    writeSave();
    const d = readSave();
    expect(d).not.toBeNull();
    expect(d.money).toBe(1234);
    expect(d.diff).toBe('hard');
    expect(d.chickens).toEqual(['brown', 'gold']);
    expect(d.workers).toEqual(['worker', 'keeper']);
  });

  it('resetSave sonrası writeSave geri yazmaz', () => {
    S.money = 999;
    writeSave();
    expect(readSave()).not.toBeNull();
    resetSave();
    S.money = 5;
    writeSave();
    expect(readSave()).toBeNull(); // bastırıldı — sıfırlama kalıcı
  });
});
