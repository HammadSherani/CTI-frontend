'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_META = {
  submitted: { label: 'Under Review', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: '#2563eb' },
  approved:  { label: 'Approved',     bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: '#059669' },
  rejected:  { label: 'Rejected',     bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: '#dc2626' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.submitted;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${m.bg} ${m.text} ${m.border}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

/* ── Reject Modal ────────────────────────────────────────────────── */
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

        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 mb-5 text-xs text-red-600 flex items-start gap-2">
          <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0 mt-0.5" />
          The seller will see this reason and can re-upload a corrected invoice.
        </div>

        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Rejection Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          ref={textRef}
          rows={4}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Explain why this invoice is being rejected…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 resize-none placeholder:text-gray-400"
        />

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" /> Rejecting…</>
              : <><Icon icon="mdi:close-circle-outline" className="w-4 h-4" /> Confirm Rejection</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Admin Invoice Page ─────────────────────────────────────── */
export default function AdminInvoicesPage() {
  const { token } = useSelector(s => s.auth);

  const [invoices,      setInvoices]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [pagination,    setPagination]    = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [filterStatus,  setFilterStatus]  = useState('');
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadInvoices = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: pagination.limit });
      if (filterStatus) params.set('status', filterStatus);

      const { data } = await axiosInstance.get(`/admin/e-commerce/invoices?${params}`, {
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
  }, [token, filterStatus, pagination.limit]);

  useEffect(() => { loadInvoices(1); }, [filterStatus]);

  /* Approve */
  const handleApprove = async (inv) => {
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/admin/e-commerce/invoices/${inv._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(`Invoice ${inv.invoiceNumber} approved.`);
        setInvoices(prev => prev.map(i => i._id === inv._id ? data.data : i));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve.');
    } finally {
      setActionLoading(false);
    }
  };

  /* Reject */
  const handleConfirmReject = async (reason) => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/admin/e-commerce/invoices/${rejectTarget._id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(`Invoice ${rejectTarget.invoiceNumber} rejected.`);
        setInvoices(prev => prev.map(i => i._id === rejectTarget._id ? data.data : i));
        setRejectTarget(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject.');
    } finally {
      setActionLoading(false);
    }
  };

  const counts = invoices.reduce((acc, inv) => { acc[inv.status] = (acc[inv.status] || 0) + 1; return acc; }, {});

  const TABLE_COLS = ['Invoice #', 'Seller', 'Submitted', 'Status', 'Rejection Reason', 'Actions'];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Invoice Management</h1>
            <p className="text-sm text-slate-400 mt-0.5">Review and approve seller-submitted invoices</p>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: 'mdi:clock-outline',          label: 'Under Review', value: counts.submitted || 0, color: 'bg-blue-500'    },
            { icon: 'mdi:check-circle-outline',    label: 'Approved',     value: counts.approved  || 0, color: 'bg-emerald-500' },
            { icon: 'mdi:close-circle-outline',    label: 'Rejected',     value: counts.rejected  || 0, color: 'bg-red-500'     },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon icon={icon} className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: '',          label: 'All',          count: pagination.total      },
            { key: 'submitted', label: 'Under Review', count: counts.submitted || 0 },
            { key: 'approved',  label: 'Approved',     count: counts.approved  || 0 },
            { key: 'rejected',  label: 'Rejected',     count: counts.rejected  || 0 },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                filterStatus === key
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${filterStatus === key ? 'bg-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

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
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, i) => (
                    <tr
                      key={inv._id}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i % 2 !== 0 ? 'bg-slate-50/30' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-bold text-violet-700 text-xs">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-slate-700">{inv.sellerId?.name || '—'}</p>
                        <p className="text-[11px] text-slate-400">{inv.sellerId?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {fmtDate(inv.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[180px]">
                        {inv.status === 'rejected' && inv.rejectionReason
                          ? <span className="text-red-600 line-clamp-2">{inv.rejectionReason}</span>
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Download PDF */}
                          <a
                            href={`${inv.pdfUrl}?fl_attachment=1`}
                            download
                            title="Download PDF"
                            className="w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Icon icon="mdi:download" className="w-3.5 h-3.5" />
                          </a>
                          {/* View Order */}
                          {inv.orderId && (
                            <a
                              href={`/admin/ecom/orders/${inv.orderId._id}`}
                              title="View Order"
                              className="w-7 h-7 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Icon icon="mdi:cart-outline" className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {/* Approve */}
                          {inv.status === 'submitted' && (
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
                          {inv.status === 'submitted' && (
                            <button
                              title="Reject"
                              onClick={() => setRejectTarget(inv)}
                              disabled={actionLoading}
                              className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <Icon icon="mdi:close-thick" className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Approved by */}
                          {inv.status === 'approved' && inv.approvedAt && (
                            <span className="text-[10px] text-emerald-600 whitespace-nowrap">
                              {fmtDate(inv.approvedAt)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
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
                        pagination.page === pg ? 'bg-violet-600 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
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
