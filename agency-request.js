/* =========================================================
   V2GURD - Agency Request
   اتصال فرم درخواست نمایندگی به Supabase
   ========================================================= */

(() => {
  const SUPABASE_URL = "https://psvesfkxtmlnjyhphsfs.supabase.co";
  const SUPABASE_ANON_KEY =
    "sb_publishable_QClWgLVOmPGwPK_kTsL5UA_L0cNqJ4H";

  const SUPABASE_CDN =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabase) {
        resolve();
        return;
      }

      const oldScript = document.querySelector(
        'script[src*="@supabase/supabase-js"]'
      );

      if (oldScript) {
        oldScript.addEventListener("load", resolve, { once: true });
        oldScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = SUPABASE_CDN;
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Supabase SDK could not be loaded."));

      document.head.appendChild(script);
    });
  }

  function showMessage(text, type = "error") {
    const message =
      document.getElementById("formMessage") ||
      document.querySelector(".form-message");

    if (!message) {
      alert(text);
      return;
    }

    message.textContent = text;
    message.className = `form-message ${type}`;

    message.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function getValue(id) {
    return document.getElementById(id)?.value.trim() || "";
  }

  function getSelected(name) {
    const input = document.querySelector(
      `input[name="${name}"]:checked`
    );

    return input ? input.value : "";
  }

  function normalizePhone(phone) {
    return phone.replace(/[^\d+]/g, "");
  }

  function validPhone(phone) {
    const normalized = normalizePhone(phone);

    return /^(?:\+98|0098|98|0)?9\d{9}$/.test(normalized);
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("agencyForm");

    if (!form) return;

    try {
      /* -----------------------------------------------------
         بارگذاری Supabase
         ----------------------------------------------------- */

      await loadSupabase();

      if (!window.supabase) {
        throw new Error("Supabase is unavailable.");
      }

      const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );

      /* -----------------------------------------------------
         بررسی ورود کاربر

         نکته مهم: نه از auth.getUser() و نه حتی از یک فراخوانی
         تنهای auth.getSession() استفاده نمی‌کنیم. دلیل:

         - getUser() یک درخواست شبکه‌ای واقعی به سرور Supabase
           می‌فرستد تا توکن را دوباره اعتبارسنجی کند؛ در لحظه‌ی
           لود اولیه صفحه (هم‌زمان با فونت‌ها، CSS و اسکریپت‌های
           دیگر) این درخواست می‌تواند کند شود یا خطا بدهد.

         - getSession() به‌تنهایی هم می‌تواند دچار race condition
           شود: اگر بلافاصله بعد از createClient() صدا زده شود،
           ممکن است initialize داخلی کلاینت (خواندن سشن از
           storage) هنوز تمام نشده باشد و مقدار null برگرداند —
           حتی برای کاربر لاگین‌شده.

         راه‌حل قطعی و بدون race که خود مستندات Supabase برای
         این دقیقاً همین مورد پیشنهاد می‌دهد: گوش دادن به رویداد
         "INITIAL_SESSION" روی auth.onAuthStateChange(). این
         رویداد فقط زمانی fire می‌شود که کلاینت کار خواندن سشن
         از storage را قطعاً و کامل تمام کرده باشد؛ بنابراین
         دیگر هیچ وابستگی‌ای به سرعت شبکه یا لحظه‌ی اجرای اسکریپت
         وجود ندارد و پاسخ همیشه قابل‌اعتماد است.
         ----------------------------------------------------- */

      const initialSession = await new Promise((resolve) => {
        const {
          data: { subscription }
        } = supabaseClient.auth.onAuthStateChange(
          (event, session) => {
            if (event === "INITIAL_SESSION") {
              subscription.unsubscribe();
              resolve(session);
            }
          }
        );
      });

      const user = initialSession?.user || null;

      if (!user) {
        /* -------------------------------------------------
           کاربر لاگین نیست: به‌جای ریدایرکت خودکار به
           index.html، روی همان صفحه نگه‌اش می‌داریم و با یک
           پیام واضح از او می‌خواهیم اول ثبت‌نام/ورود کند.
           فرم غیرفعال می‌شود تا بدون حساب کاربری قابل ارسال
           نباشد، اما هیچ ریدایرکت خودکاری اتفاق نمی‌افتد.
           ------------------------------------------------- */

        showMessage(
          "برای ثبت درخواست نمایندگی ابتدا باید ثبت‌نام کرده و وارد حساب کاربری خود شوید.",
          "error"
        );

        form
          .querySelectorAll("input, textarea, button")
          .forEach((el) => {
            el.disabled = true;
          });

        const messageBox =
          document.getElementById("formMessage") ||
          document.querySelector(".form-message");

        if (
          messageBox &&
          !document.getElementById("agencyLoginLink")
        ) {
          const loginLink = document.createElement("a");

          loginLink.id = "agencyLoginLink";
          loginLink.href = "index.html";
          loginLink.className = "submit-button";
          loginLink.style.marginTop = "14px";
          loginLink.style.textDecoration = "none";

          loginLink.innerHTML =
            "<span>ثبت‌نام یا ورود به حساب کاربری</span>" +
            '<span class="button-arrow">←</span>';

          messageBox.insertAdjacentElement(
            "afterend",
            loginLink
          );
        }

        return;
      }

      /* -----------------------------------------------------
         ارسال فرم
         ----------------------------------------------------- */

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        /* -----------------------------------------------
           اطلاعات اصلی
           ----------------------------------------------- */

        const fullName = getValue("fullName");
        const email = getValue("email");
        const phone = getValue("phone");
        const telegram = getValue("telegram");
        const city = getValue("city");
        const agencyName = getValue("agencyName");
        const salesChannels = getValue("salesChannels");
        const notes = getValue("notes");

        /* -----------------------------------------------
           بررسی اطلاعات
           ----------------------------------------------- */

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

        if (!validEmail(email)) {
          showMessage(
            "لطفاً یک ایمیل معتبر وارد کنید.",
            "error"
          );
          return;
        }

        if (!validPhone(phone)) {
          showMessage(
            "شماره موبایل واردشده معتبر نیست.",
            "error"
          );
          return;
        }

        const acceptRules =
          document.getElementById("acceptRules");

        if (!acceptRules || !acceptRules.checked) {
          showMessage(
            "برای ارسال درخواست باید قوانین نمایندگی را بپذیرید.",
            "error"
          );
          return;
        }

        /* -----------------------------------------------
           سوالات شرایط نمایندگی
           ----------------------------------------------- */

        const conditionNames = [
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

        const conditions = {};

        for (const name of conditionNames) {
          const answer = getSelected(name);

          if (!answer) {
            showMessage(
              "لطفاً به تمام سوالات بخش شرایط نمایندگی پاسخ دهید.",
              "error"
            );
            return;
          }

          conditions[name] = answer;
        }

        /* -----------------------------------------------
           تمام شرایط باید تأیید شده باشند
           ----------------------------------------------- */

        const allAccepted = conditionNames.every(
          (name) => conditions[name] === "yes"
        );

        if (!allAccepted) {
          showMessage(
            "برای ثبت درخواست نمایندگی باید با تمام شرایط اعلام‌شده موافق باشید.",
            "error"
          );
          return;
        }

        /* -----------------------------------------------
           دکمه ارسال
           ----------------------------------------------- */

        const submitButton =
          form.querySelector('button[type="submit"]');

        const originalButtonText =
          submitButton?.textContent || "ثبت درخواست";

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "در حال ثبت درخواست...";
        }

        try {
          /* ---------------------------------------------
             بررسی درخواست قبلی
             --------------------------------------------- */

          const {
            data: existingRequests,
            error: existingError
          } = await supabaseClient
            .from("agencies")
            .select(
              "id,status,payment_status,created_at"
            )
            .eq("user_id", user.id)
            .in("status", [
              "pending",
              "payment_pending",
              "active"
            ])
            .order("created_at", {
              ascending: false
            })
            .limit(1);

          if (existingError) {
            throw existingError;
          }

          /* ---------------------------------------------
             اگر درخواست قبلی وجود داشته باشد
             --------------------------------------------- */

          if (
            existingRequests &&
            existingRequests.length > 0
          ) {
            const existing = existingRequests[0];

            localStorage.setItem(
              "v2gurd_agency_request_id",
              existing.id
            );

            showMessage(
              "برای حساب شما یک درخواست نمایندگی موجود است. در حال انتقال...",
              "success"
            );

            setTimeout(() => {
              window.location.href =
                "agency-payment.html?request=" +
                encodeURIComponent(existing.id);
            }, 900);

            return;
          }

          /* ---------------------------------------------
             ثبت درخواست جدید در Supabase
             --------------------------------------------- */

          const normalizedPhone =
            normalizePhone(phone);

          const {
            data: agency,
            error: insertError
          } = await supabaseClient
            .from("agencies")
            .insert({
              user_id: user.id,

              full_name: fullName,
              email: email,
              phone: normalizedPhone,
              telegram: telegram,
              city: city,
              agency_name: agencyName,

              sales_channels:
                salesChannels || null,

              notes:
                notes || null,

              conditions: conditions,

              status: "payment_pending",

              agency_fee: 499000,

              payment_status: "unpaid"
            })
            .select(
              "id,status,payment_status,created_at"
            )
            .single();

          if (insertError) {
            throw insertError;
          }

          if (!agency?.id) {
            throw new Error(
              "Agency request ID was not returned."
            );
          }

          /* ---------------------------------------------
             نگهداری موقت برای سازگاری با فایل‌های فعلی
             --------------------------------------------- */

          localStorage.setItem(
            "v2gurd_agency_request_id",
            agency.id
          );

          localStorage.setItem(
            "v2gurd_agency_request",
            JSON.stringify({
              id: agency.id,

              createdAt:
                agency.created_at,

              status:
                agency.status,

              paymentStatus:
                agency.payment_status,

              applicant: {
                fullName,
                email,
                phone: normalizedPhone,
                telegram,
                city,
                agencyName,
                salesChannels,
                notes
              },

              conditions,

              agencyFee: 499000
            })
          );

          /* ---------------------------------------------
             موفقیت
             --------------------------------------------- */

          showMessage(
            "درخواست نمایندگی با موفقیت ثبت شد. در حال انتقال به مرحله پرداخت...",
            "success"
          );

          setTimeout(() => {
            window.location.href =
              "agency-payment.html?request=" +
              encodeURIComponent(agency.id);
          }, 1000);

        } catch (error) {
          console.error(
            "V2GURD Agency Request Error:",
            error
          );

          let errorMessage =
            "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید.";

          /*
             خطاهای رایج Supabase
          */

          if (
            error?.code === "23505"
          ) {
            errorMessage =
              "برای این حساب قبلاً درخواست نمایندگی ثبت شده است.";
          }

          if (
            error?.message?.includes("row-level security")
          ) {
            errorMessage =
              "دسترسی ثبت درخواست در سیستم مدیریت نشده است.";
          }

          showMessage(
            errorMessage,
            "error"
          );

          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent =
              originalButtonText;
          }
        }
      });

    } catch (error) {
      console.error(
        "V2GURD Agency Initialization Error:",
        error
      );

      showMessage(
        "اتصال به سیستم ثبت درخواست برقرار نشد. لطفاً صفحه را دوباره باز کنید.",
        "error"
      );
    }
  });
})();
