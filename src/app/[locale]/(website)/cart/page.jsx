'use client';

import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart } from '@/store/cart';
import { fetchRefurbishedCart, updateRefurbishedCartItem, removeRefurbishedFromCart } from '@/store/refurbishedCart';

// ── Order Summary Sidebar Component ──
function OrderSummary({ subtotal, checkoutLink, title = "Order Summary" }) {
  const total = subtotal;
  const rows = [
    { label: 'Items', value: subtotal, color: 'text-gray-700' },
    { label: 'Sub total', value: subtotal, color: 'text-gray-700' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
      <h3 className="text-base font-extrabold text-gray-800 mb-5">{title}</h3>
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
      <Link href={checkoutLink}>
        <button
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
  const dispatch = useDispatch();

  const { items: standardCart, loading: standardLoading } = useSelector(s => s.cart || { items: [], loading: false });
  const { items: refurbishedCart, loading: refurbishedLoading } = useSelector(s => s.refurbishedCart || { items: [], loading: false });

  const loading = standardLoading || refurbishedLoading;

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchRefurbishedCart());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <Icon icon="mdi:loading" className="animate-spin text-4xl text-primary-500 mb-4" />
        <p className="text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  const updateQty = (item, delta, isRefurbished) => {
    if (isRefurbished) {
      dispatch(updateRefurbishedCartItem({ product: item.productId, variantId: item.variantId, delta }));
    } else {
      dispatch(updateCartItem({ product: item.productId, variantId: item.variantId, delta }));
    }
  };

  const removeItem = (item, isRefurbished) => {
    if (isRefurbished) {
      dispatch(removeRefurbishedFromCart({ product: item.productId, variantId: item.variantId }));
    } else {
      dispatch(removeFromCart({ product: item.productId, variantId: item.variantId }));
    }
  };

  const getSubtotal = (cartItems, isRef) => {
    return cartItems.reduce((sum, item) => {
      const product = item.productId;
      if (!product || !product._id) return sum;

      const variant = item.variantId && typeof item.variantId === 'object' ? item.variantId : {};
      let price = variant.discountPrice || variant.sellingPrice || variant.price || product.summary?.minSalePrice || product.summary?.minPrice || 0;
      if (isRef && product.flashDeal) {
        price = price * (1 - product.flashDeal.discountPercentage / 100);
      }
      return sum + (price * item.quantity);
    }, 0);
  };

  const validStandardCart = standardCart.filter(item => item.productId && item.productId._id);
  const validRefurbishedCart = refurbishedCart.filter(item => item.productId && item.productId._id);

  const isCartEmpty = validStandardCart.length === 0 && validRefurbishedCart.length === 0;

  const renderCartGroup = (cartItems, isRefurbished, groupTitle, checkoutLink) => {
    if (cartItems.length === 0) return null;

    const subtotal = getSubtotal(cartItems, isRefurbished);

    return (
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Icon icon={isRefurbished ? "mdi:cellphone-link" : "mdi:shopping"} className={isRefurbished ? "text-amber-500" : "text-primary-500"} />
          {groupTitle}
        </h2>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Table */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
            {/* Header */}
            <div className={`grid grid-cols-12 gap-4 px-6 py-4 text-white text-sm font-semibold ${isRefurbished ? 'bg-amber-500' : 'bg-primary-500'}`}>
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            {/* Items */}
            {cartItems.map((item, idx) => {
              const product = item.productId || {};
              const variant = item.variantId && typeof item.variantId === 'object' ? item.variantId : {};

              let price = variant.discountPrice || variant.sellingPrice || variant.price || product.summary?.minSalePrice || product.summary?.minPrice || 0;
              if (isRefurbished && product.flashDeal) {
                price = price * (1 - product.flashDeal.discountPercentage / 100);
              }
              const image = variant.images?.[0]?.url || product.images?.[0]?.url || '/assets/placeholder.jpg';
              const title = product.title || 'Product Unavailable';
              const variantText = variant.title && variant.title !== 'Default Variant' ? variant.title : null;
              const detailLink = product._id ? (isRefurbished ? `/refurbish/${product.slug || product._id}` : `/product/${product.slug || product._id}`) : '#';

              return (
                <div
                  key={`${product._id || idx}-${item.variantId?._id || item.variantId}`}
                  className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors ${idx !== cartItems.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50`}
                >
                  {/* Product */}
                  <div className="col-span-5 flex items-center gap-4">
                    <button
                      onClick={() => removeItem(item, isRefurbished)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Remove item"
                    >
                      <Icon icon="mdi:close-circle" className="text-xl" />
                    </button>
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                      <img src={image} alt={title} className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      {product._id ? (
                        <Link href={detailLink}>
                          <p className="font-semibold text-gray-800 text-sm leading-tight hover:text-primary-500">{title}</p>
                        </Link>
                      ) : (
                        <p className="font-semibold text-gray-500 text-sm leading-tight italic">{title}</p>
                      )}
                      {variantText ? (
                        <p className="text-gray-500 text-xs mt-0.5">{variantText}</p>
                      ) : (
                        <p className="text-gray-400 text-xs mt-0.5">{product.category?.title || "Product"}</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center text-sm font-semibold text-gray-700">
                    ${price.toFixed(2)}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3 flex justify-center">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQty(item, -1, isRefurbished)}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors text-sm font-bold"
                      >
                        <Icon icon="mdi:minus" />
                      </button>
                      <span className="px-3 py-2 text-sm font-semibold text-gray-800 min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item, 1, isRefurbished)}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors text-sm font-bold"
                      >
                        <Icon icon="mdi:plus" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-2 text-right text-sm font-bold text-gray-800">
                    ${(price * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <OrderSummary subtotal={subtotal} checkoutLink={checkoutLink} title={`${groupTitle} Summary`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">My Shopping Cart</h1>
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 text-sm font-semibold transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="text-base" />
          Continue Shopping
        </Link>
      </div>

      {isCartEmpty ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-xl mx-auto">
          <Icon icon="mdi:cart-off" className="text-6xl text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600">Your cart is empty</h3>
          <p className="text-gray-400 text-sm mt-1 mb-6">Looks like you haven't added anything yet</p>
          <Link href="/product">
            <button className="bg-primary-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-600 transition-colors">
              Start Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div>
          {/* Marketplace Group */}
          {renderCartGroup(validStandardCart, false, "Marketplace Products", "/checkout")}

          {/* Refurbished Group */}
          {renderCartGroup(validRefurbishedCart, true, "Refurbished Devices", "/checkout?type=refurbished")}
        </div>
      )}
    </div>
  );
}