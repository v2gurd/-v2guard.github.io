/* =========================================================
   V2GURD AGENCY ADMIN
   مدیریت درخواست‌های نمایندگی
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       ابزارهای عمومی
       ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    function showMessage(message, type = "success") {

        const box = $("adminMessage");

        if (!box) {
            return;
        }

        box.textContent = message;

        box.className =
            "admin-message show " + type;
    }


    function hideMessage() {

        const box = $("adminMessage");

        if (!box) {
            return;
        }

        box.className =
            "admin-message";
    }


    /* =====================================================
       دریافت درخواست
       ===================================================== */

    function getRequest() {

        try {

            const data =
                localStorage.getItem(
                    "v2gurd_agency_request"
                );

            if (!data) {
                return null;
            }

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "Agency request error:",
                error
            );

            return null;
        }
    }


    /* =====================================================
       دریافت پرداخت
       ===================================================== */

    function getPayment() {

        try {

            const data =
                localStorage.getItem(
                    "v2gurd_agency_payment"
                );

            if (!data) {
                return null;
            }

            return JSON.parse(data);

        } catch (error) {

            return null;
        }
    }


    /* =====================================================
       ذخیره درخواست
       ===================================================== */

    function saveRequest(request) {

        localStorage.setItem(
            "v2gurd_agency_request",
            JSON.stringify(request)
        );
    }


    /* =====================================================
       ترجمه وضعیت
       ===================================================== */

    function getStatusText(status) {

        const statuses = {

            pending_request:
                "در انتظار بررسی",

            payment_pending:
                "در انتظار پرداخت",

            payment_submitted:
                "پرداخت ثبت شده",

            payment_verified:
                "پرداخت تأیید شده",

            active:
                "نمایندگی فعال",

            rejected:
                "درخواست رد شده"

        };

        return (
            statuses[status] ||
            status ||
            "نامشخص"
        );
    }


    /* =====================================================
       ترجمه وضعیت پرداخت
       ===================================================== */

    function getPaymentStatusText(status) {

        const statuses = {

            unpaid:
                "پرداخت نشده",

            payment_submitted:
                "در انتظار بررسی",

            verified:
                "تأیید شده",

            rejected:
                "رد شده"

        };

        return (
            statuses[status] ||
            status ||
            "نامشخص"
        );
    }


    /* =====================================================
       پاسخ شرایط
       ===================================================== */

    const conditionTitles = {

        condition1:
            "مغازه موبایل، کامپیوتر یا لوازم دیجیتال دارید؟",

        condition2:
            "در حوزه اینترنت یا خدمات مرتبط فعالیت می‌کنید؟",

        condition3:
            "کانال یا گروه تلگرامی فعال دارید؟",

        condition4:
            "پیج یا صفحه فعال شبکه‌های اجتماعی دارید؟",

        condition5:
            "مشتری ثابت سرویس اینترنت دارید؟",

        condition6:
            "سابقه فروش سرویس اینترنتی یا اشتراکی دارید؟",

        condition7:
            "امکان تبلیغ و معرفی V2GURD را دارید؟",

        condition8:
            "امکان فعالیت مستمر برای فروش دارید؟",

        condition9:
            "درخواست شما صرفاً برای استفاده شخصی نیست؟"

    };


    function renderConditions(request) {

        const container =
            $("conditionsList");

        if (!container) {
            return;
        }

        container.innerHTML = "";


        const conditions =
            request.conditions || {};


        Object.keys(conditionTitles)
            .forEach(function (key) {

                const answer =
                    conditions[key];


                const item =
                    document.createElement("div");

                item.className =
                    "condition-item";


                const question =
                    document.createElement("div");

                question.className =
                    "condition-question";

                question.textContent =
                    conditionTitles[key];


                const answerBox =
                    document.createElement("div");

                answerBox.className =
                    "condition-answer " +
                    (
                        answer === "yes"
                            ? "yes"
                            : "no"
                    );


                answerBox.textContent =
                    answer === "yes"
                        ? "بله"
                        : "خیر";


                item.appendChild(question);

                item.appendChild(answerBox);

                container.appendChild(item);

            });
    }


    /* =====================================================
       نمایش اطلاعات
       ===================================================== */

    function renderRequest() {

        hideMessage();


        const request =
            getRequest();

        const payment =
            getPayment();


        const emptyState =
            $("emptyState");

        const content =
            $("requestContent");


        if (!request) {

            if (emptyState) {
                emptyState.hidden = false;
            }

            if (content) {
                content.hidden = true;
            }

            updateStats(null);

            return;
        }


        if (emptyState) {
            emptyState.hidden = true;
        }

        if (content) {
            content.hidden = false;
        }


        /* اطلاعات متقاضی */

        $("applicantName").textContent =
            request.fullName || "-";

        $("agencyName").textContent =
            request.agencyName || "-";

        $("applicantEmail").textContent =
            request.email || "-";

        $("applicantPhone").textContent =
            request.phone || "-";

        $("applicantTelegram").textContent =
            request.telegram || "-";

        $("applicantCity").textContent =
            request.city || "-";


        /* فعالیت */

        $("salesChannels").textContent =
            request.salesChannels || "-";

        $("applicantNotes").textContent =
            request.notes || "-";


        /* شرایط */

        renderConditions(request);


        /* پرداخت */

        const paymentData =
            payment ||
            request.payment ||
            null;


        $("paymentStatus").textContent =
            getPaymentStatusText(
                request.paymentStatus ||
                (
                    paymentData
                        ? paymentData.status
                        : "unpaid"
                )
            );


        $("paymentTracking").textContent =
            paymentData &&
            paymentData.trackingCode
                ? paymentData.trackingCode
                : "-";


        $("paymentDate").textContent =
            paymentData &&
            paymentData.paymentDate
                ? paymentData.paymentDate
                : "-";


        /* وضعیت */

        $("currentStatus").textContent =
            getStatusText(
                request.status
            );


        updateButtons(request);

        updateStats(request);
    }


    /* =====================================================
       آمار
       ===================================================== */

    function updateStats(request) {

        const total =
            request ? 1 : 0;


        const pending =
            request &&
            (
                request.status ===
                    "pending_request" ||

                request.status ===
                    "payment_submitted"
            )
                ? 1
                : 0;


        const submitted =
            request &&
            (
                request.paymentStatus ===
                    "payment_submitted" ||

                request.paymentStatus ===
                    "verified"
            )
                ? 1
                : 0;


        const active =
            request &&
            request.status === "active"
                ? 1
                : 0;


        $("totalRequests").textContent =
            total.toLocaleString("fa-IR");

        $("pendingRequests").textContent =
            pending.toLocaleString("fa-IR");

        $("submittedPayments").textContent =
            submitted.toLocaleString("fa-IR");

        $("activeAgencies").textContent =
            active.toLocaleString("fa-IR");
    }


    /* =====================================================
       کنترل دکمه‌ها
       ===================================================== */

    function updateButtons(request) {

        const approve =
            $("approveButton");

        const reject =
            $("rejectButton");


        if (!approve || !reject) {
            return;
        }


        if (request.status === "active") {

            approve.disabled = true;

            approve.textContent =
                "نمایندگی فعال است";

            reject.disabled = false;

            return;
        }


        if (request.status === "rejected") {

            approve.disabled = false;

            approve.textContent =
                "فعال‌سازی نمایندگی";

            reject.disabled = true;

            return;
        }


        approve.disabled = false;

        approve.textContent =
            "تأیید و فعال‌سازی نمایندگی";

        reject.disabled = false;
    }


    /* =====================================================
       فعال‌سازی نمایندگی
       ===================================================== */

    function approveAgency() {

        const request =
            getRequest();


        if (!request) {

            showMessage(
                "درخواستی برای فعال‌سازی پیدا نشد.",
                "error"
            );

            return;
        }


        const payment =
            getPayment();


        /*
         * در نسخه فعلی تأیید پرداخت دستی است.
         *
         * اگر پرداخت هنوز ثبت نشده باشد،
         * اجازه فعال‌سازی نمی‌دهیم.
         */

        const paymentSubmitted =
            request.paymentStatus ===
                "payment_submitted" ||

            request.paymentStatus ===
                "verified" ||

            (
                payment &&
                payment.status ===
                    "payment_submitted"
            );


        if (!paymentSubmitted) {

            showMessage(
                "ابتدا باید اطلاعات پرداخت ۴۹۹,۰۰۰ تومانی ثبت شده باشد.",
                "error"
            );

            return;
        }


        const confirmed =
            window.confirm(
                "آیا از تأیید پرداخت و فعال‌سازی این نمایندگی مطمئن هستید؟"
            );


        if (!confirmed) {
            return;
        }


        request.status =
            "active";


        request.agencyActive =
            true;


        request.paymentStatus =
            "verified";


        request.activatedAt =
            new Date().toISOString();


        request.updatedAt =
            new Date().toISOString();


        if (request.payment) {

            request.payment.status =
                "verified";

            request.payment.verifiedAt =
                new Date().toISOString();
        }


        if (payment) {

            payment.status =
                "verified";

            payment.verifiedAt =
                new Date().toISOString();


            localStorage.setItem(
                "v2gurd_agency_payment",
                JSON.stringify(payment)
            );
        }


        saveRequest(request);


        showMessage(
            "نمایندگی با موفقیت فعال شد.",
            "success"
        );


        renderRequest();
    }


    /* =====================================================
       نمایش فرم رد
       ===================================================== */

    function showRejectBox() {

        const box =
            $("rejectBox");

        if (!box) {
            return;
        }

        box.hidden =
            !box.hidden;

        if (!box.hidden) {

            $("rejectReason").focus();
        }
    }


    /* =====================================================
       رد درخواست
       ===================================================== */

    function rejectAgency() {

        const request =
            getRequest();


        if (!request) {

            showMessage(
                "درخواستی برای رد کردن پیدا نشد.",
                "error"
            );

            return;
        }


        const reason =
            $("rejectReason")
                .value
                .trim();


        if (!reason) {

            showMessage(
                "لطفاً دلیل رد درخواست را وارد کنید.",
                "error"
            );

            return;
        }


        const confirmed =
            window.confirm(
                "آیا از رد این درخواست مطمئن هستید؟"
            );


        if (!confirmed) {
            return;
        }


        request.status =
            "rejected";


        request.agencyActive =
            false;


        request.rejectionReason =
            reason;


        request.updatedAt =
            new Date().toISOString();


        saveRequest(request);


        $("rejectBox").hidden =
            true;


        $("rejectReason").value =
            "";


        showMessage(
            "درخواست نمایندگی رد شد.",
            "success"
        );


        renderRequest();
    }


    /* =====================================================
       بروزرسانی
       ===================================================== */

    const refreshButton =
        $("refreshData");


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function () {

                renderRequest();

                showMessage(
                    "اطلاعات بروزرسانی شد.",
                    "success"
                );

            }
        );
    }


    /* =====================================================
       دکمه تأیید
       ===================================================== */

    const approveButton =
        $("approveButton");


    if (approveButton) {

        approveButton.addEventListener(
            "click",
            approveAgency
        );
    }


    /* =====================================================
       دکمه رد
       ===================================================== */

    const rejectButton =
        $("rejectButton");


    if (rejectButton) {

        rejectButton.addEventListener(
            "click",
            showRejectBox
        );
    }


    /* =====================================================
       تأیید نهایی رد
       ===================================================== */

    const confirmReject =
        $("confirmReject");


    if (confirmReject) {

        confirmReject.addEventListener(
            "click",
            rejectAgency
        );
    }


    /* =====================================================
       اجرای اولیه
       ===================================================== */

    renderRequest();


})();
