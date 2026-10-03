'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

const FAQS = [
  {
    question: "What is CTI Academy?",
    answer: "CTI Academy is a comprehensive learning and informational hub designed to empower our users. It provides expert guides, video tutorials, and industry best practices for mobile repairmen, sellers, and tech enthusiasts."
  },
  {
    question: "Who can benefit from CTI Academy?",
    answer: "Everyone! Whether you're a beginner looking to learn basic device troubleshooting, a professional repairman seeking advanced certification, or a seller wanting to understand market trends and device valuation, the Academy has resources for you."
  },
  {
    question: "Are the training courses and guides free?",
    answer: "Yes, the majority of our foundational guides and tutorials are completely free for registered CTI users. We also offer premium, instructor-led certification courses for professionals looking to upgrade their skills."
  },
  {
    question: "Do I get a certificate after completing a course?",
    answer: "Absolutely! Upon successfully completing our verified training modules and passing the final assessment, you will receive an official CTI Academy Certificate, which will also be displayed as a badge on your repairman or seller profile."
  },
  {
    question: "How do I enroll in a training program?",
    answer: "Simply browse our 'Academy Listing' page, select the course or training module that fits your needs, and click 'Enroll'. You can track your progress directly from your dashboard."
  }
];

export default function AcademyPoliciesAndFAQ() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="py-12 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {/* Right Column: FAQs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                >
                  <span className="font-semibold text-sm text-gray-800">{faq.question}</span>
                  <Icon
                    icon="heroicons:chevron-down"
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-sm text-gray-600 border-t border-gray-50 mt-1">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Left Column: Policies & Guidelines */}
        <div className="text-sm text-gray-600 ">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Academy Policies, Terms, and Guidelines
          </h2>
          <p className="leading-relaxed mb-6">
            Welcome to the CTI Academy informational hub. Here you will find all the rules, regulations, and best practices expected from repairmen, sellers, and customers within our tech ecosystem. Our priority is to maintain a safe, transparent, and high-quality environment for everyone. We believe that by setting clear expectations, we can foster a community built on trust, reliability, and mutual respect. Please read through these guidelines carefully to ensure you are fully aligned with our standards.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-3">
            Repairman Standards & Verification
          </h3>
          <p className="leading-relaxed mb-3">
            All repairmen operating on CTI must undergo a strict verification process. This includes thorough background checks, validation of technical certifications, and a review of past work experience. By participating in our ecosystem, repairmen agree to abide by the following stringent criteria to ensure maximum customer satisfaction:
          </p>
          <ul className="list-disc list-outside space-y-1.5 pl-5 mb-6">
            <li>Use only high-quality, genuine, or certified OEM-equivalent parts for all repairs and replacements.</li>
            <li>Provide completely transparent pricing upfront, with absolutely no hidden fees or unexpected charges after the fact.</li>
            <li>Ensure strict customer data privacy during the repair process, strictly prohibiting any unauthorized access to personal files or data.</li>
            <li>Offer a minimum 30-day warranty on all hardware replacements and repair services provided through the platform.</li>
            <li>Maintain a professional demeanor and communicate clearly with the customer regarding the status and timeline of the repair.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-3">
            Seller Quality Checks & Refurbishment
          </h3>
          <p className="leading-relaxed mb-3">
            Sellers listing refurbished or used devices must adhere strictly to CTI's comprehensive 32-point quality diagnostic check. Any device sold on our platform is expected to match its listed condition (Fair, Good, Superb) precisely. Sellers are required to:
          </p>
          <ul className="list-disc list-outside space-y-1.5 pl-5 mb-6">
            <li>Accurately declare the battery health percentage and physically detail any screen scratches or body dents.</li>
            <li>Ensure the device is factory reset, iCloud/Google locked removed, and completely wiped of all previous user data using secure deletion methods.</li>
            <li>Provide a clear, hassle-free return policy (minimum 15-day replacement) for items that arrive defective or not as described.</li>
            <li>Ship devices securely using appropriate packaging materials to prevent any damage during transit.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-3">
            Customer Responsibilities & Protection
          </h3>
          <p className="leading-relaxed mb-4">
            As a customer, your rights are fully protected by CTI’s robust support system and Escrow payment mechanisms. However, we also expect customers to engage responsibly when buying, selling, or booking repairs. Before selling your device, always ensure you have backed up your data and permanently logged out of your iCloud/Google accounts. When booking a repair, provide accurate, detailed descriptions and photos regarding the damage so our technicians can quote you correctly and bring the right parts. Misrepresentation of device conditions can lead to order cancellations and account penalties.
          </p>
        </div>


      </div>
    </section>
  );
}
