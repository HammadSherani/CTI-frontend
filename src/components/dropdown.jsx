import { Icon } from "@iconify/react";
import { useState } from "react";

export function SearchableDropdown({
  label,
  isLabel,
  options = [],
  value,
  onChange,
  disabled,
  isSearch,
  icon // 🔥 new prop
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((opt) =>
    opt.name?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find((o) => o._id === value);

  return (
    <div className="relative w-full">
      
      {/* Label */}
      {isLabel && (
        <label className="text-sm font-medium text-primary-600 block mb-1">
          {label}
        </label>
      )}

      {/* Button */}
      <button
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm bg-white text-left flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          
          {/* 🔥 Left Icon (optional) */}
          {icon && (
            <Icon icon={icon} className="w-4 h-4 text-gray-400" />
          )}

          <span className={`${selected ? "text-gray-700" : "text-gray-400"}`}>
            {selected ? selected.name : `Select ${label}`}
          </span>
        </div>

        <Icon icon="heroicons:chevron-down" className="w-5 h-5 text-gray-400" />
      </button>

      {/* ❌ Clear button */}
      {selected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange(""); // 🔥 clear value
          }}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
        >
          <Icon icon="heroicons:x-mark" className="w-4 h-4" />
        </button>
      )}

      {/* ✅ SINGLE Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          
          {/* Search */}
          {isSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${label}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border-b outline-none text-sm"
              />
              <Icon
                icon="heroicons:magnifying-glass"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
            </div>
          )}

          {/* Clear */}
          {selected && (
            <div
              onClick={() => {
                onChange("");
                setSearch("");
                setOpen(false);
              }}
              className="px-4 py-2 text-red-500 text-xs cursor-pointer hover:bg-red-50 border-b"
            >
              Clear Selection
            </div>
          )}

          {/* Options */}
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <div
                key={opt._id}
                onClick={() => {
                  // 🔥 toggle select/unselect
                  const newValue = value === opt._id ? "" : opt._id;

                  console.log("Selected ID:", newValue); // debug

                  onChange(newValue);
                  setOpen(false);
                  setSearch("");
                }}
                className={`px-4 py-2 text-sm cursor-pointer ${
                  value === opt._id
                    ? "bg-primary-100 text-primary-700"
                    : "hover:bg-gray-100"
                }`}
              >
                {opt.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No matching {label.toLowerCase()} found
            </div>
          )}
        </div>
      )}
    </div>
  );
}