/**
 * ============================================================================
 * Airavat Enterprises — Main Bootstrapper Script (script.js)
 * Initializes all modular JS subsystems when DOM is ready
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load LocalStorage Database State
    loadDatabaseFromStorage();

    // 2. Explicitly Render Storefront Products Grid for Customers
    renderStorefrontProducts();

    // 3. Initialize Navigation & Scroll Spy
    initMobileNavigation();
    initStickyHeader();
    initActiveNavSpy();

    // 4. Initialize Interactive Subsystems
    initCartDrawerSystem();
    initProductFiltersAndSearch();
    initAddProductForm();
    initContactFormValidation();
    initNewsletterForm();
    initBackToTop();

    // 5. Restore Shopowner Session State
    if (localStorage.getItem('airavat_owner_logged_in') === 'true') {
        isOwnerLoggedIn = true;
    }
});
