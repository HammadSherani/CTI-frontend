"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards, { SummaryCardSkeleton } from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";

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
          <Icon
            icon={t.type === "success" ? "mdi:check-circle" : t.type === "error" ? "mdi:alert-circle" : "mdi:information"}
            className="w-5 h-5 shrink-0"
          />
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

/* ─── Category Modal ─────────────────────────────────────── */
function CategoryModal({ mode, initial, onClose, onSuccess, addToast }) {
  const [form, setForm]         = useState({ title: initial?.title || "", icon: initial?.icon || "", status: initial?.status || "active" });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
    const { token } = useSelector((state) => state.auth);

  const validate = () => {
    const e = {};
    if (!form.title.trim())     e.title = "Title is required";
    if (!form.icon.trim())      e.icon  = "Icon is required (e.g. mdi:tag)";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      if (mode === "create") {
        await axiosInstance.post("/admin/e-commerce/category/create", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
        addToast("Category created successfully", "success");
      } else {
        await axiosInstance.put(`/admin/e-commerce/category/${initial._id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
        addToast("Category updated successfully", "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (label, key, placeholder, type = "text") => (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      <input
        type={type}
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
            {mode === "create" ? "Add Category" : "Edit Category"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field("Category Name *", "title", "e.g. Electronics")}
          {field("Icon *", "icon", "e.g. mdi:laptop")}

          {/* Icon preview */}
          {form.icon && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon icon={form.icon} className="w-8 h-8 text-primary-600" onError={() => {}} />
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
export default function CategoriesPage() {
  const [categories,  setCategories]  = useState([]);
  const [summary,     setSummary]     = useState(null);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [toasts,      setToasts]      = useState([]);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("");
  const [page,        setPage]        = useState(1);
  const [modal,       setModal]       = useState(null); // null | { mode, item? }
  const [confirm,     setConfirm]     = useState(null); // null | { id, label }
  const debounceRef = useRef(null);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const fetchCategories = useCallback(async (currentPage = 1, currentSearch = search, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (currentSearch) params.set("search", currentSearch);
      if (status)        params.set("status", status);

      const { data } = await axiosInstance.get(`/admin/e-commerce/category?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(data.data || []);
      setSummary(data.summary || null);
      setPagination(data.pagination || null);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to fetch categories", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, addToast]);

  useEffect(() => {
    fetchCategories(page, search, statusFilter);
  }, [page, statusFilter]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchCategories(1, val, statusFilter);
    }, 400);
  };

  const handleToggleStatus = async (cat) => {
    try {
      await axiosInstance.patch(`/admin/e-commerce/category/toggle/${cat._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast(`Category ${cat.status === "active" ? "deactivated" : "activated"}`, "success");
      fetchCategories(page, search, statusFilter);
    } catch (err) {
      addToast("Failed to toggle status", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/e-commerce/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast("Category deleted", "success");
      fetchCategories(page, search, statusFilter);
    } catch (err) {
      addToast(err?.response?.data?.message || "Delete failed", "error");
    } finally {
      setConfirm(null);
    }
  };

  const summaryCards = summary
    ? [
        { label: "Total Categories",    value: summary.total,    icon: "mdi:shape",                 color: "#6366f1" },
        { label: "Active Categories",   value: summary.active,   icon: "mdi:check-circle-outline",   color: "#10b981" },
        { label: "Inactive Categories", value: summary.inactive, icon: "mdi:minus-circle-outline",   color: "#f59e0b" },
      ]
    : null;

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active",       value: "active" },
    { label: "Inactive",     value: "inactive" },
  ];

  const columns = [
    {
      key: "category",
      header: "Category",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
            <Icon icon={row.icon || "mdi:shape"} className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{row.title}</p>
            <p className="text-xs text-gray-400">{row.slug}</p>
          </div>
        </div>
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
      header: "Active",
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
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product categories and their status</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Icon icon="mdi:plus" className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {summaryCards ? <SummaryCards data={summaryCards} /> : <SummaryCardSkeleton />}

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={handleSearchChange} placeholder="Search by name or slug…" />
          </div>
          <div className="w-full sm:w-44">
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
          <h2 className="font-semibold text-gray-900">All Categories</h2>
          {pagination && <span className="text-xs text-gray-400">{pagination.totalItems} total</span>}
        </div>
        <DataTable
          data={categories}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
          emptyIcon="mdi:shape-outline"
          emptyTitle="No categories found"
          emptyDescription="Start by adding your first category."
          emptyAction={
            <button
              onClick={() => setModal({ mode: "create" })}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Icon icon="mdi:plus" className="w-4 h-4" />
              Add Category
            </button>
          }
        />
      </div>

      {modal && (
        <CategoryModal
          mode={modal.mode}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSuccess={() => fetchCategories(page, search, statusFilter)}
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
