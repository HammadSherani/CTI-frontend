"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MyJobsPage = () => {
  const [activeTab, setActiveTab] = useState('nearby');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [expandedJob, setExpandedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const router = useRouter();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/repairman/offers/jobs/nearby", {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      setJobs(data.data.jobs || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Helper function to get job status based on API data
  const getJobStatus = (job) => {
    if (job.status === 'offers_received') {
      return job.hasSubmittedOffer ? 'offer-submitted' : 'available';
    }
    return job.status;
  };

  // Helper function to get urgency level
  const getUrgencyLevel = (urgencyScore) => {
    if (urgencyScore >= 3) return 'high';
    if (urgencyScore >= 2) return 'medium';
    return 'low';
  };

  // Helper function to format currency
  const formatCurrency = (amount, currency = 'PKR') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  // Helper function to get time remaining
  const getTimeRemaining = (timeRemaining) => {
    if (timeRemaining > 24) {
      return `${Math.floor(timeRemaining / 24)} days`;
    }
    return `${timeRemaining} hours`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'offer-submitted': return 'bg-purple-100 text-purple-800';
      case 'offers_received': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
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

  // Categorize jobs based on status and submission state
  const categorizeJobs = (jobs) => {
    const nearby = jobs; // Show all jobs in nearby tab
    const submitted = jobs.filter(job => job.hasSubmittedOffer && job.status === 'offers_received');
    const active = jobs.filter(job => ['in-progress', 'accepted'].includes(job.status));
    const completed = jobs.filter(job => job.status === 'completed');

    return { nearby, submitted, active, completed };
  };

  const categorizedJobs = useMemo(() => categorizeJobs(jobs), [jobs]);

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    const jobsToFilter = categorizedJobs[activeTab] || [];
    return jobsToFilter.filter((job) => {
      const matchesSearch = 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.turkishTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.turkishDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const jobUrgency = getUrgencyLevel(job.urgencyScore);
      const matchesUrgency = urgencyFilter === 'all' || jobUrgency === urgencyFilter;
      
      return matchesSearch && matchesUrgency;
    });
  }, [activeTab, searchQuery, urgencyFilter, categorizedJobs]);

  const JobCard = ({ job }) => {
    const jobStatus = getJobStatus(job);
    const urgency = getUrgencyLevel(job.urgencyScore);
    const customerInitials = job.customerId?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU';

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex items-start space-x-4 w-full">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-base font-semibold text-blue-700">{customerInitials}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-xl text-gray-900 mb-1">
                  {job.title || job.turkishTitle}
                </h3>
                <button
                  onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                  aria-expanded={expandedJob === job._id}
                  aria-controls={`job-details-${job._id}`}
                >
                  <Icon icon={expandedJob === job._id ? 'heroicons:chevron-up' : 'heroicons:chevron-down'} className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">Client: {job.customerId?.name || 'Anonymous'}</p>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="flex items-center">
                  <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" aria-hidden="true" />
                  {job.location?.address}, {job.location?.city}
                </span>
                <span className={`font-medium ${getUrgencyColor(urgency)}`}>
                  {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
                </span>
                {job.distance && (
                  <span className="flex items-center">
                    <Icon icon="heroicons:map" className="w-4 h-4 mr-1" aria-hidden="true" />
                    {job.distance.toFixed(1)} km away
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right w-full sm:w-auto">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(job.budget?.min)} - {formatCurrency(job.budget?.max)}
            </p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobStatus)} mt-2`}>
              {jobStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {job.timeRemaining && (
              <p className="text-sm text-gray-500 mt-1">
                Expires in {getTimeRemaining(job.timeRemaining)}
              </p>
            )}
          </div>
        </div>

        {/* Device Info */}
        {job.deviceInfo && (
          <div className="mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Icon icon="heroicons:device-phone-mobile" className="w-4 h-4 mr-1" />
                {job.deviceInfo.brand} {job.deviceInfo.model}
              </span>
              {job.deviceInfo.color && (
                <span>{job.deviceInfo.color}</span>
              )}
              {job.categoryId && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {job.categoryId.name}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Collapsible Details */}
        <div
          id={`job-details-${job._id}`}
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expandedJob === job._id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-4">
              {job.description || job.turkishDescription}
            </p>
            
            {/* Job Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">Service Preference:</span> {job.servicePreference}
              </div>
              {job.preferredTime && (
                <div>
                  <span className="font-medium">Preferred Time:</span>{' '}
                  {new Date(job.preferredTime).toLocaleString()}
                </div>
              )}
              <div>
                <span className="font-medium">Job Radius:</span> {job.jobRadius} km
              </div>
              <div>
                <span className="font-medium">Max Offers:</span> {job.maxOffers}
              </div>
              {job.travelTime && (
                <div>
                  <span className="font-medium">Travel Time:</span> {job.travelTime}
                </div>
              )}
              <div>
                <span className="font-medium">Posted:</span>{' '}
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Images */}
            {job.images && job.images.length > 0 && (
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700 block mb-2">Images:</span>
                <div className="flex space-x-2 overflow-x-auto">
                  {job.images.map((image, index) => (
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
          {activeTab === 'nearby' && !job.hasSubmittedOffer && job.canSubmitOffer && (
            <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Submit Offer
            </button>
          )}
          {activeTab === 'nearby' && job.hasSubmittedOffer && (
            <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              View Your Offer
            </button>
          )}
          {activeTab === 'submitted' && (
            <>
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                View Offer
              </button>
              <button className="flex-1 border border-red-300 text-red-700 py-2 px-4 rounded-lg hover:bg-red-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                Withdraw Offer
              </button>
            </>
          )}
          {activeTab === 'active' && (
            <>
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Update Progress
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Message Client
              </button>
            </>
          )}
          <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            <Link href={'/repair-man/job-board/' + job._id} className="w-full h-full">
            
            View Details
            </Link>
          </button>
        </div>
      </div>
    );
  };

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon
          icon={
            type === 'nearby' ? 'heroicons:map-pin' :
            type === 'submitted' ? 'heroicons:clock' :
            type === 'active' ? 'heroicons:wrench-screwdriver' :
            'heroicons:check-circle'
          }
          className="w-8 h-8 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type} jobs
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {type === 'nearby' ? 'No nearby jobs available at the moment.' :
         type === 'submitted' ? 'You haven\'t submitted any offers yet.' :
         type === 'active' ? 'You don\'t have any active jobs.' :
         'You haven\'t completed any jobs yet.'}
      </p>
      {type === 'nearby' && (
        <button 
          onClick={fetchJobs}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Refresh Jobs
        </button>
      )}
    </div>
  );

  const getTabCounts = () => ({
    nearby: categorizedJobs.nearby?.length || 0,
    submitted: categorizedJobs.submitted?.length || 0,
    active: categorizedJobs.active?.length || 0,
    completed: categorizedJobs.completed?.length || 0,
  });

  const tabCounts = getTabCounts();

  const handleClearFilters = () => {
    setSearchQuery('');
    setUrgencyFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
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
            onClick={fetchJobs}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
          <p className="text-gray-600 text-lg">Manage your repair jobs and track progress with ease</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search jobs by title, client, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
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
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm w-full sm:w-auto"
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
              onClick={fetchJobs}
              className="px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              aria-label="Refresh jobs"
            >
              <Icon icon="heroicons:arrow-path" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 sm:space-x-8 px-4 sm:px-6 -mb-px" role="tablist">
              {[
                { id: 'nearby', label: 'Nearby Jobs', count: tabCounts.nearby },
                { id: 'submitted', label: 'Submitted Offers', count: tabCounts.submitted },
                { id: 'active', label: 'Active Jobs', count: tabCounts.active },
                { id: 'completed', label: 'Completed', count: tabCounts.completed },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 sm:px-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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