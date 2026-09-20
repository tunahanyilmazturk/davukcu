// Görev zinciri: sıralı hedefler, ödüller, mağazada görünen ilerleme çubuğu
import { S } from './state.js';
import { fmt } from './config.js';
import { toast } from './toast.js';
import { sndAchv } from './audio.js';

// prog(): [mevcut, hedef] — çubukta "3/10" gösterilir
export const QUESTS = [
  { name: 'İlk Adım',          desc: 'Bir yumurtayı kutuya taşıyıp sat',        prog: () => [S.eggsSold, 1],        reward: 10 },
  { name: 'El Emeği',          desc: '10 yumurtayı elle kutuya taşı',           prog: () => [S.eggsSold, 10],       reward: 30 },
  { name: 'Sürü Büyüyor',      desc: '3 tavuk sahibi ol',                       prog: () => [S.chickens.length, 3], reward: 40 },
  { name: 'Bant Zamanı',       desc: 'Depolama Bandı kur',                      prog: () => [S.lvl.beltD, 1],       reward: 60 },
  { name: 'Yukarıdan Aşağı',   desc: 'Çiftlik Bandı kur',                       prog: () => [S.lvl.beltF, 1],       reward: 80 },
  { name: 'Beşlik',            desc: '5 tavuk sahibi ol',                       prog: () => [S.chickens.length, 5], reward: 80 },
  { name: 'Temizlik İyidir',   desc: 'Yumurta Yıkama kur',                      prog: () => [S.lvl.wash, 1],        reward: 120 },
  { name: 'Kalite Kontrol',    desc: 'Sınıflandırıcı kur',                      prog: () => [S.lvl.grade, 1],       reward: 150 },
  { name: 'Esmer Güzeli',      desc: 'Esmer tavuk al',                          prog: () => [S.chickens.filter(c => c.breed === 'brown').length, 1], reward: 100 },
  { name: 'Yüzlük',            desc: '100 yumurta sat',                         prog: () => [S.eggsSold, 100],      reward: 200 },
  { name: 'Pırıl Pırıl',       desc: 'Yumurta Cilası kur',                      prog: () => [S.lvl.polish, 1],      reward: 220 },
  { name: 'Kara İnci',         desc: 'Kara tavuk al',                           prog: () => [S.chickens.filter(c => c.breed === 'black').length, 1], reward: 250 },
  { name: 'Sabahın Sesi',      desc: 'Horoz al — civcivler gelir',              prog: () => [S.lvl.rooster, 1],     reward: 300 },
  { name: 'Kendi Kendine',     desc: 'Bir otomatik dolum sistemi kur',          prog: () => [S.lvl.autoF + S.lvl.autoW, 1], reward: 300 },
  { name: 'Sarı Kız',          desc: 'Altın tavuk al',                          prog: () => [S.chickens.filter(c => c.breed === 'gold').length, 1], reward: 450 },
  { name: 'Yarım Bin',         desc: '500 yumurta sat',                         prog: () => [S.eggsSold, 500],      reward: 500 },
  { name: 'Yolcu',             desc: 'Lojistik Kamyonu kur',                    prog: () => [S.lvl.truck, 1],       reward: 400 },
  { name: 'Servet',            desc: 'Toplam $10.000 kazan',                    prog: () => [S.stats.earned, 10000],reward: 600 },
  { name: 'Efsane Ol',         desc: 'Prestij yap — EFSANE sekmesinden sıfırla', prog: () => [S.prestige, 1],        reward: 0 },
];

export function currentQuest() { return QUESTS[S.questIdx] || null; }

// her UI yenilemesinde çağrılır — koşul dolunca ödül + sıradaki
export function checkQuests() {
  let guard = 0;
  while (guard++ < QUESTS.length) {
    const q = currentQuest();
    if (!q) return;
    const [cur, tgt] = q.prog();
    if (cur < tgt) return;
    S.questIdx++;
    if (q.reward > 0) {
      S.money += q.reward;
      S.stats.earned += q.reward;
      toast('Görev: ' + q.name + '  +$' + fmt(q.reward));
    } else {
      toast('Görev tamam: ' + q.name);
    }
    sndAchv();
  }
}

// görev çubuğunu boyar — DOM elemanları yoksa sessiz geç
export function refreshQuestBar() {
  const el = document.getElementById('questBar');
  if (!el) return;
  el.classList.remove('hidden');
  const q = currentQuest();
  if (!q) {
    el.innerHTML = '<b>Tüm görevler tamam!</b><span>Çiftlik efsanesi oldun — prestijlerle büyümeye devam et.</span><i></i>';
    el.classList.add('done');
    return;
  }
  el.classList.remove('done');
  const [cur, tgt] = q.prog();
  const pct = Math.min(100, Math.round(cur / tgt * 100));
  el.innerHTML =
    '<b>GÖREV ' + (S.questIdx + 1) + '/' + QUESTS.length + ' · ' + q.name + '</b>' +
    '<span>' + q.desc + '</span>' +
    '<i>' + Math.min(cur, tgt) + '/' + tgt + (q.reward ? ' · +$' + fmt(q.reward) : ' · ⭐') + '</i>' +
    '<u><b style="width:' + pct + '%"></b></u>';
}
