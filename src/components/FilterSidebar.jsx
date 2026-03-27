"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";

function SearchableDropdown({ label, options, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find((o) => o._id === value);

  return (
    <div className="relative">
      <label className="text-sm font-medium text-primary-600 block mb-1">{label}</label>
      <button
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 flex justify-between items-center bg-white text-left hover:border-primary-500 disabled:opacity-60"
      >
        <span className="text-sm text-gray-700 truncate">
          {selected ? selected.name : `Select ${label}`}
        </span>
        <Icon icon="mdi:chevron-down" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-auto">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border-b outline-none sticky top-0 bg-white"
          />
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <div
                key={opt._id}
                onClick={() => {
                  onChange(opt._id);
                  setOpen(false);
                  setSearch("");
                }}
                className="px-4 py-3 hover:bg-primary-50 cursor-pointer text-sm"
              >
                {opt.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-4 text-gray-500 text-sm">No matching {label.toLowerCase()} found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FilterSidebar({ onFiltersChange, countries = [], states = [], cities = [], loading }) {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // You can expand service categories later from API
  const serviceCategories = [
    "Mobile Phone Repair", "Desktop Repair", "Laptop Repair",
    "Screen Replacement", "Battery Replacement", "Software Repair"
  ];

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearAll = () => {
    setSelectedCountry(""); setSelectedState(""); setSelectedCity("");
    setSelectedRating(0); setSelectedCategories([]); setVerifiedOnly(false);
  };

  // Notify parent whenever filters change
  useEffect(() => {
    onFiltersChange({
      country: selectedCountry,
      state: selectedState,
      city: selectedCity,
      minRating: selectedRating,
      categories: selectedCategories,
      verifiedOnly,
    });
  }, [selectedCountry, selectedState, selectedCity, selectedRating, selectedCategories, verifiedOnly]);

  const renderStars = () => [1,2,3,4,5].map(star => (
    <Icon
      key={star}
      icon="mdi:star"
      className={`w-7 h-7 cursor-pointer transition-all ${star <= selectedRating ? "text-yellow-400" : "text-gray-300"}`}
      onClick={() => setSelectedRating(star)}
    />
  ));

  return (
    <div className="w-full p-6  rounded-3xl shadow-md bg-white space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-700">Filters</h2>
        <button onClick={clearAll} className="text-red-500 text-sm font-medium hover:underline">
          Clear All
        </button>
      </div>

      {/* Country */}
      <div>
        <label className="text-sm font-medium mb-1 block">Country</label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500"
          disabled={loading}
        >
          <option value="">Select Country</option>
          {countries.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* State */}
      <SearchableDropdown
        label="State"
        options={states}
        value={selectedState}
        onChange={setSelectedState}
        disabled={!selectedCountry || loading}
      />

      {/* City */}
      <SearchableDropdown
        label="City"
        options={cities}
        value={selectedCity}
        onChange={setSelectedCity}
        disabled={!selectedState || loading}
      />

      {/* Service Categories */}
      <div>
        <label className="text-sm font-medium mb-2 block">Service Category</label>
        <div className="max-h-52 overflow-auto space-y-2 pr-2">
          {serviceCategories.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-primary-600"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="text-sm font-medium mb-1 block">Minimum Rating</label>
        <div className="flex gap-1">{renderStars()}</div>
        {selectedRating > 0 && <p className="text-xs text-gray-500 mt-1">≥ {selectedRating} stars</p>}
      </div>

      {/* Verified Only */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="verified"
          checked={verifiedOnly}
          onChange={e => setVerifiedOnly(e.target.checked)}
          className="accent-primary-600 w-4 h-4"
        />
        <label htmlFor="verified" className="text-sm cursor-pointer">Verified Only</label>
      </div>
    </div>
  );
}