"use client";
import { Controller } from "react-hook-form";

export default function PersonalInformation({ control, errors, user }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Full Name <span className="text-primary-500">*</span>
          </label>
          <Controller name="fullName" control={control} render={({ field }) => (
            <input {...field} placeholder="Your full legal name"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all
                ${errors.fullName ? "border-primary-400" : "border-gray-300"}`} />
          )} />
          {errors.fullName && <p className="text-primary-500 text-xs mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Date of Birth <span className="text-primary-500">*</span>
          </label>
          <Controller name="dob" control={control} render={({ field }) => (
            <input {...field} type="date"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all
                ${errors.dob ? "border-primary-400" : "border-gray-300"}`} />
          )} />
          {errors.dob && <p className="text-primary-500 text-xs mt-1">{errors.dob.message}</p>}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Gender <span className="text-primary-500">*</span>
          </label>
          <Controller name="gender" control={control} render={({ field }) => (
            <div className="flex gap-5">
              {["Male", "Female", "Other"].map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="radio" {...field} value={g} checked={field.value === g}
                    className="accent-teal-600" />
                  {g}
                </label>
              ))}
            </div>
          )} />
          {errors.gender && <p className="text-primary-500 text-xs mt-1">{errors.gender.message}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Phone Number <span className="text-primary-500">*</span>
          </label>
          <Controller name="phoneNumber" control={control} render={({ field }) => (
            <input {...field} type="tel" placeholder="+92 or 03XX..."
              onChange={(e) => field.onChange(e.target.value.replace(/[^0-9+\-\s]/g, ""))}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all
                ${errors.phoneNumber ? "border-primary-400" : "border-gray-300"}`} />
          )} />
          {errors.phoneNumber && <p className="text-primary-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
        </div>

        {/* Email (disabled) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Email Address <span className="text-primary-500">*</span>
          </label>
          <Controller name="emailAddress" control={control} defaultValue={user?.email || ""} render={({ field }) => (
            <input {...field} type="email" disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed outline-none" />
          )} />
        </div>

        {/* Store Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Store Address <span className="text-primary-500">*</span>
          </label>
          <Controller name="storeAddress" control={control} render={({ field }) => (
            <textarea {...field} rows={2} placeholder="Full store address"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none
                ${errors.storeAddress ? "border-primary-400" : "border-gray-300"}`} />
          )} />
          {errors.storeAddress && <p className="text-primary-500 text-xs mt-1">{errors.storeAddress.message}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            City <span className="text-primary-500">*</span>
          </label>
          <Controller name="city" control={control} render={({ field }) => (
            <input {...field} placeholder="City"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all
                ${errors.city ? "border-primary-400" : "border-gray-300"}`} />
          )} />
          {errors.city && <p className="text-primary-500 text-xs mt-1">{errors.city.message}</p>}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">District</label>
          <Controller name="district" control={control} render={({ field }) => (
            <input {...field} placeholder="District (optional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" />
          )} />
        </div>

        {/* ZIP Code */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            ZIP Code <span className="text-primary-500">*</span>
          </label>
          <Controller name="zipCode" control={control} render={({ field }) => (
            <input {...field} placeholder="ZIP / Postal code"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all
                ${errors.zipCode ? "border-primary-400" : "border-gray-300"}`} />
          )} />
          {errors.zipCode && <p className="text-primary-500 text-xs mt-1">{errors.zipCode.message}</p>}
        </div>
      </div>
    </div>
  );
}