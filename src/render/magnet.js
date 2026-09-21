// Mıknatıs aracı: imlecin ucunda at nalı mıknatıs, dönen alan halkası,
// menzildeki yumurtaların algılama işaretleri, kutu ağzı vurgusu, doluluk/değer sayacı
import { L, fmt } from '../config.js';
import { S } from '../state.js';
import { SPR, drawSprite } from '../sprites/index.js';
import { magnet } from '../input.js';
import { magnetRadius, magnetCap } from '../economy.js';
import { eggWorth, eggGrabbable } from '../entities/eggs.js';

export function drawMagnet(ctx) {
  if (!magnet.active) return;
  const t = performance.now() / 1000;
  const r = magnetRadius(), cap = magnetCap();
  const full = magnet.held.length >= cap;
  const col = full ? 'rgba(255,170,110,' : 'rgba(150,220,255,';

  // algılama önizlemesi — kapılabilir + menzildeki en yakın yumurtalar halkalanır
  // (kapasite dolunca gösterilmez: yer kalmadığını belirtir)
  const room = cap - magnet.held.length
             - S.eggs.reduce((n, e) => n + (e.phase === 'pulled' ? 1 : 0), 0);
  if (room > 0) {
    const near = S.eggs
      .filter(e => eggGrabbable(e)
        && Math.hypot(e.x - magnet.x, e.y + 10 - magnet.y) < r)
      .sort((a, b) => Math.hypot(a.x - magnet.x, a.y - magnet.y)
                    - Math.hypot(b.x - magnet.x, b.y - magnet.y))
      .slice(0, room);
    ctx.strokeStyle = col + '.65)';
    ctx.lineWidth = 1.5;
    for (const e of near) {
      ctx.beginPath();
      ctx.arc(e.x, e.y - 6, 8 + Math.sin(t * 8) * 1.5, 0, 7);
      ctx.stroke();
    }
  }

  // alan halkası — dönen kesikli çember (doluyken kalınlaşıp nabız atar)
  ctx.strokeStyle = col + '.45)';
  ctx.lineWidth = full ? 2 + Math.sin(t * 8) : 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.arc(magnet.x, magnet.y, r, t * 1.6, t * 1.6 + 7); ctx.stroke();
  ctx.setLineDash([]);

  // halka üstünde dönen enerji noktaları
  ctx.fillStyle = col + '.8)';
  for (let i = 0; i < 4; i++) {
    const a = t * 3 + i * Math.PI / 2;
    ctx.fillRect(magnet.x + Math.cos(a) * r - 1.5, magnet.y + Math.sin(a) * r - 1.5, 3, 3);
  }

  // çekim çizgileri — yarıçap kenarından içeri doğru kısa vuruşlar
  ctx.strokeStyle = col + '.22)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const a = t * 0.9 + i * Math.PI / 4;
    const s = Math.sin(t * 5 + i * 2) * 6;
    ctx.beginPath();
    ctx.moveTo(magnet.x + Math.cos(a) * (r - 4), magnet.y + Math.sin(a) * (r - 4));
    ctx.lineTo(magnet.x + Math.cos(a) * (r - 14 - s), magnet.y + Math.sin(a) * (r - 14 - s));
    ctx.stroke();
  }

  // at nalı mıknatıs — imlecin üstünde hafif sallanır
  ctx.save();
  ctx.translate(magnet.x, magnet.y);
  ctx.rotate(Math.sin(t * 6) * 0.1 - 0.45);
  drawSprite(ctx, SPR.icons.magnet, -16, -36, 2);
  ctx.restore();

  // kutu ağzı vurgusu — tutulan yumurta ağız bölgesindeyse yeşil parlar (bırak = sat)
  const z = L.WD.crateZone;
  if (magnet.held.some(e => e.x > z.x0 - 14 && e.x < z.x1 + 14
                         && e.y > z.rimY - 50 && e.y < z.inY + 50)) {
    ctx.fillStyle = 'rgba(159,232,114,.3)';
    ctx.fillRect(z.x0, z.rimY - 4, z.x1 - z.x0, 30);
  }

  // doluluk + tutulanların toplam değeri (halkanın üstünde)
  if (magnet.held.length) {
    const tot = magnet.held.reduce((s, e) => s + eggWorth(e), 0);
    const txt = magnet.held.length + '/' + cap + ' · +$' + fmt(tot);
    ctx.font = 'bold 13px "Courier New",monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a1020';
    ctx.fillText(txt, magnet.x + 1, magnet.y - r - 9);
    ctx.fillStyle = full ? '#ffb060' : '#9fe870';
    ctx.fillText(txt, magnet.x, magnet.y - r - 10);
  }
}
