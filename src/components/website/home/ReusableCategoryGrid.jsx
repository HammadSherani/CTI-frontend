"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import SectionTag from "./sectoinTag";

const ReusableCategoryGrid = ({
  title,
  titleHighlight,
  sectionTag,
  loading,
  categories,
  onItemClick,
  showSellMore,
  onSellMoreClick,
  cardClassName = "bg-[#FF69000D] group-hover:bg-[#FF69001A] p-2",
  wrapperClassName = "w-[100px] sm:w-[100px]",
  emptyMessage = "No categories available right now.",
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-left mb-8 md:mb-12">
        {sectionTag && <SectionTag title={sectionTag} />}
        {(titleHighlight || title) && (
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
            {titleHighlight && <span className="text-primary-600">{titleHighlight} </span>}
            {title}
          </h2>
        )}
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex flex-wrap justify-start gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`flex flex-col items-center justify-start ${wrapperClassName}`}>
              <div className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] bg-gray-100 animate-pulse rounded-2xl mb-3"></div>
              <div className="h-3 bg-gray-200 animate-pulse rounded w-16 sm:w-20"></div>
            </div>
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
      ) : (
        <div className="flex flex-wrap justify-start gap-2 sm:gap-2">
          {categories.map((item, index) => (
            <motion.div
              key={item._id || item.slug || index}
              whileHover={{ y: -3 }}
              className={`flex flex-col items-center justify-start group cursor-pointer ${wrapperClassName}`}
              onClick={() => onItemClick(item)}
            >
              <div className={`w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 ${cardClassName}`}>
                <div className="relative w-full h-full">
                  <Image
                    src={item.image || "https://via.placeholder.com/150"}
                    alt={item.name || "Category"}
                    fill
                    sizes="100px"
                    className="object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center leading-tight">
                {item.name}
              </span>
            </motion.div>
          ))}

          {showSellMore && (
            <motion.div
              whileHover={{ y: -3 }}
              className={`flex flex-col items-center justify-start group cursor-pointer ${wrapperClassName}`}
              onClick={onSellMoreClick}
            >
              <div className={`w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 ${cardClassName}`}>
                <div className="flex gap-1 items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600 group-hover:bg-primary-600 transition-colors"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600 group-hover:bg-primary-600 transition-colors"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600 group-hover:bg-primary-600 transition-colors"></span>
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center leading-tight">
                Sell More
              </span>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReusableCategoryGrid;
