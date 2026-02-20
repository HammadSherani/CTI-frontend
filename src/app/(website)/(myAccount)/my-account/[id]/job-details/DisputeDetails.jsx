import StatusBadge from '@/components/partials/customer/Offer/StatusBadge';
import { Icon } from '@iconify/react';
import React from 'react';

const DisputeDetails = ({ dispute }) => {
    if (!dispute) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCategory = (category) => {
        return category.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const currencySymbol = '$';
 
    console.log('Rendering DisputeDetails with dispute:', dispute);
    return (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <div className='flex items-center justify-between mb-4'>
                <h3 className="text-lg font-semibold text-primary-900">Dispute Details</h3>
                <StatusBadge status={dispute.status} />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Category */}
                <div>
                    <span className="text-sm font-medium text-gray-600">Category:</span>
                    <p className="text-gray-800 capitalize mt-1">{formatCategory(dispute.category)}</p>
                </div>

                {/* Parties Info */}
                <div className="flex items-center justify-between gap-3">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 w-full">
                        <span className="text-sm font-medium text-blue-900 flex items-center mb-2">
                            <Icon icon="heroicons:user" className="w-4 h-4 mr-1" />
                            Raised By
                        </span>
                        <p className="text-base text-blue-900 font-semibold">
                            {dispute.raisedBy.userId.name}
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium">
                            {dispute.raisedBy.userType}
                        </span>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 border border-red-200 w-full">
                        <span className="text-sm font-medium text-red-900 flex items-center mb-2">
                            <Icon icon="heroicons:user" className="w-4 h-4 mr-1" />
                            Against User
                        </span>
                        <p className="text-base text-red-900 font-semibold">
                            {dispute.againstUser.userId.name}
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium">
                            {dispute.againstUser.userType}
                        </span>
                    </div>
                </div>

                {/* Refund Amount (if applicable) */}
                {dispute.resolution?.refundAmount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <span className="text-sm font-medium text-green-900">Refund Amount</span>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                            {currencySymbol}{dispute.resolution.refundAmount}
                        </p>
                    </div>
                )}

                {/* Description */}
                {dispute.description && (
                    <div className="pt-3 border-t border-primary-200">
                        <span className="text-sm font-medium text-gray-600">Description:</span>
                        <p className="text-gray-800 mt-1">
                            {dispute.description}
                        </p>
                    </div>
                )}

                {/* Deadlines */}
                {dispute.deadlines && (
                    <div className="pt-3 border-t border-primary-200">
                        <span className="text-sm font-medium text-gray-600">Important Deadlines:</span>
                        <div className="mt-2 space-y-1">
                            {dispute.deadlines.responseDeadline && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Icon icon="heroicons:clock" className="w-4 h-4" />
                                    Response: {formatDate(dispute.deadlines.responseDeadline)}
                                </p>
                            )}
                            {dispute.deadlines.resolutionDeadline && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Icon icon="heroicons:calendar" className="w-4 h-4" />
                                    Resolution: {formatDate(dispute.deadlines.resolutionDeadline)}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisputeDetails;