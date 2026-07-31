"use client";

import React from "react";
import ProductForm from "@/components/partials/admin/ecom/productForm";

export default function CreateProductPage() {
  return <ProductForm mode="create" initialData={null} adminMode={true} type="refurbished" />;
}
