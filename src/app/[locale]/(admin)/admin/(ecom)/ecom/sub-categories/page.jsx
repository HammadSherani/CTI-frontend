"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards, { SummaryCardSkeleton } from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto
            ${t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500"}`}
        >
          <Icon icon={t.type === "success" ? "mdi:check-circle" : "mdi:alert-circle"} className="w-5 h-5 shrink-0" />
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─── Confirm Dialog ─────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Icon icon="mdi:alert-outline" className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Confirm Action</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SubCategory Modal ──────────────────────────────────── */
function SubCategoryModal({ mode, initial, categories, onClose, onSuccess, addToast }) {
  const [form, setForm]     = useState({
    title:      initial?.title      || "",
    icon:       initial?.icon       || "",
    status:     initial?.status     || "active",
    categoryId: initial?.categoryId?._id || initial?.categoryId || "",
  });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim())      e.title      = "Title is required";
    if (!form.icon.trim())       e.icon       = "Icon is required (e.g. mdi:laptop)";
    if (!form.categoryId)        e.categoryId = "Parent category is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      if (mode === "create") {
        await axiosInstance.post("/admin/e-commerce/sub-category/create", form);
        addToast("SubCategory created successfully", "success");
      } else {
        await axiosInstance.put(`/admin/e-commerce/sub-category/${initial._id}`, form);
        addToast("SubCategory updated successfully", "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const textField = (label, key, placeholder) => (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:border-primary-400
          ${errors[key] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {mode === "create" ? "Add SubCategory" : "Edit SubCategory"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Parent Category */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Parent Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:border-primary-400
                ${errors.categoryId ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
          </div>

          {textField("SubCategory Name *", "title", "e.g. Smartphones")}
          {textField("Icon *", "icon", "e.g. mdi:cellphone")}

          {form.icon && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon icon={form.icon} className="w-8 h-8 text-primary-600" />
              <span className="text-sm text-gray-600">Icon preview</span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary-400"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {submitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
              {mode === "create" ? "Create" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function SubCategoriesPage() {
  const [subCats,      setSubCats]      = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [pagination,   setPagination]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [toasts,       setToasts]       = useState([]);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [catFilter,    setCatFilter]    = useState("");
  const [page,         setPage]         = useState(1);
  const [modal,        setModal]        = useState(null);
  const [confirm,      setConfirm]      = useState(null);
  const debounceRef = useRef(null);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // Fetch all categories for filter/dropdown
  const fetchAllCategories = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/admin/e-commerce/category?limit=100");
      setCategories(data.data || []);
    } catch {}
  }, []);

  const fetchSubCats = useCallback(async (currentPage = 1, currentSearch = search, status = statusFilter, catId = catFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (currentSearch) params.set("search",     currentSearch);
      if (status)        params.set("status",     status);
      if (catId)         params.set("categoryId", catId);

      const { data } = await axiosInstance.get(`/admin/e-commerce/sub-category?${params}`);
      setSubCats(data.data || []);
      setSummary(data.summary || null);
      setPagination(data.pagination || null);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to fetch subcategories", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, catFilter, addToast]);

  useEffect(() => {
    fetchAllCategories();
  }, []);

  useEffect(() => {
    fetchSubCats(page, search, statusFilter, catFilter);
  }, [page, statusFilter, catFilter]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchSubCats(1, val, statusFilter, catFilter);
    }, 400);
  };

  const handleToggleStatus = async (sub) => {
    try {
      await axiosInstance.patch(`/admin/e-commerce/sub-category/toggle/${sub._id}`);
      addToast(`SubCategory ${sub.status === "active" ? "deactivated" : "activated"}`, "success");
      fetchSubCats(page, search, statusFilter, catFilter);
    } catch {
      addToast("Failed to toggle status", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/e-commerce/sub-category/${id}`);
      addToast("SubCategory deleted", "success");
      fetchSubCats(page, search, statusFilter, catFilter);
    } catch (err) {
      addToast(err?.response?.data?.message || "Delete failed", "error");
    } finally {
      setConfirm(null);
    }
  };

  const summaryCards = summary
    ? [
        { label: "Total SubCategories",    value: summary.total,    icon: "mdi:shape-plus",            color: "#6366f1" },
        { label: "Active SubCategories",   value: summary.active,   icon: "mdi:check-circle-outline",   color: "#10b981" },
        { label: "Inactive SubCategories", value: summary.inactive, icon: "mdi:minus-circle-outline",   color: "#f59e0b" },
      ]
    : null;

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active",       value: "active" },
    { label: "Inactive",     value: "inactive" },
  ];

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map((c) => ({ label: c.title, value: c._id })),
  ];

  const columns = [
    {
      key: "subcategory",
      header: "SubCategory",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
            <Icon icon={row.icon || "mdi:shape-plus"} className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{row.title}</p>
            <p className="text-xs text-gray-400">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Parent Category",
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
          <Icon icon="mdi:shape" className="w-3 h-3" />
          {row.categoryId?.title || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
          ${row.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "toggle",
      header: "Toggle",
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${row.status === "active" ? "bg-green-500" : "bg-gray-200"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
            ${row.status === "active" ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) => (
        <span className="text-xs text-gray-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModal({ mode: "edit", item: row })}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirm({ id: row._id, label: row.title })}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Icon icon="mdi:delete-outline" className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <Toast toasts={toasts} />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SubCategories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product subcategories under their parent categories</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Icon icon="mdi:plus" className="w-4 h-4" />
          Add SubCategory
        </button>
      </div>

      {summaryCards ? <SummaryCards data={summaryCards} /> : <SummaryCardSkeleton />}

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={handleSearchChange} placeholder="Search by name or slug…" />
          </div>
          <div className="w-full sm:w-52">
            <CustomDropdown
              icon="mdi:shape"
              placeholder="Filter by Category"
              options={categoryOptions}
              value={catFilter}
              onChange={(val) => { setCatFilter(val); setPage(1); }}
              searchable
            />
          </div>
          <div className="w-full sm:w-40">
            <CustomDropdown
              icon="mdi:filter-outline"
              placeholder="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All SubCategories</h2>
          {pagination && <span className="text-xs text-gray-400">{pagination.totalItems} total</span>}
        </div>
        <DataTable
          data={subCats}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
          emptyIcon="mdi:shape-plus-outline"
          emptyTitle="No subcategories found"
          emptyDescription="Start by adding your first subcategory."
          emptyAction={
            <button
              onClick={() => setModal({ mode: "create" })}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Icon icon="mdi:plus" className="w-4 h-4" />
              Add SubCategory
            </button>
          }
        />
      </div>

      {modal && (
        <SubCategoryModal
          mode={modal.mode}
          initial={modal.item}
          categories={categories}
          onClose={() => setModal(null)}
          onSuccess={() => fetchSubCats(page, search, statusFilter, catFilter)}
          addToast={addToast}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.label}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
