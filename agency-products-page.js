(function () {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const productsGrid = $("#productsGrid");
  const productCount = $("#productCount");
  const representativeName = $("#representativeName");
  const productsMessage = $("#productsMessage");

  function showMessage(text) {
    if (!productsMessage) return;

    productsMessage.textContent = text;
    productsMessage.classList.remove("hidden");
  }

  function hideMessage() {
    if (!productsMessage) return;

    productsMessage.classList.add("hidden");
    productsMessage.textContent = "";
  }

  function formatPrice(value) {
    return new Intl.NumberFormat("fa-IR").format(Number(value || 0));
  }

  function getRepresentative() {
    try {
      const request = JSON.parse(
        localStorage.getItem("v2gurd_agency_request")
      );

      return request || null;
    } catch (error) {
      console.error("Agency request error:", error);
      return null;
    }
  }

  function renderRepresentative(request) {
    if (!representativeName) return;

    const name =
      request.agencyName ||
      request.fullName ||
      "نماینده V2GURD";

    representativeName.textContent = name;
  }

  function createProductCard(product) {
    const publicPrice = Number(product.publicPrice || 0);
    const agencyPrice = Number(
      typeof getFinalAgencyPrice === "function"
        ? getFinalAgencyPrice(product.id)
        : product.agencyPrice || 0
    );

    const profit = Math.max(publicPrice - agencyPrice, 0);

    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-category">
        ${product.category || "V2GURD SERVICE"}
      </div>

      <h4>${product.name || "محصول V2GURD"}</h4>

      <p class="product-description">
        ${
          product.description ||
          "سرویس اینترنت V2GURD با شرایط ویژه نمایندگان."
        }
      </p>

      <div class="price-area">

        <div>
          <span class="price-label">قیمت نماینده</span>

          <div class="price">
            ${formatPrice(agencyPrice)}
            <span class="price-unit">تومان</span>
          </div>
        </div>

        <div class="profit">
          <span class="profit-label">سود احتمالی</span>

          <span class="profit-value">
            ${formatPrice(profit)} تومان
          </span>
        </div>

      </div>

      <button
        type="button"
        class="order-btn"
        data-product-id="${product.id}"
      >
        ثبت سفارش برای مشتری
      </button>
    `;

    const orderButton = card.querySelector(".order-btn");

    orderButton.addEventListener("click", function () {
      const productId = this.dataset.productId;

      window.location.href =
        "agency-order.html?product=" +
        encodeURIComponent(productId);
    });

    return card;
  }

  function renderProducts() {
    if (!productsGrid) return;

    if (typeof getAgencyProducts !== "function") {
      showMessage("لیست محصولات در دسترس نیست.");
      return;
    }

    const products = getAgencyProducts();

    if (!Array.isArray(products) || products.length === 0) {
      showMessage("در حال حاضر محصولی برای نمایندگان ثبت نشده است.");
      return;
    }

    hideMessage();

    productsGrid.innerHTML = "";

    products.forEach(function (product) {
      productsGrid.appendChild(
        createProductCard(product)
      );
    });

    if (productCount) {
      productCount.textContent = formatPrice(products.length);
    }
  }

  function checkAgencyAccess() {
    const request = getRepresentative();

    if (!request) {
      showMessage(
        "اطلاعات نمایندگی پیدا نشد. ابتدا درخواست نمایندگی ثبت کنید."
      );

      if (productsGrid) {
        productsGrid.innerHTML = "";
      }

      return false;
    }

    if (
      request.status !== "active" ||
      request.agencyActive !== true
    ) {
      showMessage(
        "دسترسی به محصولات فقط برای نمایندگی‌های فعال امکان‌پذیر است."
      );

      if (productsGrid) {
        productsGrid.innerHTML = "";
      }

      return false;
    }

    renderRepresentative(request);

    return true;
  }

  function init() {
    if (!checkAgencyAccess()) {
      return;
    }

    renderProducts();
  }

  document.addEventListener("DOMContentLoaded", init);

})();
