import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { isAuthEndpoint } from "@/helper/authToken";

export default function handleError(error) {
  if (isAxiosError(error)) {
    if (error.message === "canceled") {
      return;
    }

    // 401 = not logged in / session expired. No "Invalid token" toast: the session is cleared
    // quietly (axios interceptor) and login-only pages go to the login page by themselves.
    // Only when the user presses something that needs a login (POST/PUT/..., not a page
    // load) do we say so, otherwise the button would seem to do nothing.
    if (error.response?.status === 401 && !isAuthEndpoint(error.config?.url)) {
      const method = String(error.config?.method || "get").toLowerCase();
      if (method !== "get") {
        toast.info("Please log in to continue.", { toastId: "login-required" });
      }
      return;
    }

    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  } else {
    console.error("Error:", error);
  }
}
