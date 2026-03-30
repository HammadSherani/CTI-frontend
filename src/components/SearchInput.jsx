"use client";

import React from "react";
import { Icon } from "@iconify/react";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm"
      />

      <Icon
        icon="heroicons:magnifying-glass"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Icon icon="heroicons:x-mark" className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;