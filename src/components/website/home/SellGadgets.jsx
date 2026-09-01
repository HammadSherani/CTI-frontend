"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import ReusableCategoryGrid from "./ReusableCategoryGrid";
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
    <div className=" bg-white">
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
          cardClassName="bg-primary-50 group-hover:bg-primary-50 p-4"
          wrapperClassName="w-[100px] sm:w-[120px]"
        />
      </div>
    </div>
  );
};

export default SellGadgets;
