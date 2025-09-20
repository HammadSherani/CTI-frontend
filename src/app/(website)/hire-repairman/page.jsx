"use client"

import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import Link from 'next/link'

function HireRepairman() {
  const [repairman, setRepairman] = useState([])
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 30

  const getRepairman = async () => {
    try {
      setLoading(true)
      const params = { page, limit }
      if (selectedCity) params.city = selectedCity
      const { data } = await axiosInstance.get('/public/repairmans', { params })
      setRepairman(data.data.repairmans)
      setTotalPages(data.data.totalPages || 1)
      // Assuming API returns unique cities or fetch separately
      const uniqueCities = [...new Set(data.data.repairmans.map(r => r.repairmanProfile.city))]
      setCities(uniqueCities)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRepairman()
  }, [page, selectedCity])

  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self')
  }

  const handleWhatsApp = (whatsappNumber) => {
    const formattedNumber = whatsappNumber.replace(/^0/, '92')
    window.open(`https://wa.me/${formattedNumber}`, '_blank')
  }

  const handleHire = (repairmanData) => {
    console.log('Hiring:', repairmanData)
    alert(`Hiring ${repairmanData.repairmanProfile.fullName}...`)
  }

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value)
    setPage(1) // Reset to first page on city change
  }

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading repairmen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hire Expert Repairmen
          </h1>
          <p className="text-xl text-gray-600">
            Find trusted repair specialists near you for all your device repair needs
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label htmlFor="city-filter" className="text-sm font-medium text-gray-700 mr-2">
            Filter by City:
          </label>
          <select
            id="city-filter"
            value={selectedCity}
            onChange={handleCityChange}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Cities</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Repairmen Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {repairman.map((repair) => (
            <Link href={`/hire-repairman/${repair._id}`} key={repair._id}>
 <div
              key={repair._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex"
            >
              {/* Left: Image */}
              <div className="w-1/3 relative p-2">
                <img
                  src={repair.repairmanProfile.profilePhoto}
                  alt={repair.repairmanProfile.fullName}
                  className="w-full h-56 rounded-md"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
                  }}
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <Icon icon="mdi:star" className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Right: Data */}
              <div className="w-2/3 p-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
                      {repair.repairmanProfile.fullName}
                    </h3>

                    <div className="flex items-center gap-2">
                      {/* Chat Button */}
                      <button className="flex items-center gap-1 px-3 py-1 text-sm border rounded-md text-gray-700 hover:bg-orange-100 hover:text-orange-500 transition">
                        <Icon icon="mdi:chat" className="text-lg" />
                        Chat
                      </button>

                      {/* Verified Badge */}
                      <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                        <Icon icon="mdi:check-decagram" className="text-base text-green-500" />
                        Verified
                      </span>
                    </div>
                  </div>


                  <div className="flex items-center mb-3">
                    <Icon icon="mdi:store" className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 truncate">
                      {repair.repairmanProfile.shopName}
                    </h4>
                  </div>
                  <div className="flex items-start mb-3">
                    <Icon icon="mdi:map-marker" className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {repair.repairmanProfile.fullAddress}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {repair.repairmanProfile.city}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Icon icon="mdi:wrench" className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Specializations:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {repair.repairmanProfile.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* <div className="flex items-center justify-between mb-4 py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Icon icon="mdi:briefcase" className="w-4 h-4 text-gray-600 mr-1" />
                      <span className="text-sm text-gray-600">
                        {repair.repairmanProfile.totalJobs} Jobs
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Icon icon="mdi:email" className="w-4 h-4 text-gray-600 mr-1" />
                      <span className="text-sm text-gray-600">Verified</span>
                    </div>
                  </div> */}
                </div>


              </div>
            </div>
            </Link>
           
          ))}
        </div>

        {/* Pagination */}
        {repairman.length > 0 && (
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {repairman.length === 0 && !loading && (
          <div className="text-center py-12">
            <Icon icon="mdi:account-search" className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Repairmen Found</h3>
            <p className="text-gray-600">Try adjusting the city filter or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HireRepairman;