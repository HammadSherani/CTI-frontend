"use client";

import React, { useEffect, useState } from "react";
import paypal from '../../../public/assets/cards/paypal.png'
import googlePay from '../../../public/assets/cards/google-pay.jpg'
import applePay from '../../../public/assets/cards/apple-pay.png'
import klarna from '../../../public/assets/cards/klarna.png'
import masterCard from '../../../public/assets/cards/mastercard.png'
import visa from '../../../public/assets/cards/visa.png'
import leftImage from '../../../public/assets/2.jpg'
import Image from "next/image";

function SelectCountry() {
  const [country, setCountry] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedCountry");
    if (!saved) {
      setShowModal(true);
    } else {
      setCountry(saved);
    }
  }, []);

  const handleSelect = () => {
    if (!country) return;

    try {
      localStorage.setItem("selectedCountry", country);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("❌ Unable to save your selection. Please try again.");
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex overflow-hidden">
        {/* Left Image */}
        <div className="hidden md:block md:w-1/2">
          <Image
            src={leftImage} 
            alt="Country selection"
            className="h-[500px] w-full object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
          <p className="text-gray-600 mb-6">
            Please select your country for shopping
          </p>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-gray-700 focus:ring focus:ring-blue-300"
          >
            <option value="">-- Please select a country --</option>
            <option value="Turkey">Turkey</option>
            {/* Baad me baki countries add kar sakte ho */}
          </select>

          <button
            onClick={handleSelect}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition mb-6"
          >
            SELECT
          </button>

          {/* Payment Icons */}
          <div className="flex items-center gap-3 mt-4">
            <Image src={masterCard} alt="Mastercard" className="h-12"/>
            <Image src={visa} alt="Visa" className="h-12"/>
            <Image src={paypal} alt="PayPal" className="h-12"/>
            <Image src={klarna} alt="Klarna" className="h-12"/>
            <Image src={googlePay} alt="Google Pay" className="h-12"/>
            <Image src={applePay} alt="Apple Pay" className="h-12"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectCountry;
