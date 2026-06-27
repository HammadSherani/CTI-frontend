"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { useRouter } from "@/i18n/navigation";
import RichTextEditor from "./RichTextEditor";


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
    .test(
      "html-min",
      "Description must be at least 10 characters",
      (val) => {
        if (!val) return false;
        return val.replace(/<[^>]*>/g, "").trim().length >= 10;
      }
    )
    .required("Description is required"),
  categoryId: yup.string().required("Category is required"),
  subCategoryId: yup.string().nullable(),
  brandId: yup.string().nullable(),
  modelNumber: yup.string().trim().required("Model number is required"),
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
   SIMPLE PRODUCT PRICING
══════════════════════════════════════════════════════════ */
function SimplePricing({ value, onChange }) {
  const { price, stock, discountPercentage, isDiscounted } = value;
  const PLATFORM_FEE_PCT = 10;

  const baseNum = Number(price) || 0;
  const platformFee = baseNum > 0 ? Math.round((baseNum * PLATFORM_FEE_PCT) / 100) : 0;
  const sellingPrice = baseNum > 0 ? baseNum + platformFee : 0;

  const discNum = Number(discountPercentage) || 0;
  const hasDiscount = isDiscounted && discNum > 0 && discNum < 100;
  const discountSavings = hasDiscount ? Math.round((sellingPrice * discNum) / 100) : 0;
  const finalPrice = hasDiscount ? sellingPrice - discountSavings : sellingPrice;

  const set = (field, val) => onChange({ ...value, [field]: val });

  return (
    <Card>
      <CardTitle icon="mdi:tag-outline">Price & Stock</CardTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Base Price <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            prefix="$"
            value={price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="0.00"
            error={!price}
          />
          {!price && <p className="text-red-500 text-xs mt-1">Base price is required</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Stock <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => set("stock", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Platform Fee Preview */}
      {baseNum > 0 && (
        <div className="mt-1 p-4 bg-gradient-to-br from-slate-50 to-blue-50/60 rounded-2xl border border-blue-100/80">
          <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <Icon icon="mdi:calculator-variant-outline" className="w-4 h-4 text-blue-500" />
            Pricing Breakdown
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Your Base Price</span>
              <span className="font-semibold text-gray-800">${baseNum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 flex items-center gap-1">
                Platform Fee ({PLATFORM_FEE_PCT}%)
                <Icon icon="mdi:information-outline" className="w-3.5 h-3.5 text-gray-400" />
              </span>
              <span className="font-semibold text-blue-600">+${platformFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-blue-200/60 pt-2 flex justify-between items-center">
              <span className="font-bold text-gray-700">Selling Price</span>
              <span className="font-extrabold text-gray-900 text-sm">${sellingPrice.toFixed(2)}</span>
            </div>
            {hasDiscount && (
              <>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-500">Discount ({discNum}%)</span>
                  <span className="font-semibold text-red-500">-${discountSavings.toFixed(2)}</span>
                </div>
                <div className="border-t border-blue-200/60 pt-2 flex justify-between items-center">
                  <span className="font-bold text-emerald-700">Customer Pays</span>
                  <span className="font-extrabold text-emerald-600 text-sm">${finalPrice.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
            The platform fee is automatically added to your base price. Customers will see ${hasDiscount ? finalPrice.toFixed(2) : sellingPrice.toFixed(2)} as the product price.
          </p>
        </div>
      )}

      {/* Discount toggle */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer mb-3">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isDiscounted}
              onChange={(e) => set("isDiscounted", e.target.checked)}
            />
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
              <Input
                type="number"
                min="0"
                max="99"
                suffix="%"
                value={discountPercentage}
                onChange={(e) => set("discountPercentage", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN FORM
══════════════════════════════════════════════════════════ */
export default function ProductForm({ mode = "create", initialData = null, adminMode = false }) {
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  /* ── React Hook Form ── */
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      modelNumber: "",
    },
  });

  const watchCategory = watch("categoryId");
  const watchSubCategory = watch("subCategoryId");
  const watchDescription = watch("description");

  /* ── Simple product pricing state ── */
  const [simplePricing, setSimplePricing] = useState(() => {
    const def = initialData?.variants?.find((v) => v.isDefault) || initialData?.variants?.[0];
    return {
      price: String(def?.price || ""),
      stock: String(def?.stock || ""),
      discountPercentage: String(def?.discountPercentage || ""),
      isDiscounted: (def?.discountPercentage || 0) > 0,
    };
  });

  /* ── Dropdowns ── */
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  /* ── Images ── */
  const [previews, setPreviews] = useState(initialData?.images?.map((i) => i.url) || []);
  const [files, setFiles] = useState([]);
  const [imgErr, setImgErr] = useState("");

  /* ── Videos (additive, optional) ── */
  const [videoPreviews, setVideoPreviews] = useState(initialData?.videos?.map((v) => v.url) || []);
  const [videoFiles, setVideoFiles] = useState([]);

  /* ── Tags ── */
  const [tags, setTags] = useState(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  /* ── Warranty ── */
  const [hasWarranty, setHasWarranty] = useState(initialData?.warranty?.type === "yes" || false);
  const [warrantyMonths, setWarrantyMonths] = useState(initialData?.warranty?.months || 12);

  /* ── Submission state ── */
  const [submitting, setSubmitting] = useState(false);

  /* ── Admin mode: sellers dropdown ── */
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");

  /* Load helper for brands */


  /* Load Categories */
  useEffect(() => {
    const url = adminMode ? "/admin/e-commerce/product/categories" : "/seller/product/categories";
    axiosInstance
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => toast.error("Failed to load categories"));
  }, [token, adminMode]);

  /* Load Subcategories */
  useEffect(() => {
    if (!watchCategory) {
      setSubCategories([]);
      if (!adminMode) setBrands([]);
      return;
    }
    const url = adminMode
      ? `/admin/e-commerce/product/subcategories/${watchCategory}`
      : `/seller/product/subcategories/${watchCategory}`;
    axiosInstance
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setSubCategories(data.data || []))
      .catch(() => toast.error("Failed to load subcategories"));
  }, [watchCategory, token, adminMode]);



  const loadBrands = useCallback((subId) => {
    if (adminMode) return; // admin brands are loaded on mount (all brands, no subcategory filter)
    if (!subId) {
      setBrands([]);
      return;
    }
    axiosInstance
      .get(`/seller/product/brands/${subId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setBrands(data.data || []);

        if (mode === "edit" && initialData) {
          const brandId = initialData?.brandId?._id || initialData?.brandId || "";
          if (brandId) {
            const brandExists = data.data.some(b => b._id === brandId);
            if (brandExists) setValue("brandId", brandId);
          }
        }
      })
      .catch(() => toast.error("Failed to load brands"));
  }, [token, mode, initialData, setValue, adminMode]);
  /* Handle Edit Mode - Pre-fill everything including Brand */


  /* Load Brands when Subcategory changes */
  useEffect(() => {
    loadBrands(watchSubCategory);
  }, [watchSubCategory, loadBrands]);

  useEffect(() => {
    if (!initialData || mode !== "edit") return;

    const catId = initialData?.categoryId?._id || initialData?.categoryId || "";
    const subId = initialData?.subCategoryId?._id || initialData?.subCategoryId || "";
    const brandId = initialData?.brandId?._id || initialData?.brandId || "";

    // Reset form
      reset({
        title: initialData?.title || "",
        shortDescription: initialData?.shortDescription || "",
        description: initialData?.description || "",
        categoryId: catId,
        subCategoryId: subId,
        brandId: brandId,
        modelNumber: initialData?.modelNumber || "",
      });

    // Load subcategories and brands for edit mode
    if (catId) {
      const subUrl = adminMode
        ? `/admin/e-commerce/product/subcategories/${catId}`
        : `/seller/product/subcategories/${catId}`;
      axiosInstance
        .get(subUrl, { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => {
          setSubCategories(data.data || []);
          if (subId) loadBrands(subId);
        });
    }
  }, [initialData, mode, reset, token, loadBrands, adminMode]);

  /* ── Load subcategories ── */
  useEffect(() => {
    if (!watchCategory) {
      setSubCategories([]);
      if (!adminMode) setBrands([]);
      return;
    }
    const url = adminMode
      ? `/admin/e-commerce/product/subcategories/${watchCategory}`
      : `/seller/product/subcategories/${watchCategory}`;
    axiosInstance
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setSubCategories(data.data || []))
      .catch(() => toast.error("Failed to load subcategories"));
  }, [watchCategory, token, adminMode]);

  /* ── Load brands when subcategory changes ── */
  useEffect(() => {
    loadBrands(watchSubCategory);
  }, [watchSubCategory, loadBrands]);

  /* ── Reset form for edit mode ── */
  useEffect(() => {
    if (initialData) {
      const catId = initialData?.categoryId?._id || initialData?.categoryId || "";
      const subId = initialData?.subCategoryId?._id || initialData?.subCategoryId || "";
      const brandId = initialData?.brandId?._id || initialData?.brandId || "";

      reset({
        title: initialData?.title || "",
        shortDescription: initialData?.shortDescription || "",
        description: initialData?.description || "",
        categoryId: catId,
        subCategoryId: subId,
        brandId: brandId,
        modelNumber: initialData?.modelNumber || "",
      });

      // Explicitly load brands for pre-filled subcategory in edit mode
      if (subId) {
        loadBrands(subId);
      }
    }
  }, [initialData, reset, loadBrands]);

  /* ── Admin mode: load all brands on mount (no subcategory filter) ── */
  useEffect(() => {
    if (!adminMode) return;
    axiosInstance
      .get("/admin/e-commerce/product/brands", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setBrands(data.data || []))
      .catch(() => toast.error("Failed to load brands"));
  }, [adminMode, token]);

  /* ── Admin mode: load sellers for seller dropdown ── */
  useEffect(() => {
    if (!adminMode) return;
    axiosInstance
      .get("/admin/e-commerce/seller?limit=100", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setSellers(data.data || []))
      .catch(() => toast.error("Failed to load sellers"));
  }, [adminMode, token]);

  /* ── Image helpers ── */
  const onFileChange = (e) => {
    const picked = Array.from(e.target.files);
    if (picked.length + previews.length > 5) {
      toast.warning("Maximum 5 images allowed");
      return;
    }
    setPreviews((p) => [...p, ...picked.map((f) => URL.createObjectURL(f))]);
    setFiles((p) => [...p, ...picked]);
    setImgErr("");
  };

  const removeImage = (i) => {
    const url = previews[i];
    setPreviews((p) => p.filter((_, idx) => idx !== i));
    if (url.startsWith("blob:")) {
      setFiles((p) => {
        const idx = p.findIndex((f) => URL.createObjectURL(f) === url);
        return idx === -1 ? p : p.filter((_, fi) => fi !== idx);
      });
    }
  };

  /* ── Video helpers (additive) ── */
  const onVideoChange = (e) => {
    const picked = Array.from(e.target.files);
    if (picked.length + videoPreviews.length > 3) {
      toast.warning("Maximum 3 videos allowed");
      return;
    }
    setVideoPreviews((p) => [...p, ...picked.map((f) => URL.createObjectURL(f))]);
    setVideoFiles((p) => [...p, ...picked]);
  };

  const removeVideo = (i) => {
    const url = videoPreviews[i];
    setVideoPreviews((p) => p.filter((_, idx) => idx !== i));
    if (url.startsWith("blob:")) {
      setVideoFiles((p) => {
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

    if (adminMode && mode === "create" && !selectedSellerId) {
      toast.error("Please select a seller");
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();

      if (mode === "create") {
        fd.append("title", productData.title);
        fd.append("description", productData.description);
        fd.append("modelNumber", productData.modelNumber);
        if (productData.shortDescription) fd.append("shortDescription", productData.shortDescription);
        if (productData.categoryId) fd.append("categoryId", productData.categoryId);
        if (productData.subCategoryId) fd.append("subCategoryId", productData.subCategoryId);
        if (productData.brandId) fd.append("brandId", productData.brandId);
        
        fd.append("price", Number(simplePricing.price));
        fd.append("stock", Number(simplePricing.stock || 0));
        fd.append("discountPercentage", simplePricing.isDiscounted ? Number(simplePricing.discountPercentage || 0) : 0);
      } else {
        // Edit mode: only append changed fields
        if (dirtyFields.title) fd.append("title", productData.title);
        if (dirtyFields.description) fd.append("description", productData.description);
        if (dirtyFields.modelNumber) fd.append("modelNumber", productData.modelNumber);
        if (dirtyFields.shortDescription) fd.append("shortDescription", productData.shortDescription);
        if (dirtyFields.categoryId) fd.append("categoryId", productData.categoryId);
        if (dirtyFields.subCategoryId) fd.append("subCategoryId", productData.subCategoryId);
        if (dirtyFields.brandId) fd.append("brandId", productData.brandId);

        previews
          .filter((u) => !u.startsWith("blob:"))
          .forEach((u) => fd.append("existingImages", u));

        videoPreviews
          .filter((u) => !u.startsWith("blob:"))
          .forEach((u) => fd.append("existingVideos", u));
      }


      files.forEach((f) => fd.append("images", f));

      // Append new video files (optional)
      videoFiles.forEach((f) => fd.append("videos", f));

      // Tags (sent as JSON string)
      fd.append("tags", JSON.stringify(tags));

      // Warranty
      fd.append("warranty[type]", hasWarranty ? "yes" : "no");
      fd.append("warranty[months]", hasWarranty ? warrantyMonths : 0);

      const isCreate = mode === "create";

      // Admin mode: include sellerId on create
      if (adminMode && isCreate) fd.append("sellerId", selectedSellerId);

      const productUrl = isCreate
        ? (adminMode ? "/admin/e-commerce/product" : "/seller/product")
        : (adminMode ? `/admin/e-commerce/product/${initialData._id}` : `/seller/product/${initialData._id}`);

      const res = await axiosInstance[isCreate ? "post" : "put"](productUrl, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      toast.success(`Product ${isCreate ? "created" : "updated"} successfully`);
      if (adminMode) {
        router.push("/admin/ecom/products");
      } else if (isCreate) {
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
  ] : (() => {
    const bp = Number(simplePricing.price) || 0;
    const fee = bp > 0 ? Number((bp * 0.10).toFixed(2)) : 0;
    const sp = bp > 0 ? Number((bp + fee).toFixed(2)) : 0;
    return [
      { label: "Base Price", value: bp > 0 ? `$${bp.toFixed(2)}` : "—" },
      { label: "Selling Price", value: sp > 0 ? `$${sp.toFixed(2)}` : "—" },
      { label: "Discount", value: (simplePricing.isDiscounted && simplePricing.discountPercentage) ? `${simplePricing.discountPercentage}%` : "—" },
      { label: "Stock", value: simplePricing.stock || "0" },
    ];
  })();

  const extraRows = mode === "create" ? [
    { label: "Images", value: `${previews.length}/5` },
    { label: "Videos", value: videoPreviews.length > 0 ? `${videoPreviews.length}/3` : "None" },
    { label: "Category", value: categories.find((c) => c._id === watchCategory)?.title || "—" },
  ] : [
    { label: "Images", value: "Managed in Variants" },
    { label: "Videos", value: videoPreviews.length > 0 ? `${videoPreviews.length}/3` : "None" },
    { label: "Category", value: categories.find((c) => c._id === watchCategory)?.title || "—" },
  ];

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1.5">
            <span
              className="hover:text-primary-600 cursor-pointer"
              onClick={() => router.push(adminMode ? "/admin/ecom/products" : "/seller/product")}
            >
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
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-5">
            {/* Basic Info */}
            <Card>
              <CardTitle icon="mdi:information-outline">Basic Information</CardTitle>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input {...register("title")} error={errors.title} placeholder="e.g. Premium Cotton T-Shirt" />
                <FieldError err={errors.title} />
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Model Number <span className="text-red-500">*</span>
                  </label>
                  <Input {...register("modelNumber")} error={errors.modelNumber} placeholder="e.g. MOD-1234" />
                  <FieldError err={errors.modelNumber} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Short Description</label>
                  <Input {...register("shortDescription")} placeholder="One-line summary..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={watchDescription}
                  onChange={(val) =>
                    setValue("description", val, { shouldValidate: true })
                  }
                  error={errors.description}
                  placeholder="Detailed product description..."
                />
                <FieldError err={errors.description} />
              </div>
            </Card>

            {/* Admin-only: Seller selector */}
            {adminMode && mode === "create" && (
              <Card>
                <CardTitle icon="mdi:storefront-outline">Seller</CardTitle>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Assign to Seller <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSellerId}
                    onChange={(e) => setSelectedSellerId(e.target.value)}
                    className={`${SEL} ${!selectedSellerId ? "border-red-200" : ""}`}
                    style={{ backgroundImage: CHEVRON }}
                  >
                    <option value="">Select seller...</option>
                    {sellers.map((s) => (
                      <option key={s._id} value={s.userId?._id || s.userId}>
                        {s.businessName || s.fullName || "Unnamed Seller"}
                      </option>
                    ))}
                  </select>
                  {!selectedSellerId && (
                    <p className="text-[11px] text-gray-400 mt-1">Required — choose which seller owns this product</p>
                  )}
                </div>
              </Card>
            )}

            {/* Categorization */}
            <Card>
              <CardTitle icon="mdi:shape-outline">Categorization</CardTitle>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("categoryId")}
                    className={`${SEL} ${errors.categoryId ? "border-red-400 bg-red-50/40" : ""}`}
                    style={{ backgroundImage: CHEVRON }}
                  >
                    <option value="">Select</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                  <FieldError err={errors.categoryId} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Subcategory</label>
                  <select
                    {...register("subCategoryId")}
                    disabled={!watchCategory}
                    className={SEL}
                    style={{ backgroundImage: CHEVRON }}
                  >
                    <option value="">Select</option>
                    {subCategories.map((s) => (
                      <option key={s._id} value={s._id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Brand</label>
                  <select
                    {...register("brandId")}
                    disabled={adminMode ? false : !watchSubCategory}
                    className={SEL}
                    style={{ backgroundImage: CHEVRON }}
                  >
                    <option value="">Select</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Pricing & Variants */}
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
                      <p className="text-xs text-primary-700 max-w-sm">Every product has at least one default variant. Manage prices, stock, and options from the Variant Manager.</p>
                    </div>
                  </div>
                  {!adminMode && (
                    <button
                      type="button"
                      onClick={() => router.push(`/seller/product/${initialData._id}/variants`)}
                      className="flex-shrink-0 px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                      Manage Variants
                    </button>
                  )}
                </div>
              </Card>
            )}

            {/* Images - Create only */}
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
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
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

            {/* Product Videos — optional, shown in both create and edit modes */}
            <Card>
              <div className="flex items-center justify-between">
                <CardTitle icon="mdi:video-outline">Product Videos</CardTitle>
                <span className="text-xs text-gray-400">
                  {videoPreviews.length}/3
                  <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold">OPTIONAL</span>
                </span>
              </div>

              {/* Video previews */}
              {videoPreviews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                  {videoPreviews.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-900">
                      <video
                        src={url}
                        className="w-full h-28 object-cover opacity-90"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all rounded-xl" />
                      <button
                        type="button"
                        onClick={() => removeVideo(i)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Icon icon="mdi:close" className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                        <Icon icon="mdi:play-circle-outline" className="w-4 h-4 text-white/80" />
                        <span className="text-[9px] text-white/70 font-medium">Video {i + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {videoPreviews.length < 3 && (
                <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50/20 cursor-pointer transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                    <Icon icon="mdi:video-plus-outline" className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-600 group-hover:text-primary-600">Click to upload video</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">MP4, WebM, MOV — up to 50MB each</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="video/mp4,video/webm,video/quicktime,video/mkv"
                    className="hidden"
                    onChange={onVideoChange}
                  />
                </label>
              )}

              {videoPreviews.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Videos help buyers see the product in action. You can add up to 3.
                </p>
              )}
            </Card>

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
                        if (t && !tags.includes(t)) setTags(p => [...p, t]);
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
                      if (t && !tags.includes(t)) setTags(p => [...p, t]);
                      setTagInput("");
                    }}
                    className="h-9 px-3 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs font-bold text-primary-700">
                        #{tag}
                        <button type="button" onClick={() => setTags(p => p.filter(t => t !== tag))}
                          className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-200/50 transition-colors">
                          <Icon icon="mdi:close" className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-400">e.g. gaming, premium, sale, refurbished</p>
              </div>

              {/* Warranty */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <CardTitle icon="mdi:shield-check-outline">Warranty</CardTitle>
                <div className="flex gap-2 mt-2">
                  {["no", "yes"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setHasWarranty(opt === "yes")}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${(opt === "yes") === hasWarranty
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                    >
                      {opt === "yes" ? "✓ Yes, has warranty" : "✗ No warranty"}
                    </button>
                  ))}
                </div>
                {hasWarranty && (
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-xs font-bold text-gray-600 whitespace-nowrap">Duration (months)</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={warrantyMonths}
                      onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                      className="w-24 h-9 px-3 text-sm text-center font-bold rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-400 transition-all"
                    />
                    <span className="text-xs text-gray-400">{warrantyMonths >= 12 ? `(${Math.floor(warrantyMonths / 12)} yr${warrantyMonths >= 24 ? 's' : ''})` : ""}</span>
                  </div>
                )}
              </div>


            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            {/* Summary */}
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
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
              >
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
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-3 text-sm font-semibold bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors"
              >
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
                <li>• You can add variants after creating the product.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}