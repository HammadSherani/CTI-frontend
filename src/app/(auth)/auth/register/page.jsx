"use client"

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import Logins from "../../../../../public/assets/user/signup.png";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Validation schema
const schema = yup.object().shape({
  name: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phone: yup
    .string()
    .required("Phone number is required"),
  role: yup
    .string()
    .required("Please select a role")
    .oneOf(["customer", "repairman", "seller"], "Invalid role selected"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

function Signup() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  // const router = router;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = watch("role");

  const roleOptions = [
    { value: "customer", label: "Customer", icon: "mdi:account" },
    { value: "repairman", label: "Repair Specialist", icon: "mdi:wrench" },
    { value: "seller", label: "Seller", icon: "mdi:store" },
  ];

  const onSubmit = async (data) => {
    try {
      console.log("Form submitted:", data);
      const response = await axiosInstance.post("/auth/register", data);
      toast.success(response.data.message);
      router.push("/auth/verify-otp");

      // response.
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
    } catch (error) {
      handleError(error);
    }
  };

  const getRoleLabel = (value) => {
    const role = roleOptions.find((option) => option.value === value);
    return role ? (
      <div className="flex items-center">
        <Icon icon={role.icon} className="mr-2 text-lg" />
        {role.label}
      </div>
    ) : (
      <div className="flex items-center text-gray-500">
        <Icon icon="mdi:account-circle" className="mr-2 text-lg" />
        Select your role
      </div>
    );
  };

  return (
    <>
      <section className="flex items-center min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
        <div className="flex flex-wrap w-full">
          
          {/* Left Image Section */}
          <div className="hidden lg:block lg:w-5/12">
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <Image
                  src={Logins}
                  alt="Signup Illustration"
                  className="w-full max-w-md mx-auto mb-6 drop-shadow-2xl"
                />
                <div className="text-white">
                  <h3 className="mb-2 text-2xl font-bold">Join Our Community</h3>
                  <p className="text-orange-100">Connect, repair, and trade with ease</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="w-full p-4 lg:w-7/12">
            <div className="bg-white rounded-2xl shadow-2xl h-full flex items-center">
              <div className="w-full p-6 md:p-10">
                <div className="max-w-lg mx-auto">
                  
                  {/* Language Switch */}
                  <div className="mb-6 text-sm text-gray-500 cursor-pointer text-end hover:text-orange-500 transition-colors">
                    <span className="flex items-center justify-end gap-1">
                      <Icon icon="mdi:web" className="text-base" />
                      English (UK) 
                      <Icon icon="mdi:chevron-down" className="text-xs" />
                    </span>
                  </div>

                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Create Account
                    </h1>
                    <p className="text-gray-600">Join us and start your journey today</p>
                  </div>

                  {/* Social Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <button className="flex items-center justify-center py-3 px-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
                      <Icon icon="logos:google-icon" className="mr-3 text-xl" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Continue with Google
                      </span>
                    </button>
                    <button className="flex items-center justify-center py-3 px-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
                      <Icon icon="logos:facebook" className="mr-3 text-xl" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Continue with Facebook
                      </span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">OR CONTINUE WITH EMAIL</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <div className="relative">
                              <input
                                {...field}
                                type="text"
                                placeholder="First Name"
                                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                                  errors.name 
                                    ? "border-red-300 focus:border-red-500" 
                                    : "border-gray-200 focus:border-orange-500"
                                }`}
                              />
                              <span className="absolute right-3 top-3 text-gray-400">
                                <Icon icon="mdi:account-outline" className="text-lg" />
                              </span>
                            </div>
                          )}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                     
                    </div>

                    {/* Email Field */}
                    <div>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <input
                              {...field}
                              type="email"
                              placeholder="Email Address"
                              className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                                errors.email 
                                  ? "border-red-300 focus:border-red-500" 
                                  : "border-gray-200 focus:border-orange-500"
                              }`}
                            />
                            <span className="absolute right-3 top-3 text-gray-400">
                              <Icon icon="mdi:email-outline" className="text-lg" />
                            </span>
                          </div>
                        )}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <input
                              {...field}
                              type="tel"
                              placeholder="Phone Number"
                              className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                                errors.phone 
                                  ? "border-red-300 focus:border-red-500" 
                                  : "border-gray-200 focus:border-orange-500"
                              }`}
                            />
                            <span className="absolute right-3 top-3 text-gray-400">
                              <Icon icon="mdi:phone-outline" className="text-lg" />
                            </span>
                          </div>
                        )}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Role Dropdown */}
                    <div>
                      <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white text-left flex items-center justify-between ${
                                errors.role 
                                  ? "border-red-300" 
                                  : isDropdownOpen
                                  ? "border-orange-500" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <span className={selectedRole ? "text-gray-900" : "text-gray-500"}>
                                {getRoleLabel(selectedRole)}
                              </span>
                              <Icon icon="mdi:chevron-down" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isDropdownOpen && (
                              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                                {roleOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      field.onChange(option.value);
                                      setIsDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl flex items-center"
                                  >
                                    <Icon icon={option.icon} className="mr-3 text-xl text-orange-500" />
                                    <span className="font-medium text-gray-700">{option.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      />
                      {errors.role && (
                        <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
                      )}
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Controller
                          name="password"
                          control={control}
                          render={({ field }) => (
                            <div className="relative">
                              <input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white pr-12 ${
                                  errors.password 
                                    ? "border-red-300 focus:border-red-500" 
                                    : "border-gray-200 focus:border-orange-500"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} className="text-lg" />
                              </button>
                            </div>
                          )}
                        />
                        {errors.password && (
                          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                        )}
                      </div>

                      <div>
                        <Controller
                          name="confirmPassword"
                          control={control}
                          render={({ field }) => (
                            <div className="relative">
                              <input
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white pr-12 ${
                                  errors.confirmPassword 
                                    ? "border-red-300 focus:border-red-500" 
                                    : "border-gray-200 focus:border-orange-500"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Icon icon={showConfirmPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} className="text-lg" />
                              </button>
                            </div>
                          )}
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 mt-6 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:from-orange-500 disabled:hover:to-orange-600"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating Account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </form>

                  {/* Login Link */}
                  <div className="mt-8 text-center">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link 
                      href="/login" 
                      className="font-bold text-orange-500 hover:text-orange-600 transition-colors"
                    >
                      Login
                    </Link>
                  </div>

                  {/* Terms */}
                  <p className="mt-6 text-xs text-center text-gray-500">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="text-orange-500 hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-orange-500 hover:underline">Privacy Policy</a>
                  </p>

                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

export default Signup;