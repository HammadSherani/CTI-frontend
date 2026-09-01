"use client";

import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/store/auth";
import { setCurrentUser } from "@/store/chat";

function Logout() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear authentication state when visiting the logout page
    dispatch(clearAuth());
    dispatch(setCurrentUser(null));
  }, [dispatch]);

  return (
    <section className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
      {/* Left Image Section */}
      <div className="hidden lg:grid lg:col-span-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

        <div className="flex items-center h-full justify-center z-20">
          <div className="absolute top-10 left-4 z-20">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1 cursor-pointer bg-gray-100 rounded-full hover:opacity-80 transition"
            >
              <Icon icon="mdi:arrow-left" className="text-gray-800" />
              Go to Website
            </Link>
          </div>

          <div className="text-center">
            <Image
              src="/assets/user/login.png"
              width={300}
              height={500}
              alt="Logout Illustration"
              className="w-full max-w-lg mx-auto mb-8 drop-shadow-2xl"
              priority
            />
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-4">See You Soon!</h2>
              <p className="text-xl text-orange-100 mb-6">
                You have been securely signed out.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full"></div>
      </div>

      {/* Right Content Section */}
      <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-md mt-6 p-8 md:p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="mdi:check-circle" className="text-5xl text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Signed Out Successfully
            </h1>
            <p className="text-gray-600 mb-8">
              Thank you for using our platform. Your session has ended securely. 
              We hope to see you back soon!
            </p>

            <div className="space-y-4">
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center py-4 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200"
              >
                <Icon icon="mdi:login" className="mr-2 text-xl" />
                Sign In Again
              </Link>
              
              <Link
                href="/"
                className="w-full flex items-center justify-center py-4 font-bold text-gray-700 bg-gray-100 rounded-xl shadow-sm hover:bg-gray-200 transform hover:scale-[1.02] transition-all duration-200"
              >
                <Icon icon="mdi:home" className="mr-2 text-xl" />
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Logout;
