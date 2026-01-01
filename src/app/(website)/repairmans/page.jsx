"use client"

import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { City, State } from 'country-state-city'
import Loader from '@/components/Loader'

function HireRepairman() {
  const [repairman, setRepairman] = useState([])
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 30

  // const pakistanStates = State.getStatesOfCountry('PK')

  // const getCities = () => {
  //   if (selectedState) {
  //     const stateObj = pakistanStates.find(s => s.name === selectedState)
  //     if (stateObj) {
  //       return City.getCitiesOfState('TR', stateObj.isoCode)
  //     }
  //   }
  //   return City.getCitiesOfCountry('TR')
  // }

  // const cities = getCities()


  const getCities = async () => {
    try {
      const { data } = await axiosInstance.get("/public/cities")
      setCities(data.data)
    } catch (error) {
      handleError(error)
    }
  }

  const getRepairman = async () => {
    try {
      setLoading(true)
      const params = { page, limit }
      if (selectedCity) params.city = selectedCity
      if (selectedState) params.state = selectedState
      const { data } = await axiosInstance.get('/public/repairmans', { params })
      setRepairman(data.data.repairmans)
      setTotalPages(data.data.totalPages || 1)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRepairman()
    getCities()
  }, [page, selectedCity, selectedState])

  const handleStateChange = (e) => {
    setSelectedState(e.target.value)
    setSelectedCity('')
    setPage(1)
  }

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value)
    setPage(1)
  }

  // const handleClearFilters = () => {
  //   setSelectedCity('')
  //   setSelectedState('')
  //   setPage(1)
  // }

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  console.log("cities", cities);


  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading repairmen...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <Loader loading={loading}>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/" className="text-gray-600 hover:text-gray-800">
              <Icon icon="mdi:home" className="inline w-4 h-4 mr-1" />
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/repairmans" className="text-gray-600 hover:text-gray-800">
               Repairman
            </Link>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 items-center mb-6'>
            <div className="">
              <h1 className="text-4xl font-semibold text-gray-900">
                Hire Expert Repairmen
              </h1>
            </div>
            <div className="flex justify-end flex-wrap gap-4 items-end">
              <div className="w-[350px]">
                {/* <label htmlFor="city-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  <Icon icon="mdi:city" className="inline w-4 h-4 mr-1" />
                  Filter by City:
                </label> */}
                <select
                  id="city-filter"
                  value={selectedCity}
                  onChange={handleCityChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                // disabled={cities.length === 0}
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {/* {cities.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">Select a state first to see cities</p>
              )} */}
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {repairman.map((repair) => (
              <Link href={`/repairmans/${repair._id}`} key={repair._id}>
                <div className="bg-white grid-cols-1 p-2  grid  border border-gray-200 rounded-md transition-all duration-300 overflow-hidden flex">
                  <img
                    src={repair.repairmanProfile.profilePhoto}
                    alt={repair.repairmanProfile.fullName}
                    className="w-full h-44 rounded-md object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <Icon icon="mdi:star" className="w-5 h-5 text-yellow-500" />
                    </div>
                  </div>

                  <div className=" flex flex-col justify-between">
                    <div className='p-2'>
                      {/* <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
                        {repair.repairmanProfile.fullName}
                      </h3>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                          <Icon icon="mdi:check-decagram" className="text-base text-green-500" />
                          Verified
                        </span>
                      </div>
                    </div> */}

                      <div className="flex items-center mb-3 flex-1">
                        {/* <Icon icon="mdi:store" className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0" /> */}
                        <h4 className="font-semibold line-clamp-1 flex-1 text-lg capitalize text-gray-900 truncate">
                          {repair.repairmanProfile.shopName}
                        </h4>
                        {/* <Icon icon="icon-park-outline:share" className='w-4 h-4 text-gray-400 mr-2 flex-shrink-0' /> */}
                      </div>

                      <div className="flex items-start mb-3">
                        <Icon icon="mdi:map-marker" className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {repair.repairmanProfile.fullAddress}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {repair?.city.name}
                            {repair?.state.name && `, ${repair?.state.name}`}
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
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Previous
              </button>
              <span className="text-gray-700 flex items-center">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
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
              <p className="text-gray-600">Try adjusting the filters or check back later.</p>
            </div>
          )}
        </div>
      </div>
    </Loader>
  )
}

export default HireRepairman