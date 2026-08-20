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
  const features = getFeatures(deviceType);

  const imageUrl = isLaptop
    ? "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80"
    : "https://images.unsplash.com/photo-1592286927505-1def25115caf?auto=format&fit=crop&w=800&q=80";

  return (
    <section className="w-full bg-neutral-50 py-16 px-6 md:px-12 rounded-3xl mt-12">
      <h2 className="text-center text-3xl md:text-4xl font-bold text-neutral-900 mb-12">
        What comes with the {isLaptop ? "laptop" : "phone"}?
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Product image */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-neutral-100 shadow-sm">
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
        <div className="flex flex-col gap-5">
          {features.map(({ icon, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                  <Icon icon={icon} className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-12">
        <button className="inline-flex items-center gap-2 bg-neutral-900 text-white font-medium px-6 py-3 rounded-full hover:bg-neutral-800 transition-colors">
          Find nearest store
          <Icon icon="mdi:arrow-right" className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}