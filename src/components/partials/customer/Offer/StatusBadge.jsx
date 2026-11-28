import React from 'react'

const StatusBadge = ({ status, className = "" }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'text-green-600 bg-green-50';
            case 'offers_received': return 'text-primary-600 bg-primary-50';
            case 'closed': return 'text-red-600 bg-red-50';
            case 'in_progress': return 'text-yellow-600 bg-yellow-50';
            case 'booked': return 'text-purple-600 bg-purple-50';
            case 'completed': return 'text-green-600 bg-green-50';
            case 'scheduled': return 'text-indigo-600 bg-indigo-50';
            // Booking statuses
            case 'pending': return 'text-gray-600 bg-gray-100';
            case 'confirmed': return 'text-blue-600 bg-blue-50';
            case 'repairman_notified': return 'text-blue-600 bg-blue-50';
            case 'parts_needed': return 'text-orange-600 bg-orange-50';
            case 'pending_approval': return 'text-amber-600 bg-amber-50';
            case 'quality_check': return 'text-cyan-600 bg-cyan-50';
            case 'delivered': return 'text-emerald-600 bg-emerald-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            case 'disputed': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
            {status?.replace(/_/g, ' ').toUpperCase()}
        </span>
    );
};

export default StatusBadge
