(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const productInfo = $("productInfo");
  const orderForm = $("orderForm");
  const orderMessage = $("orderMessage");
  const representativeName = $("representativeName");

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("product");

  let selectedProduct = null;
  let currentAgency = null;

  function showMessage(message, type = "info") {
    if (!orderMessage) return;

    orderMessage.textContent = message;
    orderMessage.className = `message ${type}`;
  }

  function hideMessage() {
    if (!orderMessage) return;

    orderMessage.textContent = "";
    orderMessage.className = "message hidden";
  }

  function formatPrice(price) {
    return Number(price || 0).toLocaleString("fa-IR") + " تومان";
  }

  function normalizeTelegram(value) {
    if (!value) return "";

    let telegram = value.trim();

    if (telegram && !telegram.startsWith("@")) {
      telegram = "@" + telegram;
    }

    return telegram;
  }

  function normalizePhone(value) {
    return String(value || "")
      .replace(/[^\d+]/g, "")
      .trim();
  }

  function isValidPhone(phone) {
    const normalized = phone.replace(/\s/g, "");

    return /^09\d{9}$/.test(normalized) ||
           /^\+989\d{9}$/.test(normalized);
  }

  function getAgencyRequest() {
    try {
      const raw = localStorage.getItem("v2gurd_agency_request");

      if (!raw) return null;

      return JSON.parse(raw);
    } catch (error) {
      console.error("Agency request read error:", error);
      return null;
    }
  }

  function saveAgencyRequest(request) {
    localStorage.setItem(
      "v2gurd_agency_request",
      JSON.stringify(request)
    );
  }

  function getCurrentAgency() {
    const request = getAgencyRequest();

    if (!request) {
      return null;
    }

    if (
      request.status !== "active" ||
      request.agencyActive !== true
    ) {
      return null;
    }

    return request;
  }

  function getSelectedProduct() {
    if (!productId) {
      return null;
    }

    if (typeof getAgencyProductById === "function") {
      return getAgencyProductById(productId);
    }

    if (typeof getAgencyProducts === "function") {
      const products = getAgencyProducts();

      return products.find(
        (product) => String(product.id) === String(productId)
      ) || null;
    }

    return null;
  }

  function getFinalPrice(product) {
    if (!product) return 0;

    if (typeof getFinalAgencyPrice === "function") {
      return Number(
        getFinalAgencyPrice(product.id)
      ) || Number(product.agencyPrice) || 0;
    }

    return Number(product.agencyPrice) || 0;
  }

  function renderRepresentative() {
    if (!representativeName || !currentAgency) {
      return;
    }

    representativeName.textContent =
      currentAgency.agencyName ||
      currentAgency.fullName ||
      "نماینده V2GURD";
  }

  function renderProduct() {
    if (!productInfo) return;

    if (!selectedProduct) {
      productInfo.innerHTML = `
        <div class="product-error">
          محصول موردنظر پیدا نشد.
          <br>
          لطفاً از صفحه محصولات نمایندگی دوباره محصول را انتخاب کنید.
        </div>
      `;

      if (orderForm) {
        orderForm.style.display = "none";
      }

      return;
    }

    const finalPrice = getFinalPrice(selectedProduct);

    const publicPrice =
      Number(selectedProduct.publicPrice) || 0;

    const profit = Math.max(
      publicPrice - finalPrice,
      0
    );

    productInfo.innerHTML = `
      <div class="product-details">

        <span class="product-category">
          ${selectedProduct.category || "محصول V2GURD"}
        </span>

        <h2>
          ${selectedProduct.name || "محصول انتخاب‌شده"}
        </h2>

        <p>
          ${selectedProduct.description || "سرویس V2GURD"}
        </p>

        <div class="product-price">
          <span class="label">
            قیمت نمایندگی
          </span>

          <strong>
            ${formatPrice(finalPrice)}
          </strong>

          ${
            profit > 0
              ? `
                <div class="product-profit">
                  سود تقریبی نماینده:
                  ${formatPrice(profit)}
                </div>
              `
              : ""
          }
        </div>

      </div>
    `;
  }

  function validateForm() {
    const name = $("customerName")?.value.trim();
    const phone = normalizePhone(
      $("customerPhone")?.value
    );
    const telegram = normalizeTelegram(
      $("customerTelegram")?.value
    );
    const email = $("customerEmail")?.value.trim();
    const note = $("orderNote")?.value.trim();

    if (!name) {
      showMessage(
        "لطفاً نام و نام خانوادگی مشتری را وارد کنید.",
        "error"
      );

      $("customerName")?.focus();
      return null;
    }

    if (!phone) {
      showMessage(
        "لطفاً شماره موبایل مشتری را وارد کنید.",
        "error"
      );

      $("customerPhone")?.focus();
      return null;
    }

    if (!isValidPhone(phone)) {
      showMessage(
        "شماره موبایل واردشده صحیح نیست.",
        "error"
      );

      $("customerPhone")?.focus();
      return null;
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      showMessage(
        "فرمت ایمیل مشتری صحیح نیست.",
        "error"
      );

      $("customerEmail")?.focus();
      return null;
    }

    return {
      name,
      phone,
      telegram,
      email,
      note
    };
  }

  function createOrder(customer) {
    if (
      typeof createAgencyOrder !== "function"
    ) {
      throw new Error(
        "سیستم ثبت سفارش نمایندگی در دسترس نیست."
      );
    }

    const finalPrice = getFinalPrice(
      selectedProduct
    );

    return createAgencyOrder({
      agencyId:
        currentAgency.id ||
        currentAgency.requestId ||
        "agency",

      agencyName:
        currentAgency.agencyName ||
        currentAgency.fullName ||
        "V2GURD",

      representativeName:
        currentAgency.fullName ||
        currentAgency.agencyName ||
        "نماینده V2GURD",

      customer: {
        name: customer.name,
        phone: customer.phone,
        telegram: customer.telegram,
        email: customer.email
      },

      product: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        publicPrice:
          Number(selectedProduct.publicPrice) || 0,
        agencyPrice: finalPrice
      },

      price: finalPrice,

      note: customer.note
    });
  }

  function redirectToOrderPayment(order) {
    if (!order || !order.id) {
      throw new Error(
        "شناسه سفارش ایجاد نشد."
      );
    }

    window.location.href =
      `agency-order-payment.html?order=${encodeURIComponent(order.id)}`;
  }

  function handleSubmit(event) {
    event.preventDefault();

    hideMessage();

    if (!currentAgency) {
      showMessage(
        "این بخش فقط برای نمایندگان فعال V2GURD قابل استفاده است.",
        "error"
      );

      return;
    }

    if (!selectedProduct) {
      showMessage(
        "محصول انتخاب‌شده معتبر نیست.",
        "error"
      );

      return;
    }

    const customer = validateForm();

    if (!customer) {
      return;
    }

    const submitButton =
      orderForm.querySelector(
        ".submit-btn"
      );

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent =
        "در حال ثبت سفارش...";
    }

    try {
      const order = createOrder(customer);

      showMessage(
        "سفارش با موفقیت ایجاد شد. در حال انتقال به مرحله پرداخت...",
        "success"
      );

      if (submitButton) {
        submitButton.textContent =
          "سفارش ثبت شد";
      }

      setTimeout(() => {
        redirectToOrderPayment(order);
      }, 900);

    } catch (error) {
      console.error(
        "Create agency order error:",
        error
      );

      showMessage(
        error.message ||
        "ثبت سفارش انجام نشد. دوباره تلاش کنید.",
        "error"
      );

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent =
          "ادامه و ثبت سفارش";
      }
    }
  }

  function checkAccess() {
    currentAgency = getCurrentAgency();

    if (!currentAgency) {
      if (productInfo) {
        productInfo.innerHTML = `
          <div class="product-error">
            دسترسی به ثبت سفارش فقط برای نمایندگان فعال امکان‌پذیر است.
          </div>
        `;
      }

      if (orderForm) {
        orderForm.style.display = "none";
      }

      return false;
    }

    return true;
  }

  function init() {
    if (!checkAccess()) {
      return;
    }

    selectedProduct = getSelectedProduct();

    renderRepresentative();
    renderProduct();

    if (!productId) {
      showMessage(
        "محصولی برای ثبت سفارش انتخاب نشده است.",
        "error"
      );
    }

    if (
      orderForm &&
      selectedProduct
    ) {
      orderForm.addEventListener(
        "submit",
        handleSubmit
      );
    }
  }

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

})();
