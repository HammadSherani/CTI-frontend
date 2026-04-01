import { Icon } from '@iconify/react';
import React, { useState ,useRef,useEffect} from 'react';
import EditOfferModal from './EditOfferModal';
import { useRouter,Link } from '@/i18n/navigation';

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
    const isDisabled = offer.isExpired;


  const [showMore, setShowMore] = useState(false);
  const textRef = useRef(null);
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




    console.log(isChangeStatus);
const getUrgencyLevel = (urgencyScore) => {
  if (typeof urgencyScore === "string") return urgencyScore;

  if (urgencyScore >= 3) return "high";
  if (urgencyScore >= 2) return "medium";
  return "low";
};

    console.log(job,"job urgency in offer card");
    const urgency = getUrgencyLevel(job.urgency);
    console.log(urgency,"urgency in offer card");
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

  const offerStatus  = (offer.status || '').toLowerCase();

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      const isOverflowing = el.scrollHeight > el.clientHeight;
      setShowMore(isOverflowing);
    }
  }, [job?.description]);

    return (
        <div disabled={isDisabled} className={`   ${isDisabled ? 'opacity-50 pointer-events-none select-none' : 'hover:shadow-md'} bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200`}>
            {/* Header */}
     <div className="px-3 pt-6 pb-4  ">
           <div className="flex items-center -mt-5 -ml-13 justify-between  gap-3">
            
           
                       <div className="flex px-6  -mt-4 py-3 flex-wrap items-center gap-3 text-sm">

       <div className='p-1  ml-5 flex items-center gap-2'>
                 <Icon icon="iconamoon:clock" className="text-3xl text-gray-600" />
                 <p className="text-xs text-zinc-500">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
           </div>
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
            console.log(service,"service in offer card"),
          <span
            key={index}
            className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-900 border border-zinc-400"
          >
            {service?.name||service._id||'Service'}
          </span>
        ))}
       
        
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

      <div className="flex flex-wrap gap-2">

          {/* PENDING — edit, view, withdraw */}
          {offerStatus === 'pending' && !offer.isExpired && (
            <>
              <Link href={`/repair-man/my-offers/${offer._id}/edit`} className="flex-1 min-w-[120px]">
                <button className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                  Edit Offer
                </button>
              </Link>

              <Link href={`/repair-man/my-offers/${offer._id}/view`} className="flex-1 min-w-[120px]">
                <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  <Icon icon="solar:eye-bold-duotone" className="w-4 h-4" />
                  View
                </button>
              </Link>

              <button
                onClick={() => setIswithdrawModalOpen(true)}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 border border-red-300 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition"
              >
                <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                Withdraw
              </button>
            </>
          )}

          {/* ACCEPTED — customer accepted but not yet confirmed/booked */}
          {offerStatus === 'accepted' && (
            <button
              onClick={() => router.push(`/repair-man/my-offers/${offer._id}/view`)}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4" />
              Please Confirm Offer
            </button>
          )}

          {/* CONFIRMED — booking confirmed */}
          {offerStatus === 'confirmed' && (
            <button
              onClick={() => router.push(`/repair-man/my-offers/${offer._id}/view`)}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              <Icon icon="solar:verified-check-bold-duotone" className="w-4 h-4" />
              Confirmed — View Details
            </button>
          )}

          {/* REJECTED */}
          {offerStatus === 'rejected' && (
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
              <Icon icon="solar:close-circle-bold-duotone" className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600 font-medium">Offer was rejected by customer</span>
            </div>
          )}

          {/* WITHDRAWN */}
          {offerStatus === 'withdrawn' && (
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-lg">
              <Icon icon="solar:undo-left-bold-duotone" className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm text-orange-600 font-medium">You withdrew this offer</span>
            </div>
          )}

          {/* EXPIRED */}
          {(offerStatus === 'expired' || (offer.isExpired && offerStatus !== 'confirmed' && offerStatus !== 'accepted')) && (
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <Icon icon="solar:hourglass-bold-duotone" className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500 font-medium">This offer has expired</span>
            </div>
          )}
        </div>
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