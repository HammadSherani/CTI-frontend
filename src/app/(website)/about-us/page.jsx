"use client"
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';
import History from '@/components/website/about/history';
import SolutionSection from '@/components/website/about/solution';
import TeamSection from '@/components/website/about/teamMembers';

function About() {
  const marqueeText = "BUY. REPAIR. SELL. REFURBISH. REUSE. REPEAT.";

  const promises = [
    {
      icon: 'akar-icons:check',
      title: "Fair Value",
      description: "We guarantee the most competitive prices for your devices, ensuring you get fair market value."
    },
    {
      icon: 'mdi:leaf',
      title: "Sustainability First",
      description: "Every device refurbished saves 61kg of CO2 emissions and prevents e-waste from landfills."
    },
    {
      icon: 'mdi:heart',
      title: "Quality Assured",
      description: "Rigorous testing and certification ensure every device meets our premium quality standards."
    },
    {
      icon: 'mdi:flash',
      title: "Quick & Easy",
      description: "Doorstep pickup, hassle-free selling, and instant payment in just 3 simple steps."
    }
  ];


  const principles = [
    {
      number: "01",
      title: "Transparency",
      description: "We believe in complete transparency. No hidden costs, no surprise charges. What you see is what you get."
    },
    {
      number: "02",
      title: "Responsibility",
      description: "We take responsibility for every device. From collection to recycling, we ensure ethical handling."
    },
    {
      number: "03",
      title: "Innovation",
      description: "Constantly innovating to find new ways to extend device lifespans and reduce environmental impact."
    },
    {
      number: "04",
      title: "Community",
      description: "Building a community of conscious consumers who believe technology should be accessible and sustainable."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Section 1 - Hero with gradient background */}
      <section className="relative !z-10 w-full overflow-hidden bg-gradient-to-r from-primary-400 to-primary-600 text-white ">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[90vh]">

          {/* Left Content */}
          <div className="flex !z-10 flex-col justify-center px-6 md:px-12 lg:px-10 xl:px-10 py-16 lg:py-24">
            <motion.span 
              className="inline-block mb-4 text-sm font-semibold uppercase tracking-widest text-white/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Sustainability & Innovation
            </motion.span>

            <motion.h1 
              className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Reuse & Reduce
            </motion.h1>

            <motion.h2 
              className="text-xl md:text-2xl font-semibold mb-6 text-white/95"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Our grandparents lived a sustainable life — long before sustainability was even a concept.
            </motion.h2>

            <motion.p 
              className="text-base md:text-lg leading-relaxed text-white/90 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Let's mindfully bring sustainable choices back into our modern lifestyle, starting with technology for a better future.
            </motion.p>
          </div>

          {/* Right Image */}
          <div className="relative h-[50vh] lg:h-full">
            <Image
              src="/assets/about/1.avif"
              width={700}
              height={700}
              alt="Sustainable living"
              className="w-full h-full object-cover"
              priority
            />
          </div>

        </div>
      </section>

      {/* Marquee Section */}
      <section className="w-full overflow-hidden py-6 ">
        <div className="relative">
          <motion.div
            className="whitespace-nowrap text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900"
            aria-hidden
            animate={{ x: ['100%', '-100%'] }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
            style={{ willChange: 'transform' }}
          >
            <span className="px-6">{marqueeText}</span>
            <span className="px-6">{marqueeText}</span>
            <span className="px-6">{marqueeText}</span>
          </motion.div>
        </div>
      </section>

      {/* Section 2 - Our Passion */}
      <section className="relative h-screen z-30 w-full overflow-hidden bg-white text-gray-900">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 p-10 ">

          {/* Left Image */}
          <div className="relative !z-30 order-2 lg:order-1">
            <Image
              src="/assets/about/2.avif"
              width={700}
              height={700}
              alt="Our passion"
              className="w-full h-[80%] object-cover rounded-lg"
              priority
            />
          </div>

          {/* Right Content */}
          <div className="flex flex-col justify-start px-6 md:px-12 lg:px-16 xl:px-24 py-16 lg:py-24 order-1 lg:order-2">
            <motion.span 
              className="inline-block mb-4 text-sm font-semibold uppercase tracking-widest text-primary-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              OUR PASSION
            </motion.span>

            <motion.h1 
              className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Building a world where tech doesn't need to cost the pocket or the planet.
            </motion.h1>

            <motion.p 
              className="text-base md:text-lg leading-relaxed text-gray-700 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              To change the lifecycle of every gadget by redefining what we choose to do with it.
            </motion.p>
          </div>

          {/* Rotating Floating Image */}
          <motion.div
            className="absolute right-6 bottom-10 w-24 h-24 lg:w-32 lg:h-32 z-30"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "linear",
            }}
          >
            <Image
              src="/assets/about/3.avif"
              fill
              alt="Rotating element"
              className="object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* Section 3 - OUR PROMISE */}
      <section className="relative w-full py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-widest text-primary-400">
              OUR COMMITMENT
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Our Promise</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We promise to make sustainable technology accessible, affordable, and effortless for everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promises.map((promise, index) => (
              <motion.div
                key={index}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Icon icon={promise.icon} width={20} height={20} className="text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{promise.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{promise.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

       {/* Section 4 - Our Passion */}
      <section className="relative z-30 w-full p-10 overflow-hidden bg-white text-gray-900">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[90vh]">

          {/* Left Image */}
  <div className="flex flex-col justify-start px-6 md:px-12 lg:px-16 xl:px-24 py-16 lg:py-24 ">
            <motion.span 
              className="inline-block mb-4 text-sm font-semibold uppercase tracking-widest text-primary-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              OUR PASSION
            </motion.span>

            <motion.h1 
              className="text-2xl md:text-3xl xl:text-4xl font-semibold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
Adding “right way” to business for the planet and the people who live on it.            </motion.h1>

            <motion.p 
              className="text-base md:text-lg leading-relaxed text-gray-700 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              To change the lifecycle of every gadget by redefining what we choose to do with it.
            </motion.p>
          </div>
          {/* Right Content */}
          
        <div className=" ">
            <Image
              src="/assets/about/5.avif"
              width={700}
              height={700}
              alt="Our passion"
              className="w-full h-[80%] rounded-xl object-cover  "
              priority
            />
          </div>

          {/* Rotating Floating Image */}
          <motion.div
            className="absolute left-6 bottom-10 w-24 h-24 lg:w-32 lg:h-32 z-30"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "linear",
            }}
          >
            <Image
              src="/assets/about/6.avif"
              fill
              alt="Rotating element"
              className="object-contain"
            />
          </motion.div>
        </div>
      </section>


      {/* OUR HISTORY (Stepper) */}
      <section className="container mx-auto px-6 py-16">
       
        <div>
          <History />
        </div>
      </section>

 
       {/* Section 4 - OUR PRINCIPLES */}
      <section className="relative w-full py-20  bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-400">
              OUR FOUNDATION
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Our Principles</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              These core values guide every decision we make and shape our vision for the future.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {principles.map((principle, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-400/15 border-2 border-primary-400">
                      <span className="text-3xl font-bold text-primary-400">{principle.number}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">{principle.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{principle.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



<div>

  <SolutionSection />
</div>

{/* <div className="">
  <CreativeMarquee/>
</div> */}

<div>
<TeamSection/>
</div>



    

    </div>
  );
}

export default About;