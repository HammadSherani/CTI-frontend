'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';

// ── Demo Cart Items ──
const INITIAL_CART = [
  { _id: '1', title: 'Everest Keyboard', subtitle: 'Keyboard', img: '/assets/product/prode1.jpg', price: 45.00, qty: 1 },
  { _id: '2', title: 'Everest Keyboard', subtitle: 'Keyboard', img: '/assets/product/prode2.jpg', price: 45.00, qty: 1 },
];

const SHIPPING = 10.00;
const TAX = 0.00;
const COUPON_DISCOUNT = -10.00;

// ── Order Summary Sidebar ──
function OrderSummary({ subtotal, onCheckout }) {
  const total = subtotal + SHIPPING + TAX + COUPON_DISCOUNT;
  const rows = [
    { label: 'Items',           value: subtotal,         color: 'text-gray-700' },
    { label: 'Sub total',       value: subtotal,         color: 'text-gray-700' },
    { label: 'Shipping',        value: SHIPPING,         color: 'text-gray-700' },
    { label: 'Taxes',           value: TAX,              color: 'text-gray-700' },
    { label: 'Coupon Discount', value: COUPON_DISCOUNT,  color: 'text-red-500'  },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
      <h3 className="text-base font-extrabold text-gray-800 mb-5">Order Summary</h3>
      <div className="space-y-3 mb-5">
        {rows.map(r => (
          <div key={r.label} className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{r.label}</span>
            <span className={`font-semibold ${r.color}`}>
              {r.value < 0 ? `-$${Math.abs(r.value).toFixed(2)}` : `$${r.value.toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-4 mb-5">
        <div className="flex justify-between items-center">
          <span className="font-extrabold text-gray-800">Total</span>
          <span className="font-extrabold text-gray-900 text-lg">${Math.max(0, total).toFixed(2)}</span>
        </div>
      </div>
      <Link href="/checkout">
        <button
          onClick={onCheckout}
          className="w-full bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-100 text-sm"
        >
          Checkout
        </button>
      </Link>
    </div>
  );
}

// ── Main Cart Page ──
export default function CartPage() {
  const [cart, setCart] = useState(INITIAL_CART);

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">My Shopping Cart</h1>
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 text-sm font-semibold transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="text-base" />
          Clear Shopping Cart
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ── Cart Table ── */}
        <div className="flex-1 min-w-0">
          {cart.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Icon icon="mdi:cart-off" className="text-6xl text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-600">Your cart is empty</h3>
              <p className="text-gray-400 text-sm mt-1 mb-6">Looks like you haven't added anything yet</p>
              <Link href="/products">
                <button className="bg-primary-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-600 transition-colors">
                  Start Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-primary-500 text-white text-sm font-semibold">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Cart Items */}
              {cart.map((item, idx) => (
                <div
                  key={item._id}
                  className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors ${idx !== cart.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50`}
                >
                  {/* Product */}
                  <div className="col-span-5 flex items-center gap-4">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Remove item"
                    >
                      <Icon icon="mdi:close-circle" className="text-xl" />
                    </button>
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                      <img src={item.img} alt={item.title} className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm leading-tight">{item.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center text-sm font-semibold text-gray-700">
                    ${item.price.toFixed(2)}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3 flex justify-center">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQty(item._id, -1)}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors text-sm font-bold"
                      >
                        <Icon icon="mdi:minus" />
                      </button>
                      <span className="px-3 py-2 text-sm font-semibold text-gray-800 min-w-[2.5rem] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item._id, 1)}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors text-sm font-bold"
                      >
                        <Icon icon="mdi:plus" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-2 text-right text-sm font-bold text-gray-800">
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}

              {/* Coupon Row */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3 items-center">
                <div className="flex flex-1 min-w-0 gap-2">
                  <div className="relative flex-1 max-w-xs">
                    <Icon icon="mdi:tag-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                  <button className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                    Apply
                  </button>
                </div>
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 font-semibold transition-colors ml-auto">
                  <Icon icon="mdi:refresh" />
                  Update Cart
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Order Summary ── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <OrderSummary subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}