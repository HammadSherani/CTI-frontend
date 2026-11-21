"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import ReusableCategoryGrid from "./ReusableCategoryGrid";
import { fetchHeaderData, sellLabel, PHONE_SLUGS } from "./headerDataCache";
import SellMoreDrawer from "./SellMoreDrawer";

const SellGadgets = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchHeaderData();
        // Phone is excluded from sellGadgets by the API; add it first (fallback: the phone category in the buy list).
        const phone =
          data?.sellPhone ||
          (data?.buyRefurbished || []).find((c) => PHONE_SLUGS.includes(c.slug));
        const gadgets = (data?.sellGadgets || []).filter((c) => !PHONE_SLUGS.includes(c.slug));
        const top = [...(phone ? [phone] : []), ...gadgets].map((c) => ({ ...c, name: sellLabel(c) }));
        setCategories(top);
        // Full list for the "Sell More" drawer (falls back to the top list on an older API).
        setAllCategories(
          data?.allSellCategories?.length
            ? data.allSellCategories.map((c) => ({ ...c, name: sellLabel(c) }))
            : top
        );
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
          onSellMoreClick={() => setDrawerOpen(true)}
          cardClassName="bg-[#FF69000D] group-hover:bg-[#FF69001A] p-2"
          wrapperClassName="w-[100px] sm:w-[100px]"
        />
      </div>

      <SellMoreDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={allCategories}
        onSelect={(item) => { setDrawerOpen(false); router.push(`/sell-devices/${item.slug}`); }}
        onViewAll={() => { setDrawerOpen(false); router.push("/sell-devices"); }}
      />
    </div>
  );
};

export default SellGadgets;
