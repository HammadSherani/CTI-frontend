"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const { services, loading: servicesLoading } = useSelector((state) => state.home || {});

  const activeServices = Array.isArray(services)
    ? services.filter((s) => s.isActive !== false)
    : [];

  const displayServices = activeServices.length > 0 ? activeServices : [];

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

  // Fetch Brands
  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const { data } = await axiosInstance.get("/public/brands");
      setBrands(data?.data?.brands || []);
    } catch (err) {
      setError("Failed to load brands. Please try again.");
      console.error(err);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModels = async (brandId) => {
    if (!brandId) return;
    try {
      setLoadingModels(true);
      setModels([]);
      setSelectedModel(null);
      setColors([]);
      setSelectedColor(null);

      const { data } = await axiosInstance.get(`/public/models/brand/${brandId}`);
      setModels(data?.data?.models || []);
    } catch (err) {
      console.error("Failed to load models", err);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchColors = async (modelId) => {
    if (!modelId) return;
    try {
      setLoadingColors(true);
      setColors([]);

      const { data } = await axiosInstance.get(`/public/models/${modelId}/colors`);
      setColors(data?.data?.colors || []);
    } catch (err) {
      console.error("Failed to load colors", err);
    } finally {
      setLoadingColors(false);
    }
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedColor(null);
    if (brand?._id) fetchModels(brand._id);
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    setSelectedColor(null);
    if (model?._id) fetchColors(model._id);
  };

  const handleColorChange = (color) => setSelectedColor(color);
const handleFindService = () => {
    if (!selectedBrand || !selectedModel || !selectedColor) {
      toast.warn("Please select Brand, Model, and Color first");
      return;
    }
    setShowModal(true);
  };
const handleSearchRepairman = () => {
    setShowModal(false);
    router.push("/coming");        
  };
  const handlePostJob = () => {
    if (!selectedBrand || !selectedModel || !selectedColor) {
      toast.warn("Please select Brand, Model, and Color");
      return;
    }
    const brandSlug = selectedBrand.slug || selectedBrand.name.toLowerCase();
    const modelSlug = selectedModel.slug || selectedModel.name.toLowerCase().replace(/\s+/g, "-");
    const colorSlug = selectedColor.toLowerCase();
    router.push(`/mobile-repair/${brandSlug}/${modelSlug}/${colorSlug}`);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const brandOptions = brands.map((b) => ({ value: b._id, label: b.name, data: b }));
  const modelOptions = models.map((m) => ({ value: m._id, label: m.name, data: m }));
  const colorOptions = colors.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick Service Finder */}
        <div className="bg-[#FF69000D] rounded-2xl shadow-xl mb-16 px-8 py-6">
          <div className="flex justify-center items-center mb-4">
            <SectionTag title="Service Finder" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
            Quick <span className="text-primary-600">Service</span> Finder
          </h2>
          <p className="text-gray-600 mt-3 max-w-md mx-auto text-center">
            Select your device brand, model, color and connect with verified professionals near you.
          </p>

          {/* Filters */}
          <form className="mt-6 flex flex-wrap sm:flex-nowrap items-center gap-2 border border-gray-200 bg-white rounded-2xl shadow-md px-3 py-3" onSubmit={(e) => e.preventDefault()}>

            {/* Brand */}
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

            {/* Model */}
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

            {/* Color */}
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

            {/* Buttons */}
    {/* Single Button */}
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

        {/* Our Services */}
        <div className="text-left mb-12">
          <SectionTag title="Our Services" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            <span className="text-primary-600">Our</span> Services
          </h2>
        </div>

        {servicesLoading ? (
          <ServicesSkeleton />
        ) : displayServices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No services available right now.</div>
        ) : (
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5 md:gap-6">
            {displayServices.map((service, index) => (
              <motion.div key={service._id || index} className="rounded-2xl transition-all duration-300 overflow-hidden group cursor-pointer">
                <div onClick={()=>router.push("/mobile-repair")} className="h-34 md:h-22 bg-[#FF690017] flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                    <Image
                      src={service.icon || "https://via.placeholder.com/120?text=Service"}
                      alt={service.name}
                      width={120}
                      height={120}
                      className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-nowrap text-gray-800 group-hover:text-orange-600 transition-colors">
                    {service.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
                      <source media="(min-width: 640px)"  />
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