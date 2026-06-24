'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from "@/config/axiosInstance";
import { Icon } from '@iconify/react';

const MIN_PRICE = 0;
const MAX_PRICE = 2000;

/* ── Color Map — uses hex from API if available, falls back to this ── */
const FALLBACK_COLORS = {
  Black: '#18181b', White: '#f5f5f5', Gray: '#6b7280',
  Blue: '#3b82f6', Pink: '#ec4899', Green: '#22c55e',
  Gold: '#d4a017', Red: '#ef4444', Navy: '#1e3a5f',
  Purple: '#a855f7', Orange: '#f97316', Brown: '#92400e',
  Teal: '#14b8a6', Yellow: '#eab308', Beige: '#d4b896',
};

/* ── Small Helpers ── */
function Section({ title, badge, children, collapsible = true }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => collapsible && setOpen(o => !o)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-700 transition-colors flex items-center gap-2">
          {title}
          {badge != null && (
            <span className="bg-primary-100 text-primary-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">{badge}</span>
          )}
        </span>
        {collapsible && (
          <Icon icon={open ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && children}
    </div>
  );
}

function CheckItem({ label, count, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-2 cursor-pointer group mb-1.5 last:mb-0">
      <div className="flex items-center gap-2.5">
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-primary-500 border-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
          {checked && <Icon icon="mdi:check" className="w-3 h-3 text-white" />}
        </div>
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <span className={`text-sm font-medium transition-colors ${checked ? 'text-primary-700 font-semibold' : 'text-gray-700 group-hover:text-primary-600'}`}>
          {label}
        </span>
      </div>
      {count != null && (
        <span className="text-xs text-gray-400 font-medium tabular-nums">{count}</span>
      )}
    </label>
  );
}

function LoadingSkeleton({ lines = 4 }) {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded bg-gray-200" />
          <div className="h-3 rounded bg-gray-200 flex-1" style={{ width: `${60 + Math.random() * 30}%` }} />
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function FilterSidebar({
  onFiltersChange,
  initialCategoryIds    = [],
  initialBrandIds       = [],
  initialSubCategoryIds = [],
}) {
  /* ── Raw Data ── */
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [dynamicAttributes, setDynamicAttributes] = useState([]);

  /* ── Loading ── */
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);

  /* ── Selections (store IDs) — seeded from URL params ── */
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(initialCategoryIds);
  const [selectedSubIds,      setSelectedSubIds]      = useState(initialSubCategoryIds);
  const [selectedBrandIds,    setSelectedBrandIds]    = useState(initialBrandIds);
  const [selectedColors,      setSelectedColors]      = useState([]);
  const [selectedDynamicFilters, setSelectedDynamicFilters] = useState({});
  const [rating,   setRating]   = useState(0);
  const [priceMin, setPriceMin] = useState(MIN_PRICE);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);

  /* Re-seed when URL params change (header nav to different filter) */
  const initKey = initialCategoryIds.join(',') + '|' + initialBrandIds.join(',') + '|' + initialSubCategoryIds.join(',');
  /* Guard: when true, the cascading effects should NOT wipe pre-seeded ids */
  const isSeeding = useRef(false);
  useEffect(() => {
    isSeeding.current = true;
    setSelectedCategoryIds(initialCategoryIds);
    setSelectedSubIds(initialSubCategoryIds);
    setSelectedBrandIds(initialBrandIds);
    /* Allow cascade effects to settle before clearing the guard */
    setTimeout(() => { isSeeding.current = false; }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initKey]);

  /* ── Price slider ── */
  const trackRef = useRef(null);
  const minPct = ((priceMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPct = ((priceMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  /* ── 1. Load categories + colors on mount ── */
  useEffect(() => {
    const load = async () => {
      setLoadingCats(true);
      try {
        const { data } = await axiosInstance.get('/e-commerce/products/filters');
        if (data.success) {
          setCategories(data.data.categories || []);
          setAvailableColors(
            (data.data.colors || []).map(c => ({
              name: c.name,
              hex: c.hex || FALLBACK_COLORS[c.name] || '#ccc',
              isLight: c.name === 'White' || c.name === 'Beige',
            }))
          );
          setDynamicAttributes(data.data.dynamicAttributes || []);
        }
      } catch (e) {
        console.error('Failed to load filters', e);
      } finally {
        setLoadingCats(false);
      }
    };
    load();
  }, []);

  /* ── 2. Load subcategories whenever selected categories change ── */
  useEffect(() => {
    /* Don't wipe pre-seeded selections while URL params are being applied */
    if (!isSeeding.current) {
      setSelectedSubIds([]);
      setSelectedBrandIds([]);
    }
    setSubcategories([]);
    setBrands([]);

    if (!selectedCategoryIds.length) return;

    const load = async () => {
      setLoadingSubs(true);
      try {
        // Fetch subcategories for each selected category in parallel
        const results = await Promise.all(
          selectedCategoryIds.map(id =>
            axiosInstance.get(`/e-commerce/products/filters/subcategories/${id}`)
          )
        );
        // Merge + deduplicate
        const merged = new Map();
        results.forEach(r => {
          (r.data.data || []).forEach(s => merged.set(String(s._id), s));
        });
        setSubcategories(Array.from(merged.values()));
      } catch (e) {
        console.error('Failed to load subcategories', e);
      } finally {
        setLoadingSubs(false);
      }
    };
    load();
  }, [selectedCategoryIds]);

  /* ── 3. Load brands whenever selected subcategories / categories change ── */
  useEffect(() => {
    const hasInitialBrands = initialBrandIds.length > 0;
    if (!hasInitialBrands && !isSeeding.current) setSelectedBrandIds([]);
    setBrands([]);

    const subIds = selectedSubIds;

    /* If brand IDs came from URL but no category selected yet, load all brands */
    const loadAll = hasInitialBrands && !selectedCategoryIds.length && !subIds.length;
    if (!subIds.length && !selectedCategoryIds.length && !loadAll) return;

    const load = async () => {
      setLoadingBrands(true);
      try {
        let brandMap = new Map();
        if (subIds.length) {
          const results = await Promise.all(
            subIds.map(id => axiosInstance.get(`/e-commerce/products/filters/brands/${id}`))
          );
          results.forEach(r => (r.data.data || []).forEach(b => brandMap.set(String(b._id), b)));
        } else {
          const results = await Promise.all([
            axiosInstance.get(`/e-commerce/products/filters/brands/all`)
          ]);
          results.forEach(r => (r.data.data || []).forEach(b => brandMap.set(String(b._id), b)));
        }
        setBrands(Array.from(brandMap.values()));
      } catch (e) {
        console.error('Failed to load brands', e);
      } finally {
        setLoadingBrands(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubIds, selectedCategoryIds, initKey]);

  /* ── Notify parent on filter change ── */
  useEffect(() => {
    onFiltersChange?.({
      categoryIds: selectedCategoryIds,
      subCategoryIds: selectedSubIds,
      brandIds: selectedBrandIds,
      colors: selectedColors,
      dynamicFilters: selectedDynamicFilters,
      rating,
      priceMin,
      priceMax,
    });
  }, [selectedCategoryIds, selectedSubIds, selectedBrandIds, selectedColors, selectedDynamicFilters, rating, priceMin, priceMax]);

  const toggleId = (list, setList, id) =>
    setList(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);

  const toggleDynamicFilter = (attrName, attrValue) => {
    setSelectedDynamicFilters(prev => {
      const current = prev[attrName] || [];
      const updated = current.includes(attrValue)
        ? current.filter(v => v !== attrValue)
        : [...current, attrValue];
      
      const newFilters = { ...prev };
      if (updated.length > 0) newFilters[attrName] = updated;
      else delete newFilters[attrName];
      return newFilters;
    });
  };

  const clearAll = () => {
    setSelectedCategoryIds([]);
    setSelectedSubIds([]);
    setSelectedBrandIds([]);
    setSelectedColors([]);
    setSelectedDynamicFilters({});
    setRating(0);
    setPriceMin(MIN_PRICE);
    setPriceMax(MAX_PRICE);
  };

  const dynamicCount = Object.values(selectedDynamicFilters).reduce((sum, arr) => sum + arr.length, 0);
  const activeCount = selectedCategoryIds.length + selectedSubIds.length +
    selectedBrandIds.length + selectedColors.length + dynamicCount + (rating > 0 ? 1 : 0) +
    (priceMin > MIN_PRICE || priceMax < MAX_PRICE ? 1 : 0);

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:filter-variant" className="w-4.5 h-4.5 text-primary-500" />
          <h2 className="text-base font-black text-gray-900">Filters</h2>
          {activeCount > 0 && (
            <span className="bg-primary-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1">
            <Icon icon="mdi:close" className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">

        {/* ── Category ── */}
        <Section title="Category" badge={selectedCategoryIds.length || null}>
          {loadingCats ? (
            <LoadingSkeleton />
          ) : categories.length === 0 ? (
            <p className="text-xs text-gray-400">No categories available</p>
          ) : (
            categories.map(c => (
              <CheckItem
                key={c._id}
                label={c.title}
                count={c.count}
                checked={selectedCategoryIds.includes(String(c._id))}
                onChange={() => toggleId(selectedCategoryIds, setSelectedCategoryIds, String(c._id))}
              />
            ))
          )}
        </Section>

        {/* ── Subcategory (cascading) ── */}
        {(selectedCategoryIds.length > 0 || subcategories.length > 0) && (
          <Section title="Sub-Category" badge={selectedSubIds.length || null}>
            {loadingSubs ? (
              <LoadingSkeleton lines={3} />
            ) : subcategories.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No subcategories for selected categories</p>
            ) : (
              subcategories.map(s => (
                <CheckItem
                  key={s._id}
                  label={s.title}
                  count={s.count}
                  checked={selectedSubIds.includes(String(s._id))}
                  onChange={() => toggleId(selectedSubIds, setSelectedSubIds, String(s._id))}
                />
              ))
            )}
          </Section>
        )}

        {/* ── Brand (cascading) ── */}
        {(selectedCategoryIds.length > 0 || brands.length > 0) && (
          <Section title="Brand" badge={selectedBrandIds.length || null}>
            {loadingBrands ? (
              <LoadingSkeleton lines={3} />
            ) : brands.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No brands available</p>
            ) : (
              brands.map(b => (
                <CheckItem
                  key={b._id}
                  label={b.title}
                  count={b.count}
                  checked={selectedBrandIds.includes(String(b._id))}
                  onChange={() => toggleId(selectedBrandIds, setSelectedBrandIds, String(b._id))}
                />
              ))
            )}
          </Section>
        )}

        {/* ── Colors ── */}
        {availableColors.length > 0 && (
          <Section title="Colors" badge={selectedColors.length || null}>
            <div className="flex flex-wrap gap-2">
              {availableColors.map(c => {
                const active = selectedColors.includes(c.name);
                return (
                  <button key={c.name} title={c.name}
                    onClick={() => toggleId(selectedColors, setSelectedColors, c.name)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform ${
                      active ? 'border-primary-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {active && <Icon icon="mdi:check" className={`w-3.5 h-3.5 ${c.isLight ? 'text-gray-800' : 'text-white'}`} />}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Dynamic Attributes (Specs) ── */}
        {dynamicAttributes.map(attr => (
          <Section key={attr.name} title={attr.name} badge={selectedDynamicFilters[attr.name]?.length || null}>
            <div className="space-y-1">
              {attr.values.map(val => (
                <CheckItem
                  key={val}
                  label={val}
                  checked={(selectedDynamicFilters[attr.name] || []).includes(val)}
                  onChange={() => toggleDynamicFilter(attr.name, val)}
                />
              ))}
            </div>
          </Section>
        ))}

        {/* ── Price Range ── */}
        <Section title="Price Range" collapsible>
          <div className="relative mt-3 mb-1" ref={trackRef}>
            <div className="relative h-1.5 rounded-full bg-gray-200">
              <div
                className="absolute h-full rounded-full bg-primary-500"
                style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
              />
            </div>
            <input type="range" min={MIN_PRICE} max={MAX_PRICE} step={10} value={priceMin}
              onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax - 10))}
              className="dual-range absolute top-0 w-full h-1.5 appearance-none bg-transparent cursor-pointer"
              style={{ zIndex: priceMin > MAX_PRICE - 100 ? 5 : 3 }}
            />
            <input type="range" min={MIN_PRICE} max={MAX_PRICE} step={10} value={priceMax}
              onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin + 10))}
              className="dual-range absolute top-0 w-full h-1.5 appearance-none bg-transparent cursor-pointer"
              style={{ zIndex: 4 }}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input type="number" min={MIN_PRICE} max={priceMax - 10} value={priceMin}
                onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax - 10))}
                className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 font-medium"
              />
            </div>
            <span className="text-gray-400 text-sm font-medium">–</span>
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input type="number" min={priceMin + 10} max={MAX_PRICE} value={priceMax}
                onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin + 10))}
                className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 font-medium"
              />
            </div>
          </div>
        </Section>

        {/* ── Rating ── */}
        <Section title="Min Rating" collapsible>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(rating === s ? 0 : s)}
                className={`text-2xl transition-colors ${s <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}>
                ★
              </button>
            ))}
          </div>
          {rating > 0 && <p className="text-xs text-gray-400 mt-1">≥ {rating} stars</p>}
        </Section>

      </div>
    </div>
  );
}