import { useState } from 'react';
import { Icon } from '@iconify/react';
import StarRating from './StarRating';

export default function ReviewCard({ review, currentUserId, onEdit, onDelete, isDeletingThis }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const name = review.userId ? (review.userId.name || 'Anonymous') : 'Anonymous';
  const email = review.userId ? (review.userId.email || '') : '';
  const isOwner = currentUserId && review.userId?._id &&
    review.userId._id.toString() === currentUserId.toString();

  const handleDeleteClick = () => {
    if (!confirmingDelete) { setConfirmingDelete(true); return; }
    onDelete(review._id);
    setConfirmingDelete(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{name}</p>
            <p className="text-gray-400 text-xs">{email}</p>
            <p className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.rating != null && <StarRating rating={review.rating} />}
          {isOwner && (
            <div className="flex items-center gap-1.5 ml-2">
              {confirmingDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeletingThis}
                    className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isDeletingThis
                      ? <Icon icon="mdi:loading" className="animate-spin w-3 h-3" />
                      : 'Confirm'
                    }
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeletingThis}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Delete review"
                >
                  {isDeletingThis
                    ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4 text-red-400" />
                    : <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                  }
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {review.comment && <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>}

      {/* Media Rendering */}
      {(review.images?.length > 0 || review.video) && (
        <div className="flex flex-wrap gap-3 mt-3">
          {review.images?.map((img, idx) => (
            <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              <img src={img.url} alt={`Review ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
          {review.video && (
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative bg-black flex items-center justify-center">
              <video src={review.video.url} className="w-full h-full object-cover opacity-60" />
              <Icon icon="mdi:play-circle" className="w-8 h-8 text-white absolute z-10" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
