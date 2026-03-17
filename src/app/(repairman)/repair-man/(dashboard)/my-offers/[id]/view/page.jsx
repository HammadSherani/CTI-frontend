"use client"
import axiosInstance from '@/config/axiosInstance';
import { useMultiLoading } from '@/hooks/useMultiloading';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

function OfferDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const {multiloading, start, stop } = useMultiLoading();

  const offerDetailsFetch = async () => {
    start('fetchOffer');
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/repairman/offers/my-offers/${id}`,
         {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(data, 'offer details');
      setOfferData(data.data);
      stop('fetchOffer');
    } catch (error) {
      stop('fetchOffer');
      console.error('Error fetching offer details:', error);
      toast.error('Failed to fetch offer details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    setActionLoading(true);
    try {
      start("acceptOffer")
      const { data } = await axiosInstance.patch(
        `/repairman/offers/my-offers/${id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success('Offer accepted successfully!');
      offerDetailsFetch();
    } catch (error) {
      stop("acceptOffer")
      console.error('Error accepting offer:', error);
      toast.error(error.response?.data?.message || 'Failed to accept offer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOffer = async () => {
    setActionLoading(true);
    try {
      start("rejectOffer")
      const { data } = await axiosInstance.patch(
        `/repairman/offers/my-offers/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success('Offer rejected');
      offerDetailsFetch();
    } catch (error) {
      stop("rejectOffer")
      console.error('Error rejecting offer:', error);
      toast.error(error.response?.data?.message || 'Failed to reject offer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCounterOffer = () => {
    toast.info('Redirecting to counter offer page...');
    // router.push(`/make-counter-offer/${id}`);
  };

  useEffect(() => {
    if (id && token) {
      offerDetailsFetch();
    }
  }, [id, token]);

  const handleChatWithCustomer = () => {
    toast.info('Redirecting to chat with customer...');
  // router.push(`/chat?userId=${job.customerId?._id}&jobId=${job._id}`);
};

const handleStartJob = () => {
  // API call to start the job
  router.push(`/repair-man/my-jobs/${job._id}/start`);
};

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: 'mdi:clock-outline',
        label: 'Pending' 
      },
      accepted: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: 'mdi:check-circle-outline',
        label: 'Accepted' 
      },
      rejected: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: 'mdi:close-circle-outline',
        label: 'Rejected' 
      },
      expired: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: 'mdi:clock-alert-outline',
        label: 'Expired' 
      },
      confirmed: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: 'mdi:check-circle-outline',
        label: 'Confirmed' 
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon icon={config.icon} className="mr-2 text-lg" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg p-6 h-64"></div>
                <div className="bg-white rounded-lg p-6 h-96"></div>
              </div>
              <div className="bg-white rounded-lg p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!offerData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <Icon icon="mdi:alert-circle-outline" className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Offer not found</h2>
            <p className="text-gray-600 mt-2">The offer you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center"
            >
              <Icon icon="mdi:arrow-left" className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { job, offerDetails } = offerData;
  const offerStatus = offerDetails?.status || 'pending';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <Icon icon="mdi:arrow-left" className="text-xl mr-2" />
            Back
          </button>
          {console.log(offerStatus, 'offer status')}
          <StatusBadge status={offerStatus} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Icon icon="mdi:file-document-outline" className="text-3xl text-primary-600 mr-3" />
          Offer Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Icon icon="mdi:briefcase-outline" className="text-primary-600 text-xl mr-2" />
                  Job Information
                </h2>
              </div>
              
              <div className="p-6">
                {/* Customer Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Icon icon="mdi:account-outline" className="mr-1 text-gray-400" />
                    Customer Details
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Icon icon="mdi:account" className="text-primary-600 text-2xl" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{job.customerId?.name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Icon icon="mdi:email-outline" className="mr-1 text-gray-400 text-sm" />
                          {job.customerId?.email}
                        </span>
                        <span className="flex items-center">
                          <Icon icon="mdi:phone-outline" className="mr-1 text-gray-400 text-sm" />
                          {job.customerId?.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                      <Icon icon="mdi:cellphone" className="mr-1 text-gray-400" />
                      Device Information
                    </h3>
                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm flex items-center">
                        <Icon icon="mdi:branding-watermark" className="text-gray-400 mr-2" />
                        <span className="text-gray-600">Brand:</span>{' '}
                        <span className="font-medium ml-1">{job.deviceInfo?.brandName || job.deviceInfo?.brand}</span>
                      </p>
                      <p className="text-sm flex items-center">
                        <Icon icon="mdi:devices" className="text-gray-400 mr-2" />
                        <span className="text-gray-600">Model:</span>{' '}
                        <span className="font-medium ml-1">{job.deviceInfo?.modelName || job.deviceInfo?.model}</span>
                      </p>
                      <p className="text-sm flex items-center">
                        <Icon icon="mdi:palette-outline" className="text-gray-400 mr-2" />
                        <span className="text-gray-600">Color:</span>{' '}
                        <span className="font-medium ml-1 capitalize">{job.deviceInfo?.color}</span>
                      </p>
                      <p className="text-sm flex items-center">
                        <Icon icon="mdi:shield-check-outline" className="text-gray-400 mr-2" />
                        <span className="text-gray-600">Warranty:</span>{' '}
                        <span className="font-medium ml-1 capitalize">{job.deviceInfo?.warrantyStatus}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                      <Icon icon="mdi:cash-multiple" className="mr-1 text-gray-400" />
                      Budget & Urgency
                    </h3>
                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm flex items-center">
                        <Icon icon="mdi:cash" className="text-green-500 mr-2" />
                        <span className="text-gray-600">Budget Range:</span>{' '}
                        <span className="font-medium text-green-600 ml-1">
                          {job.budget?.currency} {job.budget?.min} - {job.budget?.max}
                        </span>
                      </p>
                      <p className="text-sm flex items-center">
                        <Icon icon="mdi:alert-circle" className={`mr-2 ${
                          job.urgency === 'high' ? 'text-red-500' : 
                          job.urgency === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                        <span className="text-gray-600">Urgency:</span>{' '}
                        <span className={`font-medium capitalize ml-1 ${
                          job.urgency === 'high' ? 'text-red-600' : 
                          job.urgency === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {job.urgency}
                        </span>
                      </p>
                      <p className="text-sm flex items-center">
                        <Icon icon="mdi:calendar-clock" className="text-gray-400 mr-2" />
                        <span className="text-gray-600">Expires:</span>{' '}
                        <span className="font-medium ml-1">
                          {new Date(job.expiresAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Icon icon="mdi:map-marker-outline" className="mr-1 text-gray-400" />
                    Location
                  </h3>
                  <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-lg">
                    <Icon icon="mdi:map-marker" className="text-blue-500 text-xl mt-1" />
                    <div>
                      <p className="text-sm text-gray-900">{job.location?.address}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.location?.city?.name}, {job.location?.state?.name}, {job.location?.country?.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">ZIP:</span> {job.location?.zipCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {job.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                      <Icon icon="mdi:file-document-outline" className="mr-1 text-gray-400" />
                      Problem Description
                    </h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {job.description}
                    </p>
                  </div>
                )}

                {/* Services Required */}
                {job.services && job.services.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                      <Icon icon="mdi:wrench-outline" className="mr-1 text-gray-400" />
                      Services Required
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.services.map((service) => (
                        <span key={service._id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                          <Icon icon="mdi:wrench" className="mr-1 text-sm" />
                          {service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Offer Details Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Icon icon="mdi:tag-outline" className="text-primary-600 text-xl mr-2" />
                  Your Offer Details
                </h2>
              </div>

              <div className="p-6">
                {/* Pricing */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Icon icon="mdi:cash-multiple" className="mr-1 text-gray-400" />
                    Pricing Breakdown
                  </h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Icon icon="mdi:hammer" className="mr-2 text-gray-400" />
                        Base Price:
                      </span>
                      <span className="font-medium">{offerDetails.pricing?.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Icon icon="mdi:package-variant" className="mr-2 text-gray-400" />
                        Parts Estimate:
                      </span>
                      <span className="font-medium">{offerDetails.pricing?.partsEstimate}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                      <span className="flex items-center">
                        <Icon icon="mdi:calculator" className="mr-2 text-primary-600" />
                        Total Price:
                      </span>
                      <span className="text-primary-600 text-lg">{offerDetails.pricing?.totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Required Parts */}
                {offerDetails.requiredParts && offerDetails.requiredParts.length > 0 && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                      <Icon icon="mdi:package-variant-closed" className="mr-1 text-gray-400" />
                      Required Parts
                    </h3>
                    <div className="space-y-3">
                      {offerDetails.requiredParts.map((part) => (
                        <div key={part._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <Icon icon="mdi:chip" className="text-blue-500 mr-3 text-xl" />
                            <div>
                              <p className="font-medium text-sm">{part.name}</p>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Icon icon="mdi:shield-check" className="mr-1 text-green-500" />
                                Warranty: {part.warranty}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium text-primary-600 bg-white px-3 py-1 rounded-full border border-primary-100">
                            ₺{part.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Options */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Icon icon="mdi:tools" className="mr-1 text-gray-400" />
                    Service Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offerDetails.serviceOptions?.pickupAvailable && (
                      <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg">
                        <Icon icon="mdi:truck-delivery-outline" className="text-green-600 text-xl" />
                        <span className="text-sm text-green-700">
                          Pickup Available (+₺{offerDetails.serviceOptions.pickupCharge})
                        </span>
                      </div>
                    )}
                    {offerDetails.serviceOptions?.homeService && (
                      <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
                        <Icon icon="mdi:home-outline" className="text-blue-600 text-xl" />
                        <span className="text-sm text-blue-700">
                          Home Service (+₺{offerDetails.serviceOptions.homeServiceCharge})
                        </span>
                      </div>
                    )}
                  </div>
                  {offerDetails.serviceOptions?.dropOffLocation && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 flex items-start">
                        <Icon icon="mdi:store-outline" className="text-gray-500 mr-2 mt-1" />
                        <span>
                          <span className="font-medium">Drop-off Location:</span> {offerDetails.serviceOptions.dropOffLocation}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Warranty */}
                {offerDetails.warranty && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                      <Icon icon="mdi:shield-check" className="mr-1 text-gray-400" />
                      Warranty
                    </h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Icon icon="mdi:shield-star-outline" className="text-green-600 text-2xl mr-3" />
                        <div>
                          <p className="font-medium text-green-800">
                            {offerDetails.warranty.duration} Months Warranty
                          </p>
                          {offerDetails.warranty.description && (
                            <p className="text-sm text-green-700 mt-1">{offerDetails.warranty.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Estimated Time */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Icon icon="mdi:clock-outline" className="mr-1 text-gray-400" />
                    Estimated Time
                  </h3>
                  <div className="flex items-center bg-purple-50 p-4 rounded-lg">
                    <Icon icon="mdi:calendar-clock" className="text-purple-600 text-3xl mr-3" />
                    <p className="text-lg font-semibold text-gray-900">{offerDetails.estimatedTime}</p>
                  </div>
                </div>

                {/* Offer Description */}
                {offerDetails.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                      <Icon icon="mdi:note-text-outline" className="mr-1 text-gray-400" />
                      Additional Notes
                    </h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg flex items-start">
                      <Icon icon="mdi:format-quote-open" className="text-gray-400 mr-2 text-xl" />
                      {offerDetails.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Actions */}

{/* Right Column - Actions */}
<div className="space-y-6">
  {/* Action Card */}
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 sticky top-6"
  >
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
        <Icon icon="mdi:flash-outline" className="text-primary-600 text-xl mr-2" />
        Actions
      </h2>
    </div>

    <div className="p-6">
      {/* Status: PENDING - Sirf Chat */}
      {offerStatus === 'pending' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
            <Icon icon="mdi:clock-outline" className="text-yellow-600 text-xl mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Response</p>
              <p className="text-xs text-yellow-700 mt-1">
                Waiting for customer to respond
              </p>
            </div>
          </div>
          
          <button
            onClick={handleChatWithCustomer}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Icon icon="mdi:chat-outline" className="text-xl mr-2" />
            Chat with Customer
          </button>
        </div>
      )}

      {/* Status: ACCEPTED - Chat + Accept/Reject/Counter */}
      {offerStatus === 'accepted' && (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg flex items-start">
            <Icon icon="mdi:check-circle-outline" className="text-green-600 text-xl mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Offer Accepted</p>
              <p className="text-xs text-green-700 mt-1">
                Customer has accepted your offer
              </p>
            </div>
          </div>

          <button
            onClick={handleChatWithCustomer}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Icon icon="mdi:chat-outline" className="text-xl mr-2" />
            Chat with Customer
          </button>

    <div className="grid grid-cols-2 gap-3 pt-2">

<button
  onClick={handleAcceptOffer}
  className="flex items-center justify-center px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
>
  <Icon icon="mdi:check" className="text-lg mr-1" />
  {multiloading["acceptOffer"] ? "Loading..." : "Accept"}
</button>

<button
  onClick={handleRejectOffer}
  className="flex items-center justify-center px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
>
  <Icon icon="mdi:close" className="text-lg mr-1" />
  {multiloading["rejectOffer"] ? "Loading..." : "Reject"}
</button>

</div>

          <button
            onClick={handleCounterOffer}
            className="w-full flex items-center justify-center px-4 py-2.5 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 text-sm font-medium"
          >
            <Icon icon="mdi:swap-horizontal" className="text-xl mr-2" />
            Make Counter Offer
          </button>
        </div>
      )}

      {/* Status: REJECTED - Kuch nahi */}
      {offerStatus === 'rejected' && (
        <div className="bg-red-50 p-4 rounded-lg flex items-start">
          <Icon icon="mdi:close-circle-outline" className="text-red-600 text-xl mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Offer Rejected</p>
            <p className="text-xs text-red-700 mt-1">
              This offer has been rejected
            </p>
          </div>
        </div>
      )}

      {/* Status: EXPIRED - Kuch nahi */}
      {offerStatus === 'expired' && (
        <div className="bg-gray-50 p-4 rounded-lg flex items-start">
          <Icon icon="mdi:clock-alert-outline" className="text-gray-600 text-xl mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-800">Offer Expired</p>
            <p className="text-xs text-gray-600 mt-1">
              This offer has expired
            </p>
          </div>
        </div>
      )}

      {/* Offer Info - Common */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-xs font-medium text-gray-500 mb-3 flex items-center">
          <Icon icon="mdi:information-outline" className="mr-1 text-gray-400" />
          Offer Information
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Created:</span>
            <span className="font-medium text-gray-900">
              {new Date(offerDetails.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Expires:</span>
            <span className={`font-medium ${offerDetails.isExpired ? 'text-red-600' : 'text-green-600'}`}>
              {new Date(offerDetails.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
</div>
      
        </div>
      </div>
    </div>
  );
}

export default OfferDetailPage;