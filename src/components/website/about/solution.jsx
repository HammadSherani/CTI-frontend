'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import Image from 'next/image';
import { Icon } from '@iconify/react';

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: i * 0.12 },
  }),
};

// Number 0 se upar tak ginta hai jab section screen par aata hai
function CountUp({ to, suffix = '', duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

// Apna content yahan badlein
const STATS = [
  { to: 10, suffix: 'K+', label: 'Phones Reused' },
  { to: 9, suffix: 'M+', label: 'Liters Water Saved' },
  { to: 720, suffix: 'K+', label: 'kWh Energy Saved' },
];

const WASTE_POINTS = ['Less toxic waste', 'Saved resources', 'A cleaner future'];

const SolutionSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-gray-900 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute -right-24 top-16 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-10 top-28 h-52 w-52 rounded-full border border-white/10" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 60%)',
            maskImage: 'linear-gradient(to bottom, black, transparent 60%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white ring-1 ring-white/25 backdrop-blur"
          >
            <Icon icon="mdi:recycle" className="h-4 w-4" />
            Reuse &amp; Impact
          </motion.span>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-6xl"
          >
            Be a part of <span className="text-amber-300">Solution</span>
            <br />
            <span className="text-white/70">not Pollution</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-5 text-lg font-medium text-white/90 sm:text-2xl"
          >
            When you reuse just one phone:
          </motion.p>
        </motion.div>

        {/* Bento grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 lg:mt-16 lg:grid-cols-12 lg:gap-6">
          {/* Water: wide white card */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-2xl sm:p-8 lg:col-span-7"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-100/70" />
              <div className="absolute -bottom-24 right-10 h-60 w-60 rounded-full border border-primary-200/80" />
            </div>

            <div className="relative grid items-center gap-6 sm:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-600">
                  <Icon icon="mdi:water" className="h-4 w-4" />
                  Water
                </span>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  You save
                </p>
                <div className="flex items-end gap-2">
                  <span className="bg-gradient-to-br from-primary-400 to-primary-700 bg-clip-text text-7xl font-extrabold leading-none text-transparent sm:text-8xl">
                    <CountUp to={909} />
                  </span>
                  <span className="pb-2 text-xl font-bold text-gray-900 sm:pb-3 sm:text-2xl">
                    liters
                  </span>
                </div>
                <p className="mt-1 text-lg font-semibold text-gray-900">of water</p>
                <p className="mt-3 text-base leading-relaxed text-gray-600">
                  &amp; save people from staying thirsty for 100 years.
                </p>
              </div>

              <div className="relative mx-auto aspect-[5/4] w-full max-w-xs sm:max-w-none">
                <Image
                  src="/assets/about/4.png"
                  alt="Water saving illustration"
                  fill
                  sizes="(min-width: 1024px) 300px, 80vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </motion.div>

          {/* Energy: glass card */}
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-3xl bg-white/10 p-6 text-white shadow-2xl ring-1 ring-white/25 backdrop-blur-md sm:p-8 lg:col-span-5"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-amber-300/20 blur-2xl" />
              <div className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full border border-white/20" />
            </div>

            <div className="relative flex h-full flex-col">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-900">
                <Icon icon="mdi:lightning-bolt" className="h-4 w-4" />
                Energy
              </span>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/60">
                You save
              </p>
              <div className="flex items-end gap-2">
                <span className="text-7xl font-extrabold leading-none text-white sm:text-8xl">
                  <CountUp to={72} />
                </span>
                <span className="pb-2 text-xl font-bold sm:pb-3 sm:text-2xl">kWh</span>
              </div>
              <p className="mt-1 text-lg font-semibold">of energy</p>
              <p className="mt-3 text-base leading-relaxed text-white/80">
                &amp; power homes for weeks.
              </p>

              <div className="relative mt-4 aspect-[5/3] w-full flex-1">
                <Image
                  src="/assets/about/6.png"
                  alt="Energy saving illustration"
                  fill
                  sizes="(min-width: 1024px) 420px, 90vw"
                  className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </motion.div>

          {/* E-waste: full-width card */}
          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-2xl sm:p-8 lg:col-span-12 lg:p-10"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-50" />
              <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full border border-primary-100" />
            </div>

            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div className="relative order-2 mx-auto aspect-[4/3] w-full max-w-md md:order-1">
                <Image
                  src="/assets/about/5.png"
                  alt="Environmental impact illustration"
                  fill
                  sizes="(min-width: 768px) 450px, 90vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="order-1 md:order-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-600">
                  <Icon icon="mdi:leaf" className="h-4 w-4" />
                  Planet
                </span>
                <h3 className="mt-4 text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                  You keep <span className="text-primary-500">toxic e-waste</span> out of
                  landfills &amp; protect our planet
                </h3>
                <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
                  Every phone reused prevents toxic waste from polluting our environment and
                  conserves precious natural resources for future generations.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {WASTE_POINTS.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3.5 py-1.5 text-sm font-medium text-gray-700"
                    >
                      <Icon icon="mdi:check-circle" className="h-4 w-4 text-primary-500" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-10 grid grid-cols-1 divide-y divide-white/20 overflow-hidden rounded-3xl bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:mt-14"
        >
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-7 text-center">
              <div className="text-4xl font-extrabold sm:text-5xl">
                <CountUp to={s.to} suffix={s.suffix} />
              </div>
              <div className="mt-1.5 text-sm text-white/80 sm:text-base">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionSection;