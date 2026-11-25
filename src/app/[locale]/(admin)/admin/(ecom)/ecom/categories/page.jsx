"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards, { SummaryCardSkeleton } from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "@/components/partials/admin/ecom/myButton";

const MAX_ICON_SIZE = 5 * 1024 * 1024; // 5 MB
const PAGE_SIZE = 10;

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const formatDateTime = (value) =>
  value ? `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString()}` : "—";

/* ─── Confirm Dialog ─────────────────────────────────────── */
function ConfirmDialog({ title = "Confirm Delete", message, details, confirmLabel = "Delete", loading, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !loading && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
            <Icon icon="mdi:alert-outline" className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-700 mt-0.5">{message}</p>
            {details && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{details}</p>}
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-70 flex items-center gap-2"
          >
            {loading && <Icon icon="mdi:loading" className="animate-spin" />}
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Category Modal ─────────────────────────────────────── */
function CategoryModal({ mode, initial, onClose, onSuccess }) {
  const [form, setForm] = useState({ title: initial?.title || "", icon: null });
  const [preview, setPreview] = useState(initial?.icon || null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const { token } = useSelector((state) => state.auth);

  // Release the temporary preview URL when it is replaced or the modal closes.
  const releaseObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };
  useEffect(() => releaseObjectUrl, []);

  const safeClose = useCallback(() => {
    if (!submitting) onClose();
  }, [submitting, onClose]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && safeClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [safeClose]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Category name is required";
    else if (form.title.trim().length < 2) e.title = "Category name is too short";
    if (mode === "create" && !form.icon) e.icon = "Please upload an icon";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      if (form.icon instanceof File) fd.append("icon", form.icon);

      const config = {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      };

      if (mode === "create") {
        await axiosInstance.post("/admin/e-commerce/category/create", fd, config);
        toast.success("Category created successfully");
      } else {
        await axiosInstance.put(`/admin/e-commerce/category/${initial._id}`, fd, config);
        toast.success("Category updated successfully");
      }

      onSuccess(mode);
      onClose();
    } catch (err) {
      const message = err?.response?.data?.message || "Operation failed";
      // Name clashes belong next to the field, everything else is a toast.
      if (err?.response?.status === 409) setErrors((p) => ({ ...p, title: message }));
      else toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, icon: "Only image files are allowed" }));
      return;
    }
    if (file.size > MAX_ICON_SIZE) {
      setErrors((p) => ({ ...p, icon: "Image must be smaller than 5 MB" }));
      return;
    }
    releaseObjectUrl();
    objectUrlRef.current = URL.createObjectURL(file);
    setForm((p) => ({ ...p, icon: file }));
    setPreview(objectUrlRef.current);
    setErrors((p) => ({ ...p, icon: "" }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && safeClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Add New Category" : "Edit Category"}
          </h2>
          <button onClick={safeClose} disabled={submitting} aria-label="Close" className="p-2 hover:bg-gray-200 rounded-xl disabled:opacity-50">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              autoFocus
              maxLength={80}
              value={form.title}
              onChange={(e) => {
                setForm((p) => ({ ...p, title: e.target.value }));
                if (errors.title) setErrors((p) => ({ ...p, title: "" }));
              }}
              placeholder="e.g. Electronics, Fashion"
              className={`w-full h-12 px-4 rounded-2xl border focus:outline-none focus:border-primary-500
                ${errors.title ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Icon {mode === "create" && "*"}
            </label>

            <div
              className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange(e.dataTransfer.files?.[0]);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFileChange(e.target.files?.[0]);
                  e.target.value = ""; // allow re-selecting the same file
                }}
              />

              {preview ? (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 border bg-white rounded-2xl p-3 mb-3">
                    <img src={preview} alt="preview" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm text-gray-600">Click or drag to change icon</p>
                </div>
              ) : (
                <div>
                  <Icon icon="mdi:cloud-upload-outline" className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 5 MB (Recommended 512x512)</p>
                </div>
              )}
            </div>

            {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={safeClose}
              disabled={submitting}
              className="flex-1 py-3.5 text-sm font-medium bg-gray-100 rounded-2xl hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 text-sm font-medium text-white bg-primary-600 rounded-2xl hover:bg-primary-700 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting && <Icon icon="mdi:loading" className="animate-spin" />}
              {submitting ? "Saving..." : mode === "create" ? "Create Category" : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── View Modal ─────────────────────────────────────────── */
function ViewCategoryModal({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Category Details</h2>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 border bg-gray-50 rounded-2xl p-3 flex items-center justify-center">
              {item.icon ? (
                <img src={item.icon} alt={item.title} className="max-w-full max-h-full object-contain" />
              ) : (
                <Icon icon="mdi:image-outline" className="w-12 h-12 text-gray-400" />
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
            <label className="block text-xs font-medium text-gray-500 uppercase">Status</label>
            <div className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                {item.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Created At</label>
            <p className="text-gray-900">{formatDateTime(item.createdAt)}</p>
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Category icon with a safe fallback ─────────────────── */
function CategoryIcon({ src, alt }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="w-10 h-10 bg-primary-50 rounded-xl p-1 overflow-hidden flex items-center justify-center">
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-contain" />
      ) : (
        <Icon icon="mdi:shape" className="w-5 h-5 text-primary-600" />
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // `searchInput` follows the keyboard; `query.search` only changes after the debounce,
  // so typing never fires one request per keystroke.
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState({ page: 1, search: "", status: "" });

  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingIds, setTogglingIds] = useState(() => new Set());

  const { token } = useSelector((state) => state.auth);
  const requestIdRef = useRef(0);

  /* Debounce the search box */
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery((q) => (q.search === searchInput.trim() ? q : { ...q, search: searchInput.trim(), page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  /**
   * Load a page. `silent` refreshes in the background (no spinner/skeleton) — used after
   * toggle/delete/save so the table does not flash. Only the newest request may update state,
   * so a slow older response can never overwrite a newer one.
   */
  const fetchCategories = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++requestIdRef.current;
      if (!silent) setLoading(true);

      try {
        const params = new URLSearchParams({ page: query.page, limit: PAGE_SIZE });
        if (query.search) params.set("search", query.search);
        if (query.status !== "") params.set("isActive", query.status);

        const { data } = await axiosInstance.get(`/admin/e-commerce/category?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (requestId !== requestIdRef.current) return;

        const totalPages = data.pagination?.totalPages || 0;
        // Landed past the last page (e.g. after deleting the last row of it) → step back.
        if (totalPages > 0 && query.page > totalPages) {
          setQuery((q) => ({ ...q, page: totalPages }));
          return;
        }

        setCategories(data.data || []);
        setSummary(data.summary || null);
        setPagination(data.pagination || null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        toast.error(err?.response?.data?.message || "Failed to load categories");
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [query, token]
  );

  useEffect(() => {
    if (token) fetchCategories();
  }, [fetchCategories, token]);

  const setToggling = (id, on) =>
    setTogglingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const applyStatusLocally = (id, isActive) => {
    setCategories((prev) => prev.map((c) => (c._id === id ? { ...c, isActive } : c)));
    setSummary((s) =>
      s ? { ...s, active: s.active + (isActive ? 1 : -1), inactive: s.inactive + (isActive ? -1 : 1) } : s
    );
  };

  const handleToggleStatus = async (cat) => {
    if (togglingIds.has(cat._id)) return; // ignore double clicks while a request is in flight

    const next = !cat.isActive;
    setToggling(cat._id, true);
    applyStatusLocally(cat._id, next); // optimistic

    try {
      await axiosInstance.patch(
        `/admin/e-commerce/category/toggle/${cat._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Category ${next ? "activated" : "deactivated"}`);
      // With a status filter the row no longer belongs in the list → refresh quietly.
      if (query.status !== "") fetchCategories({ silent: true });
    } catch (err) {
      applyStatusLocally(cat._id, cat.isActive); // revert
      toast.error(err?.response?.data?.message || "Failed to change status. Please try again.");
    } finally {
      setToggling(cat._id, false);
    }
  };

  const handleDelete = async () => {
    if (!confirm || deleting) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/admin/e-commerce/category/${confirm.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted successfully");
      setConfirm(null);

      // Deleted the only row on this page → go back one page, otherwise just refresh quietly.
      if (categories.length === 1 && query.page > 1) setQuery((q) => ({ ...q, page: q.page - 1 }));
      else fetchCategories({ silent: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
      setConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (mode) => {
    // A new category sorts first, so jump to page 1 to show it.
    if (mode === "create" && query.page !== 1) setQuery((q) => ({ ...q, page: 1 }));
    else fetchCategories({ silent: true });
  };

  const clearFilters = () => {
    setSearchInput("");
    setQuery({ page: 1, search: "", status: "" });
  };

  const hasFilters = Boolean(query.search || query.status !== "" || searchInput);

  const summaryCards = summary
    ? [
        { label: "Total Categories", value: summary.total, icon: "mdi:shape", color: "#6366f1" },
        { label: "Active Categories", value: summary.active, icon: "mdi:check-circle-outline", color: "#10b981" },
        { label: "Inactive Categories", value: summary.inactive, icon: "mdi:minus-circle-outline", color: "#f59e0b" },
      ]
    : null;

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const columns = useMemo(
    () => [
      {
        key: "category",
        header: "Category",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <CategoryIcon src={row.icon} alt={row.title} />
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="text-xs text-gray-400">{row.slug}</p>
            </div>
          </div>
        ),
      },
      {
        key: "toggle",
        header: "Active",
        cell: (row) => {
          const busy = togglingIds.has(row._id);
          return (
            <button
              type="button"
              role="switch"
              aria-checked={row.isActive}
              aria-label={`${row.isActive ? "Deactivate" : "Activate"} ${row.title}`}
              onClick={() => handleToggleStatus(row)}
              disabled={busy}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shadow-sm disabled:opacity-60
                ${row.isActive ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md transition-all duration-300
                  ${row.isActive ? "translate-x-6" : "translate-x-1"}`}
              >
                {busy && <Icon icon="mdi:loading" className="w-3 h-3 animate-spin text-gray-500" />}
              </span>
            </button>
          );
        },
      },
      {
        key: "createdAt",
        header: "Created",
        cell: (row) => <span className="text-sm text-gray-500">{formatDate(row.createdAt)}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row) => (
          <div className="flex gap-1">
            <button title="View" onClick={() => setModal({ mode: "view", item: row })} className="p-2 hover:bg-green-50 rounded-xl text-green-600">
              <Icon icon="mdi:eye-outline" className="w-5 h-5" />
            </button>
            <button title="Edit" onClick={() => setModal({ mode: "edit", item: row })} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600">
              <Icon icon="mdi:pencil-outline" className="w-5 h-5" />
            </button>
            <button title="Delete" onClick={() => setConfirm({ id: row._id, label: row.title })} className="p-2 hover:bg-red-50 rounded-xl text-red-600">
              <Icon icon="mdi:delete-outline" className="w-5 h-5" />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [togglingIds, query, token]
  );

  const refreshing = loading && categories.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Manage product categories</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 shrink-0"
        >
          <Icon icon="mdi:plus" className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {summaryCards ? <SummaryCards data={summaryCards} /> : <SummaryCardSkeleton />}

      <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search categories..." />
          </div>
          <div className="w-full sm:w-48">
            <CustomDropdown
              icon="mdi:filter-outline"
              placeholder="Status"
              options={statusOptions}
              value={query.status}
              onChange={(val) => setQuery((q) => ({ ...q, status: val, page: 1 }))}
            />
          </div>
        </div>
      </div>

      <div
        className={`mt-4 bg-white rounded-2xl shadow-sm overflow-hidden transition-opacity ${refreshing ? "opacity-60 pointer-events-none" : ""}`}
        aria-busy={refreshing}
      >
        <DataTable
          data={categories}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => setQuery((q) => ({ ...q, page: p }))}
          emptyIcon="mdi:shape-outline"
          emptyTitle={hasFilters ? "No categories match your filters" : "No categories found"}
          emptyDescription={hasFilters ? "Try a different search or clear the filters." : "Add your first category"}
          emptyAction={
            hasFilters ? (
              <Button label="Clear filters" icon="mdi:filter-remove-outline" onClick={clearFilters} variant="secondary" />
            ) : (
              <Button label="Add Category" icon="mdi:plus" onClick={() => setModal({ mode: "create" })} variant="primary" />
            )
          }
        />
      </div>

      {modal?.mode === "view" && <ViewCategoryModal item={modal.item} onClose={() => setModal(null)} />}
      {modal && modal.mode !== "view" && (
        <CategoryModal mode={modal.mode} initial={modal.item} onClose={() => setModal(null)} onSuccess={handleSaved} />
      )}
      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.label}"?`}
          details="This permanently deletes the category together with its sub-categories and brands, and cannot be undone. A category that still has products cannot be deleted — deactivate it instead."
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setConfirm(null)}
        />
      )}
    </div>
  );
}
