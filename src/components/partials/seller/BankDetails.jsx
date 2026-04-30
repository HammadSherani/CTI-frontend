"use client";
import { Controller } from "react-hook-form";

const fields = [
  { name: "bankDetails.accountTitle", label: "Account Title", placeholder: "Full name on account", requiprimary: true },
  { name: "bankDetails.accountNumber", label: "Account Number", placeholder: "Bank account number", requiprimary: true },
  { name: "bankDetails.bankName", label: "Bank Name", placeholder: "e.g. HBL, Meezan Bank", requiprimary: true },
  { name: "bankDetails.branchName", label: "Branch Name", placeholder: "Branch name (optional)", requiprimary: false },
  { name: "bankDetails.iban", label: "IBAN", placeholder: "PKXX XXXX XXXX XXXX (optional)", requiprimary: false },
];

export default function BankDetails({ control, errors }) {
  const getError = (name) => {
    const parts = name.split(".");
    return parts?.reduce((obj, key) => obj?.[key], errors);
  };

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
        {fields.map(({ name, label, placeholder, requiprimary }) => {
          const err = getError(name);
          return (
            <div key={name} className={name === "bankDetails.iban" ? "md:col-span-2" : ""}>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                {label} {requiprimary && <span className="text-primary-500">*</span>}
              </label>
              <Controller name={name} control={control} render={({ field }) => (
                <input {...field} placeholder={placeholder}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all
                    ${err ? "border-primary-400" : "border-gray-300"}`} />
              )} />
              {err && <p className="text-primary-500 text-xs mt-1">{err.message}</p>}
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> After submitting, your KYC will be reviewed by admin. Login will be enabled once approved.
        </p>
      </div>
    </div>
  );
}