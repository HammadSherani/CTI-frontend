"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import { useRouter } from "@/i18n/navigation";
import { setProfileComplete } from "@/store/auth";
import * as yup from "yup";

import BusinessInformation from "@/components/partials/seller/BusinessInformation";
import PersonalInformation from "@/components/partials/seller/PersonalInformation";
import DocumentUploads from "@/components/partials/seller/DocumentUploads";
import ShippingOperations from "@/components/partials/seller/ShippingOperations";
import BankDetails from "@/components/partials/seller/BankDetails";

// ─── Schemas ───────────────────────────────────────────────
const step1Schema = yup.object({
  businessName: yup.string().required("Business name is required").min(2).max(100),
  storeDescription: yup.string().required("Store description is required").min(20).max(500),
  nationalIdOrTaxNumber: yup.string().required("Tax/National ID number is required").min(5).max(30),
  productCategories: yup.array().min(1, "Select at least one category").required(),
  sellsRefurbishedDevices: yup.boolean().required(),
  returnPolicy: yup.string().required("Return policy is required").min(10).max(300),
  warrantyTerms: yup.string().required("Warranty terms are required").min(10).max(300),
});

const step2Schema = yup.object({
  fullName: yup.string().required("Full name is required").min(2).max(100),
  gender: yup.string().required("Gender is required").oneOf(["Male", "Female", "Other"]),
  dob: yup
    .date()
    .required("Date of birth is required")
    .max(new Date(), "Cannot be in the future")
    .test("age", "Must be at least 18 years old", function (value) {
      if (!value) return false;
      const today = new Date();
      const birth = new Date(value);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age >= 18;
    }),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  emailAddress: yup.string().required("Email is required").email("Invalid email"),
  storeAddress: yup.string().required("Store address is required").min(10).max(200),
  city: yup.string().required("City is required").min(2).max(50),
  district: yup.string().nullable(),
  zipCode: yup.string().required("ZIP code is required").min(3).max(10),
});

const step3Schema = yup.object({
  profilePictureOrLogo: yup
    .mixed()
    .required("Profile picture/logo is required")
    .test("fileExists", "Required", (v) => v instanceof File)
    .test("fileSize", "Max 5MB", (v) => !v || v.size <= 5 * 1024 * 1024)
    .test("fileType", "Images only", (v) => !v || ["image/jpeg","image/jpg","image/png","image/webp"].includes(v.type)),
  nationalIdOrPassport: yup
    .mixed()
    .required("National ID / Passport is required")
    .test("fileExists", "Required", (v) => v instanceof File)
    .test("fileSize", "Max 5MB", (v) => !v || v.size <= 5 * 1024 * 1024)
    .test("fileType", "Image or PDF only", (v) => !v || ["image/jpeg","image/jpg","image/png","image/webp","application/pdf"].includes(v.type)),
  shopLicenseOrTaxCertificate: yup
    .mixed()
    .required("Shop license / Tax certificate is required")
    .test("fileExists", "Required", (v) => v instanceof File)
    .test("fileSize", "Max 5MB", (v) => !v || v.size <= 5 * 1024 * 1024)
    .test("fileType", "Image or PDF only", (v) => !v || ["image/jpeg","image/jpg","image/png","image/webp","application/pdf"].includes(v.type)),
  proofOfAddress: yup
    .mixed()
    .required("Proof of address is required")
    .test("fileExists", "Required", (v) => v instanceof File)
    .test("fileSize", "Max 5MB", (v) => !v || v.size <= 5 * 1024 * 1024)
    .test("fileType", "Image or PDF only", (v) => !v || ["image/jpeg","image/jpg","image/png","image/webp","application/pdf"].includes(v.type)),
});

const step4Schema = yup.object({
  shippingMethod: yup.string().required("Shipping method is required"),
  deliveryCities: yup.array().min(1, "Add at least one delivery city").required(),
  workingDays: yup.array().min(1, "Select at least one working day").of(
    yup.string().oneOf(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"])
  ),
  workingHours: yup.object({
    start: yup.string().required("Start time is required").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, "Use HH:MM AM/PM"),
    end: yup.string().required("End time is required")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, "Use HH:MM AM/PM")
      .test("is-after", "End must be after start", function (val) {
        const { start } = this.parent;
        if (!start || !val) return true;
        const parse = (t) => {
          const [time, p] = t.split(" ");
          let [h, m] = time.split(":").map(Number);
          if (p === "PM" && h !== 12) h += 12;
          if (p === "AM" && h === 12) h = 0;
          return h * 60 + m;
        };
        return parse(val) > parse(start);
      }),
  }),
});

const step5Schema = yup.object({
  bankDetails: yup.object({
    accountTitle: yup.string().required("Account title is required").min(2).max(100),
    accountNumber: yup.string().required("Account number is required").min(5).max(30),
    bankName: yup.string().required("Bank name is required").min(2).max(100),
    branchName: yup.string().nullable(),
    iban: yup.string().nullable(),
  }),
});

const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

