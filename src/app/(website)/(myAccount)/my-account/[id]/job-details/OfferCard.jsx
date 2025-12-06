import StatusBadge from '@/components/partials/customer/Offer/StatusBadge';
import Image from 'next/image';
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

    console.log('offer', offer);

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

    // Calculate final price with pickup charge if applicable
    const basePrice = offer.pricing?.basePrice || 0;
    const partsPrice = offer.pricing?.partsEstimate || 0;
    const totalPrice = offer.pricing?.totalPrice || (basePrice + partsPrice);
    const pickupCharge = offer.serviceOptions?.pickupAvailable && job?.servicePreference === 'pickup'
        ? offer.serviceOptions?.pickupCharge || 0
        : 0;
    const finalTotal = totalPrice + pickupCharge;

    return (
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section - Main Info */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900 truncate">
                                {offer.repairmanId?.name || `Professional ${index + 1}`}
                            </h3>
                            <span className="text-gray-500 text-sm hidden sm:inline">
                                @{offer.repairmanId?.repairmanProfile?.shopName || `shop${index + 1}`}
                            </span>
                            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0" aria-label="Verified Professional">
                                <span className="text-white text-xs">✓</span>
                            </div>
                            <StatusBadge status={offer.status} />
                        </div>
                    </div>

                    {/* Rating and Stats */}
                    <div className="flex flex-wrap gap-3 mb-5">
                        <RatingStars rating={offer.repairmanId?.repairmanProfile?.rating} />
                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                            🔧 {offer.repairmanId?.repairmanProfile?.totalJobs || 0} jobs
                        </span>
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                            ✅ {offer.experience?.successRate || 0}% success
                        </span>
                        <span className="bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                            📍 {offer.locationContext?.distance?.toFixed(1) || 'N/A'} km
                        </span>
                        <div className="flex items-center gap-1 hidden md:block">
                            <span className="text-xs">🇵🇰</span>
                            <span className="text-sm text-gray-600">
                                {offer.repairmanId?.repairmanProfile?.city || 'Pakistan'}
                            </span>
                        </div>
                    </div>

                    {/* Service Info */}
                    <div className="mb-5 space-y-3">
                        <div className="text-base font-semibold text-gray-800">
                            {offer.repairmanId?.repairmanProfile?.shopName || 'Repair Service'} - {offer.experience?.similarRepairs || 0} similar repairs
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {offer.serviceOptions?.pickupAvailable && (
                                <span className="bg-primary-50 text-primary-700 text-xs px-3 py-1.5 rounded-full border border-primary-200">
                                    🚗 Pickup Available ({currencySymbol}{offer.serviceOptions.pickupCharge})
                                </span>
                            )}
                            {offer.serviceOptions?.homeService && (
                                <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full border border-green-200">
                                    🏠 Home Service
                                </span>
                            )}
                            {offer.warranty?.duration && (
                                <span className="bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-full border border-purple-200">
                                    🛡️ {offer.warranty.duration} days warranty
                                </span>
                            )}
                            {offer.pricing?.partsQuality && (
                                <span className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1.5 rounded-full border border-yellow-200">
                                    🔧 {offer.pricing.partsQuality.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} parts
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-5">
                        <ExpandableDescription description={offer.description} />
                    </div>

                    {/* Availability and Drop-off Location */}
                    <div className="text-sm text-gray-600 space-y-3 mb-6">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 min-w-[80px]">Can start:</span>
                            <span className="text-gray-900">
                                {offer.availability?.canStartBy
                                    ? new Date(offer.availability.canStartBy).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })
                                    : 'Available now'}
                            </span>
                        </div>
                        {offer.serviceOptions?.dropOffLocation && (
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-gray-800 min-w-[80px]">Drop-off:</span>
                                <span className="text-gray-900">📍 {offer.serviceOptions.dropOffLocation}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 min-w-[80px]">Estimated Time:</span>
                            <span className="text-gray-900">{offer.estimatedTime?.value || 'N/A'} {offer.estimatedTime?.unit || 'hours'}</span>
                        </div>
                    </div>

                    {/* Required Parts - Moved here, above Action Buttons */}
                    {offer.requiredParts && offer.requiredParts.length > 0 && (
                        <div className="mb-6 pt-3 border-t border-gray-200">
                            <h5 className="font-bold text-sm mb-3 text-gray-800">Required Parts</h5>
                            <div className="space-y-3 max-h-48 overflow-y-auto grid md:grid-cols-2  grid-cols-2 gap-3">
                                {offer.requiredParts.map((part) => (
                                    <div key={part.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <Image 
                                            src={part?.images[0] || '/placeholder-image.jpg'} 
                                            alt={part.name} 
                                            height={48} 
                                            width={48} 
                                            className="h-12 w-12 object-cover rounded-md flex-shrink-0" 
                                            onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col space-y-1">
                                                <span className="font-semibold text-sm text-gray-900 truncate">{part.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {part.brand?.name}, {part.model?.name}
                                                </span>
                                                <span className="text-xs text-gray-500">{part?.partType}</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-base text-primary-600 flex-shrink-0">
                                            {currencySymbol}{part.price?.toLocaleString() || 'N/A'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-gray-200">
                        {offer.status !== 'in_progress' && onAcceptOffer && (
                            <button
                                onClick={() => handleAcceptOffer()}
                                disabled={isDisabled}
                                className={getButtonClasses()}
                                aria-label={`Accept offer from ${label}`}
                            >
                                {isThisOfferSubmitting ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
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
                            <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-semibold border border-yellow-200">
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

                {/* Right Section - Price Breakdown */}
                <div className="lg:w-80 h-fit bg-gradient-to-b from-gray-50 to-white rounded-xl p-5 border border-gray-200 shadow-inner">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Price Breakdown</h4>

                    <div className="space-y-3 text-sm">
                        {/* Base Price */}
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600">Labor Cost</span>
                            <span className="font-semibold text-gray-900">
                                {currencySymbol}{basePrice.toLocaleString()}
                            </span>
                        </div>

                        {/* Parts Price */}
                        {partsPrice > 0 && (
                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-600">Parts Cost</span>
                                <span className="font-semibold text-gray-900">
                                    {currencySymbol}{partsPrice.toLocaleString()}
                                </span>
                            </div>
                        )}

                        <div className="border-t border-gray-300 pt-2"></div>

                        {/* Subtotal */}
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-700 font-semibold">Subtotal</span>
                            <span className="font-bold text-gray-900">
                                {currencySymbol}{totalPrice.toLocaleString()}
                            </span>
                        </div>

                        {/* Pickup Charge (if applicable) */}
                        {pickupCharge > 0 && (
                            <div className="flex justify-between items-center py-1 text-primary-600 bg-primary-50 rounded-lg px-2">
                                <span className="flex items-center gap-1">
                                    <span>🚗</span>
                                    <span>Pickup Charge</span>
                                </span>
                                <span className="font-semibold">
                                    +{currencySymbol}{pickupCharge.toLocaleString()}
                                </span>
                            </div>
                        )}

                        <div className="border-t border-gray-300 pt-2"></div>

                        {/* Total */}
                        <div className="flex justify-between items-center py-2 bg-primary-50 rounded-lg px-3">
                            <span className="text-gray-900 font-bold text-base">Total Amount</span>
                            <span className="text-2xl font-extrabold text-primary-600">
                                {currencySymbol}{finalTotal.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Additional Info */}
                    {offer.warranty?.duration && (
                        <div className="mt-4 pt-3 border-t border-gray-300">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span>🛡️</span>
                                <span className="font-medium">{offer.warranty.duration} days warranty included</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfferCard