"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";

/* GLOBAL SINGLE OPEN TRACKER */
let activeDropdown = null;

export const CustomDropdown = ({
  icon,
  placeholder = "Select",
  options = [],
  value,
  onChange,
  disabled = false,
  isLoading = false,
  searchable = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || placeholder;

  const filteredOptions = searchable
    ? options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    )
    : options;

  const { refs, floatingStyles, isPositioned } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(6), flip(), shift({ padding: 10 })],
    whileElementsMounted: autoUpdate,
  });

  /* SINGLE DROPDOWN CONTROL */
  const handleToggle = () => {
    if (disabled) return;

    if (activeDropdown && activeDropdown !== setOpen) {
      activeDropdown(false);
    }

    if (!open) {
      activeDropdown = setOpen;
    }

    setOpen(!open);
  };
  /* Focus the search box only after the menu is in place. Focusing it earlier (autoFocus) made the
     browser scroll to the top of the page, where the menu sits before it is positioned. */
  useEffect(() => {
    if (open && isPositioned) searchRef.current?.focus({ preventScroll: true });
  }, [open, isPositioned]);

  /* Close on outside click or Escape, and start with an empty search next time */
  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const onPointerDown = (e) => {
      if (refs.reference.current?.contains(e.target) || refs.floating.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, refs]);

  /* cleanup */
  useEffect(() => {
    return () => {
      if (activeDropdown === setOpen) {
        activeDropdown = null;
      }
    };
  }, []);

  return (
    <>
      {/* Trigger */}
      <div ref={refs.setReference} className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className="w-full h-11 px-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:border-primary-400 text-sm"
        >
          <Icon icon={icon} className="w-4 h-4 text-primary-500" />
          <span className="flex-1 text-left truncate">{isLoading ? "Loading..." : selectedLabel}</span>
          <Icon icon="mdi:chevron-down" className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown */}
      {open &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              visibility: isPositioned ? "visible" : "hidden",
              width: refs.reference.current
                ? refs.reference.current.offsetWidth
                : "auto",
            }}
            className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-[99999]"
          >
            {/* Search */}
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Icon icon="mdi:magnify" className="w-4 h-4 text-gray-400" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    placeholder="Search..."
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="max-h-52 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${value === opt.value
                      ? "bg-primary-50 text-primary-600 font-medium"
                      : ""
                      }`}
                  >
                    {isLoading && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                    {opt.label}
                  </button>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-400 text-center">
                  No results found
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};