// ─── Storage helpers ────────────────────────────────────────
const KEY = "sellerKycForm_";
const save = (k, d) => {
  try {
    const safe = JSON.parse(JSON.stringify(d, (_, v) => (v instanceof File ? undefined : v)));
    sessionStorage.setItem(KEY + k, JSON.stringify(safe));
  } catch {}
};
const load = (k) => {
  try {
    const s = sessionStorage.getItem(KEY + k);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
};
const clearStorage = () => {
  Object.keys(sessionStorage).filter((k) => k.startsWith(KEY)).forEach((k) => sessionStorage.removeItem(k));
};

// ─── Main Component ─────────────────────────────────────────
export default function SellerKycForm() {
  const { user, token } = useSelector((s) => s.auth);
  console.log("User from store:", user);
  console.log("Token from store:", token);
  const dispatch = useDispatch();
  const router = useRouter();

  const [step, setStep] = useState(() => load("step") || 1);
  const [formData, setFormData] = useState(() => load("formData") || {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepTitles = [
    "Business Info",
    "Personal Info",
    "Documents",
    "Shipping",
    "Bank Details",
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schemas[step - 1]),
    mode: "onChange",
    defaultValues: {
      // Step 1
      businessName: "My Awesome Store",
      storeDescription: "my awesome store description goes here. It should be at least 20 characters long.",
      nationalIdOrTaxNumber: "2345678901",
      productCategories: [],
      sellsRefurbishedDevices: false,
      returnPolicy: "this is my return policy. It should be at least 10 characters long.",
      warrantyTerms: "this is my warranty terms. It should be at least 10 characters long.",
      // Step 2
      fullName: "Naveed Ahmed",
      gender: "Male",
      dob: "30-05-1995",
      phoneNumber: "03123456789",
      emailAddress: user?.email || "",
      storeAddress: "address line 1, address line 2, city, district, zip code",
      city: "Karachi",
      district: "Karachi South",
      zipCode: "12345",
      // Step 3
      profilePictureOrLogo: null,
      nationalIdOrPassport: null,
      shopLicenseOrTaxCertificate: null,
      proofOfAddress: null,
      // Step 4
      shippingMethod: "",
      deliveryCities: [],
      workingDays: [],
      workingHours: { start: "", end: "" },
      // Step 5
      bankDetails: {
        accountTitle: "Naveed Hassan",
        accountNumber: "1234567890",
        bankName: "Bank of America",
        branchName: "Downtown Branch",
        iban: "US90 1234 5678 9012 3456 7890",
      },
    },
  });

  // Restore form data on step change
  useEffect(() => {
    reset((prev) => ({ ...prev, ...formData }));
  }, [step]);

  // Save step to storage
  useEffect(() => {
    save("step", step);
  }, [step]);

  const updateStep = (n) => {
    if (n < 1 || n > 5) return;
    setStep(n);
  };

  const nextStep = async () => {
    const valid = await trigger();
    if (!valid) {
      const errs = Object.values(errors).map((e) => e?.message).filter(Boolean);
      if (errs.length) toast.error(errs[0]);
      return;
    }
    const current = getValues();
    const merged = { ...formData, ...current };
    setFormData(merged);
    save("formData", merged);
    if (step < 5) updateStep(step + 1);
  };

  const prevStep = () => {
    const current = getValues();
    const merged = { ...formData, ...current };
    setFormData(merged);
    save("formData", merged);
    if (step > 1) updateStep(step - 1);
  };

  const onSubmit = async (data) => {
    if (step < 5) {
      const merged = { ...formData, ...data };
      setFormData(merged);
      save("formData", merged);
      updateStep(step + 1);
      return;
    }

    // Final submit
    try {
      setIsSubmitting(true);
      const all = { ...formData, ...data };

      const fd = new FormData();

      const profilePayload = {
        fullName: all.fullName,
        gender: all.gender,
        dob: all.dob,
        phoneNumber: all.phoneNumber,
        emailAddress: all.emailAddress,
        storeAddress: all.storeAddress,
        city: all.city,
        district: all.district,
        zipCode: all.zipCode,
        nationalIdOrTaxNumber: all.nationalIdOrTaxNumber,
        businessName: all.businessName,
        productCategories: all.productCategories,
        sellsRefurbishedDevices: all.sellsRefurbishedDevices,
        storeDescription: all.storeDescription,
        returnPolicy: all.returnPolicy,
        warrantyTerms: all.warrantyTerms,
        shippingMethod: all.shippingMethod,
        deliveryCities: all.deliveryCities,
        workingDays: all.workingDays,
        workingHours: all.workingHours,
        bankDetails: all.bankDetails,
      };

      fd.append("sellerProfile", JSON.stringify(profilePayload));

      if (all.profilePictureOrLogo instanceof File)
        fd.append("profilePictureOrLogo", all.profilePictureOrLogo);
      if (all.nationalIdOrPassport instanceof File)
        fd.append("nationalIdOrPassport", all.nationalIdOrPassport);
      if (all.shopLicenseOrTaxCertificate instanceof File)
        fd.append("shopLicenseOrTaxCertificate", all.shopLicenseOrTaxCertificate);
      if (all.proofOfAddress instanceof File)
        fd.append("proofOfAddress", all.proofOfAddress);

      const res = await axiosInstance.post("/e-commerce/profile/create", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      });

      if (res.status === 200 || res.data?.success) {
        toast.success("Profile submitted! KYC is under review.");
        clearStorage();
        dispatch(setProfileComplete(true));
        router.push("/seller/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed. Please try again.";
      if (err.response?.status === 413) toast.error("Files too large. Reduce size and retry.");
      else toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-8">

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => { if (s < step) updateStep(s); }}
                  disabled={s > step}
                  className={`w-11 h-11 rounded-full font-semibold text-sm transition-all duration-200
                    ${step === s ? "bg-primary-600 text-white scale-110 shadow-md"
                      : step > s ? "bg-primary-800 text-white cursor-pointer hover:scale-105"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                >
                  {step > s ? "✓" : s}
                </button>
                <span className={`text-xs mt-1 text-center max-w-[72px] leading-tight
                  ${step === s ? "text-primary-600 font-medium" : "text-gray-400"}`}>
                  {stepTitles[idx]}
                </span>
              </div>
              {idx < 4 && (
                <div className={`w-12 h-0.5 mx-2 mb-4 rounded transition-all ${step > s ? "bg-primary-700" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && <BusinessInformation control={control} errors={errors} watch={watch} setValue={setValue} />}
          {step === 2 && <PersonalInformation control={control} errors={errors} user={user} />}
          {step === 3 && <DocumentUploads control={control} errors={errors} setValue={setValue} watch={watch} />}
          {step === 4 && <ShippingOperations control={control} errors={errors} watch={watch} setValue={setValue} />}
          {step === 5 && <BankDetails control={control} errors={errors} />}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-200 transition-colors"
            >
              Previous
            </button>

            <span className="text-sm text-gray-400">Step {step} of 5</span>

            {step === 5 ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : "Submit KYC"}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
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