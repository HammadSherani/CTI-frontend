"use client";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { CustomDropdown } from "../admin/ecom/Dropdown";
import KycField, { FieldError, FieldLabel } from "./KycField";
import PhoneInput from "../../common/PhoneInput";
import { SELLER_LIMITS, TR_PLACEHOLDERS, digitsOnly, nameInput } from "@/helper/sellerProfileRules";
import { findTurkey } from "@/helper/turkey";

export default function PersonalInformation({ control, errors, user, watch, setValue }) {
  const [countries, setCountries] = useState([]);
  // each list remembers which country / state it was loaded for
  const [stateList, setStateList] = useState({ of: "", items: [] });
  const [cityList, setCityList] = useState({ of: "", items: [] });

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const selectedCity = watch("city");
  const states = stateList.of === selectedCountry ? stateList.items : [];
  const cities = cityList.of === selectedState ? cityList.items : [];

  // The platform works only in Turkey, so it is always the selected country
  useEffect(() => {
    const turkey = findTurkey(countries);
    if (!turkey || selectedCountry === turkey._id) return;
    if (selectedCountry) {
      setValue("state", "");
      setValue("city", "");
    }
    setValue("country", turkey._id);
  }, [countries, selectedCountry, setValue]);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes (a late reply for an earlier country is ignored)
  useEffect(() => {
    if (!selectedCountry) return setLoadingStates(false);
    let stale = false;
    setLoadingStates(true);
    axiosInstance
      .get(`/public/states/country/${selectedCountry}`)
      .then((res) => !stale && setStateList({ of: selectedCountry, items: res.data?.data || [] }))
      .catch(() => !stale && toast.error("Failed to load states."))
      .finally(() => !stale && setLoadingStates(false));
    return () => { stale = true; };
  }, [selectedCountry]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!selectedState) return setLoadingCities(false);
    let stale = false;
    setLoadingCities(true);
    axiosInstance
      .get(`/public/cities/state/${selectedState}`)
      .then((res) => !stale && setCityList({ of: selectedState, items: res.data?.data || [] }))
      .catch(() => !stale && toast.error("Failed to load cities."))
      .finally(() => !stale && setLoadingCities(false));
    return () => { stale = true; };
  }, [selectedState]);

  // A saved state or city that does not belong to the selection is removed
  useEffect(() => {
    if (!selectedState || !selectedCountry || stateList.of !== selectedCountry) return;
    if (stateList.items.some((s) => (s._id || s.id) === selectedState)) return;
    setValue("state", "");
    setValue("city", "");
  }, [stateList, selectedCountry, selectedState, setValue]);

  useEffect(() => {
    if (!selectedCity || !selectedState || cityList.of !== selectedState) return;
    if (!cityList.items.some((c) => (c._id || c.id) === selectedCity)) setValue("city", "");
  }, [cityList, selectedState, selectedCity, setValue]);

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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <KycField
          control={control} errors={errors} name="fullName" label="Full Name" required
          placeholder="Your full legal name" filter={nameInput} maxLength={SELLER_LIMITS.fullName.max}
        />

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <Controller name="dob" control={control} render={({ field }) => (
            <input
              {...field}
              type="date"
                    max={new Date().toISOString().split("T")[0]}

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
          <FieldLabel required>Phone Number</FieldLabel>
          <Controller name="phoneNumber" control={control} render={({ field }) => (
            <PhoneInput {...field} hasError={Boolean(errors.phoneNumber)} />
          )} />
          <FieldError message={errors.phoneNumber?.message} />
        </div>

        <KycField
          control={control} errors={errors} name="storeAddress" label="Store Address" required textarea rows={2}
          placeholder={TR_PLACEHOLDERS.address} maxLength={SELLER_LIMITS.storeAddress.max} className="md:col-span-2"
        />

        {/* Country Dropdown */}
<div>
  <label className="block text-sm font-medium text-gray-600 mb-1.5">
    Country <span className="text-red-500">*</span>
  </label>

  <Controller
    name="country"
    control={control}
    render={({ field }) => (
      <CustomDropdown
        value={field.value}
        onChange={(val) => {
          field.onChange(val);
          setValue("state", "");
          setValue("city", "");
        }}
        disabled={loadingCountries}
        searchable={true}
        placeholder={
          loadingCountries
            ? "Loading countries..."
            : "Select Country"
        }
        options={countries.map((c) => ({
          label: c.name,
          value: c._id || c.id,
        }))}
      />
    )}
  />

  {errors.country && (
    <p className="text-red-500 text-xs mt-1">
      {errors.country.message}
    </p>
  )}
</div>

{/* State Dropdown */}
<div>
  <label className="block text-sm font-medium text-gray-600 mb-1.5">
    State <span className="text-red-500">*</span>
  </label>

  <Controller
    name="state"
    control={control}
    render={({ field }) => (
      <CustomDropdown
        value={field.value}
        onChange={(val) => {
          field.onChange(val);
          setValue("city", "");
        }}
        disabled={!selectedCountry || loadingStates}
        searchable={true}
        placeholder={
          !selectedCountry
            ? "First select a country"
            : loadingStates
            ? "Loading states..."
            : "Select State"
        }
        options={states.map((s) => ({
          label: s.name,
          value: s._id || s.id,
        }))}
      />
    )}
  />

  {errors.state && (
    <p className="text-red-500 text-xs mt-1">
      {errors.state.message}
    </p>
  )}
</div>

        {/* City Dropdown */}
   <div>
  <label className="block text-sm font-medium text-gray-600 mb-1.5">
    City <span className="text-red-500">*</span>
  </label>

  <Controller
    name="city"
    control={control}
    render={({ field }) => (
      <CustomDropdown
        value={field.value}
        onChange={field.onChange}
        disabled={!selectedState || loadingCities}
        searchable={true}
        placeholder={
          !selectedState
            ? "First select a state"
            : loadingCities
            ? "Loading cities..."
            : "Select City"
        }
        options={cities.map((c) => ({
          label: c.name,
          value: c._id || c.id,
        }))}
      />
    )}
  />

  {errors.city && (
    <p className="text-red-500 text-xs mt-1">
      {errors.city.message}
    </p>
  )}
</div>
      

        <KycField
          control={control} errors={errors} name="zipCode" label="ZIP Code" required placeholder={TR_PLACEHOLDERS.zip}
          inputMode="numeric" filter={digitsOnly}
          maxLength={5} showCount={false}
        />

      </div>
    </div>
  );
}