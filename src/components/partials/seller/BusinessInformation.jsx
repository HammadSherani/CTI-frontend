"use client";
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
