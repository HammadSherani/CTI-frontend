"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import moment from "moment";

const TABS = [
  { id: "",          label: "All Returns",      icon: "mdi:package-variant-closed-remove" },
  { id: "requested", label: "New Requests",     icon: "mdi:inbox-arrow-down-outline" },
  { id: "shipped",   label: "Shipped Back",     icon: "mdi:truck-delivery-outline" },
  { id: "approved",  label: "Approved",         icon: "mdi:check-circle-outline" },
  { id: "rejected",  label: "Rejected",         icon: "mdi:close-circle-outline" },
];

const STATUS_CFG = {
  requested: { label: "Requested", bg: "bg-blue-100",    text: "text-blue-700"   },
  shipped:   { label: "Shipped",   bg: "bg-amber-100",   text: "text-amber-700"  },
  approved:  { label: "Approved",  bg: "bg-emerald-100", text: "text-emerald-700"},
  rejected:  { label: "Rejected",  bg: "bg-red-100",     text: "text-red-700"    },
};

const PAYMENT_CFG = {
  PENDING:  "bg-yellow-100 text-yellow-700",
  REFUNDED: "bg-emerald-100 text-emerald-700",
  NA:       "bg-gray-100 text-gray-500",
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function DetailModal({ ret, onClose }) {
  return (
    <Modal open={!!ret} onClose={onClose} title="Return Detail" maxWidth="max-w-xl">
      {ret && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Return No",  ret.returnNo],
              ["Order No",   ret.orderNo || "—"],
              ["Customer",   ret.customerName],
              ["Product",    ret.productName],
              ["Barcode",    ret.barcode || "—"],
              ["Price",      `Rs. ${(ret.price || 0).toLocaleString()}`],
              ["Qty",        ret.quantity],
              ["Seller Earnings", `Rs. ${(ret.sellerEarnings || 0).toLocaleString()}`],
              ["Created",    moment(ret.createdAt).format("DD MMM YYYY, hh:mm A")],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
                <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
              </div>
            ))}
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Status</p>
              <StatusBadge status={ret.returnStatus} />
            </div>
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Reason</p>
              <p className="text-gray-700 mt-0.5">{ret.reason}</p>
            </div>
            {ret.adminNotes && (
              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Notes</p>
                <p className="text-gray-700 mt-0.5">{ret.adminNotes}</p>
              </div>
            )}
            {ret.rejectionReason && (
              <div className="col-span-2">
                <p className="text-xs font-bold text-red-400 uppercase">Rejection Reason</p>
                <p className="text-red-600 mt-0.5">{ret.rejectionReason}</p>
              </div>
            )}
          </div>

          {ret.returnStatus === "approved" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Icon icon="mdi:alert-circle-outline" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-bold">Payment Deducted</p>
                <p className="mt-0.5">
                  Rs. {(ret.sellerEarnings || ret.price || 0).toLocaleString()} has been cut from your wallet
                  and moved to admin hold for customer refund.
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Timeline</p>
            <ol className="space-y-2">
              <li className="flex items-center gap-3 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                Requested — {moment(ret.createdAt).format("DD MMM YYYY")}
              </li>
              {ret.shippedAt && (
                <li className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  Shipped — {moment(ret.shippedAt).format("DD MMM YYYY")}
                </li>
              )}
              {ret.approvedAt && (
                <li className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Approved — {moment(ret.approvedAt).format("DD MMM YYYY")}
                </li>
              )}
              {ret.rejectedAt && (
                <li className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  Rejected — {moment(ret.rejectedAt).format("DD MMM YYYY")}
                </li>
              )}
            </ol>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ApproveModal({ ret, onClose, onConfirm, loading }) {
  const [notes, setNotes] = useState("");
  const amountToCut = ret?.sellerEarnings || ret?.price || 0;
  return (
    <Modal open={!!ret} onClose={onClose} title="Approve Return">
      {ret && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-bold flex items-center gap-2">
              <Icon icon="mdi:alert-circle-outline" className="w-5 h-5" />
              Payment will be deducted
            </p>
            <p className="mt-1">
              Approving this return will deduct <strong>Rs. {amountToCut.toLocaleString()}</strong> from
              your wallet balance and move it to admin hold for customer refund.
            </p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any internal notes..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(ret._id, notes)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4 mx-auto" /> : "Confirm Approve"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function RejectModal({ ret, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");
  return (
    <Modal open={!!ret} onClose={onClose} title="Reject Return">
      {ret && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
            Rejecting this return will mark it as <strong>Rejected</strong> and no payment will be cut.
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you are rejecting this return..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(ret._id, reason)}
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4 mx-auto" /> : "Confirm Reject"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function SellerReturnsPage() {
  const { token } = useSelector((s) => s.auth);
  const headers = { Authorization: `Bearer ${token}` };
  const debounceRef = useRef(null);
  const searchParams = useSearchParams();

  const [returns,    setReturns]   = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [page,       setPage]      = useState(1);
  const [pagination, setPagination] = useState(null);
  const [summary,    setSummary]   = useState({ total: 0, requested: 0, shipped: 0, approved: 0, rejected: 0 });
  // Read ?tab= from URL so dashboard "Pending Refunds" link lands on the "New Requests" tab
  const [activeTab,  setActiveTab] = useState(() => {
    const t = searchParams?.get("tab") || "";
    const valid = ["", "requested", "shipped", "approved", "rejected"];
    return valid.includes(t) ? t : "";
  });

  const [viewReturn,    setViewReturn]    = useState(null);
  const [approveReturn, setApproveReturn] = useState(null);
  const [rejectReturn,  setRejectReturn]  = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const emptyFilters = { search: "", dateFrom: "", dateTo: "" };
  const [filters,    setFilters]    = useState(emptyFilters);
  const [debounced,  setDebounced]  = useState(emptyFilters);

  const handleFilterChange = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebounced(filters); setPage(1); }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [filters]);

  const fetchReturns = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (activeTab) params.set("status", activeTab);
      Object.entries(debounced).forEach(([k, v]) => { if (v) params.set(k, v); });

      const { data } = await axiosInstance.get(`/seller/returns?${params}`, { headers });
      setReturns(data.data || []);
      setPagination(data.pagination || null);
      setSummary(data.summary || { total: 0, requested: 0, shipped: 0, approved: 0, rejected: 0 });
    } catch {
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
    }
  }, [token, page, activeTab, debounced]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const handleApprove = async (returnId, adminNotes) => {
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post("/seller/returns/approve", { returnId, adminNotes }, { headers });
      toast.success(data.message || "Return approved");
      setApproveReturn(null);
      fetchReturns();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (returnId, rejectionReason) => {
    setActionLoading(true);
    try {
      await axiosInstance.post("/seller/returns/reject", { returnId, rejectionReason }, { headers });
      toast.success("Return rejected");
      setRejectReturn(null);
      fetchReturns();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: "Return Info",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-900 text-sm">{row.returnNo}</span>
          <span className="text-xs text-gray-500 font-mono">{row.orderNo || "—"}</span>
          <span className="text-[11px] text-gray-400">{moment(row.createdAt).format("DD MMM YYYY")}</span>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (row) => <span className="font-medium text-gray-800 text-sm">{row.customerName}</span>,
    },
    {
      header: "Product / Barcode",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-900 line-clamp-1">{row.productName}</span>
          {row.barcode && <span className="text-[11px] font-mono text-gray-400">{row.barcode}</span>}
        </div>
      ),
    },
    {
      header: "Price / Earnings",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-900 text-sm">Rs. {(row.price || 0).toLocaleString()}</span>
          <span className="text-xs text-amber-600 font-semibold">
            Your cut: Rs. {(row.sellerEarnings || 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={row.returnStatus} />
          {row.returnStatus === "approved" && (
            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
              <Icon icon="mdi:alert-circle-outline" className="w-3 h-3" />
              Payment cut
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Reason",
      cell: (row) => (
        <span className="text-xs text-gray-600 line-clamp-2 max-w-[140px]" title={row.reason}>
          {row.reason}
        </span>
      ),
    },
    {
      header: "Payment",
      cell: (row) => (
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${PAYMENT_CFG[row.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
          {row.paymentStatus}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => {
        const s = row.returnStatus;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setViewReturn(row)}
              className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="View Details"
            >
              <Icon icon="mdi:eye-outline" className="w-4 h-4" />
            </button>
            {(s === "requested" || s === "shipped") && (
              <>
                <button
                  onClick={() => setApproveReturn(row)}
                  className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
                  title="Approve"
                >
                  <Icon icon="mdi:check-circle-outline" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRejectReturn(row)}
                  className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                  title="Reject"
                >
                  <Icon icon="mdi:close-circle-outline" className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const summaryCards = [
    { label: "Total Returns", value: summary.total,     icon: "mdi:package-variant-closed-remove", color: "#6366f1" },
    { label: "New Requests",  value: summary.requested, icon: "mdi:inbox-arrow-down-outline",       color: "#3b82f6" },
    { label: "Approved",      value: summary.approved,  icon: "mdi:check-circle-outline",           color: "#10b981" },
    { label: "Rejected",      value: summary.rejected,  icon: "mdi:close-circle-outline",           color: "#ef4444" },
  ];

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Return Requests</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage customer return requests for your orders</p>
      </div>

      <SummaryCards data={summaryCards} />

      {/* Tabs */}
      <div className="mt-6 flex overflow-x-auto gap-1 pb-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-primary-600 border-t-2 border-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Icon icon={tab.icon} className="w-4 h-4" />
            {tab.label}
            {tab.id === "requested" && summary.requested > 0 && (
              <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                {summary.requested}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text" placeholder="Search return no, order, product, barcode, customer..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Date:</label>
            <input type="date" value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            <span className="text-gray-400">—</span>
            <input type="date" value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
          </div>
          {hasFilters && (
            <button
              onClick={() => setFilters(emptyFilters)}
              className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <DataTable
          columns={columns}
          data={returns}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          emptyIcon="mdi:package-variant-closed-remove"
          emptyTitle="No return requests"
          emptyDescription="No returns match the current filters."
        />
      </div>

      <DetailModal  ret={viewReturn}    onClose={() => setViewReturn(null)} />
      <ApproveModal ret={approveReturn} onClose={() => setApproveReturn(null)} onConfirm={handleApprove} loading={actionLoading} />
      <RejectModal  ret={rejectReturn}  onClose={() => setRejectReturn(null)}  onConfirm={handleReject}  loading={actionLoading} />
    </div>
  );
}
