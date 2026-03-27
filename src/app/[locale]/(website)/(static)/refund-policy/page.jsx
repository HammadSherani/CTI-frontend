"use client";

import React from "react";

function RefundPolicy() {
  const sections = [
    {
      title: "Refund Eligibility",
      content: (
        <>
          <p>
            Refunds are processed when a service or product fails to meet the
            description, when a repair cannot be completed due to our error,
            or when a transaction is cancelled within the permitted cancellation
            window. Eligibility is determined after inspection and verification.
          </p>
          <p className="mt-2">
            Examples that may qualify: device returned in the same condition as
            provided for repair but issue persists due to a manufacturing defect
            or a service not provided as described in the order.
          </p>
        </>
      ),
    },
    {
      title: "Cancellation & Modifications",
      content: (
        <>
          <p>
            You may cancel or request a modification to a booked service within
            the timeframe specified at checkout. Cancellation rules depend on
            the service type and the stage of the fulfillment process.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Free cancellation window: up to 2 hours before technician visit.</li>
            <li>Late cancellation: partial refund minus processing fees may apply.</li>
            <li>Modifications may be accepted subject to technician availability.</li>
          </ul>
        </>
      ),
    },
    {
      title: "Non-Refundable Services and Exceptions",
      content: (
        <>
          <p>
            Certain charges are non-refundable. This includes diagnostic fees
            when you decline a repair after inspection, custom-ordered parts,
            and services explicitly marked as non-refundable at purchase.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Diagnostic or inspection fees when repair is declined.</li>
            <li>Consumables and parts damaged by user misuse after repair.</li>
            <li>Fees for services performed correctly and as described.</li>
          </ul>
        </>
      ),
    },
    {
      title: "How to Request a Refund",
      content: (
        <>
          <p>
            To request a refund, contact our support team at refunds@cti.com
            with the subject line "Refund Request" and include the following:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Order ID and date of purchase or service.</li>
            <li>Clear description of the issue and the reason for refund.</li>
            <li>Photos or evidence where applicable.</li>
            <li>Preferred resolution (refund, replacement, or repair).</li>
          </ul>
        </>
      ),
    },
    {
      title: "Processing Time and Refund Method",
      content: (
        <>
          <p>
            Approved refunds are processed to the original payment method. The
            time to reflect in your account may vary by payment provider and
            bank.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Processing time: typically 7–10 business days after approval.</li>
            <li>Refunds to wallets or third-party gateways may follow their own timelines.</li>
            <li>Where original payment is not available, we will offer an alternative method.</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[60vh]">
      <div className="prose prose-blue max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
          Refund Policy
        </h1>
        
        <p className="text-gray-600 mb-8 italic">
          Last Updated: January 2026
        </p>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm">
                  {index + 1}
                </span>
                {section.title}
              </h2>
              <div className="text-gray-600 leading-relaxed ml-10">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 p-6 bg-primary-50 rounded-lg border border-primary-100 text-center">
            <p className="text-primary-800">
                Need more help? Our support team is available at <span className="font-bold">support@cti.com</span>
            </p>
        </div>
      </div>
    </div>
  );
}

export default RefundPolicy;
