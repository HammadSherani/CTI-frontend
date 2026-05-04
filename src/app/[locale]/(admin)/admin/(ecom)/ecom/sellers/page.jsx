"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "@/i18n/navigation";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards, { SummaryCardSkeleton } from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import Button from "@/components/partials/admin/ecom/myButton";

function KycBadge({ status }) {
  const map = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
    approved: { bg: "bg-green-100", text: "text-green-700", label: "Approved" },
    rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
    revision: { bg: "bg-blue-100", text: "text-blue-700", label: "Revision" },
  };
  const s = map[status] || { bg: "bg-gray-100", text: "text-gray-600", label: status || "—" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

export default function SellersPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const [sellers, setSellers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  const fetchSellers = useCallback(
    async (currentPage = 1, currentSearch = search, kyc = kycFilter, active = activeFilter) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage, limit: 10 });
        if (currentSearch) params.set("search", currentSearch);
        if (kyc) params.set("kycStatus", kyc);
        if (active !== "") params.set("isActive", active);

        const { data } = await axiosInstance.get(`/admin/e-commerce/seller?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSellers(data.data || []);
        setSummary(data.summary || null);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error("Failed to fetch sellers", err);
      } finally {
        setLoading(false);
      }
    },
    [search, kycFilter, activeFilter, token]
  );

  useEffect(() => {
    fetchSellers(page, search, kycFilter, activeFilter);
  }, [page, kycFilter, activeFilter]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchSellers(1, val, kycFilter, activeFilter);
    }, 400);
  };
const handleToggleActive = async (seller) => {
  setSellers((prev) =>
    prev.map((s) =>
      s._id === seller._id ? { ...s, isActive: !s.isActive } : s
    )
  );

  try {
    // 2. API call
    await axiosInstance.post(
      `/admin/e-commerce/seller/toggle/${seller._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error("Failed to toggle seller status", err);

    // 3. rollback if failed
    setSellers((prev) =>
      prev.map((s) =>
        s._id === seller._id ? { ...s, isActive: seller.isActive } : s
      )
    );
  }
};

  const summaryCards = summary
    ? [
        { label: "Total Sellers", value: summary.total, icon: "mdi:store", color: "#6366f1" },
        { label: "Pending KYC", value: summary.pending, icon: "mdi:clock-outline", color: "#f59e0b" },
        { label: "Approved", value: summary.approved, icon: "mdi:check-circle-outline", color: "#10b981" },
        { label: "Rejected", value: summary.rejected, icon: "mdi:close-circle-outline", color: "#ef4444" },
      ]
    : null;

  const kycOptions = [
    { label: "All Statuses", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Revision", value: "revision" },
  ];

  const activeOptions = [
    { label: "All", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const columns = [
    {
      key: "seller",
      header: "Seller",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {(row.fullName || row.userId?.name || "S")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{row.fullName || row.userId?.name || "—"}</p>
            <p className="text-xs text-gray-400">{row.emailAddress || row.userId?.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "businessName",
      header: "Business",
      cell: (row) => <span className="text-sm text-gray-700">{row.businessName || "—"}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      cell: (row) => <span className="text-sm text-gray-600">{row.phoneNumber || "—"}</span>,
    },
    {
      key: "kycStatus",
      header: "KYC Status",
      cell: (row) => <KycBadge status={row.kycStatus} />,
    },
    {
      key: "isActive",
      header: "Active",
 cell: (row) => (
  <button
    onClick={() => handleToggleActive(row)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200
      ${row.isActive ? "bg-primary-500" : "bg-gray-200"}
    `}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-200
        ${row.isActive ? "translate-x-6" : "translate-x-1"}
      `}
    />
  </button>
),
    },
    {
      key: "createdAt",
      header: "Registered",
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
        <button
          onClick={() => router.push(`/admin/ecom/sellers/${row._id}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-lg hover:bg-primary-100 transition-colors"
        >
          <Icon icon="mdi:eye-outline" className="w-4 h-4" />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage seller KYC, status, and business details</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Icon icon="mdi:store-outline" className="w-4 h-4" />
          <span>Ecom / Sellers</span>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryCards ? <SummaryCards data={summaryCards} /> : <SummaryCardSkeleton />}

      {/* Filters */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name, business, email…"
            />
          </div>
          <div className="w-full sm:w-44">
            <CustomDropdown
              icon="mdi:shield-check-outline"
              placeholder="KYC Status"
              options={kycOptions}
              value={kycFilter}
              onChange={(val) => { setKycFilter(val); setPage(1); }}
            />
          </div>
          <div className="w-full sm:w-36">
            <CustomDropdown
              icon="mdi:toggle-switch-outline"
              placeholder="Activity"
              options={activeOptions}
              value={activeFilter}
              onChange={(val) => { setActiveFilter(val); setPage(1); }}
            />
          </div>
          <div>
              <Button icon="mdi:filter-remove-outline" onClick={() => { setKycFilter(""); setSearch(""); setActiveFilter(""); setPage(1); }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Sellers</h2>
          {pagination && (
            <span className="text-xs text-gray-400">{pagination.totalItems} total</span>
          )}
        </div>
        <DataTable
          data={sellers}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
          emptyIcon="mdi:store-off-outline"
          emptyTitle="No sellers found"
          emptyDescription="No sellers match your current filters."
        />
      </div>
    </div>
  );
}