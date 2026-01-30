import React from 'react'

export default function page() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="prose prose-blue max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">How to Return a Product</h1>
        <p className="text-gray-700 mb-4">Follow these steps to return a product or request a refund for a purchase made through our platform.</p>

        <h2 className="text-xl font-semibold mt-6">Step-by-step return process</h2>
        <ol className="list-decimal ml-6 mt-2 space-y-1">
          <li>Check return eligibility in your order details (return window and item condition).</li>
          <li>Initiate a return request from your account or contact support with your order ID.</li>
          <li>Follow the provided instructions to drop off or schedule a pickup.</li>
          <li>Pack the item securely, include proof of purchase, and remove personal data if applicable.</li>
          <li>Once we receive and inspect the item, we will process the refund or replacement according to policy.</li>
        </ol>

        <h2 className="text-xl font-semibold mt-6">Packaging and shipping guidelines</h2>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Use original packaging where possible or a sturdy box to protect the item.</li>
          <li>Include a printed copy of the return form or order confirmation.</li>
          <li>Remove any SIM cards, memory cards or personal accessories.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">After we receive your return</h2>
        <p className="text-gray-700">We will inspect the returned item and notify you of the outcome. If approved, refunds are processed in accordance with our Refund Policy.</p>
      </div>
    </div>
  )
}
