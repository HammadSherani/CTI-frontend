'use client';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import WhatComesWithPhone from './Whatcomeswithphone';

function detectDeviceType(categorySlug, categoryName) {
  const slug = (categorySlug || '').toLowerCase();
  const name = (categoryName || '').toLowerCase();

  if (slug.includes('phone') || slug.includes('mobile') || slug.includes('cell') || name.includes('phone') || name.includes('mobile')) return 'phone';
  if (slug.includes('laptop') || slug.includes('notebook') || name.includes('laptop') || name.includes('notebook')) return 'laptop';
  if (slug.includes('tablet') || slug.includes('ipad') || name.includes('tablet')) return 'tablet';

  return 'phone';
}

const GRADE_TABS = ['Superb', 'Good', 'Fair', 'Best Value'];

const DEVICE_DATA = {
  phone: {
    Superb: {
      overall: 'No functional defects',
      checks: [
        {
          label: 'Screen Glass',
          desc: 'Minimal scratches only visible when the screen is off.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/SUPERB/1.jfif',
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/SUPERB/2.jfif',
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/SUPERB/3.jfif',
          ],
        },
        {
          label: 'Display',
          desc: 'Bright, sharp panel with no dead pixels or burn-in.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/SUPERB/4.jfif',
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/5.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Light cosmetic wear only, with clean edges and camera housing.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/1.jfif',
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/2.jfif',
          ],
        },
      ],
    },
    Good: {
      overall: 'Fully functional and reliable',
      checks: [
        {
          label: 'Screen Glass',
          desc: 'Light scratches visible when the screen is off but not during use.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/1.jfif',
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/2.jfif',
          ],
        },
        {
          label: 'Display',
          desc: 'Perfectly working panel with no major defects.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/3.jfif',
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/4.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Normal signs of use with minor scuffs or dents.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/5.jfif',
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/6.jfif',
          ],
        },
      ],
    },
    Fair: {
      overall: 'All features working',
      checks: [
        {
          label: 'Screen',
          desc: 'Noticeable scratches are present but the display remains usable.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/FAIR/1.jfif',
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/FAIR/2.jfif',
          ],
        },
        {
          label: 'Display',
          desc: 'Functional and readable with acceptable cosmetic marks.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/4.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Visible wear with scratches, dents, or edge damage.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/FAIR/2.jfif',
          ],
        },
      ],
    },
    'Best Value': {
      overall: 'Functional with visible wear',
      checks: [
        {
          label: 'Screen',
          desc: 'Visible marks but still touch and display working properly.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/FAIR/1.jfif',
          ],
        },
        {
          label: 'Display',
          desc: 'Works correctly with minor cosmetic imperfections.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/3.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Heavy cosmetic wear but still fully reliable for daily use.',
          images: [
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/FAIR/2.jfif',
            '/assets/refurbish/Refurbished%20images/MOBILE%20PHONE/GOOD/5.jfif',
          ],
        },
      ],
    },
  },

  laptop: {
    Superb: {
      overall: 'No functional defects',
      checks: [
        {
          label: 'Display',
          desc: 'Clean screen with no dead pixels or panel issues.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/SUPERB/1.jfif',
            '/assets/refurbish/Refurbished%20images/LAPTOP/SUPERB/2.jfif',
          ],
        },
        {
          label: 'Keyboard',
          desc: 'Responsive keys with no faded legends or stuck buttons.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/SUPERB/3.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Minimal cosmetic wear with a solid chassis.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/SUPERB/4.jfif',
          ],
        },
      ],
    },
    Good: {
      overall: 'Fully functional',
      checks: [
        {
          label: 'Display',
          desc: 'Minor marks only visible on dark backgrounds.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/GOOD/1.jfif',
          ],
        },
        {
          label: 'Keyboard',
          desc: 'All keys work correctly with normal wear.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/GOOD/2.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Small scratches and moderate signs of use.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/GOOD/3.jfif',
          ],
        },
      ],
    },
    Fair: {
      overall: 'All features working',
      checks: [
        {
          label: 'Display',
          desc: 'Visible marks but still usable for daily tasks.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/FAIR/1.jfif',
          ],
        },
        {
          label: 'Keyboard',
          desc: 'Visible key wear but full functionality remains.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/FAIR/2.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Noticeable scratches and dents on the chassis.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/FAIR/3.jfif',
          ],
        },
      ],
    },
    'Best Value': {
      overall: 'Functional with visible wear',
      checks: [
        {
          label: 'Display',
          desc: 'Still works well with cosmetic wear.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/FAIR/1.jfif',
          ],
        },
        {
          label: 'Keyboard',
          desc: 'Heavy use but still operational.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/GOOD/2.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Heavy cosmetic wear but useful for budget buyers.',
          images: [
            '/assets/refurbish/Refurbished%20images/LAPTOP/FAIR/2.jfif',
          ],
        },
      ],
    },
  },

  tablet: {
    Superb: {
      overall: 'No functional defects',
      checks: [
        {
          label: 'Screen',
          desc: 'Clean display with no major visual defects.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/SUPERB/1.jfif',
            '/assets/refurbish/Refurbished%20images/TABLET/SUPERB/2.jfif',
          ],
        },
        {
          label: 'Touch',
          desc: 'Responsive touch across the full screen.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/SUPERB/3.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Very light cosmetic wear and clean finish.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/SUPERB/4.jfif',
          ],
        },
      ],
    },
    Good: {
      overall: 'Fully functional',
      checks: [
        {
          label: 'Screen',
          desc: 'Light marks visible only in certain lighting.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/GOOD/1.jfif',
          ],
        },
        {
          label: 'Touch',
          desc: 'Strong response with no major issues.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/GOOD/2.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Minor scuffs on the edges and back panel.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/GOOD/3.jfif',
          ],
        },
      ],
    },
    Fair: {
      overall: 'All features working',
      checks: [
        {
          label: 'Screen',
          desc: 'Noticeable marks but still comfortable to use.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/FAIR/1.jfif',
          ],
        },
        {
          label: 'Touch',
          desc: 'Touch remains functional with normal wear.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/FAIR/2.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Visible signs of use on bezels and back shell.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/FAIR/3.jfif',
          ],
        },
      ],
    },
    'Best Value': {
      overall: 'Functional with visible wear',
      checks: [
        {
          label: 'Screen',
          desc: 'Visible scruffs but still very usable.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/FAIR/1.jfif',
          ],
        },
        {
          label: 'Touch',
          desc: 'The screen responds well for everyday usage.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/GOOD/2.jfif',
          ],
        },
        {
          label: 'Body',
          desc: 'Strong cosmetic wear but fully usable at lower cost.',
          images: [
            '/assets/refurbish/Refurbished%20images/TABLET/FAIR/2.jfif',
          ],
        },
      ],
    },
  },
};

function GradeExplained({ deviceType }) {
  const [activeGrade, setActiveGrade] = useState('Superb');
  const grades = DEVICE_DATA[deviceType] || DEVICE_DATA.phone;
  const grade = grades[activeGrade];

  if (!grade) return null;

  return (
    <div className="bg-gray-50 rounded-3xl p-4 md:p-6">
      <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
        <Icon icon="mdi:star-check" className="w-5 h-5 text-primary-500" />
        Grade Explained
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {GRADE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveGrade(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              activeGrade === tab
                ? 'bg-primary-500 text-white border-transparent shadow-md'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="border border-primary-200 bg-primary-50 rounded-xl px-4 py-3 mb-5">
        <span className="text-sm font-bold text-primary-700">Overall</span>
        <span className="text-sm text-gray-600 ml-2">– {grade.overall}</span>
      </div>

      <div className="space-y-6">
        {grade.checks.map((check, index) => (
          <div key={`${check.label}-${index}`}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-gray-800">{check.label}</span>
              <span className="text-xs text-gray-500">– {check.desc}</span>
            </div>

            {check.images?.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {check.images.map((src, imgIndex) => (
                  <div key={`${src}-${imgIndex}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white w-36 sm:w-40 shadow-sm">
                    <img src={src} alt={check.label} className="w-full h-28 object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoryInfoSections({ categorySlug, categoryName }) {
  const deviceType = detectDeviceType(categorySlug, categoryName);

  return (
    <>
      <GradeExplained deviceType={deviceType} />
      <WhatComesWithPhone deviceType={deviceType} />
    </>
  );
}
