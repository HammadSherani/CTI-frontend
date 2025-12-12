"use client";

import { Suspense } from "react";
import OtpVerification from "./OtpVerification";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpVerification />
    </Suspense>
  );
}
