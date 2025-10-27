  "use client";

  import React, { useState, useEffect } from 'react';
  import { Icon } from '@iconify/react';
  import axiosInstance from '@/config/axiosInstance';
  import handleError from '@/helper/handleError';
  import { useParams, useRouter } from 'next/navigation';
  import { useSelector } from 'react-redux';
  import { toast } from 'react-toastify';
  import DisputesModal from '@/components/partials/repairman/DisputesModal';

function UpdateStatus() {
  const [job, setJob] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [statusUpdateResult, setStatusUpdateResult] = useState(null);
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { token } = useSelector((state) => state.auth);

  console.log(isModalOpen);
  

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/repairman/my-booking/${id}/detail`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      if (data.success) {
        setJob(data.data || {});
        setError(null);
      } else {
        setError('Failed to load job details');
      }
    } catch (error) {
      setError('Failed to load job details. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      setUpdating(true);
      const { data } = await axiosInstance.patch(`/repairman/my-booking/${id}/status`, {
        status: selectedStatus,
        notes: notes
      }, {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });

      // Success case
      toast.success(data.message || 'Status updated successfully!');
      setStatusUpdateResult(data.data);
      setShowSuccessMessage(true);
      fetchJobDetails(); // Refresh job details
      setSelectedStatus('');
      setNotes('');

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setStatusUpdateResult(null);
      }, 5000);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update status. Please try again.';
      toast.error(errorMessage);
      handleError(error);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount, currency = 'PKR') => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'parts_needed': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'quality_check': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getValidStatusTransitions = (currentStatus) => {
    const transitions = {
      'confirmed': ['scheduled', 'in_progress', 'cancelled'],
      'scheduled': ['in_progress', 'cancelled'],
      'in_progress': ['parts_needed', 'quality_check', 'completed', 'cancelled'],
      'parts_needed': ['in_progress', 'cancelled'],
      'quality_check': ['completed', 'in_progress', 'cancelled'],
      'completed': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    return transitions[currentStatus] || [];
  };

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmed', description: 'Booking confirmed, ready to start' },
    { value: 'scheduled', label: 'Scheduled', description: 'Appointment scheduled with customer' },
    { value: 'in_progress', label: 'In Progress', description: 'Work has started on the device' },
    { value: 'parts_needed', label: 'Parts Needed', description: 'Waiting for required parts' },
    { value: 'quality_check', label: 'Quality Check', description: 'Repair completed, under quality check' },
    { value: 'completed', label: 'Completed', description: 'Work completed successfully' },
    { value: 'delivered', label: 'Delivered', description: 'Device delivered to customer' },
    { value: 'cancelled', label: 'Cancelled', description: 'Job cancelled' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchJobDetails}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const jobInfo = job.jobInfo || {};
  const customer = job.customer || {};
  const bookingDetails = job.bookingDetails || {};
  const deviceInfo = jobInfo.deviceInfo || {};
  const actions = job.actions || {};
  const timeline = job.timeline || [];
  const tracking = job.tracking || {};
  const communication = job.communication || {};

  return (

    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-2" />
                Back to Jobs
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
              <p className="text-gray-600">Manage and update job status</p>
            </div>
            <div className={`px-4 py-2 rounded-full border ${getStatusColor(tracking.currentLocation)}`}>
              <span className="font-semibold">
                {tracking.currentLocation?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && statusUpdateResult && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Icon icon="heroicons:check-circle" className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-green-800 font-semibold">Status Updated Successfully!</h3>
                  <p className="text-green-700 text-sm mt-1">
                    Status changed from <span className="font-medium">{statusUpdateResult.oldStatus}</span> to{' '}
                    <span className="font-medium">{statusUpdateResult.newStatus}</span>
                  </p>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <span>Progress: {statusUpdateResult.progress || 'N/A'}%</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSuccessMessage(false);
                    setStatusUpdateResult(null);
                  }}
                  className="text-green-500 hover:text-green-700"
                >
                  <Icon icon="heroicons:x-mark" className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Overview</h2>

                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary-700">
                      {customer.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {jobInfo.services?.join(', ') || 'Repair Service'}
                    </h3>
                    <p className="text-gray-600 mb-2">{customer.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
                        {jobInfo.location?.city}
                      </span>
                      <span className="flex items-center">
                        <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
                        {jobInfo.urgency} priority
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(bookingDetails.pricing?.totalAmount, bookingDetails.pricing?.currency)}
                    </p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                </div>

                {jobInfo.description && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{jobInfo.description}</p>
                  </div>
                )}

                {/* Device Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Device Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Brand:</span>
                        <span className="font-medium">{deviceInfo.brand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Model:</span>
                        <span className="font-medium">{deviceInfo.model}</span>
                      </div>
                      {deviceInfo.color && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Color:</span>
                          <span className="font-medium capitalize">{deviceInfo.color}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Warranty:</span>
                        <span className={`px-2 py-1 rounded text-xs ${deviceInfo.warrantyStatus === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {deviceInfo.warrantyStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Service Type:</span>
                        <span className="font-medium">{bookingDetails.serviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="font-medium">
                          {new Date(bookingDetails.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Base Price:</span>
                        <span className="font-medium">
                          {formatCurrency(bookingDetails.pricing?.basePrice, bookingDetails.pricing?.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Parts Price:</span>
                        <span className="font-medium">
                          {formatCurrency(bookingDetails.pricing?.partsPrice, bookingDetails.pricing?.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {jobInfo.location?.address && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                    <p className="text-gray-600">{jobInfo.location.address}</p>
                  </div>
                )}
              </div>

              {/* Status Update Section */}
              {/* {actions.canUpdateStatus && ( */}

              {tracking.currentLocation === 'delivered' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl shadow-sm p-8 text-center">
                  <Icon icon="heroicons:check-circle" className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Job Completed & Delivered</h3>
                  <p className="text-gray-600">This job has been successfully completed and delivered to the customer.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Status</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select New Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Choose a status...</option>
                        {statusOptions
                          .filter(option => {
                            const validTransitions = getValidStatusTransitions(tracking.currentLocation);
                            return validTransitions.length === 0 || validTransitions.includes(option.value);
                          })
                          .map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label} - {option.description}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about the status update..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <button
                      onClick={handleStatusUpdate}
                      disabled={!selectedStatus || updating}
                      className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {updating ? (
                        <>
                          <Icon icon="heroicons:arrow-path" className="w-5 h-5 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Icon icon="heroicons:check-circle" className="w-5 h-5 mr-2" />
                          Update Status
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}



              {/* )} */}

              {/* Timeline */}
              {timeline.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>

                  <div className="space-y-4">
                    {timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon icon="heroicons:clock" className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Icon icon="heroicons:user" className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">Customer</p>
              </div>
            </div>

            {customer.phone && (
              <div className="flex items-center space-x-3">
                <Icon icon="heroicons:phone" className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{customer.phone}</p>
                  <p className="text-sm text-gray-500">Phone</p>
                </div>
              </div>
            )}

            {customer.email && (
              <div className="flex items-center space-x-3">
                <Icon icon="heroicons:envelope" className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{customer.email}</p>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>
            )}
          </div>
        </div> */}

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

                <div className="space-y-3">
                  {actions.canChat && (
                    <button className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      <Icon icon="heroicons:chat-bubble-left" className="w-5 h-5 mr-2" />
                      Chat with Customer
                      {communication.unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {communication.unreadCount}
                        </span>
                      )}
                    </button>
                  )}

                  <button onClick={() => setIsModalOpen(!isModalOpen)} className="w-full cursor-pointer border border-gray-200 flex items-center justify-center px-4 py-3 bg-gray-100 rounded-lg transition-colors">
                    <Icon icon="mdi:scale-balance" className="w-5 h-5 mr-2" />
                    Create Disputes
                  </button>


                  {/* {actions.canMarkCompleted && (
                  <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Icon icon="heroicons:check-circle" className="w-5 h-5 mr-2" />
                    Mark as Completed
                  </button>
                )} */}
                </div>
              </div>

              {/* Warranty Information */}
              {bookingDetails.warranty && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{bookingDetails.warranty.duration} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Description:</span>
                      <span className="font-medium">{bookingDetails.warranty.description}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking Info */}
              {tracking.estimatedCompletion && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current Status:</span>
                      <span className="font-medium capitalize">
                        {tracking.currentLocation?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. Completion:</span>
                      <span className="font-medium">
                        {new Date(tracking.estimatedCompletion).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div >


      </div >
      <DisputesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(!isModalOpen) } bookingId={id} />
    </>
  );
}

export default UpdateStatus;