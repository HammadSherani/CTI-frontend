"use client";


import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';

const MyJobsPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [expandedJob, setExpandedJob] = useState(null);

  // Mock jobs data
  const jobsData = {
    active: [
      {
        id: 1,
        title: 'iPhone 14 Pro Screen Replacement',
        client: 'Sarah Ahmed',
        clientInitials: 'SA',
        amount: 12000,
        status: 'in-progress',
        startDate: '2024-08-22',
        deadline: '2024-08-25',
        progress: 75,
        description: 'Replace cracked screen and test all functionality',
        location: 'DHA Phase 5, Karachi',
        urgency: 'high',
        lastUpdate: '2 hours ago',
      },
      {
        id: 2,
        title: 'Samsung Galaxy S23 Water Damage Repair',
        client: 'Ahmed Khan',
        clientInitials: 'AK',
        amount: 8500,
        status: 'pending-start',
        startDate: '2024-08-25',
        deadline: '2024-08-27',
        progress: 0,
        description: 'Water damage assessment and component replacement',
        location: 'Gulshan-e-Iqbal, Karachi',
        urgency: 'urgent',
        lastUpdate: '1 day ago',
      },
      {
        id: 3,
        title: 'Multiple Phone Repairs - Bulk Service',
        client: 'TechMart Electronics',
        clientInitials: 'TE',
        amount: 25000,
        status: 'awaiting-parts',
        startDate: '2024-08-20',
        deadline: '2024-08-28',
        progress: 40,
        description: '5 iPhone repairs and 3 Samsung repairs',
        location: 'Clifton, Karachi',
        urgency: 'medium',
        lastUpdate: '4 hours ago',
      },
    ],
    pending: [
      {
        id: 4,
        title: 'Xiaomi Redmi Note 12 Battery Replacement',
        client: 'Fatima Ali',
        clientInitials: 'FA',
        amount: 4500,
        status: 'offer-submitted',
        submittedDate: '2024-08-24',
        description: 'Battery draining fast, needs replacement',
        location: 'North Nazimabad, Karachi',
        urgency: 'low',
        responseDeadline: '2024-08-26',
      },
      {
        id: 5,
        title: 'OnePlus 9 Pro Charging Port Repair',
        client: 'Hassan Malik',
        clientInitials: 'HM',
        amount: 6000,
        status: 'under-review',
        submittedDate: '2024-08-23',
        description: 'Charging port not working properly',
        location: 'Defence, Karachi',
        urgency: 'medium',
        responseDeadline: '2024-08-25',
      },
    ],
    completed: [
      {
        id: 6,
        title: 'iPhone 12 Mini Screen + Battery Replacement',
        client: 'Maria Khan',
        clientInitials: 'MK',
        amount: 15000,
        status: 'completed',
        completedDate: '2024-08-20',
        rating: 5,
        review: 'Excellent work! Phone works like new. Very professional and quick service.',
        description: 'Replace cracked screen and old battery',
        location: 'Johar Town, Lahore',
        duration: '2 days',
      },
      {
        id: 7,
        title: 'Samsung Galaxy A54 Software Issues',
        client: 'Ali Raza',
        clientInitials: 'AR',
        amount: 3500,
        status: 'completed',
        completedDate: '2024-08-18',
        rating: 5,
        review: 'Fixed all software problems perfectly. Great communication throughout.',
        description: 'Software troubleshooting and optimization',
        location: 'Model Town, Lahore',
        duration: '1 day',
      },
      {
        id: 8,
        title: 'iPhone 11 Water Damage Recovery',
        client: 'Zara Sheikh',
        clientInitials: 'ZS',
        amount: 10000,
        status: 'completed',
        completedDate: '2024-08-15',
        rating: 4,
        review: 'Good work, phone is working again. Took a bit longer than expected.',
        description: 'Complete water damage restoration',
        location: 'Bahria Town, Karachi',
        duration: '3 days',
      },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending-start': return 'bg-yellow-100 text-yellow-800';
      case 'awaiting-parts': return 'bg-orange-100 text-orange-800';
      case 'offer-submitted': return 'bg-purple-100 text-purple-800';
      case 'under-review': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    const jobs = jobsData[activeTab];
    return jobs.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUrgency = urgencyFilter === 'all' || job.urgency === urgencyFilter;
      return matchesSearch && matchesUrgency;
    });
  }, [activeTab, searchQuery, urgencyFilter]);

  const JobCard = ({ job, type }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div className="flex items-start space-x-4 w-full">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-base font-semibold text-blue-700">{job.clientInitials}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-xl text-gray-900 mb-1">{job.title}</h3>
              <button
                onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                aria-expanded={expandedJob === job.id}
                aria-controls={`job-details-${job.id}`}
                aria-label={expandedJob === job.id ? `Collapse details for ${job.title}` : `Expand details for ${job.title}`}
              >
                <Icon icon={expandedJob === job.id ? 'heroicons:chevron-up' : 'heroicons:chevron-down'} className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">Client: {job.client}</p>
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="flex items-center">
                <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" aria-hidden="true" />
                {job.location}
              </span>
              {job.urgency && (
                <span className={`font-medium ${getUrgencyColor(job.urgency)}`} aria-label={`Priority: ${job.urgency}`}>
                  {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)} Priority
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right w-full sm:w-auto">
          <p className="text-2xl font-bold text-gray-900">${job.amount.toLocaleString()}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)} mt-2`}>
            {job.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Collapsible Details */}
      <div
        id={`job-details-${job.id}`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedJob === job.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-4">{job.description}</p>
          {type === 'active' && job.progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{job.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${job.progress}%` }}
                  role="progressbar"
                  aria-valuenow={job.progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          )}
          {type === 'completed' && job.rating && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    icon="heroicons:star"
                    className={`w-5 h-5 ${i < job.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    aria-hidden="true"
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700">{job.rating}/5</span>
              </div>
              <p className="text-sm text-gray-600 italic">"{job.review}"</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600">
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              {type === 'active' && (
                <>
                  <span>Started: {new Date(job.startDate).toLocaleDateString()}</span>
                  <span>Due: {new Date(job.deadline).toLocaleDateString()}</span>
                </>
              )}
              {type === 'pending' && (
                <>
                  <span>Submitted: {new Date(job.submittedDate).toLocaleDateString()}</span>
                  <span>Response by: {new Date(job.responseDeadline).toLocaleDateString()}</span>
                </>
              )}
              {type === 'completed' && (
                <>
                  <span>Completed: {new Date(job.completedDate).toLocaleDateString()}</span>
                  <span>Duration: {job.duration}</span>
                </>
              )}
            </div>
            {type === 'active' && (
              <span className="text-xs text-gray-500">Updated {job.lastUpdate}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
        {type === 'active' && (
          <>
            <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Update Progress
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Message Client
            </button>
          </>
        )}
        {type === 'pending' && (
          <>
            <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              View Details
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Withdraw Offer
            </button>
          </>
        )}
        {type === 'completed' && (
          <>
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              View Invoice
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Contact Client
            </button>
          </>
        )}
      </div>
    </div>
  );

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon
          icon={
            type === 'active' ? 'heroicons:wrench-screwdriver' :
            type === 'pending' ? 'heroicons:clock' :
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
        {type === 'active' ? 'You don\'t have any active jobs at the moment.' :
         type === 'pending' ? 'You don\'t have any pending offers.' :
         'You haven\'t completed any jobs yet.'}
      </p>
      {type !== 'completed' && (
        <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
          Browse Jobs
        </button>
      )}
    </div>
  );

  const getTabCounts = () => ({
    active: jobsData.active.length,
    pending: jobsData.pending.length,
    completed: jobsData.completed.length,
  });

  const tabCounts = getTabCounts();

  const handleClearFilters = () => {
    setSearchQuery('');
    setUrgencyFilter('all');
  };

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
              <option value="urgent">Urgent</option>
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
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 sm:space-x-8 px-4 sm:px-6 -mb-px" role="tablist">
              {[
                { id: 'active', label: 'Active Jobs', count: tabCounts.active },
                { id: 'pending', label: 'Pending Offers', count: tabCounts.pending },
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
                  <JobCard key={job.id} job={job} type={activeTab} />
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