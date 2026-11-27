import { useState } from 'react';
import { Icon } from '@iconify/react';
import StarRating from './StarRating';
import MediaViewer from './MediaViewer';

export default function ReviewCard({ review }) {
  const [viewing, setViewing] = useState(null); // position of the photo / video shown full screen
  const media = [
    ...(review.images || []).map((image) => ({ url: image.url, type: 'image' })),
    ...(review.video?.url ? [{ url: review.video.url, type: 'video' }] : []),
  ];
  const name = review.userId ? (review.userId.name || 'Anonymous') : 'Anonymous';
  const email = review.userId ? (review.userId.email || '') : '';
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
        </div>
      </div>
      {review.comment && <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>}

      {/* Media Rendering */}
      {media.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {media.map((item, idx) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setViewing(idx)}
              aria-label={item.type === 'video' ? 'Play video' : `Open photo ${idx + 1}`}
              className={`w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity ${item.type === 'video' ? 'bg-black' : ''}`}
            >
              {item.type === 'video' ? (
                <>
                  <video src={item.url} muted className="w-full h-full object-cover opacity-60" />
                  <Icon icon="mdi:play-circle" className="w-8 h-8 text-white absolute z-10" />
                </>
              ) : (
                <img src={item.url} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
      {viewing !== null && <MediaViewer media={media} startIndex={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
