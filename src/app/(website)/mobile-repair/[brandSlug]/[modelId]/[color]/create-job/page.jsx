'use client';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';

const schema = yup.object().shape({
  title: yup.string().required('Job title is required').min(5, 'Title must be at least 5 characters'),
  deviceInfo: yup.object().shape({
    purchaseYear: yup.number().min(2000, 'Invalid year').max(new Date().getFullYear(), 'Cannot be future year').optional(),
    warrantyStatus: yup.string().required('Warranty status is required'),
  }),
  urgency: yup.string().required('Urgency level is required'),
  budget: yup.object().shape({
    min: yup.number().min(0, 'Minimum budget cannot be negative').optional(),
    max: yup.number().min(0, 'Maximum budget cannot be negative').optional(),
    currency: yup.string().required('Currency is required'),
  }),
  location: yup.object().shape({
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    district: yup.string().optional(),
    zipCode: yup.string().optional(),
    coordinates: yup.array().of(yup.number().required()).length(2, 'Coordinates must contain exactly two values').nullable().optional(),
  }),
  preferredTime: yup.date().min(new Date(), 'Preferred time must be in the future').required('Preferred time is required'),
  servicePreference: yup.string().required('Service preference is required'),
  selectedService: yup.string().required('Please select a service'),
  customService: yup.string().when('selectedService', {
    is: 'other',
    then: yup.string().required('Please describe your custom service'),
    otherwise: yup.string().optional(),
  }),
});

const repairServices = [
  { value: 'screen', label: 'Screen', icon: 'mdi:cellphone-screenshot' },
  { value: 'battery', label: 'Battery', icon: 'mdi:battery' },
  { value: 'charging_port', label: 'Charging Port', icon: 'mdi:power-plug' },
  { value: 'speaker', label: 'Speaker', icon: 'mdi:volume-high' },
  { value: 'microphone', label: 'Microphone', icon: 'mdi:microphone' },
  { value: 'camera', label: 'Camera', icon: 'mdi:camera' },
  { value: 'home_button', label: 'Home Button', icon: 'mdi:circle' },
  { value: 'volume_buttons', label: 'Volume Buttons', icon: 'mdi:volume-plus' },
  { value: 'power_button', label: 'Power Button', icon: 'mdi:power' },
  { value: 'water_damage', label: 'Water Damage', icon: 'mdi:water' },
  { value: 'software_issue', label: 'Software Issue', icon: 'mdi:cog' },
  { value: 'other', label: 'Other', icon: 'mdi:dots-horizontal' },
];

const servicePreferences = [
  { value: 'pickup', label: 'Pickup & Delivery', icon: 'mdi:truck-delivery', desc: 'We collect and deliver your device' },
  { value: 'drop-off', label: 'On-site Repair', icon: 'mdi:home-repair', desc: 'Technician visits your location' },
  { value: 'both', label: 'Both', icon: 'mdi:home-repair', desc: 'Technician visits your location' },
];

const urgencyLevels = [
  { value: 'low', label: 'Low Priority', icon: 'mdi:speedometer-slow', color: 'text-green-600', desc: '3-5 business days' },
  { value: 'medium', label: 'Medium Priority', icon: 'mdi:speedometer-medium', color: 'text-yellow-600', desc: '1-2 business days' },
  { value: 'high', label: 'High Priority', icon: 'mdi:speedometer', color: 'text-red-600', desc: 'Same day service' },
  { value: 'urgent', label: 'Emergency', icon: 'mdi:alarm-light', color: 'text-red-700', desc: 'Immediate attention' }
];

const warrantyOptions = [
  { value: 'active', label: 'Under Warranty', icon: 'mdi:shield-check', color: 'text-green-600' },
  { value: 'expired', label: 'Warranty Expired', icon: 'mdi:shield-off', color: 'text-red-600' },
  { value: 'unknown', label: 'Not Sure', icon: 'mdi:help-circle', color: 'text-gray-600' },
];

