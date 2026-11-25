/**
 * Validation for the seller profile (profile page + KYC "complete profile").
 * Frontend copy of TBT-backend/src/utils/sellerProfileValidation.js — keep both in sync.
 */

export const SELLER_LIMITS = {
  fullName: { min: 2, max: 60 },
  businessName: { min: 2, max: 80 },
  storeAddress: { min: 5, max: 200 },
  storeDescription: { max: 700 },
  nationalIdOrTaxNumber: { min: 5, max: 30 },
  bankText: { max: 60 },
  socialUrl: { max: 200 },
};

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const COUNTRY_RULES = {
  turkey: {
    name: "Turkey", dialCode: "90", phoneDigits: 10, phoneExample: "+90 555 123 45 67",
    zipPattern: /^\d{5}$/, zipMessage: "ZIP code must be 5 digits (e.g. 34000)",
    ibanPattern: /^TR\d{7}[A-Z0-9]{17}$/, ibanMessage: "Turkish IBAN must start with TR and be 26 characters",
  },
  pakistan: {
    name: "Pakistan", dialCode: "92", phoneDigits: 10, phoneExample: "+92 300 1234567",
    zipPattern: /^\d{5}$/, zipMessage: "ZIP code must be 5 digits (e.g. 75500)",
    ibanPattern: /^PK\d{2}[A-Z]{4}[A-Z0-9]{16}$/, ibanMessage: "Pakistani IBAN must start with PK and be 24 characters",
  },
};

const DEFAULT_RULES = {
  name: null, dialCode: null, phoneDigits: null, phoneExample: "+1 555 123 4567",
  zipPattern: /^[A-Za-z0-9 -]{3,10}$/, zipMessage: "ZIP code must be 3-10 letters or numbers",
  ibanPattern: /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/, ibanMessage: "Enter a valid IBAN",
};

export const getCountryRules = (countryName) => COUNTRY_RULES[String(countryName || "").trim().toLowerCase()] || DEFAULT_RULES;

export function validatePhone(value, rules) {
  const raw = String(value || "").trim();
  if (!raw) return "Phone number is required";
  if (!/^\+?[\d\s()-]+$/.test(raw)) return "Phone number can only contain digits, spaces, +, - and brackets";

  let digits = raw.replace(/\D/g, "");
  if (!rules.phoneDigits) {
    return digits.length >= 7 && digits.length <= 15 ? null : "Phone number must have 7 to 15 digits";
  }
  const error = `Enter a valid ${rules.name} phone number (${rules.phoneDigits} digits), e.g. ${rules.phoneExample}`;
  const international = raw.startsWith("+") || digits.startsWith("00");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (international) {
    if (!digits.startsWith(rules.dialCode)) return `Phone number must use the ${rules.name} code +${rules.dialCode}`;
    digits = digits.slice(rules.dialCode.length);
  } else if (digits.length === rules.phoneDigits + rules.dialCode.length && digits.startsWith(rules.dialCode)) {
    digits = digits.slice(rules.dialCode.length);
  }
  digits = digits.replace(/^0/, "");
  return digits.length === rules.phoneDigits ? null : error;
}

const toMinutes = (time) => {
  const m = String(time || "").match(/^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/);
  if (!m) return null;
  return ((Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0)) * 60 + Number(m[2]);
};

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".");
  } catch {
    return false;
  }
};

/**
 * Returns { field: message }. With `partial` only the fields that were sent are checked
 * (the profile page saves one section at a time).
 */
