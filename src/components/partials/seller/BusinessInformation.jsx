"use client";
import { Controller } from "react-hook-form";
import KycField from "./KycField";
import { SELLER_LIMITS, TR_RULES, digitsOnly } from "@/helper/sellerProfileRules";

export default function BusinessInformation({ control, errors }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
        Business Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <KycField
          control={control} errors={errors} name="businessName" label="Business Name" required
          placeholder="Your shop / business name" maxLength={SELLER_LIMITS.businessName.max} className="md:col-span-2"
        />

        <KycField
          control={control} errors={errors} name="nationalIdOrTaxNumber" label="Tax / National ID Number" required
          placeholder={TR_RULES.idExample} hint="Digits only, without spaces or dashes" inputMode="numeric"
          filter={digitsOnly} maxLength={TR_RULES.idMax}
        />

        {/* Sells Refurbished */}
        <div className="flex items-center gap-3 pt-6">
          <Controller name="sellsRefurbishedDevices" control={control} render={({ field }) => (
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(field.value)}
              aria-label="Sells refurbished devices"
              onClick={() => field.onChange(!field.value)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                ${field.value ? "bg-primary-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                ${field.value ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          )} />
          <span className="text-sm text-gray-700">Sells refurbished devices</span>
        </div>

        <KycField
          control={control} errors={errors} name="storeDescription" label="Store Description" required textarea rows={4}
          placeholder="Describe your store, what you sell, your specialties..."
          hint={`At least ${SELLER_LIMITS.storeDescriptionKycMin} characters`}
          maxLength={SELLER_LIMITS.storeDescription.max} className="md:col-span-2"
        />
      </div>
    </div>
  );
}
