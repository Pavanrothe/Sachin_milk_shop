/**
 * ============================================================================
 * Airavat Enterprises — Shopping Cart Drawer Module (cart.js)
 * ============================================================================
 */

let cartState = {};

function initCartDrawerSystem() {
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');

    if (!openCartBtn || !cartDrawer || !cartOverlay) return;

    openCartBtn.addEventListener('click', openCartDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);
}

function openCartDrawer() {
    document.getElementById('cart-drawer')?.classList.add('active');
    document.getElementById('cart-overlay')?.classList.add('active');
}

function closeCartDrawer() {
    document.getElementById('cart-drawer')?.classList.remove('active');
    document.getElementById('cart-overlay')?.classList.remove('active');
}

function addToCart(productId, quantity = 1) {
    const product = productsDB[productId];
    if (!product) return;

    if (cartState[productId]) {
        cartState[productId] += quantity;
    } else {
        cartState[productId] = quantity;
    }

    updateCartUI();
    showToast(`Added ${product.name} (${quantity}) to cart!`);

    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.classList.add('pulse');
        setTimeout(() => badge.classList.remove('pulse'), 300);
    }
}

function updateCartQuantity(productId, delta) {
    if (!cartState[productId]) return;

    cartState[productId] += delta;
    if (cartState[productId] <= 0) {
        delete cartState[productId];
    }
    updateCartUI();
}

function removeFromCart(productId) {
    delete cartState[productId];
    updateCartUI();
    showToast(`Item removed from cart`);
}

function clearFullCart() {
    cartState = {};
    updateCartUI();
    showToast('Cart cleared');
}

function updateCartUI() {
    const totalItems = Object.values(cartState).reduce((acc, qty) => acc + qty, 0);

    const badgeNav = document.getElementById('cart-count');
    const badgeDrawer = document.getElementById('drawer-cart-count');
    if (badgeNav) badgeNav.textContent = totalItems;
    if (badgeDrawer) badgeDrawer.textContent = `${totalItems} items`;

    const emptyState = document.getElementById('empty-cart-state');
    const cartList = document.getElementById('cart-items-list');
    const cartFooter = document.getElementById('cart-summary-footer');

    if (totalItems === 0) {
        emptyState?.classList.remove('hidden');
        cartList?.classList.add('hidden');
        cartFooter?.classList.add('hidden');
        return;
    }

    emptyState?.classList.add('hidden');
    cartList?.classList.remove('hidden');
    cartFooter?.classList.remove('hidden');

    let listHTML = '';
    let subtotal = 0;

    Object.keys(cartState).forEach(id => {
        const item = productsDB[id];
        if (!item) return;

        const qty = cartState[id];
        const finalPrice = getFinalPrice(item);
        const itemTotal = finalPrice * qty;
        subtotal += itemTotal;

        listHTML += `
            <div class="cart-item-row">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <span class="cart-item-price">₹${finalPrice} / ${item.size}</span>
                </div>
                <div class="cart-qty-ctrl">
                    <button class="qty-btn" onclick="updateCartQuantity('${id}', -1)">-</button>
                    <span class="qty-num">${qty}</span>
                    <button class="qty-btn" onclick="updateCartQuantity('${id}', 1)">+</button>
                </div>
                <button class="btn-text-danger" onclick="removeFromCart('${id}')" title="Remove">✕</button>
            </div>
        `;
    });

    if (cartList) cartList.innerHTML = listHTML;

    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (totalEl) totalEl.textContent = `₹${subtotal}`;
}

function proceedToCheckoutFromCart() {
    closeCartDrawer();
    const productSelect = document.getElementById('product-select');
    if (productSelect) productSelect.value = 'cart';
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
}
