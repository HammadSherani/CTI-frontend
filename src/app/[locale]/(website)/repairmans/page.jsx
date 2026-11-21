"use client";

import React, { useState, useEffect, useCallback } from 'react';
import SubHeader from '@/components/SubHeader';
import FilterSidebar from '@/components/FilterSidebar';
import Loader from '@/components/Loader';
import { Icon } from '@iconify/react';
import { useMultiLoading } from '@/hooks/useMultiloading';   
import axiosInstance from '@/config/axiosInstance';
import { Link } from '@/i18n/navigation';

const DEFAULT_PROFILE_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" fill="#9ca3af" font-family="sans-serif" font-size="22" text-anchor="middle" dominant-baseline="middle">Repairman</text></svg>');

const RepairmanCard = ({ repairman }) => {
  const profile = repairman.repairmanProfile || {};
  const photo = profile.profilePhoto || DEFAULT_PROFILE_IMG;
  const name = profile.fullName || repairman.name || 'Repair Expert';
  const shop = profile.shopName || '';
  const location = [repairman.city?.name, repairman.state?.name].filter(Boolean).join(', ');
  const years = Number(profile.yearsOfExperience) || 0;
  const rating = Number(profile.rating) || 0;
  const specs = (profile.specializations || []).filter(Boolean);
  const href = `/repairmans/${repairman._id}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
      <Link href={href} className="block h-64 w-full overflow-hidden bg-gray-100">
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover object-top"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PROFILE_IMG; }}
        />
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 leading-tight truncate">{name}</h3>
            {shop && <p className="text-xs text-gray-500 truncate mt-0.5">{shop}</p>}
          </div>
          {location && (
            <span className="text-xs text-orange-500 border border-orange-400 rounded-full px-2 py-0.5 whitespace-nowrap shrink-0 mt-0.5">
              {location}
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Icon icon="mdi:briefcase-check-outline" className="text-orange-500 text-base" />
            <span>{years > 0 ? `${years}+ Years` : 'Experience N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="mdi:star" className="text-orange-500 text-base" />
            <span>{rating > 0 ? `${rating.toFixed(1)} Rating` : 'New'}</span>
          </div>
          {profile.pickupService && (
            <div className="flex items-center gap-1">
              <Icon icon="mdi:truck-fast-outline" className="text-orange-500 text-base" />
              <span>Pickup</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3 min-h-[28px]">
          {(specs.length ? specs.slice(0, 3) : ['General Repair']).map((sp) => (
            <span key={sp} className="text-[11px] bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5">{sp}</span>
          ))}
          {specs.length > 3 && (
            <span className="text-[11px] text-gray-400 py-0.5">+{specs.length - 3} more</span>
          )}
        </div>

        <div className="border-t border-gray-100 my-3 mt-auto" />

        <div className="flex items-center justify-between">
          <Link href={href} className="text-sm text-orange-500 font-medium hover:underline">
            View Profile
          </Link>
          <Link href={href} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function HireRepairman() {
  const { multiLoading, start, stop } = useMultiLoading();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [repairmen, setRepairmen] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [loadingRepairmen, setLoadingRepairmen] = useState(false);
  // Fetch Countries
  const fetchCountries = useCallback(async () => {
    start('countries');
    try {
      const res = await axiosInstance.get('/public/countries'); 
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
  const fetchRepairmen = useCallback(async (appliedFilters = {}, pageNum = 1) => {
    setLoadingRepairmen(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (appliedFilters.country) params.append('country', appliedFilters.country);
      if (appliedFilters.state) params.append('state', appliedFilters.state);
      if (appliedFilters.city) params.append('city', appliedFilters.city);
      if (appliedFilters.minRating) params.append('minRating', appliedFilters.minRating);
      if (appliedFilters.categories?.length) params.append('specializations', appliedFilters.categories.join(','));

      params.append('page', pageNum);
      params.append('limit', 9);

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
      setPage(1); 
  fetchRepairmen(newFilters, 1);
  };

  const handlePageChange = (newPage) => {
  setPage(newPage);
  fetchRepairmen(filters, newPage);
};
  // Load states when country changes
  useEffect(() => {
    if (filters.country) fetchStates(filters.country);
  }, [filters.country, fetchStates]);

  // Load cities when state changes
  useEffect(() => {
    if (filters.state) fetchCities(filters.state);
  }, [filters.state, fetchCities]);

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
                <span className="text-primary-600 ml-2">({pagination.total ?? repairmen.length})</span>
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


{(pagination.totalPages || 0) > 1 && (
  <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
    
    {/* Prev */}
    <button
      disabled={page === 1}
      onClick={() => handlePageChange(page - 1)}
      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
    >
      Prev
    </button>

    {/* Page Numbers */}
    {[...Array(pagination.totalPages)].map((_, i) => {
      const p = i + 1;
      return (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`px-4 py-2 rounded-lg border ${
            page === p
              ? "bg-primary-600 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {p}
        </button>
      );
    })}

    {/* Next */}
    <button
      disabled={page === pagination.totalPages}
      onClick={() => handlePageChange(page + 1)}
      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
    >
      Next
    </button>

  </div>
)}

      </div>



      </>
  );
}