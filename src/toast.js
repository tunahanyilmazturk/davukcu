// Ekranın üstünde beliren kısa bildirim (toast)
let toastT = null;
export function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  clearTimeout(toastT);
  toastT = setTimeout(() => t.textContent = '', 5000);
}
