"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from '@/i18n/navigation';
import Button from "@/components/partials/admin/ecom/myButton";

export default function ProductForm({ mode, initialData }) {
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  const [form, setForm] = useState({
    categoryId: initialData?.categoryId?._id || initialData?.categoryId || "",
    brandId: initialData?.brandId?._id || initialData?.brandId || "",
    modelId: initialData?.modelId?._id || initialData?.modelId || "",
    attributes: initialData?.attributes?.length
      ? initialData.attributes.map(a => ({
        key: a.key,
        values: Array.isArray(a.values) ? a.values.join(", ") : (a.value || "")
      }))
      : [{ key: "", values: "" }],
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load categories
  useEffect(() => {
    if (!token) return;
    axiosInstance
      .get("/admin/refurbish/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setCategories(r.data?.data || []))
      .catch(() => { });
  }, [token]);

  // Load brands
  useEffect(() => {
    if (!form.categoryId || !token) { setBrands([]); return; }
    axiosInstance
      .get(`/admin/refurbish/brands?categoryId=${form.categoryId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setBrands(r.data?.data || []))
      .catch(() => { });
  }, [form.categoryId, token]);

  // Load models
  useEffect(() => {
    if (!form.brandId || !token) { setModels([]); return; }
    axiosInstance
      .get(`/admin/refurbish/models?brandId=${form.brandId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setModels(r.data?.data || []))
      .catch(() => { });
  }, [form.brandId, token]);

  const validate = () => {
    const e = {};
    if (!form.categoryId) e.categoryId = "Select a category";
    if (!form.brandId) e.brandId = "Select a brand";
    if (!form.modelId) e.modelId = "Select a model";
    const validAttrs = form.attributes.filter((a) => a.key.trim() && a.values.trim());
    if (validAttrs.length === 0) e.attributes = "Add at least one attribute with values";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      // Parse values string into array (comma separated)
      const parsedAttributes = form.attributes
        .filter(a => a.key.trim() && a.values.trim())
        .map(a => ({
          key: a.key.trim(),
          values: a.values.split(',').map(v => v.trim()).filter(v => v)
        }));

      const payload = {
        categoryId: form.categoryId,
        brandId: form.brandId,
        modelId: form.modelId,
        attributes: JSON.stringify(parsedAttributes),
      };

      if (mode === "create") {
        await axiosInstance.post("/admin/refurbish/variants", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product created successfully");
      } else {
        await axiosInstance.put(`/admin/refurbish/variants/${initialData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product updated successfully");
      }
      router.push("/admin/refurbished/variants");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const addAttr = () => setForm((p) => ({ ...p, attributes: [...p.attributes, { key: "", values: "" }] }));
  const removeAttr = (i) => setForm((p) => ({ ...p, attributes: p.attributes.filter((_, idx) => idx !== i) }));
  const updateAttr = (i, field, val) =>
    setForm((p) => ({
      ...p,
      attributes: p.attributes.map((a, idx) => (idx === i ? { ...a, [field]: val } : a)),
    }));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/admin/refurbished/products")} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <Icon icon="mdi:arrow-left" className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            {mode === "create" ? "Create Refurbished Product" : "Edit Refurbished Product"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure models and their available variants</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/60 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Base Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Base Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value, brandId: "", modelId: "" }))}
                  className={`w-full h-12 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50 ${errors.categoryId ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                >
                  <option value="">Choose Category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1.5">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value, modelId: "" }))}
                  disabled={!form.categoryId}
                  className={`w-full h-12 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-60 bg-gray-50 ${errors.brandId ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                >
                  <option value="">Choose Brand</option>
                  {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
                {errors.brandId && <p className="text-red-500 text-xs mt-1.5">{errors.brandId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <select
                  value={form.modelId}
                  onChange={(e) => setForm((p) => ({ ...p, modelId: e.target.value }))}
                  disabled={!form.brandId}
                  className={`w-full h-12 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-60 bg-gray-50 ${errors.modelId ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                >
                  <option value="">Choose Model</option>
                  {models.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
                {errors.modelId && <p className="text-red-500 text-xs mt-1.5">{errors.modelId}</p>}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Variants / Attributes</h3>
                <p className="text-sm text-gray-500 mt-1">Define the available options for this model (e.g., Storage: 128GB, 256GB)</p>
              </div>
              <Button type="button" onClick={addAttr} variant="secondary">
                <Icon icon="mdi:plus" className="w-4 h-4 mr-1.5" />
                Add Variant
              </Button>
            </div>

            {errors.attributes && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{errors.attributes}</p>}

            <div className="space-y-4">
              {form.attributes.map((attr, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Variant Title</label>
                    <input
                      type="text"
                      value={attr.key}
                      onChange={(e) => updateAttr(i, "key", e.target.value)}
                      placeholder="e.g. Storage"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 bg-white"
                    />
                  </div>

                  <div className="flex-1 w-full relative">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Options (Comma separated)</label>
                    <input
                      type="text"
                      value={attr.values}
                      onChange={(e) => updateAttr(i, "values", e.target.value)}
                      placeholder="e.g. 128GB, 256GB, 512GB"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 bg-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttr(i)}
                      disabled={form.attributes.length === 1}
                      className="absolute right-2 top-8 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Remove variant"
                    >
                      <Icon icon="mdi:delete-outline" className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex gap-4 justify-end border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push("/admin/refurbished/products")}
              className="px-6 py-2.5 text-sm font-medium bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-60 transition flex items-center gap-2 shadow-sm"
            >
              {submitting && <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />}
              {mode === "create" ? "Create Configuration" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
