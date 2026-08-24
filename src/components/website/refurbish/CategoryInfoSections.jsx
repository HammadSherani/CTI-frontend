'use client';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import WhatComesWithPhone from './Whatcomeswithphone';

/* ═══════════════════════════════════════════════════════════
   CATEGORY DETECTION
═══════════════════════════════════════════════════════════ */
function detectDeviceType(categorySlug, categoryName) {
  const slug = (categorySlug || '').toLowerCase();
  const name = (categoryName || '').toLowerCase();
  if (slug.includes('phone') || slug.includes('mobile') || slug.includes('cell') || name.includes('phone') || name.includes('mobile')) return 'phone';
  if (slug.includes('laptop') || slug.includes('notebook') || name.includes('laptop') || name.includes('notebook')) return 'laptop';
  if (slug.includes('tablet') || slug.includes('ipad') || name.includes('tablet')) return 'tablet';
  if (slug.includes('watch') || name.includes('watch')) return 'watch';
  return 'generic';
}

export const REFURBISHED_ATTRIBUTE_OPTIONS = {
  Condition: {
    icon: "mdi:star-check-outline",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    presets: [
      { label: "Superb" },
      { label: "Good" },
      { label: "Fair" },
      { label: "Best Value" },
    ],
  },
  Color: {
    icon: "mdi:palette-outline",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    presets: [
      { label: "Black", hex: "#111111" },
      { label: "White", hex: "#FFFFFF" },
      { label: "Silver", hex: "#E5E7EB" },
      { label: "Space Gray", hex: "#4B5563" },
      { label: "Gold", hex: "#F59E0B" },
      { label: "Blue", hex: "#3B82F6" },
      { label: "Red", hex: "#EF4444" },
      { label: "Green", hex: "#22C55E" },
    ],
  },
  Storage: {
    icon: "mdi:harddisk",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    presets: [
      { label: "64GB" }, { label: "128GB" }, { label: "256GB" },
      { label: "512GB" }, { label: "1TB" },
    ],
  },
  RAM: {
    icon: "mdi:memory",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    presets: [
      { label: "4GB" }, { label: "6GB" }, { label: "8GB" },
      { label: "12GB" }, { label: "16GB" }, { label: "32GB" },
    ],
  },
};

function AttributeValuePicker({ type, selectedValues, onToggle, onAdd, onRemove, activeOptions }) {
  const cfg = activeOptions[type];
  return (
    <div className="flex flex-wrap gap-2">
      {cfg.presets.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onToggle(opt.label)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${selectedValues?.includes(opt.label)
              ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function AttributePanel({ selectedAttrs, toggleAttrType, toggleAttrValue, addCustomValue, removeAttrValue, activeOptions }) {
  const activeTypes = Object.keys(selectedAttrs);
  const allAttrTypes = Object.keys(activeOptions);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
          Which options does your product have?
        </p>
        <div className="flex flex-wrap gap-3">
          {allAttrTypes.map((type) => {
            const cfg = activeOptions[type];
            const active = type in selectedAttrs;
            return (
              <button key={type} type="button" onClick={() => toggleAttrType(type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-sm font-bold transition-all ${active
                  ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}>
                <Icon icon={cfg.icon} className="w-4 h-4" />
                {type}
                {active && <Icon icon="mdi:check-circle" className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PLACEHOLDER "PHOTOS"
═══════════════════════════════════════════════════════════ */
const PLACEHOLDER_IMAGES = {
  screenOff: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&h=400&q=80',
  screenColor: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&h=400&q=80',
  backCamera: 'https://images.unsplash.com/photo-1565849320607-45e7f1d41865?auto=format&fit=crop&w=400&h=400&q=80',
  sideEdge: 'https://images.unsplash.com/photo-1573148195900-7845dcb9b127?auto=format&fit=crop&w=400&h=400&q=80',
  bottomPort: 'https://images.unsplash.com/photo-1584438784894-089d6a128f3e?auto=format&fit=crop&w=400&h=400&q=80',
  laptopScreen: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&h=400&q=80',
  laptopKeyboard: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&h=400&q=80',
  laptopBody: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&h=400&q=80',
  tabletScreen: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&h=400&q=80',
  tabletBody: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&h=400&q=80',
  scratchedScreen: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&h=400&q=80',
  scratchedBody: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&h=400&q=80',
};

const GRADES = {
  phone: {
    Superb: {
      tagline: 'Like New Condition',
      overall: 'No Functional Defects',
      checks: [
        {
          icon: 'mdi:cellphone-screenshot', label: 'Screen Glass',
          desc: 'Minimal scratches that are barely noticeable only when the screen is off',
          photos: [
            { img: 'screenOff', zoomPos: '25% 40%', zoomScale: 2.4, caption: 'Micro-scratches' },
            { img: 'screenOff', zoomPos: '75% 55%', zoomScale: 2.2, caption: 'Micro-scratches' },
          ],
        },
        {
          icon: 'mdi:monitor-screenshot', label: 'Display',
          desc: 'Perfect condition — no dead pixels, burn-in, or discoloration',
          photos: [
            { img: 'screenColor', zoomPos: '60% 30%', zoomScale: 2.6, caption: 'No pixel damage' },
          ],
        },
        {
          icon: 'mdi:cellphone', label: 'Chrome / Body',
          desc: 'Minor signs of wear and light scratches. Invisible from a 20 cm distance',
          photos: [
            { img: 'backCamera', zoomPos: '35% 30%', zoomScale: 2.2, caption: 'Camera module' },
            { img: 'sideEdge', zoomPos: '55% 40%', zoomScale: 2.3, caption: 'Side buttons' },
            { img: 'bottomPort', zoomPos: '45% 50%', zoomScale: 2.6, caption: 'Charging port' },
          ],
        },
        { icon: 'mdi:battery-charging-100', label: 'Battery Health', desc: 'Battery health above 85%. Excellent daily performance' },
      ],
    },
    Good: {
      tagline: 'Excellent Working Condition',
      overall: 'Fully Functional',
      checks: [
        {
          icon: 'mdi:cellphone-screenshot', label: 'Screen Glass',
          desc: 'Light scratches visible when the screen is off, not noticeable during use',
          photos: [{ img: 'screenOff', zoomPos: '40% 60%', zoomScale: 2.1, caption: 'Light scratch' }],
        },
        {
          icon: 'mdi:monitor-screenshot', label: 'Display',
          desc: 'Perfect working condition with no functional issues',
          photos: [{ img: 'screenColor', zoomPos: '30% 60%', zoomScale: 2.3, caption: 'Working perfectly' }],
        },
        {
          icon: 'mdi:cellphone', label: 'Chrome / Body',
          desc: 'Visible signs of regular use including minor dents or scuffs',
          photos: [
            { img: 'backCamera', zoomPos: '60% 65%', zoomScale: 2.1, caption: 'Minor scuff' },
            { img: 'bottomPort', zoomPos: '50% 50%', zoomScale: 2.4, caption: 'Port wear' },
          ],
        },
        { icon: 'mdi:battery-charging-80', label: 'Battery Health', desc: 'Battery health above 80%. Good for daily use' },
      ],
    },
    Fair: {
      tagline: 'Budget-Friendly Option',
      overall: 'All Features Working',
      checks: [
        {
          icon: 'mdi:cellphone-screenshot', label: 'Screen Glass',
          desc: 'Noticeable scratches visible during use, but no cracks',
          photos: [{ img: 'scratchedScreen', zoomPos: '55% 30%', zoomScale: 2.0, caption: 'Noticeable scratch' }],
        },
        {
          icon: 'mdi:monitor-screenshot', label: 'Display',
          desc: 'May have minor spots but fully functional',
          photos: [{ img: 'screenColor', zoomPos: '70% 70%', zoomScale: 2.2, caption: 'Minor spot' }],
        },
        {
          icon: 'mdi:cellphone', label: 'Chrome / Body',
          desc: 'Clear signs of usage with dents, scratches, or discoloration',
          photos: [
            { img: 'scratchedBody', zoomPos: '20% 75%', zoomScale: 2.0, caption: 'Visible dent' },
            { img: 'sideEdge', zoomPos: '65% 55%', zoomScale: 2.1, caption: 'Edge wear' },
          ],
        },
        { icon: 'mdi:battery-charging-60', label: 'Battery Health', desc: 'Battery health above 72%. Adequate for regular use' },
      ],
    },
    'Best Value': {
      tagline: 'Maximum Savings',
      overall: 'Functional with Visible Wear',
      checks: [
        {
          icon: 'mdi:cellphone-screenshot', label: 'Screen Glass',
          desc: "Visible scratches and possible minor cracks that don't affect touch functionality",
          photos: [{ img: 'scratchedScreen', zoomPos: '35% 65%', zoomScale: 1.9, caption: 'Visible scratch' }],
        },
        {
          icon: 'mdi:monitor-screenshot', label: 'Display',
          desc: 'May have minor imperfections but touch works perfectly',
          photos: [{ img: 'screenColor', zoomPos: '45% 20%', zoomScale: 2.0, caption: 'Minor imperfection' }],
        },
        {
          icon: 'mdi:cellphone', label: 'Chrome / Body',
          desc: 'Heavy signs of use including dents and color fading',
          photos: [
            { img: 'scratchedBody', zoomPos: '50% 20%', zoomScale: 1.9, caption: 'Heavy wear' },
            { img: 'bottomPort', zoomPos: '60% 40%', zoomScale: 2.2, caption: 'Fading' },
          ],
        },
        { icon: 'mdi:battery-charging-40', label: 'Battery Health', desc: 'Battery health above 65%. Recommended for light use' },
      ],
    },
  },

  laptop: {
    Superb: {
      tagline: 'Like New Condition',
      overall: 'No Functional Defects',
      checks: [
        {
          icon: 'mdi:laptop', label: 'Screen / Display',
          desc: 'No scratches, dead pixels, or backlight bleed. Crystal clear display',
          photos: [{ img: 'laptopScreen', zoomPos: '35% 25%', zoomScale: 2.2, caption: 'Pristine screen' }],
        },
        {
          icon: 'mdi:keyboard', label: 'Keyboard & Trackpad',
          desc: 'All keys responsive with no fading. Trackpad works flawlessly',
          photos: [{ img: 'laptopKeyboard', zoomPos: '50% 50%', zoomScale: 2.0, caption: 'Clean keyboard' }],
        },
        {
          icon: 'mdi:monitor-shimmer', label: 'Body / Chassis',
          desc: 'Minimal cosmetic wear. Hinges tight and firm',
          photos: [{ img: 'laptopBody', zoomPos: '45% 45%', zoomScale: 2.1, caption: 'No body wear' }],
        },
        { icon: 'mdi:battery-charging-100', label: 'Battery', desc: 'Battery retains 85%+ of original capacity. Great for portable use' },
      ]
    },
    Good: {
      tagline: 'Excellent Working Condition',
      overall: 'Fully Functional',
      checks: [
        {
          icon: 'mdi:laptop', label: 'Screen / Display',
          desc: 'Minor light marks only visible on dark backgrounds when screen is off',
          photos: [{ img: 'laptopScreen', zoomPos: '55% 40%', zoomScale: 2.1, caption: 'Micro marks' }],
        },
        {
          icon: 'mdi:keyboard', label: 'Keyboard & Trackpad',
          desc: 'Slight shine on frequently used keys. All keys fully functional',
          photos: [{ img: 'laptopKeyboard', zoomPos: '35% 45%', zoomScale: 1.9, caption: 'Light key gloss' }],
        },
        {
          icon: 'mdi:monitor-shimmer', label: 'Body / Chassis',
          desc: 'Light scratches or small dents. Structurally sound with firm hinges',
          photos: [{ img: 'laptopBody', zoomPos: '25% 65%', zoomScale: 2.0, caption: 'Minor scuff' }],
        },
        { icon: 'mdi:battery-charging-80', label: 'Battery', desc: 'Battery retains 75%+ capacity. Suitable for moderate portable use' },
      ]
    },
    Fair: {
      tagline: 'Budget-Friendly Option',
      overall: 'All Features Working',
      checks: [
        {
          icon: 'mdi:laptop', label: 'Screen / Display',
          desc: 'Noticeable marks or minor blemishes. No dead pixels affecting usability',
          photos: [{ img: 'scratchedScreen', zoomPos: '50% 60%', zoomScale: 1.8, caption: 'Minor spot' }],
        },
        {
          icon: 'mdi:keyboard', label: 'Keyboard & Trackpad',
          desc: 'Visible wear on keys but fully functional',
          photos: [{ img: 'laptopKeyboard', zoomPos: '60% 60%', zoomScale: 1.8, caption: 'Faded spacebar' }],
        },
        {
          icon: 'mdi:monitor-shimmer', label: 'Body / Chassis',
          desc: 'Visible wear, scratches, or small dents on the body',
          photos: [{ img: 'scratchedBody', zoomPos: '75% 30%', zoomScale: 1.8, caption: 'Noticeable dent' }],
        },
        { icon: 'mdi:battery-charging-60', label: 'Battery', desc: 'Battery retains 60%+ capacity. Best used near a power outlet' },
      ]
    },
    'Best Value': {
      tagline: 'Maximum Savings',
      overall: 'Functional with Visible Wear',
      checks: [
        {
          icon: 'mdi:laptop', label: 'Screen / Display',
          desc: 'May have visible marks but display is fully functional',
          photos: [{ img: 'scratchedScreen', zoomPos: '45% 55%', zoomScale: 1.7, caption: 'Display wear' }],
        },
        {
          icon: 'mdi:keyboard', label: 'Keyboard & Trackpad',
          desc: 'Heavy wear on keycaps but functional. Some key legends may be faded',
          photos: [{ img: 'laptopKeyboard', zoomPos: '50% 50%', zoomScale: 1.7, caption: 'Heavy key wear' }],
        },
        {
          icon: 'mdi:monitor-shimmer', label: 'Body / Chassis',
          desc: 'Significant cosmetic wear, dents, or sticker residue',
          photos: [{ img: 'scratchedBody', zoomPos: '40% 70%', zoomScale: 1.9, caption: 'Chassis scratches' }],
        },
        { icon: 'mdi:battery-charging-40', label: 'Battery', desc: 'Battery may need replacement. Best used plugged in' },
      ]
    },
  },

  tablet: {
    Superb: {
      tagline: 'Like New Condition',
      overall: 'No Functional Defects',
      checks: [
        {
          icon: 'mdi:tablet', label: 'Screen',
          desc: 'Pristine display with no scratches or blemishes',
          photos: [{ img: 'tabletScreen', zoomPos: '50% 50%', zoomScale: 2.2, caption: 'Clean screen' }],
        },
        { icon: 'mdi:gesture-tap', label: 'Touch Response', desc: 'Perfect touch sensitivity across the entire screen' },
        {
          icon: 'mdi:tablet-cellphone', label: 'Body',
          desc: 'Minimal cosmetic wear, looks almost new',
          photos: [{ img: 'tabletBody', zoomPos: '40% 40%', zoomScale: 2.0, caption: 'Perfect casing' }],
        },
        { icon: 'mdi:battery-charging-100', label: 'Battery', desc: 'Battery health above 85%. Excellent for extended use' },
      ]
    },
    Good: {
      tagline: 'Excellent Working Condition',
      overall: 'Fully Functional',
      checks: [
        {
          icon: 'mdi:tablet', label: 'Screen',
          desc: 'Light scratches visible only when screen is off',
          photos: [{ img: 'tabletScreen', zoomPos: '35% 65%', zoomScale: 1.9, caption: 'Light marks' }],
        },
        { icon: 'mdi:gesture-tap', label: 'Touch Response', desc: 'Fully responsive touch across all areas' },
        {
          icon: 'mdi:tablet-cellphone', label: 'Body',
          desc: 'Minor signs of use on edges and back',
          photos: [{ img: 'tabletBody', zoomPos: '60% 50%', zoomScale: 1.8, caption: 'Minor scuff' }],
        },
        { icon: 'mdi:battery-charging-80', label: 'Battery', desc: 'Battery health above 80%. Good for daily use' },
      ]
    },
    Fair: {
      tagline: 'Budget-Friendly Option',
      overall: 'All Features Working',
      checks: [
        {
          icon: 'mdi:tablet', label: 'Screen',
          desc: 'Noticeable scratches but no cracks',
          photos: [{ img: 'scratchedScreen', zoomPos: '45% 55%', zoomScale: 1.7, caption: 'Noticeable marks' }],
        },
        { icon: 'mdi:gesture-tap', label: 'Touch Response', desc: 'Touch works well across the screen' },
        {
          icon: 'mdi:tablet-cellphone', label: 'Body',
          desc: 'Visible wear with dents or scratches',
          photos: [{ img: 'scratchedBody', zoomPos: '50% 60%', zoomScale: 1.7, caption: 'Body scratches' }],
        },
        { icon: 'mdi:battery-charging-60', label: 'Battery', desc: 'Battery health above 70%. Adequate for regular tasks' },
      ]
    },
    'Best Value': {
      tagline: 'Maximum Savings',
      overall: 'Functional with Visible Wear',
      checks: [
        {
          icon: 'mdi:tablet', label: 'Screen',
          desc: 'Visible scratches, possible minor cracks not affecting touch',
          photos: [{ img: 'scratchedScreen', zoomPos: '50% 50%', zoomScale: 1.6, caption: 'Display scratches' }],
        },
        { icon: 'mdi:gesture-tap', label: 'Touch Response', desc: 'Touch functional, may have minor dead zones' },
        {
          icon: 'mdi:tablet-cellphone', label: 'Body',
          desc: 'Heavy cosmetic wear',
          photos: [{ img: 'scratchedBody', zoomPos: '30% 70%', zoomScale: 1.6, caption: 'Heavy wear' }],
        },
        { icon: 'mdi:battery-charging-40', label: 'Battery', desc: 'Battery health above 60%. Best used near power' },
      ]
    },
  },
};

const GRADE_TABS = ['Superb', 'Good', 'Fair', 'Best Value'];
const GRADE_COLORS = {
  Superb: { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', activeBg: 'bg-primary-500', dot: 'bg-primary-500', beam: 'rgba(249,115,22,0.35)' },
  Good: { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', activeBg: 'bg-primary-500', dot: 'bg-primary-500', beam: 'rgba(249,115,22,0.35)' },
  Fair: { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', activeBg: 'bg-primary-500', dot: 'bg-primary-500', beam: 'rgba(249,115,22,0.35)' },
  'Best Value': { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', activeBg: 'bg-primary-500', dot: 'bg-primary-500', beam: 'rgba(249,115,22,0.35)' },
};

/* ═══════════════════════════════════════════════════════════
   PHOTO CARD
═══════════════════════════════════════════════════════════ */
function PhotoCard({ photo }) {
  const src = PLACEHOLDER_IMAGES[photo.img] || photo.img;
  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white flex flex-col items-center w-36 sm:w-40 hover:border-gray-200 transition-colors">
      <div className="w-full aspect-[4/3] bg-black">
        <img src={src} alt={photo.caption || ''} className="w-full h-full object-cover" />
      </div>
      {photo.caption && (
        <div className="text-[10px] font-bold text-gray-500 py-2 px-3 text-center leading-tight bg-white w-full border-t border-gray-50 truncate">
          {photo.caption}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GRADE EXPLAINED SECTION
═══════════════════════════════════════════════════════════ */
function GradeExplained({ deviceType }) {
  const [activeGrade, setActiveGrade] = useState('Superb');
  const grades = GRADES[deviceType] || GRADES.phone;
  const grade = grades[activeGrade];
  const colors = GRADE_COLORS[activeGrade];

  if (!grade) return null;

  return (
    <div className='bg-gray-50 rounded-3xl p-4'>
      <h2 className="text-xl font-bold mb-5 pb-2 flex items-center gap-2">
        <Icon icon="mdi:star-check" className="w-5 h-5 text-primary-500" />
        Grade Explained
      </h2>

      <div className="flex gap-2 mb-6 flex-wrap">
        {GRADE_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveGrade(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${activeGrade === tab
              ? `${colors.activeBg} text-white border-transparent shadow-md`
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={`${colors.bg} ${colors.border} border rounded-xl px-4 py-3 mb-5 flex items-center gap-3`}>
        <span className={`w-2.5 h-2.5 rounded-full ${colors.dot} flex-shrink-0`} />
        <div>
          <span className={`text-sm font-bold ${colors.text}`}>Overall</span>
          <span className="text-sm text-gray-600 ml-2">– {grade.overall}</span>
        </div>
      </div>

      <div className="space-y-6">
        {grade.checks.map((check, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon icon="mdi:check-circle" className={`w-4 h-4 ${colors.text}`} />
              <span className="text-sm font-bold text-gray-800">{check.label}</span>
              <span className="text-xs text-gray-500">– {check.desc}</span>
            </div>

            {check.photos ? (
              <div className="flex flex-wrap gap-3 mt-2">
                {check.photos.map((p, j) => (
                  <PhotoCard key={j} photo={p} />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 items-start pl-6">
                <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon icon={check.icon} className={`w-5 h-5 ${colors.text}`} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <span className={`text-xs font-semibold ${colors.text} ${colors.bg} px-4 py-1.5 rounded-full ${colors.border} border`}>
          {grade.tagline}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════ */
export default function CategoryInfoSections({ categorySlug, categoryName }) {
  const deviceType = detectDeviceType(categorySlug, categoryName);

  return (
    <>
      <GradeExplained deviceType={deviceType} />
      <WhatComesWithPhone deviceType={deviceType} />
    </>
  );
}