'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

const fmtDate = (d) => d ? moment(d).format('DD MMM YYYY') : '—';

const STATUS_META = {
  draft:            { label: 'Draft',            bg: 'bg-gray-50',    text: 'text-gray-700',    border: 'border-gray-200' },
  pending_approval: { label: 'Under Review',     bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  active:           { label: 'Active',           bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  paused:           { label: 'Paused',           bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  completed:        { label: 'Completed',        bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  rejected:         { label: 'Rejected',         bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  budget_exhausted: { label: 'Budget Exhausted', bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
};

export default function SellerAdsPage() {
  const { token } = useSelector(s => s.auth);

  const [campaigns,  setCampaigns]  = useState([]);
  const [summary,    setSummary]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [filter,     setFilter]     = useState('');

  const loadData = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const [campRes, sumRes] = await Promise.all([
        axiosInstance.get('/seller/ads/campaigns', {
          params: { page, limit: pagination.limit, status: filter || undefined },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get('/seller/ads/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (campRes.data.success) {
        setCampaigns(campRes.data.data);
        setPagination(campRes.data.pagination);
      }
      if (sumRes.data.success) {
        setSummary(sumRes.data.data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [token, filter, pagination.limit]);

  useEffect(() => {
    loadData(1);
  }, [filter, loadData]);

  const handleAction = async (id, action) => {
    try {
      const { data } = await axiosInstance.post(`/seller/ads/campaigns/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success(`Campaign ${action}ed`);
        loadData(pagination.page);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${action} campaign`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Advertisement Campaigns</h1>
            <p className="text-sm text-slate-500 mt-1">Promote your products and store to increase visibility</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/seller/ads/create"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              <Icon icon="mdi:plus" className="w-5 h-5" />
              Create Campaign
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:eye-outline" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Impressions</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{summary.totalImpressions?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:cursor-default-click-outline" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clicks</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{summary.totalClicks?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:currency-usd" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spend</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">${summary.totalSpend?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:chart-bar" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg CTR</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{summary.avgCtr?.toFixed(2) || '0.00'}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          {['', 'active', 'pending_approval', 'paused', 'draft'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                filter === s
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {s === '' ? 'All' : STATUS_META[s]?.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200 flex items-center gap-2">
            <Icon icon="mdi:alert-circle-outline" className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4">Budget & Bid</th>
                  <th className="px-6 py-4">Performance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Icon icon="svg-spinners:3-dots-fade" className="w-8 h-8 text-violet-600 mx-auto" />
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <Icon icon="mdi:bullhorn-outline" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No campaigns found.</p>
                    </td>
                  </tr>
                ) : (
                  campaigns.map(camp => {
                    const status = STATUS_META[camp.status] || STATUS_META.draft;
                    return (
                      <tr key={camp._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 align-top">
                          <div className="flex gap-3">
                            {camp.type === 'sponsored_store' && camp.bannerUrl ? (
                              <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                                <Image src={camp.bannerUrl} alt="banner" fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                                <Icon icon={camp.type === 'sponsored_store' ? 'mdi:store' : 'mdi:package-variant-closed'} className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <Link href={`/seller/ads/${camp._id}`} className="font-bold text-slate-900 hover:text-violet-600 transition-colors line-clamp-1">
                                {camp.name}
                              </Link>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {camp.type === 'sponsored_store' ? 'Sponsored Profile' : 'Sponsored Products'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <Icon icon="mdi:calendar-range" className="w-3 h-3" />
                                {fmtDate(camp.startDate)} - {fmtDate(camp.endDate)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-700">Total: ${camp.totalBudget.toFixed(2)}</p>
                            <p className="text-xs text-slate-500">Daily: ${camp.dailyBudget.toFixed(2)}</p>
                            <span className="inline-block px-1.5 py-0.5 mt-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                              {camp.biddingType}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="text-xs space-y-1 w-32">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Spent:</span>
                              <span className="font-semibold">${camp.spentBudget?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Impr:</span>
                              <span className="font-semibold">{camp.impressions || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Clicks:</span>
                              <span className="font-semibold">{camp.clicks || 0}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.bg} ${status.text} ${status.border}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            {camp.status === 'active' && (
                              <button onClick={() => handleAction(camp._id, 'pause')} className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center transition-colors" title="Pause">
                                <Icon icon="mdi:pause" className="w-4 h-4" />
                              </button>
                            )}
                            {camp.status === 'paused' && (
                              <button onClick={() => handleAction(camp._id, 'resume')} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors" title="Resume">
                                <Icon icon="mdi:play" className="w-4 h-4" />
                              </button>
                            )}
                            {camp.status === 'draft' && (
                              <button onClick={() => handleAction(camp._id, 'submit')} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors" title="Submit for Approval">
                                <Icon icon="mdi:send-check-outline" className="w-4 h-4" />
                              </button>
                            )}
                            <Link href={`/seller/ads/${camp._id}`} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors" title="View Details">
                              <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                            </Link>
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
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadData(pagination.page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadData(pagination.page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
