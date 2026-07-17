'use client';

import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { removeFromCart, clearCart } from '@/store/cart';
import * as yup from 'yup';
import { Country, State, City } from 'country-state-city';
import LoginModal from './LoginModal';
import Select from 'react-select';

// ── Yup Validation Schema ─────────────────────────────────────────────────────
const checkoutSchema = yup.object().shape({
  firstName:   yup.string().required('First Name is required'),
  lastName:    yup.string().required('Last Name is required'),
  email:       yup.string().email('Valid email is required').required('Email is required'),
  phone: yup
    .string()
    .matches(/^[0-9]+$/, 'Only numbers are allowed')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .required('Phone is required'),
  address:     yup.string().required('Address is required'),
  countryCode: yup.string().required('Country is required'),
  stateCode:   yup.string().required('State / Province is required'),
  city:        yup.string().required('City is required'),
  postalCode:  yup.string().matches(/^[0-9]*$/, 'Postal Code must contain only numbers').nullable(),
});

// ── Select Styles Helper ──────────────────────────────────────────────────────
const selectCls = (hasError) =>
  `w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-colors appearance-none bg-white ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-400'
  }`;

const customSelectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    paddingLeft: '32px',
    borderRadius: '0.75rem',
    borderWidth: '1px',
    borderColor: hasError ? '#f87171' : state.isFocused ? '#a78bfa' : '#e5e7eb',
    boxShadow: 'none',
    minHeight: '44px',
    backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
    '&:hover': {
      borderColor: hasError ? '#f87171' : '#a78bfa',
    }
  }),
  valueContainer: (base) => ({ ...base, padding: '2px 8px' }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#9ca3af', padding: '8px' }),
  menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '0.75rem', overflow: 'hidden' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#8b5cf6' : state.isFocused ? '#ede9fe' : 'transparent',
    color: state.isSelected ? 'white' : '#1f2937',
    cursor: 'pointer',
    fontSize: '14px',
    '&:active': { backgroundColor: '#7c3aed' }
  })
});

// ── Main Component ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const dispatch     = useDispatch();
  const { token, isAuthenticated } = useSelector(s => s.auth);
  const auth      = useSelector(s => s.auth);
  const cartItems = useSelector(s => s.cart?.items || []);
  const cartId    = useSelector(s => s.cart?.cartId);

  const [errors, setErrors]         = useState({});
  const isBuyNow     = searchParams.get('buyNow') === 'true';
  const slug         = searchParams.get('slug');
  const queryVariantId  = searchParams.get('variantId');
  const queryQuantity   = parseInt(searchParams.get('quantity') || '1');

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems]           = useState([]);
  const [subTotal, setSubTotal]     = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState();
  const [saveCard, setSaveCard]           = useState(false);

  // ── Form State ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName:   auth?.user?.firstName || auth?.user?.name || '',
    lastName:    auth?.user?.lastName  || '',
    email:       auth?.user?.email     || '',
    phone:       auth?.user?.phone     || '',
    address:     '',
    // Location
    countryCode: '',
    country:     '',
    stateCode:   '',
    state:       '',
    city:        '',
    postalCode:  '',
    // Card
    cardHolder: auth?.user?.firstName || auth?.user?.name || '',
    cardNumber: '5528790000000008',
    expiry:     '12/30',
    cvv:        '123',
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

  // ── Persist form to localStorage ─────────────────────────────────────────────
  useEffect(() => {
    const savedForm = localStorage.getItem('checkout_form_data');
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setForm(f => ({
          ...f,
          ...parsed,
          email:     auth?.user?.email     || parsed.email     || '',
          firstName: auth?.user?.firstName || parsed.firstName || '',
          lastName:  auth?.user?.lastName  || parsed.lastName  || '',
          phone:     auth?.user?.phone     || parsed.phone     || '',
        }));
      } catch (_) {}
    }
  }, [auth?.user]);

  useEffect(() => {
    localStorage.setItem('checkout_form_data', JSON.stringify(form));
  }, [form]);

  // ── Load items (Buy Now vs Cart) ──────────────────────────────────────────────
  useEffect(() => {
    if (isBuyNow && slug) {
      axiosInstance.get(`/e-commerce/products/${slug}`)
        .then(res => {
          const product  = res.data.data.product;
          const variants = res.data.data.variants;
          const variant  = queryVariantId ? variants.find(v => v._id === queryVariantId) : variants[0];
          if (!product || !variant) {
            toast.error('Product or variant not found');
            router.push('/');
            return;
          }
          if (product.sellerId === auth?.user?._id || product.sellerId === auth?.user?.id) {
            toast.error('You cannot buy your own product');
            router.push('/');
            return;
          }
          const price = variant.discountPrice || variant.sellingPrice || variant.price || 0;
          setItems([{ productId: product._id, productDetails: product, variantId: variant._id, variantDetails: variant, quantity: queryQuantity, price }]);
          setSubTotal(price * queryQuantity);
          setLoading(false);
        })
        .catch(() => { toast.error('Failed to load product details'); router.push('/'); });
    } else {
      let currentSubTotal = 0;
      const formattedItems = cartItems.map(item => {
        const pDetails = item.productId || item;
        const vDetails = item.variantId  || item;
        const price    = vDetails.discountPrice || vDetails.sellingPrice || vDetails.price || pDetails.summary?.minSalePrice || 0;
        currentSubTotal += price * item.quantity;
        return {
          productId:      pDetails._id || pDetails,
          productDetails: pDetails,
          variantId:      vDetails._id || vDetails,
          variantDetails: vDetails,
          quantity:       item.quantity,
          price,
        };
      });
      setItems(formattedItems);
      setSubTotal(currentSubTotal);
      setLoading(false);
    }
  }, [isBuyNow, slug, queryVariantId, queryQuantity, cartItems, auth, router]);

  // ── Customer pays no shipping ─────────────────────────────────────────────────
  const TOTAL = subTotal;

  // ── Form Handlers ─────────────────────────────────────────────────────────────
  const handleForm = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const digits    = value.replace(/\D/g, '').slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
      setForm(f => ({ ...f, cardNumber: formatted }));
      return;
    }
    if (name === 'expiry') {
      const digits    = value.replace(/\D/g, '').slice(0, 4);
      const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      setForm(f => ({ ...f, expiry: formatted }));
      return;
    }
    if (name === 'cvv') {
      setForm(f => ({ ...f, cvv: value.replace(/\D/g, '').slice(0, 3) }));
      return;
    }
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

  // ── Place Order ───────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    try {
      await checkoutSchema.validate(form, { abortEarly: false });
    } catch (err) {
      const fieldErrors = {};
      err.inner.forEach(e => { fieldErrors[e.path] = e.message; });
      setErrors(fieldErrors);
      toast.error(err.inner[0].message);
      return;
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (paymentMethod === 'card') {
      if (!form.cardHolder || !form.cardNumber || !form.expiry || !form.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
    }
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        shippingAddress: {
          fullName:    `${form.firstName} ${form.lastName}`.trim(),
          phone:        form.phone,
          country:      form.country,
          countryCode:  form.countryCode,
          state:        form.state,
          stateCode:    form.stateCode,
          city:         form.city,
          area:         form.city,
          addressLine:  form.address,
          postalCode:   form.postalCode || null,
        },
        paymentMethod: paymentMethod,
      };

      if (paymentMethod === 'card') {
        payload.cardHolder   = form.cardHolder;
        payload.cardNumber   = form.cardNumber.replace(/\s/g, '');
        const [month, year]  = form.expiry.split('/');
        payload.expireMonth  = month;
        payload.expireYear   = `20${year}`;
        payload.cvc          = form.cvv;
      }

      if (isBuyNow || !cartId) {
        payload.items = items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }));
      } else {
        payload.cartId = cartId;
      }

      const res = await axiosInstance.post('/e-commerce/orders/create', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success('Order placed successfully!');
        localStorage.removeItem('checkout_form_data');
        dispatch(clearCart());
        if (!isBuyNow && token) {
          try {
            await axiosInstance.delete('/e-commerce/cart/my-cart/clear', { headers: { Authorization: `Bearer ${token}` } });
          } catch (_) {}
        }
        router.push('/orders');
      } else {
        toast.error(res.data.message || 'Failed to place order');
      }
    } catch (err) {
      toast.error(err.response?.data?.iyzicoMessage || err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

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
                { label: 'First Name', name: 'firstName', placeholder: 'John',  icon: 'mdi:account-outline' },
                { label: 'Last Name',  name: 'lastName',  placeholder: 'Doe',   icon: 'mdi:account-outline' },
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
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone *</label>
                <div className="relative">
                  <Icon icon="mdi:phone-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type="text" name="phone" value={form.phone}
                    onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setForm(f => ({ ...f, phone: v })); setErrors(p => ({ ...p, phone: '' })); }}
                    inputMode="numeric" maxLength={15} placeholder="03000000000"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-colors ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-400'}`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
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
                    isClearable
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
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">City *</label>
                <div className="relative">
                  <Icon icon="mdi:city-variant-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base z-10 pointer-events-none" />
                  {cityList.length > 0 ? (
                    <Select
                      options={cityList.map(c => ({ value: c.name, label: c.name }))}
                      value={cityList.filter(c => c.name === form.city).map(c => ({ value: c.name, label: c.name }))[0] || null}
                      onChange={handleCityChange}
                      styles={customSelectStyles(errors.city)}
                      placeholder="Search City…"
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
                      className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-colors ${
                        !form.stateCode ? 'cursor-not-allowed bg-gray-50 text-gray-400' : errors.city ? 'border-red-400' : 'border-gray-200 focus:border-primary-400'
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
                  <input type="text" name="postalCode" value={form.postalCode} onChange={handleForm} placeholder="75000"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors" />
                </div>
              </div>

            </div>
          </div>

          {/* ── Payment Method ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-extrabold text-gray-800 mb-5 flex items-center gap-2">
              <Icon icon="mdi:credit-card-outline" className="text-primary-500 text-xl" />
              Select Payment Method
            </h2>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === 'card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${paymentMethod === 'card' ? 'border-primary-500' : 'border-gray-300'}`}>
                {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
              </div>
              <Icon icon="mdi:credit-card-plus-outline" className={`text-xl transition-colors ${paymentMethod === 'card' ? 'text-primary-500' : 'text-gray-400'}`} />
              <span className={`font-semibold text-sm transition-colors ${paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-600'}`}>
                Add Credit / Debit Card
              </span>
              <div className="flex gap-1.5 ml-auto">
                <Icon icon="logos:visa" className="text-2xl" />
                <Icon icon="logos:mastercard" className="text-2xl" />
                <Icon icon="logos:paypal" className="text-xl" />
              </div>
            </button>

            {/* Card Form */}
            {paymentMethod === 'card' && (
              <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Card Holder Name *</label>
                  <div className="relative">
                    <Icon icon="mdi:account-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                    <input type="text" name="cardHolder" value={form.cardHolder} onChange={handleForm} placeholder="Ex: John Doe"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary-400 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Card Number *</label>
                  <div className="relative">
                    <Icon icon="mdi:credit-card-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                    <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleForm} placeholder="4760 6271 6358 047"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary-400 transition-colors tracking-wider" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expiry Date *</label>
                    <div className="relative">
                      <Icon icon="mdi:calendar-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                      <input type="text" name="expiry" value={form.expiry} onChange={handleForm} placeholder="03/26"
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary-400 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">CVV *</label>
                    <div className="relative">
                      <Icon icon="mdi:lock-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                      <input type="password" name="cvv" value={form.cvv} onChange={handleForm} placeholder="•••" maxLength={3}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary-400 transition-colors" />
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div onClick={() => setSaveCard(s => !s)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${saveCard ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                    {saveCard && <Icon icon="mdi:check" className="text-white text-xs" />}
                  </div>
                  <span className="text-sm text-gray-600">Save this information for next time</span>
                </label>
              </div>
            )}
          </div>

          {/* Place Order Button */}
          <button onClick={handlePlaceOrder} disabled={submitting}
            className="w-full bg-gray-900 hover:bg-gray-800 active:scale-95 text-white font-bold py-4 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-xl disabled:opacity-50">
            {submitting ? <Icon icon="mdi:loading" className="animate-spin text-lg" /> : <Icon icon="mdi:shield-check-outline" className="text-green-400 text-lg" />}
            {submitting ? 'Processing…' : 'Place Order Securely'}
          </button>
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
                  <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
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
                <span className="font-semibold text-gray-700">${subTotal.toFixed(2)}</span>
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
                <span className="font-extrabold text-gray-900 text-lg">${TOTAL.toFixed(2)}</span>
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
              {['logos:visa', 'logos:mastercard', 'logos:paypal', 'logos:stripe'].map(icon => (
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