
"use client";

import React, { useState, useEffect } from "react";
import { useForm }            from "react-hook-form";
import { yupResolver }        from "@hookform/resolvers/yup";
import * as yup               from "yup";
import { Icon }               from "@iconify/react";
import { toast }              from "react-toastify";
import axiosInstance          from "@/config/axiosInstance";
import { useSelector }        from "react-redux";
import { useRouter }          from "@/i18n/navigation";



/* ══════════════════════════════════════════════════════════
   YUP SCHEMA — product fields only (no price/stock/discount)
══════════════════════════════════════════════════════════ */
const productSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(300, "Title too long")
    .required("Title is required"),
  shortDescription: yup.string().trim().max(500).nullable(),
  description: yup
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description too long")
    .required("Description is required"),
  categoryId:    yup.string().required("Category is required"),
  subCategoryId: yup.string().nullable(),
  brandId:       yup.string().nullable(),
  // hasVariants is removed from schema since it's always false for simple creation
});

/* ══════════════════════════════════════════════════════════
   TINY UI PRIMITIVES
══════════════════════════════════════════════════════════ */
const FieldError = ({ err }) =>
  err ? (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
      <Icon icon="mdi:alert-circle-outline" className="w-3.5 h-3.5 flex-shrink-0" />
      {err.message}
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
      className={`w-full h-11 ${prefix ? "pl-8" : "px-4"} ${suffix ? "pr-10" : "pr-4"} rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${
        error
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
   SIMPLE PRODUCT PRICING  (hasVariants = false)
   Rendered only when variants are disabled.
   These fields are NOT part of React Hook Form — they are
   local state since they belong to the single default variant,
   not to the product document.
══════════════════════════════════════════════════════════ */
function SimplePricing({ value, onChange }) {
  const { price, stock, discountPercentage, isDiscounted } = value;

  const calcFinal = () => {
    if (!price || !discountPercentage) return null;
    const p = Number(price), d = Number(discountPercentage);
    if (d <= 0 || d >= 100) return null;
    return Number((p - p * d / 100).toFixed(2));
  };

  const set = (field, val) => onChange({ ...value, [field]: val });

  return (
    <Card>
      <CardTitle icon="mdi:tag-outline">Price & Stock</CardTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Price <span className="text-red-500">*</span>
          </label>
          <Input type="number" step="0.01" min="0" prefix="$"
            value={price} onChange={(e) => set("price", e.target.value)}
            placeholder="0.00" error={!price} />
          {!price && <p className="text-red-500 text-xs mt-1">Price is required</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Stock <span className="text-red-500">*</span>
          </label>
          <Input type="number" min="0"
            value={stock} onChange={(e) => set("stock", e.target.value)}
            placeholder="0" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            SKU (Optional)
          </label>
          <Input type="text"
            value={value.sku || ""} onChange={(e) => set("sku", e.target.value)}
            placeholder="e.g. TSHIRT-BLK-M" />
        </div>
      </div>

      {/* Discount toggle */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer mb-3">
          <div className="relative">
            <input type="checkbox" className="sr-only"
              checked={isDiscounted} onChange={(e) => set("isDiscounted", e.target.checked)} />
            <div className={`w-9 h-5 rounded-full transition-all ${isDiscounted ? "bg-primary-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isDiscounted ? "translate-x-4" : ""}`} />
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-700">Enable discount</span>
        </label>

        {isDiscounted && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Discount % <span className="text-red-500">*</span>
              </label>
              <Input type="number" min="0" max="99" suffix="%"
                value={discountPercentage}
                onChange={(e) => set("discountPercentage", e.target.value)}
                placeholder="0" />
            </div>
            {calcFinal() && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Original</span>
                  <span className="font-semibold">${Number(price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Savings ({discountPercentage}%)</span>
                  <span className="font-semibold text-red-500">
                    -${(Number(price) * Number(discountPercentage) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="pt-1 border-t border-emerald-200 flex justify-between">
                  <span className="font-bold text-gray-700">Final Price</span>
                  <span className="font-bold text-emerald-600 text-sm">${calcFinal()}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN FORM
══════════════════════════════════════════════════════════ */
export default function ProductForm({ mode = "create", initialData = null }) {
  const router   = useRouter();
  const { token } = useSelector((s) => s.auth);

  /* ── React Hook Form (product fields ONLY) ── */
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      title:            initialData?.title            || "",
      shortDescription: initialData?.shortDescription || "",
      description:      initialData?.description      || "",
      categoryId:       initialData?.categoryId?._id  || initialData?.categoryId  || "",
      subCategoryId:    initialData?.subCategoryId?._id || initialData?.subCategoryId || "",
      brandId:          initialData?.brandId?._id     || initialData?.brandId     || "",
    },
  });

  const watchCategory    = watch("categoryId");
  const watchSubCategory = watch("subCategoryId");

  /* ── Simple product pricing state (only used when hasVariants=false) ── */
  const [simplePricing, setSimplePricing] = useState(() => {
    // Seed from the default variant if editing
    const def = initialData?.variants?.find((v) => v.isDefault) || initialData?.variants?.[0];
    return {
      price:              String(def?.price              || ""),
      stock:              String(def?.stock              || ""),
      discountPercentage: String(def?.discountPercentage || ""),
      sku:                def?.sku || "",
      isDiscounted:       (def?.discountPercentage || 0) > 0,
    };
  });



  /* ── Dropdowns ── */
  const [categories,    setCategories]    = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands,        setBrands]        = useState([]);

  /* ── Images ── */
  const [previews, setPreviews] = useState(initialData?.images?.map((i) => i.url) || []);
  const [files,    setFiles]    = useState([]);
  const [imgErr,   setImgErr]   = useState("");

  /* ── Submission state ── */
  const [submitting, setSubmitting] = useState(false);

  /* ── Load categories ── */
  useEffect(() => {
    axiosInstance
      .get("/seller/product/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => toast.error("Failed to load categories"));
  }, [token]);

  /* ── Load subcategories ── */
  useEffect(() => {
    if (!watchCategory) { setSubCategories([]); setBrands([]); return; }
    axiosInstance
      .get(`/seller/product/subcategories/${watchCategory}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setSubCategories(data.data || []);
        const isInit =
          initialData?.categoryId?._id === watchCategory ||
          initialData?.categoryId === watchCategory;
        if (!isInit) { setValue("subCategoryId", ""); setValue("brandId", ""); setBrands([]); }
      })
      .catch(() => toast.error("Failed to load subcategories"));
  }, [watchCategory, token]);

  /* ── Load brands ── */
  useEffect(() => {
    if (!watchSubCategory) { setBrands([]); return; }
    axiosInstance
      .get(`/seller/product/brands/${watchSubCategory}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setBrands(data.data || []);
        const isInit =
          initialData?.subCategoryId?._id === watchSubCategory ||
          initialData?.subCategoryId === watchSubCategory;
        if (!isInit) setValue("brandId", "");
      })
      .catch(() => toast.error("Failed to load brands"));
  }, [watchSubCategory, token]);

  /* ── Image helpers ── */
  const onFileChange = (e) => {
    const picked = Array.from(e.target.files);
    if (picked.length + previews.length > 5) { toast.warning("Maximum 5 images allowed"); return; }
    setPreviews((p) => [...p, ...picked.map((f) => URL.createObjectURL(f))]);
    setFiles((p) => [...p, ...picked]);
    setImgErr("");
  };

  const removeImage = (i) => {
    const url = previews[i];
    setPreviews((p) => p.filter((_, idx) => idx !== i));
    if (url.startsWith("blob:")) {
      // Match blob URL to the file — not perfectly reliable, but good enough.
      // A more robust approach stores {url, file} pairs together.
      setFiles((p) => {
        const idx = p.findIndex((f) => URL.createObjectURL(f) === url);
        return idx === -1 ? p : p.filter((_, fi) => fi !== idx);
      });
    }
  };

  /* ── Submit ── */
  const onSubmit = async (productData) => {
    if (mode === "create" && previews.length === 0) {
      setImgErr("At least 1 product image is required");
      return;
    }

    if (mode === "create" && (!simplePricing.price || Number(simplePricing.price) <= 0)) {
      toast.error("Price is required");
      return;
    }

    setSubmitting(true);

    try {
      /* ── Build FormData for product ── */
      const fd = new FormData();
      fd.append("title",       productData.title);
      fd.append("description", productData.description);
      if (productData.shortDescription) fd.append("shortDescription", productData.shortDescription);
      if (productData.categoryId)       fd.append("categoryId",       productData.categoryId);
      if (productData.subCategoryId)    fd.append("subCategoryId",    productData.subCategoryId);
      if (productData.brandId)          fd.append("brandId",          productData.brandId);

      // Append simple pricing fields directly
      if (mode === "create") {
        fd.append("price", Number(simplePricing.price));
        fd.append("stock", Number(simplePricing.stock || 0));
        fd.append("discountPercentage", simplePricing.isDiscounted ? Number(simplePricing.discountPercentage || 0) : 0);
        if (simplePricing.sku?.trim()) {
          fd.append("variantSku", simplePricing.sku.trim());
        }
      }

      /* Keep existing images on edit */
      if (mode === "edit") {
        previews
          .filter((u) => !u.startsWith("blob:"))
          .forEach((u) => fd.append("existingImages", u));
      }
      files.forEach((f) => fd.append("images", f));

      /* ── Create / update product ── */
      const isCreate = mode === "create";
      const productUrl = isCreate
        ? "/seller/product"
        : `/seller/product/${initialData._id}`;

      const res = await axiosInstance[isCreate ? "post" : "put"](productUrl, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      toast.success(`Product ${isCreate ? "created" : "updated"} successfully`);
      if (isCreate) {
        router.push(`/seller/product/${res.data.data._id}/variants`);
      } else {
        router.push("/seller/product");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
const summaryRows = mode === "edit" ? [
      { label: "Pricing", value: "Managed in Variants" },
    ] : [
      { label: "Price", value: (simplePricing.price && !isNaN(simplePricing.price)) ? `$${Number(simplePricing.price).toFixed(2)}` : "—" },
      { label: "Discount", value: (simplePricing.isDiscounted && simplePricing.discountPercentage) ? `${simplePricing.discountPercentage}%` : "—" },
      { label: "Stock", value: simplePricing.stock || "0" },
    ];

const extraRows = mode === "create" ? [
  { label: "Images", value: `${previews.length}/5` },
  { label: "Category", value: categories.find((c) => c._id === watchCategory)?.title || "—" },
] : [
  { label: "Images", value: "Managed in Variants" },
  { label: "Category", value: categories.find((c) => c._id === watchCategory)?.title || "—" },
];
  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">

      {/* ── Header ── */}
      <div className="mb-7 flex items-center gap-3">
        <button type="button" onClick={() => router.back()}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors">
          <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1.5">
            <span className="hover:text-primary-600 cursor-pointer"
              onClick={() => router.push("/seller/product")}>
              Products
            </span>
            <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
            <span className="text-gray-600">
              {mode === "create" ? "New Product" : "Edit Product"}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {mode === "create" ? "Add New Product" : initialData?.title}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ════ LEFT: 2 cols ════ */}
          <div className="xl:col-span-2 space-y-5">

            {/* ── Basic Info ── */}
            <Card>
              <CardTitle icon="mdi:information-outline">Basic Information</CardTitle>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input {...register("title")} error={errors.title} placeholder="e.g. Premium Cotton T-Shirt" />
                <FieldError err={errors.title} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Short Description</label>
                <Input {...register("shortDescription")} placeholder="One-line summary..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea {...register("description")} rows={4}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none ${
                    errors.description ? "border-red-400 bg-red-50/40" : "border-gray-200 focus:border-primary-500"
                  }`}
                  placeholder="Detailed product description..." />
                <FieldError err={errors.description} />
              </div>
            </Card>

            {/* ── Categorization ── */}
            <Card>
              <CardTitle icon="mdi:shape-outline">Categorization</CardTitle>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select {...register("categoryId")}
                    className={`${SEL} ${errors.categoryId ? "border-red-400 bg-red-50/40" : ""}`}
                    style={{ backgroundImage: CHEVRON }}>
                    <option value="">Select</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                  <FieldError err={errors.categoryId} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Subcategory</label>
                  <select {...register("subCategoryId")} disabled={!watchCategory}
                    className={SEL} style={{ backgroundImage: CHEVRON }}>
                    <option value="">Select</option>
                    {subCategories.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Brand</label>
                  <select {...register("brandId")} disabled={!watchSubCategory}
                    className={SEL} style={{ backgroundImage: CHEVRON }}>
                    <option value="">Select</option>
                    {brands.map((b) => <option key={b._id} value={b._id}>{b.title}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            {/* ── Pricing & Variants ── */}
            {mode === "create" ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <SimplePricing value={simplePricing} onChange={setSimplePricing} />
              </div>
            ) : (
              <Card>
                <div className="flex items-center justify-between">
                  <CardTitle icon="mdi:layers-triple-outline">SKUs & Pricing</CardTitle>
                </div>
                <div className="bg-primary-50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-primary-100">
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:information" className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-primary-900 mb-1">Pricing is managed in variants.</p>
                      <p className="text-xs text-primary-700 max-w-sm">Every product has at least one default variant. You can manage prices, stock, and add more options (like Size or Color) from the Variant Manager.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => router.push(`/seller/product/${initialData._id}/variants`)}
                    className="flex-shrink-0 px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap">
                    Manage Variants
                  </button>
                </div>
              </Card>
            )}

            {/* ── Images ── */}
            {mode === "create" && (
            <Card>
              <div className="flex items-center justify-between">
                <CardTitle icon="mdi:image-multiple-outline">Product Images</CardTitle>
                <span className="text-xs text-gray-400">{previews.length}/5</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {previews.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <Icon icon="mdi:close" className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-medium">
                        Main
                      </span>
                    )}
                  </div>
                ))}
                {previews.length < 5 && (
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50/30 cursor-pointer transition-all group">
                    <Icon icon="mdi:plus" className="w-6 h-6 text-gray-300 group-hover:text-primary-400" />
                    <span className="text-[10px] text-gray-400 mt-1">Add</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={onFileChange} />
                  </label>
                )}
              </div>
              {imgErr && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <Icon icon="mdi:alert-circle-outline" className="w-3.5 h-3.5" />
                  {imgErr}
                </p>
              )}
            </Card>
            )}

          </div>{/* end left col */}

          {/* ════ RIGHT: 1 col ════ */}
          <div className="space-y-5">

            {/* Summary card */}
         <Card>
  <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
    <Icon icon="mdi:chart-box-outline" className="w-4 h-4 text-primary-500" />
    Summary
  </h3>

  <div className="space-y-2">
    {[...summaryRows, ...extraRows].map((row) => (
      <div
        key={row.label}
        className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0"
      >
        <span className="text-xs text-gray-400">{row.label}</span>
        <span className="text-xs font-bold text-gray-800">{row.value}</span>
      </div>
    ))}
  </div>
</Card>

            {/* Actions */}
            <div className="space-y-2.5">
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
                {submitting ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Icon icon={mode === "create" ? "mdi:plus-circle-outline" : "mdi:content-save-outline"} className="w-4 h-4" />
                    {mode === "create" ? "Create Product" : "Save Changes"}
                  </>
                )}
              </button>
              <button type="button" onClick={() => router.back()}
                className="w-full py-3 text-sm font-semibold bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                <Icon icon="mdi:lightbulb-outline" className="w-3.5 h-3.5" />
                Tips
              </p>
              <ul className="text-xs text-amber-600 space-y-1.5 leading-relaxed">
                <li>• The first image becomes the main display image.</li>
                <li>• You can add variants (sizes, colors, etc.) after creating the product from the Product Management page.</li>
              </ul>
            </div>

          </div>{/* end right col */}

        </div>
      </form>
    </div>
  );
}