"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import Loader from '@/components/Loader';
import BidForm from './BidForm';

function JobDetailPage() {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [jobData, setJobData]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const { token }  = useSelector((state) => state.auth);
  const { id }     = useParams();

  const fetchJobById = async (id) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/repairman/jobs/${id}`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setJobData(data?.data);
      setError(null);
    } catch (err) {
      setError('Failed to load job details. Please try again.');
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchJobById(id); }, [id]);

  // ── helpers ────────────────────────────────────────────────────────────────
  const formatCurrency = (amount, currency = 'TRY') =>
    `${currency} ${amount?.toLocaleString() ?? 0}`;

  const getTimeAgo = (dateString) => {
    const diff = Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60));
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${diff} hour${diff > 1 ? 's' : ''} ago`;
    const d = Math.floor(diff / 24);
    return `${d} day${d > 1 ? 's' : ''} ago`;
  };

  const getTimeRemaining = (expiresAt) => {
    const diff = Math.floor((new Date(expiresAt) - Date.now()) / (1000 * 60 * 60));
    if (diff <= 0) return 'Expired';
    if (diff < 24) return `${diff}h left`;
    return `${Math.floor(diff / 24)} days left`;
  };

  const getUrgencyMeta = (urgency) => {
    const map = {
      low:    { label: 'Low',    color: 'text-green-600',  bg: 'bg-green-50  border-green-200',  icon: 'solar:flame-bold-duotone' },
      medium: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: 'solar:flame-bold-duotone' },
      high:   { label: 'High',   color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: 'solar:flame-bold-duotone' },
      urgent: { label: 'Urgent', color: 'text-red-600',    bg: 'bg-red-50    border-red-200',    icon: 'solar:flame-bold-duotone' },
    };
    return map[urgency] || map.medium;
  };

  const getStatusMeta = (status) => {
    const map = {
      open:      { label: 'Open',      bg: 'bg-emerald-100 text-emerald-800' },
      booked:    { label: 'Booked',    bg: 'bg-blue-100    text-blue-800'    },
      disputed:  { label: 'Disputed',  bg: 'bg-red-100     text-red-800'     },
      completed: { label: 'Completed', bg: 'bg-gray-100    text-gray-700'    },
    };
    return map[status] || { label: status, bg: 'bg-gray-100 text-gray-700' };
  };

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-200 max-w-sm w-full">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="solar:shield-warning-bold-duotone" className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Failed to load job</h2>
        <p className="text-gray-500 text-sm mb-5">{error}</p>
        <button onClick={() => fetchJobById(id)}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition">
          Try Again
        </button>
      </div>
    </div>
  );

  const job          = jobData;
  const urgencyMeta  = getUrgencyMeta(job?.urgency);
  const statusMeta   = getStatusMeta(job?.status);
  const timeLeft     = job?.expiresAt ? getTimeRemaining(job.expiresAt) : null;
  const isExpired    = timeLeft === 'Expired';

  return (
    <Loader loading={loading}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Hero Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                {/* Colored top accent */}
                <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-400 to-orange-400" />

                <div className="p-6">
                  {/* Title row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:smartphone-bold-duotone" className="w-7 h-7 text-orange-500" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                          {job?.deviceInfo?.brand} {job?.deviceInfo?.model}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5 capitalize">
                          {job?.deviceInfo?.color && `${job.deviceInfo.color} · `}
                          Warranty: {job?.deviceInfo?.warrantyStatus || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.bg}`}>
                        {statusMeta.label}
                      </span>
                      {isExpired && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <Icon icon="solar:hourglass-bold-duotone" className="w-3.5 h-3.5" />
                          Expired
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                      <Icon icon="solar:clock-circle-linear" className="w-3.5 h-3.5" />
                      {getTimeAgo(job?.createdAt)}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                      <Icon icon="solar:map-point-bold-duotone" className="w-3.5 h-3.5 text-gray-400" />
                      {job?.location?.city?.name}, {job?.location?.state?.name}
                    </div>

                    <div className={`flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-full ${urgencyMeta.bg} ${urgencyMeta.color}`}>
                      <Icon icon={urgencyMeta.icon} className="w-3.5 h-3.5" />
                      {urgencyMeta.label} Priority
                    </div>

                    <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border
                      ${job?.servicePreference === 'pickup'
                        ? 'bg-primary-50 border-blue-200 text-primary-700'
                        : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                      <Icon icon={job?.servicePreference === 'pickup'
                        ? 'solar:delivery-bold-duotone'
                        : 'solar:map-point-bold-duotone'} className="w-3.5 h-3.5" />
                      {job?.servicePreference === 'pickup' ? 'Pickup' : 'Drop-off'}
                    </div>

                    {timeLeft && !isExpired && (
                      <div className="flex items-center gap-1.5 text-xs font-medium bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-full">
                        <Icon icon="solar:hourglass-bold-duotone" className="w-3.5 h-3.5" />
                        {timeLeft}
                      </div>
                    )}
                  </div>

                  {/* Key stats strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {[
                      {
                        label: 'Budget Range',
                        value: `${formatCurrency(job?.budget?.min, job?.budget?.currency)} – ${formatCurrency(job?.budget?.max, job?.budget?.currency)}`,
                        icon: 'solar:wallet-money-bold-duotone',
                      },
                      {
                        label: 'Preferred Date',
                        value: job?.preferredTime ? new Date(job.preferredTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible',
                        icon: 'solar:calendar-bold-duotone',
                      },
                      {
                        label: 'Total Offers',
                        value: `${job?.offers?.length || 0} / ${job?.maxOffers || 10}`,
                        icon: 'solar:document-text-bold-duotone',
                      },
                      {
                        label: 'Views',
                        value: job?.viewCount || 0,
                        icon: 'solar:eye-bold-duotone',
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <div className={`w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-2`}>
                          <Icon icon={stat.icon} className={`w-4 h-4 text-primary-600`} />
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{stat.label}</p>
                        <p className={`text-sm font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon icon="solar:document-text-bold-duotone" className="w-5 h-5 text-primary-500" />
                  Job Description
                </h3>
                <p className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-line">
                  {showFullDescription
                    ? job?.description
                    : `${job?.description?.substring(0, 400)}${(job?.description?.length ?? 0) > 400 ? '...' : ''}`}
                </p>
                {(job?.description?.length ?? 0) > 400 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-3 text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                    <Icon icon={showFullDescription ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Device Info Card */}
              {job?.deviceInfo && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon icon="solar:smartphone-bold-duotone" className="w-5 h-5 text-primary-500" />
                    Device Information
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Brand',    value: job.deviceInfo.brand,           icon: 'solar:tag-bold-duotone' },
                      { label: 'Model',    value: job.deviceInfo.model,           icon: 'solar:smartphone-bold-duotone' },
                      { label: 'Color',    value: job.deviceInfo.color,           icon: 'solar:palette-bold-duotone' },
                      { label: 'Warranty', value: job.deviceInfo.warrantyStatus,  icon: 'solar:shield-check-bold-duotone' },
                    ].filter(i => i.value).map((item) => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon icon={item.icon} className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 capitalize">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Card */}
              {job?.services?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon icon="solar:settings-bold-duotone" className="w-5 h-5 text-primary-500" />
                    Requested Services
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {job.services.map((service) => (
                      <div key={service._id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                        {service.icon ? (
                          <img src={service.icon} alt={service.name} className="w-9 h-9 rounded-lg object-contain bg-white border border-gray-200 p-1" />
                        ) : (
                          <div className="w-9 h-9 bg-primary-50 border border-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon icon="solar:settings-bold-duotone" className="w-5 h-5 text-primary-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-gray-400 line-clamp-1">{service.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {job?.images?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon icon="solar:gallery-bold-duotone" className="w-5 h-5 text-primary-500" />
                    Job Images
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {job.images.map((image, index) => (
                      <img
                        key={image._id || index}
                        src={image.url}
                        alt={`Job image ${index + 1}`}
                        className="w-full h-36 object-cover rounded-xl border border-gray-200"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Location Card */}
              {job?.location?.address && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="solar:map-point-bold-duotone" className="w-5 h-5 text-primary-500" />
                    Location
                  </h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                    <Icon icon="solar:map-point-bold-duotone" className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">
                        {[job.location.city?.name, job.location.state?.name, job.location.country?.name].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5 line-clamp-2">{job.location.address}</p>
                      {job.location.zipCode && (
                        <p className="text-xs text-blue-400 mt-1">ZIP: {job.location.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

             

              {/* About Client */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="solar:user-bold-duotone" className="w-5 h-5 text-primary-500" />
                  About the Client
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-600">C</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Customer</span>
                      <Icon icon="solar:verified-check-bold-duotone" className="w-5 h-5 text-primary-500" />
                    </div>
                    <p className="text-sm text-gray-400">
                      Member since {new Date(job?.createdAt).getFullYear()} ·{' '}
                      {job?.location?.city?.name}, {job?.location?.country?.name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon icon="solar:routing-bold-duotone" className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Job Radius</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{job?.jobRadius} km</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon icon="solar:magic-stick-3-bold-duotone" className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Auto Select</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{job?.autoSelectBest ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </div>

              {/* Bid Form */}
              <BidForm repairmanId={token} jobId={id} />
            </div>

            {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Quick Summary — sticky */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ">
                <div className="h-1 bg-gradient-to-r from-primary-500 to-orange-400" />
                <div className="p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon icon="solar:clipboard-list-bold-duotone" className="w-4 h-4 text-primary-500" />
                    Job Summary
                  </h4>

                  <div className="space-y-3">
                    {[
                      {
                        label: 'Budget Range',
                        value: `${formatCurrency(job?.budget?.min, job?.budget?.currency)} – ${formatCurrency(job?.budget?.max, job?.budget?.currency)}`,
                        icon: 'solar:wallet-money-bold-duotone',
                        valueClass: 'text-primary-600 font-bold',
                      },
                      {
                        label: 'Posted',
                        value: getTimeAgo(job?.createdAt),
                        icon: 'solar:clock-circle-linear',
                        valueClass: 'text-gray-700',
                      },
                      {
                        label: 'Offers',
                        value: `${job?.offers?.length || 0} of ${job?.maxOffers || 10}`,
                        icon: 'solar:document-text-bold-duotone',
                        valueClass: 'text-gray-700',
                      },
                      {
                        label: 'Location',
                        value: job?.location?.city?.name || '—',
                        icon: 'solar:map-point-bold-duotone',
                        valueClass: 'text-gray-700',
                      },
                      {
                        label: 'Service Type',
                        value: job?.servicePreference || '—',
                        icon: 'solar:delivery-bold-duotone',
                        valueClass: 'text-gray-700 capitalize',
                      },
                      {
                        label: 'Preferred Date',
                        value: job?.preferredTime
                          ? new Date(job.preferredTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                          : 'Flexible',
                        icon: 'solar:calendar-bold-duotone',
                        valueClass: 'text-gray-700',
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <Icon icon={row.icon} className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500">{row.label}</span>
                        </div>
                        <span className={`text-xs text-right ${row.valueClass}`}>{row.value}</span>
                      </div>
                    ))}

                    {/* Expires row */}
                    {timeLeft && (
                      <div className={`flex items-center justify-between py-2 rounded-lg px-2 mt-1
                        ${isExpired ? 'bg-red-50' : 'bg-orange-50'}`}>
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:hourglass-bold-duotone" className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-orange-500'}`} />
                          <span className="text-xs text-gray-500">Expires</span>
                        </div>
                        <span className={`text-xs font-semibold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                          {timeLeft}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Services mini list */}
              {job?.services?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <Icon icon="solar:settings-bold-duotone" className="w-4 h-4 text-primary-500" />
                    Services Needed
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.services.map((s) => (
                      <span key={s._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        <Icon icon="solar:settings-bold-duotone" className="w-3 h-3 text-gray-400" />
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Loader>
  );
}

export default JobDetailPage;