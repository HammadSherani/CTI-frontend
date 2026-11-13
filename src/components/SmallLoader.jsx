"use client"
import { createPortal } from 'react-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function SmallLoader({ loading, text = "Loading..." }) {
  if (!loading) return null;
  if (typeof document === 'undefined') return null;

  // Rendered through a portal on <body> so it escapes any parent stacking
  // context (e.g. the sticky header) and always sits above floating widgets
  // like the AI assistant.
  return createPortal(
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(6px)",
      zIndex: 2147483000,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    }}>
      <DotLottieReact
        src="/assets/cti-loader.json"
        loop
        autoplay
        style={{ width: 150, height: 150 }}
      />
      {text && (
        <p style={{ fontSize: 14, color: "#f97316", fontWeight: 500 }}>
          {text}
        </p>
      )}
    </div>,
    document.body
  );
}

export default SmallLoader;
