import React from 'react';
import { Icon } from '@iconify/react';

export const metadata = {
  title: 'Refer & Earn Terms | CTI',
  description: 'Read the terms, bonus reward structures, and redemption conditions for the CTI Referral Program.',
};

export default function ReferAndEarnTermsPage() {
  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-150">
      <div className="max-w-none space-y-8 text-gray-700">
        <div className="border-b border-gray-100 pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider border border-purple-200/60 mb-3">
            <Icon icon="solar:gift-linear" className="text-sm" />
            <span>Referral Program Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Refer & Earn Terms
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Earn wallet cash and exclusive discounts by introducing your friends, family, and colleagues to CTI.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">1. Eligibility</h2>
          <p className="leading-relaxed text-sm sm:text-base">
            The CTI Refer & Earn program is open to all registered users with an active CTI account. To qualify as a referee, the person referred must be a new customer who has never registered or placed an order on CTI before.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">2. How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">1</span>
              <h3 className="font-bold text-gray-900 text-sm">Share Your Link</h3>
              <p className="text-xs text-gray-500 mt-1">Copy your unique referral invite code from your CTI Profile.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">2</span>
              <h3 className="font-bold text-gray-900 text-sm">Friend Completes Order</h3>
              <p className="text-xs text-gray-500 mt-1">Your friend books a repair, sells an old device, or buys a refurbished gadget.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">3</span>
              <h3 className="font-bold text-gray-900 text-sm">Both Get Rewarded</h3>
              <p className="text-xs text-gray-500 mt-1">Wallet credits are automatically deposited into your account upon order completion.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">3. Reward Payout & Redemption</h2>
          <ul className="list-disc ml-6 space-y-1.5 text-sm sm:text-base">
            <li>Referral earnings are credited to your CTI Wallet within 48 hours of successful order fulfillment.</li>
            <li>Wallet balance can be applied towards any repair service, spare parts purchase, or refurbished device orders.</li>
            <li>CTI reserves the right to withhold rewards in cases of detected fraudulent activity, self-referrals, or fake accounts.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

