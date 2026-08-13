'use client';

import { Icon } from '@iconify/react';
import { Link, usePathname } from '@/i18n/navigation';
import { DOCS_MODULES } from '@/data/docs/registry';

function ModuleSwitcher({ activeModuleKey }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 border-b border-slate-100 p-3">
      {DOCS_MODULES.map((module) => {
        const isActive = module.key === activeModuleKey;
        const content = (
          <>
            <Icon icon={module.icon} className={`text-lg ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
            <span className={`text-[11px] font-semibold ${isActive ? 'text-primary-700' : 'text-slate-500'}`}>
              {module.title}
            </span>
            {!module.available && (
              <span className="text-[8.5px] font-medium uppercase tracking-wide text-slate-300">Soon</span>
            )}
          </>
        );
        const className = `flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition ${
          isActive ? 'bg-primary-50 ring-1 ring-primary-200' : 'hover:bg-slate-50'
        } ${!module.available ? 'opacity-60' : ''}`;

        // Unavailable modules still navigate — /docs/[module] renders a
        // "Coming Soon" page for them instead of a dead/disabled link.
        return (
          <Link key={module.key} href={`/docs/${module.key}`} className={className}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

export default function DocsSidebar({ moduleKey, nav, onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col">
      <ModuleSwitcher activeModuleKey={moduleKey} />

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {nav.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const href = `/docs/${moduleKey}/${item.slug}`;
                const isActive = pathname === href;
                return (
                  <li key={item.slug}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`block rounded-lg px-2.5 py-1.5 text-[13.5px] transition ${
                        isActive
                          ? 'bg-primary-50 font-semibold text-primary-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
