// AuthGuard.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { clearAuth } from "../store/auth"; 

// Role-based route configuration (unchanged)
const ROLE_ROUTES = {
  admin: [
    "/admin",
    "/admin/dashboard",
    "/admin/users",
    "/admin/customers",
    "/admin/repairmen",
    "/admin/sellers",
    "/admin/orders",
    "/admin/reports",
    "/admin/settings",
    "/profile",
    "/settings",
  ],
  seller: [
    "/seller",
    "/seller/dashboard",
    "/seller/products",
    "/seller/inventory",
    "/seller/orders",
    "/seller/analytics",
    "/profile",
    "/settings",
  ],
  repairman: [
    "/repair-man",
    "/repair-man/dashboard",
    "/repair-man/jobs",
    "/repair-man/schedule",
    "/repair-man/history",
    "/repair-man/earnings",
    "/profile",
    "/settings",
  ],
  customer: ["/", "/orders","/my-account", "/repair-requests", "/wishlist", "/cart", "/profile", "/settings", '/payment'],
};

// Default redirects for each role (unchanged)
const ROLE_DEFAULT_ROUTES = {
  admin: "/admin/dashboard",
  seller: "/seller/dashboard",
  repairman: "/repair-man/dashboard",
  customer: "/",
};

// Loading component (unchanged)
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Authenticating...</p>
    </div>
  </div>
);

// Access denied component (unchanged)
const AccessDenied = ({ userRole, requiredRoles }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-4">
        Aapka current role ({userRole}) is page ke liye authorized nahi hai.
      </p>
      {requiredRoles && (
        <p className="text-sm text-gray-500 mb-6">Required roles: {requiredRoles.join(", ")}</p>
      )}
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

function AuthGuard({ children, allowedRoles = [], redirectTo = null, requireAuth = true }) {
  const { user, token, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorizing, setIsAuthorizing] = useState(true);

  // Check if user has required role
  const hasRequiredRole = (userRole, allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(userRole);
  };

  // Check if current route is allowed for user's role
  const isRouteAllowed = (userRole, currentPath) => {
    if (!userRole || !ROLE_ROUTES[userRole]) return false;
    return ROLE_ROUTES[userRole].some((route) => {
      if (route === currentPath) return true;
      if (route.endsWith("*")) {
        const baseRoute = route.slice(0, -1);
        return currentPath.startsWith(baseRoute);
      }
      return currentPath.startsWith(route + "/") || currentPath === route;
    });
  };

  useEffect(() => {
    // Listen for unauthorized event from axios
    const handleUnauthorized = (event) => {
      console.log("Caught unauthorized event, redirecting to:", event.detail.redirect);
      dispatch(clearAuth()); // Ensure Redux state is cleared
      router.push(event.detail.redirect); // Use router.push for client-side navigation
    };

    if (typeof window !== "undefined") {
      window.addEventListener("unauthorized", handleUnauthorized);
    }

    const checkAuthentication = async () => {
      setIsAuthorizing(true);

      if (loading) {
        return;
      }

      if (requireAuth && (!user || !token)) {
        console.log("No user or token, redirecting to /auth/login");
        router.push("/auth/login");
        return;
      }

      if (user && user.role) {
        const userRole = user.role.toLowerCase();
        if (allowedRoles.length > 0 && !hasRequiredRole(userRole, allowedRoles)) {
          const defaultRoute = redirectTo || ROLE_DEFAULT_ROUTES[userRole] || "/dashboard";
          console.log(`Unauthorized role (${userRole}), redirecting to ${defaultRoute}`);
          router.push(defaultRoute);
          return;
        }
        if (!isRouteAllowed(userRole, pathname)) {
          const defaultRoute = ROLE_DEFAULT_ROUTES[userRole] || "/dashboard";
          console.log(`Route not allowed for ${userRole}, redirecting to ${defaultRoute}`);
          router.push(defaultRoute);
          return;
        }
      }

      setIsAuthorizing(false);
    };

    checkAuthentication();

    // Cleanup event listener
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("unauthorized", handleUnauthorized);
      }
    };
  }, [user, token, loading, pathname, allowedRoles, redirectTo, requireAuth, router, dispatch]);

  if (loading || isAuthorizing) {
    return <LoadingScreen />;
  }

  if (requireAuth && (!user || !token)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Redirecting to login...</p>
          <div className="animate-pulse text-orange-500">Please wait</div>
        </div>
      </div>
    );
  }

  if (user && allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase();
    if (!hasRequiredRole(userRole, allowedRoles)) {
      return <AccessDenied userRole={userRole} requiredRoles={allowedRoles} />;
    }
  }

  return <>{children}</>;
}

// HOC for role-based protection (unchanged)
export const withRoleGuard = (Component, allowedRoles = []) => {
  return function ProtectedComponent(props) {
    return (
      <AuthGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </AuthGuard>
    );
  };
};

// Hook for role-based access checking (unchanged)
export const useRoleAccess = () => {
  const { user } = useSelector((state) => state.auth);

  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    const userRole = user.role.toLowerCase();
    return Array.isArray(roles) ? roles.includes(userRole) : roles === userRole;
  };

  const canAccessRoute = (route) => {
    if (!user || !user.role) return false;
    const userRole = user.role.toLowerCase();
    return ROLE_ROUTES[userRole]?.some((r) => {
      if (r === route) return true;
      if (r.endsWith("*")) {
        const baseRoute = r.slice(0, -1);
        return route.startsWith(baseRoute);
      }
      return route.startsWith(r + "/") || route === r;
    });
  };

  return {
    hasRole,
    canAccessRoute,
    userRole: user?.role?.toLowerCase(),
    isAdmin: hasRole(["admin"]),
    isSeller: hasRole(["seller"]),
    isRepairman: hasRole(["repairman"]),
    isCustomer: hasRole(["customer"]),
  };
};

export default AuthGuard;