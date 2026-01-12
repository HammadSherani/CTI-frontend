import React from 'react';
import { motion } from 'framer-motion';
import sellPhone from '../../../../public/assets/services/8.webp'
import buyGadgets from '../../../../public/assets/services/4.webp'
import buyPhone from '../../../../public/assets/services/7.webp'
import buyLaptop from '../../../../public/assets/services/1.webp'
import repairPhone from '../../../../public/assets/services/6.webp'
import repairLaptop from '../../../../public/assets/services/2.webp'
import newPhone from '../../../../public/assets/services/5.webp'
import newStore from '../../../../public/assets/services/3.webp'
import newWatched from '../../../../public/assets/services/11.webp'
import recycle from '../../../../public/assets/services/10.webp'
import Image from 'next/image';

function OurServices() {
  const services = [
    {
      name: 'Sell Phone',
      image: sellPhone,
      alt: 'Sell Phone'
    },
    {
      name: 'Buy Gadgets',
      image: buyGadgets,
      alt: 'Buy Gadgets'
    },
    {
      name: 'Buy Phone',
      image: buyPhone,
      alt: 'Buy Phone'
    },
    {
      name: 'Buy Laptops',
      image: buyLaptop,
      alt: 'Buy Laptops'
    },
    {
      name: 'Repair Phone',
      image: repairPhone,
      alt: 'Repair Phone'
    },
    {
      name: 'Repair Laptop',
      image: repairLaptop,
      alt: 'Repair Laptop'
    },
    {
      name: 'Find New Phone',
      image: newPhone,
      alt: 'Find New Phone'
    },
    {
      name: 'Nearby Stores',
      image: newStore,
      alt: 'Nearby Stores'
    },
    {
      name: 'Buy Smartwatches',
      image: newWatched,
      alt: 'Buy Smartwatches'
    },
    {
      name: 'Recycle',
      image: recycle,
      alt: 'Recycle'
    }
  ];

  // Animation variants
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto rounded-xl">
      <motion.h2 
        className="text-3xl font-bold text-gray-900 mb-8"
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        Our Services
      </motion.h2>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-x-4 gap-y-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="bg-primary-100/20 rounded-lg shadow-xs overflow-hidden hover:shadow-sm user-select-none transition-shadow duration-300 text-center p-4"
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Image
                src={service.image}
                alt={service.alt}
                className="w-full h-24 object-cover mb-4 rounded"
                height={1000}
                width={1000}
              />
            </motion.div>
            <motion.p 
              className="text-gray-700 font-medium text-sm user-select-none"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {service.name}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default OurServices;