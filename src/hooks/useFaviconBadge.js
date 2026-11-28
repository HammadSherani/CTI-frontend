'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const SIZE = 64;

const iconLinks = () =>
  typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll('link[rel~="icon"]'));

/** Draws the site icon with a red dot in the top-right corner. Resolves to a data URL. */
function drawBadgedIcon(src) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    const finish = () => {
      // red dot with a white ring so it stays visible on dark and light tab bars
      ctx.beginPath();
      ctx.arc(SIZE - 15, 15, 14, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(SIZE - 15, 15, 11, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      try {
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    if (!src) return finish();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
      } catch {
        /* icon could not be drawn: dot only */
      }
      finish();
    };
    img.onerror = finish;
    img.src = src;
  });
}

/**
 * Shows a red dot on the browser tab icon while `active` is true (e.g. unread admin
 * notifications) and puts the normal icon back when it turns false.
 */
export default function useFaviconBadge(active) {
  const pathname = usePathname();
  const original = useRef(null); // href of each icon link before we changed it

  useEffect(() => {
    const links = iconLinks();
    if (!links.length) return undefined;
    if (!original.current || links.some((l) => !original.current.has(l))) {
      const map = original.current || new Map();
      for (const l of links) {
        if (!map.has(l) && !String(l.href).startsWith('data:')) map.set(l, l.href);
      }
      original.current = map;
    }

    let cancelled = false;
    if (active) {
      const base = original.current.get(links[0]) || links[0].href;
      drawBadgedIcon(String(base).startsWith('data:') ? null : base).then((url) => {
        if (cancelled || !url) return;
        for (const l of iconLinks()) l.href = url;
      });
    } else {
      for (const l of links) {
        const href = original.current.get(l);
        if (href) l.href = href;
      }
    }
    return () => {
      cancelled = true;
    };
  }, [active, pathname]); // Next can re-create the icon links on navigation

  // Leaving the admin area: put the normal icon back
  useEffect(() => () => {
    for (const [l, href] of original.current || []) l.href = href;
  }, []);
}
