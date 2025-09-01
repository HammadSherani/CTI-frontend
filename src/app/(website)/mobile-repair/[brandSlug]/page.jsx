"use client";

import Loader from "@/components/Loader";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

// 🔹 Model Card Component
const ModelCard = ({ brandSlug, model, goToCreateJob = false }) => {
  const href = goToCreateJob
    ? `/mobile-repair/${brandSlug}/${model?.slug}/`
    : `/mobile-repair/${brandSlug}/${model?.slug}/create-job`;

  return (
    <Link
      href={href}
      className="group bg-white rounded-lg shadow-md transition-all duration-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg"
    >
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <Image
          src={model?.icon || "/fallback-model.png"}
          alt={model?.name || "Model"}
          fill
          sizes="(max-width: 768px) 100px, 150px"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/fallback-model.png";
          }}
        />
      </div>
      <h5 className="mt-4 text-lg md:text-xl font-semibold text-gray-700 capitalize text-center">
        {model?.name}
      </h5>
    </Link>
  );
};

const ModelPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Correct param name
  const { brandSlug } = useParams();

  // 🔹 Fetch models
  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get(`/public/models/brand/${brandSlug}`);
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
    <Loader loading={loading} >
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔹 Title */}
        <h4 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">
          {brandSlug ? `Models of ${brandSlug}` : "Available Models"}
        </h4>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p>{error}</p>
            <button
              onClick={fetchModels}
              className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && models.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {models.map((model) => (
              <React.Fragment key={model.id}>
                <ModelCard brandSlug={brandSlug} model={model} />
                <ModelCard brandSlug={brandSlug} model={model} goToCreateJob />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
    </Loader>
  );
};

export default ModelPage;
