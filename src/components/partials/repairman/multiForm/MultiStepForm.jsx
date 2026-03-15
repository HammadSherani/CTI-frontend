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
import PendingApprovalModal from "./PendingModel";

const step1Schema = yup.object({
  fullName: yup.string().required("Full name is required").min(2, "Name must be at least 2 characters"),
  fatherName: yup.string().required("Father's name is required").min(2, "Name must be at least 2 characters"),
  nationalIdOrCitizenNumber: yup
    .string()
    .required("T.C. No is required")
    .matches(/^\d{11}$/, "T.C. No must be 11 digits"),
dob: yup
    .date()
    .required("Date of birth is required")
    .max(new Date(), "Date cannot be in the future")
    .test('age', 'You must be at least 18 years old', function(value) {
        if (!value) return false;
        
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            if (age - 1 < 18) {
                return this.createError({ 
                    message: `You must be at least 18 years old. You are ${age - 1} years old.` 
                });
            }
        } else {
            if (age < 18) {
                return this.createError({ 
                    message: `You must be at least 18 years old. You are ${age} years old.` 
                });
            }
        }
        
        return true;
    }),
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
  shopName: yup
    .string()
    .required("Shop name is required")
    .min(2, "Shop name must be at least 2 characters")
    .max(50, "Shop name cannot exceed 50 characters"),
  
  country: yup
    .string()
    .required("Country is required")
    .min(2, "Country name must be at least 2 characters")
    .max(56, "Country name cannot exceed 56 characters"),
  
  state: yup
    .string()
    .required("State is required")
    .min(2, "State name must be at least 2 characters")
    .max(50, "State name cannot exceed 50 characters"),
  
  city: yup
    .string()
    .required("City is required")
    .min(2, "City name must be at least 2 characters")
    .max(50, "City name cannot exceed 50 characters"),
  
  zipCode: yup
    .string()
    .required("ZIP code is required")
    .test('zip-code', 'Invalid ZIP code format', function(value) {
      if (!value) return false;
      
      const usZipRegex = /^\d{5}$/;
      
      const canadaZipRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      
      const ukZipRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
      
      return usZipRegex.test(value) || 
             canadaZipRegex.test(value) || 
             ukZipRegex.test(value) ||
             (value.length >= 3 && value.length <= 10); 
    })
    .min(3, "ZIP code must be at least 3 characters")
    .max(10, "ZIP code cannot exceed 10 characters"),
  
  fullAddress: yup
    .string()
    .required("Full address is required")
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address cannot exceed 200 characters"),
  
  taxNumber: yup
    .string()
    .required("Tax number is required")
    .min(5, "Tax number must be at least 5 characters")
    .max(20, "Tax number cannot exceed 20 characters"),
});
const step4Schema = yup.object({
 yearsOfExperience: yup
  .number()
  .transform((value, originalValue) => {
    // Agar string hai to number mein convert karo
    return originalValue === '' ? undefined : Number(originalValue);
  })
  .typeError("Years of experience must be a number")
  .required("Years of experience is required")
  .min(0, "Cannot be negative")
  .max(50, "Maximum 50 years")
  .test('is-valid', 'Years of experience must be a valid number', (value) => {
    return value !== undefined && !isNaN(value);
  }),
  specializations: yup
    .array()
    .min(1, "Add at least one specialization")
    .max(10, "Cannot add more than 10 specializations")
    .of(
      yup.string()
        .min(2, "Each specialization must be at least 2 characters")
        .max(50, "Each specialization cannot exceed 50 characters")
    ),
  
  brandsWorkedWith: yup
    .array()
    .min(1, "Add at least one brand")
    .max(20, "Cannot add more than 20 brands")
    .of(
      yup.string()
        .min(2, "Each brand name must be at least 2 characters")
        .max(50, "Each brand name cannot exceed 50 characters")
    ),
  
  description: yup
    .string()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .matches(/[a-zA-Z]/, "Description must contain at least one letter"),
  
  workingDays: yup
    .array()
    .min(1, "Select at least one working day")
    .max(7, "Cannot select more than 7 days")
    .of(
      yup.string()
        .oneOf(
          ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          'Invalid day selected'
        )
    ),
  
  // workingHours: yup.object({
  //   start: yup
  //     .string()
  //     .required("Start time is required")
  //     .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (use HH:MM)"),
    
  //   end: yup
  //     .string()
  //     .required("End time is required")
  //     .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (use HH:MM)")
  //     .test('is-greater', 'End time must be after start time', function(value) {
  //       const { start } = this.parent;
  //       if (!start || !value) return true;
  //       return value > start;
  //     }),
  // }),
  
workingHours: yup.object({
    start: yup
      .string()
      .required("Start time is required")
      .matches(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 
        "Invalid time format (use HH:MM AM/PM)"
      ),
    
    end: yup
      .string()
      .required("End time is required")
      .matches(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 
        "Invalid time format (use HH:MM AM/PM)"
      )
      .test('is-greater', 'End time must be after start time', function(value) {
        const { start } = this.parent;
        if (!start || !value) return true;
        
        // Parse times for comparison
        const parseTime = (timeStr) => {
          const [time, period] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          return hours * 60 + minutes;
        };
        
        return parseTime(value) > parseTime(start);
      }),  }),


  pickupService: yup
    .boolean()
    .required("Please specify if pickup service is available")
    .typeError("Pickup service must be a boolean value"),
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

// Storage helpers (stable references - no hook needed)
const STORAGE_KEY_PREFIX = 'repairmanForm_';

const saveToStorage = (key, data) => {
  if (typeof window !== 'undefined') {
    try {
      // Skip File objects - they can't be serialized
      const serializable = JSON.parse(JSON.stringify(data, (k, v) => {
        if (v instanceof File || v instanceof FileList) return undefined;
        return v;
      }));
      sessionStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(serializable));
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }
  }
};

const getFromStorage = (key) => {
  if (typeof window !== 'undefined') {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_PREFIX + key);
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
        .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
        .forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }
};

