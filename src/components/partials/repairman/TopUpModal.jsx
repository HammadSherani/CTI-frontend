import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

const TopUpModal = ({ isOpen, onClose, onProceed }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showIyzico, setShowIyzico] = useState(false); // Form state
  const iyzicoContainerRef = useRef(null);

  const quickAmounts = [100, 500, 1000];

  const handleProceed = async () => {
    if (!amount || amount <= 0) return alert("Please enter a valid amount");
    setLoading(true);
    
    const result = await onProceed(amount);
    
    if (result?.checkoutFormContent) {
      setShowIyzico(true);
      // Form inject karne ke liye thora delay taake div render ho jaye
      setTimeout(() => {
        if (iyzicoContainerRef.current) {
          iyzicoContainerRef.current.innerHTML = result.checkoutFormContent;
          
          // Script tag manually execute karna parta hai React mein
          const scripts = iyzicoContainerRef.current.getElementsByTagName('script');
          for (let i = 0; i < scripts.length; i++) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            if (scripts[i].src) {
              script.src = scripts[i].src;
            } else {
              script.innerHTML = scripts[i].innerHTML;
            }
            document.body.appendChild(script);
          }
        }
      }, 100);
    }
    setLoading(false);
  };

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setShowIyzico(false);
      setAmount('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className={`w-full ${showIyzico ? 'max-w-2xl' : 'max-w-md'} transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all`}>
        
        <button onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 z-10">
          <Icon icon="iconamoon:close-bold" width="24" />
        </button>

        {!showIyzico ? (
          <>
            {/* Amount Selection UI */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Icon icon="solar:wallet-money-bold-duotone" width="36" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Top Up Wallet</h3>
            </div>

            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-gray-700 uppercase">Quick Select</label>
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((amt) => (
                  <button key={amt} onClick={() => setAmount(amt)}
                    className={`rounded-xl border-2 py-3 text-sm font-bold transition-all ${
                      Number(amount) === amt ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 bg-gray-50'
                    }`}
                  >₺{amt}</button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="mb-3 block text-sm font-semibold text-gray-700 uppercase">Custom Amount</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon icon="fa6-solid:turkish-lira-sign" width="18" />
                </div>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 pl-12 pr-4 text-xl font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={handleProceed} disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 disabled:opacity-70"
              >
                {loading ? <Icon icon="line-md:loading-twotone-loop" width="24" /> : "Proceed to Pay"}
              </button>
            </div>
          </>
        ) : (
          /* Iyzico Form Container */
          <div className="mt-4 overflow-y-auto max-h-[70vh]">
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Icon icon="solar:shield-check-bold" className="text-green-500" />
               Secure Payment
             </h3>
             <div ref={iyzicoContainerRef} id="iyzico-form-container">
               {/* iyzico form yahan inject hoga */}
               <div className="flex flex-col items-center justify-center py-10">
                 <Icon icon="line-md:loading-twotone-loop" width="40" className="text-blue-600" />
                 <p className="mt-2 text-sm text-gray-500">Loading Payment Gateway...</p>
               </div>
             </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4 border-t border-gray-50 pt-6">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
            <Icon icon="logos:visa" width="25" />
            <Icon icon="logos:mastercard" width="25" />
            <span className="ml-2">Secure by iyzico</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;