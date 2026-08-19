"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from '@/i18n/navigation';
import RichTextEditor from "@/components/partials/admin/ecom/RichTextEditor";

/* ══════════════════════════════════════════════════════════
   UI PRIMITIVES
══════════════════════════════════════════════════════════ */
const FieldError = ({ err }) =>
  err ? (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
      <Icon icon="mdi:alert-circle-outline" className="w-3.5 h-3.5 flex-shrink-0" />
      {err}
    </p>
  ) : null;

const Input = React.forwardRef(({ error, prefix, suffix, className = "", ...props }, ref) => (
  <div className="relative">
    {prefix && (
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold pointer-events-none">
        {prefix}
      </span>
    )}
    <input
      ref={ref}
      {...props}
      className={`w-full h-11 ${prefix ? "pl-8" : "px-4"} ${suffix ? "pr-10" : "pr-4"} rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${error
        ? "border-red-400 bg-red-50/40 focus:border-red-400"
        : "border-gray-200 focus:border-primary-500"
        } ${className}`}
    />
    {suffix && (
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold pointer-events-none">
        {suffix}
      </span>
    )}
  </div>
));
Input.displayName = "Input";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ icon, children }) => (
  <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
    <Icon icon={icon} className="w-4 h-4 text-primary-500" />
    {children}
  </h2>
);

