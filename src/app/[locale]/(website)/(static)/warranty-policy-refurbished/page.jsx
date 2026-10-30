import React from 'react';
import { Icon } from '@iconify/react';

export const metadata = {
  title: 'Warranty Policy for Refurbished Devices | CTI',
  description: 'Understand the comprehensive warranty coverage, 32-point inspection, and claims process for CTI refurbished smartphones, laptops, and gadgets.',
};

export default function WarrantyRefurbishedPolicyPage() {
  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-150">
      <div className="max-w-none space-y-8 text-gray-700">
        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200/60 mb-3">
            <Icon icon="solar:shield-check-bold" className="text-sm" />
            <span>CTI Certified Refurbished Assurance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Warranty Policy for Refurbished Devices
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Every CTI certified refurbished product undergoes rigorous 32+ point technical grading.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Icon icon="solar:medal-star-circle-linear" className="text-emerald-600 text-2xl" />
            1. Comprehensive Warranty Duration
          </h2>
          <p className="leading-relaxed text-sm sm:text-base">
            All refurbished smartphones, smartwatches, tablets, and laptops sold through CTI platform include our standard <strong>6 to 12 Months Limited Warranty</strong> (as specified on the product invoice and listing badge).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-emerald-600 block uppercase">7-Day Replacement Guarantee</span>
              <p className="font-extrabold text-gray-900 text-base mt-1">Hassle-Free Return / Swap</p>
              <p className="text-xs text-gray-500 mt-1">If the device arrives with any functional defect, you can request an instant replacement or full refund within 7 days of delivery.</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-emerald-600 block uppercase">6 - 12 Months Hardware Repair</span>
              <p className="font-extrabold text-gray-900 text-base mt-1">Free Diagnostic & Fix</p>
              <p className="text-xs text-gray-500 mt-1">Full internal hardware coverage including motherboard, audio, wireless modules, and internal connectors.</p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">2. What Is Covered</h2>
          <ul className="list-disc ml-6 space-y-1.5 text-sm sm:text-base">
            <li>Motherboard failures, power IC issues, and unexpected device shutdowns.</li>
            <li>Cellular network, Wi-Fi, and Bluetooth hardware module failures.</li>
            <li>Camera sensor defects and non-responsive biometric fingerprint/Face ID sensors.</li>
            <li>Speaker, microphone, earpiece, and charging jack malfunctions.</li>
            <li>Battery health falling below 70% within the initial 90 days of purchase.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">3. Non-Warranty Conditions</h2>
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 space-y-2">
            <p className="font-semibold">The refurbished warranty will not apply to:</p>
            <ul className="list-disc ml-5 space-y-1 text-amber-800">
              <li>Cosmetic wear and tear (micro-scratches or minor paint scuffs consistent with the refurbished grading grade).</li>
              <li>Damage resulting from accidental falls, blunt physical pressure, or deep cracked glass.</li>
              <li>Water/moisture damage or corrosion inside the chassis.</li>
              <li>Any repair attempts or seal tampering carried out outside authorized CTI service centers.</li>
              <li>Loss of device IMEI sticker or tampering with internal warranty labels.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">4. Processing Time & Turnaround</h2>
          <p className="leading-relaxed text-sm sm:text-base">
            Once your device is picked up for a warranty claim, our certified technicians inspect and repair it within <strong>3 to 5 business days</strong>. If a critical component cannot be repaired, CTI will offer an identical replacement unit or store credit.
          </p>
        </section>
      </div>
    </div>
  );
}

