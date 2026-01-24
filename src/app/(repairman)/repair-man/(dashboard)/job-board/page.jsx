"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/Loader';
import SmallLoader from '@/components/SmallLoader';

const MyJobsPage = () => {
  const [activeTab, setActiveTab] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  // const [expandedJob, setExpandedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const { token } = useSelector((state) => state.auth);
  // const router = useRouter();

  const handleStateChange = (stateId) => {
    setSelectedState(stateId);
    setSelectedCity('');
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (selectedState) {
        params.append('state', selectedState);
      }
      if (selectedCity) {
        params.append('city', selectedCity);
      }

      const url = `/repairman/jobs?${params.toString()}`;

      const { data } = await axiosInstance.get(url, {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });

      setJobs(data?.data?.jobs || []);
      setStates(data?.data?.states || []);
      setCities(data?.data?.cities || []);

      if (!selectedState && data?.data?.selectedState) {
        setSelectedState(data?.data?.selectedState);
      }

    } catch (error) {
      console.error('Error fetching jobs:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to load jobs. Please try again.';
      setError(errorMessage);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = async () => {
    await fetchJobs();
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedState, selectedCity]);

  const getJobStatus = (job) => {
    if (job.status === 'offers_received') {
      return job.hasSubmittedOffer ? 'offer-submitted' : 'available';
    }
    return job.status;
  };

  const getUrgencyLevel = (urgencyScore) => {
    if (urgencyScore >= 3) return 'high';
    if (urgencyScore >= 2) return 'medium';
    return 'low';
  };

  const formatCurrency = (amount, currency = 'TRY') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

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
      case 'offers_received': return 'bg-primary-100 text-primary-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-orange-100 text-orange-800';
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

  const categorizeJobs = (jobs) => {
    const open = jobs.filter(job =>
      job.status === 'offers_received' ||
      job.status === 'in-progress' ||
      job.status === 'accepted' ||
      job.status === 'open' ||
      job.status === 'pending'
    );

    const completed = jobs.filter(job => job.status === 'completed');

    return { open, completed };
  };

  const categorizedJobs = useMemo(() => categorizeJobs(jobs), [jobs]);

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

  const JobCard = ({ job, expandedJob, setExpandedJob, activeTab }) => {
    const jobStatus = getJobStatus(job);
    const urgency = getUrgencyLevel(job.urgencyScore);
    const customerInitials = job.customerId?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU';

    return (
      <div className=" bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm  hover:border-gray-300 transition-all duration-300 ease-in-out transform ">
        <div className="">
          <div className="flex items-start gap-4 p-3 pb-4">
            <div className="relative">
              {urgency === 'high' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-500 mb-3">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {job?.deviceInfo?.brand} {job?.deviceInfo?.model}
                  </h3>
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-bold">Budget Range</span> -
                    <span className="ml-1">Est. Budget: {formatCurrency(job.budget?.min)} - {formatCurrency(job.budget?.max)}</span>
                  </div>
                </div>
              </div>
              <div className='mb-3'>
                <span className='mb-3'>{job?.description}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {job.services?.map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200"
                  >
                    <Icon icon="heroicons:wrench-screwdriver" className="w-3 h-3 mr-1" />
                    {service?.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Icon icon="heroicons:map-pin" className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{job.location?.address}</span>
              </div>
            </div>
          </div>

          <div className="flex px-6 py-3 flex-wrap items-center gap-3 text-sm">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full font-medium ${getStatusColor(jobStatus)}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${jobStatus === 'open' ? 'bg-green-400' :
                jobStatus === 'in-progress' ? 'bg-yellow-400' : 'bg-gray-400'
                }`}></div>
              {jobStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>

            <span className={`inline-flex items-center px-3 py-1.5 rounded-full font-medium ${getUrgencyColor(urgency)}`}>
              <Icon icon="heroicons:clock" className="w-3 h-3 mr-1" />
              {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
            </span>

            {job.timeRemaining && (
              <span className="inline-flex items-center text-orange-600 font-medium">
                <Icon icon="heroicons:fire" className="w-4 h-4 mr-1" />
                Expires in {getTimeRemaining(job.timeRemaining)}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 pt-4 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            {activeTab === 'open' && (
              <>
                {!job.hasSubmittedOffer && job.canSubmitOffer && (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    <Icon icon="heroicons:paper-airplane" className="w-4 h-4 inline mr-2" />
                    Submit Offer
                  </button>
                )}

                {job.hasSubmittedOffer && job.status === 'offers_received' && (
                  <>
                    <button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                      <Icon icon="heroicons:eye" className="w-4 h-4 inline mr-2" />
                      View Your Offer
                    </button>
                    <button className="flex-1 border-2 border-red-300 text-red-700 py-3 px-6 rounded-xl font-semibold hover:bg-red-50 hover:border-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                      <Icon icon="heroicons:trash" className="w-4 h-4 inline mr-2" />
                      Withdraw Offer
                    </button>
                  </>
                )}

                {['in-progress', 'accepted'].includes(job.status) && (
                  <>
                    <button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                      <Icon icon="heroicons:arrow-path" className="w-4 h-4 inline mr-2" />
                      Update Progress
                    </button>
                    <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                      <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4 inline mr-2" />
                      Message Client
                    </button>
                  </>
                )}
              </>
            )}

            <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              <Link href={'/repair-man/job-board/' + job._id} className="flex items-center justify-center w-full h-full">
                <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon
          icon={
            type === 'open' ? 'heroicons:briefcase' : 'heroicons:check-circle'
          }
          className="w-8 h-8 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type} jobs
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {type === 'open' ? 'No open jobs available at the moment.' : 'You haven\'t completed any jobs yet.'}
      </p>
      {type === 'open' && (
        <button
          onClick={refreshJobs}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:from-primary-700 hover:to-green-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Refresh Jobs
        </button>
      )}
    </div>
  );

  const getTabCounts = () => ({
    open: categorizedJobs.open?.length || 0,
    completed: categorizedJobs.completed?.length || 0,
  });

  const tabCounts = getTabCounts();

  const handleClearFilters = () => {
    setSearchQuery('');
    setUrgencyFilter('all');
    setSelectedState('');
    setSelectedCity('');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshJobs}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
     <SmallLoader loading={loading} text='Loading Jobs...' />
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Jobs</h1>
            <p className="text-gray-600 text-lg">Manage your repair jobs and track progress with ease</p>
          </div>

          <div className="mb-6  p-6 rounded-md border border-gray-200 shadow-xs bg-white grid grid-cols-3 gap-3 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full col-span-2">
              <input
                type="text"
                placeholder="Search jobs by title, client, or description..."
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

            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm w-full sm:w-auto"
              aria-label="Filter by state"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state._id} value={state._id}>
                  {state.name}
                </option>
              ))}
            </select>

            <div className='col-span-2 w-full flex items-center gap-4 flex-1'>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 flex-1 w-full py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm "
                aria-label="Filter by city"
                disabled={!cities.length}
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                aria-label="Clear all filters"
              >
                Clear Filters
              </button>
            </div>



            {/* <button
              onClick={refreshJobs}
              className="px-4 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              aria-label="Refresh jobs"
            >
              <Icon icon="heroicons:arrow-path" className="w-5 h-5" />
            </button> */}


          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-2 sm:space-x-8 px-4 sm:px-6 -mb-px" role="tablist">
                {[
                  // { id: 'open', label: 'Open Jobs', count: tabCounts.open },
                  // { id: 'completed', label: 'Completed Jobs', count: tabCounts.completed },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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