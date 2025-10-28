'use client'

import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import StatusBadge from '@/components/partials/customer/Offer/StatusBadge'
import { Icon } from '@iconify/react'

function DisputesDetail() {
  const [dispute, setDispute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { id } = useParams()
  const { token } = useSelector((state) => state.auth)
  const router = useRouter()
  const messagesEndRef = useRef(null)

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

  useEffect(() => {
    scrollToBottom()
  }, [dispute?.responses, dispute?.evidenceFiles])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCategory = (category) => {
    return category?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dispute details...</p>
        </div>
      </div>
    )
  }

  if (!dispute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-circle" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dispute Not Found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const currencySymbol = dispute.bookingId?.bookingDetails?.pricing?.currency === 'TRY' ? '₺' : '$'

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-2" />
            Back to Disputes
          </button>

          <div className="flex items-center gap-3">
            <StatusBadge status={dispute.status} />
            <StatusBadge status={dispute.priority} />
          </div>
        </div>

        {/* Admin Quick Actions Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Admin Panel</h2>
              <p className="text-primary-100">Manage dispute status and resolution</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-sm text-primary-100">Dispute ID</p>
              <p className="text-lg font-bold">{dispute.disputeId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => updateDisputeStatus('under_review')}
              disabled={updating || dispute.status === 'under_review'}
              className="px-4 py-3 bg-white text-primary-700 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center shadow-md"
            >
              <Icon icon="heroicons:eye" className="w-5 h-5 mr-2" />
              {dispute.status === 'under_review' ? 'Under Review' : 'Mark Under Review'}
            </button>

            <button
              onClick={() => updateDisputeStatus('resolved')}
              disabled={updating || dispute.status === 'resolved'}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center shadow-md"
            >
              <Icon icon="heroicons:check-circle" className="w-5 h-5 mr-2" />
              {dispute.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
            </button>

            <button
              onClick={() => updateDisputeStatus('closed')}
              disabled={updating || dispute.status === 'closed'}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center shadow-md"
            >
              <Icon icon="heroicons:x-circle" className="w-5 h-5 mr-2" />
              {dispute.status === 'closed' ? 'Closed' : 'Close Dispute'}
            </button>
          </div>

          {updating && (
            <div className="mt-3 flex items-center justify-center text-primary-100">
              <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
              Updating status...
            </div>
          )}
        </div>

        {/* Dispute Details Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 px-6 py-4">
            <h3 className="text-xl font-bold text-orange-900 flex items-center">
              <Icon icon="heroicons:exclamation-triangle" className="w-6 h-6 mr-2" />
              Dispute Information
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Dispute Info */}
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Category</span>
                  <p className="text-base text-gray-900 font-semibold capitalize mt-1">
                    {formatCategory(dispute.category)}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Payment Status</span>
                  <span className="inline-block mt-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold border border-orange-200">
                    {dispute.paymentStatus?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Escalated</span>
                  <div className="flex items-center mt-1">
                    <div className={`w-3 h-3 rounded-full mr-2 ${dispute.isEscalated ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-900">{dispute.isEscalated ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Created At</span>
                  <p className="text-sm text-gray-900 mt-1">
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

              {/* Right Column - Parties Info */}
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <span className="text-sm font-medium text-blue-900 flex items-center mb-2">
                    <Icon icon="heroicons:user" className="w-4 h-4 mr-1" />
                    Raised By
                  </span>
                  <p className="text-base text-blue-900 font-semibold">
                    {dispute.raisedBy?.userId?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">{dispute.raisedBy?.userId?.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium capitalize">
                    {dispute.raisedBy?.userType}
                  </span>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <span className="text-sm font-medium text-red-900 flex items-center mb-2">
                    <Icon icon="heroicons:user" className="w-4 h-4 mr-1" />
                    Against User
                  </span>
                  <p className="text-base text-red-900 font-semibold">
                    {dispute.againstUser?.userId?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-red-700 mt-1">{dispute.againstUser?.userId?.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium capitalize">
                    {dispute.againstUser?.userType}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {dispute.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-500">Description</span>
                <p className="text-gray-900 mt-2 leading-relaxed">{dispute.description}</p>
              </div>
            )}

            {/* Deadlines */}
            {dispute.deadlines && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-500 mb-3 block">Important Deadlines</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dispute.deadlines.responseDeadline && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-start">
                        <Icon icon="heroicons:clock" className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                        <div>
                          <p className="text-xs font-semibold text-yellow-900">Response Deadline</p>
                          <p className="text-sm text-yellow-800 mt-1">
                            {formatFullDate(dispute.deadlines.responseDeadline)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {dispute.deadlines.resolutionDeadline && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-start">
                        <Icon icon="heroicons:clock" className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                        <div>
                          <p className="text-xs font-semibold text-red-900">Resolution Deadline</p>
                          <p className="text-sm text-red-800 mt-1">
                            {formatFullDate(dispute.deadlines.resolutionDeadline)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refund Amount */}
            {dispute.resolution?.refundAmount > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <span className="text-sm font-medium text-green-900">Refund Amount</span>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {currencySymbol}{dispute.resolution.refundAmount}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Timeline Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200 px-6 py-4">
            <h3 className="text-lg font-bold text-primary-900 flex items-center">
              <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5 mr-2" />
              Dispute Timeline
              <span className="ml-auto text-sm font-normal text-primary-700">
                {((dispute.responses?.length || 0) + (dispute.evidenceFiles?.length || 0))} total items
              </span>
            </h3>
          </div>

          {/* Messages Area */}
          <div className="max-h-[600px] overflow-y-auto p-6 space-y-4 bg-gray-50">
            {/* Initial Dispute Message */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {dispute.raisedBy?.userId?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dispute.raisedBy?.userType} • Dispute Created
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(dispute.createdAt)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                      {dispute.category?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{dispute.description}</p>
                </div>
              </div>
            </div>

            {/* Responses and Evidence Files - Chronologically Merged */}
            {[
              ...(dispute.responses || []).map(r => ({ ...r, type: 'response' })),
              ...(dispute.evidenceFiles || []).map(e => ({ ...e, type: 'evidence' }))
            ]
              .sort((a, b) => {
                const dateA = new Date(a.respondedAt || a.createdAt || a.uploadedAt)
                const dateB = new Date(b.respondedAt || b.createdAt || b.uploadedAt)
                return dateA - dateB
              })
              .map((item, index) => {
                if (item.type === 'response') {
                  return (
                    <div key={`response-${index}`} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon icon="heroicons:user" className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900 capitalize">
                                {item.respondedBy?.userId?.name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {item.respondedBy?.userType || 'User'}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.respondedAt || item.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">{item.message}</p>
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  // Evidence file
                  return (
                    <div key={`evidence-${index}`} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon icon="heroicons:paper-clip" className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                Evidence Uploaded
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                By {item.uploaderType} • {item.uploadedBy?.name || 'Unknown'}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.uploadedAt)}
                            </span>
                          </div>
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            <Icon icon="heroicons:document" className="w-4 h-4" />
                            View {item.fileType} file
                            <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4" />
                          </a>
                          {item.fileType === 'image' && (
                            <img
                              src={item.fileUrl}
                              alt="Evidence"
                              className="mt-3 rounded-lg max-w-xs border border-blue-300"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }
              })}

            {/* No messages yet */}
            {(!dispute.responses || dispute.responses.length === 0) && 
             (!dispute.evidenceFiles || dispute.evidenceFiles.length === 0) && (
              <div className="text-center py-8">
                <Icon icon="heroicons:chat-bubble-left-ellipsis" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No responses or evidence files yet</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Admin Note */}
          <div className="bg-primary-50 border-t border-primary-200 px-6 py-3">
            <p className="text-xs text-primary-700 flex items-center">
              <Icon icon="heroicons:information-circle" className="w-4 h-4 mr-1" />
              Admin view - Read only. Use status buttons above to manage this dispute.
            </p>
          </div>
        </div>

        {/* Job Details Card */}
        {dispute.jobId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-primary-50 border-b border-primary-200 px-6 py-4">
              <h3 className="text-lg font-bold text-primary-900 flex items-center">
                <Icon icon="heroicons:wrench-screwdriver" className="w-5 h-5 mr-2" />
                Job Details
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Job ID</span>
                    <p className="text-base text-gray-900 font-semibold mt-1">
                      {dispute.jobId._id?.slice(-8).toUpperCase() || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <div className="mt-1">
                      <StatusBadge status={dispute.jobId.status} />
                    </div>
                  </div>

                  {dispute.jobId.deviceInfo && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Device</span>
                      <p className="text-base text-gray-900 mt-1">
                        {dispute.jobId.deviceInfo.brand} - {dispute.jobId.deviceInfo.model}
                      </p>
                      <p className="text-xs text-gray-600 capitalize mt-1">
                        Color: {dispute.jobId.deviceInfo.color} | Warranty: {dispute.jobId.deviceInfo.warrantyStatus}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-500">Urgency</span>
                    <p className="text-base text-gray-900 capitalize mt-1">{dispute.jobId.urgency}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                      <Icon icon="heroicons:user-circle" className="w-4 h-4 mr-1" />
                      Customer
                    </span>
                    <p className="text-base text-gray-900 font-semibold">
                      {dispute.jobId.customerId?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{dispute.jobId.customerId?.email}</p>
                    <p className="text-xs text-gray-600">{dispute.jobId.customerId?.phone}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Service Preference</span>
                    <p className="text-base text-gray-900 capitalize mt-1">{dispute.jobId.servicePreference}</p>
                  </div>

                  {dispute.jobId.preferredTime && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Preferred Time</span>
                      <p className="text-sm text-gray-900 mt-1">
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

              {/* Job Description */}
              {dispute.jobId.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-500">Description</span>
                  <p className="text-gray-900 mt-2">{dispute.jobId.description}</p>
                </div>
              )}

              {/* Services */}
              {dispute.jobId.services && dispute.jobId.services.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-500 mb-3 block">Services</span>
                  <div className="flex flex-wrap gap-2">
                    {dispute.jobId.services.map((service, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {dispute.jobId.location && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-500 flex items-center mb-2">
                    <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
                    Location
                  </span>
                  <p className="text-gray-900">{dispute.jobId.location.address}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {dispute.jobId.location.city}, {dispute.jobId.location.zipCode}
                  </p>
                </div>
              )}

              {/* Budget */}
              {dispute.jobId.budget && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-500">Budget Range</span>
                  <p className="text-gray-900 mt-1 font-semibold">
                    {dispute.jobId.budget.currency} {dispute.jobId.budget.min} - {dispute.jobId.budget.max}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Details Card */}
        {dispute.bookingId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-primary-50 border-b border-primary-200 px-6 py-4">
              <h3 className="text-lg font-bold text-primary-900 flex items-center">
                <Icon icon="heroicons:calendar-days" className="w-5 h-5 mr-2" />
                Booking Details
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {dispute.bookingId.bookingDetails?.scheduledDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Scheduled Date</span>
                      <p className="text-base text-gray-900 mt-1">
                        {formatFullDate(dispute.bookingId.bookingDetails.scheduledDate)}
                      </p>
                    </div>
                  )}

                  {dispute.bookingId.bookingDetails?.estimatedCompletion && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Estimated Completion</span>
                      <p className="text-sm text-gray-900 mt-1">
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
                      <span className="text-sm font-medium text-gray-500">Payment Status</span>
                      <div className="mt-1">
                        <StatusBadge status={dispute.bookingId.payment.status} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Pricing */}
                <div>
                  {dispute.bookingId.bookingDetails?.pricing && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Pricing Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base Price:</span>
                          <span className="font-semibold text-gray-900">
                            {currencySymbol}{dispute.bookingId.bookingDetails.pricing.basePrice}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Parts Price:</span>
                          <span className="text-gray-900">
                            {currencySymbol}{dispute.bookingId.bookingDetails.pricing.partsPrice || 0}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Service Charge:</span>
                          <span className="text-gray-900">
                            {currencySymbol}{dispute.bookingId.bookingDetails.pricing.serviceCharge || 0}
                          </span>
                        </div>

                        <div className="border-t pt-2 mt-2 flex justify-between">
                          <span className="text-sm font-semibold text-gray-700">Total Amount:</span>
                          <span className="text-lg font-bold text-primary-600">
                            {currencySymbol}{dispute.bookingId.bookingDetails.pricing.totalAmount}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Warranty */}
              {dispute.bookingId.bookingDetails?.warranty && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-500 flex items-center mb-2">
                    <Icon icon="heroicons:shield-check" className="w-4 h-4 mr-1" />
                    Warranty
                  </span>
                  <p className="text-gray-900">
                    {dispute.bookingId.bookingDetails.warranty.duration} days - {dispute.bookingId.bookingDetails.warranty.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DisputesDetail