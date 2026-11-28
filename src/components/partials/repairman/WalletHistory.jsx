"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { Link } from '@/i18n/navigation';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';

const PAGE_SIZE = 10;

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'earning', label: 'Jobs' },
  { id: 'dispute', label: 'Disputes' },
  { id: 'withdrawal', label: 'Withdrawals' },
  { id: 'topup', label: 'Top-ups' },
];

const CATEGORY = {
  earning: { icon: 'mdi:briefcase-check-outline', wrap: 'bg-green-50 text-green-600' },
  dispute: { icon: 'mdi:scale-balance', wrap: 'bg-red-50 text-red-600' },
  withdrawal: { icon: 'mdi:bank-transfer-out', wrap: 'bg-blue-50 text-blue-600' },
  topup: { icon: 'mdi:wallet-plus-outline', wrap: 'bg-orange-50 text-orange-600' },
};

const STATUS = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const formatMoney = (amount, currency = 'TRY') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount || 0);
  } catch {
    return `${currency} ${amount || 0}`;
  }
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

// Where an entry links to (its job or dispute)
const linkFor = (e) => {
  if (e.category === 'dispute' && e.reference?.bookingId) return `/repair-man/my-jobs/${e.reference.bookingId}/dispute`;
  if (e.category === 'earning' && e.reference?.bookingId) return `/repair-man/my-jobs/${e.reference.bookingId}/detail`;
  return null;
};

function HistoryRow({ entry }) {
  const cat = CATEGORY[entry.category] || CATEGORY.earning;
  const sign = entry.direction === 'credit' ? '+' : entry.direction === 'debit' ? '−' : '';
  const amountColor = entry.direction === 'credit' ? 'text-green-600' : entry.direction === 'debit' ? 'text-red-600' : 'text-gray-400';
  const href = linkFor(entry);
  const subject = entry.reference?.title || (entry.reference?.ref ? `#${entry.reference.ref}` : null);

  return (
    <div className="flex items-start gap-4 py-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cat.wrap}`}>
        <Icon icon={cat.icon} className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-gray-900">{entry.title}</p>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS[entry.status] || STATUS.pending}`}>
            {entry.status}
          </span>
        </div>
        {subject && (
          <p className="text-sm text-gray-700 mt-0.5 truncate">
            {href ? (
              <Link href={href} className="hover:text-orange-600 hover:underline">{subject}</Link>
            ) : subject}
          </p>
        )}
        {entry.description && <p className="text-xs text-gray-500 mt-1">{entry.description}</p>}
        {entry.category === 'earning' && entry.meta?.gross > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Job total {formatMoney(entry.meta.gross, entry.currency)} · commission {formatMoney(entry.meta.commission, entry.currency)}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">{formatDate(entry.date)}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`font-semibold ${amountColor}`}>
          {sign}{formatMoney(entry.amount, entry.currency)}
        </p>
        {entry.direction === 'none' && <p className="text-[11px] text-gray-400 mt-0.5">no balance change</p>}
      </div>
    </div>
  );
}

export default function WalletHistory() {
  const { token } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (nextPage, append) => {
    if (!token) return;
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const { data } = await axiosInstance.get('/repairman/earnings/wallet-history', {
        params: { type: filter, page: nextPage, limit: PAGE_SIZE },
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries((prev) => (append ? [...prev, ...(data.data || [])] : data.data || []));
      setSummary(data.summary || null);
      setPage(nextPage);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      handleError(error);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    load(1, false);
  }, [load]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon icon="mdi:history" className="w-5 h-5 text-orange-500" />
            Wallet History
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Every change to your wallet: jobs, disputes, withdrawals and top-ups.</p>
        </div>
        {summary && (
          <div className="flex gap-3 text-sm">
            <div className="px-3 py-2 rounded-lg bg-green-50">
              <p className="text-xs text-green-700">Money in</p>
              <p className="font-semibold text-green-700">{formatMoney(summary.totalIn, summary.currency)}</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-red-50">
              <p className="text-xs text-red-700">Money out</p>
              <p className="font-semibold text-red-700">{formatMoney(summary.totalOut, summary.currency)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filter === f.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Icon icon="mdi:loading" className="w-7 h-7 text-orange-500 animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-10">
          <Icon icon="mdi:wallet-outline" className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-700 font-medium">No wallet activity yet</p>
          <p className="text-sm text-gray-500">Earnings, disputes, withdrawals and top-ups will show up here.</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {entries.map((e) => <HistoryRow key={e.id} entry={e} />)}
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>Showing {entries.length} of {total}</span>
            {page < totalPages && (
              <button
                type="button"
                onClick={() => load(page + 1, true)}
                disabled={loadingMore}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
