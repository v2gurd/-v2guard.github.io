document.addEventListener("DOMContentLoaded", () => {
    const ORDER_KEY = "v2gurd_agency_orders";
    const REQUEST_KEY = "v2gurd_agency_request";

    const orderId =
        new URLSearchParams(window.location.search).get("order");

    const loadingBox =
        document.getElementById("loadingBox");

    const paymentLayout =
        document.getElementById("paymentLayout");

    const pageMessage =
        document.getElementById("pageMessage");

    const form =
        document.getElementById("paymentForm");

    const formMessage =
        document.getElementById("formMessage");

    const submitButton =
        document.getElementById("submitPaymentButton");

    const copyCardButton =
        document.getElementById("copyCardButton");

    const cardNumber =
        document.getElementById("cardNumber");

    const payerName =
        document.getElementById("payerName");

    const paymentDate =
        document.getElementById("paymentDate");

    const trackingCode =
        document.getElementById("trackingCode");

    const paymentNote =
        document.getElementById("paymentNote");

    const paymentDone =
        document.getElementById("paymentDone");


    /*
     * اطلاعات نمایندگی
     */

    const agencyRequest =
        getStoredObject(REQUEST_KEY);

    if (
        !agencyRequest ||
        agencyRequest.status !== "active" ||
        agencyRequest.agencyActive !== true
    ) {
        showPageMessage(
            "نمایندگی مربوط به این سفارش فعال نیست.",
            "error"
        );

        stopLoading();
        return;
    }


    /*
     * شماره سفارش
     */

    if (!orderId) {
        showPageMessage(
            "شماره سفارش پیدا نشد.",
            "error"
        );

        stopLoading();
        return;
    }


    /*
     * دریافت سفارش
     */

    const order =
        getOrder(orderId);

    if (!order) {
        showPageMessage(
            "سفارش موردنظر پیدا نشد.",
            "error"
        );

        stopLoading();
        return;
    }


    /*
     * جلوگیری از پرداخت مجدد
     */

    if (
        order.status === "payment_submitted" ||
        order.status === "payment_verified" ||
        order.status === "completed"
    ) {
        showPageMessage(
            "پرداخت این سفارش قبلاً ثبت شده است.",
            "success"
        );

        fillOrderInfo(order);

        stopLoading();

        if (form) {
            form.style.display = "none";
        }

        return;
    }


    /*
     * نمایش اطلاعات سفارش
     */

    fillOrderInfo(order);

    fillDefaultPaymentInfo(order);

    stopLoading();


    /*
     * کپی شماره کارت
     */

    if (copyCardButton) {

        copyCardButton.addEventListener(
            "click",
            async () => {

                const cleanCard =
                    "6219861841635526";

                try {

                    await navigator.clipboard.writeText(
                        cleanCard
                    );

                    copyCardButton.textContent =
                        "کپی شد ✓";

                    setTimeout(() => {
                        copyCardButton.textContent =
                            "کپی";
                    }, 1800);

                } catch (error) {

                    copyCardButton.textContent =
                        "کپی نشد";

                    setTimeout(() => {
                        copyCardButton.textContent =
                            "کپی";
                    }, 1800);
                }
            }
        );
    }


    /*
     * ثبت پرداخت
     */

    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                clearFormMessage();

                if (!payerName.value.trim()) {
                    showFormMessage(
                        "نام پرداخت‌کننده را وارد کنید.",
                        "error"
                    );

                    payerName.focus();
                    return;
                }

                if (!paymentDate.value) {
                    showFormMessage(
                        "تاریخ پرداخت را وارد کنید.",
                        "error"
                    );

                    paymentDate.focus();
                    return;
                }

                if (!paymentDone.checked) {
                    showFormMessage(
                        "ابتدا تأیید کنید که مبلغ را واریز کرده‌اید.",
                        "error"
                    );

                    return;
                }


                /*
                 * بررسی دوباره سفارش
                 */

                const latestOrder =
                    getOrder(orderId);

                if (!latestOrder) {
                    showFormMessage(
                        "سفارش پیدا نشد. صفحه را دوباره باز کنید.",
                        "error"
                    );

                    return;
                }

                if (
                    latestOrder.status === "payment_submitted" ||
                    latestOrder.status === "payment_verified" ||
                    latestOrder.status === "completed"
                ) {
                    showFormMessage(
                        "پرداخت این سفارش قبلاً ثبت شده است.",
                        "error"
                    );

                    return;
                }


                /*
                 * اطلاعات پرداخت
                 */

                const payment = {
                    id:
                        generatePaymentId(),

                    orderId:
                        latestOrder.id,

                    amount:
                        Number(latestOrder.price || 0),

                    cardNumber:
                        "6219861841635526",

                    bank:
                        "Blue Bank",

                    accountName:
                        "نامی",

                    payerName:
                        payerName.value.trim(),

                    paymentDate:
                        paymentDate.value,

                    trackingCode:
                        trackingCode.value.trim(),

                    note:
                        paymentNote.value.trim(),

                    submittedAt:
                        new Date().toISOString(),

                    status:
                        "payment_submitted"
                };


                /*
                 * ذخیره پرداخت
                 */

                const orders =
                    getOrders();

                const index =
                    orders.findIndex(
                        item =>
                            item.id === latestOrder.id
                    );

                if (index === -1) {
                    showFormMessage(
                        "ذخیره سفارش انجام نشد.",
                        "error"
                    );

                    return;
                }


                orders[index] = {
                    ...orders[index],

                    status:
                        "payment_submitted",

                    payment: payment,

                    paymentStatus:
                        "payment_submitted",

                    paymentSubmittedAt:
                        payment.submittedAt,

                    telegramSent:
                        false
                };


                saveOrders(orders);


                /*
                 * اگر تابع اصلی سیستم وجود داشته باشد،
                 * وضعیت سفارش را از طریق آن هم ثبت می‌کنیم.
                 */

                if (
                    typeof submitAgencyOrderPayment ===
                    "function"
                ) {

                    try {

                        submitAgencyOrderPayment(
                            latestOrder.id,
                            payment
                        );

                    } catch (error) {

                        /*
                         * ذخیره مستقیم بالا انجام شده،
                         * بنابراین خطای این تابع مانع ثبت سفارش نمی‌شود.
                         */
                    }
                }


                /*
                 * نمایش موفقیت
                 */

                submitButton.disabled = true;

                submitButton.textContent =
                    "پرداخت ثبت شد ✓";

                showFormMessage(
                    "پرداخت شما با موفقیت ثبت شد. سفارش برای بررسی ارسال شد.",
                    "success"
                );


                /*
                 * انتقال به سایت نماینده
                 */

                setTimeout(() => {

                    window.location.href =
                        "agency-site.html";

                }, 2200);
            }
        );
    }


    /*
     * -------------------------
     * Functions
     * -------------------------
     */


    function fillOrderInfo(order) {

        setText(
            "productName",
            order.productName ||
            order.product?.name ||
            "محصول V2GURD"
        );

        setText(
            "productDescription",
            order.productDescription ||
            order.product?.description ||
            "سرویس اینترنت امن و پایدار V2GURD"
        );

        setText(
            "orderId",
            order.id || "-"
        );

        setText(
            "customerName",
            order.customerName ||
            order.customer?.name ||
            "-"
        );

        setText(
            "customerPhone",
            order.customerPhone ||
            order.customer?.phone ||
            "-"
        );

        setText(
            "agencyName",
            order.agencyName ||
            agencyRequest.agencyName ||
            "-"
        );

        setText(
            "orderPrice",
            formatPrice(
                order.price ||
                order.productPrice ||
                order.product?.price ||
                0
            )
        );
    }


    function fillDefaultPaymentInfo(order) {

        if (payerName) {

            const name =
                order.customerName ||
                order.customer?.name ||
                "";

            payerName.value =
                name;
        }

        if (paymentDate) {

            paymentDate.value =
                getToday();
        }
    }


    function getOrder(id) {

        /*
         * اول از تابع مرکزی استفاده می‌کنیم.
         */

        if (
            typeof getAgencyOrderById ===
            "function"
        ) {

            try {

                const order =
                    getAgencyOrderById(id);

                if (order) {
                    return order;
                }

            } catch (error) {}
        }


        /*
         * سپس localStorage
         */

        const orders =
            getOrders();

        return orders.find(
            item =>
                item.id === id
        ) || null;
    }


    function getOrders() {

        const data =
            localStorage.getItem(
                ORDER_KEY
            );

        if (!data) {
            return [];
        }

        try {

            const parsed =
                JSON.parse(data);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            return [];
        }
    }


    function saveOrders(orders) {

        localStorage.setItem(
            ORDER_KEY,
            JSON.stringify(orders)
        );
    }


    function getStoredObject(key) {

        const data =
            localStorage.getItem(key);

        if (!data) {
            return null;
        }

        try {

            return JSON.parse(data);

        } catch (error) {

            return null;
        }
    }


    function generatePaymentId() {

        return (
            "PAY-" +
            Date.now().toString(36).toUpperCase() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 7)
                .toUpperCase()
        );
    }


    function getToday() {

        const now =
            new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function formatPrice(value) {

        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "۰";
        }

        return number.toLocaleString(
            "fa-IR"
        );
    }


    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        element.textContent =
            value ?? "-";
    }


    function stopLoading() {

        if (loadingBox) {
            loadingBox.style.display =
                "none";
        }

        if (paymentLayout) {
            paymentLayout.style.display =
                "grid";
        }
    }


    function showPageMessage(
        message,
        type = "error"
    ) {

        if (!pageMessage) {
            return;
        }

        pageMessage.textContent =
            message;

        pageMessage.className =
            "message show " + type;
    }


    function showFormMessage(
        message,
        type = "error"
    ) {

        if (!formMessage) {
            return;
        }

        formMessage.textContent =
            message;

        formMessage.className =
            "message show " + type;
    }


    function clearFormMessage() {

        if (!formMessage) {
            return;
        }

        formMessage.textContent =
            "";

        formMessage.className =
            "message";
    }
});
