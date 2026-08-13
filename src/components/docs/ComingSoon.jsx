'use client';

import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';

export default function ComingSoon({ module }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon icon={module?.icon || 'mdi:book-open-page-variant-outline'} className="text-3xl" />
      </span>
      <h1 className="text-2xl font-bold text-slate-900">{module?.title || 'This section'} docs are coming soon</h1>
      <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-slate-500">
        We're still writing documentation for {module?.title || 'this module'}. In the meantime, check out the
        Seller documentation.
      </p>
      <Link
        href="/docs/seller"
        className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-primary-700"
      >
        Go to Seller Docs
        <Icon icon="mdi:arrow-right" className="text-base" />
      </Link>
    </div>
  );
}
