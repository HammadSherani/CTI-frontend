'use client';

// Package sizes and courier offers of the shipment forms (marketplace and refurbished orders).
import { Icon } from '@iconify/react';

/* ── Standard Package Presets ───────────────────────────────────── */
export const PACKAGE_PRESETS = [
  { id: "envelope",  label: "Envelope",    icon: "mdi:email-outline",             weight: "0.5", length: "35", width: "25", height: "3",  desc: "35×25×3 cm · 0.5 kg" },
  { id: "small",     label: "Small Box",   icon: "mdi:package-variant-closed",    weight: "1",   length: "30", width: "20", height: "15", desc: "30×20×15 cm · 1 kg" },
  { id: "medium",    label: "Medium Box",  icon: "mdi:package-variant",           weight: "3",   length: "40", width: "30", height: "20", desc: "40×30×20 cm · 3 kg" },
  { id: "large",     label: "Large Box",   icon: "mdi:package",                   weight: "5",   length: "60", width: "40", height: "30", desc: "60×40×30 cm · 5 kg" },
  { id: "xlarge",    label: "Extra Large", icon: "mdi:archive-outline",           weight: "10",  length: "80", width: "50", height: "40", desc: "80×50×40 cm · 10 kg" },
  { id: "custom",    label: "Custom",      icon: "mdi:pencil-ruler-outline",      weight: "",    length: "",   width: "",   height: "",   desc: "Enter custom size" },
];

/* ── Courier Logo / Brand Map ───────────────────────────────────── */
const COURIER_BRANDS = {
  // Turkish carriers (match Geliver providerCode / providerServiceCode strings)
  ARAS:         { name: "Aras Kargo",     color: "#E31E24", bg: "#FFF0F0", icon: "mdi:truck-delivery" },
  ARASFAST:     { name: "Aras Kargo",     color: "#E31E24", bg: "#FFF0F0", icon: "mdi:truck-delivery" },
  YURTICI:      { name: "Yurtiçi Kargo",  color: "#F7A900", bg: "#FFFBEE", icon: "mdi:truck-fast-outline" },
  YURTICICARGO: { name: "Yurtiçi Kargo",  color: "#F7A900", bg: "#FFFBEE", icon: "mdi:truck-fast-outline" },
  MNG:          { name: "MNG Kargo",      color: "#003087", bg: "#EEF3FF", icon: "mdi:package-variant-closed-check" },
  MNGKARGO:     { name: "MNG Kargo",      color: "#003087", bg: "#EEF3FF", icon: "mdi:package-variant-closed-check" },
  PTT:          { name: "PTT Kargo",      color: "#F9A825", bg: "#FFFDE7", icon: "mdi:mailbox-outline" },
  PTTKARGO:     { name: "PTT Kargo",      color: "#F9A825", bg: "#FFFDE7", icon: "mdi:mailbox-outline" },
  SURAT:        { name: "Sürat Kargo",    color: "#1565C0", bg: "#E8F4FD", icon: "mdi:lightning-bolt" },
  SURATKARGO:   { name: "Sürat Kargo",    color: "#1565C0", bg: "#E8F4FD", icon: "mdi:lightning-bolt" },
  SENDEO:       { name: "Sendeo",         color: "#E91E8C", bg: "#FDE8F3", icon: "mdi:send" },
  HEPSIJET:     { name: "Hepsijet",       color: "#FF6900", bg: "#FFF3E8", icon: "mdi:flash-outline" },
  HB:           { name: "Hepsijet",       color: "#FF6900", bg: "#FFF3E8", icon: "mdi:flash-outline" },
  TRENDYOL:     { name: "Trendyol Expr.", color: "#FF6600", bg: "#FFF2E8", icon: "mdi:shopping-outline" },
  KARGOIST:     { name: "Kargoist",       color: "#4CAF50", bg: "#E8F5E9", icon: "mdi:package-check" },
  GELIVER:      { name: "Geliver",        color: "#6C47FF", bg: "#F0EEFF", icon: "mdi:truck-cargo-container" },
  // International
  UPS:          { name: "UPS",            color: "#351C15", bg: "#FFF8E1", icon: "mdi:truck" },
  DHL:          { name: "DHL",            color: "#FFCC00", bg: "#FFFDE7", icon: "mdi:airplane-takeoff" },
  FEDEX:        { name: "FedEx",          color: "#4D148C", bg: "#F5EEFF", icon: "mdi:package-variant-remove" },
  TNT:          { name: "TNT",            color: "#FF6600", bg: "#FFF2E8", icon: "mdi:truck-outline" },
};

export function getCourierBrand(carrierCode) {
  if (!carrierCode) return null;
  const key = carrierCode.toUpperCase().replace(/[-_\s]/g, "");
  // Try exact match first, then prefix match
  if (COURIER_BRANDS[key]) return COURIER_BRANDS[key];
  const found = Object.keys(COURIER_BRANDS).find(k => key.startsWith(k) || k.startsWith(key));
  return found ? COURIER_BRANDS[found] : null;
}

export function PackageSizePicker({ selected, onSelect }) {
  return (
    <>
      <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5 mb-3">
        <Icon icon="mdi:package-variant-closed" className="w-4 h-4 text-gray-400" /> Select Package Size
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
        {PACKAGE_PRESETS.map((preset) => {
          const isSelected = selected === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-150 ${
                isSelected ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-100 bg-gray-50 hover:border-primary-200 hover:bg-primary-50/30'
              }`}
            >
              <Icon icon={preset.icon} className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
              <span className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>{preset.label}</span>
              <span className="text-[9px] text-gray-400 leading-tight">{preset.desc}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function CourierOffers({ offers, onShip }) {
  return (
    <div className="space-y-3 mb-5 border-t border-gray-100 pt-5">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <Icon icon="mdi:truck-outline" className="w-3.5 h-3.5" /> Select Shipping Carrier Offer
      </p>
      <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {offers.map((offer) => {
          const brand = getCourierBrand(offer.carrier);
          return (
            <div key={offer.offerId} className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: brand?.bg || '#F3F4F6' }}>
                  <Icon icon={brand?.icon || 'mdi:truck-delivery-outline'} className="w-5 h-5" style={{ color: brand?.color || '#6B7280' }} />
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-xs">{brand?.name || offer.carrier}</p>
                  {offer.carrier !== (brand?.name || offer.carrier) && <p className="text-[9px] text-gray-400 font-mono">{offer.carrier}</p>}
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">{offer.estimatedDays ? `~${offer.estimatedDays} days` : 'Time not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Price</p>
                  <p className="font-black text-gray-900 text-sm mt-0.5">
                    {Number(offer.cost || 0).toFixed(2)} <span className="text-[10px] font-bold text-gray-500">{offer.currency}</span>
                  </p>
                </div>
                <button type="button" onClick={() => onShip(offer)}
                  className="px-3.5 py-2 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  style={{ background: brand?.color || '#2563EB' }}>
                  <Icon icon="mdi:send-check-outline" className="w-3.5 h-3.5" /> Ship
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
