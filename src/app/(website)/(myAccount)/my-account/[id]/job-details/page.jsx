"use client";

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import BookingModal from './BookingModal';
import BookingDetails from './BookingDetails';
import OfferCard from './OfferCard';
import StatusBadge from '@/components/partials/customer/Offer/StatusBadge';

// Separate components for better performance
const LoadingSpinner = () => (
    <div className="max-w-6xl mx-auto p-6 bg-white my-10">
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    </div>
);



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



function JobDetails() {
    const [job, setJob] = useState(null);
    const [offers, setOffers] = useState([]);
    const [booking, setBooking] = useState(null);
    const [statistics, setStatistics] = useState(null);
    
    const [activeTab, setActiveTab] = useState('details');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
    const [submittingOfferId, setSubmittingOfferId] = useState(null);
    const [loading, setLoading] = useState(true);

    const { id } = useParams();
    const { token } = useSelector(state => state.auth);
    const router = useRouter();

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
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/repair-jobs/my-jobs/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const { job, booking, statistics } = res.data.data;
            
            setJob(job);
            setBooking(booking || null);
            setStatistics(statistics || null);
            
            if (job?.selectedOffer) {
                setOffers([job.selectedOffer]);
            } else if (res.data.data.offers) {
                setOffers(res.data.data.offers);
            } else {
                setOffers([]);
            }
            
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
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
        router.push(`/my-account/${id}/offer/${selectedOffer._id}/check-out`);


        return;

        try {
            const response = await axiosInstance.post(
                `/repair-jobs/${id}/select-offer`,
                {
                    offerId: selectedOffer._id,
                    serviceType: bookingData.serviceType,
                    scheduledDate: selectedOffer?.availability?.canStartBy,
                    specialInstructions: bookingData.specialInstructions
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setShowBookingModal(false);
                setSelectedOffer(null);
                await fetchJob();
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

    const deviceTitle = useMemo(() => {
        if (!job) return '';
        return `${job.deviceInfo?.brand || ''} ${job.deviceInfo?.model || ''} (${job.deviceInfo?.color || ''}) - ${job.services?.join(', ') || ''}`;
    }, [job]);

    const offersCount = useMemo(() => {
        return offers?.length || 0;
    }, [offers]);

    const canAcceptOffers = useMemo(() => {
        return job && ['open', 'offers_received'].includes(job.status);
    }, [job]);

    const shouldShowOffers = useMemo(() => {
        return job && (['open', 'offers_received'].includes(job.status) || job.selectedOffer);
    }, [job]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!job) {
        return (
            <div className="max-w-6xl mx-auto p-6 bg-white my-10">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Job not found</h2>
                    <p className="text-gray-600 mt-2">The job you're looking for doesn't exist or has been removed.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white my-4 rounded-lg">
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{deviceTitle}</h1>
                    <div className="flex items-center gap-4">
                        <StatusBadge status={job.status} />
                        <UrgencyBadge urgency={job.urgency} />
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

            {!canAcceptOffers && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-yellow-800 text-sm font-medium">
                            {job.status === 'booked' ? 'This job has been booked and offers can no longer be accepted.' :
                                job.status === 'closed' ? 'This job has been closed.' :
                                    job.status === 'in_progress' ? 'This job is currently in progress.' :
                                        job.status === 'completed' ? 'This job has been completed.' :
                                            'This job is no longer accepting offers.'}
                        </span>
                    </div>
                </div>
            )}


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
                    {shouldShowOffers && (
                        <button
                            onClick={() => setActiveTab('proposals')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'proposals'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {job.selectedOffer ? 'Selected Offer' : `Offers (${offersCount})`}
                        </button>
                    )}
                    {booking && (
                        <button
                            onClick={() => setActiveTab('booking')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'booking'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Booking Details
                        </button>
                    )}
                </nav>
            </div>

            {activeTab === 'details' ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                                {formatBudget(job.budget)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                <span className="font-medium">EXPIRES IN {getTimeRemaining(job.expiresAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                        <ExpandableDescription description={job.description} maxLength={200} />
                    </div>

                    {job.services && job.services.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Services Required</h2>
                            <div className="flex flex-wrap gap-2">
                                {job.services.map((service, index) => (
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                            <p className="text-gray-700">{job.location?.address}</p>
                            <p className="text-sm text-gray-500">{job.location?.city}, {job.location?.district}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Preference</h3>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm capitalize">
                                {job.servicePreference}
                            </span>
                            <p className="text-sm text-gray-500 mt-2">
                                Service radius: {job.jobRadius} km
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <span className="text-sm text-gray-500">Max Offers</span>
                            <p className="font-semibold">{job.maxOffers}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Current Offers</span>
                            <p className="font-semibold">{shouldShowOffers ? job.offers?.length || offersCount : 'Hidden'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">View Count</span>
                            <p className="font-semibold">{job.viewCount}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Auto Select Best</span>
                            <p className="font-semibold">{job.autoSelectBest ? 'Yes' : 'No'}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            <p>Created: {new Date(job.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'proposals' && shouldShowOffers ? (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {job.selectedOffer ? 'Selected Offer' : 'Offers'}
                        </h2>
                        <span className="text-sm text-gray-500">
                            {job.selectedOffer ? 'This offer has been accepted' : `${offersCount} of ${job.maxOffers} offers received`}
                        </span>
                    </div>

                    {offersCount > 0 ? (
                        <div className="space-y-6">
                            {offers.map((offer, index) => (
                                <OfferCard
                                    key={offer._id || index}
                                    offer={offer}
                                    index={index}
                                    onAcceptOffer={canAcceptOffers && !job.selectedOffer ? handleAcceptOffer : null}
                                    isSubmitting={isSubmittingOffer}
                                    submittingOfferId={submittingOfferId}
                                    job={job}
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
            ) : activeTab === 'booking' && booking ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                    <BookingDetails booking={booking} job={job} />
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900">Communication</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Chat Enabled:</span>
                                    <span className="text-sm font-medium">{booking.communication?.chatEnabled ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Unread Messages:</span>
                                    <span className="text-sm font-medium">{booking.communication?.unreadCount?.customer || 0}</span>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Not Available</h3>
                        <p className="text-gray-600">The requested content is not available for this job status.</p>
                    </div>
                </div>
            )}

            <BookingModal
                isOpen={showBookingModal}
                onClose={handleCloseModal}
                offer={selectedOffer}
                onSubmit={handleSubmitBooking}
                isSubmitting={isSubmittingOffer}
                job={job}
            />
        </div>
    );
}

export default JobDetails;