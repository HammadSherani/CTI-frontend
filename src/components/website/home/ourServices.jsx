"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSelector } from "react-redux";
import SectionTag from "./sectoinTag";
import { CustomDropdown } from "./customDropdown";
import { ServicesSkeleton } from "../skeletons/home";

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

const Divider = () => (
  <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
);
const ServiceSection = () => {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [issue, setIssue] = useState("");
  const [location, setLocation] = useState("");
 
  // Reset model when brand changes
  const handleBrandChange = (val) => {
    setBrand(val);
    setModel("");
  };
 
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.({ brand, model, issue, location });
  };
 
  /* ── Options ── */
  const brandOptions = [
    { value: "apple",   label: "Apple" },
    { value: "samsung", label: "Samsung" },
    { value: "xiaomi",  label: "Xiaomi" },
    { value: "oppo",    label: "Oppo" },
    { value: "huawei",  label: "Huawei" },
    { value: "nokia",   label: "Nokia" },
    { value: "oneplus", label: "OnePlus" },
    { value: "sony",    label: "Sony" },
  ];
 
  const modelOptions = brand === "apple"
    ? [
        { value: "iphone-15", label: "iPhone 15" },
        { value: "iphone-14", label: "iPhone 14" },
        { value: "iphone-13", label: "iPhone 13" },
        { value: "iphone-12", label: "iPhone 12" },
      ]
    : brand === "samsung"
    ? [
        { value: "s24",      label: "Galaxy S24" },
        { value: "s23",      label: "Galaxy S23" },
        { value: "a54",      label: "Galaxy A54" },
        { value: "a34",      label: "Galaxy A34" },
      ]
    : [
        { value: "model-1", label: "Model 1" },
        { value: "model-2", label: "Model 2" },
      ];
 
  const issueOptions = [
    { value: "screen",   label: "Screen Damage" },
    { value: "battery",  label: "Battery Issue" },
    { value: "camera",   label: "Camera Problem" },
    { value: "charging", label: "Charging Issue" },
    { value: "speaker",  label: "Speaker Problem" },
    { value: "software", label: "Software Issue" },
    { value: "water",    label: "Water Damage" },
    { value: "back",     label: "Back Glass" },
  ];
 
  const cityOptions = [
    { value: "karachi",   label: "Karachi" },
    { value: "lahore",    label: "Lahore" },
    { value: "islamabad", label: "Islamabad" },
    { value: "peshawar",  label: "Peshawar" },
    { value: "quetta",    label: "Quetta" },
    { value: "multan",    label: "Multan" },
    { value: "faisalabad",label: "Faisalabad" },
    { value: "rawalpindi",label: "Rawalpindi" },
  ];
 

  const { services, loading: servicesLoading } = useSelector((state) => state.home || {});
  
  // Active services from Redux (fallback to dummy if empty)
  const activeServices = Array.isArray(services)
    ? services.filter((s) => s.isActive !== false)
    : [];



  const displayServices = activeServices.length > 0 ? activeServices : [];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick Service Finder Card */}
        <div className="bg-[#FF69000D] rounded-2xl shadow-xl  mb-16">
          <div className="  px-8 py-6  mx-auto">
            <div className="flex justify-center items-center">
                    <SectionTag title="Service Finder" />
            </div>
            <div className="flex items-center justify-center gap-3">

              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
                  Quick <span className="text-primary-600">Service </span>Finder
                </h2>
                <p className="text-gray-600 mt-3 text-center mx-auto w-120 ">
Select your device brand, choose the model, and describe the issue to instantly connect with verified professionals near you. Fast, simple, and reliable — all in just a few clicks.                </p>
              </div>
            </div>
          </div>

          {/* Filter Form */}
    <form onSubmit={handleSearch} className="px-4 py-4 md:px-8 md:py-6 -mt-4">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border border-gray-200 bg-white rounded-2xl shadow-md px-3 py-3">
 
        {/* Brand */}
        <CustomDropdown
          icon="mdi:cellphone"
          label="Brand"
          placeholder="Select Brands"
          options={brandOptions}
          value={brand}
          onChange={handleBrandChange}
        />
 
        <Divider />
 
        {/* Model */}
        <CustomDropdown
          icon="fluent:phone-key-20-regular"
          label="Model"
          placeholder="Select Models"
          options={modelOptions}
          value={model}
          onChange={setModel}
        />
 
        <Divider />
 
        {/* Issue */}
        <CustomDropdown
          icon="mdi:tools"
          label="Issue"
          placeholder="Select Issue ?"
          options={issueOptions}
          value={issue}
          onChange={setIssue}
        />
 
        <Divider />
 
        {/* Location */}
        <CustomDropdown
          icon="mdi:map-marker-outline"
          label="Location"
          placeholder="Select Location"
          options={cityOptions}
          value={location}
          onChange={setLocation}
        />
 
        {/* Divider before button */}
        <Divider />
 
        {/* Search Button */}
        <div className="flex-shrink-0 px-1">
          <button
            type="submit"
            className="bg-black hover:bg-gray-800 active:scale-95 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Icon icon="mdi:magnify" className="w-5 h-5" />
            Search Now
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

export default ServiceSection;