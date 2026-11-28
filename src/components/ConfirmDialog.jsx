"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

const TONES = {
  danger: { icon: 'mdi:alert-circle-outline', iconWrap: 'bg-red-100 text-red-600', button: 'bg-red-600 hover:bg-red-700' },
  warning: { icon: 'mdi:alert-outline', iconWrap: 'bg-amber-100 text-amber-600', button: 'bg-primary-600 hover:bg-primary-700' },
  info: { icon: 'mdi:help-circle-outline', iconWrap: 'bg-primary-100 text-primary-600', button: 'bg-primary-600 hover:bg-primary-700' },
};

/**
 * In-app replacement for window.confirm.
 *
 *   const { confirm, confirmDialog } = useConfirm();
 *   if (!(await confirm({ title, message, confirmText }))) return;
 *   ...
 *   return <>{page}{confirmDialog}</>;
 */
export function useConfirm() {
  const [options, setOptions] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((opts) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setOptions(opts || {});
  }), []);

  const close = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirmDialog = options ? <ConfirmDialog {...options} onConfirm={() => close(true)} onCancel={() => close(false)} /> : null;
  return { confirm, confirmDialog };
}

export default function ConfirmDialog({
  title = 'Are you sure?',
  message,
  details,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'warning',
  onConfirm,
  onCancel,
}) {
  const t = TONES[tone] || TONES.warning;
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${t.iconWrap}`}>
            <Icon icon={t.icon} className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
            {details && <div className="mt-3">{details}</div>}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${t.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
