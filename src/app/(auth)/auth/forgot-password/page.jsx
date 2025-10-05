"use client"

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import Logins from "../../../../../public/assets/user/login.png";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "../../../../config/axiosInstance";
import handleError from "../../../../helper/handleError";

// Validation schema
const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
});

function ForgotPassword() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const emailValue = watch("email");

  const onSubmit = async (data) => {
    try {
      console.log("Forgot password submitted:", data);
      const response = await axiosInstance.post("/auth/forgot-password", {
        email: data.email,
      });

      // Handle successful request
      setSentEmail(data.email);
      setIsEmailSent(true);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      handleError(error);
    }
  };

  const handleResendEmail = async () => {
    try {
      await axiosInstance.post("/auth/forgot-password", {
        email: sentEmail,
      });
      // Show success message
    } catch (error) {
      handleError(error);
    }
  };

  if (isEmailSent) {
    return (
    <section className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Image Section */}
       <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="flex items-center justify-center h-full p-8 relative z-10">
            <div className="text-center">
              <Image
                src={Logins}
                alt="Password Reset Illustration"
                className="w-full max-w-lg mx-auto mb-8 drop-shadow-2xl"
                priority
              />
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">Check Your Email</h2>
                <p className="text-xl text-orange-100 mb-6">
                  We've sent password reset instructions
                </p>
                <div className="flex items-center justify-center gap-6 text-orange-100">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:email-check" className="text-2xl" />
                    <span className="text-sm">Email Sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:shield-lock" className="text-2xl" />
                    <span className="text-sm">Secure Reset</span>
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

        {/* Right Success Section */}
        <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-4 bg-gray-50">
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
              
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon icon="mdi:email-check-outline" className="text-4xl text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Check Your Email
                </h1>
                <p className="text-gray-600 mb-4">
                  We've sent password reset instructions to:
                </p>
                <p className="text-orange-500 font-semibold text-lg mb-6">
                  {sentEmail}
                </p>
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:information" className="text-primary-500 text-xl mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-primary-900 mb-1">What's next?</h3>
                      <ul className="text-sm text-primary-800 space-y-1">
                        <li>• Check your email inbox and spam folder</li>
                        <li>• Click the reset link in the email</li>
                        <li>• Create a new secure password</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleResendEmail}
                  className="w-full py-4 font-bold text-orange-500 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 hover:border-orange-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-center">
                    <Icon icon="mdi:email-send" className="mr-2 text-xl" />
                    Resend Email
                  </div>
                </button>
                
                <Link href="/login">
                  <button className="w-full py-4 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200">
                    <div className="flex items-center justify-center">
                      <Icon icon="mdi:arrow-left" className="mr-2 text-xl" />
                      Back to Login
                    </div>
                  </button>
                </Link>
              </div>

              {/* Help Section */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                  <Icon icon="mdi:help-circle-outline" className="text-lg" />
                  <span className="text-sm font-medium">Didn't receive the email?</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Check your spam folder or try a different email address
                </p>
                <Link href="/support" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                  Contact Support
                </Link>
              </div>

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
                alt="Forgot Password Illustration"
                className="w-full max-w-lg mx-auto mb-8 drop-shadow-2xl"
                priority
              />
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">Reset Password</h2>
                <p className="text-xl text-orange-100 mb-6">
                  Don't worry, we'll help you get back in
                </p>
                <div className="flex items-center justify-center gap-6 text-orange-100">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:shield-lock" className="text-2xl" />
                    <span className="text-sm">Secure Process</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:clock-fast" className="text-2xl" />
                    <span className="text-sm">Quick Recovery</span>
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
                  <Icon icon="mdi:lock-reset" className="text-3xl text-orange-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-gray-600">
                  No worries! Enter your email and we'll send you reset instructions
                </p>
              </div>

              {/* Reset Password Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <input
                          {...field}
                          type="email"
                          placeholder="Enter your email address"
                          className={`w-full px-4 py-3 pl-12 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                            errors.email 
                              ? "border-red-300 focus:border-red-500" 
                              : "border-gray-200 focus:border-orange-500"
                          }`}
                        />
                        <Icon 
                          icon="mdi:email-outline" 
                          className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                        />
                      </div>
                    )}
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Info Box */}
                {/* <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:information" className="text-primary-500 text-xl mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-primary-900 mb-1">How it works</h3>
                      <p className="text-sm text-primary-800">
                        We'll send a secure link to your email address. Click the link to create a new password for your account.
                      </p>
                    </div>
                  </div>
                </div> */}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:from-orange-500 disabled:hover:to-orange-600"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Reset Link...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Icon icon="mdi:email-send" className="mr-2 text-xl" />
                      Send Reset Link
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

              {/* Alternative Options */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-3">Still having trouble?</p>
                  <div className="flex items-center justify-center gap-4">
                    <Link href="/support" className="text-orange-500 hover:text-orange-600 font-medium">
                      Contact Support
                    </Link>
                    <span className="text-gray-300">•</span>
                    <Link href="/auth/register" className="text-orange-500 hover:text-orange-600 font-medium">
                      Create New Account
                    </Link>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <p className="mt-6 text-xs text-center text-gray-500">
                By resetting your password, you agree to our{" "}
                <a href="#" className="text-orange-500 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-orange-500 hover:underline">Privacy Policy</a>
              </p>

            </div>

            {/* Help Section */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                <Icon icon="mdi:help-circle-outline" className="text-lg" />
                <span>Need immediate help? </span>
                <Link href="/support" className="text-orange-500 hover:text-orange-600 font-medium">
                  Get Support
                </Link>
              </div>
            </div>

          </div>
        </div>

      </section>
    </>
  );
}

export default ForgotPassword;