import { Icon } from "@iconify/react";
import { useState ,useEffect,useRef} from "react";

let activeDropdownInstance = null;

export function SearchableDropdown({
  label,
  isLabel,
  options = [],
  value,
  onChange,
  disabled,
  isSearch,
  icon
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((opt) =>
    opt.name?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find((o) => o._id === value);

  const handleToggle = () => {
    if (activeDropdownInstance && activeDropdownInstance !== setOpen) {
      activeDropdownInstance(false);
    }

    setOpen((prev) => {
      const next = !prev;
      activeDropdownInstance = next ? setOpen : null;
      return next;
    });
  };

  return (
    <div className="relative w-full">
      
      {isLabel && (
        <label className="text-sm font-medium text-gray-700 block mb-1">
          {label}
        </label>
      )}

      {/* BUTTON */}
      <button
        disabled={disabled}
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm shadow-sm hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
      >
        {/* LEFT SIDE */}
        <div className="flex items-center gap-2 min-w-0">
          
          {icon && (
            <Icon
              icon={icon}
              className="w-4 h-4 text-gray-400 shrink-0"
            />
          )}

          <span className={`truncate ${selected ? "text-gray-700" : "text-gray-400"}`}>
            {selected ? selected.name : `Select ${label}`}
          </span>
        </div>

        {/* RIGHT ICON */}
        <div className="flex items-center gap-2">
          
          {selected && (
            <Icon
              icon="heroicons:x-mark"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer"
            />
          )}

          <Icon
            icon="heroicons:chevron-down"
            className={`w-5 h-5 text-gray-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          
          {/* SEARCH */}
          {isSearch && (
            <div className="relative border-b">
              <Icon
                icon="heroicons:magnifying-glass"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />

              <input
                type="text"
                placeholder={`Search ${label}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm outline-none"
              />
            </div>
          )}

          {/* CLEAR */}
          {selected && (
            <div
              onClick={() => {
                onChange("");
                setSearch("");
                setOpen(false);
                activeDropdownInstance = null;
              }}
              className="px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-red-50 border-b"
            >
              Clear Selection
            </div>
          )}

          {/* OPTIONS */}
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <div
                key={opt._id}
                onClick={() => {
                  const newValue = value === opt._id ? "" : opt._id;

                  onChange(newValue);
                  setOpen(false);
                  setSearch("");
                  activeDropdownInstance = null;
                }}
                className={`px-4 py-2 text-sm cursor-pointer transition ${
                  value === opt._id
                    ? "bg-primary-100 text-primary-700"
                    : "hover:bg-gray-100"
                }`}
              >
                {opt.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No matching {label.toLowerCase()} found
            </div>
          )}
        </div>
      )}
    </div>
  );
}





 export function UrgencyDropdown({ urgencyFilter, setUrgencyFilter }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const options = [
    { label: "All Priorities", value: "all" },
    { label: "High", value: "high", color: "text-red-600" },
    { label: "Medium", value: "medium", color: "text-yellow-600" },
    { label: "Low", value: "low", color: "text-green-600" },
  ];

  const selected = options.find((o) => o.value === urgencyFilter);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 px-4 py-3 w-full 
        rounded-lg border border-gray-300 bg-white shadow-sm
        hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500
        transition-all"
      >
        <span className="text-sm font-medium text-gray-700">
          {selected?.label}
        </span>

        <Icon
          icon="heroicons:chevron-down"
          className="w-5 h-5 text-primary-500"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setUrgencyFilter(opt.value);
                setOpen(false);
              }}
              className={`px-4 py-3 cursor-pointer text-sm flex items-center justify-between
              hover:bg-primary-50 transition-all
              ${urgencyFilter === opt.value ? "bg-primary-100" : ""}`}
            >
              <span className={`${opt.color || "text-gray-700"}`}>
                {opt.label}
              </span>

              {urgencyFilter === opt.value && (
                <Icon
                  icon="heroicons:check"
                  className="w-4 h-4 text-primary-600"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}