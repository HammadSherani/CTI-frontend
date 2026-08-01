"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "@/components/partials/admin/ecom/myButton";

/* ─── Confirm Dialog ─────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
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
          <button disabled={loading} onClick={onCancel} className="px-5 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
          <button disabled={loading} onClick={onConfirm} className="px-5 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-70 flex items-center gap-2">
            {loading && <Icon icon="mdi:loading" className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Model Modal ────────────────────────────────────────── */
function ModelModal({ mode, initial, brandsList, categoriesList, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    brandId: initial?.brandId?._id || initial?.brandId || "",
    categoryId: initial?.categoryId?._id || initial?.categoryId || "",
    image: null,
  });

  const [preview, setPreview] = useState(initial?.imageUrl || null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  // Filter brands by selected category — categories is array of ObjectIds, compare as strings
  const filteredBrands = form.categoryId
    ? brandsList.filter(b =>
      Array.isArray(b.categories) &&
      b.categories.some(catId => catId?.toString() === form.categoryId || catId?._id?.toString() === form.categoryId)
    )
    : [];

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Model name is required";
    if (!form.categoryId) e.categoryId = "Please select a category";
    if (!form.brandId) e.brandId = "Please select a brand";
    if (mode === "create" && !form.image) e.image = "Model image is required";
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
      fd.append("brandId", form.brandId);
      fd.append("categoryId", form.categoryId);

      if (form.image instanceof File) {
        fd.append("image", form.image);
      }

      if (mode === "create") {
        await axiosInstance.post("/admin/refurbish/models", fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Model created successfully");
      } else {
        await axiosInstance.put(`/admin/refurbish/models/${initial._id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Model updated successfully");
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Add New Model" : "Edit Model"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Step 1: Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value, brandId: "" }))}
              className={`w-full h-12 px-4 rounded-2xl border focus:outline-none focus:border-primary-500 bg-white ${errors.categoryId ? "border-red-400" : "border-gray-200"}`}
            >
              <option value="">Choose Category</option>
              {categoriesList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
          </div>

          {/* Step 2: Brand — filtered by category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Brand <span className="text-red-500">*</span>
            </label>
            {!form.categoryId ? (
              <div className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-center text-sm text-gray-400">
                Select a category first
              </div>
            ) : (
              <select
                value={form.brandId}
                onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value }))}
                className={`w-full h-12 px-4 rounded-2xl border focus:outline-none focus:border-primary-500 bg-white ${errors.brandId ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">Choose Brand</option>
                {filteredBrands.length > 0
                  ? filteredBrands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)
                  : <option disabled value="">No brands for this category</option>
                }
              </select>
            )}
            {errors.brandId && <p className="text-red-500 text-sm mt-1">{errors.brandId}</p>}
          </div>

          {/* Step 3: Model Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. iPhone 15 Pro"
              className={`w-full h-12 px-4 rounded-2xl border focus:outline-none focus:border-primary-500 ${errors.name ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Model Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Image {mode === "create" && <span className="text-red-500">*</span>}
            </label>
            <div
              className={`border-2 border-dashed rounded-3xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer ${errors.image ? "border-red-400 bg-red-50" : "border-gray-300"}`}
              onClick={() => document.getElementById("image-upload").click()}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              {preview ? (
                <div className="relative w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img src={preview} alt="preview" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="py-4">
                  <Icon icon="mdi:image-outline" className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-bold text-gray-700 block">Click to upload image</span>
                </div>
              )}
            </div>
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-sm font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 h-12 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-50">
              {submitting ? "Saving..." : "Save Model"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── View Modal ─────────────────────────────────────────── */
function ViewModelModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Model Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
              ) : (
                <Icon icon="mdi:cellphone" className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Model Name</label>
            <p className="text-gray-900 font-medium">{item.name}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Brand</label>
            <p className="text-gray-900">{item.brandId?.name || "—"}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Category</label>
            <p className="text-gray-900">{item.categoryId?.name || "—"}</p>
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
export default function RefurbishedModelsPage() {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "") params.set("isActive", statusFilter);

      const [modelsRes, brandsRes, categoriesRes] = await Promise.all([
        axiosInstance.get(`/admin/refurbish/models?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get("/admin/refurbish/brands?isActive=true", { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get("/admin/refurbish/categories?isActive=true", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setModels(modelsRes.data?.data || []);
      setBrands(brandsRes.data?.data || []);
      setCategories(categoriesRes.data?.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, statusFilter, fetchData]);

  const handleToggleStatus = async (model) => {
    const oldStatus = model.isActive;
    const newStatus = !oldStatus;
    setModels(prev => prev.map(item => item._id === model._id ? { ...item, isActive: newStatus } : item));
    try {
      await axiosInstance.patch(`/admin/refurbish/models/toggle/${model._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Model ${newStatus ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      setModels(prev => prev.map(item => item._id === model._id ? { ...item, isActive: oldStatus } : item));
      toast.error(err?.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/admin/refurbish/models/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Model deleted successfully");
      fetchData();
      setConfirm(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete operation failed");
    } finally {
      setDeleting(false);
    }
  };

  const filteredModels = models.filter(m =>
    (categoryFilter === "" || (m.categoryId && (m.categoryId._id || m.categoryId) === categoryFilter)) &&
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const summaryCardsData = [
    { label: "Total Models", value: filteredModels.length, icon: "mdi:cellphone-link", color: "#6366f1" },
    { label: "Active Models", value: filteredModels.filter(m => m.isActive).length, icon: "mdi:check-circle-outline", color: "#10b981" },
    { label: "Inactive Models", value: filteredModels.filter(m => !m.isActive).length, icon: "mdi:minus-circle-outline", color: "#f59e0b" },
  ];

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map(c => ({ label: c.name, value: c._id }))
  ];

  const columns = [
    {
      key: "name",
      header: "Model",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.imageUrl ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
              <img src={row.imageUrl} alt={row.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <Icon icon="mdi:cellphone" className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <span className="font-extrabold text-gray-800 text-sm">{row.name}</span>
        </div>
      )
    },
    {
      key: "brandId",
      header: "Brand",
      cell: (row) => <span className="font-bold text-gray-700 capitalize">{row.brandId?.name || "—"}</span>
    },
    {
      key: "categoryId",
      header: "Category",
      cell: (row) => <span className="font-bold text-gray-700 capitalize">{row.categoryId?.name || "—"}</span>
    },
    {
      key: "isActive",
      header: "Active",
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-sm ${row.isActive ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 ${row.isActive ? "translate-x-6" : "translate-x-1"}`} />
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
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50 space-y-6">

      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Models</h1>
          <p className="text-gray-500 text-sm mt-1">Manage refurbished device models</p>
        </div>
        <Button onClick={() => setModal({ mode: "create" })} variant="primary" className="h-11">
          <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
          Add Model
        </Button>
      </div>

      <SummaryCards data={summaryCardsData} />

      {/* Filters + Table */}
      <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 w-full">
            <SearchInput placeholder="Search Models..." value={search} onChange={(val) => setSearch(val)} />
          </div>
          {/* Category Filter */}
          <div className="w-full sm:w-52">
            <CustomDropdown
              icon="mdi:shape-outline"
              placeholder="All Categories"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
            />
          </div>
          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <CustomDropdown
              icon="mdi:filter-outline"
              placeholder="All Statuses"
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            />
          </div>
        </div>

        <DataTable data={filteredModels} columns={columns} loading={loading} />
      </div>

      {/* Modal */}
      {modal && modal.mode === "view" ? (
        <ViewModelModal item={modal.item} onClose={() => setModal(null)} />
      ) : modal && (
        <ModelModal
          mode={modal.mode}
          initial={modal.item}
          brandsList={brands}
          categoriesList={categories}
          onClose={() => setModal(null)}
          onSuccess={fetchData}
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.label}"?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
