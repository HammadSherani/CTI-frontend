"use client";
import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const JobBoard = () => {
  const [activeTab, setActiveTab] = useState('bestMatches');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    urgency: [],
    budget: { min: 0, max: 50000 },
    category: [],
  });

  // Mock data for mobile repairs
  const jobBoardData = {
    jobs: [
      {
        _id: '1',
        title: 'iPhone 14 Screen Replacement & Water Damage Repair',
        description:
          'Looking for experienced mobile technician to fix cracked screen and water damage on iPhone 14. Phone fell in water and screen is completely shattered. Need urgent repair as this is my work phone.',
        category: { name: 'Mobile Screen Repair' },
        urgency: 'urgent',
        urgencyScore: 4,
        budget: { min: 8000, max: 12000 },
        location: { address: 'DHA Phase 6, Karachi', distance: 2.5 },
        client: { name: 'Sarah Ahmed', rating: 4.8, totalJobs: 23 },
        postedAt: '2024-08-24T14:50:00Z',
        timeRemaining: 47,
        expiresAt: '2024-08-26T14:50:=Z',
        canSubmitOffer: true,
        hasSubmittedOffer: false,
        skills: ['iPhone Repair', 'Water Damage', 'Screen Replacement', 'Mobile Hardware'],
        proposalsCount: 3,
      },
      {
        _id: '2',
        title: 'Samsung Galaxy S23 Battery Replacement Service',
        description:
          'Samsung Galaxy S23 battery drains very quickly, need professional battery replacement. Phone is still under warranty but Samsung service center is too expensive.',
        category: { name: 'Mobile Battery Repair' },
        urgency: 'high',
        urgencyScore: 3,
        budget: { min: 4000, max: 6000 },
        location: { address: 'Gulshan-e-Iqbal, Karachi', distance: 5.2 },
        client: { name: 'Ahmed Khan', rating: 4.9, totalJobs: 15 },
        postedAt: '2024-08-24T13:15:00Z',
        timeRemaining: 71,
        expiresAt: '2024-08-27T13:15:00Z',
        canSubmitOffer: false,
        hasSubmittedOffer: true,
        skills: ['Samsung Repair', 'Battery Replacement', 'Mobile Hardware', 'Android Repair'],
        proposalsCount: 7,
      },
      {
        _id: '3',
        title: 'Multiple Phone Repair - iPhone & Android Bulk Service',
        description:
          'Small mobile shop owner looking for reliable technician for ongoing repair services. Need someone who can handle iPhone screen repairs, Android software issues, and charging port repairs.',
        category: { name: 'Bulk Mobile Repair' },
        urgency: 'medium',
        urgencyScore: 2,
        budget: { min: 15000, max: 25000 },
        location: { address: 'Clifton Block 2, Karachi', distance: 8.1 },
        client: { name: 'Mobile Point Electronics', rating: 4.7, totalJobs: 45 },
        postedAt: '2024-08-24T10:30:00Z',
        timeRemaining: 25,
        expiresAt: '2024-08-25T15:30:00Z',
        canSubmitOffer: true,
        hasSubmittedOffer: false,
        skills: ['iPhone Repair', 'Android Repair', 'Charging Port', 'Software Issues', 'Bulk Service'],
        proposalsCount: 12,
      },
    ],
    pagination: { current: 1, total: 5, count: 3, totalJobs: 23 },
    savedJobs: 47,
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeColor = (hours) => {
    if (hours <= 24) return 'text-red-600';
    if (hours <= 48) return 'text-orange-600';
    return 'text-gray-600';
  };

  const JobCard = ({ job }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shortDescription =
      job.description.length > 100 ? job.description.slice(0, 100) + '...' : job.description;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
              {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)}
            </span>
            <span className="text-xs text-gray-500">
              Posted {Math.floor((Date.now() - new Date(job.postedAt)) / (1000 * 60))} min ago
            </span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Icon icon="heroicons:flag" className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Icon icon="heroicons:heart" className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>

        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
          <span>{job.category.name}</span>
          <span className="flex items-center">
            <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
            {job.location.address} ({job.location.distance} km)
          </span>
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          {isExpanded ? job.description : shortDescription}
          {job.description.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary-600 hover:text-primary-700 ml-2 text-sm font-medium"
            >
              {isExpanded ? 'Less' : 'More'}
            </button>
          )}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">
              ₹{job.budget.min.toLocaleString()}-₹{job.budget.max.toLocaleString()}
            </span>
            <span className="flex items-center">
              <Icon icon="heroicons:user" className="w-4 h-4 mr-1 text-gray-500" />
              {job.client.name} ({job.client.rating}★)
            </span>
            <span className={`flex items-center ${getTimeColor(job.timeRemaining)}`}>
              <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
              {job.timeRemaining}h left
            </span>
          </div>
          <div>
            {job.canSubmitOffer && !job.hasSubmittedOffer ? (
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Submit Offer
              </button>
            ) : (
              <span className="text-gray-500 text-sm">Offer Submitted</span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
          <span>Proposals: {job.proposalsCount}</span>
          <span>{job.client.totalJobs} jobs posted</span>
        </div>
      </div>
    );
  };

  const FilterSidebar = () => (
    <div className="w-64 bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Urgency</h4>
        {['urgent', 'high', 'medium'].map((urgency) => (
          <div key={urgency} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={urgency}
              className="mr-2"
              onChange={() => {
                setFilters((prev) => ({
                  ...prev,
                  urgency: prev.urgency.includes(urgency)
                    ? prev.urgency.filter((u) => u !== urgency)
                    : [...prev.urgency, urgency],
                }));
              }}
            />
            <label htmlFor={urgency} className="text-sm capitalize">
              {urgency}
            </label>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Budget Range</h4>
        <input
          type="range"
          min="0"
          max="50000"
          value={filters.budget.max}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              budget: { ...prev.budget, max: parseInt(e.target.value) },
            }))
          }
          className="w-full"
        />
        <div className="text-sm text-gray-600 mt-2">
          Up to ${filters.budget.max.toLocaleString()}
        </div>
      </div>

      <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors">
        Apply Filters
      </button>
    </div>
  );

  const filteredJobs = jobBoardData.jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = filters.urgency.length === 0 || filters.urgency.includes(job.urgency);
    const matchesBudget = job.budget.max <= filters.budget.max;
    return matchesSearch && matchesUrgency && matchesBudget;
  });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mobile Repair Jobs</h1>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <Icon
              icon="heroicons:magnifying-glass"
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <div className="flex space-x-8 mb-6 border-b border-gray-200">
          {['bestMatches', 'mostRecent', 'savedJobs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium capitalize ${
                activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'savedJobs'
                ? `Saved Jobs (${jobBoardData.savedJobs})`
                : tab.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job._id} job={job} />)
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No jobs match your current filters.</p>
              </div>
            )}
            <button className="w-full py-3 mt-6 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Load More Jobs
            </button>
          </div>
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobBoard;