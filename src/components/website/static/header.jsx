"use client";

import { motion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import { useMemo } from "react";
import { Icon } from "@iconify/react";

function getMetaFromPath(path = "") {
  const p = path.toLowerCase();

  if (p.includes("warranty-policy-repair")) {
    return {
      title: "Warranty Policy for Repair",
      subtitle: "Comprehensive guarantee covering replaced spare parts and expert technician workmanship.",
      badge: "Customer Protection",
      icon: "solar:shield-check-bold",
    };
  }

  if (p.includes("warranty-policy-refurbished")) {
    return {
      title: "Warranty Policy for Refurbished Devices",
      subtitle: "32-point technical testing, 7-day replacement guarantee, and 6–12 months hardware warranty.",
      badge: "Certified Assurance",
      icon: "solar:medal-star-circle-bold",
    };
  }

  if (p.includes("cookie")) {
    return {
      title: "Cookie Policy",
      subtitle: "How we use essential, functional, and performance cookies to optimize your browsing experience.",
      badge: "Privacy & Data",
      icon: "solar:shield-warning-bold",
    };
  }

  if (p.includes("refer-and-earn")) {
    return {
      title: "Refer & Earn Terms",
      subtitle: "Invite friends to buy, sell, or repair devices on CTI and earn instant wallet rewards.",
      badge: "Community Rewards",
      icon: "solar:gift-bold",
    };
  }

  if (p.includes("indemnity")) {
    return {
      title: "Indemnity Form & Declaration",
      subtitle: "Legal declaration of lawful device ownership and non-encumbrance for buybacks and repairs.",
      badge: "Legal Compliance",
      icon: "solar:document-text-bold",
    };
  }

  if (p.includes("privacy")) {
    return {
      title: "Privacy Policy",
      subtitle: "How we securely handle your personal information, protect user data, and respect your privacy.",
      badge: "Security & Trust",
      icon: "solar:lock-keyhole-minimalistic-bold",
    };
  }

  if (p.includes("terms")) {
    return {
      title: "Terms and Conditions",
      subtitle: "The rules, user obligations, and guidelines governing the use of CTI platform and services.",
      badge: "Legal Terms",
      icon: "solar:document-text-bold",
    };
  }

  if (p.includes("refund")) {
    return {
      title: "Refund Policy",
      subtitle: "Transparent timelines and processes for order cancellations, returns, and payment refunds.",
      badge: "Buyer Protection",
      icon: "solar:wallet-money-bold",
    };
  }

  if (p.includes("return")) {
    return {
      title: "How to Return",
      subtitle: "Step-by-step guidance on packing, scheduling pickup, and returning devices hassle-free.",
      badge: "Return Center",
      icon: "solar:box-minimalistic-bold",
    };
  }

  if (p.includes("e-waste")) {
    return {
      title: "E-Waste & Recycling Policy",
      subtitle: "Our commitment to sustainable electronic waste disposal, safe dismantling, and green recycling.",
      badge: "Sustainability",
      icon: "solar:leaf-bold",
    };
  }

  if (p.includes("live")) {
    return {
      title: "Live Support",
      subtitle: "Get in touch with our customer assistance team for immediate help with your orders or services.",
      badge: "24/7 Help Desk",
      icon: "fluent:person-support-28-regular",
    };
  }

  if (p.includes("faq")) {
    return {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to commonly asked questions about repairs, buybacks, and refurbished orders.",
      badge: "Knowledge Base",
      icon: "solar:question-circle-bold",
    };
  }

  return {
    title: "Policies & Legal Center",
    subtitle: "Official documentation, terms, and customer rights for using CTI services.",
    badge: "Official Terms",
    icon: "solar:document-bold",
  };
}

export default function PageHeader({ title: propTitle, subtitle: propSubtitle }) {
  const pathname = usePathname();

  const auto = useMemo(() => getMetaFromPath(pathname || "/"), [pathname]);

  const title = propTitle ?? auto.title;
  const subtitle = propSubtitle ?? auto.subtitle;

  return (
    <section className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white py-14 sm:py-20 border-b border-gray-800 overflow-hidden">
      {/* Decorative clean ambient glows (No images) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-56 bg-primary-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary-500/10 blur-2xl pointer-events-none" />

      {/* Centered Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Category / Badge Pill */}
        {auto.badge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 border border-white/15 text-xs font-bold uppercase tracking-wider mb-5 shadow-sm backdrop-blur-sm"
          >
            {auto.icon && <Icon icon={auto.icon} className="text-primary-400 text-sm" />}
            <span>{auto.badge}</span>
          </motion.div>
        )}

        {/* Centered Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl"
        >
          {title}
        </motion.h1>

        {/* Centered Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed font-normal"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
