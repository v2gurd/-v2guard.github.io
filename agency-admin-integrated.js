/* =========================================================
   V2GURD AGENCY ADMIN
   اتصال مدیریت نمایندگان به admin.html اصلی
   ========================================================= */

(function () {

  let agencyData = [];
  let agencyFilter = "all";

  const fa = n =>
    String(n ?? 0).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);

  const money = n =>
    fa(Number(n || 0).toLocaleString("en-US"));

  const esc = s =>
    String(s ?? "").replace(/[&<>"']/g, m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m]));

  const statusText = status => ({
    pending: "در انتظار پرداخت",
    payment_pending: "در انتظار پرداخت",
    active: "فعال",
    rejected: "رد شده",
    suspended: "معلق"
  }[status] || status || "نامشخص");

  const paymentText = status => ({
    unpaid: "پرداخت نشده",
    submitted: "رسید ارسال شده",
    verified: "پرداخت تأیید شده",
    rejected: "پرداخت رد شده"
  }[status] || status || "نامشخص");


  /* ---------------------------------------------------------
     اضافه کردن گزینه نمایندگان به منوی پنل اصلی
     --------------------------------------------------------- */

  function addAgencyNav() {

    const nav = document.querySelector(".nav");

    if (!nav) {
      setTimeout(addAgencyNav, 500);
      return;
    }

    if (document.getElementById("agencyAdminNav")) return;

    const btn = document.createElement("button");

    btn.id = "agencyAdminNav";
    btn.dataset.page = "agencies";
    btn.textContent = "نمایندگان";

    btn.onclick = function () {
      showAgencyPage();
    };

    nav.appendChild(btn);

  }


  /* ---------------------------------------------------------
     صفحه مدیریت نمایندگان
     --------------------------------------------------------- */

  async function showAgencyPage() {

    const content = document.getElementById("content");

    if (!content) return;

    document
      .querySelectorAll(".nav button")
      .forEach(b => b.classList.remove("active"));

    document
      .getElementById("agencyAdminNav")
      ?.classList.add("active");

    content.innerHTML = `
      <div class="panel">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
          margin-bottom:15px;
        ">

          <div>
            <h2 style="margin:0;font-size:17px">
              مدیریت نمایندگان
            </h2>

            <div style="
              color:#687673;
              font-size:10px;
              margin-top:5px;
            ">
              بررسی درخواست‌ها و فعال‌سازی نمایندگان V2GURD
            </div>
          </div>

          <button
            class="btn primary"
            id="agencyRefresh"
          >
            ↻ بروزرسانی
          </button>

        </div>

        <div
          id="agencyStats"
          style="
            display:grid;
            grid-template-columns:repeat(4,1fr);
            gap:10px;
            margin-bottom:15px;
          "
        ></div>

        <div style="
          display:flex;
          gap:7px;
          flex-wrap:wrap;
          margin-bottom:15px;
        ">

          <button class="btn outline agency-filter active-filter"
            data-filter="all">
            همه
          </button>

          <button class="btn outline agency-filter"
            data-filter="payment_pending">
            منتظر پرداخت
          </button>

          <button class="btn outline agency-filter"
            data-filter="submitted">
            رسیدهای جدید
          </button>

          <button class="btn outline agency-filter"
            data-filter="active">
            فعال
          </button>

          <button class="btn outline agency-filter"
            data-filter="rejected">
            رد شده
          </button>

        </div>

        <div id="agencyLoading"
          style="
            text-align:center;
            padding:25px;
            color:#687673;
            font-size:10px;
          ">
          در حال دریافت درخواست‌ها...
        </div>

        <div id="agencyList"></div>

      </div>
    `;

    document
      .getElementById("agencyRefresh")
      .onclick = loadAgencies;

    document
      .querySelectorAll(".agency-filter")
      .forEach(btn => {

        btn.onclick = () => {

          agencyFilter = btn.dataset.filter;

          document
            .querySelectorAll(".agency-filter")
            .forEach(x => x.classList.remove("active-filter"));

          btn.classList.add("active-filter");

          renderAgencies();

        };

      });

    await loadAgencies();

  }


  /* ---------------------------------------------------------
     دریافت درخواست‌ها
     --------------------------------------------------------- */

  async function loadAgencies() {

    const loading = document.getElementById("agencyLoading");

    if (loading) {
      loading.style.display = "block";
      loading.textContent = "در حال دریافت درخواست‌ها...";
    }

    const result = await supabaseClient
      .from("agencies")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (result.error) {

      if (loading) {
        loading.innerHTML = `
          <div class="error">
            دریافت درخواست‌ها انجام نشد.<br>
            ${esc(result.error.message)}
          </div>
        `;
      }

      return;
    }

    agencyData = result.data || [];

    renderAgencyStats();
    renderAgencies();

  }


  /* ---------------------------------------------------------
     آمار
     --------------------------------------------------------- */

  function renderAgencyStats() {

    const el = document.getElementById("agencyStats");

    if (!el) return;

    const total = agencyData.length;

    const submitted = agencyData.filter(
      x => x.payment_status === "submitted"
    ).length;

    const active = agencyData.filter(
      x => x.status === "active"
    ).length;

    const rejected = agencyData.filter(
      x => x.status === "rejected"
    ).length;

    el.innerHTML = `
      ${agencyStat("کل درخواست‌ها", total)}
      ${agencyStat("رسید جدید", submitted)}
      ${agencyStat("نماینده فعال", active)}
      ${agencyStat("رد شده", rejected)}
    `;

  }


  function agencyStat(title, value) {

    return `
      <div style="
        background:#fff;
        border:1px solid #e1e9e6;
        border-radius:13px;
        padding:14px;
      ">

        <small style="
          display:block;
          color:#687673;
          font-size:9px;
          margin-bottom:4px;
        ">
          ${title}
        </small>

        <strong style="font-size:22px">
          ${fa(value)}
        </strong>

      </div>
    `;

  }


  /* ---------------------------------------------------------
     لیست
     --------------------------------------------------------- */

  function renderAgencies() {

    const loading = document.getElementById("agencyLoading");
    const list = document.getElementById("agencyList");

    if (!list) return;

    if (loading) {
      loading.style.display = "none";
    }

    let rows = agencyData;

    if (agencyFilter === "submitted") {

      rows = rows.filter(
        x => x.payment_status === "submitted"
      );

    } else if (agencyFilter !== "all") {

      rows = rows.filter(
        x => x.status === agencyFilter
      );

    }

    if (!rows.length) {

      list.innerHTML = `
        <div class="empty">
          موردی برای نمایش وجود ندارد.
        </div>
      `;

      return;
    }

    list.innerHTML = rows.map(renderAgencyCard).join("");

  }


  function renderAgencyCard(a) {

    const paymentSubmitted =
      a.payment_status === "submitted";

    const active =
      a.status === "active";

    const rejected =
      a.status === "rejected";

    let badgeClass = "pending";

    if (active) badgeClass = "on";
    if (rejected) badgeClass = "off";

    return `
      <div style="
        border:1px solid #e1e9e6;
        border-radius:14px;
        padding:14px;
        margin-bottom:10px;
        background:#fff;
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:10px;
          flex-wrap:wrap;
        ">

          <div>

            <strong style="font-size:13px">
              ${esc(a.full_name)}
            </strong>

            <div style="
              color:#687673;
              font-size:9px;
              margin-top:4px;
            ">
              ${esc(a.agency_name || "بدون نام نمایندگی")}
              ${a.city ? ` • ${esc(a.city)}` : ""}
            </div>

          </div>

          <div style="
            display:flex;
            gap:5px;
            flex-wrap:wrap;
          ">

            <span class="badge ${badgeClass}">
              ${statusText(a.status)}
            </span>

            <span class="badge ${
              paymentSubmitted
                ? "approved"
                : a.payment_status === "rejected"
                  ? "rejected"
                  : "pending"
            }">
              ${paymentText(a.payment_status)}
            </span>

          </div>

        </div>


        <div style="
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:7px;
          margin-top:12px;
          font-size:9px;
        ">

          <div>
            <b>ایمیل:</b>
            ${esc(a.email || "-")}
          </div>

          <div>
            <b>موبایل:</b>
            ${esc(a.phone || "-")}
          </div>

          <div>
            <b>تلگرام:</b>
            ${esc(a.telegram || "-")}
          </div>

          <div>
            <b>هزینه:</b>
            ${money(a.agency_fee)} تومان
          </div>

        </div>


        <div style="
          display:flex;
          gap:6px;
          flex-wrap:wrap;
          margin-top:12px;
        ">

          <button
            class="btn outline"
            onclick="window.v2gurdAgencyDetails('${a.id}')"
          >
            مشاهده جزئیات
          </button>

          ${
            paymentSubmitted && !active
            ? `
              <button
                class="btn primary"
                onclick="window.v2gurdApproveAgency('${a.id}')"
              >
                ✓ تأیید پرداخت و فعال‌سازی
              </button>
            `
            : ""
          }

          ${
            !active && !rejected
            ? `
              <button
                class="btn danger"
                onclick="window.v2gurdRejectAgency('${a.id}')"
              >
                رد درخواست
              </button>
            `
            : ""
          }

        </div>

      </div>
    `;

  }


  /* ---------------------------------------------------------
     جزئیات
     --------------------------------------------------------- */

  window.v2gurdAgencyDetails = function (id) {

    const a = agencyData.find(x => x.id === id);

    if (!a) return;

    const payment = a.payment_data || {};

    const conditions =
      a.conditions || {};

    const conditionRows =
      Object.keys(conditions).length
      ? Object.entries(conditions)
          .map(([key, value]) => `
            <div style="
              padding:7px;
              border-bottom:1px solid #e8eeee;
              font-size:9px;
            ">
              ${esc(key)} :
              <b>${esc(String(value))}</b>
            </div>
          `)
          .join("")
      : "اطلاعاتی ثبت نشده است.";

    const box = document.createElement("div");

    box.id = "agencyDetailsModal";

    box.className = "modal show";

    box.innerHTML = `
      <div class="modal-box">

        <div class="modal-head">

          <h2>
            جزئیات درخواست نمایندگی
          </h2>

          <button
            class="close"
            onclick="
              document.getElementById('agencyDetailsModal').remove()
            "
          >
            ×
          </button>

        </div>


        <div class="panel"
          style="
            box-shadow:none;
            margin-bottom:10px;
          ">

          <h3 style="font-size:13px">
            اطلاعات متقاضی
          </h3>

          <p>نام: <b>${esc(a.full_name)}</b></p>

          <p>ایمیل:
            <span class="ltr">
              ${esc(a.email)}
            </span>
          </p>

          <p>موبایل: ${esc(a.phone)}</p>

          <p>تلگرام: ${esc(a.telegram)}</p>

          <p>شهر: ${esc(a.city)}</p>

          <p>نام نمایندگی:
            ${esc(a.agency_name)}
          </p>

          <p>روش فروش:
            ${esc(a.sales_channels)}
          </p>

          <p>توضیحات:
            ${esc(a.notes || "-")}
          </p>

        </div>


        <div class="panel"
          style="
            box-shadow:none;
            margin-bottom:10px;
          ">

          <h3 style="font-size:13px">
            وضعیت پرداخت
          </h3>

          <p>
            مبلغ:
            <b>${money(a.agency_fee)} تومان</b>
          </p>

          <p>
            وضعیت:
            ${paymentText(a.payment_status)}
          </p>

          ${
            payment.payer_name
            ? `<p>پرداخت‌کننده:
                ${esc(payment.payer_name)}
              </p>`
            : ""
          }

          ${
            payment.payment_date
            ? `<p>تاریخ پرداخت:
                ${esc(payment.payment_date)}
              </p>`
            : ""
          }

          ${
            payment.tracking_code
            ? `<p>کد پیگیری:
                ${esc(payment.tracking_code)}
              </p>`
            : ""
          }

          ${
            payment.note
            ? `<p>توضیحات رسید:
                ${esc(payment.note)}
              </p>`
            : ""
          }

        </div>


        <div class="panel"
          style="
            box-shadow:none;
            margin-bottom:10px;
          ">

          <h3 style="font-size:13px">
            پاسخ شرایط نمایندگی
          </h3>

          ${conditionRows}

        </div>


        <div class="actions">

          ${
            a.payment_status === "submitted" &&
            a.status !== "active"
            ? `
              <button
                class="btn primary"
                onclick="
                  window.v2gurdApproveAgency('${a.id}');
                  document.getElementById('agencyDetailsModal').remove();
                "
              >
                ✓ تأیید و فعال‌سازی
              </button>
            `
            : ""
          }

          ${
            a.status !== "active" &&
            a.status !== "rejected"
            ? `
              <button
                class="btn danger"
                onclick="
                  window.v2gurdRejectAgency('${a.id}');
                  document.getElementById('agencyDetailsModal').remove();
                "
              >
                رد درخواست
              </button>
            `
            : ""
          }

        </div>

      </div>
    `;

    document.body.appendChild(box);

  };


  /* ---------------------------------------------------------
     تأیید و فعال‌سازی
     --------------------------------------------------------- */

  window.v2gurdApproveAgency = async function (id) {

    const agency = agencyData.find(x => x.id === id);

    if (!agency) return;

    if (agency.payment_status !== "submitted") {

      alert(
        "اول باید رسید پرداخت توسط متقاضی ارسال شده باشد."
      );

      return;
    }

    const ok = confirm(
      `آیا پرداخت ${agency.full_name} تأیید و نمایندگی فعال شود؟`
    );

    if (!ok) return;

    const result = await supabaseClient
      .from("agencies")
      .update({
        status: "active",
        payment_status: "verified"
      })
      .eq("id", id);

    if (result.error) {

      alert(
        "فعال‌سازی انجام نشد:\n" +
        result.error.message
      );

      return;
    }

    alert(
      "پرداخت تأیید شد و نمایندگی فعال شد."
    );

    await loadAgencies();

  };


  /* ---------------------------------------------------------
     رد درخواست
     --------------------------------------------------------- */

  window.v2gurdRejectAgency = async function (id) {

    const reason = prompt(
      "دلیل رد درخواست را وارد کنید:"
    );

    if (reason === null) return;

    const paymentData =
      agencyData.find(x => x.id === id)?.payment_data || {};

    paymentData.rejection_reason =
      reason || "بدون توضیح";

    paymentData.rejected_at =
      new Date().toISOString();

    const result = await supabaseClient
      .from("agencies")
      .update({
        status: "rejected",
        payment_status: "rejected",
        payment_data: paymentData
      })
      .eq("id", id);

    if (result.error) {

      alert(
        "رد درخواست انجام نشد:\n" +
        result.error.message
      );

      return;
    }

    alert("درخواست رد شد.");

    await loadAgencies();

  };


  /* ---------------------------------------------------------
     CSS مخصوص بخش نمایندگی
     --------------------------------------------------------- */

  function addAgencyStyle() {

    if (document.getElementById("agencyAdminStyle"))
      return;

    const style = document.createElement("style");

    style.id = "agencyAdminStyle";

    style.textContent = `

      .active-filter{
        background:#087765 !important;
        color:#fff !important;
        border-color:#087765 !important;
      }

      @media(max-width:700px){

        #agencyStats{
          grid-template-columns:repeat(2,1fr) !important;
        }

      }

      @media(max-width:500px){

        #agencyStats{
          grid-template-columns:1fr 1fr !important;
        }

      }

    `;

    document.head.appendChild(style);

  }


  /* ---------------------------------------------------------
     شروع
     --------------------------------------------------------- */

  function initAgencyAdmin() {

    addAgencyStyle();
    addAgencyNav();

  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initAgencyAdmin
    );

  } else {

    initAgencyAdmin();

  }

})();
