document.addEventListener("DOMContentLoaded", () => {
    const requestKey = "v2gurd_agency_request";

    const request = JSON.parse(
        localStorage.getItem(requestKey) || "null"
    );

    const siteTitle = document.getElementById("siteTitle");
    const siteLogo = document.getElementById("siteLogo");
    const siteName = document.getElementById("siteName");
    const siteSubtitle = document.getElementById("siteSubtitle");

    const heroTitle = document.getElementById("heroTitle");
    const heroDescription = document.getElementById("heroDescription");
    const heroAgencyName = document.getElementById("heroAgencyName");

    const siteProducts = document.getElementById("siteProducts");
    const siteMessage = document.getElementById("siteMessage");

    const aboutTitle = document.getElementById("aboutTitle");
    const aboutText = document.getElementById("aboutText");

    const supportLink = document.getElementById("supportLink");

    const footerName = document.getElementById("footerName");
    const footerAgencyName = document.getElementById("footerAgencyName");

    const headerBuyButton = document.getElementById("headerBuyButton");
    const heroProductsButton = document.getElementById("heroProductsButton");

    /*
     * بررسی وضعیت نمایندگی
     */

    if (
        !request ||
        request.status !== "active" ||
        request.agencyActive !== true
    ) {
        showMessage(
            "این سایت اختصاصی در حال حاضر فعال نیست یا نمایندگی مربوطه فعال نشده است.",
            "error"
        );

        if (siteProducts) {
            siteProducts.innerHTML = `
                <div class="site-message error">
                    دسترسی به محصولات این نمایندگی در حال حاضر امکان‌پذیر نیست.
                </div>
            `;
        }

        return;
    }

    /*
     * اطلاعات نماینده
     */

    const representativeName =
        request.fullName ||
        request.applicantName ||
        "نماینده V2GURD";

    const agencyName =
        request.agencyName ||
        representativeName;

    const city =
        request.city ||
        "";

    /*
     * اطلاعات ظاهری سایت
     */

    const finalSiteName =
        agencyName;

    const finalSiteSubtitle =
        "فروش خدمات اینترنت امن و پایدار";

    const finalHeroTitle =
        `اینترنت امن و پایدار با ${agencyName}`;

    const finalHeroDescription =
        `ارائه سرویس‌های WireGuard، V2Box و JumpJump با پشتیبانی مستقیم ${agencyName}.`;

    if (siteTitle) {
        siteTitle.textContent =
            `${finalSiteName} | V2GURD`;
    }

    if (siteLogo) {
        siteLogo.textContent =
            getLogoText(finalSiteName);
    }

    if (siteName) {
        siteName.textContent =
            finalSiteName;
    }

    if (siteSubtitle) {
        siteSubtitle.textContent =
            finalSiteSubtitle;
    }

    if (heroTitle) {
        heroTitle.textContent =
            finalHeroTitle;
    }

    if (heroDescription) {
        heroDescription.textContent =
            finalHeroDescription;
    }

    if (heroAgencyName) {
        heroAgencyName.textContent =
            city
                ? `${agencyName} • ${city}`
                : agencyName;
    }

    if (aboutTitle) {
        aboutTitle.textContent =
            `درباره ${agencyName}`;
    }

    if (aboutText) {
        aboutText.textContent =
            `${agencyName} به عنوان نماینده فعال V2GURD، سرویس‌های اینترنت امن و پایدار را با قیمت نمایندگی ارائه می‌کند. برای خرید یا دریافت پشتیبانی از راه‌های ارتباطی این سایت استفاده کنید.`;
    }

    if (footerName) {
        footerName.textContent =
            finalSiteName;
    }

    if (footerAgencyName) {
        footerAgencyName.textContent =
            `نمایندگی رسمی V2GURD`;
    }

    /*
     * پشتیبانی
     *
     * فعلاً لینک پیش‌فرض V2GURD استفاده می‌شود.
     * بعداً می‌توانیم Telegram نماینده را از اطلاعات نمایندگی جدا کنیم.
     */

    if (supportLink) {
        const telegramUsername =
            cleanTelegramUsername(
                request.telegram
            );

        if (telegramUsername) {
            supportLink.href =
                `https://t.me/${telegramUsername}`;

            supportLink.target = "_blank";
            supportLink.rel = "noopener noreferrer";
        } else {
            supportLink.href =
                "https://t.me/Vtwoguard";

            supportLink.target = "_blank";
            supportLink.rel = "noopener noreferrer";
        }
    }

    /*
     * دکمه‌های خرید
     */

    if (headerBuyButton) {
        headerBuyButton.addEventListener("click", () => {
            scrollToProducts();
        });
    }

    if (heroProductsButton) {
        heroProductsButton.addEventListener("click", () => {
            scrollToProducts();
        });
    }

    /*
     * نمایش محصولات
     */

    renderProducts();


    /*
     * -------------------------
     * Functions
     * -------------------------
     */

    function renderProducts() {

        if (!siteProducts) {
            return;
        }

        if (
            typeof getAgencyProducts !== "function" ||
            typeof getFinalAgencyPrice !== "function"
        ) {
            siteProducts.innerHTML = `
                <div class="site-message error">
                    اطلاعات محصولات هنوز بارگذاری نشده است.
                </div>
            `;

            return;
        }

        const products =
            getAgencyProducts();

        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {
            siteProducts.innerHTML = `
                <div class="site-message error">
                    در حال حاضر محصولی برای فروش وجود ندارد.
                </div>
            `;

            return;
        }

        siteProducts.innerHTML = "";

        products.forEach(product => {

            const finalPrice =
                getFinalAgencyPrice(product.id);

            const card =
                document.createElement("article");

            card.className =
                "product-card";

            const category =
                getProductCategory(product);

            const description =
                product.description ||
                getProductDescription(product);

            card.innerHTML = `
                <span class="product-category">
                    ${escapeHTML(category)}
                </span>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ${escapeHTML(description)}
                </p>

                <div class="product-price">
                    <strong>
                        ${formatPrice(finalPrice)}
                    </strong>

                    <span>
                        تومان
                    </span>
                </div>

                <a
                    class="product-button"
                    href="agency-order.html?product=${encodeURIComponent(product.id)}"
                >
                    خرید این سرویس
                </a>
            `;

            siteProducts.appendChild(card);
        });
    }


    function getProductCategory(product) {

        const name =
            String(product.name || "").toLowerCase();

        if (name.includes("wireguard")) {
            return "WireGuard";
        }

        if (name.includes("v2box")) {
            return "V2Box";
        }

        if (name.includes("jumpjump")) {
            return "JumpJump";
        }

        if (
            name.includes("تست") ||
            name.includes("test")
        ) {
            return "Test";
        }

        return "V2GURD";
    }


    function getProductDescription(product) {

        const name =
            String(product.name || "");

        if (name.includes("WireGuard")) {
            return "سرویس WireGuard با حجم و مدت مشخص.";
        }

        if (name.includes("V2Box")) {
            return "سرویس V2Box مناسب استفاده روزمره و حرفه‌ای.";
        }

        if (name.includes("JumpJump")) {
            return "سرویس IP ثابت برای اتصال پایدار.";
        }

        return "سرویس اینترنت امن و پایدار V2GURD.";
    }


    function formatPrice(price) {

        const number =
            Number(price);

        if (!Number.isFinite(number)) {
            return "تماس بگیرید";
        }

        return number.toLocaleString("fa-IR");
    }


    function formatNumber(number) {

        const value =
            Number(number);

        if (!Number.isFinite(value)) {
            return "۰";
        }

        return value.toLocaleString("fa-IR");
    }


    function getLogoText(name) {

        const cleanName =
            String(name || "")
                .trim()
                .replace(/\s+/g, " ");

        if (!cleanName) {
            return "V2";
        }

        const words =
            cleanName.split(" ");

        if (words.length === 1) {
            return cleanName
                .slice(0, 3)
                .toUpperCase();
        }

        return (
            words[0].charAt(0) +
            words[1].charAt(0)
        ).toUpperCase();
    }


    function cleanTelegramUsername(value) {

        if (!value) {
            return "";
        }

        return String(value)
            .trim()
            .replace(/^https?:\/\/t\.me\//i, "")
            .replace(/^@/, "")
            .replace(/\s+/g, "");
    }


    function scrollToProducts() {

        const section =
            document.getElementById("products");

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }


    function showMessage(message, type = "") {

        if (!siteMessage) {
            return;
        }

        siteMessage.textContent =
            message;

        siteMessage.className =
            "site-message";

        if (type) {
            siteMessage.classList.add(type);
        }
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
