"use client"

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import LoginModal from '../../mobile-repair/[brandSlug]/[modelId]/[color]/create-job/LoginModal';
import { useChat } from '@/hooks/useChat';
import { addChat } from '@/store/chat';

function RepairmanDetail() {
    const [repairman, setRepairman] = useState(null);
    const [loading, setLoading] = useState(true);
    // const [activeTab, setActiveTab] = useState('overview');
    const [isOpen, setIsOpen] = useState(false);
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const dispatch = useDispatch()

    const { user, token } = useSelector((state) => state.auth);


    const { selectChat, openChat } = useChat();

    const getRepairman = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/public/repairmans/${id}`);
            setRepairman(data.data.repairman);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (id) {
            getRepairman();
        }
    }, [id])


    const handleMessageSend = async (id) => {
        if (!user && !token) {
            setIsOpen(true);
            return;
        }
        try {
            const { data } = await axiosInstance.post(
                `/chat/start`,
                { repairmanId: id },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );

            console.log('Chat started, response:', data);

            const newChat = {
                id: data?.chat._id,
                chatId: data?.chat._id,
                name: data?.chat?.user?.name || repairman?.repairmanProfile?.fullName,
                avatar: data?.chat?.user?.avatar || repairman?.repairmanProfile?.profilePhoto,
                userId: data?.chat?.user?._id || id,
                lastMessage: '',
                timestamp: new Date().toISOString(),
                online: false
            };

            dispatch(addChat(newChat));
            console.log('Chat added to list:', newChat);

            openChat();

            selectChat({
                id: data?.chat._id,
                name: data?.chat?.user?.name || repairman?.repairmanProfile?.fullName,
                avatar: data?.chat?.user?.avatar || repairman?.repairmanProfile?.profilePhoto,
            });

            console.log('Chat selected');

        } catch (error) {
            handleError(error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading repairman details...</p>
                </div>
            </div>
        )
    }

    if (!repairman) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="mdi:account-alert" className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Repairman Not Found</h3>
                    <p className="text-gray-600 mb-4">The repairman you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    const profile = repairman.repairmanProfile;

    return (

        <>
            <div className="min-h-screen bg-gray-50">


                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className=" rounded-lg  p-6 mb-6">
                                <div className="flex items-start space-x-6">
                                    <img
                                        src={profile.profilePhoto}
                                        alt={profile.fullName}
                                        className="w-32 h-32 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/150x150?text=No+Image'
                                        }}
                                    />
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            {profile.fullName}
                                        </h1>

                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                            <div className="flex items-center">
                                                <Icon icon="mdi:map-marker" className="w-4 h-4 mr-1" />
                                                {profile?.city}
                                            </div>

                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="flex items-center">
                                                <div className="flex text-yellow-400 mr-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Icon key={i} icon="mdi:star" className="w-4 h-4" />
                                                    ))}
                                                </div>
                                                <span className="font-semibold text-gray-900">{profile.rating}</span>
                                                <span className="text-gray-500 ml-1">({profile.totalJobs})</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* About Section */}
                            <div className="bg-white rounded-lg  p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">About me</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {profile.description}
                                </p>
                                <button className="text-green-600 hover:text-green-700 font-medium">
                                    Read more
                                </button>
                            </div>

                            {/* Skills Section */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                                <div className="flex flex-wrap gap-3">
                                    {profile.specializations.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {repairman.reviewStats.totalReviews} {repairman.reviewStats.totalReviews === 1 ? 'Review' : 'Reviews'}
                                    </h2>
                                    <div className="flex items-center">
                                        <div className="flex text-yellow-400 mr-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Icon
                                                    key={i}
                                                    icon={i < Math.floor(repairman.reviewStats.averageRating) ? "mdi:star" : "mdi:star-outline"}
                                                    className="w-4 h-4"
                                                />
                                            ))}
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            {repairman.reviewStats.averageRating.toFixed(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Rating Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <div className="space-y-2">
                                            {[5, 4, 3, 2, 1].map((star) => {
                                                const count = repairman.reviewStats.ratingDistribution[star] || 0;
                                                const percentage = repairman.reviewStats.totalReviews > 0
                                                    ? (count / repairman.reviewStats.totalReviews) * 100
                                                    : 0;

                                                return (
                                                    <div key={star} className="flex items-center">
                                                        <span className="text-sm text-gray-600 w-12">{star} Star{star !== 1 ? 's' : ''}</span>
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                                                            <div
                                                                className="bg-gray-800 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-600">({count})</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Rating Breakdown</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Service quality</span>
                                                <div className="flex items-center">
                                                    <Icon icon="mdi:star" className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-sm ml-1">{repairman.reviewStats.averageRating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Communication</span>
                                                <div className="flex items-center">
                                                    <Icon icon="mdi:star" className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-sm ml-1">{repairman.reviewStats.averageRating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Value for money</span>
                                                <div className="flex items-center">
                                                    <Icon icon="mdi:star" className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-sm ml-1">{repairman.reviewStats.averageRating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Individual Reviews */}
                                {repairman.reviews && repairman.reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {repairman.reviews.map((review) => (
                                            <div key={review._id} className="border-b pb-6 last:border-b-0">
                                                <div className="flex items-start space-x-3">
                                                    <img
                                                        src="https://via.placeholder.com/40x40?text=U"
                                                        alt={review.customerId?.name || 'User'}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className="font-medium text-gray-900">
                                                                {review.customerId?.name || 'Anonymous'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center mb-2">
                                                            <div className="flex text-yellow-400 mr-2">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Icon
                                                                        key={i}
                                                                        icon={i < review.overallRating ? "mdi:star" : "mdi:star-outline"}
                                                                        className="w-4 h-4"
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-gray-500">
                                                                {formatDate(review.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                                            {review.reviewText}
                                                        </p>

                                                        {/* Repairman Response */}
                                                        {review.repairmanResponse && (
                                                            <div className="mt-3 ml-4 pl-4 border-l-2 border-green-600 bg-green-50 p-3 rounded-r-lg">
                                                                <div className="flex items-center mb-2">
                                                                    <Icon icon="mdi:reply" className="w-4 h-4 text-green-600 mr-2" />
                                                                    <span className="font-medium text-gray-900 text-sm">
                                                                        Response from {profile.fullName}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500 ml-2">
                                                                        {formatDate(review.repairmanResponse.respondedAt)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-gray-700 text-sm">
                                                                    {review.repairmanResponse.text}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                                            <span>Helpful?</span>
                                                            <button className="flex items-center hover:text-gray-700">
                                                                <Icon icon="mdi:thumb-up-outline" className="w-4 h-4 mr-1" />
                                                                Yes {review.helpfulVotes > 0 && `(${review.helpfulVotes})`}
                                                            </button>
                                                            <button className="flex items-center hover:text-gray-700">
                                                                <Icon icon="mdi:thumb-down-outline" className="w-4 h-4 mr-1" />
                                                                No
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Icon icon="mdi:comment-alert-outline" className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No reviews yet</p>
                                    </div>
                                )}

                                {repairman.reviews && repairman.reviews.length > 0 && (
                                    <button className="mt-6 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full">
                                        Show More Reviews
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Contact Card */}
                            <div className="bg-white rounded-lg shadow-sm p-6 ">
                                <div className="flex items-center space-x-3 mb-4">
                                    <img
                                        src={profile.profilePhoto}
                                        alt={profile.fullName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{profile.fullName}</h3>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                            <span className="text-sm text-gray-600">Offline • 02:04 AM local time</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* <button 
                                    onClick={() => handleCall(profile.mobileNumber)}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                                >
                                    <Icon icon="mdi:phone" className="w-5 h-5 mr-2" />
                                    Call Now
                                </button> */}

                                    {/* <button
                                        onClick={() => handleWhatsApp(profile.whatsappNumber)}
                                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                                    >
                                        <Icon icon="mdi:whatsapp" className="w-5 h-5 mr-2" />
                                        WhatsApp
                                    </button> */}

                                    <button
                                        onClick={() => handleMessageSend(repairman._id)}
                                        className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                                    >
                                        <Icon icon="mdi:email" className="w-5 h-5 mr-2" />
                                        Send Message
                                    </button>

                                    {/* <button 
                                    onClick={handleHire}
                                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                                >
                                    <Icon icon="mdi:account-plus" className="w-5 h-5 mr-2" />
                                    Hire Now
                                </button> */}
                                </div>
                            </div>

                            {/* Shop Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Shop Information</h3>

                                {profile.shopPhoto && (
                                    <div className="mb-4">
                                        <img
                                            src={profile.shopPhoto}
                                            alt={profile.shopName}
                                            className="w-full h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x150?text=No+Shop+Image'
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <Icon icon="mdi:store" className="w-4 h-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900">{profile.shopName}</p>
                                        </div>
                                    </div>

                                    {/* <div className="flex items-start">
                                        <Icon icon="mdi:map-marker" className="w-4 h-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-700">{profile.fullAddress}</p>
                                            <p className="text-xs text-gray-500">{profile.city}, {profile.district} - {profile.zipCode}</p>
                                        </div>
                                    </div> */}

                                    <div className="flex items-center">
                                        <Icon icon="mdi:clock" className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-sm text-gray-700">
                                            {profile.workingHours.start} - {profile.workingHours.end}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <Icon icon="mdi:calendar" className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-sm text-gray-700">
                                            {profile.workingDays.join(', ')}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <Icon icon="mdi:truck" className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className={`text-sm ${profile.pickupService ? 'text-green-600' : 'text-red-600'}`}>
                                            Pickup Service: {profile.pickupService ? 'Available' : 'Not Available'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            {/* <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Contact Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Icon icon="mdi:phone" className="w-4 h-4 text-gray-500 mr-3" />
                                        <span className="text-sm text-gray-700">{profile.mobileNumber}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Icon icon="mdi:whatsapp" className="w-4 h-4 text-gray-500 mr-3" />
                                        <span className="text-sm text-gray-700">{profile.whatsappNumber}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Icon icon="mdi:email" className="w-4 h-4 text-gray-500 mr-3" />
                                        <span className="text-sm text-gray-700">{profile.emailAddress}</span>
                                    </div>
                                </div>
                            </div> */}

                            {/* Emergency Contact */}
                            {/* <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <Icon icon="mdi:account" className="w-4 h-4 text-gray-500 mr-3" />
                                    <span className="text-sm text-gray-700">{profile.emergencyContactPerson}</span>
                                </div>
                                <div className="flex items-center">
                                    <Icon icon="mdi:phone-alert" className="w-4 h-4 text-gray-500 mr-3" />
                                    <span className="text-sm text-gray-700">{profile.emergencyContactNumber}</span>
                                </div>
                            </div>
                        </div> */}

                            {/* Account Status */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Email Verified</span>
                                        <div className="flex items-center">
                                            <Icon
                                                icon={repairman.isEmailVerified ? "mdi:check-circle" : "mdi:close-circle"}
                                                className={`w-4 h-4 ${repairman.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Profile Complete</span>
                                        <div className="flex items-center">
                                            <Icon
                                                icon={repairman.isProfileComplete ? "mdi:check-circle" : "mdi:close-circle"}
                                                className={`w-4 h-4 ${repairman.isProfileComplete ? 'text-green-600' : 'text-red-600'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Documents</span>
                                        <div className="flex items-center">
                                            <Icon
                                                icon={repairman.isDocumentComplete ? "mdi:check-circle" : "mdi:close-circle"}
                                                className={`w-4 h-4 ${repairman.isDocumentComplete ? 'text-green-600' : 'text-red-600'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Member Since</span>
                                            <span className="text-sm text-gray-900 font-medium">{formatDate(repairman.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            {/* <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{profile.totalJobs}</div>
                                        <div className="text-sm text-gray-600">Total Jobs</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{profile.rating}/5</div>
                                        <div className="text-sm text-gray-600">Average Rating</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{profile.yearsOfExperience || 'N/A'}</div>
                                        <div className="text-sm text-gray-600">Years Experience</div>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Message Box */}
                    <div className="fixed bottom-8 right-8">
                        <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors">
                            <Icon icon="mdi:message" className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>


            <LoginModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            // onSuccess={}


            />
        </>
    )

}


export default RepairmanDetail