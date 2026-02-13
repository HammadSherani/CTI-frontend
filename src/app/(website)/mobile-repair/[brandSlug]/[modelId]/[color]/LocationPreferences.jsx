import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import axiosInstance from "@/config/axiosInstance";
import { usePathname } from "next/navigation";

const servicePreferences = [
  { value: 'pickup', label: 'Pickup & Delivery', icon: 'mdi:truck-delivery' },
  { value: 'drop-off', label: 'On-site Repair', icon: 'mdi:home-repair' },
];

export const LocationPreferences = ({
  Controller,
  control,
  errors,
  setValue,
  watch,
}) => {
  const pathname = usePathname();
  const DROPDOWN_STORAGE_KEY = `location_dropdowns_${pathname}`;

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false,
  });
  const [apiError, setApiError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Watch form values
  const formCountry = watch('location.country');
  const formState = watch('location.state');

  // Load saved dropdown data from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem(DROPDOWN_STORAGE_KEY);
      if (savedData) {
        try {
          const { savedCountries, savedStates, savedCities, savedCountryId, savedStateId } = JSON.parse(savedData);
          
          if (savedCountries) setCountries(savedCountries);
          if (savedStates) setStates(savedStates);
          if (savedCities) setCities(savedCities);
          if (savedCountryId) setSelectedCountry(savedCountryId);
          if (savedStateId) setSelectedState(savedStateId);
        } catch (error) {
          console.error('Error parsing saved dropdown data:', error);
        }
      }
    }
    setIsInitialized(true);
  }, []);

  // Save dropdown data to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      const dataToSave = {
        savedCountries: countries,
        savedStates: states,
        savedCities: cities,
        savedCountryId: selectedCountry,
        savedStateId: selectedState,
      };
      sessionStorage.setItem(DROPDOWN_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [countries, states, cities, selectedCountry, selectedState, isInitialized]);

  // Fetch Countries on component mount
  useEffect(() => {
    if (countries.length === 0) {
      fetchCountries();
    }
  }, []);

  // Sync selectedCountry with form value and fetch states
  useEffect(() => {
    if (formCountry && formCountry !== selectedCountry) {
      setSelectedCountry(formCountry);
      if (!states.length || selectedCountry !== formCountry) {
        fetchStates(formCountry);
      }
    } else if (!formCountry) {
      setStates([]);
      setCities([]);
      setSelectedState('');
    }
  }, [formCountry]);

  // Sync selectedState with form value and fetch cities
  useEffect(() => {
    if (formState && formState !== selectedState) {
      setSelectedState(formState);
      if (!cities.length || selectedState !== formState) {
        fetchCities(formState);
      }
    } else if (!formState) {
      setCities([]);
    }
  }, [formState]);

  const fetchCountries = async () => {
    setLoading(prev => ({ ...prev, countries: true }));
    setApiError('');
    try {
      const response = await axiosInstance.get('/public/countries');
      setCountries(response.data.data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setApiError('Failed to load countries');
    } finally {
      setLoading(prev => ({ ...prev, countries: false }));
    }
  };

  const fetchStates = async (countryId) => {
    setLoading(prev => ({ ...prev, states: true }));
    setApiError('');
    try {
      const response = await axiosInstance.get(`/public/states/country/${countryId}`);
      setStates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
      setApiError('Failed to load states');
    } finally {
      setLoading(prev => ({ ...prev, states: false }));
    }
  };

  const fetchCities = async (stateId) => {
    setLoading(prev => ({ ...prev, cities: true }));
    setApiError('');
    try {
      const response = await axiosInstance.get(`/public/cities/state/${stateId}`);
      setCities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setApiError('Failed to load cities');
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const handleCountryChange = (countryId) => {
    setSelectedCountry(countryId);
    setValue('location.country', countryId);
    setValue('location.state', '');
    setValue('location.city', '');
    setStates([]);
    setCities([]);
    setSelectedState('');
    if (countryId) {
      fetchStates(countryId);
    }
  };

  const handleStateChange = (stateId) => {
    setSelectedState(stateId);
    setValue('location.state', stateId);
    setValue('location.city', '');
    setCities([]);
    if (stateId) {
      fetchCities(stateId);
    }
  };

  return (
    <div className="space-y-4">
      {/* API Error Message */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <Icon icon="mdi:alert-circle" />
            {apiError}
          </p>
        </div>
      )}

      {/* Location Form Fields */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Address Details</h4>

        {/* Country Dropdown */}
        <Controller
          name="location.country"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <select
                {...field}
                disabled={loading.countries}
                onChange={(e) => {
                  handleCountryChange(e.target.value);
                }}
                className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.location?.country ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">
                  {loading.countries ? 'Loading countries...' : 'Select Country'}
                </option>
                {countries.map((country) => (
                  <option key={country._id} value={country._id}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.location?.country && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" />
                  {errors.location.country.message}
                </p>
              )}
            </div>
          )}
        />

        {/* State Dropdown */}
        <Controller
          name="location.state"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select
                {...field}
                disabled={!selectedCountry || loading.states}
                onChange={(e) => {
                  handleStateChange(e.target.value);
                }}
                className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.location?.state ? 'border-red-300' : 'border-gray-300'
                } ${!selectedCountry ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {loading.states ? 'Loading states...' : 'Select State'}
                </option>
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name}
                  </option>
                ))}
              </select>
              {errors.location?.state && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" />
                  {errors.location.state.message}
                </p>
              )}
            </div>
          )}
        />

        {/* City Dropdown */}
        <Controller
          name="location.city"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <select
                {...field}
                disabled={!selectedState || loading.cities}
                className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.location?.city ? 'border-red-300' : 'border-gray-300'
                } ${!selectedState ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {loading.cities ? 'Loading cities...' : 'Select City'}
                </option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.location?.city && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" />
                  {errors.location.city.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Address Field */}
        <Controller
          name="location.address"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea
                {...field}
                rows={3}
                placeholder="Enter your complete address"
                className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.location?.address ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.location?.address && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" />
                  {errors.location.address.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Optional Fields */}
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="location.zipCode"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code (Optional)</label>
                <input
                  {...field}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  type="number"
                  placeholder="Enter ZIP code"
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Preferred Date */}
      <Controller
        name="preferredDate"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
            <input
              {...field}
              type="date"
              min={(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString().split('T')[0];
              })()}
              className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.preferredDate ? 'border-red-300' : 'border-gray-300'
              }`}
              onChange={(e) => {
                const value = e.target.value;
                const formatted = new Date(value).toISOString().split("T")[0];
                field.onChange(formatted);
              }}
            />
            {errors.preferredDate && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <Icon icon="mdi:alert-circle" />
                {errors.preferredDate.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Service Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Service Preference *</label>
        <div className="grid grid-cols-2 gap-3">
          {servicePreferences.map((pref) => (
            <Controller
              key={pref.value}
              name="servicePreference"
              control={control}
              render={({ field }) => (
                <div
                  onClick={() => field.onChange(pref.value)}
                  className={`p-3 border rounded-md cursor-pointer text-center transition-colors ${
                    field.value === pref.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-orange-300 text-gray-700'
                  }`}
                >
                  <Icon
                    icon={pref.icon}
                    className={`text-xl mx-auto mb-2 ${
                      field.value === pref.value ? 'text-orange-500' : 'text-gray-400'
                    }`}
                  />
                  <span className="text-sm font-medium">{pref.label}</span>
                </div>
              )}
            />
          ))}
        </div>
        {errors.servicePreference && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <Icon icon="mdi:alert-circle" />
            {errors.servicePreference.message}
          </p>
        )}
      </div>
    </div>
  );
};