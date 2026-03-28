import { Icon } from '@iconify/react';
import React, { useState } from 'react';
import EditOfferModal from './EditOfferModal';
import Link from 'next/link';
import WithdrawModal from './WithdrawModal';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const OfferCard = ({ offer, handleUpdateOffer, handleStartJob, isChangeStatus }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [iswithdrawModalOpen, setIswithdrawModalOpen] = useState(false)
    const { token } = useSelector((state) => state.auth);
  const job=offer?.jobId;
  console.log(job,'job in offer');
    console.log(offer, 'offer');

    const router = useRouter();


    const jobTitle = `${offer.jobId?.deviceInfo?.brand || ''} ${offer.jobId?.deviceInfo?.model || ''} Repair`;
    const clientInitials = 'CL';
    const location = offer.jobId?.location?.address || 'Location not specified';

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-primary-100 text-primary-800';
            case 'under_review': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'withdrawn': return 'bg-orange-100 text-gray-800';
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


    console.log(isChangeStatus);

    const getUrgencyLevel = (urgencyScore) => {
        if (urgencyScore >= 3) return 'high';
        if (urgencyScore >= 2) return 'medium';
        return 'low';
    };
    const urgency = getUrgencyLevel(job.urgencyScore);
const isDisabled = offer.isExpired;
    return (
        <div disabled={isDisabled} className={`   ${isDisabled ? 'opacity-50 pointer-events-none select-none' : 'hover:shadow-md'} bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200`}>
            {/* Header */}
     <div className="px-3 pt-6 pb-4  ">
           <div className="flex items-center -ml-5 justify-between  gap-3">
           
              
             <div className='p-1 -mt-3  ml-5 flex items-center gap-2'>
                 <Icon icon="iconamoon:clock" className="text-3xl text-gray-600" />
                 <p className="text-xs text-zinc-500">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
           </div>
             <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </span>
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
    
  <div className="flex items-center gap-3">
  {job?.customerId?.profileImage ? (
    <img
      src={job.customerId.profileImage}
      alt="Customer Avatar"
      className="w-10 h-10 rounded-full object-cover"
    />
  ) : (
    <div className="w-6 h-6 rounded-full  bg-primary-600 text-white flex items-center justify-center font-semibold uppercase">
      {job?.customerId?.name?.charAt(0) || "C"}
    </div>
  )}

  <div className="text-md font-medium capitalize text-gray-700">
    {job?.customerId?.name || "Customer Name"}
  </div>
</div>
           </div>
         </div>

            {/* Content */}
            <div className="flex gap-4 mb-1">
               <div className="text-gray-500  text-md font-bold ml-5">TRY {job.budget?.min?.toLocaleString()} – {job.budget?.max?.toLocaleString()}</div>
          {console.log(job,"jobs")}
           {job.createdAt && (
              <div className="text-orange-400 text-sm  font-medium">
                Posted {getTimeAgo(job.createdAt)} ago
              </div>
            )}
          </div>
      {/* Description */}
      <div className="px-6 py-6 text-gray-400 leading-relaxed text-[15.5px]">
        {job?.description}
        <span className="text-orange-500 cursor-pointer hover:underline ml-1">more</span>
      </div>

      {/* Tags */}
      <div className="px-6 pb-6 flex flex-wrap gap-2">
        {job.services?.map((service, index) => (
            console.log(service,"service in offer card"),
          <span
            key={index}
            className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-900 border border-zinc-400"
          >
            {service?.name||service._id||'Service'}
          </span>
        ))}
        {urgency === 'high' && (
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-red-900/50 text-red-400 border border-red-800">
            High Priority
          </span>
        )}
        
      </div> 

            




        {/* Footer */}
<div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">

  {/* Top Info Row */}
  <div className="flex justify-between items-center text-xs text-gray-500">
    <span className="flex items-center gap-1">
      <Icon icon="heroicons:calendar-days" className="w-4 h-4" />
      Submitted: {new Date(offer.createdAt).toLocaleDateString()}
    </span>

    <span className={`flex items-center gap-1 ${offer.viewedByCustomer ? "text-green-600" : "text-gray-400"}`}>
      <Icon icon={offer.viewedByCustomer ? "heroicons:eye" : "heroicons:eye-slash"} className="w-4 h-4" />
      {offer.viewedByCustomer ? "Viewed" : "Not Viewed"}
    </span>
  </div>

  {/* Buttons */}
  <div className="flex flex-wrap gap-2">

    {/* PENDING */}
    {offer.status === 'pending' && !offer.isExpired && (
      <>
        <Link href={`/repair-man/my-offers/${offer._id}/edit`} className="flex-1 min-w-[120px]">
          <button className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
            Edit
          </button>
        </Link>

        <Link href={`/repair-man/my-offers/${offer._id}/view`} className="flex-1 min-w-[120px]">
          <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            <Icon icon="heroicons:eye" className="w-4 h-4" />
            View
          </button>
        </Link>

        <button
          onClick={() => setIswithdrawModalOpen(!iswithdrawModalOpen)}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 border border-red-300 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition"
        >
          <Icon icon="heroicons:trash" className="w-4 h-4" />
          Withdraw
        </button>
      </>
    )}

    {/* UNDER REVIEW */}
    {offer.status === 'under_review' && (
      <>
        <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
          <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4" />
          Message
        </button>

        <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          <Icon icon="heroicons:eye" className="w-4 h-4" />
          View
        </button>
      </>
    )}

    {/* ACCEPTED */}
    {/* {offer.status === 'accepted' && (
      <button
        onClick={() => router.push(`/repair-man/my-offers/${offer._id}/view`)}
        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
      >
        <Icon icon="heroicons:check-circle" className="w-4 h-4" />
        View Accepted Offer
      </button>
    )} */}

  </div>
</div>

            {/* Actions */}
       <div className="flex gap-3 flex-1 w-full">

  {offer.status === 'pending' && !offer.isExpired && (
    <>
      <Link href={`/repair-man/my-offers/${offer._id}/edit`} className="flex-1">
        <button
          className="w-full bg-primary-600 text-white py-2 px-3 rounded-md 
          hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Edit Offer
        </button>
      </Link>

      <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
      <Link href={`/repair-man/my-offers/${offer._id}/view`} className="flex-1">
        View Details
      </Link>
      </button>

      <button
        onClick={() => setIswithdrawModalOpen(!iswithdrawModalOpen)}
        className="flex-1 border border-red-300 text-red-700 py-2 px-3 rounded-md 
        hover:bg-red-50 transition-colors text-sm font-medium"
      >
        Withdraw
      </button>
    </>
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
  <button
  disabled={isDisabled}
  onClick={() => !isDisabled && router.push(`/repair-man/my-offers/${offer._id}/view`)}
    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
  >
    <Icon icon="heroicons:check-circle" className="w-4 h-4" />
    View Accepted Offer
  </button>
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