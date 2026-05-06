const storageKey = "nedovos-demo-state";

const mosadCatalog = {
  "shaarei-hasimcha": {
    id: 1,
    name: "שערי השמחה",
    subtitle: "למה מיועדת תרומתך",
    shortName: "שערי",
    logoClass: "logo-shaarei",
    options: [
      "כללי",
      "קופות",
      "הוראת קבע",
      "עזר ליולדת",
      "שירות מחשב",
      "מעות זיכרון",
      "הכנסת כלה"
    ]
  },
  "shir-balev": {
    id: 2,
    name: "שיר בלב",
    subtitle: "בחרי מסלול תרומה",
    shortName: "שיר",
    logoClass: "logo-shir",
    options: [
      "תרומה כללית",
      "קרן מזון",
      "ילדים ונוער",
      "ליווי נשים",
      "מלגות",
      "חירום"
    ]
  },
  "shem-nadiv": {
    id: 3,
    name: "שם נדיב",
    subtitle: "בחר סוג תרומה",
    shortName: "חסד",
    logoClass: "logo-chesed",
    options: [
      "סיוע כללי",
      "משפחות",
      "רפואה",
      "דיור",
      "תלושי חג",
      "קרן חירום"
    ]
  },
  "notnim-gav": {
    id: 4,
    name: "נותנים גב",
    subtitle: "אפשרויות תמיכה",
    shortName: "גב",
    logoClass: "logo-youth",
    options: [
      "פעילות כללית",
      "מלגות לנוער",
      "ארוחות חמות",
      "ציוד לימודי",
      "אירועי קהילה",
      "הוראת קבע"
    ]
  },
  "igud-kupot": {
    id: 5,
    name: "איגוד קופות הצדקה",
    subtitle: "לאן לנתב את התרומה",
    shortName: "אחד",
    logoClass: "logo-union",
    options: [
      "קופה כללית",
      "משפחות במצוקה",
      "חתונות",
      "רפואה",
      "קרן שבת",
      "מלגות ילדים"
    ]
  },
  "lev-hakehila": {
    id: 6,
    name: "לב הקהילה",
    subtitle: "בחר יעד תרומה",
    shortName: "לב",
    logoClass: "logo-school",
    options: [
      "חינוך",
      "פעילות קהילתית",
      "ארוחות חמות",
      "ציוד לתלמידים",
      "קרן חירום",
      "הנצחה"
    ]
  }
};

const seedState = {
  profile: {
    name: "תורם אורח",
    email: "guest@example.com",
    phone: "050-123-4567",
    address: "ירושלים"
  },
  donations: [
    {
      id: "NDV-1048",
      campaign: "קרן כללית",
      amount: 180,
      method: "חד פעמי",
      date: "2026-05-01",
      donor: "תורם אורח"
    },
    {
      id: "NDV-1047",
      campaign: "קרן מלגות",
      amount: 520,
      method: "הוראת קבע אשראי",
      date: "2026-04-15",
      donor: "תורם אורח"
    }
  ],
  recurring: [
    {
      id: "RC-200",
      campaign: "קרן מלגות",
      amount: 520,
      billingDay: "15",
      status: "פעיל"
    }
  ]
};

const profileLabels = {
  name: "שם מלא",
  email: "אימייל",
  phone: "טלפון",
  address: "כתובת"
};

function cloneSeedState() {
  return JSON.parse(JSON.stringify(seedState));
}

function getState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    localStorage.setItem(storageKey, JSON.stringify(seedState));
    return cloneSeedState();
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(storageKey, JSON.stringify(seedState));
    return cloneSeedState();
  }
}

