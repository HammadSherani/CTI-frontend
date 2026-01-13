'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';



const popularBrands = [
  ['Watsons', 'Stradivarius', 'Puma', 'Apple', 'Birkenstock', 'Nivea'],
  ['Samsung', 'New Balance', 'Arçelik', 'Skechers', 'Mavi'],
  ['Bershka', 'Dyson', 'Koton', 'IKEA', 'Karaca'],
  ['MacBook', 'iPhone 16', 'iPhone 15 Pro Max', 'Apple Watch'],
  ['Nike Air Max', 'Dyson Airwrap', 'Coffee World'],
  ['Rolex', 'Lacoste', 'Apple AirPods', 'Network'],
];

const footerLinks = {
  about: [
    { text: 'Who We Are', href: '#' },
    { text: 'Careers', href: '#' },
    { text: 'Sustainability', href: '#' },
    { text: 'Contact', href: '#' },
    { text: 'Security at CTI', href: '#' },
    { text: 'Product Recall', href: '#' },
  ],
  campaigns: [
    { text: 'Campaigns', href: '#' },
    { text: 'Shopping Credit', href: '#' },
    { text: 'Elite Membership', href: '#' },
    { text: 'Gift Ideas', href: '#' },
  ],
  seller: [
    { text: 'Sell on CTI', href: '#' },
    { text: 'Basic Concepts', href: '#' },
    { text: 'CTI Academy', href: '/academy' },
  ],
  help: [
    { text: 'Frequently Asked Questions', href: '#' },
    { text: 'Live Support / Assistant', href: '#' },
    { text: 'How to Return', href: '#' },
    { text: 'Transaction Guide', href: '#' },
  ],
};

const subFooterLinks = [
  { text: 'Cookie Preferences', href: '#' },
  { text: 'Privacy Policy', href: '#' },
  { text: 'DSM Group', href: '#' }, // Company page if available
  { text: 'Terms of Use', href: '#' },
];

/* =======================
   SCROLL TO TOP
======================= */

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () =>
      setIsVisible(window.pageYOffset > 300);

    window.addEventListener('scroll', toggleVisibility);
    return () =>
      window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      onClick={() =>
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      className={`${
        isVisible ? 'opacity-100' : 'opacity-0'
      } fixed bottom-8 right-8 z-50 bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-opacity`}
    >
      <Icon icon="mdi:chevron-up" className="w-6 h-6" />
    </button>
  );
};

/* =======================
   BRANDS
======================= */

export const Brands = () => (
  <div className="max-w-7xl mx-auto py-8">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">
      Popular Brands & Stores
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-gray-600">
      {popularBrands.map((col, i) => (
        <div key={i} className="space-y-2">
          {col.map((brand, j) => {
            const searchQuery = encodeURIComponent(brand);
            return (
              <Link
                key={j}
                href={`/sr?q=${searchQuery}`}
                className="block hover:underline"
              >
                {brand}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  </div>
);

/* =======================
   FOOTER
======================= */

export function BottomFooter() {
  return (
    <>
      <footer className="bg-white border-t border-gray-200">
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-10">

            {/* Top Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

              {/* Logo */}
              <div className="space-y-4">
                <Image src="/assets/logo/logo.png" alt="Logo" width={128} height={32} />
                <ul className="space-y-2 text-sm text-gray-600">
                  {footerLinks.about.map(({ text, href }) => (
                    <li key={text}>
                      <Link href={href} className="hover:underline">
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Campaigns */}
              <FooterColumn title="Campaigns" links={footerLinks.campaigns} />

              {/* Seller */}
              <FooterColumn title="Seller" links={footerLinks.seller} />

              <FooterColumn title="Help" links={footerLinks.help} />

              {/* Social */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">
                  Change Country
                </h3>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>Select Country</option>
                </select>

                <h3 className="font-semibold text-gray-800 pt-4">
                  Social Media
                </h3>
                <div className="flex gap-4 text-gray-600">
                  <SocialIcon icon="mdi:facebook" href="#" />
                  <SocialIcon icon="mdi:instagram" href="#" />
                  <SocialIcon icon="mdi:youtube" href="#" />
                  <SocialIcon icon="pajamas:x" href="#" />
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10 mt-10 border-t">

              <FooterImage
                title="Security Certificates"
                images={['footer1.png', 'footer2.png', 'footer3.png', 'footer4.png']}
              />

              <FooterImage
                title="Secure Shopping"
                images={['footer.png']}
                large
              />

              <AppLinks />
            </div>
          </div>
        </div>

        {/* Sub Footer */}
        <div className="bg-gray-800 text-gray-400 text-sm">
          <div className="max-w-7xl mx-auto py-3 flex flex-col md:flex-row justify-between items-center">
            <p>
              ©2025 DSM Group Consulting Communication and Sales Trade Inc.
              All Rights Reserved.
            </p>
            <div className="flex gap-4 mt-2 md:mt-0">
              {subFooterLinks.map(({ text, href }) => (
                <Link key={text} href={href} className="hover:text-white">
                  {text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <ScrollToTopButton />
    </>
  );
}

const FooterColumn = ({ title, links }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <ul className="space-y-2 text-sm text-gray-600">
      {links.map(({ text, href }) => (
        <li key={text}>
          <Link href={href} className="hover:underline">
            {text}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon = ({ icon, href }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer">
    <Icon icon={icon} className="w-6 h-6" />
  </Link>
);

const FooterImage = ({ title, images, large }) => (
  <div className="space-y-3">
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <div className="flex gap-2">
      {images.map(img => (
        <Image
          key={img}
          src={`/assets/logo/${img}`}
          alt={title}
          width={large ? 160 : 32}
          height={large ? 100 : 30}
        />
      ))}
    </div>
  </div>
);

export function ContentSection() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Tüm İhtiyaçlarınız İçin Tek İhtiyacınız!
        </h2>
        <div className="space-y-4 text-gray-600">
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </p>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </p>
        </div>
      </div>
    </div>
  );
};

const AppLinks = () => (
  <div className="space-y-3">
    <h3 className="font-semibold text-gray-800">
      Mobile Applications
    </h3>
    <div className="flex flex-wrap gap-3">
      <StoreButton 
        img="foot3.png" 
        title="App Store" 
        subtitle="Download on the" 
        href="#"
      />
      <StoreButton 
        img="foot2.png" 
        title="Google Play" 
        subtitle="Get it on" 
        href="#"
      />
      <StoreButton 
        img="foot1.png" 
        title="AppGallery" 
        subtitle="Discover on" 
        href="#"
      />
    </div>
  </div>
);

const StoreButton = ({ img, title, subtitle, href }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-900 text-white p-2 rounded-lg">
    <Image src={`/assets/logo/${img}`} alt={title} width={24} height={24} />
    <div>
      <p className="text-xs">{subtitle}</p>
      <p className="text-sm font-semibold">{title}</p>
    </div>
  </Link>
);

export default function Footer() {
  return <BottomFooter />;
}