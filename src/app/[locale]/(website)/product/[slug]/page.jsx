'use client';

import EcomProductDetail from "@/components/website/product/EcomProductDetail";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  return <EcomProductDetail params={params} />;
}