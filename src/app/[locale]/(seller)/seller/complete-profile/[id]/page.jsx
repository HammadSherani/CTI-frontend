"use client";
import { useEffect, useRef, useState } from "react";
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
import { useParams, useSearchParams } from "next/navigation";
import { getCountryRules, getSelectedCountry, validatePhone } from "@/helper/sellerProfileRules";

// ─── Schemas ───────────────────────────────────────────────
const currentRules = (testContext) => getCountryRules(testContext.options.context?.current || getSelectedCountry());

const step2Schema = yup.object({
  businessName: yup.string().required("Business name is required").min(2).max(80),
  storeDescription: yup.string().required("Store description is required").min(20).max(700),
  nationalIdOrTaxNumber: yup.string().required("Tax/National ID number is required").min(5).max(30),
  sellsRefurbishedDevices: yup.boolean().required(),
});

const step1Schema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2)
    .max(60)
    .matches(/^\p{L}[\p{L}\p{M}\s.'-]*$/u, "Full name can only contain letters, spaces, dots, apostrophes and hyphens"),
  gender: yup.string().required("Gender is required").oneOf(["Male", "Female", "Other"]),
  dob: yup.date().required("Date of birth is required").max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), "You must be at least 18 years old").typeError("Invalid date").min(new Date("1900-01-01"), "Date of birth is too far in the past"),
  // formats depend on the selected country (passed in through the resolver context)
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .test("country-phone", "", function (value) {
      const message = validatePhone(value, currentRules(this));
      return message ? this.createError({ message }) : true;
    }),
  storeAddress: yup.string().required("Store address is required").min(10).max(200),
  country: yup.string().required("Country is required"),   // ← add
  state: yup.string().required("State is required"),       // ← add
  city: yup.string().required("City is required"),
  zipCode: yup
    .string()
    .required("ZIP code is required")
    .test("country-zip", "", function (value) {
      const rules = currentRules(this);
      return rules.zipPattern.test(String(value || "").trim()) || this.createError({ message: rules.zipMessage });
    }),
});

