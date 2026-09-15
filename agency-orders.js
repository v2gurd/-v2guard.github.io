/* =========================================================
   V2GURD AGENCY ORDERS
   مدیریت سفارش‌های نمایندگی
   ========================================================= */

const AGENCY_ORDERS_KEY = "v2gurd_agency_orders";


/* =========================================================
   دریافت سفارش‌ها
   ========================================================= */

function getAgencyOrders() {
    try {
        const saved = localStorage.getItem(AGENCY_ORDERS_KEY);

        if (!saved) {
            return [];
        }

        const orders = JSON.parse(saved);

        return Array.isArray(orders) ? orders : [];

    } catch (error) {
        console.error("خطا در دریافت سفارش‌ها:", error);
        return [];
    }
}


/* =========================================================
   ذخیره سفارش‌ها
   ========================================================= */

function saveAgencyOrders(orders) {
    localStorage.setItem(
        AGENCY_ORDERS_KEY,
        JSON.stringify(orders)
    );
}


/* =========================================================
   ساخت شناسه سفارش
   ========================================================= */

function generateAgencyOrderId() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(100 + Math.random() * 900);

    return `ORD-${timestamp}-${random}`;
}


/* =========================================================
   ثبت سفارش جدید
   ========================================================= */

function createAgencyOrder(orderData = {}) {

    const orders = getAgencyOrders();

    const order = {
        id: generateAgencyOrderId(),

        createdAt: new Date().toISOString(),

        status: "payment_pending",

        agencyId:
            orderData.agencyId ||
            "unknown-agency",

        agencyName:
            orderData.agencyName ||
            "",

        representativeName:
            orderData.representativeName ||
            "",

        customer: {
            name:
                orderData.customerName ||
                "",

            phone:
                orderData.customerPhone ||
                "",

            telegram:
                orderData.customerTelegram ||
                "",

            email:
                orderData.customerEmail ||
                ""
        },

        product: {
            id:
                orderData.productId ||
                "",

            name:
                orderData.productName ||
                "",

            category:
                orderData.productCategory ||
                "",

            price:
                Number(orderData.price) || 0
        },

        payment: {
            method: "card_to_card",

            status: "unpaid",

            trackingCode: "",

            paymentDate: "",

            receipt: ""
        },

        note:
            orderData.note ||
            "",

        telegramSent: false
    };


    orders.unshift(order);

    saveAgencyOrders(orders);

    return order;
}


/* =========================================================
   پیدا کردن سفارش
   ========================================================= */

function getAgencyOrderById(orderId) {

    const orders = getAgencyOrders();

    return orders.find(
        order => order.id === orderId
    ) || null;
}


/* =========================================================
   تغییر وضعیت سفارش
   ========================================================= */

function updateAgencyOrderStatus(orderId, status) {

    const orders = getAgencyOrders();

    const index = orders.findIndex(
        order => order.id === orderId
    );

    if (index === -1) {
        return false;
    }

    orders[index].status = status;

    orders[index].updatedAt =
        new Date().toISOString();

    saveAgencyOrders(orders);

    return true;
}


/* =========================================================
   ثبت اطلاعات پرداخت سفارش
   ========================================================= */

function submitAgencyOrderPayment(
    orderId,
    paymentData = {}
) {

    const orders = getAgencyOrders();

    const index = orders.findIndex(
        order => order.id === orderId
    );

    if (index === -1) {
        return false;
    }


    orders[index].payment = {

        method: "card_to_card",

        status: "payment_submitted",

        trackingCode:
            paymentData.trackingCode ||
            "",

        paymentDate:
            paymentData.paymentDate ||
            "",

        receipt:
            paymentData.receipt ||
            "",

        submittedAt:
            new Date().toISOString()
    };


    orders[index].status =
        "payment_submitted";

    orders[index].updatedAt =
        new Date().toISOString();


    saveAgencyOrders(orders);

    return true;
}


/* =========================================================
   سفارش‌های یک نماینده
   ========================================================= */

function getOrdersForAgency(agencyId) {

    return getAgencyOrders().filter(
        order => order.agencyId === agencyId
    );
}


/* =========================================================
   سفارش‌های یک مشتری
   ========================================================= */

function getOrdersForCustomer(identifier) {

    return getAgencyOrders().filter(order => {

        return (
            order.customer.phone === identifier ||
            order.customer.telegram === identifier ||
            order.customer.email === identifier
        );

    });
}


/* =========================================================
   محاسبه فروش
   ========================================================= */

function getAgencySalesTotal(agencyId) {

    const orders = getOrdersForAgency(agencyId);

    return orders
        .filter(order =>
            order.status === "paid" ||
            order.status === "completed"
        )
        .reduce(
            (total, order) =>
                total + Number(order.product.price || 0),
            0
        );
}


/* =========================================================
   محاسبه تعداد سفارش‌ها
   ========================================================= */

function getAgencyOrderCount(agencyId) {

    return getOrdersForAgency(agencyId).length;
}


/* =========================================================
   فرمت مبلغ
   ========================================================= */

function formatOrderPrice(price) {

    return Number(price).toLocaleString("fa-IR")
        + " تومان";
}


/* =========================================================
   خروجی عمومی
   ========================================================= */

window.getAgencyOrders =
    getAgencyOrders;

window.saveAgencyOrders =
    saveAgencyOrders;

window.createAgencyOrder =
    createAgencyOrder;

window.getAgencyOrderById =
    getAgencyOrderById;

window.updateAgencyOrderStatus =
    updateAgencyOrderStatus;

window.submitAgencyOrderPayment =
    submitAgencyOrderPayment;

window.getOrdersForAgency =
    getOrdersForAgency;

window.getOrdersForCustomer =
    getOrdersForCustomer;

window.getAgencySalesTotal =
    getAgencySalesTotal;

window.getAgencyOrderCount =
    getAgencyOrderCount;

window.formatOrderPrice =
    formatOrderPrice;
