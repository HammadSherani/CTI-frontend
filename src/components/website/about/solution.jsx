import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const SolutionSection = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const headingVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.h1
            variants={headingVariants}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
          >
            Be a part of Solution <span className="inline-block">not Pollution</span>
          </motion.h1>
          <motion.h2
            variants={headingVariants}
            className="text-xl sm:text-2xl lg:text-3xl text-white/95 font-medium"
          >
            When you reuse just one phone:
          </motion.h2>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
        >
          {/* Left Column - Two Stacked Cards */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Card 1 - Water Saving */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden flex-1 min-h-[300px] sm:min-h-[350px] lg:min-h-0"
            >
              <div className="p-6 sm:p-8 lg:p-10 h-full flex flex-col">
                <motion.div
                  variants={headingVariants}
                  className="mb-6"
                >
                  <h3 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold text-gray-900 text-center leading-tight">
                    You save{' '}
                    <span className="text-primary-500 inline-block">909 liters of water</span>{' '}
                    & save people from staying thirsty for 100 years
                  </h3>
                </motion.div>

                <motion.div
                  variants={imageVariants}
                  className="flex-1 flex items-center justify-center mt-auto"
                >
                  <div className="relative w-full max-w-sm aspect-[5/3]">
                    <Image
                      src="/assets/about/9.avif"
                      fill
                      alt="Water saving illustration"
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Card 2 - Energy Saving */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden flex-1 min-h-[300px] sm:min-h-[350px] lg:min-h-0"
            >
              <div className="p-6 sm:p-8 lg:p-10 h-full flex flex-col">
                <motion.div
                  variants={headingVariants}
                  className="mb-6"
                >
                  <h3 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold text-gray-900 text-center leading-tight">
                    You save{' '}
                    <span className="text-primary-500 inline-block">72 kWh of energy</span>{' '}
                    & power homes for weeks
                  </h3>
                </motion.div>

                <motion.div
                  variants={imageVariants}
                  className="flex-1 flex items-start justify-center z-40 "
                >
                  <div className="relative w-full  max-w-sm aspect-[5/3]">
                    <Image
                      src="/assets/about/8.avif"
                      fill
                      alt="Energy saving illustration"
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Large Feature Card */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-0"
          >
            <div className="p-6 sm:p-8 lg:p-10 h-full flex flex-col">
              <motion.div
                variants={headingVariants}
                className="mb-6"
              >
                <h3 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold text-gray-900 text-center leading-tight mb-4">
                  You save{' '}
                  <span className="text-primary-500 inline-block">909 liters of water</span>{' '}
                  & save people from staying thirsty for 100 years
                </h3>
                <p className="text-base sm:text-lg lg:text-xl text-gray-700 text-center font-normal leading-relaxed">
                  Every phone reused prevents toxic waste from polluting our environment and conserves precious natural resources for future generations.
                </p>
              </motion.div>

              <motion.div
                variants={imageVariants}
                className="flex-1 flex items-start justify-center -mt-20"
              >
                <div className="relative w-full h-full min-h-[300px] sm:min-h-[350px]">
                  <Image
                    src="/assets/about/7a.png"
                    fill
                    alt="Environmental impact illustration"
                    className="object-cover "
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Optional: Stats Counter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 sm:mt-16 lg:mt-20 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16 text-white">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">10K+</div>
              <div className="text-sm sm:text-base lg:text-lg opacity-90">Phones Reused</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">9M+</div>
              <div className="text-sm sm:text-base lg:text-lg opacity-90">Liters Water Saved</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">720K+</div>
              <div className="text-sm sm:text-base lg:text-lg opacity-90">kWh Energy Saved</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionSection;