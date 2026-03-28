"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import OfferCard from './OfferCard';
import { toast } from 'react-toastify';
import SmallLoader from '@/components/SmallLoader';
import { SearchableDropdown } from '@/components/dropdown';

// --- Reusable Pagination Component ---
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
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            <div className="flex items-center text-sm text-gray-500">
                <span>
                    Showing {startItem} to {endItem} of {totalItems} offers
                </span>
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icon icon="heroicons:chevron-left" className="w-4 h-4 mr-1" />
                    Prev
                </button>

                <div className="flex items-center space-x-1">
                    {visiblePages.map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            disabled={page === '...'}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${page === currentPage
                                ? 'bg-primary-600 text-white border border-primary-600'
                                : page === '...'
                                    ? 'text-gray-400 cursor-default'
                                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                    <Icon icon="heroicons:chevron-right" className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const MyOffersPage = () => {
    // States
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const { token } = useSelector((state) => state.auth);
    const [offersData, setOffersData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isChangeStatus, setIsChangeStatus] = useState(false);

    // Fetch Offers from API
    const getAlloffers = async (page = 1) => {
        setLoading(true);
        try {
            let url = `/repairman/offers/my-offers?page=${page}&limit=10`;
            
            // Adding Status Filter to Query
            if (statusFilter !== 'all') {
                url += `&status=${statusFilter}`;
            }

            const res = await axiosInstance.get(url, {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            setOffersData(res.data.data);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }

    // Effect triggers when page, status, or manual refresh changes
    useEffect(() => {
        getAlloffers(currentPage);
    }, [currentPage, statusFilter, refreshTrigger]);


     const statusOptions = [
        { _id: 'all', name: 'All Status' },
        { _id: 'pending', name: 'Pending' },
        { _id: 'accepted', name: 'Accepted' },
        { _id: 'rejected', name: 'Rejected' },
        { _id: 'expired', name: 'Expired' },
        { _id: 'withdrawn', name: 'Withdrawn' },
    ];

     const urgencyOptions=[
    { _id: 'all', name: 'All Priorities' },
    { _id: 'high', name: 'High Priority' },
    { _id: 'medium', name: 'Medium Priority' },
    { _id: 'low', name: 'Low Priority' },
  ]
    const handleStartJob = async (id) => {
        try {
            setIsChangeStatus(true);
            const { data } = await axiosInstance.patch(
                `/repairman/offers/start-job/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getAlloffers(currentPage);
            toast.success(data?.message);
        } catch (error) {
            handleError(error);
        } finally {
            setIsChangeStatus(false);
        }
    };

    const handleJobAccepted = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Client-side filtering for Search and Urgency
    const filteredOffers = useMemo(() => {
        if (!offersData?.offers) return [];
        
        return offersData.offers.filter((offer) => {
            if (!offer.jobId) return false;

            if (offer.status === 'in_progress') return false;

            const jobTitle = `${offer.jobId?.deviceInfo?.brand || ''} ${offer.jobId?.deviceInfo?.model || ''}`;
            const description = offer.description || '';

            const matchesSearch = jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                description.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesUrgency = urgencyFilter === 'all' || offer.jobId?.urgency === urgencyFilter;
            
            return matchesSearch && matchesUrgency;
        });
    }, [searchQuery, urgencyFilter, offersData]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setUrgencyFilter('all');
        setStatusFilter('all');
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    
//     const sortedOffers = [...filteredOffers].sort((a, b) => {
//   switch (sortBy) {
//     case "latest":
//       return new Date(b.createdAt) - new Date(a.createdAt);

//     case "oldest":
//       return new Date(a.createdAt) - new Date(b.createdAt);

//     case "price_low":
//       return (a.pricing?.totalPrice || 0) - (b.pricing?.totalPrice || 0);

//     case "price_high":
//       return (b.pricing?.totalPrice || 0) - (a.pricing?.totalPrice || 0);

//     default:
//       return 0;
//   }
// });

    // Empty State Component
    const EmptyState = () => (
        <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Icon icon="heroicons:document-magnifying-glass" className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
                We couldn't find any offers matching your current filters. Try adjusting your search or status.
            </p>
            <button 
                onClick={handleClearFilters}
                className="text-primary-600 font-semibold hover:underline"
            >
                Clear all filters
            </button>
        </div>
    );

    if (loading && !offersData) {
        return <SmallLoader loading={loading} text="Fetching your offers..." />;
    }

    {
   
       

}
    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">My Offers</h1>
                    <p className="text-gray-500 text-lg">Manage and track your service proposals in one place.</p>
                </div>

                {/* Filter Toolbar */}
                <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-5 shadow-sm rounded-2xl border border-gray-100 items-center">
                    {/* Search Bar */}
                    <div className="relative lg:col-span-5">
                        <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by device, brand..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all"
                        />
                    </div>

   <div className="col-span-2">
       <SearchableDropdown
         label="Status"
         options={statusOptions}
         value={statusFilter}
         onChange={setStatusFilter}
      
       />
     </div>

      <div className="col-span-3">
       <SearchableDropdown
         label="Urgency"
         options={urgencyOptions}
         value={urgencyFilter}
         onChange={setUrgencyFilter}
      
       />
     </div>



                    {/* Reset Button */}
                    <div className="lg:col-span-2">
                        <button
                            onClick={handleClearFilters}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-all shadow-sm active:scale-95"
                        >
                            Reset
                        </button>
                    </div>
                </div>
{/* <div className="mb-10 flex justify-between items-center">
  <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
    Showing {filteredOffers.length} offers
  </h1>

  <div className="flex items-center gap-3">
    <span className="text-sm text-gray-500">Sort by:</span>

    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
    >
      <option value="latest">Latest</option>
      <option value="oldest">Oldest</option>
      <option value="price_low">Price: Low → High</option>
      <option value="price_high">Price: High → Low</option>
    </select>
  </div>
</div> */}

                {/* Main Results Container */}
                <div className="min-h-[400px]">
                    {loading ? (
                         <div className="flex justify-center items-center h-64">
                            <SmallLoader loading={true} text="Updating list..." />
                         </div>
                    ) : filteredOffers.length > 0 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                {filteredOffers.map((offer) => (
                                    console.log('offer:', offer),
                                    <OfferCard
                                        key={offer._id}
                                        offer={offer}
                                        onJobAccepted={handleJobAccepted}
                                        handleStartJob={handleStartJob}
                                        isChangeStatus={isChangeStatus}
                                    />
                                ))}
                            </div>

                            

                            {/* Pagination Section */}
                            {offersData?.pagination && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
                                    <Pagination
                                        currentPage={offersData.pagination.current}
                                        totalPages={offersData.pagination.total}
                                        onPageChange={handlePageChange}
                                        totalItems={offersData.pagination.totalOffers}
                                        itemsPerPage={offersData.pagination.count}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <EmptyState />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOffersPage;