/**
 * VariantBuilder.jsx  (v3 — Guided Wizard + Multi-Attribute + Auto Combos)
 *
 * Three-panel guided flow:
 *   Panel A — Default Variant (always shown): price, stock, image
 *   Panel B — "Add variations?" toggle → attribute type + value pickers (multi-select)
 *   Panel C — Auto-generated combo table with Bulk Fill
 */

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
export const ATTRIBUTE_OPTIONS = {
  Color: {
    icon: "mdi:palette-outline",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    presets: [
      { label: "Black",  hex: "#111111" },
      { label: "White",  hex: "#FFFFFF" },
      { label: "Red",    hex: "#EF4444" },
      { label: "Blue",   hex: "#3B82F6" },
      { label: "Navy",   hex: "#1E3A5F" },
      { label: "Green",  hex: "#22C55E" },
      { label: "Yellow", hex: "#EAB308" },
      { label: "Orange", hex: "#F97316" },
      { label: "Purple", hex: "#A855F7" },
      { label: "Pink",   hex: "#EC4899" },
      { label: "Gray",   hex: "#6B7280" },
      { label: "Brown",  hex: "#92400E" },
      { label: "Beige",  hex: "#D4B896" },
      { label: "Teal",   hex: "#14B8A6" },
    ],
  },
  Size: {
    icon: "mdi:ruler-square",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    presets: [
      { label: "XS" }, { label: "S" }, { label: "M" },
      { label: "L" },  { label: "XL" }, { label: "XXL" }, { label: "3XL" },
    ],
  },
  Storage: {
    icon: "mdi:harddisk",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    presets: [
      { label: "64GB" }, { label: "128GB" }, { label: "256GB" },
      { label: "512GB" }, { label: "1TB" },
    ],
  },
  RAM: {
    icon: "mdi:memory",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    presets: [
      { label: "4GB" }, { label: "6GB" },  { label: "8GB" },
      { label: "12GB" }, { label: "16GB" }, { label: "32GB" },
    ],
  },
  Material: {
    icon: "mdi:texture-box",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    presets: [
      { label: "Cotton" }, { label: "Polyester" }, { label: "Wool" },
      { label: "Silk" },   { label: "Leather" },   { label: "Denim" },
    ],
  },
};

const ALL_ATTR_TYPES = Object.keys(ATTRIBUTE_OPTIONS);

/* ══════════════════════════════════════════════════════════
   SMALL HELPERS
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
   STEP BADGE
══════════════════════════════════════════════════════════ */
const StepBadge = ({ n }) => (
  <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
    {n}
  </div>
);

/* ══════════════════════════════════════════════════════════
   PANEL A — Default / Single Variant
══════════════════════════════════════════════════════════ */
function DefaultVariantPanel({ row, updateRow, errors }) {
  const totalImgs = (row.existingImages?.length || 0) + (row.imageFiles?.length || 0);
  const imgErr = errors[`${row.key}_image`];
  const priceErr = errors[`${row.key}_price`];

  const allPreviews = [
    ...(row.existingImages || []).map((i) => ({ src: i.url, isExisting: true })),
    ...(row.imageFiles || []).map((f) => ({ src: URL.createObjectURL(f), isExisting: false, file: f })),
  ];

  const handleFiles = (files) => {
    const arr = Array.from(files);
    if (totalImgs + arr.length > 5) { alert("Max 5 images per variant."); return; }
    updateRow(row.key, "imageFiles", [...(row.imageFiles || []), ...arr]);
  };

  const removeImg = (idx, isExisting) => {
    if (isExisting) {
      updateRow(row.key, "existingImages", (row.existingImages || []).filter((_, i) => i !== idx));
    } else {
      const existingCount = row.existingImages?.length || 0;
      updateRow(row.key, "imageFiles", (row.imageFiles || []).filter((_, i) => i !== (idx - existingCount)));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Icon icon="mdi:package-variant-closed" className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-base">Your Product</h3>
          <p className="text-xs text-gray-400 font-medium">Set the default price, stock, and photos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Price */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
            <input
              type="number" step="0.01" min="0"
              value={row.price}
              onChange={(e) => updateRow(row.key, "price", e.target.value)}
              placeholder="0.00"
              className={`w-full h-10 pl-8 pr-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 transition-all ${priceErr ? "border-red-400 bg-red-50 focus:ring-red-400/10" : "border-gray-200 focus:border-primary-400 focus:ring-primary-400/10"}`}
            />
          </div>
        </div>
        {/* Stock */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Stock</label>
          <input
            type="number" min="0"
            value={row.stock}
            onChange={(e) => updateRow(row.key, "stock", e.target.value)}
            placeholder="0"
            className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:border-primary-400 focus:ring-primary-400/10 transition-all"
          />
        </div>
        {/* Discount */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Discount %</label>
          <div className="relative">
            <input
              type="number" min="0" max="99"
              value={row.discountPercentage}
              onChange={(e) => updateRow(row.key, "discountPercentage", e.target.value)}
              placeholder="0"
              className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:border-primary-400 focus:ring-primary-400/10 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
          </div>
          {calcFinalPrice(row.price, row.discountPercentage) && (
            <p className="text-[11px] text-emerald-600 font-bold mt-1">
              Sale: ${calcFinalPrice(row.price, row.discountPercentage)}
            </p>
          )}
        </div>
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`text-xs font-bold ${imgErr ? "text-red-500" : "text-gray-600"}`}>
            Photos {imgErr ? "(at least 1 required)" : `(${totalImgs}/5)`}
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          {allPreviews.map((img, idx) => (
            <div key={idx} className="relative w-16 h-16 group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={img.src} className="w-full h-full object-cover" alt="" />
              <button
                type="button"
                onClick={() => removeImg(idx, img.isExisting)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-lg text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon icon="mdi:close" className="w-3 h-3" />
              </button>
              {idx === 0 && <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 rounded font-bold">Main</span>}
            </div>
          ))}
          {totalImgs < 5 && (
            <label className={`w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all group ${imgErr ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-primary-400 hover:bg-primary-50/30"}`}>
              <Icon icon="mdi:camera-plus-outline" className={`w-5 h-5 ${imgErr ? "text-red-400" : "text-gray-300 group-hover:text-primary-400"}`} />
              <span className="text-[9px] text-gray-400 mt-0.5">Add</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PANEL B — Attribute Picker (multi-attribute)
══════════════════════════════════════════════════════════ */
function AttributeValuePicker({ type, selectedValues, onToggle, onAdd, onRemove }) {
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
    <div className="space-y-3">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {cfg.presets.map((p) => {
          const active = selectedValues?.some((s) => s.label === p.label);
          if (isColor) {
            return (
              <button key={p.label} type="button" onClick={() => onToggle(p)} title={p.label}
                className="flex flex-col items-center gap-1 group">
                <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${active ? "border-primary-500 scale-110 shadow-md" : "border-transparent hover:scale-105 hover:border-gray-300 shadow-sm"}`}
                  style={{ backgroundColor: p.hex, boxShadow: p.hex === "#FFFFFF" ? "inset 0 0 0 1px #e5e7eb" : undefined }}>
                  {active && <Icon icon="mdi:check" className={`w-4 h-4 ${isDark(p.hex) ? "text-white" : "text-gray-800"}`} />}
                </span>
                <span className="text-[9px] text-gray-500 font-bold">{p.label}</span>
              </button>
            );
          }
          return (
            <button key={p.label} type="button" onClick={() => onToggle(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${active ? "bg-primary-600 text-white border-primary-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <input type="text" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder={isColor ? "Custom label (e.g. Rose Gold)" : `Custom ${type.toLowerCase()}...`}
          className="flex-1 h-9 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/10 transition-all" />
        {isColor && (
          <input type="color" value={customHex} onChange={(e) => setCustomHex(e.target.value)}
            className="w-10 h-9 p-0.5 rounded-xl cursor-pointer border border-gray-200 bg-white" />
        )}
        <button type="button" onClick={handleAdd}
          className="h-9 px-4 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-1">
          <Icon icon="mdi:plus" className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Selected chips */}
      {selectedValues?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
          {selectedValues.map((v) => (
            <span key={v.label} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-primary-50 border border-primary-100 text-xs font-bold text-primary-700">
              {isColor && v.hex && <span className="w-3 h-3 rounded-full border border-primary-200" style={{ backgroundColor: v.hex }} />}
              {v.label}
              <button type="button" onClick={() => onRemove(v.label)}
                className="w-4 h-4 flex items-center justify-center rounded hover:bg-primary-200/50">
                <Icon icon="mdi:close" className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PANEL B wrapper — Attribute selection section
══════════════════════════════════════════════════════════ */
function AttributePanel({ selectedAttrs, toggleAttrType, toggleAttrValue, addCustomValue, removeAttrValue }) {
  const activeTypes = Object.keys(selectedAttrs);

  return (
    <div className="space-y-5">
      {/* Type chips */}
      <div>
        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
          Which options does your product have?
        </p>
        <div className="flex flex-wrap gap-3">
          {ALL_ATTR_TYPES.map((type) => {
            const cfg = ATTRIBUTE_OPTIONS[type];
            const active = type in selectedAttrs;
            return (
              <button key={type} type="button" onClick={() => toggleAttrType(type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-sm font-bold transition-all ${active
                  ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}>
                <Icon icon={cfg.icon} className="w-4 h-4" />
                {type}
                {active && <Icon icon="mdi:check-circle" className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Value pickers for each selected type */}
      {activeTypes.length > 0 && (
        <div className="space-y-4">
          {activeTypes.map((type) => {
            const cfg = ATTRIBUTE_OPTIONS[type];
            return (
              <div key={type} className={`p-4 rounded-2xl border ${cfg.border} ${cfg.bg}/40 space-y-3`}>
                <div className="flex items-center gap-2">
                  <Icon icon={cfg.icon} className={`w-4 h-4 ${cfg.color}`} />
                  <span className={`text-xs font-black uppercase tracking-tight ${cfg.color}`}>{type}</span>
                  <span className="ml-auto text-xs text-gray-400 font-medium">
                    {selectedAttrs[type]?.length || 0} selected
                  </span>
                </div>
                <AttributeValuePicker
                  type={type}
                  selectedValues={selectedAttrs[type]}
                  onToggle={(val) => toggleAttrValue(type, val)}
                  onAdd={(val) => addCustomValue(type, val)}
                  onRemove={(label) => removeAttrValue(type, label)}
                />
              </div>
            );
          })}
        </div>
      )}

      {activeTypes.length > 0 && activeTypes.every((t) => (selectedAttrs[t]?.length || 0) > 0) && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <Icon icon="mdi:check-circle" className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">
            Great! Scroll down to see your auto-generated variants.
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BULK FILL BAR
══════════════════════════════════════════════════════════ */
function BulkFillBar({ onBulkFill }) {
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [disc, setDisc] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3 p-3.5 bg-primary-50/60 border border-primary-100 rounded-xl mb-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-500/20">
          <Icon icon="mdi:lightning-bolt" className="w-4 h-4" />
        </div>
        <span className="text-xs font-black text-primary-700 uppercase tracking-tight">Fill All</span>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-[260px]">
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price $"
          type="number" min="0" step="0.01"
          className="h-8 flex-1 px-3 text-xs font-bold rounded-lg border border-primary-200 focus:outline-none focus:border-primary-400 bg-white" />
        <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock"
          type="number" min="0"
          className="h-8 flex-1 px-3 text-xs font-bold rounded-lg border border-primary-200 focus:outline-none focus:border-primary-400 bg-white" />
        <input value={disc} onChange={(e) => setDisc(e.target.value)} placeholder="Disc %"
          type="number" min="0" max="99"
          className="h-8 flex-1 px-3 text-xs font-bold rounded-lg border border-primary-200 focus:outline-none focus:border-primary-400 bg-white" />
        <button type="button"
          onClick={() => {
            onBulkFill({ ...(price && { price }), ...(stock && { stock }), ...(disc && { discountPercentage: disc }) });
            setPrice(""); setStock(""); setDisc("");
          }}
          className="h-8 px-4 bg-primary-600 text-white text-xs font-black rounded-lg hover:bg-primary-700 transition-all whitespace-nowrap">
          Apply
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PANEL C — Variant Table
══════════════════════════════════════════════════════════ */
function VariantTable({ rows, updateRow, errors, bulkFill }) {
  return (
    <div className="space-y-4">
      {rows.length > 1 && <BulkFillBar onBulkFill={bulkFill} />}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Photo</th>
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Variant</th>
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Price ($)</th>
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Stock</th>
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Disc %</th>
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Sale Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {rows.map((row, idx) => {
              const salePrice = calcFinalPrice(row.price, row.discountPercentage);
              const hasErr = errors[`${row.key}_price`] || errors[`${row.key}_stock`] || errors[`${row.key}_image`];
              const totalImgs = (row.existingImages?.length || 0) + (row.imageFiles?.length || 0);

              return (
                <tr key={row.key} className={`group hover:bg-gray-50/40 transition-colors ${hasErr ? "bg-red-50/30" : ""}`}>
                  {/* Image cell */}
                  <td className="px-4 py-3 w-16">
                    <div className={`relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border flex items-center justify-center cursor-pointer transition-all ${errors[`${row.key}_image`] ? "border-red-400 ring-2 ring-red-400/20" : "border-gray-200 group-hover:border-primary-300"}`}>
                      {row.imageFiles?.length > 0 ? (
                        <img src={URL.createObjectURL(row.imageFiles[0])} className="w-full h-full object-cover" alt="" />
                      ) : row.existingImages?.[0]?.url ? (
                        <img src={row.existingImages[0].url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Icon icon="mdi:camera-plus-outline" className="w-5 h-5 text-gray-300" />
                      )}
                      {totalImgs > 1 && (
                        <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] px-1 rounded-tl font-bold">+{totalImgs - 1}</span>
                      )}
                      <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (totalImgs + files.length > 5) { alert("Max 5 images per variant."); return; }
                          updateRow(row.key, "imageFiles", [...(row.imageFiles || []), ...files]);
                        }}
                      />
                    </div>
                  </td>

                  {/* Variant label */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {row.combo.map((c, ci) => (
                        <span key={ci} className="flex items-center gap-1">
                          {c.colorHex && <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: c.colorHex }} />}
                          <span className="font-bold text-gray-800">{c.value}</span>
                          {ci < row.combo.length - 1 && <span className="text-gray-300 font-medium">/</span>}
                        </span>
                      ))}
                      {row.combo.length === 0 && <span className="font-bold text-gray-800">Default</span>}
                      {idx === 0 && row.combo.length === 0 && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black border border-emerald-100">DEFAULT</span>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    <input type="number" step="0.01" min="0" value={row.price}
                      onChange={(e) => updateRow(row.key, "price", e.target.value)}
                      className={`w-24 h-8 px-2.5 rounded-lg border text-xs font-bold focus:outline-none focus:ring-1 transition-all ${errors[`${row.key}_price`] ? "border-red-400 bg-red-50 focus:ring-red-400/20" : "border-gray-200 focus:border-primary-400 focus:ring-primary-400/10"}`}
                    />
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <input type="number" min="0" value={row.stock}
                      onChange={(e) => updateRow(row.key, "stock", e.target.value)}
                      className={`w-20 h-8 px-2.5 rounded-lg border text-xs font-bold focus:outline-none focus:ring-1 transition-all ${errors[`${row.key}_stock`] ? "border-red-400 bg-red-50 focus:ring-red-400/20" : "border-gray-200 focus:border-primary-400 focus:ring-primary-400/10"}`}
                    />
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-3">
                    <input type="number" min="0" max="99" value={row.discountPercentage}
                      onChange={(e) => updateRow(row.key, "discountPercentage", e.target.value)}
                      className="w-16 h-8 px-2.5 rounded-lg border border-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:border-primary-400 focus:ring-primary-400/10 transition-all"
                    />
                  </td>

                  {/* Sale price */}
                  <td className="px-4 py-3">
                    {salePrice ? (
                      <span className="font-black text-emerald-600 text-sm">${salePrice}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SUMMARY STRIP
══════════════════════════════════════════════════════════ */
function SummaryStrip({ summary }) {
  const items = [
    { label: "Variants", value: summary.variantCount, icon: "mdi:layers", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Min Price", value: summary.minPrice ? `$${summary.minPrice}` : "—", icon: "mdi:tag-outline", color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Max Price", value: summary.maxPrice ? `$${summary.maxPrice}` : "—", icon: "mdi:tag-multiple", color: "text-primary-500", bg: "bg-primary-50" },
    { label: "Total Stock", value: summary.totalStock, icon: "mdi:package-variant", color: "text-amber-500", bg: "bg-amber-50" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((s) => (
        <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
          <div className={`w-8 h-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>
            <Icon icon={s.icon} className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] font-black text-gray-400 uppercase leading-none mb-0.5">{s.label}</div>
            <div className={`font-black text-sm ${s.color} leading-none`}>{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */
export default function VariantBuilder({
  wantsVariants,
  selectedAttrs,
  rows,
  summary,
  setWantsVariants,
  toggleAttrType,
  toggleAttrValue,
  addCustomValue,
  removeAttrValue,
  updateRow,
  bulkFill,
  errors = {},
}) {
  const defaultRow = rows[0]; // always exists (default or first combo)
  const hasRealCombos = rows.length > 1 || (rows.length === 1 && rows[0].combo.length > 0);
  const hasEnoughAttrValues = Object.keys(selectedAttrs).length > 0 &&
    Object.values(selectedAttrs).every((vals) => vals.length > 0);

  return (
    <div className="space-y-5">

      {/* ── Panel A: Default / base variant ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <StepBadge n={1} />
          <span className="text-sm font-black text-gray-800 uppercase tracking-tight">Set Base Details</span>
        </div>
        <DefaultVariantPanel row={defaultRow} updateRow={updateRow} errors={errors} />
      </div>

      {/* ── Panel B: Variations toggle ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <StepBadge n={2} />
          <span className="text-sm font-black text-gray-800 uppercase tracking-tight">
            Variations
          </span>
        </div>

        {/* Toggle card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">Does this product come in different options?</p>
              <p className="text-xs text-gray-400 mt-0.5">e.g. different sizes, colors, storage, RAM…</p>
            </div>
            {/* Toggle switch */}
            <button
              type="button"
              onClick={() => setWantsVariants(!wantsVariants)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${wantsVariants ? "bg-primary-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${wantsVariants ? "translate-x-6" : ""}`} />
            </button>
          </div>

          {/* Attribute picker (shown when toggle ON) */}
          {wantsVariants && (
            <div className="pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <AttributePanel
                selectedAttrs={selectedAttrs}
                toggleAttrType={toggleAttrType}
                toggleAttrValue={toggleAttrValue}
                addCustomValue={addCustomValue}
                removeAttrValue={removeAttrValue}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Panel C: Auto-generated variant table ── */}
      {wantsVariants && hasRealCombos && hasEnoughAttrValues && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-2 mb-3">
            <StepBadge n={3} />
            <span className="text-sm font-black text-gray-800 uppercase tracking-tight">
              Set Prices & Photos
            </span>
            <span className="ml-auto px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
              {rows.length} variant{rows.length !== 1 ? "s" : ""} generated
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
            <VariantTable rows={rows} updateRow={updateRow} errors={errors} bulkFill={bulkFill} />
            <div className="pt-4 border-t border-gray-100">
              <SummaryStrip summary={summary} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}