"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

/* ─── Brand Modal ────────────────────────────────────────── */
function BrandModal({ mode, initial, categoriesList, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    categoryId: initial?.categories?.[0]?._id || initial?.categories?.[0] || "",
    logo: null,
  });
  const [preview, setPreview] = useState(initial?.logoUrl || null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Brand name is required";
    if (!form.categoryId) e.categoryId = "Please select a category";
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
      fd.append("categories", JSON.stringify([form.categoryId]));

      if (form.logo instanceof File) {
        fd.append("image", form.logo);
      }

      if (mode === "create") {
        await axiosInstance.post("/admin/refurbish/brands", fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Brand created successfully");
      } else {
        await axiosInstance.put(`/admin/refurbish/brands/${initial._id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
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
      setForm((p) => ({ ...p, logo: file }));
      setPreview(URL.createObjectURL(file));
      setErrors((p) => ({ ...p, logo: "" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Add New Brand" : "Edit Brand"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className={`w-full h-12 px-4 rounded-2xl border focus:outline-none focus:border-primary-500 bg-white ${errors.categoryId ? "border-red-400" : "border-gray-200"}`}
            >
              <option value="">Choose Category</option>
              {categoriesList.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Apple, Samsung"
              className={`w-full h-12 px-4 rounded-2xl border focus:outline-none focus:border-primary-500 ${errors.name ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById("logo-upload").click()}
            >
              <input
                id="logo-upload"
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
                  <Icon icon="mdi:tag-outline" className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-bold text-gray-700 block">Click to upload brand logo</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-sm font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 h-12 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-50">
              {submitting ? "Saving..." : "Save Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── View Modal ─────────────────────────────────────────── */
function ViewBrandModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Brand Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
              {item.logoUrl ? (
                <img src={item.logoUrl} alt={item.name} className="w-full h-full object-contain" />
              ) : (
                <Icon icon="mdi:tag-outline" className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Brand Name</label>
            <p className="text-gray-900 font-medium">{item.name}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Associated Category</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {item.categories?.map((cat) => (
                <span key={cat._id} className="text-[10px] font-bold bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                  {cat.name}
                </span>
              ))}
            </div>
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
export default function RefurbishedBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { token } = useSelector((state) => state.auth);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "") params.set("isActive", statusFilter);

      const [brandsRes, categoriesRes] = await Promise.all([
        axiosInstance.get(`/admin/refurbish/brands?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get("/admin/refurbish/categories", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBrands(brandsRes.data?.data || []);
      setCategories(categoriesRes.data?.data || []);
    } catch (err) {
      toast.error("Failed to load brands or categories");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, statusFilter, fetchData]);

  const handleToggleStatus = async (brand) => {
    const oldStatus = brand.isActive;
    const newStatus = !oldStatus;

    setBrands(prev =>
      prev.map(item =>
        item._id === brand._id ? { ...item, isActive: newStatus } : item
      )
    );

    try {
      await axiosInstance.patch(
        `/admin/refurbish/brands/toggle/${brand._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Brand ${newStatus ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      setBrands(prev =>
        prev.map(item =>
          item._id === brand._id ? { ...item, isActive: oldStatus } : item
        )
      );
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/refurbish/brands/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Brand deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Delete operation failed");
    } finally {
      setConfirm(null);
    }
  };

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const summaryCardsData = [
    { label: "Total Brands", value: brands.length, icon: "mdi:tag-outline", color: "#6366f1" },
    { label: "Active Brands", value: brands.filter(b => b.isActive).length, icon: "mdi:check-circle-outline", color: "#10b981" },
    { label: "Inactive Brands", value: brands.filter(b => !b.isActive).length, icon: "mdi:minus-circle-outline", color: "#f59e0b" },
  ];

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const columns = [
    {
      key: "name",
      header: "Brand",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.logoUrl ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
              <img src={row.logoUrl} alt={row.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <Icon icon="mdi:tag-outline" className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div>
            <span className="font-extrabold text-gray-800 text-sm block">{row.name}</span>
          </div>
        </div>
      )
    },
    {
      key: "categories",
      header: "Category",
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.categories?.map((cat) => (
            <span key={cat._id} className="text-[10px] font-bold bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
              {cat.name}
            </span>
          ))}
          {(!row.categories || row.categories.length === 0) && (
            <span className="text-xs text-gray-400">None</span>
          )}
        </div>
      )
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
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50 space-y-6">

      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Brands</h1>
          <p className="text-gray-500 text-sm mt-1">Manage refurbished device brands</p>
        </div>
        <Button onClick={() => setModal({ mode: "create" })} variant="primary" className="h-11">
          <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
          Add Brand
        </Button>
      </div>

      <SummaryCards data={summaryCardsData} />

      {/* Filters block */}
      <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchInput placeholder="Search Brands..." value={search} onChange={(val) => setSearch(val)} />
          </div>
          <div className="w-full sm:w-48">
            <CustomDropdown icon="mdi:filter-outline" placeholder="Status" options={statusOptions} value={statusFilter} onChange={(val) => setStatusFilter(val)} />
          </div>
        </div>

        {/* Data Table */}
        <DataTable data={filteredBrands} columns={columns} loading={loading} />
      </div>

      {/* Modal */}
      {modal && modal.mode === "view" ? (
        <ViewBrandModal item={modal.item} onClose={() => setModal(null)} />
      ) : modal && (
        <BrandModal
          mode={modal.mode}
          initial={modal.item}
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
        />
      )}
    </div>
  );
}