const step3Schema = yup.object({
  profilePictureOrLogo: yup
    .mixed()
    .required("Profile picture/logo is required")
    .test("fileExists", "Required", (v) => v instanceof File || typeof v === "string")
    .test("fileSize", "Max 5MB", (v) => typeof v === "string" || !v || v.size <= 5 * 1024 * 1024)
    .test("fileType", "Images only", (v) => typeof v === "string" || !v || ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(v.type)),
  nationalIdOrPassport: yup
    .mixed()
    .required("National ID / Passport is required")
    .test("fileExists", "Required", (v) => v instanceof File || typeof v === "string")
    .test("fileSize", "Max 5MB", (v) => typeof v === "string" || !v || v.size <= 5 * 1024 * 1024)
    .test("fileType", "Image or PDF only", (v) => typeof v === "string" || !v || ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"].includes(v.type)),
  shopLicenseOrTaxCertificate: yup
    .mixed()
    .required("Shop license / Tax certificate is required")
    .test("fileExists", "Required", (v) => v instanceof File || typeof v === "string")
    .test("fileSize", "Max 5MB", (v) => typeof v === "string" || !v || v.size <= 5 * 1024 * 1024)
    .test("fileType", "Image or PDF only", (v) => typeof v === "string" || !v || ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"].includes(v.type)),
  proofOfAddress: yup
    .mixed()
    .required("Proof of address is required")
    .test("fileExists", "Required", (v) => v instanceof File || typeof v === "string")
    .test("fileSize", "Max 5MB", (v) => typeof v === "string" || !v || v.size <= 5 * 1024 * 1024)
    .test("fileType", "Image or PDF only", (v) => typeof v === "string" || !v || ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"].includes(v.type)),
});

const step4Schema = yup.object({
  shippingMethod: yup.string().required("Shipping method is required"),
  workingDays: yup.array().min(1, "Select at least one working day").of(
    yup.string().oneOf(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
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
    accountTitle: yup.string().required("Account title is required").min(2).max(60),
    accountNumber: yup
      .string()
      .required("Account number is required")
      .test("digits", "Account number must be 6 to 26 digits", (v) => /^\d{6,26}$/.test(String(v || "").replace(/[\s-]/g, ""))),
    bankName: yup.string().required("Bank name is required").min(2).max(60),
    branchName: yup.string().nullable().max(60),
    iban: yup
      .string()
      .nullable()
      .test("country-iban", "", function (value) {
        const iban = String(value || "").replace(/\s/g, "").toUpperCase();
        const rules = currentRules(this);
        return !iban || rules.ibanPattern.test(iban) || this.createError({ message: rules.ibanMessage });
      }),
  }),
});

const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

// ─── Storage helpers ────────────────────────────────────────
const KEY = "sellerKycForm_";
const save = (k, d) => {
  try {
    const safe = JSON.parse(JSON.stringify(d, (_, v) => (v instanceof File ? undefined : v)));
    sessionStorage.setItem(KEY + k, JSON.stringify(safe));
  } catch { }
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
  const params = useParams();
  const id = params?.id;
  useEffect(() => {
    console.log('ID from URL:', id);
  }, [id]);
  const dispatch = useDispatch();
  const router = useRouter();

  const [step, setStep] = useState(() => load("step") || 1);
  const [formData, setFormData] = useState(() => load("formData") || {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepTitles = [
    "Personal Info",
    "Business Info",
    "Documents",
    "Shipping",
    "Bank Details",
  ];

  // Country picked on the website until the seller selects one in the form
  const [countryName, setCountryName] = useState("");
  const countryRef = useRef("");
  countryRef.current = countryName;
  useEffect(() => { setCountryName((name) => name || getSelectedCountry()); }, []);

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
    context: countryRef,
    defaultValues: {
      // Business
      businessName: "",
      storeDescription: "",
      nationalIdOrTaxNumber: "",
      sellsRefurbishedDevices: false,
      // Personal
      fullName: "",
      gender: "Male",
      dob: "",
      phoneNumber: "",
      storeAddress: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
      // Documents
      profilePictureOrLogo: null,
      nationalIdOrPassport: null,
      shopLicenseOrTaxCertificate: null,
      proofOfAddress: null,
      // Shipping
      shippingMethod: "",
      workingDays: [],
      workingHours: { start: "", end: "" },
      // Bank
      bankDetails: { accountTitle: "", accountNumber: "", bankName: "", branchName: "", iban: "" },
    },
  });

  const [sellerLoading, setSellerLoading] = useState(false);
  const [seller, setSeller] = useState(null);
const { token } = useSelector((state) => state.auth)
  const getSellerProfile = async () => {
    try {
      setSellerLoading(true);

      const result = await axiosInstance.get("/seller/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = result?.data?.data;
      setSeller(data);
      console.log(result, "seller profile");

      if (data) {
        const formattedData = {
          businessName: data.businessName || "",
          storeDescription: data.storeDescription || "",
          nationalIdOrTaxNumber: data.nationalIdOrTaxNumber || "",
          sellsRefurbishedDevices: data.sellsRefurbishedDevices || false,

          fullName: data.fullName || "",
          gender: data.gender || "Male",
          dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
          phoneNumber: data.phoneNumber || "",
          storeAddress: data.storeAddress || "",
          country: data.country?._id || data.country || "",
          state: data.state?._id || data.state || "",
          city: data.city?._id || data.city || "",
          zipCode: data.zipCode || "",

          profilePictureOrLogo: data.profilePictureOrLogo || null,
          nationalIdOrPassport: data.nationalIdOrPassport || null,
          shopLicenseOrTaxCertificate: data.shopLicenseOrTaxCertificate || null,
          proofOfAddress: data.proofOfAddress || null,

          shippingMethod: data.shippingMethod || "",
          workingDays: data.workingDays || [],
          workingHours: data.workingHours || { start: "", end: "" },

          bankDetails: data.bankDetails || {
            accountTitle: "",
            accountNumber: "",
            bankName: "",
            branchName: "",
            iban: "",
          },
        };
        reset((prev) => ({ ...prev, ...formattedData }));
        setFormData((prev) => ({ ...prev, ...formattedData }));
      }
    } catch (error) {
      console.error("Failed to fetch seller profile", error);
    } finally {
      setSellerLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getSellerProfile();
    }
  }, [id]);

  console.log(seller, 'seller');
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
    updateStep(step + 1);
  };

  const handleFinalSubmit = () => {
    handleSubmit(onSubmit)();
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
        storeAddress: all.storeAddress,
        country: all.country,
        state: all.state,
        city: all.city,
        zipCode: all.zipCode,
        nationalIdOrTaxNumber: all.nationalIdOrTaxNumber,
        businessName: all.businessName,
        sellsRefurbishedDevices: all.sellsRefurbishedDevices,
        storeDescription: all.storeDescription,
        shippingMethod: all.shippingMethod,
        workingDays: all.workingDays,
        workingHours: all.workingHours,
        bankDetails: all.bankDetails,
      };
      console.log(all, 'all')

      fd.append("sellerProfile", JSON.stringify(profilePayload));

      if (all.profilePictureOrLogo instanceof File)
        fd.append("profilePictureOrLogo", all.profilePictureOrLogo);
      if (all.nationalIdOrPassport instanceof File)
        fd.append("nationalIdOrPassport", all.nationalIdOrPassport);
      if (all.shopLicenseOrTaxCertificate instanceof File)
        fd.append("shopLicenseOrTaxCertificate", all.shopLicenseOrTaxCertificate);
      if (all.proofOfAddress instanceof File)
        fd.append("proofOfAddress", all.proofOfAddress);
      for (let pair of fd.entries()) {
        console.log(pair);
      }
      const res = await axiosInstance.post(
        `/seller/profile/create/${id}`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000,
        }
      );

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
          {step === 1 && (
            <PersonalInformation
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              onCountryName={setCountryName}
            />
          )}
          {step === 2 && <BusinessInformation control={control} errors={errors} watch={watch} setValue={setValue} />}
          {step === 3 && <DocumentUploads control={control} errors={errors} setValue={setValue} watch={watch} />}
          {step === 4 && <ShippingOperations control={control} errors={errors} watch={watch} setValue={setValue} />}
          {step === 5 && <BankDetails control={control} errors={errors} countryName={countryName} />}

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

            <span className="text-sm text-gray-400">
              Step {step} of 5
            </span>

            <button
              type="button"
              onClick={step < 5 ? nextStep : handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  {step === 5 ? "Submitting..." : "Loading..."}
                </>
              ) : (
                step === 5 ? "Submit KYC" : "Next Step"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}