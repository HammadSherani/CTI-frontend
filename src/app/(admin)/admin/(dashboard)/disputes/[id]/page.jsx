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
  const [showResolutionModal, setShowResolutionModal] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [resolutionData, setResolutionData] = useState({
    resolutionType: '',
    refundAmount: 0,
    notes: ''
  })
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

  

  const handleResolutionSubmit = async () => {
    if (!resolutionData.resolutionType) {
      toast.error('Please select a resolution type')
      return
    }

    if (resolutionData.resolutionType === 'refund_partial' && !resolutionData.refundAmount) {
      toast.error('Please enter refund amount for partial refund')
      return
    }

    try {
      setUpdating(true)
      const payload = {
        resolutionType: resolutionData.resolutionType,
        ...(resolutionData.resolutionType === 'refund_partial' && { 
          refundAmount: parseFloat(resolutionData.refundAmount) 
        }),
        ...(resolutionData.notes && { notes: resolutionData.notes })
      }

      const { data } = await axiosInstance.post(
        `/disputes/${id}/resolve`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (data.success) {
        toast.success('Resolution applied successfully')
        setShowResolutionModal(false)
        setResolutionData({ resolutionType: '', refundAmount: 0, notes: '' })
        fetchData()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setUpdating(false)
    }
  }

  const getResolutionTypeLabel = (type) => {
    const labels = {
      'refund_full': 'Full Refund',
      'refund_partial': 'Partial Refund',
      'pay_repairman': 'Pay Repairman',
      'no_action': 'No Action',
      'mutual_agreement': 'Mutual Agreement'
    }
    return labels[type] || type
  }

  const getResolutionTypeIcon = (type) => {
    const icons = {
      'refund_full': 'heroicons:arrow-uturn-left',
      'refund_partial': 'heroicons:banknotes',
      'pay_repairman': 'heroicons:user-circle',
      'no_action': 'heroicons:x-circle',
      'mutual_agreement': 'heroicons:handshake'
    }
    return icons[type] || 'heroicons:check-circle'
  }

  const getResolutionTypeColor = (type) => {
    const colors = {
      'refund_full': 'bg-green-100 text-green-800 border-green-200',
      'refund_partial': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pay_repairman': 'bg-blue-100 text-blue-800 border-blue-200',
      'no_action': 'bg-gray-100 text-gray-800 border-gray-200',
      'mutual_agreement': 'bg-primary-100 text-primary-800 border-primary-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  
  const isValid=dispute?.status==="under_review" || dispute?.status==="resolved"

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
  const totalAmount = dispute.bookingId?.bookingDetails?.pricing?.totalAmount || 0

  const handleStatusChange=()=>{
    toast.info('Status change functionality is not implemented in this demo')
  }

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
        <div className="   ">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Admin Panel</h2>
              <p className="">Manage dispute status and resolution</p>
            </div>
           
           <div className='flex gap-2'>
            {console.log(dispute,"dispute")}
            
            <button disabled={isValid}   onClick={() => handleStatusChange('under_review')} className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm ${isValid ? 'opacity-50 cursor-not-allowed' : ''}`} >
              Under Review
            </button>
            <button title='Add Resulation'  onClick={() => setShowResolutionModal(true)}
                 className="ml-2 px-4 py-2 flex items-center bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm">
                              <Icon icon="heroicons:plus" className="w-4 h-4 mr-1" />

              Add Resulation
            </button>
           </div>


          </div>

                   {updating && (
            <div className="mt-3 flex items-center justify-center text-primary-100">
              <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
              Updating status...
            </div>
          )}
        </div>

      
          <div className="p-6">
            {dispute.resolution?.resolutionType &&
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <Icon 
                          icon={getResolutionTypeIcon(dispute.resolution.resolutionType)} 
                          className="w-6 h-6 text-green-600" 
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Resolution Applied</h4>
                        <p className="text-sm text-gray-600">This dispute has been resolved</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getResolutionTypeColor(dispute.resolution.resolutionType)}`}>
                      {getResolutionTypeLabel(dispute.resolution.resolutionType)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {(dispute.resolution.resolutionType === 'refund_full' || 
                      dispute.resolution.resolutionType === 'refund_partial') && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Refund Amount</span>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {currencySymbol}{dispute.resolution.refundAmount || totalAmount}
                        </p>
                        {dispute.resolution.resolutionType === 'refund_full' && (
                          <p className="text-xs text-gray-600 mt-1">Full booking amount</p>
                        )}
                      </div>
                    )}

                    {dispute.resolution.resolvedAt && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Resolved On</span>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatFullDate(dispute.resolution.resolvedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {dispute.resolution.notes && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                        Admin Notes
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {dispute.resolution.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            }
          </div>
        </div>

        {/* Resolution Modal */}
        {showResolutionModal && (
          <div 
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div    onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Icon icon="heroicons:clipboard-document-check" className="w-6 h-6 mr-2" />
                  Apply Resolution
                </h3>
                <button
                  onClick={() => setShowResolutionModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Booking Amount Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-900 font-medium">Total Booking Amount</p>
                      <p className="text-xs text-blue-700 mt-0.5">Maximum refundable amount</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {currencySymbol}{totalAmount}
                    </p>
                  </div>
                </div>

                {/* Resolution Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Resolution Type <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {['refund_full', 'refund_partial', 'pay_repairman', 'no_action', 'mutual_agreement'].map((type) => (
                      <div
                        key={type}
                        onClick={() => setResolutionData({ ...resolutionData, resolutionType: type })}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          resolutionData.resolutionType === type
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            resolutionData.resolutionType === type
                              ? 'border-primary-600 bg-primary-600'
                              : 'border-gray-300'
                          }`}>
                            {resolutionData.resolutionType === type && (
                              <Icon icon="heroicons:check" className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex items-center flex-1">
                            <Icon 
                              icon={getResolutionTypeIcon(type)} 
                              className={`w-5 h-5 mr-2 ${
                                resolutionData.resolutionType === type ? 'text-primary-600' : 'text-gray-400'
                              }`}
                            />
                            <div>
                              <p className={`font-semibold ${
                                resolutionData.resolutionType === type ? 'text-primary-900' : 'text-gray-900'
                              }`}>
                                {getResolutionTypeLabel(type)}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {type === 'refund_full' && 'Refund the entire booking amount to the customer'}
                                {type === 'refund_partial' && 'Refund a partial amount to the customer'}
                                {type === 'pay_repairman' && 'Release payment to the repairman'}
                                {type === 'no_action' && 'No financial action required'}
                                {type === 'mutual_agreement' && 'Both parties have agreed on a resolution'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refund Amount Input (Only for partial refund) */}
                {resolutionData.resolutionType === 'refund_partial' && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Refund Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={totalAmount}
                        step="0.01"
                        value={resolutionData.refundAmount}
                        onChange={(e) => setResolutionData({ ...resolutionData, refundAmount: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Enter refund amount"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Maximum refundable: {currencySymbol}{totalAmount}
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={resolutionData.notes}
                    onChange={(e) => setResolutionData({ ...resolutionData, notes: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Add any additional notes or comments about this resolution..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowResolutionModal(false)
                      setResolutionData({ resolutionType: '', refundAmount: 0, notes: '' })
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolutionSubmit}
                    disabled={updating || !resolutionData.resolutionType}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                  >
                    {updating ? (
                      <>
                        <Icon icon="heroicons:arrow-path" className="w-5 h-5 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Icon icon="heroicons:check" className="w-5 h-5 mr-2" />
                        Apply Resolution
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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



              
                
                {/* <div>
                  <span className="text-sm font-medium text-gray-500">Payment Status</span>
                  <span className="inline-block mt-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold border border-orange-200">
                    {dispute.paymentStatus?.replace('_', ' ').toUpperCase()}
                  </span>
                </div> */}

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
          </div>
        </div>



 <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50/50">
            <nav className="flex gap-1 p-2" aria-label="Tabs">
              {[
                { id: 'chat', label: 'chat', icon: 'heroicons:chat-bubble-left-right' },
                { id: 'dispute', label: 'Dispute Details', icon: 'heroicons:exclamation-triangle' },
                { id: 'job', label: 'Job Details', icon: 'heroicons:wrench-screwdriver' },
                { id: 'booking', label: 'Booking Details', icon: 'heroicons:calendar' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon icon={tab.icon} className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* chat Tab */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                {/* Initial Dispute Message */}
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 to-primary-300"></div>
                  
                  <div className="relative flex gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
                      <Icon icon="heroicons:exclamation-triangle" className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{dispute.raisedBy?.userId?.name}</h4>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="capitalize">{dispute.raisedBy?.userType}</span>
                            <span>•</span>
                            <span>{formatFullDate(dispute.createdAt)}</span>
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-semibold">
                          {formatCategory(dispute.category)}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{dispute.description}</p>
                    </div>
                  </div>

                  {/* Responses */}
                  {dispute.responses?.map((response, index) => (
                    <div key={index} className="relative flex gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-200">
                        <Icon icon="heroicons:user" className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{response.respondedBy?.userId?.name}</h4>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <span className="capitalize">{response.respondedBy?.userType}</span>
                              <span>•</span>
                              <span>{formatFullDate(response.respondedAt)}</span>
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{response.message}</p>
                        
                        {response.evidenceFiles?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Evidence Files:</p>
                            <div className="flex flex-wrap gap-3">
                              {response.evidenceFiles.map((file, fileIndex) => (
                                <a
                                  key={fileIndex}
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative"
                                >
                                  {file.fileType === 'image' ? (
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-primary-500 transition-all">
                                      <img
                                        src={file.fileUrl}
                                        alt="Evidence"
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Icon icon="heroicons:magnifying-glass" className="w-6 h-6 text-white" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex flex-col items-center justify-center border-2 border-gray-200 group-hover:border-primary-500 transition-all">
                                      <Icon icon="heroicons:document" className="w-8 h-8 text-gray-400" />
                                      <span className="text-xs text-gray-500 mt-1">View File</span>
                                    </div>
                                  )}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Dispute Details Tab */}
            {activeTab === 'dispute' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon icon="heroicons:information-circle" className="w-5 h-5 text-primary-600" />
                      Dispute Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Category</p>
                        <p className="text-lg font-semibold text-gray-900">{formatCategory(dispute.category)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Priority</p>
                        <StatusBadge status={dispute.priority} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <StatusBadge status={dispute.status} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Escalated</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${dispute.isEscalated ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <span>{dispute.isEscalated ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deadlines */}
                  {dispute.deadlines && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Icon icon="heroicons:clock" className="w-5 h-5 text-primary-600" />
                        Deadlines
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        {dispute.deadlines.responseDeadline && (
                          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                            <p className="text-xs text-yellow-800 font-semibold mb-1">Response Deadline</p>
                            <p className="text-sm text-yellow-900">{formatFullDate(dispute.deadlines.responseDeadline)}</p>
                          </div>
                        )}
                        {dispute.deadlines.resolutionDeadline && (
                          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                            <p className="text-xs text-red-800 font-semibold mb-1">Resolution Deadline</p>
                            <p className="text-sm text-red-900">{formatFullDate(dispute.deadlines.resolutionDeadline)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Parties Card */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <Icon icon="heroicons:user-circle" className="w-5 h-5" />
                      Raised By
                    </h3>
                    <div className="space-y-3">
                      <p className="font-semibold text-blue-900">{dispute.raisedBy?.userId?.name}</p>
                      <p className="text-sm text-blue-800">{dispute.raisedBy?.userId?.email}</p>
                      <p className="text-sm text-blue-800">{dispute.raisedBy?.userId?.phone}</p>
                      <span className="inline-block px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">
                        {dispute.raisedBy?.userType}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-6 border border-red-200">
                    <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <Icon icon="heroicons:user-circle" className="w-5 h-5" />
                      Against
                    </h3>
                    <div className="space-y-3">
                      <p className="font-semibold text-red-900">{dispute.againstUser?.userId?.name}</p>
                      <p className="text-sm text-red-800">{dispute.againstUser?.userId?.email}</p>
                      <p className="text-sm text-red-800">{dispute.againstUser?.userId?.phone}</p>
                      <span className="inline-block px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">
                        {dispute.againstUser?.userType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Job Details Tab */}
            {activeTab === 'job' && dispute.jobId && (
              <div className="space-y-6">
                {/* Device Info Card */}
                <div className="bg-gradient-to-br from-primary-100 to-white rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <Icon icon="heroicons:device-phone-mobile" className="w-5 h-5" />
                    Device Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Brand</p>
                      <p className="font-semibold">{dispute.jobId.deviceInfo?.brand || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Model</p>
                      <p className="font-semibold">{dispute.jobId.deviceInfo?.model || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Color</p>
                      <p className="font-semibold capitalize">{dispute.jobId.deviceInfo?.color || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Warranty</p>
                      <p className="font-semibold capitalize">{dispute.jobId.deviceInfo?.warrantyStatus || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Services Card */}
                {dispute.jobId.services && dispute.jobId.services.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <Icon icon="heroicons:wrench" className="w-5 h-5" />
                      Services Required
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dispute.jobId.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-white rounded-xl border border-green-200 text-green-800 font-medium"
                        >
                          {service.name || service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Description */}
                {dispute.jobId.description && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                    <p className="text-gray-700 leading-relaxed">{dispute.jobId.description}</p>
                  </div>
                )}

                {/* Location & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dispute.jobId.location && (
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Icon icon="heroicons:map-pin" className="w-5 h-5" />
                        Location
                      </h3>
                      <p className="text-gray-900 font-medium">{dispute.jobId.location.address}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {dispute.jobId.location.city?.name || dispute.jobId.location.city}, {dispute.jobId.location.zipCode}
                      </p>
                    </div>
                  )}

                  {dispute.jobId.budget && (
                    <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 border border-yellow-200">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                        <Icon icon="heroicons:currency-dollar" className="w-5 h-5" />
                        Budget Range
                      </h3>
                      <p className="text-2xl font-bold text-yellow-900">
                        {dispute.jobId.budget.currency} {dispute.jobId.budget.min} - {dispute.jobId.budget.max}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Booking Details Tab */}
            {activeTab === 'booking' && dispute.bookingId && (
              <div className="space-y-6">
                {/* Pricing Card */}
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-indigo-200">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                    <Icon icon="heroicons:currency-dollar" className="w-5 h-5" />
                    Pricing Breakdown
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-indigo-800">Base Price</span>
                      <span className="font-semibold text-indigo-900">
                        {currencySymbol}{dispute.bookingId.bookingDetails?.pricing?.basePrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-indigo-800">Parts Price</span>
                      <span className="font-semibold text-indigo-900">
                        {currencySymbol}{dispute.bookingId.bookingDetails?.pricing?.partsPrice || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-indigo-800">Service Charge</span>
                      <span className="font-semibold text-indigo-900">
                        {currencySymbol}{dispute.bookingId.bookingDetails?.pricing?.serviceCharge || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-lg font-bold text-indigo-900">Total Amount</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {currencySymbol}{dispute.bookingId.bookingDetails?.pricing?.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Schedule & Warranty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Icon icon="heroicons:calendar" className="w-5 h-5 text-primary-600" />
                      Schedule
                    </h3>
                    {dispute.bookingId.bookingDetails?.scheduledDate && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Scheduled Date</p>
                        <p className="font-medium">{formatFullDate(dispute.bookingId.bookingDetails.scheduledDate)}</p>
                      </div>
                    )}
                  </div>

                  {dispute.bookingId.bookingDetails?.warranty && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Icon icon="heroicons:shield-check" className="w-5 h-5 text-primary-600" />
                        Warranty
                      </h3>
                      <p className="font-medium">{dispute.bookingId.bookingDetails.warranty.duration} days</p>
                      <p className="text-sm text-gray-600 mt-1">{dispute.bookingId.bookingDetails.warranty.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>




   
     

 
      </div>
  )
}

export default DisputesDetail