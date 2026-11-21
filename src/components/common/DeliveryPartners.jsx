'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';

// Courier companies offered through our Geliver shipping integration.
// "logo" is a file in /public/carriers/ (null = name-only badge). To add or
// replace a logo, drop a square-ish PNG/SVG there and set its path here.
const CARRIERS = [
  { code: 'ARAS', name: 'Aras Kargo', logo: '/carriers/aras.png' },
  { code: 'YURTICI', name: 'Yurtiçi Kargo', logo: null },
  { code: 'PTT', name: 'PTT Kargo', logo: '/carriers/ptt.png' },
  { code: 'SURAT', name: 'Sürat Kargo', logo: null },
  { code: 'HEPSIJET', name: 'HepsiJet', logo: '/carriers/hepsijet.png' },
  { code: 'KOLAYGELSIN', name: 'Kolay Gelsin', logo: null },
];

function CarrierBadge({ carrier }) {
  const [failed, setFailed] = useState(false);
  const showLogo = carrier.logo && !failed;

  return (
    <div
      title={carrier.name}
      className="h-10 px-3 rounded-lg border border-gray-200 bg-white flex items-center justify-center gap-2"
    >
      {showLogo && (
        <img
          src={carrier.logo}
          alt={carrier.name}
          className="h-6 w-6 object-contain rounded"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">{carrier.name}</span>
    </div>
  );
}

export default function DeliveryPartners() {
  return (
    <div className="pt-3 border-t border-gray-100">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon icon="mdi:truck-delivery-outline" className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Delivery Partners</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {CARRIERS.map((c) => (
          <CarrierBadge key={c.code} carrier={c} />
        ))}
      </div>
    </div>
  );
}
