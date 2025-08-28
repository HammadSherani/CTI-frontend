'use client';
import Image from 'next/image';
import { Icon } from '@iconify/react';

const reviews = [
    {
        name: 'Steven S.',
        title: 'CTO at HiboTheme',
        avatarUrl: '/assets/logo/tech-pro.png',
        rating: 5,
        comment: "I can't thank Stado enough for saving my computer! Their team worked tirelessly to recover my files and fix the software glitches. Fast, efficient, and friendly service. Highly recommended!",
    },
    // Duplicate for demonstration
    { name: 'Steven S.', title: 'CTO at HiboTheme', avatarUrl: '/assets/logo/tech-pro.png', rating: 5, comment: "I can't thank Stado enough for saving my computer! Their team worked tirelessly to recover my files and fix the software glitches. Fast, efficient, and friendly service. Highly recommended!" },
    { name: 'Steven S.', title: 'CTO at HiboTheme', avatarUrl: '/assets/logo/tech-pro.png', rating: 5, comment: "I can't thank Stado enough for saving my computer! Their team worked tirelessly to recover my files and fix the software glitches. Fast, efficient, and friendly service. Highly recommended!" },
    { name: 'Steven S.', title: 'CTO at HiboTheme', avatarUrl: '/assets/logo/tech-pro.png', rating: 5, comment: "I can't thank Stado enough for saving my computer! Their team worked tirelessly to recover my files and fix the software glitches. Fast, efficient, and friendly service. Highly recommended!" },
];

const ReviewCard = ({ review }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200/80 shadow-sm transition-shadow hover:shadow-lg">
            <div className="flex justify-between items-center">
                <Icon icon="fluent:emoji-laugh-24-regular" className="w-10 h-10 text-orange-400" />
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <Icon key={i} icon="mdi:star" className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                </div>
            </div>
            <p className="text-gray-600 my-4 text-sm leading-relaxed">{review.comment}</p>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image src={review.avatarUrl} alt={review.name} fill className="object-cover" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.title}</p>
                </div>
            </div>
        </div>
    );
};

const ReviewsSection = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 py-16">
            <div className="container">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">All Reviews</h2>
                    <a href="#" className="flex items-center gap-2 font-semibold text-blue-600 hover:underline text-sm">
                        <Icon icon="mdi:plus-circle-outline" className="w-5 h-5" />
                        <span>Add Review</span>
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {reviews.map((review, index) => (
                        <ReviewCard key={index} review={review} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewsSection;