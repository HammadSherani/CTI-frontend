'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

/* ── helpers ─────────────────────────────────────────────────────── */
const fmt = (n = 0) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

/* ── status config ───────────────────────────────────────────────── */
const STATUS_META = {
  pending_submission:   { label: 'Pending Submission',  bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200',  dot: '#64748b' },
  submitted:            { label: 'Submitted',           bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',   dot: '#2563eb' },
  waiting_for_approval: { label: 'Waiting Approval',   bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',  dot: '#d97706' },
  approved:             { label: 'Approved',            bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200',dot: '#059669' },
  rejected:             { label: 'Rejected',            bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200',    dot: '#dc2626' },
};

const TYPE_LABELS = { order: 'Sales Order', commission: 'Commission', refund: 'Refund' };

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending_submission;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${m.bg} ${m.text} ${m.border}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

/* ── summary cards ───────────────────────────────────────────────── */
function SummaryCard({ icon, label, value, color }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon icon={icon} className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ── Reject Reason Modal ─────────────────────────────────────────── */
function RejectModal({ invoice, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  const textRef = useRef();

  useEffect(() => { textRef.current?.focus(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-gray-900 text-lg">Reject Invoice</h3>
            <p className="text-xs text-gray-400 mt-0.5">{invoice.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200">
            <Icon icon="mdi:close" className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5">
          <p className="text-xs text-red-600 flex items-start gap-2">
            <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0 mt-0.5" />
            The seller will be notified with your rejection reason and can re-upload a corrected invoice.
          </p>
        </div>

        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Rejection Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          ref={textRef}
          rows={4}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Explain clearly why this invoice is being rejected (e.g., missing seller tax number, incorrect amount…)"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 resize-none placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1.5">{reason.trim().length} characters</p>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" /> Rejecting…</>
              : <><Icon icon="mdi:close-circle-outline" className="w-4 h-4" /> Confirm Rejection</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Invoice Detail Modal ────────────────────────────────────────── */
function InvoiceDetailModal({ invoice, onClose, onApprove, onReject, actionLoading }) {
  if (!invoice) return null;

  const canAct = ['submitted', 'waiting_for_approval'].includes(invoice.submissionStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">{invoice.invoiceNumber}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Code: {invoice.invoiceCode || '—'} &nbsp;·&nbsp; {fmtDate(invoice.invoiceDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canAct && (
              <>
                <button
                  onClick={() => onApprove(invoice)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  <Icon icon="mdi:check-circle-outline" className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => onReject(invoice)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  <Icon icon="mdi:close-circle-outline" className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            <button onClick={onClose} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 transition-colors">
              <Icon icon="mdi:close" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Status + rejection */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={invoice.submissionStatus} />
            {invoice.submissionStatus === 'approved' && invoice.approvedAt && (
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl font-semibold">
                Approved on {fmtDate(invoice.approvedAt)}
              </span>
            )}
            {invoice.submissionStatus === 'rejected' && invoice.rejectionReason && (
              <div className="flex-1 bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-xs text-red-700">
                <strong>Rejection Reason:</strong> {invoice.rejectionReason}
              </div>
            )}
          </div>

          {/* PDF Preview */}
          {invoice.uploadedInvoiceUrl && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:file-pdf-box" className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">Uploaded Invoice PDF</p>
                <p className="text-xs text-gray-400">Submitted by seller for review</p>
              </div>
              <a
                href={invoice.uploadedInvoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                <Icon icon="mdi:open-in-new" className="w-3.5 h-3.5" />
                Open PDF
              </a>
            </div>
          )}

          {!invoice.uploadedInvoiceUrl && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-amber-700">
              <Icon icon="mdi:alert-outline" className="w-5 h-5 flex-shrink-0" />
              No invoice PDF uploaded yet — seller has not uploaded the document.
            </div>
          )}

          {/* Seller + Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-2">Seller</p>
              <p className="font-bold text-gray-800">{invoice.sellerInfo?.businessName || invoice.sellerInfo?.name || invoice.sellerId?.name || '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{invoice.sellerInfo?.email || invoice.sellerId?.email}</p>
              {invoice.sellerInfo?.phone   && <p className="text-xs text-gray-500">{invoice.sellerInfo.phone}</p>}
              {invoice.sellerInfo?.address && <p className="text-xs text-gray-500">{invoice.sellerInfo.address}</p>}
              {invoice.sellerInfo?.taxNumber && <p className="text-xs text-gray-500">Tax: {invoice.sellerInfo.taxNumber}</p>}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Customer</p>
              <p className="font-bold text-gray-800">{invoice.customerInfo?.name || invoice.customerId?.name || '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{invoice.customerInfo?.email || invoice.customerId?.email}</p>
              {invoice.customerInfo?.phone && <p className="text-xs text-gray-500">{invoice.customerInfo.phone}</p>}
              {invoice.customerInfo?.shippingAddress?.addressLine && (
                <p className="text-xs text-gray-500">{invoice.customerInfo.shippingAddress.addressLine}</p>
              )}
              {(invoice.customerInfo?.shippingAddress?.area || invoice.customerInfo?.shippingAddress?.city) && (
                <p className="text-xs text-gray-500">
                  {[invoice.customerInfo.shippingAddress.area, invoice.customerInfo.shippingAddress.city].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Order info strip */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              ['Order No',     invoice.orderNo         || '—'],
              ['Invoice Code', invoice.invoiceCode      || '—'],
              ['Payment',      invoice.paymentMethod    || '—'],
              ['Pay Status',   invoice.paymentStatus    || '—'],
              ['Order Status', invoice.orderStatus      || '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          {/* Items table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-violet-600 text-white">
                  {['#', 'Product', 'Variant', 'Qty', 'Unit Price', 'Total', 'Platform Fee', 'Seller Earnings'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2.5 text-gray-400 text-[11px]">{i + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-gray-800 text-xs">{item.productName || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{[item.variant?.color, item.variant?.size].filter(Boolean).join(' / ') || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-700 text-center text-xs">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-gray-700 text-right text-xs">{fmt(item.unitPrice)}</td>
                    <td className="px-3 py-2.5 font-bold text-gray-800 text-right text-xs">{fmt(item.totalPrice)}</td>
                    <td className="px-3 py-2.5 text-red-600 text-right text-xs">{fmt(item.platformFee)}</td>
                    <td className="px-3 py-2.5 font-bold text-emerald-600 text-right text-xs">{fmt(item.sellerEarnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1.5">
              {[
                ['Subtotal',      fmt(invoice.subtotal)],
                ['Shipping Fee',  fmt(invoice.shippingFee)],
                ['Tax',           fmt(invoice.tax || 0)],
                ['Platform Fee',  fmt(invoice.totalPlatformFee)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs text-gray-500">
                  <span>{label}</span><span className="font-semibold">{val}</span>
                </div>
              ))}
              <div className="border-t border-violet-200 pt-2 flex justify-between">
                <span className="text-sm font-black text-gray-700">Seller Earnings</span>
                <span className="text-sm font-black text-emerald-600">{fmt(invoice.totalSellerEarnings)}</span>
              </div>
            </div>
          </div>

          {/* History */}
          {invoice.history?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Activity History</p>
              <div className="space-y-1.5">
                {[...invoice.history].reverse().map((h, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon icon="mdi:clock-outline" className="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-700 capitalize">{h.action.replace(/_/g, ' ')}</p>
                      {h.note && <p className="text-[11px] text-gray-400">{h.note}</p>}
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{fmtDateTime(h.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approve / Reject actions at bottom */}
          {canAct && (
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => onApprove(invoice)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-sm transition-colors"
              >
                <Icon icon="mdi:check-circle-outline" className="w-5 h-5" />
                Approve Invoice
              </button>
              <button
                onClick={() => onReject(invoice)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-sm transition-colors"
              >
                <Icon icon="mdi:close-circle-outline" className="w-5 h-5" />
                Reject Invoice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Admin Invoice Page ──────────────────────────────────────── */
export default function AdminInvoicesPage() {
  const { token } = useSelector(s => s.auth);

  const [invoices,   setInvoices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  /* Detail/action state */
  const [viewInvoice,    setViewInvoice]    = useState(null);
  const [rejectTarget,   setRejectTarget]   = useState(null);
  const [actionLoading,  setActionLoading]  = useState(false);

  /* Filters */
  const [filters, setFilters] = useState({
    status: '',
    invoiceNumber: '',
    orderNo: '',
    invoiceType: '',
    dateFrom: '',
    dateTo: '',
  });

  const loadInvoices = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: pagination.limit });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

      const { data } = await axiosInstance.get(`/admin/ecom/invoices?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setInvoices(data.data);
        setPagination(p => ({ ...p, ...data.pagination, page }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [token, filters, pagination.limit]);

  useEffect(() => { loadInvoices(1); }, [filters]);

  /* Approve */
  const handleApprove = async (inv) => {
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/admin/ecom/invoices/${inv._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(`Invoice ${inv.invoiceNumber} approved.`);
        setInvoices(prev => prev.map(i => i._id === inv._id ? data.data : i));
        if (viewInvoice?._id === inv._id) setViewInvoice(data.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  /* Open reject modal */
  const handleOpenReject = (inv) => {
    setRejectTarget(inv);
    if (viewInvoice) setViewInvoice(null);
  };

  /* Confirm reject */
  const handleConfirmReject = async (reason) => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/admin/ecom/invoices/${rejectTarget._id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(`Invoice ${rejectTarget.invoiceNumber} rejected.`);
        setInvoices(prev => prev.map(i => i._id === rejectTarget._id ? data.data : i));
        setRejectTarget(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  /* Stats from current page */
  const stats = invoices.reduce((acc, inv) => {
    acc[inv.submissionStatus] = (acc[inv.submissionStatus] || 0) + 1;
    return acc;
  }, {});

  const TABLE_COLS = ['Invoice #', 'Type', 'Order #', 'Seller', 'Date', 'Amount', 'Submitted', 'Status', 'Actions'];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Page header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Invoice Management</h1>
            <p className="text-sm text-slate-400 mt-0.5">Review, approve, and reject seller-submitted invoices</p>
          </div>
          <button
            onClick={() => loadInvoices(pagination.page)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <Icon icon="mdi:refresh" className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard icon="mdi:clock-outline"         label="Pending"         value={stats.pending_submission   || 0} color="bg-slate-400"    />
          <SummaryCard icon="mdi:send-outline"           label="Submitted"       value={stats.submitted            || 0} color="bg-blue-500"     />
          <SummaryCard icon="mdi:check-circle-outline"   label="Approved"        value={stats.approved             || 0} color="bg-emerald-500"  />
          <SummaryCard icon="mdi:close-circle-outline"   label="Rejected"        value={stats.rejected             || 0} color="bg-red-500"      />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="Invoice Number"
              value={filters.invoiceNumber}
              onChange={e => setFilters(f => ({ ...f, invoiceNumber: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 placeholder:text-slate-400"
            />
            <input
              type="text"
              placeholder="Order No"
              value={filters.orderNo}
              onChange={e => setFilters(f => ({ ...f, orderNo: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 placeholder:text-slate-400"
            />
            <select
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filters.invoiceType}
              onChange={e => setFilters(f => ({ ...f, invoiceType: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
            />
          </div>
          <button
            onClick={() => setFilters({ status: '', invoiceNumber: '', orderNo: '', invoiceType: '', dateFrom: '', dateTo: '' })}
            className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon icon="mdi:close-circle-outline" className="w-4 h-4" />
            Clear all filters
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {TABLE_COLS.map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {TABLE_COLS.map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 animate-pulse rounded-lg" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLS.length} className="py-20 text-center">
                      <Icon icon="mdi:file-document-outline" className="w-16 h-16 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 font-semibold">No invoices found</p>
                      <p className="text-xs text-slate-300 mt-1">Invoices will appear here once sellers upload them</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, i) => {
                    const canAct = ['submitted', 'waiting_for_approval'].includes(inv.submissionStatus);
                    return (
                      <tr
                        key={inv._id}
                        className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-bold text-violet-700 text-xs">{inv.invoiceNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-violet-50 text-violet-600 font-bold px-2 py-0.5 rounded-lg">
                            {TYPE_LABELS[inv.invoiceType] || inv.invoiceType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{inv.orderNo || '—'}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{inv.sellerInfo?.businessName || inv.sellerId?.name || '—'}</p>
                            <p className="text-[11px] text-slate-400">{inv.sellerId?.email || inv.sellerInfo?.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(inv.invoiceDate)}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600 whitespace-nowrap">{fmt(inv.totalSellerEarnings)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(inv.submissionDate)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={inv.submissionStatus} />
                          {inv.submissionStatus === 'rejected' && inv.rejectionReason && (
                            <p className="text-[10px] text-red-500 mt-1 line-clamp-1 max-w-[120px]">{inv.rejectionReason}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {/* View */}
                            <button
                              title="Review Invoice"
                              onClick={() => setViewInvoice(inv)}
                              className="w-7 h-7 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
                            </button>

                            {/* Open PDF */}
                            {inv.uploadedInvoiceUrl && (
                              <a
                                href={inv.uploadedInvoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Open PDF"
                                className="w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                              >
                                <Icon icon="mdi:file-pdf-box" className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Approve */}
                            {canAct && (
                              <button
                                title="Approve"
                                onClick={() => handleApprove(inv)}
                                disabled={actionLoading}
                                className="w-7 h-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                              >
                                <Icon icon="mdi:check-bold" className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Reject */}
                            {canAct && (
                              <button
                                title="Reject"
                                onClick={() => handleOpenReject(inv)}
                                disabled={actionLoading}
                                className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                              >
                                <Icon icon="mdi:close-thick" className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} invoices
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadInvoices(pagination.page - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <Icon icon="mdi:chevron-left" className="w-4 h-4 text-slate-500" />
                </button>
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => loadInvoices(pg)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                        pagination.page === pg
                          ? 'bg-violet-600 text-white'
                          : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadInvoices(pagination.page + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <Icon icon="mdi:chevron-right" className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {viewInvoice && (
        <InvoiceDetailModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onApprove={(inv) => { setViewInvoice(null); handleApprove(inv); }}
          onReject={(inv) => handleOpenReject(inv)}
          actionLoading={actionLoading}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectTarget && (
        <RejectModal
          invoice={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleConfirmReject}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
