'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { Link } from '@/i18n/navigation';

// Public catalog of repair services with fixed prices, offered by repairmen and approved by
// our team. Data: GET /public/repairman-services
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Best rated repairmen' },
];

const money = (n) => `₺${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

export default function ServiceCatalogPage() {
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ search: '', brandId: '', modelId: '', city: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const set = (patch) => setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));

  useEffect(() => {
    axiosInstance.get('/public/brands')
      .then(({ data }) => setBrands(data?.data?.brands || []))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    if (!filters.brandId) {
      setModels([]);
      return;
    }
    axiosInstance.get(`/public/models/brand/${filters.brandId}`)
      .then(({ data }) => setModels(data?.data?.models || []))
      .catch(() => setModels([]));
  }, [filters.brandId]);

  // Search waits until typing stops
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => (prev.search === searchText.trim() ? prev : { ...prev, search: searchText.trim(), page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries({ ...filters, limit: 12 }).filter(([, v]) => v !== '' && v !== null));
      const { data } = await axiosInstance.get('/public/repairman-services', { params });
      setServices(data.data || []);
      if (data.cities?.length) setCities(data.cities);
      setPagination(data.pagination || { total: 0, pages: 1 });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const hasFilters = filters.search || filters.brandId || filters.modelId || filters.city || filters.minPrice || filters.maxPrice;
  const clearAll = () => {
    setSearchText('');
    setFilters({ search: '', brandId: '', modelId: '', city: '', minPrice: '', maxPrice: '', sort: filters.sort, page: 1 });
  };
  const select = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Repair Services</h1>
          <p className="text-gray-600 mt-1">Fixed-price repairs from verified repairmen. Pick a service and contact the repairman.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search e.g. screen, battery, charging port..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <select value={filters.brandId} onChange={(e) => set({ brandId: e.target.value, modelId: '' })} className={select} aria-label="Brand">
              <option value="">All brands</option>
              {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            <select value={filters.modelId} onChange={(e) => set({ modelId: e.target.value })} className={select} disabled={!filters.brandId} aria-label="Model">
              <option value="">{filters.brandId ? 'All models' : 'Choose a brand first'}</option>
              {models.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <select value={filters.city} onChange={(e) => set({ city: e.target.value })} className={select} aria-label="City">
              <option value="">All cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" min="0" placeholder="Min ₺" value={filters.minPrice} onChange={(e) => set({ minPrice: e.target.value })} className={select} aria-label="Minimum price" />
            <input type="number" min="0" placeholder="Max ₺" value={filters.maxPrice} onChange={(e) => set({ maxPrice: e.target.value })} className={select} aria-label="Maximum price" />
            <select value={filters.sort} onChange={(e) => set({ sort: e.target.value })} className={select} aria-label="Sort">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button type="button" onClick={clearAll} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Clear filters
            </button>
          )}
        </div>

        {/* Results */}
        {!loading && <p className="text-sm text-gray-600 mb-3">{pagination.total} service{pagination.total === 1 ? '' : 's'}</p>}
        {loading ? (
          <div className="flex justify-center py-16">
            <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Icon icon="heroicons:wrench-screwdriver" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No services found</p>
            <p className="text-sm text-gray-500 mt-1">Try another search or clear the filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => {
              const rp = s.repairman?.repairmanProfile || {};
              return (
                <Link key={s._id} href={`/service-catalog/${s._id}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-md transition-all flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{s.title}</h3>
                    <span className="text-lg font-bold text-primary-600 whitespace-nowrap">{money(s.pricing?.total)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {s.brand?.name} {s.model?.name}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-2 flex-1">{s.description}</p>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3">
                    {rp.profilePhoto ? (
                      <img src={rp.profilePhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <Icon icon="heroicons:user" className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{rp.shopName || rp.fullName || s.repairman?.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {rp.rating > 0 && (<><Icon icon="heroicons:star-solid" className="w-3.5 h-3.5 text-yellow-400" />{Number(rp.rating).toFixed(1)} · </>)}
                        {s.city || 'Location on request'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6 text-sm">
            <button type="button" onClick={() => set({ page: filters.page - 1 })} disabled={filters.page <= 1} className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50">Previous</button>
            <span className="text-gray-600">Page {filters.page} of {pagination.pages}</span>
            <button type="button" onClick={() => set({ page: filters.page + 1 })} disabled={filters.page >= pagination.pages} className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
