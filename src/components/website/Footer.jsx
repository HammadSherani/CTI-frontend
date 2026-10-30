"use client";
import React from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";

function Footer() {
  const footerData = {
    services: [
      { label: "Mobile Repair", url: "/mobile-repair" },
      { label: "Sell Old Phone", url: "/sell-old-phone" },
      { label: "Buy Refurbished", url: "/buy-refurbish-gadgets" },
      { label: "Insurance Services", url: "/insurance" },
      { label: "Academy", url: "/academy" },
    ],
    company: [
      { label: "About Us", url: "/about-us" },
      { label: "Blog", url: "/blog" },
      { label: "Partner With Us", url: "/partner-with-us" },
      { label: "Contact Us", url: "/contact" },
      { label: "Our Repairmans", url: "/repairmans" },
    ],
    account: [
      { label: "My Account", url: "/my-account" },
      { label: "My Orders", url: "/orders" },
      { label: "Wishlist", url: "/wishlist" },
      { label: "Cart", url: "/cart" },
      { label: "My Sell Requests", url: "/my-sell-requests" },
      { label: "Messages", url: "/messages" },
    ],
    support: [
      { label: "FAQ", url: "/faq" },
      { label: "Contact Us", url: "/contact" },
      { label: "Privacy Policy", url: "/privacy-policy" },
      { label: "Terms & Conditions", url: "/terms-and-conditions" },
      { label: "Repair Warranty Policy", url: "/warranty-policy-repair" },
      { label: "Refurbished Warranty", url: "/warranty-policy-refurbished" },
      { label: "Refund Policy", url: "/refund-policy" },
      { label: "Cookie Policy", url: "/cookie-policy" },
      { label: "Refer & Earn Terms", url: "/refer-and-earn-terms" },
      { label: "E-Waste Policy", url: "/e-waste-policy" },
      { label: "Indemnity Form", url: "/indemnity-form" },
      { label: "How to Return", url: "/how-to-return" },
    ],
    social: [
      { icon: "mdi:facebook", url: "https://facebook.com" },
      { icon: "mdi:twitter", url: "https://twitter.com" },
      { icon: "mdi:instagram", url: "https://instagram.com" },
      { icon: "mdi:linkedin", url: "https://linkedin.com" },
      { icon: "mdi:youtube", url: "https://youtube.com" },
    ],
  };

  const router = useRouter();
  return (
    <footer className="bg-black text-gray-300 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">

          {/* Left - Logo & Description */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/assets/logo/logo-dark.png"
                alt="CTI Logo"
                width={140}
                height={45}
                className="object-contain"
              />
            </div>

            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              We provide fast, reliable, and trusted device repair, resale, and
              refurbished solutions for all your gadgets.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-8">
              {footerData.social.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-300 hover:text-white hover:bg-primary-600 hover:border-primary-600 transition-all duration-300"
                >
                  <Icon icon={item.icon} className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 - Services */}
          <div className="lg:col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-base uppercase tracking-wider mb-5">
              Services
            </h3>
            <ul className="space-y-3">
              {footerData.services.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.url}
                    className="text-sm text-gray-400 hover:text-primary-500 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 - Company */}
          <div className="lg:col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-base uppercase tracking-wider mb-5">
              Company
            </h3>
            <ul className="space-y-3">
              {footerData.company.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.url}
                    className="text-sm text-gray-400 hover:text-primary-500 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 3 - Account */}
          <div className="lg:col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-base uppercase tracking-wider mb-5">
              Account
            </h3>
            <ul className="space-y-3">
              {footerData.account.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.url}
                    className="text-sm text-gray-400 hover:text-primary-500 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 4 - Support & Legal */}
          <div className="lg:col-span-3 md:col-span-1">
            <h3 className="text-white font-bold text-base uppercase tracking-wider mb-5">
              Policies & Support
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
              {footerData.support.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.url}
                    className="text-xs text-gray-400 hover:text-primary-500 transition-colors duration-200 truncate block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} CTI (Complete Telecom Infrastructure). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-gray-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-gray-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/e-waste-policy" className="hover:text-gray-400 transition-colors">
              E-Waste
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
