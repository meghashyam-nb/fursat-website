/* Fursat — Cart logic + global UI enhancements */
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
  showToast(`${product.title} added to bag`);
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
    const n = cartCount();
    el.textContent = n;
    el.style.display = n > 0 ? 'inline-flex' : 'none';
  });
}

/* ── TOAST ── */
function showToast(msg) {
  let t = document.getElementById('cart-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'cart-toast';
    t.style.cssText = [
      'position:fixed', 'bottom:90px', 'left:50%', 'transform:translateX(-50%)',
      'background:#1A1814', 'color:#F5F0E6', 'padding:13px 28px',
      'font-size:0.82rem', 'letter-spacing:0.06em', 'z-index:9999',
      'opacity:0', 'transition:opacity 0.3s', 'border-radius:2px',
      'white-space:nowrap', 'pointer-events:none', 'max-width:90vw', 'text-align:center'
    ].join(';');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.style.opacity = '0', 2800);
}

/* ── BACK TO TOP ── */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
  btn.style.cssText = [
    'position:fixed', 'bottom:90px', 'right:28px', 'z-index:700',
    'width:42px', 'height:42px', 'border-radius:50%',
    'background:#1A1814', 'color:#F5F0E6',
    'border:none', 'cursor:pointer',
    'display:flex', 'align-items:center', 'justify-content:center',
    'opacity:0', 'transform:translateY(10px)',
    'transition:opacity 0.3s, transform 0.3s',
    'box-shadow:0 2px 12px rgba(0,0,0,0.2)'
  ].join(';');
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    btn.style.opacity = show ? '1' : '0';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── IMAGE FADE-IN ON LOAD ── */
function initImageFade() {
  const style = document.createElement('style');
  style.textContent = `
    img.lazy-img { opacity:0; transition:opacity 0.4s; }
    img.lazy-img.loaded { opacity:1; }
  `;
  document.head.appendChild(style);
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.classList.add('lazy-img');
    if (img.complete && img.naturalWidth) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });
}

/* ── MOBILE SWIPE for product gallery ── */
function initGallerySwipe() {
  const mainImg = document.getElementById('main-img');
  const thumbs = document.querySelectorAll('.thumb');
  if (!mainImg || !thumbs.length) return;

  let startX = 0;
  let currentThumb = 0;

  mainImg.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  mainImg.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 40) return;
    if (dx < 0 && currentThumb < thumbs.length - 1) currentThumb++;
    else if (dx > 0 && currentThumb > 0) currentThumb--;
    thumbs[currentThumb].click();
  }, { passive: true });

  thumbs.forEach((th, i) => th.addEventListener('click', () => { currentThumb = i; }));
}

/* ── STICKY ADD-TO-CART on mobile product pages ── */
function initStickyCart() {
  const addBtn = document.querySelector('.add-to-cart-btn');
  if (!addBtn) return;

  const bar = document.createElement('div');
  bar.id = 'sticky-atc';
  bar.style.cssText = [
    'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:690',
    'background:#1A1814', 'padding:14px 20px',
    'display:none', 'gap:12px', 'align-items:center',
    'box-shadow:0 -4px 20px rgba(0,0,0,0.15)'
  ].join(';');

  const title = document.querySelector('.product-title');
  const price = document.querySelector('.product-price');
  bar.innerHTML = `
    <div style="flex:1;min-width:0;">
      <div style="font-family:calluna,Georgia,serif;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#F5F0E6">${title ? title.textContent : ''}</div>
      <div style="font-size:.82rem;color:rgba(245,240,230,.65);margin-top:2px">${price ? price.textContent : ''}</div>
    </div>
    <button id="sticky-atc-btn" style="flex-shrink:0;padding:12px 24px;background:#F5F0E6;color:#1A1814;border:none;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;cursor:pointer;white-space:nowrap">Add to Bag</button>
  `;
  document.body.appendChild(bar);

  document.getElementById('sticky-atc-btn').addEventListener('click', () => {
    addBtn.click();
  });

  const observer = new IntersectionObserver(([entry]) => {
    bar.style.display = entry.isIntersecting ? 'none' : 'flex';
  }, { threshold: 0.1 });
  observer.observe(addBtn);

  // Nudge WhatsApp FAB up so it doesn't overlap
  const fab = document.querySelector('.wa-fab');
  if (fab) fab.style.bottom = '76px';
}

/* ── NEWSLETTER FORM ── */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value || '';
    const msg = encodeURIComponent(`Hi Fursat! I'd like to subscribe to your newsletter. My email: ${email}`);
    window.open(`https://wa.me/919739283637?text=${msg}`, '_blank');
    showToast('Thank you! We\'ll be in touch soon.');
    form.reset();
  });
}

/* ── CART BUTTON ── */
function initCartButton() {
  document.getElementById('cart-btn')?.addEventListener('click', () => {
    // If the page has a cart drawer (homepage), open it; else navigate
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
      drawer.classList.toggle('open');
      document.getElementById('cart-overlay')?.classList.toggle('open');
      renderCartDrawer();
    } else {
      const a = document.createElement('a');
      a.href = 'cart.html';
      window.location.href = a.href;
    }
  });
}

/* ── CART DRAWER RENDER (homepage) ── */
function renderCartDrawer() {
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  if (!body) return;
  const cart = getCart();
  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="48" height="48"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><p>Your bag is empty.<br>Add something beautiful.</p></div>`;
    if (footer) footer.style.display = 'none';
    return;
  }
  body.innerHTML = cart.map(item => `
    <div class="cart-item" style="display:flex;gap:16px;padding:20px 0;border-bottom:1px solid rgba(245,240,230,.1)">
      <img src="${item.image}" alt="${item.title}" style="width:72px;height:90px;object-fit:cover;flex-shrink:0" loading="lazy">
      <div style="flex:1;min-width:0">
        <p style="font-size:.88rem;margin-bottom:4px;color:#F5F0E6">${item.title}</p>
        <p style="font-size:.78rem;color:rgba(245,240,230,.5);margin-bottom:10px">${item.size ? 'Size: ' + item.size : ''}</p>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:10px">
            <button onclick="updateQty('${item.variantId}', ${item.qty - 1}); renderCartDrawer()" style="background:none;border:1px solid rgba(245,240,230,.2);color:#F5F0E6;width:26px;height:26px;cursor:pointer">−</button>
            <span style="color:#F5F0E6;font-size:.85rem">${item.qty}</span>
            <button onclick="updateQty('${item.variantId}', ${item.qty + 1}); renderCartDrawer()" style="background:none;border:1px solid rgba(245,240,230,.2);color:#F5F0E6;width:26px;height:26px;cursor:pointer">+</button>
          </div>
          <span style="color:#F5F0E6;font-size:.9rem;font-weight:600">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  `).join('');
  if (footer) {
    footer.style.display = 'block';
    const tot = cartTotal();
    const ship = tot >= 3000 ? 0 : 150;
    document.getElementById('cart-total-price').textContent = `₹${(tot + ship).toLocaleString('en-IN')}`;
  }
}

/* ── MAIN INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  // Header scroll
  const header = document.getElementById('site-header');
  if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

  // Hamburger
  const ham = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (ham && menu) {
    ham.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      ham.classList.toggle('open', open);
      menu.style.display = open ? 'flex' : 'none';
      document.body.style.overflow = open ? 'hidden' : '';
      ham.setAttribute('aria-expanded', open);
    });
  }

  // Cart overlay close (homepage drawer)
  document.getElementById('cart-close')?.addEventListener('click', () => {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
  });
  document.getElementById('cart-overlay')?.addEventListener('click', () => {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
  });

  initCartButton();
  initNewsletter();
  initBackToTop();
  initImageFade();
  initGallerySwipe();
  initStickyCart();
});
