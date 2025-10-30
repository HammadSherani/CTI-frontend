'use client'

import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

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

// Validation Schema for Bank Details
const bankSchema = yup.object().shape({
  accountNumber: yup.string().required('Account number is required').min(10, 'Account number must be at least 10 characters'),
  bankName: yup.string().required('Bank name is required'),
  branchName: yup.string().required('Branch name is required'),
  iban: yup.string().required('IBAN is required').matches(/^PK[0-9]{2}[A-Z]{4}[0-9]{16}$/, 'Invalid IBAN format (e.g., PK36ABCD0000001234567890)')
})

function EditRepairmanProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState(null)
  const { token } = useSelector(state => state.auth)

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
      
      alert('Profile updated successfully!')
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
      
      alert('Bank details updated successfully!')
      fetchData()
    } catch (error) {
      handleError(error)
    }
  }

  const isBankDetailsComplete = data?.user?.repairmanProfile?.bankDetails?.iban && 
                                 data?.user?.repairmanProfile?.bankDetails?.accountNumber

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Repairman Profile</h1>

      {/* Bank Details Warning */}
      {!isBankDetailsComplete && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your bank details are not complete. Please complete your bank information to receive payments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BANK DETAILS SECTION */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
        
        <form onSubmit={handleBankSubmit(onBankSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Meezan Bank"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Saddar Branch"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter account number"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PK36ABCD0000001234567890"
                  />
                )}
              />
              {bankErrors.iban && (
                <p className="text-red-500 text-sm mt-1">{bankErrors.iban.message}</p>
              )}
            </div>
          </div>

          {/* Bank Details Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isBankSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {isBankSubmitting ? 'Updating...' : 'Update Bank Details'}
            </button>
          </div>
        </form>
      </div>

      {/* PROFILE INFORMATION SECTION */}
      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <h2 className="text-xl font-semibold mb-4">Shop Information</h2>
          
          <div className="grid grid-cols-1 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter complete shop address"
                  />
                )}
              />
              {profileErrors.fullAddress && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.fullAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
          
          <div className="space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label key={spec} className="flex items-center">
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{spec}</span>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <h2 className="text-xl font-semibold mb-4">Working Schedule</h2>
          
          <div className="space-y-4">
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
                      <label key={day} className="flex items-center">
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
                {profileErrors.workingHoursEnd && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.workingHoursEnd.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <Controller
                  name="pickupService"
                  control={profileControl}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="checkbox"
                      checked={field.value}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  )}
                />
                <span className="ml-2 text-sm text-gray-700">Offer Pickup Service</span>
              </label>
            </div>
          </div>
        </div>

        {/* Profile Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => fetchData()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isProfileSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isProfileSubmitting ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditRepairmanProfile 