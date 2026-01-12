import React, { useState } from 'react';
import { Icon } from '@iconify/react'; // Install via: npm i @iconify/react

const FilterBar = () => {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [issue, setIssue] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log({ brand, model, issue, city }); // Replace with actual search logic
  };

  const brands = ['Select Brand', 'Apple', 'Samsung', 'Google', 'OnePlus'];
  const models = ['Select Model', 'iPhone 15', 'Galaxy S24', 'Pixel 8', 'OnePlus 12'];
  const issues = ['Select Issue', 'Battery Drain', 'Screen Flicker', 'Camera Issue', 'Software Bug'];

  return (
    <form onSubmit={handleSearch} className="max-w-7xl mx-auto  mb-5">
      <div className="flex flex-col sm:flex-row border border-gray-200 rounded-xl px-1 py-1 bg-white shadow-sm overflow-hidden">
        {/* Brand Select */}
        <div className="relative flex-1 min-w-0 sm:min-w-[140px] px-2 py-3">
          <label htmlFor="brand" className="sr-only">Select Brand</label>
          <select
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full pr-2 pr-2 py-2 text-sm border-0 focus:outline-none bg-transparent text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg"
          >
            {brands.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Icon icon="mdi:chevron-down" className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Divider - Hidden on mobile */}
        <div className="hidden sm:block w-px h-10 bg-gray-200 mx-1"></div>

        {/* Model Select */}
        <div className="relative flex-1 min-w-0 sm:min-w-[140px] px-2 py-3">
          <label htmlFor="model" className="sr-only">Select Model</label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full pr-2 pr-2 py-2 text-sm border-0 focus:outline-none bg-transparent text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg"
          >
            {models.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">Model</span>
          </div> */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Icon icon="mdi:chevron-down" className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-10 bg-gray-200 mx-1"></div>

        {/* Issue Select */}
        <div className="relative flex-1 min-w-0 sm:min-w-[140px] px-2 py-3">
          <label htmlFor="issue" className="sr-only">Select Issue</label>
          <select
            id="issue"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className="w-full pr-2 pr-2 py-2 text-sm border-0 focus:outline-none bg-transparent text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg"
          >
            {issues.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
         
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Icon icon="mdi:chevron-down" className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-10 bg-gray-200 mx-1"></div>

        {/* City Input */}
        <div className="relative flex-1 min-w-0 sm:min-w-[140px] px-2 py-3">
          <label htmlFor="city" className="sr-only">Enter City</label>
          <input
            id="city"
            type="text"
            placeholder="Enter City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pl-6 pr-2 py-2 text-sm border-0 focus:outline-none bg-transparent text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon icon="mdi:map-marker" className="w-4 h-4 text-gray-400" />
          </div>
         
        </div>

        <div className="px-2 py-3 flex-shrink-0">
          <button
            type="submit"
            className="flex items-center justify-center px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            <Icon icon="mdi:magnify" className="w-4 h-4 mr-2" />
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default FilterBar;