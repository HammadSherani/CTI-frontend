/**
 * useVariantBuilder.js  (v3 — Multi-Attribute + Cartesian Product)
 *
 * State model:
 *   selectedAttrs: { [type]: AttrValue[] }    — which attributes & values are chosen
 *   rowData:       { [compositeKey]: RowData } — per-variant price/stock/etc.
 *
 * A "composite key" is the sorted join of all attribute name:value pairs,
 * e.g.  "Color:Black|Size:M"
 */

"use client";

import { useState, useMemo, useCallback } from "react";

/* ────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────── */
/**
 * Build a stable composite key from an array of { name, label, hex? }.
 * Sorted by name so order never matters.
 */
export const makeComboKey = (attrs) =>
  [...attrs]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((a) => `${a.name}:${a.label}`)
    .join("|");

/**
 * Cartesian product of multiple arrays.
 * cartesian([[A,B],[X,Y]]) → [[A,X],[A,Y],[B,X],[B,Y]]
 */
const cartesian = (groups) =>
  groups.reduce(
    (acc, group) => acc.flatMap((existing) => group.map((v) => [...existing, v])),
    [[]]
  );

const DEFAULT_ROW = {
  price: "",
  stock: "",
  discountPercentage: "",
  sku: "",
  existingImages: [],
  imageFiles: [],
  specs: [],  // dynamic key-value specs (additive)
};

/* ────────────────────────────────────────────────────────────
   HOOK
──────────────────────────────────────────────────────────── */
/**
 * @param {Array} initialVariants — from API (edit mode)
 */
export function useVariantBuilder(initialVariants = []) {

  /* ── Does the seller want attribute-based variants? ── */
  const [wantsVariants, setWantsVariants] = useState(() => {
    if (!initialVariants?.length) return false;
    // If any variant has attributes, the seller chose variants
    return initialVariants.some((v) => v.attributes?.length > 0);
  });

  /* ── Multi-attribute selection: { Color: [{label,hex?}], Size: [{label}] } ── */
  const [selectedAttrs, setSelectedAttrs] = useState(() => {
    if (!initialVariants?.length) return {};
    const map = {};
    initialVariants.forEach((v) => {
      (v.attributes || []).forEach((a) => {
        if (!map[a.name]) map[a.name] = [];
        if (!map[a.name].find((x) => x.label === a.value)) {
          map[a.name].push({ label: a.value, hex: a.colorHex || null });
        }
      });
    });
    return map;
  });

  /* ── Per-row data keyed by composite key or "default" ── */
  const [rowData, setRowData] = useState(() => {
    if (!initialVariants?.length) return {};
    const seed = {};
    initialVariants.forEach((v) => {
      const key =
        v.attributes?.length
          ? makeComboKey(v.attributes.map((a) => ({ name: a.name, label: a.value })))
          : "default";
      seed[key] = {
        _id:                v._id,
        price:              String(v.price || ""),
        stock:              String(v.stock || ""),
        discountPercentage: String(v.discountPercentage || ""),
        sku:                v.sku || "",
        existingImages:     v.images || [],
        imageFiles:         [],
        specs:              v.specs || [],  // seed existing specs
      };
    });
    return seed;
  });

  /* ──────────────────────────────────────────────────
     COMPUTED ROWS
  ────────────────────────────────────────────────── */
  const rows = useMemo(() => {
    // No variant mode → single Default Variant row
    if (!wantsVariants) {
      return [
        {
          key:   "default",
          label: "Default Variant",
          combo: [],
          ...(rowData["default"] || DEFAULT_ROW),
        },
      ];
    }

    const attrTypes  = Object.keys(selectedAttrs).sort();
    const valueGroups = attrTypes.map((type) =>
      (selectedAttrs[type] || []).map((v) => ({ ...v, type }))
    );

    // Nothing selected yet → still show default row
    if (!valueGroups.length || valueGroups.some((g) => g.length === 0)) {
      return [
        {
          key:   "default",
          label: "Default Variant",
          combo: [],
          ...(rowData["default"] || DEFAULT_ROW),
        },
      ];
    }

    // Generate all combinations
    return cartesian(valueGroups).map((combo) => {
      const attrs = combo.map((v) => ({ name: v.type, label: v.label, hex: v.hex || null }));
      const key   = makeComboKey(attrs);
      const label = attrs.map((a) => a.label).join(" / ");
      return {
        key,
        label,
        combo: attrs.map((a) => ({ name: a.name, value: a.label, colorHex: a.hex || null })),
        ...(rowData[key] || DEFAULT_ROW),
      };
    });
  }, [wantsVariants, selectedAttrs, rowData]);

  /* ──────────────────────────────────────────────────
     SUMMARY
  ────────────────────────────────────────────────── */
  const summary = useMemo(() => {
    const prices = rows.map((r) => Number(r.price)).filter((p) => p > 0);
    const stocks = rows.map((r) => Number(r.stock)).filter((s) => !isNaN(s));
    return {
      variantCount: rows.length,
      minPrice:     prices.length ? Math.min(...prices) : 0,
      maxPrice:     prices.length ? Math.max(...prices) : 0,
      totalStock:   stocks.reduce((a, b) => a + b, 0),
    };
  }, [rows]);

  /* ──────────────────────────────────────────────────
     VALIDATION
  ────────────────────────────────────────────────── */
  const validate = useCallback(() => {
    const errors = {};
    rows.forEach((r, idx) => {
      if (r.price !== "" && r.price !== undefined && Number(r.price) < 0)
        errors[`${r.key}_price`] = `Row ${idx + 1}: price cannot be negative`;
      if (r.stock === "" || Number(r.stock) < 0)
        errors[`${r.key}_stock`] = `Row ${idx + 1}: stock invalid`;
      if (r.discountPercentage && (Number(r.discountPercentage) < 0 || Number(r.discountPercentage) >= 100))
        errors[`${r.key}_discount`] = `Row ${idx + 1}: discount must be 0-99`;
    });
    return errors;
  }, [rows]);

  /* ──────────────────────────────────────────────────
     SERIALISE
  ────────────────────────────────────────────────── */
  const serialise = useCallback(
    () =>
      rows.map((r, idx) => ({
        _id:                r._id,
        attributes:         r.combo,
        price:              Number(r.price),
        stock:              Number(r.stock || 0),
        discountPercentage: Number(r.discountPercentage || 0),
        sku:                r.sku?.trim() || undefined,
        images:             r.existingImages || [],
        isDefault:          r.key === "default" || idx === 0,
        specs:              r.specs || [],  // include dynamic specs
      })),
    [rows]
  );

  /* ──────────────────────────────────────────────────
     MUTATORS
  ────────────────────────────────────────────────── */
  /** Toggle an attribute TYPE on/off (e.g. "Color") */
  const toggleAttrType = useCallback((type) => {
    setSelectedAttrs((prev) => {
      const next = { ...prev };
      if (next[type]) {
        delete next[type];
      } else {
        next[type] = [];
      }
      return next;
    });
  }, []);

  /** Toggle a specific value within an attribute type */
  const toggleAttrValue = useCallback((type, val) => {
    setSelectedAttrs((prev) => {
      const list = prev[type] || [];
      const exists = list.find((v) => v.label === val.label);
      return {
        ...prev,
        [type]: exists ? list.filter((v) => v.label !== val.label) : [...list, val],
      };
    });
  }, []);

  /** Add a custom value (from free-text input) */
  const addCustomValue = useCallback((type, val) => {
    setSelectedAttrs((prev) => {
      const list = prev[type] || [];
      if (list.find((v) => v.label === val.label)) return prev;
      return { ...prev, [type]: [...list, val] };
    });
  }, []);

  /** Remove a specific value label from a type */
  const removeAttrValue = useCallback((type, label) => {
    setSelectedAttrs((prev) => ({
      ...prev,
      [type]: (prev[type] || []).filter((v) => v.label !== label),
    }));
  }, []);

  /** Update a single field in a variant row */
  const updateRow = useCallback((key, field, value) => {
    setRowData((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || DEFAULT_ROW), [field]: value },
    }));
  }, []);

  /** Bulk-fill price/stock/discount across all current rows */
  const bulkFill = useCallback(
    ({ price, stock, discountPercentage }) => {
      setRowData((prev) => {
        const next = { ...prev };
        rows.forEach(({ key }) => {
          next[key] = {
            ...(next[key] || DEFAULT_ROW),
            ...(price              !== undefined && { price }),
            ...(stock              !== undefined && { stock }),
            ...(discountPercentage !== undefined && { discountPercentage }),
          };
        });
        return next;
      });
    },
    [rows]
  );

  return {
    // State
    wantsVariants,
    selectedAttrs,
    rows,
    summary,
    // Actions
    setWantsVariants,
    toggleAttrType,
    toggleAttrValue,
    addCustomValue,
    removeAttrValue,
    updateRow,
    bulkFill,
    validate,
    serialise,
  };
}