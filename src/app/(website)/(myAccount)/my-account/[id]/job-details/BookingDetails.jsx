import StatusBadge from '@/components/partials/customer/Offer/StatusBadge';
import React from 'react'

const BookingDetails = ({ booking, job }) => {
    if (!booking) return null;

    const currencySymbol = booking?.bookingDetails?.pricing?.currency === 'TRY' ? '₺' : '$';

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Booking Details</h3>
            
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
                        
                        <div>
                            <span className="text-sm font-medium text-gray-600">Service Type:</span>
                            <p className="text-gray-800 capitalize">{booking.bookingDetails?.serviceType}</p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Scheduled Date:</span>
                            <p className="text-gray-800">
                                {new Date(booking.bookingDetails?.scheduledDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

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
                    </div>
                </div>

                {/* Pricing Info */}
                <div>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm font-medium text-gray-600">Base Price:</span>
                            <p className="text-gray-800 font-semibold">
                                {currencySymbol}{booking.bookingDetails?.pricing?.basePrice}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Parts Price:</span>
                            <p className="text-gray-800">
                                {currencySymbol}{booking.bookingDetails?.pricing?.partsPrice || 0}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Service Charge:</span>
                            <p className="text-gray-800">
                                {currencySymbol}{booking.bookingDetails?.pricing?.serviceCharge || 0}
                            </p>
                        </div>

                        <div className="border-t pt-2">
                            <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                            <p className="text-lg font-bold text-blue-600">
                                {currencySymbol}{booking.bookingDetails?.pricing?.totalAmount}
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

            {/* Warranty Info */}
            {booking.bookingDetails?.warranty && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                    <span className="text-sm font-medium text-gray-600">Warranty:</span>
                    <p className="text-gray-800">
                        {booking.bookingDetails.warranty.duration} days - {booking.bookingDetails.warranty.description}
                    </p>
                </div>
            )}

            {/* Timeline */}
            {booking.timeline && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                    <span className="text-sm font-medium text-gray-600">Timeline:</span>
                    <div className="mt-2 space-y-1">
                        {booking.timeline.confirmedAt && (
                            <p className="text-sm text-gray-600">
                                Confirmed: {new Date(booking.timeline.confirmedAt).toLocaleString()}
                            </p>
                        )}
                        {booking.timeline.scheduledAt && (
                            <p className="text-sm text-gray-600">
                                Scheduled: {new Date(booking.timeline.scheduledAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetails
