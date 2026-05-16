/**
 * useVariantBuilder.js (SIMPLIFIED)
 *
 * Isolated hook that owns all variant state:
 *   - attribute type (Color OR Size OR Storage)
 *   - flat list of variants (one for each value)
 *   - per-variant price / stock / discount / sku editing
 */

"use client";

import { useState, useMemo, useCallback } from "react";

/* ── Build a stable key ── */
const rowKey = (type, value) => `${type}:${value}`;

const DEFAULT_ROW = { price: "", stock: "", discountPercentage: "", sku: "" };

/**
 * @param {Array} initialVariants  — from API on edit mode
 */
export function useVariantBuilder(initialVariants = []) {
  /* ──────────────────────────────────────────────────
     ATTRIBUTE TYPE & VALUES
     type: "Color", values: [{label:"Black", hex:"#111"}]
  ────────────────────────────────────────────────── */
  const [attrType, setAttrType] = useState(() => {
    if (!initialVariants?.length) return "";
    // Find the first attribute name used (assuming all variants share the same type)
    return initialVariants[0].attributes?.[0]?.name || "";
  });

  const [attrValues, setAttrValues] = useState(() => {
    if (!initialVariants?.length) return [];
    const values = [];
    initialVariants.forEach((v) => {
      const attr = v.attributes?.[0];
      if (attr && !values.find((x) => x.label === attr.value)) {
        values.push({ label: attr.value, hex: attr.colorHex || null });
      }
    });
    return values;
  });

  /* ──────────────────────────────────────────────────
     ROW DATA  { [key]: {price, stock, discountPercentage, sku} }
  ────────────────────────────────────────────────── */
  const [rowData, setRowData] = useState(() => {
    if (!initialVariants?.length) return {};
    const seed = {};
    initialVariants.forEach((v) => {
      const attr = v.attributes?.[0];
      if (attr) {
        const key = rowKey(attr.name, attr.value);
        seed[key] = {
          price:              String(v.price || ""),
          stock:              String(v.stock || ""),
          discountPercentage: String(v.discountPercentage || ""),
          sku:                v.sku || "",
        };
      }
    });
    return seed;
  });

  /* ──────────────────────────────────────────────────
     RESOLVED ROWS (computed from selected values)
  ────────────────────────────────────────────────── */
  const rows = useMemo(() => {
    if (!attrType || !attrValues.length) return [];

    return attrValues.map((v) => {
      const key = rowKey(attrType, v.label);
      return {
        key,
        label: v.label,
        combo: [{ name: attrType, value: v.label, colorHex: v.hex || null }],
        ...(rowData[key] || DEFAULT_ROW),
      };
    });
  }, [attrType, attrValues, rowData]);

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
      if (!r.price || Number(r.price) <= 0)
        errors[`${r.key}_price`] = `Row ${idx + 1}: price required`;
      if (r.stock === "" || Number(r.stock) < 0)
        errors[`${r.key}_stock`] = `Row ${idx + 1}: stock invalid`;
      if (r.discountPercentage && (Number(r.discountPercentage) < 0 || Number(r.discountPercentage) >= 100))
        errors[`${r.key}_discount`] = `Row ${idx + 1}: discount must be 0-99`;
    });
    return errors;
  }, [rows]);

  /* ──────────────────────────────────────────────────
     SERIALISE (for API submission)
  ────────────────────────────────────────────────── */
  const serialise = useCallback(
    () =>
      rows.map((r, idx) => ({
        attributes:         r.combo,
        price:              Number(r.price),
        stock:              Number(r.stock || 0),
        discountPercentage: Number(r.discountPercentage || 0),
        sku:                r.sku?.trim() || undefined,
        isDefault:          idx === 0,
      })),
    [rows]
  );

  /* ──────────────────────────────────────────────────
     MUTATORS
  ────────────────────────────────────────────────── */
  const setAttributeType = useCallback((type) => {
    setAttrType(type);
    setAttrValues([]); // Clear values when type changes
    setRowData({});    // Clear row data when type changes
  }, []);

  const toggleValue = useCallback((val) => {
    setAttrValues((prev) => {
      const exists = prev.find((v) => v.label === val.label);
      return exists
        ? prev.filter((v) => v.label !== val.label)
        : [...prev, val];
    });
  }, []);

  const addCustomValue = useCallback((val) => {
    setAttrValues((prev) => {
      if (prev.find((v) => v.label === val.label)) return prev;
      return [...prev, val];
    });
  }, []);

  const removeValue = useCallback((label) => {
    setAttrValues((prev) => prev.filter((v) => v.label !== label));
  }, []);

  const updateRow = useCallback((key, field, value) => {
    setRowData((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || DEFAULT_ROW), [field]: value },
    }));
  }, []);

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
    validate,
    serialise,
  };
}