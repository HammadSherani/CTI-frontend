"use client";

import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// 🔹 Color Card Component
const ColorCard = ({ brandSlug, modelId, color, data, onColorSelect }) => {
  const [isValidating, setIsValidating] = useState(false);

  const handleColorClick = async (e) => {
    e.preventDefault();
    setIsValidating(true);
    
    try {
      await onColorSelect(color);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div
      onClick={handleColorClick}
      className={`group bg-white rounded-lg shadow-md transition-all duration-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg ${
        isValidating ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isValidating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}
      
      <div className="relative w-20 h-20 md:w-24 md:h-24 overflow-hidden">
        <Image
          src={data?.model?.icon}
          alt={color?.name || color || "Color"}
          fill
          sizes="(max-width: 768px) 80px, 120px"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/fallback-color.png";
          }}
        />
      </div>
      <h5 className="mt-4 text-base md:text-lg font-medium text-gray-700 capitalize text-center">
        {typeof color === 'object' ? color.name : color}
      </h5>
    </div>
  );
};

const ModelColorsPage = () => {
  const { brandSlug, modelId } = useParams();
  const router = useRouter();
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // 🔹 Fetch colors
  const fetchColors = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get(
        `/public/models/${modelId}/colors`
      );
      setColors(data?.data?.colors || []);
      setData(data?.data);
    } catch (err) {
      setError("Failed to load colors. Please try again later.");
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  const modelIdToSend = data?.model?.id ;
  console.log('modelIdToSend', modelIdToSend);

  // 🔹 Validate color selection
  const validateColorSelection = async (selectedColor) => {
    try {
      setValidationError(null);
      
      const colorValue = typeof selectedColor === 'object' 
        ? selectedColor.name || selectedColor._id 
        : selectedColor;

      // Use actual ObjectId if available, otherwise use the modelId (slug)
      

      const response = await axiosInstance.post('/public/models/color-selection', {
        modelId: modelIdToSend,
        color: colorValue
      });

      if (response.data.success) {
        // Navigate to create job page after successful validation
        const href = `/mobile-repair/${brandSlug}/${modelId}/${encodeURIComponent(colorValue)}/create-job`;
        router.push(href);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setValidationError(
          err.response.data.message || 
          `Selected color is not available for this model`
        );
      } else if (err.response?.status === 404) {
        setValidationError("Model not found");
      } else {
        setValidationError("Failed to validate color selection. Please try again.");
      }
      handleError(err);
    }
  };

  useEffect(() => {
    if (modelId) fetchColors();
  }, [modelId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔹 Title */}
        <h4 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">
          {`Available Colors`}
        </h4>

        {/* 🔹 Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* 🔹 Validation Error */}
        {validationError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p>{validationError}</p>
            <button
              onClick={() => setValidationError(null)}
              className="mt-2 inline-block px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 🔹 Error State */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p>{error}</p>
            <button
              onClick={fetchColors}
              className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* 🔹 No Colors */}
        {!loading && !error && colors.length === 0 && (
          <p className="text-center text-gray-600">
            No colors available for this model.
          </p>
        )}

        {/* 🔹 Colors Grid */}
        {!loading && !error && colors.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {colors.map((color, index) => (
              <ColorCard
                key={typeof color === 'object' ? color._id || index : index}
                brandSlug={brandSlug}
                modelId={modelId}
                color={color}
                data={data}
                onColorSelect={validateColorSelection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelColorsPage;