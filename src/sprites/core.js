/* Sprite altyapısı: string satırlarından canvas üretimi ve çizim.
   Sprite'lar string satırlarından oluşur; her karakter palet
   rengine karşılık gelir, '.' = şeffaf. */

export function makeSprite(rows, palette) {
  const h = rows.length;
  const w = rows[0].length;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const col = palette[row[x]];
      if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
    }
  }
  return { c, w, h };
}

// sprite'ı scale katı büyüterek çizer; flip=true ile yatay aynalar
export function drawSprite(ctx, spr, x, y, scale, flip) {
  scale = scale || 3;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.translate(Math.round(x + spr.w * scale), Math.round(y));
    ctx.scale(-1, 1);
    ctx.drawImage(spr.c, 0, 0, spr.w * scale, spr.h * scale);
  } else {
    ctx.drawImage(spr.c, Math.round(x), Math.round(y), spr.w * scale, spr.h * scale);
  }
  ctx.restore();
}
