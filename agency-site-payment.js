/* =========================================================
   V2GURD AGENCY SITE PAYMENT
   ثبت پرداخت سایت اختصاصی نماینده
   ========================================================= */

const SITE_PAYMENT_KEY = "v2gurd_agency_site_payment";
const AGENCY_REQUEST_KEY = "v2gurd_agency_request";

const SITE_PRICE = 999000;


/* =========================================================
   ابزار پیام
   ========================================================= */

function showPaymentMessage(message, type = "error") {

    const box = document.getElementById("paymentMessage");

    if (!box) {
        return;
    }

    box.textContent = message;

    box.className = "message show " + type;
}


/* =========================================================
   دریافت درخواست نمایندگی
   ========================================================= */

function getAgencyRequest() {

    try {

        const saved =
            localStorage.getItem(AGENCY_REQUEST_KEY);

        if (!saved) {
            return null;
        }

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "خطا در دریافت اطلاعات نمایندگی:",
            error
        );

        return null;
    }
}


/* =========================================================
   کپی شماره کارت
   ========================================================= */

const copyCardButton =
    document.getElementById("copyCard");

if (copyCardButton) {

    copyCardButton.addEventListener(
        "click",
        async function () {

            const cardNumber =
                "6219861841635526";

            try {

                await navigator.clipboard.writeText(
                    cardNumber
                );

                copyCardButton.textContent =
                    "کپی شد ✓";

                setTimeout(() => {

                    copyCardButton.textContent =
                        "کپی";

                }, 2000);

            } catch (error) {

                showPaymentMessage(
                    "کپی خودکار شماره کارت انجام نشد. شماره کارت را دستی کپی کنید.",
                    "error"
                );

            }

        }
    );
}


/* =========================================================
   مقداردهی اولیه
   ========================================================= */

const agencyRequest =
    getAgencyRequest();

const payerNameInput =
    document.getElementById("payerName");

const paymentDateInput =
    document.getElementById("paymentDate");


if (agencyRequest) {

    if (
        payerNameInput &&
        agencyRequest.fullName
    ) {

        payerNameInput.value =
            agencyRequest.fullName;
    }
}


/* تاریخ امروز */

if (paymentDateInput) {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    paymentDateInput.value =
        `${year}-${month}-${day}`;
}


/* =========================================================
   فرم پرداخت
   ========================================================= */

const paymentForm =
    document.getElementById(
        "sitePaymentForm"
    );


if (paymentForm) {

    paymentForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            /* -----------------------------------------
               بررسی نماینده
               ----------------------------------------- */

            if (!agencyRequest) {

                showPaymentMessage(
                    "اطلاعات نمایندگی پیدا نشد. ابتدا وارد پنل نمایندگی شوید.",
                    "error"
                );

                return;
            }


            /* -----------------------------------------
               بررسی فعال بودن نمایندگی
               ----------------------------------------- */

            if (
                agencyRequest.status !== "active"
            ) {

                showPaymentMessage(
                    "برای خرید سایت اختصاصی، ابتدا باید نمایندگی شما فعال شده باشد.",
                    "error"
                );

                return;
            }


            /* -----------------------------------------
               دریافت اطلاعات فرم
               ----------------------------------------- */

            const payerName =
                document
                    .getElementById("payerName")
                    .value
                    .trim();

            const paymentDate =
                document
                    .getElementById("paymentDate")
                    .value;

            const trackingCode =
                document
                    .getElementById("trackingCode")
                    .value
                    .trim();

            const paymentNote =
                document
                    .getElementById("paymentNote")
                    .value
                    .trim();

            const paymentDone =
                document
                    .getElementById("paymentDone")
                    .checked;


            /* -----------------------------------------
               اعتبارسنجی
               ----------------------------------------- */

            if (!payerName) {

                showPaymentMessage(
                    "نام پرداخت‌کننده را وارد کنید.",
                    "error"
                );

                return;
            }


            if (!paymentDate) {

                showPaymentMessage(
                    "تاریخ پرداخت را وارد کنید.",
                    "error"
                );

                return;
            }


            if (!paymentDone) {

                showPaymentMessage(
                    "لطفاً تأیید کنید که مبلغ را واریز کرده‌اید.",
                    "error"
                );

                return;
            }


            /* -----------------------------------------
               ساخت شناسه پرداخت
               ----------------------------------------- */

            const paymentId =
                "SITE-" +
                Date.now() +
                "-" +
                Math.floor(
                    100 +
                    Math.random() * 900
                );


            /* -----------------------------------------
               اطلاعات پرداخت
               ----------------------------------------- */

            const sitePayment = {

                id: paymentId,

                agencyRequestId:
                    agencyRequest.id || "",

                agencyName:
                    agencyRequest.agencyName || "",

                representativeName:
                    agencyRequest.fullName || "",

                email:
                    agencyRequest.email || "",

                telegram:
                    agencyRequest.telegram || "",

                amount:
                    SITE_PRICE,

                currency:
                    "IRT",

                paymentMethod:
                    "card_to_card",

                bank:
                    "بلو بانک",

                card:
                    "6219861841635526",

                accountName:
                    "نامی",

                payerName:
                    payerName,

                paymentDate:
                    paymentDate,

                trackingCode:
                    trackingCode,

                note:
                    paymentNote,

                status:
                    "payment_submitted",

                submittedAt:
                    new Date().toISOString(),

                verifiedAt:
                    null,

                siteStatus:
                    "waiting_verification"

            };


            /* -----------------------------------------
               ذخیره پرداخت
               ----------------------------------------- */

            localStorage.setItem(
                SITE_PAYMENT_KEY,
                JSON.stringify(sitePayment)
            );


            /* -----------------------------------------
               بروزرسانی درخواست نمایندگی
               ----------------------------------------- */

            const updatedRequest = {

                ...agencyRequest,

                sitePaymentStatus:
                    "payment_submitted",

                sitePayment:
                    sitePayment,

                updatedAt:
                    new Date().toISOString()

            };


            localStorage.setItem(
                AGENCY_REQUEST_KEY,
                JSON.stringify(updatedRequest)
            );


            /* -----------------------------------------
               پیام موفقیت
               ----------------------------------------- */

            showPaymentMessage(
                "اطلاعات پرداخت ثبت شد. پس از تأیید پرداخت، مراحل ساخت سایت اختصاصی انجام می‌شود.",
                "success"
            );


            /* -----------------------------------------
               غیرفعال کردن فرم
               ----------------------------------------- */

            const submitButton =
                paymentForm.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "پرداخت ثبت شد ✓";
            }


            /* -----------------------------------------
               بازگشت به پنل
               ----------------------------------------- */

            setTimeout(
                function () {

                    window.location.href =
                        "agency-dashboard.html";

                },
                2200
            );

        }
    );
}


/* =========================================================
   خروجی عمومی
   ========================================================= */

window.getAgencySitePayment =
    function () {

        try {

            const saved =
                localStorage.getItem(
                    SITE_PAYMENT_KEY
                );

            return saved
                ? JSON.parse(saved)
                : null;

        } catch (error) {

            return null;
        }
    };
