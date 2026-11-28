'use client';

// A seller's own social links. Only the ones the seller has added are shown; with none, nothing.
import { Icon } from '@iconify/react';

const PLATFORMS = {
  facebook: ['Facebook', 'mdi:facebook', 'text-blue-600 hover:text-white hover:bg-blue-600'],
  instagram: ['Instagram', 'mdi:instagram', 'text-pink-600 hover:text-white hover:bg-pink-600'],
  twitter: ['X', 'ri:twitter-x-fill', 'text-black hover:text-white hover:bg-black'],
  linkedin: ['LinkedIn', 'mdi:linkedin', 'text-blue-700 hover:text-white hover:bg-blue-700'],
  whatsapp: ['WhatsApp', 'mdi:whatsapp', 'text-green-500 hover:text-white hover:bg-green-500'],
  youtube: ['YouTube', 'mdi:youtube', 'text-red-600 hover:text-white hover:bg-red-600'],
  tiktok: ['TikTok', 'ic:baseline-tiktok', 'text-black hover:text-white hover:bg-black'],
  website: ['Website', 'mdi:web', 'text-gray-600 hover:text-white hover:bg-gray-700'],
};

const address = (platform, value) => {
  if (/^https?:\/\//i.test(value)) return value;
  return platform === 'whatsapp' ? `https://wa.me/${value.replace(/\D/g, '')}` : `https://${value}`;
};

export default function SellerSocialLinks({ links, className = '' }) {
  const added = Object.keys(PLATFORMS)
    .map((platform) => [platform, String(links?.[platform] || '').trim()])
    .filter(([, value]) => value);
  if (!added.length) return null;

  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Follow:</span>
      {added.map(([platform, value]) => {
        const [name, icon, colour] = PLATFORMS[platform];
        return (
          <a
            key={platform}
            href={address(platform, value)}
            target="_blank"
            rel="noopener noreferrer"
            title={name}
            aria-label={name}
            className={`w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center transition-all duration-200 ${colour}`}
          >
            <Icon icon={icon} className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
}
