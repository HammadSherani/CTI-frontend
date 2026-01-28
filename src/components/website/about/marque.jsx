'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const CreativeMarquee = () => {
  const containerRef = useRef(null);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smooth spring animation for scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Transform scroll into rotation and scale
  const rotate = useTransform(smoothProgress, [0, 1], [0, 360]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

  // Marquee content arrays with creative phrases
  const marqueeItems1 = [
    { text: '⚡ INNOVATION', color: 'from-cyan-400 to-blue-500' },
    { text: '🚀 CREATIVITY', color: 'from-purple-400 to-pink-500' },
    { text: '✨ EXCELLENCE', color: 'from-amber-400 to-orange-500' },
    { text: '🎯 PRECISION', color: 'from-green-400 to-emerald-500' },
    { text: '💎 QUALITY', color: 'from-rose-400 to-red-500' },
    { text: '🌟 BRILLIANCE', color: 'from-indigo-400 to-violet-500' },
  ];

  const marqueeItems2 = [
    { text: 'NEXT.JS', icon: '⚛️', color: 'from-slate-700 to-slate-900' },
    { text: 'FRAMER MOTION', icon: '🎬', color: 'from-fuchsia-600 to-purple-600' },
    { text: 'TAILWIND CSS', icon: '🎨', color: 'from-sky-500 to-cyan-600' },
    { text: 'TYPESCRIPT', icon: '📘', color: 'from-blue-600 to-indigo-600' },
    { text: 'REACT', icon: '⚡', color: 'from-cyan-500 to-blue-600' },
    { text: 'MODERN WEB', icon: '🌐', color: 'from-emerald-500 to-teal-600' },
  ];

  // Duplicate arrays for seamless loop
  const extendedItems1 = [...marqueeItems1, ...marqueeItems1, ...marqueeItems1];
  const extendedItems2 = [...marqueeItems2, ...marqueeItems2, ...marqueeItems2];

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20 md:py-32"
    >
      {/* Animated background grid */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '60px 60px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating orbs with scroll animation */}
      <motion.div
        className="absolute top-20 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20"
        style={{ scale, opacity }}
      />
      <motion.div
        className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20"
        style={{ scale, rotate }}
      />

      {/* Section Title with scroll animation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-16 relative z-10"
      >
        <motion.h2 
          className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        >
          CREATIVE FLOW
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-slate-400 text-lg md:text-xl font-light tracking-wider"
        >
          Infinite Motion • Endless Possibilities
        </motion.p>
      </motion.div>

      {/* First Marquee - Left to Right */}
      <div className="relative mb-8 md:mb-12">
        <motion.div
          initial={{ x: '0%' }}
          animate={{ x: '-33.333%' }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex gap-6 md:gap-8 whitespace-nowrap"
        >
          {extendedItems1.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                transition: { duration: 0.2 } 
              }}
              className="relative group cursor-pointer"
            >
              <motion.div
                className={`
                  px-8 md:px-12 py-6 md:py-8 
                  bg-gradient-to-r ${item.color}
                  rounded-2xl md:rounded-3xl
                  shadow-2xl
                  relative overflow-hidden
                  border border-white/20
                `}
                whileHover={{
                  boxShadow: '0 0 40px rgba(255,255,255,0.3)',
                }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                
                <span className="relative text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg tracking-tight">
                  {item.text}
                </span>

                {/* Particle effect on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [-20, -60],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Divider with animation */}
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-8 md:mb-12"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Second Marquee - Right to Left with Scroll Speed Control */}
      <motion.div
        className="relative"
        style={{
          filter: useTransform(smoothProgress, [0, 0.5, 1], [
            'hue-rotate(0deg)',
            'hue-rotate(180deg)',
            'hue-rotate(360deg)'
          ]),
        }}
      >
        <motion.div
          initial={{ x: '-33.333%' }}
          animate={{ x: '0%' }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex gap-6 md:gap-8 whitespace-nowrap"
        >
          {extendedItems2.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ 
                scale: 1.15,
                rotate: -5,
                transition: { type: 'spring', stiffness: 300 }
              }}
              className="relative group cursor-pointer"
            >
              <motion.div
                className={`
                  px-8 md:px-12 py-6 md:py-8
                  bg-gradient-to-br ${item.color}
                  rounded-2xl md:rounded-3xl
                  shadow-2xl
                  relative overflow-hidden
                  border-2 border-white/10
                  backdrop-blur-sm
                `}
                whileHover={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  boxShadow: '0 0 60px rgba(139, 92, 246, 0.5)',
                }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Icon and Text */}
                <div className="relative flex items-center gap-4">
                  <motion.span
                    className="text-4xl md:text-6xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {item.icon}
                  </motion.span>
                  <span className="text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl tracking-tight">
                    {item.text}
                  </span>
                </div>

                {/* Glow effect */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0 blur-xl opacity-0 group-hover:opacity-100"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom decorative line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />
    </div>
  );
};

export default CreativeMarquee;