import { Icon } from '@iconify/react';

export default function PlatformGuarantees() {
  return (
    <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
          <Icon icon="mdi:shield-check" className="w-6 h-6 text-primary-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-primary-900 mb-1.5">
            Platform Guarantee & Buyer Protection
          </h3>
          <p className="text-xs text-primary-800/80 leading-relaxed">
            We stand behind every transaction on our platform. With our secure escrow system, your payment is protected and is only released to the seller once you receive the product exactly as described. Shop with confidence knowing our 24/7 support team is here to assist you with any disputes or issues.
          </p>
        </div>
      </div>
      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
          <Icon icon="mdi:refresh-circle" className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-900 mb-1.5">
            Easy Returns & Refund Policy
          </h3>
          <p className="text-xs text-emerald-800/80 leading-relaxed">
            Not satisfied with your purchase? You can return eligible items within 7 days of delivery for a full refund or exchange. We provide hassle-free return shipping labels and process refunds swiftly back to your original payment method. Terms and conditions apply.
          </p>
        </div>
      </div>
    </div>
  );
}
