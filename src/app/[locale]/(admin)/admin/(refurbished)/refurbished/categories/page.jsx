"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards, { SummaryCardSkeleton } from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "@/components/partials/admin/ecom/myButton";

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

/* ─── Category Modal ─────────────────────────────────────── */
function CategoryModal({ mode, initial, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    image: null,
  });
  const [preview, setPreview] = useState(initial?.image || null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Category name is required";
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
      fd.append("name", form.name.trim());

      if (form.image instanceof File) {
        fd.append("image", form.image);
      }

      if (mode === "create") {
        await axiosInstance.post("/admin/refurbish/categories", fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Category created successfully");
      } else {
        await axiosInstance.put(`/admin/refurbish/categories/${initial._id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Category updated successfully");
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
      setForm((p) => ({ ...p, image: file }));
      setPreview(URL.createObjectURL(file));
      setErrors((p) => ({ ...p, image: "" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Add New Category" : "Edit Category"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Phones, Tablets"
              className={`w-full h-12 px-4 rounded-2xl border focus:outline-none focus:border-primary-500
                ${errors.name ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Icon/Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Image *</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById("icon-upload").click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
            >
              <input
                id="icon-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />

              {preview ? (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-3">
                    <img src={preview} alt="preview" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm text-gray-600">Click or drag to change image</p>
                </div>
              ) : (
                <div>
                  <Icon icon="mdi:cloud-upload-outline" className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG (Recommended 512x512)</p>
                </div>
              )}
            </div>
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 text-sm font-medium bg-gray-100 rounded-2xl hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 text-sm font-medium text-white bg-primary-600 rounded-2xl hover:bg-primary-700 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting && <Icon icon="mdi:loading" className="animate-spin" />}
              {mode === "create" ? "Create Category" : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── View Modal ─────────────────────────────────────────── */
function ViewCategoryModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Category Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
              ) : (
                <Icon icon="mdi:image-outline" className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Name</label>
            <p className="text-gray-900 font-medium">{item.name}</p>
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
        </div>
        <div className="p-4 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { token } = useSelector((state) => state.auth);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "") params.set("isActive", statusFilter);

      const { data } = await axiosInstance.get(`/admin/refurbish/categories?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, token]);

  useEffect(() => {
    if (token) fetchCategories();
  }, [token, statusFilter, fetchCategories]);

  const handleToggleStatus = async (cat) => {
    const oldStatus = cat.isActive;
    const newStatus = !oldStatus;

    setCategories(prev =>
      prev.map(item =>
        item._id === cat._id ? { ...item, isActive: newStatus } : item
      )
    );

    try {
      await axiosInstance.patch(
        `/admin/refurbish/categories/toggle/${cat._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Category ${newStatus ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      setCategories(prev =>
        prev.map(item =>
          item._id === cat._id ? { ...item, isActive: oldStatus } : item
        )
      );
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/refurbish/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setConfirm(null);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const summaryCardsData = [
    { label: "Total Categories", value: categories.length, icon: "mdi:shape", color: "#6366f1" },
    { label: "Active Categories", value: categories.filter(c => c.isActive).length, icon: "mdi:check-circle-outline", color: "#10b981" },
    { label: "Inactive Categories", value: categories.filter(c => !c.isActive).length, icon: "mdi:minus-circle-outline", color: "#f59e0b" },
  ];

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const columns = [
    {
      key: "name",
      header: "Category",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50">
            {row.image ? (
              <img src={row.image} alt={row.name} className="w-full h-full object-contain" />
            ) : (
              <Icon icon="mdi:shape" className="w-5 h-5 text-primary-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{row.name}</p>
            <p className="text-xs text-gray-400">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Active",
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-sm
        ${row.isActive ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300
          ${row.isActive ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button onClick={() => setModal({ mode: "view", item: row })} className="p-2 hover:bg-green-50 rounded-xl text-green-600">
            <Icon icon="mdi:eye-outline" className="w-4 h-4" />
          </button>
          <button onClick={() => setModal({ mode: "edit", item: row })} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600">
            <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirm({ id: row._id, label: row.name })} className="p-2 hover:bg-red-50 rounded-xl text-red-600">
            <Icon icon="mdi:delete-outline" className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage refurbished device categories</p>
        </div>
        <Button
          onClick={() => setModal({ mode: "create" })}
          variant="primary"
          className="h-11"
        >
          <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
          Add Category
        </Button>
      </div>

      <SummaryCards data={summaryCardsData} />

      <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchInput value={search} onChange={(val) => setSearch(val)} placeholder="Search categories..." />
          </div>
          <div className="w-full sm:w-48">
            <CustomDropdown icon="mdi:filter-outline" placeholder="Status" options={statusOptions} value={statusFilter} onChange={(val) => setStatusFilter(val)} />
          </div>
        </div>

        <DataTable
          data={filteredCategories}
          columns={columns}
          loading={loading}
          emptyIcon="mdi:shape-outline"
          emptyTitle="No categories found"
          emptyDescription="Add your first refurbished category"
        />
      </div>

      {modal && modal.mode === "view" ? (
        <ViewCategoryModal item={modal.item} onClose={() => setModal(null)} />
      ) : modal && (
        <CategoryModal mode={modal.mode} initial={modal.item} onClose={() => setModal(null)} onSuccess={fetchCategories} />
      )}
      {confirm && <ConfirmDialog message={`Delete "${confirm.label}"?`} onConfirm={() => handleDelete(confirm.id)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}