export function validateSellerProfile(data, rules, { partial = false } = {}) {
  const errors = {};
  const L = SELLER_LIMITS;
  const has = (key) => !partial || data[key] !== undefined;
  const text = (v) => (typeof v === "string" ? v.trim() : "");

  const lengthCheck = (key, label, { min = 0, max }, required) => {
    const value = text(data[key]);
    if (!value) {
      if (required) errors[key] = `${label} is required`;
    } else if (value.length < min) errors[key] = `${label} must be at least ${min} characters`;
    else if (value.length > max) errors[key] = `${label} cannot be longer than ${max} characters`;
  };

  if (has("fullName")) {
    lengthCheck("fullName", "Full name", L.fullName, true);
    if (!errors.fullName && !/^\p{L}[\p{L}\p{M}\s.'-]*$/u.test(text(data.fullName))) {
      errors.fullName = "Full name can only contain letters, spaces, dots, apostrophes and hyphens";
    }
  }
  if (has("businessName")) lengthCheck("businessName", "Business name", L.businessName, true);
  if (has("storeAddress")) lengthCheck("storeAddress", "Store address", L.storeAddress, true);
  if (has("storeDescription")) lengthCheck("storeDescription", "Store description", L.storeDescription, false);
  if (data.nationalIdOrTaxNumber) lengthCheck("nationalIdOrTaxNumber", "Tax / National ID", L.nationalIdOrTaxNumber, false);

  if (has("phoneNumber")) {
    const message = validatePhone(data.phoneNumber, rules);
    if (message) errors.phoneNumber = message;
  }

  for (const [key, label] of [["country", "Country"], ["state", "State"], ["city", "City"]]) {
    if (has(key) && !data[key]) errors[key] = `${label} is required`;
  }

  if (has("zipCode")) {
    const zip = text(data.zipCode);
    if (!zip) errors.zipCode = "ZIP code is required";
    else if (!rules.zipPattern.test(zip)) errors.zipCode = rules.zipMessage;
  }

  if (data.bankDetails && typeof data.bankDetails === "object") {
    const bank = data.bankDetails;
    const required = !partial; // KYC needs the account; the profile page lets it stay empty
    for (const [key, label] of [["accountTitle", "Account title"], ["bankName", "Bank name"], ["branchName", "Branch name"]]) {
      const value = text(bank[key]);
      if (!value && required && key !== "branchName") errors[`bankDetails.${key}`] = `${label} is required`;
      else if (value && (value.length < 2 || value.length > L.bankText.max)) {
        errors[`bankDetails.${key}`] = `${label} must be 2 to ${L.bankText.max} characters`;
      }
    }
    const account = text(bank.accountNumber).replace(/[\s-]/g, "");
    if (!account) {
      if (required) errors["bankDetails.accountNumber"] = "Account number is required";
    } else if (!/^\d{6,26}$/.test(account)) {
      errors["bankDetails.accountNumber"] = "Account number must be 6 to 26 digits";
    }
    const iban = text(bank.iban).replace(/\s/g, "").toUpperCase();
    if (iban && !rules.ibanPattern.test(iban)) errors["bankDetails.iban"] = rules.ibanMessage;
  }

  if (data.socialLinks && typeof data.socialLinks === "object") {
    for (const [key, value] of Object.entries(data.socialLinks)) {
      const url = text(value);
      if (!url) continue;
      if (url.length > L.socialUrl.max) errors[`socialLinks.${key}`] = `Link cannot be longer than ${L.socialUrl.max} characters`;
      else if (!isHttpUrl(url)) errors[`socialLinks.${key}`] = "Enter a full link starting with https://";
    }
  }

  if (data.workingDays !== undefined) {
    const days = data.workingDays;
    if (!Array.isArray(days) || days.some((d) => !DAYS.includes(d))) errors.workingDays = "Select valid working days";
  }

  if (data.workingHours && (data.workingHours.start || data.workingHours.end)) {
    const start = toMinutes(data.workingHours.start);
    const end = toMinutes(data.workingHours.end);
    if (start === null || end === null) errors.workingHours = "Select both an opening and a closing time";
    else if (end <= start) errors.workingHours = "Closing time must be after opening time";
  }

  return errors;
}

/* ───────── Frontend-only helpers ───────── */

/** Country the visitor picked on the website (saved in localStorage). Defaults to Turkey. */
export const getSelectedCountry = () => {
  if (typeof window === "undefined") return "Turkey";
  try {
    return localStorage.getItem("selectedCountry") || "Turkey";
  } catch {
    return "Turkey";
  }
};

/** Placeholders that match the country's formats. */
export function getCountryPlaceholders(countryName) {
  const rules = getCountryRules(countryName);
  const byCountry = {
    Turkey: { zip: "34000", iban: "TR33 0006 1005 1978 6457 8413 26", bank: "e.g. Ziraat Bankası", address: "Mahalle, street, building no, district" },
    Pakistan: { zip: "75500", iban: "PK36 SCBL 0000 0011 2345 6702", bank: "e.g. HBL, Meezan Bank", address: "Shop no, street, area, city" },
  };
  const extra = byCountry[rules.name] || { zip: "Postal code", iban: "IBAN", bank: "Bank name", address: "Full store address" };
  const whatsapp = `https://wa.me/${rules.phoneExample.replace(/\D/g, "")}`;
  return { phone: rules.phoneExample, whatsapp, ...extra };
}

/** Keeps only characters a phone number may contain. */
export const cleanPhoneInput = (value) => value.replace(/[^\d+\s()-]/g, "").slice(0, 20);

/** "04:30 PM" (how times are stored) -> "16:30" (what <input type="time"> needs). */
export function to24Hour(value) {
  const text = String(value || "").trim();
  if (/^\d{2}:\d{2}$/.test(text)) return text;
  const m = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return "";
  const hour = (Number(m[1]) % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${m[2]}`;
}

/** "16:30" -> "04:30 PM" */
export function to12Hour(value) {
  const m = String(value || "").match(/^(\d{1,2}):(\d{2})/);
  if (!m) return "";
  const hour = Number(m[1]);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${m[2]} ${hour >= 12 ? "PM" : "AM"}`;
}

/** Logo / cover photo check before uploading. */
export function checkImageFile(file) {
  if (!["image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/webp"].includes(file.type)) {
    return `"${file.name}" is not supported. Use a JPG, PNG or WEBP image.`;
  }
  if (file.size > 5 * 1024 * 1024) return `"${file.name}" is larger than 5MB.`;
  return null;
}
