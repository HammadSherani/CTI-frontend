/**
 * VariantBuilder.jsx (SIMPLIFIED)
 *
 * Completely self-contained UI for building product variants.
 * Receives the simplified hook return value as props.
 *
 * Rules:
 *   1. Choose EXACTLY ONE attribute type (Size, Color, Storage, etc.)
 *   2. Pick values for that attribute
 *   3. Set price/stock for each in a simple list
 */

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   Same as before, providing presets for the user.
══════════════════════════════════════════════════════════ */
export const ATTRIBUTE_OPTIONS = {
  Color: {
    icon: "mdi:palette-outline",
    badge: "bg-pink-50 text-pink-600 border-pink-200",
    presets: [
      { label: "Black", hex: "#111111" },
      { label: "White", hex: "#FFFFFF" },
      { label: "Red", hex: "#EF4444" },
      { label: "Blue", hex: "#3B82F6" },
      { label: "Navy", hex: "#1E3A5F" },
      { label: "Green", hex: "#22C55E" },
      { label: "Yellow", hex: "#EAB308" },
      { label: "Orange", hex: "#F97316" },
      { label: "Purple", hex: "#A855F7" },
      { label: "Pink", hex: "#EC4899" },
      { label: "Gray", hex: "#6B7280" },
      { label: "Brown", hex: "#92400E" },
      { label: "Beige", hex: "#D4B896" },
      { label: "Teal", hex: "#14B8A6" },
    ],
  },
  Size: {
    icon: "mdi:ruler-square",
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    presets: [
      { label: "XS" }, { label: "S" }, { label: "M" },
      { label: "L" }, { label: "XL" }, { label: "XXL" }, { label: "3XL" },
    ],
  },
  Storage: {
    icon: "mdi:harddisk",
    badge: "bg-violet-50 text-violet-600 border-violet-200",
    presets: [
      { label: "64GB" }, { label: "128GB" }, { label: "256GB" },
      { label: "512GB" }, { label: "1TB" },
    ],
  },
  RAM: {
    icon: "mdi:memory",
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    presets: [
      { label: "4GB" }, { label: "6GB" }, { label: "8GB" },
      { label: "12GB" }, { label: "16GB" }, { label: "32GB" },
    ],
  },
  Material: {
    icon: "mdi:texture-box",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    presets: [
      { label: "Cotton" }, { label: "Polyester" }, { label: "Wool" },
      { label: "Silk" }, { label: "Leather" }, { label: "Denim" },
    ],
  },
};

export const ALL_ATTR_TYPES = Object.keys(ATTRIBUTE_OPTIONS);

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const isDark = (hex = "#000") => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

const calcFinalPrice = (price, pct) => {
  if (!price || !pct || pct <= 0 || pct >= 100) return null;
  return Number((Number(price) - (Number(price) * Number(pct)) / 100).toFixed(2));
};

