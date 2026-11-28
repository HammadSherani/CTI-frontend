"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import SummaryCards, { SummaryCardSkeleton } from '@/components/SumamryCards';

const PAGE_SIZE = 6;

const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60],
  ];
  for (const [name, secs] of units) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n} ${name}${n > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';

const renderStars = (rating, size = 'w-5 h-5') =>
  Array(5).fill(0).map((_, i) => (
    <Icon
      key={i}
      icon={i < rating ? 'heroicons:star-solid' : 'heroicons:star'}
      className={`${size} ${i < rating ? 'text-orange-500' : 'text-gray-300'}`}
    />
  ));

function ReviewCard({ review, token, onReplied }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState(review.repairmanResponse?.text || '');
  const [saving, setSaving] = useState(false);

  const customer = review.customerId || {};
  const device = [review.deviceRepaired?.brand, review.deviceRepaired?.model].filter(Boolean).join(' ');
  const response = review.repairmanResponse;

  const submitReply = async () => {
    if (replyText.trim().length < 2) {
      toast.error('Please write a reply');
      return;
    }
    setSaving(true);
    try {
      const { data } = await axiosInstance.post(
        `/reviews/${review._id}/respond`,
        { responseText: replyText.trim() },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      toast.success(response?.text ? 'Reply updated' : 'Reply posted');
      setReplying(false);
      onReplied(review._id, data?.review?.repairmanResponse || { text: replyText.trim(), respondedAt: new Date() });
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow transition-shadow">
      <div className="flex gap-4 items-start justify-between">
        <div className="w-12 h-12 bg-primary-100 text-primary-700 font-semibold rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center">
          {customer.profileImage ? (
            <img src={customer.profileImage} alt={customer.name || 'Customer'} className="w-full h-full object-cover" />
          ) : (
            initials(customer.name)
          )}
        </div>

        <div className="flex-1 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">{customer.name || 'Customer'}</p>
            <p className="text-xs text-gray-500">{timeAgo(review.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex">{renderStars(review.overallRating)}</div>
            {device && (
              <span className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-900 border border-zinc-300 text-xs font-medium rounded-lg">
                {device}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-gray-700 text-sm leading-relaxed">
        {review.reviewText || <span className="italic text-gray-400">No written feedback</span>}
      </p>

      {response?.text && !replying && (
        <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-orange-700 mb-1">
            Your reply {response.respondedAt && <span className="font-normal text-orange-500">· {timeAgo(response.respondedAt)}</span>}
          </p>
          <p className="text-sm text-gray-700">{response.text}</p>
        </div>
      )}

      {replying && (
        <div className="mt-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Write a reply to this customer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => { setReplying(false); setReplyText(response?.text || ''); }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitReply}
              disabled={saving}
              className="px-4 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
            >
              {saving ? 'Saving...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mt-6 text-sm">
        <span className="flex items-center gap-1 text-gray-500">
          <Icon icon="heroicons:hand-thumb-up" className="w-5 h-5" />
          {review.helpfulVotes || 0} found this helpful
        </span>
        {!replying && (
          <button
            type="button"
            onClick={() => setReplying(true)}
            className="text-orange-600 underline cursor-pointer hover:text-orange-700 font-medium flex items-center gap-1"
          >
            {response?.text ? 'Edit Reply' : 'Reply To Review'}
            <Icon icon="heroicons:arrow-right" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

const ReviewsPage = () => {
  const { token } = useSelector(state => state.auth);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const authHeaders = { headers: { Authorization: 'Bearer ' + token } };

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const { data } = await axiosInstance.get('/reviews/stats/my-stats', authHeaders);
      setStats(data?.stats || null);
    } catch (error) {
      handleError(error);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  const fetchReviews = useCallback(async (pageToLoad, rating, append) => {
    try {
      append ? setLoadingMore(true) : setReviewsLoading(true);
      const { data } = await axiosInstance.get('/reviews/received/all', {
        ...authHeaders,
        params: { page: pageToLoad, limit: PAGE_SIZE, ...(rating ? { rating } : {}) },
      });
      const list = data?.reviews || [];
      setReviews(prev => (append ? [...prev, ...list] : list));
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 1);
      setPage(pageToLoad);
    } catch (error) {
      handleError(error);
    } finally {
      append ? setLoadingMore(false) : setReviewsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchStats();
  }, [token, fetchStats]);

  useEffect(() => {
    if (!token) return;
    fetchReviews(1, ratingFilter, false);
  }, [token, ratingFilter, fetchReviews]);

  const handleReplied = (reviewId, repairmanResponse) => {
    const wasFirstReply = !reviews.find(r => r._id === reviewId)?.repairmanResponse?.text;
    setReviews(prev => prev.map(r => (r._id === reviewId ? { ...r, repairmanResponse } : r)));
    if (wasFirstReply) fetchStats(); // response rate changed
  };

  const totalReviews = stats?.totalReviews || 0;
  const summaryData = [
    { label: 'Total Reviews', value: totalReviews, icon: 'mdi:star-outline' },
    { label: 'Overall Rating', value: totalReviews ? Number(stats.averageRating).toFixed(1) : '—', icon: 'mdi:star-half-full' },
    { label: 'Repeated Clients', value: stats?.repeatedClients ?? 0, icon: 'mdi:account-multiple-outline' },
    { label: 'Response Rate', value: `${stats?.responseRate ?? 0}%`, icon: 'mdi:chart-line' },
  ];

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = stats?.ratingDistribution?.[String(stars)] || 0;
    return { stars, count, percentage: totalReviews ? Math.round((count / totalReviews) * 100) : 0 };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2 text-lg">Track your client feedback and ratings</p>
        </div>

        <div className="mb-4">
          {statsLoading ? <SummaryCardSkeleton /> : <SummaryCards data={summaryData} />}
        </div>

        {/* Rating Distribution */}
        <div className="bg-white mt-10 rounded-3xl border border-gray-200 p-8 mb-12 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Rating Distribution</h3>
          <p className="text-sm text-gray-500 mb-6">
            {totalReviews
              ? `Breakdown of ratings from ${totalReviews} verified customer${totalReviews > 1 ? 's' : ''}. Click a row to filter.`
              : 'No ratings yet'}
          </p>

          <div className="space-y-3">
            {ratingDistribution.map((item) => (
              <button
                type="button"
                key={item.stars}
                onClick={() => setRatingFilter(prev => (prev === item.stars ? null : item.stars))}
                disabled={!item.count && ratingFilter !== item.stars}
                className={`w-full flex items-center gap-4 rounded-lg px-2 py-1 transition-colors disabled:cursor-default ${
                  ratingFilter === item.stars ? 'bg-orange-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 w-10">
                  <span className="text-sm font-medium text-gray-700">{item.stars}</span>
                  <Icon icon="heroicons:star-solid" className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="text-sm font-medium text-gray-700">{item.count}</span>
                  <span className="text-xs text-gray-400"> ({item.percentage}%)</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold text-gray-900">Recent Client Reviews</h3>
              {ratingFilter && (
                <button
                  type="button"
                  onClick={() => setRatingFilter(null)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full"
                >
                  {ratingFilter} stars
                  <Icon icon="mdi:close" className="w-3 h-3" />
                </button>
              )}
            </div>
            {!reviewsLoading && (
              <p className="text-gray-500">Showing {reviews.length} of {total} reviews</p>
            )}
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <Icon icon="mdi:loading" className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Icon icon="heroicons:star" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">
                {ratingFilter ? `No ${ratingFilter}-star reviews yet` : 'No reviews yet'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Reviews appear here after customers rate a completed repair.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} token={token} onReplied={handleReplied} />
              ))}
            </div>
          )}

          {!reviewsLoading && page < totalPages && (
            <div className="flex justify-center items-center mx-auto mt-10">
              <button
                type="button"
                onClick={() => fetchReviews(page + 1, ratingFilter, true)}
                disabled={loadingMore}
                className="bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 py-2 px-4 rounded-lg disabled:opacity-60"
              >
                {loadingMore ? 'Loading...' : 'Load More Reviews'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
