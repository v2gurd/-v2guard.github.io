/* =========================================================
   V2GURD AGENCY DATA
   مدیریت اطلاعات و وضعیت نمایندگی
   ========================================================= */

const V2GURD_AGENCY_REQUEST_KEY =
    "v2gurd_agency_request";

const V2GURD_AGENCY_PAYMENT_KEY =
    "v2gurd_agency_payment";

const V2GURD_AGENCY_SITE_PAYMENT_KEY =
    "v2gurd_agency_site_payment";


/* =========================================================
   دریافت اطلاعات نمایندگی
   ========================================================= */

function getAgencyData() {

    try {

        const data =
            localStorage.getItem(
                V2GURD_AGENCY_REQUEST_KEY
            );

        if (!data) {
            return null;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "خطا در دریافت اطلاعات نمایندگی:",
            error
        );

        return null;
    }
}


/* =========================================================
   ذخیره اطلاعات نمایندگی
   ========================================================= */

function saveAgencyData(data) {

    if (!data) {
        return false;
    }

    try {

        localStorage.setItem(
            V2GURD_AGENCY_REQUEST_KEY,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error(
            "خطا در ذخیره اطلاعات نمایندگی:",
            error
        );

        return false;
    }
}


/* =========================================================
   دریافت پرداخت نمایندگی
   ========================================================= */

function getAgencyPayment() {

    try {

        const data =
            localStorage.getItem(
                V2GURD_AGENCY_PAYMENT_KEY
            );

        if (!data) {
            return null;
        }

        return JSON.parse(data);

    } catch (error) {

        return null;
    }
}


/* =========================================================
   دریافت پرداخت سایت اختصاصی
   ========================================================= */

function getAgencySitePayment() {

    try {

        const data =
            localStorage.getItem(
                V2GURD_AGENCY_SITE_PAYMENT_KEY
            );

        if (!data) {
            return null;
        }

        return JSON.parse(data);

    } catch (error) {

        return null;
    }
}


/* =========================================================
   تغییر وضعیت نمایندگی
   ========================================================= */

function setAgencyStatus(status) {

    const agency =
        getAgencyData();

    if (!agency) {
        return false;
    }

    agency.status =
        status;

    agency.updatedAt =
        new Date().toISOString();

    return saveAgencyData(agency);
}


/* =========================================================
   فعال کردن نمایندگی
   ========================================================= */

function activateAgency() {

    const agency =
        getAgencyData();

    if (!agency) {
        return false;
    }

    agency.status =
        "active";

    agency.agencyActive =
        true;

    agency.activatedAt =
        new Date().toISOString();

    agency.updatedAt =
        new Date().toISOString();

    return saveAgencyData(agency);
}


/* =========================================================
   رد درخواست
   ========================================================= */

function rejectAgency(reason = "") {

    const agency =
        getAgencyData();

    if (!agency) {
        return false;
    }

    agency.status =
        "rejected";

    agency.agencyActive =
        false;

    agency.rejectionReason =
        reason;

    agency.updatedAt =
        new Date().toISOString();

    return saveAgencyData(agency);
}


/* =========================================================
   بررسی فعال بودن نماینده
   ========================================================= */

function isAgencyActive() {

    const agency =
        getAgencyData();

    if (!agency) {
        return false;
    }

    return (
        agency.status === "active" &&
        agency.agencyActive === true
    );
}


/* =========================================================
   دریافت نام نماینده
   ========================================================= */

function getRepresentativeName() {

    const agency =
        getAgencyData();

    if (!agency) {
        return "";
    }

    return (
        agency.agencyName ||
        agency.fullName ||
        "نماینده V2GURD"
    );
}


/* =========================================================
   دریافت اطلاعات نماینده
   ========================================================= */

function getRepresentativeInfo() {

    const agency =
        getAgencyData();

    if (!agency) {
        return null;
    }

    return {

        id:
            agency.id || "",

        name:
            agency.fullName || "",

        agencyName:
            agency.agencyName || "",

        email:
            agency.email || "",

        phone:
            agency.phone || "",

        telegram:
            agency.telegram || "",

        city:
            agency.city || "",

        status:
            agency.status || "unknown",

        active:
            isAgencyActive()

    };
}


/* =========================================================
   وضعیت پرداخت نمایندگی
   ========================================================= */

function getAgencyPaymentStatus() {

    const agency =
        getAgencyData();

    if (!agency) {
        return "unknown";
    }

    return (
        agency.paymentStatus ||
        "unpaid"
    );
}


/* =========================================================
   بررسی امکان خرید سایت
   ========================================================= */

function canPurchaseAgencySite() {

    const agency =
        getAgencyData();

    if (!agency) {
        return false;
    }

    return (
        agency.status === "active" &&
        agency.agencyActive === true
    );
}


/* =========================================================
   وضعیت سایت نماینده
   ========================================================= */

function getAgencySiteStatus() {

    const payment =
        getAgencySitePayment();

    if (!payment) {
        return "not_requested";
    }

    return (
        payment.siteStatus ||
        "waiting_verification"
    );
}


/* =========================================================
   تنظیم وضعیت سایت
   ========================================================= */

function setAgencySiteStatus(status) {

    const payment =
        getAgencySitePayment();

    if (!payment) {
        return false;
    }

    payment.siteStatus =
        status;

    payment.updatedAt =
        new Date().toISOString();

    localStorage.setItem(
        V2GURD_AGENCY_SITE_PAYMENT_KEY,
        JSON.stringify(payment)
    );

    return true;
}


/* =========================================================
   اطلاعات کامل سیستم نمایندگی
   ========================================================= */

function getCompleteAgencyData() {

    return {

        agency:
            getAgencyData(),

        agencyPayment:
            getAgencyPayment(),

        sitePayment:
            getAgencySitePayment(),

        active:
            isAgencyActive(),

        paymentStatus:
            getAgencyPaymentStatus(),

        siteStatus:
            getAgencySiteStatus()

    };
}


/* =========================================================
   خروجی عمومی
   ========================================================= */

window.getAgencyData =
    getAgencyData;

window.saveAgencyData =
    saveAgencyData;

window.getAgencyPayment =
    getAgencyPayment;

window.getAgencySitePayment =
    getAgencySitePayment;

window.setAgencyStatus =
    setAgencyStatus;

window.activateAgency =
    activateAgency;

window.rejectAgency =
    rejectAgency;

window.isAgencyActive =
    isAgencyActive;

window.getRepresentativeName =
    getRepresentativeName;

window.getRepresentativeInfo =
    getRepresentativeInfo;

window.getAgencyPaymentStatus =
    getAgencyPaymentStatus;

window.canPurchaseAgencySite =
    canPurchaseAgencySite;

window.getAgencySiteStatus =
    getAgencySiteStatus;

window.setAgencySiteStatus =
    setAgencySiteStatus;

window.getCompleteAgencyData =
    getCompleteAgencyData;