const SEL = "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none disabled:bg-gray-50 disabled:text-gray-400 bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]";
const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`;


/* ══════════════════════════════════════════════════════════
   MAIN FORM
══════════════════════════════════════════════════════════ */
export default function ProductForm({ mode, initialData }) {
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [form, setForm] = useState({
    categoryId: initialData?.categoryId?._id || initialData?.categoryId || "",
    brandId: initialData?.brandId?._id || initialData?.brandId || "",
    title: initialData?.title || "",
    sku: initialData?.sku || "",
    modelNumber: initialData?.modelNumber || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    tags: initialData?.tags || [],
    warranty: {
      type: initialData?.warranty?.type || "no",
      months: initialData?.warranty?.months || 0
    },
    attributes: initialData?.attributes?.length
      ? initialData.attributes.map(a => ({
        key: a.key,
        values: Array.isArray(a.values) ? a.values.join(", ") : (a.value || "")
      }))
      : [{ key: "", values: "" }],
  });

  const [tagInput, setTagInput] = useState("");

  const [images, setImages] = useState([]); // File objects
  const [existingImages, setExistingImages] = useState(initialData?.images?.map(i => i.url) || []);
  const [videos, setVideos] = useState([]); // File objects
  const [existingVideos, setExistingVideos] = useState(initialData?.videos?.map(v => v.url) || []);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load categories
  useEffect(() => {
    if (!token) return;
    axiosInstance
      .get("/seller/refurbished-products/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setCategories(r.data?.data || []))
      .catch(() => { });
  }, [token]);

  // Load brands
  useEffect(() => {
    if (!form.categoryId || !token) { setBrands([]); return; }
    axiosInstance
      .get(`/seller/refurbished-products/brands/${form.categoryId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setBrands(r.data?.data || []))
      .catch(() => { });
  }, [form.categoryId, token]);

  const validate = () => {
    const e = {};
    if (!form.categoryId) e.categoryId = "Select a category";
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.modelNumber.trim()) e.modelNumber = "Model Number is required";
    if (!form.description.trim()) e.description = "Description is required";

    if (mode === "create" && images.length === 0 && existingImages.length === 0) {
      e.images = "At least one image is required";
    }

    return e;
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);
    setVideos(prev => [...prev, ...files]);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeNewImage = (idx) => setImages(images.filter((_, i) => i !== idx));
  const removeExistingImage = (url) => setExistingImages(existingImages.filter(img => img !== url));
  const removeNewVideo = (idx) => setVideos(videos.filter((_, i) => i !== idx));
  const removeExistingVideo = (url) => setExistingVideos(existingVideos.filter(vid => vid !== url));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix form errors");
      return;
    }

    setSubmitting(true);
    try {
      const parsedAttributes = form.attributes
        .filter(a => a.key.trim() && a.values.trim())
        .map(a => ({
          key: a.key.trim(),
          values: a.values.split(',').map(v => v.trim()).filter(v => v)
        }));

      const formData = new FormData();
      formData.append("categoryId", form.categoryId);
      if (form.brandId) formData.append("brandId", form.brandId);
      formData.append("title", form.title);
      formData.append("sku", form.sku);
      formData.append("modelNumber", form.modelNumber);
      if (form.shortDescription) formData.append("shortDescription", form.shortDescription);
      formData.append("description", form.description);
      formData.append("tags", JSON.stringify(form.tags));
      formData.append("warranty[type]", form.warranty.type);
      formData.append("warranty[months]", form.warranty.type === 'yes' ? form.warranty.months : 0);
      formData.append("attributes", JSON.stringify(parsedAttributes));

      if (mode === "edit") {
        formData.append("existingImages", JSON.stringify(existingImages));
        formData.append("existingVideos", JSON.stringify(existingVideos));
      }

      images.forEach(img => formData.append("images", img));
      videos.forEach(vid => formData.append("videos", vid));

      if (mode === "create") {
        await axiosInstance.post("/seller/refurbished-products/products", formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Product created successfully");
      } else {
        await axiosInstance.put(`/seller/refurbished-products/products/${initialData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully");
      }
      router.push("/seller/refurbished/products");
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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/seller/refurbished/products")}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1.5">
            <span
              className="hover:text-primary-600 cursor-pointer"
              onClick={() => router.push("/seller/refurbished/products")}
            >
              Refurbished Products
            </span>
            <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
            <span className="text-gray-600">
              {mode === "create" ? "New Product" : "Edit Product"}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {mode === "create" ? "Add Refurbished Product" : initialData?.title}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-5">
            {/* Basic Info */}
            <Card>
              <CardTitle icon="mdi:information-outline">Basic Information</CardTitle>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  error={errors.title}
                  placeholder="e.g. iPhone 13 Pro Max (Refurbished)"
                />
                <FieldError err={errors.title} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Model Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.modelNumber}
                    onChange={(e) => setForm(p => ({ ...p, modelNumber: e.target.value }))}
                    error={errors.modelNumber}
                    placeholder="e.g. MOD-1234"
                  />
                  <FieldError err={errors.modelNumber} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    SKU
                  </label>
                  <Input
                    value={form.sku}
                    onChange={(e) => setForm(p => ({ ...p, sku: e.target.value }))}
                    error={errors.sku}
                    placeholder="e.g. SKU-1234"
                  />
                  <FieldError err={errors.sku} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Short Description</label>
                  <Input
                    value={form.shortDescription}
                    onChange={(e) => setForm(p => ({ ...p, shortDescription: e.target.value }))}
                    placeholder="One-line summary..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={form.description}
                  onChange={(val) => setForm(p => ({ ...p, description: val }))}
                  error={errors.description}
                  placeholder="Detailed product description..."
                />
                <FieldError err={errors.description} />
              </div>
            </Card>

            {/* Categorization */}
            <Card>
              <CardTitle icon="mdi:shape-outline">Categorization</CardTitle>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value, brandId: "" }))}
                    className={`${SEL} ${errors.categoryId ? "border-red-400 bg-red-50/40" : ""}`}
                    style={{ backgroundImage: CHEVRON }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <FieldError err={errors.categoryId} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Brand</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value }))}
                    disabled={!form.categoryId}
                    className={SEL}
                    style={{ backgroundImage: CHEVRON }}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card>
              <div className="flex items-center justify-between">
                <CardTitle icon="mdi:image-multiple-outline">Product Images</CardTitle>
                <span className="text-xs text-gray-400">{existingImages.length + images.length}/10</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {existingImages.map((url, i) => (
                  <div key={`exist-${i}`} className="relative group aspect-square rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Icon icon="mdi:close" className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-medium">
                        Main
                      </span>
                    )}
                  </div>
                ))}
                {images.map((file, i) => (
                  <div key={`new-${i}`} className="relative group aspect-square rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Icon icon="mdi:close" className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50/30 cursor-pointer transition-all group">
                  <Icon icon="mdi:plus" className="w-6 h-6 text-gray-300 group-hover:text-primary-400" />
                  <span className="text-[10px] text-gray-400 mt-1">Add</span>
                  <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" multiple className="hidden" />
                </label>
              </div>
              <FieldError err={errors.images} />
            </Card>

            {/* Videos */}
            <Card>
              <div className="flex items-center justify-between">
                <CardTitle icon="mdi:video-outline">Product Videos</CardTitle>
                <span className="text-xs text-gray-400">
                  {existingVideos.length + videos.length}/2
                  <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold">OPTIONAL</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                {existingVideos.map((url, i) => (
                  <div key={`exist-v-${i}`} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-900">
                    <video src={url} className="w-full h-28 object-cover opacity-90" muted preload="metadata" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all rounded-xl" />
                    <button type="button" onClick={() => removeExistingVideo(url)} className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <Icon icon="mdi:close" className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                      <Icon icon="mdi:play-circle-outline" className="w-4 h-4 text-white/80" />
                      <span className="text-[9px] text-white/70 font-medium">Video {i + 1}</span>
                    </div>
                  </div>
                ))}
                {videos.map((file, i) => (
                  <div key={`new-v-${i}`} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-900">
                    <video src={URL.createObjectURL(file)} className="w-full h-28 object-cover opacity-90" muted preload="metadata" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all rounded-xl" />
                    <button type="button" onClick={() => removeNewVideo(i)} className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <Icon icon="mdi:close" className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                      <Icon icon="mdi:play-circle-outline" className="w-4 h-4 text-white/80" />
                      <span className="text-[9px] text-white/70 font-medium">Video</span>
                    </div>
                  </div>
                ))}
              </div>

              <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50/20 cursor-pointer transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                  <Icon icon="mdi:video-plus-outline" className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-600 group-hover:text-primary-600">Click to upload video</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">MP4, WebM, MOV</p>
                </div>
                <input
                  type="file"
                  multiple
                  ref={videoInputRef}
                  accept="video/mp4,video/webm,video/quicktime,video/mkv"
                  className="hidden"
                  onChange={handleVideoSelect}
                />
              </label>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">

            {/* Tags & Warranty */}
            <Card>
              {/* Tags */}
              <CardTitle icon="mdi:tag-multiple-outline">Tags</CardTitle>
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const t = tagInput.trim().toLowerCase().replace(/,/g, "");
                        if (t && !form.tags.includes(t)) setForm(p => ({ ...p, tags: [...p.tags, t] }));
                        setTagInput("");
                      }
                    }}
                    placeholder="Type a tag and press Enter…"
                    className="flex-1 h-9 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const t = tagInput.trim().toLowerCase();
                      if (t && !form.tags.includes(t)) setForm(p => ({ ...p, tags: [...p.tags, t] }));
                      setTagInput("");
                    }}
                    className="h-9 px-3 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all"
                  >
                    Add
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs font-bold text-primary-700">
                        #{tag}
                        <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}
                          className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-200/50 transition-colors">
                          <Icon icon="mdi:close" className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-400">e.g. gaming, premium, sale</p>
              </div>

              {/* Warranty */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <CardTitle icon="mdi:shield-check-outline">Warranty</CardTitle>
                <div className="flex gap-2 mt-2">
                  {["no", "yes"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, warranty: { ...p.warranty, type: opt } }))}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${opt === form.warranty.type
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                    >
                      {opt === "yes" ? "✓ Yes" : "✗ No"}
                    </button>
                  ))}
                </div>
                {form.warranty.type === 'yes' && (
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-xs font-bold text-gray-600 whitespace-nowrap">Duration (months)</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={form.warranty.months}
                      onChange={(e) => setForm(p => ({ ...p, warranty: { ...p.warranty, months: Number(e.target.value) } }))}
                      className="w-24 h-9 px-3 text-sm text-center font-bold rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-400 transition-all"
                    />
                    <span className="text-xs text-gray-400">{form.warranty.months >= 12 ? `(${Math.floor(form.warranty.months / 12)} yr${form.warranty.months >= 24 ? 's' : ''})` : ""}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Specifications / Attributes */}
            <Card>
              <div className="flex items-center justify-between mb-2">
                <CardTitle icon="mdi:format-list-bulleted">Specifications</CardTitle>
                <button
                  type="button"
                  onClick={addAttr}
                  className="px-2.5 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors flex items-center gap-1"
                >
                  <Icon icon="mdi:plus" />
                  Add
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mb-4">Define key specifications (e.g. RAM, Storage)</p>

              <div className="space-y-3">
                {form.attributes.map((attr, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 relative">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Spec Name</label>
                        <Input
                          value={attr.key}
                          onChange={(e) => updateAttr(i, "key", e.target.value)}
                          placeholder="e.g. RAM"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Values (Comma separated)</label>
                        <Input
                          value={attr.values}
                          onChange={(e) => updateAttr(i, "values", e.target.value)}
                          placeholder="e.g. 8GB"
                          className="h-9 text-xs pr-8"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttr(i)}
                      disabled={form.attributes.length === 1}
                      className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <Icon icon="mdi:delete-outline" className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="absolute top-30 right-0  p-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/seller/refurbished/products")}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            {submitting && <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />}
            {mode === "create" ? "Save Product" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
