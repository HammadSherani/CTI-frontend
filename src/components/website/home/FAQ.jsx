'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import SectionTag from './sectoinTag';

/* ── FAQ Data ── */
const faqCategories = [
  {
    id: 'sell-smart',
    label: 'Sell Smart',
    faqs: [
      {
        q: 'How long does a typical website project take?',
        a: 'Standard WordPress or Shopify projects usually take 4–6 weeks, while custom applications can range from 8–12 weeks depending on complexity.',
      },
      {
        q: 'Do you provide post-launch support?',
        a: 'Yes, we offer comprehensive post-launch support packages to ensure your platform runs smoothly after going live.',
      },
      {
        q: 'How do we start a project?',
        a: 'Simply reach out to our team via the contact form or join as a repair partner. We will schedule a discovery call to understand your needs.',
      },
    ],
  },
  {
    id: 'smart-buy',
    label: 'Smart Buy',
    faqs: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major credit cards, bank transfers, and digital wallets including PayPal and Stripe.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Yes, we have a 30-day refund policy for most products. Please check the specific product page for details.',
      },
      {
        q: 'How is shipping handled?',
        a: 'We partner with trusted logistics providers to ensure fast and secure delivery to your location.',
      },
    ],
  },
  {
    id: 'repair-others',
    label: 'Repair / Others',
    faqs: [
      {
        q: 'How do I book a repair service?',
        a: 'You can book a repair service directly through our platform by selecting your device, issue, and preferred technician.',
      },
      {
        q: 'Is there a warranty on repairs?',
        a: 'All repairs come with a minimum 30-day warranty. Premium repairs include up to 90-day coverage.',
      },
      {
        q: 'What devices do you repair?',
        a: 'We repair smartphones, tablets, laptops, desktops, and gaming consoles from all major brands.',
      },
    ],
  },
];

/* ── Single Accordion Item ── */
function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen ? 'border-orange-200 bg-orange-50/40' : 'border-gray-200 bg-white'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className={`text-[14px] font-semibold leading-snug ${isOpen ? 'text-gray-900' : 'text-gray-800'}`}>
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
            isOpen ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <Icon
            icon={isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}
            className="w-5 h-5"
          />
        </span>
      </button>

      {/* Answer */}
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="px-5 pb-4 text-[13px] text-gray-500 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

/* ── Main FAQ Component ── */
export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('sell-smart');
  const [openIndex, setOpenIndex] = useState(0);

  const currentFaqs = faqCategories.find((c) => c.id === activeCategory)?.faqs || [];

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setOpenIndex(0);
  };

  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-10 py-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start justify-center">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-6">
<SectionTag title="Frequently Asked Questions" />
         
          {/* Heading */}
          <h2 className="text-[36px] md:text-[42px] font-extrabold leading-tight tracking-tight -mt-6">
            <span className="text-gray-900">Frequently Asked</span>
            <br />
            <span className="text-primary-600">
              Questions
            </span>
          </h2>

          {/* Orange CTA Card */}
          <div
            className="relative rounded-2xl overflow-hidden p-7 mt-2"
            style={{
              background: 'linear-gradient(135deg, #FF6900 0%, #FF8C00 60%, #e65c00 100%)',
            }}
          >
            {/* decorative circles */}
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />

            <div className="relative z-10 flex flex-col gap-3">
              <h3 className="text-white text-[20px] font-extrabold leading-snug">
                Still Have a Questions ?
              </h3>
              <p className="text-orange-100 text-[13px] leading-relaxed max-w-[300px]">
                Standard WordPress or Shopify projects usually take 4–6 weeks, while custom applications can range from 8–12 weeks depending on complexity.
              </p>
              <button className="mt-2 w-fit bg-white text-orange-600 text-[13px] font-bold px-5 py-2.5 rounded-xl hover:bg-orange-50 active:scale-95 transition-all duration-200 shadow-sm">
                Join as Repair Partner
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-5 mt-12">

          {/* Category Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-orange-50 text-orange-400 hover:bg-orange-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="flex flex-col gap-3">
            {currentFaqs.map((faq, i) => (
              <AccordionItem
                key={`${activeCategory}-${i}`}
                question={faq.q}
                answer={faq.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}