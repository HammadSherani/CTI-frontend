'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: 'lucide:help-circle' },
  { id: 'pricing', label: 'Valuation & Pricing', icon: 'lucide:tag' },
  { id: 'payment', label: 'Payment & Transfer', icon: 'lucide:wallet' },
  { id: 'pickup', label: 'Pickup & Inspection', icon: 'lucide:truck' },
  { id: 'security', label: 'Data Safety & Privacy', icon: 'lucide:shield-check' },
];

const FAQ_DATA = [
  {
    id: 1,
    categoryId: 'pricing',
    categoryName: 'Valuation & Pricing',
    question: 'How is the selling price of my device calculated?',
    answer:
      'Our intelligent valuation system calculates your quote based on real-time market demand and the specific condition you report. Key factors include device age, screen condition (touch, lines, cracks), functional health (cameras, battery, speakers, biometric sensors), and the presence of original accessories like bill, box, and charger. This guarantees a transparent, competitive, and top-tier cash offer.',
  },
  {
    id: 2,
    categoryId: 'payment',
    categoryName: 'Payment & Transfer',
    question: 'When and how do I receive my payment?',
    answer:
      'You receive your money instantly on the spot. Once our doorstep pickup technician inspects and verifies your device, the payment is initiated directly to your preferred payment method — Instant Bank Transfer (IMPS/NEFT), UPI, or digital wallet. You verify the credit in your account before handing over the device.',
  },
  {
    id: 3,
    categoryId: 'pickup',
    categoryName: 'Pickup & Inspection',
    question: 'Is there any fee or hidden charge for doorstep pickup?',
    answer:
      'No. Doorstep pickup is 100% free with zero hidden charges, convenience fees, or cancellation costs. Even if you decide not to proceed after the technician evaluates the device, you owe nothing.',
  },
  {
    id: 4,
    categoryId: 'security',
    categoryName: 'Data Safety & Privacy',
    question: 'How do you ensure my personal data is safe and wiped?',
    answer:
      'Your privacy is our highest priority. Every device collected undergoes a certified, factory-grade data sanitization process in accordance with international privacy standards. All photos, chats, saved passwords, and cloud accounts are permanently destroyed so they can never be restored.',
  },
  {
    id: 5,
    categoryId: 'security',
    categoryName: 'Data Safety & Privacy',
    question: 'What documents do I need to provide when selling my device?',
    answer:
      'You only need a valid government-issued photo ID (such as Aadhaar Card, Driving License, or Passport) for ownership verification. While the original bill, retail box, and charger are not mandatory, having them can boost your final payout value.',
  },
  {
    id: 6,
    categoryId: 'pricing',
    categoryName: 'Valuation & Pricing',
    question: 'Can I sell a broken, damaged, or non-working device?',
    answer:
      'Yes, absolutely! We accept devices with cracked glass, damaged displays, dead batteries, or body scuffs. Just report the condition accurately during your valuation assessment so we can provide a fair residual value based on salvageable internal components.',
  },
  {
    id: 7,
    categoryId: 'pickup',
    categoryName: 'Pickup & Inspection',
    question: 'What if the technician finds a discrepancy during physical inspection?',
    answer:
      'If the technician identifies an issue not mentioned in the online questionnaire (e.g., hidden screen discoloration or faulty mic), they will politely explain the issue and provide a revised quote. You have zero obligation to sell — you can decline the revised quote with zero fee.',
  },
  {
    id: 8,
    categoryId: 'pickup',
    categoryName: 'Pickup & Inspection',
    question: 'Can I reschedule or change my pickup slot?',
    answer:
      'Yes, you can easily reschedule your appointment date, time slot, or pickup address at any time before the technician visits. Simply update it from your user dashboard under "My Sell Requests" or reach out to our customer support team.',
  },
];

export default function SellDeviceFaqSection({ deviceType = 'Device' }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIds, setOpenIds] = useState([1]); // First open by default

  const toggleAccordion = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs =
    activeCategory === 'all'
      ? FAQ_DATA
      : FAQ_DATA.filter((faq) => faq.categoryId === activeCategory);

  return (
    <section className="space-y-10 pt-4">
      {/* ── Section Header ── */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider border border-primary-200/60 shadow-xs">
          <Icon icon="lucide:help-circle" className="text-sm text-primary-600" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Got Questions About Selling Your{' '}
          <span className="text-primary-600 capitalize">{deviceType}</span>?
        </h2>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
          Everything you need to know about valuations, doorstep pickup, instant payment, and data security.
        </p>
      </div>

      {/* ── Category Filters ── */}
      <div className="flex items-center justify-center gap-2 flex-wrap max-w-3xl mx-auto">
        {FAQ_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 scale-[1.02]'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon icon={cat.icon} className={`text-base ${isActive ? 'text-white' : 'text-primary-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── FAQ Accordion Grid ── */}
      <div className="max-w-4xl mx-auto space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openIds.includes(faq.id);

          return (
            <div
              key={faq.id}
              className={`border rounded-2xl bg-white overflow-hidden transition-all duration-300 ${
                isOpen
                  ? 'border-primary-300 shadow-md shadow-primary-500/5 ring-1 ring-primary-100'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-xs'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(faq.id)}
                className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer transition-colors duration-200"
                aria-expanded={isOpen}
              >
                <div className="space-y-1 pr-2 flex-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                    {faq.categoryName}
                  </span>
                  <h3
                    className={`text-base sm:text-lg font-bold leading-snug transition-colors ${
                      isOpen ? 'text-primary-700' : 'text-gray-900'
                    }`}
                  >
                    {faq.question}
                  </h3>
                </div>

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isOpen
                      ? 'bg-primary-600 text-white rotate-180 shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Icon icon="lucide:chevron-down" className="text-xl" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-gray-100/80 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-gray-600 leading-relaxed pt-4 font-normal">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Still Have Questions Help Banner ── */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-800">
        <div className="relative z-10 space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Icon icon="lucide:sparkles" className="text-sm" />
            <span>Need More Help?</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-black text-white">
            Have a specific question about your device?
          </h4>
          <p className="text-gray-300 text-xs sm:text-sm max-w-lg leading-relaxed">
            Our trade-in specialists are available 7 days a week to help you get the best valuation for your smartphone, tablet, or laptop.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-primary-600/30 transition-all duration-200"
          >
            <Icon icon="lucide:message-square" className="text-base" />
            <span>Contact Support</span>
          </Link>
          <a
            href="tel:+918000000000"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/20 transition-all duration-200"
          >
            <Icon icon="lucide:phone-call" className="text-base text-amber-400" />
            <span>Call Us</span>
          </a>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>
    </section>
  );
}

