import axiosInstance from "@/config/axiosInstance";

// One shared request for the home page's category grids (Our Services + Sell Gadgets).
let pending = null;

export function fetchHeaderData() {
  if (!pending) {
    pending = axiosInstance
      .get("/public/sell-device/header-data")
      .then((res) => (res.data?.success ? res.data.data : null))
      .catch((err) => {
        pending = null; // allow a retry on the next mount
        throw err;
      });
  }
  return pending;
}

export const PHONE_SLUGS = ["phone", "mobile-phone"];

const withPrefix = (prefix, name = "") =>
  new RegExp(`^${prefix}\b`, "i").test(name) ? name : `${prefix} ${name}`;

// Display label for a category in the "buy" grid, e.g. "Laptop" -> "Buy Laptop".
// The phone category is literally named "Sell Phone" in the DB, so force "Buy Phone".
export function buyLabel(cat) {
  if (PHONE_SLUGS.includes(cat.slug)) return "Buy Phone";
  return withPrefix("Buy", (cat.name || "").replace(/^sell\s+/i, ""));
}

export function sellLabel(cat) {
  if (PHONE_SLUGS.includes(cat.slug)) return "Sell Phone";
  return withPrefix("Sell", (cat.name || "").replace(/^buy\s+/i, ""));
}