function saveState(state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0
  }).format(amount);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function setupDonationPage() {
  const params = new URLSearchParams(window.location.search);
  const mosadId = params.get("mosad");
  const requestedOption = params.get("option");
  const mosad = Object.values(mosadCatalog).find((item) => String(item.id) === mosadId)
    || mosadCatalog[mosadId]
    || mosadCatalog["shaarei-hasimcha"];
  const state = getState();
  const form = document.getElementById("donation-form");
  const tabs = Array.from(document.querySelectorAll(".payment-card"));
  const panels = Array.from(document.querySelectorAll(".payment-detail-panel"));
  const purposeSelect = document.getElementById("purpose-select");
  const campaignInput = form.querySelector('[name="campaign"]');
  const amountInput = form.querySelector('[name="amount"]');
  const mosadLogo = document.getElementById("donate-mosad-logo");
  const mosadName = document.getElementById("donate-mosad-name");
  const mosadSubtitle = document.getElementById("donate-mosad-subtitle");

  const methodMap = {
    single: "חד פעמי",
    "recurring-card": "הו\"ק בנקאי",
    bank: "העברה בנקאית",
    bit: "הו\"ק אשראי"
  };

  let activeMethod = "single";

  function applyActiveMethod() {
    tabs.forEach((item) => item.classList.toggle("is-active", item.dataset.method === activeMethod));
    panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === activeMethod));
  }

  function syncAmountFromActivePanel() {
    const activePanel = document.querySelector(`.payment-detail-panel[data-panel="${activeMethod}"]`);
    const visibleAmountInput = activePanel?.querySelector(".js-amount-input");
    if (visibleAmountInput && visibleAmountInput.value) {
      amountInput.value = visibleAmountInput.value;
    }
  }

  function updateSummary() {
    campaignInput.value = purposeSelect.value;
    syncAmountFromActivePanel();
  }

  mosadLogo.className = `donate-mosad-logo home-app-logo ${mosad.logoClass}`;
  mosadName.textContent = mosad.name;
  mosadSubtitle.textContent = "למה מיועדת תרומתך";

  mosad.options.forEach((option) => {
    const selectOption = document.createElement("option");
    selectOption.value = option;
    selectOption.textContent = option;
    purposeSelect.appendChild(selectOption);
  });

  if (requestedOption && mosad.options.includes(requestedOption)) {
    purposeSelect.value = requestedOption;
  } else {
    purposeSelect.value = mosad.options[0];
  }

  const bitPanel = document.querySelector('.payment-detail-panel[data-panel="bit"] .payment-form-grid');
  const bitAmountInput = bitPanel?.querySelector('.js-amount-input');
  const bitBillingDaySelect = bitPanel?.querySelector('select[name="billingDay"]');
  const bitCardHolderInput = bitPanel?.querySelector('input[name="cardHolderName"]');
  const bitCardNumberWrap = bitPanel?.querySelector('input[name="recurringCardNumber"]')?.closest(".input-with-icon");
  const bitExpiryInput = bitPanel?.querySelector('input[name="recurringCardExpiry"]');
  const bitCvvInput = bitPanel?.querySelector('input[name="recurringCardCvv"]');
  form.querySelector('input[name="bitRef"]')?.closest("label")?.remove();

  function buildFieldLabel(text, control, required = false, className = "") {
    const label = document.createElement("label");
    if (className) {
      label.className = className;
    }
    if (required) {
      const mark = document.createElement("span");
      mark.className = "required-mark";
      mark.textContent = "*";
      label.appendChild(mark);
    }
    label.append(text);
    label.appendChild(control);
    return label;
  }

  if (bitPanel && bitAmountInput && bitBillingDaySelect && bitCardHolderInput && bitCardNumberWrap && bitExpiryInput && bitCvvInput) {
    bitCardHolderInput.name = "chargeCount";
    bitCardHolderInput.placeholder = "ללא הגבלה";
    bitCardHolderInput.type = "text";

    const amountField = buildFieldLabel("סכום לחיוב בכל חודש:", bitAmountInput, true);
    const chargeCountField = buildFieldLabel("מספר פעמים לחיוב:", bitCardHolderInput);
    const cardNumberField = buildFieldLabel("מספר כרטיס אשראי:", bitCardNumberWrap, true);
    const billingDayField = buildFieldLabel("יום חיוב בכל חודש:", bitBillingDaySelect, true);
    const expiryField = buildFieldLabel("תוקף:", bitExpiryInput, true);
    const cvvField = buildFieldLabel("3 ספרות בגב הכרטיס:", bitCvvInput, false, "payment-form-span-2");

    bitPanel.innerHTML = "";
    bitPanel.classList.remove("payment-form-grid-stacked");
    bitPanel.append(
      amountField,
      chargeCountField,
      cardNumberField,
      billingDayField,
      expiryField,
      cvvField
    );
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeMethod = tab.dataset.method;
      applyActiveMethod();
      updateSummary();
    });
  });

  purposeSelect.addEventListener("change", updateSummary);
  form.querySelectorAll(".js-amount-input").forEach((input) => {
    input.addEventListener("input", syncAmountFromActivePanel);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    syncAmountFromActivePanel();
    const data = new FormData(form);

    const donation = {
      id: `NDV-${Math.floor(Math.random() * 9000 + 1000)}`,
      campaign: String(data.get("campaign") || purposeSelect.value),
      amount: Number(data.get("amount")),
      method: methodMap[activeMethod],
      date: new Date().toISOString().slice(0, 10),
      donor: String(data.get("name"))
    };

    state.profile = {
      name: String(data.get("name")),
      email: String(data.get("email")),
      phone: String(data.get("phone")),
      address: String(data.get("address") || ""),
      city: String(data.get("city") || "")
    };
    state.donations.unshift(donation);

    if (activeMethod === "recurring-card" || activeMethod === "bit") {
      state.recurring.unshift({
        id: `RC-${Math.floor(Math.random() * 900 + 100)}`,
        campaign: donation.campaign,
        amount: donation.amount,
        billingDay: String(data.get("billingDayRecurring") || data.get("billingDay") || "15"),
        status: "פעיל"
      });
    }

    saveState(state);
    form.reset();
    purposeSelect.value = requestedOption && mosad.options.includes(requestedOption) ? requestedOption : mosad.options[0];
    amountInput.value = 180;
    form.querySelectorAll(".js-amount-input").forEach((input) => {
      input.value = 180;
    });
    activeMethod = "single";
    applyActiveMethod();
    updateSummary();
    showToast(`תרומת דמו ${donation.id} נשמרה.`);
  });

  applyActiveMethod();
  updateSummary();
}

function setupPortalPage() {
  const state = getState();
  const total = state.donations.reduce((sum, donation) => sum + donation.amount, 0);

  document.getElementById("portal-total").textContent = formatCurrency(total);
  document.getElementById("portal-recurring").textContent = String(state.recurring.length);
  document.getElementById("portal-receipts").textContent = String(state.donations.length);

  const history = document.getElementById("portal-history");
  state.donations.forEach((donation) => {
    const row = document.createElement("article");
    row.className = "table-row";
    row.innerHTML = `
      <strong>${donation.id} | ${formatCurrency(donation.amount)}</strong>
      <span>${donation.campaign} | ${donation.method} | ${donation.date}</span>
    `;
    history.appendChild(row);
  });

  const recurring = document.getElementById("portal-recurring-list");
  if (state.recurring.length === 0) {
    recurring.innerHTML = `<article class="table-row"><strong>אין הוראות קבע פעילות</strong><span>ניתן ליצור אחת ממסך התרומה.</span></article>`;
  } else {
    state.recurring.forEach((plan) => {
      const row = document.createElement("article");
      row.className = "table-row";
      row.innerHTML = `
        <strong>${plan.id} | ${formatCurrency(plan.amount)}</strong>
        <span>${plan.campaign} | יום חיוב ${plan.billingDay} | ${plan.status}</span>
      `;
      recurring.appendChild(row);
    });
  }

  const profile = document.getElementById("portal-profile");
  Object.entries(state.profile).forEach(([key, value]) => {
    const row = document.createElement("div");
    row.className = "profile-item";
    row.innerHTML = `<strong>${profileLabels[key] || key}</strong><span>${value || "-"}</span>`;
    profile.appendChild(row);
  });
}

function setupAdminPage() {
  const state = getState();
  document.getElementById("admin-recurring-count").textContent = String(state.recurring.length);
  const donors = document.getElementById("admin-donors");

  state.donations.slice(0, 6).forEach((donation) => {
    const row = document.createElement("article");
    row.className = "table-row";
    row.innerHTML = `
      <strong>${donation.donor} | ${formatCurrency(donation.amount)}</strong>
      <span>${donation.campaign} | ${donation.method} | מוכן להפקת קבלה</span>
    `;
    donors.appendChild(row);
  });
}

function setupOnlinePage() {
  const params = new URLSearchParams(window.location.search);
  const mosadId = params.get("mosad");
  const mosad = Object.values(mosadCatalog).find((item) => String(item.id) === mosadId)
    || mosadCatalog[mosadId]
    || mosadCatalog["shaarei-hasimcha"];

  document.title = `Nedovos | ${mosad.name}`;
  document.getElementById("online-mosad-name").textContent = mosad.name;
  document.getElementById("online-mosad-subtitle").textContent = mosad.subtitle;

  const logo = document.getElementById("online-mosad-logo");
  logo.className = `online-mosad-logo home-app-logo ${mosad.logoClass}`;
  logo.innerHTML = "";

  const options = document.getElementById("online-options");
  options.innerHTML = "";

  mosad.options.forEach((option) => {
    const link = document.createElement("a");
    link.className = "online-option";
    link.href = `../donate.html?mosad=${encodeURIComponent(mosad.id)}&option=${encodeURIComponent(option)}`;
    link.textContent = option;
    options.appendChild(link);
  });
}

function init() {
  const page = document.body.dataset.page;
  if (page === "donate") setupDonationPage();
  if (page === "portal") setupPortalPage();
  if (page === "admin") setupAdminPage();
  if (page === "online") setupOnlinePage();
}

init();
