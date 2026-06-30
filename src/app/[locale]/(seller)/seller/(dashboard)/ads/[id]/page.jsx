'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';
import Image from 'next/image';

const fmtDate = (d) => d ? moment(d).format('DD MMM YYYY') : '—';
const fmtDateTime = (d) => d ? moment(d).format('DD MMM YYYY, hh:mm A') : '—';

const STATUS_META = {
  draft:            { label: 'Draft',            bg: 'bg-gray-50',    text: 'text-gray-700',    border: 'border-gray-200' },
  pending_approval: { label: 'Under Review',     bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  active:           { label: 'Active',           bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  paused:           { label: 'Paused',           bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  completed:        { label: 'Completed',        bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  rejected:         { label: 'Rejected',         bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  budget_exhausted: { label: 'Budget Exhausted', bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
};

export default function SellerCampaignDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { token } = useSelector(s => s.auth);

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    if (!token || !id) return;
    const fetchCampaign = async () => {
      try {
        const { data } = await axiosInstance.get(`/seller/ads/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setCampaign(data.data);
        }
      } catch (err) {
        toast.error('Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [token, id]);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      const { data } = await axiosInstance.post(`/seller/ads/campaigns/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success(`Campaign ${action}ed`);
        setCampaign(data.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${action} campaign`);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon icon="svg-spinners:3-dots-fade" className="w-8 h-8 text-primary-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center text-slate-500">
        Campaign not found
      </div>
    );
  }

  const status = STATUS_META[campaign.status] || STATUS_META.draft;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center transition-colors">
              <Icon icon="mdi:arrow-left" className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{campaign.name}</h1>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.bg} ${status.text} ${status.border}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Icon icon="mdi:bullhorn-outline" className="w-4 h-4" />
                {campaign.type === 'sponsored_store' ? 'Sponsored Store' : 'Sponsored Products'} • ID: {campaign._id}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {['draft', 'rejected'].includes(campaign.status) && (
              <button
                onClick={() => router.push(`/seller/ads/${campaign._id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
              >
                <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
                Edit Campaign
              </button>
            )}
            {campaign.status === 'active' && (
              <button
                onClick={() => handleAction('pause')}
                disabled={actionLoading === 'pause'}
                className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {actionLoading === 'pause' ? <Icon icon="svg-spinners:180-ring" /> : <Icon icon="mdi:pause" />}
                Pause Campaign
              </button>
            )}
            {campaign.status === 'paused' && (
              <button
                onClick={() => handleAction('resume')}
                disabled={actionLoading === 'resume'}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {actionLoading === 'resume' ? <Icon icon="svg-spinners:180-ring" /> : <Icon icon="mdi:play" />}
                Resume Campaign
              </button>
            )}
            {campaign.status === 'draft' && (
              <button
                onClick={() => handleAction('submit')}
                disabled={actionLoading === 'submit'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {actionLoading === 'submit' ? <Icon icon="svg-spinners:180-ring" /> : <Icon icon="mdi:send" />}
                Submit for Approval
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Rejection Alert */}
        {campaign.status === 'rejected' && campaign.rejectionReason && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800">Campaign Rejected</h3>
              <p className="text-xs text-red-600 mt-1">{campaign.rejectionReason}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Overview */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Icon icon="mdi:chart-timeline-variant" className="w-5 h-5 text-primary-600" />
                Performance Overview
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Impressions</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{(campaign.totalImpressions || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Clicks</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{(campaign.totalClicks || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Spend</p>
                  <p className="text-xl font-black text-slate-900 mt-1">${(campaign.spentBudget || 0).toFixed(2)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">CTR</p>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {campaign.totalImpressions
                      ? ((campaign.totalClicks / campaign.totalImpressions) * 100).toFixed(2)
                      : '0.00'}%
                  </p>
                </div>
              </div>

              {/* Progress Bar for Budget */}
              <div className="mt-8">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-700">Budget Usage</span>
                  <span className="text-slate-500">${campaign.spentBudget?.toFixed(2)} / ${campaign.totalBudget?.toFixed(2)}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((campaign.spentBudget || 0) / campaign.totalBudget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-right">
                  ${(campaign.totalBudget - (campaign.spentBudget || 0)).toFixed(2)} remaining
                </p>
              </div>
            </div>

            {/* Creative Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Icon icon="mdi:palette-outline" className="w-5 h-5 text-primary-600" />
                Creative & Target
              </h2>
              
              {campaign.type === 'sponsored_store' ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-500">Store Tagline</span>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{campaign.storeTagline || '—'}</p>
                  </div>
                  {campaign.bannerUrl && (
                    <div>
                      <span className="text-xs text-slate-500 block mb-2">Banner Image</span>
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200">
                        <Image src={campaign.bannerUrl} alt="Store Banner" fill className="object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-xs text-slate-500 block mb-4">Promoted Products ({campaign.productIds?.length || 0})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {campaign.productIds?.map(prod => (
                      <div key={prod._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                        <div className="w-10 h-10 relative rounded bg-white overflow-hidden flex-shrink-0 border border-slate-100">
                          {prod.images?.[0] ? (
                            <Image src={prod.images[0].url} alt={prod.title} fill className="object-cover" />
                          ) : (
                            <Icon icon="mdi:image-outline" className="w-5 h-5 absolute inset-0 m-auto text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{prod.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{prod.slug}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Details */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Icon icon="mdi:information-outline" className="w-5 h-5 text-primary-600" />
                Campaign Details
              </h2>
              
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className={`text-xs font-bold ${status.text}`}>{status.label}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Daily Budget</span>
                  <span className="text-xs font-bold text-slate-900">${campaign.dailyBudget?.toFixed(2)}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Total Budget</span>
                  <span className="text-xs font-bold text-slate-900">${campaign.totalBudget?.toFixed(2)}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Start Date</span>
                  <span className="text-xs font-bold text-slate-900">{fmtDate(campaign.startDate)}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Est. End Date</span>
                  <span className="text-xs font-bold text-slate-900">{fmtDate(campaign.endDate)}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Created At</span>
                  <span className="text-xs font-bold text-slate-900">{fmtDate(campaign.createdAt)}</span>
                </li>
              </ul>
            </div>

            {/* Status History */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Icon icon="mdi:history" className="w-5 h-5 text-primary-600" />
                Status History
              </h2>
              
              <div className="space-y-4">
                {campaign.statusHistory?.map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5" />
                      {i !== campaign.statusHistory.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-xs font-bold text-slate-900 capitalize">{h.status.replace('_', ' ')}</p>
                      {h.note && <p className="text-[10px] text-slate-500 mt-0.5">{h.note}</p>}
                      <p className="text-[9px] text-slate-400 mt-1">{fmtDateTime(h.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
