'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';

// Minimal **bold** inline formatting — same convention used by the
// AI shopping assistant elsewhere in this app, kept consistent here.
function InlineText({ text }) {
  if (!text) return null;
  const parts = String(text).split('**');
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold text-slate-900">
        {part}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

const CALLOUT_STYLES = {
  info: {
    icon: 'mdi:information-outline',
    wrap: 'border-primary-200 bg-primary-50 text-primary-900',
    iconColor: 'text-primary-600',
  },
  tip: {
    icon: 'mdi:lightbulb-on-outline',
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    iconColor: 'text-emerald-600',
  },
  warning: {
    icon: 'mdi:alert-outline',
    wrap: 'border-amber-200 bg-amber-50 text-amber-900',
    iconColor: 'text-amber-600',
  },
};

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-[14.5px] font-semibold text-slate-900">{q}</span>
        <Icon
          icon="mdi:chevron-down"
          className={`shrink-0 text-lg text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-3.5 text-[14px] leading-relaxed text-slate-600">
          <InlineText text={a} />
        </div>
      )}
    </div>
  );
}

export default function DocContent({ blocks = [] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'lead':
            return (
              <p key={index} className="text-[17px] leading-relaxed text-slate-600">
                <InlineText text={block.text} />
              </p>
            );

          case 'heading':
            return (
              <h2 key={index} id={block.id} className="scroll-mt-24 pt-2 text-xl font-bold text-slate-900">
                {block.text}
              </h2>
            );

          case 'paragraph':
            return (
              <p key={index} className="text-[15px] leading-relaxed text-slate-700">
                <InlineText text={block.text} />
              </p>
            );

          case 'steps':
            return (
              <ol key={index} className="space-y-4">
                {block.items.map((step, i) => (
                  <li key={i} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[11.5px] font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      {step.title && <p className="font-semibold text-slate-900">{step.title}</p>}
                      <p className="text-[15px] leading-relaxed text-slate-600">
                        <InlineText text={step.text} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            );

          case 'list':
            return block.ordered ? (
              <ol key={index} className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-primary-600">
                {block.items.map((item, i) => (
                  <li key={i} className="text-[15px] leading-relaxed text-slate-700">
                    <InlineText text={item} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={index} className="space-y-2">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-slate-700">
                    <Icon icon="mdi:check-circle" className="mt-0.5 h-6 w-6 shrink-0 text-primary-500" />
                    <span>
                      <InlineText text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );

          case 'callout': {
            const style = CALLOUT_STYLES[block.tone] || CALLOUT_STYLES.info;
            return (
              <div key={index} className={`flex gap-3 rounded-2xl border px-4 py-3.5 ${style.wrap}`}>
                <Icon icon={style.icon} className={`mt-0.5 shrink-0 text-xl ${style.iconColor}`} />
                <p className="text-[14px] leading-relaxed">
                  <InlineText text={block.text} />
                </p>
              </div>
            );
          }

          case 'example':
            return (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                {block.title && (
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {block.title}
                  </p>
                )}
                <p className="text-[14px] leading-relaxed text-slate-700">
                  <InlineText text={block.text} />
                </p>
              </div>
            );

          case 'table':
            return (
              <div key={index} className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-[13.5px]">
                  <thead className="bg-slate-50">
                    <tr>
                      {block.headers.map((h, i) => (
                        <th key={i} className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-700">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {block.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'faq':
            return (
              <div key={index} className="space-y-3">
                {block.items.map((item, i) => (
                  <FaqItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            );

          case 'link':
            return (
              <Link
                key={index}
                href={block.href}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-primary-700"
              >
                {block.label}
                <Icon icon="mdi:arrow-right" className="text-base" />
              </Link>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
