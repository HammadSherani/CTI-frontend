"use client"

import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import { Icon } from '@iconify/react'

function ServiceCatalog() {
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [status, setStatus] = useState('')
    const [serviceType, setServiceType] = useState('')
    const [isActive, setIsActive] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
    const [stats, setStats] = useState({})

    const {token} = useSelector((state) => state.auth)

    // Debouncing effect for search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
            })

            if (debouncedSearch) params.append('search', debouncedSearch)
            if (status) params.append('status', status)
            if (serviceType) params.append('serviceType', serviceType)
            if (isActive) params.append('isActive', isActive)

            const response = await axiosInstance.get(`/admin/repiarman-services?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setData(response.data.data)
            setPagination(response.data.pagination)
            setStats(response.data.stats || {})
        } catch (error) {
            handleError(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [currentPage, debouncedSearch, status, serviceType, isActive])

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'approved': return 'bg-green-100 text-green-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className='min-h-screen bg-gray-50 p-6'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Service Catalog</h1>
                            <p className="text-gray-600 mt-1">Manage repairman services and catalog</p>
                        </div>
                        {/* Stats */}
                        <div className="flex gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
                                <p className="text-xs text-gray-500">Pending</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
                                <p className="text-xs text-gray-500">Approved</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
                                <p className="text-xs text-gray-500">Rejected</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by title or description..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Service Type Filter */}
                        <div>
                            <select
                                value={serviceType}
                                onChange={(e) => {
                                    setServiceType(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Types</option>
                                <option value="shop">Shop</option>
                                <option value="home">Home</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Status Filter */}
                    <div className="mt-4">
                        <select
                            value={isActive}
                            onChange={(e) => {
                                setIsActive(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">All Services</option>
                            <option value="true">Active Only</option>
                            <option value="false">Inactive Only</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-8">
                        <Icon icon="eos-icons:loading" className="text-4xl text-primary-500 mx-auto" />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && data.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Icon icon="mdi:tools" className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Services Found</h3>
                        <p className="text-gray-500">
                            {searchQuery || status || serviceType || isActive
                                ? "Try adjusting your filters to see more services"
                                : "There are no services available at the moment"}
                        </p>
                    </div>
                )}

                {/* Cards Grid */}
                {!isLoading && data.length > 0 && (
                    <>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {data.map((service) => (
                                <Link 
                                    href={`/admin/service-catalog/${service._id}`} 
                                    key={service._id} 
                                    className='bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer'
                                >
                                    {/* Header */}
                                    <div className='bg-gradient-to-r from-primary-500 to-primary-600 p-4'>
                                        <h2 className='text-white font-semibold text-lg mb-1'>{service.title}</h2>
                                        <p className='text-primary-100 text-sm'>{service.deviceInfo.brandId.name} - {service.deviceInfo.modelId.name}</p>
                                    </div>

                                    {/* Body */}
                                    <div className='p-4'>
                                        {/* Status Badge */}
                                        <div className='mb-3 flex justify-between items-center'>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(service.status)}`}>
                                                {service.status.toUpperCase()}
                                            </span>
                                            {service.isActive ? (
                                                <span className="flex items-center text-xs text-green-600">
                                                    <Icon icon="mdi:circle" className="w-2 h-2 mr-1" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-xs text-gray-400">
                                                    <Icon icon="mdi:circle" className="w-2 h-2 mr-1" />
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className='text-gray-600 text-sm mb-4 line-clamp-3'>{service.description}</p>

                                        {/* Repairman Info */}
                                        <div className='bg-gray-50 rounded-lg p-3 mb-4'>
                                            <p className='text-xs text-gray-500 mb-1'>Repairman</p>
                                            <p className='font-semibold text-gray-800'>{service.repairmanId.name}</p>
                                            <p className='text-sm text-gray-600'>{service.repairmanId.phone}</p>
                                        </div>

                                        {/* Pricing */}
                                        <div className='space-y-2 mb-4'>
                                            <div className='flex justify-between text-sm'>
                                                <span className='text-gray-600'>Base Price:</span>
                                                <span className='font-semibold'>{service.pricing.basePrice} {service.pricing.currency}</span>
                                            </div>
                                            <div className='flex justify-between text-sm'>
                                                <span className='text-gray-600'>Parts Price:</span>
                                                <span className='font-semibold'>{service.pricing.partsPrice} {service.pricing.currency}</span>
                                            </div>
                                            <div className='flex justify-between text-sm'>
                                                <span className='text-gray-600'>Service Charges:</span>
                                                <span className='font-semibold'>{service.pricing.serviceCharges} {service.pricing.currency}</span>
                                            </div>
                                            <div className='flex justify-between text-sm pt-2 border-t border-gray-200'>
                                                <span className='text-gray-800 font-semibold'>Total:</span>
                                                <span className='text-primary-600 font-bold text-lg'>{service.pricing.total} {service.pricing.currency}</span>
                                            </div>
                                        </div>

                                        {/* Service Type */}
                                        <div className='flex justify-between items-center'>
                                            <span className='text-xs text-gray-500'>Service Type:</span>
                                            <span className='text-sm font-medium text-gray-700 capitalize'>{service.serviceType}</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className='bg-gray-50 px-4 py-3 text-xs text-gray-500'>
                                        Created: {new Date(service.createdAt).toLocaleDateString()}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8 flex justify-center items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                            </button>
                            
                            <span className="px-4 py-2 text-gray-700">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                                disabled={currentPage === pagination.pages}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Total Results */}
                        <div className="text-center mt-4 text-gray-600 text-sm">
                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} services
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ServiceCatalog