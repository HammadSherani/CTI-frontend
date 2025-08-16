"use client"

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import Logins from "../../../../../public/assets/user/login.png";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";

// Validation schema
const schema = yup.object().shape({
  password: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setIsValidating(false);
        return;
      }

      try {
        await axiosInstance.post("/auth/validate-reset-token", { token });
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Calculate password strength
  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (passwordValue.length >= 8) strength += 1;
    if (/[A-Z]/.test(passwordValue)) strength += 1;
    if (/[a-z]/.test(passwordValue)) strength += 1;
    if (/\d/.test(passwordValue)) strength += 1;
    if (/[@$!%*?&]/.test(passwordValue)) strength += 1;

    setPasswordStrength(strength);
  }, [passwordValue]);

  const onSubmit = async (data) => {
    try {
      console.log("Reset password submitted:", data);
      const response = await axiosInstance.post("/auth/reset-password", {
        token,
        password: data.password,
      });

      setIsSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      handleError(error);
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0:
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-blue-500";
      case 5: return "bg-green-500";
      default: return "bg-gray-300";
    }
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      case 5: return "Very Strong";
      default: return "";
    }
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
        <div className="col-span-1 lg:col-span-12 flex items-center justify-center p-4 bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Validating reset link...</p>
          </div>
        </div>
      </section>
    );
  }

  // Invalid token state
  // if (!tokenValid) {
  //   return (
  //     <section className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
  //       {/* Left Image Section */}
  //       <div className="hidden lg:grid lg:col-span-5 bg-gradient-to-br from-red-400 via-red-500 to-red-600 relative overflow-hidden">
  //         <div className="absolute inset-0 bg-black/10"></div>
  //         <div className="flex items-center justify-center h-full p-8 relative z-10">
  //           <div className="text-center">
  //             <Image
  //               src={Logins}
  //               alt="Invalid Link Illustration"
  //               className="w-full max-w-lg mx-auto mb-8 drop-shadow-2xl"
  //               priority
  //             />
  //             <div className="text-white">
  //               <h2 className="text-3xl font-bold mb-4">Link Expired</h2>
  //               <p className="text-xl text-red-100 mb-6">
  //                 This reset link is no longer valid
  //               </p>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Right Error Section */}
  //       <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-4 bg-gray-50">
  //         <div className="w-full max-w-md">
  //           <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
              
  //             {/* Error Header */}
  //             <div className="text-center mb-8">
  //               <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
  //                 <Icon icon="mdi:link-off" className="text-4xl text-red-500" />
  //               </div>
  //               <h1 className="text-3xl font-bold text-gray-900 mb-4">
  //                 Reset Link Invalid
  //               </h1>
  //               <p className="text-gray-600 mb-6">
  //                 This password reset link has expired or is invalid. Please request a new one.
  //               </p>
  //             </div>

  //             {/* Action Buttons */}
  //             <div className="space-y-4">
  //               <Link href="/forgot-password">
  //                 <button className="w-full py-4 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200">
  //                   <div className="flex items-center justify-center">
  //                     <Icon icon="mdi:email-send" className="mr-2 text-xl" />
  //                     Request New Reset Link
  //                   </div>
  //                 </button>
  //               </Link>
                
  //               <Link href="/login">
  //                 <button className="w-full py-4 font-bold text-orange-500 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 hover:border-orange-300 transition-all duration-200">
  //                   <div className="flex items-center justify-center">
  //                     <Icon icon="mdi:arrow-left" className="mr-2 text-xl" />
  //                     Back to Login
  //                   </div>
  //                 </button>
  //               </Link>
  //             </div>

  //           </div>
  //         </div>
  //       </div>

  //     </section>
  //   );
  // }

  // Success state
  if (isSuccess) {
    return (
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Image Section */}
        <div className="hidden lg:grid lg:col-span-5 bg-gradient-to-br from-green-400 via-green-500 to-green-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="flex items-center justify-center h-full p-8 relative z-10">
            <div className="text-center">
              <Image
                src={Logins}
                alt="Success Illustration"
                className="w-full max-w-lg mx-auto mb-8 drop-shadow-2xl"
                priority
              />
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">Password Reset!</h2>
                <p className="text-xl text-green-100 mb-6">
                  Your password has been successfully updated
                </p>
                <div className="flex items-center justify-center gap-6 text-green-100">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:check-circle" className="text-2xl" />
                    <span className="text-sm">Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:shield-check" className="text-2xl" />
                    <span className="text-sm">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Success Section */}
        <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
              
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon icon="mdi:check-circle-outline" className="text-4xl text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Password Updated!
                </h1>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </div>

              {/* Action Button */}
              <Link href="/login">
                <button className="w-full py-4 font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-200">
                  <div className="flex items-center justify-center">
                    <Icon icon="mdi:login" className="mr-2 text-xl" />
                    Continue to Login
                  </div>
                </button>
              </Link>

            </div>
          </div>
        </div>

      </section>
    );
  }

  return (
    <>
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Image Section */}
        <div className="hidden lg:grid lg:col-span-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="flex items-center justify-center h-full p-8 relative z-10">
            <div className="text-center">
              <Image
                src={Logins}
                alt="Reset Password Illustration"
                className="w-full max-w-lg mx-auto mb-8 drop-shadow-2xl"
                priority
              />
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">Create New Password</h2>
                <p className="text-xl text-orange-100 mb-6">
                  Choose a strong password to secure your account
                </p>
                <div className="flex items-center justify-center gap-6 text-orange-100">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:shield-lock" className="text-2xl" />
                    <span className="text-sm">Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:key" className="text-2xl" />
                    <span className="text-sm">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>

        {/* Right Form Section */}
        <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md">
            
            {/* Language Switch */}
            <div className="mb-8 text-sm text-gray-500 cursor-pointer text-end hover:text-orange-500 transition-colors">
              <span className="flex items-center justify-end gap-2">
                <Icon icon="mdi:web" className="text-base" />
                English (UK) 
                <Icon icon="mdi:chevron-down" className="text-xs" />
              </span>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon="mdi:key-variant" className="text-3xl text-orange-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Reset Your Password
                </h1>
                <p className="text-gray-600">
                  Create a new password for your account
                </p>
              </div>

              {/* Reset Password Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* New Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          className={`w-full px-4 py-3 pl-12 pr-12 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                            errors.password 
                              ? "border-red-300 focus:border-red-500" 
                              : "border-gray-200 focus:border-orange-500"
                          }`}
                        />
                        <Icon 
                          icon="mdi:lock-outline" 
                          className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Icon 
                            icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} 
                            className="text-lg" 
                          />
                        </button>
                      </div>
                    )}
                  />
                  
                  {/* Password Strength Indicator */}
                  {passwordValue && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-600">Password Strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength <= 2 ? 'text-red-500' : 
                          passwordStrength === 3 ? 'text-yellow-500' :
                          passwordStrength === 4 ? 'text-blue-500' : 'text-green-500'
                        }`}>
                          {getStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-colors ${
                              level <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className={`w-full px-4 py-3 pl-12 pr-12 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                            errors.confirmPassword 
                              ? "border-red-300 focus:border-red-500" 
                              : "border-gray-200 focus:border-orange-500"
                          }`}
                        />
                        <Icon 
                          icon="mdi:lock-check-outline" 
                          className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Icon 
                            icon={showConfirmPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} 
                            className="text-lg" 
                          />
                        </button>
                      </div>
                    )}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:information" className="text-blue-500 text-xl mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Password Requirements</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li className="flex items-center gap-2">
                          <Icon 
                            icon={passwordValue?.length >= 8 ? "mdi:check" : "mdi:circle-outline"} 
                            className={`text-sm ${passwordValue?.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} 
                          />
                          At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon 
                            icon={/[A-Z]/.test(passwordValue || '') ? "mdi:check" : "mdi:circle-outline"} 
                            className={`text-sm ${/[A-Z]/.test(passwordValue || '') ? 'text-green-500' : 'text-gray-400'}`} 
                          />
                          One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon 
                            icon={/[a-z]/.test(passwordValue || '') ? "mdi:check" : "mdi:circle-outline"} 
                            className={`text-sm ${/[a-z]/.test(passwordValue || '') ? 'text-green-500' : 'text-gray-400'}`} 
                          />
                          One lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon 
                            icon={/\d/.test(passwordValue || '') ? "mdi:check" : "mdi:circle-outline"} 
                            className={`text-sm ${/\d/.test(passwordValue || '') ? 'text-green-500' : 'text-gray-400'}`} 
                          />
                          One number
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon 
                            icon={/[@$!%*?&]/.test(passwordValue || '') ? "mdi:check" : "mdi:circle-outline"} 
                            className={`text-sm ${/[@$!%*?&]/.test(passwordValue || '') ? 'text-green-500' : 'text-gray-400'}`} 
                          />
                          One special character
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || passwordStrength < 4}
                  className="w-full py-4 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:from-orange-500 disabled:hover:to-orange-600"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating Password...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Icon icon="mdi:lock-reset" className="mr-2 text-xl" />
                      Update Password
                    </div>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-8 text-center">
                <Link 
                  href="/auth/login" 
                  className="font-bold text-orange-500 hover:text-orange-600 transition-colors inline-flex items-center gap-2"
                >
                  <Icon icon="mdi:arrow-left" className="text-lg" />
                  Back to Login
                </Link>
              </div>

              {/* Terms */}
              <p className="mt-6 text-xs text-center text-gray-500">
                By updating your password, you agree to our{" "}
                <a href="#" className="text-orange-500 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-orange-500 hover:underline">Privacy Policy</a>
              </p>

            </div>

            {/* Help Section */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                <Icon icon="mdi:help-circle-outline" className="text-lg" />
                <span>Need help? </span>
                <Link href="/support" className="text-orange-500 hover:text-orange-600 font-medium">
                  Contact Support
                </Link>
              </div>
            </div>

          </div>
        </div>

      </section>
    </>
  );
}

export default ResetPassword;