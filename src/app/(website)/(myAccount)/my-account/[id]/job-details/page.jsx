"use client";

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import BookingModal from './BookingModal';

// Separate components for better performance
const LoadingSpinner = () => (
    <div className="max-w-6xl mx-auto p-6 bg-white my-10">
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    </div>
);

const StatusBadge = ({ status, className = "" }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'text-green-600 bg-green-50';
            case 'closed': return 'text-red-600 bg-red-50';
            case 'in-progress': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
            {status?.toUpperCase()}
        </span>
    );
};

const UrgencyBadge = ({ urgency, className = "" }) => {
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(urgency)} ${className}`}>
            {urgency?.toUpperCase()} PRIORITY
        </span>
    );
};

// Expandable Description Component
const ExpandableDescription = ({ description, maxLength = 150 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!description) return <p className="text-gray-500 text-sm">No description provided.</p>;

    const shouldTruncate = description.length > maxLength;
    const displayText = isExpanded ? description : description.slice(0, maxLength);

    return (
        <div className="text-gray-700 text-sm">
            <p className="leading-relaxed">
                {displayText}
                {!isExpanded && shouldTruncate && '...'}
            </p>
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm mt-1 transition-colors duration-200"
                >
                    {isExpanded ? 'Read Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};

// Rating Stars Component
const RatingStars = ({ rating = 0, size = "text-lg" }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`${size} ${star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    aria-label={`Star ${star}`}
                >
                    {star <= Math.floor(rating) ? '★' : '☆'}
                </span>
            ))}
            <span className="ml-1 text-sm font-medium text-gray-600">
                {rating > 0 ? rating.toFixed(1) : 'New'}
            </span>
        </div>
    );
};

// Booking Modal Component


