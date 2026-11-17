
export const USER_ROLES = {
  REPAIRMAN: 'repairman',
  CUSTOMER: 'customer',
  SELLER: 'seller',
};

const customerJobUrl = (d) =>
  d?.jobId
    ? `/my-account/${d.jobId}/job-details${d.offerId ? `?offerId=${d.offerId}` : ''}`
    : '/my-account';

const ROUTES = {
  [USER_ROLES.REPAIRMAN]: {
    new_job: (d) => `/repair-man/job-board/${d.jobId}`,
    // The job page is per booking (/my-jobs/[bookingId]/detail); there is no /my-jobs/[jobId] page
    offer_accepted: (d) => (d.bookingId ? `/repair-man/my-jobs/${d.bookingId}/detail` : '/repair-man/my-jobs'),
    job_cancelled: (d) => `/repair-man/my-jobs`,
    parts_order_update: (d) => (d.partsOrderId ? `/repair-man/parts-order/${d.partsOrderId}` : '/repair-man/parts-order'),
    earning_released: () => '/repair-man/earning',
    new_review: () => '/repair-man/reviews',
  },
  [USER_ROLES.CUSTOMER]: {
    // Offers are listed on the customer's job details page
    new_offer: (d) => customerJobUrl(d),
    offer_updated: (d) => customerJobUrl(d),
    offer_received: (d) => customerJobUrl(d),
    booking_status_update: (d) => customerJobUrl(d),
    payment_received: (d) => customerJobUrl(d),
    job_completed: (d) => customerJobUrl(d),
    job_closed: (d) => customerJobUrl(d),
    // Opens the job page with the rating box in focus
    review_request: (d) => (d?.jobId ? `/my-account/${d.jobId}/job-details?review=1` : '/my-account?tab=review'),
    review_response: () => '/my-account?tab=review',
    seller_new_product: (d) => d?.link || (d?.slug ? (d.type === 'refurbished' ? `/refurbish/${d.slug}` : `/product/${d.slug}`) : '/'),
  },
  [USER_ROLES.SELLER]: {
    ecom_new_order: (d) => `/seller/order/${d.orderId}`,
    ecom_product_query: (d) => `/seller/enquiries/${d.queryId}`,
    ecom_order_query: (d) => `/seller/enquiries/${d.queryId}`,
  }
};

export const getRedirectUrl = (role, type, data) => {
  if (data && data.link) return data.link;

  const roleRoutes = ROUTES[role];
  if (!roleRoutes) return false;

  const routeBuilder = roleRoutes[type];
  if (routeBuilder) return routeBuilder(data || {});

  // Unknown type for a customer: still open the related job if we know it
  if (role === USER_ROLES.CUSTOMER && data?.jobId) return customerJobUrl(data);

  return false;
};