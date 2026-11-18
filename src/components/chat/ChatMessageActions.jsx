"use client"

// Message actions, WhatsApp style: a small ⌄ on the bubble opens Reply / Copy / Delete,
// and Delete asks "Delete for everyone" / "Delete for me".
import React, { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

export function MessageMenu({ items, alignRight, onClose }) {
    const ref = useRef(null);

    useEffect(() => {
        const close = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('mousedown', close);
        document.addEventListener('touchstart', close);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('touchstart', close);
            document.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    return (
        <div
            ref={ref}
            role="menu"
            className={`absolute top-7 ${alignRight ? 'right-1' : 'left-1'} z-30 min-w-[150px] bg-white rounded-lg shadow-lg border border-gray-100 py-1 text-gray-700`}
        >
            {items.map((item) => (
                <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                        onClose();
                        item.onClick();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left ${item.danger ? 'text-red-600' : ''}`}
                >
                    <Icon icon={item.icon} width={17} />
                    {item.label}
                </button>
            ))}
        </div>
    );
}

export function DeleteDialog({ canDeleteForEveryone, onDeleteForEveryone, onDeleteForMe, onCancel, count = 1 }) {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onCancel();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onCancel]);

    return (
        <div className="absolute inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
            <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-xs bg-white rounded-xl shadow-xl p-5"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-base font-semibold text-gray-900 mb-1">Delete {count > 1 ? `${count} messages` : 'message'}?</p>
                <p className="text-sm text-gray-500 mb-4">
                    {canDeleteForEveryone
                        ? '"Delete for everyone" removes it for both of you. "Delete for me" only hides it on your side.'
                        : 'It will be removed from your chat only. The other person can still see it. (Your own messages can be deleted for everyone only within 15 minutes of sending.)'}
                </p>
                <div className="flex flex-col items-stretch gap-1.5">
                    {canDeleteForEveryone && (
                        <button
                            type="button"
                            onClick={onDeleteForEveryone}
                            className="w-full py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-100"
                        >
                            Delete for everyone
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onDeleteForMe}
                        className="w-full py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-100"
                    >
                        Delete for me
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
