'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';

// Apne real courses/routes yahan daalein
const CONTENTS = [
    {
        title: 'Seller Basics',
        text: 'Learn how to set up your seller account, verify your identity, and understand the basic requirements to start selling.',
        href: '/docs/seller/seller',
        img: '/assets/academy/seller/explore/1.png',
    },
    {
        title: 'Products',
        text: 'A complete guide on adding new products, editing existing ones, managing inventory, and optimizing listings.',
        href: '/docs/seller/products',
        img: '/assets/academy/seller/explore/2.png',

    },
    {
        title: 'Orders & Selling',
        text: 'Learn how to manage incoming orders, fulfill shipments properly, and handle returns or cancellations smoothly.',
        href: '/docs/seller/orders',
        img: '/assets/academy/seller/explore/3.png',

    },
    {
        title: 'Earnings & Payments',
        text: 'Understand how seller payouts work, track your revenue, check your fees, and manage your wallet balance.',
        href: '/docs/seller/earnings',
        img: '/assets/academy/seller/explore/4.png',

    },
    {
        title: 'More Seller Tools',
        text: 'Explore advanced tools for store analytics, running promotions, and using features to boost your overall sales.',
        href: '/docs/seller/other-tools',
        img: '/assets/academy/seller/explore/5.png',

    },
    {
        title: 'Help & Reference',
        text: 'Find answers to frequently asked questions, read our selling policies, and contact support for further assistance.',
        href: '/docs/seller/help',
        img: '/assets/academy/seller/explore/6.png',

    },
];

const FAQS = [
    {
        q: 'How do I start selling on CTI?',
        a: 'To start selling, you need to create a seller account, complete your profile verification, and agree to the selling policies. Once approved, you can start listing products.',
    },
    {
        q: 'What kind of products can I sell?',
        a: 'Sellers can list mobile phones, tablets, laptops, accessories, and replacement parts. All products must comply with our quality and authenticity guidelines.',
    },
    {
        q: 'When and how do I get paid?',
        a: 'Payments are processed and transferred to your registered bank account or wallet after the order is successfully delivered and the return period has expired.',
    },
    {
        q: 'How do I manage my inventory?',
        a: 'You can manage your products, update prices, and adjust inventory levels directly from your Seller Dashboard under the Products tab.',
    },
    {
        q: 'What happens if a customer returns an item?',
        a: 'If a return request is approved, the buyer will ship the item back. Once you receive and verify it, the refund is processed according to our return policy.',
    },
];

function ContentCard({ item, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: (index % 4) * 0.07 }}
        >
            <Link
                href={item.href}
                className="group block h-full rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary-200"
            >
                <div
                    className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg sm:h-36 bg-gray-100"
                >
                    <img
                        src={item.img}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/5 transition-opacity group-hover:opacity-0" />
                </div>

                <div className="px-1.5 pb-1.5 pt-3">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                        <Icon
                            icon="heroicons:chevron-right"
                            className="h-4 w-4 shrink-0 text-gray-700 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary-500"
                        />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                        {item.text}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}

function FAQItem({ item, open, onToggle, id }) {
    return (
        <div
            className={`overflow-hidden rounded-lg border bg-white transition-colors ${open ? 'border-primary-300 shadow-sm' : 'border-gray-300 hover:border-primary-300'
                }`}
        >
            <h3>
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${id}`}
                    id={`faq-btn-${id}`}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                    {item.q}
                    <Icon
                        icon="heroicons:chevron-down"
                        className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180 text-primary-500' : ''
                            }`}
                    />
                </button>
            </h3>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        id={`faq-panel-${id}`}
                        role="region"
                        aria-labelledby={`faq-btn-${id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <p className="px-4 pb-4 text-sm leading-relaxed text-gray-600">{item.a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ExploreAndFAQ() {
    const [openIndex, setOpenIndex] = useState(0); // pehla khula rahega, null karein to sab band

    return (
        <div className="bg-white text-gray-800">
            {/* Explore contents */}
            <section className="px-4 py-12 sm:px-6 md:py-16 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Explore contents</h2>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {CONTENTS.map((item, i) => (
                            <ContentCard key={item.title} item={item} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="border-t border-gray-100 px-4 py-12 sm:px-6 md:py-16 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">FAQ</h2>

                    <div className="mt-6 space-y-3">
                        {FAQS.map((item, i) => (
                            <FAQItem
                                key={item.q}
                                id={i}
                                item={item}
                                open={openIndex === i}
                                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}