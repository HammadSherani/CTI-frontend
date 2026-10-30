"use client";
import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@iconify/react";

function SideLinkPage() {
  const pathname = usePathname();

  const links = [
    { label: "Privacy Policy", href: "/privacy-policy", icon: "solar:lock-keyhole-minimalistic-linear" },
    { label: "Terms & Conditions", href: "/terms-and-conditions", icon: "solar:document-text-linear" },
    { label: "Warranty Policy (Repair)", href: "/warranty-policy-repair", icon: "solar:shield-check-linear" },
    { label: "Warranty Policy (Refurbished)", href: "/warranty-policy-refurbished", icon: "solar:medal-star-circle-linear" },
    { label: "Refund Policy", href: "/refund-policy", icon: "solar:wallet-money-linear" },
    { label: "Cookie Policy", href: "/cookie-policy", icon: "solar:shield-warning-linear" },
    { label: "Refer & Earn Terms", href: "/refer-and-earn-terms", icon: "solar:gift-linear" },
    { label: "E-Waste & Recycling", href: "/e-waste-policy", icon: "solar:leaf-linear" },
    { label: "Indemnity Form", href: "/indemnity-form", icon: "solar:document-add-linear" },
    { label: "How to Return", href: "/how-to-return", icon: "solar:box-minimalistic-linear" },
    { label: "Live Support", href: "/live-support", icon: "fluent:person-support-28-regular" },
  ];

  return (
    <div className="w-full sticky h-fit top-4 bg-white shadow-xs border border-gray-200 rounded-2xl p-5 transition-all duration-300">
      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
        <Icon icon="solar:document-text-bold" className="text-primary-600 text-xl" />
        Legal & Policies
      </h2>

      <ul className="space-y-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                <Icon
                  icon={link.icon}
                  className={`text-base shrink-0 transition-transform duration-200 ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                <span className="truncate">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SideLinkPage;
