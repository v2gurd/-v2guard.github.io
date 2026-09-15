document.addEventListener("DOMContentLoaded", () => {
  const cardNumberElement = document.getElementById("cardNumber");
  const copyButton = document.getElementById("copyCard");

  const submitButton = document.getElementById("submitPayment");
  const message = document.getElementById("paymentMessage");

  const paymentName = document.getElementById("paymentName");
  const trackingCode = document.getElementById("trackingCode");
  const paymentDate = document.getElementById("paymentDate");
  const paymentNote = document.getElementById("paymentNote");
  const paymentDone = document.getElementById("paymentDone");

  const params = new URLSearchParams(window.location.search);
  const requestId = params.get("request");

  function showMessage(text, type) {
    if (!message) return;

    message.textContent = text;
    message.className = "payment-message " + type;

    message.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  /* -----------------------------
     کپی شماره کارت
  ----------------------------- */

  if (copyButton && cardNumberElement) {
    copyButton.addEventListener("click", async () => {
      const rawCardNumber =
        cardNumberElement.textContent
          .replace(/\s+/g, "")
          .trim();

      try {
        await navigator.clipboard.writeText(rawCardNumber);

        copyButton.textContent = "شماره کارت کپی شد ✓";

        setTimeout(() => {
          copyButton.textContent = "کپی شماره کارت";
        }, 2000);

      } catch (error) {
        showMessage(
          "کپی شماره کارت انجام نشد. شماره کارت را به صورت دستی کپی کنید.",
          "error"
        );
      }
    });
  }

  /* -----------------------------
     بررسی درخواست قبلی
  ----------------------------- */

  const savedRequestRaw =
    localStorage.getItem("v2gurd_agency_request");

  let savedRequest = null;

  if (savedRequestRaw) {
    try {
      savedRequest = JSON.parse(savedRequestRaw);
    } catch (error) {
      console.error(
        "Invalid agency request data:",
        error
      );
    }
  }

  /*
   * اگر ID داخل URL وجود داشته باشد،
   * بررسی می‌کنیم که با درخواست ذخیره‌شده
   * مطابقت داشته باشد.
   */

  if (
    requestId &&
    savedRequest &&
    savedRequest.id !== requestId
  ) {
    showMessage(
      "اطلاعات درخواست با این صفحه مطابقت ندارد.",
      "error"
    );

    if (submitButton) {
      submitButton.disabled = true;
    }

    return;
  }

  /* -----------------------------
     پر کردن خودکار نام متقاضی
  ----------------------------- */

  if (
    paymentName &&
    savedRequest &&
    savedRequest.applicant &&
    savedRequest.applicant.fullName
  ) {
    paymentName.value =
      savedRequest.applicant.fullName;
  }

  /* -----------------------------
     تاریخ امروز
  ----------------------------- */

  if (paymentDate && !paymentDate.value) {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    paymentDate.value =
      `${year}-${month}-${day}`;
  }

  /* -----------------------------
     ثبت پرداخت
  ----------------------------- */

  if (submitButton) {
    submitButton.addEventListener("click", () => {

      const name =
        paymentName?.value.trim() || "";

      const tracking =
        trackingCode?.value.trim() || "";

      const date =
        paymentDate?.value || "";

      const note =
        paymentNote?.value.trim() || "";

      if (!savedRequest) {
        showMessage(
          "درخواست نمایندگی پیدا نشد. لطفاً ابتدا فرم درخواست نمایندگی را تکمیل کنید.",
          "error"
        );
        return;
      }

      if (!name) {
        showMessage(
          "نام پرداخت‌کننده را وارد کنید.",
          "error"
        );
        paymentName?.focus();
        return;
      }

      if (!date) {
        showMessage(
          "تاریخ پرداخت را وارد کنید.",
          "error"
        );
        paymentDate?.focus();
        return;
      }

      if (!paymentDone?.checked) {
        showMessage(
          "ابتدا تأیید کنید که مبلغ ۴۹۹٬۰۰۰ تومان را پرداخت کرده‌اید.",
          "error"
        );
        return;
      }

      const paymentData = {
        id:
          "PAY-" +
          Date.now() +
          "-" +
          Math.floor(Math.random() * 1000),

        requestId:
          savedRequest.id,

        amount: 499000,

        payerName: name,

        trackingCode: tracking,

        paymentDate: date,

        note: note,

        submittedAt:
          new Date().toISOString(),

        status: "payment_submitted"
      };

      /* ذخیره پرداخت */

      try {
        localStorage.setItem(
          "v2gurd_agency_payment",
          JSON.stringify(paymentData)
        );

        /* به‌روزرسانی درخواست */

        savedRequest.paymentStatus =
          "payment_submitted";

        savedRequest.status =
          "payment_submitted";

        savedRequest.payment =
          paymentData;

        localStorage.setItem(
          "v2gurd_agency_request",
          JSON.stringify(savedRequest)
        );

      } catch (error) {
        console.error(
          "Payment storage error:",
          error
        );

        showMessage(
          "ذخیره اطلاعات پرداخت انجام نشد. دوباره تلاش کنید.",
          "error"
        );

        return;
      }

      showMessage(
        "اطلاعات پرداخت با موفقیت ثبت شد. درخواست شما برای بررسی آماده است.",
        "success"
      );

      submitButton.disabled = true;
      submitButton.textContent =
        "پرداخت ثبت شد ✓";

      /*
       * فعلاً به پنل نمایندگی منتقل می‌شویم.
       * در نسخه نهایی، وضعیت تا زمان تأیید ادمین
       * «در انتظار بررسی» خواهد بود.
       */

      setTimeout(() => {
        window.location.href =
          "agency-dashboard.html";
      }, 1800);
    });
  }
});
