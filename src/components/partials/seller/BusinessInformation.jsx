"use client";
import { Controller } from "react-hook-form";

export default function BusinessInformation({ control, errors, watch, setValue }) {

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
        Business Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Business Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Business Name <span className="text-primary-500">*</span>
          </label>
          <Controller name="businessName" control={control} render={({ field }) => (
            <input {...field} placeholder="Your shop / business name"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all
                ${errors.businessName ? "border-primary-400" : "border-gray-300"}`} />
          )} />
          {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
        </div>

        {/* Tax / National ID Number */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Tax / National ID Number <span className="text-primary-500">*</span>
          </label>
          <Controller name="nationalIdOrTaxNumber" control={control} render={({ field }) => (
            <input {...field} placeholder="Tax or national ID number"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all
                ${errors.nationalIdOrTaxNumber ? "border-red-400" : "border-gray-300"}`} />
          )} />
          {errors.nationalIdOrTaxNumber && <p className="text-red-500 text-xs mt-1">{errors.nationalIdOrTaxNumber.message}</p>}
        </div>

        {/* Sells Refurbished */}
        <div className="flex items-center gap-3 pt-6">
          <Controller name="sellsRefurbishedDevices" control={control} render={({ field }) => (
            <button
              type="button"
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

        {/* Store Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Store Description <span className="text-primary-500">*</span>
          </label>
          <Controller name="storeDescription" control={control} render={({ field }) => (
            <textarea {...field} rows={3} placeholder="Describe your store, what you sell, your specialties..."
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none
                ${errors.storeDescription ? "border-red-400" : "border-gray-300"}`} />
          )} />
          {errors.storeDescription && <p className="text-red-500 text-xs mt-1">{errors.storeDescription.message}</p>}
        </div>


      </div>
    </div>
  );
}