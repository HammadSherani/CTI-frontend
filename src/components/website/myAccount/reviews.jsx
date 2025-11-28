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

  const formatCurrency = (amount, currency = 'TRY') => {
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
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Job Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.jobId?.deviceInfo?.brand} {job.jobId?.deviceInfo?.model}
                    </h3>
                    <p className="text-gray-600 mb-3">{job.jobId?.description}</p>

                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="flex items-center text-gray-500">
                        <Icon icon="heroicons:wrench-screwdriver" className="w-4 h-4 mr-1" />
                        {job.jobId?.services?.join(', ')}
                      </span>
                      <span className="flex items-center text-gray-500">
                        <Icon icon="heroicons:calendar" className="w-4 h-4 mr-1" />
                        Completed {new Date(job.timeline?.completedAt).toLocaleDateString()}
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
                  // Write Review Form
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Write Your Review</h4>

                    {/* Star Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Icon
                              icon={star <= (hoverRating || rating) ? "heroicons:star-solid" : "heroicons:star"}
                              className={`w-8 h-8 ${star <= (hoverRating || rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                                }`}
                            />
                          </button>
                        ))}
                        {rating > 0 && (
                          <span className="ml-2 text-sm text-gray-600">
                            {rating} out of 5
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share details about your experience with this repair service..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {reviewText.length}/500 characters
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleSubmitReview(job.jobId._id, job._id, job.repairmanId._id)}
                        disabled={submitting || rating === 0 || !reviewText.trim()}
                        className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {submitting ? (
                          <>
                            <Icon icon="heroicons:arrow-path" className="w-5 h-5 mr-2 animate-spin" />
                            Submitting...
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
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Write Review Button
                  <button
                    onClick={() => setSelectedJob(job._id)}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    <Icon icon="heroicons:star" className="w-5 h-5 mr-2" />
                    Write a Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};