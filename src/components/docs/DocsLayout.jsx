'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from '@/i18n/navigation';
import DocsHeader from './DocsHeader';
import DocsSidebar from './DocsSidebar';

export default function DocsLayout({ moduleKey, nav, children }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer automatically on navigation.
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white">
      <DocsHeader onMenuClick={() => setIsMobileNavOpen(true)} />

      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 lg:block">
          <div className="sticky top-[57px] h-[calc(100vh-57px)]">
            <DocsSidebar moduleKey={moduleKey} nav={nav} />
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileNavOpen(false)}
                className="fixed inset-0 z-50 bg-slate-900/40 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-y-0 left-0 z-50 w-[82vw] max-w-xs bg-white shadow-2xl lg:hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <span className="text-[13px] font-semibold text-slate-900">Documentation menu</span>
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                    aria-label="Close menu"
                  >
                    <Icon icon="mdi:close" className="text-lg" />
                  </button>
                </div>
                <div className="h-[calc(100%-49px)]">
                  <DocsSidebar moduleKey={moduleKey} nav={nav} onNavigate={() => setIsMobileNavOpen(false)} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content area */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  );
}
