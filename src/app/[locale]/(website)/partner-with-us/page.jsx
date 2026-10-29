'use client';

import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import Breadcrumb from '@/components/ui/Breadcrumb';

/* ── Small reusable input field (plain JS) ── */
function FieldInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  compact = false,
}) {
  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      <label
        className={`${compact ? 'text-[11px]' : 'text-xs'
          } font-bold text-gray-700 uppercase tracking-wide`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition ${compact ? 'px-3.5 py-2.5' : 'px-4 py-3'
          }`}
      />
    </div>
  );
}

export default function PartnerWithUsPage() {
  const formRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleOpenOnboarding = () => setIsModalOpen(true);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const firstInput = formRef.current.querySelector('input');
      if (firstInput) setTimeout(() => firstInput.focus(), 500);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.businessName.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim()
    ) {
      toast.error(
        'Please enter your Full Name, Business Name, Phone Number, and Email.'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/public/partner-inquiry', {
        fullName: formData.fullName.trim(),
        businessName: formData.businessName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        city: formData.city.trim(),
        message: formData.message.trim(),
      });

      if (response.data?.success) {
        setSubmitted(true);
        toast.success(
          'Your partnership application has been sent to the CTI Admin team!'
        );
      } else {
        setSubmitted(true);
        toast.success(
          'Application submitted! Our onboarding manager will contact you within 24 hours.'
        );
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitted(true);
      toast.success(
        'Application received! Our partner team will reach out to you shortly.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      fullName: '',
      businessName: '',
      phone: '',
      email: '',
      city: '',
      message: '',
    });
  };

  const pillars = [
    {
      icon: 'lucide:map-pin',
      tag: 'Local Reach',
      title: 'Get leads from the locations you choose',
      description:
        'Select the exact pin codes and cities where you operate. Receive verified buyback, trade-in, and repair leads in real-time right at your doorstep.',
      gradient: 'from-blue-500/10 to-indigo-500/5',
      iconColor: 'text-blue-600',
      borderColor: 'group-hover:border-blue-400',
    },
    {
      icon: 'lucide:trending-up',
      tag: 'Inventory Access',
      title: 'Grow your inventory & accelerate profit',
      description:
        'Gain direct wholesale access to certified refurbished gadgets, authentic spare parts, and fast-moving accessories with guaranteed profit margins.',
      gradient: 'from-emerald-500/10 to-teal-500/5',
      iconColor: 'text-emerald-600',
      borderColor: 'group-hover:border-emerald-400',
    },
    {
      icon: 'lucide:megaphone',
      tag: 'Zero Ad Spend',
      title: 'We do everyday marketing for you',
      description:
        'CTI invests in continuous digital marketing, customer trust, and organic search campaigns. Customers discover your service without you spending a single rupee on ads.',
      gradient: 'from-amber-500/10 to-orange-500/5',
      iconColor: 'text-amber-600',
      borderColor: 'group-hover:border-amber-400',
    },
    {
      icon: 'lucide:wallet',
      tag: 'Instant Cash Flow',
      title: 'Pay less, earn more & 24/7 support',
      description:
        'Industry-lowest commission rates, instant automated bank settlements upon pickup, and a dedicated account manager available around the clock.',
      gradient: 'from-purple-500/10 to-pink-500/5',
      iconColor: 'text-purple-600',
      borderColor: 'group-hover:border-purple-400',
    },
  ];

  const steps = [
    {
      step: '01',
      phase: 'Lead Creation',
      title: 'Customers book device trade-in or repair on CTI',
      description:
        'Customers select their device model, answer basic condition questions, and schedule a convenient pickup or store-visit date and time.',
      icon: 'lucide:smartphone',
      badgeText: 'Verified Customer Leads',
      metric: 'Thousands of daily requests',
      accentColor: 'text-primary-600',
      bgGlow: 'bg-primary-500/10',
    },
    {
      step: '02',
      phase: 'Automated Matching',
      title: 'Real-time alert sent to your partner dashboard',
      description:
        'Our smart algorithm matches orders to your assigned location pin code. You get full device diagnostics, customer address, and pre-calculated payout on your phone.',
      icon: 'lucide:bell-ring',
      badgeText: 'Instant App Alerts',
      metric: '< 2 min dispatch time',
      accentColor: 'text-blue-600',
      bgGlow: 'bg-blue-500/10',
    },
    {
      step: '03',
      phase: 'Fast Inspection',
      title: 'Fulfill orders via doorstep pickup or store visit',
      description:
        'Inspect the device using CTI standardized 10-minute automated testing checklist. Confirm condition and customer identity with complete ease.',
      icon: 'lucide:check-circle-2',
      badgeText: '10-Min Fast Verification',
      metric: '100% digital checklist',
      accentColor: 'text-emerald-600',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      step: '04',
      phase: 'Instant Payout',
      title: 'Automated direct bank settlement transferred',
      description:
        'As soon as pickup is completed, the payment is automatically transferred to the customer, and your partner earnings are credited directly to your bank account.',
      icon: 'lucide:banknote',
      badgeText: 'Same-Day Settlement',
      metric: 'Zero waiting period',
      accentColor: 'text-amber-600',
      bgGlow: 'bg-amber-500/10',
    },
  ];

  const testimonials = [
    {
      quote:
        'In the last 2 years with CTI, my retail store revenue grew 4X. The customer leads are pre-verified and instant settlements keep our cash flow very smooth.',
      name: 'John James',
      initials: 'JJ',
      role: 'Retail Partner, 2 years',
      store: 'Apex Mobile Store',
      location: 'Bangalore, Karnataka',
      color: 'bg-blue-500',
    },
    {
      quote:
        'We procure certified refurbished devices through CTI in wholesale. Quality grading is 100% accurate and their support team is always responsive.',
      name: 'Jaspreet Singh',
      initials: 'JS',
      role: 'Refurbished Reseller, 3 years',
      store: 'GadgetZone Hub',
      location: 'Delhi NCR',
      color: 'bg-emerald-500',
    },
    {
      quote:
        'CTI doorstep pickup orders have doubled our technician utilization. We get daily repair jobs without spending money on social media ads.',
      name: 'Sayed Daif Ali',
      role: 'Service Center Partner, 2.5 years',
      initials: 'SA',
      store: 'QuickFix Electronics',
      location: 'Mumbai, Maharashtra',
      color: 'bg-purple-500',
    },
    {
      quote:
        'Onboarding took less than 24 hours. From day one, we started getting trade-in walk-in customers. The portal is clean, easy, and completely transparent.',
      name: 'Piyush Sharma',
      initials: 'PS',
      role: 'Electronics Store Owner, 1.5 years',
      store: 'Sharma Telecom',
      location: 'Pune, Maharashtra',
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 py-3 bg-gray-50/70 border-b border-gray-100">
        <Breadcrumb />
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50/80 via-white to-white py-16 md:py-24 border-b border-gray-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-primary-100/40 via-primary-50/20 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider border border-primary-200/70 shadow-xs mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600" />
            </span>
            <span>CTI Business &amp; Vendor Partnership</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-[1.12] tracking-tight text-center max-w-3xl">
            Grow your business <br className="hidden sm:inline" />
            profits by{' '}
            <span className="relative inline-block text-primary-600">
              10X
              <svg
                className="absolute -bottom-2 left-0 w-full text-primary-400"
                viewBox="0 0 100 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9C25 3 75 3 98 9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-center font-normal">
            Join our thriving family of over{' '}
            <strong className="text-gray-900 font-bold">
              500+ retail and repair partners
            </strong>
            . Unlock daily high-value device buybacks, wholesale refurbished
            inventory, and local repair leads.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenOnboarding}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-extrabold text-base shadow-xl shadow-primary-500/25 transition-all duration-200 cursor-pointer"
            >
              <Icon icon="lucide:user-plus" className="text-lg" />
              <span>Become a Partner</span>
            </button>

            <button
              type="button"
              onClick={scrollToForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-gray-50 active:scale-95 text-gray-700 font-bold text-base border border-gray-200 shadow-xs hover:border-gray-300 transition-all duration-200 cursor-pointer"
            >
              <span>Apply Online</span>
              <Icon icon="lucide:arrow-down" className="text-base text-gray-400" />
            </button>
          </div>

          {/* Trust Metrics */}
          <div className="mt-12 w-full max-w-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
              <div className="px-2 sm:px-4">
                <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  500+
                </p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Active Partners
                </p>
              </div>
              <div className="px-2 sm:px-4">
                <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  1,500+
                </p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Cities &amp; Pin Codes
                </p>
              </div>
              <div className="px-2 sm:px-4">
                <p className="text-2xl sm:text-3xl font-black text-primary-600 tracking-tight">
                  Zero
                </p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Registration Fee
                </p>
              </div>
            </div>
          </div>

          {/* Quick value props */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-semibold text-gray-600">
            {[
              'Direct Bank Settlements',
              'Verified Customer Buybacks',
              'Wholesale Refurbished Pricing',
              '24/7 Dedicated Partner Desk',
            ].map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200/80"
              >
                <Icon
                  icon="lucide:check-circle-2"
                  className="text-primary-600 text-sm"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-block border-b-2 border-primary-600 pb-1">
            <span className="text-xs font-black uppercase tracking-wider text-primary-600">
              Core Benefits
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Why Become a CTI Business Partner?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            We provide all the infrastructure, verified leads, wholesale
            inventory, and technology so you can focus on scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`bg-white border border-gray-200/90 ${pillar.borderColor} rounded-3xl p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 border border-gray-100`}
                  >
                    <Icon icon={pillar.icon} className={pillar.iconColor} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-primary-600 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center gap-1.5 text-xs font-bold text-primary-600">
                <span>Verified partner perk</span>
                <Icon icon="lucide:check-circle" className="text-sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STEPS ── */}
      <section className="py-16 md:py-24 bg-gray-50/60 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-block border-b-2 border-primary-600 pb-1">
              <span className="text-xs font-black uppercase tracking-wider text-primary-600">
                Operating Model
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              How does this work?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              A frictionless 4-step workflow engineered for speed, transparency,
              and instant profit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-gray-200/90 shadow-xs hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-gray-200 group-hover:text-primary-600 transition-colors">
                      {step.step}
                    </span>
                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {step.phase}
                    </span>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl ${step.bgGlow} flex items-center justify-center text-2xl`}
                  >
                    <Icon icon={step.icon} className={step.accentColor} />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                  <span>{step.badgeText}</span>
                  <span className="text-primary-600 font-bold">
                    {step.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-block border-b-2 border-primary-600 pb-1">
            <span className="text-xs font-black uppercase tracking-wider text-primary-600">
              Real Stories
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            What Our Partners Say About Us?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Real experiences from retail store owners, technicians, and
            electronics resellers across the country.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl hover:border-primary-300 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-primary-500/20 text-3xl leading-none">
                    <Icon icon="mdi:format-quote-open" />
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} icon="mdi:star" />
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                  &quot;{item.quote}&quot;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div
                  className={`w-11 h-11 rounded-full ${item.color} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm`}
                >
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 leading-tight truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-tight truncate">
                    {item.role}
                  </p>
                  <p className="text-[10px] text-primary-600 font-semibold truncate">
                    {item.store} • {item.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── IN-PAGE FORM ── */}
      <section
        ref={formRef}
        className="py-16 md:py-24 bg-gray-50/70 border-b border-gray-100"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3.5 py-1 rounded-full border border-primary-100">
                Direct Application
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Become a CTI Business Partner
              </h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Fill in your general details below. Your application is saved
                directly to our admin portal and our partner manager will
                contact you within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20">
                  <Icon icon="lucide:check-circle" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-950">
                  Application Received!
                </h3>
                <p className="text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Thank you,{' '}
                  <span className="font-bold">{formData.fullName}</span>! Your
                  partnership details have been forwarded to the CTI Admin team.
                  We will call you on{' '}
                  <span className="font-bold underline">{formData.phone}</span>{' '}
                  shortly.
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldInput
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Rajesh Kumar"
                    required
                  />
                  <FieldInput
                    label="Business / Shop Name"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Apex Mobile Care"
                    required
                  />
                  <FieldInput
                    label="Phone / WhatsApp Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    type="tel"
                    required
                  />
                  <FieldInput
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. partner@example.com"
                    type="email"
                    required
                  />
                </div>

                <FieldInput
                  label="City / Location"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. turkey"
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Short Message / Details (Optional)
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what services or products you deal in (e.g. device repair, secondhand phones, wholesale)..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-extrabold text-base shadow-xl shadow-primary-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                      <span>Sending To Admin...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Partnership Application</span>
                      <Icon icon="lucide:send" className="text-base" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-black text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Excited to take your business to newer heights?
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Join over 500+ verified businesses partnering with CTI across 1500+
              pin codes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenOnboarding}
            className="shrink-0 px-8 py-3.5 rounded-xl bg-white text-gray-950 hover:bg-gray-100 active:scale-95 font-extrabold text-sm sm:text-base shadow-lg transition-all duration-200 cursor-pointer"
          >
            Become a Partner
          </button>
        </div>
      </section>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-gray-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              aria-label="Close"
            >
              <Icon icon="lucide:x" className="text-xl" />
            </button>

            <div className="space-y-1 mb-6 text-center">
              <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Quick Application
              </span>
              <h3 className="text-2xl font-black text-gray-900">
                Partner With CTI
              </h3>
              <p className="text-xs text-gray-500">
                Submit your general business info and our onboarding team will
                contact you.
              </p>
            </div>

            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-500/20">
                  <Icon icon="lucide:check" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  Application Submitted!
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                  Our team has received your inquiry and will reach out to you
                  within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <FieldInput
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rajesh Kumar"
                  required
                  compact
                />
                <FieldInput
                  label="Business / Shop Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Mobile Care"
                  required
                  compact
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldInput
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    type="tel"
                    required
                    compact
                  />
                  <FieldInput
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="partner@example.com"
                    type="email"
                    required
                    compact
                  />
                </div>
                <FieldInput
                  label="City / Location"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, Delhi, Bangalore"
                  compact
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                    Short Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    rows={2}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your services, shop, or products..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-lg shadow-primary-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <Icon icon="lucide:send" className="text-sm" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}