'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Link } from '@/i18n/navigation';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Apna route yahan badlein
const WEBINARS_HREF = '/academy/webinars';

// visual: 'chatbot' ho to code se bana AI chatbot design dikhega, warna image/icon
const LEARN_CARDS = [
    {
        title: 'CTI Academy',
        subtitle: 'Choose the right learning path for your needs.',
        tags: ['Video', 'Live Classes', 'Practicals', 'Notes'],
        icon: 'heroicons:academic-cap',
        image: '/assets/academy/seller/5.png',
    },
    {
        title: 'Technician Help Center',
        subtitle: 'Find answers fast with guides, articles and AI-powered assistance.',
        tags: ['Articles', 'AI Assistant'],
        icon: 'heroicons:chat-bubble-left-right',
        visual: 'chatbot',
    },
];


// Floating question bubble
function Bubble({ children, className = '', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={`absolute ${className}`}
        >
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
                className="rounded-2xl bg-white px-3 py-2 text-[11px] font-medium leading-snug text-gray-600 shadow-md ring-1 ring-primary-100 sm:text-xs"
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

// Code se bana AI chatbot design (image ki zaroorat nahi)
function ChatbotMock() {
    return (
        <div className="relative h-[270px] w-full max-w-md overflow-hidden rounded-2xl bg-primary-100/70 ring-1 ring-primary-200/60">
            {/* Background decoration */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-200/50" />
                <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full border border-primary-300/50" />
                <div
                    className="absolute inset-0 opacity-60"
                    style={{
                        backgroundImage:
                            'radial-gradient(rgba(255,255,255,0.9) 1.2px, transparent 1.2px)',
                        backgroundSize: '16px 16px',
                        WebkitMaskImage:
                            'radial-gradient(circle at 50% 55%, black 10%, transparent 70%)',
                        maskImage:
                            'radial-gradient(circle at 50% 55%, black 10%, transparent 70%)',
                    }}
                />
            </div>

            {/* Questions */}
            <Bubble className="left-4 top-4 max-w-[150px]" delay={0}>
                Which course is best for beginners?
            </Bubble>
            <Bubble className="right-4 top-12 max-w-[150px]" delay={0.15}>
                How can I get certified?
            </Bubble>
            <Bubble className="bottom-5 right-4 max-w-[170px]" delay={0.3}>
                How do I start laptop repair?
            </Bubble>

            {/* AI label */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute left-5 top-[46%] flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg sm:text-xs"
            >
                <Icon icon="heroicons:sparkles-solid" className="h-3.5 w-3.5 text-primary-300" />
                AI Assistant
            </motion.div>

            {/* Center AI orb */}
            <div className="absolute left-[56%] top-[52%] -translate-x-1/2 -translate-y-1/2">
                <motion.span
                    aria-hidden
                    animate={{ scale: [1, 1.5], opacity: [0.35, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-2xl bg-primary-400"
                />
                <motion.span
                    aria-hidden
                    animate={{ scale: [1, 1.5], opacity: [0.35, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 1.1 }}
                    className="absolute inset-0 rounded-2xl bg-primary-400"
                />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-xl ring-4 ring-white/70">
                    <Icon icon="heroicons:sparkles-solid" className="h-8 w-8 text-white" />
                </div>
            </div>

            {/* Typing indicator */}
            <div className="absolute bottom-5 left-5 flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-md ring-1 ring-primary-100">
                {[0, 1, 2].map((n) => (
                    <motion.span
                        key={n}
                        animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: n * 0.15 }}
                        className="h-1.5 w-1.5 rounded-full bg-primary-500"
                    />
                ))}
            </div>
        </div>
    );
}

export default function LearnSections() {
    return (
        <div className="bg-white text-gray-800">
            {/* How to learn better */}
            <section className="px-4 py-12 sm:px-6 md:py-16 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-2xl font-light text-gray-800 sm:text-3xl">
                        How to learn better on{' '}
                        <span className="font-bold text-gray-900">CTI?</span>
                    </h2>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        {LEARN_CARDS.map((c, i) => (
                            <motion.div
                                key={c.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-gray-50 to-primary-50 p-6 sm:p-8"
                            >
                                {/* Decoration */}
                                <div aria-hidden className="pointer-events-none absolute inset-0">
                                    <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary-100/60" />
                                    <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full border border-primary-200/70" />
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold text-gray-900">{c.title}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{c.subtitle}</p>

                                    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-gray-800">
                                        {c.tags.map((t, idx) => (
                                            <span key={t} className="flex items-center gap-3">
                                                {idx > 0 && (
                                                    <Icon
                                                        icon="heroicons:sparkles-solid"
                                                        className="h-4 w-4 text-primary-500"
                                                    />
                                                )}
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative z-10 mt-6 flex flex-1 items-center justify-center">
                                    {c.visual === 'chatbot' ? (
                                        <ChatbotMock />
                                    ) : c.image ? (
                                        <Image
                                            src={c.image}
                                            alt={c.title}
                                            width={520}
                                            height={320}
                                            className="mt-2 h-full max-h-[320px] w-full object-contain p-2 drop-shadow-xl"
                                        />
                                    ) : (
                                        <div className="flex h-44 w-44 items-center justify-center rounded-3xl bg-white shadow-xl ring-1 ring-primary-100">
                                            <Icon icon={c.icon} className="h-20 w-20 text-primary-500" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Watch, ask, learn */}
            <section className="px-4 py-12 sm:px-6 md:py-16 lg:px-10">
                <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-14">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Watch, ask, <span className="text-primary-500">learn!</span>
                        </h2>
                        <p className="mt-4 max-w-md text-base leading-relaxed text-gray-500">
                            Attend weekly webinars in your local language, explore key topics,
                            and get clear answers to your questions from the CTI team.
                        </p>
                        <Link
                            href={WEBINARS_HREF}
                            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary-500 px-5 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-500 hover:text-white"
                        >
                            More About Webinars
                            <Icon icon="heroicons:arrow-right" className="h-4 w-4" />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6 }}
                        className="relative mx-auto w-full max-w-lg"
                    >

                        <div className='relative mx-auto w-full max-w-lg'>
                            <Image src={'/assets/academy/seller/webinar-en.svg'} alt='' width={520} height={320} className='h-full max-h-[320px] w-full object-contain p-2 drop-shadow-xl' />
                        </div>

                    </motion.div>
                </div>
            </section>

        </div>
    );
}