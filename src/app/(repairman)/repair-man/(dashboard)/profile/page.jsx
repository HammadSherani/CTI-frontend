"use client"

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

function ProfilePage() {
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const profileData = {
    name: 'Hammad S.',
    username: '@Hammadkhan678910',
    title: 'Scalable & Efficient MERN Stack Developer',
    location: 'Pakistan (7:29 AM)',
    joinDate: 'July 12, 2020',
    availability: 'Available now',
    rate: 5, // per hour in USD
    totalEarned: 485000,
    jobSuccess: 0,
    completedJobs: 0,
    totalHours: 1250,
    rating: 0.0,
    reviewsCount: 0,
    responseTime: '1 hour',
    languages: [
      { name: 'Urdu', level: 'Native or bilingual' },
      { name: 'English', level: 'Professional' },
      { name: 'Punjabi', level: 'Conversational' }
    ],
    avatar: null,
    verified: false,
    topRated: false,
    overview: `I'm well known in MS office (MS word, MS excel, MS power point etc) i can convert pdf to word and at least in excel and I'm able to write a description blog`,

    skills: [
      { name: 'MERN Stack', level: 'Expert', years: 3 },
      { name: 'React.js', level: 'Expert', years: 4 },
      { name: 'Node.js', level: 'Expert', years: 3 },
      { name: 'MongoDB', level: 'Advanced', years: 3 },
      { name: 'Express.js', level: 'Expert', years: 3 },
      { name: 'JavaScript', level: 'Expert', years: 5 },
      { name: 'MS Office', level: 'Expert', years: 4 },
      { name: 'Data Entry', level: 'Advanced', years: 2 }
    ],

    portfolio: [
      {
        id: 1,
        title: 'E-commerce MERN Application',
        description: 'Full-stack e-commerce solution with payment integration and admin dashboard.'
      },
      {
        id: 2,
        title: 'Task Management System',
        description: 'React-based task management app with real-time updates and team collaboration features.'
      },
      {
        id: 3,
        title: 'Data Processing & Excel Automation',
        description: 'Automated data processing workflows and Excel macro development for business operations.'
      }
    ],

    recentReviews: [],

    certifications: [
      { name: 'MERN Stack Development', issuer: 'MongoDB University', year: 2023 },
      { name: 'Microsoft Office Specialist', issuer: 'Microsoft', year: 2022 },
      { name: 'JavaScript ES6+ Certification', issuer: 'FreeCodeCamp', year: 2023 }
    ],

    workHistory: [],

    verifications: {
      identity: false,
      payment: false,
      phone: false,
      email: false,
      facebook: false
    }
  };

  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'profile') {
          setProfileImage(e.target.result);
        } else if (type === 'cover') {
          setCoverImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <div
          className="h-80 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden"
          style={{
            backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* <div className="absolute top-4 right-4">
            <label className="cursor-pointer bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2">
              <Icon icon="heroicons:camera" className="w-4 h-4" />
              <span className="text-sm">Upload cover photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'cover')}
                className="hidden"
              />
            </label>
          </div> */}

          {/* <div className="absolute top-4 right-48">
            <button className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2">
              <Icon icon="heroicons:eye" className="w-4 h-4" />
              <span className="text-sm">View client profile</span>
            </button>
          </div> */}
        </div>

        {/* Profile Section */}
        <div className="relative -mt-[185px]  mx-auto px-6">
          <div className="flex items-end justify-between">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-4">

              {/* Profile Image */}
              <div className=" flex items-center gap-3 bg-white/90 p-6 rounded-md">

                <div className='relative'>
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary-600">
                          {profileData.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Edit Profile Image Button */}
                  <label className="absolute bottom-2 right-2 cursor-pointer bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                    <Icon icon="heroicons:camera" className="w-4 h-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profile')}
                      className="hidden"
                    />
                  </label>
                </div>



                <div className="">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                    <span className="text-gray-500">{profileData.username}</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Icon icon="heroicons:share" className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            icon="heroicons:star"
                            className={`w-4 h-4 ${i < Math.floor(profileData.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{profileData.rating}</span>
                      <span className="text-sm text-gray-500">({profileData.reviewsCount})</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Icon icon="heroicons:currency-dollar" className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{profileData.jobSuccess}%</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Icon icon="heroicons:clock" className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{profileData.completedJobs}%</span>
                    </div>
                  </div>

                  <h2 className="text-xl text-gray-700 mb-4 font-medium">{profileData.title}</h2>

                  {/* <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">${profileData.rate} USD / Hour</span>
                        <span>•</span>
                        <Icon icon="heroicons:flag" className="w-4 h-4 text-green-600" />
                        <span>{profileData.location}</span>
                        <span>•</span>
                        <span>Joined on {profileData.joinDate}</span>
                      </div>
                    </div> */}

                  {/* Profile Description */}
                  {/* <div className="mb-6">
                      <p className="text-gray-700 leading-relaxed">{profileData.overview}</p>
                    </div> */}
                </div>
                {/* Online Status */}
                {/* <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div> */}
              </div>

              {/* Profile Info */}
              <div className="">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">


                  {/* Edit Profile Button */}
                  {/* <div className="mt-6 lg:mt-0">
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                      <Icon icon="heroicons:pencil" className="w-4 h-4" />
                      <span>Edit profile</span>
                    </button>
                  </div> */}
                </div>
              </div>
            </div>

            <div class="flex items-end gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm text-sm font-medium
           bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2
           focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2.4l-.72-1.08A2 2 0 0011.9 3H8.1a2 2 0 00-1.98 1.92L5.4 5H4z" />
                  <path d="M10 8a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
                update shop photo
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
           bg-indigo-600 text-white shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2
           focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 16a6 6 0 1116 0H2z" clip-rule="evenodd" />
                </svg>
                update profile
              </button>
            </div>


            {/* Tabs */}
            {/* <div className="mt-8 border-t pt-6">
              <div className="flex items-center space-x-8 border-b">
                <button className="pb-4 border-b-2 border-green-600 text-green-600 font-medium">
                  <Icon icon="heroicons:user" className="w-4 h-4 inline mr-2" />
                  General
                </button>
                <button className="pb-4 text-gray-600 hover:text-gray-900 font-medium flex items-center">
                  <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
                  Add profile
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Verifications Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verifications</h3>
          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-2 ${profileData.verifications.identity ? 'text-green-600' : 'text-gray-400'}`}>
              <Icon icon="heroicons:identification" className="w-5 h-5" />
              <span className="text-sm">ID Verified</span>
            </div>
            <div className={`flex items-center space-x-2 ${profileData.verifications.payment ? 'text-green-600' : 'text-gray-400'}`}>
              <Icon icon="heroicons:credit-card" className="w-5 h-5" />
              <span className="text-sm">Payment Verified</span>
            </div>
            <div className={`flex items-center space-x-2 ${profileData.verifications.phone ? 'text-green-600' : 'text-gray-400'}`}>
              <Icon icon="heroicons:phone" className="w-5 h-5" />
              <span className="text-sm">Phone Verified</span>
            </div>
            <div className={`flex items-center space-x-2 ${profileData.verifications.email ? 'text-green-600' : 'text-gray-400'}`}>
              <Icon icon="heroicons:envelope" className="w-5 h-5" />
              <span className="text-sm">Email Verified</span>
            </div>
            <div className={`flex items-center space-x-2 ${profileData.verifications.facebook ? 'text-primary-600' : 'text-gray-400'}`}>
              <Icon icon="heroicons:globe-alt" className="w-5 h-5" />
              <span className="text-sm">Facebook</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Skills & Expertise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{skill.name}</p>
                      <p className="text-sm text-gray-600">{skill.years} years experience</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${skill.level === 'Expert' ? 'bg-green-100 text-green-800' :
                      skill.level === 'Advanced' ? 'bg-primary-100 text-primary-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            {/* <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Portfolio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData.portfolio.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <Icon icon="heroicons:photo" className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Work History */}
            {profileData.workHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Work History</h3>
                <div className="text-center py-8 text-gray-500">
                  <Icon icon="heroicons:briefcase" className="w-12 h-12 mx-auto mb-4" />
                  <p>No work history available yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Languages */}
            <div className="bg-white rounded-lg shadow-sm p-6">
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

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Certifications</h4>
              <div className="space-y-4">
                {profileData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon icon="heroicons:academic-cap" className="w-6 h-6 text-primary-600" />
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