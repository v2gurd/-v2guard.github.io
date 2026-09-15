(function () {
    "use strict";

    const $ = (id) => document.getElementById(id);

    const requestKey = "v2gurd_agency_request";

    let currentOrder = null;


    // =========================
    // Helpers
    // =========================

    function showMessage(text, type = "info") {
        const box = $("ordersMessage");

        if (!box) return;

        box.textContent = text;
        box.className = "message " + type;
    }

    function hideMessage() {
        const box = $("ordersMessage");

        if (!box) return;

        box.className = "message hidden";
        box.textContent = "";
    }

    function formatPrice(price) {
        const number = Number(price || 0);

        return number.toLocaleString("fa-IR") + " تومان";
    }

    function formatDate(dateValue) {
        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("fa-IR") +
            " - " +
            date.toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit"
            });
    }

    function normalizeTelegram(value) {
        if (!value) return "-";

        const text = String(value).trim();

        if (!text) return "-";

        return text.startsWith("@") ? text : "@" + text;
    }


    // =========================
    // Status
    // =========================

    function getStatusInfo(status) {

        switch (status) {

            case "payment_pending":
                return {
                    text: "در انتظار پرداخت",
                    className: "pending"
                };

            case "payment_submitted":
                return {
                    text: "پرداخت ثبت شده",
                    className: "submitted"
                };

            case "payment_verified":
                return {
                    text: "پرداخت تأیید شده",
                    className: "completed"
                };

            case "completed":
                return {
                    text: "تکمیل شده",
                    className: "completed"
                };

            case "rejected":
                return {
                    text: "رد شده",
                    className: "rejected"
                };

            case "cancelled":
                return {
                    text: "لغو شده",
                    className: "rejected"
                };

            default:
                return {
                    text: "در انتظار بررسی",
                    className: "pending"
                };
        }
    }


    // =========================
    // Agency Access
    // =========================

    function getAgencyRequest() {
        try {
            return JSON.parse(
                localStorage.getItem(requestKey) || "null"
            );
        } catch (error) {
            return null;
        }
    }

    function checkAgencyAccess() {

        const request = getAgencyRequest();

        if (
            !request ||
            request.status !== "active" ||
            request.agencyActive !== true
        ) {
            showMessage(
                "دسترسی به سفارش‌های نمایندگی فعال نیست.",
                "error"
            );

            return false;
        }

        return true;
    }


    // =========================
    // Representative
    // =========================

    function renderRepresentative() {

        const request = getAgencyRequest();

        if (!request) return;

        const name =
            request.agencyName ||
            request.fullName ||
            "نماینده V2GURD";

        const element = $("representativeName");

        if (element) {
            element.textContent = name;
        }
    }


    // =========================
    // Orders
    // =========================

    function getOrders() {

        if (typeof getOrdersForAgency === "function") {

            const request = getAgencyRequest();

            if (!request) return [];

            const agencyId =
                request.id ||
                request.agencyId ||
                "";

            return getOrdersForAgency(agencyId) || [];
        }

        try {

            return JSON.parse(
                localStorage.getItem("v2gurd_agency_orders") || "[]"
            );

        } catch (error) {

            return [];

        }
    }


    // =========================
    // Statistics
    // =========================

    function renderStatistics(orders) {

        const total = orders.length;

        const pending = orders.filter(order =>
            order.status === "payment_pending"
        ).length;

        const submitted = orders.filter(order =>
            order.status === "payment_submitted"
        ).length;

        const completed = orders.filter(order =>
            order.status === "payment_verified" ||
            order.status === "completed"
        ).length;

        let totalSales = 0;

        orders.forEach(order => {

            if (
                order.status === "payment_verified" ||
                order.status === "completed"
            ) {
                totalSales += Number(
                    order.price ||
                    order.product?.price ||
                    order.product?.agencyPrice ||
                    0
                );
            }

        });


        if ($("totalOrders")) {
            $("totalOrders").textContent =
                total.toLocaleString("fa-IR");
        }

        if ($("pendingOrders")) {
            $("pendingOrders").textContent =
                pending.toLocaleString("fa-IR");
        }

        if ($("submittedOrders")) {
            $("submittedOrders").textContent =
                submitted.toLocaleString("fa-IR");
        }

        if ($("completedOrders")) {
            $("completedOrders").textContent =
                completed.toLocaleString("fa-IR");
        }

        if ($("salesTotal")) {
            $("salesTotal").textContent =
                formatPrice(totalSales);
        }
    }


    // =========================
    // Render Orders
    // =========================

    function renderOrders() {

        const list = $("ordersList");
        const empty = $("emptyOrders");

        if (!list || !empty) return;

        const orders = getOrders();

        list.innerHTML = "";

        renderStatistics(orders);


        if (!orders.length) {

            empty.classList.remove("hidden");

            return;
        }


        empty.classList.add("hidden");


        const sortedOrders = [...orders].sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        );


        sortedOrders.forEach(order => {

            const status = getStatusInfo(order.status);

            const product =
                order.product?.name ||
                order.productName ||
                "محصول V2GURD";

            const customer =
                order.customer?.name ||
                order.customerName ||
                "مشتری";

            const price =
                order.price ||
                order.product?.price ||
                order.product?.agencyPrice ||
                0;


            const card = document.createElement("article");

            card.className = "order-card";

            card.innerHTML = `
                <div class="order-card-top">

                    <div>
                        <div class="order-id">
                            ${order.id || "-"}
                        </div>

                        <div class="order-date">
                            ${formatDate(order.createdAt)}
                        </div>
                    </div>

                    <span class="order-status ${status.className}">
                        ${status.text}
                    </span>

                </div>


                <div class="order-main">

                    <div class="order-product">
                        <span>محصول</span>
                        <strong>${product}</strong>
                    </div>


                    <div class="order-customer">
                        <span>مشتری</span>
                        <strong>${customer}</strong>
                    </div>


                    <div class="order-price">
                        <span>مبلغ</span>
                        <strong>${formatPrice(price)}</strong>
                    </div>


                    <div>
                        <button
                            type="button"
                            class="view-order-btn"
                            data-order-id="${order.id || ""}"
                        >
                            مشاهده جزئیات
                        </button>
                    </div>

                </div>
            `;


            list.appendChild(card);
        });


        list.querySelectorAll(".view-order-btn")
            .forEach(button => {

                button.addEventListener("click", function () {

                    const orderId =
                        this.dataset.orderId;

                    openOrderDetails(orderId);

                });

            });
    }


    // =========================
    // Find Order
    // =========================

    function findOrder(orderId) {

        if (!orderId) return null;

        if (typeof getAgencyOrderById === "function") {

            const order =
                getAgencyOrderById(orderId);

            if (order) return order;
        }


        const orders = getOrders();

        return orders.find(
            order => order.id === orderId
        ) || null;
    }


    // =========================
    // Open Details
    // =========================

    function openOrderDetails(orderId) {

        const order = findOrder(orderId);

        if (!order) {

            showMessage(
                "سفارش موردنظر پیدا نشد.",
                "error"
            );

            return;
        }


        currentOrder = order;


        const product =
            order.product || {};


        const customer =
            order.customer || {};


        const payment =
            order.payment || {};


        const status =
            getStatusInfo(order.status);


        if ($("detailOrderId")) {
            $("detailOrderId").textContent =
                order.id || "-";
        }

        if ($("detailCreatedAt")) {
            $("detailCreatedAt").textContent =
                formatDate(order.createdAt);
        }

        if ($("detailStatus")) {
            $("detailStatus").textContent =
                status.text;
        }

        if ($("detailPrice")) {
            $("detailPrice").textContent =
                formatPrice(
                    order.price ||
                    product.price ||
                    product.agencyPrice ||
                    0
                );
        }


        if ($("detailCustomerName")) {
            $("detailCustomerName").textContent =
                customer.name ||
                order.customerName ||
                "-";
        }

        if ($("detailCustomerPhone")) {
            $("detailCustomerPhone").textContent =
                customer.phone ||
                order.customerPhone ||
                "-";
        }

        if ($("detailCustomerTelegram")) {
            $("detailCustomerTelegram").textContent =
                normalizeTelegram(
                    customer.telegram ||
                    order.customerTelegram
                );
        }

        if ($("detailCustomerEmail")) {
            $("detailCustomerEmail").textContent =
                customer.email ||
                order.customerEmail ||
                "-";
        }


        if ($("detailProductName")) {
            $("detailProductName").textContent =
                product.name ||
                order.productName ||
                "-";
        }

        if ($("detailProductCategory")) {
            $("detailProductCategory").textContent =
                product.category ||
                "-";
        }


        if ($("detailPaymentStatus")) {

            const paymentStatus =
                payment.status ||
                (
                    order.status === "payment_submitted"
                        ? "payment_submitted"
                        : "unpaid"
                );

            let text = "پرداخت نشده";

            if (paymentStatus === "payment_submitted") {
                text = "پرداخت ثبت شده";
            }

            if (
                paymentStatus === "payment_verified" ||
                paymentStatus === "verified"
            ) {
                text = "پرداخت تأیید شده";
            }

            $("detailPaymentStatus").textContent = text;
        }


        if ($("detailTrackingCode")) {
            $("detailTrackingCode").textContent =
                payment.trackingCode ||
                "-";
        }

        if ($("detailPaymentDate")) {
            $("detailPaymentDate").textContent =
                payment.paymentDate ||
                "-";
        }


        if ($("detailNote")) {
            $("detailNote").textContent =
                order.note ||
                "یادداشتی ثبت نشده است.";
        }


        const details = $("orderDetails");

        if (details) {

            details.classList.remove("hidden");

            details.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        updateActionButtons();
    }


    // =========================
    // Action Buttons
    // =========================

    function updateActionButtons() {

        const verifyButton =
            $("verifyPaymentButton");

        const rejectButton =
            $("rejectOrderButton");

        if (!currentOrder) {

            if (verifyButton) {
                verifyButton.style.display = "none";
            }

            if (rejectButton) {
                rejectButton.style.display = "none";
            }

            return;
        }


        const status = currentOrder.status;


        const canVerify =
            status === "payment_submitted";


        if (verifyButton) {
            verifyButton.style.display =
                canVerify ? "inline-flex" : "none";
        }


        if (rejectButton) {

            rejectButton.style.display =
                (
                    status === "payment_pending" ||
                    status === "payment_submitted"
                )
                    ? "inline-flex"
                    : "none";
        }
    }


    // =========================
    // Verify Payment
    // =========================

    function verifyPayment() {

        if (!currentOrder) return;


        if (
            currentOrder.status !== "payment_submitted"
        ) {

            showMessage(
                "این سفارش هنوز پرداخت ثبت‌شده‌ای ندارد.",
                "error"
            );

            return;
        }


        const confirmed =
            window.confirm(
                "آیا از تأیید پرداخت این سفارش مطمئن هستید؟"
            );


        if (!confirmed) return;


        let updated = null;


        if (typeof updateAgencyOrderStatus === "function") {

            updated =
                updateAgencyOrderStatus(
                    currentOrder.id,
                    "payment_verified"
                );
        }


        if (!updated) {

            const orders = getOrders();

            const index =
                orders.findIndex(
                    order =>
                        order.id === currentOrder.id
                );


            if (index !== -1) {

                orders[index].status =
                    "payment_verified";

                orders[index].payment =
                    orders[index].payment || {};

                orders[index].payment.status =
                    "payment_verified";

                orders[index].payment.verifiedAt =
                    new Date().toISOString();


                localStorage.setItem(
                    "v2gurd_agency_orders",
                    JSON.stringify(orders)
                );

                updated = orders[index];
            }
        }


        if (updated) {

            currentOrder = updated;

            showMessage(
                "پرداخت سفارش با موفقیت تأیید شد.",
                "success"
            );

            renderOrders();

            openOrderDetails(currentOrder.id);

        } else {

            showMessage(
                "تغییر وضعیت سفارش انجام نشد.",
                "error"
            );
        }
    }


    // =========================
    // Reject Order
    // =========================

    function rejectOrder() {

        if (!currentOrder) return;


        const reason =
            window.prompt(
                "دلیل رد سفارش را وارد کنید:"
            );


        if (reason === null) return;


        const cleanReason =
            reason.trim();


        if (!cleanReason) {

            showMessage(
                "وارد کردن دلیل رد سفارش الزامی است.",
                "error"
            );

            return;
        }


        const confirmed =
            window.confirm(
                "آیا از رد کردن این سفارش مطمئن هستید؟"
            );


        if (!confirmed) return;


        let updated = null;


        if (typeof updateAgencyOrderStatus === "function") {

            updated =
                updateAgencyOrderStatus(
                    currentOrder.id,
                    "rejected",
                    {
                        rejectionReason: cleanReason
                    }
                );
        }


        if (!updated) {

            const orders = getOrders();

            const index =
                orders.findIndex(
                    order =>
                        order.id === currentOrder.id
                );


            if (index !== -1) {

                orders[index].status =
                    "rejected";

                orders[index].rejectionReason =
                    cleanReason;

                orders[index].rejectedAt =
                    new Date().toISOString();


                localStorage.setItem(
                    "v2gurd_agency_orders",
                    JSON.stringify(orders)
                );

                updated = orders[index];
            }
        }


        if (updated) {

            currentOrder = updated;

            showMessage(
                "سفارش رد شد.",
                "success"
            );

            renderOrders();

            openOrderDetails(currentOrder.id);

        } else {

            showMessage(
                "تغییر وضعیت سفارش انجام نشد.",
                "error"
            );
        }
    }


    // =========================
    // Close Details
    // =========================

    function closeDetails() {

        currentOrder = null;

        const details =
            $("orderDetails");

        if (details) {
            details.classList.add("hidden");
        }
    }


    // =========================
    // Refresh
    // =========================

    function refreshOrders() {

        hideMessage();

        currentOrder = null;

        const details =
            $("orderDetails");

        if (details) {
            details.classList.add("hidden");
        }

        renderOrders();
    }


    // =========================
    // Init
    // =========================

    function init() {

        if (!checkAgencyAccess()) {
            return;
        }

        renderRepresentative();

        renderOrders();


        const refreshButton =
            $("refreshOrders");

        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                refreshOrders
            );
        }


        const closeButton =
            $("closeDetails");

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeDetails
            );
        }


        const verifyButton =
            $("verifyPaymentButton");

        if (verifyButton) {

            verifyButton.addEventListener(
                "click",
                verifyPayment
            );
        }


        const rejectButton =
            $("rejectOrderButton");

        if (rejectButton) {

            rejectButton.addEventListener(
                "click",
                rejectOrder
            );
        }
    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }

})();
