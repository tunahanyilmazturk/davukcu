// Başarımlar: koşul sağlanınca para ödülü + toast bildirimi
import { S } from './state.js';
import { fmt } from './config.js';
import { toast } from './toast.js';
import { sndAchv } from './audio.js';

export const ACHV = [
  { id: 'first',   name: 'İlk Yumurta',     desc: 'İlk yumurtayı sat',              test: () => S.eggsSold >= 1,                    reward: 10 },
  { id: 's50',     name: 'Tezgah Açıldı',   desc: '50 yumurta sat',                 test: () => S.eggsSold >= 50,                   reward: 50 },
  { id: 's500',    name: 'Yumurta Baronu',  desc: '500 yumurta sat',                test: () => S.eggsSold >= 500,                  reward: 400 },
  { id: 'e500',    name: 'İlk Birikim',     desc: 'Toplam $500 kazan',              test: () => S.stats.earned >= 500,              reward: 100 },
  { id: 'e10k',    name: 'Çiftlik Zengini', desc: 'Toplam $10.000 kazan',           test: () => S.stats.earned >= 10000,            reward: 1000 },
  { id: 'ch5',     name: 'Kümes Doluyor',   desc: '5 tavuğa ulaş',                  test: () => S.chickens.length >= 5,             reward: 60 },
  { id: 'ch15',    name: 'Kanatlı Ordu',    desc: '15 tavuğa ulaş',                 test: () => S.chickens.length >= 15,            reward: 300 },
  { id: 'breed',   name: 'Cins Tavuk',      desc: 'Esmer, Kara veya Altın tavuk al',test: () => S.chickens.some(c => ['brown','black','gold'].includes(c.breed)), reward: 120 },
  { id: 'golden',  name: 'Altın Eller',     desc: 'Altın yumurta sat',              test: () => S.stats.golden >= 1,                reward: 150 },
  { id: 'rare10',  name: 'Koleksiyoncu',    desc: '10 nadir yumurta sat',           test: () => S.stats.rare >= 10,                 reward: 250 },
  { id: 'wash',    name: 'Temiz İş',        desc: '50 yumurta yıka',                test: () => S.stats.washed >= 50,               reward: 200 },
  { id: 'polish',  name: 'Pırıl Pırıl',     desc: '30 yumurta cilala',              test: () => S.stats.polished >= 30,             reward: 350 },
  { id: 'pet10',   name: 'Tavuk Sever',     desc: 'Tavukları 10 kez sev',           test: () => S.stats.pets >= 10,                 reward: 40 },
  { id: 'auto',    name: 'Tam Otomasyon',   desc: 'İki otomatik sistemi de kur',    test: () => S.lvl.autoF > 0 && S.lvl.autoW > 0, reward: 500 },
  { id: 'time',    name: 'Sadık Çiftçi',    desc: '10 dakika oyna',                 test: () => S.playTime >= 600,                  reward: 300 },
  { id: 'fox',     name: 'Tilki Avcısı',    desc: '3 tilkiyi korkut',               test: () => (S.stats.foxed || 0) >= 3,          reward: 300 },
  { id: 'butter',  name: 'Şans Peşinde',    desc: 'Altın kelebeği yakala',          test: () => (S.stats.butter || 0) >= 1,         reward: 100 },
];

// koşulu sağlanan her başarımı aç: ödül + bildirim + ses
export function checkAchv() {
  let unlocked = false;
  for (const a of ACHV) {
    if (!S.achv[a.id] && a.test()) {
      S.achv[a.id] = true;
      S.money += a.reward;
      toast('Başarım: ' + a.name + '  +$' + fmt(a.reward));
      sndAchv();
      unlocked = true;
    }
  }
  return unlocked;
}

// BAŞARIM sekmesi satırları
export function buildAchv() {
  const list = document.getElementById('achvList');
  list.innerHTML = '';
  for (const a of ACHV) {
    const r = document.createElement('div');
    r.className = 'srow achv';
    r.dataset.id = a.id;
    const txt = document.createElement('span');
    const nm = document.createElement('div'); nm.className = 'aname'; nm.textContent = a.name;
    const ds = document.createElement('div'); ds.className = 'adesc'; ds.textContent = a.desc;
    txt.appendChild(nm); txt.appendChild(ds);
    const b = document.createElement('b');
    r.appendChild(txt); r.appendChild(b);
    list.appendChild(r);
  }
}

export function refreshAchv() {
  for (const r of document.querySelectorAll('#achvList .achv')) {
    const a = ACHV.find(x => x.id === r.dataset.id);
    const done = !!S.achv[a.id];
    r.classList.toggle('done', done);
    r.querySelector('b').textContent = done ? '✓' : '+$' + fmt(a.reward);
  }
}
