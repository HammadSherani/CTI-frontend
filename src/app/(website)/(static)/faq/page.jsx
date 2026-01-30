import React from 'react'

export default function page() {
  const faqs = [
    {
      q: 'How long does a typical repair take?',
      a: 'Most common repairs (screen, battery) are completed within 24–48 hours depending on part availability. We will provide an estimated completion time when you book the service.'
    },
    {
      q: 'Do I need to back up my data before repair?',
      a: 'Yes. Always back up your data. While we follow careful procedures, repairs can result in data loss and we cannot guarantee recovery of personal data.'
    },
    {
      q: 'What warranty do repairs have?',
      a: 'Repair warranties vary by repair type and parts used. Typically repairs come with a limited warranty covering the repaired component for a defined period; see our Warranty section for details.'
    },
    {
      q: 'Can I track my repair status?',
      a: 'Yes. Use the order tracking feature in your account dashboard or contact support with your order ID for an update.'
    },
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="prose prose-blue max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-700 mb-6">Here are answers to common questions about repairs, warranties, and our services.</p>

        <div className="space-y-6">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 rounded-lg border">
              <h3 className="font-semibold text-lg">{f.q}</h3>
              <p className="text-gray-700 mt-2">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Still have questions?</h2>
          <p className="text-gray-700">Contact our support team or check our <a href="/contact-us" className="underline font-semibold">Contact Us</a> page.</p>
        </div>
      </div>
    </div>
  )
}
