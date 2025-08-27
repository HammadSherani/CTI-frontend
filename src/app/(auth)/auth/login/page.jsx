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
import { useRouter } from "next/navigation";
import { setAuth } from "@/store/auth";
import { useDispatch } from "react-redux";

// Validation schema
const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: yup.boolean(),
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      console.log("Login submitted:", data);
      const response = await axiosInstance.post("/auth/login", {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });


      const resData = response.data.data;

      if(resData?.user?.role === "admin") {
        router.push("/admin/dashboard");
      }

      if(resData?.user?.role === "repairman" && resData?.user?.isProfileComplete === false) {
        router.push("/repair-man/complete-profile");
      }else if (resData?.user?.role === "repairman" && resData?.user?.isProfileComplete === true ) {
        router.push("/repair-man/dashboard");
      }else {
        router.push("/");
      }

      dispatch(setAuth({
        user: resData.user,
        token: resData.token,
        userType: resData.user.role
      }))


      // if(response.data.)

      // Handle successful login
      // Store token, redirect, etc.
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      handleError(error);
    }
  };

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
                alt="Login Illustration"
                className="w-full max-w-lg mx-auto mb-8 drop-shadow-2xl"
                priority
              />
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-xl text-orange-100 mb-6">
                  Sign in to continue your journey
                </p>
                <div className="flex items-center justify-center gap-6 text-orange-100">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:shield-check" className="text-2xl" />
                    <span className="text-sm">Secure Login</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:flash" className="text-2xl" />
                    <span className="text-sm">Quick Access</span>
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
            {/* <div className="mb-8 text-sm text-gray-500 cursor-pointer text-end hover:text-orange-500 transition-colors">
              <span className="flex items-center justify-end gap-2">
                <Icon icon="mdi:web" className="text-base" />
                English (UK) 
                <Icon icon="mdi:chevron-down" className="text-xs" />
              </span>
            </div> */}

            {/* Main Content */}
            <div className="bg-white rounded-3xl shadow-md mt-6 p-8 md:p-10">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon="mdi:account-circle" className="text-3xl text-orange-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button className="flex items-center justify-center py-3 px-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
                  <Icon icon="logos:google-icon" className="mr-3 text-xl" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Google
                  </span>
                </button>
                <button className="flex items-center justify-center py-3 px-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
                  <Icon icon="logos:facebook" className="mr-3 text-xl" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Facebook
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

              {/* Login Form */}
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
                          placeholder="Enter your email"
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

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
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
                  {errors.password && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center cursor-pointer">
                        <input
                          {...field}
                          type="checkbox"
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${
                          field.value 
                            ? 'bg-orange-500 border-orange-500' 
                            : 'border-gray-300 hover:border-orange-300'
                        }`}>
                          {field.value && (
                            <Icon icon="mdi:check" className="text-white text-sm" />
                          )}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                      </label>
                    )}
                  />
                  
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:from-orange-500 disabled:hover:to-orange-600"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Icon icon="mdi:login" className="mr-2 text-xl" />
                      Sign In
                    </div>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link 
                  href="/auth/register" 
                  className="font-bold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Create Account
                </Link>
              </div>

              {/* Terms */}
              <p className="mt-6 text-xs text-center text-gray-500">
                By signing in, you agree to our{" "}
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

export default Login;