'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';

/* ─── helpers ─────────────────────────────────────────────── */
function StarDisplay({ rating }) {
  if (rating == null) return <span className="text-xs text-gray-400">No rating</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}.0</span>
    </div>
  );
}

function Avatar({ name, size = 36 }) {
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

function StatCard({ icon, label, value, color = 'text-primary-600', bg = 'bg-primary-50' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon icon={icon} className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse flex items-start gap-4 px-6 py-4 border-b border-gray-100">
      <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 mt-1" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 rounded" />
      </div>
      <div className="h-3 w-16 bg-gray-200 rounded mt-1" />
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-center font-bold text-gray-900 text-base mb-1">Delete Review?</h3>
        <p className="text-center text-sm text-gray-500 mb-6">This will permanently remove the review from your product. This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {loading ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4 mx-auto" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Review row ──────────────────────────────────────────── */
function ReviewRow({ review, onDelete }) {
  const customer    = review.userId?.name  || 'Anonymous';
  const productTitle = review.productId?.title || '—';
  const productSlug  = review.productId?.slug;
  const thumb        = review.productId?.images?.[0]?.url;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group">
      {/* Left: customer + comment */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Avatar name={customer} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-semibold text-gray-900 truncate">{customer}</span>
            <span className="text-gray-300">·</span>
            <StarDisplay rating={review.rating} />
          </div>
          {/* Product chip */}
          <div className="flex items-center gap-1.5 mb-1.5">
            {thumb && (
              <img src={thumb} alt="" className="w-5 h-5 rounded object-cover border border-gray-200" />
            )}
            {productSlug ? (
              <a
                href={`/product/${productSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:underline font-medium truncate max-w-[200px]"
              >
                {productTitle}
              </a>
            ) : (
              <span className="text-xs text-gray-500 truncate max-w-[200px]">{productTitle}</span>
            )}
          </div>
          {review.comment && (
            <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-2">{review.comment}</p>
          )}
          {/* Media thumbnails */}
          {(review.images?.length > 0 || review.video?.url) && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {review.images?.map((img, i) => (
                <img key={i} src={img.url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
              ))}
              {review.video?.url && (
                <div className="relative w-10 h-10 rounded-lg border border-gray-200 bg-black overflow-hidden flex items-center justify-center">
                  <video src={review.video.url} className="w-full h-full object-cover opacity-60" />
                  <Icon icon="mdi:play-circle" className="absolute w-5 h-5 text-white" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: date + actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between pl-[48px] sm:pl-0 gap-2 flex-shrink-0">
        <span className="text-xs text-gray-400">{moment(review.createdAt).format('DD MMM YYYY')}</span>
        <button
          onClick={() => onDelete(review._id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete review"
        >
          <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
const RATING_FILTERS = [
  { label: 'All',    value: '' },
  { label: '5★',     value: '5' },
  { label: '4★',     value: '4' },
  { label: '3★',     value: '3' },
  { label: '2★',     value: '2' },
  { label: '1★',     value: '1' },
];

export default function SellerReviewsPage() {
  const { token } = useSelector(s => s.auth);

  const [reviews,     setReviews]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [stats,       setStats]       = useState({ total: 0, avgRating: 0, withRating: 0 });

  const [deleteId,    setDeleteId]    = useState(null);
  const [deleting,    setDeleting]    = useState(false);

  const searchTimer = useRef(null);

  const loadReviews = useCallback(async (pg = page) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 20 });
      if (search.trim())  params.set('search', search.trim());
      if (ratingFilter)   params.set('rating', ratingFilter);

      const { data } = await axiosInstance.get(`/seller/reviews?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const list = data.data || [];
        setReviews(list);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 1);

        // compute stats from full page (approximation — good enough without a dedicated endpoint)
        if (pg === 1 && !search && !ratingFilter) {
          const withRating = list.filter(r => r.rating != null);
          const avg = withRating.length
            ? (withRating.reduce((s, r) => s + r.rating, 0) / withRating.length).toFixed(1)
            : 0;
          setStats({ total: data.pagination?.total || 0, avgRating: avg, withRating: withRating.length });
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [token, search, ratingFilter, page]);

  useEffect(() => { loadReviews(page); }, [ratingFilter, page]);

  const handleSearch = (v) => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); loadReviews(1); }, 400);
  };

  const handleDelete = async () => {
    if (!deleteId || !token) return;
    setDeleting(true);
    try {
      const { data } = await axiosInstance.delete(`/seller/reviews/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setReviews(prev => prev.filter(r => r._id !== deleteId));
        setTotal(prev => Math.max(0, prev - 1));
        toast.success('Review deleted');
        setDeleteId(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-gray-50/50">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto w-full px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Reviews</h1>
              <p className="text-sm text-gray-500 mt-1">
                View and manage customer reviews on your products.
                {total > 0 && <span className="text-primary-600 font-medium ml-1">({total} total)</span>}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Icon icon="solar:magnifer-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search customer, product or comment..."
                  className="w-full sm:w-72 pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                {search && (
                  <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => { setPage(1); loadReviews(1); }}
                className="p-2.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Refresh"
              >
                <Icon icon="solar:refresh-linear" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Rating filter tabs */}
        <div className="max-w-6xl mx-auto w-full px-6 pb-0">
          <div className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-hide pb-0">
            {RATING_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { setRatingFilter(value); setPage(1); }}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  ratingFilter === value
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      {!search && !ratingFilter && page === 1 && (
        <div className="max-w-6xl mx-auto w-full px-6 pt-5 pb-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              icon="solar:star-bold-duotone"
              label="Total Reviews"
              value={total}
              color="text-yellow-500"
              bg="bg-yellow-50"
            />
            <StatCard
              icon="solar:chart-bold-duotone"
              label="Average Rating"
              value={stats.avgRating || '—'}
              color="text-primary-600"
              bg="bg-primary-50"
            />
            <StatCard
              icon="solar:chat-round-bold-duotone"
              label="With Rating"
              value={stats.withRating}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
          </div>
        </div>
      )}

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full px-4 sm:px-6 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <Icon icon="solar:star-line-duotone" className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews found</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                {search
                  ? `No reviews matched "${search}".`
                  : ratingFilter
                  ? `No ${ratingFilter}-star reviews yet.`
                  : "Your products haven't received any reviews yet."}
              </p>
              {(search || ratingFilter) && (
                <button
                  onClick={() => { handleSearch(''); setRatingFilter(''); setPage(1); }}
                  className="mt-4 text-primary-600 font-medium text-sm hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            reviews.map(r => (
              <ReviewRow
                key={r._id}
                review={r}
                onDelete={id => setDeleteId(id)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between py-4 mt-2">
            <p className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{page}</span> of{' '}
              <span className="font-medium text-gray-900">{totalPages}</span>
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

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
