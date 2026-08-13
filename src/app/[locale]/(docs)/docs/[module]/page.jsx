import { notFound } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { getModule } from '@/data/docs/registry';

export default async function ModuleOverviewPage({ params }) {
  const { module: moduleKey } = await params;
  const docModule = getModule(moduleKey);

  if (!docModule || !docModule.available) {
    notFound();
  }

  return (
    <div className=" max-w-6xl">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
        <Icon icon={docModule.icon} className="text-sm" />
        {docModule.title} Documentation
      </span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{docModule.tagline}</h1>
      <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">{docModule.description}</p>

      <div className="mt-10 space-y-8">
        {docModule.nav.map((section) => (
          <div key={section.title}>
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-400">
              {section.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.items.map((item) => {
                const page = docModule.pages[item.slug];
                return (
                  <Link
                    key={item.slug}
                    href={`/docs/${docModule.key}/${item.slug}`}
                    className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-sm"
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900">{item.title}</p>
                      {page?.description && (
                        <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500">
                          {page.description}
                        </p>
                      )}
                    </div>
                    <Icon
                      icon="mdi:arrow-right"
                      className="mt-1 shrink-0 text-base text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
