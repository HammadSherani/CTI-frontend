'use client'

import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import StatusBadge from '@/components/partials/customer/Offer/StatusBadge'

function DisputesDetail() {
  const [dispute, setDispute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { id } = useParams()
  const { token } = useSelector((state) => state.auth)
  const router = useRouter()

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data } = await axiosInstance.get(`/disputes/admin/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setDispute(data.data)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCategory = (category) => {
    return category?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Update dispute status
  const updateDisputeStatus = async (newStatus) => {
    try {
      setUpdating(true)
      const { data } = await axiosInstance.patch(
        `/disputes/admin/${id}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (data.success) {
        toast.success('Dispute status updated successfully')
        fetchData()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!dispute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dispute Not Found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const currencySymbol = dispute.bookingId?.bookingDetails?.pricing?.currency === 'TRY' ? '₺' : '$';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Disputes
          </button>
        </div>

        {/* Dispute Details Card */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-primary-900">Dispute Details</h3>
            <div className="flex gap-2">
              <StatusBadge status={dispute.status} />
              <StatusBadge status={dispute.priority} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Dispute Info */}
            <div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Dispute ID:</span>
                  <p className="text-gray-800 font-semibold">{dispute.disputeId}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Category:</span>
                  <p className="text-gray-800 capitalize">{formatCategory(dispute.category)}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                  <p className="text-gray-800 capitalize">{dispute.paymentStatus?.replace('_', ' ')}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Escalated:</span>
                  <p className="text-gray-800">{dispute.isEscalated ? 'Yes' : 'No'}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Created At:</span>
                  <p className="text-gray-800 text-sm">
                    {new Date(dispute.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Parties Info */}
            <div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Raised By:</span>
                  <p className="text-gray-800 font-semibold">
                    {dispute.raisedBy?.userId?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">{dispute.raisedBy?.userId?.email}</p>
                  <p className="text-xs text-gray-600 capitalize">{dispute.raisedBy?.userType}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Against:</span>
                  <p className="text-gray-800 font-semibold">
                    {dispute.againstUser?.userId?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">{dispute.againstUser?.userId?.email}</p>
                  <p className="text-xs text-gray-600 capitalize">{dispute.againstUser?.userType}</p>
                </div>

                {dispute.resolution?.refundAmount > 0 && (
                  <div className="border-t pt-2">
                    <span className="text-sm font-medium text-gray-600">Refund Amount:</span>
                    <p className="text-lg font-bold text-primary-600">
                      {currencySymbol}{dispute.resolution.refundAmount}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {dispute.description && (
            <div className="mt-4 pt-4 border-t border-primary-200">
              <span className="text-sm font-medium text-gray-600">Description:</span>
              <p className="text-gray-800 mt-1">{dispute.description}</p>
            </div>
          )}

          {/* Deadlines */}
          {dispute.deadlines && (
            <div className="mt-4 pt-4 border-t border-primary-200">
              <span className="text-sm font-medium text-gray-600">Important Deadlines:</span>
              <div className="mt-2 space-y-1">
                {dispute.deadlines.responseDeadline && (
                  <p className="text-sm text-gray-600">
                    Response Deadline: {formatDate(dispute.deadlines.responseDeadline)}
                  </p>
                )}
                {dispute.deadlines.resolutionDeadline && (
                  <p className="text-sm text-gray-600">
                    Resolution Deadline: {formatDate(dispute.deadlines.resolutionDeadline)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Evidence Files */}
          {dispute.evidenceFiles && dispute.evidenceFiles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-primary-200">
              <span className="text-sm font-medium text-gray-600">Evidence Files:</span>
              <div className="mt-2 space-y-3">
                {dispute.evidenceFiles.map((file, index) => (
                  <div key={file._id || index} className="bg-white rounded p-3 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <a 
                          href={file.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 underline"
                        >
                          Evidence {index + 1} ({file.fileType})
                        </a>
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs text-gray-600">
                            Uploaded by: <span className="font-medium">{file.uploadedBy?.name || 'Unknown'}</span> (<span className="capitalize">{file.uploaderType}</span>)
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(file.uploadedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {file.fileType === 'image' && (
                        <img 
                          src={file.fileUrl} 
                          alt={`Evidence ${index + 1}`}
                          className="w-16 h-16 object-cover rounded ml-3"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responses */}
          {dispute.responses && dispute.responses.length > 0 && (
            <div className="mt-4 pt-4 border-t border-primary-200">
              <span className="text-sm font-medium text-gray-600">Responses:</span>
              <div className="mt-2 space-y-2">
                {dispute.responses.map((response, index) => (
                  <div key={index} className="bg-white rounded p-3 border border-gray-200">
                    <p className="text-sm text-gray-800">{response.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(response.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Job Details Card */}
        {dispute.jobId && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Job Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Job ID:</span>
                    <p className="text-gray-800 font-semibold">
                      {dispute.jobId._id?.slice(-8).toUpperCase() || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <div className="mt-1">
                      <StatusBadge status={dispute.jobId.status} />
                    </div>
                  </div>

                  {dispute.jobId.deviceInfo && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Device:</span>
                      <p className="text-gray-800">
                        {dispute.jobId.deviceInfo.brand} - {dispute.jobId.deviceInfo.model}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        Color: {dispute.jobId.deviceInfo.color} | Warranty: {dispute.jobId.deviceInfo.warrantyStatus}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-600">Urgency:</span>
                    <p className="text-gray-800 capitalize">{dispute.jobId.urgency}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Customer:</span>
                    <p className="text-gray-800 font-semibold">
                      {dispute.jobId.customerId?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">{dispute.jobId.customerId?.email}</p>
                    <p className="text-xs text-gray-600">{dispute.jobId.customerId?.phone}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600">Service Preference:</span>
                    <p className="text-gray-800 capitalize">{dispute.jobId.servicePreference}</p>
                  </div>

                  {dispute.jobId.preferredTime && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Preferred Time:</span>
                      <p className="text-gray-800 text-sm">
                        {new Date(dispute.jobId.preferredTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            {dispute.jobId.description && (
              <div className="mt-4 pt-4 border-t border-primary-200">
                <span className="text-sm font-medium text-gray-600">Description:</span>
                <p className="text-gray-800 mt-1">{dispute.jobId.description}</p>
              </div>
            )}

            {/* Services */}
            {dispute.jobId.services && dispute.jobId.services.length > 0 && (
              <div className="mt-4 pt-4 border-t border-primary-200">
                <span className="text-sm font-medium text-gray-600">Services:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dispute.jobId.services.map((service, index) => (
                    <span key={index} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {dispute.jobId.location && (
              <div className="mt-4 pt-4 border-t border-primary-200">
                <span className="text-sm font-medium text-gray-600">Location:</span>
                <p className="text-gray-800 mt-1">{dispute.jobId.location.address}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {dispute.jobId.location.city}, {dispute.jobId.location.zipCode}
                </p>
              </div>
            )}

            {/* Budget */}
            {dispute.jobId.budget && (
              <div className="mt-4 pt-4 border-t border-primary-200">
                <span className="text-sm font-medium text-gray-600">Budget Range:</span>
                <p className="text-gray-800 mt-1">
                  {dispute.jobId.budget.currency} {dispute.jobId.budget.min} - {dispute.jobId.budget.max}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Booking Details Card */}
        {dispute.bookingId && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Booking Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="space-y-3">
                  {dispute.bookingId.bookingDetails?.scheduledDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Scheduled Date:</span>
                      <p className="text-gray-800">
                        {formatDate(dispute.bookingId.bookingDetails.scheduledDate)}
                      </p>
                    </div>
                  )}

                  {dispute.bookingId.bookingDetails?.estimatedCompletion && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Estimated Completion:</span>
                      <p className="text-gray-800 text-sm">
                        {new Date(dispute.bookingId.bookingDetails.estimatedCompletion).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  {dispute.bookingId.payment && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                      <div className="mt-1">
                        <StatusBadge status={dispute.bookingId.payment.status} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Pricing */}
              <div>
                {dispute.bookingId.bookingDetails?.pricing && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Base Price:</span>
                      <p className="text-gray-800 font-semibold">
                        {currencySymbol}{dispute.bookingId.bookingDetails.pricing.basePrice}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-600">Parts Price:</span>
                      <p className="text-gray-800">
                        {currencySymbol}{dispute.bookingId.bookingDetails.pricing.partsPrice || 0}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-600">Service Charge:</span>
                      <p className="text-gray-800">
                        {currencySymbol}{dispute.bookingId.bookingDetails.pricing.serviceCharge || 0}
                      </p>
                    </div>

                    <div className="border-t pt-2">
                      <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                      <p className="text-lg font-bold text-primary-600">
                        {currencySymbol}{dispute.bookingId.bookingDetails.pricing.totalAmount}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Warranty */}
            {dispute.bookingId.bookingDetails?.warranty && (
              <div className="mt-4 pt-4 border-t border-primary-200">
                <span className="text-sm font-medium text-gray-600">Warranty:</span>
                <p className="text-gray-800 mt-1">
                  {dispute.bookingId.bookingDetails.warranty.duration} days - {dispute.bookingId.bookingDetails.warranty.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Admin Actions Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => updateDisputeStatus('under_review')}
              disabled={updating || dispute.status === 'under_review'}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {updating ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Mark Under Review'
              )}
            </button>

            <button
              onClick={() => updateDisputeStatus('resolved')}
              disabled={updating || dispute.status === 'resolved'}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Mark Resolved
            </button>

            <button
              onClick={() => updateDisputeStatus('closed')}
              disabled={updating || dispute.status === 'closed'}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Close Dispute
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisputesDetail