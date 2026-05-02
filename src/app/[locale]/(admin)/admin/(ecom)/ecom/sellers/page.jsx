"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards, { SummaryCardSkeleton } from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import { State } from "country-state-city";

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
            icon={
              t.type === "success"
                ? "mdi:check-circle"
                : t.type === "error"
                  ? "mdi:alert-circle"
                  : "mdi:information"
            }
            className="w-5 h-5 shrink-0"
          />
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─── KYC Status Badge ───────────────────────────────────── */
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

/* ─── Detail Modal ───────────────────────────────────────── */
function SellerDetailModal({ seller, onClose, onKycUpdate, addToast }) {
  const [kycStatus, setKycStatus] = useState(seller.kycStatus || "pending");
  const [kycReason, setKycReason] = useState(seller.kycReason || "");
  const [submitting, setSubmitting] = useState(false);
  const needsReason = kycStatus === "rejected" || kycStatus === "revision";

  const handleSubmit = async () => {
    if (needsReason && !kycReason.trim()) {
      addToast("Reason is required for rejected / revision.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post(`/admin/e-commerce/seller/kyc/${seller._id}`, {
        kycStatus,
        kycReason: needsReason ? kycReason : undefined,
      });
      addToast(`KYC status updated to ${kycStatus}`, "success");
      onKycUpdate();
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update KYC", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const doc = (label, url) =>
    url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
      >
        <Icon icon="mdi:file-document-outline" className="w-4 h-4" />
        {label}
      </a>
    ) : (
      <span className="text-sm text-gray-400 italic">Not uploaded</span>
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
              {(seller.fullName || seller.userId?.name || "S")[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{seller.fullName || seller.userId?.name || "—"}</h2>
              <p className="text-xs text-gray-500">{seller.businessName || "—"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Info</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Full Name", seller.fullName],
                ["Email", seller.emailAddress || seller.userId?.email],
                ["Phone", seller.phoneNumber],
                ["Gender", seller.gender],
                ["DOB", seller.dob ? new Date(seller.dob).toLocaleDateString() : null],
                ["Store Address", seller.storeAddress],
                ["Zip Code", seller.zipCode],
                ["Country", seller.country?.name],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{val || "—"}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Business Info */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Business Info</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Business Name", seller.businessName],
                ["National ID / Tax No", seller.nationalIdOrTaxNumber],
                ["Shipping Method", seller.shippingMethod],
                ["Refurbished Devices", seller.sellsRefurbishedDevices ? "Yes" : "No"],
                ["Working Days", seller.workingDays?.join(", ")],
                ["Working Hours", seller.workingHours ? `${seller.workingHours.start} – ${seller.workingHours.end}` : null],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{val || "—"}</p>
                </div>
              ))}
            </div>
            {seller.storeDescription && (
              <div className="mt-3">
                <p className="text-xs text-gray-400">Store Description</p>
                <p className="text-sm text-gray-700 mt-0.5">{seller.storeDescription}</p>
              </div>
            )}
          </section>

          {/* Documents */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Profile / Logo</p>
                {seller.profilePictureOrLogo ? (
                  <img src={seller.profilePictureOrLogo} alt="logo" className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                ) : (
                  <span className="text-sm text-gray-400 italic">Not uploaded</span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">National ID / Passport</p>
                {doc("View Document", seller.nationalIdOrPassport)}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Shop License / Tax Certificate</p>
                {doc("View Document", seller.shopLicenseOrTaxCertificate)}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Proof of Address</p>
                {doc("View Document", seller.proofOfAddress)}
              </div>
            </div>
          </section>

          {/* Bank Details */}
          {seller.bankDetails && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Account Title", seller.bankDetails.accountTitle],
                  ["Account Number", seller.bankDetails.accountNumber],
                  ["Bank Name", seller.bankDetails.bankName],
                  ["Branch Name", seller.bankDetails.branchName],
                  ["IBAN", seller.bankDetails.iban],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{val || "—"}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* KYC Action */}
          <section className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Icon icon="mdi:shield-check-outline" className="w-4 h-4" />
              KYC Review
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Update KYC Status</label>
                <select
                  value={kycStatus}
                  onChange={(e) => setKycStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary-400"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="revision">Request Revision</option>
                </select>
              </div>
              {needsReason && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Reason *</label>
                  <input
                    value={kycReason}
                    onChange={(e) => setKycReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {submitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
              {submitting ? "Saving…" : "Update KYC Status"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const debounceRef = useRef(null);
  const { token } = useSelector((state) => state.auth)
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const fetchSellers = useCallback(async (currentPage = 1, currentSearch = search, kyc = kycFilter, active = activeFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (currentSearch) params.set("search", currentSearch);
      if (kyc) params.set("kycStatus", kyc);
      if (active !== "") params.set("isActive", active);

      const { data } = await axiosInstance.get(`/admin/e-commerce/seller?${params}`, token);
      setSellers(data.data || []);
      setSummary(data.summary || null);
      setPagination(data.pagination || null);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to fetch sellers", "error");
    } finally {
      setLoading(false);
    }
  }, [search, kycFilter, activeFilter, addToast]);

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
    try {
      await axiosInstance.post(`/admin/e-commerce/seller/toggle/${seller._id}`);
      addToast(`Seller ${seller.isActive ? "deactivated" : "activated"}`, "success");
      fetchSellers(page, search, kycFilter, activeFilter);
    } catch (err) {
      addToast("Failed to update status", "error");
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
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${row.isActive ? "bg-green-500" : "bg-gray-200"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
              ${row.isActive ? "translate-x-6" : "translate-x-1"}`}
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
          onClick={() => setSelectedSeller(row)}
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
      <Toast toasts={toasts} />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage seller KYC, status, and business details</p>
      </div>

      {/* Summary cards */}
      {summaryCards ? (
        <SummaryCards data={summaryCards} />
      ) : (
        <SummaryCardSkeleton />
      )}

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
        </div>
      </div>

      {/* Data table */}
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

      {/* Detail Modal */}
      {selectedSeller && (
        <SellerDetailModal
          seller={selectedSeller}
          onClose={() => setSelectedSeller(null)}
          onKycUpdate={() => fetchSellers(page, search, kycFilter, activeFilter)}
          addToast={addToast}
        />
      )}
    </div>
  );
}
