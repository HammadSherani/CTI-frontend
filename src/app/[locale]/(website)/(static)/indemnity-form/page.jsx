import React from 'react';
import { Icon } from '@iconify/react';

export const metadata = {
  title: 'Indemnity Form & Legal Declaration | CTI',
  description: 'Device ownership indemnity and legal declaration required for device buybacks, trade-ins, and board-level repairs at CTI.',
};

export default function IndemnityFormPage() {
  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-150">
      <div className="max-w-none space-y-8 text-gray-700">
        <div className="border-b border-gray-100 pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200/60 mb-3">
            <Icon icon="solar:document-text-bold" className="text-sm" />
            <span>Legal Ownership Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Indemnity Form & Declaration
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Device seller / repair customer confirmation of lawful ownership and non-encumbrance.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">1. Declaration of Lawful Ownership</h2>
          <p className="leading-relaxed text-sm sm:text-base">
            By submitting any electronic device for resale (Sell Old Device / Trade-in) or repair services to <strong>CTI</strong>, the customer explicitly declares and certifies under penalty of law that:
          </p>
          <ul className="list-disc ml-6 space-y-1.5 text-sm sm:text-base">
            <li>The customer is the sole, undisputed, and lawful owner of the device, or is legally authorized by the registered owner to sell or repair it.</li>
            <li>The device has not been acquired through theft, fraud, embezzlement, or any unlawful means.</li>
            <li>The device is free from any active police reports, blacklisting, liens, financial encumbrances, or EMI defaults.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">2. Customer Indemnification Obligation</h2>
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm sm:text-base leading-relaxed">
            The customer agrees to indemnify, defend, and hold harmless <strong>CTI</strong>, its parent company, directors, employees, technicians, and partners against any claims, damages, liabilities, costs, or legal proceedings arising from disputed ownership, claims by financial institutions, or fraudulent declarations.
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">3. Identity Verification & Government ID Compliance</h2>
          <p className="leading-relaxed text-sm sm:text-base">
            For device buyback transactions, CTI requires a valid government-issued photo identification (National ID card, Driver's License, or Passport) along with the recorded device IMEI/Serial number to comply with anti-fraud laws and regulatory standards.
          </p>
        </section>
      </div>
    </div>
  );
}

