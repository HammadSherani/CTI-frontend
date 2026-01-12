"use client"

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import Link from 'next/link';
import { useChat } from '@/hooks/useChat';

const QuotationMessage = ({ message, isOwner }) => {
    const { token, user } = useSelector((state) => state.auth);
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const { closeChat } = useChat()

    // Parse quotation data from message
    const quotationData = message.quotationData || {};
    const {
        deviceInfo = {},
        partsQuality = '',
        pricing = {},
        serviceDetails = {},
        repairmanNotes = quotationData.repairmanNotes,
        validUntil = quotationData.validUntil,
        status = quotationData.status || 'sent'
        // requi
    } = quotationData;


    const {
        description,
        estimatedDuration,
        serviceType,
        warranty,
        isPickup = false,
        isDropoff = false,
        pickupLocation = {},
        dropoffLocation = {},
        requiredParts = {}
    } = serviceDetails;

    // Extract device info
    const { brandName = '', modelName = '', repairServices = [] } = deviceInfo;

    // ✅ Calculate subtotal and grand total
    const basePrice = pricing.basePrice || 0;
    const partsPrice = pricing.partsPrice || 0;
    const serviceCharges = pricing.serviceCharges || 0;
    const subtotal = basePrice + partsPrice;
    const grandTotal = subtotal + serviceCharges;

    const handleQuotationResponse = async (action, customerResponse = '') => {
        // Set appropriate loading state based on action
        if (action === 'accepted') {
            setAcceptLoading(true);
        } else if (action === 'rejected') {
            setRejectLoading(true);
        }

        try {
            const response = await axiosInstance.post(
                `/chat/quotation/${message?.quotationData?.quotationId}/respond`,
                {
                    action,
                    customerResponse
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                console.log(`Quotation ${action}ed successfully`);
            }
        } catch (error) {
            console.error(`Error ${action}ing quotation:`, error);
            handleError(error);
        } finally {
            // Reset loading states
            setAcceptLoading(false);
            setRejectLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'sent': return 'text-primary-600 bg-primary-50';
            case 'viewed': return 'text-yellow-600 bg-yellow-50';
            case 'accepted': return 'text-green-600 bg-green-50';
            case 'rejected': return 'text-red-600 bg-red-50';
            case 'expired': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getServiceTypeLabel = (type) => {
        switch (type) {
            case 'drop-off': return 'Drop-off Service';
            case 'pickup': return 'Pickup Service';
            case 'home-service': return 'Home Service';
            default: return type;
        }
    };

    const isExpired = quotationData.validUntil && new Date() > new Date(quotationData.validUntil);
    const canRespond = !isOwner && user?.role === 'customer' && status === 'sent' && !isExpired;
    const isAnyButtonLoading = acceptLoading || rejectLoading;

    return (
        <div className={`max-w-[85%] ${isOwner ? 'ml-auto' : 'mr-auto'} mb-4`}>
            <div className={`bg-white border-2 rounded-lg shadow-md overflow-hidden ${isOwner ? 'border-primary-200' : 'border-green-200'
                }`}>
                {/* Header */}
                <div className={`px-4 py-3 ${isOwner ? 'bg-primary-50' : 'bg-green-50'} border-b`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:receipt" width={20} className="text-gray-600" />
                            <span className="font-semibold text-gray-800">
                                {isOwner ? 'Quotation Sent' : 'Quotation Received'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span> */}
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                <Icon
                                    icon={showDetails ? "mdi:chevron-up" : "mdi:chevron-down"}
                                    width={16}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Device Information */}
                    {(brandName || modelName) && (
                        <div className="bg-primary-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="mdi:cellphone" width={18} className="text-primary-600" />
                                <span className="font-semibold text-primary-900">Device Information</span>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-gray-800">
                                    {brandName} {modelName}
                                </p>
                                {repairServices && repairServices.length > 0 && (
                                    <div className="mt-2">
                                        <span className="text-gray-600 text-xs">Services Required:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {repairServices.map((service, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-white text-primary-700 text-xs font-medium rounded-full border border-primary-200"
                                                >
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Service Description */}
                    {description && (
                        <div className="mb-3">
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Description</span>
                            <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    )}

                    {/* ✅ Pricing Summary - Updated */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        {/* Base Price */}
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Base Price:</span>
                            <span className="font-medium">TRY {basePrice.toFixed(2)}</span>
                        </div>

                        {/* Parts Price */}
                        {partsPrice > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Parts Cost:</span>
                                <span className="font-medium">TRY {partsPrice.toFixed(2)}</span>
                            </div>
                        )}

                        {/* Parts Quality */}
                        {partsQuality && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Parts Quality:</span>
                                <span className="font-medium capitalize">
                                    {partsQuality.replace(/-/g, ' ')}
                                </span>
                            </div>
                        )}

                        {/* Subtotal */}
                        <div className="border-t pt-2 mt-2 mb-2">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Subtotal:</span>
                                <span className="font-semibold text-gray-800">
                                    TRY {subtotal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Service Charges (if applicable) */}
                        {serviceCharges > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-primary-600 flex items-center gap-1">
                                    <Icon icon="mdi:truck" width={14} />
                                    Service Charges:
                                </span>
                                <span className="font-medium text-primary-600">
                                    +TRY {serviceCharges.toFixed(2)}
                                </span>
                            </div>
                        )}

                        {/* Grand Total */}
                        <div className="border-t pt-2 mt-2 bg-green-50 -mx-3 -mb-3 px-3 py-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-800">Grand Total:</span>
                                <span className="text-xl font-bold text-green-600">
                                    TRY {grandTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        {estimatedDuration && (
                            <div>
                                <span className="text-gray-500 text-xs">Duration:</span>
                                <p className="font-medium">{estimatedDuration} days</p>
                            </div>
                        )}
                        {serviceType && (
                            <div>
                                <span className="text-gray-500 text-xs">Service Type:</span>
                                <p className="font-medium">{getServiceTypeLabel(serviceType)}</p>
                            </div>
                        )}
                    </div>


                    {/* Service Location Info */}
                    {(isDropoff && dropoffLocation?.address) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <div className="flex items-start gap-2">
                                <Icon icon="mdi:map-marker" width={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <span className="text-xs font-medium text-blue-800 uppercase tracking-wide block mb-1">
                                        Drop-off Location
                                    </span>
                                    <p className="text-sm text-blue-900 font-medium">
                                        {dropoffLocation.address}
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Please drop off your device at this address
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isPickup && serviceCharges > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:truck" width={18} className="text-green-600" />
                                <div className="flex-1">
                                    <span className="text-xs font-medium text-green-800 uppercase tracking-wide block mb-1">
                                        Pickup Service Available
                                    </span>
                                    <p className="text-sm text-green-900">
                                        Device will be picked up from your location
                                    </p>
                                    <p className="text-xs text-green-700 mt-1">
                                        Pickup charges: TRY {serviceCharges.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {validUntil && (
                        <div className={`p-3 rounded-lg mb-3 ${new Date() > new Date(validUntil)
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-primary-50 border border-primary-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon
                                        icon={new Date() > new Date(validUntil) ? "mdi:clock-alert" : "mdi:clock-outline"}
                                        width={16}
                                        className={new Date() > new Date(validUntil) ? "text-red-600" : "text-primary-600"}
                                    />
                                    <span className={`text-sm font-medium ${new Date() > new Date(validUntil) ? "text-red-700" : "text-primary-700"
                                        }`}>
                                        {new Date() > new Date(validUntil) ? "Expired" : "Valid Until"}
                                    </span>
                                </div>
                                <span className={`text-sm font-semibold ${new Date() > new Date(validUntil) ? "text-red-700" : "text-primary-700"
                                    }`}>
                                    {new Date(validUntil).toLocaleDateString()} at{' '}
                                    {new Date(validUntil).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    )}

                    <p className='cursor-pointer text-sm w-fit hover:underline'  onClick={() => setShowDetails(!showDetails)}>
                        See More Details
                    </p>

                    {showDetails && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                            {/* {requiredParts?.} */}


                            {warranty && (
                                <div>
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Warranty</span>
                                    <p className="font-medium text-sm mt-1">
                                        {typeof warranty === 'object'
                                            ? `${warranty.duration} days - ${warranty.description}`
                                            : `${warranty} days`
                                        }
                                    </p>
                                </div>
                            )}

                            {repairmanNotes && (
                                <div>
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Additional Notes</span>
                                    <p className="text-gray-700 text-sm mt-1">{repairmanNotes}</p>
                                </div>
                            )}

                            {isDropoff && dropoffLocation?.address && (
                                <div>
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Drop-off Address</span>
                                    <div className="flex items-start gap-2 mt-1">
                                        <Icon icon="mdi:map-marker" width={16} className="text-primary-600 mt-1" />
                                        <p className="text-gray-700 text-sm">{dropoffLocation.address}</p>
                                    </div>
                                </div>
                            )}


                            {validUntil && (
                                <div>
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Quote Validity</span>
                                    <p className="font-medium text-gray-700 text-sm mt-1">
                                        Until {new Date(validUntil).toLocaleDateString()} at{' '}
                                        {new Date(validUntil).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}

                            {serviceCharges > 0 && (
                                <div className="bg-primary-50 p-3 rounded-lg">
                                    <span className="text-gray-600 text-xs font-medium uppercase tracking-wide block mb-2">
                                        Price Breakdown
                                    </span>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Service Cost:</span>
                                            <span>TRY {subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-primary-600">
                                            <span>Pickup Charges:</span>
                                            <span>TRY {serviceCharges.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold border-t pt-1">
                                            <span>Total:</span>
                                            <span>TRY {grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {canRespond && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex gap-3">
                                <button
                                    disabled={isAnyButtonLoading}
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition-opacity"
                                >
                                    <Link
                                        href={`/payment?quotationId=${message?.quotationData?.quotationId}`}
                                        onClick={() => closeChat()}
                                        className='flex items-center gap-1'
                                    >
                                        {acceptLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <Icon icon="mdi:check" width={16} />
                                                Accept & Pay
                                            </>
                                        )}
                                    </Link>
                                </button>
                                <button
                                    onClick={() => handleQuotationResponse('rejected')}
                                    disabled={isAnyButtonLoading}
                                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition-opacity"
                                >
                                    {rejectLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Icon icon="mdi:close" width={16} />
                                            Reject
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {(status === 'accepted' || status === 'rejected') && (
                        <div className="mt-3 p-3 rounded-lg bg-gray-50 text-center">
                            <span className={`text-sm font-medium ${status === 'accepted' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {status === 'accepted' ? '✓' : '✗'} Quotation {status} by customer
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer with timestamp */}
                <div className="px-4 py-2 bg-gray-50 border-t">
                    <span className="text-xs text-gray-500">
                        {new Date(message.timestamp || message.createdAt).toLocaleDateString()} at{' '}
                        {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default QuotationMessage;