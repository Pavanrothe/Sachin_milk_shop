/**
 * ============================================================================
 * Airavat Enterprises — Order Form & Receipt Generation Module (orders.js)
 * ============================================================================
 */

function initContactFormValidation() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    const setError = (inputId, isError) => {
        const group = document.getElementById(inputId)?.closest('.form-group');
        if (group) {
            if (isError) group.classList.add('error');
            else group.classList.remove('error');
        }
    };

    const isValidPhone = (phone) => {
        const clean = phone.replace(/\D/g, '');
        return clean.length === 10;
    };

    ['fullname', 'phone', 'message'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', () => setError(id, false));
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('fullname');
        const phoneInput = document.getElementById('phone');
        const messageInput = document.getElementById('message');
        const productSelect = document.getElementById('product-select');

        let valid = true;

        setError('fullname', false);
        setError('phone', false);
        setError('message', false);

        if (!nameInput.value.trim()) {
            setError('fullname', true);
            valid = false;
        }

        if (!phoneInput.value.trim() || !isValidPhone(phoneInput.value)) {
            setError('phone', true);
            valid = false;
        }

        if (!messageInput.value.trim()) {
            setError('message', true);
            valid = false;
        }

        if (!valid) return;

        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector('span');
        const origText = btnText.textContent;
        btnText.textContent = 'Processing Order...';

        setTimeout(() => {
            submitBtn.disabled = false;
            btnText.textContent = origText;

            const customerName = nameInput.value.trim();
            const customerPhone = phoneInput.value.trim();
            const customerAddress = messageInput.value.trim();
            const randomOrderId = '#AIR-' + Math.floor(10000 + Math.random() * 90000);

            let orderItems = [];
            let grandTotal = 0;

            const cartKeys = Object.keys(cartState);

            if (cartKeys.length > 0) {
                cartKeys.forEach(id => {
                    const item = productsDB[id];
                    if (item) {
                        const qty = cartState[id];
                        const fp = getFinalPrice(item);
                        grandTotal += fp * qty;
                        orderItems.push({ id: item.id, name: item.name, qty: qty, price: fp });
                    }
                });
            } else {
                const selectedText = productSelect?.options[productSelect.selectedIndex]?.text || 'Fresh Dairy Package';
                grandTotal = 120;
                orderItems.push({ id: 'custom', name: selectedText, qty: 1, price: grandTotal });
            }

            const newOrder = {
                id: randomOrderId,
                date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                name: customerName,
                phone: customerPhone,
                address: customerAddress,
                items: orderItems,
                total: grandTotal,
                status: 'Pending'
            };

            ordersDB.unshift(newOrder);
            saveOrdersToStorage();

            showOrderConfirmationReceipt(customerName, customerPhone, randomOrderId, orderItems, grandTotal);

            form.reset();
        }, 1000);
    });
}

function showOrderConfirmationReceipt(name, phone, orderId, items, grandTotal) {
    const modalOverlay = document.getElementById('order-modal-overlay');
    const orderIdTag = document.getElementById('receipt-order-id');
    const receiptName = document.getElementById('receipt-name');
    const receiptPhone = document.getElementById('receipt-phone');
    const itemsList = document.getElementById('receipt-items-list');
    const totalEl = document.getElementById('receipt-total');

    if (!modalOverlay) return;

    if (orderIdTag) orderIdTag.textContent = orderId;
    if (receiptName) receiptName.textContent = name;
    if (receiptPhone) receiptPhone.textContent = phone;

    let itemsHTML = '';
    items.forEach(i => {
        itemsHTML += `<div class="receipt-row"><span>${i.name} x ${i.qty}</span><strong>₹${i.price * i.qty}</strong></div>`;
    });

    if (itemsList) itemsList.innerHTML = itemsHTML;
    if (totalEl) totalEl.textContent = `₹${grandTotal}`;

    modalOverlay.classList.add('active');
}

function closeOrderModal() {
    document.getElementById('order-modal-overlay')?.classList.remove('active');
    clearFullCart();
}
