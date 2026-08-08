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
import moment from "moment";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Requested", value: "requested" },
  { label: "Shipped Back", value: "shipped" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const RETURN_STATUS_STYLES = {
  requested: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

/* ─── Detail Modal ───────────────────────────────────────── */
function ReturnDetailModal({ returnRequest, onClose, onActionSuccess }) {
  const { token } = useSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState(returnRequest.adminNotes || "");
  const [rejectReason, setRejectReason] = useState("");
  const [activeAction, setActiveAction] = useState(null); // 'reject' | null

  const isPending = returnRequest.returnStatus === "requested";
  const isShipped = returnRequest.returnStatus === "shipped";
  const isSettled = ["approved", "rejected"].includes(returnRequest.returnStatus);
  const canAct    = isPending || isShipped;

  const run = async (fn) => {
    setSubmitting(true);
    try { await fn(); }
    finally { setSubmitting(false); }
  };

  const handleMarkShipped = () => run(async () => {
    const { data } = await axiosInstance.post(
      "/admin/refurbish/returns/update-status",
      { returnId: returnRequest._id, status: "shipped", adminNotes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (data.success) { toast.success("Marked as shipped back"); onActionSuccess(); onClose(); }
  });

  const handleApprove = () => run(async () => {
    const { data } = await axiosInstance.post(
      "/admin/refurbish/returns/approve",
      { returnId: returnRequest._id, adminNotes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (data.success) { toast.success("Return approved & refund initiated"); onActionSuccess(); onClose(); }
  });

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return toast.error("Please enter a rejection reason");
    await run(async () => {
      const { data } = await axiosInstance.post(
        "/admin/refurbish/returns/reject",
        { returnId: returnRequest._id, rejectionReason: rejectReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) { toast.success("Return rejected"); onActionSuccess(); onClose(); }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <Icon icon="solar:refresh-circle-bold" className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base leading-tight">Return Request</h3>
              <p className="text-[10px] text-gray-400 font-mono">{returnRequest.returnNo || returnRequest._id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto text-xs">

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-2">Customer</p>
              <p className="font-bold text-gray-800 text-sm">
                {returnRequest.customerId?.firstName} {returnRequest.customerId?.lastName}
              </p>
              <p className="text-gray-500 mt-0.5">{returnRequest.customerId?.email}</p>
              {returnRequest.customerId?.phone && (
                <p className="text-gray-500 mt-0.5">{returnRequest.customerId?.phone}</p>
              )}
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-2">Order Info</p>
              <p className="font-bold text-gray-800 text-sm font-mono">
                {returnRequest.orderId?.orderNo || "—"}
              </p>
              <p className="text-gray-500 mt-0.5">
                {moment(returnRequest.createdAt).format("DD MMM YYYY, hh:mm A")}
              </p>
              <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${RETURN_STATUS_STYLES[returnRequest.returnStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {returnRequest.returnStatus}
              </span>
            </div>
          </div>

          {/* Items table */}
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-2">Returned Items</p>
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5">Product</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {returnRequest.items?.map((item, idx) => {
                    const prod = item.productId || {};
                    return (
                      <tr key={idx} className="hover:bg-gray-50/40">
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {prod.title || item.productName || "Refurbished Device"}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-500 italic">
                          {item.reason || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin notes */}
          <div>
            <label className="font-bold text-gray-400 uppercase text-[10px] tracking-wider block mb-1.5">
              Internal Admin Notes
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Optional internal note..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-primary-500 text-xs"
            />
          </div>

          {/* Rejection reason (settled) */}
          {returnRequest.rejectionReason && (
            <div className="flex gap-3 bg-red-50 border border-red-100 text-red-700 p-3 rounded-2xl">
              <Icon icon="solar:close-circle-bold" className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-xs">Rejection Reason</p>
                <p className="mt-0.5 text-red-600">"{returnRequest.rejectionReason}"</p>
              </div>
            </div>
          )}

          {/* ── Action Panel (only when actionable) ── */}
          {canAct && !isSettled && (
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Take Action</p>
              </div>

              {activeAction === null && (
                <div className="p-4 grid gap-2.5">
                  {isPending && (
                    <button
                      disabled={submitting}
                      onClick={handleMarkShipped}
                      className="group w-full flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-left disabled:opacity-60"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Icon icon="solar:delivery-bold" className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-700 text-xs">Mark as Shipped Back</p>
                        <p className="text-amber-600/70 text-[10px]">Customer has sent the item back to you</p>
                      </div>
                      {submitting && <Icon icon="mdi:loading" className="animate-spin ml-auto text-amber-500" />}
                    </button>
                  )}

                  <button
                    disabled={submitting}
                    onClick={handleApprove}
                    className="group w-full flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left disabled:opacity-60"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-700 text-xs">Approve & Issue Refund</p>
                      <p className="text-emerald-600/70 text-[10px]">Accept the return and refund the customer</p>
                    </div>
                    {submitting && <Icon icon="mdi:loading" className="animate-spin ml-auto text-emerald-500" />}
                  </button>

                  <button
                    onClick={() => setActiveAction("reject")}
                    className="group w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon icon="solar:close-circle-bold" className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-600 group-hover:text-red-600 text-xs transition-colors">Reject Return</p>
                      <p className="text-gray-400 text-[10px]">Deny the return request with a reason</p>
                    </div>
                  </button>
                </div>
              )}

              {activeAction === "reject" && (
                <form onSubmit={handleReject} className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => setActiveAction(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Icon icon="solar:arrow-left-linear" className="w-4 h-4" />
                    </button>
                    <p className="font-bold text-red-600 text-xs">Provide Rejection Reason</p>
                  </div>
                  <input
                    type="text"
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Why are you rejecting this return?"
                    className="w-full px-3 py-2.5 bg-white border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-400 text-xs"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveAction(null)}
                      className="px-4 py-2 text-xs border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {submitting && <Icon icon="mdi:loading" className="animate-spin w-3.5 h-3.5" />}
                      Confirm Rejection
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {isSettled && (
            <div className={`flex items-center gap-3 p-3 rounded-2xl ${returnRequest.returnStatus === 'approved' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-gray-50 border border-gray-100 text-gray-600'}`}>
              <Icon icon={returnRequest.returnStatus === 'approved' ? "solar:check-circle-bold" : "solar:close-circle-bold"} className="w-4 h-4 flex-shrink-0" />
              <p className="font-bold text-xs">
                This return has been <span className="uppercase">{returnRequest.returnStatus}</span>. No further actions available.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function RefurbishedReturnsPage() {
  const { token } = useSelector((state) => state.auth);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [summary, setSummary] = useState({ total: 0, requested: 0, shipped: 0, approved: 0, rejected: 0 });
  const [activeReturn, setActiveReturn] = useState(null);

  const fetchReturns = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/admin/refurbish/returns", {
        params: { page, limit: 12, search: search.trim() || undefined, status: status || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setReturns(data.data || []);
        setPagination(data.pagination || { totalPages: 1, totalItems: 0 });
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      toast.error("Failed to load refurbished returns");
    } finally {
      setLoading(false);
    }
  }, [token, page, search, status]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const columns = [
    {
      header: "Return No",
      accessor: (row) => (
        <span className="font-mono font-bold text-gray-800 text-xs">
          {row.returnNo || row._id}
        </span>
      ),
    },
    {
      header: "Order No",
      accessor: (row) => (
        <span className="font-mono text-gray-500 text-xs">
          {row.orderId?.orderNo || "—"}
        </span>
      ),
    },
    {
      header: "Customer",
      accessor: (row) => (
        <div>
          <p className="font-bold text-gray-800 text-xs">
            {row.customerId?.firstName} {row.customerId?.lastName}
          </p>
          <p className="text-[10px] text-gray-400">{row.customerId?.email}</p>
        </div>
      ),
    },
    {
      header: "Items",
      accessor: (row) => (
        <span className="font-semibold text-gray-700 text-xs">
          {row.items?.length || 0} item(s)
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => {
        const cls = RETURN_STATUS_STYLES[row.returnStatus] || "bg-gray-50 text-gray-600 border-gray-200";
        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${cls}`}>
            {row.returnStatus}
          </span>
        );
      },
    },
    {
      header: "Date",
      accessor: (row) => (
        <p className="text-gray-500 text-xs">
          {moment(row.createdAt).format("DD MMM YYYY")}
        </p>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <button
          onClick={() => setActiveReturn(row)}
          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-bold transition-colors"
        >
          <Icon icon="solar:eye-bold" className="w-4 h-4" />
          Review Request
        </button>
      ),
    },
  ];

  const cards = [
    { title: "Total Returns", count: summary.total, icon: "solar:refresh-circle-linear", color: "border-l-4 border-l-blue-500" },
    { title: "Requested", count: summary.requested, icon: "solar:clock-circle-linear", color: "border-l-4 border-l-orange-500" },
    { title: "Shipped Back", count: summary.shipped, icon: "solar:delivery-linear", color: "border-l-4 border-l-violet-500" },
    { title: "Approved / Refunded", count: summary.approved, icon: "solar:check-circle-linear", color: "border-l-4 border-l-emerald-500" },
    { title: "Rejected Requests", count: summary.rejected, icon: "solar:close-circle-linear", color: "border-l-4 border-l-red-500" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Refurbished Device Returns</h1>
          <p className="text-xs text-gray-400 mt-1">Review customer return requests and issue partial or full refunds</p>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards cards={cards} />

      {/* Filters Row */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by Return ID or Order ID..." />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="w-44">
            <CustomDropdown
              icon="mdi:filter-variant"
              placeholder="Filter Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(val) => { setStatus(val); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Icon icon="mdi:loading" className="animate-spin text-3xl text-primary-500 mb-2" />
            <p className="text-xs text-gray-400">Loading returns...</p>
          </div>
        ) : (
          <DataTable
            data={returns}
            columns={columns}
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      {activeReturn && (
        <ReturnDetailModal
          returnRequest={activeReturn}
          onClose={() => setActiveReturn(null)}
          onActionSuccess={fetchReturns}
        />
      )}
    </div>
  );
}
