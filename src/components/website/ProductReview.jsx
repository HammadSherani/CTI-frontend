'use client';

// Writing a product review (marketplace or refurbished), used on the product and order pages.
// A review is final: it cannot be edited or deleted afterwards.
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import StarRating from './StarRating';

export const REVIEW_BASE = { marketplace: '/e-commerce/products', refurbished: '/refurbished/products' };
const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 50 * 1024 * 1024;

export default function ProductReviewModal({ slug, productTitle, base = REVIEW_BASE.marketplace, onClose, onSaved }) {
  const token = useSelector((s) => s.auth?.token);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [saving, setSaving] = useState(false);

  // photos and the video come through the same button; the file type tells them apart
  const addMedia = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    const photos = files.filter((file) => file.type.startsWith('image/'));
    const videos = files.filter((file) => file.type.startsWith('video/'));

    if (photos.length + videos.length !== files.length) return toast.error('Only photos and videos are allowed');
    if (files.some((file) => file.size > MAX_FILE_BYTES)) return toast.error('Each file must be less than 50MB');
    if (images.length + photos.length > MAX_IMAGES) return toast.error(`Maximum ${MAX_IMAGES} photos allowed`);
    if (videos.length + (video ? 1 : 0) > 1) return toast.error('Only one video is allowed. Remove the current one first.');

    setImages((current) => [...current, ...photos]);
    if (videos.length) setVideo(videos[0]);
  };

  const submit = async () => {
    if (!rating) return toast.error('Please select a rating (stars)');
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('comment', comment.trim());
    images.forEach((file) => formData.append('images', file));
    if (video) formData.append('video', video);

    setSaving(true);
    try {
      const { data } = await axiosInstance.post(`${base}/${slug}/reviews`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      if (!data.success) return toast.error(data.message || 'Could not save your review');
      toast.success('Review submitted successfully!');
      onSaved?.(data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save your review');
    } finally {
      setSaving(false);
    }
  };

  const chip = 'flex items-center gap-1 text-xs bg-gray-100 rounded-lg px-2 py-1 max-w-full';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-label="Product review" className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8 text-left">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm">Write a review</h3>
            <p className="text-xs text-gray-500 truncate">{productTitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-gray-100">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Your rating <span className="text-red-500">*</span></p>
            <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Comment</p>
            <textarea
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the product?"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Photos &amp; Video <span className="font-normal normal-case text-gray-400">(optional, up to {MAX_IMAGES} photos and 1 video)</span>
            </p>
            <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary-300 bg-primary-50 text-primary-700 text-sm font-semibold cursor-pointer hover:bg-primary-100">
              <Icon icon="mdi:image-plus-outline" className="w-5 h-5" />
              Add photos or video
              <input type="file" accept="image/*,video/*" multiple onChange={addMedia} className="sr-only" />
            </label>
            {(images.length > 0 || video) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((file, index) => (
                  <button key={`${file.name}-${index}`} type="button" onClick={() => setImages((list) => list.filter((_, i) => i !== index))}
                    title="Remove photo" className={chip}>
                    <Icon icon="mdi:image-outline" className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[10rem]">{file.name}</span>
                    <Icon icon="mdi:close" className="w-3 h-3" />
                  </button>
                ))}
                {video && (
                  <button type="button" onClick={() => setVideo(null)} title="Remove video" className={chip}>
                    <Icon icon="mdi:video-outline" className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[10rem]">{video.name}</span>
                    <Icon icon="mdi:close" className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            Please check before sending: a review cannot be changed or deleted afterwards.
          </p>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 text-sm">Cancel</button>
            <button type="button" onClick={submit} disabled={saving || !rating}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm">
              {saving ? 'Saving…' : 'Submit review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The "Add Review" button of one delivered order item; shows "Reviewed" once done. */
export function OrderItemReviewButton({ slug, productTitle, base = REVIEW_BASE.marketplace }) {
  const token = useSelector((s) => s.auth?.token);
  const [state, setState] = useState({ canReview: false, review: null });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token || !slug) return undefined;
    let cancelled = false;
    axiosInstance
      .get(`${base}/${slug}/review-eligibility`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { if (!cancelled) setState({ canReview: Boolean(data.canReview), review: data.review || null }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug, token, base]);

  if (state.review) {
    return (
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
        <Icon icon="mdi:check-circle" className="w-4 h-4" />
        Reviewed
      </span>
    );
  }
  if (!state.canReview) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
      >
        <Icon icon="solar:star-bold-duotone" className="w-4 h-4" />
        Add Review
      </button>
      {open && (
        <ProductReviewModal
          slug={slug}
          productTitle={productTitle}
          base={base}
          onClose={() => setOpen(false)}
          onSaved={(review) => setState((current) => ({ ...current, review }))}
        />
      )}
    </>
  );
}
