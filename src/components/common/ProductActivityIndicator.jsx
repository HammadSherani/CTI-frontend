'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketProvider';
import axiosInstance from '@/config/axiosInstance';

/**
 * ProductActivityIndicator:
 * Displays clean, realistic, real-time visitor counts (e.g. "28 people are viewing this right now").
 * 
 * Props:
 * - productId: string / mongo ID
 * - slug: optional string
 * - mode: 'banner' (Product Detail Page) | 'badge' (Product Cards)
 * - className: string
 */
export default function ProductActivityIndicator({
  productId,
  slug,
  mode = 'banner',
  className = '',
}) {
  const { socket } = useSocket() || {};
  const [activeViewers, setActiveViewers] = useState(1);
  const [recentSales, setRecentSales] = useState(0);

  // 1. Fetch live activity and view metrics from backend
  useEffect(() => {
    const targetId = productId || slug;
    if (!targetId) return;

    let isMounted = true;
    axiosInstance
      .get(`/e-commerce/products/${targetId}/activity`)
      .then((res) => {
        if (isMounted && res.data?.success) {
          if (res.data.activeViewers !== undefined) {
            setActiveViewers(res.data.activeViewers);
          }
          if (res.data.recentSales24h !== undefined) {
            setRecentSales(res.data.recentSales24h);
          }
        }
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, [productId, slug]);

  // 2. Real-time updates via Socket.IO
  useEffect(() => {
    const targetId = productId || slug;
    if (!socket || !targetId) return;

    socket.emit('join_product_view', { productId: targetId });

    const handleUpdate = (data) => {
      if (data?.productId && String(data.productId) === String(targetId)) {
        if (data.activeViewers !== undefined) {
          setActiveViewers(data.activeViewers);
        }
        if (data.recentSales24h !== undefined) {
          setRecentSales(data.recentSales24h);
        }
      }
    };

    socket.on('product_activity_updated', handleUpdate);

    return () => {
      socket.emit('leave_product_view', { productId: targetId });
      socket.off('product_activity_updated', handleUpdate);
    };
  }, [socket, productId, slug]);

  // --- Render Mode: BADGE (Compact & minimal for Product Cards) ---
  if (mode === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium leading-none shadow-xs select-none pointer-events-none ${className}`}
        title={`${activeViewers} currently viewing`}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span>{activeViewers} viewing</span>
      </div>
    );
  }

  // --- Render Mode: BANNER (Minimal & realistic for Product Detail Pages) ---
  return (
    <div
      className={`flex items-center gap-2.5 py-2 px-3 rounded-lg bg-gray-50/90 border border-gray-200/80 text-gray-700 text-xs w-fit select-none ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <p className="font-medium text-gray-800 leading-none">
        <strong className="font-semibold text-gray-900">{activeViewers} {activeViewers === 1 ? 'person is' : 'people are'}</strong> viewing this right now
      </p>
      {recentSales > 0 && (
        <>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500 font-normal">
            {recentSales} sold recently
          </span>
        </>
      )}
    </div>
  );
}
