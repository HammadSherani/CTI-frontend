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
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = async () => {
    if (!window.confirm("Are you sure you want to approve this return and initiate refund?")) return;
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post(
        "/admin/refurbish/returns/approve",
        { returnId: returnRequest._id, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Return request approved & refunded successfully");
        onActionSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve return");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post(
        "/admin/refurbish/returns/reject",
        { returnId: returnRequest._id, rejectionReason: rejectReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Return request rejected");
        onActionSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject return");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post(
        "/admin/refurbish/returns/update-status",
        { returnId: returnRequest._id, status: newStatus, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(`Return status updated to '${newStatus}'`);
        onActionSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update return status");
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = returnRequest.returnStatus === "requested";
  const isShipped = returnRequest.returnStatus === "shipped";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Return Request Detail</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{returnRequest.returnNo || returnRequest._id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[65vh] overflow-y-auto text-xs">
          {/* Info Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
              <p className="font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</p>
              <p className="font-bold text-gray-800 text-sm">
                {returnRequest.customerId?.firstName} {returnRequest.customerId?.lastName}
              </p>
              <p className="text-gray-500 mt-1">{returnRequest.customerId?.email}</p>
              <p className="text-gray-500 mt-0.5">{returnRequest.customerId?.phone}</p>
            </div>
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
              <p className="font-bold text-gray-400 uppercase tracking-wider mb-2">Order Association</p>
              <p className="font-bold text-gray-800 text-sm">
                Order No: <span className="font-mono">{returnRequest.orderId?.orderNo || returnRequest.orderId?._id}</span>
              </p>
              <p className="text-gray-500 mt-1">Requested: {moment(returnRequest.createdAt).format("DD MMM YYYY hh:mm A")}</p>
              <p className="text-gray-500 mt-0.5">Status: <span className="font-bold uppercase text-amber-600">{returnRequest.returnStatus}</span></p>
            </div>
          </div>

          {/* Return items */}
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider mb-3">Returned Items List</p>
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3 text-center">Returned Qty</th>
                    <th className="px-4 py-3">Item Status</th>
                    <th className="px-4 py-3">Return Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {returnRequest.items?.map((item, idx) => {
                    const prod = item.productId || {};
                    return (
                      <tr key={idx} className="hover:bg-gray-50/30">
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {prod.title || item.productName || "Refurbished Device"}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase ${RETURN_STATUS_STYLES[item.itemStatus] || 'bg-gray-100 text-gray-600'}`}>
                            {item.itemStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 italic">"{item.reason || 'No reason provided'}"</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin notes & history */}
          <div className="space-y-4">
            <div>
              <label className="font-bold text-gray-400 uppercase block mb-1.5">Admin Notes (internal only)</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Write internal review notes..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {returnRequest.rejectionReason && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
                <p className="font-bold">Rejection Reason</p>
                <p className="mt-1">"{returnRequest.rejectionReason}"</p>
              </div>
            )}
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <form onSubmit={handleReject} className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
              <div>
                <label className="font-bold text-red-700 block mb-1.5">Rejection Reason *</label>
                <input
                  type="text"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide reason for rejecting the return request..."
                  className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowRejectForm(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold">Confirm Reject</button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {(isPending || isShipped) && !showRejectForm && (
              <>
                {isPending && (
                  <button
                    disabled={submitting}
                    onClick={() => handleUpdateStatus("shipped")}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-100"
                  >
                    Mark Shipped
                  </button>
                )}
                <button
                  disabled={submitting}
                  onClick={handleApprove}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-100"
                >
                  Approve & Refund
                </button>
                <button
                  disabled={submitting}
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-xl transition-all"
                >
                  Reject Return
                </button>
              </>
            )}
          </div>

          <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
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
