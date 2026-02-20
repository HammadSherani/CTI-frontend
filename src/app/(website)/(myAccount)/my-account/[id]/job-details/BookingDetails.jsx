import StatusBadge from '@/components/partials/customer/Offer/StatusBadge';
import React from 'react'

const BookingDetails = ({ booking, job, dataType }) => {
    if (!booking) return null;

    // 🔥 Determine if this is a quotation booking
    const isQuotationBased = booking?.bookingSource === 'direct_message' || dataType === 'quotation_booking';

    const currencySymbol = booking?.bookingDetails?.pricing?.currency === 'TRY' ? '₺' : 
                          booking?.bookingDetails?.pricing?.currency === 'TRY' ? 'TRY ' : '$';

    return (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary-900">Booking Details</h3>
                {/* 🔥 Source Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isQuotationBased 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                }`}>
                    {isQuotationBased ? 'Direct Message' : 'Job Posting'}
                </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Info */}
                <div>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm font-medium text-gray-600">Status:</span>
                            <div className="mt-1">
                                <StatusBadge status={booking.status} />
                            </div>
                        </div>
                        
                        

                        {/* 🔥 Scheduled Date - may not exist for quotations */}
                        {booking.bookingDetails?.scheduledDate ? (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Scheduled Date:</span>
                                <p className="text-gray-800">
                                    {new Date(booking.bookingDetails.scheduledDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Scheduled Date:</span>
                                <p className="text-gray-800">To be scheduled</p>
                            </div>
                        )}

                        {booking.bookingDetails?.estimatedCompletion && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Estimated Completion:</span>
                                <p className="text-gray-800">
                                    {new Date(booking.bookingDetails.estimatedCompletion).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        )}

                        {/* 🔥 Location - only for job postings with pickup/home-service */}
                        {!isQuotationBased && booking.bookingDetails?.location?.address && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Location:</span>
                                <p className="text-gray-800 text-sm">{booking.bookingDetails.location.address}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pricing Info */}
                <div>
                    <div className="space-y-3">
                        {/* 🔥 Base Price - may not exist for quotations */}
                        {booking.bookingDetails?.pricing?.basePrice !== undefined && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Base Price:</span>
                                <p className="text-gray-800 font-semibold">
                                    {currencySymbol}{booking.bookingDetails.pricing.basePrice?.toLocaleString() || 0}
                                </p>
                            </div>
                        )}

                        <div>
                            <span className="text-sm font-medium text-gray-600">Parts Price:</span>
                            <p className="text-gray-800">
                                {currencySymbol}{booking.bookingDetails?.pricing?.partsPrice?.toLocaleString() || 0}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Service Charge:</span>
                            <p className="text-gray-800">
                                {currencySymbol}{booking.bookingDetails?.pricing?.serviceCharge?.toLocaleString() || 0}
                            </p>
                        </div>

                        <div className="border-t pt-2">
                            <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                            <p className="text-lg font-bold text-primary-600">
                                {currencySymbol}{booking.bookingDetails?.pricing?.totalAmount?.toLocaleString() || 0}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                            <div className="mt-1">
                                <StatusBadge status={booking.payment?.status} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔥 Warranty Info */}
            {booking.bookingDetails?.warranty && (
                <div className="mt-4 pt-4 border-t border-primary-200">
                    <span className="text-sm font-medium text-gray-600">Warranty:</span>
                    <p className="text-gray-800">
                        {booking.bookingDetails.warranty.duration} days
                        {booking.bookingDetails.warranty.description && ` - ${booking.bookingDetails.warranty.description}`}
                    </p>
                </div>
            )}

            {/* 🔥 Repairman Info - for quotation bookings */}
            {isQuotationBased && booking.repairmanId && (
                <div className="mt-4 pt-4 border-t border-primary-200">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Repairman:</span>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary-700">
                                {booking.repairmanId?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{booking.repairmanId?.name}</p>
                            <p className="text-sm text-gray-600">{booking.repairmanId?.repairmanProfile?.shopName}</p>
                            <p className="text-sm text-gray-500">{booking.repairmanId?.phone}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline */}
            {booking.timeline && (
                <div className="mt-4 pt-4 border-t border-primary-200">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Timeline:</span>
                    <div className="space-y-2">
                        {booking.timeline.confirmedAt && (
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-gray-600">
                                    Confirmed: {new Date(booking.timeline.confirmedAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {booking.timeline.scheduledAt && (
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                <span className="text-gray-600">
                                    Scheduled: {new Date(booking.timeline.scheduledAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {booking.timeline.startedAt && (
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                                <span className="text-gray-600">
                                    Started: {new Date(booking.timeline.startedAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {booking.timeline.completedAt && (
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                <span className="text-gray-600">
                                    Completed: {new Date(booking.timeline.completedAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {booking.timeline.deliveredAt && (
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                                <span className="text-gray-600">
                                    Delivered: {new Date(booking.timeline.deliveredAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 🔥 Device Handover Info */}
            {booking.deviceHandover?.deviceConditionNotes && (
                <div className="mt-4 pt-4 border-t border-primary-200">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Device Condition Notes:</span>
                    <p className="text-sm text-gray-800">{booking.deviceHandover.deviceConditionNotes}</p>
                </div>
            )}

            {/* 🔥 Communication Status */}
            <div className="mt-4 pt-4 border-t border-primary-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Chat Enabled:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.communication?.chatEnabled 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                        {booking.communication?.chatEnabled ? 'Yes' : 'No'}
                    </span>
                </div>
                {booking.communication?.unreadCount?.customer > 0 && (
                    <div className="mt-2">
                        <span className="text-sm text-gray-600">
                            You have {booking.communication.unreadCount.customer} unread message(s)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingDetails;