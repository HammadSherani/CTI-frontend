// app/Dashboard.jsx
"use client"; // Required for client-side interactivity with Iconify and event handlers

import { Icon } from '@iconify/react';

export default function Dashboard() {
  // Updated mock data for mobile repair
  const dashboardData = {
    repairmanName: "Dummy",
    jobRequestsNearby: [
      {
        id: 1,
        title: "iPhone Screen Replacement",
        description: "Cracked iPhone 12 screen, needs urgent replacement",
        location: "DHA Phase 5, Lahore",
        budget: "8000-12000 TRY",
        urgency: "A",
        postedTime: "2 hours ago",
        client: "Sarah Khan",
      },
      {
        id: 2,
        title: "Samsung Battery Replacement",
        description: "Samsung Galaxy S20 battery drains quickly",
        location: "Gulberg III, Lahore",
        budget: "4000-6000 TRY",
        urgency: "B",
        postedTime: "4 hours ago",
        client: "Ali Raza",
      },
    ],
    activeOffers: [
      {
        id: 1,
        jobTitle: "OnePlus Charging Port Repair",
        client: "John Smith",
        offerAmount: 4500,
        status: "pending",
        submittedAt: "1 day ago",
      },
      {
        id: 2,
        jobTitle: "Xiaomi Software Issue",
        client: "Maria Dummy",
        offerAmount: 3000,
        status: "under_review",
        submittedAt: "3 hours ago",
      },
    ],
    messageNotifications: [
      {
        id: 1,
        from: "John Smith",
        message: "Can you fix the charging port by tomorrow?",
        time: "10 min ago",
        unread: true,
      },
      {
        id: 2,
        from: "System",
        message: "Your offer for iPhone screen repair has been accepted",
        time: "1 hour ago",
        unread: true,
      },
    ],
    walletBalance: 32000,
    currentRepairs: [
      {
        id: 1,
        title: "Huawei Screen and Battery Replacement",
        client: "Sarah Wilson",
        progress: 80,
        startDate: "Aug 20, 2025",
        estimatedCompletion: "Aug 25, 2025",
        amount: 10000,
      },
      {
        id: 2,
        title: "Oppo Water Damage Repair",
        client: "Dummy Khan",
        progress: 40,
        startDate: "Aug 22, 2025",
        estimatedCompletion: "Aug 28, 2025",
        amount: 7000,
      },
    ],
    walletTransactions: [
      { id: 1, type: "credit", description: "Payment for iPhone 11 Screen Repair", amount: 9000, date: "Aug 23, 2025" },
      { id: 2, type: "credit", description: "Samsung Battery Replacement Payment", amount: 5000, date: "Aug 22, 2025" },
      { id: 3, type: "debit", description: "Purchase of Screen Repair Tools", amount: 3000, date: "Aug 21, 2025" },
      { id: 4, type: "credit", description: "Xiaomi Software Fix Payment", amount: 3500, date: "Aug 20, 2025" },
      { id: 5, type: "debit", description: "Mobile Repair Parts Cost", amount: 2000, date: "Aug 19, 2025" },
    ],
  };

  const JobRequestCard = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Requests Nearby</h2>
      {dashboardData.jobRequestsNearby.map((job) => (
        <div key={job.id} className="space-y-4 mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded border border-gray-300 flex items-center justify-center">
              <Icon icon="heroicons:device-phone-mobile" className="w-8 h-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{job.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center">
                  <Icon icon="heroicons:map-pin" className="w-3 h-3 mr-1" />
                  {job.location}
                </span>
                <span>{job.postedTime}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-medium text-green-600">{job.budget}</span>
                {/* <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    job.urgency === "A" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  Priority {job.urgency}
                </span> */}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="flex-1 px-4 py-2 border border-gray-400 rounded text-gray-700 hover:bg-gray-50 text-sm">
              View Details
            </button>
            <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm">
              Place Offer
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const ActiveOffersCard = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Active Offers</h2>
      <div className="space-y-4">
        {dashboardData.activeOffers.slice(0, 1).map((offer) => (
          <div key={offer.id} className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-900">{offer.jobTitle}</h3>
              <p className="text-sm text-gray-600">Client: {offer.client}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold text-green-600">{offer.offerAmount.toLocaleString()} TRY</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${offer.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-primary-100 text-primary-800"
                    }`}
                >
                  {offer.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Submitted {offer.submittedAt}</p>
            </div>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center justify-center space-x-2">
              <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4" />
              <span>Chat with Customer</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );


  const MessageNotifications = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Message Notifications</h2>
        <button className="text-sm text-primary-600 hover:underline">View all</button>
      </div>

      <div className="space-y-2">
        {dashboardData.messageNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition 
            hover:bg-gray-50 hover:shadow-sm ${notification.unread ? "bg-primary-50" : "bg-white"
              }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {notification.avatar ? (
                <img
                  src={notification.avatar}
                  alt={notification.from}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                  {notification.from.charAt(0)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${notification.unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                    }`}
                >
                  {notification.from}
                </span>
                <span className="text-xs text-gray-400">{notification.time}</span>
              </div>
              <p
                className={`text-sm truncate ${notification.unread ? "text-gray-900 font-medium" : "text-gray-600"
                  }`}
              >
                {notification.message}
              </p>
            </div>

            {/* Unread dot */}
            {notification.unread && (
              <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></span>
            )}
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-4 text-center">
        <button className="text-sm text-gray-600 hover:text-primary-600 transition">
          See all messages
        </button>
      </div>
    </div>
  );


  const ActiveOffersSection = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Active Offers</h2>
      <div className="space-y-4">
        {dashboardData.activeOffers.map((offer) => (
          <div key={offer.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{offer.jobTitle}</h3>
                <p className="text-sm text-gray-600">Client: {offer.client}</p>
                <p className="text-xs text-gray-500 mt-1">Submitted {offer.submittedAt}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">{offer.offerAmount.toLocaleString()} TRY</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${offer.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-primary-100 text-primary-800"
                    }`}
                >
                  {offer.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const WalletBalance = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Balance</h2>
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-900 mb-2">₹{dashboardData.walletBalance.toLocaleString()}</div>
        <p className="text-sm text-gray-600">Available Balance</p>
        <div className="flex space-x-3 mt-4">
          <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
            Withdraw
          </button>
          <button className="flex-1 px-4 py-2 border border-gray-400 rounded text-gray-700 hover:bg-gray-50 text-sm">
            View History
          </button>
        </div>
      </div>
    </div>
  );

  const CurrentRepairs = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Repairs</h2>
      <div className="space-y-6">
        {dashboardData.currentRepairs.map((repair) => (
          <div key={repair.id} className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded border border-gray-300 flex items-center justify-center">
              <Icon icon="heroicons:device-phone-mobile" className="w-8 h-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{repair.title}</h3>
              <p className="text-sm text-gray-600">Client: {repair.client}</p>
              <div className="mt-2">
                {/* <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{repair.progress}%</span>
                </div> */}
                {/* <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${repair.progress}%` }}></div>
                </div> */}
              </div>
              <p className="text-xs text-gray-500 mt-2">Started: {repair.startDate}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">{repair.amount.toLocaleString()} TRY</p>
              <p className="text-xs text-gray-500 mt-1">Est. {repair.estimatedCompletion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const WalletBalanceDetailed = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Balance</h2>
      <div className="space-y-4">
        <div className="space-y-3">
          {dashboardData.walletTransactions.map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className={`p-1 rounded ${transaction.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                  <Icon
                    icon={transaction.type === "credit" ? "heroicons:arrow-down" : "heroicons:arrow-up"}
                    className={`w-3 h-3 ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
              </div>
              <span
                className={`font-semibold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
              >
                {transaction.type === "credit" ? "+" : "-"}{transaction.amount.toLocaleString()} TRY
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total Balance</span>
            <span className="font-bold text-xl text-gray-900">₹{dashboardData.walletBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-900">Welcome, {dashboardData.repairmanName}!</h1>
          <div className="px-4 py-2 border-2 border-gray-400 rounded text-gray-700 font-medium flex items-center space-x-2">
            <Icon icon="heroicons:shield-check" className="w-5 h-5 text-green-600" />
            <span>Verified Mobile Repair Technician</span>
          </div>
        </div>

        {/* Top Row - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <JobRequestCard />
          <ActiveOffersCard />
          <MessageNotifications />
        </div>

        {/* Middle Row - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveOffersSection />
          <WalletBalance />
        </div>

        {/* Bottom Row - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CurrentRepairs />
          <WalletBalanceDetailed />
        </div>
      </div>
    </div>
  );
}