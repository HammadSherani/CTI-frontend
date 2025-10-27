import { useState } from "react";

export const ExpandableDescription = ({ description, maxLength = 150 }) => {
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
