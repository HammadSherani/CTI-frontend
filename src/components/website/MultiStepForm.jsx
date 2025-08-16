"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Validation schemas for each step
const step1Schema = yup.object({
  fullName: yup.string().required("Full name is required").min(2, "Name must be at least 2 characters"),
  fatherName: yup.string().required("Father's name is required").min(2, "Name must be at least 2 characters"),
  nationalIdOrCitizenNumber: yup.string().required("CNIC is required").matches(/^\d{5}-\d{7}-\d{1}$/, "CNIC format: 12345-1234567-1"),
  dob: yup.date().required("Date of birth is required").max(new Date(), "Date cannot be in the future"),
  gender: yup.string().required("Gender is required").oneOf(["Male", "Female", "Other"], "Invalid gender"),
});

const step2Schema = yup.object({
  mobileNumber: yup.string().required("Mobile number is required").matches(/^03\d{9}$/, "Enter valid mobile number (03XXXXXXXXX)"),
  whatsappNumber: yup.string().required("WhatsApp number is required").matches(/^03\d{9}$/, "Enter valid WhatsApp number"),
  emailAddress: yup.string().required("Email is required").email("Invalid email format"),
  emergencyContactPerson: yup.string().required("Emergency contact person is required"),
  emergencyContactNumber: yup.string().required("Emergency contact number is required").matches(/^03\d{9}$/, "Enter valid contact number"),
});

const step3Schema = yup.object({
  shopName: yup.string().required("Shop name is required").min(2, "Shop name must be at least 2 characters"),
  fullAddress: yup.string().required("Full address is required").min(10, "Address must be at least 10 characters"),
  city: yup.string().required("City is required"),
  district: yup.string().required("District is required"),
  zipCode: yup.string().required("ZIP code is required").matches(/^\d{5}$/, "ZIP code must be 5 digits"),
});

const step4Schema = yup.object({
  yearsOfExperience: yup.number().required("Years of experience is required").min(0, "Cannot be negative").max(50, "Maximum 50 years"),
  specializations: yup.array().min(1, "Select at least one specialization"),
  brandsWorkedWith: yup.array().min(1, "Select at least one brand"),
  description: yup.string().required("Description is required").min(50, "Description must be at least 50 characters"),
  workingDays: yup.array().min(1, "Select at least one working day"),
  workingHours: yup.object({
    start: yup.string().required("Start time is required"),
    end: yup.string().required("End time is required"),
  }),
  pickupService: yup.boolean(),
});

const step5Schema = yup.object({
  profilePhoto: yup.string().required("Profile photo is required"),
  nationalIdOrPassportScan: yup.string().required("CNIC scan is required"),
  shopPhoto: yup.string().required("Shop photo is required"),
  utilityBillOrShopProof: yup.string().required("Shop proof is required"),
  certifications: yup.string(),
});

const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

