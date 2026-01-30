import React from 'react'

export default function page() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="prose prose-blue max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">E-waste & Recycling Policy</h1>
        <p className="text-gray-700 mb-4">
          We are committed to responsible disposal and recycling of electronic
          waste. This policy explains how we handle end-of-life devices,
          collection options, and our commitments to environmental compliance.
        </p>

        <h2 className="text-xl font-semibold mt-6">Why recycle with us?</h2>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Environmentally responsible recycling processes and certified partners.</li>
          <li>Data sanitization: we follow procedures to securely wipe data before recycling.</li>
          <li>Transparent tracking and documentation for corporate take-back programs.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">How to recycle a device</h2>
        <ol className="list-decimal ml-6 mt-2 space-y-1">
          <li>Back up and remove any personal data, then perform factory reset where possible.</li>
          <li>Remove SIM cards and external memory cards.</li>
          <li>Use our collection service or drop off at an authorized recycling partner.</li>
        </ol>

        <h2 className="text-xl font-semibold mt-6">Data protection during recycling</h2>
        <p className="text-gray-700">We take data privacy seriously. Before any device is recycled, we use industry-standard processes to erase data where feasible. For devices that cannot be sanitized on-site, we securely transport them to certified facilities for secure destruction.</p>

        <h2 className="text-xl font-semibold mt-6">Corporate & Bulk Pickup</h2>
        <p className="text-gray-700">We support corporate e-waste programs and bulk pickups. Contact our business team at <span className="font-semibold">enterprise@cti.com</span> for a pickup quote, manifest and certificates of recycling.</p>
      </div>
    </div>
  )
}
