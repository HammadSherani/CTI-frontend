// Who handles an order. A seller prepares and ships their own order; the admin only steps in for the
// platform's own items, or for a refurbished order shared by several sellers.
export const shippedBySeller = (items = []) =>
  items.length > 0
  && items.every((item) => !item.isAdminOwned && item.sellerId)
  && new Set(items.map((item) => String(item.sellerId?._id || item.sellerId))).size === 1;

/** Statuses a seller may move a marketplace order to (mirrors the backend). */
const SELLER_FLOW = {
  pending: ['processing', 'cancelled'],
  processing: ['shipping', 'cancelled'],
  shipping: ['shipped', 'cancelled'],
  shipped: ['delivered'],
};
export const sellerNextStatuses = (status, hasShipment) => (SELLER_FLOW[status] || [])
  // no cancel once the courier is booked, and nothing is shipped or delivered before that
  .filter((next) => (hasShipment ? next !== 'cancelled' : !['shipped', 'delivered'].includes(next)));

/** Statuses the admin may move an order to. Nothing counts as shipped or delivered without a shipment. */
export function adminNextStatuses(order, sellerShips) {
  if (['delivered', 'cancelled'].includes(order.orderStatus)) return [];
  if (order.shipment?.status === 'created') {
    // the courier is booked: the order can no longer be cancelled
    return order.orderStatus === 'shipped' ? ['delivered'] : ['shipped', 'delivered'];
  }
  return !sellerShips && order.orderStatus === 'pending' ? ['processing', 'cancelled'] : ['cancelled'];
}
