/* Fursat — Cart logic (localStorage) */
const CART_KEY = 'fursat_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.variantId === product.variantId);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  saveCart(cart);
  showToast(`${product.title} added to cart`);
}
function removeFromCart(variantId) {
  saveCart(getCart().filter(i => i.variantId !== variantId));
}
function updateQty(variantId, qty) {
  const cart = getCart();
  const item = cart.find(i => i.variantId === variantId);
  if (item) { item.qty = qty; if (item.qty < 1) return removeFromCart(variantId); }
  saveCart(cart);
}
function cartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}
function cartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}
function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = cartCount();
    el.style.display = cartCount() > 0 ? 'inline-flex' : 'none';
  });
}
function showToast(msg) {
  let t = document.getElementById('cart-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'cart-toast';
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1A1814;color:#F5F0E6;padding:12px 24px;font-size:0.82rem;letter-spacing:0.06em;z-index:9999;transition:opacity 0.4s;border-radius:2px;';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.style.opacity = '0', 2500);
}
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  // Header scroll
  const header = document.getElementById('site-header');
  if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  // Hamburger
  const ham = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (ham && menu) ham.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    ham.classList.toggle('open', open);
    menu.style.display = open ? 'flex' : 'none';
    ham.setAttribute('aria-expanded', open);
  });
  // Cart btn — resolve against base tag so it works on any host/subdirectory
  document.getElementById('cart-btn')?.addEventListener('click', () => {
    const a = document.createElement('a'); a.href = 'cart.html';
    window.location.href = a.href;
  });
});
