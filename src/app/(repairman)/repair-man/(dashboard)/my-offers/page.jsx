"use client"


import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';

const MyOffersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [expandedOffer, setExpandedOffer] = useState(null);

  // Mock offers data
  const offersData = {
    submitted: [
      {
        id: 1,
        jobTitle: 'iPhone 14 Pro Max Screen Replacement + Camera Repair',
        jobId: 'JOB001',
        client: 'Sarah Ahmed',
        clientInitials: 'SA',
        clientRating: 4.8,
        offerAmount: 15000,
        jobBudget: '12000-18000',
        status: 'submitted',
        submittedDate: '2024-08-24T10:30:00Z',
        responseDeadline: '2024-08-26T10:30:00Z',
        timeLeft: 28,
        description: 'Cracked screen and rear camera not focusing properly. Need professional repair with warranty.',
        location: 'DHA Phase 6, Karachi',
        urgency: 'high',
        coverLetter: 'I have 5+ years of experience with iPhone repairs, especially with Pro Max models. I use genuine parts and provide 6-month warranty. Can complete within 24 hours.',
        proposedTimeline: '1-2 days',
        warranty: '6 months',
        totalProposals: 8,
      },
      {
        id: 2,
        jobTitle: 'Samsung Galaxy S23 Ultra Water Damage Recovery',
        jobId: 'JOB002',
        client: 'Ahmed Khan',
        clientInitials: 'AK',
        clientRating: 4.9,
        offerAmount: 12000,
        jobBudget: '8000-15000',
        status: 'submitted',
        submittedDate: '2024-08-24T14:15:00Z',
        responseDeadline: '2024-08-25T14:15:00Z',
        timeLeft: 4,
        description: 'Phone was dropped in water for 30 seconds. Screen works but some functions are not working.',
        location: 'Gulshan-e-Iqbal, Karachi',
        urgency: 'urgent',
        coverLetter: 'I specialize in water damage recovery with 90% success rate. I have all necessary tools for component-level cleaning and replacement.',
        proposedTimeline: '2-3 days',
        warranty: '3 months',
        totalProposals: 12,
      },
    ],
    underReview: [
      {
        id: 3,
        jobTitle: 'Multiple iPhone Repairs for Electronics Shop',
        jobId: 'JOB003',
        client: 'TechMart Electronics',
        clientInitials: 'TE',
        clientRating: 4.7,
        offerAmount: 35000,
        jobBudget: '25000-40000',
        status: 'under_review',
        submittedDate: '2024-08-23T09:00:00Z',
        reviewStarted: '2024-08-23T15:30:00Z',
        description: 'Bulk repair service needed for 8 iPhones (various models) - screens, batteries, and charging ports.',
        location: 'Saddar, Karachi',
        urgency: 'medium',
        coverLetter: 'I offer bulk repair services with discount pricing. Have experience with electronics shops. Can handle multiple devices simultaneously.',
        proposedTimeline: '1 week',
        warranty: '6 months',
        totalProposals: 5,
        interviewScheduled: true,
        interviewDate: '2024-08-25T16:00:00Z',
      },
    ],
    accepted: [
      {
        id: 4,
        jobTitle: 'OnePlus 9 Pro Display and Battery Replacement',
        jobId: 'JOB004',
        client: 'Fatima Ali',
        clientInitials: 'FA',
        clientRating: 4.6,
        offerAmount: 9500,
        jobBudget: '7000-12000',
        status: 'accepted',
        submittedDate: '2024-08-22T11:20:00Z',
        acceptedDate: '2024-08-23T16:45:00Z',
        description: 'Display has dead pixels and battery drains very quickly. Need both components replaced.',
        location: 'North Nazimabad, Karachi',
        urgency: 'medium',
        coverLetter: 'I have experience with OnePlus devices and source high-quality replacement parts. Quick turnaround guaranteed.',
        proposedTimeline: '2-3 days',
        warranty: '4 months',
        startDate: '2024-08-25',
        clientMessage: 'Great proposal! When can you start? I need this phone working by weekend.',
      },
    ],
    rejected: [
      {
        id: 5,
        jobTitle: 'Xiaomi Redmi Note 12 Charging Port Repair',
        jobId: 'JOB005',
        client: 'Hassan Malik',
        clientInitials: 'HM',
        clientRating: 4.5,
        offerAmount: 4500,
        jobBudget: '3000-5000',
        status: 'rejected',
        submittedDate: '2024-08-21T13:45:00Z',
        rejectedDate: '2024-08-22T10:15:00Z',
        description: 'Charging port is loose and phone charges intermittently.',
        location: 'Defence, Karachi',
        urgency: 'low',
        coverLetter: 'I can fix charging port issues quickly with quality parts and reasonable pricing.',
        proposedTimeline: '1 day',
        warranty: '3 months',
        rejectionReason: 'Selected another candidate with lower price',
      },
      {
        id: 6,
        jobTitle: 'iPad Air 4 Screen Replacement',
        jobId: 'JOB006',
        client: 'Zara Sheikh',
        clientInitials: 'ZS',
        clientRating: 4.3,
        offerAmount: 18000,
        jobBudget: '15000-20000',
        status: 'rejected',
        submittedDate: '2024-08-20T16:30:00Z',
        rejectedDate: '2024-08-21T12:00:00Z',
        description: 'Cracked iPad screen, need professional replacement with original quality display.',
        location: 'Bahria Town, Karachi',
        urgency: 'low',
        coverLetter: 'I have experience with iPad repairs and use high-quality replacement screens.',
        proposedTimeline: '2 days',
        warranty: '6 months',
        rejectionReason: 'Job canceled by client',
      },
    ],
    withdrawn: [
      {
        id: 7,
        jobTitle: 'Huawei P40 Pro Camera Module Replacement',
        jobId: 'JOB007',
        client: 'Ali Raza',
        clientInitials: 'AR',
        clientRating: 4.4,
        offerAmount: 8000,
        jobBudget: '6000-10000',
        status: 'withdrawn',
        submittedDate: '2024-08-19T12:00:00Z',
        withdrawnDate: '2024-08-20T09:30:00Z',
        description: 'Rear camera module not working, need replacement.',
        location: 'Model Town, Lahore',
        urgency: 'medium',
        withdrawnReason: 'Found conflicting schedule with another job',
      },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-primary-100 text-primary-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
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

  const getTimeLeftColor = (hours) => {
    if (hours <= 0) return 'text-red-600';
    if (hours <= 24) return 'text-red-600';
    if (hours <= 48) return 'text-orange-600';
    return 'text-green-600';
  };

  const formatTimeLeft = (hours) => {
    if (hours <= 0) return 'Expired';
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h left`;
  };

  // Filter and search offers
  const filteredOffers = useMemo(() => {
    const offers = activeTab === 'all'
      ? [
          ...offersData.submitted,
          ...offersData.underReview,
          ...offersData.accepted,
          ...offersData.rejected,
          ...offersData.withdrawn,
        ].sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
      : offersData[activeTab.replace('_', '')] || offersData[activeTab] || [];

    return offers.filter((offer) => {
      const matchesSearch = offer.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           offer.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           offer.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUrgency = urgencyFilter === 'all' || offer.urgency === urgencyFilter;
      return matchesSearch && matchesUrgency;
    });
  }, [activeTab, searchQuery, urgencyFilter]);

  const OfferCard = ({ offer }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div className="flex items-start space-x-4 w-full">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-base font-semibold text-primary-700">{offer.clientInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-xl text-gray-900 mb-1">{offer.jobTitle}</h3>
              <button
                onClick={() => setExpandedOffer(expandedOffer === offer.id ? null : offer.id)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1"
                aria-expanded={expandedOffer === offer.id}
                aria-controls={`offer-details-${offer.id}`}
                aria-label={expandedOffer === offer.id ? `Collapse details for ${offer.jobTitle}` : `Expand details for ${offer.jobTitle}`}
              >
                <Icon icon={expandedOffer === offer.id ? 'heroicons:chevron-up' : 'heroicons:chevron-down'} className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 mb-2">
              <span>Client: {offer.client}</span>
              <div className="flex items-center">
                <Icon icon="heroicons:star" className="w-4 h-4 text-yellow-400 mr-1" aria-hidden="true" />
                <span>{offer.clientRating}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="flex items-center">
                <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" aria-hidden="true" />
                {offer.location}
              </span>
              {offer.urgency && (
                <span className={`font-medium ${getUrgencyColor(offer.urgency)}`} aria-label={`Priority: ${offer.urgency}`}>
                  {offer.urgency.charAt(0).toUpperCase() + offer.urgency.slice(1)} Priority
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right w-full sm:w-auto">
          <p className="text-2xl font-bold text-gray-900">₹{offer.offerAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Budget: ₹{offer.jobBudget}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(offer.status)}`}>
            {offer.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Collapsible Details */}
      <div
        id={`offer-details-${offer.id}`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedOffer === offer.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pt-4 border-t border-gray-100">
          {/* Time-sensitive information */}
          {offer.timeLeft !== undefined && offer.timeLeft > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Icon icon="heroicons:clock" className="w-4 h-4 text-yellow-600 mr-2" aria-hidden="true" />
                <span className={`font-medium ${getTimeLeftColor(offer.timeLeft)}`} aria-label={`Time left: ${formatTimeLeft(offer.timeLeft)}`}>
                  {formatTimeLeft(offer.timeLeft)} to respond
                </span>
              </div>
            </div>
          )}

          {/* Interview scheduled */}
          {offer.interviewScheduled && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Icon icon="heroicons:video-camera" className="w-4 h-4 text-primary-600 mr-2" aria-hidden="true" />
                <span className="font-medium text-primary-700">
                  Interview scheduled for {new Date(offer.interviewDate).toLocaleDateString()} at {new Date(offer.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}

          {/* Client message for accepted offers */}
          {offer.clientMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <Icon icon="heroicons:chat-bubble-left" className="w-4 h-4 text-green-600 mr-2 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-medium text-green-700">Client Message:</span>
                  <p className="text-sm text-green-700 mt-1">"{offer.clientMessage}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Rejection reason */}
          {offer.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <Icon icon="heroicons:x-circle" className="w-4 h-4 text-red-600 mr-2 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-medium text-red-700">Rejection Reason:</span>
                  <p className="text-sm text-red-700 mt-1">{offer.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Offer Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Your Offer Details</h4>
            <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Timeline:</span>
                <span className="font-medium ml-2">{offer.proposedTimeline}</span>
              </div>
              <div>
                <span className="text-gray-600">Warranty:</span>
                <span className="font-medium ml-2">{offer.warranty}</span>
              </div>
              <div>
                <span className="text-gray-600">Competitors:</span>
                <span className="font-medium ml-2">{offer.totalProposals} proposals</span>
              </div>
            </div>
            {offer.coverLetter && (
              <div className="mt-3">
                <span className="text-gray-600 text-sm">Cover Letter:</span>
                <p className="text-sm text-gray-700 mt-1 italic">"{offer.coverLetter}"</p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <span>Submitted: {new Date(offer.submittedDate).toLocaleDateString()}</span>
              {offer.acceptedDate && (
                <span className="text-green-600">Accepted: {new Date(offer.acceptedDate).toLocaleDateString()}</span>
              )}
              {offer.rejectedDate && (
                <span className="text-red-600">Rejected: {new Date(offer.rejectedDate).toLocaleDateString()}</span>
              )}
              {offer.withdrawnDate && (
                <span className="text-gray-600">Withdrawn: {new Date(offer.withdrawnDate).toLocaleDateString()}</span>
              )}
            </div>
            <span className="text-xs text-gray-500">Job ID: {offer.jobId}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
        {offer.status === 'submitted' && (
          <>
            <button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Edit Offer
            </button>
            <button className="flex-1 border border-red-300 text-red-700 py-2 px-4 rounded-lg hover:bg-red-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
              Withdraw
            </button>
          </>
        )}
        {offer.status === 'under_review' && (
          <>
            <button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Message Client
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              View Job Details
            </button>
          </>
        )}
        {offer.status === 'accepted' && (
          <>
            <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Start Job
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Message Client
            </button>
          </>
        )}
        {(offer.status === 'rejected' || offer.status === 'withdrawn') && (
          <>
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              View Job Details
            </button>
            <button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Find Similar Jobs
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
            type === 'submitted' ? 'heroicons:paper-airplane' :
            type === 'accepted' ? 'heroicons:check-circle' :
            type === 'rejected' ? 'heroicons:x-circle' :
            type === 'under_review' ? 'heroicons:document-text' :
            'heroicons:document-text'
          }
          className="w-8 h-8 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type === 'under_review' ? 'offers under review' : `${type} offers`}
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {type === 'submitted' ? 'You haven\'t submitted any offers yet.' :
         type === 'accepted' ? 'You don\'t have any accepted offers.' :
         type === 'rejected' ? 'No rejected offers to show.' :
         type === 'withdrawn' ? 'No withdrawn offers.' :
         'No offers under review.'}
      </p>
      <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
        Browse Jobs
      </button>
    </div>
  );

  const getTabCounts = () => ({
    all: filteredOffers.length,
    submitted: offersData.submitted.length,
    under_review: offersData.underReview.length,
    accepted: offersData.accepted.length,
    rejected: offersData.rejected.length,
    withdrawn: offersData.withdrawn.length,
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Offers</h1>
          <p className="text-gray-600 text-lg">Track and manage all your job offers with ease</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search offers by job title, client, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm"
              aria-label="Search offers"
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
            <nav className="flex space-x-2 sm:space-x-6 px-4 sm:px-6 -mb-px overflow-x-auto" role="tablist">
              {[
                { id: 'all', label: 'All Offers' },
                { id: 'submitted', label: 'Submitted' },
                { id: 'under_review', label: 'Under Review' },
                { id: 'accepted', label: 'Accepted' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'withdrawn', label: 'Withdrawn' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 sm:px-4 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                >
                  {tab.label}
                  {tabCounts[tab.id] > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs font-medium">
                      {tabCounts[tab.id]}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6" role="tabpanel" id={`${activeTab}-panel`}>
            <div className="space-y-6">
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
              ) : (
                <EmptyState type={activeTab} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOffersPage;