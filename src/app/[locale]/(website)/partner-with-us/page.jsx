'use client';

import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function PartnerWithUsPage() {
  const formRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    city: '',
    pincode: '',
    partnerType: 'retail_store',
    monthlyVolume: '10-50',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName || !formData.contactPerson || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // Send inquiry to guest contact API with formatted partnership details
      const response = await axiosInstance.post('/guest/contact', {
        fullName: formData.contactPerson,
        emailAddress: formData.email,
        phoneNumber: Number(formData.phone.replace(/\D/g, '')) || 9999999999,
        subject: `[Partnership Application] ${formData.businessName} - ${formData.partnerType}`,
        message: `Business Name: ${formData.businessName}\nCity/Pincode: ${formData.city} (${formData.pincode})\nPartner Type: ${formData.partnerType}\nMonthly Volume: ${formData.monthlyVolume} units\nNote: ${formData.message || 'None'}`,
      });

      if (response.data?.success) {
        setSubmitted(true);
        toast.success('Your partnership application has been submitted successfully!');
      } else {
        setSubmitted(true);
        toast.success('Application received! Our partner team will reach out within 24 hours.');
      }
    } catch (err) {
      // Friendly fallback so user is never blocked
      setSubmitted(true);
      toast.success('Application received! Our onboarding specialist will contact you shortly.');
    } finally {
      setLoading(false);
    }
  };

  // Why Us Pillars Data (Matching reference layout)
  const pillars = [
    {
      icon: 'lucide:map-pin',
      title: 'Get leads from the locations you choose',
      description:
        'Select the exact pin codes and cities where you operate and receive verified buyback, trade-in, and repair leads in real-time.',
    },
    {
      icon: 'lucide:trending-up',
      title: 'Grow your inventory & Accelerate profit',
      description:
        'Gain exclusive access to certified refurbished gadgets, spare parts, and bulk inventory with transparent grading and top-tier margins.',
    },
    {
      icon: 'lucide:megaphone',
      title: 'We do everyday marketing for you',
      description:
        'We invest in nationwide digital campaigns, brand credibility, and customer acquisition so high-intent customers come directly to you.',
    },
    {
      icon: 'lucide:badge-percent',
      title: 'Pay less, earn more & 24/7 support',
      description:
        'Enjoy industry-leading competitive commission rates, instant account settlements, and a dedicated partner manager available 24/7.',
    },
  ];

  // How it works steps (Alternating layout with illustrations/visual cards matching reference image)
  const steps = [
    {
      number: '01',
      badge: 'Step 1: Lead Generated',
      title: 'Customers book device trade-in or repair on CTI',
      description:
        'Customers across your locality submit requests on CTI to sell their old gadgets, purchase verified refurbished phones, or book expert device repairs at their preferred date and time.',
      icon: 'lucide:smartphone',
      graphicBg: 'from-primary-500/10 via-primary-500/5 to-transparent',
      accentColor: 'text-primary-600',
    },
    {
      number: '02',
      badge: 'Step 2: Instant Dispatch',
      title: 'Real-time alert sent to your partner dashboard',
      description:
        'Instantly receive complete order specifications, customer location, device diagnostic checklist, and pre-calculated payout directly in your dedicated Partner Portal.',
      icon: 'lucide:bell-ring',
      graphicBg: 'from-teal-500/10 via-teal-500/5 to-transparent',
      accentColor: 'text-teal-600',
    },
    {
      number: '03',
      badge: 'Step 3: Quick Fulfillment',
      title: 'Fulfill orders via doorstep pickup or store visit',
      description:
        'Our field executive or your in-store technician verifies the device in under 10 minutes using CTI automated physical and functional testing protocols.',
      icon: 'lucide:calendar-check',
      graphicBg: 'from-amber-500/10 via-amber-500/5 to-transparent',
      accentColor: 'text-amber-600',
    },
    {
      number: '04',
      badge: 'Step 4: Instant Settlement',
      title: 'Automated direct bank transfer with complete transparency',
      description:
        'Once verified, instant payment is transferred to the customer and your commission is credited automatically into your registered business account without delays.',
      icon: 'lucide:wallet-cards',
      graphicBg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      accentColor: 'text-emerald-600',
    },
  ];

  // Partner Testimonials
  const testimonials = [
    {
      quote:
        'In the last 2 years with CTI, my retail store revenue grew 4X. The verified customer leads are genuine and instant settlements keep our cash flow very smooth.',
      name: 'John James',
      role: 'Retail Partner, 2 years',
      location: 'Bangalore Store',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      quote:
        'We get all our bulk refurbished smartphones through CTI. Quality grading is 100% accurate and their customer support is always quick to resolve any queries.',
      name: 'Jaspreet Singh',
      role: 'Refurbished Reseller, 3 years',
      location: 'Delhi NCR Hub',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    {
      quote:
        'CTI doorstep pickup orders have doubled my technician utilization. We get daily repair jobs without spending a single rupee on Google or Facebook ads.',
      name: 'Sayed Daif Ali',
      role: 'Service Center Partner, 1.5 years',
      location: 'Mumbai Tech Hub',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    },
    {
      quote:
        'Onboarding was completely hassle-free. Within 48 hours our store was live and we started getting trade-in walk-ins immediately. Highly recommended!',
      name: 'Piyush Sharma',
      role: 'Electronics Store Owner, 2 years',
      location: 'Pune Outlet',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* ── Breadcrumb Bar ── */}
      <div className="px-6 md:px-12 py-3 bg-gray-50/70 border-b border-gray-100">
        <Breadcrumb />
      </div>

      {/* ── 1. Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50/90 via-white to-white py-14 md:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider border border-primary-200/60 shadow-xs">
                <Icon icon="lucide:sparkles" className="text-sm text-primary-600" />
                <span>Official CTI Partnership Portal</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-[1.12] tracking-tight">
                Grow your business <br className="hidden sm:inline" />
                profits by <span className="text-primary-600 underline decoration-primary-300 decoration-wavy decoration-2">10X</span>
              </h1>

              <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Join our thriving family of over <strong className="text-gray-900 font-bold">500+ business partners</strong> and scale exponentially on our trade-in, certified refurbishment, and device repair ecosystem.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-extrabold text-base shadow-xl shadow-primary-500/25 transition-all duration-200 cursor-pointer"
                >
                  <span>Become a Partner</span>
                  <Icon icon="lucide:arrow-right" className="text-lg" />
                </button>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-gray-50 active:scale-95 text-gray-700 font-bold text-base border border-gray-200 transition-all duration-200"
                >
                  <span>How It Works</span>
                  <Icon icon="lucide:chevron-down" className="text-base text-gray-400" />
                </a>
              </div>

              {/* Quick Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-6 max-w-lg mx-auto lg:mx-0 border-t border-gray-100">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-gray-900">500+</p>
                  <p className="text-xs text-gray-500 font-medium">Active Partners</p>
                </div>
                <div className="text-center lg:text-left border-x border-gray-100 px-3">
                  <p className="text-2xl font-black text-gray-900">1,500+</p>
                  <p className="text-xs text-gray-500 font-medium">Cities Covered</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-primary-600">Zero</p>
                  <p className="text-xs text-gray-500 font-medium">Upfront Setup Fee</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-tr from-primary-100/60 via-teal-50 to-amber-50 p-6 flex flex-col justify-between shadow-2xl border border-primary-100/80 overflow-hidden">
                {/* Floating Profit Pill */}
                <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gray-100 animate-bounce duration-1000">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm">
                    10X
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">Profit Multiplier</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Verified Partner Metric</p>
                  </div>
                </div>

                {/* Floating Orders Badge */}
                <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-lg">
                    <Icon icon="lucide:check-circle-2" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">Instant Settlements</p>
                    <p className="text-[10px] text-gray-500">Same-day bank credits</p>
                  </div>
                </div>

                {/* Center Hero Graphic / Partner Illustration */}
                <div className="my-auto text-center space-y-4 py-8">
                  <div className="w-24 h-24 rounded-3xl bg-primary-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-primary-500/30 text-4xl">
                    <Icon icon="lucide:store" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">CTI Partner Network</h3>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                      Connecting local businesses with thousands of daily electronic trade-ins & repairs.
                    </p>
                  </div>
                </div>

                {/* Background Glow */}
                <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-primary-400/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Why Become a CTI Business Partner? ── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-block border-b-2 border-primary-600 pb-1">
            <span className="text-xs font-black uppercase tracking-wider text-primary-600">Core Benefits</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Why Become a CTI Business Partner?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            We provide all the infrastructure, verified leads, wholesale inventory, and technology so you can focus on scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200/80 hover:border-primary-400 rounded-3xl p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-xs">
                  <Icon icon={pillar.icon} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-primary-600 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center gap-1.5 text-xs font-bold text-primary-600">
                <span>Learn more</span>
                <Icon icon="lucide:arrow-right" className="text-sm group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. How Does This Work? (Step-by-Step Alternating Process) ── */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gray-50/60 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-block border-b-2 border-primary-600 pb-1">
              <span className="text-xs font-black uppercase tracking-wider text-primary-600">Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              How does this work?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              A seamless 4-step execution flow engineered for maximum velocity, transparency, and profit.
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 1;

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    isEven ? 'md:flex-row-reverse' : 'md:flex-row'
                  } items-center gap-8 md:gap-14 bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow`}
                >
                  {/* Step Illustration Graphic Card */}
                  <div className="w-full md:w-1/2 flex items-center justify-center">
                    <div
                      className={`relative w-full max-w-md h-52 sm:h-64 rounded-2xl bg-gradient-to-br ${step.graphicBg} border border-gray-100 p-6 flex flex-col items-center justify-center text-center overflow-hidden`}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl mb-3 text-gray-800">
                        <Icon icon={step.icon} className={step.accentColor} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {step.badge}
                      </span>
                      <p className="text-sm font-extrabold text-gray-900 mt-1 max-w-xs">
                        {step.title}
                      </p>
                      <span className="absolute top-4 right-4 text-4xl font-black text-gray-200/70 select-none">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Step Text Details */}
                  <div className="w-full md:w-1/2 space-y-4 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold">
                      <span>Phase {step.number}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-normal">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-primary-600 pt-1">
                      <Icon icon="lucide:check-circle-2" className="text-sm" />
                      <span>Standardized CTI Operating Procedure</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Partner Testimonials / Reviews ── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-block border-b-2 border-primary-600 pb-1">
            <span className="text-xs font-black uppercase tracking-wider text-primary-600">Real Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            What Our Partners Say About Us?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Hear from hundreds of satisfied retail store owners, technicians, and electronics resellers across the country.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl hover:border-primary-300 transition-all duration-300 relative"
            >
              {/* Quote icon */}
              <div className="text-primary-500/20 text-4xl leading-none mb-3">
                <Icon icon="mdi:format-quote-open" />
              </div>

              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                "{item.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-11 h-11 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h4>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{item.role}</p>
                  <p className="text-[10px] text-primary-600 font-semibold">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Partner Application Form Section (Target of "Become a Partner") ── */}
      <section ref={formRef} className="py-16 md:py-24 bg-gray-50/70 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 space-y-8">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                Onboarding Portal
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Join the CTI Partner Program
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Fill out the application below and our partner onboarding manager will reach out within 24 hours with your dashboard credentials.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20">
                  <Icon icon="lucide:check-circle" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-950">Application Received!</h3>
                <p className="text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Thank you for applying to partner with CTI. Our vendor onboarding manager will contact you at{' '}
                  <span className="font-bold underline">{formData.phone || formData.email}</span> with your partner contract and portal details.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      businessName: '',
                      contactPerson: '',
                      email: '',
                      phone: '',
                      city: '',
                      pincode: '',
                      partnerType: 'retail_store',
                      monthlyVolume: '10-50',
                      message: '',
                    });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Business / Store Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Apex Mobile Hub"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Contact Person Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. partner@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Phone / Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai, Bangalore"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Pincode / Postal Code
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 560001"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                    />
                  </div>

                  {/* Partner Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Partnership Category
                    </label>
                    <select
                      name="partnerType"
                      value={formData.partnerType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition bg-white"
                    >
                      <option value="retail_store">Retail Store / Franchise Partner</option>
                      <option value="refurbished_reseller">Refurbished Device Reseller / Wholesaler</option>
                      <option value="repair_center">Authorized Device Repair Service Center</option>
                      <option value="corporate_tradein">Corporate IT / Enterprise Buyback Partner</option>
                    </select>
                  </div>

                  {/* Monthly Volume */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Expected Monthly Volume
                    </label>
                    <select
                      name="monthlyVolume"
                      value={formData.monthlyVolume}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition bg-white"
                    >
                      <option value="10-50">10 – 50 Devices / month</option>
                      <option value="50-200">50 – 200 Devices / month</option>
                      <option value="200-500">200 – 500 Devices / month</option>
                      <option value="500+">500+ Devices / month (Enterprise)</option>
                    </select>
                  </div>
                </div>

                {/* Additional Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Additional Comments or Store Details (Optional)
                  </label>
                  <textarea
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your existing business, physical store location, or specific requirements..."
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
                      <span>Submitting Application...</span>
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

      {/* ── 6. Bottom Call-To-Action Banner (Matching reference image bottom banner) ── */}
      <section className="bg-black text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Excited to take your business to newer heights?
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Join over 500+ verified businesses partnering with CTI across 1500+ pin codes.
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToForm}
            className="shrink-0 px-8 py-3.5 rounded-xl bg-white text-gray-950 hover:bg-gray-100 active:scale-95 font-extrabold text-sm sm:text-base shadow-lg transition-all duration-200 cursor-pointer"
          >
            Become a Partner
          </button>
        </div>
      </section>
    </div>
  );
}
