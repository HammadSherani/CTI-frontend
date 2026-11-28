'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { fetchCart } from '@/store/cart';
import { fetchRefurbishedCart } from '@/store/refurbishedCart';
import IyzicoCheckoutForm from '@/components/payment/IyzicoCheckoutForm';
import * as yup from 'yup';
import { Country, State, City } from 'country-state-city';
import LoginModal from './LoginModal';
import Select from 'react-select';
import InvoiceGenerator from '@/components/website/InvoiceGenerator';
import PhoneInput from '@/components/common/PhoneInput';
import { nationalDigits } from '@/helper/phone';
import { formatCurrency } from '@/helper/currencyFormatter';

// Delivery and courier labels work in Turkey only; the form keeps the 10 digit national number
const toTurkishMobile = (value) => {
  const digits = String(value || '').replace(/\D/g, '').replace(/^00/, '').replace(/^90(?=5)/, '').replace(/^0/, '');
  return /^5\d{9}$/.test(digits) ? digits : '';
};

// Cards are entered only in iyzico's form. Older versions of this page kept card fields in the
// saved form, so they are still stripped from what is read back.
const CARD_FIELDS = ['cardHolder', 'cardNumber', 'expiry', 'cvv'];
const withoutCard = (data) => Object.fromEntries(Object.entries(data).filter(([key]) => !CARD_FIELDS.includes(key)));

// ── Yup Validation Schema ─────────────────────────────────────────────────────
const checkoutSchema = yup.object().shape({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  email: yup.string().email('Valid email is required').required('Email is required'),
  phone: yup
    .string()
    .matches(/^5[0-9]{9}$/, 'Phone must be a valid Turkish number starting with 5 (e.g. 5XXXXXXXXX)')
    .required('Phone is required'),
  address: yup.string().required('Address is required'),
  countryCode: yup.string().oneOf(['TR'], 'Only Turkey is supported currently').required('Country is required'),
  stateCode: yup.string().required('State / Province is required'),
  city: yup.string().required('City is required'),
  postalCode: yup.string().matches(/^[0-9]*$/, 'Postal Code must contain only numbers').nullable(),
});

// ── Select Styles Helper ──────────────────────────────────────────────────────
const selectCls = (hasError) =>
  `w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-colors appearance-none bg-white ${hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-400'
  }`;

const customSelectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    paddingLeft: '32px',
    borderRadius: '0.75rem',
    borderWidth: '1px',
    borderColor: hasError ? '#f87171' : state.isFocused ? '#ff9f32' : '#e5e7eb',
    boxShadow: 'none',
    minHeight: '44px',
    backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
    '&:hover': {
      borderColor: hasError ? '#f87171' : '#ff9f32',
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: '#1f2937',
    fontWeight: '500'
  }),
  valueContainer: (base) => ({ ...base, padding: '2px 8px' }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#9ca3af', padding: '8px' }),
  menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '0.75rem', overflow: 'hidden' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#ff820a' : state.isFocused ? '#ff9f32' : 'transparent',
    color: (state.isSelected || state.isFocused) ? 'white' : '#1f2937',
    cursor: 'pointer',
    fontSize: '14px',
    '&:active': { backgroundColor: '#ff6900' }
  })
});

