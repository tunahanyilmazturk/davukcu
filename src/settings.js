// Ayarlar modalı: ses, görsel, kayıt, yedekleme, sıfırlama
import { S, writeSave, resetSave, lastSaveAt } from './state.js';
import { SAVE_KEY } from './config.js';
import { toast } from './toast.js';
import { sndBuy, sndErr, sndPet } from './audio.js';

let ov = null, elLast = null, elSize = null, elBox = null, elVol = null, elVolPct = null;
const togglePaints = [];

// AÇIK/KAPALI butonu bağlar; her değişim anında kayda işlenir
function bindToggle(id, get, set) {
  const b = ov.querySelector('#' + id);
  const paint = () => {
    const on = get();
    b.textContent = on ? 'AÇIK' : 'KAPALI';
    b.classList.toggle('off', !on);
  };
  b.addEventListener('click', () => { set(!get()); paint(); writeSave(); sndBuy(); });
  togglePaints.push(paint);
}

function refreshSettings() {
  for (const p of togglePaints) p();
  if (elVol) { elVol.value = Math.round(S.volume * 100); elVolPct.textContent = '%' + elVol.value; }
  if (elLast) elLast.textContent = lastSaveAt
    ? new Date(lastSaveAt).toLocaleTimeString('tr-TR') : '—';
  if (elSize) {
    const n = (localStorage.getItem(SAVE_KEY) || '').length;
    elSize.textContent = n ? (n / 1024).toFixed(1) + ' KB' : '—';
  }
}

// üst bar v1.0 çipi ve panel dişlisi aynı kapıyı kullanır
export function openSettings() {
  if (!ov) return;
  refreshSettings();
  ov.classList.remove('hidden');
}

export function initSettings() {
  ov = document.createElement('div');
  ov.id = 'settingsModal';
  ov.className = 'hidden';
  ov.innerHTML =
    '<div class="mbox">' +
      '<div class="mhead"><span>AYARLAR</span><button id="btnSetClose" title="Kapat">&#10005;</button></div>' +
      '<div class="set-sec">SES</div>' +
      '<div class="set-row"><span>Ses efektleri</span><button id="setSfx" class="set-btn"></button></div>' +
      '<div class="set-row"><span>Müzik</span><button id="setMusic" class="set-btn"></button></div>' +
      '<div class="set-row"><span>Ses seviyesi</span>' +
        '<span class="volbox"><input type="range" id="setVol" min="0" max="100" step="5"><b id="setVolPct"></b></span></div>' +
      '<div class="set-sec">GÖRSEL</div>' +
      '<div class="set-row"><span>Parçacık efektleri</span><button id="setParts" class="set-btn"></button></div>' +
      '<div class="set-row"><span>Ortam efektleri</span><button id="setAmb" class="set-btn"></button></div>' +
      '<div class="set-row"><span>İpucu balonları</span><button id="setHints" class="set-btn"></button></div>' +
      '<div class="set-row"><span>FPS göstergesi</span><button id="setFps" class="set-btn"></button></div>' +
      '<div class="set-sec">KAYIT</div>' +
      '<div class="set-row"><span>Otomatik kayıt</span><b>her 10 sn</b></div>' +
      '<div class="set-row"><span>Son kayıt</span><b id="setLastSave">—</b></div>' +
      '<div class="set-row"><span>Kayıt boyutu</span><b id="setSaveSize">—</b></div>' +
      '<button id="setSaveNow" class="set-btn wide">Şimdi Kaydet</button>' +
      '<div class="set-sec">YEDEKLEME</div>' +
      '<div class="set-note">Kaydı kopyala veya başka bir kaydı yapıştırıp yükle.</div>' +
      '<textarea id="setSaveBox" spellcheck="false" placeholder="Kayıt verisi..."></textarea>' +
      '<div class="set-btns">' +
        '<button id="setExport" class="set-btn">Dışa Aktar</button>' +
        '<button id="setImport" class="set-btn">İçe Aktar</button>' +
      '</div>' +
      '<div class="set-sec danger">TEHLİKELİ BÖLGE</div>' +
      '<button id="setUiReset" class="set-btn wide">Arayüz Ayarlarını Sıfırla</button>' +
      '<button id="setReset" class="set-btn danger wide">Kaydı Sıfırla</button>' +
    '</div>';
  document.body.appendChild(ov);

  elLast = ov.querySelector('#setLastSave');
  elSize = ov.querySelector('#setSaveSize');
  elBox = ov.querySelector('#setSaveBox');
  elVol = ov.querySelector('#setVol');
  elVolPct = ov.querySelector('#setVolPct');

  const close = () => ov.classList.add('hidden');
  document.getElementById('btnSettings').addEventListener('click', e => { e.stopPropagation(); openSettings(); });
  ov.querySelector('#btnSetClose').addEventListener('click', close);
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  bindToggle('setSfx',   () => !S.muted,    v => { S.muted = !v; });
  bindToggle('setMusic', () => S.music,     v => { S.music = v; });
  bindToggle('setParts', () => S.fxParts,   v => { S.fxParts = v; });
  bindToggle('setAmb',   () => S.fxAmbient, v => { S.fxAmbient = v; });
  bindToggle('setHints', () => S.fxHints,   v => { S.fxHints = v; });
  bindToggle('setFps',   () => S.showFps,   v => { S.showFps = v; });

  elVol.addEventListener('input', () => {
    S.volume = elVol.value / 100;
    elVolPct.textContent = '%' + elVol.value;
  });
  elVol.addEventListener('change', () => { writeSave(); sndPet(); }); // bırakınca kaydet + deneme sesi

  ov.querySelector('#setSaveNow').addEventListener('click', () => {
    writeSave(); refreshSettings(); toast('Kaydedildi'); sndBuy();
  });

  ov.querySelector('#setExport').addEventListener('click', async () => {
    writeSave();
    elBox.value = localStorage.getItem(SAVE_KEY) || '';
    try {
      await navigator.clipboard.writeText(elBox.value);
      toast('Kayıt panoya kopyalandı');
    } catch (e) { toast('Kutudan kopyalayabilirsin'); }
    sndBuy();
  });

  ov.querySelector('#setImport').addEventListener('click', () => {
    const txt = elBox.value.trim();
    try {
      const d = JSON.parse(txt);
      if (!d || typeof d !== 'object' || (!('lvl' in d) && !('money' in d))) throw 0;
      localStorage.setItem(SAVE_KEY, txt);
      location.reload();
    } catch (e) { sndErr(); toast('Geçersiz kayıt verisi'); }
  });

  // arayüz tercihleri (panel durumu, daraltılmış bölümler) — kayıt dokunulmaz
  ov.querySelector('#setUiReset').addEventListener('click', () => {
    try {
      localStorage.removeItem('panelClosed');
      localStorage.removeItem('shopCollapsed');
    } catch (e) {}
    location.reload();
  });

  // iki aşamalı onay — gömülü tarayıcılarda confirm() engellendiği için
  // butonun kendisi onay ister: ilk basışta silahlanır, 3 sn içinde ikinci basışta siler
  const btnReset = ov.querySelector('#setReset');
  let armT = null;
  btnReset.addEventListener('click', () => {
    if (!armT) {
      btnReset.textContent = 'EMİN MİSİN? Tekrar bas';
      btnReset.classList.add('arm');
      armT = setTimeout(() => {
        armT = null;
        btnReset.textContent = 'Kaydı Sıfırla';
        btnReset.classList.remove('arm');
      }, 3000);
      sndErr();
      return;
    }
    clearTimeout(armT); armT = null;
    resetSave();
    try { // arayüz tercihleri de temiz başlasın
      localStorage.removeItem('panelClosed');
      localStorage.removeItem('shopCollapsed');
    } catch (e) {}
    location.reload();
  });
}
