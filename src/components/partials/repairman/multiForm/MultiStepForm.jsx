"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import { useRouter, useSearchParams } from "next/navigation";
import PersonalInformation from "./PersonalInformation";
import ContactInformation from "./ContactInformation";
import AddressLocation from "./AddressLocation";
import ExperienceAvailability from "./ExperienceAvailability";
import DocumentUploads from "./DocumentUploads";
import { clearAuth } from '@/store/auth';

// ===================== VALIDATION SCHEMAS =====================

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
    .max(new Date(), "Date cannot be in the future")
    .test('age', 'You must be at least 18 years old', function (value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < 18) {
          return this.createError({ message: `You must be at least 18 years old. You are ${age - 1} years old.` });
        }
      } else {
        if (age < 18) {
          return this.createError({ message: `You must be at least 18 years old. You are ${age} years old.` });
        }
      }
      return true;
    }),
  gender: yup.string().required("Gender is required").oneOf(["Male", "Female", "Other"], "Invalid gender"),
});

const step2Schema = yup.object({
  mobileNumber: yup.string().required("Mobile number is required").matches(/^05\d{9}$/, "Enter valid Turkish mobile number (05XXXXXXXXX)"),
  whatsappNumber: yup.string().required("WhatsApp number is required").matches(/^05\d{9}$/, "Enter valid WhatsApp number"),
  emailAddress: yup.string().required("Email is required").email("Invalid email format"),
  emergencyContactPerson: yup.string().required("Emergency contact person is required"),
  emergencyContactNumber: yup.string().required("Emergency contact number is required").matches(/^05\d{9}$/, "Enter valid contact number"),
});

const step3Schema = yup.object({
  shopName: yup.string().required("Shop name is required").min(2, "Shop name must be at least 2 characters").max(50, "Shop name cannot exceed 50 characters"),
  country: yup.string().required("Country is required").min(2, "Country name must be at least 2 characters").max(56, "Country name cannot exceed 56 characters"),
  state: yup.string().required("State is required").min(2, "State name must be at least 2 characters").max(50, "State name cannot exceed 50 characters"),
  city: yup.string().required("City is required").min(2, "City name must be at least 2 characters").max(50, "City name cannot exceed 50 characters"),
  zipCode: yup.string().required("ZIP code is required")
    .test('zip-code', 'Invalid ZIP code format', function (value) {
      if (!value) return false;
      return /^\d{5}$/.test(value) ||
        /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(value) ||
        /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(value) ||
        (value.length >= 3 && value.length <= 10);
    })
    .min(3, "ZIP code must be at least 3 characters").max(10, "ZIP code cannot exceed 10 characters"),
  fullAddress: yup.string().required("Full address is required").min(10, "Address must be at least 10 characters").max(200, "Address cannot exceed 200 characters"),
  taxNumber: yup.string().required("Tax number is required").min(5, "Tax number must be at least 5 characters").max(20, "Tax number cannot exceed 20 characters"),
});

const step4Schema = yup.object({
  yearsOfExperience: yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : Number(originalValue)))
    .typeError("Years of experience must be a number")
    .required("Years of experience is required")
    .min(0, "Cannot be negative")
    .max(50, "Maximum 50 years")
    .test('is-valid', 'Years of experience must be a valid number', (value) => value !== undefined && !isNaN(value)),
  specializations: yup.array()
    .min(1, "Add at least one specialization")
    .max(10, "Cannot add more than 10 specializations")
    .of(yup.string().min(2, "Each specialization must be at least 2 characters").max(50, "Each specialization cannot exceed 50 characters")),
  brandsWorkedWith: yup.array()
    .min(1, "Add at least one brand")
    .max(20, "Cannot add more than 20 brands")
    .of(yup.string().min(2, "Each brand name must be at least 2 characters").max(50, "Each brand name cannot exceed 50 characters")),
  description: yup.string().required("Description is required").min(50, "Description must be at least 50 characters").max(1000, "Description cannot exceed 1000 characters")
    .matches(/[a-zA-Z]/, "Description must contain at least one letter"),
  workingDays: yup.array()
    .min(1, "Select at least one working day")
    .max(7, "Cannot select more than 7 days")
    .of(yup.string().oneOf(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'Invalid day selected')),
  workingHours: yup.object({
    start: yup.string().required("Start time is required").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (use HH:MM)"),
    end: yup.string().required("End time is required").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (use HH:MM)")
      .test('is-greater', 'End time must be after start time', function (value) {
        const { start } = this.parent;
        if (!start || !value) return true;
        return value > start;
      }),
  }),
  pickupService: yup.boolean().required("Please specify if pickup service is available").typeError("Pickup service must be a boolean value"),
});

