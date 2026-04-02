"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { useRouter,Link } from '@/i18n/navigation';

import { Dropdown, UrgencyDropdown } from '@/components/dropdown';
import { JobCardSkeleton } from '@/components/Skeltons';
import { Pagination } from '@/components/pagination';
import SearchInput from '@/components/SearchInput';
import useDebounce from '@/hooks/useDebounce';

const MyJobsPage = () => {
  const [activeTab, setActiveTab] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 500);
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  // const [expandedJob, setExpandedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showMore, setShowMore] = useState(false);
  const textRef = useRef(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  console.log('Selected State:', selectedState, 'Selected City:', selectedCity);
  console.log('States:', states);
  console.log('Cities:', cities);
  const { token } = useSelector((state) => state.auth);
  // const router = useRouter();

  const handleStateChange = (stateId) => {
    setSelectedState(stateId);
    setSelectedCity('');
  };

  console.log('Selected urgencyFilter:', urgencyFilter);

const fetchJobs = async () => {
  try {
    setError(null);
    setLoading(true);

        if (jobs.length === 0) {
      setLoading(true);
    }

    const params = new URLSearchParams();

    if (selectedState) {
      params.append('state', selectedState);
    }

    if (selectedCity) {
      params.append('city', selectedCity);
    }

    console.log('Selected urgency filter:', urgencyFilter);
    if (urgencyFilter) {
      console.log('Applying urgency filter:', urgencyFilter);
      params.append('priority', urgencyFilter);
    }
if (debouncedSearch) {
  params.append("search", debouncedSearch);
}
    params.append('page', page);
    params.append('limit', 6);


    const url = `/repairman/jobs?${params.toString()}`;

    const { data } = await axiosInstance.get(url, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    setJobs(data?.data?.jobs || []);
    setStates(data?.data?.states || []);
    setCities(data?.data?.cities || []);
    setPagination(data?.pagination);

  } catch (error) {
    console.error('Error fetching jobs:', error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to load jobs.';
    setError(errorMessage);
    handleError(error);
  } finally {
    setLoading(false);
  }
};

  const refreshJobs = async () => {
    await fetchJobs();
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedState, selectedCity,urgencyFilter, page,debouncedSearch]);

  const getJobStatus = (job) => {
    if (job.status === 'offers_received') {
      return job.hasSubmittedOffer ? 'offer-submitted' : 'available';
    }
    return job.status;
  };

 const getUrgencyLevel = (urgencyScore) => {
  if (typeof urgencyScore === "string") return urgencyScore;

  if (urgencyScore >= 3) return "high";
  if (urgencyScore >= 2) return "medium";
  return "low";
};

  const formatCurrency = (amount, currency="s") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

 const getTimeRemaining = (expiresAt) => {
  console.log("Calculating time remaining for:", expiresAt);
  const expiryTime = new Date(expiresAt).getTime(); // 🔥 convert to ms

  if (isNaN(expiryTime)) return null; // invalid date

  const diff = expiryTime - Date.now();

  if (diff <= 0) return "Expired";

  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}`;
  }

  return `${hours} hour${hours !== 1 ? "s" : ""}`;
};

  // Add this function in your component (outside JobCard)
const getTimeAgo = (createdAt) => {
  if (!createdAt) return "Recently";

  const createdDate = new Date(createdAt);
  const now = new Date();
  
  const diffInMs = now - createdDate;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return "just now";
  }
  if (diffInHours < 24) {
    return `${diffInHours} hours`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days`;
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'offer-submitted': return 'bg-purple-100 text-purple-800';
      case 'offers_received': return 'bg-primary-100 text-primary-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // const categorizeJobs = (jobs) => {
  //   const open = jobs.filter(job =>
  //     job.status === 'offers_received' ||
  //     job.status === 'in-progress' ||
  //     job.status === 'accepted' ||
  //     job.status === 'open' ||
  //     job.status === 'pending'
  //   );

  //   const completed = jobs.filter(job => job.status === 'completed');

  //   return { open, completed };
  // };

  // const categorizedJobs = useMemo(() => categorizeJobs(jobs), [jobs]);

  // const filteredJobs = useMemo(() => {
  //   const jobsToFilter = categorizedJobs[activeTab] || [];
  //   return jobsToFilter.filter((job) => {
  //     const matchesSearch =
  //       job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       job.turkishTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       job.turkishDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       job.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       job.location?.address?.toLowerCase().includes(searchQuery.toLowerCase());

  //     const jobUrgency = getUrgencyLevel(job.urgencyScore);
  //     const matchesUrgency = urgencyFilter === 'all' || jobUrgency === urgencyFilter;

  //     return matchesSearch && matchesUrgency;
  //   });
  // }, [activeTab, searchQuery, urgencyFilter, categorizedJobs]);

const JobCard = ({ job, expandedJob, setExpandedJob, activeTab }) => {
  const jobStatus = getJobStatus(job);
  const urgency = getUrgencyLevel(job.urgency);
  const customerInitials = job.customerId?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU';
 const router=useRouter()

  const Expired=  getTimeRemaining(job.expiresAt) === "Expird"
  useEffect(() => {
    const el = textRef.current;
    if (el) {
      const isOverflowing = el.scrollHeight > el.clientHeight;
      setShowMore(isOverflowing);
    }
  }, [job?.description]);
  return (
    <div onClick={()=>router.push(`/repair-man/job-board/${job?._id}`)} disabled={Expired} className={` ${Expired?"opacity-30 cursor-not-allowed":""} hover:bg-gray-50 bg-white  rounded-3xl overflow-hiddentransition-all duration-300`}>
      {/* Header */}
      <div className="px-3 pt-6 pb-4  ">
        <div className="flex items-center -ml-5 justify-between  gap-3">
        
            <div className="flex px-6 py-3 flex-wrap items-center gap-3 text-sm">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full font-medium ${getStatusColor(jobStatus)}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${jobStatus === 'open' ? 'bg-green-400' :
                jobStatus === 'in-progress' ? 'bg-yellow-400' : 'bg-gray-400'
                }`}></div>
              {jobStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>

            <span className={`inline-flex items-center px-3 py-1.5 rounded-full font-medium ${getUrgencyColor(urgency)}`}>
              <Icon icon="heroicons:clock" className="w-3 h-3 mr-1" />
              {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
            </span>
{job.expiresAt && (
  <span className="inline-flex items-center text-orange-600 font-medium">
    <Icon icon="heroicons:fire" className="w-4 h-4 mr-1" />

    {getTimeRemaining(job.expiresAt) === "Expired"
      ? "Expired"
      : `Expires in ${getTimeRemaining(job.expiresAt)}`}
  </span>
)}
          </div>
          <div className='p-1 -mt-3  flex items-center gap-2'>
              <Icon icon="iconamoon:clock" className="text-3xl text-gray-600" />
              <p className="text-xs text-zinc-500">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
        </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center mt-2 gap-4">
            <div className="w-10 h-10 bg-gray-100 r flex items-center justify-center p-2 rounded-full border-gray-300 border">
              <Icon icon="mdi:cellphone" className="text-3xl text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-black mt-1">
                {job?.deviceInfo?.brand} {job?.deviceInfo?.model}
              </h3>
            </div>
          </div>

 
        </div>
      </div>

         <div className="flex gap-2 items-center ">
            <div className="text-gray-500  text-md font-bold ml-5">TRY {job.budget?.min?.toLocaleString()} – {job.budget?.max?.toLocaleString()}</div>
          {console.log(job,"jobs")}
           {job.createdAt && (
              <div className="text-orange-400 text-sm  font-medium">
                Posted {getTimeAgo(job.createdAt)} ago
              </div>
            )}
          </div>
      {/* Description */}
     <div className="px-6 py-6 mb-2 text-gray-400 leading-relaxed text-[15.5px]">
  
  <p ref={textRef} className="line-clamp-2 overflow-hidden">
    {job?.description}
  </p>

  {showMore && (
    <span
      onClick={() => router.push(`/job-board/${job?._id}`)}
      className="text-orange-500 cursor-pointer hover:underline ml-1"
    >
      more
    </span>
  )}

</div>


      {/* Tags */}
      <div className="px-6 pb-6 flex flex-wrap gap-2">
        {job.services?.map((service, index) => (
          <span
            key={index}
            className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-900 border border-zinc-400"
          >
            {service?.name}
          </span>
        ))}

        
      </div> 
      
  

      {/* Footer */}

      <div className='px-6 py-5  border-t border-gray-300'>
        <div className="flex items-center gap-2 text-gray-800">
            <span>Offers Received: <span className="text-white">{job.offers?.length || 0}</span></span>
          </div>
     <div className=" flex items-center justify-between text-sm">
          
        <div className="flex items-center gap-6 text-zinc-400">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:map-marker" className="text-xl text-primary-600" />
            <span className="font-medium">{job.location?.address}</span>
          </div>
          
        </div>
  <div className="p-6 pt-4  border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            {activeTab === 'open' && (
              <>
                {!job.hasSubmittedOffer && job.canSubmitOffer && (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    <Icon icon="heroicons:paper-airplane" className="w-4 h-4 inline mr-2" />
                    Submit Offer
                  </button>
                )}

                {job.hasSubmittedOffer && job.status === 'offers_received' && (
                  <>
                    <button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                      <Icon icon="heroicons:eye" className="w-4 h-4 inline mr-2" />
                      View Your Offer
                    </button>
                    <button className="flex-1 border-2 border-red-300 text-red-700 py-3 px-6 rounded-xl font-semibold hover:bg-red-50 hover:border-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                      <Icon icon="heroicons:trash" className="w-4 h-4 inline mr-2" />
                      Withdraw Offer
                    </button>
                  </>
                )}

                {['in-progress', 'accepted'].includes(job.status) && (
                  <>
                    <button  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                      <Icon icon="heroicons:arrow-path" className="w-4 h-4 inline mr-2" />
                      Update Progress
                    </button>
                    <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                      <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4 inline mr-2" />
                      Message Client
                    </button>
                  </>
                )}
              </>
            )}

            {/* <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              <Link href={'/repair-man/job-board/' + job._id} className="flex items-center justify-center w-full h-full">
                <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </button> */}
          </div>
        </div>
        <button  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-semibold transition-all active:scale-95">
             <Link  href={'/repair-man/job-board/' + job._id} className="flex items-center text-nowrap justify-center w-full h-full">
                <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4 mr-2" />
                View Details
              </Link>
          {/* Post Offers */}
        </button>
      </div>
      </div>
 
    </div>
  );
};

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon
          icon={
            type === 'open' ? 'heroicons:briefcase' : 'heroicons:check-circle'
          }
          className="w-8 h-8 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type} jobs
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {type === 'open' ? 'No open jobs available at the moment.' : 'You haven\'t completed any jobs yet.'}
      </p>
      {type === 'open' && (
        <button
          onClick={refreshJobs}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:from-primary-700 hover:to-green-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Refresh Jobs
        </button>
      )}
    </div>
  );

  

  const handleClearFilters = () => {
    setSearchQuery('');
    setUrgencyFilter('all');
    setSelectedState('');
    setSelectedCity('');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshJobs}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-10 ">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Jobs</h1>
            <p className="text-gray-600 text-lg">Manage your repair jobs and track progress with ease</p>
          </div>

<div className="mb-6 p-4 rounded-xl border border-gray-200 shadow-sm bg-white 
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">

  {/* Search */}
  <div className="relative col-span-1 sm:col-span-2 lg:col-span-4">
   <SearchInput
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search jobs..."
  className="col-span-1 sm:col-span-2 lg:col-span-4"
/>
  </div>

  {/* State */}
  <div className="col-span-1 sm:col-span-1 lg:col-span-2">
    <Dropdown
      label="State"
      options={states}
      value={selectedState}
      onChange={setSelectedState}
      isSearch
      icon="heroicons:map-pin"
    />
  </div>

  {/* City */}
  <div className="col-span-1 sm:col-span-1 lg:col-span-2">
    <Dropdown
      label="City"
      options={cities}
      value={selectedCity}
      onChange={setSelectedCity}
      isSearch
      icon="heroicons:building-office"
      disabled={!cities.length}
    />
  </div>

  {/* Priority */}
  <div className="col-span-1 sm:col-span-1 lg:col-span-2">
    <UrgencyDropdown
      urgencyFilter={urgencyFilter}
      setUrgencyFilter={setUrgencyFilter}
    />
  </div>

  {/* Clear */}
  <div className="col-span-1 sm:col-span-2 lg:col-span-2">
    <button
      onClick={handleClearFilters}
      className="w-full py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition text-sm shadow-sm"
    >
      Clear Filters
    </button>
  </div>

</div>

          <div className=" rounded-xl border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-2 sm:space-x-8 px-4 sm:px-6 -mb-px" role="tablist">
                {[
                  // { id: 'open', label: 'Open Jobs', count: tabCounts.open },
                  // { id: 'completed', label: 'Completed Jobs', count: tabCounts.completed },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 sm:px-4 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                      }`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs font-medium">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="" role="tabpanel" id={`${activeTab}-panel`}>
              {loading ? (
  <div className="space-y-6">
    {[...Array(5)].map((_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </div>
) : jobs.length > 0 ? (
  <div className="space-y-6">
    {jobs.map((job) => (
      <JobCard key={job._id} job={job} />
    ))}
  </div>
) : (
  <EmptyState type={activeTab} />
)}
            </div>
          </div>
          <Pagination
  pagination={pagination}
  onPageChange={(p) => setPage(p)}
/>
        </div>
      </div>
  );
};

export default MyJobsPage;