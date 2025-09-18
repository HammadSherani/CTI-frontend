"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import OfferCard from './OfferCard';

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
  }, [currentPage, refreshTrigger]);

  // Function to handle job acceptance and trigger refresh
  const handleJobAccepted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter and search offers - Filter out in_progress offers completely
  const filteredOffers = useMemo(() => {
    if (!offers?.offers) return [];
    
    let offersToFilter = offers.offers;
    
    // ALWAYS filter out in_progress offers from all tabs
    offersToFilter = offersToFilter.filter(offer => offer.status !== 'in_progress');
    
    // Filter by status if not "all"
    if (activeTab !== 'all') {
      if (activeTab === 'expired') {
        offersToFilter = offersToFilter.filter(offer => offer.isExpired);
      } else {
        offersToFilter = offersToFilter.filter(offer => offer.status === activeTab);
      }
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

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon
          icon={
            type === 'pending' ? 'heroicons:paper-airplane' :
            type === 'accepted' ? 'heroicons:check-circle' :
            type === 'rejected' ? 'heroicons:x-circle' :
            type === 'expired' ? 'heroicons:exclamation-triangle' :
            type === 'in_progress' ? 'heroicons:cog-6-tooth' :
            'heroicons:document-text'
          }
          className="w-8 h-8 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type === 'expired' ? 'expired offers' : 
             type === 'in_progress' ? 'jobs in progress' :
             `${type} offers`}
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {type === 'pending' ? 'You haven\'t submitted any pending offers yet.' :
         type === 'accepted' ? 'You don\'t have any accepted offers.' :
         type === 'rejected' ? 'No rejected offers to show.' :
         type === 'withdrawn' ? 'No withdrawn offers.' :
         type === 'expired' ? 'No expired offers.' :
         type === 'in_progress' ? 'No jobs currently in progress.' :
         'No offers found.'}
      </p>
      <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
        Browse Jobs
      </button>
    </div>
  );

  // Calculate counts properly - excluding in_progress from all counts
  const getTabCounts = () => {
    if (!offers?.offers) return { all: 0, pending: 0, accepted: 0, rejected: 0, expired: 0 };
    
    const allOffers = offers.offers.filter(offer => offer.status !== 'in_progress'); // Filter out in_progress
    const counts = {
      all: allOffers.length,
      pending: allOffers.filter(offer => offer.status === 'pending').length,
      accepted: allOffers.filter(offer => offer.status === 'accepted').length,
      rejected: allOffers.filter(offer => offer.status === 'rejected').length,
      expired: allOffers.filter(offer => offer.isExpired).length,
    };
    
    return counts;
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

        {/* Tabs - Removed In Progress tab */}
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
                  {filteredOffers.map((offer) => (
                    <OfferCard 
                      key={offer._id} 
                      offer={offer} 
                      onJobAccepted={handleJobAccepted}
                    />
                  ))}
                  
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