export default function RepairmanMultiStepForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // Populate form data from user profile if available
  useEffect(() => {
    if (user?.repairmanProfile) {
      const rp = user.repairmanProfile;
      const currentData = informationData;

      const mappedData = {
        fullName: rp.fullName || '',
        fatherName: rp.fatherName || '',
        nationalIdOrCitizenNumber: rp.nationalIdOrCitizenNumber || '',
        dob: rp.dob ? new Date(rp.dob).toISOString().split('T')[0] : '',
        gender: rp.gender || '',
        mobileNumber: rp.mobileNumber || '',
        whatsappNumber: rp.whatsappNumber || '',
        emailAddress: rp.emailAddress || user.email || '',
        emergencyContactPerson: rp.emergencyContactPerson || '',
        emergencyContactNumber: rp.emergencyContactNumber || '',
        shopName: rp.shopName || '',
        country: user.country || rp.country || '',
        state: user.state || rp.state || '',
        city: user.city?._id || user.city || rp.city || '', 
        zipCode: rp.zipCode || '',
        fullAddress: rp.fullAddress || '', 
        taxNumber: rp.taxNumber || '',
        yearsOfExperience: rp.yearsOfExperience || '',
        specializations: rp.specializations || [],
        brandsWorkedWith: rp.brandsWorkedWith || [],
        description: rp.description || '',
        workingDays: rp.workingDays || [],
        workingHours: rp.workingHours || { start: '', end: '' },
        pickupService: rp.pickupService || false,
      };

      // Create a merged object that prefers existing user edits (from storage/state)
      // but fills in gaps from profile data
      const finalData = { ...mappedData };
      
      if (Object.keys(currentData).length > 0) {
          Object.keys(currentData).forEach(key => {
              const val = currentData[key];
              // Keep currentData value if it appears "valid" (user entered/selected something)
              // This prevents overwriting user's work with old profile data
              if (Array.isArray(val)) {
                  if (val.length > 0) finalData[key] = val;
              } else if (val && typeof val === 'object') {
                   // For objects like workingHours
                   if (Object.values(val).some(v => v)) finalData[key] = val;
              } else if (val !== '' && val !== null && val !== undefined) {
                  finalData[key] = val;
              }
          });
      }

      // Check for deep equality to prevent infinite loops
      const needsUpdate = JSON.stringify(finalData) !== JSON.stringify(currentData);
      
      // Only update if we are adding data (e.g. initial load or missing fields)
      // We check if brands count is 0 in current but > 0 in profile as a heuristic for "needs population"
      const brandsMissing = (currentData.brandsWorkedWith?.length || 0) === 0 && (mappedData.brandsWorkedWith?.length || 0) > 0;
      const isInitialLoad = Object.keys(currentData).length === 0;

      if ((isInitialLoad || brandsMissing) && needsUpdate) {
         setInformationData(finalData);
         saveToStorage('informationData', finalData);
      }
    }
  }, [user]);

  // Save data to storage when it changes
  useEffect(() => {
    if (Object.keys(informationData).length > 0) {
      saveToStorage('informationData', informationData);
    }
  }, [informationData]);

  useEffect(() => {
    if (Object.keys(documentData).length > 0) {
      saveToStorage('documentData', documentData);
    }
  }, [documentData]);

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
    formState: { errors, touchedFields },
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

  // Helper to show error toast with summary of validation errors
  const showValidationErrors = (errs) => {
    const errorMessages = [];
    const extractErrors = (obj, prefix = '') => {
      Object.entries(obj).forEach(([key, val]) => {
        if (val?.message) {
          errorMessages.push(val.message);
        } else if (typeof val === 'object' && val !== null) {
          extractErrors(val, prefix ? `${prefix}.${key}` : key);
        }
      });
    };
    extractErrors(errs);
    if (errorMessages.length > 0) {
      toast.error(`Please fix the following: ${errorMessages.slice(0, 3).join(', ')}${errorMessages.length > 3 ? ` and ${errorMessages.length - 3} more` : ''}`);
    }
  };

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
    } else {
      // Show validation errors toast
      const currentErrors = control._formState.errors;
      if (Object.keys(currentErrors).length > 0) {
        showValidationErrors(currentErrors);
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

  const [showApprovalModal, setShowApprovalModal] = useState(false);

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

    // Validate required documents BEFORE proceeding
    const hasRequiredFiles =
      data.profilePhoto instanceof File &&
      data.nationalIdOrPassportScan instanceof File &&
      data.shopPhoto instanceof File &&
      data.utilityBillOrShopProof instanceof File;

    if (!hasRequiredFiles) {
      toast.error("Please upload all required documents before submitting.");
      setIsSubmitting(false);
      return;
    }

    // Merge all collected data
    const allFormData = { ...informationData, ...data };
  
    // Create FormData for multipart/form-data
    const formData = new FormData();

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
      fullAddress:allFormData.fullAddress,
      zipCode: allFormData.zipCode,
      taxNumber: allFormData.taxNumber,
      city: allFormData.city,
      state: allFormData.state,
      country: allFormData.country,
      yearsOfExperience: allFormData.yearsOfExperience?.toString(),
      specializations: allFormData.specializations,
      brandsWorkedWith: allFormData.brandsWorkedWith,
      description: allFormData.description,
      workingDays: allFormData.workingDays,
      workingHours: allFormData.workingHours,
      pickupService: allFormData.pickupService,
    };

    formData.append('repairmanProfile', JSON.stringify(repairmanProfile));
    // Append document files
    if (data.profilePhoto instanceof File) {
      formData.append('profilePhoto', data.profilePhoto);
    }

    if (data.nationalIdOrPassportScan instanceof File) {
      formData.append('nationalIdOrPassportScan', data.nationalIdOrPassportScan);
    }

    if (data.shopPhoto instanceof File) {
      formData.append('shopPhoto', data.shopPhoto);
    }

    if (data.utilityBillOrShopProof instanceof File) {
      formData.append('utilityBillOrShopProof', data.utilityBillOrShopProof);
    }

    // Handle multiple certification files (optional)
    if (data.certifications && data.certifications.length > 0) {
      const certFiles = Array.isArray(data.certifications)
        ? data.certifications
        : Array.from(data.certifications);

      certFiles.forEach((file) => {
        if (file instanceof File) {
          formData.append('certifications', file);
        }
      });
    }

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
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      }
    );

    console.log("API Response:", response.data);

    // Check if response is successful
    if (response.status === 200 || response.data.success) {
     
            // setShowApprovalModal(true);
            clearStorage();
     
      // clearStorage();

      // Clear form state
      // setInformationData({});
      // setDocumentData({});
      
      

      // Reset form fields
      // reset({
      //   emailAddress: user?.email || "",
      //   shopName: '',
      //   country: '',
      //   state: '',
      //   city: '',
      //   zipCode: '',
      //   fullAddress: '',
      //   taxNumber: '',
      //   fullName: '',
      //   fatherName: '',
      //   nationalIdOrCitizenNumber: '',
      //   dob: '',
      //   gender: '',
      //   mobileNumber: '',
      //   whatsappNumber: '',
      //   emergencyContactPerson: '',
      //   emergencyContactNumber: '',
      //   yearsOfExperience: '',
      //   specializations: [],
      //   brandsWorkedWith: [],
      //   description: '',
      //   workingDays: [],
      //   workingHours: { start: '', end: '' },
      //   pickupService: false,
      //   profilePhoto: null,
      //   nationalIdOrPassportScan: null,
      //   shopPhoto: null,
      //   utilityBillOrShopProof: null,
      //   certifications: null,
      // });

    
      router.push('/repair-man/dashboard');       
      
    }

  } catch (error) {
    console.error("Error submitting profile:", error);

    // Handle different types of errors
    if (error.response) {
      const errorMessage = error.response.data?.message || "Server error occurred";
      const serverError = error.response.data?.error;

      console.error("Server error details:", {
        status: error.response.status,
        message: errorMessage,
        error: serverError,
        data: error.response.data,
      });

      if (error.response.status === 413) {
        toast.error("File size too large. Please reduce file sizes and try again.");
      } else if (error.response.status === 415) {
        toast.error("Invalid file type. Please use JPG, PNG, or PDF files only.");
      } else if (error.response.status === 400) {
        toast.error(errorMessage);
      } else if (error.response.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (error.response.status === 404) {
        toast.error("User not found. Please login again.");
        router.push('/login');
      } else {
        toast.error(errorMessage);
      }
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
            <ExperienceAvailability control={control} errors={errors} touchedFields={touchedFields} />
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
      <PendingApprovalModal 
  isOpen={showApprovalModal}
  onClose={() => setShowApprovalModal(false)}
/>
      </div>
    </div>
  );
}