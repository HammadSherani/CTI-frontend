"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useRouter,Link } from '@/i18n/navigation';
import { useParams, usePathname } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import LoginModal from './LoginModal';
import { ServiceSelector } from './ServiceSelector';
import { JobDetails } from './JobDetails';
import { DeviceInfo } from './DeviceInfo';
import { LocationPreferences } from './LocationPreferences';
import { BudgetRange } from './BudgetRange';
import Loader from '@/components/Loader';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { setAuth } from '@/store/auth';
import { setCurrentUser } from '@/store/chat';
import TermsModal from '@/components/website/home/termsModal';

// Updated Yup schema (removed customServices)
const schema = yup.object().shape({
  description: yup.string().required('Description is required').min(10, 'Please provide more details (minimum 10 characters)').max(1000, "Description is too long"),
  
  deviceInfo: yup.object().shape({
    warrantyStatus: yup.string().required('Warranty status is required'),
  }),
  urgency: yup.string().required('Urgency level is required'),
  budget: yup.object().shape({
    min: yup
      .number()
      .typeError("Minimum budget must be a number")
      .min(0, "Minimum budget cannot be negative")
      .nullable(),

    max: yup
      .number()
      .typeError("Maximum budget must be a number")
      .min(0, "Maximum budget cannot be negative")
      .nullable()
      .test(
        "is-greater",
        "Maximum budget must be greater than minimum",
        function (value) {
          const { min } = this.parent;
          if (!min || !value) return true;
          return value >= min;
        }
      ),
    currency: yup.string().required('Currency is required'),
  }),
  location: yup.object().shape({
 address: yup
      .string()
      .required("Address is required")
      .min(10, "Address must be at least 10 characters")
      .max(200, "Address is too long"),    city: yup.string().required('City is required'),
    district: yup.string().optional(),

    zipCode: yup
      .string()
      .matches(/^[0-9]{4,10}$/, "Invalid zip code")
      .min(4, "Zip code must be at least 4 digits")
      .max(10, "Zip code must be at most 10 digits")
      .nullable(),    coordinates: yup.array().of(yup.number().optional()).length(2, 'Coordinates must contain exactly two values').nullable().optional(),
  }),
 
  preferredDate: yup
    .date()
    .typeError("Invalid date")
    .min(new Date(), "Preferred date must be in the future")
    .required("Preferred date is required"),
  servicePreference: yup.string().required('Service preference is required'),
  selectedServices: yup.array().min(1, 'At least one service must be selected').required('Please select at least one service'),
});

// Step Indicator Component
const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${currentStep > step.id
                ? 'bg-green-500 text-white'
                : currentStep === step.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-500'
                }`}>
                {currentStep > step.id ? (
                  <Icon icon="mdi:check" className="text-xl" />
                ) : (
                  step.id
                )}
              </div>
              <span className={`mt-2 text-sm font-medium ${currentStep === step.id ? 'text-orange-500' : 'text-gray-500'
                }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 mb-6 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const CreateRepairJobForm = () => {
  const pathname = usePathname();
  const STORAGE_KEY = `repair_form`;
  const STEP_KEY = `repair_step`;

  // const [currentStep, setCurrentStep] = useState(1);
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem(STEP_KEY);
      return savedStep ? parseInt(savedStep, 10) : 1;
    }
    return 1;
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [modelData, setModelData] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const { user, token } = useSelector((state) => state.auth);
  const router = useRouter();
  const { brandSlug, modelId, color } = useParams();

  const steps = [
    { id: 1, label: 'Select Service' },
    { id: 2, label: 'Job Details' },
    { id: 3, label: 'Location' },
    { id: 4, label: 'Review & Post' }
  ];

  const getModelData = async () => {
    try {
      const response = await axiosInstance.get(`/public/models/${modelId}`);
      setModelData(response?.data?.data?.model);
      setData(response?.data?.data);
    } catch (error) {
      console.error('Error fetching model data:', error);
    }
  };

  useEffect(() => {
    if (modelId) {
      getModelData();
    }
  }, [modelId]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
    trigger
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      deviceInfo: { warrantyStatus: '' },
      selectedServices: [],
      urgency: 'medium',
      budget: { min: '', max: '', currency: 'TRY' },
      location: { address: '', city: '', district: '', zipCode: '', coordinates: null },
      preferredTime: '',
      servicePreference: 'pickup',
    }
  });

  const selectedServices = watch('selectedServices');
  const coordinates = watch('location.coordinates');

  // Load saved form data and step from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFormData = localStorage.getItem(STORAGE_KEY);
      const savedStep = localStorage.getItem(STEP_KEY);
    
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          reset(parsedData);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }

      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
    }
  }, [reset]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const subscription = watch((formData) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      });

      return () => subscription.unsubscribe();
    }
  }, [watch]);

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STEP_KEY, currentStep.toString());
    }
  }, [currentStep]);

  

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          address: data.display_name || '',
          city: data.address?.city || data.address?.town || data.address?.village || '',
          district: data.address?.state_district || data.address?.county || '',
          zipCode: data.address?.postcode || ''
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    return null;
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        setValue('location.coordinates', [longitude, latitude], { shouldValidate: true });
        try {
          const locationData = await reverseGeocode(latitude, longitude);
          if (locationData) {
            setValue('location.address', locationData.address);
            setValue('location.city', locationData.city);
            setValue('location.district', locationData.district);
            setValue('location.zipCode', locationData.zipCode);
          }
        } catch (error) {
          setLocationError('Location detected but unable to get address details.');
        }
        setIsGettingLocation(false);
      },
      () => {
        setLocationError('Location access denied or unavailable.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger('selectedServices');
      if (isValid && selectedServices.length > 0) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      isValid = await trigger(['description', 'deviceInfo.warrantyStatus', 'urgency']);
      if (isValid) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      isValid = await trigger(['location', 'preferredDate', 'servicePreference']);
      if (isValid) {
        setCurrentStep(4);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [userData,setUserData]=useState(null)
  const [showTermsModal, setShowTermsModal] = useState(false);

  const dispatch=useDispatch()
  const onSubmit = async (formData) => {
   console.log('Form Data on Submit:', formData);
   const submittedUserData=userData
    console.log('submittedUserData Data on Submit:', submittedUserData);

    const activeUser = submittedUserData?.user || user;
    const activeToken = submittedUserData?.token || token;
   
    console.log('Active User:', activeUser);
    console.log('Active Token:', activeToken);
    console.log("is",activeUser?.role)

    if (!activeUser) {
      toast.error('You must be logged in as a customer to post a repair job.');
      setPendingFormData(formData);
      setShowLoginModal(true);
      return;
    }

    if (activeUser.role !== "customer") {
      toast.error('Your role must be a customer to post a repair job.');
      setPendingFormData(formData);
      setShowLoginModal(true);
      return;
    }

    if (!isTermsAgreed) {
      alert('Please agree to the Terms and Conditions');
      return;
    }

    try {
      const submitData = {
        deviceInfo: {
          brandId: data?.model?.brandId?._id,
          modelId: modelData?._id || modelId,
          brand: data?.model?.brandId?.name,
          model: modelData?.name,
          color: color,
          warrantyStatus: formData.deviceInfo.warrantyStatus,
        },
        preferredDate: formData.preferredDate
          ? new Date(formData.preferredDate).toISOString().split("T")[0]
          : null,
        description: formData.description,
        urgency: formData.urgency,
        budget: formData.budget,
        location: formData.location,
        servicePreference: formData.servicePreference,
        services: formData.selectedServices || [],
        maxOffers: 10,
        autoSelectBest: false
      };

      console.log('Complete Form Data:', submitData);
      const usertoken=token||submittedUserData.token
      console.log('Submitting with token:', usertoken);
      const response = await axiosInstance.post('/repair-jobs', submitData, {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      });

      console.log('API Response:', response.data);
      if (response.data.success) {
        toast.success(response.data.message);
        // Clear localStorage after successful submission
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STEP_KEY);
        setPendingFormData(null);
        router.push('/my-account');
        setIsTermsAgreed(false);
      }

    } catch (error) {
      handleError(error);
    }
  };

  const handleLoginSuccess = (loginUserData) => {
    console.log('Login successful:', loginUserData);
    setUserData(loginUserData);
    setShowLoginModal(false);

    dispatch(setAuth({
      user: loginUserData.user,
      token: loginUserData.token,
      userType: loginUserData.user.role
    }));
    
    dispatch(setCurrentUser(loginUserData.user));
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setPendingFormData(null);
  };

  return (
    <Loader loading={loading}>
      <div className='bg-white'>
        <div className='px-12 py-3'>
          <Breadcrumb />
        </div>
        <div className="min-h-screen p-4">
          <div className="px-9 bg-white rounded-lg grid grid-cols-3 gap-4">
            <div className='col-span-2'>
              {/* Step Indicator */}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center mb-5 gap-2 px-6 py-2 -mt-6 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  <Icon icon="mdi:arrow-left" />
                </button>
              )}
              <StepIndicator currentStep={currentStep} steps={steps} />
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Step 1: Service Selection */}
                {currentStep === 1 && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <ServiceSelector
                      control={control}
                      errors={errors}
                      selectedServices={selectedServices}
                      setValue={setValue}
                      watch={watch}
                      Controller={Controller}
                    />
                    {errors.selectedServices && (
                      <p className="text-red-500 text-sm mt-2">{errors.selectedServices.message}</p>
                    )}
                  </div>
                )}

                {/* Step 2: Job Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon icon="mdi:clipboard-text" className="text-2xl text-orange-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Job Details</h3>
                      </div>
                      <JobDetails control={control} errors={errors} Controller={Controller} />
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon icon="mdi:cellphone" className="text-2xl text-orange-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Device Information</h3>
                      </div>
                      <DeviceInfo control={control} errors={errors} Controller={Controller} />
                    </div>
                  </div>
                )}

                {/* Step 3: Location */}
                {currentStep === 3 && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon icon="mdi:map-marker" className="text-2xl text-orange-500" />
                      <h3 className="text-xl font-semibold text-gray-900">Location & Preferences</h3>
                    </div>
                    <LocationPreferences
                      control={control}
                      errors={errors}
                      getCurrentLocation={getCurrentLocation}
                      isGettingLocation={isGettingLocation}
                      locationError={locationError}
                      coordinates={coordinates}
                      setValue={setValue}
                      Controller={Controller}
                      watch={watch}
                    />
                  </div>
                )}

                {/* Step 4: Review & Price */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon icon="mdi:currency-usd" className="text-2xl text-orange-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Budget Range (Optional)</h3>
                      </div>
                      <BudgetRange control={control} errors={errors} Controller={Controller} />
                    </div>

                    {/* Summary Section */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Selected Services:</span>
                          <span className="font-semibold">{selectedServices.length} service(s)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Preference:</span>
                          <span className="font-semibold capitalize">{watch('servicePreference')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Urgency:</span>
                          <span className="font-semibold capitalize">{watch('urgency')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms & Submit */}
                    <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
  <input
    type="checkbox"
    id="terms"
    checked={isTermsAgreed}
    onChange={(e) => setIsTermsAgreed(e.target.checked)}
    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
  />
  <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
    I agree to the{' '}
    <button
      type="button"
      onClick={() => setShowTermsModal(true)}
      className="text-orange-500 hover:text-orange-600 underline font-medium"
    >
      Terms and Conditions
    </button>
  </label>
</div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !isTermsAgreed}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 text-lg font-semibold"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Icon icon="mdi:check-circle" className="text-xl" />
                            <span>Post Job</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      <Icon icon="mdi:arrow-left" />
                      <span>Previous</span>
                    </button>
                  )}

                  {currentStep < 4 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 ml-auto"
                    >
                      <span>Next</span>
                      <Icon icon="mdi:arrow-right" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Side - Device Info */}
            <div className="rounded-md bg-gray-50 border border-gray-200 h-fit overflow-hidden">
              <div className="relative p-8 flex justify-center items-center">
                {modelData?.icon ? (
                  <Image
                    src={modelData.icon}
                    alt={modelData?.name || 'Device'}
                    width={800}
                    height={800}
                    className="w-48 h-auto object-contain transition-transform duration-300"
                    priority
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-700 rounded-xl flex items-center justify-center">
                    <span className="text-gray-500 text-5xl">📱</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white rounded-md border border-gray-100">
                <h2 className="text-2xl capitalize font-semibold text-gray-900 mb-4">
                  {modelData?.name || 'Device Name'}
                </h2>

                <div className="space-y-4 text-base">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Brand</span>
                    <span className="font-medium text-gray-800 px-3 py-1 bg-gray-100 rounded-full capitalize">
                      {data?.model?.brandId?.name || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Color</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: color?.toLowerCase() || '#888' }}
                      ></span>
                      <span className="font-medium text-gray-800 capitalize">
                        {color || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TermsModal 
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
          />

          <LoginModal
            isOpen={showLoginModal}
            onClose={handleCloseLoginModal}
            onSuccess={handleLoginSuccess}
          />
        </div>
      </div>
    </Loader>
  );
};

export default CreateRepairJobForm;