/**
 * ============================================================================
 * Airavat Enterprises — Products Storefront & Quick View Module (products.js)
 * ============================================================================
 */

let currentFilterCategory = 'all';
let currentSearchQuery = '';

function renderStorefrontProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (!productsDB || Object.keys(productsDB).length === 0) {
        productsDB = { ...DEFAULT_PRODUCTS };
    }

    let html = '';

    Object.values(productsDB).forEach(p => {
        const finalPrice = getFinalPrice(p);
        const hasDiscount = p.discountPct > 0;

        html += `
            <div class="product-card" data-category="${p.category}" data-id="${p.id}" data-name="${p.name}">
                <div class="product-img-box" onclick="openQuickView('${p.id}')">
                    <img src="${p.img}" alt="${p.name}" class="product-img" onerror="this.src='assets/dairy/milk.jpg'">
                    ${p.tag ? `<span class="product-tag tag-blue">${p.tag}</span>` : ''}
                    ${hasDiscount ? `<span class="discount-pill-tag">${p.discountPct}% OFF</span>` : ''}
                    <button class="quick-view-btn">Quick View</button>
                </div>
                <div class="product-content">
                    <div class="product-header">
                        <h3 class="product-name" onclick="openQuickView('${p.id}')">${p.name}</h3>
                        <span class="product-size">${p.size}</span>
                    </div>
                    <p class="product-desc">${p.desc}</p>
                    <div class="product-footer">
                        <div class="product-price-wrapper">
                            ${hasDiscount ? `<span class="price-original-struck">₹${p.originalPrice}</span>` : ''}
                            <div class="product-price">
                                <span class="price-currency">₹</span>
                                <span class="price-value">${finalPrice}</span>
                            </div>
                        </div>
                        <button class="btn btn-outline add-cart-btn" data-id="${p.id}" onclick="addToCart('${p.id}', 1)">
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
    renderFilteredProducts();
}

function initProductFiltersAndSearch() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('product-search');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilterCategory = btn.getAttribute('data-category') || 'all';
            renderFilteredProducts();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.toLowerCase().trim();
            renderFilteredProducts();
        });
    }
}

function filterByCategory(category) {
    currentFilterCategory = category;
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(b => {
        if (b.getAttribute('data-category') === category) b.classList.add('active');
        else b.classList.remove('active');
    });
    renderFilteredProducts();
}

function renderFilteredProducts() {
    const cards = document.querySelectorAll('#products-grid .product-card');
    const noResults = document.getElementById('no-products-found');
    let visibleCount = 0;

    cards.forEach(card => {
        const id = card.getAttribute('data-id');
        const p = productsDB[id];

        if (!p) return;

        const category = p.category;
        const name = p.name.toLowerCase();

        const matchesCategory = (currentFilterCategory === 'all' || category === currentFilterCategory);
        const matchesSearch = (!currentSearchQuery || name.includes(currentSearchQuery));

        if (matchesCategory && matchesSearch) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    if (noResults) {
        if (visibleCount === 0) noResults.classList.remove('hidden');
        else noResults.classList.add('hidden');
    }
}

function openQuickView(productId) {
    const product = productsDB[productId];
    if (!product) return;

    const overlay = document.getElementById('quick-view-overlay');
    const content = document.getElementById('quick-view-content');

    if (!overlay || !content) return;

    const finalPrice = getFinalPrice(product);
    const hasDiscount = product.discountPct > 0;

    content.innerHTML = `
        <div class="quick-view-grid">
            <div>
                <img src="${product.img}" alt="${product.name}" class="modal-img" onerror="this.src='assets/dairy/milk.jpg'">
            </div>
            <div>
                <h2 class="modal-title">${product.name}</h2>
                <div class="modal-price-size">
                    ${hasDiscount ? `<span class="price-original-struck">₹${product.originalPrice}</span>` : ''}
                    <span class="modal-price">₹${finalPrice}</span>
                    <span class="product-size">${product.size}</span>
                    ${hasDiscount ? `<span class="discount-pill-tag" style="position:static;">${product.discountPct}% OFF</span>` : ''}
                </div>
                <p class="modal-desc">${product.desc}</p>
                
                <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem;">Nutritional Value (per 100g/ml):</h4>
                <table class="nutrition-table">
                    <tr><th>Protein</th><td>${product.nutrition?.protein || '3.0g'}</td></tr>
                    <tr><th>Calcium</th><td>${product.nutrition?.calcium || '120mg'}</td></tr>
                    <tr><th>Fat</th><td>${product.nutrition?.fat || '4.0g'}</td></tr>
                    <tr><th>Energy</th><td>${product.nutrition?.energy || '70 kcal'}</td></tr>
                </table>

                <button class="btn btn-primary btn-block" onclick="addToCart('${product.id}', 1); closeQuickView();">
                    Add to Cart (₹${finalPrice})
                </button>
            </div>
        </div>
    `;

    overlay.classList.add('active');
}

function closeQuickView() {
    document.getElementById('quick-view-overlay')?.classList.remove('active');
}
