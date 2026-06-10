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
import { SelectOptions } from "@/components/ui/SelectOptions";
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

/* ─── SubCategory Modal ──────────────────────────────────── */
function SubCategoryModal({ mode, initial, categories, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    icon: null,
    categoryId: initial?.categoryId?._id || initial?.categoryId || "",
  });
  const [preview, setPreview] = useState(initial?.icon || null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Subcategory name is required";
    if (mode === "create" && !form.icon) e.icon = "Icon image is required";
    if (!form.categoryId) e.categoryId = "Parent category is required";
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
      fd.append("categoryId", form.categoryId);

      if (form.icon instanceof File) {
        fd.append("icon", form.icon);
      }

      if (mode === "create") {
        await axiosInstance.post("/admin/e-commerce/sub-category/create", fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Subcategory created successfully");
      } else {
        await axiosInstance.put(`/admin/e-commerce/sub-category/${initial._id}`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Subcategory updated successfully");
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
      <div className="bg-white rounded-3xl h-full shadow-2xl w-full max-w-md overflow-y-auto !no-scrollbar">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "create" ? "Add New Subcategory" : "Edit Subcategory"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Parent Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
            <SelectOptions 
              isSearch={true} 
              label="Parent Category" 
              icon="mdi:shape" 
              options={categories.map(c => ({ _id: c._id, name: c.title }))} 
              value={form.categoryId} 
              onChange={(val) => setForm(p => ({ ...p, categoryId: val }))} 
            />
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
          </div>

          {/* SubCategory Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SubCategory Name *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Smartphones, T-Shirts"
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
              onClick={() => document.getElementById("sub-icon-upload").click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
            >
              <input
                id="sub-icon-upload"
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
              {mode === "create" ? "Create Subcategory" : "Update Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── View Modal ─────────────────────────────────────────── */
function ViewSubCategoryModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full h-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">SubCategory Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 border bg-gray-50 rounded-2xl p-3 flex items-center justify-center">
              {item.icon ? (
                <img src={item.icon} alt={item.title} className="max-w-full max-h-full object-contain" />
              ) : (
                <Icon icon="mdi:shape-plus" className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Title</label>
            <p className="text-gray-900 font-medium">{item.title}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Slug</label>
            <p className="text-gray-900">{item.slug || "—"}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Parent Category</label>
            <p className="text-gray-900">{item.categoryId?.title || "—"}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Status</label>
            <div className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                {item.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Created At</label>
            <p className="text-gray-900">{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function SubCategoriesPage() {
  const [subCats, setSubCats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { token } = useSelector((state) => state.auth);
  const debounceRef = useRef(null);

  // Fetch Categories for Dropdown
  const fetchAllCategories = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/admin/e-commerce/category?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(data.data || []);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  }, [token]);

  const fetchSubCats = useCallback(async (currentPage = 1, currentSearch = search, status = statusFilter, catId = catFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (currentSearch) params.set("search", currentSearch);
      if (status !== "") params.set("isActive", status);
      if (catId) params.set("categoryId", catId);

      const { data } = await axiosInstance.get(`/admin/e-commerce/sub-category?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubCats(data.data || []);
      setSummary(data.summary || null);
      setPagination(data.pagination || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch subcategories");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, catFilter, token]);

  useEffect(() => {
    if (token) {
      fetchAllCategories();
    }
  }, [token, fetchAllCategories]);

  useEffect(() => {
    if (token) fetchSubCats(page);
  }, [page, statusFilter, catFilter, token, fetchSubCats]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchSubCats(1, val, statusFilter, catFilter);
    }, 400);
  };

  // Optimistic Toggle
  const handleToggleStatus = async (sub) => {
    const oldStatus = sub.isActive;
    const newStatus = !oldStatus;

    setSubCats((prev) =>
      prev.map((item) =>
        item._id === sub._id ? { ...item, isActive: newStatus } : item
      )
    );

    try {
      await axiosInstance.patch(`/admin/e-commerce/sub-category/toggle/${sub._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Subcategory ${newStatus ? "activated" : "deactivated"}`);
      fetchSubCats(page, search, statusFilter, catFilter);
    } catch (err) {
      setSubCats((prev) =>
        prev.map((item) =>
          item._id === sub._id ? { ...item, isActive: oldStatus } : item
        )
      );
      toast.error(err?.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/e-commerce/sub-category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Subcategory deleted successfully");
      fetchSubCats(page, search, statusFilter, catFilter);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setConfirm(null);
    }
  };

  const summaryCards = summary
    ? [
      { label: "Total SubCategories", value: summary.total, icon: "mdi:shape-plus", color: "#6366f1" },
      { label: "Active", value: summary.active, icon: "mdi:check-circle-outline", color: "#10b981" },
      { label: "Inactive", value: summary.inactive, icon: "mdi:minus-circle-outline", color: "#f59e0b" },
    ]
    : null;

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map((c) => ({ label: c.title, value: c._id })),
  ];

  const columns = [
    // ... (same as before - only toggle updated)
    {
      key: "subcategory",
      header: "SubCategory",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl p-1 overflow-hidden">
            {row.icon ? <img src={row.icon} alt={row.title} className="w-full h-full object-contain" /> : <Icon icon="mdi:shape-plus" className="w-5 h-5 text-indigo-600" />}
          </div>
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-xs text-gray-400">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Parent Category",
      cell: (row) => <span className="text-sm font-medium text-gray-700">{row.categoryId?.title || "—"}</span>,
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
          <button onClick={() => setModal({ mode: "view", item: row })} className="p-2 text-green-600 hover:bg-green-50 rounded-xl">
            <Icon icon="mdi:eye-outline" className="w-5 h-5" />
          </button>
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
          <h1 className="text-3xl font-bold text-gray-900">SubCategories</h1>
          <p className="text-gray-500 mt-1">Manage product subcategories</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white font-medium rounded-2xl hover:bg-primary-700"
        >
          <Icon icon="mdi:plus" className="w-5 h-5" />
          Add SubCategory
        </button>
      </div>

      {summaryCards ? <SummaryCards data={summaryCards} /> : <SummaryCardSkeleton />}

      <div className="mt-6 bg-white rounded-2xl shadow-sm  p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={handleSearchChange} placeholder="Search subcategories..." />
          </div>
          <div className="w-full sm:w-52">
            <CustomDropdown icon="mdi:shape" placeholder="Filter by Category" options={categoryOptions} value={catFilter} onChange={(val) => { setCatFilter(val); setPage(1); }} searchable />
          </div>
          <div className="w-full sm:w-40">
            <CustomDropdown icon="mdi:filter-outline" placeholder="Status" options={statusOptions} value={statusFilter} onChange={(val) => { setStatusFilter(val); setPage(1); }} />
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl shadow-sm  overflow-hidden">
        <DataTable
          data={subCats}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          emptyIcon="mdi:shape-plus-outline"
          emptyTitle="No subcategories found"
          emptyDescription="Add your first subcategory under any category."
          emptyAction={
            <button
              onClick={() => setModal({ mode: "create" })}
              className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700"
            >
              <Icon icon="mdi:plus" className="w-5 h-5" />
              Add SubCategory
            </button>
          }
        />
      </div>

      {modal && modal.mode === "view" ? (
        <ViewSubCategoryModal item={modal.item} onClose={() => setModal(null)} />
      ) : modal && (
        <SubCategoryModal
          mode={modal.mode}
          initial={modal.item}
          categories={categories}
          onClose={() => setModal(null)}
          onSuccess={() => fetchSubCats(page, search, statusFilter, catFilter)}
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