export default function CreateRepairJobForm() {
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      deviceInfo: {
        purchaseYear: '',
        warrantyStatus: '',
      },
      selectedService: '',
      customService: '',
      urgency: 'medium',
      budget: {
        min: '',
        max: '',
        currency: 'PKR'
      },
      location: {
        address: '',
        city: '',
        district: '',
        zipCode: '',
        coordinates: null
      },
      preferredTime: '',
      servicePreference: 'pickup',
      maxOffers: 10,
      autoSelectBest: false
    }
  });

  const selectedService = watch('selectedService');
  const coordinates = watch('location.coordinates');

  const handleServiceSelect = (serviceValue) => {
    setValue('selectedService', serviceValue);
    setIsServiceDropdownOpen(false);
    
    // Clear custom service if not selecting "other"
    if (serviceValue !== 'other') {
      setValue('customService', '');
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('location.coordinates', [latitude, longitude]);
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError('Location access denied or unavailable.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const onSubmit = async (data) => {
    try {
      console.log('Form Data:', data);
      // Here you would normally submit to your API
      alert('Form submitted successfully!');
      reset();
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  const selectedServiceObj = repairServices.find(service => service.value === selectedService);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full mx-auto max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          {/* Device Header Section */}
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {/* Device Image Placeholder */}
              <div className="w-20 h-28 bg-black rounded-lg flex items-center justify-center">
                <Icon icon="mdi:cellphone" className="text-gray-400 text-3xl" />
              </div>
              
              {/* Device Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Xiaomi Redmi 5A
                </h2>
                <p className="text-gray-600 mt-1">
                  Color: <span className="font-medium">Blue</span>
                </p>
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pick Your Repair Service</h3>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-between hover:border-orange-400 focus:outline-none focus:border-orange-500 bg-white"
              >
                <div className="flex items-center gap-3">
                  {selectedServiceObj ? (
                    <>
                      <Icon icon={selectedServiceObj.icon} className="text-xl text-orange-500" />
                      <span className="font-medium text-gray-900">{selectedServiceObj.label}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">Select a service</span>
                  )}
                </div>
                <Icon 
                  icon={isServiceDropdownOpen ? "mdi:chevron-up" : "mdi:chevron-down"} 
                  className="text-xl text-gray-400" 
                />
              </button>

              {/* Dropdown Menu */}
              {isServiceDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {repairServices.map((service) => (
                    <button
                      key={service.value}
                      type="button"
                      onClick={() => handleServiceSelect(service.value)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left"
                    >
                      <Icon icon={service.icon} className="text-lg text-gray-600" />
                      <span className="text-gray-900">{service.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {errors.selectedService && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <Icon icon="mdi:alert-circle" />
                {errors.selectedService.message}
              </p>
            )}

            {/* Custom Service Input */}
            {selectedService === 'other' && (
              <div className="mt-4">
                <Controller
                  name="customService"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe your repair service
                      </label>
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Please describe the service you need..."
                        className={`w-full p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                          errors.customService ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.customService && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <Icon icon="mdi:alert-circle" />
                          {errors.customService.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            )}
          </div>

          {selectedService && (
            <form onSubmit={handleSubmit(onSubmit)}>
              
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="mdi:clipboard-text" className="text-xl text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
                </div>
                
                <div className="mb-4">
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                          {...field}
                          type="text"
                          placeholder="e.g., iPhone 14 Pro screen replacement"
                          className={`w-full p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.title ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <Icon icon="mdi:alert-circle" />
                            {errors.title.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {urgencyLevels.map((level) => (
                      <Controller
                        key={level.value}
                        name="urgency"
                        control={control}
                        render={({ field }) => (
                          <div
                            onClick={() => field.onChange(level.value)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              field.value === level.value 
                                ? 'border-orange-500 bg-orange-50' 
                                : 'border-gray-300 hover:border-orange-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon icon={level.icon} className={`text-lg ${level.color}`} />
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{level.label}</h4>
                                <p className="text-xs text-gray-600">{level.desc}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="mdi:cellphone" className="text-xl text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Device Information</h3>
                </div>

                <div className="mb-4">
                  <Controller
                    name="deviceInfo.purchaseYear"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Year (Optional)</label>
                        <input
                          {...field}
                          type="number"
                          placeholder="e.g., 2023"
                          className={`w-full p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.deviceInfo?.purchaseYear ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.deviceInfo?.purchaseYear && (
                          <p className="mt-1 text-sm text-red-600">{errors.deviceInfo.purchaseYear.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Warranty Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Status</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {warrantyOptions.map((warranty) => (
                      <Controller
                        key={warranty.value}
                        name="deviceInfo.warrantyStatus"
                        control={control}
                        render={({ field }) => (
                          <div
                            onClick={() => field.onChange(warranty.value)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              field.value === warranty.value 
                                ? 'border-orange-500 bg-orange-50' 
                                : 'border-gray-300 hover:border-orange-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon icon={warranty.icon} className={`text-lg ${warranty.color}`} />
                              <span className="text-sm font-medium text-gray-900">{warranty.label}</span>
                            </div>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                  {errors.deviceInfo?.warrantyStatus && (
                    <p className="mt-2 text-sm text-red-600">{errors.deviceInfo.warrantyStatus.message}</p>
                  )}
                </div>
              </div>

              {/* Location & Preferences */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="mdi:map-marker" className="text-xl text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Location & Preferences</h3>
                </div>

                {/* Service Preference */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Preference</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {servicePreferences.map((pref) => (
                      <Controller
                        key={pref.value}
                        name="servicePreference"
                        control={control}
                        render={({ field }) => (
                          <div
                            onClick={() => field.onChange(pref.value)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              field.value === pref.value 
                                ? 'border-orange-500 bg-orange-50' 
                                : 'border-gray-300 hover:border-orange-300'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <Icon icon={pref.icon} className={`text-lg mt-0.5 ${field.value === pref.value ? 'text-orange-500' : 'text-gray-400'}`} />
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{pref.label}</h4>
                                <p className="text-xs text-gray-600 mt-1">{pref.desc}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Location Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Controller
                    name="location.address"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          {...field}
                          type="text"
                          placeholder="123 Main Street"
                          className={`w-full p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.location?.address ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.location?.address && (
                          <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    name="location.city"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          {...field}
                          type="text"
                          placeholder="e.g., Karachi"
                          className={`w-full p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.location?.city ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.location?.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <Controller
                  name="preferredTime"
                  control={control}
                  render={({ field }) => (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                      <input
                        {...field}
                        type="datetime-local"
                        min={getMinDateTime()}
                        className={`w-full p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.preferredTime ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.preferredTime && (
                        <p className="mt-1 text-sm text-red-600">{errors.preferredTime.message}</p>
                      )}
                    </div>
                  )}
                />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Auto-detect Location</span>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isGettingLocation ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Detecting...
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:crosshairs-gps" />
                          Get Location
                        </>
                      )}
                    </button>
                  </div>
                  
                  {locationError && (
                    <p className="text-sm text-red-600 mt-2">{locationError}</p>
                  )}
                  
                  {coordinates && (
                    <p className="text-sm text-green-600 mt-2">
                      Location detected: {coordinates[0]?.toFixed(6)}, {coordinates[1]?.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="mdi:currency-usd" className="text-xl text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Budget Range (Optional)</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Controller
                    name="budget.min"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Budget</label>
                        <input
                          {...field}
                          type="number"
                          placeholder="0"
                          className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="budget.max"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Budget</label>
                        <input
                          {...field}
                          type="number"
                          placeholder="1000"
                          className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="budget.currency"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          {...field}
                          className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="PKR">PKR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-orange-500 hover:text-orange-600 underline">
                      Terms and Conditions
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span>Book Now</span>
                      <Icon icon="mdi:arrow-right" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* Default state when no service selected */}
          {!selectedService && (
            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No Service Selected</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="terms-default"
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  disabled
                />
                <label htmlFor="terms-default" className="text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="#" className="text-orange-500 hover:text-orange-600 underline">
                    Terms and Conditions
                  </a>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};