'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';
import Image from 'next/image';

/* ── Campaign Detail / Edit Slide-over ───────────────────────────── */
function CampaignDetailModal({ camp, token, onClose, onUpdated }) {
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({
    name:        camp.name,
    dailyBudget: camp.dailyBudget,
    totalBudget: camp.totalBudget,
    startDate:   camp.startDate ? moment(camp.startDate).format('YYYY-MM-DD') : '',
  });

  const fmtDate   = d => d ? moment(d).format('DD MMM YYYY') : '—';
  const S = STATUS_META[camp.status] || STATUS_META.draft;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axiosInstance.put(
        `/admin/e-commerce/ads/campaigns/${camp._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Campaign updated');
        onUpdated(data.data);
        setEditing(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/50 backdrop-blur-sm" />
      {/* Panel */}
      <div
        className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="font-black text-slate-900 text-base leading-tight line-clamp-1">{camp.name}</h2>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{camp._id}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing && !['completed','active'].includes(camp.status) && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs rounded-xl transition-colors"
              >
                <Icon icon="mdi:pencil-outline" className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
              <Icon icon="mdi:close" className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5 flex-1">
          {/* Status */}
          <div className="flex items-center justify-between">
            <StatusBadge status={camp.status} />
            <span className="text-xs text-slate-400">{camp.type === 'sponsored_store' ? 'Sponsored Store' : 'Sponsored Products'}</span>
          </div>

          {/* Banner */}
          {camp.bannerUrl && (
            <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-100">
              <Image src={camp.bannerUrl} alt="Campaign banner" fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                Campaign Banner
              </div>
            </div>
          )}

          {/* Tagline */}
          {camp.storeTagline && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-2.5 text-sm font-medium text-violet-800 italic">
              "{camp.storeTagline}"
            </div>
          )}

          {/* Seller */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Seller</p>
            <p className="text-sm font-bold text-slate-900">{camp.sellerId?.name || 'Unknown'}</p>
            <p className="text-xs text-slate-500">{camp.sellerId?.email}</p>
          </div>

          {/* Edit / View form fields */}
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Campaign Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Daily Budget ($)</label>
                  <input
                    type="number" step="0.5"
                    value={form.dailyBudget}
                    onChange={e => setForm(f => ({ ...f, dailyBudget: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Total Budget ($)</label>
                  <input
                    type="number" step="1"
                    value={form.totalBudget}
                    onChange={e => setForm(f => ({ ...f, totalBudget: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" /> : <Icon icon="mdi:content-save-outline" className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Details</p>
              {[
                ['Daily Budget',  `$${camp.dailyBudget?.toFixed(2)}`],
                ['Total Budget',  `$${camp.totalBudget?.toFixed(2)}`],
                ['Spent',         `$${camp.spentBudget?.toFixed(2) || '0.00'}`],
                ['Remaining',     `$${camp.remainingBudget?.toFixed(2) || '0.00'}`],
                ['Impressions',   (camp.totalImpressions || 0).toLocaleString()],
                ['Clicks',        (camp.totalClicks || 0).toLocaleString()],
                ['Start Date',    fmtDate(camp.startDate)],
                ['End Date',      fmtDate(camp.endDate)],
                ['Created',       fmtDate(camp.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-bold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Products */}
          {camp.type === 'sponsored_product' && camp.productIds?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Promoted Products ({camp.productIds.length})</p>
              <div className="space-y-2">
                {camp.productIds.map(prod => (
                  <div key={prod._id || prod} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                    {prod.images?.[0]?.url && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                        <Image src={prod.images[0].url} alt={prod.title || ''} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{prod.title || prod}</p>
                      <p className="text-[10px] text-slate-400 truncate">{prod.slug}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejection reason */}
          {camp.status === 'rejected' && camp.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              <p className="font-bold mb-1">Rejection Reason</p>
              <p>{camp.rejectionReason}</p>
            </div>
          )}

          {/* Status history */}
          {camp.statusHistory?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Status History</p>
              <div className="space-y-3">
                {[...camp.statusHistory].reverse().slice(0, 5).map((h, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 capitalize">{h.status.replace('_', ' ')}</p>
                      {h.note && <p className="text-[10px] text-slate-500 mt-0.5">{h.note}</p>}
                      <p className="text-[9px] text-slate-400 mt-0.5">{h.createdAt ? moment(h.createdAt).format('DD MMM YY, HH:mm') : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const fmtDate = (d) => d ? moment(d).format('DD MMM YYYY') : '—';
const fmtDateTime = (d) => d ? moment(d).format('DD MMM YYYY, hh:mm A') : '—';

const STATUS_META = {
  draft:            { label: 'Draft',            bg: 'bg-gray-50',    text: 'text-gray-700',    border: 'border-gray-200',    dot: '#6b7280' },
  pending_approval: { label: 'Under Review',     bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: '#3b82f6' },
  active:           { label: 'Active',           bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: '#10b981' },
  paused:           { label: 'Paused',           bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: '#f59e0b' },
  completed:        { label: 'Completed',        bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: '#8b5cf6' },
  rejected:         { label: 'Rejected',         bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: '#ef4444' },
  budget_exhausted: { label: 'Budget Exhausted', bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: '#e11d48' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${m.bg} ${m.text} ${m.border}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

/* ── Reject Modal ────────────────────────────────────────────────── */
function RejectModal({ campaign, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  const textRef = useRef();
  useEffect(() => { textRef.current?.focus(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-gray-900 text-lg">Reject Campaign</h3>
            <p className="text-xs text-gray-400 mt-0.5">{campaign.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200">
            <Icon icon="mdi:close" className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 mb-5 text-xs text-red-600 flex items-start gap-2">
          <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0 mt-0.5" />
          The seller will see this reason and can make changes before resubmitting.
        </div>

        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Rejection Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          ref={textRef}
          rows={4}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Explain why this campaign is being rejected…"
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

/* ── Main Admin Ads Page ─────────────────────────────────────── */
export default function AdminAdsPage() {
  const { token } = useSelector(s => s.auth);

  const [campaigns,     setCampaigns]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [pagination,    setPagination]    = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [filterStatus,  setFilterStatus]  = useState('');
  
  const [stats, setStats] = useState({ byStatus: {}, platform: {} });

  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [detailTarget,  setDetailTarget]  = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [campRes, statsRes] = await Promise.all([
        axiosInstance.get('/admin/e-commerce/ads/campaigns', {
          params: { page, limit: pagination.limit, status: filterStatus || undefined },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get('/admin/e-commerce/ads/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (campRes.data.success) {
        setCampaigns(campRes.data.data);
        setPagination(campRes.data.pagination);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, pagination.limit]);

  useEffect(() => {
    loadData(1);
  }, [filterStatus, loadData]);

  const handleApprove = async (camp) => {
    if (!window.confirm(`Approve campaign "${camp.name}"?`)) return;
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/admin/e-commerce/ads/campaigns/${camp._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Campaign approved successfully');
        loadData(pagination.page);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/admin/e-commerce/ads/campaigns/${rejectTarget._id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Campaign rejected');
        setRejectTarget(null);
        loadData(pagination.page);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const TABLE_COLS = ['Campaign', 'Seller', 'Type & Budget', 'Performance', 'Dates', 'Status', 'Actions'];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Advertisement Campaigns</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage and review seller sponsored campaigns</p>
          </div>
          <button
            onClick={() => loadData(pagination.page)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <Icon icon="mdi:refresh" className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: 'mdi:clock-outline',          label: 'Pending Review', value: stats.byStatus['pending_approval']?.count || 0, color: 'bg-blue-500'    },
            { icon: 'mdi:check-circle-outline',   label: 'Active Ads',     value: stats.byStatus['active']?.count || 0, color: 'bg-emerald-500' },
            { icon: 'mdi:currency-usd',           label: 'Total Spend',    value: `$${(stats.platform.spend || 0).toFixed(2)}`, color: 'bg-violet-500' },
            { icon: 'mdi:chart-line',             label: 'Total Revenue',  value: `$${(stats.platform.revenue || 0).toFixed(2)}`, color: 'bg-indigo-500'     },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon icon={icon} className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: '',                  label: 'All Campaigns', count: pagination.total },
            { key: 'pending_approval',  label: 'Under Review',  count: stats.byStatus['pending_approval']?.count || 0 },
            { key: 'active',            label: 'Active',        count: stats.byStatus['active']?.count || 0 },
            { key: 'paused',            label: 'Paused',        count: stats.byStatus['paused']?.count || 0 },
            { key: 'rejected',          label: 'Rejected',      count: stats.byStatus['rejected']?.count || 0 },
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
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={TABLE_COLS.length} className="px-4 py-12 text-center">
                      <Icon icon="svg-spinners:3-dots-fade" className="w-8 h-8 text-violet-600 mx-auto" />
                      <p className="text-sm text-slate-500 mt-2 font-medium">Loading campaigns...</p>
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLS.length} className="px-4 py-16 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon icon="mdi:bullhorn-outline" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">No campaigns found</p>
                      <p className="text-xs text-slate-500 mt-1">Try changing your filters.</p>
                    </td>
                  </tr>
                ) : (
                  campaigns.map((camp) => (
                    <tr key={camp._id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Campaign Name & ID */}
                      <td className="px-4 py-3 align-top min-w-[200px]">
                        <div className="flex gap-3">
                          {camp.type === 'sponsored_store' && camp.bannerUrl ? (
                            <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                              <Image src={camp.bannerUrl} alt="banner" fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 text-violet-500">
                              <Icon icon={camp.type === 'sponsored_store' ? 'mdi:store' : 'mdi:package-variant-closed'} className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 leading-tight line-clamp-2">{camp.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{camp._id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Seller Info */}
                      <td className="px-4 py-3 align-top">
                        {camp.sellerId ? (
                          <>
                            <p className="font-semibold text-slate-700 text-xs">{camp.sellerId.name}</p>
                            <p className="text-[11px] text-slate-500">{camp.sellerId.email}</p>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unknown</span>
                        )}
                      </td>

                      {/* Type & Budget */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {camp.type === 'sponsored_store' ? 'Store Ad' : 'Product Ad'} ({camp.biddingType})
                        </span>
                        <div className="mt-2 space-y-0.5">
                          <p className="text-[11px] text-slate-500 flex justify-between gap-4">
                            <span>Daily:</span>
                            <span className="font-bold text-slate-700">${camp.dailyBudget?.toFixed(2)}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 flex justify-between gap-4">
                            <span>Total:</span>
                            <span className="font-bold text-slate-700">${camp.totalBudget?.toFixed(2)}</span>
                          </p>
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-0.5 w-32">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500">Spent:</span>
                            <span className="font-bold text-slate-700">${camp.spentBudget?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500">Impr:</span>
                            <span className="font-medium text-slate-700">{camp.totalImpressions || 0}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500">Clicks:</span>
                            <span className="font-medium text-slate-700">{camp.totalClicks || 0}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500">CTR:</span>
                            <span className="font-medium text-slate-700">
                              {camp.totalImpressions
                                ? ((camp.totalClicks / camp.totalImpressions) * 100).toFixed(2)
                                : '0.00'}%
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-3 align-top text-xs text-slate-600 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <Icon icon="mdi:calendar-start" className="w-3.5 h-3.5" />
                            {fmtDate(camp.startDate)}
                          </div>
                          <div className="flex items-center gap-1.5 text-rose-600">
                            <Icon icon="mdi:calendar-end" className="w-3.5 h-3.5" />
                            {fmtDate(camp.endDate)}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={camp.status} />
                        {camp.status === 'rejected' && camp.rejectionReason && (
                          <p className="text-[10px] text-red-500 mt-1 max-w-[150px] line-clamp-2" title={camp.rejectionReason}>
                            {camp.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-1.5">
                          {/* Approve */}
                          {camp.status === 'pending_approval' && (
                            <button
                              title="Approve"
                              onClick={() => handleApprove(camp)}
                              disabled={actionLoading}
                              className="w-7 h-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <Icon icon="mdi:check-bold" className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Reject */}
                          {camp.status === 'pending_approval' && (
                            <button
                              title="Reject"
                              onClick={() => setRejectTarget(camp)}
                              disabled={actionLoading}
                              className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <Icon icon="mdi:close-thick" className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* View / Edit */}
                          <button
                            title="View & Edit"
                            onClick={() => setDetailTarget(camp)}
                            className="w-7 h-7 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Icon icon="mdi:pencil-box-outline" className="w-3.5 h-3.5" />
                          </button>
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-400">
                {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadData(pagination.page - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadData(pagination.page + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {rejectTarget && (
        <RejectModal
          campaign={rejectTarget}
          loading={actionLoading}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}

      {detailTarget && (
        <CampaignDetailModal
          camp={detailTarget}
          token={token}
          onClose={() => setDetailTarget(null)}
          onUpdated={(updated) => {
            setCampaigns(prev => prev.map(c => c._id === updated._id ? { ...c, ...updated } : c));
            setDetailTarget(prev => ({ ...prev, ...updated }));
          }}
        />
      )}
    </div>
  );
}
