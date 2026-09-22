// Yem silosu & su kulesi — gerçek çiftlik yapıları, kümes kenarlarında
// Seviye her ikisinde de ölçüm camı + tekne içeriği + % etiketle okunur

function drawLabel(ctx, t, ratio, feed, tm) {
  const { x, y, w } = t;
  ctx.font = 'bold 8px "Courier New",monospace';
  ctx.textAlign = 'center';
  if (ratio <= 0.001) {
    ctx.fillStyle = Math.floor(tm * 3) % 2 ? '#ff5040' : '#a02820';
    ctx.fillText(feed ? 'AÇ!' : 'SUSUZ!', x + w / 2, y - 8);
  } else {
    ctx.fillStyle = ratio < 0.25 ? '#ffb040' : 'rgba(255,255,255,.55)';
    ctx.fillText((feed ? 'YEM %' : 'SU %') + Math.round(ratio * 100), x + w / 2, y - 8);
  }
  ctx.textAlign = 'left';
}

function drawAutoBadge(ctx, t) {
  const { x, y, w } = t;
  ctx.fillStyle = '#243018';
  ctx.fillRect(x + w - 15, y - 13, 17, 9);
  ctx.strokeStyle = '#7de87d'; ctx.lineWidth = 1;
  ctx.strokeRect(x + w - 15.5, y - 13.5, 18, 10);
  ctx.fillStyle = '#7de87d'; ctx.font = 'bold 7px "Courier New",monospace';
  ctx.fillText('OTO', x + w - 14, y - 6);
}