export default function RepairmanMultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const steps = [1, 2, 3, 4, 5];
  const stepTitles = [
    "Personal Information",
    "Contact Details", 
    "Address & Location",
    "Experience & Availability",
    "Document Uploads"
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(schemas[step - 1]),
    mode: "onChange"
  });

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      const currentData = getValues();
      setFormData(prev => ({ ...prev, ...currentData }));
      if (step < steps.length) {
        setStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const onSubmit = (data) => {
    const finalData = { ...formData, ...data };
    console.log("Final Form Data:", finalData);
    alert("Form submitted successfully!");
  };

  const specializations = [
    "Mobile Phone Repair", "Laptop Repair", "Desktop Repair", "Tablet Repair",
    "Gaming Console Repair", "Smart TV Repair", "Home Appliances", "Audio Equipment"
  ];

  const brands = [
    "Samsung", "Apple", "Huawei", "Xiaomi", "Oppo", "Vivo", "OnePlus",
    "HP", "Dell", "Lenovo", "Asus", "Acer", "Sony", "LG"
  ];

  const workingDaysOptions = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-8">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300
                  ${step === s 
                    ? "bg-orange-500 text-white shadow-lg scale-110" 
                    : step > s 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {step > s ? "✓" : s}
                </div>
                <span className="text-xs mt-1 text-center font-medium">
                  {stepTitles[idx]}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 rounded transition-all duration-300 ${
                  step > s ? "bg-green-500" : "bg-gray-300"
                }`}></div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* Step 1: Personal Information */}
          {step === 1 && (
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
                  {errors.nationalIdOrCitizenNumber && <p className="text-red-500 text-sm mt-1">{errors.nationalIdOrCitizenNumber.message}</p>}
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
          )}

          {/* Step 2: Contact Details */}
          {step === 2 && (
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
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        placeholder="your.email@example.com"
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
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
                  {errors.emergencyContactPerson && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPerson.message}</p>}
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
                  {errors.emergencyContactNumber && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactNumber.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address & Location */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Address & Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                  <Controller
                    name="shopName"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Your shop name"
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          errors.shopName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.shopName && <p className="text-red-500 text-sm mt-1">{errors.shopName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select City</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Enter district"
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          errors.district ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <Controller
                    name="zipCode"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="12345"
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          errors.zipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                  <Controller
                    name="fullAddress"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows="3"
                        placeholder="Enter complete address including landmarks"
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          errors.fullAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.fullAddress && <p className="text-red-500 text-sm mt-1">{errors.fullAddress.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Experience & Availability */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Experience & Availability</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <Controller
                      name="yearsOfExperience"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          max="50"
                          placeholder="0"
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      )}
                    />
                    {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Service Available?</label>
                    <Controller
                      name="pickupService"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <div className="flex items-center space-x-4 pt-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                              className="mr-2 text-orange-500 focus:ring-orange-500"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={field.value === false}
                              onChange={() => field.onChange(false)}
                              className="mr-2 text-orange-500 focus:ring-orange-500"
                            />
                            No
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                  <Controller
                    name="specializations"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {specializations.map((spec) => (
                          <label key={spec} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={field.value.includes(spec)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const newValue = checked 
                                  ? [...field.value, spec]
                                  : field.value.filter(item => item !== spec);
                                field.onChange(newValue);
                              }}
                              className="text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm">{spec}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.specializations && <p className="text-red-500 text-sm mt-1">{errors.specializations.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brands Worked With</label>
                  <Controller
                    name="brandsWorkedWith"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {brands.map((brand) => (
                          <label key={brand} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={field.value.includes(brand)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const newValue = checked 
                                  ? [...field.value, brand]
                                  : field.value.filter(item => item !== brand);
                                field.onChange(newValue);
                              }}
                              className="text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm">{brand}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.brandsWorkedWith && <p className="text-red-500 text-sm mt-1">{errors.brandsWorkedWith.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                  <Controller
                    name="workingDays"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                        {workingDaysOptions.map((day) => (
                          <label key={day} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={field.value.includes(day)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const newValue = checked 
                                  ? [...field.value, day]
                                  : field.value.filter(item => item !== day);
                                field.onChange(newValue);
                              }}
                              className="text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm">{day}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.workingDays && <p className="text-red-500 text-sm mt-1">{errors.workingDays.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours - Start</label>
                    <Controller
                      name="workingHours.start"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="time"
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.workingHours?.start ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      )}
                    />
                    {errors.workingHours?.start && <p className="text-red-500 text-sm mt-1">{errors.workingHours.start.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours - End</label>
                    <Controller
                      name="workingHours.end"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="time"
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.workingHours?.end ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      )}
                    />
                    {errors.workingHours?.end && <p className="text-red-500 text-sm mt-1">{errors.workingHours.end.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows="4"
                        placeholder="Describe your repair services, expertise, and what makes you unique..."
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Document Uploads */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Document Uploads</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                  <Controller
                    name="profilePhoto"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <div className="space-y-2">
                        <input
                          {...field}
                          type="file"
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files[0]?.name || '')}
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.profilePhoto ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <p className="text-xs text-gray-500">Upload a clear photo of yourself</p>
                      </div>
                    )}
                  />
                  {errors.profilePhoto && <p className="text-red-500 text-sm mt-1">{errors.profilePhoto.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Scan</label>
                  <Controller
                    name="nationalIdOrPassportScan"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <div className="space-y-2">
                        <input
                          {...field}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => onChange(e.target.files[0]?.name || '')}
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.nationalIdOrPassportScan ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <p className="text-xs text-gray-500">Upload front and back of CNIC</p>
                      </div>
                    )}
                  />
                  {errors.nationalIdOrPassportScan && <p className="text-red-500 text-sm mt-1">{errors.nationalIdOrPassportScan.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Photo</label>
                  <Controller
                    name="shopPhoto"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <div className="space-y-2">
                        <input
                          {...field}
                          type="file"
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files[0]?.name || '')}
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.shopPhoto ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <p className="text-xs text-gray-500">Upload a photo of your repair shop</p>
                      </div>
                    )}
                  />
                  {errors.shopPhoto && <p className="text-red-500 text-sm mt-1">{errors.shopPhoto.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Proof Document</label>
                  <Controller
                    name="utilityBillOrShopProof"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <div className="space-y-2">
                        <input
                          {...field}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => onChange(e.target.files[0]?.name || '')}
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.utilityBillOrShopProof ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <p className="text-xs text-gray-500">Utility bill or shop ownership proof</p>
                      </div>
                    )}
                  />
                  {errors.utilityBillOrShopProof && <p className="text-red-500 text-sm mt-1">{errors.utilityBillOrShopProof.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certifications (Optional)</label>
                  <Controller
                    name="certifications"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <div className="space-y-2">
                        <input
                          {...field}
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => onChange(Array.from(e.target.files).map(f => f.name).join(', '))}
                          className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all border-gray-300"
                        />
                        <p className="text-xs text-gray-500">Upload any relevant certifications or training certificates</p>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
            >
              Previous
            </button>
            
            <div className="text-sm text-gray-500">
              Step {step} of {steps.length}
            </div>
            
            {step < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-lg"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors shadow-lg"
              >
                Submit Application
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}