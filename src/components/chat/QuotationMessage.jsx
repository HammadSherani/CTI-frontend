"use client"

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';

const QuotationMessage = ({ message, isOwner }) => {
    const { token, user } = useSelector((state) => state.auth);
    const [responding, setResponding] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    // Parse quotation data from message
    const quotationData = message.quotationData || {};
    const {
        partsQuality = '',
        serviceCharge = 0,
        partsPrice = 0,
        totalAmount = quotationData.totalAmount || (quotationData.serviceCharge + quotationData.partsPrice),
        description = quotationData.description,
        estimatedDuration = quotationData.estimatedDuration,
        serviceType = quotationData.serviceType,
        warranty = quotationData.warranty,
        repairmanNotes = quotationData.repairmanNotes,
        validUntil = quotationData.validUntil,
        status = quotationData.status || 'sent'
    } = quotationData;

    const handleQuotationResponse = async (action, customerResponse = '') => {
        setResponding(true);
        try {
            const response = await axiosInstance.post(
                `/chat/quotation/${message.quotationId}/respond`,
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
            setResponding(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'sent': return 'text-blue-600 bg-blue-50';
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

    return (
        <div className={`max-w-[85%] ${isOwner ? 'ml-auto' : 'mr-auto'} mb-4`}>
            <div className={`bg-white border-2 rounded-lg shadow-md overflow-hidden ${
                isOwner ? 'border-blue-200' : 'border-green-200'
            }`}>
                {/* Header */}
                <div className={`px-4 py-3 ${isOwner ? 'bg-blue-50' : 'bg-green-50'} border-b`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:receipt" width={20} className="text-gray-600" />
                            <span className="font-semibold text-gray-800">
                                {isOwner ? 'Quotation Sent' : 'Quotation Received'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
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
                    {/* Service Description */}
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                        {description}
                    </p>

                    {/* Pricing Summary */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Service Charge:</span>
                            <span className="font-medium">PKR {serviceCharge?.toFixed(2)}</span>
                        </div>
                        {partsPrice > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Parts Cost:</span>
                                <span className="font-medium">PKR {partsPrice?.toFixed(2)}</span>
                            </div>
                        )}

                         {partsQuality && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Parts Quality:</span>
                                <span className="font-medium">{partsQuality}</span>
                            </div>
                         )} 
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800">Total Amount:</span>
                                <span className="text-lg font-bold text-green-600">
                                    PKR {totalAmount?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                            <span className="text-gray-500">Duration:</span>
                            <p className="font-medium">{estimatedDuration}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Service Type:</span>
                            <p className="font-medium">{getServiceTypeLabel(serviceType)}</p>
                        </div>
                    </div>

                    {/* Validity Status */}
                    {validUntil && (
                        <div className={`p-3 rounded-lg mb-3 ${
                            new Date() > new Date(validUntil) 
                                ? 'bg-red-50 border border-red-200' 
                                : 'bg-blue-50 border border-blue-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon 
                                        icon={new Date() > new Date(validUntil) ? "mdi:clock-alert" : "mdi:clock-outline"} 
                                        width={16} 
                                        className={new Date() > new Date(validUntil) ? "text-red-600" : "text-blue-600"}
                                    />
                                    <span className={`text-sm font-medium ${
                                        new Date() > new Date(validUntil) ? "text-red-700" : "text-blue-700"
                                    }`}>
                                        {new Date() > new Date(validUntil) ? "Expired" : "Valid Until"}
                                    </span>
                                </div>
                                <span className={`text-sm font-semibold ${
                                    new Date() > new Date(validUntil) ? "text-red-700" : "text-blue-700"
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

                    {/* Expandable Details */}
                    {showDetails && (
                        <div className="mt-4 pt-4 border-t">
                            {warranty && (
                                <div className="mb-3">
                                    <span className="text-gray-500 text-sm">Warranty:</span>
                                    <p className="font-medium">
                                        {typeof warranty === 'object' 
                                            ? `${warranty.duration} - ${warranty.description}`
                                            : warranty
                                        }
                                    </p>
                                </div>
                            )}
                            
                            {repairmanNotes && (
                                <div className="mb-3">
                                    <span className="text-gray-500 text-sm">Additional Notes:</span>
                                    <p className="text-gray-700 text-sm">{repairmanNotes}</p>
                                </div>
                            )}

                            {validUntil && (
                                <div className="mb-3">
                                    <span className="text-gray-500 text-sm">Quote Validity:</span>
                                    <p className="font-medium text-gray-700">
                                        Until {new Date(validUntil).toLocaleDateString()} at{' '}
                                        {new Date(validUntil).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Expired Notice - Removed as it's now handled in validity status */}

                    {/* Customer Response Buttons */}
                    {canRespond && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleQuotationResponse('accept')}
                                    disabled={responding}
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    {responding ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Icon icon="mdi:check" width={16} />
                                            Accept
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleQuotationResponse('rejected')}
                                    disabled={responding}
                                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    {responding ? (
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

                    {/* Response Status */}
                    {(status === 'accepted' || status === 'rejected') && (
                        <div className="mt-3 p-2 rounded text-center">
                            <span className={`text-sm font-medium ${
                                status === 'accepted' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                Quotation {status} by customer
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