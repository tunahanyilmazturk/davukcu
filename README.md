# Tavuk Çiftliği

The MachinEGG tarzında idle clicker oyunu. Tavuklar otlar, yumurtalar
konveyör bandına düşer, paketleme makinesi satar, parayla yeni tavuklar
ve yükseltmeler alırsın.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:8137
npm run build    # dist/ çıktısı (file:// ile de açılır)
npm run preview  # build'i önizle
```

## Oynanış

- **Tavuklar** kendiliğinden yumurtlar; yumurta banda düşer, makineye gider, satılır.
- **Tavuğa tıkla** → sev (kalpler çıkar, bir sonraki yumurtasını hızlandırır).
- **Tavuğu sürükleyip sağdaki panele bırak** → sat.
- **Pazar** panelinden tavuk ve yükseltme satın al: yumurta değeri,
  yumurtlama hızı, konveyör hızı, makine hızı, altın yumurta şansı (10x değerli).
- İlerleme `localStorage`'a kaydedilir; kapalıyken %50 verimle
  çevrimdışı kazanç birikir (en fazla 4 saat).

## Proje yapısı

```
index.html        sayfa iskeleti + sağ panel
style.css         pixel-art arayüz stilleri
src/
  main.js         giriş noktası: kayıt yükleme, çevrimdışı kazanç, ana döngü
  config.js       saha geometrisi, ekonomi sabitleri, fmt yardımcıları
  state.js        oyun durumu (S) + localStorage kayıt/yükle
  economy.js      seviyelerden türetilen değerler (fiyat, hız, şans)
  entities.js     tavuk/yumurta/makine/parçacık güncelleme mantığı
  render.js       canvas sahne çizimi
  world.js        statik arka plan (tek seferlik offscreen canvas)
  input.js        tavuk sevme + sürükleyip satma
  shop.js         pazar kartları, istatistikler, toast
  sprites.js      string satırlarından üretilen pixel sprite'lar
  audio.js        WebAudio ses efektleri
test.html         headless mantık testi (window.GAME kancası, sadece dev'de)
spritetest.html   sprite önizleme sayfası
```

Yeni özellik eklerken: ekonomi değerleri `economy.js`, mağaza
kartları `shop.js` içindeki `SHOP` dizisi, sahne sabitleri
`config.js` üzerinden yönetilir.
