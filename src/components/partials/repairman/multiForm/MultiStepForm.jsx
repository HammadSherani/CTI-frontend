"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import { useRouter } from "next/navigation";
import { setAuth, setProfileComplete } from "@/store/auth";
import PersonalInformation from "./PersonalInformation";
import ContactInformation from "./ContactInformation";
import AddressLocation from "./AddressLocation";
import ExperienceAvailability from "./ExperienceAvailability";
import DocumentUploads from "./DocumentUploads";

// Validation schemas for each step
const step1Schema = yup.object({
  fullName: yup.string().required("Full name is required").min(2, "Name must be at least 2 characters"),
  fatherName: yup.string().required("Father's name is required").min(2, "Name must be at least 2 characters"),
  nationalIdOrCitizenNumber: yup.string().required("CNIC is required").matches(/^\d{5}-\d{7}-\d{1}$/, "CNIC format: 12345-1234567-1"),
  dob: yup.date().required("Date of birth is required").max(new Date(), "Date cannot be in the future"),
  gender: yup.string().required("Gender is required").oneOf(["Male", "Female", "Other"], "Invalid gender"),
});

const step2Schema = yup.object({
  mobileNumber: yup.string().required("Mobile number is required").matches(/^03\d{9}$/, "Enter valid mobile number (03XXXXXXXXX)"),
  whatsappNumber: yup.string().required("WhatsApp number is required").matches(/^03\d{9}$/, "Enter valid WhatsApp number"),
  emailAddress: yup.string().required("Email is required").email("Invalid email format"),
  emergencyContactPerson: yup.string().required("Emergency contact person is required"),
  emergencyContactNumber: yup.string().required("Emergency contact number is required").matches(/^03\d{9}$/, "Enter valid contact number"),
});

const step3Schema = yup.object({
  shopName: yup.string().required("Shop name is required").min(2, "Shop name must be at least 2 characters"),
  fullAddress: yup.string().required("Full address is required").min(10, "Address must be at least 10 characters"),
  city: yup.string().required("City is required"),
  district: yup.string().required("District is required"),
  zipCode: yup.string().required("ZIP code is required").matches(/^\d{5}$/, "ZIP code must be 5 digits"),
});

const step4Schema = yup.object({
  yearsOfExperience: yup.number().required("Years of experience is required").min(0, "Cannot be negative").max(50, "Maximum 50 years"),
  specializations: yup.array().min(1, "Add at least one specialization"),
  brandsWorkedWith: yup.array().min(1, "Add at least one brand"),
  description: yup.string().required("Description is required").min(50, "Description must be at least 50 characters"),
  workingDays: yup.array().min(1, "Select at least one working day"),
  workingHours: yup.object({
    start: yup.string().required("Start time is required"),
    end: yup.string().required("End time is required"),
  }),
  pickupService: yup.boolean(),
});

const step5Schema = yup.object({
  profilePhoto: yup.mixed().required("Profile photo is required"),
  nationalIdOrPassportScan: yup.mixed().required("CNIC scan is required"),
  shopPhoto: yup.mixed().required("Shop photo is required"),
  utilityBillOrShopProof: yup.mixed().required("Shop proof is required"),
  certifications: yup.mixed(),
});

const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];



export default function RepairmanMultiStepForm() {
  const [step, setStep] = useState(1);
  const [informationData, setInformationData] = useState({});
  const [documentData, setDocumentData] = useState({});
  const { user, token, isProfileComplete } = useSelector(state => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const steps = [1, 2, 3, 4, 5];
  const stepTitles = [
    "Personal Information",
    "Contact Details",
    "Address & Location",
    "Experience & Availability",
    "Document Uploads"
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(schemas[step - 1]),
    mode: "onChange",
    defaultValues: {
      // Existing defaults
      emailAddress: user?.email || "",

      // Address & Location defaults
      shopName: '',
      city: '',
      district: '',
      zipCode: '',
      fullAddress: '',
      location: null,

      // Add other form fields defaults as needed
      // businessName: '',
      // phoneNumber: '',
      // businessType: '',
      // etc...
    }
  });
  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      const currentData = getValues();

      // Store data based on step (1-4 for information, 5 for documents)
      if (step <= 4) {
        setInformationData(prev => ({ ...prev, ...currentData }));
      } else {
        setDocumentData(prev => ({ ...prev, ...currentData }));
      }

      if (step < steps.length) {
        setStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  console.log(token);


  const onSubmit = async (data) => {
    if (step <= 4) {
      try {
        console.log("Received data:", data);
        // return;

        const mappedData = {
          ...data
        };

        // Fix field name mapping
        if (data.brandsWorkedWith) {
          mappedData.brands = data.brandsWorkedWith;
          delete mappedData.brandsWorkedWith;
        }

        // Fix experience field name if needed
        if (data.yearsOfExperience) {
          mappedData.experience = data.yearsOfExperience.toString();
          delete mappedData.yearsOfExperience;
        }

        const payload = {
          repairmanProfile: { ...informationData, ...mappedData },
        };

        console.log("Sending payload:", payload); // Debug log

        const response = await axiosInstance.put("/repairman/profile", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success(response.data.message);
        setStep(5);
      } catch (error) {
        console.error("Profile update error:", error);
        toast.error(error.response?.data?.message || "Error updating profile. Please try again.");
      }
    } else {
      // Document upload step - ye same rakhna hai
      const finalDocumentData = { ...documentData, ...data };

      try {
        console.log("Processing Document Data:", finalDocumentData);

        // Show loading state
        toast.info("Uploading documents to cloud... Please wait.");

        // Function to upload single file to Cloudinary
        const uploadToCloudinary = async (file) => {
          if (!file) return null;

          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'repair_jobs_unsigned';

          if (!cloudName) {
            console.error('Cloudinary cloud name not found in environment variables');
            throw new Error('Upload service not configured. Please contact support.');
          }

          console.log('Uploading to Cloudinary:', {
            cloudName,
            uploadPreset,
            fileName: file.name,
            fileSize: file.size
          });

          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);
          formData.append('folder', 'repairman_documents');

          // Only allowed parameters for unsigned upload
          formData.append('public_id', `${Date.now()}_${file.name.split('.')[0]}`);
          formData.append('tags', 'repairman,document');

          try {
            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              {
                method: 'POST',
                body: formData,
              }
            );

            const responseText = await response.text();
            console.log('Cloudinary response status:', response.status);

            if (!response.ok) {
              console.error('Cloudinary error response:', {
                status: response.status,
                statusText: response.statusText,
                body: responseText
              });

              try {
                const errorData = JSON.parse(responseText);
                if (errorData.error?.message) {
                  throw new Error(errorData.error.message);
                }
              } catch (parseError) {
                throw new Error(`Upload failed: ${response.status} - ${responseText}`);
              }
            }

            const result = JSON.parse(responseText);
            console.log('Upload successful:', result.secure_url);
            return result.secure_url;

          } catch (error) {
            console.error('Cloudinary upload error:', error);

            if (error.message.includes('Upload preset must be specified')) {
              throw new Error('Upload configuration error. Please contact support.');
            } else if (error.message.includes('Invalid upload preset')) {
              throw new Error('Upload preset not found. Please contact support.');
            } else if (error.message.includes('File size too large')) {
              throw new Error('File size is too large. Please choose a smaller image (max 5MB).');
            } else if (error.message.includes('Invalid image file')) {
              throw new Error('Invalid image format. Please use JPG, PNG, or WEBP.');
            } else if (error.message.includes('Transformation parameter is not allowed')) {
              throw new Error('Upload configuration issue. Please contact support.');
            } else {
              throw new Error(error.message || 'Failed to upload image. Please try again.');
            }
          }
        };

        const uploadCertifications = async (files) => {
          if (!files || files.length === 0) return [];

          const uploadPromises = Array.from(files).map(async (file, index) => {
            try {
              console.log(`Uploading certification ${index + 1}:`, file.name);
              return await uploadToCloudinary(file);
            } catch (error) {
              console.error(`Failed to upload certification ${index + 1}:`, error);
              throw error;
            }
          });

          return await Promise.all(uploadPromises);
        };

        // Upload all documents to Cloudinary
        console.log("Starting Cloudinary uploads...");

        const uploadResults = await Promise.allSettled([
          finalDocumentData.profilePhoto ? uploadToCloudinary(finalDocumentData.profilePhoto) : Promise.resolve(null),
          finalDocumentData.nationalIdOrPassportScan ? uploadToCloudinary(finalDocumentData.nationalIdOrPassportScan) : Promise.resolve(null),
          finalDocumentData.shopPhoto ? uploadToCloudinary(finalDocumentData.shopPhoto) : Promise.resolve(null),
          finalDocumentData.utilityBillOrShopProof ? uploadToCloudinary(finalDocumentData.utilityBillOrShopProof) : Promise.resolve(null),
          // finalDocumentData.certifications ? uploadToCloudinary(finalDocumentData.certifications) : Promise.resolve(null)
        ]);

        // Process upload results
        const [
          profilePhotoResult,
          nationalIdResult,
          shopPhotoResult,
          shopProofResult,
          // certificationsResult
        ] = uploadResults;

        // Check for upload failures
        const failedUploads = uploadResults
          .map((result, index) => ({ result, index }))
          .filter(({ result }) => result.status === 'rejected')
          .map(({ index }) => {
            const fieldNames = ['profilePhoto', 'nationalIdOrPassportScan', 'shopPhoto', 'utilityBillOrShopProof']; // 'certifications'
            return fieldNames[index];
          });

        if (failedUploads.length > 0) {
          console.error('Failed uploads:', failedUploads);
          toast.error(`Failed to upload: ${failedUploads.join(', ')}`);
          return;
        }

        // Extract successful URLs
        const documentUrls = {
          profilePhoto: profilePhotoResult.status === 'fulfilled' ? profilePhotoResult.value : null,
          nationalIdOrPassportScan: nationalIdResult.status === 'fulfilled' ? nationalIdResult.value : null,
          shopPhoto: shopPhotoResult.status === 'fulfilled' ? shopPhotoResult.value : null,
          utilityBillOrShopProof: shopProofResult.status === 'fulfilled' ? shopProofResult.value : null,
          // certifications: certificationsResult.status === 'fulfilled'
          //   ? (Array.isArray(certificationsResult.value) ? certificationsResult.value[0] : certificationsResult.value)
          //   : null
        };

        Object.keys(documentUrls).forEach(key => {
          if (documentUrls[key] === null || (Array.isArray(documentUrls[key]) && documentUrls[key].length === 0)) {
            delete documentUrls[key];
          }
        });

        console.log("All uploads completed successfully:", documentUrls);

        // Update loading message
        toast.info("Saving document information...");

        // Send URLs to backend
        const response = await axiosInstance.post(
          "/repairman/profile/upload-documents",
          {
            documents: documentUrls,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000,
          }
        );

        console.log("Backend response:", response.data);

        // Show success message
        toast.success("Registration completed successfully!");

        // Optional: Show completion details
        // if (response.data.data) {
        const { isProfileComplete, completionPercentage } = response.data.data;
        console.log(`Profile completion: ${completionPercentage}%`);

        if (isProfileComplete) {
          toast.success("Your profile is now complete!");
          // Redirect to dashboard or next step
          dispatch(setProfileComplete(true));
          // router.push('/repair-man/dashboard');
        }
        // }

      } catch (error) {
        console.error("Error in document upload process:", error);

        // Handle different types of errors
        if (error.response) {
          // Server responded with error status
          const errorMessage = error.response.data?.message || "Server error occurred";
          toast.error(errorMessage);

          console.error("Server error details:", {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          // Request was made but no response received
          toast.error("Network error. Please check your connection.");
          console.error("Network error:", error.request);
        } else {
          // Something else happened
          toast.error("Error uploading documents. Please try again.");
          console.error("Upload error:", error.message);
        }
      }
    }
  };

  useEffect(() => {
    if (user && isProfileComplete) {
      router.push('/repair-man/dashboard');
    }
  }, [user, isProfileComplete]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4">
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
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-lg"
              >
                Save Information & Continue
              </button>
            ) : step === 5 ? (
              <button
                type="submit"
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors shadow-lg"
              >
                Upload Documents & Complete
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