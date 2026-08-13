'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import { getSearchIndex } from '@/data/docs/registry';

function matches(entry, query) {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return (
    entry.title.toLowerCase().includes(q) ||
    entry.description.toLowerCase().includes(q) ||
    entry.sectionTitle.toLowerCase().includes(q) ||
    entry.moduleTitle.toLowerCase().includes(q)
  );
}

export default function DocsSearch({ className = '' }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const index = useMemo(() => getSearchIndex(), []);
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return index.filter((entry) => matches(entry, query)).slice(0, 8);
  }, [index, query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goTo = (entry) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/docs/${entry.moduleKey}/${entry.slug}`);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-primary-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-100">
        <Icon icon="mdi:magnify" className="shrink-0 text-lg text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search documentation…"
          className="w-full min-w-0 bg-transparent text-[13.5px] text-slate-900 outline-none placeholder:text-slate-400"
        />
        <kbd className="hidden shrink-0 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:block">
          Ctrl K
        </kbd>
      </div>

      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
          >
            {results.length > 0 ? (
              <ul className="max-h-80 overflow-y-auto py-1.5">
                {results.map((entry) => (
                  <li key={`${entry.moduleKey}-${entry.slug}`}>
                    <button
                      type="button"
                      onClick={() => goTo(entry)}
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition hover:bg-primary-50"
                    >
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary-600">
                        {entry.moduleTitle}
                        <Icon icon="mdi:chevron-right" className="text-[11px] text-slate-300" />
                        {entry.sectionTitle}
                      </span>
                      <span className="text-[13.5px] font-semibold text-slate-900">{entry.title}</span>
                      {entry.description && (
                        <span className="line-clamp-1 text-[12px] text-slate-500">{entry.description}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center text-[13px] text-slate-400">
                No documentation pages match "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
