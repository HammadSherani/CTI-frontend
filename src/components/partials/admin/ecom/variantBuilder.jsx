/**
 * VariantBuilder.jsx  (v6 — Beginners-Friendly Visual Wizard)
 *
 * This version introduces:
 *   1. A visual step-by-step Progress Header.
 *   2. Base Details (Always visible) with fallback explanations.
 *   3. Default "Card View" layout to display variants in spacious grid cards.
 *   4. Inline specs editor with quick-add presets.
 *   5. Multi-image gallery list preview & delete per variant card & table.
 *   6. Prevent accidental category toggling off in Step 2: Clicking an active category button 
 *      does not turn it off; they must click the explicit close (✕) icon inside it.
 *   7. Removed variant card inline switcher in Step 3 to ensure Cartesian alignment, displaying 
 *      attributes as gorgeous static badges instead.
 */

"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";

/* ══════════════════════════════════════════════════════════
   CONSTANTS & PRESETS
   ══════════════════════════════════════════════════════════ */
export const ATTRIBUTE_OPTIONS = {
  Color: {
    icon: "mdi:palette-outline",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    presets: [
      { label: "Black", hex: "#111111" },
      { label: "White", hex: "#FFFFFF" },
      { label: "Red", hex: "#EF4444" },
      { label: "Blue", hex: "#3B82F6" },
      { label: "Navy", hex: "#1E3A5F" },
      { label: "Green", hex: "#22C55E" },
      { label: "Gold", hex: "#D4AF37" },
      { label: "Silver", hex: "#C0C0C0" },
      { label: "Space Gray", hex: "#3A3B3C" },
      { label: "Rose Gold", hex: "#B76E79" },
      { label: "Gray", hex: "#6B7280" },
    ],
  },
  Storage: {
    icon: "mdi:harddisk",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    presets: [
      { label: "16GB" }, { label: "32GB" }, { label: "64GB" },
      { label: "128GB" }, { label: "256GB" }, { label: "512GB" },
      { label: "1TB" },
    ],
  },
  RAM: {
    icon: "mdi:memory",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    presets: [
      { label: "2GB" }, { label: "3GB" }, { label: "4GB" },
      { label: "6GB" }, { label: "8GB" }, { label: "12GB" },
      { label: "16GB" }, { label: "32GB" },
    ],
  },
  Condition: {
    icon: "mdi:star-face",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    presets: [
      { label: "Brand New" }, { label: "Like New" }, { label: "Excellent" },
      { label: "Good" }, { label: "Fair" },
    ],
  },
  Size: {
    icon: "mdi:ruler-square",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    presets: [
      { label: "XS" }, { label: "S" }, { label: "M" },
      { label: "L" }, { label: "XL" }, { label: "XXL" },
    ],
  },
};

const ALL_ATTR_TYPES = Object.keys(ATTRIBUTE_OPTIONS);
const SPEC_PRESETS = ["Condition", "Battery Health", "Warranty", "Model Number", "Network Status"];

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
   STEPPER PROGRESS BAR
   ══════════════════════════════════════════════════════════ */
