// Ortam efektleri (DÜNYA uzayı, çiftlik sayfası x<W'de kalır):
// ışık huzmeleri + toz, bulut gölgeleri, gölet dalgası, dönen rüzgar
// gülü kanatları, kelebekler ve ara sıra geçen kuş. fxAmbient ayarıyla.
import { L } from '../config.js';
import { S } from '../state.js';

// Türk bayrağı kumaşı — bir kez offscreen'de dokunur (ay-yıldız dahil);
// kare başına sütun sütun sinüs ofsetiyle dilimlenerek dalgalandırılır
let flagTex = null;
function buildFlag() {
  const c = document.createElement('canvas');
  c.width = 42; c.height = 27;
  const g = c.getContext('2d');
  g.fillStyle = '#e30a17'; g.fillRect(0, 0, 42, 27);
  g.fillStyle = '#b8081a'; g.fillRect(0, 0, 3, 27); // uçkurluk (direk tarafı)
  g.fillStyle = '#f8f4f0';                          // hilal
  g.beginPath(); g.arc(13.5, 13.5, 7, 0, 7); g.fill();
  g.fillStyle = '#e30a17';
  g.beginPath(); g.arc(16.2, 13.5, 5.6, 0, 7); g.fill();
  g.fillStyle = '#f8f4f0';                          // yıldız — bir köşesi hilale bakar
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 1.6 : 4.2;
    const a = Math.PI + i * Math.PI / 5;
    const x = 27 + Math.cos(a) * r, y = 13.5 + Math.sin(a) * r;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.fill();
  return c;
}

