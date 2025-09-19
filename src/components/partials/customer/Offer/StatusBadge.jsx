import React from 'react'

const StatusBadge = ({ status, className = "" }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'text-green-600 bg-green-50';
            case 'offers_received': return 'text-blue-600 bg-blue-50';
            case 'closed': return 'text-red-600 bg-red-50';
            case 'in_progress': return 'text-yellow-600 bg-yellow-50';
            case 'booked': return 'text-purple-600 bg-purple-50';
            case 'completed': return 'text-gray-600 bg-gray-50';
            case 'scheduled': return 'text-indigo-600 bg-indigo-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
            {status?.replace('_', ' ').toUpperCase()}
        </span>
    );
};

export default StatusBadge
