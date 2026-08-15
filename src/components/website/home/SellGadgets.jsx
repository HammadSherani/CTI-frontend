"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import axiosInstance from "@/config/axiosInstance";

const SellGadgets = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/public/sell-device/header-data");
        if (response.data?.success) {
          setCategories(response.data.data.sellGadgets || []);
          console.log(response.data.data.sellGadgets);
        }
      } catch (error) {
        console.error("Error fetching sell gadgets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-left mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Sell Your Old Device Now
          </h2>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex flex-wrap justify-start gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-start w-[100px] sm:w-[120px]">
                <div className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] bg-gray-100 animate-pulse rounded-2xl mb-3"></div>
                <div className="h-3 bg-gray-200 animate-pulse rounded w-16 sm:w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-start gap-4 sm:gap-6">
            {categories.map((item) => (
              <motion.div
                key={item._id || item.slug}
                whileHover={{ y: -3 }}
                className="flex flex-col items-center justify-start group cursor-pointer w-[100px] sm:w-[120px]"
                onClick={() => router.push(`/sell-devices/${item.slug}`)}
              >
                {/* Card Container */}
                <div className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] bg-primary-50 rounded-2xl flex items-center justify-center p-4 mb-3 transition-colors duration-300 group-hover:bg-primary-50">
                  <div className="relative w-full h-full">
                    <Image
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name}
                      fill
                      sizes="100px"
                      className="object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Label */}
                <span className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center leading-tight">
                  {item.name}
                </span>
              </motion.div>
            ))}

            {/* Sell More Card */}
            <motion.div
              whileHover={{ y: -3 }}
              className="flex flex-col items-center justify-start group cursor-pointer w-[100px] sm:w-[120px]"
              onClick={() => router.push("/sell-devices")}
            >
              <div className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] bg-primary-50 rounded-2xl flex items-center justify-center p-4 mb-3 transition-colors duration-300 group-hover:bg-primary-50">
                <div className="flex gap-1 items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600 group-hover:bg-primary-600 transition-colors"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600 group-hover:bg-primary-600 transition-colors"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600 group-hover:bg-primary-600 transition-colors"></span>
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center leading-tight">
                Sell More
              </span>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellGadgets;
