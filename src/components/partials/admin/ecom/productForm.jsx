"use client";

import { formatCurrency, getCurrencySymbol } from "@/helper/currencyFormatter";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { useRouter } from "@/i18n/navigation";
import RichTextEditor from "./RichTextEditor";
import { IMAGE_RULES, LIMITS, getVideoRules, htmlToText, moveItem, pickFiles, readApiError } from "./productFormRules";
import { ImageUploader, VideoUploader, isFileDrag } from "./ProductMediaUploader";


/* ══════════════════════════════════════════════════════════
   YUP SCHEMA — product fields only (no price/stock/discount)
══════════════════════════════════════════════════════════ */
const productSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Title is required")
    .min(LIMITS.titleMin, `Title must be at least ${LIMITS.titleMin} characters`)
    .max(LIMITS.titleMax, `Title cannot be longer than ${LIMITS.titleMax} characters`),
  shortDescription: yup
    .string()
    .trim()
    .max(LIMITS.shortDescriptionMax, `Short description cannot be longer than ${LIMITS.shortDescriptionMax} characters`)
    .nullable(),
  description: yup
    .string()
    .required("Description is required")
    .test(
      "text-min",
      `Description must be at least ${LIMITS.descriptionMin} characters`,
      (val) => htmlToText(val).length >= LIMITS.descriptionMin
    )
    .test(
      "text-max",
      `Description cannot be longer than ${LIMITS.descriptionMax} characters`,
      (val) => htmlToText(val).length <= LIMITS.descriptionMax
    )
    .max(LIMITS.descriptionHtmlMax, "Description has too much formatting. Remove some of it and try again."),
  categoryId: yup.string().required("Category is required"),
  subCategoryId: yup.string().nullable(),
  brandId: yup.string().nullable(),
  modelNumber: yup
    .string()
    .trim()
    .required("Model number is required")
    .max(LIMITS.modelNumberMax, `Model number cannot be longer than ${LIMITS.modelNumberMax} characters`),
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

const Counter = ({ length, max }) => (
  <span className={`text-[11px] tabular-nums ${length > max ? "text-red-500 font-bold" : "text-gray-400"}`}>
    {length}/{max}
  </span>
);

function FieldCounter({ control, name, max }) {
  const value = useWatch({ control, name });
  return <Counter length={(value || "").length} max={max} />;
}

const FieldLabel = ({ children, required, counter }) => (
  <div className="flex items-end justify-between gap-2 mb-1">
    <label className="block text-xs font-semibold text-gray-600">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
    {counter}
  </div>
);

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
      style={prefix ? { paddingLeft: `${22 + String(prefix).length * 9}px` } : undefined}
      className={`w-full h-11 ${prefix ? "" : "px-4"} ${suffix ? "pr-10" : "pr-4"} rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${error
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
function SimplePricing({ value, onChange, errors = {}, maxDiscount = 90 }) {
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
            max={LIMITS.priceMax}
            prefix={getCurrencySymbol()}
            value={price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="0.00"
            error={errors.price}
          />
          <FieldError err={errors.price && { message: errors.price }} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Stock <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min="0"
            max={LIMITS.stockMax}
            value={stock}
            onChange={(e) => set("stock", e.target.value)}
            placeholder="0"
            error={errors.stock}
          />
          <FieldError err={errors.stock && { message: errors.stock }} />
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
              <span className="font-semibold text-gray-800">{formatCurrency(baseNum)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 flex items-center gap-1">
                Platform Fee ({PLATFORM_FEE_PCT}%)
                <Icon icon="mdi:information-outline" className="w-3.5 h-3.5 text-gray-400" />
              </span>
              <span className="font-semibold text-blue-600">+{formatCurrency(platformFee)}</span>
            </div>
            <div className="border-t border-blue-200/60 pt-2 flex justify-between items-center">
              <span className="font-bold text-gray-700">Selling Price</span>
              <span className="font-extrabold text-gray-900 text-sm">{formatCurrency(sellingPrice)}</span>
            </div>
            {hasDiscount && (
              <>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-500">Discount ({discNum}%)</span>
                  <span className="font-semibold text-red-500">-{formatCurrency(discountSavings)}</span>
                </div>
                <div className="border-t border-blue-200/60 pt-2 flex justify-between items-center">
                  <span className="font-bold text-emerald-700">Customer Pays</span>
                  <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(finalPrice)}</span>
                </div>
              </>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
            The platform fee is automatically added to your base price. Customers will see {formatCurrency(hasDiscount ? finalPrice : sellingPrice)} as the product price.
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
                max={maxDiscount}
                suffix="%"
                value={discountPercentage}
                onChange={(e) => set("discountPercentage", e.target.value)}
                placeholder="0"
                error={errors.discountPercentage}
              />
              <FieldError err={errors.discountPercentage && { message: errors.discountPercentage }} />
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
export default function ProductForm({ mode = "create", initialData = null, adminMode = false, type = "standard" }) {
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  /* ── React Hook Form ── */
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    control,
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

  /* ── Upload rules (mirrors the backend) ── */
  const videoRules = getVideoRules(type);
  const maxDiscount = type === "refurbished" ? 99 : 90;

  /* Newly picked files, looked up by their preview URL, so removing a preview
     always removes exactly that file from the upload. */
  const fileMapRef = useRef(new Map());

  /* ── Images ── */
  const [previews, setPreviews] = useState(initialData?.images?.map((i) => i.url) || []);
  const [imgErr, setImgErr] = useState("");

  /* ── Videos (additive, optional) ── */
  const [videoPreviews, setVideoPreviews] = useState(initialData?.videos?.map((v) => v.url) || []);
  const [vidErr, setVidErr] = useState("");

  /* ── Errors ── */
  const [pricingErrors, setPricingErrors] = useState({});
  const [formProblems, setFormProblems] = useState([]);
  const problemsRef = useRef(null);

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
    let url = adminMode ? "/admin/e-commerce/product/categories" : "/seller/product/categories";
    if (type === "refurbished") url = adminMode ? "/admin/refurbish/categories" : "/seller/refurbished-products/categories";
    
    axiosInstance
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => toast.error("Failed to load categories"));
  }, [token, adminMode, type]);

  /* Load Subcategories */
  useEffect(() => {
    if (type === "refurbished") {
      setSubCategories([]);
      return;
    }
    
    if (!watchCategory) {
      setSubCategories([]);
      if (!adminMode) setBrands([]);
      return;
    }
    const url = adminMode
      ? `/admin/e-commerce/product/subcategories/${watchCategory}`
      : `/seller/product/subcategories/${watchCategory}`;
    let cancelled = false; // ignore the answer if the category changed meanwhile
    axiosInstance
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (cancelled) return;
        setSubCategories(data.data || []);
      })
      .catch(() => !cancelled && toast.error("Failed to load subcategories"));
    return () => { cancelled = true; };
  }, [watchCategory, token, adminMode, type]);

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
    if (type !== "refurbished") {
      loadBrands(watchSubCategory);
    }
  }, [watchSubCategory, loadBrands, type]);

  /* Edit mode: pre-fill the form (the effects above load the matching dropdown options) */
  useEffect(() => {
    if (!initialData) return;
    reset({
      title: initialData.title || "",
      shortDescription: initialData.shortDescription || "",
      description: initialData.description || "",
      categoryId: initialData.categoryId?._id || initialData.categoryId || "",
      subCategoryId: initialData.subCategoryId?._id || initialData.subCategoryId || "",
      brandId: initialData.brandId?._id || initialData.brandId || "",
      modelNumber: initialData.modelNumber || "",
    });
  }, [initialData, reset]);

  /* Edit mode: a <select> can only show the saved value once its options are on screen,
     so re-select it after each option list renders. */
  const useSavedOption = (field, options) => {
    useEffect(() => {
      const savedId = initialData?.[field]?._id || initialData?.[field];
      if (savedId && options.some((o) => o._id === savedId)) setValue(field, savedId);
    }, [field, options]);
  };
  useSavedOption("categoryId", categories);
  useSavedOption("subCategoryId", subCategories);
  useSavedOption("brandId", brands);

  /* ── Admin mode: load all brands on mount (no subcategory filter) ── */
  useEffect(() => {
    if (!adminMode || type === "refurbished") return;
    
    const url = "/admin/e-commerce/product/brands";
    
    axiosInstance
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setBrands(data.data || []))
      .catch(() => toast.error("Failed to load brands"));
  }, [adminMode, token, type]);

  /* ── Refurbished mode: load brands based on category ── */
  useEffect(() => {
    if (type !== "refurbished") return;
    if (!watchCategory) {
      setBrands([]);
      return;
    }
    
    const url = adminMode
        ? `/admin/refurbish/brands?categoryId=${watchCategory}`
        : `/seller/refurbished-products/brands/${watchCategory}`;
      axiosInstance
        .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setBrands(data.data || []);
        if (mode === "edit" && initialData) {
          const brandId = initialData?.brandId?._id || initialData?.brandId || "";
          if (brandId) {
            const brandExists = (data.data || []).some(b => b._id === brandId);
            if (brandExists) setValue("brandId", brandId);
          }
        }
      })
      .catch(() => toast.error("Failed to load brands"));
  }, [type, watchCategory, token, mode, initialData, setValue]);

  /* ── Admin mode: load sellers for seller dropdown ── */
  useEffect(() => {
    if (!adminMode) return;
    axiosInstance
      .get("/admin/e-commerce/seller?limit=100", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setSellers(data.data || []))
      .catch(() => toast.error("Failed to load sellers"));
  }, [adminMode, token]);

  /* ── Image & video helpers ── */
  const addFiles = (picked, rules, currentCount, setUrls, setErr) => {
    const { urls, problems } = pickFiles(picked, rules, currentCount, fileMapRef.current);
    if (urls.length) setUrls((p) => [...p, ...urls]);
    setErr(problems.join("\n"));
    if (problems.length) toast.error(problems[0]);
  };

  const removeFile = (url, setUrls, setErr) => {
    setUrls((p) => p.filter((u) => u !== url));
    if (fileMapRef.current.delete(url)) URL.revokeObjectURL(url);
    setErr("");
  };

  const addImages = (picked) => addFiles(picked, IMAGE_RULES, previews.length, setPreviews, setImgErr);
  const removeImage = (i) => removeFile(previews[i], setPreviews, setImgErr);
  const moveImage = (from, to) => setPreviews((list) => moveItem(list, from, to)); // first = main image
  const addVideos = (picked) => addFiles(picked, videoRules, videoPreviews.length, setVideoPreviews, setVidErr);
  const removeVideo = (i) => removeFile(videoPreviews[i], setVideoPreviews, setVidErr);

  /* Free preview memory when the form closes */
  useEffect(() => {
    const fileMap = fileMapRef.current;
    return () => fileMap.forEach((_, url) => URL.revokeObjectURL(url));
  }, []);

  /* A file dropped outside an upload box must not make the browser open it and lose the form */
  useEffect(() => {
    const block = (e) => {
      if (isFileDrag(e)) e.preventDefault();
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  /* ── Tags ── */
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/,/g, "");
    if (!tag) return setTagInput("");
    if (tags.length >= LIMITS.tagsMax) return toast.warning(`You can add at most ${LIMITS.tagsMax} tags`);
    if (!tags.includes(tag)) setTags((p) => [...p, tag.slice(0, LIMITS.tagLengthMax)]);
    setTagInput("");
  };

  const filesFor = (urls) => urls.map((u) => fileMapRef.current.get(u)).filter(Boolean);

  /* ── Show every problem in one place ── */
  const showProblems = (list) => {
    setFormProblems(list);
    toast.error(list.length === 1 ? list[0] : `${list.length} problems found. First: ${list[0]}`);
    setTimeout(() => problemsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  /* Checks for the fields that live outside react-hook-form */
  const validateExtras = () => {
    const problems = [];
    const pricing = {};

    if (mode === "create") {
      const price = Number(simplePricing.price);
      const stock = Number(simplePricing.stock || 0);
      const discount = Number(simplePricing.discountPercentage || 0);

      if (!simplePricing.price || !(price > 0)) pricing.price = "Base price is required and must be greater than 0";
      else if (price > LIMITS.priceMax) pricing.price = `Price cannot be more than ${LIMITS.priceMax.toLocaleString()}`;
      if (!Number.isInteger(stock) || stock < 0) pricing.stock = "Stock must be a whole number, 0 or more";
      else if (stock > LIMITS.stockMax) pricing.stock = `Stock cannot be more than ${LIMITS.stockMax.toLocaleString()}`;
      if (simplePricing.isDiscounted && !(discount > 0 && discount <= maxDiscount)) {
        pricing.discountPercentage = `Discount must be between 1 and ${maxDiscount}%`;
      }
      problems.push(...Object.values(pricing));

      if (previews.length === 0) {
        const message = "At least 1 product image is required";
        setImgErr(message);
        problems.push(message);
      }
    }

    if (adminMode && mode === "create" && type !== "refurbished" && !selectedSellerId) {
      problems.push("Please select a seller");
    }

    if (hasWarranty && !(Number.isInteger(warrantyMonths) && warrantyMonths >= 1 && warrantyMonths <= LIMITS.warrantyMonthsMax)) {
      problems.push(`Warranty must be between 1 and ${LIMITS.warrantyMonthsMax} months`);
    }

    setPricingErrors(pricing);
    return problems;
  };

  const onInvalid = (formErrors) => {
    const fieldMessages = Object.values(formErrors).map((e) => e?.message).filter(Boolean);
    showProblems([...fieldMessages, ...validateExtras()]);
  };

  /* ── Submit ── */
  const onSubmit = async (productData) => {
    const problems = validateExtras();
    if (problems.length) {
      showProblems(problems);
      return;
    }
    setFormProblems([]);

    setSubmitting(true);

    try {
      const fd = new FormData();

      if (mode === "create") {
        fd.append("title", productData.title);
        fd.append("description", productData.description);
        fd.append("modelNumber", productData.modelNumber);
        if (productData.shortDescription) fd.append("shortDescription", productData.shortDescription);
        if (productData.categoryId) fd.append("categoryId", productData.categoryId);
        if (productData.subCategoryId && type !== "refurbished") fd.append("subCategoryId", productData.subCategoryId);
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
        if (dirtyFields.subCategoryId && type !== "refurbished") fd.append("subCategoryId", productData.subCategoryId);
        if (dirtyFields.brandId) fd.append("brandId", productData.brandId);

        previews
          .filter((u) => !u.startsWith("blob:"))
          .forEach((u) => fd.append("existingImages", u));

        const keptVideoUrls = videoPreviews.filter((u) => !u.startsWith("blob:"));
        if (keptVideoUrls.length) keptVideoUrls.forEach((u) => fd.append("existingVideos", u));
        else fd.append("existingVideos", "[]");
      }


      filesFor(previews).forEach((f) => fd.append("images", f));

      // Append new video files (optional)
      filesFor(videoPreviews).forEach((f) => fd.append("videos", f));

      // Tags (sent as JSON string)
      fd.append("tags", JSON.stringify(tags));

      // Warranty
      fd.append("warranty[type]", hasWarranty ? "yes" : "no");
      fd.append("warranty[months]", hasWarranty ? warrantyMonths : 0);

      const isCreate = mode === "create";

      // Admin mode: include sellerId on create
      if (adminMode && isCreate && selectedSellerId) fd.append("sellerId", selectedSellerId);

      let productUrl = isCreate
        ? (adminMode ? "/admin/e-commerce/product" : "/seller/product")
        : (adminMode ? `/admin/e-commerce/product/${initialData._id}` : `/seller/product/${initialData._id}`);

      if (type === "refurbished") {
         productUrl = adminMode
           ? (isCreate ? "/admin/refurbish/products" : `/admin/refurbish/products/${initialData._id}`)
           : (isCreate ? "/seller/refurbished-products/products" : `/seller/refurbished-products/products/${initialData._id}`);
      }

      const res = await axiosInstance[isCreate ? "post" : "put"](productUrl, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      toast.success(`Product ${isCreate ? "created" : "updated"} successfully`);
      if (type === "refurbished") {
        if (isCreate) {
          router.push(adminMode ? `/admin/refurbished/products/${res.data.data._id}/variants` : `/seller/refurbished/products/${res.data.data._id}/variants`);
        } else {
          router.push(adminMode ? "/admin/refurbished/products" : "/seller/refurbished/products");
        }
      } else if (adminMode) {
        router.push("/admin/ecom/products");
      } else if (isCreate) {
        router.push(`/seller/product/${res.data.data._id}/variants`);
      } else {
        router.push("/seller/product");
      }
    } catch (err) {
      console.error(err);
      const { messages, fieldErrors } = readApiError(err);

      // Put each server message next to the field it belongs to
      const formFields = ["title", "shortDescription", "description", "categoryId", "subCategoryId", "brandId", "modelNumber"];
      const pricing = {};
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (formFields.includes(field)) setError(field, { type: "server", message });
        else if (["price", "stock", "discountPercentage"].includes(field)) pricing[field] = message;
        else if (field === "images") setImgErr(message);
        else if (field === "videos") setVidErr(message);
      });
      setPricingErrors(pricing);
      showProblems(messages);
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
      { label: "Base Price", value: bp > 0 ? formatCurrency(bp) : "—" },
      { label: "Selling Price", value: sp > 0 ? formatCurrency(sp) : "—" },
      { label: "Discount", value: (simplePricing.isDiscounted && simplePricing.discountPercentage) ? `${simplePricing.discountPercentage}%` : "—" },
      { label: "Stock", value: simplePricing.stock || "0" },
    ];
  })();

  const extraRows = mode === "create" ? [
    { label: "Images", value: `${previews.length}/5` },
    { label: "Videos", value: videoPreviews.length > 0 ? `${videoPreviews.length}/${videoRules.maxCount}` : "None" },
    { label: "Category", value: categories.find((c) => c._id === watchCategory)?.title || "—" },
  ] : [
    { label: "Images", value: "Managed in Variants" },
    { label: "Videos", value: videoPreviews.length > 0 ? `${videoPreviews.length}/${videoRules.maxCount}` : "None" },
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
              onClick={() => {
                if (type === "refurbished") router.push(adminMode ? "/admin/refurbished/products" : "/seller/refurbished/products");
                else router.push(adminMode ? "/admin/ecom/products" : "/seller/product");
              }}
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

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
        {formProblems.length > 0 && (
          <div ref={problemsRef} role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-red-700">
              <Icon icon="mdi:alert-circle" className="w-5 h-5" />
              The product could not be saved. Please fix the following:
            </p>
            <ul className="mt-2 list-disc pl-9 text-sm text-red-600 space-y-1">
              {formProblems.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-5">
            {/* Basic Info */}
            <Card>
              <CardTitle icon="mdi:information-outline">Basic Information</CardTitle>
              <div>
                <FieldLabel required counter={<FieldCounter control={control} name="title" max={LIMITS.titleMax} />}>Title</FieldLabel>
                <Input {...register("title")} maxLength={LIMITS.titleMax} error={errors.title} placeholder="e.g. Premium Cotton T-Shirt" />
                <FieldError err={errors.title} />
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required counter={<FieldCounter control={control} name="modelNumber" max={LIMITS.modelNumberMax} />}>Model Number</FieldLabel>
                  <Input {...register("modelNumber")} maxLength={LIMITS.modelNumberMax} error={errors.modelNumber} placeholder="e.g. MOD-1234" />
                  <FieldError err={errors.modelNumber} />
                </div>
                <div>
                  <FieldLabel counter={<FieldCounter control={control} name="shortDescription" max={LIMITS.shortDescriptionMax} />}>Short Description</FieldLabel>
                  <Input {...register("shortDescription")} maxLength={LIMITS.shortDescriptionMax} error={errors.shortDescription} placeholder="One-line summary..." />
                  <FieldError err={errors.shortDescription} />
                </div>
              </div>
              <div>
                <FieldLabel required counter={<Counter length={htmlToText(watchDescription).length} max={LIMITS.descriptionMax} />}>Description</FieldLabel>
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

            {/* Admin-only: Seller selector (not needed for refurbished as it auto assigns to admin) */}
            {adminMode && mode === "create" && type !== "refurbished" && (
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
              <div className={`grid ${type === "refurbished" ? "grid-cols-2" : "grid-cols-3"} gap-3`}>
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
                      <option key={c._id} value={c._id}>{c.title || c.name}</option>
                    ))}
                  </select>
                  <FieldError err={errors.categoryId} />
                </div>
                {type !== "refurbished" && (
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
                    <FieldError err={errors.subCategoryId} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Brand</label>
                  <select
                    {...register("brandId")}
                    disabled={(adminMode && type !== "refurbished") ? false : (type === "refurbished" ? !watchCategory : !watchSubCategory)}
                    className={SEL}
                    style={{ backgroundImage: CHEVRON }}
                  >
                    <option value="">Select</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.title || b.name}</option>
                    ))}
                  </select>
                  <FieldError err={errors.brandId} />
                  {!adminMode && type !== "refurbished" && initialData?._id && (
                    <button
                      type="button"
                      onClick={() => router.push(`/seller/product/${initialData._id}/variants`)}
                      className="px-4 py-2 bg-white text-primary-600 text-sm font-semibold rounded-xl border border-primary-200 hover:bg-primary-50 transition-colors whitespace-nowrap"
                    >
                      Manage Variants →
                    </button>
                  )}
                  {(adminMode || type === "refurbished") && initialData?._id && (
                    <button
                      type="button"
                      onClick={() => {
                        if (type === "refurbished") {
                          router.push(adminMode ? `/admin/refurbished/products/${initialData._id}/variants` : `/seller/refurbished/products/${initialData._id}/variants`);
                        } else {
                          // Standard admin variants URL (assuming it exists or will be added if admin manages variants)
                          router.push(`/admin/ecom/products/${initialData._id}/variants`);
                        }
                      }}
                      className="px-4 py-2 bg-white text-primary-600 text-sm font-semibold rounded-xl border border-primary-200 hover:bg-primary-50 transition-colors whitespace-nowrap"
                    >
                      Manage Variants →
                    </button>
                  )}
                </div>
              </div>
            </Card>

            {/* Pricing & Variants */}
            {mode === "create" ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <SimplePricing
                  value={simplePricing}
                  onChange={(next) => { setSimplePricing(next); setPricingErrors({}); }}
                  errors={pricingErrors}
                  maxDiscount={maxDiscount}
                />
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
                  {(!adminMode && type !== "refurbished") && (
                    <button
                      type="button"
                      onClick={() => router.push(`/seller/product/${initialData._id}/variants`)}
                      className="flex-shrink-0 px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                      Manage Variants
                    </button>
                  )}
                  {(adminMode || type === "refurbished") && (
                    <button
                      type="button"
                      onClick={() => {
                        if (type === "refurbished") {
                          router.push(adminMode ? `/admin/refurbished/products/${initialData._id}/variants` : `/seller/refurbished/products/${initialData._id}/variants`);
                        } else {
                          router.push(`/admin/ecom/products/${initialData._id}/variants`);
                        }
                      }}
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
                  <CardTitle icon="mdi:image-multiple-outline">
                    Product Images <span className="text-red-500">*</span>
                  </CardTitle>
                  <span className="text-xs text-gray-400">{previews.length}/{IMAGE_RULES.maxCount}</span>
                </div>
                <ImageUploader
                  urls={previews}
                  rules={IMAGE_RULES}
                  error={imgErr}
                  onFiles={addImages}
                  onRemove={removeImage}
                  onMove={moveImage}
                />
              </Card>
            )}

            {/* Product Videos — optional, shown in both create and edit modes */}
            <Card>
              <div className="flex items-center justify-between">
                <CardTitle icon="mdi:video-outline">Product Videos</CardTitle>
                <span className="text-xs text-gray-400">
                  {videoPreviews.length}/{videoRules.maxCount}
                  <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold">OPTIONAL</span>
                </span>
              </div>

              <VideoUploader
                urls={videoPreviews}
                rules={videoRules}
                error={vidErr}
                getFile={(url) => fileMapRef.current.get(url)}
                onFiles={addVideos}
                onRemove={removeVideo}
              />
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
                        addTag();
                      }
                    }}
                    maxLength={LIMITS.tagLengthMax}
                    disabled={tags.length >= LIMITS.tagsMax}
                    placeholder="Type a tag and press Enter…"
                    className="flex-1 h-9 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={tags.length >= LIMITS.tagsMax}
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
                <p className="text-[10px] text-gray-400">
                  e.g. gaming, premium, sale • {tags.length}/{LIMITS.tagsMax} tags, up to {LIMITS.tagLengthMax} characters each
                </p>
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
                      max={LIMITS.warrantyMonthsMax}
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
                <li>• The first image is the main one — drag images or press ★ to change it.</li>
                <li>• You can add variants after creating the product.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}