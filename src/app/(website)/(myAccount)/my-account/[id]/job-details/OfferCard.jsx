import StatusBadge from '@/components/partials/customer/Offer/StatusBadge';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

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

const OfferCard = ({ offer, index, onAcceptOffer, isSubmitting, submittingOfferId, job }) => {
    const currencySymbol = offer.pricing?.currency === 'TRY' ? '₺' : '₹';
    const isThisOfferSubmitting = isSubmitting && submittingOfferId === offer._id;

    const isBooked = job?.status === 'booked' || job?.status === 'in_progress' || job?.status === 'completed' || job?.status === 'accepted' || job?.status === 'expired';
    const isDisabled = isBooked || isSubmitting || isThisOfferSubmitting;

    const baseClasses = "px-4 py-2 rounded text-sm transition-colors duration-200 flex items-center gap-2";
    const disabledClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";
    const submittingClasses = "bg-primary-400 text-white cursor-not-allowed";
    const activeClasses = "bg-primary-600 text-white hover:bg-primary-700";

    const getButtonClasses = () => {
        if (isBooked || isSubmitting) return `${baseClasses} ${disabledClasses}`;
        if (isThisOfferSubmitting) return `${baseClasses} ${submittingClasses}`;
        return `${baseClasses} ${activeClasses}`;
    };

    const label = offer.repairmanId?.name || `Professional ${index + 1}`;
    const router = useRouter();

    const handleAcceptOffer = () => {
        router.push(`/payment?jobId=${job._id}&offerId=${offer._id}`);
    };

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
                            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center" aria-label="Verified Professional">
                                <span className="text-white text-xs">✓</span>
                            </div>
                            {offer.status === 'in_progress' && (
                                <StatusBadge status={offer.status} />
                            )}
                        </div>

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

                    <div className="flex flex-wrap gap-3 mb-4">
                        <RatingStars rating={offer.repairmanId?.repairmanProfile?.rating} />

                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded">
                            🔧 {offer.repairmanId?.repairmanProfile?.totalJobs || 0} jobs
                        </span>

                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                            ✅ {offer.experience?.successRate || 0}% success
                        </span>

                        <span className="bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded">
                            📍 {offer.locationContext?.distance?.toFixed(1) || 'N/A'} km
                        </span>

                        <div className="flex items-center gap-1">
                            <span className="text-xs">🇵🇰</span>
                            <span className="text-sm text-gray-600">
                                {offer.repairmanId?.repairmanProfile?.city || 'Pakistan'}
                            </span>
                        </div>
                    </div>

                    <div className="mb-4 space-y-3">
                        <div className="text-sm font-medium text-gray-700">
                            {offer.repairmanId?.repairmanProfile?.shopName || 'Repair Service'} - {offer.experience?.similarRepairs || 0} similar repairs
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {offer.serviceOptions?.pickupAvailable && (
                                <span className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded">
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

                    <div className="mb-4">
                        <ExpandableDescription description={offer.description} />
                    </div>

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
                            {offer.status !== 'in_progress' && onAcceptOffer && (
                                <button
                                    onClick={() => handleAcceptOffer()}

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
                            )}

                            {offer.status === 'in_progress' && (
                                <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium">
                                    Work in Progress
                                </div>
                            )}

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

export default OfferCard
