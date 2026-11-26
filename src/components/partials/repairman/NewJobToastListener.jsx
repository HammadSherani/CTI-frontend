'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useRouter } from '@/i18n/navigation';
import { useSocket } from '@/contexts/SocketProvider';
import useNotifications from '@/hooks/useNotifications';

const URGENCY_STYLES = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-green-100 text-green-700',
};

const formatBudget = (budget) => {
    if (!budget || (budget.min == null && budget.max == null)) return null;
    const currency = budget.currency || 'TRY';
    const fmt = (n) => Number(n).toLocaleString();
    if (budget.min != null && budget.max != null) return `${currency} ${fmt(budget.min)} – ${fmt(budget.max)}`;
    return `${currency} ${fmt(budget.max ?? budget.min)}`;
};

const truncate = (text, max = 110) => {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
};

function NewJobToast({ notification }) {
    const data = notification.data || {};
    const title = data.deviceName || String(notification.title || 'New job').replace(/^New Job for\s*/i, '');
    const budget = formatBudget(data.budget);

    return (
        <div className="w-full cursor-pointer border-l-4 border-primary-500 pl-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-600">
                <Icon icon="solar:bell-bing-bold-duotone" className="w-4 h-4" />
                New job posted
                {data.urgency && (
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] normal-case ${URGENCY_STYLES[data.urgency] || 'bg-gray-100 text-gray-700'}`}>
                        {data.urgency}
                    </span>
                )}
            </div>
            <p className="mt-1 text-base font-bold text-gray-900 leading-snug">{title}</p>
            {budget && <p className="text-sm font-semibold text-gray-700">{budget}</p>}
            {notification.message && (
                <p className="mt-1 text-sm text-gray-500 leading-snug">{truncate(notification.message)}</p>
            )}
            <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-primary-600">
                View job <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
            </p>
        </div>
    );
}

/**
 * Shows a short, clickable toast (bottom-left) on the repairman dashboard whenever a new job
 * is posted in their city — similar to job alerts on freelancing sites.
 */
export default function NewJobToastListener() {
    const { socket } = useSocket();
    const router = useRouter();
    const { markAsRead } = useNotifications();
    const shown = useRef(new Set());

    useEffect(() => {
        if (!socket) return undefined;

        const onNotification = (notification) => {
            if (notification?.type !== 'new_job') return;
            const id = String(notification._id || notification.data?.jobId || '');
            if (id && shown.current.has(id)) return; // same event twice (reconnect)
            if (id) shown.current.add(id);

            const jobId = notification.data?.jobId;
            const link = notification.data?.link || (jobId ? `/repair-man/job-board/${jobId}` : '/repair-man/job-board');

            toast(<NewJobToast notification={notification} />, {
                toastId: id || undefined,
                position: 'bottom-left',
                autoClose: 10000,
                pauseOnHover: true,
                closeOnClick: true,
                icon: false,
                className: 'shadow-xl rounded-xl',
                onClick: () => {
                    if (notification._id) markAsRead(notification._id);
                    router.push(link);
                },
            });
        };

        socket.on('push_notification', onNotification);
        return () => {
            socket.off('push_notification', onNotification);
        };
    }, [socket, router, markAsRead]);

    return null;
}
