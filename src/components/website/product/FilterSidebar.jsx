'use client';

import { useState, useEffect, useRef } from 'react';

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Huawei'];
const CATEGORIES = ['Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Wearables'];
const SUBCATEGORIES = ['Refurbished', 'Brand New', 'Open Box'];
const COLORS = [
  { name: 'Black',  hex: '#18181b' },
  { name: 'White',  hex: '#f5f5f5', border: true },
  { name: 'Gray',   hex: '#6b7280' },
  { name: 'Blue',   hex: '#3b82f6' },
  { name: 'Pink',   hex: '#ec4899' },
  { name: 'Green',  hex: '#22c55e' },
  { name: 'Gold',   hex: '#d4a017' },
  { name: 'Red',    hex: '#ef4444' },
];
const MIN_PRICE = 0;
const MAX_PRICE = 1000;

export default function FilterSidebar({ onFiltersChange }) {
  const [brands, setBrands]           = useState([]);
  const [categories, setCategories]   = useState([]);
  const [subcategories, setSubcats]   = useState([]);
  const [colors, setColors]           = useState([]);
  const [rating, setRating]           = useState(0);
  const [priceMin, setPriceMin]       = useState(MIN_PRICE);
  const [priceMax, setPriceMax]       = useState(MAX_PRICE);
  const trackRef = useRef(null);

  // Notify parent on any filter change
  useEffect(() => {
    onFiltersChange?.({ brands, categories, subcategories, colors, rating, priceMin, priceMax });
  }, [brands, categories, subcategories, colors, rating, priceMin, priceMax]);

  const toggle = (list, setList, val) =>
    setList(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const clearAll = () => {
    setBrands([]); setCategories([]); setSubcats([]);
    setColors([]); setRating(0);
    setPriceMin(MIN_PRICE); setPriceMax(MAX_PRICE);
  };

  // Dual range slider handlers
  const handleMinSlider = (e) => {
    const val = Math.min(Number(e.target.value), priceMax - 10);
    setPriceMin(val);
  };
  const handleMaxSlider = (e) => {
    const val = Math.max(Number(e.target.value), priceMin + 10);
    setPriceMax(val);
  };

  // Track fill percentage
  const minPct = ((priceMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPct = ((priceMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 space-y-5 shadow-sm">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-extrabold text-gray-900">Filters</h2>
        <button
          onClick={clearAll}
          className="text-xs text-primary-600 font-semibold hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* ── Brand ── */}
      <Section title="Brand">
        {BRANDS.map(b => (
          <CheckItem
            key={b} label={b}
            checked={brands.includes(b)}
            onChange={() => toggle(brands, setBrands, b)}
          />
        ))}
      </Section>

      {/* ── Category ── */}
      <Section title="Category">
        {CATEGORIES.map(c => (
          <CheckItem
            key={c} label={c}
            checked={categories.includes(c)}
            onChange={() => toggle(categories, setCategories, c)}
          />
        ))}
      </Section>

      {/* ── Subcategory ── */}
      <Section title="Condition">
        {SUBCATEGORIES.map(s => (
          <CheckItem
            key={s} label={s}
            checked={subcategories.includes(s)}
            onChange={() => toggle(subcategories, setSubcats, s)}
          />
        ))}
      </Section>

      {/* ── Color ── */}
      <Section title="Color">
        <div className="flex flex-wrap gap-2 mt-1">
          {COLORS.map(c => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => toggle(colors, setColors, c.name)}
              className={`w-7 h-7 rounded-full transition-all duration-150 ${
                colors.includes(c.name)
                  ? 'ring-2 ring-offset-2 ring-gray-800 scale-110'
                  : 'hover:scale-110'
              } ${c.border ? 'border border-gray-300' : ''}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        {colors.length > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">{colors.join(', ')}</p>
        )}
      </Section>

      {/* ── Price Range (Dual Slider) ── */}
      <Section title="Price Range">
        {/* Dual slider track */}
        <div className="relative mt-3 mb-1" ref={trackRef}>
          {/* Track background */}
          <div className="relative h-1.5 rounded-full bg-gray-200">
            {/* Active fill */}
            <div
              className="absolute h-full rounded-full bg-orange-500"
              style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
            />
          </div>

          {/* Min thumb */}
          <input
            type="range"
            min={MIN_PRICE} max={MAX_PRICE} step={5}
            value={priceMin}
            onChange={handleMinSlider}
            className="dual-range absolute top-0 w-full h-1.5 appearance-none bg-transparent cursor-pointer"
            style={{ zIndex: priceMin > MAX_PRICE - 100 ? 5 : 3 }}
          />

          {/* Max thumb */}
          <input
            type="range"
            min={MIN_PRICE} max={MAX_PRICE} step={5}
            value={priceMax}
            onChange={handleMaxSlider}
            className="dual-range absolute top-0 w-full h-1.5 appearance-none bg-transparent cursor-pointer"
            style={{ zIndex: 4 }}
          />
        </div>

        {/* Min / Max number inputs */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number" min={MIN_PRICE} max={priceMax - 10}
              value={priceMin}
              onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax - 10))}
              className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 font-medium"
            />
          </div>
          <span className="text-gray-400 text-sm font-medium">—</span>
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number" min={priceMin + 10} max={MAX_PRICE}
              value={priceMax}
              onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin + 10))}
              className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 font-medium"
            />
          </div>
        </div>
      </Section>

      {/* ── Rating ── */}
      <Section title="Min Rating" last>
        <div className="flex gap-1 mt-1">
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              onClick={() => setRating(rating === s ? 0 : s)}
              className={`text-2xl transition-colors ${s <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}
            >★</button>
          ))}
        </div>
        {rating > 0 && <p className="text-xs text-gray-400 mt-1">≥ {rating} stars</p>}
      </Section>

    </div>
  );
}

function Section({ title, children, last }) {
  return (
    <div className={`${last ? '' : 'pb-5 border-b border-gray-100'}`}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{title}</p>
      {children}
    </div>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group mb-1.5 last:mb-0">
      <input
        type="checkbox" checked={checked} onChange={onChange}
        className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
      />
      <span className={`text-sm font-medium transition-colors ${checked ? 'text-orange-600' : 'text-gray-700 group-hover:text-orange-500'}`}>
        {label}
      </span>
    </label>
  );
}