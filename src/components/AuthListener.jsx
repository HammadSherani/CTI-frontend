"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/store/auth";
import { setCurrentUser } from "@/store/chat";

// The login session ended (token expired / rejected): clear it quietly.
// No redirect and no message here: public pages (home, shop, ...) keep working as a guest.
// Pages that need a login are wrapped in AuthGuard, which sends the user to the login page
// as soon as the user is gone.
export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handler = () => {
      dispatch(clearAuth());
      dispatch(setCurrentUser(null)); // hides the chat
    };

    window.addEventListener("unauthorized", handler);
    return () => {
      window.removeEventListener("unauthorized", handler);
    };
  }, [dispatch]);

  return null;
}
