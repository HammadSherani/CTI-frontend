'use client';
import { Icon } from '@iconify/react';
import { useState, useMemo } from 'react';
import Button from '../ui/button';
import Link from 'next/link';

// Sample data for jobs
const JOB_DATA = [
  {
    id: 1,
    title: 'Design UI Mockups for Dashboard',
    description: 'Create high-fidelity mockups for the new user dashboard page using Figma. Focus on a clean and intuitive layout.',
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    tags: ['UI/UX', 'Design', 'Figma'],
    status: 'In Progress',
    priority: 'Medium'
  },
  {
    id: 2,
    title: 'API Integration for Payment Gateway',
    description: 'Integrate Stripe API to handle user subscriptions and one-time payments. Ensure all endpoints are secure.',
    startTime: '2:00 PM',
    endTime: '5:30 PM',
    tags: ['Development', 'API', 'High Priority'],
    status: 'Pending',
    priority: 'High'
  },
  {
    id: 3,
    title: 'Weekly Team Sync-Up',
    description: 'Discuss project progress, identify any blockers, and plan jobs for the upcoming sprint with the development team.',
    startTime: '9:00 AM',
    endTime: '9:45 AM',
    tags: ['Meeting', 'Planning'],
    status: 'Completed',
    priority: 'Low'
  },
  {
    id: 4,
    title: 'Code Review - Authentication Module',
    description: 'Review pull requests for the new authentication system implementation. Check for security vulnerabilities.',
    startTime: '3:30 PM',
    endTime: '4:15 PM',
    tags: ['Code Review', 'Security'],
    status: 'Pending',
    priority: 'High'
  }
];

// Task Card Component
const TaskCard = ({ task }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return 'mdi:arrow-up-bold';
      case 'Medium': return 'mdi:minus';
      case 'Low': return 'mdi:arrow-down-bold';
      default: return 'mdi:minus';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg text-gray-900 leading-tight">{task.title}</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            <Icon icon={getPriorityIcon(task.priority)} className="w-3 h-3 mr-1" />
            {task.priority}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{task.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {task.tags.map((tag) => (
          <span 
            key={tag} 
            className="px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg border border-primary-100"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <Icon icon="mdi:clock-outline" className="w-4 h-4 mr-2" />
          <span className="font-medium">{task.startTime} - {task.endTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Icon icon="mdi:pencil" className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Jobs Tab Content
const JobsTabContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredJobs = JOB_DATA.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || job.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      {/* Header with Add Job Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600 mt-1">Manage and track your daily tasks</p>
        </div>
        <Link href="/my-account/add-job">
          <Button className="mt-4 sm:mt-0 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2">
            <Icon icon="mdi:plus" className="w-5 h-5" />
            Add New Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Jobs</p>
              <p className="text-3xl font-bold">{JOB_DATA.length}</p>
            </div>
            <Icon icon="mdi:briefcase-outline" className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold">{JOB_DATA.filter(job => job.status === 'Completed').length}</p>
            </div>
            <Icon icon="mdi:check-circle-outline" className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold">{JOB_DATA.filter(job => job.status === 'In Progress').length}</p>
            </div>
            <Icon icon="mdi:clock-outline" className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">High Priority</p>
              <p className="text-3xl font-bold">{JOB_DATA.filter(job => job.priority === 'High').length}</p>
            </div>
            <Icon icon="mdi:alert-circle-outline" className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Icon icon="mdi:briefcase-search-outline" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first job.'
              }
            </p>
            <Link href="/jobs/create">
              <Button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg">
                <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                Create Your First Job
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Add Account Tab Content
const AddAccountTabContent = () => (
  <div>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Account</h1>
        <p className="text-gray-600 mt-1">Connect a new account to sync your data across platforms</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Google Account */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Icon icon="mdi:google" className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-gray-900">Google Account</h3>
            <p className="text-sm text-gray-500">Connect with Google services</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">Sync your Google Calendar, Drive, and Gmail data.</p>
        <Button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg">
          Connect Google
        </Button>
      </div>

      {/* Microsoft Account */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon icon="mdi:microsoft" className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-gray-900">Microsoft Account</h3>
            <p className="text-sm text-gray-500">Connect with Microsoft services</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">Sync your Outlook, OneDrive, and Office 365 data.</p>
        <Button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
          Connect Microsoft
        </Button>
      </div>

      {/* Slack Account */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Icon icon="mdi:slack" className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-gray-900">Slack Account</h3>
            <p className="text-sm text-gray-500">Connect with Slack workspace</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">Sync your Slack messages and workspace data.</p>
        <Button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
          Connect Slack
        </Button>
      </div>
    </div>
  </div>
);

// Sidebar Button Component
const SidebarButton = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
      ${isActive 
        ? 'bg-primary-50 text-primary-600 shadow-sm border border-primary-100' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
  >
    <Icon icon={item.icon} className="w-5 h-5" />
    <span>{item.label}</span>
  </button>
);

// Main Settings Page Component
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('jobs');

  // Dynamic tab configuration with content mapping
  const tabConfig = useMemo(() => ({
    jobs: {
      id: 'jobs',
      label: 'My Jobs',
      icon: 'mdi:briefcase-outline',
      content: <JobsTabContent />
    },
    account: {
      id: 'account',
      label: 'Add Account',
      icon: 'mdi:account-plus-outline',
      content: <AddAccountTabContent />
    }
  }), []);

  // Get navigation items from tab config
  const sidebarNavItems = useMemo(() => 
    Object.values(tabConfig).map(({ id, label, icon }) => ({ id, label, icon })),
    [tabConfig]
  );

  // Get current tab content
  const currentTabContent = tabConfig[activeTab]?.content || null;

  return (
    <div className="min-h-screen bg-gray-50 p-2 w-full mb-5">
      <div className="">
        {/* Page Header */}
        {/* <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your jobs and account settings</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors shadow-sm">
                <Icon icon="mdi:bell-outline" className="w-6 h-6" />
              </button>
              <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors shadow-sm">
                <Icon icon="mdi:cog-outline" className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-semibold">JD</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Main Content */}
        <div className="grid grid-cols-[280px_1fr] gap-4 bg-white rounded-2xl shadow-sm overflow-hidden min-h-[80vh]">
          
          {/* Sidebar */}
          <aside className="bg-gray-50/70 border-r border-gray-200/80">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Navigation</h2>
              <nav className="space-y-2">
                {sidebarNavItems.map((item) => (
                  <SidebarButton
                    key={item.id}
                    item={item}
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                  />
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="overflow-y-auto py-6 px-5">
            {currentTabContent || (
              <div className="text-center text-gray-500 mt-20">
                <Icon icon="mdi:alert-circle-outline" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Tab content not found</p>
              </div>
            )}
          </main>
          
        </div>
      </div>
    </div>
  );
}