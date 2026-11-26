"use client";
import KycField from "./KycField";
import {
  SELLER_LIMITS, TR_PLACEHOLDERS, accountNumberInput, ibanInput,
} from "@/helper/sellerProfileRules";

export default function BankDetails({ control, errors }) {
  const shared = { control, errors };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
        Bank Details
      </h2>
      <p className="text-sm text-gray-500 -mt-2">
        Your bank details are used for payment processing. All information is encrypted and secure.
      </p>

      <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 mb-2">
        <p className="text-xs text-teal-700 font-medium">🔒 Your financial information is protected</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <KycField {...shared} name="bankDetails.accountTitle" label="Account Title" required
          placeholder="Full name on the account" maxLength={SELLER_LIMITS.bankText.max} />
        <KycField {...shared} name="bankDetails.accountNumber" label="Account Number" required
          placeholder="Digits only" inputMode="numeric" filter={accountNumberInput} maxLength={32} showCount={false} hint="6 to 26 digits" />
        <KycField {...shared} name="bankDetails.bankName" label="Bank Name" required
          placeholder={TR_PLACEHOLDERS.bank} maxLength={SELLER_LIMITS.bankText.max} />
        <KycField {...shared} name="bankDetails.branchName" label="Branch Name"
          placeholder="Branch name (optional)" maxLength={SELLER_LIMITS.bankText.max} />
        <KycField {...shared} name="bankDetails.iban" label="IBAN" className="md:col-span-2"
          placeholder={`${TR_PLACEHOLDERS.iban} (optional)`} filter={ibanInput} maxLength={42} showCount={false} />
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> After submitting, your KYC will be reviewed by admin. Login will be enabled once approved.
        </p>
      </div>
    </div>
  );
}