// --- Yem silosu: oluklu sac gövde + konik çatı + huni + tekne ---
function drawFeedSilo(ctx, t, ratio, auto, tm) {
  const { x, y, w } = t;
  const cx = x + w / 2;

  // konik çatı (paslı galvaniz) + havalandırma başlığı
  ctx.fillStyle = '#96552f';
  ctx.fillRect(cx - 10, y + 2, 20, 4);
  ctx.fillRect(cx - 14, y + 6, 28, 4);
  ctx.fillRect(cx - 17, y + 10, 34, 4);
  ctx.fillRect(cx - 19, y + 14, 38, 5); // saçak
  ctx.fillStyle = '#c07a48';
  ctx.fillRect(cx - 10, y + 2, 20, 1);
  ctx.fillRect(cx - 14, y + 6, 28, 1);
  ctx.fillRect(cx - 17, y + 10, 34, 1);
  ctx.fillRect(cx - 19, y + 14, 38, 1);
  ctx.fillStyle = '#6e3d22';
  ctx.fillRect(cx - 2, y - 1, 4, 3);
  ctx.fillRect(cx - 4, y + 1, 8, 1);

  // oluklu sac gövde
  const bx = x + 2, bw = w - 4, by = y + 19, bh = 102;
  ctx.fillStyle = '#9a8f7e';
  ctx.fillRect(bx, by, bw, bh);
  for (let sx = bx; sx < bx + bw; sx += 4) {
    ctx.fillStyle = '#b3a693'; ctx.fillRect(sx, by, 1, bh);      // kaburga aydınlık
    ctx.fillStyle = '#7a7062'; ctx.fillRect(sx + 3, by, 1, bh);  // oluk gölge
  }
  // sağ/sol silindir gölgeleri
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(bx, by, 3, bh); ctx.fillRect(bx + bw - 3, by, 3, bh);
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(bx + 4, by, 3, bh);

  // çember kuşakları + perçinler
  ctx.fillStyle = '#5c5348';
  for (const hy of [by + 6, by + 48, by + 90]) {
    ctx.fillRect(bx, hy, bw, 3);
    ctx.fillStyle = '#453e34';
    for (let rx = bx + 3; rx < bx + bw - 2; rx += 6) ctx.fillRect(rx, hy + 1, 1, 1);
    ctx.fillStyle = '#5c5348';
  }

  // merdiven (sağ yüzde, siloya bitişik)
  ctx.fillStyle = '#5c5348';
  ctx.fillRect(bx + bw - 1, by + 4, 1, bh - 8);
  ctx.fillRect(bx + bw + 3, by + 4, 1, bh - 8);
  for (let ly = by + 8; ly < by + bh - 6; ly += 9)
    ctx.fillRect(bx + bw - 1, ly, 5, 1);

  // seviye ölçüm camı (ön yüzde dikey şerit)
  const gx = cx - 4, gy = by + 12, gh = bh - 24;
  ctx.fillStyle = '#2a241c';
  ctx.fillRect(gx - 1, gy - 1, 10, gh + 2);
  ctx.fillStyle = '#1a140e';
  ctx.fillRect(gx, gy, 8, gh);
  const ih = Math.round(gh * Math.max(0, Math.min(1, ratio)));
  if (ih > 0) {
    ctx.fillStyle = '#d89830';
    ctx.fillRect(gx, gy + gh - ih, 8, ih);
    ctx.fillStyle = '#f0c060';
    for (let ry = 0; ry < ih - 2; ry += 5)
      for (let cx0 = 0; cx0 < 6; cx0 += 3)
        if (((cx0 * 5 + ry * 7) % 4) < 2) ctx.fillRect(gx + 1 + cx0, gy + gh - ih + 1 + ry, 1, 1);
    ctx.fillStyle = '#b87820';
    ctx.fillRect(gx, gy + gh - ih, 8, 2); // yüzey
  }
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.fillRect(gx + 1, gy, 2, gh);
  // cam çerçeve bölme çizgileri
  ctx.fillStyle = '#2a241c';
  for (let fy = gy + 14; fy < gy + gh; fy += 14) ctx.fillRect(gx - 1, fy, 10, 1);

  // huni (alta doğru daralan)
  const hy = by + bh;
  ctx.fillStyle = '#6f655a';
  ctx.fillRect(bx + 1, hy, bw - 2, 4);
  ctx.fillRect(bx + 5, hy + 4, bw - 10, 5);
  ctx.fillRect(bx + 9, hy + 9, bw - 18, 5);
  ctx.fillStyle = '#57493c';
  ctx.fillRect(cx - 4, hy + 14, 8, 6); // boğaz
  ctx.fillStyle = 'rgba(255,255,255,.10)';
  ctx.fillRect(bx + 5, hy + 4, 2, 5);

  // ayaklar + kaide
  ctx.fillStyle = '#4a4238';
  ctx.fillRect(x + 5, hy + 18, 4, 26);
  ctx.fillRect(x + w - 9, hy + 18, 4, 26);
  ctx.fillRect(x + 5, hy + 30, w - 10, 2); // travers
  ctx.fillRect(x + 3, hy + 44, 8, 3);
  ctx.fillRect(x + w - 11, hy + 44, 8, 3);

  // boru: boğazdan tekneye iner
  ctx.fillStyle = '#8d8274';
  ctx.fillRect(cx - 3, hy + 20, 6, 30);
  ctx.fillStyle = '#b3a693';
  ctx.fillRect(cx - 3, hy + 20, 2, 30);
  // damlayan taneler (doluysa)
  if (ratio > 0.001) {
    ctx.fillStyle = '#f0c060';
    const dy = (tm * 34) % 12;
    ctx.fillRect(cx - 1, hy + 48 + dy, 2, 2);
  }

  // yem teknesi — silonun altından kümese doğru uzanır
  const tx = x - 46, ty = y + 168, tw = 68, th = 28;
  ctx.fillStyle = '#4a3520';                       // ayaklar
  ctx.fillRect(tx + 4, ty + th - 6, 5, 6);
  ctx.fillRect(tx + tw - 9, ty + th - 6, 5, 6);
  ctx.fillStyle = '#3a2a1a';                       // iç boşluk
  ctx.fillRect(tx + 2, ty + 2, tw - 4, 10);
  // yem yığını — seviyeyle büyür
  if (ratio > 0.001) {
    const mh = 2 + Math.round(ratio * 7);
    ctx.fillStyle = '#d89830';
    ctx.fillRect(tx + 3, ty + 12 - mh, tw - 6, mh);
    ctx.fillRect(tx + 10, ty + 10 - mh, tw - 20, 2);
    ctx.fillStyle = '#f0c060';
    for (let px = tx + 5; px < tx + tw - 6; px += 5)
      if ((px * 7) % 3 < 2) ctx.fillRect(px, ty + 12 - mh, 1, 1);
  }
  // tekne duvarları (ahşap, üstten görünüm)
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(tx, ty + 12, tw, th - 12);          // ön duvar
  ctx.fillStyle = '#8a5c34';
  ctx.fillRect(tx, ty + 12, tw, 3);                // üst kenar
  ctx.fillStyle = '#5e3f24';
  for (let px = tx + 8; px < tx + tw - 4; px += 10) ctx.fillRect(px, ty + 15, 1, th - 15); // tahta derzi
  ctx.fillRect(tx, ty + 12, 3, th - 12);           // yan direkler
  ctx.fillRect(tx + tw - 3, ty + 12, 3, th - 12);

  // yem çuvalı (silo yanında dekor)
  const sx = x + w - 6, sy = y + 178;
  ctx.fillStyle = '#8a6a3e';
  ctx.fillRect(sx, sy + 3, 14, 16);
  ctx.fillRect(sx + 1, sy, 12, 4);
  ctx.fillStyle = '#a8834e';
  ctx.fillRect(sx + 2, sy + 4, 10, 2);
  ctx.fillStyle = '#6e522e';
  ctx.fillRect(sx + 3, sy, 8, 2);                  // bağlı ağzı

  if (auto) drawAutoBadge(ctx, t);
}

