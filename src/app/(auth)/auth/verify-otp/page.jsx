"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import Logins from "../../../../../public/assets/user/signup.png";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "../../../../config/axiosInstance";
import handleError from "../../../../helper/handleError";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const schema = yup.object().shape({
  otp: yup
    .string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .matches(/^\d+$/, "OTP must contain only numbers"),
});

function OtpVerification() {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(20);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      otp: "",
    },
  });

  // Timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Update form value
    const otpString = newOtpValues.join("");
    setValue("otp", otpString);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const numbers = pastedData.replace(/\D/g, "").slice(0, 6);

    if (numbers.length === 6) {
      const newOtpValues = numbers.split("");
      setOtpValues(newOtpValues);
      setValue("otp", numbers);
      inputRefs.current[5]?.focus();
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log("OTP submitted:", data);

      const response = await axiosInstance.post("/auth/verify-otp", {
        otp: data.otp,
        email: user?.email,
      });

      if (response.status !== 200) {
        toast.error("Something went wrong, please try again");
        return;
      }

      const { message, data: resData } = response.data;

      toast.success(message);

      const userData = resData?.user;

      if (!userData) {
        toast.error("Invalid response from server");
        return;
      }

      // 🔑 Redirect logic
      if (userData.role === "repairman" && !userData.isProfileComplete) {
        router.push("/repair-man/profile");
      } else if (userData.role === "seller" && !userData.isProfileComplete) {
        router.push("/seller-man/profile");
      } else {
        router.push("/");
      }

    } catch (error) {
      handleError(error); 
    }
  };


  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await axiosInstance.post("/auth/resend-otp", { email: user?.email });
      setTimer(120);
      setCanResend(false);
      setOtpValues(["", "", "", "", "", ""]);
      setValue("otp", "");
      inputRefs.current[0]?.focus();
    } catch (error) {
      handleError(error);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
                  alt="OTP Verification Illustration"
                  className="w-full max-w-md mx-auto mb-6 drop-shadow-2xl"
                />
                <div className="text-white">
                  <h3 className="mb-2 text-2xl font-bold">
                    Verify Your Account
                  </h3>
                  <p className="text-orange-100">
                    Almost there! Just one more step to go
                  </p>
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
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="mdi:email-check-outline"
                        className="text-3xl text-orange-500"
                      />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Verify Your Email
                    </h1>
                    <p className="text-gray-600 mb-2">
                      We've sent a 6-digit verification code to
                    </p>
                    <p className="text-orange-500 font-semibold">
                      {user?.email}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* OTP Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        Enter Verification Code
                      </label>
                      <Controller
                        name="otp"
                        control={control}
                        render={({ field }) => (
                          <div className="flex justify-center gap-3 mb-4">
                            {otpValues.map((value, index) => (
                              <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={value}
                                onChange={(e) =>
                                  handleOtpChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none ${errors.otp
                                    ? "border-red-300 focus:border-red-500 bg-red-50"
                                    : value
                                      ? "border-orange-500 bg-orange-50 text-orange-600"
                                      : "border-gray-200 focus:border-orange-500 bg-gray-50"
                                  }`}
                              />
                            ))}
                          </div>
                        )}
                      />
                      {errors.otp && (
                        <p className="text-xs text-red-600 text-center mt-2">
                          {errors.otp.message}
                        </p>
                      )}
                    </div>

                    {/* Timer and Resend */}
                    <div className="text-center">
                      {!canResend ? (
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Icon icon="mdi:clock-outline" className="text-lg" />
                          <span className="text-sm">
                            Resend code in{" "}
                            <span className="font-bold text-orange-500">
                              {formatTime(timer)}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isResending}
                          className="text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                          {isResending ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                              Resending...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Icon icon="mdi:refresh" className="text-lg" />
                              Resend Code
                            </div>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || otpValues.join("").length !== 6}
                      className="w-full py-4 mt-6 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:from-orange-500 disabled:hover:to-orange-600"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Icon
                            icon="mdi:check-circle-outline"
                            className="mr-2 text-xl"
                          />
                          Verify Account
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Help Section */}
                  <div className="mt-8 text-center space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                        <Icon
                          icon="mdi:help-circle-outline"
                          className="text-lg"
                        />
                        <span className="text-sm font-medium">
                          Having trouble?
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Check your spam folder or try a different email address
                      </p>
                    </div>

                    {/* Back to Signup */}
                    <div>
                      <span className="text-gray-600 text-sm">
                        Want to use a different email?{" "}
                      </span>
                      <Link
                        href="/auth/register"
                        className="font-bold text-orange-500 hover:text-orange-600 transition-colors text-sm"
                      >
                        <Icon icon="mdi:arrow-left" className="inline mr-1" />
                        Back to Signup
                      </Link>
                    </div>
                  </div>

                  {/* Terms */}
                  <p className="mt-6 text-xs text-center text-gray-500">
                    By verifying your account, you agree to our{" "}
                    <a href="#" className="text-orange-500 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-orange-500 hover:underline">
                      Privacy Policy
                    </a>
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

export default OtpVerification;
