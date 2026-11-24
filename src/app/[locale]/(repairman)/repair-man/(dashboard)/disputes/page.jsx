"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { Link } from '@/i18n/navigation';
import useDisputeLive from '@/hooks/useDisputeLive';

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'resolved', label: 'Resolved' },
  { id: '', label: 'All' },
];

const STATUS_STYLE = {
  open: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  resolving: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-700',
};

const OUTCOME = {
  refund_full: 'Customer refunded in full',
  refund_partial: 'Partial refund to customer',
  mutual_agreement: 'Settled by agreement',
  pay_repairman: 'Paid to you',
  no_action: 'Closed without changes',
};

const label = (v) => String(v || '').replace(/_/g, ' ');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

export default function RepairmanDisputesPage() {
  const { token } = useSelector((state) => state.auth);
  const [tab, setTab] = useState('active');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ active: 0, resolved: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // silent: reload page 1 without the spinner (live updates)
  const load = useCallback(async (nextPage = 1, silent = false) => {
    if (!token) return;
    if (!silent) {
      if (nextPage === 1) setLoading(true);
      else setLoadingMore(true);
    }
    try {
      const { data } = await axiosInstance.get('/disputes/my-disputes', {
        params: { status: tab, page: nextPage, limit: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => (nextPage === 1 ? data.data || [] : [...prev, ...(data.data || [])]));
      setStats(data.stats || { active: 0, resolved: 0, total: 0 });
      setPage(nextPage);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [tab, token]);

  useEffect(() => {
    load(1);
  }, [load]);

  // Live: a dispute about one of my jobs was opened, answered or resolved
  useDisputeLive(null, () => load(1, true));

  const countFor = (id) => (id === 'active' ? stats.active : id === 'resolved' ? stats.resolved : stats.total);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Problems raised about your jobs. Payment for a job stays on hold while its dispute is open.
          </p>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id || 'all'}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {t.label} <span className="opacity-75">({countFor(t.id)})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Icon icon="solar:shield-check-bold-duotone" className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-gray-900">
              {tab === 'active' ? 'No open disputes' : tab === 'resolved' ? 'No resolved disputes yet' : 'No disputes'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Disputes about your jobs will show up here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((d) => {
              const bookingId = d.bookingId?._id || d.bookingId;
              const job = d.jobId;
              const title = job?.title || d.bookingId?.bookingDetails?.serviceType || 'Repair job';
              const outcome = d.resolution?.resolutionType;
              return (
                <li key={d._id}>
                  <Link
                    href={`/repair-man/my-jobs/${bookingId}/dispute`}
                    className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-sm transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900 capitalize">{label(d.category)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${STATUS_STYLE[d.status] || 'bg-gray-100 text-gray-700'}`}>
                            {label(d.status)}
                          </span>
                          {d.needsMyReply && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Needs your reply</span>
                          )}
                          {d.lastFromSupport && d.status !== 'resolved' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Support replied</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">{title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {d.raisedByMe ? 'Opened by you' : `Opened by ${d.raisedBy?.userId?.name || 'the customer'}`}
                          {' · '}{fmtDate(d.createdAt)}
                          {' · '}{d.responseCount} {d.responseCount === 1 ? 'reply' : 'replies'}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        {outcome ? (
                          <>
                            <p className="font-medium text-gray-900">{OUTCOME[outcome] || label(outcome)}</p>
                            {outcome !== 'refund_full' && outcome !== 'no_action' && (
                              <p className="text-xs text-blue-700">You received ₺{d.resolution?.repairmanPaid || 0}</p>
                            )}
                            {d.resolution?.walletOwed > 0 && (
                              <p className="text-xs text-amber-700">₺{d.resolution.walletOwed} from next earnings</p>
                            )}
                          </>
                        ) : d.deadlines?.responseDeadline && d.needsMyReply ? (
                          <p className="text-xs text-red-700">Reply by {fmtDate(d.deadlines.responseDeadline)}</p>
                        ) : (
                          <p className="text-xs text-gray-500">Waiting for our team</p>
                        )}
                        <Icon icon="heroicons:chevron-right" className="w-5 h-5 text-gray-400 ml-auto mt-2" />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && page < totalPages && (
          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={() => load(page + 1)}
              disabled={loadingMore}
              className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
