import { Icon } from '@iconify/react';
import React, { useState } from 'react';
import EditOfferModal from './EditOfferModal';
import Link from 'next/link';
import WithdrawModal from './WithdrawModal';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const OfferCard = ({ offer, handleUpdateOffer, handleStartJob, isChangeStatus }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [iswithdrawModalOpen, setIswithdrawModalOpen] = useState(false)
    const { token } = useSelector((state) => state.auth);

    console.log(offer, 'offer');


    const jobTitle = `${offer.jobId?.deviceInfo?.brand || ''} ${offer.jobId?.deviceInfo?.model || ''} Repair`;
    const clientInitials = 'CL';
    const location = offer.jobId?.location?.address || 'Location not specified';

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-primary-100 text-primary-800';
            case 'under_review': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'withdrawn': return 'bg-gray-100 text-gray-800';
            case 'expired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'urgent': return 'text-red-600';
            case 'high': return 'text-orange-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const handleEditOffer = () => {
        setIsEditModalOpen(true);
    };

    const handleOfferUpdate = async (payload) => {
        setIsUpdating(true);
        try {
            await handleUpdateOffer(offer._id, payload);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating offer:', error);
        } finally {
            setIsUpdating(false);
        }
    };





    console.log(isChangeStatus);


    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary-700">{clientInitials}</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 leading-tight">{jobTitle}</h3>
                        <p className="text-sm text-gray-600">{offer.jobId?.deviceInfo?.color} {offer.jobId?.deviceInfo?.brand} {offer.jobId?.deviceInfo?.model}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.isExpired ? 'expired' : offer.status)}`}>
                        {offer.isExpired ? 'Expired' : offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
                        <span className="truncate">{location}</span>
                    </div>
                    {offer.jobId?.urgency && (
                        <span className={`text-xs font-medium ${getUrgencyColor(offer.jobId.urgency)}`}>
                            {offer.jobId.urgency.charAt(0).toUpperCase() + offer.jobId.urgency.slice(1)} Priority
                        </span>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{offer.pricing?.currency} {offer.pricing?.totalPrice?.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Base: {offer.pricing?.currency} {offer.pricing?.basePrice} | Parts: {offer.pricing?.currency} {offer.pricing?.partsEstimate}</p>
                </div>
            </div>

            {/* Offer Details - Compact */}
            <div className="bg-gray-50 rounded-md p-3 mb-3">
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{offer.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div><span className="font-medium">{offer.estimatedTime?.value} {offer.estimatedTime?.unit}</span></div>
                    <div><span className="font-medium">{offer.warranty?.duration}d warranty</span></div>
                    <div><span className="font-medium">{offer.locationContext?.distance?.toFixed(1)} km</span></div>
                </div>
            </div>

            {/* Expired Warning */}
            {offer.isExpired && (
                <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 flex items-center">
                    <Icon icon="heroicons:exclamation-triangle" className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-700">This offer has expired</span>
                </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>Submitted: {new Date(offer.createdAt).toLocaleDateString()}</span>
                <span>Viewed: {offer.viewedByCustomer ? 'Yes' : 'No'}</span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 flex-1">
                {offer.status === 'pending' && !offer.isExpired && (
                    <div className="flex gap-3 w-full">
                        <Link href={`/repair-man/my-offers/${offer._id}/edit`} className="flex-1">
                            <button
                                className="w-full bg-primary-600 text-white py-2 px-3 rounded-md 
                           hover:bg-primary-700 transition-colors text-sm font-medium"
                            >
                                Edit Offer
                            </button>
                        </Link>

                        <button
                            onClick={() => setIswithdrawModalOpen(!iswithdrawModalOpen)}
                            className="flex-1 border border-red-300 text-red-700 py-2 px-3 rounded-md 
                       hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                            Withdraw
                        </button>
                    </div>
                )}

                {offer.status === 'under_review' && (
                    <>
                        <button className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium">
                            Message Client
                        </button>
                        <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
                            View Details
                        </button>
                    </>
                )}
                {offer.status === 'accepted' && (
                    <>
                        {/* <button
                            onClick={() => handleStartJob(offer?.jobId?._id)}
                            disabled={isChangeStatus}
                            className={`flex items-center justify-center gap-2 flex-1 bg-green-600 text-white py-2 px-3 rounded-md transition-colors text-sm font-medium 
    ${isChangeStatus ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"}`}
                        >
                            {isChangeStatus ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Updating...
                                </>
                            ) : (
                                "Start Job"
                            )}
                        </button> */}

                        <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
                            Message Client
                        </button>
                    </>
                )}
                {(offer.status === 'rejected' || offer.status === 'withdrawn' || offer.isExpired) && (
                    <>
                        <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
                            View Details
                        </button>
                        <button className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium">
                            Find Similar Jobs
                        </button>
                    </>
                )}
            </div>

            {/* Edit Offer Modal */}
            <EditOfferModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                offer={offer}
                onUpdate={handleOfferUpdate}
                loading={isUpdating}
            />


            <WithdrawModal
                isOpen={iswithdrawModalOpen}
                offerId={offer?._id}
                onClose={() => setIswithdrawModalOpen(!iswithdrawModalOpen)}
            // onWithdraw={}
            />
        </div>
    );
};

export default OfferCard;