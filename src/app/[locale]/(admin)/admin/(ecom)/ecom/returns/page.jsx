"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import moment from "moment";

// ─── Config ──────────────────────────────────────────────────────────────────

const RETURN_TABS = [
  { id: "",          label: "All Returns",        icon: "mdi:package-variant-closed-remove" },
  { id: "requested", label: "Return Requests",    icon: "mdi:inbox-arrow-down-outline" },
  { id: "shipped",   label: "Shipped Returns",    icon: "mdi:truck-delivery-outline" },
  { id: "approved",  label: "Approved Returns",   icon: "mdi:check-circle-outline" },
  { id: "rejected",  label: "Rejected Returns",   icon: "mdi:close-circle-outline" },
  { id: "__cr__",    label: "Customer Requests",  icon: "mdi:message-text-outline" },
];

const RETURN_STATUS_CONFIG = {
  requested: { label: "Requested", bg: "bg-blue-100",    text: "text-blue-700"   },
  shipped:   { label: "Shipped",   bg: "bg-amber-100",   text: "text-amber-700"  },
  approved:  { label: "Approved",  bg: "bg-emerald-100", text: "text-emerald-700"},
  rejected:  { label: "Rejected",  bg: "bg-red-100",     text: "text-red-700"    },
};

const REQUEST_STATUS_CONFIG = {
  under_review: { label: "Under Review", bg: "bg-sky-100",     text: "text-sky-700"     },
  in_progress:  { label: "In Progress",  bg: "bg-amber-100",   text: "text-amber-700"   },
  resolved:     { label: "Resolved",     bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected:     { label: "Rejected",     bg: "bg-red-100",     text: "text-red-700"     },
};

const PAYMENT_BADGE = {
  PENDING:  "bg-yellow-100 text-yellow-700",
  REFUNDED: "bg-emerald-100 text-emerald-700",
  NA:       "bg-gray-100 text-gray-600",
};

const FLOW_TYPE_LABELS = {
  return:    "Return",
  refund:    "Refund",
  complaint: "Complaint",
  inquiry:   "Inquiry",
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, config }) {
  const cfg = config[status] || { label: status, bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Filter Bar (Returns) ──────────────────────────────────────────────────────

function ReturnFilters({ filters, onChange, onClear }) {
  const has = Object.values(filters).some(Boolean);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search return no, order, product, barcode, customer..."
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Date:</label>
          <input type="date" value={filters.dateFrom} onChange={(e) => onChange("dateFrom", e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
          <span className="text-gray-400">—</span>
          <input type="date" value={filters.dateTo} onChange={(e) => onChange("dateTo", e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
        </div>
        {has && (
          <button onClick={onClear} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Filter Bar (Customer Requests) ───────────────────────────────────────────

function RequestFilters({ filters, onChange, onClear }) {
  const has = Object.values(filters).some(Boolean);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search request no, order, customer, subject..."
            value={filters.search} onChange={(e) => onChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={filters.flowType} onChange={(e) => onChange("flowType", e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none w-full sm:w-40">
          <option value="">All Types</option>
          <option value="return">Return</option>
          <option value="refund">Refund</option>
          <option value="complaint">Complaint</option>
          <option value="inquiry">Inquiry</option>
        </select>
        <select value={filters.situationStatus} onChange={(e) => onChange("situationStatus", e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none w-full sm:w-40">
          <option value="">All Statuses</option>
          <option value="under_review">Under Review</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Date:</label>
          <input type="date" value={filters.dateFrom} onChange={(e) => onChange("dateFrom", e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
          <span className="text-gray-400">—</span>
          <input type="date" value={filters.dateTo} onChange={(e) => onChange("dateTo", e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
        </div>
        {has && (
          <button onClick={onClear} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Return Detail Modal ───────────────────────────────────────────────────────

function ReturnDetailModal({ ret, onClose }) {
  return (
    <Modal open={!!ret} onClose={onClose} title="Return Detail" maxWidth="max-w-2xl">
      {ret && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Return No",    ret.returnNo],
              ["Order No",     ret.orderNo || "—"],
              ["Customer",     ret.customerName],
              ["Product",      ret.productName],
              ["Barcode",      ret.barcode || "—"],
              ["Price",        `Rs. ${(ret.price || 0).toLocaleString()}`],
              ["Qty",          ret.quantity],
              ["Tracking",     ret.trackingNumber || "—"],
              ["Payment",      ret.paymentStatus],
              ["Created",      moment(ret.createdAt).format("DD MMM YYYY, hh:mm A")],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
                <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
              </div>
            ))}
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
              <div className="mt-1">
                <StatusBadge status={ret.returnStatus} config={RETURN_STATUS_CONFIG} />
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Reason</p>
              <p className="text-gray-700 mt-0.5">{ret.reason}</p>
            </div>
            {ret.adminNotes && (
              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Admin Notes</p>
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

          {/* Timeline */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Timeline</p>
            <ol className="space-y-2">
              <li className="flex items-center gap-3 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span>Requested — {moment(ret.createdAt).format("DD MMM YYYY")}</span>
              </li>
              {ret.shippedAt && (
                <li className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Shipped — {moment(ret.shippedAt).format("DD MMM YYYY")}</span>
                </li>
              )}
              {ret.approvedAt && (
                <li className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Approved — {moment(ret.approvedAt).format("DD MMM YYYY")}</span>
                </li>
              )}
              {ret.rejectedAt && (
                <li className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span>Rejected — {moment(ret.rejectedAt).format("DD MMM YYYY")}</span>
                </li>
              )}
            </ol>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Approve Modal ────────────────────────────────────────────────────────────

function ApproveModal({ ret, onClose, onConfirm, loading }) {
  const [notes, setNotes] = useState("");
  return (
    <Modal open={!!ret} onClose={onClose} title="Approve Return">
      {ret && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
            Approving <strong>{ret.returnNo}</strong> will mark the payment as <strong>REFUNDED</strong>.
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Admin Notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any internal notes..."
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

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({ ret, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");
  return (
    <Modal open={!!ret} onClose={onClose} title="Reject Return">
      {ret && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
            Rejecting <strong>{ret.returnNo}</strong> — the refund will be marked <strong>NA</strong>.
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Rejection Reason <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this return is being rejected..."
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

// ─── Customer Request Detail Modal ────────────────────────────────────────────

function RequestDetailModal({ request, onClose, onReply, onStatusUpdate, loading }) {
  const [reply, setReply]   = useState("");
  const [status, setStatus] = useState(request?.situationStatus || "");

  useEffect(() => { setStatus(request?.situationStatus || ""); }, [request]);

  return (
    <Modal open={!!request} onClose={onClose} title="Customer Request Detail" maxWidth="max-w-2xl">
      {request && (
        <div className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Request No",  request.requestNo],
              ["Order No",    request.orderNo || "—"],
              ["Customer",    request.customerName],
              ["Flow Type",   FLOW_TYPE_LABELS[request.flowType] || request.flowType],
              ["Created",     moment(request.createdAt).format("DD MMM YYYY, hh:mm A")],
              ["Resolved",    request.resolvedAt ? moment(request.resolvedAt).format("DD MMM YYYY") : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
                <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
              </div>
            ))}
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Subject</p>
              <p className="text-gray-800 font-semibold mt-0.5">{request.subject}</p>
            </div>
            {request.notes && (
              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Notes</p>
                <p className="text-gray-700 mt-0.5">{request.notes}</p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Status</p>
              <StatusBadge status={request.situationStatus} config={REQUEST_STATUS_CONFIG} />
            </div>
          </div>

          {/* Update status */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Update Status</p>
            <div className="flex gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
              >
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => onStatusUpdate(request._id, status)}
                disabled={loading || status === request.situationStatus}
                className="px-4 py-2 bg-primary-600 text-white font-bold rounded-xl text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>

          {/* Replies */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Conversation ({request.replies?.length || 0})</p>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {(request.replies || []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No replies yet.</p>
              )}
              {(request.replies || []).map((r, i) => (
                <div key={i} className={`rounded-xl p-3 text-sm ${r.from === "admin" ? "bg-primary-50 border border-primary-100 ml-4" : "bg-gray-50 border border-gray-100 mr-4"}`}>
                  <p className="font-bold text-xs text-gray-500 mb-1">{r.senderName || (r.from === "admin" ? "Admin" : "Customer")} — {moment(r.createdAt).format("DD MMM, hh:mm A")}</p>
                  <p className="text-gray-800">{r.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reply box */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Add Reply</p>
            <textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-primary-400"
            />
            <button
              onClick={() => { onReply(request._id, reply); setReply(""); }}
              disabled={loading || !reply.trim()}
              className="mt-2 w-full px-4 py-2.5 bg-primary-600 text-white font-bold rounded-xl text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4 mx-auto" /> : "Send Reply"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Create Return Modal ───────────────────────────────────────────────────────

function CreateReturnModal({ open, onClose, onSubmit, loading }) {
  const empty = { orderNo: "", customerName: "", productName: "", barcode: "", price: "", quantity: "1", reason: "" };
  const [form, setForm] = useState(empty);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.customerName || !form.productName || !form.price || !form.reason) {
      toast.warn("Fill in all required fields");
      return;
    }
    onSubmit({ ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) || 1 });
  };

  useEffect(() => { if (!open) setForm(empty); }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Create Return" maxWidth="max-w-xl">
      <div className="space-y-3">
        {[
          { key: "orderNo",      label: "Order No",       req: false, type: "text" },
          { key: "customerName", label: "Customer Name",  req: true,  type: "text" },
          { key: "productName",  label: "Product Name",   req: true,  type: "text" },
          { key: "barcode",      label: "Barcode",        req: false, type: "text" },
          { key: "price",        label: "Price (Rs.)",    req: true,  type: "number" },
          { key: "quantity",     label: "Quantity",       req: false, type: "number" },
        ].map(({ key, label, req, type }) => (
          <div key={key}>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
              {label} {req && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        ))}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={form.reason}
            onChange={(e) => set("reason", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4 mx-auto" /> : "Create Return"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminReturnsPage() {
  const { token } = useSelector((s) => s.auth);
  const headers = { Authorization: `Bearer ${token}` };
  const debounceRef = useRef(null);

  // Tab
  const [activeTab, setActiveTab] = useState("");
  const isRequestTab = activeTab === "__cr__";

  // Data
  const [returns,   setReturns]   = useState([]);
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [pagination, setPagination] = useState(null);
  const [returnSummary,  setReturnSummary]  = useState({ total: 0, requested: 0, shipped: 0, approved: 0, rejected: 0 });
  const [requestSummary, setRequestSummary] = useState({ total: 0, under_review: 0, in_progress: 0, resolved: 0, rejected: 0 });

  // Modal state
  const [viewReturn,    setViewReturn]    = useState(null);
  const [approveReturn, setApproveReturn] = useState(null);
  const [rejectReturn,  setRejectReturn]  = useState(null);
  const [viewRequest,   setViewRequest]   = useState(null);
  const [showCreate,    setShowCreate]    = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const emptyReturnFilters  = { search: "", dateFrom: "", dateTo: "" };
  const emptyRequestFilters = { search: "", flowType: "", situationStatus: "", dateFrom: "", dateTo: "" };

  const [returnFilters,  setReturnFilters]  = useState(emptyReturnFilters);
  const [requestFilters, setRequestFilters] = useState(emptyRequestFilters);
  const [dReturnF,  setDReturnF]  = useState(emptyReturnFilters);
  const [dRequestF, setDRequestF] = useState(emptyRequestFilters);

  // Debounce filter changes
  const handleReturnFilterChange = (key, value) => {
    setReturnFilters((p) => ({ ...p, [key]: value }));
  };
  const handleRequestFilterChange = (key, value) => {
    setRequestFilters((p) => ({ ...p, [key]: value }));
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDReturnF(returnFilters); setPage(1); }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [returnFilters]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDRequestF(requestFilters); setPage(1); }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [requestFilters]);

  // ── Fetch returns ────────────────────────────────────────────────────────────

  const fetchReturns = useCallback(async () => {
    if (!token || isRequestTab) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (activeTab) params.set("status", activeTab);
      Object.entries(dReturnF).forEach(([k, v]) => { if (v) params.set(k, v); });

      const { data } = await axiosInstance.get(`/admin/e-commerce/returns?${params}`, { headers });
      setReturns(data.data || []);
      setPagination(data.pagination || null);
      setReturnSummary(data.summary || { total: 0, requested: 0, shipped: 0, approved: 0, rejected: 0 });
    } catch {
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
    }
  }, [token, page, activeTab, dReturnF]);

  // ── Fetch customer requests ───────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    if (!token || !isRequestTab) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      Object.entries(dRequestF).forEach(([k, v]) => { if (v) params.set(k, v); });

      const { data } = await axiosInstance.get(`/admin/e-commerce/customer-requests?${params}`, { headers });
      setRequests(data.data || []);
      setPagination(data.pagination || null);
      setRequestSummary(data.summary || { total: 0, under_review: 0, in_progress: 0, resolved: 0, rejected: 0 });
    } catch {
      toast.error("Failed to load customer requests");
    } finally {
      setLoading(false);
    }
  }, [token, page, isRequestTab, dRequestF]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);
  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // ── Tab change ────────────────────────────────────────────────────────────────

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
  };

  // ── Actions: Returns ──────────────────────────────────────────────────────────

  const handleApprove = async (returnId, adminNotes) => {
    setActionLoading(true);
    try {
      await axiosInstance.post("/admin/e-commerce/returns/approve", { returnId, adminNotes }, { headers });
      toast.success("Return approved");
      setApproveReturn(null);
      fetchReturns();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to approve return");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (returnId, rejectionReason) => {
    setActionLoading(true);
    try {
      await axiosInstance.post("/admin/e-commerce/returns/reject", { returnId, rejectionReason }, { headers });
      toast.success("Return rejected");
      setRejectReturn(null);
      fetchReturns();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to reject return");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateReturn = async (form) => {
    setActionLoading(true);
    try {
      await axiosInstance.post("/admin/e-commerce/returns", form, { headers });
      toast.success("Return created");
      setShowCreate(false);
      fetchReturns();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create return");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Actions: Customer Requests ────────────────────────────────────────────────

  const handleReply = async (requestId, message) => {
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post("/admin/e-commerce/customer-requests/reply", { requestId, message }, { headers });
      toast.success("Reply sent");
      setViewRequest(data.data);
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send reply");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestStatusUpdate = async (requestId, situationStatus) => {
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post("/admin/e-commerce/customer-requests/update-status", { requestId, situationStatus }, { headers });
      toast.success("Status updated");
      setViewRequest(data.data);
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Columns: Returns ──────────────────────────────────────────────────────────

  const returnColumns = [
    {
      header: "Order Info",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-900 text-sm">{row.returnNo}</span>
          <span className="text-xs text-gray-500 font-mono">{row.orderNo || "—"}</span>
          <span className="text-[11px] text-gray-400">{moment(row.createdAt).format("DD MMM YYYY")}</span>
          <StatusBadge status={row.returnStatus} config={RETURN_STATUS_CONFIG} />
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (row) => (
        <span className="font-medium text-gray-800 text-sm">{row.customerName}</span>
      ),
    },
    {
      header: "Product",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-900 line-clamp-2">{row.productName}</span>
          {row.barcode && <span className="text-[11px] font-mono text-gray-400">{row.barcode}</span>}
        </div>
      ),
    },
    {
      header: "Price",
      cell: (row) => (
        <span className="font-bold text-gray-900 text-sm">Rs. {(row.price || 0).toLocaleString()}</span>
      ),
    },
    {
      header: "Reason",
      cell: (row) => (
        <span className="text-xs text-gray-600 line-clamp-2 max-w-[140px]" title={row.reason}>{row.reason}</span>
      ),
    },
    {
      header: "Payment",
      cell: (row) => (
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${PAYMENT_BADGE[row.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
          {row.paymentStatus}
        </span>
      ),
    },
    {
      header: "Created At",
      cell: (row) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">{moment(row.createdAt).format("DD MMM YYYY")}</span>
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
              title="View"
            >
              <Icon icon="mdi:eye-outline" className="w-4 h-4" />
            </button>
            {(s === "requested" || s === "shipped") && (
              <button
                onClick={() => setApproveReturn(row)}
                className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
                title="Approve"
              >
                <Icon icon="mdi:check-circle-outline" className="w-4 h-4" />
              </button>
            )}
            {(s === "requested" || s === "shipped") && (
              <button
                onClick={() => setRejectReturn(row)}
                className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                title="Reject"
              >
                <Icon icon="mdi:close-circle-outline" className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // ── Columns: Customer Requests ────────────────────────────────────────────────

  const requestColumns = [
    {
      header: "Request No",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-900 text-sm">{row.requestNo}</span>
          <span className="text-[11px] text-gray-400">{moment(row.createdAt).format("DD MMM YYYY")}</span>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (row) => (
        <span className="font-medium text-gray-800 text-sm">{row.customerName}</span>
      ),
    },
    {
      header: "Subject",
      cell: (row) => (
        <span className="text-sm text-gray-700 line-clamp-2 max-w-[180px]" title={row.subject}>{row.subject}</span>
      ),
    },
    {
      header: "Flow Type",
      cell: (row) => (
        <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full">
          {FLOW_TYPE_LABELS[row.flowType] || row.flowType}
        </span>
      ),
    },
    {
      header: "Order No",
      cell: (row) => (
        <span className="text-xs font-mono text-gray-600">{row.orderNo || "—"}</span>
      ),
    },
    {
      header: "Notes",
      cell: (row) => (
        <span className="text-xs text-gray-500 line-clamp-2 max-w-[140px]">{row.notes || "—"}</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.situationStatus} config={REQUEST_STATUS_CONFIG} />,
    },
    {
      header: "Result Date",
      cell: (row) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {row.resolvedAt ? moment(row.resolvedAt).format("DD MMM YYYY") : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewRequest(row)}
            className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="View / Reply"
          >
            <Icon icon="mdi:message-reply-outline" className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // ── Summary cards ─────────────────────────────────────────────────────────────

  const returnSummaryCards = [
    { label: "Total Returns", value: returnSummary.total,     icon: "mdi:package-variant-closed-remove", color: "#6366f1" },
    { label: "Requested",     value: returnSummary.requested, icon: "mdi:inbox-arrow-down-outline",       color: "#3b82f6" },
    { label: "Approved",      value: returnSummary.approved,  icon: "mdi:check-circle-outline",           color: "#10b981" },
    { label: "Rejected",      value: returnSummary.rejected,  icon: "mdi:close-circle-outline",           color: "#ef4444" },
  ];

  const requestSummaryCards = [
    { label: "Total Requests", value: requestSummary.total,        icon: "mdi:message-text-outline",   color: "#6366f1" },
    { label: "Under Review",   value: requestSummary.under_review, icon: "mdi:eye-clock-outline",      color: "#0ea5e9" },
    { label: "Resolved",       value: requestSummary.resolved,     icon: "mdi:check-decagram-outline", color: "#10b981" },
    { label: "Rejected",       value: requestSummary.rejected,     icon: "mdi:close-octagon-outline",  color: "#ef4444" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order Returns</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage return requests and customer support queries</p>
        </div>
        {!isRequestTab && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-sm text-sm"
          >
            <Icon icon="mdi:plus" className="w-5 h-5" />
            Create Return
          </button>
        )}
      </div>

      {/* Summary */}
      <SummaryCards data={isRequestTab ? requestSummaryCards : returnSummaryCards} />

      {/* Tabs */}
      <div className="mt-6 flex overflow-x-auto gap-1 pb-1 border-b border-gray-200">
        {RETURN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-primary-600 border-t-2 border-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Icon icon={tab.icon} className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {isRequestTab ? (
        <RequestFilters
          filters={requestFilters}
          onChange={handleRequestFilterChange}
          onClear={() => setRequestFilters(emptyRequestFilters)}
        />
      ) : (
        <ReturnFilters
          filters={returnFilters}
          onChange={handleReturnFilterChange}
          onClear={() => setReturnFilters(emptyReturnFilters)}
        />
      )}

      {/* Table */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <DataTable
          columns={isRequestTab ? requestColumns : returnColumns}
          data={isRequestTab ? requests : returns}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          emptyIcon={isRequestTab ? "mdi:message-off-outline" : "mdi:package-variant-remove"}
          emptyTitle={isRequestTab ? "No customer requests" : "No returns found"}
          emptyDescription="No records match your current filters."
        />
      </div>

      {/* Modals */}
      <ReturnDetailModal   ret={viewReturn}      onClose={() => setViewReturn(null)} />
      <ApproveModal        ret={approveReturn}   onClose={() => setApproveReturn(null)} onConfirm={handleApprove}  loading={actionLoading} />
      <RejectModal         ret={rejectReturn}    onClose={() => setRejectReturn(null)}  onConfirm={handleReject}   loading={actionLoading} />
      <RequestDetailModal
        request={viewRequest}
        onClose={() => setViewRequest(null)}
        onReply={handleReply}
        onStatusUpdate={handleRequestStatusUpdate}
        loading={actionLoading}
      />
      <CreateReturnModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreateReturn}
        loading={actionLoading}
      />
    </div>
  );
}
