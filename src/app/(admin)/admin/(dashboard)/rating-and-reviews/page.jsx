"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';

export default function RatingAndReviews() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [moderationStatus, setModerationStatus] = useState('');
    const [rating, setRating] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [currentPage, setCurrentPage] = useState(1);

    const { token } = useSelector((state) => state.auth);

    // Debouncing effect for search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
            });

            if (debouncedSearch) params.append('searchQuery', debouncedSearch);
            if (moderationStatus) params.append('moderationStatus', moderationStatus);
            if (rating) params.append('rating', rating);
            if (sortBy) params.append('sortBy', sortBy);

            const response = await axiosInstance.get(`/reviews/admin/all?${params}`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            });
            setData(response.data.data.reviews);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, debouncedSearch, moderationStatus, rating, sortBy]);

    const renderStars = (ratingValue) => {
        const stars = [];
        const fullStars = Math.floor(ratingValue);
        const hasHalf = ratingValue % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Icon key={i} icon="ic:round-star" className="text-yellow-400 fill-current" width="20" />);
        }
        if (hasHalf) {
            stars.push(<Icon key="half" icon="ic:round-star-half" className="text-yellow-400 fill-current" width="20" />);
        }
        const emptyStars = 5 - Math.ceil(ratingValue);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Icon key={`empty-${i}`} icon="ic:round-star-border" className="text-yellow-400" width="20" />);
        }
        return stars;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Reviews and Ratings</h1>
                            <p className="text-gray-600 mt-1">Repairmen ratings and customer reviews</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by review text..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Moderation Status Filter */}
                        <div>
                            <select
                                value={moderationStatus}
                                onChange={(e) => {
                                    setModerationStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="hidden">Hidden</option>
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <select
                                value={rating}
                                onChange={(e) => {
                                    setRating(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                    </div>

                    {/* Sort By */}
                    <div className="mt-4">
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="oldest">Oldest First</option>
                            <option value="rating-high">Highest Rating</option>
                            <option value="rating-low">Lowest Rating</option>
                            <option value="helpful">Most Helpful</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <Icon icon="eos-icons:loading" className="text-4xl text-primary-500 mx-auto" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && data.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Icon icon="mdi:comment-text-outline" className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Found</h3>
                        <p className="text-gray-500">
                            {searchQuery || moderationStatus || rating
                                ? "Try adjusting your filters to see more reviews"
                                : "There are no reviews available at the moment"}
                        </p>
                    </div>
                )}

                {/* Cards Grid */}
                {!loading && data.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {data.map((review) => (
                            <Link key={review._id} href={`/admin/rating-and-reviews/${review._id}`}>
                                <div className="bg-white rounded-md h-full shadow-xs hover:shadow-sm transition-all duration-300 border border-gray-100 overflow-hidden">
                                    <div className="p-6">
                                        {/* Service Name */}
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                                            {review.jobId?.deviceInfo?.brand} {review.jobId?.deviceInfo?.model}
                                        </h3>

                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${review.repairmanId?.name}&background=667eea&color=fff`}
                                                        alt={review.repairmanId?.name}
                                                        className="w-16 h-16 rounded-full ring-2 ring-primary-100"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                                                        <Icon icon="ic:round-verified" className="text-white" width="16" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-lg">
                                                        {review.repairmanId?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {review.repairmanId?.repairmanProfile?.shopName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-1">
                                                <span className="text-lg font-bold text-gray-800">
                                                    {review.overallRating}
                                                </span>
                                                <div className="flex ml-1">
                                                    {renderStars(review.overallRating)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-primary-50 px-5 py-4 rounded-xl border-l-4 border-primary-200 relative">
                                            <Icon
                                                icon="ic:outline-format-quote"
                                                className="text-primary-400 absolute -top-2 -left-3 text-2xl"
                                            />
                                            <p className="text-gray-700 mb-3 leading-relaxed">
                                                {review.reviewText}
                                            </p>
                                            <div className="flex items-center justify-end">
                                                <p className="text-sm text-gray-600 italic font-medium">
                                                    - {review.customerId?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}