/**
 * Validation for the seller profile (profile page + KYC "complete profile").
 * Frontend copy of TBT-backend/src/utils/sellerProfileValidation.js — keep both in sync.
 */

export const SELLER_LIMITS = {
  fullName: { min: 2, max: 60 },
  businessName: { min: 2, max: 80 },
  storeAddress: { min: 5, max: 200 },
  storeDescription: { max: 700 },
  nationalIdOrTaxNumber: { min: 5, max: 20 },
  storeDescriptionKycMin: 20,
  bankText: { max: 60 },
  socialUrl: { max: 200 },
};

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* The platform works only in Turkey, so there is one set of formats. */
export const TR_RULES = {
  dialCode: "90", phoneDigits: 10, phoneExample: "+90 555 123 45 67",
  idPattern: /^\d{10,11}$/, idMax: 11, idExample: "12345678901", idMessage: "Enter a 10 digit tax number or an 11 digit national ID",
  zipPattern: /^\d{5}$/, zipMessage: "ZIP code must be 5 digits (e.g. 34000)",
  ibanPattern: /^TR\d{7}[A-Z0-9]{17}$/, ibanMessage: "Turkish IBAN must start with TR and be 26 characters",
};

export const isTurkey = (countryName) => /^(turkey|türkiye|turkiye)$/i.test(String(countryName || "").trim());

/** The 10 digits after +90 (mobile 5.., landline 2.. 3.. 4.., company 8..), or null if it is not a Turkish number. */
export function turkishDigits(value) {
  const raw = String(value || "").trim();
  if (!/^\+?[\d\s()-]+$/.test(raw)) return null;
  let digits = raw.replace(/\D/g, "");
  const international = raw.startsWith("+") || digits.startsWith("00");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (international) {
    if (!digits.startsWith(TR_RULES.dialCode)) return null;
    digits = digits.slice(2);
  } else if (digits.length === 12 && digits.startsWith(TR_RULES.dialCode)) {
    digits = digits.slice(2);
  }
  digits = digits.replace(/^0/, "");
  return /^[2-58]\d{9}$/.test(digits) ? digits : null;
}

