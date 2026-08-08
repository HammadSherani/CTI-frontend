'use client';

import RefurbishedProductDetail from "@/components/website/refurbish/RefurbishedProductDetail";
import { useParams } from "next/navigation";

export default function RefurbishedDetailPage() {
  const params = useParams();
  return <RefurbishedProductDetail params={params} />;
}
