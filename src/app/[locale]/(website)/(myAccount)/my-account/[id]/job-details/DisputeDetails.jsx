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
 
    return (
   <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
    
    {/* Header */}
    <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-5">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                    Dispute Information
                </h3>
                <p className="text-primary-100 text-sm mt-1">
                    Complete details and status overview
                </p>
            </div>
            <div className="flex items-center gap-2">
                <StatusBadge status={dispute.status} />
                <StatusBadge status={dispute.priority} />
            </div>
        </div>
    </div>

    <div className="p-8 space-y-8">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left Info */}
            <div className="space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                        Dispute ID
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                        {dispute.disputeId}
                    </p>
                </div>

                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                        Category
                    </p>
                    <p className="text-base text-gray-800 mt-1 capitalize font-medium">
                        {formatCategory(dispute.category)}
                    </p>
                </div>

                {dispute.paymentStatus && (
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                            Payment Status
                        </p>
                        <span className="inline-flex items-center mt-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-200 shadow-sm">
                            {dispute.paymentStatus?.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Users Section */}
            <div className="space-y-5">

                {/* Raised By */}
                <div className="rounded-xl p-5 border bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-blue-900">
                            Raised By
                        </span>
                        <Icon icon="heroicons:user" className="w-5 h-5 text-blue-600" />
                    </div>

                    <p className="text-lg font-bold text-blue-900">
                        {dispute.raisedBy.userId.name}
                    </p>

                    <span className="inline-block mt-3 px-3 py-1 bg-white/70 backdrop-blur text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                        {dispute.raisedBy.userType}
                    </span>
                </div>

                {/* Against User */}
                <div className="rounded-xl p-5 border bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-red-900">
                            Against User
                        </span>
                        <Icon icon="heroicons:user" className="w-5 h-5 text-red-600" />
                    </div>

                    <p className="text-lg font-bold text-red-900">
                        {dispute.againstUser.userId.name}
                    </p>

                    <span className="inline-block mt-3 px-3 py-1 bg-white/70 backdrop-blur text-red-700 rounded-full text-xs font-medium border border-red-200">
                        {dispute.againstUser.userType}
                    </span>
                </div>
            </div>
        </div>

        {/* Description */}
        {dispute.description && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                    Description
                </p>
                <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                    {dispute.description}
                </p>
            </div>
        )}

        {/* You can keep your existing Resolution, Admin Notes and Deadlines sections
            — just add:
            rounded-xl
            shadow-sm
            p-6
            border border-gray-100
            hover:shadow-md transition
            for modern feel.
        */}
    </div>
</div>

    );
};

export default DisputeDetails;