'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
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
    <div className="rounded-full bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0 font-bold border border-primary-200"
         style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CONVERSATION ITEM
══════════════════════════════════════════════════════════ */
function ConvoItem({ query }) {
  const router  = useRouter();
  const lastMsg = query.lastMessage;
  const unread  = (query.customerUnread || 0) > 0;
  const sellerN = query.sellerId?.name || 'Seller';

  const preview = lastMsg
    ? (lastMsg.senderRole === 'seller' ? '' : 'You: ') + (lastMsg.message || '')
    : query.subject;

  const time = moment(query.updatedAt).calendar(null, {
    sameDay:  'HH:mm',
    lastDay:  '[Yesterday]',
    lastWeek: 'ddd',
    sameElse: 'DD/MM/YYYY',
  });

  return (
    <button
      onClick={() => router.push(`/messages/${query._id}`)}
      className={`w-full text-left flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 transition-all border-b border-gray-100 last:border-0 ${
        unread ? 'bg-primary-50/30' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <Avatar name={sellerN} size={42} />
          {unread && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary-500 border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm truncate ${unread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
              {sellerN}
            </span>
            {unread && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-700">
                {query.customerUnread} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[250px]">
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
          {STATUS_LABEL[query.status] || 'Open'}
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
export default function MessagesPage() {
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();

  const [tab,        setTab]        = useState('customer');
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('all');
  const [queries,    setQueries]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const searchRef = useRef(null);

  const fetchQueries = useCallback(async () => {
    if (!token) { router.push('/login'); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ queryType: tab, page, limit: 20 });
      if (status !== 'all') params.set('status', status);
      const { data } = await axiosInstance.get(`/customer/queries?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setQueries(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [token, tab, status, page, router]);

  useEffect(() => { setPage(1); }, [tab, status]);
  useEffect(() => { fetchQueries(); }, [fetchQueries]);

  const filtered = search.trim()
    ? queries.filter(q =>
        q.subject?.toLowerCase().includes(search.toLowerCase()) ||
        q.sellerId?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : queries;

  const unreadCount = queries.filter(q => q.customerUnread > 0).length;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-72px)] bg-gray-50/50 sm:px-6 lg:px-8 py-6">

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">

        {/* ── Top Bar ── */}
        <div className="flex-shrink-0 border-b border-gray-200">
          <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h1>
              <p className="text-sm text-gray-500 mt-1">
                Your conversations with sellers.
                {unreadCount > 0 && <span className="text-primary-600 font-medium ml-1">({unreadCount} unread)</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Icon icon="solar:magnifer-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full sm:w-64 pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={fetchQueries}
                className="p-2.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                <Icon icon="solar:refresh-linear" className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-6 flex flex-col-reverse md:flex-row md:items-end justify-between gap-4">
            {/* Tabs */}
            <div className="flex gap-6 w-full md:w-auto overflow-x-auto scrollbar-hide">
              {[
                { key: 'customer', label: 'Product Queries' },
                { key: 'order',    label: 'Order Queries' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setStatus('all'); }}
                  className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    tab === key
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Status filters */}
            <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
              {['all', 'open', 'replied', 'closed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    status === s
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── List ── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
              <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <Icon icon="solar:chat-square-linear" className="w-8 h-8 text-gray-400" />
              </div>
              {search ? (
                <>
                  <p className="font-medium text-gray-900">No results for "{search}"</p>
                  <button onClick={() => setSearch('')} className="mt-2 text-sm text-primary-600 font-medium hover:underline">
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-900 mb-1">No conversations yet</p>
                  <p className="text-gray-500 text-sm max-w-sm mb-6">
                    {tab === 'order'
                      ? 'Questions about your orders will appear here.'
                      : 'Questions you ask sellers will appear here.'}
                  </p>
                  <Link
                    href={tab === 'order' ? '/orders' : '/'}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl text-sm transition-colors"
                  >
                    {tab === 'order' ? 'View Orders' : 'Browse Products'}
                  </Link>
                </>
              )}
            </div>
          ) : (
            filtered.map(q => <ConvoItem key={q._id} query={q} />)
          )}
        </div>

        {/* ── Load more ── */}
        {!loading && totalPages > 1 && page < totalPages && (
          <div className="flex-shrink-0 p-4 border-t border-gray-100 text-center bg-gray-50">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Load more conversations
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