export function drawAmbient(ctx) {
  const t = performance.now() / 1000;
  const P = L.PEN;

  // ışık huzmeleri — tavandan eğik inen yumuşak şeritler
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#fff8d8';
  for (let i = 0; i < 3; i++) {
    const sx = P.x + P.w * (0.18 + i * 0.3);
    ctx.beginPath();
    ctx.moveTo(sx, L.HUD_H);
    ctx.lineTo(sx + 70, L.HUD_H);
    ctx.lineTo(sx + 130, P.y + P.h);
    ctx.lineTo(sx + 40, P.y + P.h);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // bulut gölgeleri — çimde yavaşça sağa süzülen yumuşak koyuluklar
  ctx.fillStyle = 'rgba(30,50,20,.06)';
  for (let i = 0; i < 2; i++) {
    const cx = ((t * (7 + i * 2.5) + i * 480) % (L.W + 500)) - 250;
    ctx.beginPath(); ctx.ellipse(cx, 200 + i * 280, 170, 58, 0, 0, 7); ctx.fill();
  }

  // toz zerreleri — deterministik sin salınımıyla süzülür
  ctx.fillStyle = 'rgba(255,245,220,.35)';
  for (let i = 0; i < 14; i++) {
    const px = P.x + ((i * 137.5 + t * (6 + i % 3 * 4)) % P.w);
    const py = P.y + 20 + ((i * 61 + Math.sin(t * 0.6 + i) * 30 + t * 3) % (P.h - 40));
    ctx.fillRect(px, py, 2, 2);
  }

  // gölet — genişleyen dalga halkası + süzülen parlama çizgisi
  const PO = L.POND, pcx = PO.x + PO.w / 2, pcy = PO.y + PO.h / 2;
  const rp = (t * 0.4) % 1;
  ctx.strokeStyle = 'rgb(190,225,245)'; ctx.globalAlpha = 0.4 * (1 - rp);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(pcx, pcy, 6 + rp * (PO.w / 2 - 10), 3 + rp * (PO.h / 2 - 8), 0, 0, 7);
  ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = 1;
  const gl = (t * 26) % (PO.w - 40);
  ctx.fillStyle = 'rgba(220,240,255,.4)';
  ctx.fillRect(PO.x + 20 + gl, pcy - 12 + Math.sin(t * 1.4) * 6, 8, 2);

  // rüzgar gülü kanatları — kule göbeğinde yavaşça döner
  const M = L.MILL, mx = M.x + M.w / 2, my = M.y + 20;
  ctx.save();
  ctx.translate(mx, my); ctx.rotate(t * 0.9);
  for (let i = 0; i < 4; i++) {
    ctx.save(); ctx.rotate(i * Math.PI / 2);
    ctx.fillStyle = '#d8cba8'; ctx.fillRect(4, -3, 24, 6);   // kanat kolu
    ctx.fillStyle = '#b8a888'; ctx.fillRect(20, -6, 10, 12); // yel bezi
    ctx.fillStyle = '#8a7858'; ctx.fillRect(4, -3, 24, 2);   // kol gölgesi
    ctx.restore();
  }
  ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill();
  ctx.restore();

  // Türk bayrağı — kümesin sağındaki direkte dalgalanır;
  // kumaş uca doğru büyüyen sinüs dalgasıyla sütun sütun çizilir,
  // faz-kaymalı gölge geçişi kumaşa derinlik verir
  if (!flagTex) flagTex = buildFlag();
  const FL = L.FLAG, fx = FL.x + FL.w / 2, fgy = FL.y + FL.h;
  const poleTop = fgy - 112;
  ctx.fillStyle = '#8a8478'; ctx.fillRect(fx - 7, fgy - 4, 15, 4);  // taş kaide
  ctx.fillStyle = '#a8a294'; ctx.fillRect(fx - 5, fgy - 7, 11, 3);
  ctx.fillStyle = '#e8e4da'; ctx.fillRect(fx - 2, poleTop, 4, 112); // direk
  ctx.fillStyle = '#b8b4aa'; ctx.fillRect(fx, poleTop, 2, 112);     // direk gölgesi
  ctx.fillStyle = '#ffd23e';                                        // altın topuz
  ctx.beginPath(); ctx.arc(fx, poleTop - 2, 3, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff0a8'; ctx.fillRect(fx - 1, poleTop - 4, 1, 1);
  const fw = flagTex.width, fh = flagTex.height;
  for (let i = 0; i < fw; i++) {
    const k = i / fw;
    const wob = Math.sin(t * 4.4 + i * 0.38) * k * 3.2;
    const dy = poleTop + 2 + wob;
    ctx.drawImage(flagTex, i, 0, 1, fh, fx + 2 + i, dy, 1, fh);
    const sh = Math.sin(t * 4.4 + i * 0.38 + 1.3) * k;
    if (sh > 0.01) {
      ctx.globalAlpha = sh * 0.15;
      ctx.fillStyle = '#000';
      ctx.fillRect(fx + 2 + i, dy, 1, fh);
      ctx.globalAlpha = 1;
    }
  }

  // kelebekler — otlak üstünde süzülüp kanat çırpan 3 kelebek
  const bf = ['#fff4d8', '#ffd23e', '#c894e8'];
  for (let i = 0; i < 3; i++) {
    const bx = P.x + 70 + (Math.sin(t * 0.19 + i * 2.4) * .5 + .5) * (P.w - 140)
             + Math.sin(t * 1.1 + i * 5) * 16;
    const by = P.y + 150 + (Math.sin(t * 0.27 + i * 1.9) * .5 + .5) * (P.h - 320)
             + Math.sin(t * 2.3 + i * 3) * 10;
    const open = Math.abs(Math.sin(t * 14 + i * 6)); // kanat açıklığı
    ctx.save(); ctx.translate(bx, by);
    ctx.fillStyle = bf[i];
    ctx.beginPath(); ctx.ellipse(-3, 0, 2 + open * 3, 3.5, -.5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3, 0, 2 + open * 3, 3.5, .5, 0, 7); ctx.fill();
    ctx.fillStyle = '#4a3828'; ctx.fillRect(-1, -3, 2, 6); // gövde
    ctx.restore();
  }

  // kuş — ara sıra üstten süzülen siluet (yaklaşık 26 sn'de bir geçiş)
  const bp = (t % 26) / 26;
  if (bp < 0.45) {
    const bx = -40 + bp * 2.4 * (L.W + 80);
    const by = 78 + Math.sin(bp * 16) * 14;
    const wob = Math.sin(t * 10) * 5;
    ctx.strokeStyle = 'rgba(40,30,45,.55)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - 8, by - wob); ctx.lineTo(bx, by + 2); ctx.lineTo(bx + 8, by - wob);
    ctx.stroke();
  }

  // altın kelebek — parlak, tıklanabilir ödül ziyaretçisi
  if (S.butterfly) {
    const b = S.butterfly;
    const open = Math.abs(Math.sin(b.t * 16));
    ctx.save(); ctx.translate(b.x, b.y);
    // altın parlama halesi
    ctx.globalAlpha = 0.25 + Math.sin(t * 5) * 0.08;
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.ellipse(-4, 0, 2.5 + open * 4, 4.5, -.5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, 0, 2.5 + open * 4, 4.5, .5, 0, 7); ctx.fill();
    ctx.fillStyle = '#6a4a18'; ctx.fillRect(-1, -4, 2, 8);
    ctx.restore();
  }

  // yaz yağmuru — hafif karartma + eğik yağmur çizgileri + yerde sıçrama
  if (S.rain) {
    ctx.fillStyle = 'rgba(16,22,44,.14)';
    ctx.fillRect(0, 0, L.FX, L.H);
    ctx.strokeStyle = 'rgba(170,195,235,.42)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 90; i++) {
      const rx = ((i * 97 + t * 640) % (L.FX + 60)) - 30;
      const ry = ((i * 131 + t * 560) % (L.H + 30)) - 15;
      ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 11);
    }
    ctx.stroke();
    // zeminde sıçrama halkaları
    for (let i = 0; i < 12; i++) {
      const sx = P.x + ((i * 179 + t * 60) % P.w);
      const sp = (t * 2.6 + i * .63) % 1;
      ctx.strokeStyle = 'rgb(185,205,245)'; ctx.globalAlpha = 0.4 * (1 - sp);
      ctx.beginPath(); ctx.ellipse(sx, P.y + P.h - 8 - (i % 3) * 10, 2 + sp * 8, 1 + sp * 2.5, 0, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // küçük durum yazısı — yağmur suyu kaynak tasarrufu sağlar
    ctx.font = 'bold 10px "Courier New",monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(10,16,34,.55)'; ctx.fillRect(P.x + 8, L.HUD_H + 8, 118, 17);
    ctx.fillStyle = '#9fc3f0'; ctx.fillText('YAĞMUR · kaynak -%25', P.x + 13, L.HUD_H + 20);
  }
}
