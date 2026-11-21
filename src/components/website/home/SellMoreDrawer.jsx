"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Icon } from "@iconify/react";

// Right-side drawer listing every category that can be sold.
export default function SellMoreDrawer({ open, onClose, categories = [], onSelect, onViewAll }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100000]" role="dialog" aria-modal="true" aria-label="Sell Your Old Device Now">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute right-0 top-0 h-full w-full sm:w-[560px] max-w-full bg-white shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between px-6 py-5 shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Sell Your Old Device Now</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-6 h-6 text-gray-900" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                {categories.map((item) => (
                  <button
                    key={item._id || item.slug}
                    type="button"
                    onClick={() => onSelect(item)}
                    className="group flex flex-col items-center text-center cursor-pointer"
                  >
                    <div className="w-full aspect-[3/2] rounded-2xl bg-[#FF69000D] group-hover:bg-[#FF69001A] transition-colors flex items-center justify-center p-3">
                      {item.image ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="160px"
                            className="object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <Icon icon="mdi:shape-outline" className="w-10 h-10 text-primary-600" />
                      )}
                    </div>
                    <span className="mt-2 text-xs font-semibold text-gray-800 leading-tight">{item.name}</span>
                  </button>
                ))}
              </div>

              {categories.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-10">No categories available right now.</p>
              )}

              <button
                type="button"
                onClick={onViewAll}
                className="mt-8 w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                View all on the sell page
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
