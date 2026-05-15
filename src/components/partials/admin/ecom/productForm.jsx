"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from "@/i18n/navigation";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
/* ─── Preset attribute templates ─────────────────────────── */
const ATTRIBUTE_PRESETS = [
  { name: "Color", icon: "mdi:palette-outline", unit: "", placeholder: "e.g. Red, Blue, Black" },
  { name: "Size", icon: "mdi:ruler-square", unit: "", placeholder: "e.g. S, M, L, XL or 42" },
  { name: "Weight", icon: "mdi:weight", unit: "kg", placeholder: "e.g. 1.5" },
  { name: "Material", icon: "mdi:texture-box", unit: "", placeholder: "e.g. Cotton, Polyester" },
  { name: "Dimensions", icon: "mdi:cube-scan", unit: "cm", placeholder: "e.g. 30×20×10" },
  { name: "Warranty", icon: "mdi:shield-check-outline", unit: "months", placeholder: "e.g. 12" },
  { name: "Brand Model", icon: "mdi:barcode-scan", unit: "", placeholder: "e.g. ABC-100X" },
  { name: "Custom", icon: "mdi:plus-circle-outline", unit: "", placeholder: "e.g. Any value" },
];

/* ─── Single Attribute Row ────────────────────────────────── */
function AttributeRow({ attr, index, onChange, onRemove }) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="group flex items-start gap-3 p-3.5 bg-gray-50 hover:bg-gray-100/70 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
      {/* Preset picker button */}
      <div className="relative flex-shrink-0 mt-0.5">
        <button
          type="button"
          onClick={() => setShowPresets((p) => !p)}
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-all shadow-sm"
          title="Pick attribute type"
        >
          <Icon icon={ATTRIBUTE_PRESETS.find((p) => p.name === attr.name)?.icon || "mdi:tag-outline"} className="w-4 h-4 text-primary-500" />
        </button>
        {showPresets && (
          <div className="absolute top-11 left-0 z-20 bg-white rounded-2xl border border-gray-100 shadow-xl p-1.5 w-52">
            {ATTRIBUTE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onChange(index, "name", preset.name === "Custom" ? "" : preset.name);
                  onChange(index, "unit", preset.unit);
                  setShowPresets(false);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-primary-50 text-left text-sm transition-colors"
              >
                <Icon icon={preset.icon} className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{preset.name}</span>
                {preset.unit && <span className="ml-auto text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{preset.unit}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={attr.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
          placeholder="Attribute name"
          className="w-full h-9 px-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-all font-medium text-gray-700"
        />
      </div>

      {/* Value */}
      <div className="flex-[2] min-w-0">
        <input
          type="text"
          value={attr.value}
          onChange={(e) => onChange(index, "value", e.target.value)}
          placeholder={ATTRIBUTE_PRESETS.find((p) => p.name === attr.name)?.placeholder || "Value"}
          className="w-full h-9 px-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-all text-gray-700"
        />
      </div>

      {/* Unit */}
      <div className="w-20 flex-shrink-0">
        <input
          type="text"
          value={attr.unit}
          onChange={(e) => onChange(index, "unit", e.target.value)}
          placeholder="Unit"
          className="w-full h-9 px-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-all text-gray-400"
        />
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all mt-0.5"
      >
        <Icon icon="mdi:close" className="w-4 h-4" />
      </button>
    </div>
  );
}


const productSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(300, "Title is too long")
    .required("Product title is required"),

  shortDescription: yup
    .string()
    .trim()
    .max(500, "Short description is too long")
    .nullable(),

  description: yup
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .required("Detailed description is required"),

  categoryId: yup
    .string()
    .required("Please select a category"),

  subCategoryId: yup.string().nullable(),
  brandId: yup.string().nullable(),

  price: yup
    .number()
    .typeError("Price must be a valid number")
    .positive("Price must be greater than 0")
    .required("Price is required"),

  isDiscounted: yup.boolean().default(false),

  discountPrice: yup
    .number()
    .typeError("Discount price must be a valid number")
    .positive("Discount price must be greater than 0")
    .when('isDiscounted', {
      is: true,
      then: (schema) =>
        schema
          .required("Discount price is required when discount is enabled")
          .lessThan(yup.ref('price'), "Discount price must be less than original price"),
      otherwise: (schema) => schema.nullable(),
    }),
  stock: yup
    .number()
    .typeError("Stock must be a valid number")
    .min(0, "Stock cannot be negative")
    .required("Stock quantity is required"),
});

/* ─── Reusable Product Form (Add & Edit) ─────────────────── */
export default function ProductForm({ mode = "create", initialData = null }) {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

 const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      title: initialData?.title || "",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId?._id || initialData?.categoryId || "",
      subCategoryId: initialData?.subCategoryId?._id || initialData?.subCategoryId || "",
      brandId: initialData?.brandId?._id || initialData?.brandId || "",
      price: initialData?.price || "",
      discountPrice: initialData?.discountPrice || "",
      isDiscounted: initialData?.isDiscounted || false,
      stock: initialData?.stock || "",
    },
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [previews, setPreviews] = useState(initialData?.images?.map((img) => img.url) || []);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Attributes state
  const [attributes, setAttributes] = useState(
    initialData?.attributes?.length > 0
      ? initialData.attributes.map((a) => ({ name: a.name || "", value: String(a.value ?? ""), unit: a.unit || "" }))
      : []
  );

  const selectedCategory = watch("categoryId");
  const selectedSubCategory = watch("subCategoryId");
  const isDiscounted = watch("isDiscounted");

  // Load categories
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosInstance.get("/seller/product/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(data.data || []);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    fetch();
  }, [token]);

  // Load subcategories when category changes
  useEffect(() => {
    if (!selectedCategory) { setSubCategories([]); setBrands([]); return; }
    const fetch = async () => {
      try {
        const { data } = await axiosInstance.get(`/seller/product/subcategories/${selectedCategory}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubCategories(data.data || []);
        const isInitial = initialData?.categoryId?._id === selectedCategory || initialData?.categoryId === selectedCategory;
        if (!isInitial) { setValue("subCategoryId", ""); setValue("brandId", ""); setBrands([]); }
      } catch { toast.error("Failed to load subcategories"); }
    };
    fetch();
  }, [selectedCategory, token]);

  // Load brands when subcategory changes
  useEffect(() => {
    if (!selectedSubCategory) { setBrands([]); return; }
    const fetch = async () => {
      try {
        const { data } = await axiosInstance.get(`/seller/product/brands/${selectedSubCategory}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBrands(data.data || []);
        const isInitial = initialData?.subCategoryId?._id === selectedSubCategory || initialData?.subCategoryId === selectedSubCategory;
        if (!isInitial) setValue("brandId", "");
      } catch { toast.error("Failed to load brands"); }
    };
    fetch();
  }, [selectedSubCategory, token]);

  /* ── Attribute helpers ── */
  const addAttribute = () => setAttributes((prev) => [...prev, { name: "", value: "", unit: "" }]);

  const updateAttribute = (index, field, value) => {
    setAttributes((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  };

  const removeAttribute = (index) => setAttributes((prev) => prev.filter((_, i) => i !== index));

  const addPresetAttribute = (preset) => {
    if (preset.name === "Custom") { addAttribute(); return; }
    setAttributes((prev) => [...prev, { name: preset.name, value: "", unit: preset.unit }]);
  };

  /* ── Image helpers ── */
  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previews.length > 5) { toast.warning("Maximum 5 images allowed"); return; }
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    const urlToRemove = previews[index];
    if (urlToRemove?.startsWith("blob:")) {
      setSelectedFiles((prev) => {
        const matching = prev.find((f) => URL.createObjectURL(f) === urlToRemove);
        return prev.filter((f) => f !== matching);
      });
    }
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
          fd.append(key, formData[key]);
        }
      });

      // Append valid attributes as JSON
      const validAttrs = attributes.filter((a) => a.name.trim() && String(a.value).trim());
      fd.append("attributes", JSON.stringify(validAttrs));

      if (mode === "edit") {
        previews.filter((url) => !url.startsWith("blob:")).forEach((url) => fd.append("existingImages", url));
      }
      selectedFiles.forEach((file) => fd.append("images", file));

      const url = mode === "create" ? "/seller/product/create" : `/seller/product/${initialData._id}`;
      const method = mode === "create" ? "post" : "put";

      await axiosInstance[method](url, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      toast.success(`Product ${mode === "create" ? "created" : "updated"} successfully`);
      router.push("/seller/product");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const selectStyle = "w-full h-12 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] disabled:bg-gray-50 disabled:text-gray-400";
  const chevronBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
          <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-0.5">
            <span className="hover:text-primary-600 cursor-pointer transition-colors" onClick={() => router.push("/seller/product")}>Products</span>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-gray-600">{mode === "create" ? "Add New Product" : "Edit Product"}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {mode === "create" ? "Add New Product" : `Edit: ${initialData?.title}`}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="xl:col-span-2 space-y-6">

            {/* Basic Info */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2">
                <Icon icon="mdi:information-outline" className="w-5 h-5 text-primary-500" />
                Basic Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Title <span className="text-red-500">*</span></label>
                  <input {...register("title", { required: "Title is required" })}
                    className={`w-full h-12 px-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.title ? "border-red-400 bg-red-50/30" : "border-gray-200 focus:border-primary-500"}`}
                    placeholder="e.g. Wireless Noise Cancelling Headphones"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1"><Icon icon="mdi:alert-circle-outline" className="w-3.5 h-3.5" />{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description</label>
                  <input {...register("shortDescription")}
                    className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="Brief one-line summary..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Description <span className="text-red-500">*</span></label>
                  <textarea {...register("description", { required: "Description is required" })} rows={5}
                    className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none ${errors.description ? "border-red-400 bg-red-50/30" : "border-gray-200 focus:border-primary-500"}`}
                    placeholder="Detailed description of your product..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1"><Icon icon="mdi:alert-circle-outline" className="w-3.5 h-3.5" />{errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Categorization */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2">
                <Icon icon="mdi:shape-outline" className="w-5 h-5 text-primary-500" />
                Categorization
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select {...register("categoryId", { required: "Category is required" })} className={`${selectStyle} ${errors.categoryId ? "border-red-400 bg-red-50/30" : ""}`} style={{ backgroundImage: chevronBg }}>
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                  {errors.categoryId && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.categoryId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subcategory</label>
                  <select {...register("subCategoryId")} disabled={!selectedCategory} className={selectStyle} style={{ backgroundImage: chevronBg }}>
                    <option value="">Select Subcategory</option>
                    {subCategories.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand</label>
                  <select {...register("brandId")} disabled={!selectedSubCategory} className={selectStyle} style={{ backgroundImage: chevronBg }}>
                    <option value="">Select Brand</option>
                    {brands.map((b) => <option key={b._id} value={b._id}>{b.title}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── ATTRIBUTES SECTION ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                  <Icon icon="mdi:tune-variant" className="w-5 h-5 text-primary-500" />
                  Product Attributes
                  {attributes.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-primary-100 text-primary-600 text-xs font-bold rounded-full">{attributes.length}</span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors border border-primary-100"
                >
                  <Icon icon="mdi:plus" className="w-4 h-4" />
                  Add Row
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-5">Add specifications like color, size, weight, material, etc.</p>

              {/* Quick-add presets */}
              <div className="flex flex-wrap gap-2 mb-5">
                {ATTRIBUTE_PRESETS.slice(0, 6).map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => addPresetAttribute(preset)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 text-gray-600 border border-gray-200 rounded-xl text-xs font-medium transition-all"
                  >
                    <Icon icon={preset.icon} className="w-3.5 h-3.5" />
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Column headers */}
              {attributes.length > 0 && (
                <div className="flex items-center gap-3 mb-2 px-1">
                  <div className="w-9 flex-shrink-0" />
                  <div className="flex-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Name</div>
                  <div className="flex-[2] text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Value</div>
                  <div className="w-20 flex-shrink-0 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Unit</div>
                  <div className="w-9 flex-shrink-0" />
                </div>
              )}

              {/* Rows */}
              <div className="space-y-2">
                {attributes.map((attr, i) => (
                  <AttributeRow key={i} attr={attr} index={i} onChange={updateAttribute} onRemove={removeAttribute} />
                ))}
              </div>

              {attributes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                    <Icon icon="mdi:tune-variant" className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-400">No attributes added yet</p>
                  <p className="text-xs text-gray-300 mt-0.5 mb-4">Click a preset above or use "Add Row"</p>
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors"
                  >
                    <Icon icon="mdi:plus" className="w-4 h-4" />
                    Add First Attribute
                  </button>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2">
                <Icon icon="mdi:image-multiple-outline" className="w-5 h-5 text-primary-500" />
<h2 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2">
            Product Images <span className="text-red-500">*</span>
          </h2>                <span className="ml-auto text-xs text-gray-400 font-normal">{previews.length}/5</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {previews.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-2xl border border-gray-100 overflow-hidden bg-gray-50">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600">
                      <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" />
                    </button>
                    {i === 0 && <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded font-medium">Main</span>}
                  </div>
                ))}
                {previews.length < 5 && (
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary-400 hover:bg-primary-50/30 cursor-pointer transition-all group">
                    <Icon icon="mdi:plus-circle-outline" className="w-8 h-8 text-gray-300 group-hover:text-primary-400 transition-colors" />
                    <span className="text-[10px] font-medium text-gray-400 mt-1.5">Add Image</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={onFileChange} />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">First image will be used as the main product image. Max 5 images.</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2">
                <Icon icon="mdi:tag-outline" className="w-5 h-5 text-primary-500" />
                Pricing
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">$</span>
                    <input type="number" step="0.01" {...register("price", { required: "Price is required", min: { value: 0, message: "Must be ≥ 0" } })}
                      className={`w-full h-12 pl-8 pr-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.price ? "border-red-400 bg-red-50/30" : "border-gray-200 focus:border-primary-500"}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.price.message}</p>}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Enable Discount</p>
                    <p className="text-xs text-gray-400">Show a discounted price</p>
                  </div>
                  <label className="relative cursor-pointer">
                    <input type="checkbox" {...register("isDiscounted")} className="sr-only" />
                    <div className={`w-11 h-6 rounded-full transition-all duration-300 ${isDiscounted ? "bg-primary-500" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${isDiscounted ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </label>
                </div>

                {isDiscounted && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discounted Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-semibold text-sm">$</span>
                      <input type="number" step="0.01" {...register("discountPrice", { min: { value: 0, message: "Must be ≥ 0" } })}
                        className="w-full h-12 pl-8 pr-4 rounded-2xl border border-emerald-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 bg-emerald-50/30 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2">
                <Icon icon="mdi:cube-outline" className="w-5 h-5 text-primary-500" />
                Inventory
              </h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock Quantity</label>
                <input type="number" {...register("stock", { min: { value: 0, message: "Must be ≥ 0" } })}
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="0"
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.stock.message}</p>}
              </div>
            </div>

            {/* Attribute summary (read-only preview) */}
            {attributes.filter((a) => a.name && a.value).length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                  <Icon icon="mdi:format-list-checks" className="w-5 h-5 text-primary-500" />
                  Attribute Summary
                </h2>
                <div className="space-y-2">
                  {attributes.filter((a) => a.name && a.value).map((a, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-xs font-medium text-gray-500">{a.name}</span>
                      <span className="text-xs font-semibold text-gray-800">{a.value}{a.unit ? ` ${a.unit}` : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button type="submit" disabled={submitting}
                className="w-full py-4 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
              >
                {submitting ? (
                  <><Icon icon="mdi:loading" className="animate-spin w-5 h-5" />{mode === "create" ? "Creating..." : "Saving..."}</>
                ) : (
                  <><Icon icon={mode === "create" ? "mdi:plus-circle-outline" : "mdi:content-save-outline"} className="w-5 h-5" />{mode === "create" ? "Create Product" : "Save Changes"}</>
                )}
              </button>
              <button type="button" onClick={() => router.back()}
                className="w-full py-3.5 text-sm font-semibold bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}