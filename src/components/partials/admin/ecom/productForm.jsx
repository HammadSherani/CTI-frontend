
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

import VariantBuilder         from "./variantBuilder";
import { useVariantBuilder }  from "./useVariantBuilder";

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
    .required("Description is required"),
  categoryId:    yup.string().required("Category is required"),
  subCategoryId: yup.string().nullable(),
  brandId:       yup.string().nullable(),
  hasVariants:   yup.boolean().default(false),
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

  /* ── Detect if this product has variants ── */
  const initialHasVariants = initialData?.hasVariants ?? false;

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
      hasVariants:      initialHasVariants,
    },
  });

  const watchCategory    = watch("categoryId");
  const watchSubCategory = watch("subCategoryId");
  // Force boolean to avoid "true"/"false" string issues from radio buttons
  const watchHasVariants = !!watch("hasVariants");

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

  /* ── Variant builder hook (only active when hasVariants=true) ── */
  const variantBuilder = useVariantBuilder(
    initialHasVariants ? (initialData?.variants || []) : []
  );
  const [variantErrors, setVariantErrors] = useState({});

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
    if (previews.length === 0) {
      setImgErr("At least 1 product image is required");
      return;
    }

    /* Validate variants if applicable */
    if (watchHasVariants) {
      const vErrs = variantBuilder.validate();
      if (Object.keys(vErrs).length) {
        setVariantErrors(vErrs);
        toast.error("Please fix variant errors before submitting");
        return;
      }
      if (!variantBuilder.rows.length) {
        toast.error("Add at least one variant with attributes");
        return;
      }
      setVariantErrors({});
    } else {
      if (!simplePricing.price || Number(simplePricing.price) <= 0) {
        toast.error("Price is required");
        return;
      }
    }

    setSubmitting(true);

    try {
      /* ── Build FormData for product ── */
      const fd = new FormData();
      fd.append("title",       productData.title);
      fd.append("description", productData.description);
      fd.append("hasVariants", String(watchHasVariants));
      if (productData.shortDescription) fd.append("shortDescription", productData.shortDescription);
      if (productData.categoryId)       fd.append("categoryId",       productData.categoryId);
      if (productData.subCategoryId)    fd.append("subCategoryId",    productData.subCategoryId);
      if (productData.brandId)          fd.append("brandId",          productData.brandId);

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

      const productRes = await axiosInstance[isCreate ? "post" : "put"](productUrl, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      const savedProduct = productRes.data.data;

      /* ── Save variants ── */
      const variants = watchHasVariants
        ? variantBuilder.serialise()
        : [
            {
              attributes:         [],
              price:              Number(simplePricing.price),
              stock:              Number(simplePricing.stock || 0),
              discountPercentage: simplePricing.isDiscounted
                ? Number(simplePricing.discountPercentage || 0)
                : 0,
              sku:       simplePricing.sku?.trim() || undefined,
              isDefault: true,
            },
          ];

      await axiosInstance.post(
        `/seller/product/${savedProduct._id}/variants`,
        { variants: JSON.stringify(variants) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Product ${isCreate ? "created" : "updated"} successfully`);
      router.push("/seller/product");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
const summaryRows = watchHasVariants
  ? [
      { label: "Variants", value: variantBuilder.summary.variantCount || "0" },
      { label: "Price Range", value: variantBuilder.summary.minPrice ? `$${variantBuilder.summary.minPrice} - $${variantBuilder.summary.maxPrice}` : "—" },
      { label: "Total stock", value: variantBuilder.summary.totalStock || "0" },
    ]
  : [
      { label: "Price", value: (simplePricing.price && !isNaN(simplePricing.price)) ? `$${Number(simplePricing.price).toFixed(2)}` : "—" },
      { label: "Discount", value: (simplePricing.isDiscounted && simplePricing.discountPercentage) ? `${simplePricing.discountPercentage}%` : "—" },
      { label: "Stock", value: simplePricing.stock || "0" },
    ];

const extraRows = [
  { label: "Images", value: `${previews.length}/5` },
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

            {/* ── Product Type ── */}
            <Card className="overflow-hidden border-2 border-gray-100 shadow-xl shadow-gray-200/20">
              <div className="flex items-center justify-between mb-4">
                <CardTitle icon="mdi:cube-outline">Product Inventory Type</CardTitle>
                <div className="px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-wider">Required</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    value:   false,
                    label:   "Simple Product",
                    desc:    "No variations. Just one price and stock level.",
                    icon:    "mdi:cube-send",
                    activeBg: "bg-blue-600",
                    activeBorder: "border-blue-600",
                    lightBg: "bg-blue-50",
                    textColor: "text-blue-600",
                  },
                  {
                    value:   true,
                    label:   "Variant Product",
                    desc:    "Single dimension (e.g. Size OR Storage) variations.",
                    icon:    "mdi:layers-triple-outline",
                    activeBg: "bg-primary-600",
                    activeBorder: "border-primary-600",
                    lightBg: "bg-primary-50",
                    textColor: "text-primary-600",
                  },
                ].map((opt) => {
                  const isActive = !!watchHasVariants === opt.value;
                  return (
                    <label key={String(opt.value)}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        isActive ? "scale-[1.02]" : "hover:scale-[1.01]"
                      }`}>
                      <input type="radio" className="sr-only"
                        checked={isActive}
                        onChange={() => setValue("hasVariants", opt.value)} />
                      
                      <div className={`h-full p-5 rounded-2xl border-2 transition-all duration-300 ${
                        isActive 
                          ? `${opt.activeBorder} ${opt.lightBg} shadow-lg shadow-${opt.value ? "primary" : "blue"}-500/10` 
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}>
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isActive ? `${opt.activeBg} text-white shadow-lg` : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                          }`}>
                            <Icon icon={opt.icon} className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-black uppercase tracking-tight ${isActive ? opt.textColor : "text-gray-700"}`}>
                              {opt.label}
                            </p>
                            <p className="text-[11px] text-gray-400 font-medium leading-tight mt-1">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                        {isActive && (
                          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full ${opt.activeBg} text-white flex items-center justify-center shadow-md animate-in zoom-in duration-300`}>
                            <Icon icon="mdi:check" className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </Card>

            {/* ── Simple Pricing (only when no variants) ── */}
            {!watchHasVariants && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <SimplePricing value={simplePricing} onChange={setSimplePricing} />
              </div>
            )}

            {/* ── Variant Builder (only when hasVariants) ── */}
            {watchHasVariants && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <VariantBuilder
                  {...variantBuilder}
                  errors={variantErrors}
                />
              </div>
            )}

            {/* ── Images ── */}
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
                <li>• Choose <strong>Variable Product</strong> if your item comes in different colors, sizes, storage, etc.</li>
                <li>• Use <strong>Bulk fill</strong> in the variant grid to set the same price/stock for all rows at once.</li>
                <li>• The first image becomes the main display image.</li>
                <li>• SKU fields in the variant grid are optional — they're auto-generated if left blank.</li>
              </ul>
            </div>

          </div>{/* end right col */}

        </div>
      </form>
    </div>
  );
}