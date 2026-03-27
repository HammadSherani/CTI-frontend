"use client";

import Loader from "@/components/Loader";
import Breadcrumb from "@/components/ui/Breadcrumb";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

// 🔹 Model Card (Same Style as Brand Card)
const ModelCard = ({ brandSlug, model, goToCreateJob = false, index }) => {
  const MotionLink = motion(Link);
  const href = goToCreateJob
    ? `/mobile-repair/${brandSlug}/${model?.slug}`
    : `/mobile-repair/${brandSlug}/${model?.slug}`;

  return (
    <MotionLink
      href={href}
      className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-sm 
      border border-gray-100 p-5 flex flex-col 
      items-center cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Model Logo */}
      <div className="relative w-24 h-24 md:w-28 md:h-28">
        <Image
          src={model?.icon || "/fallback-model.png"}
          alt={model?.name || "Model"}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "/fallback-model.png";
          }}
        />
      </div>

      {/* Model Name */}
      <h5 className="mt-4 text-lg font-semibold text-gray-700 capitalize text-center 
      group-hover:text-orange-600 transition">
        {model?.name}
      </h5>
    </MotionLink>
  );
};

const ModelPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { brandSlug } = useParams();

  // 🔹 Fetch Models of Specific Brand
  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get(
        `/public/models/brand/${brandSlug}`
      );
      setModels(data?.data?.models || []);
    } catch (err) {
      setError("Failed to load models. Please try again later.");
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brandSlug) fetchModels();
  }, [brandSlug]);

  return (
    <Loader loading={loading}>
      <div className="bg-white">

        <div className='px-12 py-3'>

          <Breadcrumb />
        </div>
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 pb-14 pt-4 px-4 sm:px-6 lg:px-12">
          <div className="">

            {/* Title */}
            <h4 className="text-3xl md:text-4xl font-extrabold text-gray-800  mb-8">
              {brandSlug ? `Models of ${brandSlug}` : "Available Models"}
            </h4>

            {/* Error UI */}
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 p-4 rounded-md mb-6 text-center shadow-sm">
                <p>{error}</p>
                <button
                  onClick={fetchModels}
                  className="mt-3 px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && models.length === 0 && (
              <p className="text-center text-gray-500 text-lg tracking-wide">
                No models available for this brand.
              </p>
            )}

            {/* Models Grid */}
            {!loading && !error && models.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-7">
                {models.map((model, index) => (
                  <ModelCard
                    key={model.id}
                    brandSlug={brandSlug}
                    model={model}
                    goToCreateJob
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Loader>
  );
};

export default ModelPage;