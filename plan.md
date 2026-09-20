# PLAN — Yerleşim Yeniden Ölçeklendirme + Gübre Toplama Zinciri

> Bu dosya bir sonraki geliştirme turu için hazır prompt/spec'tir.
> Oyuna dönünce bu dosyayı oku ve aşağıdaki işleri sırayla uygula.

## Amaç

İki büyük değişiklik:

1. **Yerleşim**: Sanayi bölgesi (bantlar, istasyonlar, kutu, kamyon) kendi içinde
   küçültülecek ve daha kompakt çizilecek; kazanılan dikey alan çiftliğe (kümese)
   eklenecek. Ana içerikler (tavuklar, yumurtalar, gübre yığınları) da biraz
   küçültülerek kümes daha geniş ve ferah hissedecek.
2. **Gübre ekonomisi**: Gübre artık tıklayınca anında para vermeyecek — bir
   **toplama alanına** taşınacak, orada birikim **kiloluk gübre çuvallarına**
   dönüşecek, çuvalları **kamyon** gelip alacak ve satacak. Böylece gübre de
   yumurta gibi bir "üretim zinciri" olacak.

---

## 1. Yerleşim yeniden ölçeklendirme

### Mevcut durum (src/config.js)

- `H = 800` mantıksal yükseklik, `L.W` sahne genişliğinden gelir
- `L.PEN = { x:24, y:54, w:w-48, h:326 }` → kümes 54..380
- `L.BELT1_Y = 480` (üst bant), `L.BELT2_Y = 640` (alt bant), `L.BELT_H = 18`
- `L.FLOOR_Y = 770`, `L.HUD_H = 18`
- Sanayi bölgesi ~390px, kümes ~326px — sanayi bölgesi kümesden BÜYÜK

### Hedef

- Sanayi bölgesini dikeyde ~%35-40 küçült: iki bant arası mesafe, istasyon
  görselleri (yıkama/cila/sınıflandırıcı), kutu, huni ve duvar dekorları
  kompakt ölçekte çizilsin. Örnek yeni iskelet:
  - `BELT1_Y ≈ 470`, `BELT2_Y ≈ 600`, `FLOOR_Y = 770` (sabit)
  - Kümes yeni alanı kaplasın: `PEN.h ≈ 326 → ~390-400`
- `BELT_H` 18 → ~14; merdane/istasyon sprite ölçekleri orantılı küçülsün.
  Çizimler `src/belts.js`, `src/render/wash.js`, `polish.js`, `grade.js`,
  `crate.js`, `truck.js`, `src/world.js` (hat duvarı dekorları: boru hattı,
  manometre, lambalar, tabela) — hepsi L sabitlerinden türetilmiş durumda;
  mümkünse sabitleri değiştirerek ölçekle, kalanları elle ayarla.
- Ana içerik küçültme: tavuk/civciv sprite ölçeği ~x1 → ~x0.85,
  yumurta ~x0.8, gübre yığını ~x0.8. Render'da tek noktadan scale çarpanı
  uygula (`ctx.scale` yerine hedef boyut sabitleri — pixel-art bozulmasın,
  çarpan kırıklı değerlerde `Math.round` ile piksele oturt).
- Kümes büyüyünce: `pickWander`/`inSilo` sınırları, `clampEntities`, silo
  konumları (`L.FEED`, `L.WATER`), yumurta düşme noktası (`DROP_X`, huni)
  ve `?floor=` dev parametresi yeni koordinatlara göre doğrulanacak.
- Bant hızları/ekonomi DEĞİŞMEZ — sadece görsel ölçek.

## 2. Gübre toplama zinciri

### Akış

```
tavuk yığın bırakır → oyuncu yığına gelir → imleç KÜREK olur → tık
→ yığın "kepçelenir" → kümes üstündeki GÜBRE ALANI'na eklenir
→ alanda birikim sayacı (örn. 20 yığın) dolunca 1 GÜBRE ÇUVALI oluşur
→ çuvallar alanda/yanında istiflenir → kamyon gelir, çuvalları yükler, satar
```

### İşler

- **İmleç**: `input.js`'te `manureAt()` hover'da `pointer` yerine kürek imleci.
  Önce CSS `cursor` ile hazır emoji/kürek denenebilir (`cursor: url(...)`
  yerine basit çözüm: canvas üstünde kürek sprite'ı çiz — mıknatıs nalı gibi,
  `render/magnet.js`'teki desenle). Kürek sprite'ı `sprites/icons.js`'teki
  `ICON_SCOOP`'un büyük hali olabilir.
- **Toplama alanı**: kümesin üst iç kenarına (çatıya yakın, pen üst şeridi)
  sabit bir **gübre deposu/hazne** görseli — ahşap kutu/kovara benzeri.
  `config.js`'e `L.MANURE_BIN = { x, y, w, h }`. Birikim sayısı `S.manureBin`
  (yığın adedi, kaydedilir). Üstünde `12/20` sayacı.
- **Tıklama**: `collectManure()` artık para vermesin — `S.manureBin++`,
  yığın silinsin, kovaya doğru küçük uçan parçacık animasyonu
  (`S.parts`'a özel 'manureFly' kind veya mevcut text/feather ile).
- **Çuval dönüşümü**: `manureBin >= 20` (sabit: `BAG_AT = 20`) →
  `manureBin -= 20`, `S.manureBags++` (kaydedilir), hazne yanında çuval
  sprite'ı belirir (kahverengi balya + ip detayı, `sprites/` altında yeni).
- **Kamyon satışı**: mevcut kamyon (`entities/truck.js`) zaten periyodik
  geliyor — gübre çuvalı varsa kamyon onları da yüklesin: her çuval
  `manureBagValue()` = `manureValue() * 20 * 1.25` (toplu satış primi).
  Kamyon kargosuna `bags` sayısı ekle, ödemeye dahil et, `stats.manure`
  yanına `stats.bags` sayacı. Kamyon yoksa çuvallar birikir (teşvik:
  lojistik yükseltmesi). Görsel: kamyon kasasına çuval çizimi.
- **Kepçe yükseltmesi uyumu**: `lvl.scoop` otomatik toplama artık kovaya
  doldursun (aynı `collectPile` yolu, para yerine `manureBin++`).
  Kepçe Sv.2+ ileride "otomatik çuvallama" da yapabilir — opsiyonel.
- **HUD/istatistik**: stats satırlarına `Gübre kovası: n/20`,
  `Gübre çuvalı: n`, `Çuval değeri: $x`. Görev zincirine isteğe bağlı
  "İlk Çuval" görevi (`manureBags >= 1`, `El Emeği` sonrasına).
- **Geri uyumluluk**: eski kayıtlarda `manureBin`/`manureBags` yok —
  `applySave` varsayılan 0. `writeSave`'e ekle.

### Dikkat edilecekler

- Kürek imleci sürükleme/mıknatıs/silo önceliğini bozmasın — mevcut sıra:
  silo → tavuk → gübre → mıknatıs.
- Kepçe imleci çizimi `fxParts` ayarından bağımsız (işlevsel imleç).
- `MAX_PILES = 14` korunur; kova kapasitesi sınırsız ama çuvala dönüşür.
- Prestij sıfırlaması: `manureBin`, `manureBags`, `stats.bags` sıfırlanır
  (geçici ilerleme); `S.prestige`/`questIdx` kalır — `prestige.js`'e ekle.
- Test (`test.html`): kova sayacı, çuval dönüşümü (20 yığın → 1 çuval),
  kamyonla çuval satışı, imleç durumu — TEST log'una ekle.
- `index.html`/`test.html` DOM paritesi korunur (yeni DOM gerekmez —
  her şey canvas'ta).

## 3. Doğrulama

- `npm run build` temiz
- Headless test: `msedge --headless --dump-dom --virtual-time-budget=30000 test.html`
  → `TEST|[...]` çıktısında yeni metrikler yeşil
- Görsel: `?ch=10&ff=120` ile kümes doluluğu, `?lvl=belt:2,wash:2,grade:2` ile
  kompakt sanayi bölgesi, `?money=` ile çuval+kamyon akışı screenshot kontrolü
- `sim.mjs` dengesine çuval geliri eklenebilir (opsiyonel)

## Sıra

1. config.js layout sabitleri → render ölçekleri → build/screenshot
2. Gübre akışı (imleç → kova → çuval → kamyon) → test.html metrikleri
3. stats/prestij/save entegrasyonu → tam test + görsel kontrol
4. Commit + push
