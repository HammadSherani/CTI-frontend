
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

const FAQS = [
  {
    id: 'f1',
    question: 'How long does a typical website project take?',
    answer: 'Standard WordPress or Shopify projects usually take 4-6 weeks, while custom applications can range from 8-12 weeks depending on complexity.',
    category: 'Services'
  },
  {
    id: 'f2',
    question: 'What are your pricing models?',
    answer: 'We offer fixed-price project packages as well as hourly rates for ongoing maintenance and custom development.',
    category: 'Pricing'
  },
  {
    id: 'f3',
    question: 'Do you provide post-launch support?',
    answer: 'Yes, we offer various support and maintenance plans to ensure your website remains secure and up-to-date.',
    category: 'Support'
  },
  {
    id: 'f4',
    question: 'Can you help with SEO and content?',
    answer: 'Absolutely. We provide SEO optimization during development and offer content strategy services as an add-on.',
    category: 'Services'
  },
  {
    id: 'f5',
    question: 'How do we start a project?',
    answer: 'We begin with a free consultation call to understand your needs, followed by a detailed proposal and timeline.',
    category: 'Process'
  }
];
export default function FAQ() {
  const [openId, setOpenId] = useState(FAQS[0].id);

  return (
    <section id="faq" className="py-10">
      <div className="container mx-auto px-10  max-w-4xl ">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-6 text-gray-900 leading-tight">
          Frequenqlty Asked Questions
        </h2>
        <div className="space-y-4  mt-4">
          {FAQS.map((faq) => (
            <div key={faq.id} className="p-4 rounded-lg bg-white border-gray-700 pb-4">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between py-2 text-left hover:text-amber-400 transition-colors"
              >
                <span className="text-lg md:text-xl font-semibold pr-8">{faq.question}</span>
                <div className={`flex-shrink-0 transition-transform duration-300 ${openId === faq.id ? 'rotate-180 text-amber-400' : ''}`}>
                  {openId === faq.id ? <Icon icon="mdi:minus" size={24} /> : <Icon icon="mdi:plus" size={24} />}
                </div>
              </button>
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8 text-gray-400 leading-relaxed text-lg">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};