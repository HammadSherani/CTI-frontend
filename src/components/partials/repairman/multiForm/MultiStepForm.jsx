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
  fullAddress: yup.string().required("Full address is required").min(10, "Address must be at least 10 characters"),
  city: yup.string().required("City is required"),
  district: yup.string().required("District is required"),
  zipCode: yup
    .string()
    .required("ZIP code is required")
    .matches(/^\d{5}$/, "ZIP code must be 5 digits"),
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
  profilePhoto: yup.mixed().required("Profile photo is required"),
  nationalIdOrPassportScan: yup.mixed().required("T.C. ID or passport scan is required"),
  shopPhoto: yup.mixed().required("Shop photo is required"),
  utilityBillOrShopProof: yup.mixed().required("Shop proof is required"),
  certifications: yup.mixed(), // optional
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
  const [isDocumentsUploaded, setIsDocumentsUploaded] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { saveToStorage, getFromStorage, clearStorage } = useFormPersistence();

  // Initialize step from URL or storage
  const [step, setStep] = useState(() => {
    // First check URL params
    const urlStep = searchParams.get('step');
    if (urlStep && !isNaN(parseInt(urlStep))) {
      const parsedStep = parseInt(urlStep, 10);
      if (parsedStep >= 1 && parsedStep <= 5) {
        return parsedStep;
      }
    }

    // Then check storage
    const savedStep = getFromStorage('step');
    if (savedStep && savedStep >= 1 && savedStep <= 5) {
      return savedStep;
    }

    return 1; // Default to step 1
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

    // Update URL without page reload
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
      // Basic defaults
      emailAddress: user?.email || "",
      shopName: '',
      city: '',
      district: '',
      zipCode: '',
      fullAddress: '',
      location: null,

      // Personal Information defaults
      fullName: '',
      fatherName: '',
      nationalIdOrCitizenNumber: '',
      dob: '',
      gender: '',

      // Contact Information defaults
      mobileNumber: '',
      whatsappNumber: '',
      emergencyContactPerson: '',
      emergencyContactNumber: '',

      // Experience defaults
      yearsOfExperience: '',
      specializations: [],
      brandsWorkedWith: [],
      description: '',
      workingDays: [],
      workingHours: { start: '', end: '' },
      pickupService: false,

      // Document defaults
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

    // Reset form with saved data
    reset({
      emailAddress: user?.email || "",
      shopName: '',
      city: '',
      district: '',
      zipCode: '',
      fullAddress: '',
      location: null,

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

      // Override with saved data
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
      // Save current data before going back
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
    if (step <= 4) {
      try {
        console.log("Received data:", data);

        const mappedData = { ...data };
        console.log("Mapped data before transformation:", mappedData);

        if (data.brandsWorkedWith) {
          mappedData.brands = data.brandsWorkedWith.map(brand => brand.id || brand._id);
          delete mappedData.brandsWorkedWith;
          console.log("Transformed brands:", mappedData.brands);
        }

        // Fix experience field name if needed
        if (data.yearsOfExperience) {
          mappedData.experience = data.yearsOfExperience.toString();
          delete mappedData.yearsOfExperience;
        }

        const payload = {
          repairmanProfile: { ...informationData, ...mappedData },
        };

        console.log("Sending payload:", payload);

        const response = await axiosInstance.put("/repairman/profile", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success(response.data.message);
        updateStep(5);
      } catch (error) {
        console.error("Profile update error:", error);
        toast.error(error.response?.data?.message || "Error updating profile. Please try again.");
      }
    } else {
      // Document upload step - Updated for S3
      const finalDocumentData = { ...documentData, ...data };

      try {
        console.log("Processing Document Data for S3 Upload:", finalDocumentData);

        // Validate that we have at least some files
        const hasRequiredFiles = finalDocumentData.profilePhoto ||
          finalDocumentData.nationalIdOrPassportScan ||
          finalDocumentData.shopPhoto ||
          finalDocumentData.utilityBillOrShopProof;

        if (!hasRequiredFiles) {
          toast.error("Please select at least one required document to upload.");
          return;
        }

        // Show loading state
        setIsDocumentsUploaded(true)
        // toast.info("Uploading documents to secure cloud storage... Please wait.");

        // Create FormData for S3 upload
        const formData = new FormData();

        // Add individual files to FormData
        if (finalDocumentData.profilePhoto) {
          formData.append('profilePhoto', finalDocumentData.profilePhoto);
          console.log("Added profilePhoto:", finalDocumentData.profilePhoto.name);
        }

        if (finalDocumentData.nationalIdOrPassportScan) {
          formData.append('nationalIdOrPassportScan', finalDocumentData.nationalIdOrPassportScan);
          console.log("Added nationalIdOrPassportScan:", finalDocumentData.nationalIdOrPassportScan.name);
        }

        if (finalDocumentData.shopPhoto) {
          formData.append('shopPhoto', finalDocumentData.shopPhoto);
          console.log("Added shopPhoto:", finalDocumentData.shopPhoto.name);
        }

        if (finalDocumentData.utilityBillOrShopProof) {
          formData.append('utilityBillOrShopProof', finalDocumentData.utilityBillOrShopProof);
          console.log("Added utilityBillOrShopProof:", finalDocumentData.utilityBillOrShopProof.name);
        }

        // Handle multiple certification files
        if (finalDocumentData.certifications && finalDocumentData.certifications.length > 0) {
          Array.from(finalDocumentData.certifications).forEach((file, index) => {
            formData.append('certifications', file);
            console.log(`Added certification ${index + 1}:`, file.name);
          });
        }

        console.log("FormData prepared, starting S3 upload...");

        // Upload directly to S3 via your backend
        const response = await axiosInstance.post(
          "/repairman/profile/upload-documents",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 120000, // 2 minutes timeout for large file uploads
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload progress: ${percentCompleted}%`);
              // Optional: You can show progress to user here
              // toast.info(`Uploading... ${percentCompleted}%`);
            }
          }
        );

        console.log("S3 Upload Response:", response.data);

        // Show success message
        toast.success("Registration completed successfully!");
        setIsDocumentsUploaded(false);

        // Clear all stored form data
        clearStorage();

        // Remove step parameter from URL
        if (typeof window !== 'undefined') {
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('step');
          router.replace(newUrl.pathname, { scroll: false });
        }

        // Show completion details
        if (response.data.data) {
          const { isProfileComplete, completionPercentage, uploadedDocuments } = response.data.data;
          console.log(`Profile completion: ${completionPercentage}%`);
          console.log('Uploaded documents:', uploadedDocuments);

          if (isProfileComplete) {
            toast.success("Your profile is now complete!");
            dispatch(setProfileComplete(true));
            // Optional: Redirect to dashboard
            // router.push('/repair-man/dashboard');
          } else {
            toast.info(`Profile ${completionPercentage}% complete. Some additional information may be required.`);
          }
        }

      } catch (error) {
        console.error("Error in S3 document upload process:", error);

        // Handle different types of errors
        if (error.response) {
          // Server responded with error status
          const errorMessage = error.response.data?.message || "Server error occurred during upload";

          // Handle specific S3/upload errors
          if (error.response.status === 413) {
            toast.error("File size too large. Please reduce file sizes and try again.");
          } else if (error.response.status === 415) {
            toast.error("Invalid file type. Please use JPG, PNG, or PDF files only.");
          } else if (error.response.status === 400 && errorMessage.includes('file')) {
            toast.error("Invalid file format or corrupted file. Please check your files and try again.");
          } else {
            toast.error(errorMessage);
          }

          console.error("Server error details:", {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          // Request was made but no response received (network error)
          if (error.code === 'ECONNABORTED') {
            toast.error("Upload timeout. Please check your internet connection and try again.");
          } else {
            toast.error("Network error. Please check your connection and try again.");
          }
          console.error("Network error:", error.request);
        } else if (error.message?.includes('File size')) {
          // File size validation error
          toast.error("One or more files exceed the maximum size limit of 5MB.");
        } else {
          // Something else happened
          toast.error("Error uploading documents. Please try again.");
          console.error("Upload error:", error.message);
        }

        // Optional: Clear loading states or reset form partially
        // You might want to keep the form data so user doesn't lose their selections
      }
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
  }, [step, informationData, documentData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-8">

        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300
                  ${step === s
                      ? "bg-orange-500 text-white shadow-lg scale-110"
                      : step > s
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {step > s ? "✓" : s}
                </div>
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

          {/* Step 4: Experience & Availability - Using Component */}
          {step === 4 && (
            <ExperienceAvailability control={control} errors={errors} />
          )}

          {/* Step 5: Document Uploads - Using Component */}
          {step === 5 && (
            <DocumentUploads control={control} errors={errors} />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
            >
              Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {step} of {steps.length}
            </div>

            {step === 4 ? (
              <button
                type="submit"
                className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-lg"
              >
                Save Information & Continue
              </button>
            ) : step === 5 ? (
              <button
                type="submit"
                disabled={isDocumentsUploaded}
                className={`px-6 py-3 rounded-lg font-medium transition-colors shadow-lg flex items-center justify-center gap-2
    ${isDocumentsUploaded
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
              >
                {isDocumentsUploaded ? (
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
                  "Upload Documents & Complete"
                )}
              </button>

            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-lg"
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