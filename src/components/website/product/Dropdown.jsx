"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

let activeDropdown = null;

export function Dropdown({
  label = "Sort By",
  icon = "mdi:sort",
  options = [],
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        if (activeDropdown === setOpen) activeDropdown = null;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = () => {
    if (activeDropdown && activeDropdown !== setOpen) {
      activeDropdown(false);
    }

    setOpen((prev) => {
      const next = !prev;
      activeDropdown = next ? setOpen : null;
      return next;
    });
  };

  return (
    <div ref={ref} className="relative w-[240px]">
      
      {/* BUTTON */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm shadow-sm hover:border-orange-400 transition"
      >
        <div className="flex items-center gap-2 min-w-0">
          
          {/* LEFT ICON */}
          <Icon icon={icon} className="w-4 h-4 text-orange-500 shrink-0" />

          {/* TEXT */}
          <span className="text-gray-700 font-medium truncate">
            {selected ? selected.label : label}
          </span>
        </div>

        {/* CHEVRON */}
        <Icon
          icon="mdi:chevron-down"
          className={`w-4 h-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      <div
        className={`absolute mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden transition-all duration-200 origin-top
        ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
              activeDropdown = null;
            }}
            className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition
            ${
              value === opt.value
                ? "bg-orange-500 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <span>{opt.label}</span>

            {value === opt.value && (
              <Icon icon="mdi:check" className="w-4 h-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}