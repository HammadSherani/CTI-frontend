'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';

export default function AcademyMarquee() {
  const containerRef = useRef(null);
   const router=useRouter()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.4, 1, 1, 0.4]
  );

  // Academy courses
  const courses = [
    {
      text: 'Web Development',
      icon: 'mdi:code-tags',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      text: 'UI / UX Design',
      icon: 'mdi:palette-outline',
      color: 'from-purple-500 to-pink-500',
    },
    {
      text: 'Data Science',
      icon: 'mdi:chart-bar',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      text: 'Mobile Applications',
      icon: 'mdi:cellphone',
      color: 'from-orange-500 to-red-500',
    },
    {
      text: 'Digital Marketing',
      icon: 'mdi:trending-up',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      text: 'Cloud Computing',
      icon: 'mdi:cloud-outline',
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  const skills = [
    'HTML & CSS',
    'JavaScript',
    'React.js',
    'Python',
    'SQL',
    'Git & GitHub',
    'Figma',
    'Photoshop',
    'Node.js',
    'TypeScript',
  ];

  const extendedCourses = [...courses, ...courses, ...courses];
  const extendedSkills = [...skills, ...skills, ...skills];

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 md:py-16"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-10 text-center px-4"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2">
          Master the Skills You Need
        </h2>
        <p className="text-slate-600 text-sm md:text-base">
          Explore our comprehensive course catalog
        </p>
      </motion.div>

      {/* Courses Marquee */}
      <div className="relative mb-6">
        <motion.div
          animate={{ x: [0, '-33.333%'] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex gap-4 md:gap-6"
        >
          {extendedCourses.map((course, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex-shrink-0 cursor-pointer"
            >
              <div
                className={`
                  px-6 py-3 md:px-8 md:py-4
                  bg-gradient-to-br ${course.color}
                  rounded-xl
                  shadow-lg hover:shadow-xl
                  transition-shadow duration-300
                  border border-white/20
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    icon={course.icon}
                    className="text-white"
                    width={28}
                    height={28}
                  />
                  <span className="text-base md:text-lg font-semibold text-white whitespace-nowrap">
                    {course.text}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Divider */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-6" />

      {/* Skills Marquee */}
      <motion.div className="relative" style={{ opacity }}>
        <motion.div
          animate={{ x: ['-33.333%', 0] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex gap-3 md:gap-4"
        >
          {extendedSkills.map((skill, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className="
                flex-shrink-0
                px-5 py-2 md:px-6 md:py-2.5
                bg-white
                border border-slate-200
                rounded-full
                shadow-sm hover:shadow-md
                transition-all duration-300
                cursor-pointer
              "
            >
              <span className="text-sm md:text-base font-medium text-slate-700 whitespace-nowrap">
                {skill}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 mt-10 text-center"
      
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={()=>router.push("/academy/academy-listing")}
          className="
            px-8 py-3
            bg-gradient-to-r from-blue-600 to-cyan-600
            text-white font-semibold
            rounded-full
            shadow-lg hover:shadow-xl
            transition-shadow duration-300
          "
        >
          View All Courses
        </motion.button>
      </motion.div>
    </div>
  );
};




 