"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

function ViewService() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.id;
  const { token } = useSelector((state) => state.auth);

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/repairman/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setService(data.data);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Failed to load service details');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'heroicons:check-circle';
      case 'pending': return 'heroicons:clock';
      case 'rejected': return 'heroicons:x-circle';
      default: return 'heroicons:information-circle';
    }
  };

  const getServiceTypeIcon = (type) => {
    switch (type) {
      case 'home': return 'heroicons:home';
      case 'shop': return 'heroicons:building-storefront';
      case 'pickup': return 'heroicons:truck';
      default: return 'heroicons:wrench-screwdriver';
    }
  };

  const getServiceTypeLabel = (type) => {
    switch (type) {
      case 'home': return 'Home Service';
      case 'shop': return 'Shop Service';
      case 'pickup': return 'Pickup & Delivery';
      default: return type;
    }
  };

  const formatCurrency = (amount, currency = 'TRY') => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Service</h2>
          <p className="text-gray-600 mb-4">{error || 'Service not found'}</p>
          <button
            onClick={() => router.push('/repair-man/service-catalog')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Icon icon="heroicons:arrow-left" className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Service Details</h1>
                <p className="text-gray-600 text-lg">View complete information about this service</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href={`/repair-man/service-catalog/${serviceId}/edit`}>
                <button 
                  disabled={service.status === 'approved'}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon="heroicons:pencil" className="w-5 h-5" />
                  Edit Service
                </button>
              </Link>
              <button 
                disabled={service.status === 'approved'}
                className="border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon icon="heroicons:trash" className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`p-6 rounded-xl border-2 mb-6 ${getStatusColor(service.status)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Icon icon={getStatusIcon(service.status)} className="w-8 h-8 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Service Status: {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </h3>
                {service.status === 'pending' && (
                  <p className="text-sm">Your service is pending admin approval. You will be notified once it's reviewed.</p>
                )}
                {service.status === 'approved' && (
                  <p className="text-sm">This service has been approved and is visible to customers.</p>
                )}
                {service.status === 'rejected' && service.rejectionReason && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Rejection Reason:</p>
                    <p className="text-sm">{service.rejectionReason}</p>
                    <p className="text-sm mt-2">You can edit and resubmit this service for approval.</p>
                  </div>
                )}
              </div>
            </div>
            {!service.isActive && (
              <span className="px-3 py-1 bg-gray-500 text-white rounded-full text-sm font-medium">
                Inactive
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Icon icon="heroicons:information-circle" className="w-6 h-6 mr-2 text-primary-600" />
                Service Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Service Title</label>
                  <p className="text-lg font-semibold text-gray-900">{service.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Description</label>
                  <p className="text-gray-700 leading-relaxed">{service.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Service Type</label>
                    <div className="flex items-center gap-2">
                      <Icon icon={getServiceTypeIcon(service.serviceType)} className="w-5 h-5 text-primary-600" />
                      <p className="text-gray-900 font-medium">{getServiceTypeLabel(service.serviceType)}</p>
                    </div>
                  </div>

                  {service.city && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">City</label>
                      <div className="flex items-center gap-2">
                        <Icon icon="heroicons:map-pin" className="w-5 h-5 text-primary-600" />
                        <p className="text-gray-900 font-medium">{service.city}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Icon icon="heroicons:device-phone-mobile" className="w-6 h-6 mr-2 text-primary-600" />
                Device Information
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-500 block mb-2">Brand</label>
                  <p className="text-xl font-bold text-gray-900">
                    {service.deviceInfo?.brandId?.name || service.deviceInfo?.brandId || 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-500 block mb-2">Model</label>
                  <p className="text-xl font-bold text-gray-900">
                    {service.deviceInfo?.modelId?.name || service.deviceInfo?.modelId || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Icon icon="heroicons:currency-dollar" className="w-6 h-6 mr-2 text-primary-600" />
                Pricing Details
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <label className="text-sm font-medium text-blue-700 block mb-1">Base Price</label>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(service.pricing?.basePrice, service.pricing?.currency)}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <label className="text-sm font-medium text-purple-700 block mb-1">Parts Price</label>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(service.pricing?.partsPrice, service.pricing?.currency)}
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <label className="text-sm font-medium text-orange-700 block mb-1">Service Charges</label>
                    <p className="text-2xl font-bold text-orange-900">
                      {formatCurrency(service.pricing?.serviceCharges, service.pricing?.currency)}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-green-700 block mb-1">Total Amount</label>
                      <p className="text-3xl font-bold text-green-900">
                        {formatCurrency(service.pricing?.total, service.pricing?.currency)}
                      </p>
                    </div>
                    <Icon icon="heroicons:check-badge" className="w-12 h-12 text-green-600" />
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Currency: {service.pricing?.currency || 'TRY'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <Icon icon="heroicons:calculator" className="w-4 h-4 inline mr-1" />
                    Calculation: Base ({formatCurrency(service.pricing?.basePrice, service.pricing?.currency)}) + 
                    Parts ({formatCurrency(service.pricing?.partsPrice, service.pricing?.currency)}) + 
                    Service ({formatCurrency(service.pricing?.serviceCharges, service.pricing?.currency)}) = 
                    <span className="font-bold"> {formatCurrency(service.pricing?.total, service.pricing?.currency)}</span>
                  </p>
                </div>
              </div>
            </div> */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Info</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Service ID</span>
                  <span className="text-sm font-mono text-gray-900">{service._id?.slice(-8)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {service.isActive ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Total Price</span>
                  <span className="text-sm font-bold text-green-700">
                    {formatCurrency(service.pricing?.total, service.pricing?.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="heroicons:calendar" className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-600">Created</label>
                  </div>
                  <p className="text-sm text-gray-900 ml-6">{formatDate(service.createdAt)}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="heroicons:clock" className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  </div>
                  <p className="text-sm text-gray-900 ml-6">{formatDate(service.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              
              
              <div className="flex items-center flex-col gap-3 w-full">
                <Link href={`/repair-man/service-catalog-catalog/${serviceId}/edit`} className='w-full'>
                  <button 
                    disabled={service.status === 'approved'}
                    className="w-full bg-primary-600 w-full text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="heroicons:pencil" className="w-5 h-5" />
                    Edit Service
                  </button>
                </Link>

                <Link href="/repair-man/service-catalog" className='w-full'>
                  <button className="w-full bg-white text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border border-gray-300">
                    <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
                    Back to Services
                  </button>
                </Link>

                <button 
                  disabled={service.status === 'approved'}
                  className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon="heroicons:trash" className="w-5 h-5" />
                  Delete Service
                </button>
              </div>

              {service.status === 'approved' && (
                <p className="text-xs text-gray-600 mt-4 text-center">
                  Approved services cannot be edited or deleted
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewService;