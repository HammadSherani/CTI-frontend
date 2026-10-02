"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import ReusableCategoryGrid from "./ReusableCategoryGrid";
import axiosInstance from "@/config/axiosInstance";

let cachedSellGadgets = null;

const SellGadgets = () => {
  const router = useRouter();
  const [categories, setCategories] = useState(cachedSellGadgets || []);
  const [loading, setLoading] = useState(!cachedSellGadgets);

  useEffect(() => {
    if (cachedSellGadgets) return;

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/public/sell-device/header-data");
        if (response.data?.success) {
          cachedSellGadgets = response.data.data.sellGadgets || [];
          setCategories(cachedSellGadgets);
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
    <div className="-mt-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReusableCategoryGrid
          sectionTag="Sell Gadgets"
          titleHighlight="Sell"
          title="Your Old Device Now"
          loading={loading}
          categories={categories}
          onItemClick={(item) => router.push(`/sell-devices/${item.slug}`)}
          showSellMore={true}
          onSellMoreClick={() => router.push("/sell-devices")}
          cardClassName="bg-[#FF69000D] group-hover:bg-[#FF69001A] p-2"
          wrapperClassName="w-[100px] sm:w-[100px]"
        />
      </div>
    </div>
  );
};

export default SellGadgets;
