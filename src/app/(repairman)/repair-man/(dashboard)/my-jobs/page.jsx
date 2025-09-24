"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import Link from 'next/link';

const MyJobsPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  const [allJobs, setAllJobs] = useState([]); // Store all jobs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const { token } = useSelector((state) => state.auth);

  // Fetch all jobs only once
  const fetchAllJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/repairman/my-booking", {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });

      if (data.success) {
        setAllJobs(data.data.jobs || []);
        setSummary(data.data.summary || {});
        setError(null);
      } else {
        setError('Failed to load jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  // Helper function to get booking status
  const getBookingStatus = (job) => {
    return job.bookingDetails?.status || 'unknown';
  };

  // Helper function to get urgency level from job details
  const getUrgencyLevel = (urgency) => {
    if (typeof urgency === 'string') {
      return urgency.toLowerCase();
    }
    // If urgency is a score, convert it
    if (urgency >= 3) return 'high';
    if (urgency >= 2) return 'medium';
    return 'low';
  };

  // Helper function to format currency
  const formatCurrency = (amount, currency = 'PKR') => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  // Helper function to get time remaining
  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffInHours = Math.ceil((expires - now) / (1000 * 60 * 60));

    if (diffInHours <= 0) return 'Expired';
    if (diffInHours > 24) {
      return `${Math.floor(diffInHours / 24)} days`;
    }
    return `${diffInHours} hours`;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-primary-100 text-primary-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'parts_needed': return 'bg-orange-100 text-orange-800';
      case 'quality_check': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Categorize jobs based on their booking status - using memoization
  const categorizedJobs = useMemo(() => {
    const active = allJobs.filter(job => [
      'confirmed', 'repairman_notified', 'scheduled', 'in_progress', 'parts_needed', 'quality_check'
    ].includes(job.bookingDetails?.status));

    const completed = allJobs.filter(job => [
      'completed', 'delivered'
    ].includes(job.bookingDetails?.status));

    const cancelled = allJobs.filter(job =>
      job.bookingDetails?.status === 'cancelled'
    );

    const disputed = allJobs.filter(job =>
      job.bookingDetails?.status === 'disputed'
    );

    return { active, completed, cancelled, disputed };
  }, [allJobs]);

  // Filter and search jobs based on active tab
  const filteredJobs = useMemo(() => {
    const jobsToFilter = categorizedJobs[activeTab] || [];
    return jobsToFilter.filter((job) => {
      const jobDetails = job.jobDetails || {};
      const customer = job.customer || {};
      const deviceInfo = jobDetails.deviceInfo || {};

      const matchesSearch =
        jobDetails.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobDetails.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deviceInfo.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deviceInfo.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobDetails.services?.some(service =>
          service.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const jobUrgency = getUrgencyLevel(jobDetails.urgency);
      const matchesUrgency = urgencyFilter === 'all' || jobUrgency === urgencyFilter;

      return matchesSearch && matchesUrgency;
    });
  }, [activeTab, searchQuery, urgencyFilter, categorizedJobs]);

  const JobCard = ({ job }) => {
    const jobDetails = job.jobDetails || {};
    const bookingDetails = job.bookingDetails || {};
    const customer = job.customer || {};
    const deviceInfo = jobDetails.deviceInfo || {};

    const status = getBookingStatus(job);
    const urgency = getUrgencyLevel(jobDetails.urgency);
    const customerInitials = customer.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU';

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6  transition-all duration-300 ease-in-out">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex items-start space-x-4 w-full">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-base font-semibold text-primary-700">{customerInitials}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-1">
                {jobDetails.services?.join(', ') || 'Repair Service'}
              </h3>
              <p className="text-sm text-gray-600 mb-2">Client: {customer.name || 'Anonymous'}</p>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="flex items-center">
                  <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" aria-hidden="true" />
                  {jobDetails.location?.city || 'Location not specified'}
                </span>
                <span className={`font-medium ${getUrgencyColor(urgency)}`}>
                  {urgency?.charAt(0).toUpperCase() + urgency?.slice(1)} Priority
                </span>
                {bookingDetails.serviceType && (
                  <span className="flex items-center">
                    <Icon icon="heroicons:truck" className="w-4 h-4 mr-1" aria-hidden="true" />
                    {bookingDetails.serviceType}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right w-full sm:w-auto">
            <p className="text-2xl font-bold text-gray-900 whitespace-nowrap">
              {formatCurrency(
                bookingDetails.pricing?.totalAmount,
                bookingDetails.pricing?.currency
              )}
            </p>

            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)} mt-2`}>
              {status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {jobDetails.expiresAt && (
              <p className="text-sm text-gray-500 mt-1">
                {getTimeRemaining(jobDetails.expiresAt)}
              </p>
            )}
          </div>
        </div>

        {/* Device Info */}
        {deviceInfo && (deviceInfo.brand || deviceInfo.model) && (
          <div className="mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Icon icon="heroicons:device-phone-mobile" className="w-4 h-4 mr-1" />
                {deviceInfo.brand} {deviceInfo.model}
              </span>
              {deviceInfo.color && (
                <span className="capitalize">{deviceInfo.color}</span>
              )}
              {deviceInfo.warrantyStatus && (
                <span className={`px-2 py-1 rounded text-xs ${deviceInfo.warrantyStatus === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  Warranty: {deviceInfo.warrantyStatus}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Scheduled Date */}
        {bookingDetails.scheduledDate && (
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Icon icon="heroicons:calendar" className="w-4 h-4 mr-2" />
              <span>Scheduled: {new Date(bookingDetails.scheduledDate).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Description */}
        {jobDetails.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {jobDetails.description}
            </p>
          </div>
        )}

        {/* Images */}
        {jobDetails.images && jobDetails.images.length > 0 && (
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-700 block mb-2">Images:</span>
            <div className="flex space-x-2 overflow-x-auto">
              {jobDetails.images.map((image, index) => (
                <img
                  key={image._id || index}
                  src={image.url}
                  alt={`Job image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
          {job.canUpdateStatus && activeTab === 'active' && (
            <Link href={`/repair-man/my-jobs/${job._id}/update-status`}>
              <button className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                View And Update Status
              </button>
            </Link>
          )}
          {job.canChat && (
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              <Icon icon="heroicons:chat-bubble-left" className="w-4 h-4 mr-2 inline" />
              Message Client
            </button>
          )}
          {job.needsPickup && (
            <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              <Icon icon="heroicons:truck" className="w-4 h-4 mr-2 inline" />
              Arrange Pickup
            </button>
          )}
          {job.needsDelivery && (
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              <Icon icon="heroicons:truck" className="w-4 h-4 mr-2 inline" />
              Arrange Delivery
            </button>
          )}
        </div>
      </div>
    );
  };

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon
          icon={
            type === 'active' ? 'heroicons:wrench-screwdriver' :
              type === 'completed' ? 'heroicons:check-circle' :
                type === 'cancelled' ? 'heroicons:x-circle' :
                  'heroicons:exclamation-triangle'
          }
          className="w-8 h-8 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type} jobs
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {type === 'active' ? 'You don\'t have any active jobs at the moment.' :
          type === 'completed' ? 'You haven\'t completed any jobs yet.' :
            type === 'cancelled' ? 'No cancelled jobs found.' :
              'No disputed jobs found.'}
      </p>
      <button
        onClick={() => fetchAllJobs()}
        className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 inline" />
        Refresh Jobs
      </button>
    </div>
  );

  // Calculate tab counts from categorized jobs
  const getTabCounts = () => ({
    active: categorizedJobs.active?.length || 0,
    completed: categorizedJobs.completed?.length || 0,
    cancelled: categorizedJobs.cancelled?.length || 0,
    disputed: categorizedJobs.disputed?.length || 0,
  });

  const tabCounts = getTabCounts();

  const handleClearFilters = () => {
    setSearchQuery('');
    setUrgencyFilter('all');
  };

  // Simple tab change without API call
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchAllJobs()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Jobs</h1>
          <p className="text-gray-600 text-lg">Manage your repair bookings and track progress</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search jobs by service, client, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm"
              aria-label="Search jobs"
            />
            <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Clear search"
              >
                <Icon icon="heroicons:x-mark" className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm w-full sm:w-auto"
              aria-label="Filter by urgency"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={handleClearFilters}
              className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
            <button
              onClick={() => fetchAllJobs()}
              className="px-4 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              aria-label="Refresh jobs"
            >
              <Icon icon="heroicons:arrow-path" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 sm:space-x-8 px-4 sm:px-6 -mb-px" role="tablist">
              {[
                { id: 'active', label: 'Active Jobs', count: tabCounts.active },
                { id: 'completed', label: 'Completed', count: tabCounts.completed },
                { id: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled },
                { id: 'disputed', label: 'Disputed', count: tabCounts.disputed },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-2 sm:px-4 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                    }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6" role="tabpanel" id={`${activeTab}-panel`}>
            {filteredJobs.length > 0 ? (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            ) : (
              <EmptyState type={activeTab} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyJobsPage;