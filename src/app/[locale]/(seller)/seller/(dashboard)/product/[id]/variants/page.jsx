"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import VariantBuilder from "@/components/partials/admin/ecom/variantBuilder";
import { useVariantBuilder } from "@/components/partials/admin/ecom/useVariantBuilder";

/* ──────────────────────────────────────────────────────────
   INNER COMPONENT — mounted only after data is ready
────────────────────────────────────────────────────────── */
function VariantManager({ product, initialVariants }) {
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);
  const [submitting, setSubmitting] = useState(false);
  const [variantErrors, setVariantErrors] = useState({});

  const vb = useVariantBuilder(initialVariants);

  const handleSave = async () => {
    const errs = vb.validate();
    if (Object.keys(errs).length) {
      setVariantErrors(errs);
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }
    setVariantErrors({});
    setSubmitting(true);

    try {
      const variants = vb.serialise();
      const fd = new FormData();
      fd.append("variants", JSON.stringify(variants));

      // Append image files — fieldname pattern: variantImage_<rowIndex>
      vb.rows.forEach((row, idx) => {
        (row.imageFiles || []).forEach((file) => {
          fd.append(`variantImage_${idx}`, file);
        });
      });

      await axiosInstance.post(
        `/seller/product/${product._id}/variants`,
        fd,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      toast.success("Variants saved! 🎉");
      router.push("/seller/product");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save variants.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB]">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" onClick={() => router.back()}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors flex-shrink-0">
              <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
            </button>
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                <span className="cursor-pointer hover:text-primary-500 transition-colors" onClick={() => router.push("/seller/product")}>
                  Products
                </span>
                <Icon icon="mdi:chevron-right" className="w-3 h-3" />
                <span className="text-gray-600 truncate max-w-[140px]">{product?.title}</span>
                <Icon icon="mdi:chevron-right" className="w-3 h-3" />
                <span className="text-gray-600">Variants</span>
              </div>
              <h1 className="text-base font-black text-gray-900 truncate">Manage Variants</h1>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={() => router.back()}
              className="hidden sm:block px-4 py-2 text-sm font-semibold bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={submitting}
              className="px-5 py-2 text-sm font-black text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20">
              {submitting
                ? <><Icon icon="mdi:loading" className="animate-spin w-4 h-4" /> Saving…</>
                : <><Icon icon="mdi:content-save-outline" className="w-4 h-4" /> Save Variants</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Tip banner */}
        <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <Icon icon="mdi:information-outline" className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <span className="font-bold">How it works: </span>
            Set a base price & photos. If your product comes in different options (sizes, colors, etc.), 
            toggle <em>Variations</em> and we'll auto-generate all combinations for you.
          </div>
        </div>

        {/* Builder */}
        <VariantBuilder
          {...vb}
          errors={variantErrors}
        />

        {/* Bottom save */}
        <div className="flex justify-end pt-2 pb-8">
          <button type="button" onClick={handleSave} disabled={submitting}
            className="px-8 py-3 text-sm font-black text-white bg-primary-600 rounded-2xl hover:bg-primary-700 disabled:opacity-60 transition-all flex items-center gap-2 shadow-xl shadow-primary-500/25">
            {submitting
              ? <><Icon icon="mdi:loading" className="animate-spin w-4 h-4" /> Saving…</>
              : <><Icon icon="mdi:check-circle-outline" className="w-4 h-4" /> Save All Variants</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   PAGE SHELL — loads data then mounts VariantManager
────────────────────────────────────────────────────────── */
export default function VariantManagementPage({ params }) {
  const { token } = useSelector((s) => s.auth);
  const unwrappedParams = React.use ? React.use(params) : params;
  const productId = unwrappedParams.id;

  const [product, setProduct] = useState(null);
  const [initialVariants, setInitialVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [prodRes, varRes] = await Promise.all([
          axiosInstance.get(`/seller/product/${productId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axiosInstance.get(`/seller/product/${productId}/variants`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setProduct(prodRes.data.data);
        setInitialVariants(varRes.data.data || []);
      } catch {
        toast.error("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#F8FAFB]">
        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <Icon icon="mdi:loading" className="animate-spin w-6 h-6 text-primary-500" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading variants…</p>
      </div>
    );
  }

  return <VariantManager product={product} initialVariants={initialVariants} />;
}
