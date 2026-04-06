"use client";

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import LoginModal from '../../../(website)/mobile-repair/[brandSlug]/[modelId]/[color]/LoginModal';
import { useChat } from '@/hooks/useChat';
import { addChat } from '@/store/chat';
import Loader from '@/components/Loader';

function RepairmanDetail() {
    const [repairman, setRepairman] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const dispatch = useDispatch();

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
    };

    useEffect(() => {
        if (id) {
            getRepairman();
        }
    }, [id]);

    const handleMessageSend = async (repairmanId) => {
        if (!user && !token) {
            setIsOpen(true);
            return;
        }
        try {
            const { data } = await axiosInstance.post(
                `/chat/start`,
                { repairmanId: repairmanId },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );

            const newChat = {
                id: data?.chat._id,
                chatId: data?.chat._id,
                name: data?.chat?.user?.name || repairman?.repairmanProfile?.fullName,
                avatar: data?.chat?.user?.avatar || repairman?.repairmanProfile?.profilePhoto,
                userId: data?.chat?.user?._id || repairmanId,
                lastMessage: '',
                timestamp: new Date().toISOString(),
                online: false
            };

            dispatch(addChat(newChat));
            openChat();
            selectChat({
                id: data?.chat._id,
                name: data?.chat?.user?.name || repairman?.repairmanProfile?.fullName,
                avatar: data?.chat?.user?.avatar || repairman?.repairmanProfile?.profilePhoto,
            });
        } catch (error) {
            handleError(error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading repairman details...</p>
                </div>
            </div>
        );
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
        );
    }

    const profile = repairman.repairmanProfile;
    const reviewStats = repairman.reviewStats;
    const reviews = repairman.reviews;

    const calculateProfileCompletion = () => {
        if (!profile) return 0;
        const fields = [
            profile.fullName, 
            profile.mobileNumber, 
            profile.description,
            profile.specializations?.length, 
            profile.workingHours,
            profile.city, 
            profile.district, 
            profile.isKycCompleted
        ];
        const completed = fields.filter(Boolean).length;
        return Math.round((completed / fields.length) * 100);
    };

    const completionPercentage = calculateProfileCompletion();

    const StatCard = ({ icon, label, value, bgColor = "bg-primary-50", iconColor = "text-primary-600" }) => (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
                <div className={`${bgColor} p-3 rounded-xl`}>
                    <Icon icon={icon} className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-lg font-bold text-gray-900">{value || 'N/A'}</p>
                </div>
            </div>
        </div>
    );

