"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import Image from "next/image";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { setAuth } from "@/store/auth";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Logins from "../../../../../../../../public/assets/user/login.png"; // Adjust path as needed
import Link from "next/link";
import { setCurrentUser } from "@/store/chat";

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

function LoginModal({ isOpen, onClose, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      
      // Re-enable scrolling when modal closes
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const onSubmit = async (data) => {
    try {
      setErrorMessage("");
      console.log("Login submitted:", data);
      
      const response = await axiosInstance.post("/auth/login", {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      const resData = response.data.data;

      // Check if user is customer
      if (resData?.user?.role !== "customer") {
        setErrorMessage("Only customers can post jobs. Please login with a customer account.");
        return;
      }

      // Set auth in Redux
      dispatch(setAuth({
        user: resData.user,
        token: resData.token,
        userType: resData.user.role
      }));


      dispatch(setCurrentUser(resData.user));

      reset();
      onClose();
      
    //   if (onSuccess) {
        onSuccess(resData);
    //   }

    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Invalid email or password. Please try again.");
      handleError(error);
    }
  };

  const handleClose = () => {
    reset();
    setErrorMessage("");
    onClose();
  };

  // Animation variants
  const backdropVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const leftPanelVariants = {
    hidden: {
      opacity: 0,
      x: -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const rightPanelVariants = {
    hidden: {
      opacity: 0,
      x: 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const formItemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + (index * 0.1),
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[3px] bg-opacity-50 overflow-hidden"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Close Button */}
            <motion.button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ 
                opacity: 1, 
                rotate: 0,
                transition: { delay: 0.6, duration: 0.3 }
              }}
            >
              <Icon icon="mdi:close" className="text-2xl" />
            </motion.button>

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
              
              {/* Left Image Section */}
              <motion.div 
                className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden"
                variants={leftPanelVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="flex items-center justify-center h-full p-8 relative z-10">
                  <div className="text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        transition: { delay: 0.4, duration: 0.5, type: "spring", stiffness: 200 }
                      }}
                    >
                      <Image
                        src={Logins}
                        alt="Login to Post Job"
                        className="w-full max-w-sm mx-auto mb-6 drop-shadow-2xl"
                        priority
                      />
                    </motion.div>
                    <div className="text-white">
                      <motion.h2 
                        className="text-2xl font-bold mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: 0.6, duration: 0.3 }
                        }}
                      >
                        Login to Post Job
                      </motion.h2>
                      <motion.p 
                        className="text-lg text-orange-100 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: 0.7, duration: 0.3 }
                        }}
                      >

                        Sign in to create and manage your repair jobs
                      </motion.p>
                      <motion.div 
                        className="flex items-center justify-center gap-4 text-orange-100 text-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: 0.8, duration: 0.3 }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:shield-check" className="text-xl" />
                          <span>Secure</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:flash" className="text-xl" />
                          <span>Quick</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <motion.div 
                  className="absolute top-8 left-8 w-16 h-16 bg-white/10 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                ></motion.div>
                <motion.div 
                  className="absolute bottom-16 right-16 w-24 h-24 bg-white/5 rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                ></motion.div>
                <motion.div 
                  className="absolute top-1/2 right-8 w-12 h-12 bg-white/10 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                ></motion.div>
              </motion.div>

              {/* Right Form Section */}
              <motion.div 
                className="flex items-center justify-center p-8 bg-gray-50"
                variants={rightPanelVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="w-full max-w-sm">

                  {/* Header */}
                  <motion.div 
                    className="text-center mb-6"
                    custom={0}
                    variants={formItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon icon="mdi:account-circle" className="text-2xl text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      Welcome Back
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Sign in to post your repair job
                    </p>
                  </motion.div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div 
                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ 
                          opacity: 1, 
                          height: "auto", 
                          marginBottom: 16,
                          transition: { duration: 0.3 }
                        }}
                        exit={{ 
                          opacity: 0, 
                          height: 0, 
                          marginBottom: 0,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <p className="text-sm text-red-600 flex items-center gap-2">
                          <Icon icon="mdi:alert-circle" className="text-base" />
                          {errorMessage}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Email Field */}
                    <motion.div
                      custom={1}
                      variants={formItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className={`w-full px-4 py-2.5 pl-10 bg-white border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                errors.email
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-gray-200 focus:border-orange-500"
                              }`}
                            />
                            <Icon
                              icon="mdi:email-outline"
                              className="absolute left-3 top-3 text-gray-400 text-lg"
                            />
                          </div>
                        )}
                      />
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p 
                            className="mt-1 text-xs text-red-600 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon icon="mdi:alert-circle" className="text-sm" />
                            {errors.email.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                      custom={2}
                      variants={formItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className={`w-full px-4 py-2.5 pl-10 pr-10 bg-white border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                errors.password
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-gray-200 focus:border-orange-500"
                              }`}
                            />
                            <Icon
                              icon="mdi:lock-outline"
                              className="absolute left-3 top-3 text-gray-400 text-lg"
                            />
                            <motion.button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Icon
                                icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
                                className="text-lg"
                              />
                            </motion.button>
                          </div>
                        )}
                      />
                      <AnimatePresence>
                        {errors.password && (
                          <motion.p 
                            className="mt-1 text-xs text-red-600 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon icon="mdi:alert-circle" className="text-sm" />
                            {errors.password.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Remember Me */}
                    <motion.div 
                      className="flex items-center justify-between"
                      custom={3}
                      variants={formItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
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
                            <motion.div 
                              className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                                field.value
                                  ? 'bg-orange-500 border-orange-500'
                                  : 'border-gray-300 hover:border-orange-300'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <AnimatePresence>
                                {field.value && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <Icon icon="mdi:check" className="text-white text-xs" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                          </label>
                        )}
                      />

                      <motion.button
                        type="button"
                        className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Forgot password?
                      </motion.button>
                    </motion.div>

                    {/* Login Button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:from-orange-500 disabled:hover:to-orange-600"
                      custom={4}
                      variants={formItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Signing In...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Icon icon="mdi:login" className="mr-2 text-lg" />
                          Sign In to Post Job
                        </div>
                      )}
                    </motion.button>
                  </form>

                  {/* Sign Up Link */}
                  <motion.div 
                    className="mt-6 text-center"
                    custom={5}
                    variants={formItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <span className="text-gray-600 text-sm">Don't have an account? </span>
                    <motion.button
                      type="button"
                      className="font-bold text-orange-500 hover:text-orange-600 transition-colors text-sm"
                      onClick={() => {
                        // You can add navigation to register page here
                        console.log("Navigate to register");
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href={"/auth/register"}>
                      Create Account
                      </Link>
                      
                    </motion.button>
                  </motion.div>

                  {/* Customer Notice */}
                  <motion.div 
                    className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    custom={6}
                    variants={formItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <p className="text-xs text-center text-orange-700">
                      <Icon icon="mdi:information" className="inline mr-1" />
                      Only customer accounts can post repair jobs
                    </p>
                  </motion.div>

                </div>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoginModal;