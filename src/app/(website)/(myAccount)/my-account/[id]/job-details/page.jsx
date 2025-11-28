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
import { LoadingSpinner } from '@/components/partials/customer/LoadingSpinner';
import { UrgencyBadge } from '@/components/partials/customer/Offer/UrgencyBadge';
import { ExpandableDescription } from '@/components/partials/customer/Offer/ExpandableDescription';
import Disputes from './Disputes';
import { toast } from 'react-toastify';


function JobDetails() {
    const [job, setJob] = useState(null);
    const [offers, setOffers] = useState([]);
    const [booking, setBooking] = useState(null);
    const [dispute, setDispute] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
    const [submittingOfferId, setSubmittingOfferId] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔥 New state for quotation data
    const [quotation, setQuotation] = useState(null);
    const [repairman, setRepairman] = useState(null);
    const [dataType, setDataType] = useState(null);

    const { id } = useParams();
    const { token } = useSelector(state => state.auth);
    const router = useRouter();

    const formatBudget = useCallback((budget) => {
        if (!budget) return 'Budget not specified';
        return `${budget.currency} ${budget.min.toLocaleString()} – ${budget.max.toLocaleString()}`;
    }, []);

    const formatPrice = useCallback((pricing) => {
        if (!pricing) return 'Price not specified';
        return `${pricing.currency} ${pricing.totalAmount?.toLocaleString() || 0}`;
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

            const { type, job, booking, statistics, dispute, quotation, repairman } = res.data.data;

            setDataType(type);

            if (type === 'job_posting') {
                setJob(job);
                setBooking(booking || null);
                setStatistics(statistics || null);
                setDispute(dispute || null);
                setQuotation(null);
                setRepairman(null);

                if (job?.selectedOffer) {
                    setOffers([job.selectedOffer]);
                } else if (res.data.data.offers) {
                    setOffers(res.data.data.offers);
                } else {
                    setOffers([]);
                }
            } else if (type === 'quotation_booking') {
                setJob(null);
                setBooking(booking);
                setQuotation(quotation);
                setRepairman(repairman);
                setStatistics(statistics || null);
                setDispute(dispute || null);
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
            router.push('/my-account');
        } catch (error) {
            handleError(error);
            setIsDeleting(false);
        }
    }, [id, token, router]);

    const handleAcceptOffer = useCallback((offer) => {
        setSelectedOffer(offer);
        router.push(`/my-account/${id}/offer/${offer?._id}/check-out`);
    }, [id, router]);

    const handleSubmitBooking = useCallback(async (bookingData) => {
        if (!selectedOffer) return;

        setIsSubmittingOffer(true);

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
    }, [selectedOffer, id, token, fetchJob]);

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
        if (dataType === 'job_posting' && job) {
            return `${job.deviceInfo?.brand || ''} ${job.deviceInfo?.model || ''} (${job.deviceInfo?.color || ''}) - ${
      job.services.map(service => service?.name).join(', ')
    }`;
        } else if (dataType === 'quotation_booking' && quotation) {
            return `${quotation.deviceInfo?.brandName || ''} ${quotation.deviceInfo?.modelName || ''} - ${quotation.deviceInfo?.repairServices?.join(', ') || ''}`;
        }
        return '';
    }, [dataType, job, quotation]);

    const offersCount = useMemo(() => {
        return offers?.length || 0;
    }, [offers]);

    const canAcceptOffers = useMemo(() => {
        return dataType === 'job_posting' && job && ['open', 'offers_received'].includes(job.status);
    }, [dataType, job]);

    const shouldShowOffers = useMemo(() => {
        return dataType === 'job_posting' && job && (['open', 'offers_received'].includes(job.status) || job.selectedOffer);
    }, [dataType, job]);

    const currentStatus = useMemo(() => {
        if (dataType === 'job_posting') {
            return  booking?.status;
        } else if (dataType === 'quotation_booking') {
            return booking?.status;
        }
        return null;
    }, [dataType, job, booking]);

    const handleCloseJob = async (bookingId) => {
        try {
            const { data } = await axiosInstance.patch(
                `/repair-jobs/${bookingId}/close-job`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data?.success) {
                await fetchJob();
                toast.success(data.message);
            } else {
                toast.error(data?.message || 'Failed to close job.');
            }

        } catch (error) {
            handleError(error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!job && !booking) {
        return (
            <div className="max-w-6xl mx-auto p-6 bg-white my-10">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Not found</h2>
                    <p className="text-gray-600 mt-2">The item you're looking for doesn't exist or has been removed.</p>
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
                        <StatusBadge status={currentStatus} />

                        {dataType === 'job_posting' && job?.urgency && (
                            <UrgencyBadge urgency={job.urgency} />
                        )}

                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${dataType === 'quotation_booking'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-primary-100 text-primary-700'
                            }`}>
                            {dataType === 'quotation_booking' ? 'Direct Message' : 'Job Posting'}
                        </span>
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

            {currentStatus === 'delivered' && (
                <div className="mt-4 p-4 mb-4 bg-primary-50 border border-primary-200 rounded-md">
                    <p className="text-sm text-primary-800 leading-relaxed mb-3">
                        Your repairman has delivered the device. Please review it carefully, and if everything is satisfactory,
                        click the button below to <span className="font-semibold">close this job</span>.
                    </p>

                    <button
                        onClick={() => handleCloseJob(booking._id)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition duration-200"
                    >
                        Close Job
                    </button>
                </div>
            )}


            {!canAcceptOffers && dataType === 'job_posting' && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-yellow-800 text-sm font-medium">
                            {job?.status === 'booked' ? 'This job has been booked and offers can no longer be accepted.' :
                                job?.status === 'closed' ? 'This job has been closed.' :
                                    job?.status === 'in_progress' ? 'This job is currently in progress.' :
                                        job?.status === 'completed' ? 'This job has been completed.' :
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
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Details
                    </button>

                    {shouldShowOffers && (
                        <button
                            onClick={() => setActiveTab('proposals')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'proposals'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {job?.selectedOffer ? 'Selected Offer' : `Offers (${offersCount})`}
                        </button>
                    )}

                    {dataType === 'quotation_booking' && repairman && (
                        <button
                            onClick={() => setActiveTab('repairman')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'repairman'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Repairman Info
                        </button>
                    )}

                    {booking && (
                        <button
                            onClick={() => setActiveTab('booking')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'booking'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Booking Details
                        </button>
                    )}

                    {booking && (
                        <button
                            onClick={() => setActiveTab('disputes')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'disputes'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Disputes
                        </button>
                    )}
                </nav>
            </div>

            {activeTab === 'details' ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                    {/* 🔥 Job Posting Details */}
                    {dataType === 'job_posting' && job && (
                        <>
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
                                                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full border border-primary-200 text-sm"
                                            >
                                                {service.name}
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
                        </>
                    )}

                    {/* 🔥 Quotation Booking Details */}
                    {dataType === 'quotation_booking' && quotation && (
                        <>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="text-lg font-semibold text-gray-900 mb-1">
                                        {formatPrice(quotation.pricing)}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                        <span className="font-medium">Quotation Accepted</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Description</h3>
                                <ExpandableDescription description={quotation.serviceDetails?.description || 'No description provided'} maxLength={200} />
                            </div>

                            {quotation.deviceInfo?.repairServices && quotation.deviceInfo.repairServices.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {quotation.deviceInfo.repairServices.map((service, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full border border-primary-200 text-sm"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing Breakdown</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Base Price:</span>
                                            <span className="font-medium">{quotation.pricing?.currency} {quotation.pricing?.basePrice?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Parts Price:</span>
                                            <span className="font-medium">{quotation.pricing?.currency} {quotation.pricing?.partsPrice?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Service Charge:</span>
                                            <span className="font-medium">{quotation.pricing?.currency} {quotation.pricing?.serviceCharges > 0 ? quotation.pricing?.serviceCharges?.toLocaleString() : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                                            <span className="text-gray-900">Total Amount:</span>
                                            <span className="text-primary-600">{quotation.pricing?.currency} {quotation.pricing?.totalAmount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Details</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Service Type:</span>
                                            <span className="font-medium capitalize">{quotation.serviceDetails?.serviceType || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Estimated Duration:</span>
                                            <span className="font-medium">{quotation.serviceDetails?.estimatedDuration || 'N/A'} days</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Parts Quality:</span>
                                            <span className="font-medium capitalize">{quotation.partsQuality?.replace('-', ' ') || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {quotation.serviceDetails?.warranty && (
                                <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Warranty Information</h3>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Duration:</span> {quotation.serviceDetails.warranty.duration} days
                                        </p>
                                        {quotation.serviceDetails.warranty.description && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">Details:</span> {quotation.serviceDetails.warranty.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {quotation.repairmanNotes && (
                                <div className="mb-8 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Repairman Notes</h3>
                                    <p className="text-sm text-gray-700">{quotation.repairmanNotes}</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    <p>Quotation Sent: {new Date(quotation.sentAt).toLocaleDateString()}</p>
                                    {quotation.respondedAt && (
                                        <p>Accepted: {new Date(quotation.respondedAt).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : activeTab === 'proposals' && shouldShowOffers ? (
                // 🔥 OFFERS TAB (Only for job postings)
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {job?.selectedOffer ? 'Selected Offer' : 'Offers'}
                        </h2>
                        <span className="text-sm text-gray-500">
                            {job?.selectedOffer ? 'This offer has been accepted' : `${offersCount} of ${job?.maxOffers} offers received`}
                        </span>
                    </div>

                    {offersCount > 0 ? (
                        <div className="space-y-6">
                            {offers.map((offer, index) => (
                                <OfferCard
                                    key={offer._id || index}
                                    offer={offer}
                                    index={index}
                                    onAcceptOffer={handleAcceptOffer}
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
            ) : activeTab === 'repairman' && dataType === 'quotation_booking' && repairman ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Repairman Information</h2>

                    <div className="flex items-start space-x-6 mb-8 p-6 bg-gray-50 rounded-lg">
                        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl font-bold text-primary-700">
                                {repairman.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{repairman.name}</h3>
                            <p className="text-gray-600 mb-3">{repairman.repairmanProfile?.shopName}</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Rating:</span>
                                    <p className="font-semibold text-lg">{repairman.repairmanProfile?.rating || 0} / 5</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Total Jobs:</span>
                                    <p className="font-semibold text-lg">{repairman.repairmanProfile?.totalJobs || 0}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">City:</span>
                                    <p className="font-semibold">{repairman.repairmanProfile?.city || 'N/A'}</p>
                                </div>
                                {/* <div>
                                    <span className="text-sm text-gray-500">Phone:</span>
                                    <p className="font-semibold">{repairman.phone || 'N/A'}</p>
                                </div> */}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {/* <button className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call Repairman
                        </button> */}
                        {/* <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Send Message
                        </button> */}
                    </div>
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
            ) : activeTab === 'disputes' && booking ? (
                // 🔥 DISPUTES TAB
                <Disputes bookingId={booking._id} status={booking.status} dispute={dispute} fetchJob={fetchJob} />
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Not Available</h3>
                        <p className="text-gray-600">The requested content is not available.</p>
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