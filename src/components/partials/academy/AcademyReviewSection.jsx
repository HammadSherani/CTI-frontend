'use client'
import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useSelector } from 'react-redux'
import axiosInstance from '@/config/axiosInstance'
import { toast } from 'react-toastify'
import Image from 'next/image'
import SmallLoader from '@/components/SmallLoader'

export default function AcademyReviewSection({ slug }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useSelector(s => s.auth || {})

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get(`/academic/${slug}/reviews`)
      if (res.data?.success) {
        setReviews(res.data.data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) fetchReviews()
  }, [slug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please log in to submit a review')
      return
    }
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      const res = await axiosInstance.post(`/academic/${slug}/reviews`, { rating, reviewText })
      if (res.data?.success) {
        toast.success('Review submitted successfully!')
        setReviews([res.data.data, ...reviews])
        setRating(0)
        setReviewText('')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Course Reviews</h2>

      {/* Review Form */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  icon="mdi:star"
                  className={`text-3xl transition-colors ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all"
              rows="4"
              placeholder="What did you think of this course?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Reviews ({reviews.length})</h3>
        {loading ? (
          <div className="py-8"><SmallLoader /></div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                  {review.userId?.profileImage ? (
                    <Image
                      src={review.userId.profileImage}
                      alt={review.userId?.name || 'User'}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    (review.userId?.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.userId?.name || 'Anonymous'}</span>
                    <span className="text-sm text-gray-500">• {new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-yellow-400 mb-2 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon key={star} icon="mdi:star" className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.reviewText}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this course!</p>
        )}
      </div>
    </div>
  )
}
