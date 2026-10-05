'use client';

import { Icon } from '@iconify/react';
import { useRouter } from '@/i18n/navigation';

const benefits = [
  { icon: 'mdi:cellphone-check', label: 'Mobile phones' },
  { icon: 'mdi:tablet-check', label: 'Tablets' },
  { icon: 'mdi:shield-check-outline', label: 'Flexible cover' },
];

export default function InsuranceSection() {
  const router = useRouter();

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl bg-primary-600 px-6 py-8 text-white shadow-sm sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Icon icon="mdi:shield-check-outline" className="h-5 w-5" />
            Device insurance
          </div>
          <h2 className="text-2xl font-bold sm:text-3xl">Keep your favourite devices protected</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
            Choose your device and tell us what cover you need. Our team will help you find the right protection.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/90">
            {benefits.map((benefit) => (
              <span key={benefit.label} className="flex items-center gap-2">
                <Icon icon={benefit.icon} className="h-5 w-5" />
                {benefit.label}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push('/insurance')}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary-700 transition hover:bg-primary-50 lg:mt-0 lg:w-auto"
        >
          Get protected
          <Icon icon="mdi:arrow-right" className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}