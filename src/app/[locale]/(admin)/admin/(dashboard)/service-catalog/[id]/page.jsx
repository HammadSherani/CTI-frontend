"use client"
import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'

function ServiceCatalogDetail() {
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')

    const {token} = useSelector((state) => state.auth)
    const {id} = useParams()
    const router = useRouter()

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const {data} = await axiosInstance.get(`/admin/repiarman-services/${id}`, {
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

    const updateStatus = async (newStatus, reason = '') => {
        try {
            setIsUpdating(true)
            const payload = { status: newStatus }
            if (reason) {
                payload.reason = reason
            }

            const response = await axiosInstance.patch(
                `/admin/repiarman-services/${id}/status`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            setData(response.data.data)
            setShowRejectModal(false)
            setRejectionReason('')
            
            toast.success(`Service ${newStatus} successfully!`)
        } catch (error) {
            handleError(error)
            toast.error('Failed to update status')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleStatusChange = (newStatus) => {
        if (newStatus === 'rejected') {
            setShowRejectModal(true)
        } else {
            updateStatus(newStatus)
        }
    }

    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }
        updateStatus('rejected', rejectionReason)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'approved': return 'bg-green-100 text-green-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if(isLoading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='text-lg'>Loading...</div>
            </div>
        )
    }

    if(!data) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='text-lg'>Service not found</div>
            </div>
        )
    }

    return (
        <div className='max-w-6xl mx-auto p-6 bg-white'>
            {/* Header */}
            <div className='flex items-center justify-between mb-8 border-b'>
                <div className='flex gap-8'>
                    <button className='pb-4 border-b-2 border-black font-medium'>
                        Service Details
                    </button>
                </div>
                <button
                    onClick={() => router.back()}
                    className='px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer'
                >
                    Go Back
                </button>
            </div>

            {/* Summary Section */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg'>
                <div>
                    <h3 className='text-sm text-gray-600 mb-1'>Service Title</h3>
                    <p className='font-semibold'>{data.title}</p>
                    <p className='text-sm text-gray-500'>Type: {data.serviceType}</p>
                    <p className='text-xs text-gray-400 mt-2'>
                        Status: {data.isActive ? 'Active' : 'Inactive'}
                    </p>
                </div>
                <div>
                    <h3 className='text-sm text-gray-600 mb-1'>Repairman</h3>
                    <p className='font-semibold'>{data.repairmanId.name}</p>
                    <p className='text-sm text-gray-500'>{data.repairmanId.email}</p>
                    <p className='text-xs text-gray-400 mt-2'>
                        Phone: {data.repairmanId.phone}
                    </p>
                </div>
                <div>
                    <h3 className='text-sm text-gray-600 mb-1'>Device Details</h3>
                    <p className='text-sm'>{data.deviceInfo.brandId.name}</p>
                    <p className='text-sm text-gray-500'>{data.deviceInfo.modelId.name}</p>
                    <p className='text-xs text-gray-400 mt-2'>
                        Total: <span className='font-semibold'>{data.pricing.total} {data.pricing.currency}</span>
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                <div className='md:col-span-4 space-y-6'>
                    {/* Status Section */}
                    <div className='border-b pb-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <p className='text-sm text-gray-500'>
                                    Created: {formatDate(data.createdAt)}
                                </p>
                                <p className='text-sm text-gray-500'>
                                    Last Updated: {formatDate(data.updatedAt)}
                                </p>
                            </div>
                            <div className='flex gap-2 items-center'>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                                    {data.status}
                                </span>
                                {data.isActive && (
                                    <span className='px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                        Active
                                    </span>
                                )}
                            </div>
                        </div>

                        <h4 className='font-semibold mb-2'>Description</h4>
                        <p className='text-gray-700 leading-relaxed mb-4'>
                            {data.description}
                        </p>

                        {/* Rejection Reason Display */}
                        {data.rejectionReason && (
                            <div className='mt-4 p-4 bg-red-50 rounded-lg border border-red-200'>
                                <div className='flex items-start gap-2'>
                                    <Icon icon='material-symbols:flag-outline' className='text-red-600 text-lg mt-0.5' />
                                    <div>
                                        <h5 className='font-semibold text-red-800 text-sm mb-1'>Rejection Reason</h5>
                                        <p className='text-sm text-red-700'>{data.rejectionReason}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pricing Details */}
                    <div className='bg-gray-50 p-4 rounded-lg'>
                        <h4 className='font-semibold mb-3'>Pricing Breakdown</h4>
                        <div className='space-y-2'>
                            <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Base Price:</span>
                                <span className='font-semibold'>{data.pricing.basePrice} {data.pricing.currency}</span>
                            </div>
                            <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Parts Price:</span>
                                <span className='font-semibold'>{data.pricing.partsPrice} {data.pricing.currency}</span>
                            </div>
                            <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Service Charges:</span>
                                <span className='font-semibold'>{data.pricing.serviceCharges} {data.pricing.currency}</span>
                            </div>
                            <div className='flex justify-between text-base pt-2 border-t border-gray-300'>
                                <span className='font-bold text-gray-800'>Total Amount:</span>
                                <span className='font-bold text-blue-600'>{data.pricing.total} {data.pricing.currency}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Change Section */}
                    <div className='mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                        <h4 className='font-semibold mb-3 text-sm'>Change Service Status</h4>
                        <div className='flex gap-2 flex-wrap'>
                            {['pending', 'approved', 'rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={isUpdating || data.status === status}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        data.status === status
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700'
                                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isUpdating && data.status !== status ? (
                                        <span className='flex items-center gap-2'>
                                            <Icon icon='eos-icons:loading' className='animate-spin' />
                                            {status}
                                        </span>
                                    ) : (
                                        <span className='capitalize'>{status}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className='text-xs text-gray-500 mt-2'>
                            Current status: <span className='font-semibold capitalize'>{data.status}</span>
                        </p>
                    </div>

                    {/* Repairman Details */}
                    <div className='bg-gray-50 p-4 rounded-lg'>
                        <h4 className='font-semibold mb-3'>Repairman Information</h4>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <p className='text-sm text-gray-600'>Name</p>
                                <p className='font-medium'>{data.repairmanId.name}</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-600'>Email</p>
                                <p className='font-medium'>{data.repairmanId.email}</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-600'>Phone</p>
                                <p className='font-medium'>{data.repairmanId.phone}</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-600'>Location</p>
                                <p className='font-medium text-sm'>
                                    {data.repairmanId.address?.coordinates[1]}, {data.repairmanId.address?.coordinates[0]}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Device Information */}
                    <div className='bg-gray-50 p-4 rounded-lg'>
                        <h4 className='font-semibold mb-3'>Device Information</h4>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <p className='text-sm text-gray-600'>Brand</p>
                                <p className='font-medium'>{data.deviceInfo.brandId.name}</p>
                                <p className='text-xs text-gray-400 mt-1'>ID: {data.deviceInfo.brandId.id}</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-600'>Model</p>
                                <p className='font-medium'>{data.deviceInfo.modelId.name}</p>
                                <p className='text-xs text-gray-400 mt-1'>ID: {data.deviceInfo.modelId.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
                        <div className='flex items-center gap-2 mb-4'>
                            <Icon icon='material-symbols:flag-outline' className='text-red-600 text-2xl' />
                            <h3 className='text-xl font-bold text-gray-800'>Reject Service</h3>
                        </div>
                        <p className='text-gray-600 mb-4'>Please provide a reason for rejecting this service:</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className='w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-32 focus:outline-none focus:ring-2 focus:ring-red-500'
                            placeholder='Enter rejection reason...'
                        />
                        <div className='flex justify-end gap-3'>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectionReason('')
                                }}
                                disabled={isUpdating}
                                className='px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={isUpdating}
                                className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 flex items-center gap-2'
                            >
                                {isUpdating && (
                                    <Icon icon='eos-icons:loading' className='animate-spin' />
                                )}
                                {isUpdating ? 'Rejecting...' : 'Reject Service'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ServiceCatalogDetail