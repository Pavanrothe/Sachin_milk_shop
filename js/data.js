/**
 * ============================================================================
 * Airavat Enterprises — Database & State Storage Module (data.js)
 * ============================================================================
 */

const DEFAULT_PRODUCTS = {
    p1: {
        id: 'p1',
        name: 'Pure Farm Milk',
        originalPrice: 65,
        discountPct: 0,
        size: '1 Litre',
        category: 'milk-curd',
        stock: 100,
        tag: 'Best Seller',
        img: 'assets/dairy/milk.jpg',
        desc: 'Farm fresh, pasteurized full-cream cow milk. Sourced directly from grass-fed cows, untouched by hand, and rich in natural calcium and vitamins.',
        nutrition: { protein: '3.4g', calcium: '120mg', fat: '4.1g', energy: '65 kcal' }
    },
    p2: {
        id: 'p2',
        name: 'Fresh Creamy Curd',
        originalPrice: 50,
        discountPct: 10,
        size: '500g',
        category: 'milk-curd',
        stock: 80,
        tag: 'Probiotic',
        img: 'assets/dairy/curd.jpg',
        desc: 'Thick, creamy, and probiotic-rich Dahi prepared naturally using traditional fermentation. Promotes digestive wellness and gut health.',
        nutrition: { protein: '3.8g', calcium: '140mg', fat: '4.5g', energy: '60 kcal' }
    },
    p3: {
        id: 'p3',
        name: 'Desi White Butter',
        originalPrice: 120,
        discountPct: 0,
        size: '250g',
        category: 'butter-ghee',
        stock: 60,
        tag: 'Traditional',
        img: 'assets/dairy/butter.jpg',
        desc: 'Traditional churned un-salted Makhan with rich authentic aroma. Free from artificial colors, preservatives, or added sodium.',
        nutrition: { protein: '0.9g', calcium: '24mg', fat: '81.0g', energy: '717 kcal' }
    },
    p4: {
        id: 'p4',
        name: 'Fresh Soft Paneer',
        originalPrice: 130,
        discountPct: 15,
        size: '200g',
        category: 'paneer-cheese',
        stock: 50,
        tag: 'High Protein',
        img: 'assets/dairy/paneer.jpg',
        desc: 'Super soft, melt-in-mouth cottage cheese blocks. Handcrafted from pure cow milk without chemical coagulants. High protein source.',
        nutrition: { protein: '18.3g', calcium: '208mg', fat: '20.8g', energy: '265 kcal' }
    },
    p5: {
        id: 'p5',
        name: 'Natural Farm Cheese',
        originalPrice: 150,
        discountPct: 0,
        size: '200g',
        category: 'paneer-cheese',
        stock: 40,
        tag: 'Artisanal',
        img: 'assets/dairy/cheese.jpg',
        desc: 'Delicious, naturally aged farm cheese slices with a rich mild flavor. Ideal for breakfast sandwiches, pizza toppings, and baking.',
        nutrition: { protein: '22.0g', calcium: '550mg', fat: '26.0g', energy: '320 kcal' }
    },
    p6: {
        id: 'p6',
        name: 'Pure Cow Ghee',
        originalPrice: 700,
        discountPct: 7,
        size: '1 Litre',
        category: 'butter-ghee',
        stock: 30,
        tag: 'A2 Quality',
        img: 'assets/dairy/ghee.jpg',
        desc: 'Golden, granular, highly aromatic pure cow ghee made using traditional Bilona method. Packed with essential fatty acids and A2 nutrients.',
        nutrition: { protein: '0.0g', calcium: '0mg', fat: '99.5g', energy: '898 kcal' }
    }
};

const DEFAULT_ORDERS = [
    {
        id: '#AIR-84920',
        date: '07 Aug 2026, 08:30 AM',
        name: 'Ananya Sharma',
        phone: '9876543210',
        address: 'Flat 402, Green Acre Apartments, Pune',
        items: [{ id: 'p1', name: 'Pure Farm Milk', qty: 2, price: 65 }, { id: 'p4', name: 'Fresh Soft Paneer', qty: 1, price: 110 }],
        total: 240,
        status: 'Out for Delivery'
    },
    {
        id: '#AIR-84919',
        date: '07 Aug 2026, 07:15 AM',
        name: 'Vikram Mehta',
        phone: '9812345678',
        address: 'House 12/B, MG Road, Sector 5, Pune',
        items: [{ id: 'p6', name: 'Pure Cow Ghee', qty: 1, price: 650 }],
        total: 650,
        status: 'Delivered'
    }
];

let productsDB = {};
let ordersDB = [];

function getFinalPrice(product) {
    if (!product || !product.originalPrice) return 0;
    if (!product.discountPct || product.discountPct <= 0) return product.originalPrice;
    return Math.round(product.originalPrice * (1 - product.discountPct / 100));
}

function loadDatabaseFromStorage() {
    const storedP = localStorage.getItem('airavat_products_db');
    if (storedP) {
        try { 
            productsDB = JSON.parse(storedP); 
            if (!productsDB || Object.keys(productsDB).length === 0) {
                productsDB = { ...DEFAULT_PRODUCTS };
            }
        } catch(e) { 
            productsDB = { ...DEFAULT_PRODUCTS }; 
        }
    } else {
        productsDB = { ...DEFAULT_PRODUCTS };
        saveProductsToStorage();
    }

    const storedO = localStorage.getItem('airavat_orders_db');
    if (storedO) {
        try { ordersDB = JSON.parse(storedO); } catch(e) { ordersDB = [ ...DEFAULT_ORDERS ]; }
    } else {
        ordersDB = [ ...DEFAULT_ORDERS ];
        saveOrdersToStorage();
    }

    // GUARANTEE: Render storefront products on database load
    if (typeof renderStorefrontProducts === 'function') {
        renderStorefrontProducts();
    }
}

function saveProductsToStorage() {
    localStorage.setItem('airavat_products_db', JSON.stringify(productsDB));
    if (typeof renderStorefrontProducts === 'function') renderStorefrontProducts();
    if (typeof isOwnerLoggedIn !== 'undefined' && isOwnerLoggedIn && typeof renderAdminDashboardData === 'function') {
        renderAdminDashboardData();
    }
}

function saveOrdersToStorage() {
    localStorage.setItem('airavat_orders_db', JSON.stringify(ordersDB));
    if (typeof isOwnerLoggedIn !== 'undefined' && isOwnerLoggedIn && typeof renderAdminDashboardData === 'function') {
        renderAdminDashboardData();
    }
}
