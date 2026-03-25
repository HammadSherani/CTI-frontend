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
// Active services from Redux (fallback to dummy if empty)
  const activeServices = Array.isArray(services)
    ? services.filter((s) => s.isActive !== false)
    : [];



  const displayServices = activeServices.length > 0 ? activeServices : [];

  // States
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [colors, setColors] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);

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

  // Fetch Models when brand changes
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

  // Fetch Colors when model changes
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

  // Handlers
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedColor(null);
    if (brand?._id) {
      fetchModels(brand._id);
    }
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    setSelectedColor(null);
    if (model?._id) {
      fetchColors(model._id);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  // Search Now → Navigate to dynamic URL
  const handleSearchNow = () => {
        router.push("/coming-soon");
  };

  const handlePostJob = () => {
    if (!selectedBrand || !selectedModel || !selectedColor) {
      alert("Please select Brand, Model, and Color");
      return;
    }

    const brandSlug = selectedBrand.slug || selectedBrand.name.toLowerCase();
    const modelSlug = selectedModel.slug || selectedModel.name.toLowerCase().replace(/\s+/g, "-");
    const colorSlug = selectedColor.toLowerCase();

    const url = `/mobile-repair/${brandSlug}/${modelSlug}/${colorSlug}`;
    router.push(url);
  };

  // Initial fetch
  useEffect(() => {
    fetchBrands();
  }, []);

  // Prepare options for CustomDropdown (assuming it accepts { value, label, ... })
  const brandOptions = brands.map((b) => ({
    value: b._id,
    label: b.name,
    icon: b.icon, // if your dropdown supports it
    data: b,      // full object for later use
  }));

  const modelOptions = models.map((m) => ({
    value: m._id,
    label: m.name,
    data: m,
  }));

  const colorOptions = colors.map((color) => ({
    value: color,
    label: color.charAt(0).toUpperCase() + color.slice(1),
  }));

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick Service Finder Card */}
        <div className="bg-[#FF69000D] rounded-2xl shadow-xl mb-16">
          <div className="px-8 py-6 mx-auto">
            <div className="flex justify-center items-center">
              <SectionTag title="Service Finder" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Quick <span className="text-primary-600">Service</span> Finder
              </h2>
              <p className="text-gray-600 mt-3 max-w-md mx-auto">
                Select your device brand, model, color and connect with verified professionals near you.
              </p>
            </div>
          </div>

          {/* Dynamic Filter Form */}
          <form className="px-4 py-4 md:px-8 md:py-6 -mt-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border border-gray-200 bg-white rounded-2xl shadow-md px-3 py-3">

              {/* Brand */}
              <CustomDropdown
                icon="mdi:cellphone"
                label="Brand"
                placeholder="Select Brand"
                options={brandOptions}
                value={selectedBrand?._id || ""}
                onChange={(val) => {
                  const brandObj = brands.find(b => b._id === val);
                  handleBrandChange(brandObj);
                }}
                loading={loadingBrands}
              />

              <Divider />

              {/* Model */}
              <CustomDropdown
                icon="fluent:phone-key-20-regular"
                label="Model"
                placeholder="Select Model"
                options={modelOptions}
                value={selectedModel?._id || ""}
                onChange={(val) => {
                  const modelObj = models.find(m => m._id === val);
                  handleModelChange(modelObj);
                }}
                loading={loadingModels}
                disabled={!selectedBrand}
              />

              <Divider />

              {/* Color */}
              <CustomDropdown
                icon="mdi:palette"
                label="Color"
                placeholder="Select Color"
                options={colorOptions}
                value={selectedColor || ""}
                onChange={(val) => handleColorChange(val)}
                loading={loadingColors}
                disabled={!selectedModel}
              />

              <Divider />

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex gap-2 px-1">
                <button
                  type="button"
                  onClick={handleSearchNow}
                  disabled={!selectedBrand || !selectedModel || !selectedColor}
                  className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  <Icon icon="mdi:magnify" className="w-5 h-5" />
                  Search Now
                </button>

                <button
                  type="button"
                  onClick={handlePostJob}
                  className="border border-gray-300 hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                >
                  Post a Job
                </button>
              </div>
            </div>
          </form>
        </div>

       {/* Our Services Section */}
        <div className="text-left mb-12">
         <SectionTag title="Our Services" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900"> <span className="text-primary-600">Our</span> Services</h2>
        
        </div>

        {servicesLoading ? (
          <ServicesSkeleton />
        ) : displayServices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No services available right now.</div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {displayServices.map((service, index) => (
              <motion.div
                key={service._id || index}
                className=" rounded-2xl  transition-all duration-300 overflow-hidden group cursor-pointer"
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.03 }}
              >
   <div className="h-34 md:h-22 bg-[#FF690017] flex items-center justify-center">
  
  {/* Fixed box for all images */}
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
      </div>
    </div>
  );
};

// Small Divider Component
const Divider = () => (
  <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
);

export default ServiceSection;