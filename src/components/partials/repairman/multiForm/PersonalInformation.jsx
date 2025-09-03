"use client";
import { Controller } from "react-hook-form";

const PersonalInformation = ({ control, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Enter your full name"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
          <Controller
            name="fatherName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Enter father's name"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.fatherName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Number</label>
          <Controller
            name="nationalIdOrCitizenNumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="12345-1234567-1"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.nationalIdOrCitizenNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.nationalIdOrCitizenNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.nationalIdOrCitizenNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <Controller
            name="dob"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.dob ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <Controller
            name="gender"
            control={control}
            defaultValue="Male"
            render={({ field }) => (
              <div className="flex space-x-6">
                {["Male", "Female", "Other"].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value={gender}
                      checked={field.value === gender}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    {gender}
                  </label>
                ))}
              </div>
            )}
          />
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;