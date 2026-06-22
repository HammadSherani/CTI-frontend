"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import ProductForm from "@/components/partials/admin/ecom/productForm";

export default function AdminEditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    axiosInstance
      .get(`/admin/e-commerce/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setProduct(data.data))
      .catch(() => {
        toast.error("Failed to load product");
        router.push("/admin/ecom/products");
      })
      .finally(() => setLoading(false));
  }, [id, token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB]">
        <Icon icon="mdi:loading" className="animate-spin w-8 h-8 text-primary-500" />
      </div>
    );
  }

  if (!product) return null;

  return <ProductForm mode="edit" adminMode initialData={product} />;
}
