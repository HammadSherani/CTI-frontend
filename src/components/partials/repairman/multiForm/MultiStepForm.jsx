"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuth, setProfileComplete } from "@/store/auth";
import PersonalInformation from "./PersonalInformation";
import ContactInformation from "./ContactInformation";
import AddressLocation from "./AddressLocation";
import ExperienceAvailability from "./ExperienceAvailability";
import DocumentUploads from "./DocumentUploads";
import { clearAuth } from '@/store/auth';

const step1Schema = yup.object({
  fullName: yup.string().required("Full name is required").min(2, "Name must be at least 2 characters"),
  fatherName: yup.string().required("Father's name is required").min(2, "Name must be at least 2 characters"),
  nationalIdOrCitizenNumber: yup
    .string()
    .required("T.C. Kimlik No is required")
    .matches(/^\d{11}$/, "T.C. Kimlik No must be 11 digits"),
  dob: yup
    .date()
    .required("Date of birth is required")
    .max(new Date(), "Date cannot be in the future"),
  gender: yup
    .string()
    .required("Gender is required")
    .oneOf(["Male", "Female", "Other"], "Invalid gender"),
});

const step2Schema = yup.object({
  mobileNumber: yup
    .string()
    .required("Mobile number is required")
    .matches(/^05\d{9}$/, "Enter valid Turkish mobile number (05XXXXXXXXX)"),
  whatsappNumber: yup
    .string()
    .required("WhatsApp number is required")
    .matches(/^05\d{9}$/, "Enter valid WhatsApp number"),
  emailAddress: yup.string().required("Email is required").email("Invalid email format"),
  emergencyContactPerson: yup.string().required("Emergency contact person is required"),
  emergencyContactNumber: yup
    .string()
    .required("Emergency contact number is required")
    .matches(/^05\d{9}$/, "Enter valid contact number"),
});

const step3Schema = yup.object({
  shopName: yup.string().required("Shop name is required").min(2, "Shop name must be at least 2 characters"),
  country: yup.string().required("Country is required"),
  state: yup.string().required("State is required"),
  city: yup.string().required("City is required"),
  zipCode: yup
    .string()
    .required("ZIP code is required")
    .matches(/^\d{5}$/, "ZIP code must be 5 digits"),
  fullAddress: yup.string().required("Full address is required").min(10, "Address must be at least 10 characters"),
  taxNumber: yup.string().required("Tax number is required").min(5, "Tax number must be at least 5 characters"),
});

const step4Schema = yup.object({
  yearsOfExperience: yup
    .number()
    .required("Years of experience is required")
    .min(0, "Cannot be negative")
    .max(50, "Maximum 50 years"),
  specializations: yup.array().min(1, "Add at least one specialization"),
  brandsWorkedWith: yup.array().min(1, "Add at least one brand"),
  description: yup
    .string()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters"),
  workingDays: yup.array().min(1, "Select at least one working day"),
  workingHours: yup.object({
    start: yup.string().required("Start time is required"),
    end: yup.string().required("End time is required"),
  }),
  pickupService: yup.boolean(),
});

const step5Schema = yup.object({
  profilePhoto: yup
    .mixed()
    .required("Profile photo is required")
    .test("fileExists", "Profile photo is required", (value) => {
      return value !== null && value !== undefined && value instanceof File;
    })
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return true;
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(value.type);
    }),
  nationalIdOrPassportScan: yup
    .mixed()
    .required("T.C. ID or passport scan is required")
    .test("fileExists", "T.C. ID or passport scan is required", (value) => {
      return value !== null && value !== undefined && value instanceof File;
    })
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only image or PDF files are allowed", (value) => {
      if (!value) return true;
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'].includes(value.type);
    }),
  shopPhoto: yup
    .mixed()
    .required("Shop photo is required")
    .test("fileExists", "Shop photo is required", (value) => {
      return value !== null && value !== undefined && value instanceof File;
    })
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return true;
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(value.type);
    }),
  utilityBillOrShopProof: yup
    .mixed()
    .required("Shop proof is required")
    .test("fileExists", "Shop proof is required", (value) => {
      return value !== null && value !== undefined && value instanceof File;
    })
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only image or PDF files are allowed", (value) => {
      if (!value) return true;
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'].includes(value.type);
    }),
  certifications: yup.mixed().nullable(), // optional
});

const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

// Custom hook for form persistence
const useFormPersistence = () => {
  const KEY_PREFIX = 'repairmanForm_';

  const saveToStorage = (key, data) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(KEY_PREFIX + key, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save to sessionStorage:', error);
      }
    }
  };

  const getFromStorage = (key) => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(KEY_PREFIX + key);
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.warn('Failed to read from sessionStorage:', error);
        return null;
      }
    }
    return null;
  };

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        Object.keys(sessionStorage)
          .filter(key => key.startsWith(KEY_PREFIX))
          .forEach(key => sessionStorage.removeItem(key));
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error);
      }
    }
  };

  return { saveToStorage, getFromStorage, clearStorage };
};

export default function RepairmanMultiStepForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { saveToStorage, getFromStorage, clearStorage } = useFormPersistence();

  // Initialize step from URL or storage
  const [step, setStep] = useState(() => {
    const urlStep = searchParams.get('step');
    if (urlStep && !isNaN(parseInt(urlStep))) {
      const parsedStep = parseInt(urlStep, 10);
      if (parsedStep >= 1 && parsedStep <= 5) {
        return parsedStep;
      }
    }

    const savedStep = getFromStorage('step');
    if (savedStep && savedStep >= 1 && savedStep <= 5) {
      return savedStep;
    }

    return 1;
  });

  // Initialize form data from storage
  const [informationData, setInformationData] = useState(() =>
    getFromStorage('informationData') || {}
  );

  const [documentData, setDocumentData] = useState(() =>
    getFromStorage('documentData') || {}
  );

  const { user, token, isProfileComplete } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const steps = [1, 2, 3, 4, 5];
  const stepTitles = [
    "Personal Information",
    "Contact Details",
    "Address & Location",
    "Experience & Availability",
    "Document Uploads"
  ];

  // Update both URL and storage when step changes
  const updateStep = (newStep) => {
    if (newStep < 1 || newStep > 5) return;

    setStep(newStep);
    saveToStorage('step', newStep);

    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('step', newStep.toString());
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  };

  // Save data to storage when it changes
  useEffect(() => {
    saveToStorage('informationData', informationData);
  }, [informationData, saveToStorage]);

  useEffect(() => {
    saveToStorage('documentData', documentData);
  }, [documentData, saveToStorage]);

  // Update URL on initial load if step is from storage
  useEffect(() => {
    const urlStep = searchParams.get('step');
    if (!urlStep || parseInt(urlStep) !== step) {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('step', step.toString());
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schemas[step - 1]),
    mode: "onChange",
    defaultValues: {
      emailAddress: user?.email || "",
      shopName: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      fullAddress: '',
      taxNumber: '',
      fullName: '',
      fatherName: '',
      nationalIdOrCitizenNumber: '',
      dob: '',
      gender: '',
      mobileNumber: '',
      whatsappNumber: '',
      emergencyContactPerson: '',
      emergencyContactNumber: '',
      yearsOfExperience: '',
      specializations: [],
      brandsWorkedWith: [],
      description: '',
      workingDays: [],
      workingHours: { start: '', end: '' },
      pickupService: false,
      profilePhoto: null,
      nationalIdOrPassportScan: null,
      shopPhoto: null,
      utilityBillOrShopProof: null,
      certifications: null,
    }
  });

  // Load saved data into form when step changes or component mounts
  useEffect(() => {
    const allSavedData = { ...informationData, ...documentData };

    reset({
      emailAddress: user?.email || "",
      shopName: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      fullAddress: '',
      taxNumber: '',
      fullName: '',
      fatherName: '',
      nationalIdOrCitizenNumber: '',
      dob: '',
      gender: '',
      mobileNumber: '',
      whatsappNumber: '',
      emergencyContactPerson: '',
      emergencyContactNumber: '',
      yearsOfExperience: '',
      specializations: [],
      brandsWorkedWith: [],
      description: '',
      workingDays: [],
      workingHours: { start: '', end: '' },
      pickupService: false,
      profilePhoto: null,
      nationalIdOrPassportScan: null,
      shopPhoto: null,
      utilityBillOrShopProof: null,
      certifications: null,
      ...allSavedData,
    });
  }, [step, reset, informationData, documentData, user?.email]);

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      const currentData = getValues();

      // Save current step data
      if (step <= 4) {
        setInformationData(prev => ({ ...prev, ...currentData }));
      } else {
        setDocumentData(prev => ({ ...prev, ...currentData }));
      }

      if (step < steps.length) {
        updateStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      const currentData = getValues();
      if (step <= 4) {
        setInformationData(prev => ({ ...prev, ...currentData }));
      } else {
        setDocumentData(prev => ({ ...prev, ...currentData }));
      }

      updateStep(step - 1);
    }
  };

  const onSubmit = async (data) => {
    // Only submit on step 5 (final step)
    if (step < 5) {
      // For steps 1-4, just save data and move to next step
      setInformationData(prev => ({ ...prev, ...data }));
      updateStep(step + 1);
      return;
    }

    // Step 5: Final submission with all data including documents
    try {
      setIsSubmitting(true);

      // ✅ CRITICAL: Validate required documents BEFORE proceeding
      console.log("Validating documents...");
      console.log("profilePhoto:", data.profilePhoto);
      console.log("nationalIdOrPassportScan:", data.nationalIdOrPassportScan);
      console.log("shopPhoto:", data.shopPhoto);
      console.log("utilityBillOrShopProof:", data.utilityBillOrShopProof);

      const hasRequiredFiles = 
        data.profilePhoto instanceof File &&
        data.nationalIdOrPassportScan instanceof File &&
        data.shopPhoto instanceof File &&
        data.utilityBillOrShopProof instanceof File;

      if (!hasRequiredFiles) {
        toast.error("Please upload all required documents before submitting.");
        setIsSubmitting(false);
        return; // ⚠️ STOP execution here - form will NOT submit
      }

      // Merge all collected data
      const allFormData = { ...informationData, ...data };
      console.log("All form data:", allFormData);

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Add all text fields as repairmanProfile JSON
      const repairmanProfile = {
        fullName: allFormData.fullName,
        fatherName: allFormData.fatherName,
        nationalIdOrCitizenNumber: allFormData.nationalIdOrCitizenNumber,
        dob: allFormData.dob,
        gender: allFormData.gender,
        mobileNumber: allFormData.mobileNumber,
        whatsappNumber: allFormData.whatsappNumber,
        emailAddress: allFormData.emailAddress,
        emergencyContactPerson: allFormData.emergencyContactPerson,
        emergencyContactNumber: allFormData.emergencyContactNumber,
        shopName: allFormData.shopName,
        zipCode: allFormData.zipCode,
        taxNumber: allFormData.taxNumber,
        experience: allFormData.yearsOfExperience?.toString(),
        specializations: allFormData.specializations,
        brands: allFormData.brandsWorkedWith?.map(brand => brand.id || brand._id),
        description: allFormData.description,
        workingDays: allFormData.workingDays,
        workingHours: allFormData.workingHours,
        pickupService: allFormData.pickupService,
      };

      // Append repairmanProfile as JSON string
      formData.append('repairmanProfile', JSON.stringify(repairmanProfile));

      // Append country, state, city, address separately
      formData.append('country', allFormData.country);
      formData.append('state', allFormData.state);
      formData.append('city', allFormData.city);
      formData.append('address', allFormData.fullAddress);

      // Append document files
      formData.append('profilePhoto', data.profilePhoto);
      console.log("Added profilePhoto:", data.profilePhoto.name);

      formData.append('nationalIdOrPassportScan', data.nationalIdOrPassportScan);
      console.log("Added nationalIdOrPassportScan:", data.nationalIdOrPassportScan.name);

      formData.append('shopPhoto', data.shopPhoto);
      console.log("Added shopPhoto:", data.shopPhoto.name);

      formData.append('utilityBillOrShopProof', data.utilityBillOrShopProof);
      console.log("Added utilityBillOrShopProof:", data.utilityBillOrShopProof.name);

      // Handle multiple certification files (optional)
      if (data.certifications && data.certifications.length > 0) {
        Array.from(data.certifications).forEach((file, index) => {
          formData.append('certifications', file);
          console.log(`Added certification ${index + 1}:`, file.name);
        });
      }

      console.log("Sending single API request to /repairman/profile...");

      // Single API call with all data
      const response = await axiosInstance.put(
        "/repairman/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 120000, // 2 minutes timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );

      console.log("API Response:", response.data);

      // Check if response is successful (200 or success: true)
      if (response.status === 200 || response.data.success) {
        // Success handling
        toast.success("Registration completed! Your account has been submitted for approval. You will receive an email once it's approved.");

        // Clear all stored form data from sessionStorage
        clearStorage();

        // Clear form state
        setInformationData({});
        setDocumentData({});
       dispatch(clearAuth());

        // Reset form fields
        reset({
          emailAddress: user?.email || "",
          shopName: '',
          country: '',
          state: '',
          city: '',
          zipCode: '',
          fullAddress: '',
          taxNumber: '',
          fullName: '',
          fatherName: '',
          nationalIdOrCitizenNumber: '',
          dob: '',
          gender: '',
          mobileNumber: '',
          whatsappNumber: '',
          emergencyContactPerson: '',
          emergencyContactNumber: '',
          yearsOfExperience: '',
          specializations: [],
          brandsWorkedWith: [],
          description: '',
          workingDays: [],
          workingHours: { start: '', end: '' },
          pickupService: false,
          profilePhoto: null,
          nationalIdOrPassportScan: null,
          shopPhoto: null,
          utilityBillOrShopProof: null,
          certifications: null,
        });

        // Remove step parameter from URL
        if (typeof window !== 'undefined') {
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('step');
          router.replace(newUrl.pathname, { scroll: false });
        }

        // Update profile completion status
        if (response.data.data) {
          const { isProfileComplete, completionPercentage } = response.data.data;
          console.log(`Profile completion: ${completionPercentage}%`);

          if (isProfileComplete) {
            // toast.success("Your profile is now complete!");
            // dispatch(setProfileComplete(true));
            // Redirect to dashboard
            setTimeout(() => {
              router.push('/repair-man/dashboard');
            }, 1500);
          } else {
            // toast.info(`Profile ${completionPercentage}% complete.`);
          }
        }
      }

    } catch (error) {
      console.error("Error submitting profile:", error);

      // Handle different types of errors
      if (error.response) {
        const errorMessage = error.response.data?.message || "Server error occurred";

        if (error.response.status === 413) {
          toast.error("File size too large. Please reduce file sizes and try again.");
        } else if (error.response.status === 415) {
          toast.error("Invalid file type. Please use JPG, PNG, or PDF files only.");
        } else if (error.response.status === 400) {
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage);
        }

        console.error("Server error details:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        if (error.code === 'ECONNABORTED') {
          toast.error("Upload timeout. Please check your internet connection and try again.");
        } else {
          toast.error("Network error. Please check your connection and try again.");
        }
      } else {
        toast.error("Error submitting profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user && isProfileComplete) {
      router.push('/repair-man/dashboard');
    }
  }, [user, isProfileComplete, router]);

  // Debug logging
  useEffect(() => {
    console.log('Current step:', step);
    console.log('Information data:', informationData);
    console.log('Document data:', documentData);
    console.log('Form errors:', errors);
  }, [step, informationData, documentData, errors]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-8">

        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    // Only allow clicking on current step or previous completed steps
                    if (s <= step) {
                      updateStep(s);
                    }
                  }}
                  disabled={s > step}
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300
                  ${step === s
                      ? "bg-orange-500 text-white shadow-lg scale-110"
                      : step > s
                        ? "bg-green-500 text-white cursor-pointer hover:scale-105"
                        : "bg-gray-200 text-gray-700 cursor-not-allowed"
                    }`}
                >
                  {step > s ? "✓" : s}
                </button>
                <span className="text-xs mt-1 text-center font-medium">
                  {stepTitles[idx]}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 rounded transition-all duration-300 ${step > s ? "bg-green-500" : "bg-gray-300"
                  }`}></div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {step === 1 && (
            <PersonalInformation control={control} errors={errors} />
          )}

          {step === 2 && (
            <ContactInformation control={control} errors={errors} user={user} />
          )}

          {step === 3 && (
            <AddressLocation
              control={control}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
          )}

          {step === 4 && (
            <ExperienceAvailability control={control} errors={errors} />
          )}

          {step === 5 && (
            <DocumentUploads control={control} errors={errors} />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
            >
              Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {step} of {steps.length}
            </div>

            {step === 5 ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg font-medium transition-colors shadow-lg flex items-center justify-center gap-2
                  ${isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      ></path>
                    </svg>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Complete Registration"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-lg disabled:opacity-50"
              >
                Next Step
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}