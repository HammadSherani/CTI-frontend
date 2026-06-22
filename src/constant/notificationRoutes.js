
export const USER_ROLES = {
  REPAIRMAN: 'repairman',
  CUSTOMER: 'customer',
};

const ROUTES = {
  [USER_ROLES.REPAIRMAN]: {
    new_job: (d) => `/repair-man/job-board/${d.jobId}`,
    offer_accepted: (d) => `/repair-man/my-jobs/${d.jobId}`,
    job_cancelled: (d) => `/repair-man/my-jobs`,
  },
  [USER_ROLES.CUSTOMER]: {
    payment_received: (d) => `/customer/orders/${d.jobId}/invoice`,
    offer_received: (d) => `/customer/quotes/${d.jobId}`,
    job_completed: (d) => `/customer/feedback/${d.jobId}`,
  }
};

export const getRedirectUrl = (role, type, data) => {
  const roleRoutes = ROUTES[role];
  if (!roleRoutes) return false;

  const routeBuilder = roleRoutes[type];
  
  return routeBuilder ? routeBuilder(data) : false;
};