"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

/**
 * Dynamic Breadcrumb with Home Icon for Next.js
 * Active segment gets text-primary-500
 */
export default function Breadcrumb() {
  const pathname = usePathname(); // e.g. /mobile-repair/samsung/galaxy-s21

  // Split pathname into segments and ignore empty
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm bg-white py-2 ">
      <ol className="flex items-center space-x-1">
        {/* Home icon */}
        <li className="flex items-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 transition flex items-center"
          >
            <Icon icon="mdi:home" className="w-4 h-4 mr-1" />
            Home
          </Link>
        </li>

        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1;
          const label = seg
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          const href = "/" + segments.slice(0, idx + 1).join("/");

          return (
            <li key={href} className="flex items-center">
              {/* Separator */}
              <span className="mx-2 text-gray-400" aria-hidden="true">
                /
              </span>

              {isLast ? (
                <span className="text-primary-500 font-medium">{label}</span>
              ) : (
                <Link
                  href={href}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
