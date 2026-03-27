"use client"

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';


function EarningsReviewsPage() {
  const [reviewsFilter, setReviewsFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState({
    summary: {
      overallRating: 0,
      totalReviews: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStars: 0,
      responseRate: 0,
      repeatClients: 0
    },
    reviews: []
  });

  const { token } = useSelector(state => state.auth);

  // Fetch Reviews and Stats
  const fetchReviewsData = async () => {
    try {
      setLoading(true);
      
      // Fetch reviews
      const reviewsRes = await axiosInstance.get('/reviews/received/all', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 100 }
      });

      // Fetch stats
      const statsRes = await axiosInstance.get('/reviews/stats/my-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (reviewsRes.data.success && statsRes.data.success) {
        const stats = statsRes.data.stats;
        
        setReviewsData({
          summary: {
            overallRating: stats.averageRating || 0,
            totalReviews: stats.totalReviews || 0,
            fiveStars: stats.ratingDistribution?.['5'] || 0,
            fourStars: stats.ratingDistribution?.['4'] || 0,
            threeStars: stats.ratingDistribution?.['3'] || 0,
            twoStars: stats.ratingDistribution?.['2'] || 0,
            oneStars: stats.ratingDistribution?.['1'] || 0,
            responseRate: 100, // Calculate if needed
            repeatClients: 0 // Calculate if needed
          },
          reviews: reviewsRes.data.reviews || []
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Handle response to review
  const handleRespondToReview = async (reviewId, responseText) => {
    try {
      const res = await axiosInstance.post(`/reviews/${reviewId}/respond`, 
        { responseText },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (res.data.success) {
        toast.success('Response submitted successfully');
        fetchReviewsData(); // Refresh reviews
      }
    } catch (error) {
      console.error('Error responding to review:', error);
      toast.error('Failed to submit response');
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  // Helper function to render stars with half-star support
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Icon 
            key={i} 
            icon="heroicons:star-solid" 
            className="w-4 h-4 text-yellow-400" 
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Icon 
            key={i} 
            icon="heroicons:star-solid" 
            className="w-4 h-4 text-yellow-400 opacity-50" 
          />
        );
      } else {
        stars.push(
          <Icon 
            key={i} 
            icon="heroicons:star" 
            className="w-4 h-4 text-gray-300" 
          />
        );
      }
    }
    
    return stars;
  };

  const ReviewsOverview = () => {
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseText, setResponseText] = useState('');

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Reviews Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Icon icon="heroicons:star" className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {reviewsData.summary.overallRating > 0 
                    ? reviewsData.summary.overallRating.toFixed(1) 
                    : '0.0'}
                </p>
                <p className="text-sm text-gray-600">Overall Rating</p>
                <div className="flex mt-1">
                  {renderStars(reviewsData.summary.overallRating)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Icon icon="heroicons:chat-bubble-left" className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{reviewsData.summary.totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon icon="heroicons:arrow-path" className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{reviewsData.summary.repeatClients}</p>
                <p className="text-sm text-gray-600">Repeat Clients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Icon icon="heroicons:chart-pie" className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{reviewsData.summary.responseRate}%</p>
                <p className="text-sm text-gray-600">Response Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h3>
          <div className="space-y-3">
            {[
              { stars: 5, count: reviewsData.summary.fiveStars },
              { stars: 4, count: reviewsData.summary.fourStars },
              { stars: 3, count: reviewsData.summary.threeStars },
              { stars: 2, count: reviewsData.summary.twoStars },
              { stars: 1, count: reviewsData.summary.oneStars }
            ].map(rating => (
              <div key={rating.stars} className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium">{rating.stars}</span>
                  <Icon icon="heroicons:star-solid" className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${reviewsData.summary.totalReviews > 0 ? (rating.count / reviewsData.summary.totalReviews) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">{rating.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Client Reviews</h3>
            <select
              value={reviewsFilter}
              onChange={(e) => setReviewsFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Reviews</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </select>
          </div>

          {reviewsData.reviews.length === 0 ? (
            <div className="text-center py-12">
              <Icon icon="heroicons:chat-bubble-left" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviewsData.reviews
                .filter(r => reviewsFilter === 'all' || r.overallRating.toString() === reviewsFilter)
                .map(review => (
                <div key={review._id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary-600">
                        {review.customerId?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{review.customerId?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Icon 
                                key={i} 
                                icon={i < review.overallRating ? "heroicons:star-solid" : "heroicons:star"} 
                                className={`w-4 h-4 ${i < review.overallRating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">"{review.reviewText}"</p>
                      
                      {/* Repairman Response */}
                      {review.repairmanResponse ? (
                        <div className="bg-gray-50 p-3 rounded-lg mt-3">
                          <p className="text-xs text-gray-500 mb-1">Your Response:</p>
                          <p className="text-gray-700 text-sm">{review.repairmanResponse.text}</p>
                        </div>
                      ) : respondingTo === review._id ? (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                handleRespondToReview(review._id, responseText);
                                setRespondingTo(null);
                                setResponseText('');
                              }}
                              disabled={responseText.trim().length < 3}
                              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText('');
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(review._id)}
                          className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
                        >
                          <Icon icon="heroicons:chat-bubble-left" className="w-4 h-4 mr-1" />
                          Respond to Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h1>
          <p className="text-gray-600">Track your client feedback and ratings</p>
        </div>

        {/* Content */}
        <ReviewsOverview />
      </div>
    </div>
  );
}

export default EarningsReviewsPage;