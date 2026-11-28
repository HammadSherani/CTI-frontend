// Must match the status list of the SellRequest model in the backend.
export const SELL_STATUSES = ['Pending', 'Reviewed', 'Accepted', 'Rejected', 'Completed'];

export const SELL_STATUS_STYLES = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Reviewed: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Completed: 'bg-purple-100 text-purple-700',
};
