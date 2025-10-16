"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

function RatingAndReviewsDetails() {
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const { token } = useSelector((state) => state.auth);
    const { id } = useParams();
    const router  = useRouter();


    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/reviews/admin/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            });
            setReviewData(response.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderStars = (count) => {
        return [...Array(5)].map((_, index) => (
            <Icon
                key={index}
                icon="material-symbols:star"
                className={`${index < count ? 'text-yellow-400' : 'text-gray-300'} text-lg`}
            />
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setUpdatingStatus(true);
            await axiosInstance.put(
                `/reviews/${id}/moderate`,
                { moderationStatus: newStatus },
                {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                    }
                }
            );
            
            // Update local state
            setReviewData(prev => ({
                ...prev,
                review: {
                    ...prev.review,
                    moderationStatus: newStatus
                }
            }));
            
            toast.success('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            hidden: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!reviewData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">No review data found</div>
            </div>
        );
    }

    const { review, customerContext, repairmanContext } = reviewData;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            <div className="flex items-center justify-between mb-8 border-b">
                <div className="flex gap-8">
                    <button className="pb-4 border-b-2 border-black font-medium">
                        Review Details
                    </button>
                </div>

                 <button
            onClick={() => router.back()}
            className=" px-4 py-2 bg-gray-50  border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Go Back
          </button>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
                <div>
                    <h3 className="text-sm text-gray-600 mb-1">Customer</h3>
                    <p className="font-semibold">{review.customerId.name}</p>
                    <p className="text-sm text-gray-500">{review.customerId.email}</p>
                    <p className="text-xs text-gray-400 mt-2">
                        Total Reviews: {customerContext.totalReviews}
                    </p>
                </div>
                <div>
                    <h3 className="text-sm text-gray-600 mb-1">Repairman</h3>
                    <p className="font-semibold">{review.repairmanId.repairmanProfile.fullName}</p>
                    <p className="text-sm text-gray-500">{review.repairmanId.repairmanProfile.shopName}</p>
                    <p className="text-xs text-gray-400 mt-2">
                        Avg Rating: {repairmanContext.stats.averageRating.toFixed(1)} ({repairmanContext.stats.totalReviews} reviews)
                    </p>
                </div>
                <div>
                    <h3 className="text-sm text-gray-600 mb-1">Job Details</h3>
                    <p className="text-sm">{review.jobId.deviceInfo.brand} {review.jobId.deviceInfo.model}</p>
                    <p className="text-sm text-gray-500">{review.jobId.services.join(', ')}</p>
                    <p className="text-xs text-gray-400 mt-2">
                        Status: <span className="capitalize">{review.bookingId.status}</span>
                    </p>
                </div>
            </div>

            {/* Main Review */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-4 space-y-6">
                    <div className="border-b pb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    {renderStars(review.overallRating)}
                                    <span className="text-sm text-gray-600 ml-2">
                                        {review.overallRating}.0 out of 5
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {formatDate(review.createdAt)}
                                </p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(review.moderationStatus)}`}>
                                    {review.moderationStatus}
                                </span>
                                {review.isPublic && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Public
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Status Change Section */}
                      

                        <p className="text-gray-700 leading-relaxed mb-4">
                            {review.reviewText}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:eye-outline" className="text-lg" />
                                <span>{review.viewCount} views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon icon="material-symbols:thumb-up-outline" className="text-lg" />
                                <span>{review.helpfulVotes} helpful</span>
                            </div>
                            {review.isReported && (
                                <div className="flex items-center gap-2 text-red-600">
                                    <Icon icon="material-symbols:flag-outline" className="text-lg" />
                                    <span>Reported</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Job Description */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Job Description</h4>
                        <p className="text-sm text-gray-700">{review.jobId.description}</p>
                        <div className="mt-3 flex gap-4 text-sm">
                            <span className="text-gray-600">
                                Budget: PKR {review.jobId.budget.min} - {review.jobId.budget.max}
                            </span>
                            <span className="text-gray-600">
                                Urgency: <span className="capitalize">{review.jobId.urgency}</span>
                            </span>
                        </div>
                    </div>


                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="font-semibold mb-3 text-sm">Change Review Status</h4>
                            <div className="flex gap-2 flex-wrap">
                                {['approved', 'rejected', 'hidden'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        disabled={updatingStatus || review.moderationStatus === status}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                            review.moderationStatus === status
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700'
                                        } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {updatingStatus && review.moderationStatus !== status ? (
                                            <span className="flex items-center gap-2">
                                                <Icon icon="eos-icons:loading" className="animate-spin" />
                                                {status}
                                            </span>
                                        ) : (
                                            <span className="capitalize">{status}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Current status: <span className="font-semibold capitalize">{review.moderationStatus}</span>
                            </p>
                        </div>

                    {/* Recent Reviews by Customer */}
                    
                </div>
            </div>
        </div>
    );
}

export default RatingAndReviewsDetails;