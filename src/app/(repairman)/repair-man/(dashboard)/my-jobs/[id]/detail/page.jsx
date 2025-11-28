"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

function JobDetailPage() {
  const [job, setJob] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { token } = useSelector((state) => state.auth);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/repairman/my-booking/${id}/detail`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      if (data.success) {
        setJob(data.data || {});
        setError(null);
      } else {
        setError('Failed to load job details');
      }
    } catch (error) {
      setError('Failed to load job details. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const formatCurrency = (amount, currency = 'TRY') => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'repairman_notified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'parts_needed': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'quality_check': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-green-200 text-green-900 border-green-300';
      case 'closed': return 'bg-gray-600 text-white border-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchJobDetails}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 🔥 Extract data with proper fallbacks
  const jobInfo = job.jobInfo || {};
  const quotationInfo = job.quotationInfo || {};
  const customer = job.customer || {};
  const bookingDetails = job.bookingDetails || {};
  const deviceInfo = jobInfo.deviceInfo || quotationInfo.deviceInfo || {};
  const actions = job.actions || {};
  const timeline = job.timeline || [];
  const tracking = job.tracking || {};
  const communication = job.communication || {};
  
  // 🔥 Determine booking source
  const isQuotationBased = job.type === 'quotation_booking' || job.bookingSource === 'direct_message';
  
  // 🔥 Check if jobInfo exists (has complete data)
  const hasJobInfo = Object.keys(jobInfo).length > 0;
  
  // 🔥 Get services from appropriate source
  const services = isQuotationBased 
    ? (quotationInfo.deviceInfo?.repairServices || [])
    : (jobInfo.services || []);

  // 🔥 If no services found and no jobInfo, use a default
  const displayServices = services.length > 0 
    ? services 
    : (hasJobInfo ? ['Repair Service'] : ['Direct Message Booking']);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-2" />
              Back to Jobs
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
            <p className="text-gray-600">View complete job information</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full border ${getStatusColor(tracking.currentLocation)}`}>
              <span className="font-semibold">
                {tracking.currentLocation?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            {/* 🔥 Source Badge - only show if jobInfo exists (meaning it's a job posting) */}
            {hasJobInfo && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isQuotationBased 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {isQuotationBased ? 'Direct Message' : 'Job Posting'}
              </span>
            )}
          </div>
        </div>

        {/* 🔥 Status Info Banner */}
        {(tracking.currentLocation === 'completed' || tracking.currentLocation === 'delivered') && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center">
              <Icon icon="heroicons:check-circle" className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {tracking.currentLocation === 'delivered' ? 'Job Completed & Delivered' : 'Job Completed'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {tracking.currentLocation === 'delivered' 
                    ? 'This job has been successfully completed and delivered to the customer.'
                    : 'This job has been completed successfully.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 Closed Job Banner */}
        {tracking.currentLocation === 'closed' && (
          <div className="mb-6 bg-gray-100 border border-gray-300 rounded-xl p-6">
            <div className="flex items-center">
              <Icon icon="heroicons:lock-closed" className="w-8 h-8 text-gray-600 mr-4" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Job Closed</h3>
                <p className="text-gray-600 text-sm">This job has been closed and archived.</p>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 Cancelled Job Banner */}
        {tracking.currentLocation === 'cancelled' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <Icon icon="heroicons:x-circle" className="w-8 h-8 text-red-600 mr-4" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Job Cancelled</h3>
                <p className="text-gray-600 text-sm">This job has been cancelled.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Overview</h2>

              <div className="flex items-start space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-700">
                    {customer.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {displayServices?.join(', ') || 'Repair Service'}
                  </h3>
                  <p className="text-gray-600 mb-2">{customer.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {/* 🔥 Location - only if jobInfo exists and has location */}
                    {hasJobInfo && jobInfo.location?.city && (
                      <span className="flex items-center">
                        <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
                        {jobInfo.location.city}
                      </span>
                    )}
                    
                    {/* 🔥 Urgency - only if jobInfo exists and has urgency */}
                    {hasJobInfo && jobInfo.urgency && (
                      <span className="flex items-center">
                        <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
                        {jobInfo.urgency} priority
                      </span>
                    )}
                    
                    {/* 🔥 Service Type - for all */}
                    <span className="flex items-center capitalize">
                      <Icon icon="heroicons:truck" className="w-4 h-4 mr-1" />
                      {bookingDetails.serviceType || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(bookingDetails.pricing?.totalAmount, bookingDetails.pricing?.currency)}
                  </p>
                  <p className="text-sm text-gray-500">Total Amount</p>
                </div>
              </div>

              {/* 🔥 Description - show only if exists */}
              {(jobInfo.description || quotationInfo.serviceDetails?.description) && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">
                    {jobInfo.description || quotationInfo.serviceDetails?.description}
                  </p>
                </div>
              )}

              {/* Device Information - Show only if device info exists */}
              {(deviceInfo.brand || deviceInfo.brandName || deviceInfo.model || deviceInfo.modelName) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Device Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Brand:</span>
                        <span className="font-medium">{deviceInfo.brand || deviceInfo.brandName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Model:</span>
                        <span className="font-medium">{deviceInfo.model || deviceInfo.modelName || 'N/A'}</span>
                      </div>
                      
                      {/* 🔥 Color - only if exists */}
                      {deviceInfo.color && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Color:</span>
                          <span className="font-medium capitalize">{deviceInfo.color}</span>
                        </div>
                      )}
                      
                      {/* 🔥 Warranty Status - only if exists */}
                      {deviceInfo.warrantyStatus && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Warranty:</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            deviceInfo.warrantyStatus === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {deviceInfo.warrantyStatus}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Service Type:</span>
                        <span className="font-medium capitalize">{bookingDetails.serviceType || 'N/A'}</span>
                      </div>
                      
                      {/* 🔥 Scheduled Date - may not exist */}
                      {bookingDetails.scheduledDate ? (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scheduled:</span>
                          <span className="font-medium">
                            {new Date(bookingDetails.scheduledDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scheduled:</span>
                          <span className="font-medium text-gray-400">To be scheduled</span>
                        </div>
                      )}
                      
                      {/* 🔥 Base Price - may not exist */}
                      {bookingDetails.pricing?.basePrice !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Base Price:</span>
                          <span className="font-medium">
                            {formatCurrency(bookingDetails.pricing.basePrice, bookingDetails.pricing.currency)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Parts Price:</span>
                        <span className="font-medium">
                          {formatCurrency(bookingDetails.pricing?.partsPrice || 0, bookingDetails.pricing?.currency)}
                        </span>
                      </div>
                      
                      {/* 🔥 Service Charge */}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Service Charge:</span>
                        <span className="font-medium">
                          {formatCurrency(bookingDetails.pricing?.serviceCharge || 0, bookingDetails.pricing?.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 🔥 If no device info, show only booking details
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service Type:</span>
                      <span className="font-medium capitalize">{bookingDetails.serviceType || 'N/A'}</span>
                    </div>
                    
                    {bookingDetails.scheduledDate ? (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="font-medium">
                          {new Date(bookingDetails.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="font-medium text-gray-400">To be scheduled</span>
                      </div>
                    )}
                    
                    {bookingDetails.pricing?.basePrice !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Base Price:</span>
                        <span className="font-medium">
                          {formatCurrency(bookingDetails.pricing.basePrice, bookingDetails.pricing.currency)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Parts Price:</span>
                      <span className="font-medium">
                        {formatCurrency(bookingDetails.pricing?.partsPrice || 0, bookingDetails.pricing?.currency)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service Charge:</span>
                      <span className="font-medium">
                        {formatCurrency(bookingDetails.pricing?.serviceCharge || 0, bookingDetails.pricing?.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 🔥 Quotation-specific info */}
              {isQuotationBased && quotationInfo && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Quotation Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {quotationInfo.partsQuality && (
                      <div>
                        <span className="text-gray-500">Parts Quality:</span>
                        <p className="font-medium capitalize">{quotationInfo.partsQuality.replace('-', ' ')}</p>
                      </div>
                    )}
                    {quotationInfo.serviceDetails?.estimatedDuration && (
                      <div>
                        <span className="text-gray-500">Estimated Duration:</span>
                        <p className="font-medium">{quotationInfo.serviceDetails.estimatedDuration} days</p>
                      </div>
                    )}
                    {quotationInfo.repairmanNotes && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Notes:</span>
                        <p className="font-medium">{quotationInfo.repairmanNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Address - only if jobInfo has location */}
              {hasJobInfo && jobInfo.location?.address && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                  <p className="text-gray-600">{jobInfo.location.address}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>

                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon icon="heroicons:clock" className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                  <span className="text-base font-semibold text-primary-700">
                    {customer.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{customer.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{customer.email || 'No email'}</p>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Icon icon="heroicons:phone" className="w-4 h-4 mr-2" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>

            {/* Payment Status */}
            {job.payment && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      job.payment.status === 'held' ? 'bg-orange-100 text-orange-700' :
                      job.payment.status === 'released' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {job.payment.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Warranty */}
            {bookingDetails.warranty && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{bookingDetails.warranty.duration} days</span>
                  </div>
                  {bookingDetails.warranty.description && (
                    <div>
                      <span className="text-gray-500 block mb-1">Description:</span>
                      <p className="text-gray-900">{bookingDetails.warranty.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tracking Info */}
            {tracking.estimatedCompletion && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Status:</span>
                    <span className="font-medium capitalize">
                      {tracking.currentLocation?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Est. Completion:</span>
                    <span className="font-medium">
                      {new Date(tracking.estimatedCompletion).toLocaleString()}
                    </span>
                  </div>
                  {tracking.progress !== undefined && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{tracking.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${tracking.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;