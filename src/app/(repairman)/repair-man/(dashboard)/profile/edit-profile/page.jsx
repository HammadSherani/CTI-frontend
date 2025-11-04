'use client'

import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'

// Validation Schema for Profile
const profileSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required').min(3, 'Full name must be at least 3 characters'),
  fatherName: yup.string().required('Father name is required').min(3, 'Father name must be at least 3 characters'),
  mobileNumber: yup.string().required('Mobile number is required').matches(/^[0-9]{11}$/, 'Mobile number must be 11 digits'),
  whatsappNumber: yup.string().required('WhatsApp number is required').matches(/^[0-9]{11}$/, 'WhatsApp number must be 11 digits'),
  emailAddress: yup.string().required('Email is required').email('Invalid email address'),
  emergencyContactPerson: yup.string().required('Emergency contact person is required'),
  emergencyContactNumber: yup.string().required('Emergency contact number is required').matches(/^[0-9]{11}$/, 'Emergency contact number must be 11 digits'),
  shopName: yup.string().required('Shop name is required').min(3, 'Shop name must be at least 3 characters'),
  fullAddress: yup.string().required('Full address is required').min(10, 'Address must be at least 10 characters'),
  city: yup.string().required('City is required'),
  district: yup.string().required('District is required'),
  zipCode: yup.string().required('Zip code is required').matches(/^[0-9]{5}$/, 'Zip code must be 5 digits'),
  yearsOfExperience: yup.number().required('Years of experience is required').min(0, 'Years of experience cannot be negative'),
  specializations: yup.array().min(1, 'At least one specialization is required'),
  description: yup.string().required('Description is required').min(50, 'Description must be at least 50 characters').max(500, 'Description cannot exceed 500 characters'),
  workingDays: yup.array().min(1, 'At least one working day is required'),
  workingHoursStart: yup.string().required('Working hours start time is required'),
  workingHoursEnd: yup.string().required('Working hours end time is required'),
  pickupService: yup.boolean()
})

// Validation Schema for Bank Details (Updated for Turkey)
const bankSchema = yup.object().shape({
  accountTitle: yup.string().required('Account title is required').min(3, 'Account title must be at least 3 characters'),
  accountNumber: yup.string().required('Account number is required').matches(/^[0-9]{16}$/, 'Account number must be exactly 16 digits'),
  bankName: yup.string().required('Bank name is required'),
  branchName: yup.string().required('Branch name is required'),
  iban: yup.string().required('IBAN is required').matches(/^TR[0-9]{24}$/, 'Invalid IBAN format (e.g., TR330006100000000012345678)')
})

function EditRepairmanProfile() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState(null)
  const { token } = useSelector(state => state.auth)

  // Get active tab from URL params, default to 'profile'
  const activeTab = searchParams.get('tab') || 'profile'

  // Profile Form
  const { control: profileControl, handleSubmit: handleProfileSubmit, setValue: setProfileValue, watch, formState: { errors: profileErrors, isSubmitting: isProfileSubmitting } } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: '',
      fatherName: '',
      mobileNumber: '',
      whatsappNumber: '',
      emailAddress: '',
      emergencyContactPerson: '',
      emergencyContactNumber: '',
      shopName: '',
      fullAddress: '',
      city: '',
      district: '',
      zipCode: '',
      yearsOfExperience: 0,
      specializations: [],
      description: '',
      workingDays: [],
      workingHoursStart: '',
      workingHoursEnd: '',
      pickupService: false
    }
  })

  // Bank Details Form
  const { control: bankControl, handleSubmit: handleBankSubmit, setValue: setBankValue, formState: { errors: bankErrors, isSubmitting: isBankSubmitting } } = useForm({
    resolver: yupResolver(bankSchema),
    defaultValues: {
      accountTitle: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      iban: ''
    }
  })

  const workingDaysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const specializationOptions = [
    'Mobile Phone Repair',
    'Laptop Repair',
    'Tablet Repair',
    'Desktop Repair',
    'Gaming Console Repair'
  ]

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const { data } = await axiosInstance.get(`/repairman/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setData(data.data)

      // Populate profile form data
      const profile = data.data.user.repairmanProfile
      setProfileValue('fullName', profile.fullName || '')
      setProfileValue('fatherName', profile.fatherName || '')
      setProfileValue('mobileNumber', profile.mobileNumber || '')
      setProfileValue('whatsappNumber', profile.whatsappNumber || '')
      setProfileValue('emailAddress', profile.emailAddress || '')
      setProfileValue('emergencyContactPerson', profile.emergencyContactPerson || '')
      setProfileValue('emergencyContactNumber', profile.emergencyContactNumber || '')
      setProfileValue('shopName', profile.shopName || '')
      setProfileValue('fullAddress', profile.fullAddress || '')
      setProfileValue('city', profile.city || '')
      setProfileValue('district', profile.district || '')
      setProfileValue('zipCode', profile.zipCode || '')
      setProfileValue('yearsOfExperience', profile.yearsOfExperience || 0)
      setProfileValue('specializations', profile.specializations || [])
      setProfileValue('description', profile.description || '')
      setProfileValue('workingDays', profile.workingDays || [])
      setProfileValue('workingHoursStart', profile.workingHours?.start || '')
      setProfileValue('workingHoursEnd', profile.workingHours?.end || '')
      setProfileValue('pickupService', profile.pickupService || false)

      // Populate bank details form data
      const bankDetails = profile.bankDetails
      setBankValue('accountTitle', bankDetails?.accountTitle || '')
      setBankValue('accountNumber', bankDetails?.accountNumber || '')
      setBankValue('bankName', bankDetails?.bankName || '')
      setBankValue('branchName', bankDetails?.branchName || '')
      setBankValue('iban', bankDetails?.iban || '')
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onProfileSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        workingHours: {
          start: formData.workingHoursStart,
          end: formData.workingHoursEnd
        }
      }
      delete payload.workingHoursStart
      delete payload.workingHoursEnd

      await axiosInstance.put('/repairman/profile', payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      toast.success('Profile updated successfully!')
      fetchData()
    } catch (error) {
      handleError(error)
    }
  }

  const onBankSubmit = async (formData) => {
    try {
      await axiosInstance.put('/repairman/profile/bank-details', {
        bankDetails: formData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      toast.success('Bank details updated successfully!')
      fetchData()
    } catch (error) {
      handleError(error)
    }
  }

  const handleTabChange = (tab) => {
    router.push(`?tab=${tab}`)
  }

  const isBankDetailsComplete = data?.user?.repairmanProfile?.bankDetails?.iban &&
    data?.user?.repairmanProfile?.bankDetails?.accountNumber

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('profile')}
              className={`${activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Information
              </div>
            </button>
            <button
              onClick={() => handleTabChange('bank')}
              className={`${activeTab === 'bank'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 relative`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Bank Details
                {!isBankDetailsComplete && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Incomplete
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6 pb-12">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="fullName"
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter full name"
                        />
                      )}
                    />
                    {profileErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.fullName.message}</p>
                    )}
                  </div>

                  {/* Father Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="fatherName"
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter father name"
                        />
                      )}
                    />
                    {profileErrors.fatherName && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.fatherName.message}</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="mobileNumber"
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="03001234567"
                        />
                      )}
                    />
                    {profileErrors.mobileNumber && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.mobileNumber.message}</p>
                    )}
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="whatsappNumber"
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="03001234567"
                        />
                      )}
                    />
                    {profileErrors.whatsappNumber && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.whatsappNumber.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="emailAddress"
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="example@email.com"
                        />
                      )}
                    />
                    {profileErrors.emailAddress && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.emailAddress.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Emergency Contact</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Person <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="emergencyContactPerson"
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Contact person name"
                        />
                      )}
                    />
                    {profileErrors.emergencyContactPerson && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.emergencyContactPerson.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Number <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="emergencyContactNumber"
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="03001234567"
                        />
                      )}
                    />
                    {profileErrors.emergencyContactNumber && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.emergencyContactNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shop Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Shop Information</h2>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shop Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="shopName"
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter shop name"
                        />
                      )}
                    />
                    {profileErrors.shopName && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.shopName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="fullAddress"
                      control={profileControl}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter complete shop address"
                        />
                      )}
                    />
                    {profileErrors.fullAddress && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.fullAddress.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="city"
                        control={profileControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="City"
                          />
                        )}
                      />
                      {profileErrors.city && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="district"
                        control={profileControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="District"
                          />
                        )}
                      />
                      {profileErrors.district && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.district.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="zipCode"
                        control={profileControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="71000"
                          />
                        )}
                      />
                      {profileErrors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Professional Information</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="yearsOfExperience"
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="0"
                        />
                      )}
                    />
                    {profileErrors.yearsOfExperience && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.yearsOfExperience.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specializations <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="specializations"
                      control={profileControl}
                      render={({ field }) => (
                        <div className="space-y-2">
                          {specializationOptions.map((spec) => (
                            <label key={spec} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
                              <input
                                type="checkbox"
                                value={spec}
                                checked={field.value.includes(spec)}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...field.value, spec]
                                    : field.value.filter((s) => s !== spec)
                                  field.onChange(newValue)
                                }}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-sm text-gray-700">{spec}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    />
                    {profileErrors.specializations && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.specializations.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="description"
                      control={profileControl}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Describe your services and expertise (50-500 characters)"
                        />
                      )}
                    />
                    {profileErrors.description && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.description.message}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {watch('description')?.length || 0}/500 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Working Schedule */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Working Schedule</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Days <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="workingDays"
                      control={profileControl}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {workingDaysOptions.map((day) => (
                            <label key={day} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
                              <input
                                type="checkbox"
                                value={day}
                                checked={field.value.includes(day)}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...field.value, day]
                                    : field.value.filter((d) => d !== day)
                                  field.onChange(newValue)
                                }}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{day}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    />
                    {profileErrors.workingDays && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.workingDays.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Working Hours Start <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="workingHoursStart"
                        control={profileControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        )}
                      />
                      {profileErrors.workingHoursStart && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.workingHoursStart.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Working Hours End <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="workingHoursEnd"
                        control={profileControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        )}
                      />
                      {profileErrors.workingHoursEnd && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.workingHoursEnd.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                      <Controller
                        name="pickupService"
                        control={profileControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="checkbox"
                            checked={field.value}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        )}
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Offer Pickup Service</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Profile Submit Button */}
              <div className="flex justify-end space-x-4 bg-white p-6 rounded-lg shadow">
                <button
                  type="button"
                  onClick={() => fetchData()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Reset Changes
                </button>
                <button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isProfileSubmitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-6">
              {/* Bank Details Warning */}
              {!isBankDetailsComplete && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Bank details incomplete</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please complete your bank information to receive payments for your services.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BANK DETAILS FORM */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">Bank Account Information</h2>

                <form onSubmit={handleBankSubmit(onBankSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Title <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="accountTitle"
                        control={bankControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter account holder name"
                          />
                        )}
                      />
                      {bankErrors.accountTitle && (
                        <p className="text-red-500 text-sm mt-1">{bankErrors.accountTitle.message}</p>
                      )}
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="bankName"
                        control={bankControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="e.g., Ziraat Bankası"
                          />
                        )}
                      />
                      {bankErrors.bankName && (
                        <p className="text-red-500 text-sm mt-1">{bankErrors.bankName.message}</p>
                      )}
                    </div>

                    {/* Branch Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Name <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="branchName"
                        control={bankControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="e.g., Kızılay Branch"
                          />
                        )}
                      />
                      {bankErrors.branchName && (
                        <p className="text-red-500 text-sm mt-1">{bankErrors.branchName.message}</p>
                      )}
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="accountNumber"
                        control={bankControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="1234567890123456"
                          />
                        )}
                      />
                      {bankErrors.accountNumber && (
                        <p className="text-red-500 text-sm mt-1">{bankErrors.accountNumber.message}</p>
                      )}
                    </div>

                    {/* IBAN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IBAN <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="iban"
                        control={bankControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="TR330006100000000012345678"
                            maxLength={26}
                          />
                        )}
                      />
                      {bankErrors.iban && (
                        <p className="text-red-500 text-sm mt-1">{bankErrors.iban.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Format: TR followed by 24 digits
                      </p>
                    </div>
                  </div>

                  {/* Bank Details Submit Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      type="submit"
                      disabled={isBankSubmitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isBankSubmitting ? 'Updating...' : 'Update Bank Details'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditRepairmanProfile