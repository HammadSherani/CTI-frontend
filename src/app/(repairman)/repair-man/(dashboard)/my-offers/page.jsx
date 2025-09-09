"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';

// Reusable Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems,
  itemsPerPage,
  className = "" 
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Items count info */}
      <div className="flex items-center text-sm text-gray-500">
        <span>
          Showing {startItem} to {endItem} of {totalItems} offers
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="heroicons:chevron-left" className="w-4 h-4 mr-1" />
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                page === currentPage
                  ? 'bg-primary-600 text-white border border-primary-600'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <Icon icon="heroicons:chevron-right" className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

const MyOffersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const {token} = useSelector((state) => state.auth); 
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAlloffers = async (page = 1) => {
    setLoading(true);
    try{
      const res = await axiosInstance.get(`/repairman/offers/my-offers?page=${page}&limit=10`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });

      setOffers(res.data.data);
    }catch(error){
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAlloffers(currentPage);
  }, [currentPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-primary-100 text-primary-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
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
    if (!offers?.offers) return [];
    
    let offersToFilter = offers.offers;
    
    // Filter by status if not "all"
    if (activeTab !== 'all') {
      offersToFilter = offers.offers.filter(offer => {
        if (activeTab === 'expired') return offer.isExpired;
        return offer.status === activeTab;
      });
    }

    return offersToFilter.filter((offer) => {
      const jobTitle = offer.jobId?.deviceInfo?.brand + ' ' + offer.jobId?.deviceInfo?.model || '';
      const description = offer.description || '';
      
      const matchesSearch = jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUrgency = urgencyFilter === 'all' || offer.jobId?.urgency === urgencyFilter;
      return matchesSearch && matchesUrgency;
    });
  }, [activeTab, searchQuery, urgencyFilter, offers]);

  // Summary Component
  const OffersSummary = () => {
    const summary = offers?.summary || {};
    const totalOffers = offers?.pagination?.totalOffers || 0;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon icon="heroicons:document-text" className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Offers</p>
              <p className="text-2xl font-bold text-gray-900">{totalOffers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Icon icon="heroicons:clock" className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{summary.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Icon icon="heroicons:check-circle" className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">{summary.accepted || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Icon icon="heroicons:x-circle" className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{summary.rejected || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon icon="heroicons:exclamation-triangle" className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{summary.expired || 0}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OfferCard = ({ offer }) => {
    const jobTitle = `${offer.jobId?.deviceInfo?.brand || ''} ${offer.jobId?.deviceInfo?.model || ''} Repair`;
    const clientInitials = 'CL'; // You'll need to get actual client data
    const location = offer.jobId?.location?.address || 'Location not specified';
    
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex items-start space-x-4 w-full">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-base font-semibold text-primary-700">{clientInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-xl text-gray-900 mb-1">{jobTitle}</h3>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 mb-2">
                <span>Device: {offer.jobId?.deviceInfo?.color} {offer.jobId?.deviceInfo?.brand} {offer.jobId?.deviceInfo?.model}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="flex items-center">
                  <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" aria-hidden="true" />
                  {location}
                </span>
                {offer.jobId?.urgency && (
                  <span className={`font-medium ${getUrgencyColor(offer.jobId.urgency)}`} aria-label={`Priority: ${offer.jobId.urgency}`}>
                    {offer.jobId.urgency.charAt(0).toUpperCase() + offer.jobId.urgency.slice(1)} Priority
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right w-full sm:w-auto">
            <p className="text-2xl font-bold text-gray-900">{offer.pricing?.currency} {offer.pricing?.totalPrice?.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Base: {offer.pricing?.currency} {offer.pricing?.basePrice}</p>
            <p className="text-sm text-gray-600">Parts: {offer.pricing?.currency} {offer.pricing?.partsEstimate}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(offer.isExpired ? 'expired' : offer.status)}`}>
              {offer.isExpired ? 'Expired' : offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Always Visible Details */}
        <div className="pt-4 border-t border-gray-100">
          {/* Time-sensitive information */}
          {offer.timeRemaining > 0 && !offer.isExpired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Icon icon="heroicons:clock" className="w-4 h-4 text-yellow-600 mr-2" aria-hidden="true" />
                <span className={`font-medium ${getTimeLeftColor(offer.timeRemaining)}`} aria-label={`Time left: ${formatTimeLeft(offer.timeRemaining)}`}>
                  {formatTimeLeft(offer.timeRemaining)} to respond
                </span>
              </div>
            </div>
          )}

          {offer.isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Icon icon="heroicons:exclamation-triangle" className="w-4 h-4 text-red-600 mr-2" aria-hidden="true" />
                <span className="font-medium text-red-700">This offer has expired</span>
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
                <span className="font-medium ml-2">{offer.estimatedTime?.value} {offer.estimatedTime?.unit}</span>
              </div>
              <div>
                <span className="text-gray-600">Warranty:</span>
                <span className="font-medium ml-2">{offer.warranty?.duration} days</span>
              </div>
              <div>
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium ml-2">{offer.locationInfo?.distance?.toFixed(1)} km</span>
              </div>
            </div>
            
            {/* Service Options */}
            <div className="mt-4">
              <h5 className="font-medium text-gray-900 mb-2">Service Options:</h5>
              <div className="space-y-1 text-sm">
                {offer.serviceOptions?.homeService && (
                  <div className="flex justify-between">
                    <span>Home Service:</span>
                    <span className="font-medium">+{offer.pricing?.currency} {offer.serviceOptions.homeServiceCharge}</span>
                  </div>
                )}
                {offer.serviceOptions?.pickupAvailable && (
                  <div className="flex justify-between">
                    <span>Pickup Service:</span>
                    <span className="font-medium">+{offer.pricing?.currency} {offer.serviceOptions.pickupCharge}</span>
                  </div>
                )}
                {offer.serviceOptions?.dropOffLocation && (
                  <div className="mt-2">
                    <span className="text-gray-600">Drop-off Location:</span>
                    <p className="text-sm text-gray-700 mt-1">{offer.serviceOptions.dropOffLocation}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">Experience:</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium ml-2">{offer.experience?.successRate}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Similar Repairs:</span>
                  <span className="font-medium ml-2">{offer.experience?.similarRepairs}</span>
                </div>
              </div>
            </div>

            {offer.warranty?.description && (
              <div className="mt-3">
                <span className="text-gray-600 text-sm">Warranty Details:</span>
                <p className="text-sm text-gray-700 mt-1">"{offer.warranty.description}"</p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <span>Submitted: {new Date(offer.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(offer.updatedAt).toLocaleDateString()}</span>
              {offer.availability?.canStartBy && (
                <span className="text-green-600">Can start by: {new Date(offer.availability.canStartBy).toLocaleDateString()}</span>
              )}
            </div>
            <div className="flex flex-col text-xs text-gray-500 mt-2 sm:mt-0">
              <span>Job ID: {offer.jobId?._id}</span>
              <span>Viewed: {offer.viewedByCustomer ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
          {offer.status === 'pending' && !offer.isExpired && (
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
          {(offer.status === 'rejected' || offer.status === 'withdrawn' || offer.isExpired) && (
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
  };

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon
          icon={
            type === 'pending' ? 'heroicons:paper-airplane' :
            type === 'accepted' ? 'heroicons:check-circle' :
            type === 'rejected' ? 'heroicons:x-circle' :
            type === 'expired' ? 'heroicons:exclamation-triangle' :
            'heroicons:document-text'
          }
          className="w-8 h-8 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type === 'expired' ? 'expired offers' : `${type} offers`}
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {type === 'pending' ? 'You haven\'t submitted any pending offers yet.' :
         type === 'accepted' ? 'You don\'t have any accepted offers.' :
         type === 'rejected' ? 'No rejected offers to show.' :
         type === 'withdrawn' ? 'No withdrawn offers.' :
         type === 'expired' ? 'No expired offers.' :
         'No offers found.'}
      </p>
      <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
        Browse Jobs
      </button>
    </div>
  );

  const getTabCounts = () => {
    const summary = offers?.summary || {};
    return {
      all: offers?.pagination?.totalOffers || 0,
      pending: summary.pending || 0,
      accepted: summary.accepted || 0,
      rejected: summary.rejected || 0,
      expired: summary.expired || 0,
    };
  };

  const tabCounts = getTabCounts();

  const handleClearFilters = () => {
    setSearchQuery('');
    setUrgencyFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Offers</h1>
          <p className="text-gray-600 text-lg">Track and manage all your job offers with ease</p>
        </div>

        {/* Summary Cards */}
        <OffersSummary />

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search offers by device, brand, or description..."
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
                { id: 'pending', label: 'Pending' },
                { id: 'accepted', label: 'Accepted' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'expired', label: 'Expired' },
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
              {filteredOffers?.length > 0 ? (
                <>
                  {filteredOffers.map((offer) => <OfferCard key={offer._id} offer={offer} />)}
                  
                  {/* Pagination */}
                  {offers?.pagination && (
                    <Pagination
                      currentPage={offers.pagination.current}
                      totalPages={offers.pagination.total}
                      onPageChange={handlePageChange}
                      totalItems={offers.pagination.totalOffers}
                      itemsPerPage={offers.pagination.count}
                      className="mt-8 pt-6 border-t border-gray-200"
                    />
                  )}
                </>
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