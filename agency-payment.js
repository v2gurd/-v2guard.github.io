/* =========================================================
   V2GURD - Agency Payment
   پرداخت کارت‌به‌کارت نمایندگی
   مبلغ: 499,000 تومان
   ========================================================= */

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
        reject(
          new Error("Supabase SDK could not be loaded.")
        );

      document.head.appendChild(script);
    });
  }

  function showMessage(text, type = "error") {
    const message =
      document.getElementById("paymentMessage") ||
      document.getElementById("formMessage") ||
      document.querySelector(".form-message");

    if (!message) {
      alert(text);
      return;
    }

    message.textContent = text;
    message.className =
      "form-message " + type;

    message.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function getTodayPersian() {
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

  function getOrderId() {
    const params =
      new URLSearchParams(window.location.search);

    return (
      params.get("request") ||
      params.get("agency") ||
      localStorage.getItem(
        "v2gurd_agency_request_id"
      )
    );
  }

  function setText(id, value) {
    const element =
      document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  }

  function setInputValue(id, value) {
    const element =
      document.getElementById(id);

    if (element && !element.value) {
      element.value = value;
    }
  }

  function copyCardNumber() {
    navigator.clipboard
      .writeText(CARD_NUMBER)
      .then(() => {
        showMessage(
          "شماره کارت کپی شد.",
          "success"
        );
      })
      .catch(() => {
        showMessage(
          "کپی خودکار انجام نشد؛ شماره کارت را دستی کپی کنید.",
          "error"
        );
      });
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

        /* ---------------------------------------------
           بررسی ورود
           --------------------------------------------- */

        const {
          data: { user },
          error: userError
        } =
          await supabaseClient.auth.getUser();

        if (userError || !user) {
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

        /* ---------------------------------------------
           دریافت شناسه درخواست
           --------------------------------------------- */

        const requestId =
          getOrderId();

        if (!requestId) {
          showMessage(
            "شناسه درخواست نمایندگی پیدا نشد.",
            "error"
          );

          return;
        }

        /* ---------------------------------------------
           دریافت درخواست از Supabase
           --------------------------------------------- */

        const {
          data: agency,
          error: agencyError
        } =
          await supabaseClient
            .from("agencies")
            .select(
              "id,user_id,full_name,email,agency_name,status,payment_status,agency_fee,payment_data"
            )
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single();

        if (agencyError || !agency) {
          console.error(
            "Agency fetch error:",
            agencyError
          );

          showMessage(
            "درخواست نمایندگی پیدا نشد یا متعلق به این حساب نیست.",
            "error"
          );

          return;
        }

        /* ---------------------------------------------
           اطلاعات صفحه
           --------------------------------------------- */

        setText(
          "agencyName",
          agency.agency_name ||
            "نمایندگی V2GURD"
        );

        setText(
          "applicantName",
          agency.full_name || "-"
        );

        setText(
          "agencyFee",
          AGENCY_FEE.toLocaleString(
            "fa-IR"
          ) + " تومان"
        );

        setText(
          "paymentAmount",
          AGENCY_FEE.toLocaleString(
            "fa-IR"
          ) + " تومان"
        );

        setText(
          "cardNumber",
          CARD_NUMBER
        );

        setText(
          "bankName",
          BANK_NAME
        );

        setText(
          "accountName",
          ACCOUNT_NAME
        );

        setInputValue(
          "payerName",
          agency.full_name || ""
        );

        setInputValue(
          "paymentDate",
          getTodayPersian()
        );

        /* ---------------------------------------------
           وضعیت پرداخت قبلی
           --------------------------------------------- */

        if (
          agency.payment_status ===
            "submitted" ||
          agency.payment_status ===
            "verified"
        ) {
          showMessage(
            agency.payment_status ===
              "verified"
              ? "پرداخت شما قبلاً تأیید شده است."
              : "رسید پرداخت شما قبلاً ثبت شده و در انتظار بررسی است.",
            "success"
          );

          const submitButton =
            document.querySelector(
              'button[type="submit"]'
            );

          if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent =
              agency.payment_status ===
              "verified"
                ? "پرداخت تأیید شده"
                : "رسید قبلاً ثبت شده";
          }

          return;
        }

        /* ---------------------------------------------
           کپی شماره کارت
           --------------------------------------------- */

        const copyButtons =
          document.querySelectorAll(
            "[data-copy-card], #copyCard, .copy-card"
          );

        copyButtons.forEach(
          (button) => {
            button.addEventListener(
              "click",
              copyCardNumber
            );
          }
        );

        /* ---------------------------------------------
           فرم پرداخت
           --------------------------------------------- */

        const form =
          document.getElementById(
            "agencyPaymentForm"
          ) ||
          document.getElementById(
            "paymentForm"
          );

        if (!form) {
          console.warn(
            "Agency payment form not found."
          );
          return;
        }

        form.addEventListener(
          "submit",
          async (event) => {
            event.preventDefault();

            const payerName =
              document
                .getElementById(
                  "payerName"
                )
                ?.value.trim() || "";

            const paymentDate =
              document
                .getElementById(
                  "paymentDate"
                )
                ?.value.trim() || "";

            const trackingCode =
              document
                .getElementById(
                  "trackingCode"
                )
                ?.value.trim() || "";

            const note =
              document
                .getElementById(
                  "paymentNote"
                )
                ?.value.trim() || "";

            const accepted =
              document.getElementById(
                "paymentConfirm"
              ) ||
              document.getElementById(
                "acceptPayment"
              );

            /* -----------------------------------------
               اعتبارسنجی
               ----------------------------------------- */

            if (!payerName) {
              showMessage(
                "نام پرداخت‌کننده را وارد کنید.",
                "error"
              );
              return;
            }

            if (!paymentDate) {
              showMessage(
                "تاریخ پرداخت را وارد کنید.",
                "error"
              );
              return;
            }

            if (
              accepted &&
              !accepted.checked
            ) {
              showMessage(
                "لطفاً تأیید کنید که مبلغ را به حساب اعلام‌شده واریز کرده‌اید.",
                "error"
              );
              return;
            }

            const submitButton =
              form.querySelector(
                'button[type="submit"]'
              );

            if (submitButton) {
              submitButton.disabled = true;
              submitButton.textContent =
                "در حال ثبت رسید...";
            }

            try {
              /* ---------------------------------------
                 اطلاعات پرداخت
                 --------------------------------------- */

              const paymentData = {
                amount: AGENCY_FEE,

                payer_name:
                  payerName,

                payment_date:
                  paymentDate,

                tracking_code:
                  trackingCode ||
                  null,

                note:
                  note || null,

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

              /* ---------------------------------------
                 ذخیره در agencies
                 --------------------------------------- */

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

              /* ---------------------------------------
                 ذخیره محلی برای سازگاری
                 --------------------------------------- */

              localStorage.setItem(
                "v2gurd_agency_payment",
                JSON.stringify({
                  agencyId:
                    agency.id,

                  amount:
                    AGENCY_FEE,

                  paymentData
                })
              );

              /* ---------------------------------------
                 موفقیت
                 --------------------------------------- */

              showMessage(
                "رسید پرداخت با موفقیت ثبت شد. پرداخت شما در انتظار بررسی مدیریت است.",
                "success"
              );

              if (submitButton) {
                submitButton.textContent =
                  "رسید ثبت شد";
              }

              setTimeout(() => {
                window.location.href =
                  "agency-dashboard.html";
              }, 1800);

            } catch (error) {
              console.error(
                "Agency payment error:",
                error
              );

              showMessage(
                "ثبت رسید پرداخت انجام نشد. لطفاً دوباره تلاش کنید.",
                "error"
              );

              if (submitButton) {
                submitButton.disabled =
                  false;

                submitButton.textContent =
                  "ثبت رسید پرداخت";
              }
            }
          }
        );

      } catch (error) {
        console.error(
          "Agency payment initialization error:",
          error
        );

        showMessage(
          "اتصال به سیستم پرداخت برقرار نشد. لطفاً صفحه را دوباره باز کنید.",
          "error"
        );
      }
    }
  );
})();
