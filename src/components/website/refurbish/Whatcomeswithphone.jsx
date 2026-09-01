"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

const getFeatures = (deviceType) => {
  const isLaptop = deviceType === "laptop";
  return [
    {
      icon: "mdi:shield-check",
      title: "A minimalistic box",
      description: `Every refurbished ${isLaptop ? "laptop" : "phone"} is lovingly repackaged in a brand-new SmartBuy box, showcasing the environmental and quality benefits of these devices.`,
    },
    {
      icon: isLaptop ? "mdi:power-plug" : "mdi:cable",
      title: isLaptop ? "A compatible charger" : "A compatible USB cable",
      description: isLaptop
        ? "All refurbished laptops come with a compatible power adapter/charger to keep your device powered up safely."
        : "All refurbished phones come with charging cables but no power adapter or headphones. If original accessories are available, we skip the cable too. This helps us reduce e-waste.",
    },
    {
      icon: "mdi:badge-check",
      title: "A warranty card",
      description: "We pack in a warranty card that grants you 6/12 months of protection and can be availed at 200+ stores nationwide.",
    },
  ];
};

export default function WhatComesWithPhone({ deviceType = "phone" }) {
  const isLaptop = deviceType === "laptop";
  const isTablet = deviceType === "tablet";
  const features = getFeatures(deviceType);

  const imageUrl = "/assets/refurbish/whatcomes.jpg";

  return (
    <section className="w-full bg-neutral-50 py-10 px-4 md:px-8 rounded-3xl mt-8">
      <h2 className="text-center text-2xl md:text-3xl font-bold text-neutral-900 mb-8">
        What comes with the {isLaptop ? "laptop" : "phone"}?
      </h2>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-center">
        {/* Product image */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-neutral-100 shadow-sm">
            <Image
              src={imageUrl}
              alt={`Refurbished ${isLaptop ? "laptop" : "phone"} box with accessories`}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Feature cards */}
        <div className="flex flex-col gap-3">
          {features.map(({ icon, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center">
                  <Icon icon={icon} className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-1">
                    {title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-8">
        <button className="inline-flex items-center gap-2 bg-neutral-900 text-white font-medium px-4 py-2.5 text-sm rounded-full hover:bg-neutral-800 transition-colors">
          Find nearest store
          <Icon icon="mdi:arrow-right" className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}