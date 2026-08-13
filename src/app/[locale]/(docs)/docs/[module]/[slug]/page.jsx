import { notFound } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { getModule, getModulePage, getAdjacentPages, getFlatPages } from '@/data/docs/registry';
import DocContent from '@/components/docs/DocContent';
import { getPageOutline } from '@/components/docs/docOutline';

export default async function DocPage({ params }) {
  const { module: moduleKey, slug } = await params;
  const docModule = getModule(moduleKey);
  if (!docModule || !docModule.available) notFound();

  const page = getModulePage(moduleKey, slug);
  if (!page) notFound();

  const flat = getFlatPages(moduleKey);
  const current = flat.find((p) => p.slug === slug);
  const { prev, next } = getAdjacentPages(moduleKey, slug);
  const outline = getPageOutline(page?.content);

  return (
    <div className="mx-auto flex max-w-5xl gap-10">
      <article className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-slate-400">
          <Link href={`/docs/${docModule.key}`} className="transition hover:text-primary-600">
            {docModule.title}
          </Link>
          <Icon icon="mdi:chevron-right" className="text-sm" />
          <span className="text-slate-500">{current?.sectionTitle}</span>
        </div>

        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">{page.title}</h1>
        {page.description && (
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{page.description}</p>
        )}

        <div className="mt-8">
          <DocContent blocks={page.content} />
        </div>

        {(prev || next) && (
          <div className="mt-12 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/docs/${docModule.key}/${prev.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-primary-300 hover:bg-primary-50/40"
              >
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                  <Icon icon="mdi:arrow-left" className="text-xs" />
                  Previous
                </span>
                <span className="mt-0.5 text-[13.5px] font-semibold text-slate-800 group-hover:text-primary-700">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/docs/${docModule.key}/${next.slug}`}
                className="group flex flex-col items-end rounded-2xl border border-slate-200 px-4 py-3 text-right transition hover:border-primary-300 hover:bg-primary-50/40 sm:ml-auto"
              >
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                  Next
                  <Icon icon="mdi:arrow-right" className="text-xs" />
                </span>
                <span className="mt-0.5 text-[13.5px] font-semibold text-slate-800 group-hover:text-primary-700">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        )}
      </article>

      {outline.length > 1 && (
        <aside className="hidden w-48 shrink-0 xl:block">
          <div className="sticky top-[80px]">
            <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
              On this page
            </p>
            <ul className="space-y-1.5 border-l border-slate-100 pl-3">
              {outline.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block text-[12.5px] leading-relaxed text-slate-500 transition hover:text-primary-600"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
