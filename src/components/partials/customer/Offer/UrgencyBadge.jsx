export const UrgencyBadge = ({ urgency, className = "" }) => {
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(urgency)} ${className}`}>
            {urgency?.toUpperCase()} PRIORITY
        </span>
    );
};