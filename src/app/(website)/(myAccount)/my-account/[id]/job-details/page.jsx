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
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

const LoadingSpinner = () => (
    <div className="max-w-6xl mx-auto p-6 bg-white my-10">
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
                    className="text-primary-600 hover:text-primary-800 hover:underline text-sm mt-1 transition-colors duration-200"
                >
                    {isExpanded ? 'Read Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};


const DISPUTE_CATEGORIES = [
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'quality_of_work', label: 'Quality of Work' },
    { value: 'service_not_provided', label: 'Service Not Provided' },
    { value: 'damaged_property', label: 'Damaged Property' },
    { value: 'unprofessional_behavior', label: 'Unprofessional Behavior' },
    { value: 'cancellation_issue', label: 'Cancellation Issue' },
    { value: 'other', label: 'Other' }
];

const DISPUTE_SCHEMA = yup.object({
    category: yup
        .string()
        .required('Please select a dispute category'),
    description: yup
        .string()
        .required('Description is required')
        .min(5, 'Description must be at least 20 characters')
        .max(1000, 'Description cannot exceed 1000 characters')
});

const Disputes = ({ bookingId }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm({
        resolver: yupResolver(DISPUTE_SCHEMA),
        defaultValues: {
            category: '',
            description: ''
        }
    });

            const {token }= useSelector((state) => state.auth)


    const watchDescription = watch('description', '');

    const onSubmit = async (formData) => {
        setIsSubmitting(true);

        try {
            console.log('bookingId', bookingId);
            // return;

            const { data } = await axiosInstance.post('/disputes/create', {
                bookingId,
                category: formData.category,
                description: formData.description.trim()
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (data.success) {
                toast.success('Dispute created successfully');
                reset();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create dispute';
            toast.error(errorMessage);
            console.error('Error creating dispute:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const commonInputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors`;
    const errorClasses = 'border-red-500';

    return (
        <div className="bg-gray-50 py-3 px-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            Dispute Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="category"
                            {...register('category')}
                            className={`${commonInputClasses} ${errors.category ? errorClasses : 'border-gray-300'}`}
                            disabled={isSubmitting}
                        >
                            <option value="">Select a category</option>
                            {DISPUTE_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            {...register('description')}
                            rows={6}
                            placeholder="Please describe your issue in detail..."
                            className={`${commonInputClasses} resize-none ${errors.description ? errorClasses : 'border-gray-300'}`}
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <div>
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description.message}</p>
                                )}
                            </div>
                            <p className={`text-sm ${watchDescription.length > 1000 ? 'text-red-600' : 'text-gray-500'}`}>
                                {watchDescription.length}/1000
                            </p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Payment for this booking will be held until the dispute is resolved</li>
                                        <li>Our team will review your case within 24-48 hours</li>
                                        <li>Both parties will be notified of the dispute status</li>
                                        <li>False disputes may result in account penalties</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 py-3 px-4 rounded-lg text-white font-medium ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700'
                            }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Creating Dispute...
                                </span>
                            ) : (
                                'Submit Dispute'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => reset()}
                            disabled={isSubmitting}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
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

        console.log('Accepting offer:', offer);

        // setSubmittingOfferId(selectedOffer._id);
        // setShowBookingModal(true);
        router.push(`/my-account/${id}/offer/${offer?._id}/check-out`)
    }, []);

    const handleSubmitBooking = useCallback(async (bookingData) => {
        if (!selectedOffer) return;

        setIsSubmittingOffer(true);
        // router.push(`/my-account/${id}/offer/${selectedOffer._id}/check-out`);


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

    console.log(offers, 'offers');


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
                            {job.selectedOffer ? 'Selected Offer' : `Offers (${offersCount})`}
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
                <Disputes bookingId={booking._id} />
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