// ── Main Component ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector(s => s.auth);
  const auth = useSelector(s => s.auth);
  const userRole = auth?.userType || auth?.user?.role || null;
  const type = searchParams.get('type');
  const isRefurbished = type === 'refurbished';
  // An order can only ever belong to one seller (enforced backend-side too) —
  // the cart page always links here with a sellerId for a normal-ecom
  // checkout; only Buy Now / direct-items skip this.
  const sellerId = searchParams.get('sellerId');

  const standardCartItems = useSelector(s => s.cart?.items || []);
  const standardCartId = useSelector(s => s.cart?.cartId);

  const refurbishedCartItems = useSelector(s => s.refurbishedCart?.items || []);
  const refurbishedCartId = useSelector(s => s.refurbishedCart?.cartId);

  const resolveId = (v) => (v && typeof v === 'object') ? v._id : v;

  const allCartItems = isRefurbished ? refurbishedCartItems : standardCartItems;
  // Only this seller's items go into this checkout — the rest stay in the
  // cart for a separate checkout.
  const cartItems = (!isRefurbished && sellerId)
    ? allCartItems.filter(item => resolveId(item.productId?.sellerId) === sellerId)
    : allCartItems;
  const cartId = isRefurbished ? refurbishedCartId : standardCartId;

  // Anything NOT covered by this checkout — other sellers in the same cart,
  // plus the other cart type entirely — surfaced so nothing silently gets
  // left behind with no indication.
  const otherSellerItemsCount = (!isRefurbished && sellerId)
    ? allCartItems.length - cartItems.length
    : 0;
  const otherCartItems = isRefurbished ? standardCartItems : refurbishedCartItems;
  const otherCheckoutLink = isRefurbished ? '/checkout' : '/checkout?type=refurbished';
  const otherCheckoutLabel = isRefurbished ? 'Marketplace' : 'Refurbished';

  const [errors, setErrors] = useState({});
  const isBuyNow = searchParams.get('buyNow') === 'true';
  const slug = searchParams.get('slug');
  const queryVariantId = searchParams.get('variantId');
  const queryQuantity = parseInt(searchParams.get('quantity') || '1');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // iyzico hosted form (card + 3D Secure happen there, never on our servers)
  const locale = useLocale();
  const [checkoutContent, setCheckoutContent] = useState(null);
  // After iyzico sends the customer back (?checkout=<id>): verifying | slow | failed | refunded | on_hold | error
  const [returnState, setReturnState] = useState(null);
  const returnedCheckoutId = searchParams.get('checkout');
  const checkoutBase = isRefurbished ? '/refurbished/orders/checkout' : '/e-commerce/orders/checkout';
  const remainingCartCount = standardCartItems.length + refurbishedCartItems.length;

  // ── Form State ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: auth?.user?.firstName || auth?.user?.name || '',
    lastName: auth?.user?.lastName || '',
    email: auth?.user?.email || '',
    phone: toTurkishMobile(auth?.user?.phone),
    address: '',
    // Location
    countryCode: 'TR',
    country: 'Turkey',
    stateCode: '',
    state: '',
    city: '',
    postalCode: '',
  });

  // ── All countries list (static, from country-state-city) ────────────────────
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // ── States for selected country ──────────────────────────────────────────────
  const stateList = useMemo(
    () => (form.countryCode ? State.getStatesOfCountry(form.countryCode) : []),
    [form.countryCode]
  );

  // ── Cities for selected state ────────────────────────────────────────────────
  const cityList = useMemo(
    () =>
      form.countryCode && form.stateCode
        ? City.getCitiesOfState(form.countryCode, form.stateCode)
        : [],
    [form.countryCode, form.stateCode]
  );

  // ── Districts the courier accepts (the static list also has names that are not districts) ──
  const [courierDistricts, setCourierDistricts] = useState({ province: '', names: [] });

  useEffect(() => {
    if (!form.state) return undefined;
    let cancelled = false;
    axiosInstance
      .get('/e-commerce/geo/districts', { params: { province: form.state } })
      .then(({ data }) => {
        if (!cancelled && data.data?.length) setCourierDistricts({ province: form.state, names: data.data });
      })
      .catch(() => { }); // the static list stays in use
    return () => { cancelled = true; };
  }, [form.state]);

  const fromCourier = courierDistricts.province === form.state && courierDistricts.names.length > 0;
  const districtNames = fromCourier ? courierDistricts.names : cityList.map(c => c.name);

  // a name saved earlier that is not a district has to be chosen again
  useEffect(() => {
    if (fromCourier && form.city && !courierDistricts.names.includes(form.city)) {
      setForm(f => ({ ...f, city: '' }));
    }
  }, [fromCourier, courierDistricts, form.city]);

  // ── Persist form to localStorage ─────────────────────────────────────────────
  useEffect(() => {
    const savedForm = localStorage.getItem('checkout_form_data');
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setForm(f => ({
          ...f,
          ...withoutCard(parsed), // also ignores a card saved by the earlier version
          countryCode: parsed.countryCode || 'TR',
          country: parsed.country || 'Turkey',
          email: auth?.user?.email || parsed.email || '',
          firstName: auth?.user?.firstName || parsed.firstName || '',
          lastName: auth?.user?.lastName || parsed.lastName || '',
          phone: toTurkishMobile(auth?.user?.phone) || parsed.phone || '',
        }));
      } catch (_) { }
    }
  }, [auth?.user]);

  useEffect(() => {
    localStorage.setItem('checkout_form_data', JSON.stringify(withoutCard(form)));
  }, [form]);

  // ── Load items (Buy Now vs Cart) ──────────────────────────────────────────────
  useEffect(() => {
    if (isBuyNow && slug) {
      const fetchUrl = isRefurbished
        ? `/public/refurbished-devices/products/${slug}`
        : `/e-commerce/products/${slug}`;

      axiosInstance.get(fetchUrl)
        .then(res => {
          const product = isRefurbished ? res.data.data : res.data.data.product;
          const variants = isRefurbished ? (res.data.data.variants || []) : res.data.data.variants;
          const variant = queryVariantId ? variants.find(v => v._id === queryVariantId) : variants[0];
          if (!product || !variant) {
            toast.error('Product or variant not found');
            router.push('/');
            return;
          }
          if (!isRefurbished && (product.sellerId === auth?.user?._id || product.sellerId === auth?.user?.id)) {
            toast.error('You cannot buy your own product');
            router.push('/');
            return;
          }
          let price = variant.discountPrice || variant.sellingPrice || variant.price || 0;
          if (isRefurbished && product.flashDeal) {
            price = price * (1 - product.flashDeal.discountPercentage / 100);
          }
          setItems([{ productId: product._id, productDetails: product, variantId: variant._id, variantDetails: variant, quantity: queryQuantity, price }]);
          setSubTotal(price * queryQuantity);
          setLoading(false);
        })
        .catch(() => { toast.error('Failed to load product details'); router.push('/'); });
    } else {
      let currentSubTotal = 0;
      const formattedItems = cartItems.map(item => {
        const pDetails = item.productId || item;
        const vDetails = item.variantId || item;
        let price = vDetails.discountPrice || vDetails.sellingPrice || vDetails.price || pDetails.summary?.minSalePrice || 0;
        if (isRefurbished && pDetails.flashDeal) {
          price = price * (1 - pDetails.flashDeal.discountPercentage / 100);
        }
        currentSubTotal += price * item.quantity;
        return {
          productId: pDetails._id || pDetails,
          productDetails: pDetails,
          variantId: vDetails._id || vDetails,
          variantDetails: vDetails,
          quantity: item.quantity,
          price,
        };
      });
      setItems(formattedItems);
      setSubTotal(currentSubTotal);
      setLoading(false);
    }
  }, [isBuyNow, slug, queryVariantId, queryQuantity, cartItems, auth, router, isRefurbished]);

  // ── Back from iyzico: ask the server what happened (it verifies with iyzico) ──
  useEffect(() => {
    if (!returnedCheckoutId || !token) return undefined;
    let stopped = false;
    let timer;
    let tries = 0;
    setCheckoutContent(null);
    setReturnState({ status: 'verifying' });
    const poll = async () => {
      try {
        const { data } = await axiosInstance.get(`${checkoutBase}/${returnedCheckoutId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (stopped) return;
        const result = data?.data;
        if (result?.status === 'completed' && result.order) {
          localStorage.removeItem('checkout_form_data');
          // The server already removed the bought items; other items stay in the cart
          dispatch(fetchCart());
          dispatch(fetchRefurbishedCart());
          setReturnState(null);
          setOrderSuccess(result.order);
          return;
        }
        if (result?.status === 'verifying') {
          tries += 1;
          if (tries < 20) {
            timer = setTimeout(poll, 3000);
            return;
          }
          setReturnState({ status: 'slow', message: 'Your payment is still being confirmed. Please check My Orders in a few minutes before paying again.' });
          return;
        }
        setReturnState({ status: result?.status || 'error', message: result?.message });
      } catch (err) {
        if (!stopped) {
          setReturnState({ status: 'error', message: err.response?.data?.message || 'We could not check your payment. Please look at My Orders before paying again.' });
        }
      }
    };
    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [returnedCheckoutId, token, checkoutBase, dispatch]);

  // ── Customer pays no shipping ─────────────────────────────────────────────────
  const TOTAL = subTotal;

  // ── Form Handlers ─────────────────────────────────────────────────────────────
  const handleForm = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCountryChange = (selectedOption) => {
    const isoCode = selectedOption?.value || '';
    const countryObj = allCountries.find(c => c.isoCode === isoCode);
    setForm(f => ({ ...f, countryCode: isoCode, country: countryObj?.name || '', stateCode: '', state: '', city: '' }));
    setErrors(prev => ({ ...prev, countryCode: '', stateCode: '', city: '' }));
  };

  const handleStateChange = (selectedOption) => {
    const code = selectedOption?.value || '';
    const stateObj = stateList.find(s => s.isoCode === code);
    setForm(f => ({ ...f, stateCode: code, state: stateObj?.name || '', city: '' }));
    setErrors(prev => ({ ...prev, stateCode: '', city: '' }));
  };

  const handleCityChange = (selectedOption) => {
    const cityName = selectedOption?.value || '';
    setForm(f => ({ ...f, city: cityName }));
    setErrors(prev => ({ ...prev, city: '' }));
  };

  // ── Pay: the server checks the order, reserves the stock and opens iyzico's form ──
  // Opens by itself once the address is complete (see the effect below); this is also the retry.
  const formRequest = useRef(0); // answers of an older request are ignored
  const handlePlaceOrder = async () => {
    // Only customers can place orders
    if (userRole && userRole !== 'customer') {
      toast.error('Only customers can place orders');
      return;
    }
    try {
      await checkoutSchema.validate(form, { abortEarly: false });
    } catch (err) {
      const fieldErrors = {};
      err.inner.forEach(e => { fieldErrors[e.path] = e.message; });
      setErrors(fieldErrors);
      toast.error(err.inner[0].message);
      return;
    }
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!items.length) {
      toast.error('Your cart is empty');
      return;
    }

    formRequest.current += 1;
    const mine = formRequest.current;
    const isLatest = () => mine === formRequest.current;
    setCheckoutContent(null);
    setSubmitting(true);
    try {
      // so iyzico brings the customer back to this same checkout
      const back = new URLSearchParams(searchParams.toString());
      back.delete('checkout');
      const payload = {
        shippingAddress: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone,
          country: form.country,
          countryCode: form.countryCode,
          state: form.state,
          stateCode: form.stateCode,
          city: form.city,
          area: form.city,
          addressLine: form.address,
          postalCode: form.postalCode || null,
        },
        locale,
        returnQuery: back.toString(),
      };
      if (isBuyNow || !cartId) {
        payload.items = items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }));
      } else {
        payload.cartId = cartId;
        if (!isRefurbished && sellerId) payload.sellerId = sellerId;
      }

      const { data } = await axiosInstance.post(`${checkoutBase}/init`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!isLatest()) return;

      if (data?.data?.alreadyPaid) {
        // an earlier payment went through: show that order
        toast.success(data.message);
        const q = new URLSearchParams(isRefurbished ? { type: 'refurbished' } : {});
        q.set('checkout', data.data.checkoutId);
        router.replace(`/checkout?${q.toString()}`);
        return;
      }
      setCheckoutContent(data.data.checkoutFormContent);
    } catch (err) {
      if (isLatest()) toast.error(err.response?.data?.message || 'Could not start the payment. Nothing was charged. Please try again.');
    } finally {
      if (isLatest()) setSubmitting(false);
    }
  };

  // ── Open the payment form by itself as soon as the address is complete ──
  // Changing the address or the items makes a new form (the server closes the unpaid old one).
  const addressReady = useMemo(() => checkoutSchema.isValidSync(form), [form]);
  const isCustomer = !userRole || userRole === 'customer';
  // After coming back from iyzico, wait for the result; a failed / refunded attempt may pay again
  // (on the first render the result check has not started yet; it switches to 'verifying' at once)
  const returnAllowsPay = !returnedCheckoutId || !returnState || ['failed', 'refunded', 'on_hold'].includes(returnState.status);
  const canAutoPay = addressReady && Boolean(token) && isCustomer && items.length > 0 && !loading && !orderSuccess && returnAllowsPay;
  const paymentKey = JSON.stringify([
    form.firstName, form.lastName, form.phone, form.address, form.stateCode, form.city, form.postalCode,
    cartId, sellerId, items.map(i => `${i.variantId}:${i.quantity}`).join(','),
  ]);
  const openForm = useRef(handlePlaceOrder);
  openForm.current = handlePlaceOrder;
  useEffect(() => {
    formRequest.current += 1; // a form for other details must not stay on screen
    setCheckoutContent(null);
    setSubmitting(false);
    if (!canAutoPay) return undefined;
    const timer = setTimeout(() => openForm.current(), 1200); // wait until typing stops
    return () => clearTimeout(timer);
  }, [canAutoPay, paymentKey]);

  const dismissReturn = () => {
    setReturnState(null);
    const q = new URLSearchParams(searchParams.toString());
    q.delete('checkout');
    router.replace(q.toString() ? `/checkout?${q.toString()}` : '/checkout');
  };

  if (returnState?.status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Icon icon="mdi:loading" className="animate-spin text-4xl text-primary-500" />
          <p className="text-base font-semibold text-gray-800">Confirming your payment…</p>
          <p className="text-sm text-gray-500">Please do not close this page or pay again.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="mdi:loading" className="animate-spin text-4xl text-primary-500" />
          <p className="text-sm text-gray-400">Loading checkout…</p>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon icon="mdi:check-circle" className="text-5xl text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Order Successful!</h2>
          <p className="text-gray-500 mb-6">Your order #{orderSuccess.orderNo || orderSuccess._id} has been placed.</p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Order Summary</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Total Amount:</span>
              <span className="font-bold text-primary-600">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(orderSuccess.totalPrice || orderSuccess.totalAmount || TOTAL)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Payment Status:</span>
              <span className="font-semibold text-green-600 capitalize">{orderSuccess.paymentStatus?.toLowerCase() || 'Paid'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <InvoiceGenerator order={orderSuccess} className="w-full justify-center py-3 text-base" />
            <button
              onClick={() => {
                router.push(isRefurbished ? `/orders/${orderSuccess._id}?type=refurbished` : `/orders/${orderSuccess._id}`);
              }}
              className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              View Order Details
            </button>
            {remainingCartCount > 0 && (
              <Link href="/cart" className="w-full py-3 bg-primary-50 text-primary-700 font-bold rounded-xl hover:bg-primary-100 transition-colors">
                You still have {remainingCartCount} item{remainingCartCount > 1 ? 's' : ''} in your cart. Check out
              </Link>
            )}
            <Link href="/" className="w-full py-3 text-primary-600 font-bold hover:underline transition-all">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
        <Icon icon="mdi:chevron-right" />
        <Link href="/cart" className="hover:text-primary-500 transition-colors">Cart</Link>
        <Icon icon="mdi:chevron-right" />
        <span className="text-gray-700 font-medium">Checkout</span>
      </nav>
      {/* 
      {otherSellerItemsCount > 0 && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <Icon icon="mdi:information-outline" className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            This checkout only covers this seller's items. You also have {otherSellerItemsCount} item{otherSellerItemsCount > 1 ? 's' : ''} from other sellers in your cart —
            {' '}<Link href="/cart" className="underline font-semibold">check those out separately</Link>.
          </p>
        </div>
      )}

      {otherCartItems.length > 0 && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <Icon icon="mdi:information-outline" className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            This checkout only covers your <span className="font-bold">{isRefurbished ? 'Refurbished' : 'Marketplace'}</span> items.
            You also have {otherCartItems.length} item{otherCartItems.length > 1 ? 's' : ''} in your <span className="font-bold">{otherCheckoutLabel}</span> cart —
            {' '}<Link href={otherCheckoutLink} className="underline font-semibold">check those out separately</Link>.
          </p>
        </div>
      )} */}

      {returnState && (
        <div className={`mb-6 flex items-start gap-3 rounded-2xl px-5 py-4 border ${returnState.status === 'failed' || returnState.status === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          <Icon icon={returnState.status === 'failed' ? 'mdi:credit-card-off-outline' : 'mdi:information-outline'} className="text-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">
              {returnState.status === 'failed' ? 'Payment not completed'
                : returnState.status === 'refunded' ? 'Payment refunded'
                  : returnState.status === 'on_hold' ? 'Order could not be created'
                    : 'Payment status'}
            </p>
            <p>{returnState.message || 'Please try again.'}</p>
            {['refunded', 'on_hold', 'slow', 'error'].includes(returnState.status) && (
              <Link href={isRefurbished ? '/orders?type=refurbished' : '/orders'} className="underline font-semibold">Go to My Orders</Link>
            )}
          </div>
          <button type="button" onClick={dismissReturn} aria-label="Close" className="opacity-60 hover:opacity-100">
            <Icon icon="mdi:close" className="text-lg" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT: Shipping + Payment ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ── Shipping Address ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-extrabold text-gray-800 mb-5 flex items-center gap-2">
              <Icon icon="mdi:map-marker-outline" className="text-primary-500 text-xl" />
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* First + Last Name */}
              {[
                { label: 'First Name', name: 'firstName', placeholder: 'John', icon: 'mdi:account-outline' },
                { label: 'Last Name', name: 'lastName', placeholder: 'Doe', icon: 'mdi:account-outline' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label} *</label>
                  <div className="relative">
                    <Icon icon={f.icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      type="text" name={f.name} value={form[f.name]} onChange={handleForm}
                      placeholder={f.placeholder}
                      className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-colors ${errors[f.name] ? 'border-red-400' : 'border-gray-200 focus:border-primary-400'}`}
                    />
                  </div>
                  {errors[f.name] && <p className="mt-1 text-xs text-red-500">{errors[f.name]}</p>}
                </div>
              ))}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                <div className="relative">
                  <Icon icon="mdi:email-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input type="email" name="email" value={form.email} onChange={handleForm} disabled={!!token} placeholder="john@email.com"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors ${!!token ? 'bg-gray-50 cursor-not-allowed' : ''}`} />
                </div>
              </div>


              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Phone Number (Turkey Only) *
                </label>
                <PhoneInput
                  name="phone"
                  aria-label="Phone number"
                  value={form.phone}
                  onChange={(v) => { setForm(f => ({ ...f, phone: nationalDigits(v) })); setErrors(p => ({ ...p, phone: '' })); }}
                  hasError={Boolean(errors.phone)}
                  className="!rounded-xl"
                />
                {errors.phone ? (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                ) : (
                  <p className="mt-1 text-[10px] text-gray-400">Must start with 5 and be 10 digits long (e.g. 5551234567)</p>
                )}
              </div>

              {/* Address Line — full width */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Street Address *</label>
                <div className="relative">
                  <Icon icon="mdi:home-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input type="text" name="address" value={form.address} onChange={handleForm} placeholder="House #, Street, Area"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-colors ${errors.address ? 'border-red-400' : 'border-gray-200 focus:border-primary-400'}`} />
                </div>
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              {/* ── Country Dropdown ── */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country *</label>
                <div className="relative">
                  <Icon icon="mdi:earth" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base z-10 pointer-events-none" />
                  <Select
                    options={allCountries.map(c => ({ value: c.isoCode, label: `${c.flag ? `${c.flag} ` : ''}${c.name}` }))}
                    value={allCountries.filter(c => c.isoCode === form.countryCode).map(c => ({ value: c.isoCode, label: `${c.flag ? `${c.flag} ` : ''}${c.name}` }))[0] || null}
                    onChange={handleCountryChange}
                    styles={customSelectStyles(errors.countryCode)}
                    placeholder="Search Country…"
                    isDisabled={true}
                    className="text-sm"
                  />
                </div>
                {errors.countryCode && <p className="mt-1 text-xs text-red-500">{errors.countryCode}</p>}
              </div>

              {/* ── State / Province Dropdown ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">State / Province *</label>
                <div className="relative">
                  <Icon icon="mdi:map-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base z-10 pointer-events-none" />
                  <Select
                    options={stateList.map(s => ({ value: s.isoCode, label: s.name }))}
                    value={stateList.filter(s => s.isoCode === form.stateCode).map(s => ({ value: s.isoCode, label: s.name }))[0] || null}
                    onChange={handleStateChange}
                    styles={customSelectStyles(errors.stateCode)}
                    placeholder={form.countryCode ? 'Search State…' : 'Select Country first'}
                    isDisabled={!form.countryCode}
                    isClearable
                    className="text-sm"
                  />
                </div>
                {errors.stateCode && <p className="mt-1 text-xs text-red-500">{errors.stateCode}</p>}
              </div>

              {/* ── City Dropdown ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">District (İlçe) *</label>
                <div className="relative">
                  <Icon icon="mdi:city-variant-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base z-10 pointer-events-none" />
                  {districtNames.length > 0 ? (
                    <Select
                      options={districtNames.map(name => ({ value: name, label: name }))}
                      value={districtNames.includes(form.city) ? { value: form.city, label: form.city } : null}
                      onChange={handleCityChange}
                      styles={customSelectStyles(errors.city)}
                      placeholder="Search district…"
                      isClearable
                      className="text-sm"
                    />
                  ) : (
                    // Fallback to text input if no cities in database for this state
                    <input
                      type="text" name="city" value={form.city}
                      onChange={e => { setForm(f => ({ ...f, city: e.target.value })); setErrors(p => ({ ...p, city: '' })); }}
                      placeholder={form.stateCode ? 'Enter city name…' : 'Select State first'}
                      disabled={!form.stateCode}
                      className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-colors ${!form.stateCode ? 'cursor-not-allowed bg-gray-50 text-gray-400' : errors.city ? 'border-red-400' : 'border-gray-200 focus:border-primary-400'
                        }`}
                    />
                  )}
                </div>
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>

              {/* Postal Code — optional */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Postal Code <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <Icon icon="mdi:mailbox-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input type="text" name="postalCode" value={form.postalCode} onChange={(e) => setForm(f => ({ ...f, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))} inputMode="numeric" maxLength={5} placeholder="34000"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors" />
                </div>
              </div>

            </div>
          </div>

          {/* ── Payment: iyzico's form opens here by itself once the address is complete ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
              <Icon icon="mdi:credit-card-outline" className="text-primary-500 text-xl" />
              {checkoutContent ? `Pay ${formatCurrency(TOTAL)} securely` : 'Payment'}
            </h2>
            {checkoutContent ? (
              <IyzicoCheckoutForm content={checkoutContent} />
            ) : submitting ? (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-8 text-sm text-gray-600">
                <Icon icon="mdi:loading" className="animate-spin text-xl text-primary-500" />
                Loading the secure payment form…
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <Icon icon="mdi:shield-check-outline" className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="text-sm text-gray-600 flex-1">
                  <p className="font-semibold text-gray-800">Secure card payment by iyzico</p>
                  {!token ? (
                    <>
                      <p>Please log in to pay.</p>
                      <button type="button" onClick={() => setIsLoginModalOpen(true)} className="mt-2 text-primary-600 font-semibold hover:underline">Log in</button>
                    </>
                  ) : !isCustomer ? (
                    <p>Only customer accounts can place orders.</p>
                  ) : !items.length ? (
                    <p>Your cart is empty.</p>
                  ) : !addressReady ? (
                    <p>Fill in your shipping address above. The secure payment form opens here automatically.</p>
                  ) : !returnAllowsPay ? (
                    <p>Please check My Orders before paying again.</p>
                  ) : (
                    <>
                      <p>The secure payment form could not be loaded.</p>
                      <button type="button" onClick={handlePlaceOrder} className="mt-2 inline-flex items-center gap-1 text-primary-600 font-semibold hover:underline">
                        <Icon icon="mdi:refresh" /> Load the payment form again
                      </button>
                    </>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    You enter your card in iyzico&apos;s form and confirm it with your bank (3D Secure). Your card details never reach our servers.
                  </p>
                </div>
                <div className="hidden sm:flex gap-1.5 ml-auto">
                  <Icon icon="logos:visa" className="text-2xl" />
                  <Icon icon="logos:mastercard" className="text-2xl" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
            <h3 className="text-base font-extrabold text-gray-800 mb-5">Order Summary</h3>

            {/* Items list */}
            <div className="space-y-4 mb-5 max-h-[300px] overflow-y-auto pr-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center border-b pb-3 last:border-0 last:pb-0">
                  <img
                    src={item.variantDetails?.images?.[0]?.url || item.productDetails?.images?.[0]?.url || 'https://via.placeholder.com/50'}
                    className="w-12 h-12 rounded object-cover border" alt="product"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold line-clamp-1">{item.productDetails?.title || 'Product'}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Pricing rows */}
            <div className="space-y-3 mb-5 border-t pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Items</span>
                <span className="font-semibold text-gray-700">{items.reduce((a, b) => a + b.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Sub total</span>
                <span className="font-semibold text-gray-700">{formatCurrency(subTotal)}</span>
              </div>
              {/* Shipping info note */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Icon icon="mdi:truck-outline" className="text-base" />
                  Shipping
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Free</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-5">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-gray-800">Total</span>
                <span className="font-extrabold text-gray-900 text-lg">{formatCurrency(TOTAL)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                * Shipping costs are handled by the seller after order placement.
              </p>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="mdi:shield-lock-outline" className="text-green-500 text-lg" />
              <span className="text-xs font-bold text-gray-700">Secure Checkout</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {['logos:visa', 'logos:mastercard'].map(icon => (
                <Icon key={icon} icon={icon} className="text-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => { setForm(f => ({ ...f, email: user.email })); setIsLoginModalOpen(false); }}
      />
    </div>
  );
}