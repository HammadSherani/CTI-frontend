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
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();

  const fetchJobById = async (id) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/repairman/jobs/${id}`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      setJobData(data?.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Failed to load job details. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id]);

  // Helper functions
  const formatCurrency = (amount, currency = 'TRY') => {
    return `${currency} ${amount?.toLocaleString()}`;
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getUrgencyLevel = (urgency) => {
    const urgencyMap = {
      'low': 'Beginner',
      'medium': 'Intermediate',
      'high': 'Expert',
      'urgent': 'Expert'
    };
    return urgencyMap[urgency] || 'Intermediate';
  };

  const getUrgencyColor = (urgency) => {
    const colorMap = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colorMap[urgency] || 'text-gray-600';
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffInHours = Math.floor((expires - now) / (1000 * 60 * 60));

    if (diffInHours <= 0) return 'Expired';
    if (diffInHours < 24) return `${diffInHours} hours left`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days left`;
  };

  const SkillTag = ({ skill }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 mr-2 mb-2">
      {skill}
    </span>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchJobById(id)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Updated destructuring to match new response structure
  const job = jobData;
  const customerInitials = 'CU'; // Customer info not in new response
  const urgencyLevel = getUrgencyLevel(job?.urgency);

  return (
    <Loader loading={loading}>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-6">

              <div className='space-y-4 p-5 border rounded-md border-gray-200'>
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {job?.deviceInfo?.brand} {job?.deviceInfo?.model} - Battery Replacement
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
                      Posted {getTimeAgo(job?.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
                      {job?.location?.address}, {job?.location?.city?.name}
                    </div>
                    {job?.expiresAt && (
                      <div className="flex items-center">
                        <Icon icon="heroicons:clock" className="w-4 h-4 mr-1 text-red-500" />
                        <span className="text-red-600 font-medium">
                          {getTimeRemaining(job?.expiresAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Budget Range</span> -
                    <span className={`font-medium ml-1 ${getUrgencyColor(job?.urgency)}`}>{urgencyLevel}</span> -
                    <span className="ml-1">Est. Budget: {formatCurrency(job?.budget?.min, job?.budget?.currency)} - {formatCurrency(job?.budget?.max, job?.budget?.currency)}</span> -
                    <span className="ml-1">Posted {getTimeAgo(job?.createdAt)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {showFullDescription
                        ? job?.description
                        : job?.description?.substring(0, 400) + ((job?.description?.length > 400) ? '...' : '')
                      }
                    </p>
                    {(job?.description?.length > 400) && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-primary-600 hover:text-primary-700 mt-2"
                      >
                        {showFullDescription ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Device Information */}
                {job?.deviceInfo && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Brand:</span>
                          <p className="text-gray-600">{job?.deviceInfo.brand}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Model:</span>
                          <p className="text-gray-600">{job?.deviceInfo.model}</p>
                        </div>
                        {job?.deviceInfo.color && (
                          <div>
                            <span className="font-medium text-gray-900">Color:</span>
                            <p className="text-gray-600 capitalize">{job?.deviceInfo.color}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-900">Warranty:</span>
                          <p className="text-gray-600 capitalize">{job?.deviceInfo.warrantyStatus}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Images */}
                {job?.images && job?.images.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {job?.images.map((image, index) => (
                        <img
                          key={image._id || index}
                          src={image.url}
                          alt={`Job image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6 border-t border-gray-200">
                  <div className="flex items-center">
                    <Icon icon="heroicons:currency-dollar" className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(job?.budget?.min, job?.budget?.currency)} - {formatCurrency(job?.budget?.max, job?.budget?.currency)}
                      </p>
                      <p className="text-xs text-gray-500">Budget range</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Icon icon="heroicons:star" className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{urgencyLevel}</p>
                      <p className="text-xs text-gray-500">Experience level</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Icon icon="heroicons:wrench-screwdriver" className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{job?.servicePreference}</p>
                      <p className="text-xs text-gray-500">Service type</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Icon icon="heroicons:calendar-days" className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {job?.preferredTime ? new Date(job?.preferredTime).toLocaleDateString() : 'Flexible'}
                      </p>
                      <p className="text-xs text-gray-500">Preferred time</p>
                    </div>
                  </div>
                </div>

                {/* Category and Skills */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category & Skills</h3>
                  <div className="flex flex-wrap">
                    <SkillTag skill="Battery Replacement" />
                    {job?.deviceInfo?.brand && <SkillTag skill={`${job?.deviceInfo.brand} Repair`} />}
                    {job?.deviceInfo?.model && <SkillTag skill={job?.deviceInfo.model} />}
                    <SkillTag skill="Hardware Repair" />
                    <SkillTag skill="Mobile Phone Repair" />
                  </div>
                </div>

                {/* Competition Info */}
                {job?.offers && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity on this job</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Total Offers:</p>
                        <p className="text-gray-600">{job.offers.length}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Max Offers:</p>
                        <p className="text-gray-600">{job?.maxOffers}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">View Count:</p>
                        <p className="text-gray-600">{job?.viewCount}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Status:</p>
                        <p className="text-gray-600 capitalize">{job?.status}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* About the Client */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About the client</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-lg font-semibold text-primary-600">{customerInitials}</span>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">Customer</span>
                          <Icon icon="heroicons:check-badge" className="w-5 h-5 text-primary-500 ml-2" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Member since {new Date(job?.createdAt).getFullYear()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-900 font-medium">{job?.location?.city?.name}, {job?.location?.country?.name}</p>
                        <p className="text-gray-600">Quick response expected</p>
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">Auto-select: {job?.autoSelectBest ? 'Yes' : 'No'}</p>
                        <p className="text-gray-600">Job radius: {job?.jobRadius} km</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <BidForm 
                repairmanId={token}
                jobId={id}
              />

            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Job Stats */}
              <div className="bg-gray-50 rounded-lg p-4 sticky top-[100px]">
                <h4 className="font-semibold text-gray-900 mb-3">Job Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget Range:</span>
                    <span className="font-medium">
                      {formatCurrency(job?.budget?.min, job?.budget?.currency)} - {formatCurrency(job?.budget?.max, job?.budget?.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted:</span>
                    <span>{getTimeAgo(job?.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Offers:</span>
                    <span>{job?.offers?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span>{job?.location?.city?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="text-red-600 font-medium">{getTimeRemaining(job?.expiresAt)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Loader>
  );
}

export default JobDetailPage;