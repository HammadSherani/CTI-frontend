'use client';
import { Icon } from '@iconify/react';
import { useState, useMemo, useEffect } from 'react';
import Button from '../ui/button';
import Link from 'next/link';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import handleError from '@/helper/handleError';
import { useRouter } from 'next/navigation';




const JobDescription = ({ job }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const description = job?.description || '';
  const wordLimit = 100;

  // Function to split description into words
  const getShortDescription = () => {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  };

  return (
    <div className="job-description mb-4">
      <h3 className="text-sm leading-5 mb-1">
        {isExpanded ? description : getShortDescription()}
      </h3>
      {description.split(' ').length > wordLimit && (
        <button
          className="text-sm text-primary-500 mt-2 hover:underline focus:outline-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'See Less' : 'See More'}
        </button>
      )}
    </div>
  );
};

// Task Card Component
const RepairJobCard = ({ job }) => {
  const router = useRouter();

  const getStatusColor = (status) => {
    const statusColors = {
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'in_progress': 'bg-primary-100 text-primary-800 border-primary-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'open': 'bg-orange-100 text-orange-800 border-orange-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'expired': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyColor = (urgency) => {
    const urgencyColors = {
      'high': 'bg-red-100 text-red-800 border-red-200',
      'medium': 'bg-orange-100 text-orange-800 border-orange-200',
      'low': 'bg-green-100 text-green-800 border-green-200'
    };
    return urgencyColors[urgency?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyIcon = (urgency) => {
    const urgencyIcons = {
      'high': 'mdi:arrow-up-bold',
      'medium': 'mdi:minus',
      'low': 'mdi:arrow-down-bold'
    };
    return urgencyIcons[urgency?.toLowerCase()] || 'mdi:minus';
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

  const getWarrantyInfo = (status) => {
    const warrantyMap = {
      'expired': { color: 'text-red-600', icon: 'mdi:alert-circle', text: 'Expired' },
      'active': { color: 'text-green-600', icon: 'mdi:check-circle', text: 'Active' },
      'void': { color: 'text-gray-600', icon: 'mdi:cancel', text: 'Void' }
    };
    return warrantyMap[status?.toLowerCase()] || { color: 'text-gray-600', icon: 'mdi:help-circle', text: status || 'Unknown' };
  };

  const getServicePreferenceIcon = (preference) => {
    return preference?.toLowerCase() === 'pickup' ? 'mdi:car' : 'mdi:store';
  };

  const isJobExpiringSoon = () => {
    if (!job?.expiresAt) return false;
    const expiryDate = new Date(job.expiresAt);
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysLeft <= 2 && daysLeft > 0;
  };

  const isJobExpired = () => {
    if (!job?.expiresAt) return false;
    return new Date(job.expiresAt) < new Date();
  };

  const warrantyInfo = getWarrantyInfo(job?.deviceInfo?.warrantyStatus);
  const jobId = job?._id?.slice(-8) || 'N/A';
  const deviceName = `${job?.deviceInfo?.brand + " " + job?.deviceInfo?.model + " - " + job?.services?.map(service => service).join(', ') || 'N/A'}`;

  const totalOffer = job?.offers?.length || 0;


  return (
    <div
      onClick={() => router.push(`/my-account/${job?._id}/job-details`)}
      className={`bg-white hover:bg-gray-100 hover:cursor-pointer border rounded-xl p-6 shadow-sm hover:shadow-sm transition-all duration-200 hover:border-gray-300 ${isJobExpired() ? 'opacity-75 border-red-200' : 'border-gray-200'
        }`}>
      {/* Header Section */}
      <div className="flex justify-between  flex-1 mb-3">
        <div className=" ">
          <div className="flex items-center gap-3 mb-2 flex-1">
            <div className=" ">
              <h3 className="font-bold flex-1  text-gray-800  line-clamp-3 min-w-[70%] max-w-[98%] text-lg capitalize">
                {deviceName}
              </h3>
              <div className="flex items-center gap-3 mt-1">
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <div className="text-right">
            {job?.budget?.min && job?.budget?.max ? (
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(job.budget.min, job.budget.currency)} -{' '}
                {formatCurrency(job.budget.max, job.budget.currency)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Not specified</p>
            )}
          </div>
        </div>
      </div>
      <JobDescription job={job} />

      {job?.services && job.services.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Required Services</h4>
          <div className="flex flex-wrap gap-2">
            {job.services.map((service, index) => (
              <span
                key={index}
                className="px-4 py-2 text-sm font-medium text-primary-800  rounded-lg border "
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
       <div className="flex items-center gap-4 text-xs text-gray-500">
  {/* Status badge */}
  {job?.status && (
    <span className="inline-block bg-primary-100 text-primary-800 font-medium px-3 py-1 rounded-full capitalize">
      {job.status}
    </span>
  )}

  {/* Expiry date badge */}
  {job?.expiresAt && (
    <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg">
      <Icon icon="mdi:clock-outline" className="w-4 h-4" />
      <span
        className={`font-medium ${
          isJobExpiringSoon() || isJobExpired() ? 'text-red-600' : 'text-gray-600'
        }`}
      >
        Expires: {formatDate(job.expiresAt)}
      </span>
    </div>
  )}
</div>


        <div className="flex items-center gap-2">
          Offers Received: {totalOffer}
        </div>
      </div>
    </div>
  );
};

// Jobs Tab Content
const JobsTabContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // Changed from filterStatus to activeTab
  const [filterPriority, setFilterPriority] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [loading, setLoading] = useState(false);
  const { token } = useSelector(state => state.auth);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/repair-jobs/my-jobs", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setJobs(data.data.jobs);
      console.log(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, filterPriority]);

  // Tab configuration
  const tabs = [
    { id: 'all', label: 'All Jobs', icon: 'mdi:view-list' },
    { id: 'open', label: 'Open', icon: 'mdi:clock-outline' },
    { id: 'booked', label: 'Booked', icon: 'mdi:clock-outline' },
    { id: 'in_progress', label: 'In Progress', icon: 'mdi:cog' },
    { id: 'completed', label: 'Completed', icon: 'mdi:check-circle' }
  ];

  // Get job counts for each tab
  const getJobCounts = () => {
    return {
      all: jobs.length,
      open: jobs.filter(job => job.status === 'open').length,
      booked: jobs.filter(job => job.status === 'booked').length,
      in_progress: jobs.filter(job => job.status === 'in_progress').length,
      completed: jobs.filter(job => job.status === 'completed').length
    };
  };

  const jobCounts = getJobCounts();

  const filteredJobs = jobs.filter(job => {
    // Update search logic to match your actual data structure
    const matchesSearch = (
      job?.deviceInfo?.brand?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.deviceInfo?.color?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.services?.some(service => service.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job?.location?.city?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.location?.address?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.urgency?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.servicePreference?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );

    const matchesStatus = activeTab === 'all' || job?.status === activeTab;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  // Get urgency counts for stats
  const getUrgencyStats = () => {
    const urgent = jobs.filter(job => job.urgency === 'high').length;
    const medium = jobs.filter(job => job.urgency === 'medium').length;
    const low = jobs.filter(job => job.urgency === 'low').length;
    return { urgent, medium, low };
  };

  const urgencyStats = getUrgencyStats();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Repair Jobs</h1>
          <p className="text-gray-600 mt-1">Manage and track your device repair requests</p>
        </div>
        <Link href="/mobile-repair">
          <Button className="mt-4 sm:mt-0 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2">
            <Icon icon="mdi:plus" className="w-5 h-5" />
            New Repair Request
          </Button>
        </Link>
      </div>

      {/* Tab Menu */}
      <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon icon={tab.icon} className="w-4 h-4" />
                {tab.label}
                <span className={`px-2 py-1 text-xs rounded-full ${activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {jobCounts[tab.id]}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search Bar inside tab container */}
        <div className="p-6">
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by brand, service, location, color..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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
        {loading ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your repair jobs...</p>
          </div>
        ) : currentJobs?.length > 0 ? (
          currentJobs?.map((job) => (
            <RepairJobCard key={job._id || job.id} job={job} />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Icon icon="mdi:tools" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'all' ? 'No repair jobs found' : `No ${activeTab.replace('_', ' ')} jobs found`}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || activeTab !== 'all'
                ? 'Try adjusting your search or switching to a different tab.'
                : 'Get started by creating your first repair request.'
              }
            </p>
            <Link href="/mobile-repair">
              <Button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg">
                <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                Create Repair Request
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
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Icon icon="mdi:microsoft" className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-gray-900">Microsoft Account</h3>
            <p className="text-sm text-gray-500">Connect with Microsoft services</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">Sync your Outlook, OneDrive, and Office 365 data.</p>
        <Button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg">
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('jobs');

  const tabConfig = useMemo(() => ({
    jobs: {
      id: 'jobs',
      label: 'My Jobs',
      icon: 'mdi:briefcase-outline',
      content: <JobsTabContent />
    },

    bookedJobs: {
      id: 'bookedJobs',
      label: 'Booked Jobs',
      icon: 'mdi:briefcase-outline',
      content:<AddAccountTabContent />
    },
    // account: {
    //   id: 'account',
    //   label: 'Add Account',
    //   icon: 'mdi:account-plus-outline',
    //   content: <AddAccountTabContent />
    // }
  }), []);

  const sidebarNavItems = useMemo(() =>
    Object.values(tabConfig)?.map(({ id, label, icon }) => ({ id, label, icon })),
    [tabConfig]
  );

  const currentTabContent = tabConfig[activeTab]?.content || null;

  return (
    <div className="min-h-screen bg-gray-50 p-2 w-full mb-5">
      <div className="">
        <div className="grid grid-cols-[280px_1fr] gap-4 bg-white rounded-2xl shadow-sm overflow-hidden min-h-[80vh]">
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