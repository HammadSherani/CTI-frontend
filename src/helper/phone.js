/** Turkish phone numbers: typing format, sending format and form checks. */
import { TR_RULES, turkishDigits, validatePhone } from "./sellerProfileRules";

/** The digits after +90, from anything the user typed or pasted. Numbers of other countries give "". */
export function nationalDigits(value) {
  const raw = String(value || "").trim();
  let digits = raw.replace(/\D/g, "");
  const international = raw.startsWith("+") || digits.startsWith("00");
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (international) {
    if (!digits.startsWith(TR_RULES.dialCode)) return "";
    digits = digits.slice(2);
  } else if (digits.length > TR_RULES.phoneDigits && digits.startsWith(TR_RULES.dialCode)) {
    digits = digits.slice(2);
  }
  return digits.replace(/^0+/, "").slice(0, TR_RULES.phoneDigits);
}

/** "5551234567" -> "555 123 45 67" */
export function formatNational(digits) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean).join(" ");
}

/** Full number as it is kept in the form: "+90 555 123 45 67" */
export const buildPhone = (digits) => (digits ? `+${TR_RULES.dialCode} ${formatNational(digits)}` : "");

/** Without spaces, for sending to the server: "+905551234567" */
export const compactPhone = (value) => String(value || "").replace(/[^\d+]/g, "");

/** Error message for any Turkish number (mobile or landline), or null. */
export const checkPhone = (value) => validatePhone(value);

/** Same, for fields that must be a mobile number. */
export function checkMobile(value) {
  const message = validatePhone(value);
  if (message) return message;
  return turkishDigits(value).startsWith("5") ? null : `Turkish mobile numbers start with 5, e.g. ${TR_RULES.phoneExample}`;
}
