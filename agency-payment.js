(() => {
  const SUPABASE_URL =
    "https://psvesfkxtmlnjyhphsfs.supabase.co";

  const SUPABASE_ANON_KEY =
    "sb_publishable_QClWgLVOmPGwPK_kTsL5UA_L0cNqJ4H";

  const SUPABASE_CDN =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

  const AGENCY_FEE = 499000;

  const CARD_NUMBER = "6219861841635526";
  const BANK_NAME = "بلو بانک";
  const ACCOUNT_NAME = "نامی";

  const TELEGRAM_URL = "https://t.me/Vtwoguard";

  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabase) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = SUPABASE_CDN;
      script.async = true;

      script.onload = resolve;
      script.onerror = () =>
        reject(new Error("Supabase SDK load failed."));

      document.head.appendChild(script);
    });
  }

  function showMessage(text, type = "error") {
    const message =
      document.getElementById("paymentMessage");

    if (!message) {
      alert(text);
      return;
    }

    message.textContent = text;
    message.className =
      "payment-message " + type;

    message.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function getRequestId() {
    const params =
      new URLSearchParams(window.location.search);

    return (
      params.get("request") ||
      localStorage.getItem(
        "v2gurd_agency_request_id"
      )
    );
  }

  function getPersianDate() {
    try {
      return new Intl.DateTimeFormat(
        "fa-IR-u-ca-persian",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }
      ).format(new Date());
    } catch {
      return new Date().toLocaleDateString("fa-IR");
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);

    if (el) {
      el.textContent = value;
    }
  }

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(
        CARD_NUMBER
      );

      showMessage(
        "شماره کارت کپی شد.",
        "success"
      );
    } catch {
      showMessage(
        "کپی خودکار انجام نشد.",
        "error"
      );
    }
  }

  document.addEventListener(
    "DOMContentLoaded",
    async () => {
      try {
        await loadSupabase();

        const supabaseClient =
          window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
          );

        /* ================================
           بررسی ورود
           ================================ */

        const {
          data: { user },
          error: authError
        } =
          await supabaseClient.auth.getUser();

        if (authError || !user) {
          showMessage(
            "برای ادامه ابتدا وارد حساب کاربری شوید.",
            "error"
          );

          setTimeout(() => {
            window.location.href =
              "index.html";
          }, 1500);

          return;
        }

        /* ================================
           دریافت شناسه درخواست
           ================================ */

        const requestId =
          getRequestId();

        if (!requestId) {
          showMessage(
            "شناسه درخواست نمایندگی پیدا نشد.",
            "error"
          );

          return;
        }

        /* ================================
           دریافت درخواست از Supabase
           ================================ */

        const {
          data: agency,
          error: agencyError
        } =
          await supabaseClient
            .from("agencies")
            .select(
              "id,user_id,full_name,email,phone,telegram,city,agency_name,status,payment_status,agency_fee,payment_data"
            )
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single();

        if (agencyError || !agency) {
          console.error(
            "Agency error:",
            agencyError
          );

          showMessage(
            "درخواست نمایندگی پیدا نشد.",
            "error"
          );

          return;
        }

        /* ================================
           اطلاعات صفحه
           ================================ */

        setText(
          "cardNumber",
          CARD_NUMBER
        );

        const paymentName =
          document.getElementById(
            "paymentName"
          );

        if (
          paymentName &&
          !paymentName.value
        ) {
          paymentName.value =
            agency.full_name || "";
        }

        const paymentDate =
          document.getElementById(
            "paymentDate"
          );

        if (
          paymentDate &&
          !paymentDate.value
        ) {
          paymentDate.value =
            new Date()
              .toISOString()
              .split("T")[0];
        }

        /* ================================
           کپی کارت
           ================================ */

        const copyButton =
          document.getElementById(
            "copyCard"
          );

        if (copyButton) {
          copyButton.addEventListener(
            "click",
            copyCard
          );
        }

        /* ================================
           اگر قبلاً رسید ارسال شده
           ================================ */

        if (
          agency.payment_status ===
          "submitted"
        ) {
          showMessage(
            "رسید پرداخت شما قبلاً ثبت شده و در حال بررسی است.",
            "success"
          );

          const button =
            document.getElementById(
              "submitPayment"
            );

          if (button) {
            button.disabled = true;
            button.textContent =
              "در حال بررسی";
          }

          return;
        }

        if (
          agency.payment_status ===
          "verified"
        ) {
          showMessage(
            "پرداخت شما قبلاً تأیید شده است.",
            "success"
          );

          const button =
            document.getElementById(
              "submitPayment"
            );

          if (button) {
            button.disabled = true;
            button.textContent =
              "پرداخت تأیید شده";
          }

          return;
        }

        /* ================================
           دکمه ارسال رسید
           ================================ */

        const submitButton =
          document.getElementById(
            "submitPayment"
          );

        if (!submitButton) {
          console.error(
            "submitPayment button not found."
          );

          return;
        }

        submitButton.textContent =
          "📩 ارسال رسید برای بررسی";

        submitButton.addEventListener(
          "click",
          async () => {

            const payerName =
              document
                .getElementById(
                  "paymentName"
                )
                ?.value.trim() || "";

            const trackingCode =
              document
                .getElementById(
                  "trackingCode"
                )
                ?.value.trim() || "";

            const paymentDate =
              document
                .getElementById(
                  "paymentDate"
                )
                ?.value || "";

            const paymentNote =
              document
                .getElementById(
                  "paymentNote"
                )
                ?.value.trim() || "";

            const paymentDone =
              document.getElementById(
                "paymentDone"
              );

            /* ==========================
               اعتبارسنجی
               ========================== */

            if (!payerName) {
              showMessage(
                "لطفاً نام پرداخت‌کننده را وارد کنید.",
                "error"
              );

              return;
            }

            if (
              paymentDone &&
              !paymentDone.checked
            ) {
              showMessage(
                "لطفاً تأیید کنید که مبلغ را پرداخت کرده‌اید.",
                "error"
              );

              return;
            }

            submitButton.disabled =
              true;

            submitButton.textContent =
              "در حال ثبت رسید...";

            try {

              /* ========================
                 اطلاعات پرداخت
                 ======================== */

              const paymentData = {
                amount:
                  AGENCY_FEE,

                payer_name:
                  payerName,

                payment_date:
                  paymentDate ||
                  getPersianDate(),

                tracking_code:
                  trackingCode ||
                  null,

                note:
                  paymentNote ||
                  null,

                card_number:
                  CARD_NUMBER,

                bank_name:
                  BANK_NAME,

                account_name:
                  ACCOUNT_NAME,

                status:
                  "submitted",

                submitted_at:
                  new Date().toISOString()
              };

              /* ========================
                 ثبت در Supabase
                 ======================== */

              const {
                error: updateError
              } =
                await supabaseClient
                  .from("agencies")
                  .update({
                    payment_status:
                      "submitted",

                    payment_data:
                      paymentData,

                    status:
                      "pending"
                  })
                  .eq(
                    "id",
                    agency.id
                  )
                  .eq(
                    "user_id",
                    user.id
                  );

              if (updateError) {
                throw updateError;
              }

              /* ========================
                 ذخیره محلی
                 ======================== */

              localStorage.setItem(
                "v2gurd_agency_payment",
                JSON.stringify({
                  agencyId:
                    agency.id,

                  payment:
                    paymentData
                })
              );

              /* ========================
                 ساخت پیام تلگرام
                 ======================== */

              const telegramMessage =
`سلام، من درخواست نمایندگی V2GURD ثبت کردم.

👤 نام:
${agency.full_name}

🏢 نام نمایندگی:
${agency.agency_name}

📧 ایمیل:
${agency.email}

📱 شماره تماس:
${agency.phone}

💬 تلگرام:
${agency.telegram}

📍 شهر:
${agency.city}

💳 مبلغ پرداخت:
۴۹۹٬۰۰۰ تومان

👤 نام پرداخت‌کننده:
${payerName}

🧾 کد پیگیری:
${trackingCode || "وارد نشده"}

📅 تاریخ پرداخت:
${paymentDate || getPersianDate()}

لطفاً درخواست نمایندگی من را بررسی کنید و در صورت تأیید، نمایندگی من را فعال کنید.`;

              /* ========================
                 کپی پیام
                 ======================== */

              try {
                await navigator.clipboard.writeText(
                  telegramMessage
                );
              } catch {
                // اگر کپی در مرورگر اجازه داده نشد
              }

              /* ========================
                 نمایش پیام موفقیت
                 ======================== */

              showMessage(
                "رسید ثبت شد. پیام درخواست شما آماده است؛ در حال انتقال به PV مدیریت...",
                "success"
              );

              submitButton.textContent =
                "انتقال به PV مدیریت...";

              /* ========================
                 انتقال به PV
                 ======================== */

              setTimeout(() => {
                window.location.href =
                  TELEGRAM_URL;
              }, 1200);

            } catch (error) {

              console.error(
                "Agency payment submit error:",
                error
              );

              showMessage(
                "ثبت رسید پرداخت انجام نشد. لطفاً دوباره تلاش کنید.",
                "error"
              );

              submitButton.disabled =
                false;

              submitButton.textContent =
                "📩 ارسال رسید برای بررسی";
            }
          }
        );

      } catch (error) {

        console.error(
          "Agency payment initialization error:",
          error
        );

        showMessage(
          "اتصال به سیستم پرداخت برقرار نشد.",
          "error"
        );
      }
    }
  );
})();
