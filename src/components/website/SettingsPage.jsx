'use client';
import { Icon } from '@iconify/react';
import { useState, useMemo, useEffect } from 'react';
import Button from '../ui/button';
import Link from 'next/link';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import handleError from '@/helper/handleError';

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
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress': 
      case 'inprogress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'open': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'mdi:arrow-up-bold';
      case 'medium': return 'mdi:minus';
      case 'low': return 'mdi:arrow-down-bold';
      default: return 'mdi:minus';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'PKR') => {
    if (!amount || amount === 0) return 'Not specified';
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getWarrantyStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'expired': return { color: 'text-red-600', icon: 'mdi:alert-circle' };
      case 'active': return { color: 'text-green-600', icon: 'mdi:check-circle' };
      case 'void': return { color: 'text-gray-600', icon: 'mdi:cancel' };
      default: return { color: 'text-gray-600', icon: 'mdi:help-circle' };
    }
  };

  const warrantyInfo = getWarrantyStatus(task?.deviceInfo?.warrantyStatus);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-1">
            {task?.categoryId?.name || 'Repair Service'}
          </h3>
          <p className="text-sm text-gray-500">
            {task?.categoryId?.nameTurkish && `${task.categoryId.nameTurkish} • `}
            Job ID: {task?._id?.slice(-8) || 'N/A'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(task?.status)}`}>
            {task?.status || 'Unknown'}
          </span>
          {task?.urgency && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(task.urgency)}`}>
              <Icon icon={getUrgencyIcon(task.urgency)} className="w-3 h-3 mr-1" />
              {task.urgency}
            </span>
          )}
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Icon icon="mdi:devices" className="w-5 h-5 text-gray-600 mt-0.5" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">
              {task?.deviceInfo?.brand} {task?.deviceInfo?.model}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {task?.description || task?.turkishDescription || 'No description available'}
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Color:</span>
                <span className="ml-1 font-medium">{task?.deviceInfo?.color || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Year:</span>
                <span className="ml-1 font-medium">{task?.deviceInfo?.purchaseYear || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500">Warranty:</span>
                <Icon icon={warrantyInfo.icon} className={`w-3 h-3 ml-1 mr-1 ${warrantyInfo.color}`} />
                <span className={`font-medium text-xs ${warrantyInfo.color}`}>
                  {task?.deviceInfo?.warrantyStatus || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Views:</span>
                <span className="ml-1 font-medium">{task?.viewCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget and Location Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:cash" className="w-4 h-4 text-green-600" />
          <div>
            <span className="text-xs text-gray-500 block">Budget Range</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(task?.budget?.min)} - {formatCurrency(task?.budget?.max)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="mdi:map-marker" className="w-4 h-4 text-blue-600" />
          <div>
            <span className="text-xs text-gray-500 block">Location</span>
            <span className="text-sm font-medium text-gray-900">
              {task?.location?.city || 'Not specified'}
              {task?.location?.district && `, ${task.location.district}`}
            </span>
          </div>
        </div>
      </div>

      {/* Service Preferences */}
      {task?.servicePreferences && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="mdi:cog" className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Service Preferences</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200">
              {task.servicePreferences}
            </span>
          </div>
        </div>
      )}

      {/* Tags */}
      {task?.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg border border-primary-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Icon icon="mdi:calendar-plus" className="w-4 h-4 mr-1" />
            <span>Created: {formatDate(task?.createdAt)}</span>
          </div>
          {task?.expiresAt && (
            <div className="flex items-center">
              <Icon icon="mdi:clock-alert" className="w-4 h-4 mr-1" />
              <span>Expires: {formatDate(task.expiresAt)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit job"
          >
            <Icon icon="mdi:pencil" className="w-4 h-4" />
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View details"
          >
            <Icon icon="mdi:eye" className="w-4 h-4" />
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete job"
          >
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
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // You can adjust this
  const { token } = useSelector(state => state.auth);

  const fatchJobs = async () => {
    try {
      const { data } = await axiosInstance.get("/repair-jobs/my-jobs", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setJobs(data.data.jobs);
      console.log(data);
    } catch (err) {
      handleError(err);
    }
  }

  useEffect(() => {
    fatchJobs();
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPriority]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      (job?.turkishTitle && job?.turkishTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job?.turkishDescription && job?.turkishDescription?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || job?.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Optional: Scroll to top of jobs list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div>
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

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative col-span-2">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Jobs</p>
              <p className="text-3xl font-bold">{jobs?.length}</p>
            </div>
            <Icon icon="mdi:briefcase-outline" className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold">{jobs.filter(job => job.status === 'Completed').length}</p>
            </div>
            <Icon icon="mdi:check-circle-outline" className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold">{jobs.filter(job => job.status === 'In Progress').length}</p>
            </div>
            <Icon icon="mdi:clock-outline" className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Results Info */}
      {filteredJobs.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
          </p>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <label className="text-sm text-gray-600">Jobs per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4 mb-8">
        {currentJobs?.length > 0 ? (
          currentJobs?.map((task) => (
            <TaskCard key={task._id || task.id} task={task} />
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

      {/* Pagination */}
      {filteredJobs.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-6 py-4">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
            >
              <Icon icon="mdi:chevron-left" className="w-4 h-4 mr-1" />
              Previous
            </button>
          </div>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNumber, index) => (
              <button
                key={index}
                onClick={() => pageNumber !== '...' && handlePageChange(pageNumber)}
                disabled={pageNumber === '...'}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pageNumber === currentPage
                    ? 'bg-primary-600 text-white'
                    : pageNumber === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
            >
              Next
              <Icon icon="mdi:chevron-right" className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
    Object.values(tabConfig)?.map(({ id, label, icon }) => ({ id, label, icon })),
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
                {sidebarNavItems?.map((item) => (
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