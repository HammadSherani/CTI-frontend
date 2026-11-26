'use client';

// Writing and editing a marketplace product review, used on the product page and the order page.
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import StarRating from './StarRating';

const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 50 * 1024 * 1024;

export default function ProductReviewModal({ slug, productTitle, review, onClose, onSaved }) {
  const token = useSelector((s) => s.auth?.token);
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || '');
  const [keptImages, setKeptImages] = useState(review?.images || []);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [saving, setSaving] = useState(false);

  const addImages = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (keptImages.length + images.length + files.length > MAX_IMAGES) return toast.error(`Maximum ${MAX_IMAGES} images allowed`);
    if (files.some((file) => file.size > MAX_FILE_BYTES)) return toast.error('Each image must be less than 50MB');
    setImages((current) => [...current, ...files]);
  };

  const addVideo = (event) => {
    const file = event.target.files?.[0];
    if (file && file.size > MAX_FILE_BYTES) return toast.error('Video must be less than 50MB');
    setVideo(file || null);
  };

  const submit = async () => {
    if (!rating) return toast.error('Please select a rating (stars)');
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('comment', comment.trim());
    images.forEach((file) => formData.append('images', file));
    if (video) formData.append('video', video);
    if (review) {
      (review.images || [])
        .filter((image) => !keptImages.some((kept) => kept.url === image.url))
        .forEach((image) => formData.append('removeImages', image.url));
    }

    setSaving(true);
    try {
      const url = `/e-commerce/products/${slug}/reviews`;
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      const { data } = review
        ? await axiosInstance.patch(`${url}/${review._id}`, formData, config)
        : await axiosInstance.post(url, formData, config);
      if (!data.success) return toast.error(data.message || 'Could not save your review');
      toast.success(review ? 'Review updated' : 'Review submitted successfully!');
      onSaved?.(data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save your review');
    } finally {
      setSaving(false);
    }
  };

  const fileInput = 'block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-semibold hover:file:bg-primary-100';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-label="Product review" className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8 text-left">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm">{review ? 'Edit your review' : 'Write a review'}</h3>
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
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Photos <span className="font-normal normal-case text-gray-400">(optional, up to {MAX_IMAGES})</span></p>
            <input type="file" accept="image/*" multiple onChange={addImages} className={fileInput} />
            {(keptImages.length > 0 || images.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keptImages.map((image) => (
                  <button key={image.url} type="button" onClick={() => setKeptImages((list) => list.filter((i) => i.url !== image.url))}
                    title="Remove photo" className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                    <img src={image.url} alt="Review" className="w-full h-full object-cover" />
                    <Icon icon="mdi:close-circle" className="absolute top-0.5 right-0.5 w-4 h-4 text-black/70" />
                  </button>
                ))}
                {images.map((file, index) => (
                  <button key={`${file.name}-${index}`} type="button" onClick={() => setImages((list) => list.filter((_, i) => i !== index))}
                    title="Remove photo" className="flex items-center gap-1 text-xs bg-gray-100 rounded-lg px-2 py-1 max-w-full">
                    <span className="truncate max-w-[10rem]">{file.name}</span>
                    <Icon icon="mdi:close" className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Video <span className="font-normal normal-case text-gray-400">(optional)</span></p>
            <input type="file" accept="video/*" onChange={addVideo} className={fileInput} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 text-sm">Cancel</button>
            <button type="button" onClick={submit} disabled={saving || !rating}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm">
              {saving ? 'Saving…' : review ? 'Save changes' : 'Submit review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The "Add Review" button of one delivered order item. */
export function OrderItemReviewButton({ slug, productTitle }) {
  const token = useSelector((s) => s.auth?.token);
  const [state, setState] = useState({ canReview: false, review: null });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token || !slug) return undefined;
    let cancelled = false;
    axiosInstance
      .get(`/e-commerce/products/${slug}/review-eligibility`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { if (!cancelled) setState({ canReview: Boolean(data.canReview), review: data.review || null }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug, token]);

  if (!state.canReview) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
      >
        <Icon icon="solar:star-bold-duotone" className="w-4 h-4" />
        {state.review ? 'Edit Review' : 'Add Review'}
      </button>
      {open && (
        <ProductReviewModal
          slug={slug}
          productTitle={productTitle}
          review={state.review}
          onClose={() => setOpen(false)}
          onSaved={(review) => setState((current) => ({ ...current, review }))}
        />
      )}
    </>
  );
}
