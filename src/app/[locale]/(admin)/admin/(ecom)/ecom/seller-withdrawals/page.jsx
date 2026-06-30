'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useSelector } from 'react-redux';

const fmt    = (n) => `Rs. ${(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDt  = (d) => d ? moment(d).format('DD MMM YYYY, hh:mm A') : '—';
const fmtD   = (d) => d ? moment(d).format('DD MMM YYYY') : '—';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  icon: 'mdi:clock-outline' },
  processing: { label: 'Processing', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   icon: 'mdi:sync' },
  completed:  { label: 'Completed',  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'mdi:check-circle' },
  rejected:   { label: 'Rejected',   bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    icon: 'mdi:close-circle' },
};

// ─── action modal ────────────────────────────────────────────────────────────

function ActionModal({ request, action, onClose, onDone }) {
  const [note, setNote]     = useState('');
  const [loading, setLoading] = useState(false);
const { token } = useSelector((state) => state.auth);
  const isApprove = action === 'approve';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.patch(
        `/admin/e-commerce/wallet/withdraw-requests/${request._id}/${action}`,
        { adminNote: note },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success(isApprove ? 'Withdrawal approved!' : 'Withdrawal rejected');
        onDone();
        onClose();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-lg font-black ${isApprove ? 'text-emerald-700' : 'text-red-700'}`}>
            {isApprove ? 'Approve Withdrawal' : 'Reject Withdrawal'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <Icon icon="mdi:close" className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Summary */}
        <div className={`rounded-2xl p-4 mb-5 ${isApprove ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <p className="text-xs font-semibold text-slate-600 mb-1">Seller</p>
          <p className="font-bold text-slate-900">{request.sellerId?.name || '—'}</p>
          <p className="text-xs text-slate-500">{request.sellerId?.email}</p>
          <div className="mt-3 pt-3 border-t border-slate-200/60">
            <p className="text-xs font-semibold text-slate-600 mb-0.5">Amount</p>
            <p className="text-2xl font-black text-slate-900">{fmt(request.amount)}</p>
          </div>
          {request.bankDetails && (
            <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600 space-y-0.5">
              <p><span className="font-semibold">Bank:</span> {request.bankDetails.bankName}</p>
              <p><span className="font-semibold">Account:</span> ****{request.bankDetails.accountNumber?.slice(-4)}</p>
              {request.bankDetails.accountTitle && <p><span className="font-semibold">Title:</span> {request.bankDetails.accountTitle}</p>}
              {request.bankDetails.iban && <p><span className="font-semibold">IBAN:</span> {request.bankDetails.iban}</p>}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Admin Note {!isApprove && <span className="text-red-500">*</span>}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={isApprove ? 'Optional note for the seller...' : 'Reason for rejection (required)...'}
              required={!isApprove}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`flex-1 py-3 rounded-xl text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading
                ? <Icon icon="svg-spinners:180-ring" className="w-4 h-4" />
                : <Icon icon={isApprove ? 'mdi:check' : 'mdi:close'} className="w-4 h-4" />
              }
              {isApprove ? 'Approve' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── detail slide-over ────────────────────────────────────────────────────────

function DetailPanel({ request, onClose, onAction }) {
  if (!request) return null;
  const cfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900">Withdrawal Details</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <Icon icon="mdi:close" className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          {/* Status */}
          <div className={`rounded-2xl p-4 border ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon icon={cfg.icon} className={`w-4 h-4 ${cfg.text}`} />
              <span className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{fmt(request.amount)}</p>
            <p className="text-xs text-slate-500 mt-1">Requested {fmtDt(request.createdAt)}</p>
          </div>

          {/* Seller info */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Seller</p>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="font-bold text-slate-900">{request.sellerId?.name || '—'}</p>
              <p className="text-xs text-slate-500">{request.sellerId?.email}</p>
            </div>
          </div>

          {/* Bank details */}
          {request.bankDetails && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bank Details</p>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                {[
                  ['Bank Name',       request.bankDetails.bankName],
                  ['Account Title',   request.bankDetails.accountTitle],
                  ['Account Number',  request.bankDetails.accountNumber],
                  ['Branch',          request.bankDetails.branchName],
                  ['IBAN',            request.bankDetails.iban],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500 text-xs">{label}</span>
                    <span className="font-semibold text-slate-900 text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin note */}
          {request.adminNote && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Admin Note</p>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700">{request.adminNote}</div>
            </div>
          )}

          {/* Linked earnings */}
          {request.earningIds?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Linked Earnings ({request.earningIds.length})</p>
              <div className="space-y-2">
                {request.earningIds.map((e, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{e.orderNo || `Order ${i + 1}`}</p>
                      <p className="text-[10px] text-slate-400">{fmtD(e.deliveredAt)}</p>
                    </div>
                    <p className="font-black text-slate-900 text-sm">{fmt(e.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Timeline</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Requested</span>
                <span className="font-semibold text-slate-700">{fmtDt(request.createdAt)}</span>
              </div>
              {request.processedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Processed</span>
                  <span className="font-semibold text-slate-700">{fmtDt(request.processedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {['pending', 'processing'].includes(request.status) && (
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <button onClick={() => onAction(request, 'reject')}
              className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
              <Icon icon="mdi:close" className="w-4 h-4" /> Reject
            </button>
            <button onClick={() => onAction(request, 'approve')}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <Icon icon="mdi:check" className="w-4 h-4" /> Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── main page ──────────────────────────────────────────────────────────────

export default function AdminSellerWithdrawalsPage() {
  const [requests, setRequests]       = useState([]);
  const [summary, setSummary]         = useState({});
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState({ pages: 1, items: 0 });
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch]           = useState('');
  const [detail, setDetail]           = useState(null);
  const [actionTarget, setActionTarget] = useState(null); // { request, action }
const { token } = useSelector((state) => state.auth);
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterStatus) params.set('status', filterStatus);
      if (search)       params.set('search', search);
      const { data } = await axiosInstance.get(`/admin/e-commerce/wallet/withdraw-requests?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setRequests(data.data);
        setSummary(data.summary?.byStatus || {});
        setTotal({ pages: data.pagination.totalPages, items: data.pagination.totalItems });
      }
    } catch { toast.error('Failed to load withdrawal requests'); }
    finally { setLoading(false); }
  }, [page, filterStatus, search]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openDetail = async (req) => {
    try {
      const { data } = await axiosInstance.get(`/admin/e-commerce/wallet/withdraw-requests/${req._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) setDetail(data.data);
    } catch { setDetail(req); }
  };

  const handleAction = (request, action) => {
    setDetail(null); // close detail panel
    setActionTarget({ request, action });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {actionTarget && (
        <ActionModal
          request={actionTarget.request}
          action={actionTarget.action}
          onClose={() => setActionTarget(null)}
          onDone={() => { fetchRequests(); setDetail(null); }}
        />
      )}

      {detail && (
        <DetailPanel
          request={detail}
          onClose={() => setDetail(null)}
          onAction={handleAction}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-black text-slate-900">Seller Withdrawal Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and approve seller payout requests</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const s = summary[key] || { count: 0, amount: 0 };
            return (
              <button
                key={key}
                onClick={() => { setFilterStatus(filterStatus === key ? '' : key); setPage(1); }}
                className={`rounded-2xl p-4 border text-left transition-all ${
                  filterStatus === key ? `${cfg.bg} ${cfg.border} ring-2 ring-offset-1 ring-current` : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon={cfg.icon} className={`w-4 h-4 ${cfg.text}`} />
                  <span className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
                </div>
                <p className="text-xl font-black text-slate-900">{s.count}</p>
                <p className="text-xs text-slate-500 mt-0.5">{fmt(s.amount)}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by seller name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Icon icon="svg-spinners:3-dots-fade" className="w-8 h-8 text-primary-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Icon icon="mdi:bank-transfer-out" className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No withdrawal requests found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Seller</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Bank</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Requested</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Processed</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {requests.map(r => {
                      const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                      const canAct = ['pending', 'processing'].includes(r.status);
                      return (
                        <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{r.sellerId?.name || '—'}</p>
                            <p className="text-xs text-slate-400">{r.sellerId?.email}</p>
                          </td>
                          <td className="px-4 py-4 font-black text-slate-900">{fmt(r.amount)}</td>
                          <td className="px-4 py-4 text-xs text-slate-600">
                            <p className="font-semibold">{r.bankDetails?.bankName || '—'}</p>
                            <p className="text-slate-400">****{r.bankDetails?.accountNumber?.slice(-4)}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              <Icon icon={cfg.icon} className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500">{fmtD(r.createdAt)}</td>
                          <td className="px-4 py-4 text-xs text-slate-500">{r.processedAt ? fmtD(r.processedAt) : '—'}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openDetail(r)}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                <Icon icon="mdi:eye-outline" className="w-4 h-4 text-slate-600" />
                              </button>
                              {canAct && (
                                <>
                                  <button onClick={() => handleAction(r, 'approve')}
                                    className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors">
                                    <Icon icon="mdi:check" className="w-4 h-4 text-emerald-700" />
                                  </button>
                                  <button onClick={() => handleAction(r, 'reject')}
                                    className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors">
                                    <Icon icon="mdi:close" className="w-4 h-4 text-red-700" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {total.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50">
                  <p className="text-xs text-slate-500">{total.items} total requests</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors">
                      <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-600 self-center px-2">{page} / {total.pages}</span>
                    <button onClick={() => setPage(p => Math.min(total.pages, p + 1))} disabled={page === total.pages}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors">
                      <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