const step5Schema = yup.object({
  profilePhoto: yup.mixed().required("Profile photo is required")
    .test("fileExists", "Profile photo is required", (value) => value !== null && value !== undefined && value instanceof File)
    .test("fileSize", "File size must be less than 5MB", (value) => { if (!value) return true; return value.size <= 5 * 1024 * 1024; })
    .test("fileType", "Only image files are allowed", (value) => { if (!value) return true; return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(value.type); }),
  nationalIdOrPassportScan: yup.mixed().required("T.C. ID or passport scan is required")
    .test("fileExists", "T.C. ID or passport scan is required", (value) => value !== null && value !== undefined && value instanceof File)
    .test("fileSize", "File size must be less than 5MB", (value) => { if (!value) return true; return value.size <= 5 * 1024 * 1024; })
    .test("fileType", "Only image or PDF files are allowed", (value) => { if (!value) return true; return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'].includes(value.type); }),
  shopPhoto: yup.mixed().required("Shop photo is required")
    .test("fileExists", "Shop photo is required", (value) => value !== null && value !== undefined && value instanceof File)
    .test("fileSize", "File size must be less than 5MB", (value) => { if (!value) return true; return value.size <= 5 * 1024 * 1024; })
    .test("fileType", "Only image files are allowed", (value) => { if (!value) return true; return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(value.type); }),
  utilityBillOrShopProof: yup.mixed().required("Shop proof is required")
    .test("fileExists", "Shop proof is required", (value) => value !== null && value !== undefined && value instanceof File)
    .test("fileSize", "File size must be less than 5MB", (value) => { if (!value) return true; return value.size <= 5 * 1024 * 1024; })
    .test("fileType", "Only image or PDF files are allowed", (value) => { if (!value) return true; return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'].includes(value.type); }),
  certifications: yup.mixed().nullable(),
});

const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

// ===================== SESSION STORAGE HELPERS =====================

const STORAGE_KEY = 'repairmanFormData';
const STORAGE_STEP_KEY = 'repairmanFormStep';

const saveFormToStorage = (data) => {
  if (typeof window === 'undefined') return;
  try {
    // Filter out File/FileList objects (not serializable)
    const serializable = {};
    Object.keys(data).forEach(key => {
      const val = data[key];
      if (val instanceof File || val instanceof FileList) return;
      serializable[key] = val;
    });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (e) {
    console.warn('[SessionStorage] Save failed:', e);
  }
};

const loadFormFromStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.warn('[SessionStorage] Load failed:', e);
    return null;
  }
};

const saveStepToStorage = (step) => {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(STORAGE_STEP_KEY, String(step)); } catch (e) { /* ignore */ }
};

const loadStepFromStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const s = sessionStorage.getItem(STORAGE_STEP_KEY);
    return s ? parseInt(s, 10) : null;
  } catch (e) { return null; }
};

const clearFormStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_STEP_KEY);
    // Also clear old format keys
    Object.keys(sessionStorage)
      .filter(key => key.startsWith('repairmanForm_'))
      .forEach(key => sessionStorage.removeItem(key));
  } catch (e) { /* ignore */ }
};

// ===================== DEFAULT VALUES =====================

