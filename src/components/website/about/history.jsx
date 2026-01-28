"use client"
import Image from 'next/image';
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from '@iconify/react';

function History() {
  const [activeIndex, setActiveIndex] = useState(0);

  const timelineData = [
    {
      year: "2019",
      title: "The Beginning",
      description: "We founded our company with a simple vision: to make sustainable technology accessible to everyone. Starting with a small team of passionate individuals, we began collecting and refurbishing old devices.",
      icon: 'mdi:cellphone-iphone',
      highlight: "Started our journey",
      stats: "1 Store",
      color: "primary"
    },
    {
      year: "2020",
      title: "Going Digital",
      description: "Launched our online platform, enabling customers to sell devices from the comfort of their homes. We implemented cutting-edge technology for device valuation and introduced doorstep pickup services.",
      icon: 'mdi:web',
      highlight: "Launched mobile app",
      stats: "10K+ Users",
      color: "primary"
    },
    {
      year: "2021",
      title: "Rapid Expansion",
      description: "Expanded to multiple cities across the country. Established partnerships with major electronics manufacturers and opened our first 5 physical stores. Our team grew from 10 to 50 members.",
      icon: 'mdi:account-group',
      highlight: "5 Physical Stores",
      stats: "50+ Employees",
      color: "primary"
    },
    {
      year: "2022",
      title: "Industry Recognition",
      description: "Received multiple awards for our sustainability initiatives. Refurbished over 1 million devices, preventing 61 million kg of CO2 emissions. Became the trusted choice for eco-conscious consumers.",
      icon: 'mdi:trophy',
      highlight: "1M+ Devices",
      stats: "5 Awards Won",
      color: "primary"
    },
    {
      year: "2023",
      title: "Game Changer",
      description: "Introduced AI-powered device valuation system for instant quotes. Expanded to 15 major cities with 50+ stores. Launched our premium refurbished phone brand with certified guarantee.",
      icon: 'mdi:flash',
      highlight: "AI Valuation Launch",
      stats: "15+ Cities",
      color: "primary"
    },
    {
      year: "2024",
      title: "The Future is Now",
      description: "Reached 1 million active users. Introduced blockchain-based device authentication for complete transparency. Partnering with global retailers to make sustainable tech the norm, not the exception.",
      icon: 'mdi:earth',
      highlight: "1M+ Active Users",
      stats: "Global Presence",
      color: "primary"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const getColorClasses = (color) => {
    // unified primary theme mapping for production-level look
    const colors = {
      primary: { bg: 'bg-primary-400', light: 'bg-primary-50', border: 'border-primary-300', text: 'text-primary-600', gradient: 'from-primary-400 to-primary-600' }
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="relative w-full rounded-lg overflow-hidden bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-white py-10">
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl" />
        </motion.div>

        <div className="relative z-10 container mx-auto  px-6 text-center">
          <motion.span 
            className="inline-block mb-4 text-sm font-semibold uppercase tracking-widest text-primary-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Our Storys
          </motion.span>

          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            From Zero to Hero
          </motion.h1>

          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            A journey of innovation, sustainability, and commitment to changing how the world thinks about technology.
          </motion.p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative w-full py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left - Timeline Navigation */}
            <motion.div 
              className="lg:col-span-1"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="sticky top-32 space-y-3">
                {timelineData.map((item, index) => {
                  const colors = getColorClasses(item.color);
                  return (
                    <motion.button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        activeIndex === index
                          ? `${colors.bg} text-white shadow-lg`
                          : `bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-300`
                      }`}
                      variants={itemVariants}
                      whileHover={{ x: 10 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{item.year}</span>
                        <div className="flex-1">
                          <p className="font-semibold">{item.title}</p>
                          <p className={`text-sm ${activeIndex === index ? 'text-white/80' : 'text-gray-500'}`}>
                            {item.highlight}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Right - Timeline Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  {(() => {
                    const item = timelineData[activeIndex];
                    const Icon = item.icon;
                    const colors = getColorClasses(item.color);

                    return (
                      <div className={`rounded-3xl p-8 md:p-12 ${colors.light} border-2 ${colors.border}`}>
                        
                        {/* Icon and Year */}
                        <div className="flex items-start justify-between mb-8">
                          <div>
                            <motion.div 
                              className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-6`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <Icon icon={item.icon} width={28} height={28} className="text-white" />
                            </motion.div>
                            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900">
                              {item.year}
                            </h2>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${colors.text}`}>
                              {item.stats}
                            </p>
                          </div>
                        </div>

                        {/* Content */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="text-4xl font-bold text-gray-900 mb-4">
                            {item.title}
                          </h3>
                          <p className="text-lg text-gray-700 leading-relaxed mb-8">
                            {item.description}
                          </p>

                          {/* Highlight Badge */}
                          <motion.div 
                            className={`inline-flex items-center gap-3 px-6 py-3 ${colors.bg} text-white rounded-full font-semibold`}
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className="w-2 h-2 bg-white rounded-full" />
                            {item.highlight}
                          </motion.div>
                        </motion.div>

                        {/* Navigation Arrows */}
                        <div className="flex gap-3 mt-12">
                          <motion.button
                            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                            disabled={activeIndex === 0}
                            className={`p-3 rounded-lg transition-all ${
                              activeIndex === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : `${colors.bg} text-white hover:scale-110`
                            }`}
                            whileHover={{ scale: activeIndex !== 0 ? 1.1 : 1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Icon icon="akar-icons:chevron-left" width={18} height={18} />
                          </motion.button>
                          <motion.button
                            onClick={() => setActiveIndex(Math.min(timelineData.length - 1, activeIndex + 1))}
                            disabled={activeIndex === timelineData.length - 1}
                            className={`p-3 rounded-lg transition-all ${
                              activeIndex === timelineData.length - 1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : `${colors.bg} text-white hover:scale-110`
                            }`}
                            whileHover={{ scale: activeIndex !== timelineData.length - 1 ? 1.1 : 1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Icon icon="akar-icons:chevron-right" width={18} height={18} />
                          </motion.button>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Progress Indicator */}
          <motion.div 
            className="mt-12 bg-white rounded-full p-1 shadow-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex gap-1">
              {timelineData.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                      : 'bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  layout
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      


    </div>
  );
}

export default History;