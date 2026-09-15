document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("agencyForm");
  const message = document.getElementById("formMessage");

  if (!form) return;

  function showMessage(text, type) {
    if (!message) return;

    message.textContent = text;
    message.className = "form-message " + type;
    message.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // بررسی پاسخ تمام شرایط
    const conditions = [
      "condition1",
      "condition2",
      "condition3",
      "condition4",
      "condition5",
      "condition6",
      "condition7",
      "condition8",
      "condition9"
    ];

    for (const name of conditions) {
      const selected = form.querySelector(
        `input[name="${name}"]:checked`
      );

      if (!selected) {
        showMessage(
          "لطفاً به تمام سوالات بخش شرایط نمایندگی پاسخ دهید.",
          "error"
        );
        return;
      }
    }

    // بررسی اطلاعات اصلی
    const fullName = document.getElementById("fullName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const telegram = document.getElementById("telegram")?.value.trim();
    const city = document.getElementById("city")?.value.trim();
    const agencyName = document.getElementById("agencyName")?.value.trim();

    if (
      !fullName ||
      !email ||
      !phone ||
      !telegram ||
      !city ||
      !agencyName
    ) {
      showMessage(
        "لطفاً تمام اطلاعات ضروری را کامل کنید.",
        "error"
      );
      return;
    }

    // بررسی ایمیل
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      showMessage(
        "لطفاً یک ایمیل معتبر وارد کنید.",
        "error"
      );
      return;
    }

    // بررسی شماره موبایل
    const normalizedPhone = phone.replace(/\s|-/g, "");

    if (!/^(\+98|0098|98|0)?9\d{9}$/.test(normalizedPhone)) {
      showMessage(
        "شماره موبایل واردشده معتبر نیست.",
        "error"
      );
      return;
    }

    // بررسی قوانین
    const acceptRules =
      document.getElementById("acceptRules");

    if (!acceptRules || !acceptRules.checked) {
      showMessage(
        "برای ارسال درخواست باید قوانین نمایندگی را بپذیرید.",
        "error"
      );
      return;
    }

    // جمع‌آوری پاسخ شرایط
    const conditionAnswers = {};

    conditions.forEach((name) => {
      const selected = form.querySelector(
        `input[name="${name}"]:checked`
      );

      conditionAnswers[name] = selected
        ? selected.value
        : "";
    });

    // اطلاعات درخواست
    const agencyRequest = {
      id:
        "AG-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 1000),

      createdAt: new Date().toISOString(),

      status: "pending_request",

      applicant: {
        fullName,
        email,
        phone: normalizedPhone,
        telegram,
        city,
        agencyName,

        salesChannels:
          document
            .getElementById("salesChannels")
            ?.value.trim() || "",

        notes:
          document
            .getElementById("notes")
            ?.value.trim() || ""
      },

      conditions: conditionAnswers,

      agencyFee: 499000,

      paymentStatus: "unpaid"
    };

    /*
     * فعلاً اطلاعات در مرورگر ذخیره می‌شود.
     *
     * بعداً این قسمت را به دیتابیس واقعی
     * مثل Supabase متصل می‌کنیم تا درخواست
     * واقعاً برای پنل مدیریت ثبت شود.
     */
    try {
      localStorage.setItem(
        "v2gurd_agency_request",
        JSON.stringify(agencyRequest)
      );
    } catch (error) {
      console.error(
        "Agency request storage error:",
        error
      );
    }

    showMessage(
      "درخواست شما با موفقیت ثبت شد. در حال انتقال به مرحله پرداخت...",
      "success"
    );

    // انتقال به صفحه پرداخت
    setTimeout(() => {
      window.location.href =
        "agency-payment.html?request=" +
        encodeURIComponent(agencyRequest.id);
    }, 1200);
  });
});
