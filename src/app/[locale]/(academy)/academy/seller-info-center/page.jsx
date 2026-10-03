'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import LearnSections from '@/components/partials/academy/LearningCards';
import SellerReviews from '@/components/partials/academy/SellerReviews';
import ExploreAndFAQ from '@/components/partials/academy/ExploreandFaqs';

// Card ke peeche ki decoration: har card ka apna alag pattern hai
function CardDecor({ variant }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Common: upar right corner ka soft glow + neeche left ka chhota circle */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-black/10" />

      {variant === 'rings' && (
        <div className="absolute bottom-[-18%] left-1/2 -translate-x-1/2">
          <div className="relative flex h-[360px] w-[360px] items-center justify-center">
            <span className="absolute h-[360px] w-[360px] rounded-full border border-white/15" />
            <span className="absolute h-[270px] w-[270px] rounded-full border border-white/25" />
            <span className="absolute h-[180px] w-[180px] rounded-full border border-white/35" />
            <span className="absolute h-[100px] w-[100px] rounded-full bg-white/10" />
          </div>
        </div>
      )}

      {variant === 'lines' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, transparent 0 16px, rgba(255,255,255,0.35) 16px 17px)',
              WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 75%)',
              maskImage: 'linear-gradient(to top, black 10%, transparent 75%)',
              opacity: 0.45,
            }}
          />
          <div className="absolute bottom-6 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full border-2 border-white/25" />
        </>
      )}

      {variant === 'dots' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.45) 1.5px, transparent 1.5px)',
              backgroundSize: '18px 18px',
              WebkitMaskImage:
                'radial-gradient(circle at 50% 80%, black 15%, transparent 65%)',
              maskImage:
                'radial-gradient(circle at 50% 80%, black 15%, transparent 65%)',
            }}
          />
          <div className="absolute bottom-10 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-white/15 blur-2xl" />
        </>
      )}
    </div>
  );
}

export default function SellerInfo() {
  // Apna real content/images yahan daalein
  const FEATURES = [
    {
      title: 'Fast and easy enrollment',
      text: 'Get enrolled quickly and start learning with a simple, smooth sign-up experience.',
      icon: 'heroicons:rocket-launch',
      image: '/assets/academy/seller/onboarding.svg',
      bg: 'bg-gradient-to-br from-primary-400 to-primary-600',
      decor: 'rings',
    },
    {
      title: 'Hands-on, expert training',
      text: 'Learn the latest mobile, tablet and laptop repair skills from experienced technicians.',
      icon: 'heroicons:wrench-screwdriver',
      image: '/assets/academy/seller/reach-millions.svg',
      bg: 'bg-gradient-to-br from-gray-500 to-gray-700',
      decor: 'lines',
    },
    {
      title: 'Grow your career',
      text: 'Earn certification, unlock new opportunities and scale your repair business with confidence.',
      icon: 'heroicons:chart-bar',
      image: '/assets/academy/seller/grow-business.svg',
      bg: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      decor: 'dots',
    },
  ];

  // Placeholder numbers hain, asli figures se replace karein
  const STATS = [
    { value: '5,000+', label: 'Technicians Trained' },
    { value: '50+', label: 'Courses & Workshops' },
    { value: '100+', label: 'Partner Shops' },
    { value: '95%', label: 'Certification Rate' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Section 1: Hero */}
      <section className="bg-gradient-to-b from-white to-gray-100 px-4 py-12 sm:px-6 md:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-14">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              <span className="text-primary-400">Grow</span> With CTI
            </h1>
            <div className="mt-3 h-1 w-28 rounded-full bg-primary-400" />

            <p className="mt-4 text-xl font-semibold text-gray-700 sm:text-2xl">
              Where your success is our business.
            </p>

            <p className="mt-6 text-base leading-relaxed text-gray-600 sm:text-lg">
              Grow With CTI is an initiative by the Central Telangana Union to
              support and train young individuals and existing technicians in
              the mobile repair industry, helping them start or advance their
              careers as professional mobile repair technicians. This program
              offers comprehensive courses covering the latest technology in
              mobile phones, tablets, and laptops, ensuring participants gain
              hands-on skills, certification, and the confidence to excel in
              the tech industry.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto w-full max-w-lg md:max-w-none"
          >
            <Image
              src="/assets/academy/seller/1.webp"
              alt="Technician repairing a device"
              width={600}
              height={400}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-auto w-full rounded-2xl object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Why Join */}
      <section className="bg-white px-4 py-12 sm:px-6 md:py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Why Grow With CTI?
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`${f.bg} relative flex min-h-[380px] flex-col overflow-hidden rounded-3xl text-white shadow-lg transition-shadow hover:shadow-2xl`}
              >
                <CardDecor variant={f.decor} />

                <div className="relative z-10 px-6 pt-7 text-center">
                  <h3 className="text-xl font-bold sm:text-2xl">{f.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/85">
                    {f.text}
                  </p>
                </div>

                <div className="relative z-10 mt-4 flex flex-1 items-end justify-center">
                  {f.image ? (
                    <Image
                      src={f.image}
                      alt={f.title}
                      width={400}
                      height={300}
                      className="h-full max-h-[240px] w-auto object-contain object-bottom drop-shadow-xl"
                    />
                  ) : (
                    <Icon
                      icon={f.icon}
                      className="mb-10 h-24 w-24 text-white/85"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden bg-primary-50 px-4 py-14 sm:px-6 md:py-20 lg:px-10">
        {/* Background decoration */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-primary-200/70" />
          <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full border border-primary-200/70" />
          <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-primary-100/70" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-light leading-tight text-gray-800 sm:text-4xl lg:text-5xl">
              Across{' '}
              <span className="font-semibold text-primary-500">Telangana</span>
              <br />
              We Move Toward Growth
            </h2>
            <p className="mt-4 text-sm text-gray-500 sm:text-base">
              We provide training and support that make technicians&apos; lives
              easier.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            {STATS.map((s) => (
              <div key={s.label} className="border-l-2 border-primary-400 pl-4">
                <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section>
        <LearnSections />
      </section>

      <section>

        <SellerReviews />
      </section>


      <section>
        <ExploreAndFAQ />
      </section>

    </div>
  );
}