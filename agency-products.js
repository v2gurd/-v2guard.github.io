/* =========================================================
   V2GURD AGENCY PRODUCTS
   محصولات و قیمت‌های نمایندگی
   ========================================================= */

const AGENCY_PRODUCTS = [
    {
        id: "wg-10",
        category: "WireGuard",
        name: "WireGuard 10GB",
        description: "سرویس WireGuard با حجم 10 گیگابایت",
        volume: "10GB",
        duration: "30 روز",
        publicPrice: 120000,
        agencyPrice: 90000,
        active: true
    },

    {
        id: "wg-20",
        category: "WireGuard",
        name: "WireGuard 20GB",
        description: "سرویس WireGuard با حجم 20 گیگابایت",
        volume: "20GB",
        duration: "30 روز",
        publicPrice: 180000,
        agencyPrice: 135000,
        active: true
    },

    {
        id: "wg-40",
        category: "WireGuard",
        name: "WireGuard 40GB",
        description: "سرویس WireGuard با حجم 40 گیگابایت",
        volume: "40GB",
        duration: "30 روز",
        publicPrice: 280000,
        agencyPrice: 215000,
        active: true
    },

    {
        id: "wg-60",
        category: "WireGuard",
        name: "WireGuard 60GB",
        description: "سرویس WireGuard با حجم 60 گیگابایت",
        volume: "60GB",
        duration: "30 روز",
        publicPrice: 380000,
        agencyPrice: 290000,
        active: true
    },

    {
        id: "wg-100",
        category: "WireGuard",
        name: "WireGuard 100GB",
        description: "سرویس WireGuard با حجم 100 گیگابایت",
        volume: "100GB",
        duration: "30 روز",
        publicPrice: 500000,
        agencyPrice: 390000,
        active: true
    },

    {
        id: "wg-test",
        category: "WireGuard",
        name: "تست نامحدود",
        description: "تست 5 روزه با حجم نامحدود",
        volume: "نامحدود",
        duration: "5 روز",
        publicPrice: 20000,
        agencyPrice: 15000,
        active: true
    },

    {
        id: "wg-500",
        category: "WireGuard",
        name: "WireGuard 500GB",
        description: "سرویس 500 گیگابایت با زمان نامحدود",
        volume: "500GB",
        duration: "نامحدود",
        publicPrice: 500000,
        agencyPrice: 400000,
        active: true
    },

    {
        id: "v2box-normal",
        category: "V2Box",
        name: "V2Box معمولی",
        description: "سرویس V2Box با کیفیت پایدار",
        volume: "طبق پلن",
        duration: "طبق پلن",
        publicPrice: 300000,
        agencyPrice: 230000,
        active: true
    },

    {
        id: "v2box-economic",
        category: "V2Box",
        name: "V2Box اقتصادی",
        description: "پلن اقتصادی V2Box",
        volume: "طبق پلن",
        duration: "طبق پلن",
        publicPrice: 250000,
        agencyPrice: 190000,
        active: true
    },

    {
        id: "v2box-professional",
        category: "V2Box",
        name: "V2Box حرفه‌ای",
        description: "پلن حرفه‌ای V2Box",
        volume: "طبق پلن",
        duration: "طبق پلن",
        publicPrice: 400000,
        agencyPrice: 310000,
        active: true
    },

    {
        id: "v2box-cdn",
        category: "V2Box",
        name: "V2Box CDN",
        description: "سرویس V2Box با مسیر CDN",
        volume: "طبق پلن",
        duration: "طبق پلن",
        publicPrice: 450000,
        agencyPrice: 350000,
        active: true
    },

    {
        id: "v2box-tunnel",
        category: "V2Box",
        name: "V2Box Tunnel",
        description: "سرویس V2Box Tunnel",
        volume: "طبق پلن",
        duration: "طبق پلن",
        publicPrice: 450000,
        agencyPrice: 350000,
        active: true
    },

    {
        id: "v2box-unlimited",
        category: "V2Box",
        name: "V2Box نامحدود",
        description: "سرویس V2Box با حجم نامحدود",
        volume: "نامحدود",
        duration: "طبق پلن",
        publicPrice: 500000,
        agencyPrice: 390000,
        active: true
    },

    {
        id: "jumpjump-fixed",
        category: "JumpJump",
        name: "JumpJump IP ثابت",
        description: "سرویس JumpJump با IP ثابت",
        volume: "طبق پلن",
        duration: "طبق پلن",
        publicPrice: 400000,
        agencyPrice: 300000,
        active: true
    }
];


/* =========================================================
   ابزارهای محصولات
   ========================================================= */

function getAgencyProducts() {
    return AGENCY_PRODUCTS.filter(product => product.active);
}


function getAgencyProductById(productId) {
    return AGENCY_PRODUCTS.find(product => product.id === productId);
}


function formatAgencyPrice(price) {
    return Number(price).toLocaleString("fa-IR") + " تومان";
}


function getAgencyProfit(productId) {
    const product = getAgencyProductById(productId);

    if (!product) {
        return 0;
    }

    return product.publicPrice - product.agencyPrice;
}


/* =========================================================
   ذخیره قیمت‌های سفارشی نماینده
   ========================================================= */

function loadCustomAgencyPrices() {
    try {
        const saved = localStorage.getItem("v2gurd_agency_custom_prices");

        if (!saved) {
            return {};
        }

        return JSON.parse(saved);

    } catch (error) {
        console.error("خطا در خواندن قیمت‌های نمایندگی:", error);
        return {};
    }
}


function saveCustomAgencyPrice(productId, price) {

    const prices = loadCustomAgencyPrices();

    prices[productId] = Number(price);

    localStorage.setItem(
        "v2gurd_agency_custom_prices",
        JSON.stringify(prices)
    );

    return true;
}


function getFinalAgencyPrice(productId) {

    const product = getAgencyProductById(productId);

    if (!product) {
        return null;
    }

    const customPrices = loadCustomAgencyPrices();

    if (
        customPrices[productId] &&
        Number(customPrices[productId]) > 0
    ) {
        return Number(customPrices[productId]);
    }

    return product.agencyPrice;
}


/* =========================================================
   جلوگیری از قیمت غیرمنطقی
   ========================================================= */

function isValidAgencyPrice(productId, price) {

    const product = getAgencyProductById(productId);

    if (!product) {
        return false;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
        return false;
    }

    if (numericPrice <= 0) {
        return false;
    }

    // قیمت نماینده نباید از قیمت عمومی بیشتر شود.
    if (numericPrice >= product.publicPrice) {
        return false;
    }

    return true;
}


/* =========================================================
   خروجی برای استفاده در سایر فایل‌ها
   ========================================================= */

window.V2GURD_AGENCY_PRODUCTS = AGENCY_PRODUCTS;
window.getAgencyProducts = getAgencyProducts;
window.getAgencyProductById = getAgencyProductById;
window.formatAgencyPrice = formatAgencyPrice;
window.getAgencyProfit = getAgencyProfit;
window.loadCustomAgencyPrices = loadCustomAgencyPrices;
window.saveCustomAgencyPrice = saveCustomAgencyPrice;
window.getFinalAgencyPrice = getFinalAgencyPrice;
window.isValidAgencyPrice = isValidAgencyPrice;
