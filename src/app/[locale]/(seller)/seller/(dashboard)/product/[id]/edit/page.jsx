"use client";

// Route: /seller/products/[id]/edit
// File: app/seller/products/[id]/edit/page.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import ProductForm from "@/components/partials/admin/ecom/productForm";
import { Icon } from "@iconify/react";
import { useRouter } from "@/i18n/navigation";

function EditPageSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      <div className="animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-11 h-11 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-32" />
            <div className="h-6 bg-gray-200 rounded w-56" />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
                <div className="h-5 bg-gray-200 rounded w-40" />
                <div className="h-12 bg-gray-100 rounded-2xl" />
                <div className="h-12 bg-gray-100 rounded-2xl" />
                <div className="h-28 bg-gray-100 rounded-2xl" />
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
                <div className="h-5 bg-gray-200 rounded w-24" />
                <div className="h-12 bg-gray-100 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axiosInstance.get(`/seller/product/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched product:", data);
        setProduct(data.data);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load product");
        router.push("/seller/product");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) fetchProduct();
  }, [id, token, router]);

  if (loading) return <EditPageSkeleton />;
  if (!product) return null;

  return <ProductForm mode="edit" initialData={product} />;
}