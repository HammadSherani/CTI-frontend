"use client";

import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';

function page() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const {token} = useSelector(state => state.auth);
    const {id} = useParams();

    const fetchRepairMan = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/repairman/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            })
            setData(response.data.data.repairman);
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRepairMan();
    }, [])

    const getStatusColor = (status) => {
        switch(status) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="mdi:alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800">No Data Found</h2>
                    <p className="text-gray-600">Unable to load repairman profile</p>
                </div>
            </div>
        );
    }

    const profile = data.repairmanProfile;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Repairman Profile</h1>
                            <p className="text-gray-600 mt-1">Complete profile information and verification status</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
                                {data?.status?.toUpperCase()}
                            </span>
                            <div className="flex items-center space-x-2">
                                {data.isActive ? (
                                    <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Icon icon="mdi:close-circle" className="w-5 h-5 text-red-500" />
                                )}
                                <span className="text-sm text-gray-600">
                                    {data.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="text-center">
                                {profile.profilePhoto ? (
                                    <img 
                                        src={profile.profilePhoto} 
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
                                        <Icon icon="mdi:account" className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                                <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
                                <p className="text-gray-600">{data.email}</p>
                                <div className="flex items-center justify-center mt-2">
                                    <Icon icon="mdi:star" className="w-4 h-4 text-yellow-400 mr-1" />
                                    <span className="text-gray-600">{profile.rating}/5 ({profile.totalJobs} jobs)</span>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-primary-50 rounded-lg">
                                    <Icon icon="mdi:briefcase" className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                                    <p className="text-sm text-gray-600">Total Jobs</p>
                                    <p className="font-semibold text-gray-900">{profile.totalJobs}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <Icon icon="mdi:trophy" className="w-6 h-6 text-green-600 mx-auto mb-1" />
                                    <p className="text-sm text-gray-600">Rating</p>
                                    <p className="font-semibold text-gray-900">{profile.rating}/5</p>
                                </div>
                            </div>
                        </div>

                        {/* Verification Status */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Email Verified</span>
                                    {data.isEmailVerified ? (
                                        <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Icon icon="mdi:close-circle" className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Profile Complete</span>
                                    {data.isProfileComplete ? (
                                        <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Icon icon="mdi:close-circle" className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Documents Complete</span>
                                    {data.isDocumentComplete ? (
                                        <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Icon icon="mdi:close-circle" className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Detailed Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Icon icon="mdi:account" className="w-6 h-6 mr-2 text-primary-600" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <p className="text-gray-900">{profile.fullName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                                    <p className="text-gray-900">{profile.fatherName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CNIC/National ID</label>
                                    <p className="text-gray-900">{profile.nationalIdOrCitizenNumber}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <p className="text-gray-900">{formatDate(profile.dob)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <p className="text-gray-900">{profile.gender}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <p className="text-gray-900 flex items-center">
                                        <Icon icon="mdi:email" className="w-4 h-4 mr-2 text-gray-500" />
                                        {profile.emailAddress}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Icon icon="mdi:phone" className="w-6 h-6 mr-2 text-green-600" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                    <p className="text-gray-900 flex items-center">
                                        <Icon icon="mdi:phone" className="w-4 h-4 mr-2 text-gray-500" />
                                        {profile.mobileNumber}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                                    <p className="text-gray-900 flex items-center">
                                        <Icon icon="mdi:whatsapp" className="w-4 h-4 mr-2 text-gray-500" />
                                        {profile.whatsappNumber}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Person</label>
                                    <p className="text-gray-900 flex items-center">
                                        <Icon icon="mdi:account-group" className="w-4 h-4 mr-2 text-gray-500" />
                                        {profile.emergencyContactPerson}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Number</label>
                                    <p className="text-gray-900 flex items-center">
                                        <Icon icon="mdi:phone-alert" className="w-4 h-4 mr-2 text-gray-500" />
                                        {profile.emergencyContactNumber}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Shop Information */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Icon icon="mdi:store" className="w-6 h-6 mr-2 text-purple-600" />
                                Shop Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                    <p className="text-gray-900">{profile.shopName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                                    <p className="text-gray-900 flex items-start">
                                        <Icon icon="mdi:map-marker" className="w-4 h-4 mr-2 text-gray-500 mt-1 flex-shrink-0" />
                                        {profile.fullAddress}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <p className="text-gray-900">{profile.city}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                        <p className="text-gray-900">{profile.district}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                        <p className="text-gray-900">{profile.zipCode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Working Information */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Icon icon="mdi:clock" className="w-6 h-6 mr-2 text-orange-600" />
                                Working Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                                    <p className="text-gray-900">
                                        {formatTime(profile.workingHours.start)} - {formatTime(profile.workingHours.end)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Service</label>
                                    <p className="text-gray-900">
                                        {profile.pickupService ? 'Available' : 'Not Available'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.workingDays.map((day, index) => (
                                            <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Icon icon="mdi:trophy" className="w-6 h-6 mr-2 text-yellow-600" />
                                Professional Information
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{profile.description}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.specializations.map((spec, index) => (
                                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {profile.brandsWorkedWith.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Brands Worked With</label>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.brandsWorkedWith.map((brand, index) => (
                                                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                                    {brand}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Icon icon="mdi:file-document" className="w-6 h-6 mr-2 text-indigo-600" />
                                Documents & Photos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* National ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Icon icon="mdi:card-account-details" className="w-4 h-4 mr-1" />
                                        National ID/Passport Scan
                                    </label>
                                    {profile.nationalIdOrPassportScan && (
                                        <img 
                                            src={profile.nationalIdOrPassportScan}
                                            alt="National ID"
                                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-primary-500 transition-colors"
                                            onClick={() => window.open(profile.nationalIdOrPassportScan, '_blank')}
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Icon icon="mdi:camera" className="w-4 h-4 mr-1" />
                                        Shop Photo
                                    </label>
                                    {profile.shopPhoto && (
                                        <img 
                                            src={profile.shopPhoto}
                                            alt="Shop"
                                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-primary-500 transition-colors"
                                            onClick={() => window.open(profile.shopPhoto, '_blank')}
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Icon icon="mdi:file-document-outline" className="w-4 h-4 mr-1" />
                                        Utility Bill/Shop Proof
                                    </label>
                                    {profile.utilityBillOrShopProof && (
                                        <img 
                                            src={profile.utilityBillOrShopProof}
                                            alt="Utility Bill"
                                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-primary-500 transition-colors"
                                            onClick={() => window.open(profile.utilityBillOrShopProof, '_blank')}
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Icon icon="mdi:certificate" className="w-4 h-4 mr-1" />
                                        Certifications
                                    </label>
                                    {profile.certifications && profile.certifications.length > 0 && (
                                        <div className="space-y-2">
                                            {profile.certifications.map((cert, index) => (
                                                <img 
                                                    key={index}
                                                    src={cert}
                                                    alt={`Certificate ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-primary-500 transition-colors"
                                                    onClick={() => window.open(cert, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Icon icon="mdi:calendar" className="w-6 h-6 mr-2 text-gray-600" />
                                Account Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                                    <p className="text-gray-900">{formatDate(data.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                                    <p className="text-gray-900">{formatDate(data.updatedAt)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Last Updated</label>
                                    <p className="text-gray-900">{formatDate(data.profileLastUpdated)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                                    <p className="text-gray-900 font-mono text-sm">{data._id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page