'use client'

import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import {useRouter} from '@/i18n/navigation'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import StatusBadge from '@/components/partials/customer/Offer/StatusBadge'
import { Icon } from '@iconify/react'
import { useMultiLoading } from '@/hooks/useMultiloading'
import ChatEvidence from '@/components/admin/ChatEvidence'
import DisputeEvidence from '@/components/partials/DisputeEvidence'
import useDisputeLive from '@/hooks/useDisputeLive'

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
  const [financials, setFinancials] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [adminMessage, setAdminMessage] = useState('')
  const [adminFiles, setAdminFiles] = useState([])
  const [sendingReply, setSendingReply] = useState(false)
  const adminFileRef = useRef(null)
  const { id } = useParams()
  const { token } = useSelector((state) => state.auth)
  const router = useRouter()
  const messagesEndRef = useRef(null)
  const { multiloading, start, stop } = useMultiLoading()

  // silent: reload without the full-page loader (live updates)
  const fetchData = async (options) => {
    try {
      if (options?.silent !== true) setLoading(true)
      const { data } = await axiosInstance.get(`/disputes/admin/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setDispute(data.data)
      setFinancials(data.financials || null)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Live: replies from the customer / repairman, status and refund changes
  useDisputeLive({ disputeId: id }, () => fetchData({ silent: true }))

  useEffect(() => {
    scrollToBottom()
  }, [dispute?.responses, dispute?.evidenceFiles])

  // Live preview of who pays what for the chosen resolution (computed by the server)
  const needsAmount = ['refund_partial', 'mutual_agreement'].includes(resolutionData.resolutionType)
  useEffect(() => {
    if (!showResolutionModal || !resolutionData.resolutionType) {
      setPreview(null)
      setPreviewError('')
      return
    }
    const amount = needsAmount ? Number(resolutionData.refundAmount) || 0 : 0
    const timer = setTimeout(async () => {
      try {
        const { data } = await axiosInstance.get(`/disputes/admin/${id}/preview`, {
          params: { resolutionType: resolutionData.resolutionType, refundAmount: amount },
          headers: { Authorization: `Bearer ${token}` }
        })
        setPreview(data.data)
        setPreviewError('')
      } catch (error) {
        setPreview(null)
        setPreviewError(error?.response?.data?.message || 'Could not calculate this resolution')
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [showResolutionModal, resolutionData.resolutionType, resolutionData.refundAmount])

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

    if (resolutionData.resolutionType === 'refund_partial' && !(Number(resolutionData.refundAmount) > 0)) {
      toast.error('Please enter refund amount for partial refund')
      return
    }

    if (!resolutionData.notes.trim()) {
      toast.error('Please write a short note explaining the decision (both sides will see it)')
      return
    }

    if (previewError) {
      toast.error(previewError)
      return
    }

    const refund = preview?.refundAmount || 0
    const confirmText = refund > 0
      ? `${currencySymbol}${refund} will be refunded to the customer's card now. This cannot be undone. Continue?`
      : 'Apply this resolution? This cannot be undone.'
    if (!window.confirm(confirmText)) return

    try {
      setUpdating(true)
      const payload = {
        resolutionType: resolutionData.resolutionType,
        ...(needsAmount && {
          refundAmount: Number(resolutionData.refundAmount) || 0
        }),
        resolutionNotes: resolutionData.notes.trim()
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
        fetchData({ silent: true })
      }
    } catch (error) {
      handleError(error)
      // Refund not confirmed by Iyzico: close the modal and show the confirm box on the page
      if (error?.response?.status === 502) {
        setShowResolutionModal(false)
        fetchData({ silent: true })
      }
    } finally {
      setUpdating(false)
    }
  }

  // After an unconfirmed refund: admin checked the Iyzico panel
  const [confirmNote, setConfirmNote] = useState('')
  const [confirming, setConfirming] = useState('')
  const confirmRefund = async (outcome) => {
    const question = outcome === 'refunded'
      ? 'Confirm that the refund IS visible in the Iyzico panel? The dispute will be resolved without refunding again.'
      : 'Confirm that the refund is NOT in the Iyzico panel? You can then resolve the dispute again.'
    if (!window.confirm(question)) return
    try {
      setConfirming(outcome)
      const { data } = await axiosInstance.post(`/disputes/${id}/confirm-refund`, { outcome, note: confirmNote.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        toast.success(data.message)
        setConfirmNote('')
        fetchData({ silent: true })
      }
    } catch (error) {
      handleError(error)
    } finally {
      setConfirming('')
    }
  }

  // Admin reply in the dispute conversation (both parties get a notification)
  const handleAdminFiles = (e) => {
    const picked = Array.from(e.target.files || []).filter((file) => {
      const okType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)
      const okSize = file.size <= 5 * 1024 * 1024
      if (!okType) toast.error(`${file.name}: only JPG, PNG, WEBP or PDF`)
      else if (!okSize) toast.error(`${file.name} is larger than 5MB`)
      return okType && okSize
    })
    setAdminFiles((prev) => [...prev, ...picked].slice(0, 5))
    e.target.value = ''
  }

  const sendAdminReply = async () => {
    const text = adminMessage.trim()
    if (!text) {
      toast.error('Please write a message')
      return
    }
    try {
      setSendingReply(true)
      const form = new FormData()
      form.append('message', text)
      adminFiles.forEach((file) => form.append('evidence', file))
      const { data } = await axiosInstance.post(`/disputes/${id}/admin-response`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      if (data.success) {
        toast.success('Reply sent to both sides')
        setAdminMessage('')
        setAdminFiles([])
        fetchData({ silent: true })
      }
    } catch (error) {
      handleError(error)
    } finally {
      setSendingReply(false)
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

  const quotationData = dispute?.bookingId?.quotationId;

console.log('Dispute data:', dispute);
console.log('Dispute quotationId:', dispute?.bookingId?.quotationId);
console.log('Quotation Data:', quotationData);

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

  const currency = financials?.currency || dispute.bookingId?.bookingDetails?.pricing?.currency || 'TRY'
  const currencySymbol = currency === 'TRY' ? '₺' : currency === 'EUR' ? '€' : '$'
  const totalAmount = financials?.paid ?? (dispute.bookingId?.bookingDetails?.pricing?.totalAmount || 0)
  const refundable = financials?.refundable ?? totalAmount
  const isResolved = ['resolved', 'closed'].includes(dispute.status)

  const handleStatusChange=async()=>{
     try {
      start('statusChange')
      const { data } = await axiosInstance.patch(
  `/disputes/admin/${id}/status`,
  {}, // empty body
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
)
fetchData({ silent: true })
      console.log(data,"status change response")
    } catch (error) {
      handleError(error)
    } finally {
      stop('statusChange')
    }
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

          {/* <div className="flex items-center gap-3">
            <StatusBadge status={dispute.status} />
            <StatusBadge status={dispute.priority} />
          </div> */}
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
            
            {dispute.status!=="open" && (
              <button   className={`px-4 py-2 bg-primary-600 rounded-full  text-white  hover:bg-primary-700 transition-colors font-medium text-sm opacity-75`}>
              {dispute.status==="open" ? "Open" : dispute.status==="under_review" ? "Under Review" : dispute.status==="resolving" ? "Resolving..." : "Resolved"}
            </button>
            )}

            {dispute.status==="open" && (
      <button disabled={isValid||multiloading.statusChange}   onClick={() => handleStatusChange('under_review')} className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm ${isValid ? 'opacity-50 cursor-not-allowed' : ''}`} >
              
              {multiloading.statusChange ? (
                <span className="flex items-center">
                  <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Under Review"
              )}
              
            </button>
            )}
       
            <button disabled={isResolved || dispute.status==="resolving" || Boolean(dispute.pendingRefund?.amount)} title='Add Resolution'  onClick={() => setShowResolutionModal(true)}
                 className="ml-2 px-4 py-2 flex items-center bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                              <Icon icon="heroicons:plus" className="w-4 h-4 mr-1" />

              Add Resolution
            </button>
           </div>


          </div>

          {/* Refund sent but not confirmed by Iyzico: admin must check and confirm */}
          {dispute.pendingRefund?.amount > 0 && (
            <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <Icon icon="heroicons:exclamation-triangle" className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-red-900">Refund not confirmed</p>
                  <p className="text-sm text-red-800 mt-1">
                    A refund of {currencySymbol}{dispute.pendingRefund.amount} ({getResolutionTypeLabel(dispute.pendingRefund.resolutionType)}) was sent on{' '}
                    {formatFullDate(dispute.pendingRefund.attemptedAt)}, but Iyzico did not answer. Open this payment in the Iyzico panel and check whether the refund is there.
                  </p>
                  <input
                    type="text"
                    value={confirmNote}
                    onChange={(e) => setConfirmNote(e.target.value)}
                    maxLength={500}
                    placeholder="Optional note (e.g. what you saw in the Iyzico panel)"
                    className="mt-3 w-full px-3 py-2 border border-red-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => confirmRefund('refunded')}
                      disabled={Boolean(confirming)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {confirming === 'refunded' ? 'Saving...' : 'Refund is in Iyzico: finish the resolution'}
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmRefund('not_refunded')}
                      disabled={Boolean(confirming)}
                      className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                    >
                      {confirming === 'not_refunded' ? 'Saving...' : 'Refund is not there: let me resolve again'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deadlines (only while the dispute is active) */}
          {['open', 'under_review', 'pending'].includes(dispute.status) && dispute.deadlines && (() => {
            const now = new Date()
            const otherId = dispute.againstUser?.userId?._id || dispute.againstUser?.userId
            const answered = (dispute.responses || []).some((r) => String(r.respondedBy?.userId?._id || r.respondedBy?.userId) === String(otherId))
            const respDue = dispute.deadlines.responseDeadline && new Date(dispute.deadlines.responseDeadline)
            const resDue = dispute.deadlines.resolutionDeadline && new Date(dispute.deadlines.resolutionDeadline)
            const fmt = (d) => d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            const overdue = resDue && resDue < now
            return (
              <div className={`mb-4 rounded-lg border px-4 py-3 text-sm flex flex-wrap gap-x-6 gap-y-1 ${overdue ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                {respDue && (
                  <span>
                    <strong className="capitalize">{dispute.againstUser?.userType}</strong> reply:{' '}
                    {answered ? 'answered ✓' : respDue < now ? `no answer (was due ${fmt(respDue)})` : `due ${fmt(respDue)}`}
                  </span>
                )}
                {resDue && (
                  <span>
                    Decision: {overdue ? <strong>overdue since {fmt(resDue)}</strong> : `due ${fmt(resDue)}`}
                  </span>
                )}
                {dispute.isEscalated && <span className="font-semibold">Escalated</span>}
              </div>
            )
          })()}

                   {updating && (
            <div className="mt-3 flex items-center justify-center text-primary-100">
              <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
              Updating status...
            </div>
          )}
        </div>

      
          <div className="mb-4">
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
                    {dispute.resolution.refundAmount > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Refunded to customer</span>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {currencySymbol}{dispute.resolution.refundAmount}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {currencySymbol}{dispute.resolution.fromRepairman || 0} from the repairman
                          {dispute.resolution.fromPlatform > 0 && `, ${currencySymbol}${dispute.resolution.fromPlatform} from the platform`}
                        </p>
                      </div>
                    )}

                    {['refund_partial', 'mutual_agreement', 'pay_repairman'].includes(dispute.resolution.resolutionType) && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Paid to repairman</span>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {currencySymbol}{dispute.resolution.repairmanPaid || 0}
                        </p>
                      </div>
                    )}

                    {(dispute.resolution.walletDebited > 0 || dispute.resolution.walletOwed > 0) && (
                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Taken back from repairman wallet</span>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {currencySymbol}{dispute.resolution.walletDebited || 0}
                          {dispute.resolution.walletOwed > 0 && (
                            <span className="block text-amber-700 font-normal text-xs mt-1">
                              {currencySymbol}{dispute.resolution.walletOwed} still owed (taken from the next earnings)
                            </span>
                          )}
                        </p>
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

                  {(dispute.resolution.resolutionNotes || dispute.resolution.notes) && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                        Decision note (shown to both sides)
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {dispute.resolution.resolutionNotes || dispute.resolution.notes}
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
                      <p className="text-sm text-blue-900 font-medium">Refundable now</p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Paid {currencySymbol}{totalAmount}
                        {financials?.alreadyRefunded > 0 && ` · already refunded ${currencySymbol}${financials.alreadyRefunded}`}
                        {financials?.earning && ` · repairman earning ${currencySymbol}${financials.earning.netEarning} (${financials.earning.status})`}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {currencySymbol}{refundable}
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
                                {type === 'refund_full' && 'Refund everything left to the customer. The repairman earns nothing for this job.'}
                                {type === 'refund_partial' && 'Refund part of it. Taken from the repairman\'s earning first; the rest is paid out and the job closes.'}
                                {type === 'pay_repairman' && 'No refund. The earning is released to the repairman and the job closes.'}
                                {type === 'no_action' && 'Dismiss the dispute. The job continues where it was (confirm / auto-release).'}
                                {type === 'mutual_agreement' && 'Both sides agreed: refund the agreed amount (0 allowed), pay out the rest, close the job.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refund Amount Input (Only for partial refund) */}
                {needsAmount && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {resolutionData.resolutionType === 'mutual_agreement' ? 'Agreed refund amount' : 'Refund Amount'}
                      {resolutionData.resolutionType === 'refund_partial' && <span className="text-red-500"> *</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={refundable}
                        step="0.01"
                        value={resolutionData.refundAmount}
                        onChange={(e) => setResolutionData({ ...resolutionData, refundAmount: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Enter refund amount"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Maximum refundable: {currencySymbol}{refundable}
                    </p>
                  </div>
                )}

                {/* What this resolution does with the money (server preview) */}
                {resolutionData.resolutionType && (previewError ? (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                    {previewError}
                  </div>
                ) : preview && (
                  <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
                    <p className="font-semibold text-gray-900 mb-2">What happens</p>
                    <div className="grid grid-cols-2 gap-y-1.5">
                      <span className="text-gray-600">Back to the customer&apos;s card</span>
                      <span className="text-right font-semibold text-green-700">{currencySymbol}{preview.refundAmount}</span>
                      {preview.refundAmount > 0 && (
                        <>
                          <span className="text-gray-600">from the repairman&apos;s earning</span>
                          <span className="text-right">{currencySymbol}{preview.fromRepairman}</span>
                          <span className="text-gray-600">from the platform (commission/parts)</span>
                          <span className="text-right">{currencySymbol}{preview.fromPlatform}</span>
                        </>
                      )}
                      <span className="text-gray-600">Repairman receives</span>
                      <span className="text-right font-semibold text-blue-700">
                        {preview.releasesEarning ? `${currencySymbol}${preview.repairmanGets}` : resolutionData.resolutionType === 'no_action' ? 'later (normal flow)' : `${currencySymbol}0`}
                      </span>
                    </div>
                    {preview.earningAlreadyReleased && preview.fromRepairman > 0 && (
                      <p className="mt-3 text-xs text-amber-700">
                        The earning was already paid out, so {currencySymbol}{preview.fromRepairman} is taken back from the repairman&apos;s wallet. Whatever they already withdrew is recorded as owed and taken from their next earnings.
                      </p>
                    )}
                  </div>
                ))}

                {/* Admin Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Decision note <span className="text-red-500">*</span>
                    <span className="block text-xs font-normal text-gray-500">The customer and the repairman both see this.</span>
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
                    disabled={updating || !resolutionData.resolutionType || !resolutionData.notes.trim() || Boolean(previewError)}
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
                { id: 'evidence', label: 'Chat Evidence', icon: 'mdi:shield-search' },
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
                      <DisputeEvidence files={dispute.evidenceFiles} className="mt-3" />
                    </div>
                  </div>

                  {/* Responses */}
                  {dispute.responses?.map((response, index) => {
                    const fromAdmin = response.respondedBy?.userType === 'admin'
                    return (
                    <div key={response._id || index} className="relative flex gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${fromAdmin ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200' : 'bg-gradient-to-br from-primary-400 to-primary-500 shadow-primary-200'}`}>
                        <Icon icon={fromAdmin ? 'heroicons:shield-check' : 'heroicons:user'} className="w-8 h-8 text-white" />
                      </div>
                      <div className={`flex-1 rounded-2xl p-5 border shadow-sm ${fromAdmin ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {fromAdmin ? `CTI Support${response.respondedBy?.userId?.name ? ` (${response.respondedBy.userId.name})` : ''}` : response.respondedBy?.userId?.name}
                            </h4>
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
                    )
                  })}
                </div>
                <div ref={messagesEndRef} />

                {/* Admin reply box */}
                {['resolved', 'closed', 'resolving'].includes(dispute.status) ? (
                  <p className="text-sm text-gray-500 text-center bg-gray-50 border border-gray-200 rounded-xl py-3">
                    This dispute is closed. No more messages can be sent.
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Reply as CTI Support</p>
                    <p className="text-xs text-gray-500 mb-3">The customer and the repairman both see this message and get a notification.</p>
                    {adminFiles.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {adminFiles.map((file, i) => (
                          <span key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                            <Icon icon={file.type.startsWith('image/') ? 'heroicons:photo' : 'heroicons:document-text'} className="w-4 h-4 text-gray-500" />
                            <span className="max-w-[140px] truncate">{file.name}</span>
                            <button type="button" onClick={() => setAdminFiles((prev) => prev.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700" aria-label="Remove file">
                              <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <textarea
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      placeholder="Ask a question or share an update..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-white"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => adminFileRef.current?.click()}
                        disabled={sendingReply || adminFiles.length >= 5}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 disabled:opacity-50"
                      >
                        <Icon icon="heroicons:paper-clip" className="w-5 h-5" />
                        Attach (max 5)
                      </button>
                      <input ref={adminFileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleAdminFiles} />
                      <button
                        type="button"
                        onClick={sendAdminReply}
                        disabled={sendingReply || !adminMessage.trim()}
                        className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                      >
                        <Icon icon={sendingReply ? 'heroicons:arrow-path' : 'heroicons:paper-airplane'} className={`w-4 h-4 ${sendingReply ? 'animate-spin' : ''}`} />
                        {sendingReply ? 'Sending...' : 'Send reply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Customer <-> repairman chat incl. deleted messages (admin evidence) */}
            {activeTab === 'evidence' && (
              <ChatEvidence disputeId={id} token={token} />
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
{activeTab === 'job' && dispute?.jobId && (              <div className="space-y-6">
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


{/* Quatation detailas */}
{activeTab === 'job' && (quotationData) && (    
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
                      <p className="font-semibold">{quotationData?.deviceInfo?.brand || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Model</p>
                      <p className="font-semibold">{quotationData?.deviceInfo?.model || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Color</p>
                      <p className="font-semibold capitalize">{quotationData?.deviceInfo?.color || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Warranty</p>
                      <p className="font-semibold capitalize">{quotationData?.deviceInfo?.warrantyStatus || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Services Card */}
                {console.log(quotationData?.deviceInfo?.repairServices,"services details")}
                {quotationData?.deviceInfo?.repairServices  && (
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <Icon icon="heroicons:wrench" className="w-5 h-5" />
                      Services Required
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {quotationData?.deviceInfo?.repairServices.map((service, index) => (
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
                {quotationData?.serviceDetails?.description && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                    <p className="text-gray-700 leading-relaxed">{quotationData?.serviceDetails?.description}</p>
                  </div>
                )}

                {/* Location & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dispute?.bookingId?.bookingDetails?.location && (
                    console.log(dispute?.bookingId?.bookingDetails?.location,"location details"), 
                    console.log(dispute,"booking details"),
                    console.log(dispute?.bookingId?.bookingDetails,"bkas details"),
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Icon icon="heroicons:map-pin" className="w-5 h-5" />
                        Location
                      </h3>
                      <p className="text-gray-900 font-medium">{dispute?.bookingId?.bookingDetails?.location?.address}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {dispute?.bookingId?.bookingDetails?.location?.city?.name || dispute?.bookingId?.bookingDetails?.location?.city}, {dispute?.bookingId?.bookingDetails?.location?.zipCode}
                      </p>
                    </div>
                  )}

                  {quotationData?.budget && (
                    <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 border border-yellow-200">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                        <Icon icon="heroicons:currency-dollar" className="w-5 h-5" />
                        Budget Range
                      </h3>
                      <p className="text-2xl font-bold text-yellow-900">
                        {quotationData?.budget?.currency} {quotationData?.budget?.min} - {quotationData?.budget?.max}
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