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
import { useRouter } from '@/i18n/navigation';

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

/* ─── Status Badge ───────────────────────────────────────── */
function StatusBadge({ deal }) {
  const now = new Date();
  const start = new Date(deal.startDate);
  const end = new Date(deal.endDate);

  let status, color, icon;

  if (!deal.isActive) {
    status = "Inactive";
    color = "bg-gray-100 text-gray-600";
    icon = "mdi:pause-circle-outline";
  } else if (now < start) {
    status = "Upcoming";
    color = "bg-blue-50 text-blue-600";
    icon = "mdi:clock-outline";
  } else if (now >= start && now <= end) {
    status = "Active";
    color = "bg-emerald-50 text-emerald-600";
    icon = "mdi:check-circle-outline";
  } else {
    status = "Expired";
    color = "bg-red-50 text-red-600";
    icon = "mdi:close-circle-outline";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
      <Icon icon={icon} className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function FlashDealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirm, setConfirm] = useState(null);
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "") params.set("isActive", statusFilter);
      const { data } = await axiosInstance.get(`/admin/refurbish/flash-deals?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals(data.data || []);
    } catch {
      toast.error("Failed to load flash deals");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => { if (token) fetchDeals(); }, [token, statusFilter, fetchDeals]);

  const handleToggleStatus = async (deal) => {
    const old = deal.isActive;
    setDeals((p) => p.map((x) => x._id === deal._id ? { ...x, isActive: !old } : x));
    try {
      await axiosInstance.patch(`/admin/refurbish/flash-deals/toggle/${deal._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Deal ${!old ? "activated" : "deactivated"}`);
    } catch {
      setDeals((p) => p.map((x) => x._id === deal._id ? { ...x, isActive: old } : x));
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/refurbish/flash-deals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Flash Deal deleted");
      fetchDeals();
    } catch {
      toast.error("Delete failed");
    } finally {
      setConfirm(null);
    }
  };

  const getStatus = (deal) => {
    if (!deal.isActive) return "inactive";
    const now = new Date();
    const start = new Date(deal.startDate);
    const end = new Date(deal.endDate);
    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "active";
    return "expired";
  };

  const filtered = deals.filter((d) => {
    const name = `${d.title || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const summaryCards = [
    { label: "Total Deals", value: deals.length, icon: "mdi:flash", color: "#6366f1" },
    { label: "Active", value: deals.filter((d) => getStatus(d) === "active").length, icon: "mdi:check-circle-outline", color: "#10b981" },
    { label: "Upcoming", value: deals.filter((d) => getStatus(d) === "upcoming").length, icon: "mdi:clock-outline", color: "#3b82f6" },
    { label: "Expired", value: deals.filter((d) => getStatus(d) === "expired").length, icon: "mdi:close-circle-outline", color: "#ef4444" },
  ];

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const columns = [
    {
      key: "deal",
      header: "Deal",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Icon icon="mdi:flash" className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm line-clamp-1">{row.title || "—"}</p>
            <p className="text-xs text-gray-400">{row.products?.length || 0} products</p>
          </div>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      cell: (row) => (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 font-bold text-sm border border-emerald-200/50">
          <Icon icon="mdi:percent-outline" className="w-4 h-4" />
          {row.discountPercentage}% OFF
        </span>
      ),
    },
    {
      key: "dates",
      header: "Duration",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">{formatDate(row.startDate)}</span>
          <span className="text-xs text-gray-400">to {formatDate(row.endDate)}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge deal={row} />,
    },
    {
      key: "isActive",
      header: "Active",
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${row.isActive ? "bg-green-500" : "bg-gray-300"}`}
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
          <button onClick={() => router.push(`/admin/refurbished/flash-deals/edit/${row._id}`)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600" title="Edit">
            <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirm({ id: row._id, label: row.title })} className="p-2 hover:bg-red-50 rounded-xl text-red-600" title="Delete">
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
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            <Icon icon="mdi:flash" className="w-8 h-8 text-amber-500" />
            Flash Deals
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage flash deal campaigns with product discounts</p>
        </div>
        <Button onClick={() => router.push("/admin/refurbished/flash-deals/create")} variant="primary" className="h-11">
          <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
          Create Flash Deal
        </Button>
      </div>

      <SummaryCards data={summaryCards} />

      <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Search deals by name..." />
          </div>
          <div className="w-full sm:w-48">
            <CustomDropdown icon="mdi:filter-outline" placeholder="Status" options={statusOptions} value={statusFilter} onChange={(v) => setStatusFilter(v)} />
          </div>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          loading={loading}
          emptyIcon="mdi:flash-off"
          emptyTitle="No flash deals found"
          emptyDescription="Create your first flash deal to get started"
        />
      </div>

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
