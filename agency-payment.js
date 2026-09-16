// ============================================================
// V2GURD - Agency Payment
// agency-payment.js
// ============================================================

const SUPABASE_URL = "https://psvesfkxtmlnjyhphsfs.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_QClWgLVOmPGwPK_kTsL5UA_L0cNqJ4H";

const TELEGRAM_URL = "https://t.me/Vtwoguard";

const AGENCY_FEE = 499000;

let supabaseClient = null;
let currentUser = null;
let agencyRequest = null;


// ============================================================
// Load Supabase
// ============================================================

function loadSupabase() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve();
      return;
    }

    const script = document.createElement("script");

    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.onload = resolve;
    script.onerror = () => {
      reject(new Error("خطا در بارگذاری سیستم پرداخت"));
    };

    document.head.appendChild(script);
  });
}


// ============================================================
// Elements
// ============================================================

function getElements() {
  return {
    paymentName: document.getElementById("paymentName"),
    trackingCode: document.getElementById("trackingCode"),
    paymentDate: document.getElementById("paymentDate"),
    paymentNote: document.getElementById("paymentNote"),
    paymentDone: document.getElementById("paymentDone"),
    submitPayment: document.getElementById("submitPayment"),
    copyCard: document.getElementById("copyCard"),
    cardNumber: document.getElementById("cardNumber"),
    paymentMessage: document.getElementById("paymentMessage")
  };
}


// ============================================================
// Message
// ============================================================

function showMessage(message, type = "info") {
  const { paymentMessage } = getElements();

  if (!paymentMessage) return;

  paymentMessage.className = `payment-message ${type}`;
  paymentMessage.innerHTML = message;
}


// ============================================================
// Init
// ============================================================

async function init() {
  try {
    await loadSupabase();

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      showMessage(
        `
        <strong>ابتدا وارد حساب کاربری شوید.</strong>
        <br>
        سپس دوباره برای پرداخت هزینه نمایندگی اقدام کنید.
        `,
        "error"
      );

      return;
    }

    currentUser = user;

    await loadAgency();

    setupCopyButton();
    setupPaymentForm();

  } catch (error) {
    console.error(error);

    showMessage(
      "خطایی در بارگذاری صفحه پرداخت رخ داد. لطفاً دوباره تلاش کنید.",
      "error"
    );
  }
}


// ============================================================
// Load Agency Request
// ============================================================

async function loadAgency() {
  const requestId =
    new URLSearchParams(window.location.search).get("request") ||
    localStorage.getItem("v2gurd_agency_request_id");

  if (!requestId) {
    showMessage(
      `
      <strong>درخواست نمایندگی پیدا نشد.</strong>
      <br>
      لطفاً ابتدا درخواست نمایندگی خود را ثبت کنید.
      `,
      "error"
    );

    return;
  }

  const { data, error } = await supabaseClient
    .from("agencies")
    .select(`
      id,
      user_id,
      full_name,
      email,
      phone,
      telegram,
      city,
      agency_name,
      status,
      agency_fee,
      payment_status,
      payment_data
    `)
    .eq("id", requestId)
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.error("Agency load error:", error);

    showMessage(
      "خطا در دریافت اطلاعات درخواست نمایندگی.",
      "error"
    );

    return;
  }

  if (!data) {
    showMessage(
      `
      <strong>درخواست نمایندگی پیدا نشد.</strong>
      <br>
      لطفاً دوباره درخواست خود را ثبت کنید.
      `,
      "error"
    );

    return;
  }

  agencyRequest = data;

  localStorage.setItem(
    "v2gurd_agency_request_id",
    data.id
  );

  prepareForm();
}


// ============================================================
// Prepare Form
// ============================================================

function prepareForm() {
  const {
    paymentName,
    paymentDate,
    submitPayment
  } = getElements();

  if (!agencyRequest) return;

  if (paymentName && !paymentName.value) {
    paymentName.value = agencyRequest.full_name || "";
  }

  if (paymentDate && !paymentDate.value) {
    const today = new Date();

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    paymentDate.value = `${yyyy}-${mm}-${dd}`;
  }

  // قبلاً رسید ثبت شده
  if (agencyRequest.payment_status === "submitted") {
    showMessage(
      `
      <strong>رسید پرداخت شما قبلاً ثبت شده است.</strong>
      <br>
      درخواست شما در حال بررسی مدیریت است.
      `,
      "success"
    );

    if (submitPayment) {
      submitPayment.disabled = true;
      submitPayment.textContent = "✓ رسید قبلاً ثبت شده";
    }

    return;
  }

  // پرداخت تأیید شده
  if (agencyRequest.payment_status === "verified") {
    showMessage(
      `
      <strong>پرداخت شما قبلاً تأیید شده است.</strong>
      <br>
      نمایندگی شما در حال فعال‌سازی است.
      `,
      "success"
    );

    if (submitPayment) {
      submitPayment.disabled = true;
      submitPayment.textContent = "✓ پرداخت تأیید شده";
    }

    return;
  }
}


// ============================================================
// Copy Card Number
// ============================================================

function setupCopyButton() {
  const { copyCard } = getElements();

  if (!copyCard) return;

  copyCard.addEventListener("click", async () => {
    const cardNumber = "6219861841635526";

    try {
      await navigator.clipboard.writeText(cardNumber);

      const oldText = copyCard.textContent;

      copyCard.textContent = "✓ شماره کارت کپی شد";

      setTimeout(() => {
        copyCard.textContent = oldText;
      }, 2000);

    } catch (error) {
      console.error(error);

      showMessage(
        "کپی شماره کارت انجام نشد. شماره کارت را دستی کپی کنید.",
        "error"
      );
    }
  });
}


// ============================================================
// Payment Form
// ============================================================

function setupPaymentForm() {
  const { submitPayment } = getElements();

  if (!submitPayment) return;

  submitPayment.addEventListener("click", submitPaymentForm);
}


// ============================================================
// Submit Payment
// ============================================================

async function submitPaymentForm() {
  const {
    paymentName,
    trackingCode,
    paymentDate,
    paymentNote,
    paymentDone,
    submitPayment
  } = getElements();

  if (!agencyRequest) {
    showMessage(
      "اطلاعات درخواست نمایندگی پیدا نشد.",
      "error"
    );

    return;
  }

  const payerName = paymentName?.value.trim() || "";
  const tracking = trackingCode?.value.trim() || "";
  const date = paymentDate?.value || "";
  const note = paymentNote?.value.trim() || "";
  const confirmed = paymentDone?.checked || false;

  // -------------------------
  // Validation
  // -------------------------

  if (!payerName) {
    showMessage(
      "لطفاً نام پرداخت‌کننده را وارد کنید.",
      "error"
    );

    paymentName?.focus();

    return;
  }

  if (!confirmed) {
    showMessage(
      "لطفاً تأیید کنید که مبلغ نمایندگی را پرداخت کرده‌اید.",
      "error"
    );

    return;
  }

  // -------------------------
  // Loading
  // -------------------------

  submitPayment.disabled = true;
  submitPayment.textContent = "در حال ثبت رسید...";

  showMessage(
    "در حال ثبت اطلاعات پرداخت...",
    "info"
  );

  try {

    const paymentData = {
      amount: AGENCY_FEE,

      payer_name: payerName,

      payment_date: date || null,

      tracking_code: tracking || null,

      note: note || null,

      card_number: "6219861841635526",

      bank_name: "بلو بانک",

      account_name: "نامی",

      status: "submitted",

      submitted_at: new Date().toISOString()
    };


    // -------------------------
    // Update Supabase
    // -------------------------

    const { error } = await supabaseClient
      .from("agencies")
      .update({
        payment_status: "submitted",
        payment_data: paymentData,
        status: "pending"
      })
      .eq("id", agencyRequest.id)
      .eq("user_id", currentUser.id);

    if (error) {
      console.error("Payment update error:", error);

      throw error;
    }


    // -------------------------
    // Save Local
    // -------------------------

    localStorage.setItem(
      "v2gurd_agency_payment",
      JSON.stringify(paymentData)
    );


    // -------------------------
    // Telegram Message
    // -------------------------

    const telegramMessage = `
سلام، من درخواست نمایندگی V2GURD ثبت کردم.

👤 نام:
${agencyRequest.full_name || "-"}

🏪 نام نمایندگی:
${agencyRequest.agency_name || "-"}

📧 ایمیل:
${agencyRequest.email || currentUser.email || "-"}

📱 شماره تماس:
${agencyRequest.phone || "-"}

💬 تلگرام:
${agencyRequest.telegram || "-"}

📍 شهر:
${agencyRequest.city || "-"}

💰 مبلغ پرداختی:
۴۹۹٬۰۰۰ تومان

👤 نام پرداخت‌کننده:
${payerName}

🔢 کد پیگیری:
${tracking || "ندارد"}

📅 تاریخ پرداخت:
${date || "ثبت نشده"}

لطفاً درخواست من رو بررسی کنید و در صورت تأیید، نمایندگی من رو فعال کنید.
`.trim();


    // -------------------------
    // Copy Telegram Message
    // -------------------------

    let copied = false;

    try {
      await navigator.clipboard.writeText(telegramMessage);
      copied = true;
    } catch (clipboardError) {
      console.warn(
        "Clipboard error:",
        clipboardError
      );
    }


    // -------------------------
    // Success UI
    // -------------------------

    showTelegramStep(copied);

  } catch (error) {

    console.error(error);

    submitPayment.disabled = false;
    submitPayment.textContent = "📩 ارسال رسید برای بررسی";

    showMessage(
      `
      <strong>ثبت رسید انجام نشد.</strong>
      <br>
      لطفاً دوباره تلاش کنید.
      `,
      "error"
    );
  }
}


// ============================================================
// Telegram Step
// ============================================================

function showTelegramStep(messageCopied) {
  const {
    submitPayment,
    paymentMessage
  } = getElements();

  if (submitPayment) {
    submitPayment.style.display = "none";
  }

  if (!paymentMessage) return;

  paymentMessage.className =
    "payment-message success";

  paymentMessage.innerHTML = `
    <div class="success-box">

      <div class="success-icon">✓</div>

      <h3>رسید پرداخت ثبت شد</h3>

      <p>
        اطلاعات پرداخت شما با موفقیت ثبت شد و درخواست شما برای بررسی آماده است.
      </p>

      ${
        messageCopied
          ? `
            <p class="telegram-copy-info">
              پیام آماده برای مدیریت نیز کپی شد.
            </p>
          `
          : `
            <p class="telegram-copy-info">
              پیام آماده کپی نشد؛ در صورت نیاز اطلاعات درخواست را در PV ارسال کنید.
            </p>
          `
      }

      <button
        type="button"
        id="goTelegram"
        class="telegram-btn"
      >
        📩 رفتن به PV مدیریت
      </button>

    </div>
  `;


  // -------------------------
  // Telegram Button
  // -------------------------

  const goTelegram =
    document.getElementById("goTelegram");

  if (!goTelegram) return;

  goTelegram.addEventListener("click", () => {

    window.location.href = TELEGRAM_URL;

  });
}


// ============================================================
// Start
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  init
);
