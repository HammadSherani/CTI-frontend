import { sellerNav } from './seller/nav';
import { sellerPages } from './seller/pages';
import { refurbishNav } from './refurbish/nav';
import { refurbishPages } from './refurbish/pages';
import { repairmanNav } from './repairman/nav';
import { repairmanPages } from './repairman/pages';

// ─────────────────────────────────────────────────────────
// Central registry of documentation modules. Adding a new module
// later (Refurbish, Repairman, ...) means: create its nav.js +
// pages.js under src/data/docs/<module>/, import them here, and
// add one entry to this array with available: true. No layout or
// component code needs to change.
// ─────────────────────────────────────────────────────────
export const DOCS_MODULES = [
  {
    key: 'seller',
    title: 'Seller',
    tagline: 'Sell products on CTI',
    description: 'How to become a seller, add products, manage orders, and get paid.',
    icon: 'mdi:storefront-outline',
    color: 'primary',
    available: true,
    nav: sellerNav,
    pages: sellerPages,
  },
  {
    key: 'refurbish',
    title: 'Refurbish',
    tagline: 'Buy & sell refurbished devices',
    description: 'Documentation for the refurbished devices marketplace.',
    icon: 'mdi:cellphone-cog',
    color: 'sky',
    available: true,
    nav: refurbishNav,
    pages: refurbishPages,
  },
  {
    key: 'repairman',
    title: 'Repairman',
    tagline: 'Offer repair services',
    description: 'Documentation for the repair-service marketplace.',
    icon: 'mdi:wrench-outline',
    color: 'emerald',
    available: true,
    nav: repairmanNav,
    pages: repairmanPages,
  },
];

export function getModule(key) {
  return DOCS_MODULES.find((m) => m.key === key) || null;
}

export function getModulePage(key, slug) {
  const module = getModule(key);
  return module?.pages?.[slug] || null;
}

// Flat, ordered list of every page in a module — used for sidebar
// active-state, prev/next navigation, and search indexing.
export function getFlatPages(key) {
  const module = getModule(key);
  if (!module) return [];
  const flat = [];
  module.nav.forEach((section) => {
    section.items.forEach((item) => {
      flat.push({
        moduleKey: key,
        sectionTitle: section.title,
        slug: item.slug,
        title: item.title,
        description: module.pages[item.slug]?.description || '',
      });
    });
  });
  return flat;
}

export function getAdjacentPages(key, slug) {
  const flat = getFlatPages(key);
  const index = flat.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  };
}

// Search index across every available module (used by the global
// docs search box). Only titles/descriptions/section names are
// indexed — enough for a docs site this size without needing a
// search backend.
export function getSearchIndex() {
  return DOCS_MODULES.filter((m) => m.available).flatMap((m) =>
    getFlatPages(m.key).map((p) => ({ ...p, moduleTitle: m.title }))
  );
}
