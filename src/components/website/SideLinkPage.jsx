"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

function SideLinkPage() {
  const pathname = usePathname();

  const links = [
    { label: "Privacy Policy", href: "/privacy-policy", icon: "solar:lock-keyhole-minimalistic-linear" },
    { label: "Terms & Conditions", href: "/terms-and-conditions", icon: "solar:document-text-linear" },
    { label: "Refund Policy", href: "/refund-policy", icon: "solar:wallet-money-linear" },
    { label: "How to Return", href: "/how-to-return", icon: "solar:chat-line-linear" },
    { label: "E waste policy", href: "/e-waste-policy", icon: "solar:chat-line-linear" },
    { label: "Live Support", href: "/live-support", icon: "fluent:person-support-28-regular" },

  ];

  return (
    <div className="w-full sticky h-fit top-4 bg-white shadow-xs border border-gray-200 rounded-md p-6 transition-all duration-300 ">
      <h2 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-2 flex items-center gap-2">
        <Icon icon="solar:link-circle-linear" className="text-primary-600 text-xl" />
        Quick Links
      </h2>

      <ul className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                <Icon
                  icon={link.icon}
                  className={`text-lg transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SideLinkPage;
