document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("agencyForm");
  const message = document.getElementById("formMessage");

  if (!form) return;


  // نمایش پیام
  function showMessage(text, type) {

    if (!message) return;

    message.textContent = text;

    message.className =
      "form-message " + type;

    message.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }


  // ارسال فرم
  form.addEventListener("submit", (event) => {

    event.preventDefault();


    // تمام سوالات نمایندگی
    const conditions = [
      "condition1",
      "condition2",
      "condition3",
      "condition4",
      "condition5",
      "condition6",
      "condition7",
      "condition8",
      "condition9",
      "condition10"
    ];


    /*
     * بررسی پاسخ تمام سوالات
     *
     * سوالات خارج از تگ form هستند
     * و با form="agencyForm" به فرم متصل شده‌اند.
     * بنابراین باید از document.querySelector استفاده شود.
     */
    for (const name of conditions) {

      const selected = document.querySelector(
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


    // اطلاعات اصلی
    const fullName =
      document.getElementById("fullName")?.value.trim();

    const email =
      document.getElementById("email")?.value.trim();

    const phone =
      document.getElementById("phone")?.value.trim();

    const telegram =
      document.getElementById("telegram")?.value.trim();

    const city =
      document.getElementById("city")?.value.trim();

    const agencyName =
      document.getElementById("agencyName")?.value.trim();


    // بررسی اطلاعات ضروری
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
    const normalizedPhone =
      phone.replace(/\s|-/g, "");


    if (
      !/^(\+98|0098|98|0)?9\d{9}$/.test(
        normalizedPhone
      )
    ) {

      showMessage(
        "شماره موبایل واردشده معتبر نیست.",
        "error"
      );

      return;
    }


    // بررسی پذیرش قوانین
    const acceptRules =
      document.getElementById("acceptRules");


    if (
      !acceptRules ||
      !acceptRules.checked
    ) {

      showMessage(
        "برای ارسال درخواست باید قوانین نمایندگی را بپذیرید.",
        "error"
      );

      return;
    }


    // جمع‌آوری پاسخ سوالات
    const conditionAnswers = {};


    conditions.forEach((name) => {

      const selected = document.querySelector(
        `input[name="${name}"]:checked`
      );


      conditionAnswers[name] =
        selected
          ? selected.value
          : "";

    });


    // ساخت درخواست نمایندگی
    const agencyRequest = {

      id:
        "AG-" +
        Date.now() +
        "-" +
        Math.floor(
          Math.random() * 1000
        ),


      createdAt:
        new Date().toISOString(),


      status:
        "pending_request",


      applicant: {

        fullName,

        email,

        phone:
          normalizedPhone,

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


      // پاسخ ۱۰ سوال
      conditions:
        conditionAnswers,


      // هزینه نمایندگی
      agencyFee:
        499000,


      // وضعیت پرداخت
      paymentStatus:
        "unpaid"

    };


    // ذخیره درخواست
    try {

      localStorage.setItem(
        "v2gurd_agency_request",
        JSON.stringify(
          agencyRequest
        )
      );

    } catch (error) {

      console.error(
        "Agency request storage error:",
        error
      );


      showMessage(
        "ذخیره درخواست انجام نشد. لطفاً دوباره تلاش کنید.",
        "error"
      );

      return;
    }


    // پیام موفقیت
    showMessage(
      "درخواست شما با موفقیت ثبت شد. در حال انتقال به مرحله پرداخت...",
      "success"
    );


    // انتقال به پرداخت
    setTimeout(() => {

      window.location.href =
        "agency-payment.html?request=" +
        encodeURIComponent(
          agencyRequest.id
        );

    }, 1200);

  });

});
