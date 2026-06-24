'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { useRouter } from '@/i18n/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const STATUS_COLORS = {
  open:    'text-emerald-600 bg-emerald-50 ring-emerald-500/20',
  replied: 'text-blue-600 bg-blue-50 ring-blue-500/20',
  closed:  'text-gray-500 bg-gray-50 ring-gray-500/20',
};
const STATUS_LABEL = { open: 'Open', replied: 'Replied', closed: 'Closed' };

function Avatar({ name, size = 44 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 text-primary-700 bg-primary-100 font-bold select-none border border-primary-200"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STATS BAR
══════════════════════════════════════════════════════════ */
function StatPill({ label, value, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-600 text-white shadow-sm'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
      }`}
    >
      {label} <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs ${active ? 'bg-primary-700' : 'bg-gray-100 text-gray-700'}`}>{value}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   CONVERSATION ROW
══════════════════════════════════════════════════════════ */
function ConvoRow({ query }) {
  const router    = useRouter();
  const unread    = (query.sellerUnread || 0) > 0;
  const isOrder   = query.queryType === 'order';
  const custName  = query.customerName || 'Customer';
  const lastMsg   = query.messages?.[0];

  const preview = lastMsg
    ? (lastMsg.senderRole === 'customer' ? '' : 'You: ') + (lastMsg.message || '')
    : query.subject;

  const time = moment(query.updatedAt).calendar(null, {
    sameDay:  'HH:mm',
    lastDay:  '[Yesterday]',
    lastWeek: 'ddd',
    sameElse: 'DD/MM/YYYY',
  });

  return (
    <button
      onClick={() => router.push(`/seller/enquiries/${query._id}`)}
      className={`w-full text-left flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 transition-all border-b border-gray-100 last:border-0 ${
        unread ? 'bg-primary-50/30' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <Avatar name={custName} size={42} />
          {unread && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary-500 border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm truncate ${unread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
              {custName}
            </span>
            {unread && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-700">
                {query.sellerUnread} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">
              {query.subject}
            </span>
            <span className="text-gray-300 mx-1">•</span>
            <span className={`text-[13px] truncate ${unread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
              {preview}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 mt-2 sm:mt-0 pl-[58px] sm:pl-0 flex-shrink-0">
        <span className={`text-xs ${unread ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
          {time}
        </span>
        <span className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md ring-1 ring-inset ${STATUS_COLORS[query.status] || STATUS_COLORS.open}`}>
          {STATUS_LABEL[query.status]}
        </span>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   SKELETON
══════════════════════════════════════════════════════════ */
function Skeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 animate-pulse border-b border-gray-100">
      <div className="w-[42px] h-[42px] rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
        <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function EnquiriesPage() {
  const router = useRouter();
  const { token } = useSelector(s => s.auth);

  const [activeTab,    setActiveTab]    = useState('customer');
  const [queries,      setQueries]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [stats,        setStats]        = useState({ open: 0, replied: 0, closed: 0, unread: 0 });
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [search,       setSearch]       = useState('');
  const searchRef = useRef(null);

  /* ── load stats ── */
  const loadStats = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axiosInstance.get('/seller/queries/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setStats(data.data);
    } catch { /* silent */ }
  }, [token]);

  /* ── load queries ── */
  const loadQueries = useCallback(async (pg = page) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: activeTab, page: pg, limit: 25 });
      if (filterStatus) params.set('status', filterStatus);
      if (search.trim()) params.set('customerName', search.trim());

      const { data } = await axiosInstance.get(`/seller/queries?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setQueries(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, filterStatus, search, page]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { setPage(1); }, [activeTab, filterStatus]);
  useEffect(() => { loadQueries(page); }, [activeTab, filterStatus, page]);

  /* debounced search */
  const searchTimer = useRef(null);
  const handleSearch = (v) => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); loadQueries(1); }, 400);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilterStatus('');
    setSearch('');
    setPage(1);
  };

  const refresh = () => { loadStats(); loadQueries(page); };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-gray-50/50">

      {/* ── Top Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto w-full px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Enquiries</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your messages and order questions. 
                {stats.unread > 0 && <span className="text-primary-600 font-medium ml-1">({stats.unread} unread)</span>}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Icon icon="solar:magnifer-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full sm:w-64 pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                {search && (
                  <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={refresh}
                className="p-2.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Refresh"
              >
                <Icon icon="solar:refresh-linear" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="max-w-6xl mx-auto w-full px-6 flex flex-col-reverse md:flex-row md:items-end justify-between gap-4 pb-0">
          
          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200 w-full md:w-auto overflow-x-auto scrollbar-hide">
            {[
              { key: 'customer', label: 'Product Queries' },
              { key: 'order',    label: 'Order Queries' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === key
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
            <StatPill label="All" value={total} active={!filterStatus} onClick={() => setFilterStatus('')} />
            <StatPill label="Open" value={stats.open} active={filterStatus === 'open'} onClick={() => setFilterStatus(p => p === 'open' ? '' : 'open')} />
            <StatPill label="Replied" value={stats.replied} active={filterStatus === 'replied'} onClick={() => setFilterStatus(p => p === 'replied' ? '' : 'replied')} />
            <StatPill label="Closed" value={stats.closed} active={filterStatus === 'closed'} onClick={() => setFilterStatus(p => p === 'closed' ? '' : 'closed')} />
          </div>

        </div>
      </div>

      {/* ── Conversation List ── */}
      <div className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
          ) : queries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <Icon icon="solar:inbox-line-duotone" className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No messages found</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                {search ? `No conversations matched your search "${search}".` : `You don't have any ${activeTab === 'order' ? 'order' : 'product'} enquiries yet.`}
              </p>
              {search && (
                <button onClick={() => handleSearch('')} className="mt-4 text-primary-600 font-medium text-sm hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            queries.map(q => <ConvoRow key={q._id} query={q} />)
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between py-4 mt-2">
            <p className="text-sm text-gray-500">
              Showing page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
