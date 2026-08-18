/**
 * ============================================================================
 * Airavat Enterprises — Strictly Shopowner Operations Module (owner.js)
 * Includes: Physical Device File Upload (FileReader Base64 Data URL)
 * ============================================================================
 */

let isOwnerLoggedIn = false;
let uploadedDeviceImageDataUrl = '';
let uploadedEditDeviceImageDataUrl = '';

function openOwnerPortal() {
    if (isOwnerLoggedIn) {
        const ownerSec = document.getElementById('owner-dashboard');
        if (ownerSec) {
            ownerSec.classList.remove('hidden');
            renderAdminDashboardData();
            ownerSec.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        document.getElementById('owner-login-overlay')?.classList.add('active');
    }
}

function closeOwnerLoginModal() {
    document.getElementById('owner-login-overlay')?.classList.remove('active');
    document.getElementById('passcode-error')?.classList.remove('active');
}

function handleOwnerLogin(e) {
    e.preventDefault();
    const passInput = document.getElementById('owner-passcode');
    const errText = document.getElementById('passcode-error');

    if (!passInput) return;

    if (passInput.value.trim() === 'admin123') {
        isOwnerLoggedIn = true;
        localStorage.setItem('airavat_owner_logged_in', 'true');
        closeOwnerLoginModal();
        passInput.value = '';

        const ownerSec = document.getElementById('owner-dashboard');
        if (ownerSec) {
            ownerSec.classList.remove('hidden');
            renderAdminDashboardData();
            ownerSec.scrollIntoView({ behavior: 'smooth' });
        }

        showToast('🔓 Welcome Back, Shop Owner!');
    } else {
        if (errText) errText.style.display = 'block';
    }
}

function logoutOwner() {
    isOwnerLoggedIn = false;
    localStorage.removeItem('airavat_owner_logged_in');
    document.getElementById('owner-dashboard')?.classList.add('hidden');
    showToast('🔒 Logged out of Owner Portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeOwnerDashboard() {
    document.getElementById('owner-dashboard')?.classList.add('hidden');
}

function switchOwnerTab(tabName) {
    const tabs = document.querySelectorAll('.owner-tab-btn');
    tabs.forEach(t => t.classList.remove('active'));

    const activeBtn = Array.from(tabs).find(t => t.getAttribute('onclick')?.includes(tabName));
    if (activeBtn) activeBtn.classList.add('active');

    ['manage-products', 'add-product', 'manage-orders', 'discounts-promo'].forEach(name => {
        const content = document.getElementById(`tab-${name}`);
        if (content) {
            if (name === tabName) content.classList.remove('hidden');
            else content.classList.add('hidden');
        }
    });
}

function renderAdminDashboardData() {
    const totalRev = ordersDB.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
    const totalOrders = ordersDB.length;
    const totalProducts = Object.keys(productsDB).length;
    const discountedCount = Object.values(productsDB).filter(p => p.discountPct > 0).length;

    const elRev = document.getElementById('admin-total-revenue');
    const elOrd = document.getElementById('admin-total-orders');
    const elProd = document.getElementById('admin-total-products');
    const elDisc = document.getElementById('admin-discounted-count');
    const elBadge = document.getElementById('admin-orders-badge');

    if (elRev) elRev.textContent = `₹${totalRev}`;
    if (elOrd) elOrd.textContent = totalOrders;
    if (elProd) elProd.textContent = totalProducts;
    if (elDisc) elDisc.textContent = discountedCount;
    if (elBadge) elBadge.textContent = ordersDB.filter(o => o.status === 'Pending').length;

    renderAdminProductsTable();
    renderAdminOrdersTable();
}

function renderAdminProductsTable() {
    const tbody = document.getElementById('admin-products-table-body');
    if (!tbody) return;

    let html = '';

    Object.values(productsDB).forEach(p => {
        const finalPrice = getFinalPrice(p);
        html += `
            <tr>
                <td>
                    <div class="admin-p-cell">
                        <img src="${p.img}" alt="${p.name}" class="admin-p-thumb" onerror="this.src='assets/dairy/milk.jpg'">
                        <div>
                            <div>${p.name}</div>
                            <small class="text-muted">${p.size}</small>
                        </div>
                    </div>
                </td>
                <td><span class="product-size">${p.category}</span></td>
                <td>₹${p.originalPrice}</td>
                <td><strong class="text-green">${p.discountPct}% OFF</strong></td>
                <td><strong class="text-blue">₹${finalPrice}</strong></td>
                <td>${p.stock} units</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditProductModal('${p.id}')">✏️ Edit Details</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProductFromStore('${p.id}')">🗑️ Delete</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function renderAdminOrdersTable() {
    const tbody = document.getElementById('admin-orders-table-body');
    if (!tbody) return;

    if (ordersDB.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">No customer orders received yet.</td></tr>`;
        return;
    }

    let html = '';

    ordersDB.forEach(o => {
        let statusClass = 'status-pending';
        if (o.status === 'Processing') statusClass = 'status-processing';
        if (o.status === 'Delivered') statusClass = 'status-delivered';
        if (o.status === 'Cancelled') statusClass = 'status-cancelled';

        const itemsStr = o.items.map(i => `${i.name} (${i.qty})`).join(', ');

        html += `
            <tr>
                <td><strong>${o.id}</strong></td>
                <td><small>${o.date}</small></td>
                <td>
                    <div><strong>${o.name}</strong></div>
                    <small class="text-muted">📞 ${o.phone}</small>
                </td>
                <td><small>${itemsStr}</small></td>
                <td><strong class="text-blue">₹${o.total}</strong></td>
                <td><span class="status-badge ${statusClass}">${o.status}</span></td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
                        <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending ⏳</option>
                        <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing ⚙️</option>
                        <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery 🚚</option>
                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered ✅</option>
                        <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled ❌</option>
                    </select>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function updateOrderStatus(orderId, newStatus) {
    const order = ordersDB.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveOrdersToStorage();
        showToast(`Order ${orderId} status set to ${newStatus}`);
    }
}

/* 📱 PHYSICAL DEVICE FILE UPLOAD HANDLER FOR ADD PRODUCT FORM */
function handleDeviceImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedDeviceImageDataUrl = e.target.result;
        const previewImg = document.getElementById('new-p-img-preview');
        if (previewImg) previewImg.src = uploadedDeviceImageDataUrl;
        showToast('📱 Physical image selected from device!');
    };
    reader.readAsDataURL(file);
}

/* 📱 PHYSICAL DEVICE FILE UPLOAD HANDLER FOR EDIT PRODUCT FORM */
function handleEditDeviceImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedEditDeviceImageDataUrl = e.target.result;
        const imgInput = document.getElementById('edit-p-img');
        if (imgInput) imgInput.value = uploadedEditDeviceImageDataUrl;
        showToast('📱 Device image loaded for edit!');
    };
    reader.readAsDataURL(file);
}

/* Image Preview Listener */
function updateAddProductImagePreview() {
    const urlInput = document.getElementById('new-p-img-url');
    const presetSelect = document.getElementById('new-p-img-preset');
    const previewImg = document.getElementById('new-p-img-preview');

    if (!previewImg) return;

    let src = uploadedDeviceImageDataUrl || 'assets/dairy/milk.jpg';

    if (urlInput && urlInput.value.trim()) {
        src = urlInput.value.trim();
        uploadedDeviceImageDataUrl = ''; // Clear device upload if URL manually entered
    } else if (presetSelect && presetSelect.value) {
        src = presetSelect.value;
        uploadedDeviceImageDataUrl = ''; // Clear device upload if preset selected
    }

    previewImg.src = src;
    previewImg.onerror = () => {
        previewImg.src = 'assets/dairy/milk.jpg';
    };
}

/* TAB 2: Add New Product Logic */
function initAddProductForm() {
    const form = document.getElementById('admin-add-product-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('new-p-name').value.trim();
        const category = document.getElementById('new-p-category').value;
        const price = parseFloat(document.getElementById('new-p-price').value);
        const discount = parseFloat(document.getElementById('new-p-discount').value) || 0;
        const size = document.getElementById('new-p-size').value.trim();
        const stock = parseInt(document.getElementById('new-p-stock').value) || 50;
        const tag = document.getElementById('new-p-tag').value.trim();
        
        const customUrl = document.getElementById('new-p-img-url').value.trim();
        const presetUrl = document.getElementById('new-p-img-preset').value;
        
        const finalImg = uploadedDeviceImageDataUrl || customUrl || presetUrl || 'assets/dairy/milk.jpg';
        const desc = document.getElementById('new-p-desc').value.trim();

        if (!name || !price || !size || !desc) {
            showToast('Please fill all required product fields');
            return;
        }

        const newId = 'p_' + Date.now();

        productsDB[newId] = {
            id: newId,
            name: name,
            originalPrice: price,
            discountPct: discount,
            size: size,
            category: category,
            stock: stock,
            tag: tag,
            img: finalImg,
            desc: desc,
            nutrition: { protein: '3.0g', calcium: '120mg', fat: '4.0g', energy: '70 kcal' }
        };

        saveProductsToStorage();
        form.reset();
        uploadedDeviceImageDataUrl = '';
        updateAddProductImagePreview();
        showToast(`✨ Added "${name}" with your device photo!`);
        switchOwnerTab('manage-products');
    });
}

/* Edit Product Modal */
function openEditProductModal(productId) {
    const p = productsDB[productId];
    if (!p) return;

    uploadedEditDeviceImageDataUrl = '';
    document.getElementById('edit-p-id').value = p.id;
    document.getElementById('edit-p-price').value = p.originalPrice;
    document.getElementById('edit-p-discount').value = p.discountPct;
    document.getElementById('edit-p-stock').value = p.stock;
    document.getElementById('edit-p-img').value = p.img;
    document.getElementById('edit-product-subtitle').textContent = `Editing: ${p.name}`;

    document.getElementById('edit-product-overlay')?.classList.add('active');
}

function closeEditProductModal() {
    document.getElementById('edit-product-overlay')?.classList.remove('active');
}

function saveProductEdit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-p-id').value;
    const p = productsDB[id];

    if (!p) return;

    p.originalPrice = parseFloat(document.getElementById('edit-p-price').value) || p.originalPrice;
    p.discountPct = parseFloat(document.getElementById('edit-p-discount').value) || 0;
    p.stock = parseInt(document.getElementById('edit-p-stock').value) || 0;
    p.img = uploadedEditDeviceImageDataUrl || document.getElementById('edit-p-img').value.trim() || p.img;

    saveProductsToStorage();
    closeEditProductModal();
    uploadedEditDeviceImageDataUrl = '';
    showToast(`Updated pricing & photo for ${p.name}`);
}

function deleteProductFromStore(productId) {
    const p = productsDB[productId];
    if (!p) return;

    if (confirm(`Are you sure you want to delete "${p.name}" from the store?`)) {
        delete productsDB[productId];
        saveProductsToStorage();
        showToast(`Deleted ${p.name} from store`);
    }
}

function applyBulkDiscount() {
    const category = document.getElementById('bulk-category').value;
    const discount = parseFloat(document.getElementById('bulk-discount-pct').value);

    if (isNaN(discount) || discount < 0 || discount > 90) {
        showToast('Please enter a valid discount % between 0 and 90');
        return;
    }

    Object.values(productsDB).forEach(p => {
        if (category === 'all' || p.category === category) {
            p.discountPct = discount;
        }
    });

    saveProductsToStorage();
    showToast(`Applied ${discount}% discount to ${category} items!`);
}

function resetAllDiscounts() {
    Object.values(productsDB).forEach(p => {
        p.discountPct = 0;
    });

    saveProductsToStorage();
    showToast('Reset all product discounts to 0%');
}
