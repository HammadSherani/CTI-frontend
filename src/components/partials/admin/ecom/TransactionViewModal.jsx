import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { format } from 'date-fns';

export default function TransactionViewModal({ isOpen, onClose, transaction }) {
  if (!isOpen || !transaction) return null;

  const getTypeStyle = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("refund") || t.includes("rejected")) {
      return { bg: "bg-red-100", text: "text-red-700", icon: "mdi:arrow-up-circle-outline" };
    }
    if (t.includes("success") || t.includes("release") || t.includes("order_payment")) {
      return { bg: "bg-emerald-100", text: "text-emerald-700", icon: "mdi:arrow-down-circle-outline" };
    }
    return { bg: "bg-blue-100", text: "text-blue-700", icon: "mdi:information-outline" };
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SUCCESS': return 'bg-emerald-100 text-emerald-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const typeConfig = getTypeStyle(transaction.type);
  const statusClass = getStatusStyle(transaction.status);

  // Helper to render user blocks
  const renderUserBlock = (user, label) => {
    if (!user) {
      return (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-gray-900 font-medium mt-1">System / External</p>
          </div>
          <Icon icon="mdi:server-network" className="text-2xl text-gray-300" />
        </div>
      );
    }

    const isSeller = user.role === 'seller';
    const linkHref = isSeller 
      ? `/admin/ecom/sellers/${user._id}`
      : `/admin/users?search=${encodeURIComponent(user.email || user.name)}`;

    return (
      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between items-start group hover:border-primary-300 transition-colors">
        <div className="w-full flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-gray-900 font-bold mt-1 text-lg truncate max-w-[200px]" title={user.name}>{user.name}</p>
            <p className="text-gray-500 text-sm truncate max-w-[200px]" title={user.email}>{user.email}</p>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
            {user.role || 'User'}
          </span>
        </div>
        
        <Link 
          href={linkHref} 
          className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 group-hover:underline"
        >
          View Profile
          <Icon icon="mdi:arrow-right" />
        </Link>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <Icon icon="mdi:receipt-text-outline" className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
              <p className="text-xs text-gray-500 font-mono">ID: {transaction._id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon icon="mdi:close" className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Main Info Box */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Amount</p>
              <p className={`text-xl font-black ${typeConfig.text}`}>
                TRY. {(transaction.amount || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${statusClass}`}>
                {transaction.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Date</p>
              <p className="text-sm font-semibold text-gray-800">
                {format(new Date(transaction.createdAt), "dd MMM yyyy")}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(transaction.createdAt), "hh:mm a")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md ${typeConfig.bg} ${typeConfig.text}`}>
                <Icon icon={typeConfig.icon} />
                {(transaction.type || "").toUpperCase().replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">Description</h4>
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 text-gray-700 text-sm leading-relaxed">
              {transaction.description}
            </div>
          </div>

          {/* Related Entities (Users) */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3">Transaction Flow</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderUserBlock(transaction.fromUserId, "From Account")}
              {renderUserBlock(transaction.toUserId, "To Account")}
            </div>
          </div>

          {/* Related Order if exists */}
          {transaction.orderNo && (
            <div>
               <h4 className="text-sm font-bold text-gray-900 mb-2">Related Order</h4>
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:cart-outline" className="text-2xl text-gray-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Order #{transaction.orderNo}</p>
                      {transaction.orderId && <p className="text-xs text-gray-500 font-mono">Ref ID: {transaction.orderId}</p>}
                    </div>
                  </div>
                  <Link 
                    href={`/admin/ecom/orders/${transaction.orderId || transaction.orderNo}`}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    View Order
                  </Link>
               </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
