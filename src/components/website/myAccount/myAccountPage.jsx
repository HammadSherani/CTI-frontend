'use client';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import handleError from '@/helper/handleError';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Button from '@/components/ui/button';
import axiosInstance from '@/config/axiosInstance';


const JobDescription = ({ job }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 🔥 Handle both job posting and quotation descriptions
  const description = job?.description ||
    job?.quotationId?.serviceDetails?.description ||
    '';
  const wordLimit = 100;

  const getShortDescription = () => {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  };

  return (
    <div className="job-description mb-4">
      <h3 className="text-sm leading-5 mb-1">
        {isExpanded ? description : getShortDescription()}
      </h3>
      {description.split(' ').length > wordLimit && (
        <button
          className="text-sm text-primary-500 mt-2 hover:underline focus:outline-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'See Less' : 'See More'}
        </button>
      )}
    </div>
  );
};

const RepairJobCard = ({ job }) => {
  const router = useRouter();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'PKR') => {
    if (!amount || amount === 0) return 'Not specified';
    return `${currency} ${amount.toLocaleString()}`;
  };

  const isJobExpiringSoon = () => {
    if (!job?.expiresAt) return false;
    const expiryDate = new Date(job.expiresAt);
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysLeft <= 2 && daysLeft > 0;
  };

  const isJobExpired = () => {
    if (!job?.expiresAt) return false;
    return new Date(job.expiresAt) < new Date();
  };

  const isQuotationBased = job?.bookingSource === 'direct_message';

  const deviceInfo = isQuotationBased
    ? job?.quotationId?.deviceInfo
    : job?.deviceInfo;

  const services = isQuotationBased
    ? job?.quotationId?.deviceInfo?.repairServices || []
    : job?.services || [];

  const pricing = isQuotationBased
    ? job?.quotationId?.pricing
    : job?.budget;

  const deviceName = isQuotationBased
    ? `${deviceInfo?.brandName || 'Unknown'} ${deviceInfo?.modelName || ''} - ${services.join(', ')}`
    : `${deviceInfo?.brand || 'Unknown'} ${deviceInfo?.model || ''} - ${services.join(', ')}`;

  const totalOffer = job?.offers?.length || 0;

  const handleCardClick = () => {
    if (isQuotationBased) {
      router.push(`/my-account/${job?._id}/job-details`);
    } else {
      router.push(`/my-account/${job?._id}/job-details`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white hover:bg-gray-100 hover:cursor-pointer border rounded-xl p-6 shadow-sm hover:shadow-sm transition-all duration-200 hover:border-gray-300 ${isJobExpired() ? 'opacity-75 border-red-200' : 'border-gray-200'
        }`}
    >
      <div className="flex justify-between flex-1 mb-3">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-1">
            <div>
              <h3 className="font-bold flex-1 text-gray-800 line-clamp-3 min-w-[70%] max-w-[98%] text-lg capitalize">
                {deviceName}
              </h3>

              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${isQuotationBased
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
                  }`}>
                  {isQuotationBased ? 'Direct Message' : 'Job Posting'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <div className="text-right">
            {isQuotationBased ? (
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(pricing?.totalAmount, pricing?.currency)}
              </p>
            ) : (
              pricing?.min && pricing?.max ? (
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(pricing.min, pricing.currency)} -{' '}
                  {formatCurrency(pricing.max, pricing.currency)}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Not specified</p>
              )
            )}
          </div>
        </div>
      </div>

      <JobDescription job={job} />

      {services && services.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Required Services</h4>
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <span
                key={index}
                className="px-4 py-2 text-sm font-medium text-primary-800 rounded-lg border"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {(job?.bookingStatus) && (
            <span className="inline-block bg-primary-100 text-primary-800 font-medium px-3 py-1 rounded-full capitalize">
              {job?.bookingStatus}
            </span>
          )}

          {!isQuotationBased && job?.expiresAt && (
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Icon icon="mdi:clock-outline" className="w-4 h-4" />
              <span
                className={`font-medium ${isJobExpiringSoon() || isJobExpired() ? 'text-red-600' : 'text-gray-600'
                  }`}
              >
                Expires: {formatDate(job.expiresAt)}
              </span>
            </div>
          )}

          {isQuotationBased && job?.repairman && (
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Icon icon="mdi:account" className="w-4 h-4" />
              <span className="font-medium text-gray-600">
                {job.repairman.name}
              </span>
            </div>
          )}


        </div>



        {!isQuotationBased && (
          <div className="flex items-center gap-2">
            Offers Received: {totalOffer}
          </div>
        )}
      </div>

      {job.bookingStatus === "delivered" && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800 leading-relaxed">
            Your repairman has delivered the device. Please review the device carefully and, if everything is satisfactory,
            mark this job as <span className="font-semibold">Closed</span> to confirm the completion.
            If the job is not closed within <span className="font-semibold">15 days</span>, our support team will automatically
            close it and release the payment to the repairman.
            Kindly note that after this, the payment will be <span className="font-semibold text-red-600">non-refundable</span>.
          </p>
        </div>
      )}


      {job.bookingStatus === "closed" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800 leading-relaxed">
            This job has been <span className="font-semibold">successfully closed</span>.
            The repairman has delivered your device, and the payment has been released.
            Thank you for using our service! If you experience any issues after delivery,
            please contact our <span className="font-semibold">support team</span> for assistance.
          </p>
        </div>
      )}



    </div>
  );
};

const ReviewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { token } = useSelector(state => state.auth);

  const fetchCompletedJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/reviews/my-completed-jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        setJobs(res.data.data.completedJobs || []);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (jobId, bookingId, repairmanId) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosInstance.post('/reviews', {
        bookingId: bookingId,
        jobId: jobId,
        repairmanId: repairmanId,
        overallRating: rating,
        reviewText: reviewText
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        toast.success('Review submitted successfully!');
        setSelectedJob(null);
        setRating(0);
        setReviewText('');
        fetchCompletedJobs();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount, currency = 'PKR') => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading completed jobs...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="heroicons:clipboard-document-check" className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Completed Jobs</h2>
          <p className="text-gray-600">You don't have any completed jobs to review yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Completed Jobs</h1>
          <p className="text-gray-600">Share your experience and help other customers</p>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {jobs.map((job) => {
            // 🔥 Determine booking source
            const isQuotationBased = job.bookingSource === 'direct_message';

            // 🔥 Get device info from appropriate source
            const deviceInfo = isQuotationBased
              ? job.quotationId?.deviceInfo
              : job.jobId?.deviceInfo;

            // 🔥 Get services from appropriate source
            const services = isQuotationBased
              ? job.quotationId?.deviceInfo?.repairServices
              : job.jobId?.services;

            // 🔥 Get description from appropriate source
            const description = isQuotationBased
              ? job.quotationId?.serviceDetails?.description
              : job.jobId?.description;

            return (
              <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Job Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* 🔥 Device Title */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {isQuotationBased
                          ? `${deviceInfo?.brandName || 'Unknown'} ${deviceInfo?.modelName || ''}`
                          : `${deviceInfo?.brand || 'Unknown'} ${deviceInfo?.model || ''}`
                        }
                      </h3>

                      {/* 🔥 Description */}
                      {description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm">
                        {/* 🔥 Services */}
                        {services && services.length > 0 && (
                          <span className="flex items-center text-gray-500">
                            <Icon icon="heroicons:wrench-screwdriver" className="w-4 h-4 mr-1" />
                            {services.join(', ')}
                          </span>
                        )}

                        {/* 🔥 Completion Date */}
                        <span className="flex items-center text-gray-500">
                          <Icon icon="heroicons:calendar" className="w-4 h-4 mr-1" />
                          Completed {new Date(job.timeline?.completedAt || job.timeline?.deliveredAt).toLocaleDateString()}
                        </span>

                        {/* 🔥 Source Badge */}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isQuotationBased
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {isQuotationBased ? 'Direct Message' : 'Job Posting'}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Icon icon="heroicons:check-circle" className="w-4 h-4 mr-1" />
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Repairman Info */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary-700">
                        {job.repairmanId?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{job.repairmanId?.name}</p>
                      <p className="text-sm text-gray-500">{job.repairmanId?.repairmanProfile?.shopName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(job.bookingDetails?.pricing?.totalAmount, job.bookingDetails?.pricing?.currency)}
                      </p>
                      <p className="text-xs text-gray-500">Total paid</p>
                    </div>
                  </div>
                </div>

                {/* Review Section */}
                <div className="p-6 bg-gray-50">
                  {job.review ? (
                    // Already Reviewed - Show Review
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Your Review</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(job.review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Star Rating Display */}
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={star}
                            icon="heroicons:star-solid"
                            className={`w-6 h-6 ${star <= job.review.overallRating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {job.review.overallRating} out of 5
                        </span>
                      </div>

                      {/* Review Text */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700">{job.review.reviewText}</p>
                      </div>

                      {/* Repairman Response */}
                      {job.review.repairmanResponse && (
                        <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                          <div className="flex items-start space-x-3">
                            <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5 text-primary-600 mt-1" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-primary-900 mb-1">Repairman's Response</p>
                              <p className="text-sm text-gray-700">{job.review.repairmanResponse.text}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(job.review.repairmanResponse.respondedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Badge */}
                      <div className="flex items-center text-sm text-green-600">
                        <Icon icon="heroicons:check-circle-solid" className="w-5 h-5 mr-1" />
                        Review submitted successfully
                      </div>
                    </div>
                  ) : selectedJob === job._id ? (
                    // 🔥 IMPROVED Write Review Form
                    <div className="space-y-6">
                      {/* 🔥 Header with visual indicator */}
                      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">Write Your Review</h4>
                          <p className="text-sm text-gray-500 mt-1">Share your experience with this service</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedJob(null);
                            setRating(0);
                            setReviewText('');
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                        </button>
                      </div>

                      {/* 🔥 Progress Indicator */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${rating > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {rating > 0 ? <Icon icon="heroicons:check" className="w-5 h-5" /> : '1'}
                          </div>
                          <span className={rating > 0 ? 'text-green-700 font-medium' : 'text-gray-500'}>
                            Rate Service
                          </span>
                        </div>
                        <div className="flex-1 h-px bg-gray-200 mx-3"></div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${reviewText.trim().length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {reviewText.trim().length > 0 ? <Icon icon="heroicons:check" className="w-5 h-5" /> : '2'}
                          </div>
                          <span className={reviewText.trim().length > 0 ? 'text-green-700 font-medium' : 'text-gray-500'}>
                            Write Review
                          </span>
                        </div>
                      </div>

                      {/* 🔥 Star Rating with Enhanced UI */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-dashed border-yellow-200">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-base font-semibold text-gray-900 flex items-center">
                            <Icon icon="heroicons:star" className="w-5 h-5 mr-2 text-yellow-500" />
                            Rate Your Experience
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          {rating === 0 && (
                            <span className="text-xs text-orange-600 font-medium animate-pulse">
                              👈 Required
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                          {rating === 0 && "Tap on the stars to rate"}
                          {rating === 1 && "😞 Poor - Not satisfied at all"}
                          {rating === 2 && "😕 Below Average - Below expectations"}
                          {rating === 3 && "😐 Average - Met basic expectations"}
                          {rating === 4 && "😊 Good - Satisfied with service"}
                          {rating === 5 && "🌟 Excellent - Exceeded expectations!"}
                        </p>

                        <div className="flex items-center justify-center space-x-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="focus:outline-none transition-all duration-200 hover:scale-125 active:scale-95"
                            >
                              <Icon
                                icon={star <= (hoverRating || rating) ? "heroicons:star-solid" : "heroicons:star"}
                                className={`w-12 h-12 transition-colors duration-200 ${star <= (hoverRating || rating)
                                  ? 'text-yellow-400 drop-shadow-lg'
                                  : 'text-gray-300'
                                  }`}
                              />
                            </button>
                          ))}
                        </div>

                        {rating > 0 && (
                          <div className="mt-4 text-center">
                            <span className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-semibold text-gray-900 shadow-sm">
                              <Icon icon="heroicons:star-solid" className="w-4 h-4 mr-1 text-yellow-400" />
                              {rating} out of 5 stars
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 🔥 Review Text with Character Counter */}
                      <div>
                        <label className="block text-base font-semibold text-gray-900 mb-2 flex items-center">
                          <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5 mr-2 text-primary-500" />
                          Your Review
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <p className="text-sm text-gray-600 mb-3">
                          Tell us about your experience. What went well? What could be improved?
                        </p>
                        <div className="relative">
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Example: The repair was done professionally and quickly. The repairman was friendly and explained everything clearly. My device is working perfectly now!"
                            rows={5}
                            maxLength={500}
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all focus:outline-none ${reviewText.trim().length === 0
                              ? 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                              : 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                              }`}
                          />
                          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${reviewText.length > 450
                              ? 'bg-red-100 text-red-600'
                              : reviewText.length > 300
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-500'
                              }`}>
                              {reviewText.length}/500
                            </span>
                          </div>
                        </div>
                        {reviewText.trim().length > 0 && reviewText.trim().length < 20 && (
                          <p className="text-xs text-orange-600 mt-2 flex items-center">
                            <Icon icon="heroicons:information-circle" className="w-4 h-4 mr-1" />
                            Please write at least 20 characters for a meaningful review
                          </p>
                        )}
                      </div>

                      {(rating === 0 || !reviewText.trim()) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                          <Icon icon="heroicons:light-bulb" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">Before you submit:</p>
                            <ul className="text-sm text-blue-700 mt-2 space-y-1">
                              {rating === 0 && (
                                <li className="flex items-center">
                                  <Icon icon="heroicons:x-circle" className="w-4 h-4 mr-2 text-red-500" />
                                  Please select a star rating above
                                </li>
                              )}
                              {!reviewText.trim() && (
                                <li className="flex items-center">
                                  <Icon icon="heroicons:x-circle" className="w-4 h-4 mr-2 text-red-500" />
                                  Please write your review
                                </li>
                              )}
                              {reviewText.trim().length > 0 && reviewText.trim().length < 20 && (
                                <li className="flex items-center">
                                  <Icon icon="heroicons:exclamation-triangle" className="w-4 h-4 mr-2 text-yellow-500" />
                                  Review should be at least 20 characters
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleSubmitReview(
                            isQuotationBased ? null : job.jobId?._id,
                            job._id,
                            job.repairmanId._id
                          )}
                          disabled={submitting || rating === 0 || !reviewText.trim() || reviewText.trim().length < 20}
                          className="w-full sm:flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-semibold text-base shadow-lg disabled:shadow-none transform hover:scale-105 disabled:scale-100 active:scale-95"
                        >
                          {submitting ? (
                            <>
                              <Icon icon="heroicons:arrow-path" className="w-5 h-5 mr-2 animate-spin" />
                              Submitting Your Review...
                            </>
                          ) : (
                            <>
                              <Icon icon="heroicons:paper-airplane" className="w-5 h-5 mr-2" />
                              Submit Review
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJob(null);
                            setRating(0);
                            setReviewText('');
                          }}
                          disabled={submitting}
                          className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                      <button
                        onClick={() => setSelectedJob(job._id)}
                        className="relative w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center font-semibold text-base shadow-lg transform group-hover:scale-105 active:scale-95"
                      >
                        <Icon icon="heroicons:star" className="w-6 h-6 mr-2" />
                        Write a Review for This Job
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function MyAccountPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [loading, setLoading] = useState(false);
  const { token } = useSelector(state => state.auth);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/repair-jobs/my-jobs", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setJobs(data.data.jobs);
      console.log(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [])

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, filterPriority]);

  const tabs = [
    { id: 'all', label: 'All Jobs', icon: 'mdi:view-list' },
    { id: 'open', label: 'Open', icon: 'mdi:clock-outline' },
    { id: 'offers_received', label: 'Offer Received', icon: 'mdi:clock-outline' },
    { id: 'booked', label: 'Booked', icon: 'mdi:clock-outline' },
    { id: 'in_progress', label: 'In Progress', icon: 'mdi:cog' },
    { id: 'completed', label: 'Completed', icon: 'mdi:check-circle' },
    { id: 'disputed', label: 'Disputed', icon: 'mdi:check-circle' },
    { id: 'review', label: "Reviews", icon: 'mdi:check-circle' }
  ];

  const getJobCounts = () => {
    return {
      all: jobs.length,
      open: jobs.filter(job => job.status === 'open').length,
      offers_received: jobs.filter(job => job.status === "offers_received").length,

      booked: jobs.filter(job =>
        job.status === 'booked' ||
        job.bookingStatus === 'confirmed' ||
        job.bookingStatus === 'repairman_notified' ||
        job.bookingStatus === 'scheduled'
      ).length,

      in_progress: jobs.filter(job =>
        job.status === 'in_progress' ||
        job.bookingStatus === 'in_progress' ||
        job.bookingStatus === 'parts_needed' ||
        job.bookingStatus === 'quality_check'
      ).length,

      completed: jobs.filter(job =>
        job.status === 'completed' ||
        job.status === 'delivered' ||
        job.bookingStatus === 'delivered' ||
        job.bookingStatus === 'closed' ||
        job.bookingStatus === 'completed'
      ).length,

      disputed: jobs.filter(job =>
        job.status === 'disputed' ||
        job.bookingStatus === 'disputed'
      ).length,

      review: jobs.filter(job => job.bookingStatus === 'delivered').length
    };
  };

  const jobCounts = getJobCounts();

  const filteredJobs = jobs.filter(job => {
    const isQuotationBased = job?.bookingSource === 'direct_message';

    const matchesSearch = isQuotationBased ? (
      job?.quotationId?.deviceInfo?.brandName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.quotationId?.deviceInfo?.modelName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.quotationId?.deviceInfo?.repairServices?.some(service =>
        service.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      job?.repairman?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
    ) : (
      job?.deviceInfo?.brand?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.deviceInfo?.color?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.services?.some(service => service.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job?.location?.city?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.location?.address?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.urgency?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.servicePreference?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );

    let matchesStatus = false;

    if (activeTab === 'all') {
      matchesStatus = true;
    } else if (activeTab === 'booked') {
      matchesStatus = job?.status === 'booked' ||
        job?.bookingStatus === 'confirmed' ||
        job?.bookingStatus === 'repairman_notified' ||
        job?.bookingStatus === 'scheduled';
    } else if (activeTab === 'in_progress') {
      matchesStatus = job?.status === 'in_progress' ||
        job?.bookingStatus === 'in_progress' ||
        job?.bookingStatus === 'parts_needed' ||
        job?.bookingStatus === 'quality_check';
    } else if (activeTab === 'completed') {
      matchesStatus = job?.status === 'completed' || job?.status === 'delivered' ||
        job?.bookingStatus === 'completed' || job?.bookingStatus === 'delivered' || job?.bookingStatus === 'closed';
    } else if (activeTab === 'disputed') {
      matchesStatus = job?.status === 'disputed' ||
        job?.bookingStatus === 'disputed';
    } else {
      matchesStatus = job?.status === activeTab;
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 w-full mb-5">
      <div className="">
        <div className="grid grid-cols-12 gap-4 bg-white rounded-2xl shadow-sm overflow-hidden min-h-[80vh]">
          <main className="overflow-y-auto py-6 px-5 col-span-12">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Repair Jobs</h1>
                  <p className="text-gray-600 mt-1">Manage and track your device repair requests</p>
                </div>
                <Link href="/mobile-repair">
                  <Button className="mt-4 sm:mt-0 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                    <Icon icon="mdi:plus" className="w-5 h-5" />
                    New Repair Request
                  </Button>
                </Link>
              </div>

              {/* Tab Menu */}
              <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 justify-around px-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Icon icon={tab.icon} className="w-4 h-4" />
                        {tab.label}
                        <span className={`px-2 py-1 text-xs rounded-full ${activeTab === tab.id
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-600'
                          }`}>
                          {jobCounts[tab.id]}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Search Bar inside tab container */}
                <div className="p-6">
                  <div className="relative">
                    <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by brand, service, location, color..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {filteredJobs.length > 0 && activeTab !== 'review' && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
                  </p>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <label className="text-sm text-gray-600">Jobs per page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={5}>5</option>
                      <option value={6}>6</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Jobs List */}
              <div className="space-y-4 mb-8">
                {activeTab === 'review' ? (
                  <ReviewJobs />
                ) : loading ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your repair jobs...</p>
                  </div>
                ) : currentJobs?.length > 0 ? (
                  currentJobs?.map((job) => (
                    <RepairJobCard key={job._id || job.id} job={job} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Icon icon="mdi:tools" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {activeTab === 'all' ? 'No repair jobs found' : `No ${activeTab.replace('_', ' ')} jobs found`}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || activeTab !== 'all'
                        ? 'Try adjusting your search or switching to a different tab.'
                        : 'Get started by creating your first repair request.'
                      }
                    </p>
                    <Link href="/mobile-repair">
                      <Button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg">
                        <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                        Create Repair Request
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {filteredJobs.length > 0 && totalPages > 1 && activeTab !== 'review' && (
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-6 py-4">
                  <div className="flex items-center gap-2 mb-4 sm:mb-0">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                    >
                      <Icon icon="mdi:chevron-left" className="w-4 h-4 mr-1" />
                      Previous
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNumber, index) => (
                      <button
                        key={index}
                        onClick={() => pageNumber !== '...' && handlePageChange(pageNumber)}
                        disabled={pageNumber === '...'}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pageNumber === currentPage
                          ? 'bg-primary-600 text-white'
                          : pageNumber === '...'
                            ? 'text-gray-400 cursor-default'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                    >
                      Next
                      <Icon icon="mdi:chevron-right" className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}