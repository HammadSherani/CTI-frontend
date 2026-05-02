"use client";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";

export default function PersonalInformation({ control, errors, user, watch, setValue }) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
      // Reset state & city only if user changed country (not initial load)
      setValue("state", "");
      setValue("city", "");
      setCities([]);
    }
  }, [selectedCountry]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
      setValue("city", "");
    }
  }, [selectedState]);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const res = await axiosInstance.get("/public/countries");
      setCountries(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to load countries. Please refresh.");
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      setLoadingStates(true);
      const res = await axiosInstance.get(`/public/states/country/${countryId}`);
      setStates(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
      toast.error("Failed to load states.");
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      setLoadingCities(true);
      const res = await axiosInstance.get(`/public/cities/state/${stateId}`);
      setCities(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to load cities.");
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Controller name="fullName" control={control} render={({ field }) => (
            <input
              {...field}
              placeholder="Your full legal name"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all
                ${errors.fullName ? "border-red-400" : "border-gray-300"}`}
            />
          )} />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <Controller name="dob" control={control} render={({ field }) => (
            <input
              {...field}
              type="date"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all
                ${errors.dob ? "border-red-400" : "border-gray-300"}`}
            />
          )} />
          {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <Controller name="gender" control={control} render={({ field }) => (
            <div className="flex gap-5 pt-1">
              {["Male", "Female", "Other"].map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="radio"
                    {...field}
                    value={g}
                    checked={field.value === g}
                    className="accent-teal-600"
                  />
                  {g}
                </label>
              ))}
            </div>
          )} />
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Controller name="phoneNumber" control={control} render={({ field }) => (
            <input
              {...field}
              type="tel"
              placeholder="+92 or 03XX..."
              onChange={(e) => field.onChange(e.target.value.replace(/[^0-9+\-\s]/g, ""))}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all
                ${errors.phoneNumber ? "border-red-400" : "border-gray-300"}`}
            />
          )} />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
        </div>

 

        {/* Store Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Store Address <span className="text-red-500">*</span>
          </label>
          <Controller name="storeAddress" control={control} render={({ field }) => (
            <textarea
              {...field}
              rows={2}
              placeholder="Full store address"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none
                ${errors.storeAddress ? "border-red-400" : "border-gray-300"}`}
            />
          )} />
          {errors.storeAddress && <p className="text-red-500 text-xs mt-1">{errors.storeAddress.message}</p>}
        </div>

        {/* Country Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Country <span className="text-red-500">*</span>
          </label>
          <Controller name="country" control={control} render={({ field }) => (
            <select
              {...field}
              disabled={loadingCountries}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white
                ${errors.country ? "border-red-400" : "border-gray-300"}
                ${loadingCountries ? "bg-gray-100 cursor-wait" : ""}`}
            >
              <option value="">
                {loadingCountries ? "Loading countries..." : "Select Country"}
              </option>
              {countries.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )} />
          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
        </div>

        {/* State Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            State <span className="text-red-500">*</span>
          </label>
          <Controller name="state" control={control} render={({ field }) => (
            <select
              {...field}
              disabled={!selectedCountry || loadingStates}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white
                ${errors.state ? "border-red-400" : "border-gray-300"}
                ${!selectedCountry || loadingStates ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">
                {!selectedCountry
                  ? "First select a country"
                  : loadingStates
                  ? "Loading states..."
                  : "Select State"}
              </option>
              {states.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )} />
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
        </div>

        {/* City Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            City <span className="text-red-500">*</span>
          </label>
          <Controller name="city" control={control} render={({ field }) => (
            <select
              {...field}
              disabled={!selectedState || loadingCities}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white
                ${errors.city ? "border-red-400" : "border-gray-300"}
                ${!selectedState || loadingCities ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">
                {!selectedState
                  ? "First select a state"
                  : loadingCities
                  ? "Loading cities..."
                  : "Select City"}
              </option>
              {cities.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )} />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
        </div>

      

        {/* ZIP Code */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <Controller name="zipCode" control={control} render={({ field }) => (
            <input
              {...field}
              placeholder="ZIP / Postal code"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all
                ${errors.zipCode ? "border-red-400" : "border-gray-300"}`}
            />
          )} />
          {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
        </div>

      </div>
    </div>
  );
}