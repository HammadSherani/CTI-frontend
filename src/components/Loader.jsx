"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

function Loader({ loading, children }) {
  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-white pointer-events-auto"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ zIndex: 999999999 }}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <DotLottieReact
                src="/assets/cti-loader.json"
                loop
                autoplay
                style={{ width: 160, height: 160 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}

export default Loader;