function StepperProgress({ activeStep, wantsVariants, hasRealCombos, hasEnoughAttrValues }) {
  const steps = [
    { n: 1, label: "Base Details", desc: "Default price, stock & fallback photos" },
    { n: 2, label: "Add Variations", desc: "Choose attributes (Color, Storage, etc.)" },
  ];

  if (wantsVariants && hasRealCombos && hasEnoughAttrValues) {
    steps.push({ n: 3, label: "Variant Pricing & Photos", desc: "Set prices, stock and photos per option" });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-gray-200/60 pb-6 mb-6">
      {steps.map((s) => {
        const isActive = activeStep === s.n;
        const isDone = activeStep > s.n;
        return (
          <div
            key={s.n}
            className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${isActive
              ? "bg-primary-50/50 border-primary-300 shadow-sm"
              : isDone
                ? "bg-emerald-50/30 border-emerald-100 opacity-90"
                : "bg-white border-gray-100 opacity-60"
              }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${isActive
                ? "bg-primary-500 text-black shadow-lg shadow-primary-500/20"
                : isDone
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                  : "bg-gray-100 text-gray-400"
                }`}
            >
              {isDone ? <Icon icon="mdi:check" className="w-5 h-5" /> : s.n}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-gray-800 leading-tight mb-0.5">{s.label}</div>
              <div className="text-[10px] text-gray-400 font-medium leading-normal truncate">{s.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SPECS EDITOR
   ══════════════════════════════════════════════════════════ */
function SpecsEditor({ specs = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftValue, setDraftValue] = useState("");

  const addSpec = () => {
    if (!draftName.trim() || !draftValue.trim()) return;
    onChange([...specs, { name: draftName.trim(), value: draftValue.trim() }]);
    setDraftName("");
    setDraftValue("");
  };

  const removeSpec = (idx) => onChange(specs.filter((_, i) => i !== idx));

  return (
    <div className="border border-gray-200/60 rounded-xl overflow-hidden bg-gray-55/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-55 hover:bg-gray-105 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Icon icon="mdi:tag-text-outline" className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-bold text-gray-700">Extra Details / Specs</span>
          {specs.length > 0 && (
            <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded text-[9px] font-black">
              {specs.length}
            </span>
          )}
          <span className="text-[9px] text-gray-400 font-medium">
            (e.g., Battery Health, Warranty info)
          </span>
        </div>
        <Icon icon={open ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4 text-gray-450" />
      </button>

      {open && (
        <div className="p-3 space-y-3 bg-white border-t border-gray-200/40">
          {/* Quick presets */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Quick Presets:</span>
            <div className="flex flex-wrap gap-1">
              {SPEC_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDraftName(p)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all border ${draftName === p
                    ? "bg-primary-500 border-primary-500 text-black"
                    : "bg-gray-55 hover:bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                >
                  +{p}
                </button>
              ))}
            </div>
          </div>

          {/* Existing specs */}
          {specs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {specs.map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1 bg-violet-50/50 rounded-lg border border-violet-100">
                  <div className="flex-1 min-w-0 flex items-center gap-1 text-[11px]">
                    <span className="font-bold text-violet-700 truncate">{s.name}</span>
                    <span className="text-gray-300">:</span>
                    <span className="font-semibold text-gray-650 truncate">{s.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="w-4.5 h-4.5 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-55 transition-colors flex-shrink-0"
                  >
                    <Icon icon="mdi:close" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new spec */}
          <div className="flex gap-2">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="e.g. Battery Health"
              className="flex-1 h-8 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-violet-400"
            />
            <input
              type="text"
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              placeholder="e.g. 88%"
              className="flex-1 h-8 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-violet-400"
            />
            <button
              type="button"
              onClick={addSpec}
              className="h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap shadow-sm shadow-violet-600/10"
            >
              <Icon icon="mdi:plus" className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PANEL A — Base / Default Variant Details (Always Visible)
   ══════════════════════════════════════════════════════════ */
function DefaultVariantPanel({ row, updateRow, errors, product }) {
  const totalImgs = (row.existingImages?.length || 0) + (row.imageFiles?.length || 0);
  const priceErr = errors[`${row.key}_price`];
  const productImages = product?.images || [];

  const allPreviews = React.useMemo(() => [
    ...(row.existingImages || []).map((i) => ({ src: i.url, isExisting: true })),
    ...(row.imageFiles || []).map((f) => ({ src: URL.createObjectURL(f), isExisting: false })),
  ], [row.existingImages, row.imageFiles]);

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
    <div className="bg-white rounded-2xl border border-gray-200/75 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Icon icon="mdi:package-variant-closed" className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Step 1: Base Product Details (Fallback)</h3>
          <p className="text-[11px] text-gray-400 font-medium">Set the primary price, inventory, and images</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2.5 items-start">
        <Icon icon="mdi:lightning-bolt" className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-850 leading-relaxed">
          <strong>Fallback pricing & photos:</strong> If you enable variants, any variant price or photo left empty below will automatically use these base details. This saves you from entering the same values or images multiple times.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Price */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Price *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-455 text-xs font-bold">$</span>
            <input
              type="number" step="0.01" min="0"
              value={row.price}
              onChange={(e) => updateRow(row.key, "price", e.target.value)}
              placeholder="0.00"
              className={`w-full h-10 pl-8 pr-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-1 transition-all ${priceErr ? "border-red-400 bg-red-50/20 focus:ring-red-400/10" : "border-gray-200 focus:border-primary-400"
                }`}
            />
          </div>
        </div>
        {/* Stock */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Stock / Quantity *</label>
          <input
            type="number" min="0"
            value={row.stock}
            onChange={(e) => updateRow(row.key, "stock", e.target.value)}
            placeholder="0"
            className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:ring-1 focus:border-primary-400 transition-all"
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
              className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:ring-1 focus:border-primary-400 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
          </div>
          {calcFinalPrice(row.price, row.discountPercentage) && (
            <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-0.5">
              <Icon icon="mdi:tag-outline" className="w-3.5 h-3.5" />
              Final Sale Price: ${calcFinalPrice(row.price, row.discountPercentage)}
            </p>
          )}
        </div>
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-600">Product Images</label>
          <span className="text-[10px] text-gray-400">{totalImgs}/5</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {allPreviews.map((img, idx) => (
            <div key={idx} className="relative w-16 h-16 group rounded-xl overflow-hidden border border-gray-200 bg-gray-55 flex items-center justify-center">
              <img src={img.src} className="w-full h-full object-cover" alt="" />
              <button
                type="button"
                onClick={() => removeImg(idx, img.isExisting)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-lg text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon icon="mdi:close" className="w-3 h-3" />
              </button>
              {idx === 0 && <span className="absolute bottom-1 left-1 text-[8px] bg-black/60 text-white px-1.5 py-0.5 rounded font-black uppercase">Main</span>}
            </div>
          ))}
          {totalImgs < 5 && (
            <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-primary-400 hover:bg-primary-50/20 rounded-xl cursor-pointer transition-all group">
              <Icon icon="mdi:camera-plus-outline" className="w-5 h-5 text-gray-300 group-hover:text-primary-400" />
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
   PANEL B — Attribute Value Selectors
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
              <button
                key={p.label}
                type="button"
                onClick={() => onToggle(p)}
                title={p.label}
                className="flex flex-col items-center gap-1 group focus:outline-none animate-in fade-in"
              >
                <span
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${active ? "border-primary-500 scale-110 shadow-md ring-2 ring-primary-500/20" : "border-transparent hover:scale-105 hover:border-gray-300 shadow-sm"
                    }`}
                  style={{ backgroundColor: p.hex, boxShadow: p.hex === "#FFFFFF" ? "inset 0 0 0 1px #e5e7eb" : undefined }}
                >
                  {active && <Icon icon="mdi:check" className={`w-4 h-4 ${isDark(p.hex) ? "text-white" : "text-gray-800"}`} />}
                </span>
                <span className="text-[9px] text-gray-500 font-bold">{p.label}</span>
              </button>
            );
          }
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onToggle(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${active ? "bg-primary-600 text-white border-primary-600 shadow-sm" : "bg-white text-gray-650 border-gray-250 hover:border-gray-450"
                }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder={isColor ? "Custom color name (e.g. Purple)" : `Custom ${type.toLowerCase()}...`}
          className="flex-1 h-9 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 transition-all bg-white"
        />
        {isColor && (
          <input
            type="color"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            className="w-10 h-9 p-0.5 rounded-xl cursor-pointer border border-gray-200 bg-white"
          />
        )}
        <button
          type="button"
          onClick={handleAdd}
          className="h-9 px-4 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
        >
          <Icon icon="mdi:plus" className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Selected chips */}
      {selectedValues?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-gray-200/50">
          {selectedValues.map((v) => (
            <span key={v.label} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-primary-50 border border-primary-100 text-xs font-bold text-primary-700 animate-in zoom-in-95 duration-150">
              {isColor && v.hex && <span className="w-3 h-3 rounded-full border border-primary-200" style={{ backgroundColor: v.hex }} />}
              {v.label}
              <button
                type="button"
                onClick={() => onRemove(v.label)}
                className="w-4 h-4 flex items-center justify-center rounded hover:bg-primary-200/55"
              >
                <Icon icon="mdi:close" className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function GenericValuePicker({ type, selectedValues, onAdd, onRemove }) {
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    if (!draft.trim()) return;
    onAdd({ label: draft.trim() });
    setDraft("");
  };

  return (
    <div className="space-y-2.5">
      {selectedValues?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedValues.map((v) => (
            <span key={v.label} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 animate-in zoom-in-95 duration-150">
              {v.label}
              <button
                type="button"
                onClick={() => onRemove(v.label)}
                className="w-4 h-4 flex items-center justify-center rounded hover:bg-indigo-200/50"
              >
                <Icon icon="mdi:close" className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder={`Add custom option value...`}
          className="flex-1 h-9 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 bg-white"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm shadow-indigo-600/10"
        >
          <Icon icon="mdi:plus" className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

function AttributePanel({ selectedAttrs, toggleAttrType, toggleAttrValue, addCustomValue, removeAttrValue }) {
  const activeTypes = Object.keys(selectedAttrs);
  const [customAttrName, setCustomAttrName] = useState("");

  const handleAddCustomAttrType = () => {
    const name = customAttrName.trim();
    if (!name) return;
    if (!(name in selectedAttrs)) {
      toggleAttrType(name);
    }
    setCustomAttrName("");
  };

  return (
    <div className="space-y-4">
      {/* Preset type chips */}
      <div>
        <p className="text-xs font-bold text-gray-550 mb-3 uppercase tracking-wide">
          Select Variation Option Categories:
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_ATTR_TYPES.map((type) => {
            const cfg = ATTRIBUTE_OPTIONS[type];
            const active = type in selectedAttrs;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  if (!active) toggleAttrType(type);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all ${active
                  ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm cursor-default`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-55/50"
                  }`}
              >
                <Icon icon={cfg.icon} className="w-4 h-4" />
                {type}
                {active && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAttrType(type);
                    }}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5 cursor-pointer transition-colors"
                  >
                    <Icon icon="mdi:close" className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}

          {activeTypes
            .filter(t => !(t in ATTRIBUTE_OPTIONS))
            .map(type => (
              <div key={type} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 bg-indigo-50 border-indigo-200 shadow-sm text-xs font-bold">
                <Icon icon="mdi:tag-edit-outline" className="w-4 h-4" />
                {type}
                <button
                  type="button"
                  onClick={() => toggleAttrType(type)}
                  className="ml-1 w-4.5 h-4.5 flex items-center justify-center rounded-full hover:bg-indigo-200 transition-colors"
                >
                  <Icon icon="mdi:close" className="w-2.5 h-2.5" />
                </button>
              </div>
            ))
          }
        </div>
      </div>

      {/* Add custom option type */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Icon icon="mdi:tag-plus-outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
          <input
            type="text"
            value={customAttrName}
            onChange={(e) => setCustomAttrName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomAttrType(); } }}
            placeholder="e.g. Battery Grade, Controller Color, Warranty..."
            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/20 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-bold text-indigo-900 placeholder:text-indigo-300"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCustomAttrType}
          disabled={!customAttrName.trim()}
          className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 whitespace-nowrap"
        >
          <Icon icon="mdi:plus" className="w-4 h-4" /> Add Custom Category
        </button>
      </div>

      {/* Value pickers for active types */}
      {activeTypes.length > 0 && (
        <div className="space-y-3">
          {activeTypes.map((type) => {
            const cfg = ATTRIBUTE_OPTIONS[type];
            const isCustom = !cfg;
            const borderCls = isCustom ? "border-indigo-200" : cfg.border;
            const bgCls = isCustom ? "bg-indigo-50/30" : `${cfg.bg}/30`;
            const iconName = isCustom ? "mdi:tag-edit-outline" : cfg.icon;
            const colorCls = isCustom ? "text-indigo-600" : cfg.color;
            return (
              <div key={type} className={`p-4 rounded-2xl border ${borderCls} ${bgCls} space-y-3 animate-in fade-in duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon={iconName} className={`w-4 h-4 ${colorCls}`} />
                    <span className={`text-xs font-black uppercase tracking-wider ${colorCls}`}>{type}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {selectedAttrs[type]?.length || 0} selected
                  </span>
                </div>
                {isCustom ? (
                  <GenericValuePicker
                    type={type}
                    selectedValues={selectedAttrs[type]}
                    onAdd={(val) => addCustomValue(type, val)}
                    onRemove={(label) => removeAttrValue(type, label)}
                  />
                ) : (
                  <AttributeValuePicker
                    type={type}
                    selectedValues={selectedAttrs[type]}
                    onToggle={(val) => toggleAttrValue(type, val)}
                    onAdd={(val) => addCustomValue(type, val)}
                    onRemove={(label) => removeAttrValue(type, label)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTypes.length > 0 && activeTypes.every((t) => (selectedAttrs[t]?.length || 0) > 0) && (
        <div className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <Icon icon="mdi:check-circle" className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-[11px] font-bold text-emerald-700">
            Great! Combinations generated below. Proceed to Step 3.
          </p>
        </div>
      )}

      {activeTypes.length > 0 && activeTypes.some((t) => (selectedAttrs[t]?.length || 0) === 0) && (
        <div className="flex items-center gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-150">
          <Icon icon="mdi:alert-circle-outline" className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-[11px] font-bold text-amber-700">
            Please add at least one value/option under &quot;{activeTypes.find(t => (selectedAttrs[t]?.length || 0) === 0)}&quot; to auto-generate the variants block.
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
    <div className="flex flex-wrap items-center gap-3 p-4 bg-primary-50/50 border border-primary-200/50 rounded-2xl mb-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary-500 text-black flex items-center justify-center shadow shadow-primary-500/20">
          <Icon icon="mdi:lightning-bolt" className="w-4 h-4" />
        </div>
        <span className="text-xs font-black text-primary-850 uppercase tracking-wide">Bulk Edit Values</span>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-[260px]">
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price $"
          type="number"
          min="0"
          step="0.01"
          className="h-9 flex-1 px-3 text-xs font-bold rounded-xl border border-primary-200/70 focus:outline-none focus:border-primary-400 bg-white"
        />
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          type="number"
          min="0"
          className="h-9 flex-1 px-3 text-xs font-bold rounded-xl border border-primary-200/70 focus:outline-none focus:border-primary-400 bg-white"
        />
        <input
          value={disc}
          onChange={(e) => setDisc(e.target.value)}
          placeholder="Disc %"
          type="number"
          min="0"
          max="99"
          className="h-9 flex-1 px-3 text-xs font-bold rounded-xl border border-primary-200/70 focus:outline-none focus:border-primary-400 bg-white"
        />
        <button
          type="button"
          onClick={() => {
            onBulkFill({ ...(price && { price }), ...(stock && { stock }), ...(disc && { discountPercentage: disc }) });
            setPrice(""); setStock(""); setDisc("");
          }}
          className="h-9 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black rounded-xl transition-all whitespace-nowrap shadow-sm shadow-primary-500/10"
        >
          Apply to All
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   VARIANT CARDS VIEW (Spacious & Spacious per Variant)
   ══════════════════════════════════════════════════════════ */
function RowImagePreview({ imageFiles, existingImages, productImages }) {
  const blobSrc = React.useMemo(
    () => (imageFiles?.length ? URL.createObjectURL(imageFiles[0]) : null),
    [imageFiles]
  );

  if (blobSrc) {
    return <img src={blobSrc} className="w-full h-full object-cover" alt="" />;
  }
  if (existingImages?.[0]?.url) {
    return <img src={existingImages[0].url} className="w-full h-full object-cover" alt="" />;
  }
  if (productImages?.[0]?.url) {
    return (
      <div className="relative w-full h-full">
        <img src={productImages[0].url} className="w-full h-full object-cover opacity-30" alt="" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon icon="mdi:camera-plus-outline" className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    );
  }
  return <Icon icon="mdi:camera-plus-outline" className="w-5 h-5 text-gray-300" />;
}

function VariantCardItem({
  row,
  idx,
  updateRow,
  removeRow,
  errors,
  productImages,
  productBasePrice
}) {
  const totalImgs = (row.existingImages?.length || 0) + (row.imageFiles?.length || 0);
  const priceErr = errors[`${row.key}_price`];
  const stockErr = errors[`${row.key}_stock`];
  const salePrice = calcFinalPrice(row.price || productBasePrice, row.discountPercentage);

  const allPreviews = React.useMemo(() => [
    ...(row.existingImages || []).map((i) => ({ src: i.url, isExisting: true })),
    ...(row.imageFiles || []).map((f) => ({ src: URL.createObjectURL(f), isExisting: false })),
  ], [row.existingImages, row.imageFiles]);

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
    <div className={`bg-white rounded-2xl border p-4.5 transition-all shadow-sm hover:shadow-md flex flex-col gap-3.5 relative group hover:border-primary-400 ${priceErr || stockErr ? "border-red-200 bg-red-50/10 hover:border-red-300" : "border-gray-200"
      }`}>
      {/* Delete / Remove Variant Button */}
      <button
        type="button"
        onClick={() => removeRow(row.key)}
        className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg bg-gray-55/70 hover:bg-red-55 text-gray-450 hover:text-red-500 border border-gray-100 hover:border-red-200 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        title="Remove this combination"
      >
        <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
      </button>

      {/* Header labels - Gorgeous visual dynamic badges */}
      <div className="flex flex-wrap gap-1.5 pr-8 items-center">
        <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
          Variant #{idx + 1}
        </span>
        {row.combo.map((c, ci) => (
          <span key={ci} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gray-50 border border-gray-200/80 text-[11px] font-bold text-gray-750">
            {c.colorHex && <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: c.colorHex }} />}
            <span className="text-gray-400 font-medium uppercase text-[9px]">{c.name}:</span>
            <span className="font-extrabold text-gray-900">{c.value}</span>
          </span>
        ))}
        {row.combo.length === 0 && <span className="text-[11px] font-bold text-gray-455 bg-gray-150 px-2 py-0.5 rounded-lg">Default Variant</span>}
        {idx === 0 && (
          <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded text-[9px] font-black tracking-wider uppercase">Default Variant</span>
        )}
      </div>

      {/* Multi-Image Upload & Preview Gallery */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Variant Images ({totalImgs}/5)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allPreviews.map((img, idx) => (
            <div key={idx} className="relative w-12 h-12 group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
              <img src={img.src} className="w-full h-full object-cover" alt="" />
              <button
                type="button"
                onClick={() => removeImg(idx, img.isExisting)}
                className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-500 rounded text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon icon="mdi:close" className="w-2.5 h-2.5" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-0.5 left-0.5 text-[7px] bg-black/60 text-white px-1.5 py-0.5 rounded font-black uppercase">
                  Main
                </span>
              )}
            </div>
          ))}
          {/* Fallback product images if none uploaded */}
          {totalImgs === 0 && productImages?.slice(0, 3).map((img, idx) => (
            <div key={`vpf-${idx}`} className="relative w-12 h-12 rounded-xl overflow-hidden border border-dashed border-gray-300 bg-gray-50 opacity-40 shrink-0">
              <img src={img.url} className="w-full h-full object-cover" alt="" />
            </div>
          ))}
          {totalImgs < 5 && (
            <label className="w-12 h-12 flex flex-col items-center justify-center border border-dashed border-gray-250 hover:border-primary-400 hover:bg-primary-50/20 rounded-xl cursor-pointer transition-all group shrink-0">
              <Icon icon="mdi:camera-plus-outline" className="w-4.5 h-4.5 text-gray-305 group-hover:text-primary-400" />
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-tight mb-0.5">Price ($) <span className="normal-case font-normal text-gray-400">(opt.)</span></label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={row.price}
            onChange={(e) => updateRow(row.key, "price", e.target.value)}
            placeholder={productBasePrice ? String(productBasePrice) : "0.00"}
            className={`w-full h-8 px-2 text-xs rounded-lg border font-bold focus:outline-none focus:ring-1 ${priceErr ? "border-red-400 focus:ring-red-400/20 bg-red-50/10" : "border-gray-200 focus:border-primary-400"
              }`}
          />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-tight mb-0.5">Stock</label>
          <input
            type="number"
            min="0"
            value={row.stock}
            onChange={(e) => updateRow(row.key, "stock", e.target.value)}
            className={`w-full h-8 px-2 text-xs rounded-lg border font-bold focus:outline-none focus:ring-1 ${stockErr ? "border-red-400 focus:ring-red-400/20 bg-red-50/10" : "border-gray-200 focus:border-primary-400"
              }`}
          />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-tight mb-0.5">Discount %</label>
          <input
            type="number"
            min="0"
            max="99"
            value={row.discountPercentage}
            onChange={(e) => updateRow(row.key, "discountPercentage", e.target.value)}
            className="w-full h-8 px-2 text-xs rounded-lg border border-gray-200 font-bold focus:outline-none focus:ring-1 focus:border-primary-400"
          />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-tight mb-0.5">Sale Price</label>
          <div className="h-8 flex items-center">
            {salePrice ? (
              <span className="font-extrabold text-emerald-600 text-xs">${salePrice}</span>
            ) : (
              <span className="text-gray-300 text-xs">—</span>
            )}
          </div>
        </div>
      </div>

      {/* Extra Specs */}
      <div className="border-t border-gray-150/40 pt-2.5">
        <SpecsEditor
          specs={row.specs || []}
          onChange={(newSpecs) => updateRow(row.key, "specs", newSpecs)}
        />
      </div>
    </div>
  );
}

function VariantGrid({ rows, updateRow, removeRow, errors, bulkFill, productImages, productBasePrice }) {
  return (
    <div className="space-y-4">
      {rows.length > 1 && <BulkFillBar onBulkFill={bulkFill} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((row, idx) => (
          <VariantCardItem
            key={row.key}
            row={row}
            idx={idx}
            updateRow={updateRow}
            removeRow={removeRow}
            errors={errors}
            productImages={productImages}
            productBasePrice={productBasePrice}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   VARIANT TABLE VIEW
   ══════════════════════════════════════════════════════════ */
function VariantTable({
  rows,
  updateRow,
  removeRow,
  errors,
  bulkFill,
  productImages,
  productBasePrice
}) {
  return (
    <div className="space-y-4">
      {rows.length > 1 && <BulkFillBar onBulkFill={bulkFill} />}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-gray-55/80 border-b border-gray-100">
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Photos</th>
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Variant Option Combo</th>
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Price ($)</th>
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Stock</th>
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Disc %</th>
              <th className="px-4 py-3.5 font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Sale Price</th>
              <th className="px-4 py-3.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {rows.map((row, idx) => {
              const effectivePrice = row.price || productBasePrice || "";
              const salePrice = calcFinalPrice(effectivePrice, row.discountPercentage);
              const hasErr = errors[`${row.key}_price`] || errors[`${row.key}_stock`];
              const totalImgs = (row.existingImages?.length || 0) + (row.imageFiles?.length || 0);
              const canRemove = rows.length > 1;

              const allPreviews = [
                ...(row.existingImages || []).map((i) => ({ src: i.url, isExisting: true })),
                ...(row.imageFiles || []).map((f) => ({ src: URL.createObjectURL(f), isExisting: false })),
              ];

              return (
                <tr key={row.key} className={`group hover:bg-gray-55/70 transition-colors ${hasErr ? "bg-red-50/30" : ""}`}>
                  {/* Photo upload cell with multi-photo thumbnails */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 items-center max-w-[160px]">
                      {allPreviews.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative w-8 h-8 group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 animate-in fade-in">
                          <img src={img.src} className="w-full h-full object-cover" alt="" />
                          <button
                            type="button"
                            onClick={() => {
                              if (img.isExisting) {
                                updateRow(row.key, "existingImages", (row.existingImages || []).filter((_, i) => i !== imgIdx));
                              } else {
                                const existingCount = row.existingImages?.length || 0;
                                updateRow(row.key, "imageFiles", (row.imageFiles || []).filter((_, i) => i !== (imgIdx - existingCount)));
                              }
                            }}
                            className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon icon="mdi:close" className="w-2 h-2" />
                          </button>
                        </div>
                      ))}
                      {totalImgs < 5 && (
                        <label className="w-8 h-8 flex flex-col items-center justify-center border border-dashed border-gray-200 hover:border-primary-400 hover:bg-primary-50/20 rounded-lg cursor-pointer transition-all group shrink-0">
                          <Icon icon="mdi:camera-plus-outline" className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-400" />
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              if (totalImgs + files.length > 5) { alert("Max 5 images per variant."); return; }
                              updateRow(row.key, "imageFiles", [...(row.imageFiles || []), ...files]);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </td>

                  {/* Option values */}
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {row.combo.map((c, ci) => (
                          <span key={ci} className="flex items-center gap-1">
                            {c.colorHex && <span className="w-3 h-3 rounded-full border border-gray-255" style={{ backgroundColor: c.colorHex }} />}
                            <span className="font-bold text-gray-800">{c.value}</span>
                            {ci < row.combo.length - 1 && <span className="text-gray-300 font-medium">/</span>}
                          </span>
                        ))}
                        {row.combo.length === 0 && <span className="font-bold text-gray-800">Default Variant</span>}
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black border border-emerald-100">DEFAULT</span>
                        )}
                      </div>
                      <SpecsEditor
                        specs={row.specs || []}
                        onChange={(newSpecs) => updateRow(row.key, "specs", newSpecs)}
                      />
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.price}
                        onChange={(e) => updateRow(row.key, "price", e.target.value)}
                        placeholder={productBasePrice ? String(productBasePrice) : "0.00"}
                        className={`w-24 h-8 px-2 text-xs font-bold rounded-lg border focus:outline-none focus:ring-1 ${errors[`${row.key}_price`] ? "border-red-400 bg-red-50 focus:ring-red-400/20" : "border-gray-200 focus:border-primary-400"
                          }`}
                      />
                      {!row.price && productBasePrice && (
                        <span className="absolute -bottom-4 left-0 text-[8px] text-blue-500 whitespace-nowrap font-semibold">↑ using base price</span>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      value={row.stock}
                      onChange={(e) => updateRow(row.key, "stock", e.target.value)}
                      className={`w-20 h-8 px-2 text-xs font-bold rounded-lg border focus:outline-none focus:ring-1 ${errors[`${row.key}_stock`] ? "border-red-400 bg-red-50 focus:ring-red-400/20" : "border-gray-200 focus:border-primary-400"
                        }`}
                    />
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={row.discountPercentage}
                      onChange={(e) => updateRow(row.key, "discountPercentage", e.target.value)}
                      className="w-16 h-8 px-2 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:border-primary-450"
                    />
                  </td>

                  {/* Sale Price */}
                  <td className="px-4 py-3">
                    {salePrice ? (
                      <span className="font-black text-emerald-600 text-sm">${salePrice}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* Delete row */}
                  <td className="px-2 py-3">
                    {canRemove && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-55/35 transition-all"
                      >
                        <Icon icon="mdi:close" className="w-4 h-4" />
                      </button>
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
   SUMMARY CARDS STRIP
   ══════════════════════════════════════════════════════════ */
function SummaryStrip({ summary }) {
  const items = [
    { label: "Total Variants", value: summary.variantCount, icon: "mdi:layers", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Min Price", value: summary.minPrice ? `$${summary.minPrice}` : "—", icon: "mdi:tag-outline", color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Max Price", value: summary.maxPrice ? `$${summary.maxPrice}` : "—", icon: "mdi:tag-multiple", color: "text-primary-500", bg: "bg-primary-50" },
    { label: "Total Stock", value: summary.totalStock, icon: "mdi:package-variant", color: "text-amber-500", bg: "bg-amber-50" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((s) => (
        <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-150/60 shadow-sm">
          <div className={`w-8 h-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>
            <Icon icon={s.icon} className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">{s.label}</div>
            <div className={`font-black text-xs md:text-sm ${s.color} leading-none`}>{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT EXPORT
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
  removeRow,
  errors = {},
  product,
}) {
  const [viewMode, setViewMode] = useState("card");

  const defaultRow = rows[0];
  const hasRealCombos = rows.length > 1 || (rows.length === 1 && rows[0].combo.length > 0);
  const hasEnoughAttrValues = Object.keys(selectedAttrs).length > 0 &&
    Object.values(selectedAttrs).every((vals) => vals.length > 0);

  // Dynamic active step calculation
  const activeStep = wantsVariants
    ? hasRealCombos && hasEnoughAttrValues
      ? 3
      : 2
    : 1;

  return (
    <div className="space-y-6">
      {/* Wizard stepper status */}
      <StepperProgress
        activeStep={activeStep}
        wantsVariants={wantsVariants}
        hasRealCombos={hasRealCombos}
        hasEnoughAttrValues={hasEnoughAttrValues}
      />

      {/* STEP 1: BASE FALLBACK DETAILS */}
      <div className={activeStep === 1 ? "ring-2 ring-emerald-500/20 rounded-2xl" : ""}>
        <DefaultVariantPanel row={defaultRow} updateRow={updateRow} errors={errors} product={product} />
      </div>

      {/* STEP 2: ENABLE OPTIONS & ATTRIBUTE SELECTION */}
      <div className={activeStep === 2 ? "ring-2 ring-primary-500/25 rounded-2xl" : ""}>
        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${wantsVariants ? "bg-primary-500 text-black" : "bg-gray-100 text-gray-400"}`}>
                <Icon icon="mdi:tune" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Step 2: Add Option Variations</h3>
                <p className="text-[11px] text-gray-400 font-medium">Does this product come in different colors, storage sizes, etc.?</p>
              </div>
            </div>

            {/* Toggle variations */}
            <button
              type="button"
              onClick={() => setWantsVariants(!wantsVariants)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${wantsVariants ? "bg-primary-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${wantsVariants ? "translate-x-6" : ""}`} />
            </button>
          </div>

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

      {/* STEP 3: COMBINATIONS VIEW */}
      {wantsVariants && hasRealCombos && hasEnoughAttrValues && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center justify-between mb-3.5 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-500 text-black flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Icon icon="mdi:layers-outline" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Step 3: Variant Prices, Stock & Photos</h3>
                <p className="text-[11px] text-gray-400 font-medium">Configure individual values for generated combinations</p>
              </div>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 border border-gray-200 rounded-xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${viewMode === "card" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Icon icon="mdi:grid-large" className="w-3.5 h-3.5" /> Grid View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${viewMode === "table" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Icon icon="mdi:table-large" className="w-3.5 h-3.5" /> List View
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5 space-y-4">
            {viewMode === "card" ? (
              <VariantGrid
                rows={rows}
                updateRow={updateRow}
                errors={errors}
                bulkFill={bulkFill}
                productImages={product?.images}
                productBasePrice={product?.summary?.minSalePrice || product?.summary?.minPrice || null}
                removeRow={removeRow}
              />
            ) : (
              <VariantTable
                rows={rows}
                updateRow={updateRow}
                errors={errors}
                bulkFill={bulkFill}
                productImages={product?.images}
                productBasePrice={product?.summary?.minSalePrice || product?.summary?.minPrice || null}
                removeRow={removeRow}
              />
            )}

            <div className="pt-4 border-t border-gray-150/50">
              <SummaryStrip summary={summary} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}