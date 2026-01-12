import React from 'react'
import { motion } from 'framer-motion'
import seller from '../../../../public/assets/icons/seller.png'
import mechanic from '../../../../public/assets/icons/mechanic.png'
import Image from 'next/image'

function BecomePartner() {
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const headingVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto px-8 py-16 bg-primary-50/50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      
      {/* Heading */}
      <motion.div 
        className="text-center mb-14"
        variants={headingVariants}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          variants={headingVariants}
        >
          Become a Partner
        </motion.h2>
        <motion.p 
          className="text-gray-600 max-w-2xl mx-auto"
          variants={headingVariants}
        >
          Join our platform as a service provider or seller and grow your
          business with thousands of customers.
        </motion.p>
      </motion.div>

      {/* Sections */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        {/* Repairman Partner */}
        <motion.div
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 relative  group"
          variants={itemVariants}
        //   whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Content */}
          <div className="relative z-10 max-w-md pr-32">
            <motion.h3 
              className="text-xl md:text-3xl font-bold text-gray-900 mb-2"
              initial={{ x: -20 }}
              whileInView={{ x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Repairman Partner
            </motion.h3>

            <motion.p 
              className="text-gray-600 text-[15px] mb-8"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Offer your repair and maintenance services to nearby customers.
              Get more jobs, manage bookings easily, and grow your income with
              trusted visibility on our platform.
            </motion.p>

            <motion.button 
              className="text-gray-900 font-semibold text-lg hover:text-primary-600 transition border-b-2 border-gray-900 hover:border-primary-600 pb-1"
            //   whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              Join Now
            </motion.button>
          </div>

          {/* Background Image */}
          <motion.div 
            className="absolute -top-10 -right-6 w-60 h-60 opacity-80 pointer-events-none"
            initial={{ scale: 0.8, rotate: -5 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Image 
              src={mechanic}
              alt="Mechanic Image"
              width={1000}
              height={1000}
              className="w-full h-full object-contain rounded-full"
            />
          </motion.div>

          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Seller Partner */}
        <motion.div
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 relative  group"
          variants={itemVariants}
        //   whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Content */}
          <div className="relative z-10 max-w-md pr-32">
            <motion.h3 
              className="text-xl md:text-3xl font-bold text-gray-900 mb-2"
              initial={{ x: -20 }}
              whileInView={{ x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Seller Partner
            </motion.h3>

            <motion.p 
              className="text-gray-600 text-[15px] mb-8"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Sell your products online with ease. Reach more customers,
              manage orders in one place, and scale your business without
              worrying about technical setup.
            </motion.p>

            <motion.button 
              className="text-gray-900 font-semibold text-lg hover:text-primary-600 transition border-b-2 border-gray-900 hover:border-primary-600 pb-1"
            //   whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              Join Now
            </motion.button>
          </div>

          <motion.div 
            className="absolute -top-10 -right-6 w-60 h-60 opacity-80 pointer-events-none"
            initial={{ scale: 0.8, rotate: -5 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Image 
              src={seller}
              alt="Seller Image"
              width={1000}
              height={1000}
              className="w-full h-full object-contain rounded-full"
            />
          </motion.div>

          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

      </motion.div>
    </motion.div>
  )
}

export default BecomePartner