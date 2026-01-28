"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/store/auth";
import { useRouter } from "next/navigation";

export default function AuthListener() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const handler = (event) => {
      dispatch(clearAuth());
      router.push(event.detail.redirect);
    };

    window.addEventListener("unauthorized", handler);

    return () => {
      window.removeEventListener("unauthorized", handler);
    };
  }, []);

  return null;
}
