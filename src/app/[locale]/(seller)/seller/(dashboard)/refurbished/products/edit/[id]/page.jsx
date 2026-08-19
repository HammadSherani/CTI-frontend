"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import axiosInstance from "@/config/axiosInstance";
import ProductForm from "@/components/partials/admin/ecom/productForm";
import { toast } from "react-toastify";

export default function EditProductPage() {
  const { id } = useParams();
  const { token } = useSelector((s) => s.auth);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    axiosInstance
      .get(`/seller/refurbished-products/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setInitialData(res.data.data))
      .catch(() => toast.error("Failed to load product details"))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!initialData) return null;

  return <ProductForm mode="edit" initialData={initialData} adminMode={false} type="refurbished" />;
}