export function validatePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Phone number is required";
  if (!/^\+?[\d\s()-]+$/.test(raw)) return "Phone number can only contain digits, spaces, +, - and brackets";
  return turkishDigits(raw) ? null : `Enter a valid Turkish phone number (+90 and 10 digits), e.g. ${TR_RULES.phoneExample}`;
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
export function validateSellerProfile(data, { partial = false } = {}) {
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
  if (!partial || data.nationalIdOrTaxNumber !== undefined) {
    const id = text(data.nationalIdOrTaxNumber);
    if (!id) errors.nationalIdOrTaxNumber = "Tax / National ID number is required";
    else if (!TR_RULES.idPattern.test(id)) errors.nationalIdOrTaxNumber = TR_RULES.idMessage;
  }

  // KYC submission needs the complete picture
  if (!partial) {
    const description = text(data.storeDescription);
    if (!description) errors.storeDescription = "Store description is required";
    else if (description.length < L.storeDescriptionKycMin) {
      errors.storeDescription = `Store description must be at least ${L.storeDescriptionKycMin} characters`;
    }
    if (!data.shippingMethod) errors.shippingMethod = "Shipping method is required";
    if (!Array.isArray(data.workingDays) || !data.workingDays.length) errors.workingDays = "Select at least one working day";
    if (!data.workingHours?.start || !data.workingHours?.end) errors.workingHours = "Select both an opening and a closing time";
  }

  if (has("phoneNumber")) {
    const message = validatePhone(data.phoneNumber);
    if (message) errors.phoneNumber = message;
  }

  for (const [key, label] of [["country", "Country"], ["state", "State"], ["city", "City"]]) {
    if (has(key) && !data[key]) errors[key] = `${label} is required`;
  }

  if (has("zipCode")) {
    const zip = text(data.zipCode);
    if (!zip) errors.zipCode = "ZIP code is required";
    else if (!TR_RULES.zipPattern.test(zip)) errors.zipCode = TR_RULES.zipMessage;
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
    if (iban && !TR_RULES.ibanPattern.test(iban)) errors["bankDetails.iban"] = TR_RULES.ibanMessage;
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
    // (an empty list is reported above for KYC)
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

/** Example values shown inside empty fields. */
export const TR_PLACEHOLDERS = {
  phone: TR_RULES.phoneExample,
  whatsapp: "https://wa.me/905551234567",
  zip: "34000",
  iban: "TR33 0006 1005 1978 6457 8413 26",
  bank: "e.g. Ziraat Bankası",
  address: "Mahalle, street, building no, district",
};

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

/* ───────── KYC form ───────── */

/* Input filters: the field only ever holds characters that make sense for it */
export const digitsOnly = (value) => String(value).replace(/\D/g, "");
export const accountNumberInput = (value) => String(value).replace(/[^\d\s-]/g, "");
export const nameInput = (value) => String(value).replace(/[^\p{L}\p{M}\s.'-]/gu, "");
export const ibanInput = (value) => String(value).toUpperCase().replace(/[^A-Z0-9\s]/g, "");

/** Which fields belong to which step of the KYC form. */
export const KYC_STEP_FIELDS = [
  ["fullName", "dob", "gender", "phoneNumber", "storeAddress", "country", "state", "city", "zipCode"],
  ["businessName", "nationalIdOrTaxNumber", "storeDescription"],
  ["profilePictureOrLogo", "nationalIdOrPassport", "shopLicenseOrTaxCertificate", "proofOfAddress"],
  ["shippingMethod", "workingDays", "workingHours"],
  ["bankDetails"],
];

/** Step number (1-5) that contains a field such as "bankDetails.iban". */
export const kycStepOf = (field) =>
  KYC_STEP_FIELDS.findIndex((fields) => fields.includes(String(field).split(".")[0])) + 1 || 1;

const DOCUMENTS = {
  profilePictureOrLogo: { label: "Profile picture / logo", pdf: false },
  nationalIdOrPassport: { label: "National ID / Passport", pdf: true },
  shopLicenseOrTaxCertificate: { label: "Shop license / Tax certificate", pdf: true },
  proofOfAddress: { label: "Proof of address", pdf: true },
};

function documentError(value, { label, pdf }) {
  if (!value) return `${label} is required`;
  if (typeof value === "string") return null; // already uploaded earlier
  const types = ["image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/webp", ...(pdf ? ["application/pdf"] : [])];
  if (!types.includes(value.type)) return `${label} must be a JPG, PNG${pdf ? ", WEBP or PDF file" : " or WEBP image"}`;
  if (value.size > 5 * 1024 * 1024) return `${label} must be smaller than 5MB`;
  return null;
}

/** { "field": message } for one step of the KYC form. */
export function validateKycStep(step, values) {
  const fields = KYC_STEP_FIELDS[step - 1];
  const all = validateSellerProfile(values, { partial: false });
  const errors = {};
  for (const [key, message] of Object.entries(all)) {
    if (fields.includes(key.split(".")[0])) errors[key] = message;
  }

  if (fields.includes("dob")) {
    const born = values.dob ? new Date(values.dob) : null;
    const adult = new Date(new Date().setFullYear(new Date().getFullYear() - 18));
    if (!born || Number.isNaN(born.getTime())) errors.dob = "Date of birth is required";
    else if (born > adult) errors.dob = "You must be at least 18 years old";
    else if (born < new Date("1900-01-01")) errors.dob = "Enter a valid date of birth";
    if (!["Male", "Female", "Other"].includes(values.gender)) errors.gender = "Gender is required";
  }

  for (const [key, rule] of Object.entries(DOCUMENTS)) {
    if (!fields.includes(key)) continue;
    const message = documentError(values[key], rule);
    if (message) errors[key] = message;
  }

  // show working-hour problems under the matching dropdown
  if (errors.workingHours) {
    const { start, end } = values.workingHours || {};
    if (!start) errors["workingHours.start"] = "Start time is required";
    if (!end) errors["workingHours.end"] = "End time is required";
    if (start && end) errors["workingHours.end"] = errors.workingHours;
    delete errors.workingHours;
  }
  return errors;
}

/** react-hook-form resolver built on the rules above. */
export function kycResolver(step, values) {
  const flat = validateKycStep(step, values);
  const nested = {};
  for (const [path, message] of Object.entries(flat)) {
    const keys = path.split(".");
    let node = nested;
    keys.slice(0, -1).forEach((key) => { node = node[key] = node[key] || {}; });
    node[keys.at(-1)] = { type: "validate", message };
  }
  return Object.keys(flat).length ? { values: {}, errors: nested } : { values, errors: {} };
}

const isBlank = (value) =>
  value === null ||
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && !value.length) ||
  (typeof value === "object" && !(typeof File !== "undefined" && value instanceof File) && !Array.isArray(value) && Object.values(value).every(isBlank));

/** Saved server data, overridden only by what the seller has actually typed in this session. */
export function mergeKycData(saved, draft = {}) {
  const merged = { ...saved };
  for (const [key, value] of Object.entries(draft || {})) {
    if (!isBlank(value)) merged[key] = value;
  }
  // a saved state / city only fits the country / state it was saved with
  if (merged.country !== saved.country && !draft?.state) merged.state = "";
  if (merged.state !== saved.state && !draft?.city) merged.city = "";
  return merged;
}

/** Turns the API's seller document into the KYC form's values. */
export function sellerToKycForm(seller) {
  const id = (v) => v?._id || v || "";
  const bank = seller.bankDetails || {};
  return {
    fullName: seller.fullName || "",
    gender: seller.gender || "Male",
    dob: seller.dob ? new Date(seller.dob).toISOString().split("T")[0] : "",
    phoneNumber: seller.phoneNumber || "",
    storeAddress: seller.storeAddress || "",
    country: id(seller.country),
    state: id(seller.state),
    city: id(seller.city),
    zipCode: seller.zipCode || "",
    businessName: seller.businessName || "",
    storeDescription: seller.storeDescription || "",
    nationalIdOrTaxNumber: seller.nationalIdOrTaxNumber || "",
    sellsRefurbishedDevices: Boolean(seller.sellsRefurbishedDevices),
    profilePictureOrLogo: seller.profilePictureOrLogo || null,
    nationalIdOrPassport: seller.nationalIdOrPassport || null,
    shopLicenseOrTaxCertificate: seller.shopLicenseOrTaxCertificate || null,
    proofOfAddress: seller.proofOfAddress || null,
    shippingMethod: seller.shippingMethod || "",
    workingDays: seller.workingDays || [],
    workingHours: { start: seller.workingHours?.start || "", end: seller.workingHours?.end || "" },
    bankDetails: {
      accountTitle: bank.accountTitle || "",
      accountNumber: bank.accountNumber || "",
      bankName: bank.bankName || "",
      branchName: bank.branchName || "",
      iban: bank.iban || "",
    },
  };
}