// Offer Card Component
const OfferCard = ({ offer, index, onAcceptOffer, isSubmitting, submittingOfferId, data }) => {
    const currencySymbol = offer.pricing?.currency === 'TRY' ? '₺' : '₹';
    const isThisOfferSubmitting = isSubmitting && submittingOfferId === offer._id;

    const isBooked = data?.status === 'booked';
    const isDisabled = isBooked || isSubmitting || isThisOfferSubmitting;

    const baseClasses = "px-4 py-2 rounded text-sm transition-colors duration-200 flex items-center gap-2";
    const disabledClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";
    const submittingClasses = "bg-blue-400 text-white cursor-not-allowed";
    const activeClasses = "bg-blue-600 text-white hover:bg-blue-700";

    const getButtonClasses = () => {
        if (isBooked || isSubmitting) return `${baseClasses} ${disabledClasses}`;
        if (isThisOfferSubmitting) return `${baseClasses} ${submittingClasses}`;
        return `${baseClasses} ${activeClasses}`;
    };

    const label = offer.repairmanId?.name || `Professional ${index + 1}`;

    return (
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {offer.repairmanId?.name || `Professional ${index + 1}`}
                            </h3>
                            <span className="text-gray-500 text-sm">
                                @{offer.repairmanId?.repairmanProfile?.shopName || `shop${index + 1}`}
                            </span>
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center" aria-label="Verified Professional">
                                <span className="text-white text-xs">✓</span>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                                {currencySymbol}{offer.pricing?.totalPrice || offer.pricing?.basePrice || '1,000'}.00
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                                {offer.pricing?.partsEstimate && (
                                    <span className="block">+ {currencySymbol}{offer.pricing.partsEstimate} parts</span>
                                )}
                                <span>Estimated: {offer.estimatedTime?.value || 'N/A'} {offer.estimatedTime?.unit || 'hours'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Rating and Stats */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <RatingStars rating={offer.repairmanId?.repairmanProfile?.rating} />

                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded">
                            🔧 {offer.repairmanId?.repairmanProfile?.totalJobs || 0} jobs
                        </span>

                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                            ✅ {offer.experience?.successRate || 0}% success
                        </span>

                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                            📍 {offer.locationContext?.distance?.toFixed(1) || 'N/A'} km
                        </span>

                        <div className="flex items-center gap-1">
                            <span className="text-xs">🇵🇰</span>
                            <span className="text-sm text-gray-600">
                                {offer.repairmanId?.repairmanProfile?.city || 'Pakistan'}
                            </span>
                        </div>
                    </div>

                    {/* Service Details */}
                    <div className="mb-4 space-y-3">
                        <div className="text-sm font-medium text-gray-700">
                            {offer.repairmanId?.repairmanProfile?.shopName || 'Repair Service'} - {offer.experience?.similarRepairs || 0} similar repairs
                        </div>

                        {/* Service Options Badges */}
                        <div className="flex flex-wrap gap-2">
                            {offer.serviceOptions?.pickupAvailable && (
                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                                    🚗 Pickup Available ({currencySymbol}{offer.serviceOptions.pickupCharge})
                                </span>
                            )}
                            {offer.serviceOptions?.homeService && (
                                <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                                    🏠 Home Service
                                </span>
                            )}
                            {offer.warranty?.duration && (
                                <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">
                                    🛡️ {offer.warranty.duration} days warranty
                                </span>
                            )}
                            {offer.pricing?.partsQuality && (
                                <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded">
                                    🔧 {offer.pricing.partsQuality.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} parts
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Expandable Description */}
                    <div className="mb-4">
                        <ExpandableDescription description={offer.description} />
                    </div>

                    {/* Availability and Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-sm text-gray-500">
                            <span>
                                Can start by: {offer.availability?.canStartBy
                                    ? new Date(offer.availability.canStartBy).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })
                                    : 'Available now'}
                            </span>
                            {offer.serviceOptions?.dropOffLocation && (
                                <div className="text-xs mt-1 line-clamp-1">
                                    📍 {offer.serviceOptions.dropOffLocation}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => onAcceptOffer(offer)}
                                disabled={isDisabled}
                                className={getButtonClasses()}
                                aria-label={`Accept offer from ${label}`}
                            >
                                {isThisOfferSubmitting ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Booking...
                                    </>
                                ) : (
                                    'Accept Offer'
                                )}
                            </button>

                            <button
                                className="text-red-500 text-sm hover:text-red-700 hover:underline transition-colors duration-200"
                                disabled={isSubmitting}
                            >
                                Report Bid
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function JobDetails() {
    const [data, setData] = useState(null);
    const [offers, setOffers] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
    const [submittingOfferId, setSubmittingOfferId] = useState(null);

    const { id } = useParams();
    const { token } = useSelector(state => state.auth);
    const router = useRouter();

    // Memoized helper functions
    const formatBudget = useCallback((budget) => {
        if (!budget) return 'Budget not specified';
        return `${budget.currency} ${budget.min.toLocaleString()} – ${budget.max.toLocaleString()}`;
    }, []);

    const getTimeRemaining = useCallback((expiresAt) => {
        if (!expiresAt) return 'No deadline';

        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) return 'EXPIRED';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return `${days} DAYS, ${hours} HOURS`;
    }, []);

    const fetchJob = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`/repair-jobs/my-jobs/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setData(res.data.data.job);
            setOffers(res.data.data.offers);
        } catch (error) {
            handleError(error);
        }
    }, [id, token]);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleDelete = useCallback(async () => {
        if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/repair-jobs/my-jobs/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Job deleted successfully!');
            router.push('/jobs');
        } catch (error) {
            handleError(error);
            setIsDeleting(false);
        }
    }, [id, token, router]);

    const handleAcceptOffer = useCallback((offer) => {
        setSelectedOffer(offer);
        setShowBookingModal(true);
    }, []);

    const handleSubmitBooking = useCallback(async (bookingData) => {
        if (!selectedOffer) return;

        setIsSubmittingOffer(true);
        setSubmittingOfferId(selectedOffer._id);

        try {
            const response = await axiosInstance.post(
                `/repair-jobs/${id}/select-offer`,
                {
                    offerId: selectedOffer._id,
                    serviceType: bookingData.serviceType,
                    scheduledDate: selectedOffer?.availability?.canStartBy,
                    // timeSlot: bookingData.timeSlot,
                    specialInstructions: bookingData.specialInstructions
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // alert('Booking created successfully!');
                setShowBookingModal(false);
                setSelectedOffer(null);

                // Refresh job data to see updated status
                await fetchJob();

                // Optionally redirect to booking details or jobs list
                // router.push('/bookings');
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsSubmittingOffer(false);
            setSubmittingOfferId(null);
        }
    }, [selectedOffer, id, token, router, fetchJob]);

    const handleCloseModal = useCallback(() => {
        if (!isSubmittingOffer) {
            setShowBookingModal(false);
            setSelectedOffer(null);
        }
    }, [isSubmittingOffer]);

    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

    // Memoized computed values
    const deviceTitle = useMemo(() => {
        if (!data) return '';
        return `${data.deviceInfo?.brand || ''} ${data.deviceInfo?.model || ''} (${data.deviceInfo?.color || ''}) - ${data.services?.join(', ') || ''}`;
    }, [data]);

    const offersCount = useMemo(() => {
        return offers?.length || 0;
    }, [offers]);

    // Check if job can accept offers (not booked/closed)
    const canAcceptOffers = useMemo(() => {
        return data && ['open', 'offers_received'].includes(data.status);
    }, [data]);

    if (!data) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white my-4 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{deviceTitle}</h1>
                    <div className="flex items-center gap-4">
                        <StatusBadge status={data.status} />
                        <UrgencyBadge urgency={data.urgency} />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {canAcceptOffers && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 ${isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {isDeleting ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Job
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Status Alert for Non-Open Jobs */}
            {!canAcceptOffers && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-yellow-800 text-sm font-medium">
                            {data.status === 'booked' ? 'This job has been booked and offers can no longer be accepted.' :
                                data.status === 'closed' ? 'This job has been closed.' :
                                    'This job is no longer accepting offers.'}
                        </span>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'details'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Details
                    </button>
                    <button
                        onClick={() => setActiveTab('proposals')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'proposals'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Offers ({offersCount})
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                    {/* Budget and Expiry */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                                {formatBudget(data.budget)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                <span className="font-medium">EXPIRES IN {getTimeRemaining(data.expiresAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                        <ExpandableDescription description={data.description} maxLength={200} />
                    </div>

                    {/* Services Required */}
                    {data.services && data.services.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Services Required</h2>
                            <div className="flex flex-wrap gap-2">
                                {data.services.map((service, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-sm"
                                    >
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Location and Service Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                            <p className="text-gray-700">{data.location?.address}</p>
                            <p className="text-sm text-gray-500">{data.location?.city}, {data.location?.district}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Preference</h3>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm capitalize">
                                {data.servicePreference}
                            </span>
                            <p className="text-sm text-gray-500 mt-2">
                                Service radius: {data.jobRadius} km
                            </p>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <span className="text-sm text-gray-500">Max Offers</span>
                            <p className="font-semibold">{data.maxOffers}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Current Offers</span>
                            <p className="font-semibold">{offersCount}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">View Count</span>
                            <p className="font-semibold">{data.viewCount}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Auto Select Best</span>
                            <p className="font-semibold">{data.autoSelectBest ? 'Yes' : 'No'}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            <p>Created: {new Date(data.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Offers</h2>
                        <span className="text-sm text-gray-500">
                            {offersCount} of {data.maxOffers} offers received
                        </span>
                    </div>

                    {offersCount > 0 ? (
                        <div className="space-y-6">
                            {offers.map((offer, index) => (
                                <OfferCard
                                    key={offer._id || index}
                                    offer={offer}
                                    index={index}
                                    onAcceptOffer={canAcceptOffers ? handleAcceptOffer : null}
                                    isSubmitting={isSubmittingOffer}
                                    submittingOfferId={submittingOfferId}
                                    data={data}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-lg font-medium mb-2">No Offers Available</div>
                            <div className="text-sm">Waiting for repair professionals to submit their offers!</div>
                        </div>
                    )}
                </div>
            )}

            {/* Booking Modal */}
            <BookingModal
                isOpen={showBookingModal}
                onClose={handleCloseModal}
                offer={selectedOffer}
                onSubmit={handleSubmitBooking}
                isSubmitting={isSubmittingOffer}
                job={data}
            />
        </div>
    );
}

export default JobDetails;