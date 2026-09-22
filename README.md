# Tavuk Çiftliği

Piksel grafikli idle çiftlik/fabrika oyunu. Tavuklar otlar, yumurtalar
konveyör hattından geçip süpürge→yıkama→cila→sınıflandırma sonrası
sandıkta satılır; parayla tavuk, yükseltme ve çiftlik manzarası alırsın.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:8137
npm run build    # dist/ çıktısı
npm run preview  # build'i önizle
```

## Oynanış

- Ana menüden zorluk seç (Kolay / Standart / Zor / Aşırı Zor) → OYNA.
- **Tavuklar** kendiliğinden yumurtlar; yumurta borudan fabrika hattına
  düşer, istasyonlardan geçip sandıkta otomatik satılır.
- **Tavuğa tıkla** → sev; **sürükleyip panele bırak** → sat.
- **YEM/SU** barlarına (veya siloya) tıkla → paran yettiği kadar doldur.
- **Pazar** sekmesi: tavuk, hat istasyonları ve ekonomi yükseltmeleri.
- **Personel**: Çiftlik İşçisi gübre yığınlarını kovaya taşır,
  Tavuk Bakıcısı gezip tavukları sever — yükseltmelerle hız/kapasite artar.
- **Mağaza** sekmesi: kümes, gölet, değirmen, bayrak gibi manzaralar ve
  kozmetik süsler — satın alınca arsalarına yerleşir.
- Fabrika sayfasında **mıknatıs**: basılı tut, yumurtaları çeker.
- İlerleme `localStorage`'a kaydedilir; kapalıyken çevrimdışı kazanç
  birikir.

## Proje yapısı

```
index.html        sayfa iskeleti + sağ panel
style.css         pixel-art arayüz stilleri
src/
  main.js         giriş noktası: kayıt, çevrimdışı kazanç, ana döngü
  config.js       saha geometrisi, sabitler, fmt yardımcıları
  state.js        oyun durumu (S) + localStorage kayıt/yükle
  economy.js      seviyelerden türetilen değerler + zorluk çarpanları
  decor.js        satın alınabilir süs ve manzara kataloğu
  menu.js         ana menü sahnesi
  settings.js     ayarlar modalı
  shop.js         panel: sekmeler, kartlar, üst bar
  quests.js       görev zinciri
  achievements.js başarımlar
  prestige.js     prestij/efsane
  stats.js        istatistik sekmesi
  input.js        tavuk sevme, sürükleme, mıknatıs
  belts.js        konveyör segmentleri
  toast.js        bilgi mesajları
  audio.js        WebAudio efektleri
  camera.js       sayfa geçişi / kamera
  mobile.js       dokunmatik düzen
  entities/       tavuk, civciv, yumurta, gübre, personel, tilki, kamyon
  render/         canvas çizim katmanları (bant, istasyonlar, HUD, fx)
  world/          statik arka plan (çiftlik + fabrika, offscreen canvas)
  sprites/        string satırlarından üretilen pixel sprite'lar
test.html         headless mantık testi (window.GAME kancası, dev'de)
probe.html        hızlı sağlık sondası (dev'de)
```

Yeni özellik eklerken: ekonomi değerleri `economy.js`, mağaza
kartları `shop.js` içindeki `SHOP` dizisi, sahne sabitleri
`config.js` üzerinden yönetilir.