/* ══════════════════════════════════════════════════════════
   AttrValuePicker
══════════════════════════════════════════════════════════ */
function AttrValuePicker({ type, selected, onToggle, onAdd, onRemove }) {
  const cfg = ATTRIBUTE_OPTIONS[type];
  const isColor = type === "Color";
  const [customLabel, setCustomLabel] = useState("");
  const [customHex, setCustomHex] = useState("#000000");

  const handleAdd = () => {
    if (!customLabel.trim()) return;
    onAdd({ label: customLabel.trim(), ...(isColor && { hex: customHex }) });
    setCustomLabel("");
  };

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap gap-2.5">
        {cfg.presets.map((p) => {
          const active = selected.some((s) => s.label === p.label);
          if (isColor) {
            return (
              <button key={p.label} type="button" onClick={() => onToggle(p)}
                title={p.label} className="flex flex-col items-center gap-1.5 group">
                <span className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${active ? "border-primary-500 scale-110 shadow-md ring-2 ring-primary-500/10" : "border-transparent hover:scale-105 hover:border-gray-300 shadow-sm"
                  }`} style={{
                    backgroundColor: p.hex,
                    boxShadow: p.hex === "#FFFFFF" ? "inset 0 0 0 1px #e5e7eb" : undefined,
                  }}>
                  {active && <Icon icon="mdi:check" className={`w-4 h-4 ${isDark(p.hex) ? "text-white" : "text-gray-800"}`} />}
                </span>
                <span className="text-[10px] text-gray-500 font-bold leading-none">{p.label}</span>
              </button>
            );
          }
          return (
            <button key={p.label} type="button" onClick={() => onToggle(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${active ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                }`}>
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input type="text" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            placeholder={isColor ? "Label (e.g. Rose Gold)" : `Add custom ${type.toLowerCase()}...`}
            className="w-full h-10 px-4 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-400 bg-white transition-all" />
        </div>
        {isColor && (
          <input type="color" value={customHex} onChange={(e) => setCustomHex(e.target.value)}
            className="w-12 h-10 p-1 rounded-xl cursor-pointer border border-gray-200 bg-white" />
        )}
        <button type="button" onClick={handleAdd}
          className="px-5 h-10 bg-gray-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-all flex items-center gap-2">
          <Icon icon="mdi:plus" className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Selected tags list */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {selected.map((v) => (
            <span key={v.label} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-primary-50 border border-primary-100 text-xs font-bold text-primary-700">
              {isColor && v.hex && (
                <span className="w-3.5 h-3.5 rounded-full border border-primary-200 flex-shrink-0" style={{ backgroundColor: v.hex }} />
              )}
              {v.label}
              <button type="button" onClick={() => onRemove(v.label)}
                className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-primary-200/50 transition-colors">
                <Icon icon="mdi:close" className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   VariantGrid
══════════════════════════════════════════════════════════ */
function VariantGrid({ rows, updateRow, errors = {} }) {
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="px-5 py-4 font-bold text-gray-400 uppercase tracking-wider">Option Value</th>
            <th className="px-4 py-4 font-bold text-gray-400 uppercase tracking-wider">Price ($)</th>
            <th className="px-4 py-4 font-bold text-gray-400 uppercase tracking-wider">Stock</th>
            <th className="px-4 py-4 font-bold text-gray-400 uppercase tracking-wider">Disc %</th>
            <th className="px-4 py-4 font-bold text-gray-400 uppercase tracking-wider">Sale Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {rows.map((row, idx) => {
            const salePrice = calcFinalPrice(row.price, row.discountPercentage);
            const hasErr = errors[`${row.key}_price`] || errors[`${row.key}_stock`];
            return (
              <tr key={row.key} className={`group hover:bg-gray-50/50 transition-colors ${hasErr ? "bg-red-50/30" : ""}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {row.combo[0].colorHex && (
                      <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                        style={{ backgroundColor: row.combo[0].colorHex }} />
                    )}
                    <span className="font-bold text-gray-800 text-sm">{row.label}</span>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase border border-emerald-100">Default</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <input type="number" step="0.01" min="0" value={row.price}
                    onChange={(e) => updateRow(row.key, "price", e.target.value)}
                    className={`w-28 h-9 px-3 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/10 ${errors[`${row.key}_price`] ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-primary-400"
                      }`} />
                </td>

                <td className="px-4 py-4">
                  <input type="number" min="0" value={row.stock}
                    onChange={(e) => updateRow(row.key, "stock", e.target.value)}
                    className={`w-24 h-9 px-3 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/10 ${errors[`${row.key}_stock`] ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-primary-400"
                      }`} />
                </td>

                <td className="px-4 py-4">
                  <input type="number" step="1" min="0" max="99" value={row.discountPercentage}
                    onChange={(e) => updateRow(row.key, "discountPercentage", e.target.value)}
                    className="w-20 h-9 px-3 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-400" />
                </td>

                <td className="px-4 py-4">
                  {salePrice ? (
                    <span className="font-black text-emerald-600 text-sm">${salePrice}</span>
                  ) : (
                    <span className="text-gray-300 font-medium">—</span>
                  )}
                </td>


              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BulkFillBar
══════════════════════════════════════════════════════════ */
function BulkFillBar({ onBulkFill }) {
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [disc, setDisc] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-primary-50/50 border border-primary-100 rounded-2xl mb-4">
      <div className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Icon icon="mdi:lightning-bolt" className="w-5 h-5" />
        </div>
        <span className="text-xs font-black text-primary-700 uppercase tracking-tight">Bulk Fill</span>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-[300px]">
        <input value={price} onChange={(e) => setPrice(e.target.value)}
          placeholder="Price $" type="number" min="0" step="0.01"
          className="h-9 flex-1 px-3 text-xs font-bold rounded-xl border border-primary-200 focus:outline-none focus:border-primary-400 bg-white" />
        <input value={stock} onChange={(e) => setStock(e.target.value)}
          placeholder="Stock" type="number" min="0"
          className="h-9 flex-1 px-3 text-xs font-bold rounded-xl border border-primary-200 focus:outline-none focus:border-primary-400 bg-white" />
        <input value={disc} onChange={(e) => setDisc(e.target.value)}
          placeholder="Disc %" type="number" min="0" max="99"
          className="h-9 flex-1 px-3 text-xs font-bold rounded-xl border border-primary-200 focus:outline-none focus:border-primary-400 bg-white" />
        <button type="button"
          onClick={() => {
            onBulkFill({
              ...(price && { price }),
              ...(stock && { stock }),
              ...(disc && { discountPercentage: disc }),
            });
            setPrice(""); setStock(""); setDisc("");
          }}
          className="h-9 px-5 bg-primary-600 text-white text-xs font-black rounded-xl hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 active:scale-95">
          Apply
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */
export default function VariantBuilder({
  attrType,
  attrValues,
  rows,
  summary,
  setAttributeType,
  toggleValue,
  addCustomValue,
  removeValue,
  updateRow,
  bulkFill,
  errors = {},
}) {
  return (
    <div className="space-y-6">

      {/* ── Step 1: Choose ONE attribute type ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-sm">1</div>
          <div>
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">Choose Variation Dimension</h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Select exactly one attribute that will change the price/stock.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ALL_ATTR_TYPES.map((t) => {
            const cfg = ATTRIBUTE_OPTIONS[t];
            const active = attrType === t;
            return (
              <button key={t} type="button" onClick={() => setAttributeType(t)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${active
                    ? "border-primary-500 bg-primary-50/50 shadow-md ring-4 ring-primary-500/5"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30" : "bg-gray-100 text-gray-400"
                  }`}>
                  <Icon icon={cfg.icon} className="w-6 h-6" />
                </div>
                <span className={`text-xs font-black uppercase tracking-tight ${active ? "text-primary-700" : "text-gray-500"}`}>
                  {t}
                </span>
                {active && (
                  <div className="absolute top-2 right-2">
                    <Icon icon="mdi:check-circle" className="w-4 h-4 text-primary-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step 2: Pick values for that type ── */}
      {attrType && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-sm">2</div>
              <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">Add {attrType} Options</h3>
            </div>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase">{attrValues.length} Selected</span>
          </div>

          <div className="p-5 bg-gray-50/50 rounded-3xl border border-gray-100">
            <AttrValuePicker
              type={attrType}
              selected={attrValues}
              onToggle={toggleValue}
              onAdd={addCustomValue}
              onRemove={removeValue}
            />
          </div>
        </div>
      )}

      {/* ── Step 3: Variant list ── */}
      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-sm">3</div>
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">Set Price & Stock</h3>
          </div>

          <BulkFillBar onBulkFill={bulkFill} />
          <VariantGrid rows={rows} updateRow={updateRow} errors={errors} />

          {/* Summary Mini-Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            {[
              { label: "Items", value: summary.variantCount, icon: "mdi:layers", color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Min Price", value: summary.minPrice ? `$${summary.minPrice}` : "—", icon: "mdi:tag-outline", color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Max Price", value: summary.maxPrice ? `$${summary.maxPrice}` : "—", icon: "mdi:tag-multiple", color: "text-primary-500", bg: "bg-primary-50" },
              { label: "Stock", value: summary.totalStock, icon: "mdi:package-variant", color: "text-amber-500", bg: "bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100">
                <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon icon={s.icon} className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{s.label}</div>
                  <div className={`font-black text-sm ${s.color} leading-none`}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}