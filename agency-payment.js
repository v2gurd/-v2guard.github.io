(async () => {

  const SUPABASE_URL =
    "https://psvesfkxtmlnjyhphsfs.supabase.co";

  const SUPABASE_ANON_KEY =
    "sb_publishable_QClWgLVOmPGwPK_kTsL5UA_L0cNqJ4H";

  // -----------------------------
  // Load Supabase
  // -----------------------------

  if (!window.supabase) {

    await new Promise((resolve, reject) => {

      const script = document.createElement("script");

      script.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

      script.onload = resolve;
      script.onerror = reject;

      document.head.appendChild(script);
    });
  }

  const supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

  // -----------------------------
  // Elements
  // -----------------------------

  const $ = (id) =>
    document.getElementById(id);

  const paymentName =
    $("paymentName");

  const trackingCode =
    $("trackingCode");

  const paymentDate =
    $("paymentDate");

  const paymentNote =
    $("paymentNote");

  const paymentDone =
    $("paymentDone");

  const submitPayment =
    $("submitPayment");

  const paymentMessage =
    $("paymentMessage");

  const copyCard =
    $("copyCard");

  const telegramAction =
    $("telegramAction");

  const copyTelegramText =
    $("copyTelegramText");

  const copyStatus =
    $("copyStatus");

  const goTelegram =
    $("goTelegram");

  let telegramMessage = "";

  let textCopied = false;

  // -----------------------------
  // Message
  // -----------------------------

  function showMessage(
    message,
    type = "info"
  ) {

    if (!paymentMessage) return;

    paymentMessage.textContent =
      message;

    paymentMessage.className =
      `payment-message ${type}`;
  }

  // -----------------------------
  // Telegram section
  // -----------------------------

  function showTelegramStep() {

    if (telegramAction) {

      telegramAction.style.display =
        "block";
    }

    if (submitPayment) {

      submitPayment.style.display =
        "none";
    }

    // مهم:
    // تا قبل از کپی متن، دکمه تلگرام خاموش است.

    if (goTelegram) {

      goTelegram.disabled = true;

      goTelegram.onclick = () => {

        if (!textCopied) {

          alert(
            "ابتدا باید متن درخواست را کپی کنید."
          );

          return;
        }

        window.location.href =
          "https://t.me/Vtwoguard";
      };
    }

    // Copy Telegram message

    if (copyTelegramText) {

      copyTelegramText.onclick =
        async () => {

          if (!telegramMessage) {

            showMessage(
              "متن درخواست آماده نیست.",
              "error"
            );

            return;
          }

          try {

            await navigator.clipboard.writeText(
              telegramMessage
            );

            textCopied = true;

            if (copyStatus) {

              copyStatus.textContent =
                "✓ متن درخواست با موفقیت کپی شد";
            }

            copyTelegramText.textContent =
              "✓ متن کپی شد";

            copyTelegramText.style.background =
              "#26e0c9";

            copyTelegramText.style.color =
              "#03100e";

            // فعال شدن دکمه PV

            if (goTelegram) {

              goTelegram.disabled =
                false;
            }

          } catch (error) {

            console.error(
              "COPY TELEGRAM ERROR:",
              error
            );

            if (copyStatus) {

              copyStatus.textContent =
                "کپی خودکار انجام نشد؛ دوباره تلاش کنید.";
            }
          }
        };
    }
  }

  // -----------------------------
  // Main
  // -----------------------------

  try {

    // Auth

    const {
      data: { user },
      error: authError
    } =
      await supabaseClient.auth.getUser();

    if (authError || !user) {

      throw new Error(
        "ابتدا وارد حساب کاربری خود شوید."
      );
    }

    // Request ID

    const params =
      new URLSearchParams(
        window.location.search
      );

    const requestId =
      params.get("request") ||
      localStorage.getItem(
        "v2gurd_agency_request_id"
      );

    if (!requestId) {

      throw new Error(
        "شناسه درخواست نمایندگی پیدا نشد."
      );
    }

    // Get agency

    const {
      data: agency,
      error: agencyError
    } =
      await supabaseClient
        .from("agencies")
        .select("*")
        .eq("id", requestId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (agencyError) {

      console.error(
        "AGENCY FETCH ERROR:",
        agencyError
      );

      throw new Error(
        "اطلاعات درخواست نمایندگی دریافت نشد."
      );
    }

    if (!agency) {

      throw new Error(
        "درخواست نمایندگی پیدا نشد."
      );
    }

    // -----------------------------
    // Defaults
    // -----------------------------

    if (
      paymentName &&
      !paymentName.value
    ) {

      paymentName.value =
        agency.full_name || "";
    }

    if (
      paymentDate &&
      !paymentDate.value
    ) {

      paymentDate.value =
        new Date()
          .toISOString()
          .split("T")[0];
    }

    // -----------------------------
    // Existing submitted
    // -----------------------------

    if (
      agency.payment_status ===
      "submitted"
    ) {

      showMessage(
        "رسید پرداخت شما قبلاً ثبت شده و در حال بررسی است.",
        "success"
      );

      if (submitPayment) {

        submitPayment.style.display =
          "none";
      }

      // ساخت متن از اطلاعات موجود

      const oldPayment =
        agency.payment_data || {};

      telegramMessage =
`سلام، من درخواست نمایندگی V2GURD ثبت کردم.

👤 نام و نام خانوادگی: ${agency.full_name || "-"}
🏢 نام نمایندگی: ${agency.agency_name || "-"}
📧 ایمیل: ${agency.email || user.email || "-"}
📱 شماره تماس: ${agency.phone || "-"}
💬 تلگرام: ${agency.telegram || "-"}
📍 شهر: ${agency.city || "-"}

💳 مبلغ پرداختی: ۴۹۹٬۰۰۰ تومان
👤 نام پرداخت‌کننده: ${oldPayment.payer_name || "-"}
📅 تاریخ پرداخت: ${oldPayment.payment_date || "-"}
🔢 کد پیگیری: ${oldPayment.tracking_code || "ندارد"}

لطفاً درخواست من رو بررسی کنید و در صورت تأیید، نمایندگی من رو فعال کنید.`;

      showTelegramStep();

      return;
    }

    // -----------------------------
    // Already verified
    // -----------------------------

    if (
      agency.payment_status ===
      "verified"
    ) {

      showMessage(
        "پرداخت شما قبلاً تأیید شده است.",
        "success"
      );

      if (submitPayment) {

        submitPayment.style.display =
          "none";
      }

      return;
    }

    // -----------------------------
    // Copy card
    // -----------------------------

    if (copyCard) {

      copyCard.addEventListener(
        "click",
        async () => {

          try {

            await navigator.clipboard.writeText(
              "6219861841635526"
            );

            const oldText =
              copyCard.textContent;

            copyCard.textContent =
              "✓ کپی شد";

            setTimeout(() => {

              copyCard.textContent =
                oldText;

            }, 1800);

          } catch (error) {

            alert(
              "کپی شماره کارت انجام نشد."
            );
          }
        }
      );
    }

    // -----------------------------
    // Submit payment
    // -----------------------------

    if (submitPayment) {

      submitPayment.addEventListener(
        "click",
        async () => {

          try {

            submitPayment.disabled =
              true;

            submitPayment.textContent =
              "در حال ثبت رسید...";

            const payer =
              paymentName?.value.trim() ||
              "";

            const tracking =
              trackingCode?.value.trim() ||
              "";

            const date =
              paymentDate?.value ||
              "";

            const note =
              paymentNote?.value.trim() ||
              "";

            if (!payer) {

              throw new Error(
                "نام پرداخت‌کننده را وارد کنید."
              );
            }

            if (
              !paymentDone?.checked
            ) {

              throw new Error(
                "لطفاً تأیید کنید که مبلغ نمایندگی را پرداخت کرده‌اید."
              );
            }

            const paymentData = {

              amount: 499000,

              payer_name:
                payer,

              payment_date:
                date,

              tracking_code:
                tracking,

              note:
                note,

              card_number:
                "6219861841635526",

              bank_name:
                "بلو بانک",

              account_name:
                "نامی",

              status:
                "submitted",

              submitted_at:
                new Date().toISOString()
            };

            // -----------------------------
            // Save to Supabase
            // -----------------------------

            const {
              error
            } =
              await supabaseClient
                .from("agencies")
                .update({

                  payment_status:
                    "submitted",

                  payment_data:
                    paymentData

                })
                .eq(
                  "id",
                  agency.id
                )
                .eq(
                  "user_id",
                  user.id
                );

            if (error) {

              console.error(
                "AGENCY PAYMENT UPDATE ERROR:",
                error
              );

              throw new Error(
                `ثبت رسید پرداخت انجام نشد: ${
                  error.message ||
                  error.code ||
                  "خطای نامشخص"
                }`
              );
            }

            // -----------------------------
            // Local save
            // -----------------------------

            localStorage.setItem(
              "v2gurd_agency_payment",
              JSON.stringify(
                paymentData
              )
            );

            // -----------------------------
            // Telegram message
            // -----------------------------

            telegramMessage =
`سلام، من درخواست نمایندگی V2GURD ثبت کردم.

👤 نام و نام خانوادگی: ${agency.full_name || "-"}
🏢 نام نمایندگی: ${agency.agency_name || "-"}
📧 ایمیل: ${agency.email || user.email || "-"}
📱 شماره تماس: ${agency.phone || "-"}
💬 تلگرام: ${agency.telegram || "-"}
📍 شهر: ${agency.city || "-"}

💳 مبلغ پرداختی: ۴۹۹٬۰۰۰ تومان
👤 نام پرداخت‌کننده: ${payer}
📅 تاریخ پرداخت: ${date || "-"}
🔢 کد پیگیری: ${tracking || "ندارد"}

لطفاً درخواست من رو بررسی کنید و در صورت تأیید، نمایندگی من رو فعال کنید.`;

            // هنوز کپی نشده

            textCopied = false;

            // نمایش بخش تلگرام

            showTelegramStep();

            showMessage(
              "رسید پرداخت با موفقیت ثبت شد. ابتدا متن درخواست را کپی کنید.",
              "success"
            );

          } catch (error) {

            console.error(
              error
            );

            showMessage(
              error.message ||
              "ثبت رسید پرداخت انجام نشد.",
              "error"
            );

            submitPayment.disabled =
              false;

            submitPayment.textContent =
              "📩 ثبت رسید پرداخت";
          }
        }
      );
    }

  } catch (error) {

    console.error(
      error
    );

    showMessage(
      error.message ||
      "خطایی رخ داد.",
      "error"
    );
  }

})();