// --- Su kulesi: ayaklı ahşap tank + ölçüm camı + boru + suluk teknesi ---
function drawWaterTower(ctx, t, ratio, auto, tm) {
  const { x, y, w } = t;
  const cx = x + w / 2;

  // küçük konik çatı
  ctx.fillStyle = '#5a4632';
  ctx.fillRect(cx - 12, y + 1, 24, 4);
  ctx.fillRect(cx - 16, y + 5, 32, 4);
  ctx.fillStyle = '#7a6248';
  ctx.fillRect(cx - 12, y + 1, 24, 1);
  ctx.fillRect(cx - 16, y + 5, 32, 1);
  ctx.fillStyle = '#463626';
  ctx.fillRect(cx - 1, y - 2, 3, 3);

  // ahşap tank gövdesi — dikey kalaslar + metal kuşaklar
  const bx = x + 1, bw = w - 2, by = y + 9, bh = 52;
  ctx.fillStyle = '#8a6a44';
  ctx.fillRect(bx, by, bw, bh);
  for (let sx = bx; sx < bx + bw; sx += 5) {
    ctx.fillStyle = '#96754c'; ctx.fillRect(sx, by, 2, bh);
    ctx.fillStyle = '#5e4630'; ctx.fillRect(sx + 4, by, 1, bh);
  }
  ctx.fillStyle = 'rgba(0,0,0,.16)';
  ctx.fillRect(bx, by, 2, bh); ctx.fillRect(bx + bw - 2, by, 2, bh);
  ctx.fillStyle = '#3d4750';
  ctx.fillRect(bx - 1, by + 8, bw + 2, 3);
  ctx.fillRect(bx - 1, by + 40, bw + 2, 3);
  ctx.fillStyle = '#242c33';
  for (let rx = bx + 3; rx < bx + bw - 2; rx += 7) {
    ctx.fillRect(rx, by + 9, 1, 1);
    ctx.fillRect(rx, by + 41, 1, 1);
  }
  // alttan hafif kavis (göbek)
  ctx.fillStyle = '#8a6a44';
  ctx.fillRect(bx + 3, by + bh, bw - 6, 3);
  ctx.fillStyle = '#3d4750';
  ctx.fillRect(bx + 3, by + bh + 3, bw - 6, 1);

  // ölçüm camı (sağ yüzde şeffaf boru)
  const gx = bx + bw - 6, gy = by + 4, gh = bh - 8;
  ctx.fillStyle = '#2a241c';
  ctx.fillRect(gx - 1, gy - 1, 7, gh + 2);
  ctx.fillStyle = '#0e2838';
  ctx.fillRect(gx, gy, 5, gh);
  const ih = Math.round(gh * Math.max(0, Math.min(1, ratio)));
  if (ih > 0) {
    ctx.fillStyle = '#6ab8f0';
    ctx.fillRect(gx, gy + gh - ih, 5, ih);
    ctx.fillStyle = '#4a98d0';
    ctx.fillRect(gx, gy + gh - ih, 5, 1);
    // yükselen kabarcık
    ctx.fillStyle = '#d8f0ff';
    ctx.fillRect(gx + 2, gy + gh - ((tm * 10) % Math.max(1, ih)), 1, 1);
  }
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.fillRect(gx + 1, gy, 1, gh);

  // ayaklar + çapraz payandalar
  const ly = by + bh + 4, lh = y + 158 - ly;
  ctx.fillStyle = '#4a3626';
  ctx.fillRect(x + 3, ly, 5, lh);
  ctx.fillRect(x + w - 8, ly, 5, lh);
  ctx.save();
  ctx.strokeStyle = '#4a3626'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 5, ly + 6); ctx.lineTo(x + w - 6, ly + lh - 6);
  ctx.moveTo(x + w - 5, ly + 6); ctx.lineTo(x + 6, ly + lh - 6);
  ctx.stroke();
  ctx.restore();
  // yatay kuşak
  ctx.fillStyle = '#3d2d1f';
  ctx.fillRect(x + 3, ly + Math.round(lh / 2) - 1, w - 6, 3);
  // ayak pabuçları
  ctx.fillStyle = '#352a1e';
  ctx.fillRect(x + 1, ly + lh - 3, 9, 3);
  ctx.fillRect(x + w - 10, ly + lh - 3, 9, 3);

  // iniş borusu + musluk
  const px = cx + 2;
  ctx.fillStyle = '#5f707c';
  ctx.fillRect(px, by + bh + 3, 5, y + 166 - by - bh);
  ctx.fillStyle = '#8a99a4';
  ctx.fillRect(px, by + bh + 3, 1, y + 166 - by - bh);
  ctx.fillRect(px, y + 166, 10, 4);        // dirsek — sağa, tekneye
  ctx.fillRect(px + 8, y + 166, 3, 7);     // musluk ağzı
  // damla animasyonu (su varsa)
  if (ratio > 0.001) {
    const dy = (tm * 46) % 16;
    ctx.fillStyle = '#a8dcf8';
    ctx.fillRect(px + 9, y + 172 + dy, 2, 3);
  }

  // suluk teknesi — kümese doğru uzanır
  const tx = x + 6, ty = y + 172, tw = 60, th = 26;
  ctx.fillStyle = '#4a5a64';
  ctx.fillRect(tx + 3, ty + th - 5, 5, 5); // ayaklar
  ctx.fillRect(tx + tw - 8, ty + th - 5, 5, 5);
  ctx.fillStyle = '#22323c';
  ctx.fillRect(tx + 2, ty + 2, tw - 4, 9); // iç
  if (ratio > 0.001) {
    const wh = 2 + Math.round(ratio * 7);
    ctx.fillStyle = '#4f93cc';
    ctx.fillRect(tx + 3, ty + 11 - wh, tw - 6, wh);
    ctx.fillStyle = '#6ab8f0';
    ctx.fillRect(tx + 3, ty + 11 - wh, tw - 6, 1);
    // akan dalga çizgileri
    ctx.fillStyle = '#a8dcf8';
    for (let i = 0; i < 3; i++)
      ctx.fillRect(tx + 6 + ((tm * 14 + i * 17) % (tw - 18)), ty + 12 - wh, 4, 1);
  }
  ctx.fillStyle = '#6d7d88';
  ctx.fillRect(tx, ty + 11, tw, th - 11);  // ön duvar
  ctx.fillStyle = '#8a99a4';
  ctx.fillRect(tx, ty + 11, tw, 2);
  ctx.fillStyle = '#54646e';
  for (let dx = tx + 9; dx < tx + tw - 4; dx += 12) ctx.fillRect(dx, ty + 13, 1, th - 13);
  ctx.fillRect(tx, ty + 11, 3, th - 11);
  ctx.fillRect(tx + tw - 3, ty + 11, 3, th - 11);

  // kova (boru yanında dekor)
  const kx = x + w + 2, ky = y + 186;
  ctx.fillStyle = '#5f707c';
  ctx.fillRect(kx, ky, 9, 8);
  ctx.fillStyle = '#8a99a4';
  ctx.fillRect(kx, ky, 9, 2);
  ctx.fillStyle = '#42505a';
  ctx.fillRect(kx + 1, ky - 1, 7, 1);

  if (auto) drawAutoBadge(ctx, t);
}

export function drawTank(ctx, t, ratio, kind, auto) {
  const tm = performance.now() / 1000;
  drawLabel(ctx, t, ratio, kind === 'feed', tm);
  if (kind === 'feed') drawFeedSilo(ctx, t, ratio, auto, tm);
  else drawWaterTower(ctx, t, ratio, auto, tm);
}
