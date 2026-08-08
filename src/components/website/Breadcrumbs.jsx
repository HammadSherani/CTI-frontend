import { Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';

export default function Breadcrumbs({ items }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-8 font-medium">
      <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} className="flex items-center gap-2">
            <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-semibold line-clamp-1">{item.label}</span>
            ) : (
              <Link href={item.href || '#'} className="hover:text-primary-500 transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
