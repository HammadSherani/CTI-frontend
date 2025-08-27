"use client";

import React from 'react';
import { Icon } from '@iconify/react';

function ProfilePage() {
  // Mock profile data
  const profileData = {
    name: 'Ahmed Hassan',
    title: 'Expert Mobile Device Repair Technician | iPhone & Android Specialist',
    location: 'Karachi, Sindh, Pakistan',
    joinDate: 'January 2022',
    availability: 'Available now',
    rate: 800, // per hour in PKR
    totalEarned: 485000,
    jobSuccess: 98,
    completedJobs: 147,
    totalHours: 1250,
    rating: 4.9,
    reviewsCount: 89,
    responseTime: '1 hour',
    languages: [
      { name: 'Urdu', level: 'Native or bilingual' },
      { name: 'English', level: 'Professional' },
      { name: 'Punjabi', level: 'Conversational' }
    ],
    avatar: null,
    verified: true,
    topRated: true,
    overview: `Experienced Mobile Device Repair Technician with 5+ years of expertise in iPhone, Samsung, and Android device repairs. Specialized in screen replacements, water damage restoration, battery replacements, and complex hardware troubleshooting.

🔧 Core Expertise:
• iPhone repair (all models from 6 to 14 Pro Max)
• Samsung Galaxy series repair and maintenance
• Water damage assessment and restoration
• Micro-soldering and motherboard repairs
• Battery replacement and power management
• Camera and sensor repairs
• Software troubleshooting and data recovery

🏆 What sets me apart:
• 98% job success rate with 147+ completed repairs
• Same-day service for most repairs
• 6-month warranty on all hardware repairs
• Genuine parts and professional tools
• Certified technician with ongoing training

I pride myself on clear communication, quick turnaround times, and delivering quality repairs that exceed expectations. Whether it's a cracked screen, water damage, or complex hardware issue, I provide reliable solutions with transparent pricing.`,
    
    skills: [
      { name: 'iPhone Repair', level: 'Expert', years: 5 },
      { name: 'Samsung Repair', level: 'Expert', years: 4 },
      { name: 'Android Troubleshooting', level: 'Expert', years: 5 },
      { name: 'Screen Replacement', level: 'Expert', years: 5 },
      { name: 'Water Damage Repair', level: 'Advanced', years: 3 },
      { name: 'Micro-soldering', level: 'Advanced', years: 2 },
      { name: 'Battery Replacement', level: 'Expert', years: 4 },
      { name: 'Data Recovery', level: 'Intermediate', years: 2 }
    ],
    
    portfolio: [
      {
        id: 1,
        title: 'iPhone 13 Pro Water Damage Recovery',
        description: 'Complete restoration of water-damaged iPhone 13 Pro including motherboard cleaning and component replacement.'
      },
      {
        id: 2,
        title: 'Samsung Galaxy S22 Screen Assembly',
        description: 'Professional screen replacement with OLED display calibration and touch functionality testing.'
      },
      {
        id: 3,
        title: 'Bulk Phone Repair Service',
        description: 'Completed 25+ device repairs for local electronics shop including various iPhone and Android models.'
      }
    ],
    
    recentReviews: [
      {
        id: 1,
        client: 'Sarah K.',
        rating: 5,
        date: '1 week ago',
        jobTitle: 'iPhone 14 Screen Replacement',
        review: 'Ahmed did an excellent job repairing my iPhone 14 screen. Quick turnaround, professional service, and the phone works perfectly. Highly recommended!',
        jobAmount: 12000
      },
      {
        id: 2,
        client: 'Mohammad A.',
        rating: 5,
        date: '2 weeks ago',
        jobTitle: 'Samsung Galaxy Water Damage',
        review: 'Amazing work! My phone was completely dead after water damage and Ahmed brought it back to life. Great communication throughout the process.',
        jobAmount: 8500
      },
      {
        id: 3,
        client: 'Fatima R.',
        rating: 5,
        date: '3 weeks ago',
        jobTitle: 'Multiple Phone Repairs',
        review: 'Very professional and skilled technician. Fixed multiple phones for our family with warranty. Will definitely hire again.',
        jobAmount: 15000
      }
    ],
    
    certifications: [
      { name: 'iPhone Certified Repair Technician', issuer: 'Apple Authorized', year: 2023 },
      { name: 'Samsung Mobile Repair Certificate', issuer: 'Samsung Electronics', year: 2022 },
      { name: 'Micro-soldering Advanced Course', issuer: 'TechRepair Institute', year: 2023 }
    ],
    
    workHistory: [
      {
        id: 1,
        title: 'iPhone 12 Pro Max Complete Repair',
        client: 'Ali S.',
        amount: 18000,
        date: '2 days ago',
        rating: 5,
        feedback: 'Perfect repair work with quick delivery'
      },
      {
        id: 2,
        title: 'Bulk Android Phone Service',
        client: 'TechMart Electronics',
        amount: 35000,
        date: '1 week ago',
        rating: 5,
        feedback: 'Professional bulk repair service for our store'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-8">
            
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">AH</span>
              </div>
              {profileData.topRated && (
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Icon icon="heroicons:star" className="w-3 h-3 mr-1" />
                    Top Rated
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                    {profileData.verified && (
                      <Icon icon="heroicons:check-badge" className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  
                  <h2 className="text-xl text-gray-700 mb-4">{profileData.title}</h2>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
                      {profileData.location}
                    </div>
                    <div className="flex items-center">
                      <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
                      {profileData.availability}
                    </div>
                    <div className="flex items-center">
                      <Icon icon="heroicons:calendar" className="w-4 h-4 mr-1" />
                      Member since {profileData.joinDate}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Icon 
                              key={i} 
                              icon="heroicons:star" 
                              className={`w-4 h-4 ${i < Math.floor(profileData.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium">{profileData.rating}</span>
                      </div>
                      <p className="text-xs text-gray-600">{profileData.reviewsCount} reviews</p>
                    </div>
                    
                    <div>
                      <p className="text-lg font-bold text-gray-900">{profileData.jobSuccess}%</p>
                      <p className="text-xs text-gray-600">Job Success</p>
                    </div>
                    
                    <div>
                      <p className="text-lg font-bold text-gray-900">{profileData.completedJobs}</p>
                      <p className="text-xs text-gray-600">jobs completed</p>
                    </div>
                    
                    <div>
                      <p className="text-lg font-bold text-gray-900">{profileData.totalHours}</p>
                      <p className="text-xs text-gray-600">total hours</p>
                    </div>
                  </div>
                </div>

                {/* Rate Display */}
                <div className="mt-6 lg:mt-0 lg:ml-8 text-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">₹{profileData.rate}</p>
                    <p className="text-sm text-gray-600">per hour</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About Ahmed</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profileData.overview}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Skills & Expertise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{skill.name}</p>
                      <p className="text-sm text-gray-600">{skill.years} years experience</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      skill.level === 'Expert' ? 'bg-green-100 text-green-800' :
                      skill.level === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Portfolio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData.portfolio.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Icon icon="heroicons:photo" className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Reviews</h3>
              <div className="space-y-6">
                {profileData.recentReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{review.client.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.client}</p>
                          <p className="text-sm text-gray-600">{review.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Icon key={i} icon="heroicons:star" className="w-4 h-4 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">₹{review.jobAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">"{review.jobTitle}"</h4>
                    <p className="text-gray-700">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Work History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Work History</h3>
              <div className="space-y-4">
                {profileData.workHistory.map((work) => (
                  <div key={work.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{work.title}</h4>
                        <p className="text-sm text-gray-600">Client: {work.client}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{work.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{work.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {[...Array(work.rating)].map((_, i) => (
                        <Icon key={i} icon="heroicons:star" className="w-4 h-4 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-600">"{work.feedback}"</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Languages */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Languages</h4>
              <div className="space-y-3">
                {profileData.languages.map((lang, index) => (
                  <div key={index}>
                    <p className="font-medium text-gray-900">{lang.name}</p>
                    <p className="text-sm text-gray-600">{lang.level}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Response time:</span>
                  <span className="font-medium">{profileData.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total earned:</span>
                  <span className="font-medium">₹{profileData.totalEarned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Job success:</span>
                  <span className="font-medium">{profileData.jobSuccess}%</span>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Certifications</h4>
              <div className="space-y-4">
                {profileData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon icon="heroicons:academic-cap" className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{cert.name}</p>
                      <p className="text-xs text-gray-600">{cert.issuer} • {cert.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;