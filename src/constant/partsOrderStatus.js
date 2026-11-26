// Parts order statuses — keep in sync with TBT-backend/src/controllers/admin/parts/partsOrderController.js

// Allowed next steps (the backend rejects anything else). Cancel only before the parts ship.
export const PARTS_ORDER_STATUS_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'ready-for-pickup', 'cancelled'],
  shipped: ['delivered', 'returned'],
  'ready-for-pickup': ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export const PARTS_ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  'ready-for-pickup': 'Ready for pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export const nextPartsOrderStatuses = (current) => PARTS_ORDER_STATUS_FLOW[current] || [];

/**
 * Steps for the tracking bar. "Shipped" becomes "Ready for pickup" when the order is a pickup.
 * Returns { steps: [{ key, label, icon }], activeIndex, stopped } where stopped is
 * 'cancelled' | 'returned' | null.
 */
export const getPartsOrderSteps = (order) => {
  const status = order?.orderStatus || 'pending';
  const pickup = status === 'ready-for-pickup' || order?.shippingMethod === 'Pickup';
  const steps = [
    { key: 'pending', label: 'Ordered', icon: 'mdi:cart-check' },
    { key: 'confirmed', label: 'Confirmed', icon: 'mdi:check-decagram' },
    { key: 'processing', label: 'Processing', icon: 'mdi:package-variant' },
    pickup
      ? { key: 'ready-for-pickup', label: 'Ready for pickup', icon: 'mdi:store-check' }
      : { key: 'shipped', label: 'Shipped', icon: 'mdi:truck-fast' },
    { key: 'delivered', label: 'Delivered', icon: 'mdi:home-import-outline' },
    { key: 'received', label: 'Received', icon: 'mdi:hand-okay' },
  ];

  const order_ = ['pending', 'confirmed', 'processing', pickup ? 'ready-for-pickup' : 'shipped', 'delivered'];
  let activeIndex = order_.indexOf(status === 'shipped' && pickup ? 'ready-for-pickup' : status);
  if (order?.isReceived) activeIndex = steps.length - 1;
  const stopped = status === 'cancelled' || status === 'returned' ? status : null;
  if (stopped) {
    // Show progress up to the last real step from the activity log
    const reached = (order?.activityLog || [])
      .map((a) => order_.indexOf(a.previousStatus))
      .filter((i) => i >= 0);
    activeIndex = reached.length ? Math.max(...reached) : 0;
  }
  return { steps, activeIndex: Math.max(activeIndex, 0), stopped };
};
