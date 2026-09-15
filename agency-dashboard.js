document.addEventListener("DOMContentLoaded", () => {
  const nameElement = document.getElementById("representativeName");
  const statusElement = document.getElementById("agencyStatus");
  const statusTextElement =
    document.getElementById("agencyStatusText");

  const statusIcon =
    document.getElementById("statusIcon");

  const infoName =
    document.getElementById("infoName");

  const infoAgency =
    document.getElementById("infoAgency");

  const infoCity =
    document.getElementById("infoCity");

  const infoPayment =
    document.getElementById("infoPayment");

  const productsFeature =
    document.getElementById("productsFeature");

  const siteFeature =
    document.getElementById("siteFeature");

  const ordersFeature =
    document.getElementById("ordersFeature");

  const sitePromotion =
    document.getElementById("sitePromotion");

  const siteButton =
    document.getElementById("siteButton");

  const message =
    document.getElementById("dashboardMessage");


  /* =========================
     دریافت درخواست
  ========================= */

  const requestRaw =
    localStorage.getItem("v2gurd_agency_request");

  let request = null;

  if (requestRaw) {
    try {
      request = JSON.parse(requestRaw);
    } catch (error) {
      console.error(
        "Agency request data error:",
        error
      );
    }
  }


  /* =========================
     اگر درخواست وجود نداشت
  ========================= */

  if (!request) {

    if (nameElement) {
      nameElement.textContent =
        "مهمان";
    }

    if (statusElement) {
      statusElement.textContent =
        "درخواستی ثبت نشده";
    }

    if (statusTextElement) {
      statusTextElement.textContent =
        "برای استفاده از پنل نمایندگی ابتدا درخواست نمایندگی خود را ثبت کنید.";
    }

    if (statusIcon) {
      statusIcon.textContent = "!";
    }

    if (infoName) {
      infoName.textContent = "-";
    }

    if (infoAgency) {
      infoAgency.textContent = "-";
    }

    if (infoCity) {
      infoCity.textContent = "-";
    }

    if (infoPayment) {
      infoPayment.textContent =
        "درخواستی وجود ندارد";
    }

    return;
  }


  /* =========================
     اطلاعات متقاضی
  ========================= */

  const applicant =
    request.applicant || {};

  const fullName =
    applicant.fullName || "نماینده عزیز";

  const agencyName =
    applicant.agencyName || "-";

  const city =
    applicant.city || "-";


  if (nameElement) {
    nameElement.textContent =
      fullName;
  }

  if (infoName) {
    infoName.textContent =
      fullName;
  }

  if (infoAgency) {
    infoAgency.textContent =
      agencyName;
  }

  if (infoCity) {
    infoCity.textContent =
      city;
  }


  /* =========================
     وضعیت پرداخت
  ========================= */

  const paymentStatus =
    request.paymentStatus || "unpaid";

  if (infoPayment) {

    if (
      paymentStatus ===
      "payment_submitted"
    ) {
      infoPayment.textContent =
        "ثبت شده - در انتظار بررسی";
    }

    else if (
      paymentStatus === "paid"
    ) {
      infoPayment.textContent =
        "تأیید شده ✓";
    }

    else {
      infoPayment.textContent =
        "در انتظار پرداخت";
    }
  }


  /* =========================
     وضعیت نمایندگی
  ========================= */

  const status =
    request.status ||
    "pending_request";


  function setStatus(
    icon,
    title,
    description
  ) {

    if (statusIcon) {
      statusIcon.textContent =
        icon;
    }

    if (statusElement) {
      statusElement.textContent =
        title;
    }

    if (statusTextElement) {
      statusTextElement.textContent =
        description;
    }
  }


  /* =========================
     درخواست اولیه
  ========================= */

  if (
    status ===
    "pending_request"
  ) {

    setStatus(
      "⏳",
      "در انتظار بررسی",
      "درخواست نمایندگی شما ثبت شده و منتظر بررسی اطلاعات است."
    );
  }


  /* =========================
     پرداخت ثبت شده
  ========================= */

  else if (
    status ===
    "payment_submitted"
  ) {

    setStatus(
      "💳",
      "پرداخت ثبت شد",
      "اطلاعات پرداخت دریافت شده و درخواست شما در انتظار تأیید مدیریت V2GURD است."
    );
  }


  /* =========================
     پرداخت تأیید شده
  ========================= */

  else if (
    status ===
    "payment_verified"
  ) {

    setStatus(
      "🔍",
      "پرداخت تأیید شد",
      "پرداخت شما تأیید شده و درخواست نمایندگی در حال بررسی نهایی است."
    );
  }


  /* =========================
     نمایندگی فعال
  ========================= */

  else if (
    status ===
    "active"
  ) {

    setStatus(
      "✓",
      "نمایندگی فعال است",
      "نمایندگی شما فعال شده و امکانات فروش V2GURD در دسترس شماست."
    );


    /* فعال کردن امکانات */

    if (productsFeature) {

      productsFeature.classList.remove(
        "locked"
      );

      const featureStatus =
        productsFeature.querySelector(
          ".feature-status"
        );

      if (featureStatus) {
        featureStatus.textContent =
          "فعال ✓";
      }

      productsFeature.style.cursor =
        "pointer";

      productsFeature.addEventListener(
        "click",
        () => {

          window.location.href =
            "agency-products.html";

        }
      );
    }


    if (ordersFeature) {

      ordersFeature.classList.remove(
        "locked"
      );

      const featureStatus =
        ordersFeature.querySelector(
          ".feature-status"
        );

      if (featureStatus) {
        featureStatus.textContent =
          "فعال ✓";
      }

      ordersFeature.style.cursor =
        "pointer";

      ordersFeature.addEventListener(
        "click",
        () => {

          window.location.href =
            "agency-orders.html";

        }
      );
    }


    /* سایت اختصاصی */

    if (siteFeature) {

      siteFeature.classList.remove(
        "locked"
      );

      const featureStatus =
        siteFeature.querySelector(
          ".feature-status"
        );

      if (featureStatus) {
        featureStatus.textContent =
          "فعال";
      }
    }


    if (sitePromotion) {

      sitePromotion.classList.remove(
        "locked-section"
      );
    }


    if (siteButton) {

      siteButton.disabled = false;

      siteButton.addEventListener(
        "click",
        () => {

          window.location.href =
            "agency-site-payment.html";

        }
      );
    }

  }


  /* =========================
     رد درخواست
  ========================= */

  else if (
    status ===
    "rejected"
  ) {

    setStatus(
      "✕",
      "درخواست رد شده",
      "درخواست نمایندگی شما تأیید نشده است. برای اطلاعات بیشتر با پشتیبانی V2GURD تماس بگیرید."
    );

  }


  /* =========================
     وضعیت ناشناخته
  ========================= */

  else {

    setStatus(
      "⏳",
      "در انتظار بررسی",
      "وضعیت درخواست شما در حال بررسی است."
    );

  }


  /* =========================
     پیام راهنما
  ========================= */

  if (
    message &&
    status === "active"
  ) {

    message.textContent =
      "نمایندگی شما فعال است و می‌توانید از امکانات فروش استفاده کنید.";

    message.className =
      "dashboard-message success";
  }

});
