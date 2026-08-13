'use client';

import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import DocsSearch from '@/components/docs/DocsSearch';
import { DOCS_MODULES } from '@/data/docs/registry';

export default function DocsHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/docs" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm">
              <Icon icon="mdi:book-open-page-variant-outline" className="text-base" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-slate-900">
              CTI <span className="font-normal text-slate-400">Docs</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <Icon icon="mdi:arrow-left" className="text-base" />
            Back to CTI
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
            <Icon icon="mdi:compass-outline" className="text-sm" />
            CTI Platform Academy
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to use CTI
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
            Step-by-step guides for every part of the platform — pick a module below to get started.
          </p>
          <div className="mt-7">
            <DocsSearch />
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DOCS_MODULES.map((module) => (
            <Link
              key={module.key}
              href={`/docs/${module.key}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg"
            >
              {!module.available && (
                <span className="absolute right-4 top-4 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Coming Soon
                </span>
              )}
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon icon={module.icon} className="text-2xl" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{module.title}</h3>
              <p className="mt-1 text-[13.5px] font-medium text-slate-400">{module.tagline}</p>
              <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-slate-500">{module.description}</p>
              <span className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-primary-600">
                {module.available ? 'Read the docs' : 'Preview'}
                <Icon
                  icon="mdi:arrow-right"
                  className="text-base transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
