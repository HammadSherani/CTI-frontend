import React from 'react';
import { Icon } from '@iconify/react';

export const metadata = {
  title: 'Warranty Policy for Repair | CTI',
  description: 'Learn about the CTI Warranty Policy for mobile, laptop, and electronic device repair services.',
};

export default function WarrantyRepairPolicyPage() {
  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-150">
      <div className="max-w-none space-y-8 text-gray-700">
        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider border border-primary-200/60 mb-3">
            <Icon icon="solar:shield-check-bold" className="text-sm" />
            <span>Customer Protection Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Warranty Policy for Repair
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Last updated: October 2026 • Effective for all doorstep, walk-in & mail-in repairs.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Icon icon="solar:verified-check-linear" className="text-primary-600 text-2xl" />
            1. Scope of Repair Warranty
          </h2>
          <p className="leading-relaxed text-sm sm:text-base">
            At <strong>CTI</strong>, we stand firmly behind the quality of our workmanship and certified replacement parts. All repairs performed by verified CTI technicians or authorized partner service hubs come with a dedicated warranty starting from the date of device delivery.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-primary-600 block uppercase">Screen Replacements</span>
              <p className="font-extrabold text-gray-900 text-lg mt-1">Up to 6 Months</p>
              <span className="text-xs text-gray-500">Touch responsiveness & display defects</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-primary-600 block uppercase">Battery Replacements</span>
              <p className="font-extrabold text-gray-900 text-lg mt-1">Up to 3 Months</p>
              <span className="text-xs text-gray-500">Swelling, non-charging or fast drain</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-primary-600 block uppercase">Other Components</span>
              <p className="font-extrabold text-gray-900 text-lg mt-1">Up to 3 Months</p>
              <span className="text-xs text-gray-500">Charging port, speakers, mics & buttons</span>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">2. What Is Covered</h2>
          <ul className="list-disc ml-6 space-y-1.5 text-sm sm:text-base">
            <li>Any manufacturing or structural defect in the replaced spare part.</li>
            <li>Workmanship and installation defects directly related to the completed repair.</li>
            <li>Screen touch unresponsiveness, dead pixels not caused by external shock, or spontaneous display blackout.</li>
            <li>Free re-inspection and replacement at zero labor charge if confirmed under warranty.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">3. What Is NOT Covered (Exclusions)</h2>
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 text-sm text-red-900 space-y-2">
            <p className="font-semibold">The repair warranty will be immediately voided under the following conditions:</p>
            <ul className="list-disc ml-5 space-y-1 text-red-800">
              <li>Physical, accidental, or impact damage (e.g. cracked glass, dented frame, dropped device).</li>
              <li>Liquid intrusion, moisture exposure, or corrosion occurring after the repair.</li>
              <li>Unauthorized tampering or third-party disassembly post CTI repair service.</li>
              <li>Software modifications, jailbreaking, rooting, or OS corruption.</li>
              <li>Damage caused by third-party unapproved chargers or abnormal electrical power surges.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">4. How to Claim Your Repair Warranty</h2>
          <ol className="list-decimal ml-6 space-y-2 text-sm sm:text-base">
            <li>
              <strong>Locate your Repair ID:</strong> Find your repair invoice sent via SMS/Email or in your CTI profile under <em>My Orders</em>.
            </li>
            <li>
              <strong>Submit a claim:</strong> Contact our support desk via Live Chat or email us at <span className="font-semibold text-primary-600">support@cti.com</span> with a brief video/photo showing the issue.
            </li>
            <li>
              <strong>Inspection & Free Resolution:</strong> Our verified technician will visit your location or inspect the device at our hub. If eligible, the part will be serviced or replaced completely free of charge.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}

