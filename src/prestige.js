// Prestij (EFSANE sekmesi): çiftliği sıfırla → Altın Yem kazan (kalıcı +%12 değer/puan)
import { S, writeSave } from './state.js';
import { fmt } from './config.js';
import { prestGain, prestMult } from './economy.js';
import { spawnChicken } from './entities/index.js';
import { magnet, drag } from './input.js';
import { toast } from './toast.js';
import { sndAchv, sndErr } from './audio.js';

let armT = null;

// sekmeye her bakışta çağrılır
export function refreshPrestige() {
  const el = document.getElementById('prestBody');
  if (!el) return;
  const gain = prestGain();
  const runEarned = Math.max(0, S.stats.earned - S.prestigeBase);
  const nextAt = Math.pow(S.prestige + gain + 1, 2) * 40000 + S.prestigeBase; // sonraki ⭐ için gereken toplam
  el.innerHTML =
    '<div class="prest-stars">' + '⭐'.repeat(Math.min(S.prestige, 12) || 0) +
      (S.prestige > 12 ? ' +' + (S.prestige - 12) : '') + '</div>' +
    '<div class="srow"><span>Altın Yem</span><b>' + S.prestige + '</b></div>' +
    '<div class="srow"><span>Kalıcı çarpan</span><b>x' + prestMult().toFixed(2) + '</b></div>' +
    '<div class="srow"><span>Bu çağ kazanç</span><b>$' + fmt(runEarned) + '</b></div>' +
    '<div class="srow"><span>Sıfırlanırsa</span><b>+' + gain + ' ⭐</b></div>' +
    (gain > 0
      ? '<div class="srow"><span>Sonraki ⭐ için</span><b>$' + fmt(nextAt - S.stats.earned) + ' daha</b></div>'
      : '<div class="srow"><span>İlk ⭐ için</span><b>$' + fmt(40000 + S.prestigeBase - S.stats.earned) + ' daha</b></div>') +
    '<div class="set-note">Sıfırlama: para, seviyeler, tavuklar ve hat gider — ' +
      '⭐, başarımlar ve görev ilerlemesi kalır.</div>';
  const b = document.getElementById('btnPrest');
  if (b) {
    b.disabled = gain <= 0;
    b.classList.toggle('armed', !!armT);
    if (!armT) b.textContent = gain > 0 ? 'PRESTİJ YAP  (+' + gain + ' ⭐)' : 'PRESTİJ (kilitli)';
  }
}

export function initPrestige() {
  const b = document.getElementById('btnPrest');
  if (!b) return;
  b.addEventListener('click', () => {
    const gain = prestGain();
    if (gain <= 0) { sndErr(); return; }
    // iki aşamalı onay (confirm() gömülü tarayıcılarda engelli)
    if (!armT) {
      b.textContent = 'EMİN MİSİN? Her şey sıfırlanır — tekrar bas';
      b.classList.add('armed');
      armT = setTimeout(() => { armT = null; refreshPrestige(); }, 3500);
      sndErr();
      return;
    }
    clearTimeout(armT); armT = null;
    // ---- sıfırla ----
    S.prestige += gain;
    S.prestigeBase = 0; // stats.earned sıfırlanıyor — eşik yeni çağın kazancından ölçülür
    S.money = 0; S.eggsSold = 0;
    for (const k in S.lvl) S.lvl[k] = 0;
    S.chickens.length = 0;
    S.chicks.length = 0;
    S.workers.length = 0; // personel de sıfırlanır — yeniden satın alınır
    S.eggs.length = 0;
    S.manures.length = 0;
    S.manureBin = 0; S.manureBags = 0; // gübre zinciri de sıfırlanır
    S.parts.length = 0;
    S.truck = null;
    S.feed = 100; S.water = 100;
    // aktif etkileşimleri bırak — hayalet yumurta/donmuş tavuk kalmasın
    magnet.active = false; magnet.held.length = 0;
    if (drag.current) { drag.current.ch.drag = false; drag.current = null; }
    S.stats = { earned: 0, golden: 0, rare: 0, washed: 0, polished: 0, pets: 0,
                bought: 0, sold: 0, fills: 0, upg: 0, trucked: 0, manure: 0, bags: 0 };
    spawnChicken(undefined, undefined, 'white');
    toast('⭐ +' + gain + ' Altın Yem! Kalıcı çarpan: x' + prestMult().toFixed(2));
    sndAchv();
    writeSave();
    refreshPrestige();
    // mağaza kartları/görev çubuğu 0.25sn'lik refreshUI turunda tazelenir
  });
}
