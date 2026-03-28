"use client";

import React, { useState, useEffect, useCallback } from 'react';
import SubHeader from '@/components/SubHeader';
import FilterSidebar from '@/components/FilterSidebar';
import Loader from '@/components/Loader';
import { Icon } from '@iconify/react';
import { useMultiLoading } from '@/hooks/useMultiloading';   // Adjust path if needed
import axiosInstance from '@/config/axiosInstance';

const DEFAULT_PROFILE_IMG = "https://via.placeholder.com/400x300?text=Repairman";

export default function HireRepairman() {
  const { multiLoading, start, stop } = useMultiLoading();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [repairmen, setRepairmen] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });

  const [filters, setFilters] = useState({});
  const [loadingRepairmen, setLoadingRepairmen] = useState(false);

  // Fetch Countries
  const fetchCountries = useCallback(async () => {
    start('countries');
    try {
      const res = await axiosInstance.get('/public/countries');   // Adjust endpoint
      setCountries(res.data.data || []);
    } catch (err) {
      console.error("Failed to load countries", err);
    } finally {
      stop('countries');
    }
  }, []);

  // Fetch States by Country
  const fetchStates = useCallback(async (countryId) => {
    if (!countryId) {
      setStates([]);
      return;
    }
    start('states');
    try {
      const res = await axiosInstance.get(`/public/states/country/${countryId}`);
      setStates(res.data.data || []);
    } catch (err) {
      console.error("Failed to load states", err);
    } finally {
      stop('states');
    }
  }, []);

  // Fetch Cities by State
  const fetchCities = useCallback(async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    start('cities');
    try {
      const res = await axiosInstance.get(`/public/cities/state/${stateId}`);
      setCities(res.data.data || []);
    } catch (err) {
      console.error("Failed to load cities", err);
    } finally {
      stop('cities');
    }
  }, []);

  // Fetch Repairmen (with filters)
  const fetchRepairmen = useCallback(async (appliedFilters = {}) => {
    setLoadingRepairmen(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (appliedFilters.country) params.append('country', appliedFilters.country);
      if (appliedFilters.state) params.append('state', appliedFilters.state);
      if (appliedFilters.city) params.append('city', appliedFilters.city);
      if (appliedFilters.minRating) params.append('minRating', appliedFilters.minRating);
      if (appliedFilters.categories?.length) params.append('specializations', appliedFilters.categories.join(','));

      const res = await axiosInstance.get(`/public/repairmans?${params.toString()}`);
      
      setRepairmen(res.data.data?.repairmans || []);
      setPagination(res.data.data?.pagination || { total: 0 });
    } catch (err) {
      console.error("Failed to load repairmen", err);
      setRepairmen([]);
    } finally {
      setLoadingRepairmen(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCountries();
    fetchRepairmen();        // initial load without filters
  }, [fetchCountries, fetchRepairmen]);

  // Handle filter changes from sidebar
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    fetchRepairmen(newFilters);
  };

  // Load states when country changes
  useEffect(() => {
    if (filters.country) fetchStates(filters.country);
  }, [filters.country, fetchStates]);

  // Load cities when state changes
  useEffect(() => {
    if (filters.state) fetchCities(filters.state);
  }, [filters.state, fetchCities]);

  // Safe image with fallback
 const RepairmanCard = ({ repairman }) => {
  const profile = repairman.repairmanProfile || {};
  const photo = profile.profilePhoto || DEFAULT_PROFILE_IMG;
  const name = profile.fullName || repairman.name || "Repair Expert";
  const shop = profile.shopName || "Mobile & Laptop Repair";
  const location = `${repairman.city?.name || ''}${repairman.state?.name ? `, ${repairman.state.name}` : ''}`;
  const experience = profile.yearsOfExperience ? `${profile.yearsOfExperience}+ Years` : '6+ Years';
  const rating = profile.rating || 4.8;
  const specs = profile.specializations?.length
    ? profile.specializations.slice(0, 2).join(" • ")
    : "General Repair";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
      
      {/* Photo — tall, full width */}
      <div className="h-64 w-full overflow-hidden">
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover object-top"
          onError={(e) => { e.target.src = DEFAULT_PROFILE_IMG; }}
        />
      </div>

      {/* Content */}
      <div className="pt-4 p-2">
        
        {/* Name + Location badge */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight">{name}</h3>
          {location && (
            <span className="text-xs text-orange-500 border border-orange-400 rounded-full px-2 py-0.5 whitespace-nowrap shrink-0 mt-0.5">
              {location}
            </span>
          )}
        </div>

        {/* Specialty + Rating row */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-nowrap text-sm text-gray-600">
            <Icon icon="mdi:shield-check-outline" className="text-orange-500 text-base" />
            <span>Specialty : {experience}</span>
          </div>
          <div className="flex text-nowrap items-center gap-1 text-sm text-gray-600">
            <Icon icon="mdi:star" className="text-orange-500 text-base" />
            <span>{rating} Ratings</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-3" />

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button className="text-sm text-orange-500 font-medium hover:underline">
            View Profile
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
            Book Now
          </button>
        </div>

      </div>
    </div>
  );
};

  return (
      <>

    <SubHeader 
        title="Find Trusted Repairmen Near You" 
        subtitle="Browse our network of skilled repair professionals in your area" 
      />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <FilterSidebar 
              onFiltersChange={handleFiltersChange}
              countries={countries}
              states={states}
              cities={cities}
              loading={multiLoading.countries || multiLoading.states || multiLoading.cities}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Expert Repairmen 
                <span className="text-primary-600 ml-2">({repairmen.length})</span>
              </h2>
              <p className="text-gray-500">Showing results based on your location and filters</p>
            </div>

            {loadingRepairmen ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : repairmen.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {repairmen.map((man) => (
                  <RepairmanCard key={man._id} repairman={man} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border">
                <Icon icon="mdi:emoticon-sad-outline" className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700">No repairmen found</h3>
                <p className="text-gray-500 mt-2">Try changing your filters or location</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </>
  );
}