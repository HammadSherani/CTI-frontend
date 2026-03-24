"use client";
import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export function AnimatedNumber({ value, duration = 2, suffix = "" }) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false); // prevent repeat

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          animate(motionValue, value, {
            duration,
            ease: "easeOut",
            onUpdate: (v) => setDisplay(Math.floor(v)),
          });
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 } // 50% of element visible triggers animation
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [value, hasAnimated]);

  return <span ref={ref}>{display.toLocaleString() + suffix}</span>;
}