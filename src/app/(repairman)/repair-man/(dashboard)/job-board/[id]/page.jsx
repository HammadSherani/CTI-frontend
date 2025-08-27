"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

function JobDetailPage() {
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Mock job data for mobile repair
  const jobData = {
    id: '1',
    title: 'iPhone 14 Pro Screen Replacement & Water Damage Repair Needed',
    category: 'Mobile & Electronics',
    subcategory: 'Mobile Repair',
    postedTime: '3 hours ago',
    location: 'Pakistan',
    budget: {
      type: 'Fixed',
      amount: 8000,
      currency: 'PKR'
    },
    urgency: 'Expert',
    duration: 'Less than 1 month',
    timeCommitment: 'Less than 30 hrs/week',
    description: `We are seeking an experienced Mobile Repair Technician specializing in iPhone repairs, specifically for water damage restoration and screen replacement. The device is an iPhone 14 Pro that sustained water damage and has a completely cracked screen.

    The phone was dropped in water for approximately 30 seconds before being retrieved. The screen shows multiple cracks and the touch functionality is partially working. We need a professional who can assess the full extent of the damage and provide a comprehensive repair service.

    Requirements:
    - Expertise in iPhone 14 Pro repairs
    - Experience with water damage restoration
    - Professional screen replacement capabilities
    - Ability to test all phone functions after repair
    - Warranty on repair work
    - Quick turnaround time (within 24-48 hours)

    Please provide your experience with similar repairs and expected timeline for completion.`,
    skills: [
      'Mobile Phone Repair',
      'iPhone Repair', 
      'Screen Replacement',
      'Water Damage Restoration',
      'Electronics Troubleshooting',
      'Hardware Repair'
    ],
    proposalsCount: 5,
    interviewsCount: 2,
    hiresCount: 0,
    clientSpent: 25000,
    clientInfo: {
      name: 'Hammad K.',
      memberSince: 'Member since Jan 20, 2023',
      verified: true,
      rating: 4.8,
      totalSpent: 'PKR 50K+ total spent',
      location: 'Karachi, Pakistan',
      reviews: 12,
      hireRate: '85%',
      avgResponseTime: '2 hours'
    },
    timeline: 'ASAP',
    connectsRequired: 6
  };

  const SkillTag = ({ skill, level }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 mr-2 mb-2">
      {skill}
      {level && <span className="ml-2 text-xs text-blue-600">{level}</span>}
    </span>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{jobData.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
                  Posted {jobData.postedTime}
                </div>
                <div className="flex items-center">
                  <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
                  Worldwide
                </div>
              </div>
              
              <div className="text-sm text-gray-700">
                <span className="font-medium">Fixed-price</span> - <span className="font-medium">Expert</span> - Est. Budget: {jobData.budget.amount.toLocaleString()} {jobData.budget.currency} - Posted {jobData.postedTime}
              </div>
            </div>

            {/* Job Description */}
            <div className="border-t border-gray-200 pt-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {showFullDescription ? jobData.description : jobData.description.substring(0, 400) + '...'}
                </p>
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-green-600 hover:text-green-700 mt-2"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6 border-t border-gray-200">
              <div className="flex items-center">
                <Icon icon="heroicons:currency-dollar" className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{jobData.budget.amount.toLocaleString()} PKR</p>
                  <p className="text-xs text-gray-500">Fixed price</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Icon icon="heroicons:star" className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Expert</p>
                  <p className="text-xs text-gray-500">Experience level</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Icon icon="heroicons:clock" className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Remote job</p>
                  <p className="text-xs text-gray-500">Job type</p>
                </div>
              </div>

              <div className="flex items-center">
                <Icon icon="heroicons:calendar-days" className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Less than 30 hrs/week</p>
                  <p className="text-xs text-gray-500">Hours needed</p>
                </div>
              </div>
            </div>

            {/* Skills and Expertise */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills and Expertise</h3>
              <p className="text-sm text-gray-700 mb-4">Looking for talent with these skills:</p>
              <div className="flex flex-wrap">
                {jobData.skills.map((skill, index) => (
                  <SkillTag key={index} skill={skill} level={index < 2 ? '★ 5 stars' : null} />
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity on this job</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Proposals:</p>
                  <p className="text-gray-600">Less than {jobData.proposalsCount}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Interviewing:</p>
                  <p className="text-gray-600">{jobData.interviewsCount}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Invites sent:</p>
                  <p className="text-gray-600">0</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Unanswered invites:</p>
                  <p className="text-gray-600">0</p>
                </div>
              </div>
            </div>

            {/* About the Client */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the client</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-semibold text-blue-600">A</span>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{jobData.clientInfo.name}</span>
                      {jobData.clientInfo.verified && (
                        <Icon icon="heroicons:check-badge" className="w-5 h-5 text-blue-500 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{jobData.clientInfo.memberSince}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Icon 
                          key={i} 
                          icon="heroicons:star" 
                          className={`w-4 h-4 ${i < Math.floor(jobData.clientInfo.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="ml-2 text-gray-600">{jobData.clientInfo.rating} of {jobData.clientInfo.reviews} reviews</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">{jobData.clientInfo.totalSpent}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-900 font-medium">{jobData.clientInfo.location}</p>
                    <p className="text-gray-600">{jobData.clientInfo.avgResponseTime} avg response time</p>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{jobData.clientInfo.hireRate} hire rate</p>
                    <p className="text-gray-600">{jobData.clientInfo.reviews} open jobs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Apply Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply to this job</h3>
                <p className="text-sm text-gray-600">Your proposal will include:</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-sm">
                  <Icon icon="heroicons:check-circle" className="w-4 h-4 text-green-500 mr-2" />
                  <span>Cover letter</span>
                </div>
                <div className="flex items-center text-sm">
                  <Icon icon="heroicons:check-circle" className="w-4 h-4 text-green-500 mr-2" />
                  <span>Portfolio work (optional)</span>
                </div>
                <div className="flex items-center text-sm">
                  <Icon icon="heroicons:check-circle" className="w-4 h-4 text-green-500 mr-2" />
                  <span>Profile</span>
                </div>
              </div>
              
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                Apply Now
              </button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">Send a proposal for: <span className="font-medium">{jobData.connectsRequired} Connects</span></p>
              </div>
            </div>

            {/* Job Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Job Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">{jobData.budget.amount.toLocaleString()} {jobData.budget.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span>{jobData.postedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Proposals:</span>
                  <span>Less than {jobData.proposalsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span>{jobData.location}</span>
                </div>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Similar jobs you might like</h4>
              <div className="space-y-3">
                <div className="pb-3 border-b border-gray-100 last:border-b-0">
                  <h5 className="text-sm font-medium text-gray-900 mb-1">Samsung Galaxy Screen Repair</h5>
                  <p className="text-xs text-gray-600 mb-2">Fixed-price - Expert - Est. Budget: 6,000 PKR</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Mobile Repair</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Samsung</span>
                  </div>
                </div>
                
                <div className="pb-3 border-b border-gray-100 last:border-b-0">
                  <h5 className="text-sm font-medium text-gray-900 mb-1">Android Phone Battery Replacement</h5>
                  <p className="text-xs text-gray-600 mb-2">Fixed-price - Intermediate - Est. Budget: 4,000 PKR</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Battery Repair</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Android</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;