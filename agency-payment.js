(() => {
  "use strict";

  const SUPABASE_URL = "https://psvesfkxtmlnjyhphsfs.supabase.co";
  const SUPABASE_ANON_KEY =
    "sb_publishable_QClWgLVOmPGwPK_kTsL5UA_L0cNqJ4H";

  const CARD_NUMBER = "6219861841635526";
  const BANK_NAME = "بلو بانک";
  const ACCOUNT_NAME = "نامی";
  const AGENCY_FEE = 499000;
  const TELEGRAM_URL = "https://t.me/Vtwoguard";

  let supabaseClient = null;
  let agency = null;

  const $ = (id) => document.getElementById(id);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);

      if (existing) {
        if (window.supabase) {
          resolve();
        } else {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
        }
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function showMessage(text, type = "error") {
    const box = $("paymentMessage");

    if (!box) return;

    box.textContent = text;
    box.className = `payment-message ${type}`;
  }

  function hideMessage() {
    const box = $("paymentMessage");

    if (!box) return;

    box.textContent = "";
    box.className = "payment-message";
  }

  function setLoading(button, loading, text = "") {
    if (!button) return;

    button.disabled = loading;

    if (loading) {
      button.dataset.oldText = button.textContent;
      button.textContent = text || "در حال ثبت...";
    } else {
      button.textContent =
        button.dataset.oldText || "📩 ارسال رسید برای بررسی";
    }
  }

  function getRequestId() {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("request") ||
      localStorage.getItem("v2gurd_agency_request_id") ||
      ""
    );
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function buildTelegramMessage(paymentData) {
    return `سلام، من درخواست نمایندگی V2GURD ثبت کردم.

نام: ${agency.full_name || "-"}
نام نمایندگی: ${agency.agency_name || "-"}
ایمیل: ${agency.email || "-"}
شماره تماس: ${agency.phone || "-"}
تلگرام: ${agency.telegram || "-"}
شهر: ${agency.city || "-"}

مبلغ پرداختی: ۴۹۹٬۰۰۰ تومان
نام پرداخت‌کننده: ${paymentData.payer_name || "-"}
کد پیگیری: ${paymentData.tracking_code || "-"}
تاریخ پرداخت: ${paymentData.payment_date || "-"}

لطفاً درخواست من رو بررسی کنید و در صورت تأیید، نمایندگی من رو فعال کنید.`;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      let copied = false;

      try {
        copied = document.execCommand("copy");
      } catch (_) {
        copied = false;
      }

      textarea.remove();
      return copied;
    }
  }

  function showTelegramStep(message) {
    const submitButton = $("submitPayment");
    const telegramAction = $("telegramAction");
    const telegramCopyInfo = $("telegramCopyInfo");
    const goTelegram = $("goTelegram");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.style.display = "none";
    }

    if (telegramCopyInfo) {
      telegramCopyInfo.textContent =
        "متن درخواست شما کپی شده؛ وارد PV مدیریت شوید و پیام را ارسال کنید.";
    }

    if (telegramAction) {
      telegramAction.hidden = false;
    }

    if (message) {
      showMessage(message, "success");
    }

    if (goTelegram) {
      goTelegram.onclick = () => {
        window.location.href = TELEGRAM_URL;
      };
    }
  }

  async function loadAgency() {
    const requestId = getRequestId();

    if (!requestId) {
      showMessage("شناسه درخواست نمایندگی پیدا نشد.");
      return false;
    }

    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      showMessage("ابتدا وارد حساب کاربری خود شوید.");
      return false;
    }

    const { data, error } = await supabaseClient
      .from("agencies")
      .select("*")
      .eq("id", requestId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      showMessage("خطا در دریافت اطلاعات درخواست نمایندگی.");
      return false;
    }

    if (!data) {
      showMessage("درخواست نمایندگی پیدا نشد.");
      return false;
    }

    agency = data;

    localStorage.setItem("v2gurd_agency_request_id", data.id);

    if (data.payment_status === "submitted") {
      showMessage(
        "رسید پرداخت شما قبلاً ثبت شده و در حال بررسی است.",
        "success"
      );

      const submitButton = $("submitPayment");

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "رسید قبلاً ثبت شده";
      }

      return true;
    }

    if (data.payment_status === "verified") {
      showMessage("پرداخت شما قبلاً تأیید شده است.", "success");

      const submitButton = $("submitPayment");

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "پرداخت تأیید شده";
      }

      return true;
    }

    if ($("paymentName") && !$("paymentName").value) {
      $("paymentName").value = data.full_name || "";
    }

    if ($("paymentDate") && !$("paymentDate").value) {
      $("paymentDate").value = todayISO();
    }

    return true;
  }

  async function submitPayment() {
    hideMessage();

    if (!agency) {
      showMessage("اطلاعات درخواست نمایندگی آماده نیست.");
      return;
    }

    const paymentName = $("paymentName").value.trim();
    const trackingCode = $("trackingCode").value.trim();
    const paymentDate = $("paymentDate").value;
    const paymentNote = $("paymentNote").value.trim();
    const paymentDone = $("paymentDone").checked;
    const button = $("submitPayment");

    if (!paymentName) {
      showMessage("نام پرداخت‌کننده را وارد کنید.");
      $("paymentName").focus();
      return;
    }

    if (!paymentDate) {
      showMessage("تاریخ پرداخت را وارد کنید.");
      $("paymentDate").focus();
      return;
    }

    if (!paymentDone) {
      showMessage(
        "برای ادامه باید تأیید کنید که پرداخت را انجام داده‌اید."
      );
      return;
    }

    setLoading(button, true, "در حال ثبت رسید...");

    try {
      const {
        data: { user },
        error: userError
      } = await supabaseClient.auth.getUser();

      if (userError || !user) {
        throw new Error("ابتدا وارد حساب کاربری شوید.");
      }

      const paymentData = {
        amount: AGENCY_FEE,
        payer_name: paymentName,
        payment_date: paymentDate,
        tracking_code: trackingCode,
        note: paymentNote,
        card_number: CARD_NUMBER,
        bank_name: BANK_NAME,
        account_name: ACCOUNT_NAME,
        status: "submitted",
        submitted_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from("agencies")
        .update({
          payment_status: "submitted",
          payment_data: paymentData
        })
        .eq("id", agency.id)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        throw new Error("ثبت رسید پرداخت انجام نشد.");
      }

      localStorage.setItem(
        "v2gurd_agency_payment",
        JSON.stringify({
          requestId: agency.id,
          ...paymentData
        })
      );

      const telegramMessage = buildTelegramMessage(paymentData);

      const copied = await copyText(telegramMessage);

      showTelegramStep(
        copied
          ? "رسید پرداخت شما ثبت شد."
          : "رسید ثبت شد. متن پیام را می‌توانید در PV مدیریت ارسال کنید."
      );

    } catch (error) {
      console.error(error);

      showMessage(
        error?.message || "خطایی هنگام ثبت رسید پرداخت رخ داد."
      );

      setLoading(button, false);
    }
  }

  async function copyCardNumber() {
    const copied = await copyText(CARD_NUMBER);

    const button = $("copyCard");

    if (!button) return;

    const oldText = button.textContent;

    button.textContent = copied ? "کپی شد ✓" : "کپی نشد";

    setTimeout(() => {
      button.textContent = oldText;
    }, 1500);
  }

  async function init() {
    try {
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
      );

      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );

      $("submitPayment")?.addEventListener("click", submitPayment);
      $("copyCard")?.addEventListener("click", copyCardNumber);

      const dateInput = $("paymentDate");

      if (dateInput && !dateInput.value) {
        dateInput.value = todayISO();
      }

      await loadAgency();

    } catch (error) {
      console.error(error);
      showMessage("اتصال به سیستم پرداخت برقرار نشد.");
    }
  }

  init();
})();
