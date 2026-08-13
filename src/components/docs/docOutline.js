// Plain utility (no 'use client') so server components can call it directly.
// Kept separate from DocContent.jsx, which is a client component — every
// export from a 'use client' file becomes a client-only reference, so a
// server component can't call a function exported from there.
export function getPageOutline(blocks = []) {
  return blocks.filter((b) => b.type === 'heading' && b.id).map((b) => ({ id: b.id, text: b.text }));
}
