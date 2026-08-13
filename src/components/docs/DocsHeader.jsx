'use client';

import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import DocsSearch from './DocsSearch';
import Image from 'next/image';

export default function DocsHeader({ onMenuClick, showMenuButton = true }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
        {showMenuButton && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 lg:hidden"
            aria-label="Toggle documentation menu"
          >
            <Icon icon="mdi:menu" className="text-xl" />
          </button>
        )}

        <Link href="/docs" className="flex shrink-0 items-center gap-2">
            <Image src="/assets/logo.png" alt="CTI Logo" width={84} height={154} className="mr-1" />
        </Link>
        <div className="mx-auto w-full max-w-md">
          <DocsSearch />
        </div>

        <Link
          href="/"
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100 sm:flex"
        >
          <Icon icon="mdi:arrow-left" className="text-base" />
          Back to CTI
        </Link>
      </div>
    </header>
  );
}
