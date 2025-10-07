"use client"

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

function EarningsReviewsPage() {
  const [activeTab, setActiveTab] = useState('earnings');
  const [earningsFilter, setEarningsFilter] = useState('all');
  const [reviewsFilter, setReviewsFilter] = useState('all');

  // Mock earnings data
  const earningsData = {
    summary: {
      totalEarnings: 485000,
      thisMonth: 85000,
      lastMonth: 74000,
      pending: 25000,
      available: 460000,
      growth: 15, // percentage
      totalJobs: 147,
      avgJobValue: 3299
    },
    monthlyEarnings: [
      { month: 'Jan 2024', amount: 65000, jobs: 18 },
      { month: 'Feb 2024', amount: 72000, jobs: 22 },
      { month: 'Mar 2024', amount: 68000, jobs: 20 },
      { month: 'Apr 2024', amount: 78000, jobs: 24 },
      { month: 'May 2024', amount: 82000, jobs: 26 },
      { month: 'Jun 2024', amount: 69000, jobs: 21 },
      { month: 'Jul 2024', amount: 74000, jobs: 23 },
      { month: 'Aug 2024', amount: 85000, jobs: 27 }
    ],
    transactions: [
      {
        id: 1,
        jobTitle: 'iPhone 14 Pro Screen Replacement',
        client: 'Sarah Ahmed',
        amount: 12000,
        date: '2024-08-24',
        status: 'completed',
        paymentMethod: 'Bank Transfer',
        jobId: 'JOB001'
      },
      {
        id: 2,
        jobTitle: 'Samsung Galaxy S23 Water Damage',
        client: 'Ahmed Khan',
        amount: 8500,
        date: '2024-08-23',
        status: 'pending',
        paymentMethod: 'Cash',
        jobId: 'JOB002'
      },
      {
        id: 3,
        jobTitle: 'Multiple iPhone Repairs',
        client: 'TechMart Electronics',
        amount: 25000,
        date: '2024-08-22',
        status: 'completed',
        paymentMethod: 'Bank Transfer',
        jobId: 'JOB003'
      },
      {
        id: 4,
        jobTitle: 'OnePlus 9 Pro Battery Replacement',
        client: 'Fatima Ali',
        amount: 6500,
        date: '2024-08-21',
        status: 'completed',
        paymentMethod: 'JazzCash',
        jobId: 'JOB004'
      },
      {
        id: 5,
        jobTitle: 'Xiaomi Redmi Note Charging Port',
        client: 'Hassan Malik',
        amount: 4000,
        date: '2024-08-20',
        status: 'completed',
        paymentMethod: 'EasyPaisa',
        jobId: 'JOB005'
      }
    ]
  };

  // Mock reviews data
  const reviewsData = {
    summary: {
      overallRating: 4.9,
      totalReviews: 89,
      fiveStars: 76,
      fourStars: 10,
      threeStars: 2,
      twoStars: 1,
      oneStars: 0,
      responseRate: 100,
      repeatClients: 23
    },
    reviews: [
      {
        id: 1,
        jobTitle: 'iPhone 14 Pro Screen Replacement',
        client: 'Sarah Ahmed',
        clientInitials: 'SA',
        rating: 5,
        date: '2024-08-24',
        review: 'Excellent work! Ahmed replaced my iPhone screen perfectly and the phone looks brand new. Very professional service, completed within the promised timeframe. The warranty gives me peace of mind. Highly recommended!',
        jobAmount: 12000,
        helpful: 8,
        category: 'iPhone Repair'
      },
      {
        id: 2,
        jobTitle: 'Samsung Galaxy S23 Water Damage Recovery',
        client: 'Ahmed Khan',
        clientInitials: 'AK',
        rating: 5,
        date: '2024-08-23',
        review: 'Amazing work! My phone was completely dead after water damage and Ahmed brought it back to life. Great communication throughout the process and very reasonable pricing. Will definitely use his services again.',
        jobAmount: 8500,
        helpful: 12,
        category: 'Water Damage Repair'
      },
      {
        id: 3,
        jobTitle: 'Multiple iPhone Repairs for Shop',
        client: 'TechMart Electronics',
        clientInitials: 'TE',
        rating: 5,
        date: '2024-08-22',
        review: 'Outstanding bulk repair service! Ahmed handled 8 different iPhone repairs with precision and care. All devices are working perfectly. Professional, reliable, and great for business partnerships.',
        jobAmount: 25000,
        helpful: 15,
        category: 'Bulk Service'
      },
      {
        id: 4,
        jobTitle: 'OnePlus 9 Pro Battery + Display',
        client: 'Fatima Ali',
        clientInitials: 'FA',
        rating: 4,
        date: '2024-08-21',
        review: 'Good quality repair work. Battery life is much better now and display looks great. Service took a bit longer than expected but the end result was worth it. Fair pricing for quality work.',
        jobAmount: 9500,
        helpful: 6,
        category: 'Battery Repair'
      },
      {
        id: 5,
        jobTitle: 'Xiaomi Redmi Note Charging Port',
        client: 'Hassan Malik',
        clientInitials: 'HM',
        rating: 5,
        date: '2024-08-20',
        review: 'Quick and efficient repair! Charging port works perfectly now. Ahmed explained the problem clearly and fixed it the same day. Very satisfied with the service and reasonable pricing.',
        jobAmount: 4000,
        helpful: 4,
        category: 'Charging Port Repair'
      },
      {
        id: 6,
        jobTitle: 'iPad Air 4 Screen Replacement',
        client: 'Zara Sheikh',
        clientInitials: 'ZS',
        rating: 4,
        date: '2024-08-18',
        review: 'Professional iPad screen replacement. Touch sensitivity is excellent and no dead pixels. Ahmed was careful with the device and provided good warranty terms. Recommended for tablet repairs.',
        jobAmount: 18000,
        helpful: 9,
        category: 'Tablet Repair'
      },
      {
        id: 7,
        jobTitle: 'iPhone 11 Water Damage Recovery',
        client: 'Maria Khan',
        clientInitials: 'MK',
        rating: 5,
        date: '2024-08-15',
        review: 'Incredible recovery work! My iPhone was submerged in water for hours and I thought it was gone forever. Ahmed managed to restore it completely. All functions work perfectly. Life saver!',
        jobAmount: 10000,
        helpful: 20,
        category: 'Water Damage Repair'
      },
      {
        id: 8,
        jobTitle: 'Samsung Galaxy A54 Software Issues',
        client: 'Ali Raza',
        clientInitials: 'AR',
        rating: 5,
        date: '2024-08-12',
        review: 'Fixed all software problems perfectly. Phone runs much smoother now. Ahmed has excellent troubleshooting skills and explained everything clearly. Great communication and fair pricing.',
        jobAmount: 3500,
        helpful: 7,
        category: 'Software Repair'
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-primary-100 text-primary-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const EarningsOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Icon icon="heroicons:banknotes" className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">${earningsData.summary.totalEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Earnings</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Icon icon="heroicons:calendar-days" className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">${earningsData.summary.thisMonth.toLocaleString()}</p>
              <p className="text-sm text-gray-600">This Month</p>
              <div className="flex items-center text-xs">
                <Icon icon="heroicons:arrow-up" className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500">+{earningsData.summary.growth}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Icon icon="heroicons:clock" className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">${earningsData.summary.pending.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Icon icon="heroicons:chart-bar" className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">${earningsData.summary.avgJobValue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Avg per Job</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Earnings</h3>
        <div className="space-y-4">
          {earningsData.monthlyEarnings.map((month, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900 w-20">{month.month}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 w-64">
                  <div 
                    className="bg-green-600 h-3 rounded-full" 
                    style={{ width: `${(month.amount / Math.max(...earningsData.monthlyEarnings.map(m => m.amount))) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${month.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{month.jobs} jobs</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <select
            value={earningsFilter}
            onChange={(e) => setEarningsFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Transactions</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <div className="space-y-4">
          {earningsData.transactions
            .filter(t => earningsFilter === 'all' || t.status === earningsFilter)
            .map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Icon icon="heroicons:banknotes" className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.jobTitle}</p>
                  <p className="text-sm text-gray-600">Client: {transaction.client}</p>
                  <p className="text-xs text-gray-500">{transaction.paymentMethod} • Job ID: {transaction.jobId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">${transaction.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ReviewsOverview = () => (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Icon icon="heroicons:star" className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{reviewsData.summary.overallRating}</p>
              <p className="text-sm text-gray-600">Overall Rating</p>
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <Icon 
                    key={i} 
                    icon="heroicons:star" 
                    className={`w-4 h-4 ${i < Math.floor(reviewsData.summary.overallRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Icon icon="heroicons:chat-bubble-left" className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{reviewsData.summary.totalReviews}</p>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Icon icon="heroicons:arrow-path" className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{reviewsData.summary.repeatClients}</p>
              <p className="text-sm text-gray-600">Repeat Clients</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Icon icon="heroicons:chart-pie" className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{reviewsData.summary.responseRate}%</p>
              <p className="text-sm text-gray-600">Response Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h3>
        <div className="space-y-3">
          {[
            { stars: 5, count: reviewsData.summary.fiveStars },
            { stars: 4, count: reviewsData.summary.fourStars },
            { stars: 3, count: reviewsData.summary.threeStars },
            { stars: 2, count: reviewsData.summary.twoStars },
            { stars: 1, count: reviewsData.summary.oneStars }
          ].map(rating => (
            <div key={rating.stars} className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm font-medium">{rating.stars}</span>
                <Icon icon="heroicons:star" className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full" 
                  style={{ width: `${(rating.count / reviewsData.summary.totalReviews) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12">{rating.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Client Reviews</h3>
          <select
            value={reviewsFilter}
            onChange={(e) => setReviewsFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Reviews</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>
        </div>

        <div className="space-y-6">
          {reviewsData.reviews
            .filter(r => reviewsFilter === 'all' || r.rating.toString() === reviewsFilter)
            .map(review => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-600">{review.clientInitials}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{review.client}</p>
                      <p className="text-sm text-gray-600">{review.jobTitle}</p>
                      <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()} • ${review.jobAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Icon 
                            key={i} 
                            icon="heroicons:star" 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{review.category}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">"{review.review}"</p>
                  {/* <div className="flex items-center text-sm text-gray-500">
                    <Icon icon="heroicons:hand-thumb-up" className="w-4 h-4 mr-1" />
                    <span>{review.helpful} people found this helpful</span>
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings & Reviews</h1>
          <p className="text-gray-600">Track your financial performance and client feedback</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'earnings', label: 'Earnings', icon: 'heroicons:banknotes' },
                { id: 'reviews', label: 'Reviews', icon: 'heroicons:star' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon icon={tab.icon} className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'earnings' && <EarningsOverview />}
        {activeTab === 'reviews' && <ReviewsOverview />}
      </div>
    </div>
  );
}

export default EarningsReviewsPage;