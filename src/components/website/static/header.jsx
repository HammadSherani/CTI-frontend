"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

function getMetaFromPath(path = "") {
  const p = path.toLowerCase();

  if (p.includes("privacy")) {
    return {
      title: "Privacy Policy",
      subtitle: "How we handle your information and respect your privacy.",
      image: "/assets/contact/1.avif",
    };
  }

  if (p.includes("terms")) {
    return {
      title: "Terms and Conditions",
      subtitle: "The rules and regulations for using our platform.",
      image: "/assets/contact/1.avif",
    };
  }

  if (p.includes("refund")) {
    return {
      title: "Refund Policy",
      subtitle: "Everything you need to know about our refund process.",
      image: "/assets/contact/1.avif",
    };
  }

   if (p.includes("return")) {
    return {
      title: "How to Return",
      subtitle: "Everything you need to know about our return process.",
      image: "/assets/contact/1.avif",
    };
  }

  if (p.includes("e-waste")) {
    return {
      title: "E-waste Policy",
      subtitle: "Our commitment to responsible electronic waste disposal and recycling.",
      image: "/assets/contact/1.avif",
    };
  }

  if (p.includes("live")) {
    return {
      title: "Live Support",
      subtitle: "live chat support for immediate assistance.",
      image: "/assets/about/1.avif",
    };
  }

  return {
    title: "Page",
    subtitle: "Welcome to this page.",
    image: "/assets/contact/1.avif",
  };
}

export default function PageHeader({ title: propTitle, subtitle: propSubtitle, image: propImage }) {
  const pathname = usePathname();

  const auto = useMemo(() => getMetaFromPath(pathname || "/"), [pathname]);

  const title = propTitle ?? auto.title;
  const subtitle = propSubtitle ?? auto.subtitle;
  const image = propImage ?? auto.image;

  return (
    <section className="relative  !h-[60vh] bg-gradient-to-br from-primary-600 via-primary-200 to-primary-700 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 md:w-80 md:h-80 bg-white rounded-full blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className={`grid gap-6 lg:gap-10 items-center  h-full  ${
            image ? "lg:grid-cols-2" : "grid-cols-1 text-center"
          }`}>
            
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col justify-center ${!image ? "items-center" : ""}`}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl text-nowrap xl:text-6xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
                {title}
              </h1>

              {subtitle && (
                <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </motion.div>

            {/* Image */}
            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:flex justify-start items-start"
              >
                <div className="relative w-full max-w-md xl:max-w-lg">
                  <Image 
                    src={image} 
                    alt={title} 
                    width={520} 
                    height={360} 
                    className="w-full h-auto object-contain drop-shadow-2xl p-12"
                    priority
                  />
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}