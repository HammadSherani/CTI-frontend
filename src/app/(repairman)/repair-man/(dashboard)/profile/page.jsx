"use client"

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';

function ProfilePage() {
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState(null)
  
  const {token} = useSelector(state => state.auth)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const {data} = await axiosInstance.get(`/repairman/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setData(data.data)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Icon icon="eos-icons:loading" className="text-4xl text-primary-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">No profile data found</div>
      </div>
    )
  }

  const { user, profileStatus } = data
  const profile = user.repairmanProfile

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <div
          className="h-80 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden"
          style={{
            backgroundImage: profile?.shopPhoto 
              ? `url(${profile.shopPhoto})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Overlay for better text visibility */}
          {profile?.shopPhoto && (
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          )}
        </div>

        {/* Profile Section */}
        <div className="relative -mt-[185px] mx-auto px-6">
          <div className="flex items-end justify-between">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-4">

              {/* Profile Image */}
              <div className="flex items-center gap-3 bg-white/90 p-6 rounded-md">
                <div className='relative'>
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                    {profile?.profilePhoto ? (
                      <img
                        src={profile.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary-600">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profile?.fullName || user.name}</h1>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Icon icon="heroicons:share" className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            icon="heroicons:star"
                            className={`w-4 h-4 ${i < Math.floor(profile?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{profile?.rating || 0}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Icon icon="heroicons:briefcase" className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{profile?.totalJobs || 0} Jobs</span>
                    </div>

                    {profile?.yearsOfExperience && (
                      <div className="flex items-center space-x-1">
                        <Icon icon="heroicons:clock" className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{profile.yearsOfExperience} Years</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl text-gray-700 mb-2 font-medium">{profile?.shopName}</h2>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Icon icon="heroicons:map-pin" className="w-4 h-4" />
                    <span>{profile?.city}, {profile?.district}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Icon icon="heroicons:camera" className="h-5 w-5" />
                Update shop photo
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Icon icon="heroicons:user" className="h-5 w-5" />
                Update profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verifications Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verifications & Status</h3>
          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-2 ${user.isEmailVerified ? 'text-green-600' : 'text-gray-400'}`}>
              <Icon icon="heroicons:envelope" className="w-5 h-5" />
              <span className="text-sm">Email Verified</span>
            </div>
            <div className={`flex items-center space-x-2 ${user.isProfileComplete ? 'text-green-600' : 'text-gray-400'}`}>
              <Icon icon="heroicons:user" className="w-5 h-5" />
              <span className="text-sm">Profile Complete</span>
            </div>
            <div className={`flex items-center space-x-2 ${profile?.isKycCompleted ? 'text-green-600' : 'text-gray-400'}`}>
              <Icon icon="heroicons:identification" className="w-5 h-5" />
              <span className="text-sm">KYC {profile?.kycStatus || 'Pending'}</span>
            </div>
            <div className={`flex items-center space-x-2 ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
              <Icon icon="heroicons:check-circle" className="w-5 h-5" />
              <span className="text-sm">Account {user.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* About Section */}
            {profile?.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              </div>
            )}

            {/* Specializations */}
            {profile?.specializations && profile.specializations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Specializations</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.specializations.map((spec, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-primary-100 text-primary-800 rounded-lg font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Working Hours */}
            {profile?.workingHours && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Working Hours</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon icon="heroicons:clock" className="w-6 h-6 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">Business Hours</p>
                        <p className="text-sm text-gray-600">
                          {profile.workingHours.start} - {profile.workingHours.end}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {profile?.workingDays && profile.workingDays.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-2">Working Days</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.workingDays.map((day, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shop Photo */}
            {profile?.shopPhoto && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Shop Photos</h3>
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={profile.shopPhoto} 
                    alt="Shop" 
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Certifications */}
            {profile?.certifications && profile.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Certifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.certifications.map((cert, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={cert} 
                        alt={`Certificate ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Icon icon="heroicons:phone" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{profile?.mobileNumber || user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon icon="heroicons:envelope" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{profile?.emailAddress || user.email}</p>
                  </div>
                </div>
                {profile?.whatsappNumber && (
                  <div className="flex items-center space-x-3">
                    <Icon icon="ic:baseline-whatsapp" className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">WhatsApp</p>
                      <p className="font-medium">{profile.whatsappNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Location</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons:map-pin" className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-900">{profile?.fullAddress}</p>
                    {profile?.zipCode && (
                      <p className="text-sm text-gray-600 mt-1">Zip: {profile.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {profile?.emergencyContactPerson && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{profile.emergencyContactPerson}</p>
                  <p className="text-sm text-gray-600">{profile.emergencyContactNumber}</p>
                </div>
              </div>
            )}

            {/* Additional Services */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Services</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pickup Service</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.pickupService ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile?.pickupService ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Account Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;