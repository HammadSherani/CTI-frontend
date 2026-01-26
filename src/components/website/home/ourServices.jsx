import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSelector } from 'react-redux';

function OurServices() {
 

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

    const { services } = useSelector((state) => state.home || {});

    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      if (services === undefined) setLoading(true);
      else setLoading(false);
    }, [services]);

    const activeServices = React.useMemo(() => {
      if (!services) return [];
      if (Array.isArray(services)) return services.filter((s) => s.isActive !== false);
      return services.isActive === false ? [] : [services];
    }, [services]);

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
      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading services...</div>
      ) : activeServices.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No services available.</div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {activeServices.map((service) => (
            <motion.div
              key={service._id || service.id}
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
                  src={service.icon}
                  alt={service.name}
                  className="w-full h-24 object-cover mb-4 rounded"
                  height={200}
                  width={200}
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
      )}
    </div>
  );
}

export default OurServices;