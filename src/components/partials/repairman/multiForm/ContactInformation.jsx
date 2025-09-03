"use client";
import { Controller } from "react-hook-form";

const ContactInformation = ({ control, errors, user }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
          <Controller
            name="mobileNumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="03XXXXXXXXX"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
          <Controller
            name="whatsappNumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="03XXXXXXXXX"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <Controller
            name="emailAddress"
            control={control}
            defaultValue={user?.email || ""}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                disabled
                placeholder="your.email@example.com"
                className={`w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0 focus:border-gray-300 ${
                  errors.emailAddress ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.emailAddress && <p className="text-red-500 text-sm mt-1">{errors.emailAddress.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Person</label>
          <Controller
            name="emergencyContactPerson"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Emergency contact name"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.emergencyContactPerson ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.emergencyContactPerson && (
            <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPerson.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Number</label>
          <Controller
            name="emergencyContactNumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="03XXXXXXXXX"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.emergencyContactNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.emergencyContactNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.emergencyContactNumber.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;