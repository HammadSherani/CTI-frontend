'use client';
import { Icon } from '@iconify/react';

const categories = ['Sell Phone', 'Buy Phone', 'Buy Laptops', 'Sell Laptops', 'Phone Repairs', 'Find New Watches', 'Recycle'];

const FilterSidebar = () => {
  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0">
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200/80 h-full">
        <h2 className="text-2xl font-bold text-gray-800 pb-2 border-b border-gray-200">Filter By</h2>
        
        <div className="space-y-6 mt-6">
          {/* Product Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Product Type</label>
            <input type="text" defaultValue="All" className="w-full mt-2 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          
          {/* Price Range */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Price</label>
            <div className="mt-2">
              <input type="range" min="0" max="4000" defaultValue="4000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Min: 0</span>
                <span>Max: 4000</span>
              </div>
            </div>
          </div>
          
          {/* Categories */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Categories</label>
            <select className="w-full mt-2 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option>Sell Phone</option>
              <option>Buy Phone</option>
            </select>
            <div className="mt-3 space-y-2">
              {categories.map(category => (
                <a href="#" key={category} className="block text-gray-600 hover:text-blue-600 text-sm">{category}</a>
              ))}
            </div>
          </div>
          
          {/* Brands */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Brands</label>
            <div className="relative mt-2">
              <input type="text" placeholder="Search by brands" className="w-full p-2.5 pl-4 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
              <Icon icon="mdi:magnify" className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;