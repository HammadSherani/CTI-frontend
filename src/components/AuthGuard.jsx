"use client";

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

function AuthGuard({ children }) {
  const { user, token } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) {
      router.push("/auth/login");
    }
  }, [user, token, router]);

  if (!user || !token) {
    return <div className="p-4">Redirecting...</div>; 
  }

  return <>{children}</>;
}

export default AuthGuard;