const SafeImage = ({ src, alt, className, width = 80, height = 80 }) => {
  if (!src) return null;
  return (
    <div className="mt-3">
      <Image
        src={src}
        alt={alt || 'image'}
        width={width}
        height={height}
        className={className || 'w-20 h-20 object-cover rounded-lg border border-gray-200'}
        unoptimized
      />
    </div>
  );
};

    // const EducationSection = ({ education = []}) => {
    //   return (
    //     <>
    //       <SectionCard
    //         title="Education"
    //         icon="heroicons:academic-cap"
           
    //       >
    //         {education.length === 0 ? (
    //           <div className="text-center py-8">
    //             <Icon icon="heroicons:academic-cap" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
    //             <p className="text-sm text-gray-400">No education added yet</p>
    //           </div>
    //         ) : (
    //           <div className="relative">
    //             <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-gray-100" />
    //             <div className="space-y-0">
    //               {education.map((item, index) => (
    //                 <div key={item._id || index} className="relative flex gap-4 pb-5 last:pb-0 group">
    //                   <div className="relative z-10 flex-shrink-0 mt-1">
    //                     <div className="w-4 h-4 rounded-full border-2 border-primary-500 bg-white" />
    //                   </div>
    //                   <div className="flex-1 bg-gray-50/50 rounded-xl p-4 border border-gray-100 group-hover:border-gray-200 transition-all">
    //                     <div className="flex items-start justify-between gap-3 mb-1">
    //                       <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
    //                       <div className="flex items-center gap-1 flex-shrink-0">
    //                         <span className="text-xs text-primary-600 border border-primary-200 bg-primary-50 px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
    //                           {item.startYear}{item.endYear ? ` – ${item.endYear}` : ' – Present'}
    //                         </span>
                          
    //                       </div>
    //                     </div>
    //                     <p className="text-xs text-primary-600 font-medium mb-2">{item.institution}</p>
    //                     {item.description && <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>}
    //                     {/* ✅ Safe image — won't crash if null */}
    //                     <SafeImage src={item.educationImage} alt="Education certificate" />
    //                   </div>
    //                 </div>
    //               ))}
    //             </div>
    //           </div>
    //         )}
    //       </SectionCard>
    
    //     </>
    //   );
    // };


    const SectionCard = ({ title, icon, children, action }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon && <Icon icon={icon} className="w-5 h-5 text-primary-600" />}
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                {action && action}
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );

    const InfoRow = ({ icon, label, value, isVerified }) => (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-lg ${value ? 'bg-primary-50' : 'bg-gray-100'}`}>
                <Icon icon={icon} className={`w-4 h-4 ${value ? 'text-primary-600' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{value || 'Not provided'}</p>
                    {isVerified && value && (
                        <Icon icon="heroicons:check-badge-20-solid" className="w-4 h-4 text-green-500" />
                    )}
                </div>
            </div>
        </div>
    );

    const Badge = ({ children, variant = 'primary' }) => {
        const variants = {
            primary: 'bg-primary-50 text-primary-700 border-primary-200',
            success: 'bg-green-50 text-green-700 border-green-200',
            warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            info: 'bg-blue-50 text-blue-700 border-blue-200',
            default: 'bg-gray-50 text-gray-700 border-gray-200'
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]}`}>
                {children}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Enhanced Cover Image Section */}
            <div className="relative h-[400px] group">
                {/* Background with Parallax Effect */}
                <div className="absolute inset-0 overflow-hidden">
                    {profile?.shopPhoto ? (
                        <>
                            <img
                                src={profile.shopPhoto}
                                alt="Cover"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900">
                            {/* Animated Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                    backgroundSize: '40px 40px'
                                }} />
                            </div>
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                    )}
                </div>

                {/* Top Navigation Bar */}
                <div className="absolute top-0 left-0 right-0 px-6 py-4 flex justify-between items-center">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/90 hover:text-white bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-black/30 transition-all"
                    >
                        <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
                        <span className="text-sm font-medium">Go Back</span>
                    </button>

                    <div className="flex gap-2">
                        <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/20">
                            <Icon icon="heroicons:bookmark" className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/20">
                            <Icon icon="heroicons:share" className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Profile Info Overlay - Bottom Left */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-24">
                    <div className="flex items-end gap-6">
                        {/* Profile Image with Border Animation */}
                        <div className="relative">
                            <div className="w-36 h-36 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 transform hover:scale-105 transition-transform duration-300">
                                {profile?.profilePhoto ? (
                                    <img
                                        src={profile.profilePhoto}
                                        alt={profile.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-5xl font-bold text-white">
                                            {profile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'R'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -top-2 -right-2">
                                {repairman.isEmailVerified && (
                                    <div className="bg-green-500 rounded-full p-1.5 border-2 border-white">
                                        <Icon icon="heroicons:check" className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold">{profile?.fullName || repairman.name}</h1>
                                {profile?.shopName && (
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm border border-white/30">
                                        {profile.shopName}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-white/90">
                                <div className="flex items-center gap-1">
                                    <Icon icon="heroicons:map-pin" className="w-4 h-4" />
                                    <span className="text-sm">{repairman.city?.name || 'City not set'}, {repairman.state?.name || 'State not set'}</span>
                                </div>
                                {profile?.yearsOfExperience && (
                                    <div className="flex items-center gap-1">
                                        <Icon icon="heroicons:clock" className="w-4 h-4" />
                                        <span className="text-sm">{profile.yearsOfExperience} Years Experience</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Icon icon="heroicons:briefcase" className="w-4 h-4" />
                                    <span className="text-sm">{profile?.totalJobs || 0} Jobs Completed</span>
                                </div>
                            </div>

                            {/* Rating Badge */}
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex items-center gap-1 bg-yellow-400/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-400/30">
                                    <Icon icon="heroicons:star" className="w-4 h-4 text-yellow-400" />
                                    <span className="font-semibold text-white">{reviewStats?.averageRating || '0.0'}</span>
                                    <span className="text-xs text-white/70">({reviewStats?.totalReviews || 0} reviews)</span>
                                </div>
                                {profile?.isKycCompleted && (
                                    <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-500/30">
                                        <Icon icon="heroicons:check-badge" className="w-4 h-4 text-green-400" />
                                        <span className="text-xs text-white">Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hire Button */}
                <div className="absolute !z-10 bottom-24 right-6 flex gap-3" >
                    <button
                        onClick={() => handleMessageSend(repairman._id)}
                        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white hover:from-primary-600 hover:to-primary-700 transition-all border border-white/30 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                        type="button"
                    >
                        <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5" />
                        Hire Repairman
                    </button>
                </div>

                {/* Profile Completion Bar */}
                <div className="absolute bottom-0 left-0 right-0">
                    <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-12 pb-4">
                        <div className="container mx-auto px-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Icon icon="heroicons:chart-bar" className="w-4 h-4 text-white/70" />
                                            <span className="text-sm font-medium text-white/90">Profile Strength</span>
                                        </div>
                                        <span className="text-sm font-bold text-white">{completionPercentage}% Complete</span>
                                    </div>
                                    <div className="h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500 relative"
                                            style={{ width: `${completionPercentage}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert for incomplete bank details */}
            {profile && !profile.isPaymentInformationCompleted && (
                <div className="container mx-auto px-6 -mt-4 mb-6 relative z-10">
                    <div className="animate-slideDown">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-500 rounded-xl p-4 shadow-lg">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">Complete Your Bank Details</h4>
                                    <p className="text-sm text-gray-600 mb-3">Add your bank information to start receiving payments</p>
                                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium inline-flex items-center gap-2">
                                        <Icon icon="heroicons:banknotes" className="w-4 h-4" />
                                        Add Bank Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rest of the content */}
            <div className="container mx-auto px-6 pb-8 mt-8 mb-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        icon="heroicons:star"
                        label="Rating"
                        value={reviewStats?.averageRating ? `${reviewStats.averageRating} (${reviewStats.totalReviews || 0} reviews)` : 'No ratings'}
                        bgColor="bg-yellow-50"
                        iconColor="text-yellow-600"
                    />
                    <StatCard
                        icon="heroicons:briefcase"
                        label="Jobs Completed"
                        value={profile?.totalJobs || 0}
                        bgColor="bg-blue-50"
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        icon="heroicons:clock"
                        label="Experience"
                        value={profile?.yearsOfExperience ? `${profile.yearsOfExperience} Years` : 'N/A'}
                        bgColor="bg-purple-50"
                        iconColor="text-purple-600"
                    />
                    <StatCard
                        icon="heroicons:users"
                        label="Total Reviews"
                        value={reviewStats?.totalReviews || 0}
                        bgColor="bg-green-50"
                        iconColor="text-green-600"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        {profile?.description && (
                            <SectionCard title="About Me" icon="heroicons:information-circle">
                                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                            </SectionCard>
                        )}

                        {/* Specializations */}
                        {profile?.specializations?.length > 0 && (
                            <SectionCard title="Specializations" icon="heroicons:bolt">
                                <div className="flex flex-wrap gap-2">
                                    {profile.specializations.map((spec, index) => (
                                        <Badge key={index} variant="primary">{spec}</Badge>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

{console.log(profile, "education")}
                                   {/* <EducationSection education={profile.education}  /> */}

                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <SectionCard title="Contact Info" icon="heroicons:phone">
                            <div className="space-y-2">
                                <InfoRow
                                    icon="heroicons:phone"
                                    label="Phone"
                                    value={profile?.mobileNumber || repairman.phone}
                                />
                                <InfoRow
                                    icon="heroicons:envelope"
                                    label="Email"
                                    value={profile?.emailAddress || repairman.email}
                                    isVerified={repairman.isEmailVerified}
                                />
                                {profile?.whatsappNumber && (
                                    <InfoRow
                                        icon="ic:baseline-whatsapp"
                                        label="WhatsApp"
                                        value={profile.whatsappNumber}
                                    />
                                )}
                            </div>
                        </SectionCard>

                        {/* Location Details */}
                        <SectionCard title="Location" icon="heroicons:map-pin">
                            <div className="space-y-3">
                                <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl">
                                    <p className="text-xs text-primary-600 font-medium mb-1">Full Address</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {profile?.fullAddress || repairman.address || 'Address not provided'}
                                    </p>
                                </div>
                                {profile?.zipCode && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-xs text-gray-500">ZIP Code</span>
                                        <span className="text-sm font-medium">{profile.zipCode}</span>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Emergency Contact */}
                        {(profile?.emergencyContactPerson || profile?.emergencyContactNumber) && (
                            <SectionCard title="Emergency Contact" icon="heroicons:phone-arrow-up-right">
                                <div className="space-y-3">
                                    {profile.emergencyContactPerson && (
                                        <InfoRow
                                            icon="heroicons:user"
                                            label="Contact Person"
                                            value={profile.emergencyContactPerson}
                                        />
                                    )}
                                    {profile.emergencyContactNumber && (
                                        <InfoRow
                                            icon="heroicons:phone"
                                            label="Contact Number"
                                            value={profile.emergencyContactNumber}
                                        />
                                    )}
                                </div>
                            </SectionCard>
                        )}

                        {/* Services */}
                        <SectionCard title="Services" icon="heroicons:wrench-screwdriver">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">Pickup Service</span>
                                    <Badge variant={profile?.pickupService ? 'success' : 'default'}>
                                        {profile?.pickupService ? 'Available' : 'Not Available'}
                                    </Badge>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Bank Details */}
                        {profile?.bankDetails && profile.isPaymentInformationCompleted && (
                            <SectionCard title="Bank Information" icon="heroicons:banknotes">
                                <div className="space-y-2">
                                    <InfoRow icon="heroicons:user" label="Account Title" value={profile.bankDetails.accountTitle} />
                                    <InfoRow icon="heroicons:credit-card" label="Account Number" value={profile.bankDetails.accountNumber} />
                                    <InfoRow icon="heroicons:building-office" label="Bank Name" value={profile.bankDetails.bankName} />
                                    {profile.bankDetails.iban && <InfoRow icon="heroicons:document-text" label="IBAN" value={profile.bankDetails.iban} />}
                                </div>
                            </SectionCard>
                        )}
                    </div>
                </div>
            </div>

            {/* Login Modal */}
            <LoginModal isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    );
}

export default RepairmanDetail;