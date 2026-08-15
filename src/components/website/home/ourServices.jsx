"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import SectionTag from "./sectoinTag";
import { CustomDropdown } from "./customDropdown";
import { ServicesSkeleton } from "../skeletons/home";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const ServiceSection = () => {
  const router = useRouter();

  // Dropdown States
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [colors, setColors] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch Buy Refurbished Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/public/sell-device/header-data");
        if (response.data?.success) {
          setCategories(response.data.data.buyRefurbished || []);
        }
      } catch (error) {
        console.error("Error fetching buy refurbished categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Brands
  const fetchBrands = async () => {
    try {
      const response = await axiosInstance.get("/services/brands");
      if (response.data && response.data.success) {
        setBrands(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch brands:", err);
      setError("Failed to load brands.");
    } finally {
      setLoadingBrands(false);
    }
  };

  // Fetch Models based on Brand
  const fetchModels = async (brandId) => {
    setLoadingModels(true);
    try {
      const response = await axiosInstance.get(`/services/models?brandId=${brandId}`);
      if (response.data && response.data.success) {
        setModels(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch models:", err);
    } finally {
      setLoadingModels(false);
    }
  };

  // Fetch Colors based on Model
  const fetchColors = async (modelId) => {
    setLoadingColors(true);
    try {
      const response = await axiosInstance.get(`/services/colors?modelId=${modelId}`);
      if (response.data && response.data.success) {
        setColors(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch colors:", err);
    } finally {
      setLoadingColors(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Handlers
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedColor(null);
    setModels([]);
    setColors([]);
    if (brand) fetchModels(brand._id);
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    setSelectedColor(null);
    setColors([]);
    if (model) fetchColors(model._id);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleFindService = () => {
    if (!selectedBrand || !selectedModel || !selectedColor) {
      toast.warn("Please select all options");
      return;
    }
    setShowModal(true);
  };

  const handleSearchRepairman = () => {
    setShowModal(false);
    router.push(`/mobile-repair/${selectedBrand.slug}/${selectedModel._id}/${selectedColor}`);
  };

  const handleMailInRepair = () => {
    setShowModal(false);
    router.push(`/mail-in-repair/${selectedBrand.slug}/${selectedModel._id}/${selectedColor}`);
  };

  // Formatting Options for Dropdowns
  const brandOptions = brands.map((b) => ({ label: b.name, value: b._id, icon: b.icon }));
  const modelOptions = models.map((m) => ({ label: m.name, value: m._id }));
  const colorOptions = colors.map((c) => ({ label: c, value: c }));

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick Service Finder */}
        <div className="bg-[#FF69000D] rounded-2xl shadow-xl mb-16 px-8 py-6">
          <div className="flex justify-center items-center mb-4">
            <SectionTag title="Service Finder" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
            Quick <span className="text-primary-600">Service</span> Finder
          </h2>
          <p className="text-gray-600 mt-3 max-w-md mx-auto text-center">
            Select your device brand, model, color and connect with verified professionals near you.
          </p>

          {/* Filters */}
          <form className="mt-6 flex flex-wrap sm:flex-nowrap items-center gap-2 border border-gray-200 bg-white rounded-2xl shadow-md px-3 py-3" onSubmit={(e) => e.preventDefault()}>

            <CustomDropdown
              icon="mdi:cellphone"
              label="Brand"
              placeholder={loadingBrands ? "Loading..." : brands.length ? "Select Brand" : "Not Found"}
              options={brandOptions}
              value={selectedBrand?._id || ""}
              onChange={(val) => handleBrandChange(brands.find(b => b._id === val))}
              loading={loadingBrands}
              disabled={loadingBrands || !brands.length}
            />

            <Divider />

            <CustomDropdown
              icon="fluent:phone-key-20-regular"
              label="Model"
              placeholder={loadingModels ? "Loading..." : models.length ? "Select Model" : "Not Found"}
              options={modelOptions}
              value={selectedModel?._id || ""}
              onChange={(val) => handleModelChange(models.find(m => m._id === val))}
              loading={loadingModels}
              disabled={!selectedBrand || loadingModels || !models.length}
            />

            <Divider />

            <CustomDropdown
              icon="mdi:palette"
              label="Color"
              placeholder={loadingColors ? "Loading..." : colors.length ? "Select Color" : "Not Found"}
              options={colorOptions}
              value={selectedColor || ""}
              onChange={handleColorChange}
              loading={loadingColors}
              disabled={!selectedModel || loadingColors || !colors.length}
            />

            <Divider />

            <div className="flex-shrink-0 px-1">
              <button
                type="button"
                onClick={handleFindService}
                disabled={!selectedBrand || !selectedModel || !selectedColor}
                className="bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl transition-all flex items-center gap-2 shadow-sm w-full sm:w-auto"
              >
                <Icon icon="mdi:magnify" className="w-5 h-5" />
                Find Service
              </button>
            </div>
          </form>
        </div>

        {/* Buy Refurbished */}
        <div className="text-left mb-12">
          <SectionTag title="Buy Refurbished" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            <span className="text-primary-600">Our</span> Services
          </h2>
        </div>

        {loadingCategories ? (
          <div className="flex flex-wrap justify-start gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-start w-[100px] sm:w-[120px]">
                <div className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] bg-gray-100 animate-pulse rounded-2xl mb-3"></div>
                <div className="h-3 bg-gray-200 animate-pulse rounded w-16 sm:w-20"></div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No categories available right now.</div>
        ) : (
          <div className="flex flex-wrap justify-start gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category._id || index}
                whileHover={{ y: -3 }}
                className="flex flex-col items-center justify-start group cursor-pointer w-[100px] sm:w-[120px]"
                onClick={() => router.push(`/refurbish?category=${category.slug}`)}
              >
                <div className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] bg-[#FF69000D] rounded-2xl flex items-center justify-center p-4 mb-3 transition-colors duration-300 group-hover:bg-[#FF69001A]">
                  <div className="relative w-full h-full">
                    <Image
                      src={category.image || "https://via.placeholder.com/120?text=Category"}
                      alt={category.name}
                      fill
                      sizes="100px"
                      className="object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                <span className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center leading-tight">
                  {category.name}
                </span>
              </motion.div>
            ))}
          </div>
        )}



        {/* ==================== MODAL ==================== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b">
                <h3 className="text-xl font-semibold text-gray-900 text-center">
                  What do you want to do?
                </h3>
                <p className="text-gray-500 text-center mt-1 text-sm">
                  {selectedBrand?.name} • {selectedModel?.name} • {selectedColor}
                </p>
              </div>

              {/* Options */}
              <div className="p-6 space-y-3">
                <button
                  onClick={handleSearchRepairman}
                  className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors px-5 py-4 rounded-2xl group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Icon icon="mdi:magnify" className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Search Repairman</p>
                      <p className="text-sm text-gray-500">Find nearby verified technicians</p>
                    </div>
                  </div>
                  <Icon icon="mdi:chevron-right" className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
                </button>

                <button
                  onClick={handlePostJob}
                  className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors px-5 py-4 rounded-2xl group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <Icon icon="mdi:plus-circle" className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Hire a Repairman<picture>
                        <source media="(min-width: 640px)" />
                        <img src="" alt="" />
                      </picture></p>
                      <p className="text-sm text-gray-500">Let repairmen come to you</p>
                    </div>
                  </div>
                  <Icon icon="mdi:chevron-right" className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
                </button>
              </div>

              {/* Close Button */}
              <div className="px-6 py-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Small Divider Component
const Divider = () => (
  <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
);

export default ServiceSection;