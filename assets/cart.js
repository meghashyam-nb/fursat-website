/* Fursat — Cart + Global UI */
const CART_KEY      = 'fursat_cart';
const WISHLIST_KEY  = 'fursat_wishlist';
const FREE_SHIP_MIN = 3000;
const SHIP_FEE      = 150;

/* ─── CART ─────────────────────────────────── */
function getCart()  { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartCount(); }

function addToCart(product) {
  const cart = getCart();
  const ex = cart.find(i => i.variantId === product.variantId);
  if (ex) ex.qty++; else cart.push({ ...product, qty: 1 });
  saveCart(cart);
  showToast(`${product.title} added to bag`);
  updateShippingBar();
}
function removeFromCart(id)      { saveCart(getCart().filter(i => i.variantId !== id)); updateShippingBar(); }
function updateQty(id, qty)      {
  const cart = getCart(), item = cart.find(i => i.variantId === id);
  if (item) { item.qty = qty; if (item.qty < 1) return removeFromCart(id); }
  saveCart(cart); updateShippingBar();
}
function cartTotal()  { return getCart().reduce((s,i) => s + i.price * i.qty, 0); }
function cartCount()  { return getCart().reduce((s,i) => s + i.qty, 0); }
function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach(el => {
    const n = cartCount(); el.textContent = n;
    el.style.display = n > 0 ? 'inline-flex' : 'none';
  });
}

/* ─── WISHLIST ──────────────────────────────── */
function getWishlist()  { try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; } catch { return []; } }
function toggleWishlist(handle, btn) {
  let wl = getWishlist();
  const i = wl.indexOf(handle);
  if (i > -1) { wl.splice(i,1); showToast('Removed from wishlist'); }
  else        { wl.push(handle); showToast('Saved to wishlist ♡'); }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wl));
  if (btn) btn.classList.toggle('active', wl.includes(handle));
}
function isWishlisted(handle) { return getWishlist().includes(handle); }

/* ─── TOAST ─────────────────────────────────── */
function showToast(msg) {
  let t = document.getElementById('cart-toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'cart-toast';
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1A1814;color:#F5F0E6;padding:13px 28px;font-size:.82rem;letter-spacing:.06em;z-index:9999;opacity:0;transition:opacity .3s;border-radius:2px;white-space:nowrap;pointer-events:none;max-width:90vw;text-align:center';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._tid); t._tid = setTimeout(() => t.style.opacity = '0', 2800);
}

/* ─── FREE SHIPPING BAR ─────────────────────── */
function updateShippingBar() {
  const bar = document.getElementById('ship-progress');
  const msg = document.getElementById('ship-msg');
  if (!bar) return;
  const tot = cartTotal();
  const pct = Math.min(100, (tot / FREE_SHIP_MIN) * 100);
  bar.style.width = pct + '%';
  if (tot >= FREE_SHIP_MIN) {
    msg.textContent = '🎉 You have free shipping!';
    msg.style.color = '#5A5E3A';
  } else {
    const left = (FREE_SHIP_MIN - tot).toLocaleString('en-IN');
    msg.textContent = `Add ₹${left} more for free shipping`;
    msg.style.color = 'rgba(245,240,230,.55)';
  }
}

/* ─── BACK TO TOP ───────────────────────────── */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top'; btn.setAttribute('aria-label','Back to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
  btn.style.cssText = 'position:fixed;bottom:90px;right:28px;z-index:700;width:42px;height:42px;border-radius:50%;background:#1A1814;color:#F5F0E6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transform:translateY(10px);transition:opacity .3s,transform .3s;box-shadow:0 2px 12px rgba(0,0,0,.2)';
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    btn.style.opacity = show ? '1' : '0';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  }, { passive:true });
  btn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

/* ─── IMAGE FADE IN ─────────────────────────── */
function initImageFade() {
  const s = document.createElement('style');
  s.textContent = 'img.lazy-img{opacity:0;transition:opacity .4s}img.lazy-img.loaded{opacity:1}';
  document.head.appendChild(s);
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.classList.add('lazy-img');
    if (img.complete && img.naturalWidth) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'));
  });
}

/* ─── MOBILE SWIPE (product gallery) ───────── */
function initGallerySwipe() {
  const mainImg = document.getElementById('main-img');
  const thumbs  = document.querySelectorAll('.thumb');
  if (!mainImg || !thumbs.length) return;
  let startX = 0, cur = 0;
  mainImg.style.cursor = 'grab';
  mainImg.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive:true });
  mainImg.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 40) return;
    cur = dx < 0 ? Math.min(cur + 1, thumbs.length - 1) : Math.max(cur - 1, 0);
    thumbs[cur].click();
  }, { passive:true });
  thumbs.forEach((th, i) => th.addEventListener('click', () => { cur = i; }));
}

