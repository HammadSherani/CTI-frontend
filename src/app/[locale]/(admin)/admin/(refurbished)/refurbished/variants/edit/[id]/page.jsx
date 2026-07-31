"use client";

import React, { useEffect, useState } from "react";
import VariantForm from "../../VariantForm";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import { useRouter } from '@/i18n/navigation';

export default function EditProductPage({ params }) {
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Note: in Next.js 13+ params is a promise in some cases or object, but here we can just read id.
  const id = params?.id;

  useEffect(() => {
    if (!token || !id) return;

    axiosInstance
      .get(`/admin/refurbish/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setProduct(res.data.data);
      })
      .catch((err) => {
        toast.error("Failed to fetch product details");
        router.push("/admin/refurbished/products");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return <VariantForm mode="edit" initialData={product} />;
}
