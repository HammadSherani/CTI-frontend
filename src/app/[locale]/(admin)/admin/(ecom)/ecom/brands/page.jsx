"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards, { SummaryCardSkeleton } from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ─── Confirm Dialog ─────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Icon icon="mdi:alert-outline" className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Confirm Delete</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-5 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-5 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Brand Modal ──────────────────────────────────── */
function BrandModal({ mode, initial, subCategories, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    icon: null,
    productSubCategoryId: initial?.productSubCategoryId?._id || initial?.productSubCategoryId || "",
  });
  const [preview, setPreview] = useState(initial?.icon || null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Brand name is required";
    if (mode === "create" && !form.icon) e.icon = "Icon image is required";
    if (!form.productSubCategoryId) e.productSubCategoryId = "Parent subcategory is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("productSubCategoryId", form.productSubCategoryId);

      if (form.icon instanceof File) {
        fd.append("icon", form.icon);
      }

      if (mode === "create") {
        await axiosInstance.post("/admin/e-commerce/brand/create", fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Brand created successfully");
      } else {
        await axiosInstance.put(`/admin/e-commerce/brand/${initial._id}`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Brand updated successfully");
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (file) => {
    if (file) {
      setForm((p) => ({ ...p, icon: file }));
      setPreview(URL.createObjectURL(file));
      setErrors((p) => ({ ...p, icon: "" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "create" ? "Add New Brand" : "Edit Brand"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Parent SubCategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent SubCategory *</label>
            <select
              value={form.productSubCategoryId}
              onChange={(e) => setForm((p) => ({ ...p, productSubCategoryId: e.target.value }))}
              className={`w-full h-12 px-4 rounded-2xl border focus:outline-none focus:border-primary-500
                ${errors.productSubCategoryId ? "border-red-400" : "border-gray-200"}`}
            >
              <option value="">Select Parent SubCategory</option>
              {subCategories.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
            {errors.productSubCategoryId && <p className="text-red-500 text-sm mt-1">{errors.productSubCategoryId}</p>}
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Apple, Nike"
              className={`w-full h-12 px-4 rounded-2xl border focus:outline-none focus:border-primary-500
                ${errors.title ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Improved Icon Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon Image *</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById("brand-icon-upload").click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
            >
              <input
                id="brand-icon-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />

              {preview ? (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 border bg-white rounded-2xl p-3 mb-3">
                    <img src={preview} alt="preview" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm text-gray-600">Click or drag to change</p>
                </div>
              ) : (
                <div>
                  <Icon icon="mdi:cloud-upload-outline" className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Upload Icon</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG recommended</p>
                </div>
              )}
            </div>
            {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 text-sm font-medium bg-gray-100 rounded-2xl hover:bg-gray-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 text-sm font-medium text-white bg-primary-600 rounded-2xl hover:bg-primary-700 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting && <Icon icon="mdi:loading" className="animate-spin" />}
              {mode === "create" ? "Create Brand" : "Update Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subCatFilter, setSubCatFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { token } = useSelector((state) => state.auth);
  const debounceRef = useRef(null);

  // Fetch SubCategories for Dropdown
  const fetchAllSubCategories = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/admin/e-commerce/sub-category?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubCategories(data.data || []);
    } catch (err) {
      toast.error("Failed to load subcategories");
    }
  }, [token]);

  const fetchBrands = useCallback(async (currentPage = 1, currentSearch = search, status = statusFilter, subCatId = subCatFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (currentSearch) params.set("search", currentSearch);
      if (status !== "") params.set("isActive", status);
      if (subCatId) params.set("productSubCategoryId", subCatId);

      const { data } = await axiosInstance.get(`/admin/e-commerce/brand?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBrands(data.data || []);
      setSummary(data.summary || null);
      setPagination(data.pagination || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, subCatFilter, token]);

  useEffect(() => {
    if (token) {
      fetchAllSubCategories();
    }
  }, [token, fetchAllSubCategories]);

  useEffect(() => {
    if (token) fetchBrands(page);
  }, [page, statusFilter, subCatFilter, token, fetchBrands]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchBrands(1, val, statusFilter, subCatFilter);
    }, 400);
  };

  // Optimistic Toggle
  const handleToggleStatus = async (brand) => {
    const oldStatus = brand.isActive;
    const newStatus = !oldStatus;

    setBrands((prev) =>
      prev.map((item) =>
        item._id === brand._id ? { ...item, isActive: newStatus } : item
      )
    );

    try {
      await axiosInstance.patch(`/admin/e-commerce/brand/toggle/${brand._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Brand ${newStatus ? "activated" : "deactivated"}`);
      fetchBrands(page, search, statusFilter, subCatFilter);
    } catch (err) {
      setBrands((prev) =>
        prev.map((item) =>
          item._id === brand._id ? { ...item, isActive: oldStatus } : item
        )
      );
      toast.error(err?.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/e-commerce/brand/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Brand deleted successfully");
      fetchBrands(page, search, statusFilter, subCatFilter);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setConfirm(null);
    }
  };

  const summaryCards = summary
    ? [
      { label: "Total Brands", value: summary.total, icon: "mdi:tag-multiple", color: "#6366f1" },
      { label: "Active", value: summary.active, icon: "mdi:check-circle-outline", color: "#10b981" },
      { label: "Inactive", value: summary.inactive, icon: "mdi:minus-circle-outline", color: "#f59e0b" },
    ]
    : null;

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const subCategoryOptions = [
    { label: "All SubCategories", value: "" },
    ...subCategories.map((c) => ({ label: c.title, value: c._id })),
  ];

  const columns = [
    {
      key: "brand",
      header: "Brand",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl p-1 overflow-hidden">
            {row.icon ? <img src={row.icon} alt={row.title} className="w-full h-full object-contain" /> : <Icon icon="mdi:tag-outline" className="w-5 h-5 text-indigo-600" />}
          </div>
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-xs text-gray-400">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "subcategory",
      header: "Parent SubCategory",
      cell: (row) => <span className="text-sm font-medium text-gray-700">{row.productSubCategoryId?.title || "—"}</span>,
    },

    {
      key: "toggle",
      header: "Active",
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${row.isActive ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${row.isActive ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) => <span className="text-sm text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button onClick={() => setModal({ mode: "edit", item: row })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl">
            <Icon icon="mdi:pencil-outline" className="w-5 h-5" />
          </button>
          <button onClick={() => setConfirm({ id: row._id, label: row.title })} className="p-2 text-red-600 hover:bg-red-50 rounded-xl">
            <Icon icon="mdi:delete-outline" className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500 mt-1">Manage product brands</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white font-medium rounded-2xl hover:bg-primary-700"
        >
          <Icon icon="mdi:plus" className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {summaryCards ? <SummaryCards data={summaryCards} /> : <SummaryCardSkeleton />}

      <div className="mt-6 bg-white rounded-2xl shadow-sm  p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={handleSearchChange} placeholder="Search brands..." />
          </div>
          <div className="w-full sm:w-52">
            <CustomDropdown icon="mdi:shape" placeholder="Filter by SubCategory" options={subCategoryOptions} value={subCatFilter} onChange={(val) => { setSubCatFilter(val); setPage(1); }} searchable />
          </div>
          <div className="w-full sm:w-40">
            <CustomDropdown icon="mdi:filter-outline" placeholder="Status" options={statusOptions} value={statusFilter} onChange={(val) => { setStatusFilter(val); setPage(1); }} />
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl shadow-sm  overflow-hidden">
        <DataTable
          data={brands}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          emptyIcon="mdi:tag-outline"
          emptyTitle="No brands found"
          emptyDescription="Add your first brand under any subcategory."
          emptyAction={
            <button
              onClick={() => setModal({ mode: "create" })}
              className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700"
            >
              <Icon icon="mdi:plus" className="w-5 h-5" />
              Add Brand
            </button>
          }
        />
      </div>

      {modal && (
        <BrandModal
          mode={modal.mode}
          initial={modal.item}
          subCategories={subCategories}
          onClose={() => setModal(null)}
          onSuccess={() => fetchBrands(page, search, statusFilter, subCatFilter)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.label}"?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
