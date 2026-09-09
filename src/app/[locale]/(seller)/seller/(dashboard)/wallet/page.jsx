'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { useRouter } from '@/i18n/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';
import { formatCurrency as fmt } from '@/helper/currencyFormatter';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtD   = (d)  => d ? moment(d).format('DD MMM YYYY') : '—';
const fmtDt  = (d)  => d ? moment(d).format('DD MMM YYYY, hh:mm A') : '—';

const WITHDRAW_STATUS = {
  pending:    { label: 'Pending',    bg: 'bg-amber-50',   text: 'text-amber-700',   icon: 'mdi:clock-outline' },
  processing: { label: 'Processing', bg: 'bg-blue-50',    text: 'text-blue-700',    icon: 'mdi:sync' },
  completed:  { label: 'Completed',  bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'mdi:check-circle' },
  rejected:   { label: 'Rejected',   bg: 'bg-red-50',     text: 'text-red-700',     icon: 'mdi:close-circle' },
};

// ─── stat card ──────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, iconBg, iconColor, sub }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-3 min-w-0">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon icon={icon} className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-black text-slate-900 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── withdrawal request modal ────────────────────────────────────────────────

function WithdrawModal({ available, onClose, onSuccess }) {
  const { token } = useSelector(s => s.auth);
  const [amount, setAmount]     = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return toast.error('Enter a valid amount');
    if (val > available)  return toast.error(`Amount exceeds available balance (${fmt(available)})`);

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/seller/wallet/withdraw-request',
        { amount: val },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Withdrawal request submitted!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to submit');
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-900">Request Withdrawal</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <Icon icon="mdi:close" className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Icon icon="mdi:wallet" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-emerald-700 font-semibold">Available Balance</p>
            <p className="text-xl font-black text-emerald-800">{fmt(available)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Withdrawal Amount</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={available}
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <button type="button" onClick={() => setAmount(available.toFixed(2))}
              className="mt-1.5 text-xs text-primary-600 hover:underline font-semibold">
              Withdraw all ({fmt(available)})
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            <Icon icon="mdi:information-outline" className="inline w-3.5 h-3.5 mr-1" />
            Funds will be transferred to your registered bank account after admin approval (typically 2–5 business days).
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Icon icon="svg-spinners:180-ring" className="w-4 h-4" /> : <Icon icon="mdi:bank-transfer-out" className="w-4 h-4" />}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── main page ──────────────────────────────────────────────────────────────

export default function SellerWalletPage() {
  const router = useRouter();
  const { token, user } = useSelector(s => s.auth);

  const [overview, setOverview]       = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests]       = useState([]);
  const [loadingOv, setLoadingOv]     = useState(true);
  const [loadingTx, setLoadingTx]     = useState(false);
  const [loadingRq, setLoadingRq]     = useState(false);
  const [activeTab, setActiveTab]     = useState('transactions');
  const [showModal, setShowModal]     = useState(false);

  // Requests pagination
  const [rqPage, setRqPage]           = useState(1);
  const [rqTotal, setRqTotal]         = useState({ pages: 1, items: 0 });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    setLoadingOv(true);
    try {
      const { data } = await axiosInstance.get('/seller/wallet', { headers });
      if (data.success) setOverview(data.data);
    } catch { toast.error('Failed to load wallet'); }
    finally { setLoadingOv(false); }
  }, [token]);

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    setLoadingTx(true);
    try {
      const { data } = await axiosInstance.get('/seller/transactions', {
        params: { page: 1, limit: 5 },
        headers,
      });
      if (data.success) setTransactions(data.data || []);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoadingTx(false); }
  }, [token]);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoadingRq(true);
    try {
      const { data } = await axiosInstance.get(`/seller/wallet/withdraw-requests?page=${rqPage}&limit=10`, { headers });
      if (data.success) {
        setRequests(data.data);
        setRqTotal({ pages: data.pagination.totalPages, items: data.pagination.totalItems });
      }
    } catch { toast.error('Failed to load withdrawal requests'); }
    finally { setLoadingRq(false); }
  }, [token, rqPage]);

  const cancelRequest = async (id) => {
    if (!confirm('Cancel this withdrawal request?')) return;
    try {
      const { data } = await axiosInstance.delete(`/seller/wallet/withdraw-request/${id}`, { headers });
      if (data.success) { toast.success('Request cancelled'); fetchOverview(); fetchRequests(); }
      else toast.error(data.message);
    } catch (err) { toast.error(err?.response?.data?.message || 'Server error'); }
  };

  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => { if (activeTab === 'transactions') fetchTransactions(); }, [fetchTransactions, activeTab]);
  useEffect(() => { if (activeTab === 'withdrawals') fetchRequests(); }, [fetchRequests, activeTab]);

  if (loadingOv) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon icon="svg-spinners:3-dots-fade" className="w-10 h-10 text-primary-600" />
      </div>
    );
  }

  const w = overview?.wallet || {};
  const canWithdraw = (w.availableBalance || 0) > 0 && !overview?.activeRequest;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {showModal && (
        <WithdrawModal
          available={w.availableBalance || 0}
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchOverview(); fetchRequests(); setActiveTab('withdrawals'); }}
        />
      )}

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Wallet</h1>
            <p className="text-sm text-slate-500 mt-0.5">Your earnings, balance & withdrawal requests</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={!canWithdraw}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon icon="mdi:bank-transfer-out" className="w-4 h-4" />
            Request Withdrawal
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Active withdrawal alert ── */}
        {overview?.activeRequest && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Icon icon="mdi:clock-alert-outline" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Withdrawal Pending Approval</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {fmt(overview.activeRequest.amount)} • Submitted {fmtD(overview.activeRequest.createdAt)} • Status: <span className="capitalize font-semibold">{overview.activeRequest.status}</span>
              </p>
            </div>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard
            label="Available Balance"
            value={fmt(w.availableBalance)}
            icon="mdi:wallet"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            sub="Ready to withdraw"
          />
          <StatCard
            label="On Hold"
            value={fmt(w.pendingBalance)}
            icon="mdi:clock-outline"
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            sub={overview?.holdDays === 0
              ? 'Releases instantly in test mode'
              : overview?.nextReleaseAt
                ? `Next release ${fmtD(overview.nextReleaseAt)}`
                : `Releases after ${overview?.holdDays ?? 20} days`}
          />
          <StatCard
            label="Total Earned"
            value={fmt(w.totalEarnings)}
            icon="mdi:trending-up"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            sub="Lifetime earnings"
          />
          <StatCard
            label="Total Withdrawn"
            value={fmt(w.totalWithdrawn)}
            icon="mdi:bank-check"
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            sub="Successfully transferred"
          />
          <StatCard
            label="Shipping Fees Paid"
            value={fmt(w.totalShippingFees)}
            icon="mdi:truck-fast-outline"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            sub="Deducted from earnings"
          />
        </div>

        {/* ── Earnings breakdown ── */}
        {/* <div className="grid grid-cols-3 gap-4">
          {Object.entries(overview?.earningsSummary || {}).map(([key, val]) => {
            const cfg = STATUS_CONFIG[key] || {};
            return (
              <div key={key} className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
                <p className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</p>
                <p className={`text-xl font-black mt-1 ${cfg.text}`}>{fmt(val.total)}</p>
                <p className={`text-xs mt-0.5 opacity-70 ${cfg.text}`}>{val.count} order{val.count !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div> */}

        {/* ── 20-day hold info banner ── */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <Icon icon="mdi:information-outline" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <span className="font-bold">How earnings work:</span> Once an order is delivered, your earnings are held for <strong>{overview?.holdDays ?? 20} days</strong>. After that, earnings move to Available Balance only when the invoice is approved and there is no active return. Platform commission ({fmt(w.totalPlatformFees)} lifetime) is deducted before crediting your balance.
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {[
              { key: 'transactions', label: 'Recent Transactions', icon: 'mdi:transfer' },
              { key: 'withdrawals', label: 'Withdrawal Requests', icon: 'mdi:bank-transfer-out' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === t.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon icon={t.icon} className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Recent Transactions Tab ── */}
          {activeTab === 'transactions' && (
            <div>
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-50">
                <p className="text-sm font-semibold text-slate-600">Latest 5 transactions</p>
                <button
                  onClick={() => router.push('/seller/transactions')}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  View All
                  <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                </button>
              </div>

              {loadingTx ? (
                <div className="flex items-center justify-center py-16">
                  <Icon icon="svg-spinners:3-dots-fade" className="w-8 h-8 text-primary-500" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Icon icon="mdi:transfer" className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Order No</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {transactions.map(transaction => {
                        const isIncoming = transaction.toUserId?._id === user?._id || transaction.toUserId === user?._id;
                        const type = (transaction.type || '').toLowerCase();
                        const incomingTypes = ['seller_earning_hold', 'seller_earning_release', 'withdrawal_rejected'];
                        const outgoingTypes = ['platform_fee', 'shipping_fee', 'refund', 'withdrawal_request', 'withdrawal_success'];
                        const isIncomingPayment = incomingTypes.includes(type) || (!outgoingTypes.includes(type) && isIncoming);
                        const isOutgoingPayment = outgoingTypes.includes(type) || !isIncoming;
                        const color = isIncomingPayment ? 'text-emerald-600' : isOutgoingPayment ? 'text-red-600' : 'text-blue-600';
                        const badge = isIncomingPayment
                          ? 'bg-emerald-100 text-emerald-700'
                          : isOutgoingPayment ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
                        const icon = isIncomingPayment ? 'mdi:arrow-down-circle-outline' : isOutgoingPayment ? 'mdi:arrow-up-circle-outline' : 'mdi:information-outline';
                        const prefix = isIncomingPayment ? '+' : isOutgoingPayment ? '-' : '';
                        return (
                          <tr key={transaction._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{fmtDt(transaction.createdAt)}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge}`}>
                                <Icon icon={icon} className="w-3 h-3" />
                                {(transaction.type || '—').toUpperCase().replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className={`px-4 py-4 font-bold whitespace-nowrap ${color}`}>{prefix}{fmt(transaction.amount)}</td>
                            <td className="px-4 py-4 text-xs font-mono text-slate-700 whitespace-nowrap">{transaction.orderNo || '—'}</td>
                            <td className="px-4 py-4 text-xs text-slate-600 max-w-xs truncate" title={transaction.description}>{transaction.description || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Withdrawal Requests Tab ── */}
          {activeTab === 'withdrawals' && (
            <div>
              {loadingRq ? (
                <div className="flex items-center justify-center py-16">
                  <Icon icon="svg-spinners:3-dots-fade" className="w-8 h-8 text-primary-500" />
                </div>
              ) : requests.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Icon icon="mdi:bank-transfer-out" className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No withdrawal requests yet</p>
                  <p className="text-xs mt-1">Once your earnings are available, you can request a withdrawal</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                          <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Request</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Bank</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Processed</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Note</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {requests.map(r => {
                          const cfg = WITHDRAW_STATUS[r.status] || WITHDRAW_STATUS.pending;
                          return (
                            <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-900 text-xs">{r._id?.slice(-8).toUpperCase()}</p>
                                <p className="text-xs text-slate-400">{fmtDt(r.createdAt)}</p>
                              </td>
                              <td className="px-4 py-4 font-black text-slate-900">{fmt(r.amount)}</td>
                              <td className="px-4 py-4 text-xs text-slate-600">
                                <p className="font-semibold">{r.bankDetails?.bankName || '—'}</p>
                                <p className="text-slate-400">****{r.bankDetails?.accountNumber?.slice(-4)}</p>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
                                  <Icon icon={cfg.icon} className="w-3 h-3" />
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-xs text-slate-500">{r.processedAt ? fmtDt(r.processedAt) : '—'}</td>
                              <td className="px-4 py-4 text-xs text-slate-500 max-w-[140px] truncate">{r.adminNote || '—'}</td>
                              <td className="px-4 py-4">
                                {r.status === 'pending' && (
                                  <button onClick={() => cancelRequest(r._id)}
                                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors">
                                    <Icon icon="mdi:close" className="w-3.5 h-3.5" />
                                    Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {rqTotal.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50">
                      <p className="text-xs text-slate-500">{rqTotal.items} total requests</p>
                      <div className="flex gap-2">
                        <button onClick={() => setRqPage(p => Math.max(1, p - 1))} disabled={rqPage === 1}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors">
                          <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-slate-600 self-center px-2">{rqPage} / {rqTotal.pages}</span>
                        <button onClick={() => setRqPage(p => Math.min(rqTotal.pages, p + 1))} disabled={rqPage === rqTotal.pages}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors">
                          <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
