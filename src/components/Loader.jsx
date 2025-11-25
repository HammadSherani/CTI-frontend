import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import LogoImage from "../../public/assets/logo/logo-light.webp";

function Loader({ loading, children }) {
  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-white"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}

            style={{zIndex: 9999999999}}
          >
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Logo in center (absolute so it appears instantly) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={LogoImage}
                  alt="Loading..."
                  priority
                  className="w-20 h-20 object-contain animate-pulse"
                />
              </div>

              {/* Circular spinning border */}
              <div className="absolute inset-0 rounded-full border-4 border-orange-400 border-t-transparent animate-spin"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && children}
    </>
  );
}

export default Loader;