/* ─── IMAGE ZOOM (desktop hover) ───────────── */
function initImageZoom() {
  const mainImg = document.getElementById('main-img');
  if (!mainImg || window.matchMedia('(hover:none)').matches) return;
  const wrap = mainImg.closest('.gallery-main') || mainImg.parentElement;
  wrap.style.overflow = 'hidden';
  mainImg.style.transition = 'transform .4s cubic-bezier(.25,.46,.45,.94)';
  wrap.addEventListener('mouseenter', () => { mainImg.style.transform = 'scale(1.08)'; });
  wrap.addEventListener('mouseleave', () => { mainImg.style.transform = 'scale(1)'; });
  wrap.addEventListener('mousemove',  e => {
    const r = wrap.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - .5) * 8;
    const y = ((e.clientY - r.top)  / r.height - .5) * 8;
    mainImg.style.transformOrigin = `${50 + x}% ${50 + y}%`;
  });
}

/* ─── STICKY ADD-TO-CART (mobile) ──────────── */
function initStickyCart() {
  const addBtn = document.querySelector('.add-to-cart-btn');
  if (!addBtn) return;
  const bar = document.createElement('div'); bar.id = 'sticky-atc';
  const title = document.querySelector('.product-title');
  const price = document.querySelector('.product-price');
  bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:690;background:#1A1814;padding:14px 20px;display:none;gap:12px;align-items:center;box-shadow:0 -4px 20px rgba(0,0,0,.15)';
  bar.innerHTML = `<div style="flex:1;min-width:0"><div style="font-family:calluna,Georgia,serif;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#F5F0E6">${title?.textContent||''}</div><div style="font-size:.8rem;color:rgba(245,240,230,.6);margin-top:2px">${price?.textContent||''}</div></div><button id="sticky-atc-btn" style="flex-shrink:0;padding:12px 24px;background:#F5F0E6;color:#1A1814;border:none;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;cursor:pointer">Add to Bag</button>`;
  document.body.appendChild(bar);
  document.getElementById('sticky-atc-btn').addEventListener('click', () => addBtn.click());
  const obs = new IntersectionObserver(([e]) => { bar.style.display = e.isIntersecting ? 'none' : 'flex'; }, { threshold:.1 });
  obs.observe(addBtn);
  const fab = document.querySelector('.wa-fab');
  if (fab) fab.style.bottom = '76px';
}

/* ─── WISHLIST BUTTON (product pages) ──────── */
function initWishlistBtn() {
  const handle = window.PRODUCT_HANDLE;
  const btn = document.getElementById('wishlist-btn');
  if (!btn || !handle) return;
  btn.classList.toggle('active', isWishlisted(handle));
  btn.addEventListener('click', () => toggleWishlist(handle, btn));
}

/* ─── SHARE BUTTON ──────────────────────────── */
function initShareBtn() {
  const btn = document.getElementById('share-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const url  = window.location.href;
    const text = `Check out ${document.title} on Fursat`;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, text, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); showToast('Link copied!'); } catch { showToast('Copy this URL: ' + url); }
    }
  });
}

/* ─── RELATED PRODUCTS ──────────────────────── */
function initRelatedProducts() {
  const sec = document.getElementById('related-products');
  if (!sec || !window.FURSAT_CATALOG) return;
  const current = window.PRODUCT_HANDLE;
  const base = (document.querySelector('base')?.getAttribute('href') || '/').replace(/\/$/, '');
  const others = window.FURSAT_CATALOG.filter(p => p.handle !== current);
  // Shuffle and take 4
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const picks = others.slice(0, 4);
  sec.innerHTML = `
    <div style="padding:60px 0;border-top:1px solid #DDD5C4">
      <p style="font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#8A7F70;margin-bottom:14px">You may also like</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">
        ${picks.map(p => `
          <a href="${base}/products/${p.handle}.html" style="text-decoration:none;color:inherit">
            <div style="overflow:hidden;background:#EDE5D8;aspect-ratio:3/4;margin-bottom:12px">
              <img src="${base}/${p.img}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform .6s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            </div>
            <p style="font-size:.9rem;font-weight:500;margin-bottom:4px">${p.title}</p>
            <p style="font-size:.82rem;color:#8A7F70">₹${p.price.toLocaleString('en-IN')}</p>
          </a>
        `).join('')}
      </div>
    </div>
    <style>@media(max-width:640px){#related-products [style*="grid-template-columns:repeat(4"]{grid-template-columns:repeat(2,1fr)!important}}</style>
  `;
}

/* ─── SIZE GUIDE MODAL ──────────────────────── */
function initSizeModal() {
  const trigger = document.getElementById('size-guide-trigger');
  if (!trigger) return;
  const base = (document.querySelector('base')?.getAttribute('href') || '/').replace(/\/$/, '');
  const modal = document.createElement('div'); modal.id = 'size-modal';
  modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:1000;background:rgba(26,24,20,.7);align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:#F5F0E6;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;position:relative;border-radius:2px">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #DDD5C4">
        <h3 style="font-family:calluna,Georgia,serif;font-size:1.2rem;font-weight:400">Size Guide</h3>
        <button id="size-modal-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#1A1814;line-height:1">×</button>
      </div>
      <div style="padding:24px">
        <img src="${base}/assets/Women_Size_Chart.jpg" alt="Women's size chart" style="width:100%;border-radius:2px;margin-bottom:16px" loading="lazy">
        <img src="${base}/assets/Mens_Shirt.jpg" alt="Men's shirt size chart" style="width:100%;border-radius:2px;margin-bottom:16px" loading="lazy">
        <img src="${base}/assets/Mens_Pant.jpg" alt="Men's pant size chart" style="width:100%;border-radius:2px" loading="lazy">
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  trigger.addEventListener('click', e => { e.preventDefault(); modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; });
  document.getElementById('size-modal-close').addEventListener('click', () => { modal.style.display = 'none'; document.body.style.overflow = ''; });
  modal.addEventListener('click', e => { if (e.target === modal) { modal.style.display = 'none'; document.body.style.overflow = ''; } });
}

/* ─── COLLECTION SORT/FILTER ────────────────── */
function initCollectionSort() {
  const grid = document.querySelector('.products-grid');
  const controls = document.getElementById('collection-controls');
  if (!grid || !controls) return;

  const cards = [...grid.querySelectorAll('.product-card, article')];
  cards.forEach(card => {
    const priceEl = card.querySelector('.card-price, .product-price');
    const priceText = priceEl ? priceEl.textContent.replace(/[^\d]/g, '') : '0';
    card.dataset.price = priceText;
  });

  controls.addEventListener('change', e => {
    if (e.target.id !== 'sort-select') return;
    const sorted = [...cards].sort((a, b) => {
      const v = e.target.value;
      if (v === 'price-asc')  return +a.dataset.price - +b.dataset.price;
      if (v === 'price-desc') return +b.dataset.price - +a.dataset.price;
      return 0;
    });
    sorted.forEach(c => grid.appendChild(c));
  });
}

/* ─── NEWSLETTER ────────────────────────────── */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value || '';
    window.open(`https://wa.me/919739283637?text=${encodeURIComponent('Hi Fursat! Please subscribe me to your newsletter. My email: ' + email)}`, '_blank');
    showToast('Thank you! We\'ll be in touch soon.');
    form.reset();
  });
}

/* ─── CART BUTTON ───────────────────────────── */
function initCartButton() {
  document.querySelectorAll('#cart-btn, .cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const drawer = document.getElementById('cart-drawer');
      if (drawer) { drawer.classList.toggle('open'); document.getElementById('cart-overlay')?.classList.toggle('open'); renderCartDrawer(); }
      else { const a = document.createElement('a'); a.href = 'cart.html'; window.location.href = a.href; }
    });
  });
}

/* ─── CART DRAWER ───────────────────────────── */
function renderCartDrawer() {
  const body   = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  if (!body) return;
  const cart = getCart();
  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="52" height="52"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><p>Your bag is empty.<br>Add something beautiful.</p></div>`;
    if (footer) footer.style.display = 'none'; return;
  }
  body.innerHTML = cart.map(item => `
    <div style="display:flex;gap:16px;padding:20px 0;border-bottom:1px solid rgba(245,240,230,.1)">
      <img src="${item.image||''}" alt="${item.title}" style="width:72px;height:90px;object-fit:cover;flex-shrink:0" loading="lazy">
      <div style="flex:1;min-width:0">
        <p style="font-size:.88rem;margin-bottom:4px;color:#F5F0E6">${item.title}</p>
        ${item.size ? `<p style="font-size:.75rem;color:rgba(245,240,230,.45);margin-bottom:8px">Size: ${item.size}</p>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
          <div style="display:flex;align-items:center;gap:10px">
            <button onclick="updateQty('${item.variantId}',${item.qty-1});renderCartDrawer()" style="background:none;border:1px solid rgba(245,240,230,.2);color:#F5F0E6;width:28px;height:28px;cursor:pointer;font-size:1rem">−</button>
            <span style="color:#F5F0E6;font-size:.85rem;min-width:16px;text-align:center">${item.qty}</span>
            <button onclick="updateQty('${item.variantId}',${item.qty+1});renderCartDrawer()" style="background:none;border:1px solid rgba(245,240,230,.2);color:#F5F0E6;width:28px;height:28px;cursor:pointer;font-size:1rem">+</button>
          </div>
          <span style="color:#F5F0E6;font-size:.9rem;font-weight:600">₹${(item.price*item.qty).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>`).join('');
  if (footer) {
    footer.style.display = 'block';
    const tot = cartTotal(), ship = tot >= FREE_SHIP_MIN ? 0 : SHIP_FEE;
    document.getElementById('cart-total-price').textContent = `₹${(tot+ship).toLocaleString('en-IN')}`;
  }
  updateShippingBar();
}

/* ─── MAIN ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  const header = document.getElementById('site-header');
  if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40), { passive:true });

  const ham = document.getElementById('hamburger'), menu = document.getElementById('mobile-menu');
  if (ham && menu) ham.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    ham.classList.toggle('open', open);
    menu.style.display = open ? 'flex' : 'none';
    document.body.style.overflow = open ? 'hidden' : '';
    ham.setAttribute('aria-expanded', open);
  });

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
  initImageZoom();
  initStickyCart();
  initWishlistBtn();
  initShareBtn();
  initRelatedProducts();
  initSizeModal();
  initCollectionSort();
});
