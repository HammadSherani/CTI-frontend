"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import { useRouter } from "@/i18n/navigation";
import { setProfileComplete } from "@/store/auth";

import BusinessInformation from "@/components/partials/seller/BusinessInformation";
import PersonalInformation from "@/components/partials/seller/PersonalInformation";
import DocumentUploads from "@/components/partials/seller/DocumentUploads";
import ShippingOperations from "@/components/partials/seller/ShippingOperations";
import BankDetails from "@/components/partials/seller/BankDetails";
import { useParams, useSearchParams } from "next/navigation";
import { kycResolver, kycStepOf, mergeKycData, sellerToKycForm } from "@/helper/sellerProfileRules";

// ─── Draft storage (kept per seller, for this browser tab) ──
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
  const dispatch = useDispatch();
  const router = useRouter();

  const stepKey = `${id}_step`;
  const dataKey = `${id}_formData`;
  const [step, setStep] = useState(() => load(stepKey) || 1);
  const [formData, setFormData] = useState(() => load(dataKey) || {});
  const [serverProblems, setServerProblems] = useState([]); // [{ field, message }]
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepTitles = [
    "Personal Info",
    "Business Info",
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
    resolver: (values) => kycResolver(step, values),
    mode: "onChange",
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

  const { token } = useSelector((state) => state.auth);
  const [seller, setSeller] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(Boolean(token));

  const getSellerProfile = async () => {
    try {
      setSellerLoading(true);
      // "me-seller" returns every saved field; "me" only returns the KYC status after a revision
      const { data: result } = await axiosInstance.get("/seller/profile/me-seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = result?.data;
      if (!data) return;
      setSeller(data);

      const merged = mergeKycData(sellerToKycForm(data), load(dataKey));
      reset(merged);
      setFormData(merged);
    } catch (error) {
      // 404 = nothing saved yet (first submission)
      if (error?.response?.status !== 404) toast.error("Could not load your saved details. Please refresh the page.");
    } finally {
      setSellerLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) getSellerProfile();
    else setSellerLoading(false);
  }, [id, token]);

  // Restore form data on step change
  useEffect(() => {
    reset((prev) => ({ ...prev, ...formData }));
  }, [step]);

  // Save step to storage
  useEffect(() => {
    save(stepKey, step);
  }, [step]);

  const updateStep = (n) => {
    if (n < 1 || n > 5) return;
    setStep(n);
  };

  /* Keeps what is on screen before moving between steps */
  const keepCurrent = () => {
    const merged = { ...formData, ...getValues() };
    setFormData(merged);
    save(dataKey, merged);
    return merged;
  };

  const goToStep = (n) => {
    keepCurrent();
    updateStep(n);
  };

  const nextStep = async () => {
    const valid = await trigger();
    if (!valid) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setServerProblems((list) => list.filter((p) => kycStepOf(p.field) !== step));
    goToStep(step + 1);
  };

  const handleFinalSubmit = () => {
    handleSubmit(onSubmit, () => toast.error("Please fix the highlighted fields"))();
  };

  const prevStep = () => {
    if (step > 1) goToStep(step - 1);
  };

  const onSubmit = async () => {
    // raw input values (pressing Enter on an earlier step must only move forward)
    const all = keepCurrent();
    if (step < 5) {
      updateStep(step + 1);
      return;
    }

    // Final submit
    try {
      setIsSubmitting(true);
      setServerProblems([]);

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
      fd.append("sellerProfile", JSON.stringify(profilePayload));

      if (all.profilePictureOrLogo instanceof File)
        fd.append("profilePictureOrLogo", all.profilePictureOrLogo);
      if (all.nationalIdOrPassport instanceof File)
        fd.append("nationalIdOrPassport", all.nationalIdOrPassport);
      if (all.shopLicenseOrTaxCertificate instanceof File)
        fd.append("shopLicenseOrTaxCertificate", all.shopLicenseOrTaxCertificate);
      if (all.proofOfAddress instanceof File)
        fd.append("proofOfAddress", all.proofOfAddress);
      const res = await axiosInstance.post(
        `/seller/profile/create/${id}`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
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
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) {
        const problems = Object.entries(fieldErrors).map(([field, message]) => ({ field, message }));
        setServerProblems(problems);
        toast.error(problems[0]?.message || "Please correct the highlighted details");
      } else if (err.response?.status === 413) {
        toast.error("Files too large. Reduce size and retry.");
      } else {
        toast.error(err.response?.data?.message || "Submission failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sellerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Loading your saved details...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-sm text-gray-600 mb-6">Log in with your seller account to complete your KYC.</p>
          <button type="button" onClick={() => router.push("/auth/login")} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium">
            Go to login
          </button>
        </div>
      </div>
    );
  }

  const needsChanges = seller?.kycStatus === "revision" || seller?.kycStatus === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-8">

        {needsChanges && (
          <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-800">
              {seller.kycStatus === "rejected" ? "Your KYC was rejected." : "The admin asked for changes."} Your saved details
              are filled in below. Correct them and submit again.
            </p>
            {seller.kycReason && <p className="text-sm text-orange-700 mt-1">Reason: {seller.kycReason}</p>}
          </div>
        )}

        {serverProblems.length > 0 && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">Please correct the following:</p>
            <ul className="mt-2 space-y-1">
              {serverProblems.map((problem) => (
                <li key={problem.field} className="text-sm text-red-600">
                  <button type="button" onClick={() => goToStep(kycStepOf(problem.field))} className="underline text-left">
                    Step {kycStepOf(problem.field)}
                  </button>
                  : {problem.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => { if (s < step) goToStep(s); }}
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
            />
          )}
          {step === 2 && <BusinessInformation control={control} errors={errors} />}
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