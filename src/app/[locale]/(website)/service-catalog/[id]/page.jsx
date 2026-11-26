'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { Link, useRouter } from '@/i18n/navigation';
import { useChat } from '@/hooks/useChat';
import { addChat } from '@/store/chat';
import { toast } from 'react-toastify';
import { TIME_WINDOWS, isoDay } from '@/components/website/serviceRequests/requestUi';

const money = (n) => `₺${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

// One public service (approved + active). Data: GET /public/repairman-services/:id
export default function ServiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { openChat, selectChat } = useChat();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [starting, setStarting] = useState(false);
  const [booking, setBooking] = useState(null); // booking form values while open
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axiosInstance.get(`/public/repairman-services/${id}`)
      .then(({ data }) => { setService(data.data); setNotFound(false); })
      .catch((error) => {
        if (error?.response?.status === 404) setNotFound(true);
        else handleError(error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Customers talk to the repairman in the chat (a quotation for this service is sent there)
  const startChat = async () => {
    if (!user || !token) {
      router.push('/auth/login');
      return;
    }
    const repairman = service?.repairman;
    try {
      setStarting(true);
      const { data } = await axiosInstance.post('/chat/start', { repairmanId: repairman._id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const name = data?.chat?.user?.name || repairman?.repairmanProfile?.shopName || repairman?.name;
      const avatar = data?.chat?.user?.avatar || repairman?.repairmanProfile?.profilePhoto;
      dispatch(addChat({
        id: data?.chat?._id, chatId: data?.chat?._id, name, avatar,
        userId: data?.chat?.user?._id || repairman._id, lastMessage: '', timestamp: new Date().toISOString(), online: false,
      }));
      openChat();
      selectChat({ id: data?.chat?._id, name, avatar });
    } catch (error) {
      handleError(error);
    } finally {
      setStarting(false);
    }
  };

  const openBooking = () => {
    if (!user || !token) {
      router.push('/auth/login');
      return;
    }
    setBooking({ delivery: 'drop-off', pickupAddress: '', preferredDate: isoDay(1), timeWindow: 'morning', note: '' });
  };

  const sendBooking = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await axiosInstance.post('/service-requests', { serviceId: service._id, ...booking }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message || 'Request sent');
      setBooking(null);
      router.push('/my-account/service-requests');
    } catch (error) {
      handleError(error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Icon icon="heroicons:wrench-screwdriver" className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-gray-900">This service is not available</h1>
          <p className="text-gray-600 mt-1">It may have been removed or is being updated by the repairman.</p>
          <Link href="/service-catalog" className="inline-block mt-5 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Browse repair services
          </Link>
        </div>
      </div>
    );
  }

  const rp = service.repairman?.repairmanProfile || {};
  const repairmanName = rp.shopName || rp.fullName || service.repairman?.name;
  const canChat = !user || user.role === 'customer';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/service-catalog" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <Icon icon="heroicons:arrow-left" className="w-4 h-4" /> All repair services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-primary-700 font-medium">{service.brand?.name} {service.model?.name}</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{service.title}</h1>
              {service.city && (
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                  <Icon icon="heroicons:map-pin" className="w-4 h-4" /> {service.city}
                </p>
              )}
              <p className="text-gray-700 mt-4 whitespace-pre-line leading-relaxed">{service.description}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Price</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Repair work</span><span>{money(service.pricing?.basePrice)}</span></div>
                {service.pricing?.partsPrice > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">Parts</span><span>{money(service.pricing.partsPrice)}</span></div>
                )}
                {service.pricing?.serviceCharges > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">Service charges</span><span>{money(service.pricing.serviceCharges)}</span></div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold">
                  <span>Total</span><span className="text-primary-600">{money(service.pricing?.total)}</span>
                </div>
              </div>
            </div>

            {service.moreFromRepairman?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">More from {repairmanName}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.moreFromRepairman.map((m) => (
                    <Link key={m._id} href={`/service-catalog/${m._id}`} className="border border-gray-200 rounded-lg p-3 hover:border-primary-300">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{m.title}</p>
                      <p className="text-xs text-gray-500">{m.brand?.name} {m.model?.name}</p>
                      <p className="text-sm font-semibold text-primary-600 mt-1">{money(m.pricing?.total)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Repairman + action */}
          <aside className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-3">
                {rp.profilePhoto ? (
                  <img src={rp.profilePhoto} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon icon="heroicons:user" className="w-7 h-7 text-gray-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{repairmanName}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    {rp.rating > 0 ? (
                      <><Icon icon="heroicons:star-solid" className="w-4 h-4 text-yellow-400" />{Number(rp.rating).toFixed(1)} ({rp.totalReviews || 0})</>
                    ) : 'New on CTI'}
                    {rp.totalJobs > 0 && ` · ${rp.totalJobs} jobs`}
                  </p>
                </div>
              </div>

              <p className="text-3xl font-bold text-gray-900 mt-5">{money(service.pricing?.total)}</p>
              <p className="text-xs text-gray-500">Fixed price set by the repairman</p>

              {canChat && service.canBook && (
                <button type="button" onClick={openBooking}
                  className="mt-5 w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center justify-center gap-2">
                  <Icon icon="heroicons:calendar-days" className="w-5 h-5" />
                  {user ? 'Book this service' : 'Log in to book'}
                </button>
              )}
              {canChat && service.canBook && (
                <p className="text-xs text-gray-500 mt-2">
                  No payment now. The repairman confirms the time within 24 hours, then you pay to confirm the booking.
                  {service.pickupAvailable ? ' Pickup is available.' : ''}
                </p>
              )}
              {canChat && (
                <button type="button" onClick={startChat} disabled={starting}
                  className={`${service.canBook ? 'mt-3 border border-gray-300 text-gray-700 hover:bg-gray-50' : 'mt-5 bg-primary-600 text-white hover:bg-primary-700'} w-full py-2.5 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 text-sm`}>
                  <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5" />
                  {starting ? 'Opening chat...' : user ? 'Ask the repairman a question' : 'Log in to contact the repairman'}
                </button>
              )}
              <Link href={`/repairmans/${service.repairman?._id}`}
                className="mt-3 block w-full text-center py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                View repairman profile
              </Link>
              <p className="text-xs text-gray-500 mt-4">
                Payment is made on CTI and held safely until your repair is done.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {booking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <form onSubmit={sendBooking} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Book: {service.title}</h2>
              <p className="text-sm text-gray-600">{money(service.pricing?.total)}{service.pickupAvailable ? ' + pickup charge if you choose pickup' : ''}</p>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2">How does the device get to the repairman?</legend>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer">
                  <input type="radio" name="delivery" checked={booking.delivery === 'drop-off'} onChange={() => setBooking({ ...booking, delivery: 'drop-off' })} className="mt-1" />
                  <span className="text-sm"><span className="font-medium">I bring it</span><span className="block text-xs text-gray-500">The repairman sends you the address when accepting.</span></span>
                </label>
                {service.pickupAvailable && (
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer">
                    <input type="radio" name="delivery" checked={booking.delivery === 'pickup'} onChange={() => setBooking({ ...booking, delivery: 'pickup' })} className="mt-1" />
                    <span className="text-sm"><span className="font-medium">Pick it up from me</span><span className="block text-xs text-gray-500">The repairman tells you the pickup charge when accepting.</span></span>
                  </label>
                )}
              </div>
            </fieldset>

            {booking.delivery === 'pickup' && (
              <label className="block text-sm">
                <span className="block text-gray-700 mb-1">Pickup address <span className="text-red-500">*</span></span>
                <textarea rows={2} required minLength={5} maxLength={300} value={booking.pickupAddress}
                  onChange={(e) => setBooking({ ...booking, pickupAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </label>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Preferred day</span>
                <input type="date" required min={isoDay(0)} max={isoDay(60)} value={booking.preferredDate}
                  onChange={(e) => setBooking({ ...booking, preferredDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </label>
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Time</span>
                <select value={booking.timeWindow} onChange={(e) => setBooking({ ...booking, timeWindow: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {Object.entries(TIME_WINDOWS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>

            <label className="block text-sm">
              <span className="block text-gray-700 mb-1">Note for the repairman (optional)</span>
              <textarea rows={2} maxLength={500} value={booking.note} placeholder="e.g. the screen is cracked at the top"
                onChange={(e) => setBooking({ ...booking, note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </label>

            <p className="text-xs text-gray-500">Nothing is charged now. You pay after the repairman accepts (within 24 hours).</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setBooking(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={sending} className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {sending ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
