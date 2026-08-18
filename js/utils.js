/**
 * ============================================================================
 * Airavat Enterprises — Utility Helpers & Notifications Module (utils.js)
 * ============================================================================
 */

function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('newsletter-email');
        if (!input || !input.value) return;

        showToast('✓ Subscribed to Airavat Farm newsletter!');
        input.value = '';
    });
}

function copyContactInfo(type, text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        showToast(`Copied ${type}: ${text}`);
    }
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🥛</span> <span>${message}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