const getEmptyDefaults = (email = '') => ({
  fullName: '',
  fatherName: '',
  nationalIdOrCitizenNumber: '',
  dob: '',
  gender: '',
  mobileNumber: '',
  whatsappNumber: '',
  emailAddress: email,
  emergencyContactPerson: '',
  emergencyContactNumber: '',
  shopName: '',
  country: '',
  state: '',
  city: '',
  zipCode: '',
  fullAddress: '',
  taxNumber: '',
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

// ===================== ERROR EXTRACTION =====================

const extractValidationErrors = (errs) => {
  const messages = [];
  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    Object.values(obj).forEach((val) => {
      if (val?.message) messages.push(val.message);
      else if (typeof val === 'object' && val !== null) walk(val);
    });
  };
  walk(errs);
  return messages;
};

// ===================== COMPONENT =====================

export default function RepairmanMultiStepForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token, isProfileComplete } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // ---- REF for accumulated form data (prevents re-render loops) ----
  const formDataRef = useRef(null);
  const fileDataRef = useRef({
    profilePhoto: null,
    nationalIdOrPassportScan: null,
    shopPhoto: null,
    utilityBillOrShopProof: null,
    certifications: null,
  });
  const isInitializedRef = useRef(false);

  // Build initial data once
  if (formDataRef.current === null) {
    const stored = loadFormFromStorage();
    const empty = getEmptyDefaults(user?.email || '');

    if (stored && Object.keys(stored).length > 0) {
      // Restore from sessionStorage
      formDataRef.current = { ...empty, ...stored, emailAddress: user?.email || stored.emailAddress || '' };
      console.log('[Init] Restored from sessionStorage:', formDataRef.current);
    } else if (user?.repairmanProfile) {
      // Populate from user profile
      const rp = user.repairmanProfile;
      formDataRef.current = {
        ...empty,
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
      saveFormToStorage(formDataRef.current);
      console.log('[Init] Populated from user profile:', formDataRef.current);
    } else {
      formDataRef.current = empty;
      console.log('[Init] Using empty defaults');
    }
  }

  // ---- Step state ----
  const [step, setStep] = useState(() => {
    const urlStep = searchParams.get('step');
    if (urlStep && !isNaN(parseInt(urlStep))) {
      const p = parseInt(urlStep, 10);
      if (p >= 1 && p <= 5) return p;
    }
    const saved = loadStepFromStorage();
    if (saved && saved >= 1 && saved <= 5) return saved;
    return 1;
  });

  const steps = [1, 2, 3, 4, 5];
  const stepTitles = [
    "Personal Information",
    "Contact Details",
    "Address & Location",
    "Experience & Availability",
    "Document Uploads"
  ];

  // ---- React Hook Form ----
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
    defaultValues: formDataRef.current,
  });

  // ---- Save current form values into ref + sessionStorage ----
  const saveCurrentStepData = useCallback(() => {
    const currentValues = getValues();
    const fileFields = ['profilePhoto', 'nationalIdOrPassportScan', 'shopPhoto', 'utilityBillOrShopProof', 'certifications'];

    Object.keys(currentValues).forEach(key => {
      if (fileFields.includes(key)) {
        if (currentValues[key] instanceof File || currentValues[key] instanceof FileList) {
          fileDataRef.current[key] = currentValues[key];
        }
        return;
      }
      formDataRef.current[key] = currentValues[key];
    });

    saveFormToStorage(formDataRef.current);
    console.log(`[Step ${step}] Saved form data:`, { ...formDataRef.current });
    console.log(`[SessionStorage] Stored:`, loadFormFromStorage());
  }, [getValues, step]);

  // ---- Real-time save: on every field change update ref + sessionStorage ----
  useEffect(() => {
    const FILE_FIELDS = new Set(['profilePhoto', 'nationalIdOrPassportScan', 'shopPhoto', 'utilityBillOrShopProof', 'certifications']);

    const subscription = watch((formValues) => {
      let hasChange = false;
      Object.keys(formValues).forEach(key => {
        if (FILE_FIELDS.has(key)) {
          // Files go to fileDataRef only
          const val = formValues[key];
          if (val instanceof File || val instanceof FileList) {
            fileDataRef.current[key] = val;
          }
          return;
        }
        // For non-file fields: only update if value is not undefined
        if (formValues[key] !== undefined) {
          formDataRef.current[key] = formValues[key];
          hasChange = true;
        }
      });

      if (hasChange) {
        saveFormToStorage(formDataRef.current);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Reset form when step changes (only dependency: step) ----
  useEffect(() => {
    const resetValues = { ...formDataRef.current };

    // For step 5, restore file data from ref
    if (step === 5) {
      resetValues.profilePhoto = fileDataRef.current.profilePhoto;
      resetValues.nationalIdOrPassportScan = fileDataRef.current.nationalIdOrPassportScan;
      resetValues.shopPhoto = fileDataRef.current.shopPhoto;
      resetValues.utilityBillOrShopProof = fileDataRef.current.utilityBillOrShopProof;
      resetValues.certifications = fileDataRef.current.certifications;
    }

    console.log(`[Step ${step}] Resetting form with data:`, resetValues);
    reset(resetValues);

    // Update URL and storage
    saveStepToStorage(step);
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('step', step.toString());
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Sync URL on mount ----
  useEffect(() => {
    const urlStep = searchParams.get('step');
    if (!urlStep || parseInt(urlStep) !== step) {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('step', step.toString());
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Redirect if profile already complete ----
  useEffect(() => {
    if (user && isProfileComplete) {
      router.push('/repair-man/dashboard');
    }
  }, [user, isProfileComplete, router]);

  // ---- Populate from user profile (when user data loads after mount) ----
  useEffect(() => {
    if (!isInitializedRef.current && user?.repairmanProfile) {
      const rp = user.repairmanProfile;
      const current = formDataRef.current;
      let updated = false;

      // Only fill in empty fields from profile
      const profileMap = {
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

      Object.keys(profileMap).forEach(key => {
        const currentVal = current[key];
        const profileVal = profileMap[key];

        // Only fill if current is empty/default
        const isEmpty = currentVal === '' || currentVal === null || currentVal === undefined ||
          (Array.isArray(currentVal) && currentVal.length === 0);

        if (isEmpty && profileVal) {
          current[key] = profileVal;
          updated = true;
        }
      });

      if (updated) {
        saveFormToStorage(current);
        reset({ ...current });
        console.log('[Profile] Merged profile data into form:', current);
      }

      isInitializedRef.current = true;
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===================== NAVIGATION =====================

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      saveCurrentStepData();
      if (step < steps.length) {
        setStep(prev => prev + 1);
      }
    } else {
      const msgs = extractValidationErrors(errors);
      if (msgs.length > 0) {
        toast.error(`Please fix: ${msgs.slice(0, 3).join(', ')}${msgs.length > 3 ? ` and ${msgs.length - 3} more` : ''}`);
      }
      console.log(`[Step ${step}] Validation errors:`, errors);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      saveCurrentStepData();
      setStep(prev => prev - 1);
    }
  };

  const goToStep = (targetStep) => {
    if (targetStep < step && targetStep >= 1) {
      saveCurrentStepData();
      setStep(targetStep);
    }
  };

  // ===================== SUBMIT =====================

  const onSubmit = async (data) => {
    // For steps 1-4, save and go next
    if (step < 5) {
      saveCurrentStepData();
      setStep(prev => prev + 1);
      return;
    }

    // Step 5: Final submission
    try {
      setIsSubmitting(true);

      // Save step 5 file data into ref
      const fileFields = ['profilePhoto', 'nationalIdOrPassportScan', 'shopPhoto', 'utilityBillOrShopProof', 'certifications'];
      fileFields.forEach(key => {
        if (data[key] instanceof File || data[key] instanceof FileList) {
          fileDataRef.current[key] = data[key];
        }
      });

      // Validate required documents
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

      // Merge all accumulated data (ref has steps 1-4) + current step 5 data
      const allFormData = { ...formDataRef.current };
      console.log('[Submit] All merged form data:', allFormData);

      // Build FormData
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
        zipCode: allFormData.zipCode,
        taxNumber: allFormData.taxNumber,
        yearsOfExperience: allFormData.yearsOfExperience?.toString(),
        specializations: allFormData.specializations,
        brandsWorkedWith: allFormData.brandsWorkedWith,
        description: allFormData.description,
        workingDays: allFormData.workingDays,
        workingHours: allFormData.workingHours,
        pickupService: allFormData.pickupService,
      };

      console.log('[Submit] repairmanProfile payload:', repairmanProfile);
      formData.append('repairmanProfile', JSON.stringify(repairmanProfile));

      // Location fields
      if (allFormData.country) formData.append('country', allFormData.country);
      if (allFormData.state) formData.append('state', allFormData.state);
      if (allFormData.city) formData.append('city', allFormData.city);
      if (allFormData.fullAddress) formData.append('address', allFormData.fullAddress);

      // Document files
      if (data.profilePhoto instanceof File) formData.append('profilePhoto', data.profilePhoto);
      if (data.nationalIdOrPassportScan instanceof File) formData.append('nationalIdOrPassportScan', data.nationalIdOrPassportScan);
      if (data.shopPhoto instanceof File) formData.append('shopPhoto', data.shopPhoto);
      if (data.utilityBillOrShopProof instanceof File) formData.append('utilityBillOrShopProof', data.utilityBillOrShopProof);

      if (data.certifications && data.certifications.length > 0) {
        const certFiles = Array.isArray(data.certifications) ? data.certifications : Array.from(data.certifications);
        certFiles.forEach((file) => {
          if (file instanceof File) formData.append('certifications', file);
        });
      }

      console.log('[Submit] Sending API request...');

      const response = await axiosInstance.post("/repairman/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000,
      });

      console.log('[Submit] API Response:', response.data);

      if (response.status === 200 || response.data.success) {
        const isNewProfile = response.data.data?.isNewProfile || false;
        toast.success(
          isNewProfile
            ? "Registration completed! Your account has been submitted for approval."
            : "Profile updated successfully!"
        );

        // Clear everything
        clearFormStorage();
        formDataRef.current = getEmptyDefaults(user?.email || '');
        fileDataRef.current = {
          profilePhoto: null, nationalIdOrPassportScan: null,
          shopPhoto: null, utilityBillOrShopProof: null, certifications: null
        };
        reset(getEmptyDefaults(user?.email || ''));

        if (isNewProfile) {
          dispatch(clearAuth());
        }

        // Remove step from URL
        if (typeof window !== 'undefined') {
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('step');
          router.replace(newUrl.pathname, { scroll: false });
        }

        // Redirect
        if (response.data.data) {
          const { isProfileComplete: complete } = response.data.data;
          if (complete) {
            setTimeout(() => {
              router.push(isNewProfile ? '/repair-man/pending-approval' : '/repair-man/dashboard');
            }, 1500);
          }
        }
      }
    } catch (error) {
      console.error('[Submit] Error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || "Server error occurred";
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

  // ===================== RENDER =====================

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
                  onClick={() => goToStep(s)}
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
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
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
