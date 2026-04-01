"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, Link } from '@/i18n/navigation';
import { addChat } from '@/store/chat';
import { useChat } from '@/hooks/useChat';
import { UrgencyDropdown } from '@/components/dropdown';
import SummaryCards from '@/components/SumamryCards';
import SearchInput from '@/components/SearchInput';
import useDebounce from '@/hooks/useDebounce';
import { JobCardSkeleton } from '@/components/Skeltons';


// ─── JobCard ─────────────────────────────────────────────────────────────────
const JobCard = ({ booking, handleMessageSend }) => {
  const router  = useRouter();
  const textRef = useRef(null);
  const [showMore, setShowMore] = useState(false);

  // Flatten for convenience
  const job            = booking.jobDetails  || {};
  const bookingDetails = booking.bookingDetails || {};
  const bookingStatus  = bookingDetails.status || 'unknown';
  const canUpdateStatus = booking.canUpdateStatus;
  const canChat         = booking.canChat;
  const isQuotationBased = booking.isQuotationBased || booking.bookingSource === 'direct_message';

  // ── helpers ────────────────────────────────────────────────────────────────
  const getBrandName = () => {
    const b = job?.deviceInfo?.brand;
    if (!b) return '';
    return typeof b === 'object' ? b.name || '' : b;
  };
  const getModelName = () => {
    const m = job?.deviceInfo?.model;
    if (!m) return '';
    return typeof m === 'object' ? m.name || '' : m;
  };

  const getUrgencyLevel = (score) => {
    if (typeof score === 'string') return score;
    if (score >= 3) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  };

  const getTimeRemaining = (expiresAt) => {
    const t = new Date(expiresAt).getTime();
    if (isNaN(t)) return null;
    const diff = t - Date.now();
    if (diff <= 0) return 'Expired';
    const totalH = Math.floor(diff / (1000 * 60 * 60));
    const days   = Math.floor(totalH / 24);
    const hours  = totalH % 24;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  const getTimeAgo = (createdAt) => {
    if (!createdAt) return 'Recently';
    const diff  = Date.now() - new Date(createdAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const getBookingStatusColor = (s) => {
    switch (s) {
      case 'confirmed':           return 'bg-primary-100 text-primary-800';
      case 'repairman_notified':  return 'bg-blue-100 text-blue-800';
      case 'scheduled':           return 'bg-purple-100 text-purple-800';
      case 'in_progress':         return 'bg-yellow-100 text-yellow-800';
      case 'parts_needed':        return 'bg-orange-100 text-orange-800';
      case 'quality_check':       return 'bg-indigo-100 text-indigo-800';
      case 'completed':           return 'bg-green-100 text-green-800';
      case 'delivered':           return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':           return 'bg-red-100 text-red-800';
      case 'disputed':            return 'bg-red-100 text-red-700';
      case 'closed':              return 'bg-gray-600 text-white';
      default:                    return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (u) => {
    switch (u) {
      case 'urgent': return 'text-red-600';
      case 'high':   return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low':    return 'text-gray-500';
      default:       return 'text-gray-500';
    }
  };

  // ── derived ────────────────────────────────────────────────────────────────
  const urgency      = isQuotationBased ? 'medium' : getUrgencyLevel(job?.urgency);
  const timeLeft     = job?.expiresAt ? getTimeRemaining(job.expiresAt) : null;
  const customerName = job?.customerId?.name || booking?.customer?.name || 'Customer';
  const customerInitial = customerName.charAt(0).toUpperCase();
  const isExpired    = timeLeft === 'Expired';
  const hasDispute   = job?.hasActiveDispute || bookingStatus === 'disputed';
  const isClosed     = bookingStatus === 'closed';
  const isCompleted  = bookingStatus === 'completed' || bookingStatus === 'delivered';

  const serviceType  = isQuotationBased
    ? bookingDetails.serviceType
    : job?.servicePreference;

  useEffect(() => {
    const el = textRef.current;
    if (el) setShowMore(el.scrollHeight > el.clientHeight);
  }, [job?.description]);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl mb-4 shadow-sm transition-shadow duration-200
        ${isExpired ? 'opacity-50 pointer-events-none select-none' : 'hover:shadow-md'}`}
    >
      {/* ── Top Meta Row ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4 pb-2">
        <div className="flex flex-wrap items-center gap-3">

          {/* Posted date */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon icon="solar:clock-circle-linear" className="w-4 h-4" />
            <span>Posted {getTimeAgo(job?.createdAt)}</span>
          </div>

          {/* Urgency */}
          {!isQuotationBased && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${getUrgencyColor(urgency)}`}>
              <Icon icon="solar:flame-bold-duotone" className="w-3.5 h-3.5" />
              {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
            </span>
          )}

          {/* Expiry */}
          {timeLeft && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium
              ${timeLeft === 'Expired' ? 'text-red-500' : 'text-orange-500'}`}>
              <Icon icon="solar:hourglass-bold-duotone" className="w-3.5 h-3.5" />
              {timeLeft === 'Expired' ? 'Expired' : `Expires in ${timeLeft}`}
            </span>
          )}

          {/* Service type */}
          {serviceType && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
              <Icon
                icon={serviceType === 'pickup' ? 'solar:delivery-bold-duotone' : 'solar:map-point-bold-duotone'}
                className="w-3.5 h-3.5"
              />
              {serviceType === 'pickup' ? 'Pickup' : 'Drop-off'}
            </span>
          )}
        </div>

        {/* Right badges */}
        <div className="flex items-center gap-2">
          {/* Booking status */}
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getBookingStatusColor(bookingStatus)}`}>
            {bookingStatus.replace(/_/g, ' ')}
          </span>
          {/* Source badge */}
          <span className="inline-block bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium capitalize">
            {isQuotationBased ? 'Direct Message' : 'Job Posting'}
          </span>
        </div>
      </div>

      {/* ── Device + Customer ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-orange-50 border border-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon icon="solar:smartphone-bold-duotone" className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-900 leading-tight capitalize">
              {getBrandName()} {getModelName()}
              {job?.deviceInfo?.color && (
                <span className="text-sm font-normal text-gray-400 ml-2">· {job.deviceInfo.color}</span>
              )}
            </h3>
            {job?.deviceInfo?.warrantyStatus && job.deviceInfo.warrantyStatus !== 'unknown' && (
              <span className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                Warranty: {job.deviceInfo.warrantyStatus}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job?.customerId?.profileImage ? (
            <img src={job.customerId.profileImage} alt={customerName} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-sm uppercase">
              {customerInitial}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 capitalize hidden sm:block">{customerName}</span>
        </div>
      </div>

      {/* ── Pricing + Budget ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 pb-2">
        <div className="flex items-center gap-1.5">
          {isQuotationBased ? (
            <span className="text-sm font-bold text-gray-700">
              {bookingDetails.pricing?.currency || 'TRY'} {bookingDetails.pricing?.totalAmount?.toLocaleString()}
            </span>
          ) : (
            <span className="text-sm font-bold text-gray-700">
              {job?.budget?.currency || 'TRY'} {job?.budget?.min?.toLocaleString()} – {job?.budget?.max?.toLocaleString()}
            </span>
          )}
        </div>

      

        {/* Quotation extras */}
        {isQuotationBased && job?.estimatedDuration && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon icon="solar:clock-circle-bold-duotone" className="w-3.5 h-3.5" />
            Est. {job.estimatedDuration} days
          </div>
        )}
        {isQuotationBased && job?.warranty?.duration && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon icon="solar:shield-check-bold-duotone" className="w-3.5 h-3.5" />
            Warranty: {job.warranty.duration} days
          </div>
        )}
      </div>

      {/* ── Description ────────────────────────────────────────────────── */}
      {job?.description && (
        <div className="px-5 py-3">
          <p ref={textRef} className="text-gray-400 text-[15px] leading-relaxed line-clamp-2 overflow-hidden">
            {job.description}
          </p>
          {showMore && (
            <span
              onClick={() => router.push(`/repair-man/my-jobs/${booking._id}`)}
              className="text-orange-500 cursor-pointer hover:underline text-sm"
            >
              more
            </span>
          )}
        </div>
      )}

      {/* ── Service Tags ───────────────────────────────────────────────── */}
      {job?.services?.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {job.services.map((service, i) => (
            <span
              key={service._id || i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-800 border border-zinc-300"
            >
              <Icon icon="solar:settings-bold-duotone" className="w-3.5 h-3.5 text-gray-400" />
              {service?.name || service}
            </span>
          ))}
        </div>
      )}

      {/* ── Location ───────────────────────────────────────────────────── */}
      {(job?.location?.city?.name || job?.location?.state?.name) && (
        <div className="px-5 pb-3 flex items-center gap-1.5 text-xs text-gray-500">
          <Icon icon="solar:map-point-bold-duotone" className="w-4 h-4 text-gray-400" />
          <span>{[job.location.city?.name, job.location.state?.name].filter(Boolean).join(', ')}</span>
        </div>
      )}

      {/* ── Info box: pickup / drop-off ─────────────────────────────────── */}
      {job?.isPickUp && job?.pickUpAddress ? (
        <div className="mx-5 mb-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <Icon icon="solar:delivery-bold-duotone" className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-800 mb-0.5">Pickup Address</p>
            <p className="text-xs text-green-700 line-clamp-2">{job.pickUpAddress}</p>
          </div>
        </div>
      ) : job?.location?.address ? (
        <div className="mx-5 mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <Icon icon="solar:map-point-bold-duotone" className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-800 mb-0.5">Drop-off Location</p>
            <p className="text-xs text-blue-700 line-clamp-2">{job.location.address}</p>
          </div>
        </div>
      ) : null}

      {/* ── Parts quality (quotation only) ─────────────────────────────── */}
      {isQuotationBased && job?.partsQuality && (
        <div className="mx-5 mb-3 flex items-center gap-1.5 text-xs text-gray-500">
          <Icon icon="solar:box-bold-duotone" className="w-4 h-4 text-gray-400" />
          Parts quality: <span className="font-medium text-gray-700 capitalize ml-1">{job.partsQuality}</span>
        </div>
      )}

      {/* ── Closed notice ──────────────────────────────────────────────── */}
      {isClosed && (
        <div className="mx-5 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
          <Icon icon="solar:archive-bold-duotone" className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">This job has been closed and archived.</span>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="mt-2 pt-4 border-t border-gray-100 px-5 pb-4 flex flex-col gap-3">

        {/* Info row */}
        {/* <div className="flex flex-wrap justify-between items-center text-xs text-gray-400 gap-2">
          <span className="flex items-center gap-1.5">
            <Icon icon="solar:calendar-bold-duotone" className="w-4 h-4" />
            Created: {new Date(job?.createdAt || booking.timeline?.confirmedAt).toLocaleDateString()}
          </span>
          {job?.preferredTime && (
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:alarm-bold-duotone" className="w-4 h-4" />
              Preferred: {new Date(job.preferredTime).toLocaleDateString()}
            </span>
          )}
          {booking.timeline?.confirmedAt && (
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-green-500" />
              Confirmed: {new Date(booking.timeline.confirmedAt).toLocaleDateString()}
            </span>
          )}
        </div> */}

        {/* ── Action Buttons ──────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">

          {/* View & Update Status — only when canUpdateStatus is true */}
          {canUpdateStatus && (
            <button
              onClick={() => router.push(`/repair-man/my-jobs/${booking._id}/update-status`)}
              className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
            >
              <Icon icon="solar:pen-new-square-bold-duotone" className="w-4 h-4" />
              View & Update Status
            </button>
          )}

          {/* View Details — completed / delivered / closed */}
          {(isCompleted || isClosed) && (
            <button
              onClick={() => router.push(`/repair-man/my-jobs/${booking._id}/detail`)}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              <Icon icon="solar:eye-bold-duotone" className="w-4 h-4" />
              View Details
            </button>
          )}

          {/* Message Client — when canChat and not closed */}
          {canChat && !isClosed && (
            <button
              onClick={() => handleMessageSend?.(booking.customer?._id || job?.customerId?._id)}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              <Icon icon="solar:chat-round-dots-bold-duotone" className="w-4 h-4" />
              Message Client
            </button>
          )}

          {/* See Dispute */}
          {hasDispute && (
            <button
              onClick={() => router.push(`/repair-man/my-jobs/${booking._id}/dispute`)}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              <Icon icon="solar:shield-warning-bold-duotone" className="w-4 h-4" />
              See Dispute
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ type, onRefresh }) => {
  const iconMap = {
    active:    'solar:wrench-bold-duotone',
    completed: 'solar:check-circle-bold-duotone',
    cancelled: 'solar:close-circle-bold-duotone',
    disputed:  'solar:shield-warning-bold-duotone',
    closed:    'solar:lock-bold-duotone',
  };
  const msgMap = {
    active:    "You don't have any active jobs at the moment.",
    completed: "You haven't completed any jobs yet.",
    cancelled: "No cancelled jobs found.",
    disputed:  "No disputed jobs found.",
    closed:    "No closed jobs found.",
  };

  return (
    <div className="text-center py-14">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon icon={iconMap[type] || 'solar:question-circle-bold-duotone'} className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No {type} jobs</h3>
      <p className="text-gray-500 mb-5 max-w-sm mx-auto text-sm">{msgMap[type]}</p>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
      >
        <Icon icon="solar:refresh-bold-duotone" className="w-4 h-4" />
        Refresh Jobs
      </button>
    </div>
  );
};


// ─── MyJobsPage ───────────────────────────────────────────────────────────────
const MyJobsPage = () => {
  const [activeTab, setActiveTab]       = useState('active');
  const [searchQuery, setSearchQuery]   = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [allJobs, setAllJobs]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [summary, setSummary]           = useState({});
  const [page]                          = useState(1);

  const { user, token } = useSelector((state) => state.auth);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const dispatch = useDispatch();
  const { selectChat, openChat } = useChat();

  const fetchAllJobs = async () => {
    try {
      setLoading(true);
      let url = `/repairman/my-booking?page=${page}&limit=10`;
      if (debouncedSearch) url += `&search=${debouncedSearch}`;
      if (urgencyFilter !== 'all') url += `&priority=${urgencyFilter}`;

      const { data } = await axiosInstance.get(url, {
        headers: { Authorization: 'Bearer ' + token },
      });

      if (data.success) {
        setAllJobs(data.data.jobs || []);
        setSummary(data.data.summary || {});
        setError(null);
      } else {
        setError('Failed to load jobs');
      }
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllJobs(); }, [debouncedSearch, urgencyFilter]);

  const handleMessageSend = async (customerId) => {
    if (!user || !token) return;
    try {
      const { data } = await axiosInstance.post(
        '/chat/start',
        { repairmanId: customerId },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      const newChat = {
        id: data?.chat._id,
        chatId: data?.chat._id,
        name: data?.chat?.user?.name,
        avatar: data?.chat?.user?.avatar,
        userId: data?.chat?.user?._id,
        lastMessage: '',
        timestamp: new Date().toISOString(),
        online: false,
      };
      dispatch(addChat(newChat));
      openChat();
      selectChat({ id: data?.chat._id, name: data?.chat?.user?.name, avatar: data?.chat?.user?.avatar });
    } catch (err) {
      handleError(err);
    }
  };

  // Categorize by bookingDetails.status
  const categorizedJobs = useMemo(() => {
    const active    = allJobs.filter(j => ['confirmed','repairman_notified','scheduled','in_progress','parts_needed','quality_check'].includes(j.bookingDetails?.status));
    const completed = allJobs.filter(j => ['completed','delivered'].includes(j.bookingDetails?.status));
    const cancelled = allJobs.filter(j => j.bookingDetails?.status === 'cancelled');
    const disputed  = allJobs.filter(j => j.bookingDetails?.status === 'disputed');
    const closed    = allJobs.filter(j => j.bookingDetails?.status === 'closed');
    return { active, completed, cancelled, disputed, closed };
  }, [allJobs]);

  // Filter within the active tab
  const filteredJobs = useMemo(() => {
    return (categorizedJobs[activeTab] || []).filter((booking) => {
      const job     = booking.jobDetails || {};
      const device  = job.deviceInfo || {};

      const getBrand = () => typeof device.brand === 'object' ? device.brand.name || '' : device.brand || '';
      const getModel = () => typeof device.model === 'object' ? device.model.name || '' : device.model || '';

      const matchesSearch = !searchQuery ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getBrand().toLowerCase().includes(searchQuery.toLowerCase()) ||
        getModel().toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.services?.some(s => (s.name || s).toLowerCase().includes(searchQuery.toLowerCase()));

      const urgency = booking.isQuotationBased ? 'medium' : (typeof job.urgency === 'string' ? job.urgency : job.urgency >= 3 ? 'high' : job.urgency >= 2 ? 'medium' : 'low');
      const matchesUrgency = urgencyFilter === 'all' || urgency === urgencyFilter;

      return matchesSearch && matchesUrgency;
    });
  }, [activeTab, searchQuery, urgencyFilter, categorizedJobs]);

  const tabCounts = {
    active:    categorizedJobs.active?.length    || 0,
    completed: categorizedJobs.completed?.length || 0,
    cancelled: categorizedJobs.cancelled?.length || 0,
    disputed:  categorizedJobs.disputed?.length  || 0,
    closed:    categorizedJobs.closed?.length    || 0,
  };

const summaryData = [
  {
    label: "Total Jobs",
    value: summary?.totalJobs || 0,
    icon: "mdi:briefcase-variant-outline",
  },
  {
    label: "Job Postings",
    value: summary?.jobPostingBookings || 0,
    icon: "mdi:clipboard-text-outline",
  },
  {
    label: "Direct Messages",
    value: summary?.directMessageBookings || 0,
    icon: "mdi:chat-processing-outline",
  },
  {
    label: "Active",
    value: summary?.activeBookings || 0,
    icon: "mdi:check-circle-outline",
  },
];

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Icon icon="solar:shield-warning-bold-duotone" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={fetchAllJobs} className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition text-sm">
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Jobs</h1>
          <p className="text-gray-500">Manage your repair bookings and track progress</p>
          <div className="mt-4">
            <SummaryCards data={summaryData} />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 sm:col-span-8">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by device, customer, service..." />
            </div>
            <div className="col-span-6 sm:col-span-2">
              <UrgencyDropdown urgencyFilter={urgencyFilter} setUrgencyFilter={setUrgencyFilter} />
            </div>
            <div className="col-span-6 sm:col-span-2">
              <button
                onClick={() => { setSearchQuery(''); setUrgencyFilter('all'); }}
                className="w-full py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tabs + Cards */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Tab bar */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 px-4 -mb-px overflow-x-auto scrollbar-hide" role="tablist">
              {[
                { id: 'active',    label: 'Active'    },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
                { id: 'disputed',  label: 'Disputed'  },
                { id: 'closed',    label: 'Closed'    },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-3 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                  {tabCounts[tab.id] > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tabCounts[tab.id]}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Job list */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <JobCardSkeleton />
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredJobs.map((booking) => (
                  <JobCard
                    key={booking._id}
                    booking={booking}          
                    handleMessageSend={handleMessageSend}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type={activeTab} onRefresh={fetchAllJobs} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyJobsPage;