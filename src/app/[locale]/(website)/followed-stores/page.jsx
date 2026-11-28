'use client';

// The stores this customer follows.
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import { Link, useRouter } from '@/i18n/navigation';

export default function FollowedStoresPage() {
  const { token } = useSelector((state) => state.auth);
  const router = useRouter();
  const [stores, setStores] = useState(null);
  const [leaving, setLeaving] = useState(null);

  const load = useCallback(() => axiosInstance
    .get('/e-commerce/user/followed-sellers', { headers: { Authorization: `Bearer ${token}` } })
    .then(({ data }) => setStores(data.data || []))
    .catch(() => { setStores([]); toast.error('Could not load the stores you follow'); }), [token]);

  useEffect(() => {
    if (!token) { router.push('/auth/login?next=/followed-stores'); return; }
    load();
  }, [token, load, router]);

  const unfollow = async (store) => {
    setLeaving(store._id);
    try {
      const { data } = await axiosInstance.post(`/e-commerce/sellers/${store._id}/follow`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (!data.isFollowing) {
        setStores((list) => list.filter((item) => item._id !== store._id));
        toast.info(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not unfollow the store');
    } finally {
      setLeaving(null);
    }
  };

  if (!token || stores === null) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900">Followed Stores</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        You are notified when these stores add a product, raise a discount or join a flash deal.
      </p>

      {stores.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Icon icon="mdi:store-outline" className="w-16 h-16 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-600">You do not follow any store yet</p>
          <Link href="/products" className="inline-block mt-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store) => (
            <div key={store._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="h-28 bg-gradient-to-br from-primary-500 to-primary-700">
                {store.coverPhoto && <img src={store.coverPhoto} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="px-4 pb-4 -mt-7 flex flex-col flex-1">
                <div className="w-14 h-14 rounded-xl border-2 border-white shadow bg-primary-600 overflow-hidden flex items-center justify-center text-white text-xl font-black">
                  {store.profilePictureOrLogo
                    ? <img src={store.profilePictureOrLogo} alt={store.businessName || 'Store'} className="w-full h-full object-cover" />
                    : (store.businessName || 'S').charAt(0).toUpperCase()}
                </div>
                <h2 className="mt-2 font-bold text-gray-900 truncate">{store.businessName || 'Store'}</h2>
                <p className="text-xs text-gray-400">{store.followersCount || 0} follower{store.followersCount === 1 ? '' : 's'}</p>
                {store.storeDescription && <p className="mt-2 text-xs text-gray-500 line-clamp-2 break-words">{store.storeDescription}</p>}
                <div className="mt-auto pt-4 flex gap-2">
                  <Link href={`/store/${store._id}`} className="flex-1 text-center bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold py-2.5 rounded-xl">
                    Visit store
                  </Link>
                  <button
                    type="button"
                    onClick={() => unfollow(store)}
                    disabled={leaving === store._id}
                    className="flex-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs font-bold py-2.5 rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {leaving === store._id ? 'Please wait…' : 'Unfollow'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
