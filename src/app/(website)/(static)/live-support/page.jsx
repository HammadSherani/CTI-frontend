"use client";

import React from "react";

export default function LiveSupport() {
  const sections = [
    {
      title: "Live Support Channels",
      content: (
        <>
          <p>
            We offer multiple live support channels to help you quickly:
            phone, chat, and email. Chat is ideal for quick questions and
            guidance, while phone support is available for urgent issues that
            require real-time interaction.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Live chat: available via the site and app (9:00–21:00 local time).</li>
            <li>Phone support: +1 (555) 000-0000 (business hours).</li>
            <li>Email support: support@cti.com (for non-urgent queries).</li>
          </ul>
        </>
      ),
    },
    {
      title: "Hours of Operation and SLA",
      content: (
        <>
          <p>
            Our support team works to meet service level commitments. Response
            times vary by channel and priority. For critical issues, we provide
            expedited handling.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Chat: immediate response during live hours (avg under 5 minutes).</li>
            <li>Email: acknowledgement within 24 business hours.</li>
            <li>Phone: callbacks within 2 business hours for urgent cases.</li>
          </ul>
        </>
      ),
    },
    {
      title: "What to Provide for Faster Resolution",
      content: (
        <>
          <p>
            When contacting support please include identifying details and a
            concise description of the issue to help us diagnose and resolve
            the problem faster.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Order ID or service booking reference.</li>
            <li>Device model, IMEI/serial number and software version.</li>
            <li>Clear photos or short videos demonstrating the issue.</li>
            <li>Steps already taken to reproduce or mitigate the problem.</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[60vh]">
      <div className="prose prose-blue max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Live Support</h1>
        <p className="text-gray-600 mb-8 italic">Last Updated: January 2026</p>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm">{index + 1}</span>
                {section.title}
              </h2>
              <div className="text-gray-600 leading-relaxed ml-10">{section.content}</div>
            </section>
          ))}
        </div>

        <div className="mt-12 p-6 bg-primary-50 rounded-lg border border-primary-100 text-center">
          <p className="text-primary-800">For urgent support contact <span className="font-bold">+1 (555) 000-0000</span> or chat with us on the site.</p>
        </div>
      </div>
    </div>
  );
}
